import gym
import numpy as np

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import matplotlib.pyplot as plt
import seaborn as sns

from environment import RaceEnv
from gym import Env
from itertools import count
from typing import Union, Tuple, Callable
from torch import Tensor

sns.set()


class ReplayBuffer(object):
    def __init__(self, size: int = 10000):
        self.size = size
        self.length = 0
        self.idx = -1

        self.states = None
        self.states_next = None
        self.actions = None
        self.rewards = None
        self.done = None

    def store(
        self,
        s: Union[torch.Tensor, np.ndarray],
        a: int,
        r: float,
        s_next: Union[torch.Tensor, np.ndarray],
        done: bool,
    ):

        if self.states is None:
            self.states = torch.zeros([self.size] + list(s.shape))
            self.states_next = torch.zeros_like(self.states)
            self.actions = torch.zeros((self.size,))
            self.rewards = torch.zeros((self.size,))
            self.done = torch.zeros((self.size,))

        self.idx = (self.idx + 1) % self.size
        self.length = min(self.length + 1, self.size)
        self.states[self.idx] = s.clone() if isinstance(s, Tensor) else torch.tensor(s)
        self.actions[self.idx] = torch.tensor(a)
        self.rewards[self.idx] = torch.tensor(r)
        self.done[self.idx] = torch.tensor(done)
        self.states_next[self.idx] = s_next.clone() if isinstance(s_next, Tensor) else torch.tensor(s_next)

    def sample(
        self, batch_size: int = 128
    ) -> Tuple[Tensor, Tensor, Tensor, Tensor, Tensor]:
        assert self.length >= batch_size, "Can not sample from the buffer yet"
        indices = np.random.choice(
            a=np.arange(self.length), size=batch_size, replace=False
        )

        s = self.states[indices]
        s_next = self.states_next[indices]
        a = self.actions[indices]
        r = self.rewards[indices]
        done = self.done[indices]

        return s, a, r, s_next, done


class DQN_RAM(nn.Module):
    def __init__(self, in_features: int, num_actions: int):
        super(DQN_RAM, self).__init__()
        self.in_features = in_features
        self.num_actions = num_actions

        self.fc1 = nn.Linear(in_features, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, num_actions)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        return self.fc3(x)


def eps_generator(max_eps: float = 1.0, min_eps: float = 0.1, max_iter: int = 10000):
    crt_iter = -1

    while True:
        crt_iter += 1
        frac = min(crt_iter / max_iter, 1)
        eps = (1 - frac) * max_eps + frac * min_eps
        yield eps


def select_epsilon_greedy_action(env: Env, Q: nn.Module, s: Tensor, eps: float):
    rand = np.random.rand()

    if rand < eps:
        return env.action_space.sample()

    with torch.no_grad():
        output = Q(s).argmax(dim=1).item()

    return output


@torch.no_grad()
def dqn_target(
    Q: nn.Module,
    target_Q: nn.Module,
    r_batch: Tensor,
    s_next_batch: Tensor,
    done_batch: Tensor,
    gamma: float,
) -> Tensor:
    next_Q_values = target_Q(s_next_batch).max(dim=1)[0]
    next_Q_values[done_batch == 1] = 0
    return r_batch + (gamma * next_Q_values)


@torch.no_grad()
def ddqn_target(
    Q: nn.Module,
    target_Q: nn.Module,
    r_batch: Tensor,
    s_next_batch: Tensor,
    done_batch: Tensor,
    gamma: float,
) -> Tensor:
    next_Q_values = (
        target_Q(s_next_batch)
        .gather(1, Q(s_next_batch).argmax(dim=1, keepdim=True))
        .squeeze()
    )
    next_Q_values[done_batch == 1] = 0

    return r_batch + (gamma * next_Q_values)


def learning(
    env: gym.Env,
    targert_function: Callable,
    batch_size: int = 128,
    gamma: float = 0.99,
    replay_buffer_size=10000,
    num_episodes: int = 100000,
    learning_starts: int = 1000,
    learning_freq: int = 4,
    target_update_freq: int = 100,
    log_every: int = 100,
):
    input_arg = env.observation_space.shape[0]
    num_actions = env.action_space.n

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    Q = DQN_RAM(input_arg, num_actions).to(device)
    target_Q = DQN_RAM(input_arg, num_actions).to(device)

    optimizer = optim.SGD(Q.parameters(), lr=1e-3)
    criterion = nn.MSELoss()
    replay_buffer = ReplayBuffer(replay_buffer_size)
    eps_scheduler = iter(eps_generator(0.9, 0.05))

    all_episode_rewards = []
    total_steps = 0
    num_param_updates = 0
    mean_rewards = []

    for episode in range(1, num_episodes + 1):
        s = env.reset()
        episode_reward = 0

        for _ in count():
            total_steps += 1

            if total_steps > learning_starts:
                eps = next(eps_scheduler)
                s = torch.tensor(s).view(1, -1).float().to(device)
                a = select_epsilon_greedy_action(env, Q, s, eps)
            else:
                a = env.action_space.sample()

            s_next, r, done, _ = env.step(a)

            episode_reward += r

            replay_buffer.store(s, a, r, s_next, done)

            if done:
                break

            s = s_next

            if total_steps > learning_starts and total_steps % learning_freq == 0:
                for _ in range(learning_freq):
                    (
                        s_batch,
                        a_batch,
                        r_batch,
                        s_next_batch,
                        done_batch,
                    ) = replay_buffer.sample(batch_size)

                    s_batch = s_batch.float().to(device)
                    a_batch = a_batch.long().to(device)
                    r_batch = r_batch.float().to(device)
                    s_next_batch = s_next_batch.float().to(device)
                    done_batch = done_batch.long().to(device)

                    Q_values = Q(s_batch).gather(1, a_batch.unsqueeze(1)).view(-1)

                    target_Q_values = targert_function(
                        Q, target_Q, r_batch, s_next_batch, done_batch, gamma
                    )

                    loss = criterion(target_Q_values, Q_values)

                    optimizer.zero_grad()
                    loss.backward()
                    optimizer.step()

                    num_param_updates += 1

                    if num_param_updates % target_update_freq == 0:
                        target_Q.load_state_dict(Q.state_dict())

        all_episode_rewards.append(episode_reward)

        if episode % log_every == 0 and total_steps > learning_starts:
            mean_episode_reward = np.mean(all_episode_rewards[-100:])
            print(
                "Episode: %d, Mean reward: %.2f, Eps: %.2f"
                % (episode, mean_episode_reward, eps)
            )
            mean_rewards.append(mean_episode_reward)

    return mean_rewards


if __name__ == "__main__":
    env = RaceEnv()
    dqm_mean_rewards = learning(
        env=env,
        targert_function=dqn_target,
        batch_size=128,
        gamma=0.99,
        replay_buffer_size=10000,
        num_episodes=1000,
        learning_starts=1000,
        learning_freq=4,
        target_update_freq=100,
        log_every=100,
    )

    env = RaceEnv()
    ddqm_mean_rewards = learning(
        env=env,
        targert_function=ddqn_target,
        batch_size=128,
        gamma=0.99,
        replay_buffer_size=10000,
        num_episodes=1000,
        learning_starts=1000,
        learning_freq=8,
        target_update_freq=100,
        log_every=100,
    )

    plt.plot(dqm_mean_rewards, label="dqn")
    plt.plot(ddqm_mean_rewards, label="ddqn")

    plt.xlabel(f"Episodes")
    plt.ylabel("Reward")
    plt.title("Reward curve")

    plt.legend()
    plt.show()

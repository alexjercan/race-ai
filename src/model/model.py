import os
import gym
import time
import torch
import datetime

import numpy as np
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

from gym import Env
from itertools import count
from typing import Union, Tuple, Callable
from torch import Tensor


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
        self.states_next[self.idx] = (
            s_next.clone() if isinstance(s_next, Tensor) else torch.tensor(s_next)
        )

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


def layer_to_json(layer, name):
    if isinstance(layer, torch.nn.Linear):
        return {
            "name": name,
            "type": "Linear",
            "weight": layer.weight.tolist(),
            "bias": layer.bias.tolist(),
        }
    if isinstance(layer, torch.nn.ReLU):
        return {
            "name": name,
            "type": "ReLU",
        }

    raise ValueError(f"Unknown layer type: {type(layer)}")


class DQN_RAM(nn.Module):
    def __init__(self, in_features: int, num_actions: int):
        super(DQN_RAM, self).__init__()
        self.in_features = in_features
        self.num_actions = num_actions
        self.hidden_size = 128

        self.fc1 = nn.Linear(in_features, self.hidden_size)
        self.act1 = nn.ReLU()
        self.fc2 = nn.Linear(self.hidden_size, self.hidden_size)
        self.act2 = nn.ReLU()
        self.fc3 = nn.Linear(self.hidden_size, num_actions)

    def forward(self, x):
        x = self.act1(self.fc1(x))
        x = self.act2(self.fc2(x))
        return self.fc3(x)

    def to_json(self):
        return [
            layer_to_json(self.fc1, "fc1"),
            layer_to_json(self.act1, "act1"),
            layer_to_json(self.fc2, "fc2"),
            layer_to_json(self.act2, "act2"),
            layer_to_json(self.fc3, "fc3"),
        ]


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
    env: Env,
    target_function: Callable,
    batch_size: int = 128,
    gamma: float = 0.99,
    replay_buffer_size=10000,
    num_episodes: int = 100000,
    learning_starts: int = 1000,
    learning_freq: int = 4,
    target_update_freq: int = 100,
    log_every: int = 100,
    models_path: str = "models",
):
    input_arg = env.observation_space.shape[0]
    num_actions = env.action_space.n

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    Q = DQN_RAM(input_arg, num_actions).to(device)
    target_Q = DQN_RAM(input_arg, num_actions).to(device)
    best_model = DQN_RAM(input_arg, num_actions).to(device)

    optimizer = optim.SGD(Q.parameters(), lr=1e-3)
    criterion = nn.MSELoss()
    replay_buffer = ReplayBuffer(replay_buffer_size)
    eps_scheduler = iter(eps_generator(0.9, 0.05))

    all_episode_rewards = []
    total_steps = 0
    num_param_updates = 0
    mean_rewards = []
    best_episode_reward = 0

    time_start = time.time()

    for episode in range(1, num_episodes + 1):
        s = env.reset()
        episode_reward = 0

        for _ in range(60 * 60 * 3):
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

                    target_Q_values = target_function(
                        Q, target_Q, r_batch, s_next_batch, done_batch, gamma
                    )

                    loss = criterion(target_Q_values, Q_values)

                    optimizer.zero_grad()
                    loss.backward()
                    optimizer.step()

                    num_param_updates += 1

                    if num_param_updates % target_update_freq == 0:
                        target_Q.load_state_dict(Q.state_dict())

        if best_episode_reward < episode_reward:
            best_episode_reward = episode_reward
            best_model.load_state_dict(Q.state_dict())

        all_episode_rewards.append(episode_reward)

        if episode % log_every == 0 and total_steps > learning_starts:
            mean_episode_reward = np.mean(all_episode_rewards[-log_every:])
            time_elapsed = time.time() - time_start
            time_remaining = time_elapsed / episode * (num_episodes - episode)

            time_elapsed_str = str(datetime.timedelta(seconds=int(time_elapsed)))
            time_remaining_str = str(datetime.timedelta(seconds=int(time_remaining)))

            print(
                f"Episode: {episode}, Mean reward: {mean_episode_reward:.2f}, Eps: {eps:.2f}, Time: {time_elapsed_str}, Remaining: {time_remaining_str}"
            )
            mean_rewards.append(mean_episode_reward)

            name = target_function.__name__.split("_")[0]
            torch.save(
                Q.state_dict(), os.path.join(models_path, f"{name}_{episode}.pth")
            )

    if best_model:
        print(
            f"Best episode reward: {best_episode_reward}"
        )
        name = target_function.__name__.split("_")[0]
        torch.save(best_model.state_dict(), os.path.join(models_path, f"{name}_best.pth"))

    return mean_rewards

import os

import matplotlib.pyplot as plt
import seaborn as sns

from environment import RaceEnv
from model import learning, dqn_target, ddqn_target

sns.set()

models_path = os.path.join("models")
os.makedirs(models_path, exist_ok=True)


if __name__ == "__main__":
    env = RaceEnv()
    dqn_mean_rewards = learning(
        env=env,
        target_function=dqn_target,
        batch_size=128,
        gamma=0.99,
        replay_buffer_size=10000,
        num_episodes=100,
        learning_starts=1000,
        learning_freq=4,
        target_update_freq=100,
        log_every=10,
        models_path=models_path,
    )

    env = RaceEnv()
    ddqn_mean_rewards = learning(
        env=env,
        target_function=ddqn_target,
        batch_size=128,
        gamma=0.99,
        replay_buffer_size=10000,
        num_episodes=100,
        learning_starts=1000,
        learning_freq=4,
        target_update_freq=100,
        log_every=10,
        models_path=models_path,
    )

    plt.plot(dqn_mean_rewards, label="dqn")
    plt.plot(ddqn_mean_rewards, label="ddqn")

    plt.xlabel(f"Episodes")
    plt.ylabel("Reward")
    plt.title("Reward curve")

    plt.legend()

    plt.savefig(os.path.join(models_path, "reward_curve.png"))
    plt.show()

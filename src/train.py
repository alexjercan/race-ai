import os
import json
import argparse

import matplotlib.pyplot as plt
import seaborn as sns

from environment import RaceEnv
from model import learning
from pth_to_json import create_model

sns.set()

models_path = os.path.join("models")
os.makedirs(models_path, exist_ok=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-c", "--config", type=str, dest="config", default="config.json", help="Path to config file")

    args = parser.parse_args()

    with open(args.config, "r") as f:
        config = json.load(f)
        learning_kargs = config.get("learning", {})
        environment = config.get("environment", {})
        loss = config.get("loss", {})
        optimizer = config.get("optimizer", {})
        eps_scheduler = config.get("eps_scheduler", {})
        target_function = config.get("target_function", {})

    env = RaceEnv(**environment)
    all_rewards, best_model = learning(
        env=env,
        loss_dict=loss,
        optimizer_dict=optimizer,
        eps_scheduler_dict=eps_scheduler,
        target_function_dict=target_function,
        **learning_kargs
    )
    create_model(best_model)

    plt.plot(all_rewards)

    plt.xlabel(f"Episodes")
    plt.ylabel("Reward")
    plt.title("Reward curve")

    plt.legend()

    plt.savefig(os.path.join(models_path, "reward_curve.png"))
    plt.show()

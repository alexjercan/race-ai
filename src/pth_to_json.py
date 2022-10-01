import json
import torch
import argparse

from model import DQN_RAM
from environment import RaceEnv

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pth", type=str, required=True, dest="pth", help="Path to the pth file")
    parser.add_argument("--json", type=str, default="model.json", dest="json", help="Path to the json file")

    args = parser.parse_args()
    pth_path = args.pth
    json_path = args.json

    env = RaceEnv()
    model = DQN_RAM(env.observation_space.shape[0], env.action_space.n)

    model.load_state_dict(torch.load(pth_path))

    json_model = [
        {
            "name": "fc1",
            "type": "Linear",
            "weight": model.fc1.weight.tolist(),
            "bias": model.fc1.bias.tolist(),
        },
        {
            "name": "act1",
            "type": "ReLU",
        },
        {
            "name": "fc2",
            "type": "Linear",
            "weight": model.fc2.weight.tolist(),
            "bias": model.fc2.bias.tolist(),
        },
        {
            "name": "act2",
            "type": "ReLU",
        },
        {
            "name": "fc3",
            "type": "Linear",
            "weight": model.fc3.weight.tolist(),
            "bias": model.fc3.bias.tolist(),
        },
    ]

    with open(json_path, "w") as f:
        json.dump(json_model, f)
import json
import torch
import argparse

from model import DQN_RAM
from environment import RaceEnv


def create_model(model: DQN_RAM, js_path="race/model.js"):
    json_model = model.to_json()

    model_file_tempalte = """export const data_layers = '%s';"""

    with open(js_path, "w") as f:
        f.write(model_file_tempalte % (json.dumps(json_model),))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--pth", type=str, required=True, dest="pth", help="Path to the pth file"
    )
    parser.add_argument(
        "--js",
        type=str,
        default="race/model.js",
        dest="js",
        help="Path to the model.js file",
    )

    args = parser.parse_args()
    pth_path = args.pth
    js_path = args.js

    env = RaceEnv()
    model = DQN_RAM(env.observation_space.shape[0], env.action_space.n)

    model.load_state_dict(torch.load(pth_path))

    create_model(model, js_path)

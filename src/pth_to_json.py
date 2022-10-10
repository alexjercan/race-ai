import glob
import json
import torch
import argparse

from model import DQN_RAM
from environment import RaceEnv
from pathlib import Path


def model_to_json(model: DQN_RAM) -> str:
    json_model = model.to_json()

    return json.dumps(json_model)


def create_model(model: DQN_RAM, js_path="race/model/model.js"):
    model_str = model_to_json(model)

    model_file_tempalte = """export const data_layers = '%s';"""

    with open(js_path, "w") as f:
        f.write(model_file_tempalte % (model_str,))


def dump_models(js_path="race/model/train.js"):
    paths = sorted(glob.glob("models/*.pth"))

    env = RaceEnv()
    model = DQN_RAM(env.observation_space.shape[0], env.action_space.n)

    lines = []
    for pth_path in paths:
        model.load_state_dict(torch.load(pth_path))

        model_str = model_to_json(model)
        model_name = Path(pth_path).stem

        model_template = """{"name": "%s", "layers": '%s'}""" % (model_name, model_str)

        lines.append(model_template)

    content = """export const data_layers = [%s];""" % (", ".join(lines),)

    with open(js_path, "w") as f:
        f.write(content)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--pth", type=str, required=True, dest="pth", help="Path to the pth file"
    )
    parser.add_argument(
        "--js",
        type=str,
        default="race/model/model.js",
        dest="js",
        help="Path to the model.js file",
    )

    args = parser.parse_args()
    pth_path = args.pth
    js_path = args.js

    if pth_path == "all":
        dump_models(js_path)
    else:
        env = RaceEnv()
        model = DQN_RAM(env.observation_space.shape[0], env.action_space.n)

        model.load_state_dict(torch.load(pth_path))

        create_model(model, js_path)

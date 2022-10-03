import subprocess
import json

import numpy as np

from gym import Env, spaces

OBSERVATIONS = "observations"
REWARD = "reward"
DONE = "done"


class RaceEnv(Env):
    def __init__(self, path="./race/index.js"):
        super().__init__()

        self.path = path
        self.process = None

        self.observation_space = spaces.Box(low=-1.0, high=1.0, shape=(10,))

        self.action_space = spaces.Discrete(9)

    def reset(self):
        if self.process is not None:
            self.process.kill()

        self.process = subprocess.Popen(
            ["node", self.path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=False,
            encoding="utf-8",
            errors="ignore",
        )

        data = json.loads(self.process.stdout.readline())

        return np.array(data[OBSERVATIONS])

    def render(self):
        pass

    def close(self):
        if self.process is not None:
            self.process.kill()

    def step(self, action):
        assert self.action_space.contains(action), f"Invalid Action {action}"

        acc, steer = (action % 3 - 1, action // 3 - 1)

        model_input = f"{acc} {steer}\n"
        self.process.stdin.write(model_input)
        self.process.stdin.flush()

        data = json.loads(self.process.stdout.readline())

        return np.array(data[OBSERVATIONS]), data[REWARD], data[DONE], []

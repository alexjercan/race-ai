from environment import RaceEnv

env = RaceEnv()

obs = env.reset()
print(obs)

action = env.action_space.sample()
obs, reward, done, info = env.step(action)

env.close()

print(obs, action, reward, done, info)

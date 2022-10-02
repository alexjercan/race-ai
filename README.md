# Race-AI

## Quickstart

To be able to play around with the manual car you can start a http server in
the race directory and open the browser at `localhost:8000`.

```console
cd race
python -m http.server
```

To run the python training script you have to install the dependencies using
venv and run the training script.

```console
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/train.py
```

## Plan

- [X] Implement racing game
    - [X] Map generation (Should be a simple map made with waypoints)
    - [X] Implement a car object that can be moved on the canvas
    - [X] Implement Game Objects to make the Car generation and draw easier
        - [X] Implement Renderer Object to draw shape easier
    - [X] Implement a game loop that takes input from user
    - [X] Implement a game loop that waits input from stdin for training
    - [X] Implement a class that will output data for model input
    - [X] Implement the reward
    - [X] Implement model loading and wait input functions
- [ ] Implement RL algorithm to play the racing game
    - [X] Implement OpenAI Gym environment that will use subprocess to run the game
    - [X] Implement DQN algorithm to train a simple model
    - [X] Export model (Maybe to JSON)
    - [X] Implement a game loop that will load the model and use it to generate input
    - [ ] Improve model performance

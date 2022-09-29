# Race-AI

- [ ] Implement racing game
    - [ ] Map generation (Should be a simple map made with waypoints)
    - [X] Implement a car object that can be moved on the canvas
    - [ ] Implement Game Objects to make the Car generation and draw easier
        - [X] Implement Renderer Object to draw shape easier
    - [X] Implement a game loop that takes input from user
    - [ ] Implement a game loop that waits input from stdin for training
- [ ] Implement RL algorithm to play the racing game
    - [ ] Implement OpenAI Gym environment that will use subprocess to run the game
    - [ ] Implement DQN algorithm to train a simple model
    - [ ] Export model (Maybe to JSON)
    - [ ] Implement a game loop that will load the model and use it to generate input

import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track } from "./track.js";
import { StdinInput } from "./stdinInput.js";
import { ModelInput } from "./modelInput.js";

export class StdinGame {
    constructor() {
        this.track = new Track([new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)]);
        this.player = new Car(this.track);
        this.input = new StdinInput();
        this.modelInput = new ModelInput(this.player);
    }

    async update(deltaTime) {
        const input = await this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        console.log({
            observations: this.modelInput.observations(),
            reward: this.modelInput.reward(),
            done: this.modelInput.done(),
        });
    }
}

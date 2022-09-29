import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track } from "./track.js";
import { StdinInput } from "./stdinInput.js";

export class StdinGame {
    constructor() {
        this.track = new Track([new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)]);
        this.player = new Car(this.track);
        this.input = new StdinInput();
    }

    async update(deltaTime) {
        const input = await this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        console.log({
            // TODO: Log information for machine learning model to train on
            position: this.player.position,
            rotation: this.player.rotation,
            velocity: this.player.velocity,
        });
    }
}

import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { StdinInput } from "./stdinInput.js";
import { ModelInput } from "./modelInput.js";

export class StdinGame {
    constructor(track_name="simple") {
        this.track = new Track(track_waypoints[track_name]);
        this.player = new Car(this.track);
        this.input = new StdinInput();
        this.modelInput = new ModelInput(this.player);

        this.input.output({
            observations: this.modelInput.observations(),
            reward: this.modelInput.reward(),
            done: this.modelInput.done(),
        });
    }

    async update(deltaTime) {
        const input = await this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        this.input.output({
            observations: this.modelInput.observations(),
            reward: this.modelInput.reward(),
            done: this.modelInput.done(),
        });
    }
}

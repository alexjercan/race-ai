import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { StdinInput } from "./stdinInput.js";
import { AgentEnvironment } from "./agentEnvironment.js";

export class StdinGame {
    constructor(track_name="simple") {
        this.track = new Track(track_waypoints[track_name]);

        const position = new Point(this.track.waypoints[0].x, this.track.waypoints[0].y);
        const direction = new Point(
            this.track.waypoints[1].x - this.track.waypoints[0].x,
            this.track.waypoints[1].y - this.track.waypoints[0].y
        )
        const rotation = Math.atan2(direction.x, -1 * direction.y);

        this.player = new Car(position, rotation);
        this.input = new StdinInput();

        this.env = new AgentEnvironment(this.player, this.track);

        this.input.output({
            observations: this.env.observations(),
            reward: this.env.reward(),
            done: this.env.done(),
        });
    }

    async update(deltaTime) {
        const input = await this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        this.env.update(deltaTime);

        this.input.output({
            observations: this.env.observations(),
            reward: this.env.reward(),
            done: this.env.done(),
        });
    }
}

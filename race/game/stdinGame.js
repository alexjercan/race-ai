import { Point } from "../engine/point.js";
import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { StdinInput } from "./input/stdinInput.js";
import { AgentEnvironment } from "./agentEnvironment.js";

export class StdinGame {
    constructor(track_name="simple") {
        this.track = new Track(track_waypoints[track_name]);

        const n = this.track.waypoints.length;
        const startIndex = Math.floor(Math.random() * n);
        const startIndexNext = (startIndex + 1) % n;

        const position = new Point(this.track.waypoints[startIndex].x, this.track.waypoints[startIndex].y);
        const direction = new Point(
            this.track.waypoints[startIndexNext].x - this.track.waypoints[startIndex].x,
            this.track.waypoints[startIndexNext].y - this.track.waypoints[startIndex].y
        )
        const rotation = Math.atan2(direction.x, -1 * direction.y);

        this.player = new Car(position, rotation);
        this.input = new StdinInput();

        this.env = new AgentEnvironment(this.player, this.track);

        this.env.nextWaypointIndex = startIndexNext;

        const waypoint = this.track.waypoints[startIndex];
        const proj = this.player.position.getProjectionOnSegment(this.track.waypoints[startIndex], this.track.waypoints[startIndexNext]);
        const distance = this.track.distances[startIndex] + new Point(proj.x - waypoint.x, proj.y - waypoint.y).magnitude();
        const totalDistance = this.track.totalDistance;
        this.env.lastProgress = this.env.laps + distance / totalDistance;

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

import { Point } from "../engine/point.js";
import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { HumanInput } from "./input/humanInput.js";
import { PredictInput } from "./input/predictInput.js";
import { AgentEnvironment } from "./agentEnvironment.js";
import { Model } from "../torch/model.js";
import { CircleRenderer } from "../engine/renderer.js";

export class WebGame {
    constructor(track_name, data_layers) {
        this.track_name = track_name;
        this.track = new Track(track_waypoints[track_name]);

        const position = new Point(this.track.waypoints[0].x, this.track.waypoints[0].y);
        const direction = new Point(
            this.track.waypoints[1].x - this.track.waypoints[0].x,
            this.track.waypoints[1].y - this.track.waypoints[0].y
        )
        const rotation = Math.atan2(direction.x, -1 * direction.y);

        this.player = new Car(position, rotation);
        this.humanInput = new HumanInput(document);

        this.env = new AgentEnvironment(this.player, this.track);
        const layers = JSON.parse(data_layers);
        this.aiInput = new PredictInput(new Model(layers), this.env);

        this.aiMode = false;
        this.reward = 0;

        this.nextWaypointRenderer = new CircleRenderer("#ffdf00", new Point(0, 0), 1);
    }

    update(deltaTime) {
        const input = (this.aiMode) ? this.aiInput.waitInput() : this.humanInput.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        this.env.update(deltaTime);

        this.reward += this.env.reward();

        const nextWaypoint = this.track.waypoints[this.env.nextWaypointIndex];

        const outer = this.track.edgesOuter[this.env.nextWaypointIndex];
        const inner = this.track.edgesInner[this.env.nextWaypointIndex];
        const radius = new Point(outer.x - inner.x, outer.y - inner.y).magnitude() / 2;

        this.nextWaypointRenderer.center = nextWaypoint;
        this.nextWaypointRenderer.radius = radius;
    }

    draw(context) {
        this.track.draw(context);
        this.player.draw(context);
        this.nextWaypointRenderer.draw(context);
    }
}

import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { HumanInput } from "./humanInput.js";
import { PredictInput } from "./predictInput.js";
import { ModelInput } from "./modelInput.js";
import { data_layers } from "./model.js";
import { Model } from "./torch/model.js";

export class WebGame {
    constructor(track_name="simple") {
        this.track = new Track(track_waypoints[track_name]);

        const position = new Point(this.track.waypoints[0].x, this.track.waypoints[0].y);
        const direction = new Point(
            this.track.waypoints[1].x - this.track.waypoints[0].x,
            this.track.waypoints[1].y - this.track.waypoints[0].y
        )
        const rotation = Math.atan2(direction.x, -1 * direction.y);

        this.player = new Car(position, rotation);
        this.humanInput = new HumanInput(document);

        this.modelInput = new ModelInput(this.player, this.track);
        const layers = JSON.parse(data_layers);
        this.aiInput = new PredictInput(new Model(layers), this.modelInput);

        this.aiMode = false;
        this.reward = 0;
    }

    update(deltaTime) {
        this.modelInput.update(deltaTime);

        const input = (this.aiMode) ? this.aiInput.waitInput() : this.humanInput.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        this.reward += this.modelInput.reward();
    }

    draw(context) {
        this.track.draw(context);
        this.player.draw(context);
        this.modelInput.draw(context);
    }
}

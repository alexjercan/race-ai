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

        this.player = new Car(this.track);
        this.humanInput = new HumanInput(document);

        this.modelInput = new ModelInput(this.player);
        const layers = JSON.parse(data_layers);
        this.aiInput = new PredictInput(new Model(layers), this.modelInput);

        this.aiMode = false;
        this.reward = 0;
    }

    update(deltaTime) {
        const input = (this.aiMode) ? this.aiInput.waitInput() : this.humanInput.waitInput();

        this.player.move(input[0], input[1], deltaTime);

        this.reward += this.modelInput.reward();
    }

    draw(context) {
        this.track.draw(context);
        this.player.draw(context);
    }
}

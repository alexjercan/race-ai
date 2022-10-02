import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { PredictInput } from "./predictInput.js";
import { ModelInput } from "./modelInput.js";
import { data_layers } from "./model.js";
import { Model } from "./torch/model.js";

export class ModelGame {
    constructor(track_name="simple") {
        this.track = new Track(track_waypoints[track_name]);
        this.player = new Car(this.track);
        this.modelInput = new ModelInput(this.player);
        const layers = JSON.parse(data_layers);
        this.input = new PredictInput(new Model(layers), this.modelInput);
    }

    update(deltaTime) {
        const input = this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);
    }
    
    draw(context) {
        this.track.draw(context);
        this.player.draw(context);
    }
}

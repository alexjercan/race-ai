import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track } from "./track.js";
import { PredictInput } from "./predictInput.js";
import { ModelInput } from "./modelInput.js";
import { data_layers } from "./model.js";
import { Model } from "./torch/model.js";

export class ModelGame {
    constructor() {
        this.track = new Track([new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)]);
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

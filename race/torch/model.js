import { Linear } from "./linear.js";
import { ReLU } from "./relu.js";

function loadLayer(layer) {
    if (layer.type === "Linear") {
        return new Linear(layer);
    }

    if (layer.type === "ReLU") {
        return new ReLU(layer);
    }

    throw new Error("Unknown layer type '" + layer.type + "'.");
}

export class Model {
    constructor(layers) {
        this.layers = layers.map(loadLayer);
    }

    predict(input) {
        let output = input;
        for (let layer of this.layers) {
            output = layer.predict(output);
        }
        return output;
    }
}
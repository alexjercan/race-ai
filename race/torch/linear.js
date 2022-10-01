import * as math from "./math.js";

export class Linear {
    constructor(data) {
        this.name = data.name;
        this.weight = data.weight;
        this.bias = data.bias;   
    }

    predict(input) {
        return math.vector_p_vector(math.matrix_x_vector(this.weight, input), this.bias);
    }
}
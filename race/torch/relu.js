export class ReLU {
    constructor(data) {
        this.name = data.name;
    }

    predict(input) {
        return input.map(x => Math.max(0, x));
    }
}
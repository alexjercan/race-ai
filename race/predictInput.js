export class PredictInput {
    constructor(model, modelInput) {
        this.model = model;
        this.modelInput = modelInput;
    }

    waitInput() {
        return this.model.predict(this.modelInput.observations());
    }
}
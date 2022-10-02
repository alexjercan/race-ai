export class PredictInput {
    constructor(model, modelInput) {
        this.model = model;
        this.modelInput = modelInput;
    }

    waitInput() {
        const proba = this.model.predict(this.modelInput.observations());
        const action = proba.indexOf(Math.max(...proba));
        return [action % 3 - 1, Math.floor(action / 3) - 1];
    }
}
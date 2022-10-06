export class PredictInput {
    constructor(model, env) {
        this.model = model;
        this.env = env;
    }

    waitInput() {
        const proba = this.model.predict(this.env.observations());
        const action = proba.indexOf(Math.max(...proba));
        return [action % 3 - 1, Math.floor(action / 3) - 1];
    }
}
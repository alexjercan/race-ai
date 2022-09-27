const defaultKeymap = {
    "w": [1, 0],
    "a": [0, -1],
    "s": [-1, 0],
    "d": [0, 1],
};

export class HumanInput {
    constructor(document, keyMap = defaultKeymap) {
        this.map = {};
        this.keyMap = keyMap;

        document.addEventListener("keydown", (event) => {
            this.map[event.key] = true;
        });

        document.addEventListener("keyup", (event) => {
            this.map[event.key] = false;
        });
    }

    getInput(map) {
        const input = [0, 0];

        for (const key in map) {
            if (this.map[key] && key in this.keyMap) {
                const value = this.keyMap[key];

                input[0] += value[0];
                input[1] += value[1];
            }
        }

        return input;
    }

    waitInput() {
        return this.getInput(this.map);
    }
}
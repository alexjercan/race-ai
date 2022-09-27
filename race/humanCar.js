const defaultKeymap = {
    "W": (1, 0),
    "A": (0, -1),
    "S": (-1, 0),
    "D": (0, 1),
};

export class HumanCar {
    constructor(document, keyMap=defaultKeymap) {
        document.addEventListener("keydown", (event) => {
            const key = event.key;

            console.log(key);
        });
    }

    waitInput() {
        return 0;
    }
}
import { Game } from "./game.js";
import { HumanCar } from "./humanCar.js";

export function initializeGame(inputType) {
    if (inputType === "human") {
        return new Game(new HumanCar(document));
    }
}

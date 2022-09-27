import { Game } from "./game.js";
import { HumanInput } from "./humanInput.js";

export function initializeGame(inputType) {
    if (inputType === "human") {
        return new Game(new HumanInput(document));
    }
}

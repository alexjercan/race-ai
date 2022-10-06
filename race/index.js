import { StdinGame } from "./game/stdinGame.js";

async function main() {
    const game = new StdinGame();

    const deltaTime = 1 / 60;

    while (true) {
        await game.update(deltaTime);
    }
}

main();
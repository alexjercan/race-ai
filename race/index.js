import { StdinGame } from "./game/stdinGame.js";

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.log("Usage: node index.js <track_name>");
        process.exit(1);
    }

    const track_name = args[0];

    const game = new StdinGame(track_name);

    const deltaTime = 1 / 60;

    while (true) {
        await game.update(deltaTime);
    }
}

main();
import { Car } from "./car.js"

export class Game {
    constructor(input) {
        this.input = input;

        this.player = new Car([100, 50], 0);
    }

    update(deltaTime) {
        const input = this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);
    }

    draw(context) {
        this.player.draw(context);
    }
}

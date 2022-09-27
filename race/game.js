import { Car } from "./car.js"

export class Game {
    constructor(input) {
        this.input = input;
        this.speed = 50;
        this.turnSpeed = Math.PI / 2;

        this.player = new Car([100, 50], 0);
    }

    update(deltaTime) {
        const input = this.input.waitInput();

        const velocity = input[0] * deltaTime * this.speed;
        const angle = input[1] * deltaTime * this.turnSpeed;

        this.player.move(velocity, angle);
    }

    draw(context) {
        this.player.draw(context);
    }
}

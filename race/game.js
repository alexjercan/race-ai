import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track } from "./track.js";

export class Game {
    constructor(input) {
        this.input = input;

        this.player = new Car(new Point(100, 100), Math.atan2(100, -400));
        this.track = new Track([new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)]);    
    }

    update(deltaTime) {
        const input = this.input.waitInput();

        this.player.move(input[0], input[1], deltaTime);
    }

    draw(context) {
        this.track.draw(context);
        this.player.draw(context);
    }
}

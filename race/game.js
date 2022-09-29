import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track } from "./track.js";
import { HumanInput } from "./humanInput.js";

export class Game {
    constructor(inputType) {
        this.track = new Track([new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)]);    

        this.player = new Car(this.track);

        if (inputType === "human") {
            this.input = new HumanInput(document);
        }
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

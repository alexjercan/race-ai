import { Point } from "./engine/point.js";
import { Car } from "./car.js";
import { Track, track_waypoints } from "./track.js";
import { HumanInput } from "./humanInput.js";

export class WebGame {
    constructor(track_name="simple") {
        this.track = new Track(track_waypoints[track_name]);
        this.player = new Car(this.track);
        this.input = new HumanInput(document);
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

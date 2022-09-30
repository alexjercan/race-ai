import { Point } from "./engine/point.js";
import * as math from "./engine/math.js";

export class ModelInput {
    constructor(player) {
        this.player = player;

        this.rays = [
            new Point(-1 * this.player.dimensions.x, -1 * this.player.dimensions.y),
            new Point(0, -1 * this.player.dimensions.y),
            new Point(this.player.dimensions.x, -1 * this.player.dimensions.y),
            new Point(this.player.dimensions.x, 0),
            new Point(this.player.dimensions.x, this.player.dimensions.y),
            new Point(0, this.player.dimensions.y),
            new Point(-1 * this.player.dimensions.x, this.player.dimensions.y),
            new Point(-1 * this.player.dimensions.x, 0),
        ];
    }

    computeLambda(ray) {
    }
}


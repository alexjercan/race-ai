import { LineRenderer } from "./engine/renderer.js";

export class Track {
    constructor(waypoints) {
        // Renderer Properties
        this.renderer = [];

        for (let i = 1; i < waypoints.length; i++) {
            const start = waypoints[i - 1];
            const end = waypoints[i];

            this.renderer.push(new LineRenderer("#808080", start, end, 100));
        }
    }

    draw(context) {
        for (let i = 0; i < this.renderer.length; i++) {
            this.renderer[i].draw(context);
        }
    }
}


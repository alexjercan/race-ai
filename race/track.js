import { TrackRenderer } from "./engine/renderer.js";

export class Track {
    constructor(waypoints) {
        // Renderer Properties
        this.radius = 50;
        this.renderer = {
            track: new TrackRenderer("#808080", waypoints, this.radius * 2),
        }
    }

    draw(context) {
        for (const key in this.renderer) {
            this.renderer[key].draw(context);
        }
    }
}


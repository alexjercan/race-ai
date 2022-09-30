import { TrackRenderer } from "./engine/renderer.js";
import { Point } from "./engine/point.js";

export class Track {
    constructor(waypoints, radius=50) {
        this.radius = radius;
        this.waypoints = waypoints;

        this.initCollider();

        // Renderer Properties
        this.renderer = {
            track: new TrackRenderer("#808080", waypoints, this.radius * 2),
        }
    }

    initCollider() {
        this.edgesInner = []
        this.edgesOuter = []

        const n = this.waypoints.length;

        for (let i = 0; i < n; i++) {
            const prevWaypoint = this.waypoints[((i - 1) % n + n) % n];
            const waypoint = this.waypoints[i];
            const nextWaypoint = this.waypoints[((i + 1) % n + n) % n];

            const prevVec = new Point(prevWaypoint.x - waypoint.x, prevWaypoint.y - waypoint.y).normalize();
            const nextVec = new Point(nextWaypoint.x - waypoint.x, nextWaypoint.y - waypoint.y).normalize();

            const prevTranslation = new Point(prevVec.x * this.radius, prevVec.y * this.radius);
            const nextTranslation = new Point(nextVec.x * this.radius, nextVec.y * this.radius);

            this.edgesInner.push(new Point(prevTranslation.x + nextTranslation.x + waypoint.x, prevTranslation.y + nextTranslation.y + waypoint.y));
            this.edgesOuter.push(new Point(waypoint.x - prevTranslation.x - nextTranslation.x, waypoint.y - prevTranslation.y - nextTranslation.y));
        }
    }

    draw(context) {
        for (const key in this.renderer) {
            this.renderer[key].draw(context);
        }
    }
}


import { TrackRenderer } from "./engine/renderer.js";
import { Point } from "./engine/point.js";

export const track_waypoints = {
    simple: [new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)],
    medium: [new Point(200, 100), new Point(100, 500), new Point(300, 800), new Point(700, 800), new Point(900, 500), new Point(500, 100)],
} 

export class Track {
    constructor(waypoints, radius=50) {
        this.radius = radius;
        this.waypoints = waypoints;

        this.initCollider();
        this.initDistances();

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

    initDistances() {
        const waypoints = this.waypoints;
        const n = waypoints.length;

        this.distances = []
        let distance = 0;
        for (let i = 0; i < n; i++) {
            const i1 = (i + 1) % n;
            this.distances.push(distance);
            distance += new Point(waypoints[i1].x - waypoints[i].x, waypoints[i1].y - waypoints[i].y).magnitude();
        }
        this.distances.push(distance);

        this.totalDistance = distance;
    }

    draw(context) {
        for (const key in this.renderer) {
            this.renderer[key].draw(context);
        }
    }
}


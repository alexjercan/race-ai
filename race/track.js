import { TrackRenderer } from "./engine/renderer.js";
import { Point } from "./engine/point.js";

export const track_waypoints = {
    simple: [new Point(100, 100), new Point(200, 500), new Point(500, 500), new Point(700, 100)],
    medium: [new Point(200, 100), new Point(100, 500), new Point(300, 800), new Point(700, 800), new Point(900, 500), new Point(500, 100)],
    hard: [new Point(100, 100), new Point(300, 500), new Point(100, 800), new Point(700, 800), new Point(900, 500), new Point(500, 100)],
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
        function intersection(start1, end1, start2, end2) {
            const p = start1;
            const r = new Point(end1.x - p.x, end1.y - p.y);;

            const q = start2;
            const s = new Point(end2.x - q.x, end2.y - q.y);

            const rxs = r.cross(s);

            const t = new Point(q.x - p.x, q.y - p.y).cross(s) / rxs;

            return new Point(p.x + t * r.x, p.y + t * r.y);
        }

        this.edgesInner = []
        this.edgesOuter = []

        const n = this.waypoints.length;

        for (let i = 0; i < n; i++) {
            const prevWaypoint = this.waypoints[((i - 1) % n + n) % n];
            const waypoint = this.waypoints[i];
            const nextWaypoint = this.waypoints[((i + 1) % n + n) % n];

            const prevVec = new Point(prevWaypoint.x - waypoint.x, prevWaypoint.y - waypoint.y).normalize();
            const nextVec = new Point(waypoint.x - nextWaypoint.x, waypoint.y - nextWaypoint.y).normalize();

            const pi1 = new Point(-1 * prevVec.y, prevVec.x);
            const pi2 = new Point(-1 * nextVec.y, nextVec.x);

            const po1 = new Point(-1 * pi1.x, -1 * pi1.y);
            const po2 = new Point(-1 * pi2.x, -1 * pi2.y);

            this.edgesInner.push(
                intersection(
                    new Point(prevWaypoint.x + pi1.x * this.radius, prevWaypoint.y + pi1.y * this.radius),
                    new Point(waypoint.x + pi1.x * this.radius, waypoint.y + pi1.y * this.radius),
                    new Point(nextWaypoint.x + pi2.x * this.radius, nextWaypoint.y + pi2.y * this.radius),
                    new Point(waypoint.x + pi2.x * this.radius, waypoint.y + pi2.y * this.radius),
                )
            );

            this.edgesOuter.push(
                intersection(
                    new Point(prevWaypoint.x + po1.x * this.radius, prevWaypoint.y + po1.y * this.radius),
                    new Point(waypoint.x + po1.x * this.radius, waypoint.y + po1.y * this.radius),
                    new Point(nextWaypoint.x + po2.x * this.radius, nextWaypoint.y + po2.y * this.radius),
                    new Point(waypoint.x + po2.x * this.radius, waypoint.y + po2.y * this.radius),
                )
            );

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


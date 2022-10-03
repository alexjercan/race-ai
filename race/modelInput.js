import { Point } from "./engine/point.js";
import * as math from "./engine/math.js";
import { CircleRenderer } from "./engine/renderer.js";

export class ModelInput {
    constructor(player, track, rayLength=4) {
        this.track = track;
        this.player = player;
        this.rayLength = rayLength;

        this.rays = [
            new Point(-1 * this.player.dimensions.x * rayLength / 2, -1 * this.player.dimensions.y * rayLength / 2),
            new Point(0, -1 * this.player.dimensions.y * rayLength / 2),
            new Point(this.player.dimensions.x * rayLength / 2, -1 * this.player.dimensions.y * rayLength / 2),
            new Point(this.player.dimensions.x * rayLength / 2, 0),
            new Point(this.player.dimensions.x * rayLength / 2, this.player.dimensions.y * rayLength / 2),
            new Point(0, this.player.dimensions.y * rayLength / 2),
            new Point(-1 * this.player.dimensions.x * rayLength / 2, this.player.dimensions.y * rayLength / 2),
            new Point(-1 * this.player.dimensions.x * rayLength / 2, 0),
        ];

        this.lastProgress = 0;

        this.nextWaypointIndex = 1;
        this.laps = 0;
    }

    update(deltaTime) {
        const nextWaypoint = this.track.waypoints[this.nextWaypointIndex];

        const outer = this.track.edgesOuter[this.nextWaypointIndex];
        const inner = this.track.edgesInner[this.nextWaypointIndex];
        const radius = new Point(outer.x - inner.x, outer.y - inner.y).magnitude() / 2;

        const distance = new Point(
            nextWaypoint.x - this.player.position.x,
            nextWaypoint.y - this.player.position.y
        ).magnitude();

        if (distance <= radius) {
            this.nextWaypointIndex = (this.nextWaypointIndex + 1) % this.track.waypoints.length;
            if (this.nextWaypointIndex === 1) {
                this.laps++;
            }
        }
    }

    draw(context) {
        const nextWaypoint = this.track.waypoints[this.nextWaypointIndex];

        const outer = this.track.edgesOuter[this.nextWaypointIndex];
        const inner = this.track.edgesInner[this.nextWaypointIndex];
        const radius = new Point(outer.x - inner.x, outer.y - inner.y).magnitude() / 2;

        const nextWaypointRenderer = new CircleRenderer("#ffdf00", nextWaypoint, radius);
        nextWaypointRenderer.draw(context);
    }

    getClosestPoint() {
        return this.getClosestPoint(null, null);
    }

    getClosestPoint(from=null, points=null) {
        function getDistance(position, point1, point2) {
            const point = math.getProjectionOnSegment(position, point1, point2);

            return {
                point,
                distance: new Point(
                    point.x - position.x,
                    point.y - position.y
                ).magnitude(),
                start: point1,
                end: point2,
            }
        }

        const position = from ?? this.player.position;
        const waypoints = points ?? this.track.waypoints;
        const distances = [];

        for (let i = 0; i < waypoints.length - 1; i++) {
            const waypoint = waypoints[i];
            const nextWaypoint = waypoints[i + 1];

            distances.push(getDistance(position, waypoint, nextWaypoint));
        }

        distances.push(getDistance(position, waypoints[waypoints.length - 1], waypoints[0]));

        const min = Math.min(...distances.map((distance) => distance.distance));
        const minIndex = distances.map((distance) => distance.distance).indexOf(min);

        return distances[minIndex];
    }

    computeLambdaLine(ray, edges) {
        const ts = [];

        for (let i = 0; i < edges.length; i++) {
            const start = edges[i];
            const end = edges[(i + 1) % edges.length];

            const p = this.player.position;
            const r = new Point(ray.x - p.x, ray.y - p.y);;

            const q = start;
            const s = new Point(end.x - q.x, end.y - q.y);

            const rxs = r.cross(s);

            if (rxs !== 0) {
                const t = new Point(q.x - p.x, q.y - p.y).cross(s) / rxs;
                const u = new Point(q.x - p.x, q.y - p.y).cross(r) / rxs;

                if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
                    ts.push(t);
                }
            }

            ts.push(1);
        }

        return math.clamp(Math.min(...ts), 0, 1);
    }

    computeLambda(ray) {
        return Math.min(this.computeLambdaLine(ray, this.track.edgesOuter), this.computeLambdaLine(ray, this.track.edgesInner));
    }

    observations() {
        const input = [];

        for (let i = 0; i < this.rays.length; i++) {
            const rayEnd = this.rays[i];
            const rayEndX = this.player.position.x + rayEnd.x * Math.cos(this.player.rotation) - rayEnd.y * Math.sin(this.player.rotation);
            const rayEndY = this.player.position.y + rayEnd.x * Math.sin(this.player.rotation) + rayEnd.y * Math.cos(this.player.rotation);
            const ray = new Point(rayEndX, rayEndY)

            input.push(this.computeLambda(ray));
        }

        return input;
    }

    reward() {
        const distanceFromTrack = this.getClosestPoint().distance;
        const track = this.track;

        if (distanceFromTrack > track.radius) {
            return 0;
        }

        const n = track.waypoints.length;
        const nextWaypointIndex = this.nextWaypointIndex;
        const waypointIndex = ((nextWaypointIndex - 1) % n + n) % n;

        const waypoint = track.waypoints[waypointIndex];
        const nextWaypoint = track.waypoints[nextWaypointIndex];

        const waypointVector = new Point(nextWaypoint.x - waypoint.x, nextWaypoint.y - waypoint.y);
        const playerForward = new Point(Math.sin(this.player.rotation), -1 * Math.cos(this.player.rotation));
        const dot = waypointVector.dot(playerForward);
        const denom = waypointVector.magnitude() * playerForward.magnitude();
        const cos = (denom === 0) ? 0 : dot / denom;

        if (cos < Math.SQRT1_2) {
            return 0;
        }

        const proj = math.getProjectionOnSegment(this.player.position, track.waypoints[waypointIndex], track.waypoints[nextWaypointIndex]);
        const distance = track.distances[waypointIndex] + new Point(proj.x - waypoint.x, proj.y - waypoint.y).magnitude();
        const totalDistance = track.totalDistance;
        const progress = this.laps + distance / totalDistance;
        const progressDiff = progress - this.lastProgress;

        if (progressDiff < 0) {
            return 0;
        }

        this.lastProgress = progress;

        return progressDiff;
    }

    done() {
        const distanceFromTrack = this.getClosestPoint().distance;

        if (distanceFromTrack > this.player.track.radius) {
            return true;
        }

        return false;
    }
}


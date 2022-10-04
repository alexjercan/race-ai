import { Point } from "./engine/point.js";

export class AgentEnvironment {
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

    observations() {
        const input = [];

        for (let i = 0; i < this.rays.length; i++) {
            const rayEnd = this.rays[i];
            const rayEndX = this.player.position.x + rayEnd.x * Math.cos(this.player.rotation) - rayEnd.y * Math.sin(this.player.rotation);
            const rayEndY = this.player.position.y + rayEnd.x * Math.sin(this.player.rotation) + rayEnd.y * Math.cos(this.player.rotation);
            const ray = new Point(rayEndX, rayEndY);

            const lambdaOuter = ray.getIntersectionLambdaWithShape(this.player.position, this.track.edgesOuter);
            const lambdaInner = ray.getIntersectionLambdaWithShape(this.player.position, this.track.edgesInner);

            input.push(Math.min(lambdaOuter, lambdaInner));
        }

        input.push(this.player.velocity.magnitude() / this.player.topSpeed);

        const track = this.track;

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
        const cos01 = (cos + 1) / 2;
        input.push(cos01);

        return input;
    }

    reward() {
        const distanceFromTrack = this.player.position.getClosestPointOnShape(this.track.waypoints).distance;
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

        const proj = this.player.position.getProjectionOnSegment(track.waypoints[waypointIndex], track.waypoints[nextWaypointIndex]);
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
        const distanceFromTrack = this.player.position.getClosestPointOnShape(this.track.waypoints).distance;

        if (distanceFromTrack > this.track.radius) {
            return true;
        }

        return false;
    }
}


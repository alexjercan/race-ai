import * as math from "./engine/math.js";
import { Point } from "./engine/point.js";
import { RectRenderer, PolygonRenderer, TextRenderer } from "./engine/renderer.js";

export class Car {
    constructor(track) {
        //Transform Properties
        this.position = new Point(track.waypoints[0].x, track.waypoints[0].y);
        const direction = new Point(
            track.waypoints[1].x - track.waypoints[0].x,
            track.waypoints[1].y - track.waypoints[0].y
        )
        this.rotation = Math.atan2(direction.x, -1 * direction.y);

        // RigidBody Properties
        this.velocity = new Point(0, 0);

        // Car Properties
        this.turnSpeed = Math.PI / 2;
        this.topSpeed = 200;
        this.acceleration = 100;

        this.track = track;
        this.nextWaypointIndex = 1;
        this.laps = 0;

        // Render Properties
        this.renderer = {
            body: new RectRenderer("#ff8080", 0, 0, 50, 100),
            win: new PolygonRenderer("#8080ff", [new Point(-20, -15), new Point(20, -15), new Point(15, 0), new Point(-15, 0)]),
            bwin: new PolygonRenderer("#8080ff", [new Point(-14, 30), new Point(14, 30), new Point(18, 40), new Point(-18, 40)]),
            headL: new PolygonRenderer("#ffe4b5", [new Point(-20, -50), new Point(-10, -50), new Point(-12, -45), new Point(-18, -45)]),
            headR: new PolygonRenderer("#ffe4b5", [new Point(20, -50), new Point(10, -50), new Point(12, -45), new Point(18, -45)]),
        };
    }

    move(velocityInput, angleInput, deltaTime) {
        const velocityDelta = velocityInput * deltaTime * this.acceleration;

        const forward = new Point(Math.sin(this.rotation), -1 * Math.cos(this.rotation));
        const magnitude = this.velocity.magnitude();
        const dot = (magnitude === 0) ? 0 : forward.dot(this.velocity) / magnitude;
        const slowdown = math.map(dot, [-1, 1], [0.95, 0.99]);

        this.velocity.x = (this.velocity.x * slowdown + velocityDelta * Math.sin(this.rotation));
        this.velocity.y = (this.velocity.y * slowdown - velocityDelta * Math.cos(this.rotation));

        this.velocity = math.clampPoint(this.velocity, this.topSpeed);

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.rotation += angleInput * this.turnSpeed * deltaTime;

        const nextWaypoint = this.track.waypoints[this.nextWaypointIndex];
        const distance = new Point(
            nextWaypoint.x - this.position.x,
            nextWaypoint.y - this.position.y
        ).magnitude();

        if (distance <= this.track.radius) {
            this.nextWaypointIndex = (this.nextWaypointIndex + 1) % this.track.waypoints.length;
            if (this.nextWaypointIndex === 1) {
                this.laps++;
            }
        }
    }

    draw(context) {
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation);

        for (const key in this.renderer) {
            this.renderer[key].draw(context);
        }

        context.rotate(-1 * this.rotation);
        context.translate(-1 * this.position.x, -1 * this.position.y);
    }

    getClosestPoint() {
        function getDistance(position, point1, point2) {
            const point = math.getProjectionOnSegment(position, point1, point2);

            return {
                point,
                distance: new Point(
                    point.x - position.x,
                    point.y - position.y
                ).magnitude()
            }
        }

        const distances = [];

        const waypoints = this.track.waypoints;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const waypoint = waypoints[i];
            const nextWaypoint = waypoints[i + 1];

            distances.push(getDistance(this.position, waypoint, nextWaypoint));
        }

        distances.push(getDistance(this.position, waypoints[waypoints.length - 1], waypoints[0]));

        const min = Math.min(...distances.map((distance) => distance.distance));
        const minIndex = distances.map((distance) => distance.distance).indexOf(min);

        return distances[minIndex];
    }
}

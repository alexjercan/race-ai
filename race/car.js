import * as math from "./engine/math.js";
import { Point } from "./engine/point.js";
import { RectRenderer, PolygonRenderer, TextRenderer } from "./engine/renderer.js";

export class Car {
    constructor(position, rotation) {
        //Transform Properties
        this.position = position;
        this.rotation = rotation;

        // RigidBody Properties
        this.velocity = new Point(0, 0);

        // Car Properties
        this.turnSpeed = Math.PI / 2;
        this.topSpeed = 200;
        this.acceleration = 100;

        this.dimensions = new Point(50, 100);

        // Render Properties
        this.renderer = {
            body: new RectRenderer("#ff8080", 0, 0, this.dimensions.x, this.dimensions.y),
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
}

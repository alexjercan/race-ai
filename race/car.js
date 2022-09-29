import { RectRenderer, PolygonRenderer } from "./engine/renderer.js"

export class Car {
    constructor(position = [0, 0], rotation = 0) {
        // Transform Properties
        this.position = position;
        this.rotation = rotation;

        // Rigidbody Properties
        this.velocity = [0, 0];

        // Car Properties
        this.turnSpeed = Math.PI / 2;
        this.topSpeed = 100;
        this.acceleration = 50;

        // Render Properties
        this.renderer = {
            body: new RectRenderer("#ff8080", 0, 0, 50, 100),
            win: new PolygonRenderer("#8080ff", [{x: -20, y: -15}, {x: 20, y: -15}, {x: 15, y: 0}, {x: -15, y: 0}]),
            bwin: new PolygonRenderer("#8080ff", [{x: -14, y: 30}, {x: 14, y: 30}, {x: 18, y: 40}, {x: -18, y: 40}]),
            headL: new PolygonRenderer("#ffe4b5", [{x: -20, y: -50}, {x: -10, y: -50}, {x: -12, y: -45}, {x: -18, y: -45}]),
            headR: new PolygonRenderer("#ffe4b5", [{x: 20, y: -50}, {x: 10, y: -50}, {x: 12, y: -45}, {x: 18, y: -45}]),
        };
    }

    move(velocityInput, angleInput, deltaTime) {
        const velocityDelta = velocityInput * deltaTime * this.acceleration;

        const forward = [Math.sin(this.rotation), -1 * Math.cos(this.rotation)];
        const magnitude = Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1]);
        const dot = (magnitude === 0) ? 0 : (forward[0] * this.velocity[0] + forward[1] * this.velocity[1]) / magnitude;
        const oldRange = [-1, 1];
        const newRange = [0.95, 0.99];
        const slowdown = Math.min(Math.max((dot - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0], newRange[0]) , newRange[1]);

        this.velocity[0] = (this.velocity[0] * slowdown + velocityDelta * Math.sin(this.rotation));
        this.velocity[1] = (this.velocity[1] * slowdown - velocityDelta * Math.cos(this.rotation));

        this.velocity[0] = Math.min(Math.max(this.velocity[0], -1 * this.topSpeed), this.topSpeed);
        this.velocity[1] = Math.min(Math.max(this.velocity[1], -1 * this.topSpeed), this.topSpeed);

        this.position[0] += this.velocity[0] * deltaTime;
        this.position[1] += this.velocity[1] * deltaTime;

        this.rotation += angleInput * this.turnSpeed * deltaTime;
    }

    draw(context) {
        context.translate(this.position[0], this.position[1]);
        context.rotate(this.rotation);

        for (const key in this.renderer) {
            this.renderer[key].draw(context);
        }

        context.setTransform(1, 0, 0, 1, 0, 0);
    }
}

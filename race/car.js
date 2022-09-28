export class Car {
    constructor(position = [0, 0], rotation = 0) {
        // Transform Properties
        this.position = position;
        this.rotation = rotation;
        this.size = [50, 100];

        // Rigidbody Properties
        this.velocity = [0, 0];

        // Car Properties
        this.turnSpeed = Math.PI / 2;
        this.topSpeed = 100;
        this.acceleration = 50;
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
        context.fillStyle = '#ff8080';

        const centerX = this.position[0] + this.size[0] / 2;
        const centerY = this.position[1] + this.size[1] / 2;
        context.translate(centerX, centerY);
        context.rotate(this.rotation);
        context.translate(-centerX, -centerY);

        context.fillRect(this.position[0], this.position[1], this.size[0], this.size[1]);
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
}

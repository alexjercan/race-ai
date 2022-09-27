export class Car {
    constructor(position = [0, 0], rotation = 0, size = [50, 100]) {
        this.position = position;
        this.rotation = rotation;
        this.size = size;
    }

    move(velocity, angle) {
        this.position[0] += velocity * Math.sin(this.rotation);
        this.position[1] -= velocity * Math.cos(this.rotation);

        this.rotation += angle;

        console.log([velocity, angle, velocity * Math.cos(angle)]);
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
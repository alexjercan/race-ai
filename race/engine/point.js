export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(other) {
        return other.x * this.x + other.y * this.y;
    }

    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

    normalize() {
        const magnitude = this.magnitude();

        if (magnitude === 0) {
            return new Point(0, 0);
        }

        return new Point(this.x / magnitude, this.y / magnitude);
    }
}

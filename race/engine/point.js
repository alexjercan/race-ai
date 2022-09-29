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
}

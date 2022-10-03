import * as math from "./math.js";

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

    getProjectionOnSegment(start, end) {
        const vec = new Point(end.x - start.x, end.y - start.y);
        const size = vec.magnitude();
        const line = vec.normalize();
    
        const lambda = (this.x - start.x) * line.x + (this.y - start.y) * line.y;
    
        if (lambda < 0) {
            return start;
        }
        
        if (lambda > size) {
            return end;
        }
    
        return new Point(
            start.x + lambda * line.x,
            start.y + lambda * line.y
        );
    }

    getClosestPointOnShape(shape) {
        const distances = [];

        for (let i = 0; i < shape.length; i++) {
            const start = shape[i % shape.length];
            const end = shape[(i + 1) % shape.length];

            const proj = this.getProjectionOnSegment(start, end);
            const dist = new Point(proj.x - this.x, proj.y - this.y).magnitude()

            distances.push({
                point: proj,
                distance: dist,
                start,
                end,
            });
        }

        const min = Math.min(...distances.map((distance) => distance.distance));
        const minIndex = distances.map((distance) => distance.distance).indexOf(min);

        return distances[minIndex];
    }

    getIntersectionLambdaWithShape(origin, shape) {
        const ts = [];

        for (let i = 0; i < shape.length; i++) {
            const start = shape[i];
            const end = shape[(i + 1) % shape.length];

            const p = origin;
            const r = new Point(this.x - p.x, this.y - p.y);;

            const q = start;
            const s = new Point(end.x - q.x, end.y - q.y);

            const rxs = r.cross(s);

            if (rxs !== 0) {
                const t = new Point(q.x - p.x, q.y - p.y).cross(s) / rxs;
                const u = new Point(q.x - p.x, q.y - p.y).cross(r) / rxs;

                if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
                    ts.push(t);
                    continue;
                }
            }

            ts.push(1);
        }

        return math.clamp(Math.min(...ts), 0, 1);
    }
}

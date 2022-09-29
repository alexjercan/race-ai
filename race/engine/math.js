import { Point } from "./point.js";

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function clampPoint(point, max) {
    const magnitude = point.magnitude();
    const factor = (magnitude !== 0) ? Math.min(magnitude, max) / magnitude : 0;

    return new Point(point.x * factor, point.y * factor);
}

export function map(value, oldRange, newRange) {
    return clamp((value - oldRange[0]) * (newRange[1] - newRange[0]) / (oldRange[1] - oldRange[0]) + newRange[0], newRange[0], newRange[1]);
}

export function getProjectionOnSegment(point, point1, point2) {
    const vec = new Point(point2.x - point1.x, point2.y - point1.y);
    const size = vec.magnitude();
    const line = vec.normalize();

    const lambda = (point.x - point1.x) * line.x + (point.y - point1.y) * line.y;

    if (lambda < 0) {
        return point1;
    }
    
    if (lambda > size) {
        return point2;
    }

    return new Point(
        point1.x + lambda * line.x,
        point1.y + lambda * line.y
    );
}

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
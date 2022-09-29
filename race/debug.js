import { TrackRenderer } from "./engine/renderer.js";

export class Debug {
    constructor(cars, track) {
        this.cars = cars;
        this.track = track;

        this.debugTrack = new TrackRenderer("#00ff00", track.waypoints, 1, "butt")
    }

    draw(context) {
        this.debugTrack.draw(context);

        this.cars.forEach((car) => {
            const closestPoint = car.getClosestPoint().point;

            context.beginPath();
            context.moveTo(car.position.x, car.position.y);
            context.lineTo(closestPoint.x, closestPoint.y);
            context.lineWidth = 1;
            context.strokeStyle = "#00ff00";
            context.stroke();
        });
    }
}
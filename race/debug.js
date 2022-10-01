import { TrackRenderer } from "./engine/renderer.js";
import { ModelInput } from "./modelInput.js";

export class Debug {
    constructor(game) {
        this.cars = [game.player];
        this.track = game.track;

        this.debugTrack = new TrackRenderer("#00ff00", this.track.waypoints, 1, "butt")
        this.debugTrackInner = new TrackRenderer("#00ff00", this.track.edgesInner, 1, "butt")
        this.debugTrackOuter = new TrackRenderer("#00ff00", this.track.edgesOuter, 1, "butt")
        this.modelInputs = this.cars.map(car => new ModelInput(car, 2));
    }

    draw(context) {
        this.debugTrack.draw(context);
        this.debugTrackInner.draw(context);
        this.debugTrackOuter.draw(context);

        this.cars.forEach((car) => {
            const closestPoint = car.getClosestPoint().point;

            context.beginPath();
            context.moveTo(car.position.x, car.position.y);
            context.lineTo(closestPoint.x, closestPoint.y);
            context.lineWidth = 1;
            context.strokeStyle = "#00ff00";
            context.stroke();
        });

        this.modelInputs.forEach((modelInput) => {
            modelInput.rays.forEach((rayEnd) => {
                const rayEndX = rayEnd.x * Math.cos(modelInput.player.rotation) - rayEnd.y * Math.sin(modelInput.player.rotation);
                const rayEndY = rayEnd.x * Math.sin(modelInput.player.rotation) + rayEnd.y * Math.cos(modelInput.player.rotation);

                context.beginPath();
                context.moveTo(modelInput.player.position.x, modelInput.player.position.y);
                context.lineTo(modelInput.player.position.x + rayEndX, modelInput.player.position.y + rayEndY);
                context.lineWidth = 1;
                context.strokeStyle = "#ff0000";
                context.stroke();
            });

            const obs = modelInput.observations();
            modelInput.rays.forEach((rayEnd, index) => {

                const rayEndX = obs[index] * (rayEnd.x * Math.cos(modelInput.player.rotation) - rayEnd.y * Math.sin(modelInput.player.rotation));
                const rayEndY = obs[index] * (rayEnd.x * Math.sin(modelInput.player.rotation) + rayEnd.y * Math.cos(modelInput.player.rotation));

                context.beginPath();
                context.moveTo(modelInput.player.position.x, modelInput.player.position.y);
                context.lineTo(modelInput.player.position.x + rayEndX, modelInput.player.position.y + rayEndY);
                context.lineWidth = 1;
                context.strokeStyle = "#00ff00";
                context.stroke();
            });
        });
    }
}

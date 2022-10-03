import { TrackRenderer } from "./engine/renderer.js";

export class Debug {
    constructor(game) {
        this.game = game;
        this.player = game.player;
        this.modelInput = game.modelInput;
        this.track = game.track;

        this.debugTrack = new TrackRenderer("#00ff00", this.track.waypoints, 1, "butt")
        this.debugTrackInner = new TrackRenderer("#00ff00", this.track.edgesInner, 1, "butt")
        this.debugTrackOuter = new TrackRenderer("#00ff00", this.track.edgesOuter, 1, "butt")

        this.fps = 0;
    }

    update(deltaTime) {
        this.fps = Math.round(1 / deltaTime);
    }

    draw(context) {
        this.debugTrack.draw(context);
        this.debugTrackInner.draw(context);
        this.debugTrackOuter.draw(context);

        const car = this.player;
        const closestPoint = car.getClosestPoint().point;
        context.beginPath();
        context.moveTo(car.position.x, car.position.y);
        context.lineTo(closestPoint.x, closestPoint.y);
        context.lineWidth = 1;
        context.strokeStyle = "#00ff00";
        context.stroke();

        const modelInput = this.modelInput;
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

        context.font = '25px Arial';
        context.fillStyle = 'black';
        context.fillText("FPS: " + this.fps + " LAPS: " + this.player.laps + " Reward: " + this.game.reward, 10, 30);
    }
}

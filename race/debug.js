import { TrackRenderer } from "./engine/renderer.js";

export class Debug {
    constructor(game) {
        this.game = game;
        this.player = game.player;
        this.env = game.env;
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
        const env = this.env;

        const closest = this.player.position.getClosestPointOnShape(this.track.waypoints);
        const closestPoint = closest.point;
        const distanceFromTrack = closest.distance;
        context.beginPath();
        context.moveTo(car.position.x, car.position.y);
        context.lineTo(closestPoint.x, closestPoint.y);
        context.lineWidth = 1;
        context.strokeStyle = (distanceFromTrack >= this.track.radius) ? "#ff0000" : "#00ff00";
        context.stroke();

        env.rays.forEach((rayEnd) => {
            const rayEndX = rayEnd.x * Math.cos(env.player.rotation) - rayEnd.y * Math.sin(env.player.rotation);
            const rayEndY = rayEnd.x * Math.sin(env.player.rotation) + rayEnd.y * Math.cos(env.player.rotation);

            context.beginPath();
            context.moveTo(env.player.position.x, env.player.position.y);
            context.lineTo(env.player.position.x + rayEndX, env.player.position.y + rayEndY);
            context.lineWidth = 1;
            context.strokeStyle = "#ff0000";
            context.stroke();
        });
        const obs = env.observations();
        env.rays.forEach((rayEnd, index) => {

            const rayEndX = obs[index] * (rayEnd.x * Math.cos(env.player.rotation) - rayEnd.y * Math.sin(env.player.rotation));
            const rayEndY = obs[index] * (rayEnd.x * Math.sin(env.player.rotation) + rayEnd.y * Math.cos(env.player.rotation));

            context.beginPath();
            context.moveTo(env.player.position.x, env.player.position.y);
            context.lineTo(env.player.position.x + rayEndX, env.player.position.y + rayEndY);
            context.lineWidth = 1;
            context.strokeStyle = "#00ff00";
            context.stroke();
        });

        context.font = '25px Arial';
        context.fillStyle = 'black';
        context.fillText("FPS: " + this.fps + " LAPS: " + this.env.laps + " Reward: " + this.game.reward, 10, 30);
    }
}

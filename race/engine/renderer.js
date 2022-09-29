export class RectRenderer {
    constructor(fillStyle, x, y, width, height) {
        this.fillStyle = fillStyle;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(context) {
        context.translate(-1 * this.width / 2, -1 * this.height / 2);

        context.fillStyle = this.fillStyle;
        context.fillRect(this.x, this.y, this.width, this.height);

        context.translate(this.width / 2, this.height / 2);
    }
}

export class PolygonRenderer {
    constructor(fillStyle, points) {
        this.fillStyle = fillStyle;
        this.points = points;
    }

    draw(context) {
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x, this.points[i].y);
        }
        context.closePath();

        context.fillStyle=this.fillStyle;
        context.fill();
    }

}

export class TrackRenderer {
    constructor(fillStyle, waypoints, width, lineCap="round") {
        this.fillStyle = fillStyle;
        this.waypoints = waypoints;
        this.width = width;
        this.lineCap = lineCap;
    }

    draw(context) {
        context.beginPath();

        for (let i = 0; i < this.waypoints.length - 1; i++) {
            context.moveTo(this.waypoints[i].x, this.waypoints[i].y);
            context.lineTo(this.waypoints[i + 1].x, this.waypoints[i + 1].y);
        }
        context.moveTo(this.waypoints[this.waypoints.length - 1].x, this.waypoints[this.waypoints.length - 1].y);
        context.lineTo(this.waypoints[0].x, this.waypoints[0].y);

        context.lineWidth = this.width;
        context.strokeStyle = this.fillStyle;
        context.lineCap = this.lineCap;

        context.stroke();
    }
}
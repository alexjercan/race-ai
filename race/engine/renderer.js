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

        context.stroke();
        context.fillStyle=this.fillStyle;
        context.fill();
    }

}

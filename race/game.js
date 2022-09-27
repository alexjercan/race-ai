export class Game {
    constructor(car) {
        this.car = car;

        // Generate the track and obstacles
    }

    update(deltaTime) {
        const input = this.car.waitInput();

        console.log(input);
    }

    draw(context) {
        context.fillStyle = Math.random() > 0.5 ? '#ff8080' : '#0099b0';

        context.fillRect(100, 50, 200, 175);
    }
}

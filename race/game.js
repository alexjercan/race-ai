export class Game {
    constructor(input) {
        this.input = input;

        // Generate the car track and obstacles
    }

    update(deltaTime) {
        const input = this.input.waitInput();

        console.log(input);
    }

    draw(context) {
        context.fillStyle = Math.random() > 0.5 ? '#ff8080' : '#0099b0';

        context.fillRect(100, 50, 200, 175);
    }
}

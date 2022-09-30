import readline from "readline";

export class StdinInput {
    constructor() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.it = rl[Symbol.asyncIterator]();
    }

    async waitInput() {
        return (await this.it.next()).value.trim().split(" ").map((i) => parseInt(i));
    }

    output(data) {
        console.log(data);
    }
}

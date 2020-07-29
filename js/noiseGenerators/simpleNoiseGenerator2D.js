import { RandomGenerator } from "../tools/random.js";

export class SimpleNoiseGenerator2D {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = seed;
        this.baseScale = 0.02;
        this.octaves = 3;

        this.mult = 51352;
        this.inc = 581128;
        this.mod = 941203;

        this.randomGenerator = new RandomGenerator(this.seed);

        //pregenerated grid of values
        this.gridSize = 1000;
        this.randomValues = [];
        for(let i=0; i<this.gridSize; i++) {
            let column = [];
            for(let k=0; k<this.gridSize; k++) {
                column.push(this.randomGenerator.random());
            }
            this.randomValues.push(column);
        }
    }
    
    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x, y) {
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (x, y) => {
            return this.randomValues[x % this.gridSize][y % this.gridSize];
        }

        let result = 0;
        let max = 0;
        for(let i=1; i<=this.octaves; i++) {
            let scaledX = x * this.baseScale * i + Math.pow((this.seed % 10),i);
            let scaledY = y * this.baseScale * i + Math.pow((this.seed % 10),i);

            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let yFloor = Math.floor(scaledY);
            let yCeil = Math.ceil(scaledY);

            // bilinear interpolation
            let tx = scaledX - xFloor;
            let ty = scaledY - yFloor;
            let xVal1 = smoothStep(getRandomValue(xFloor, yFloor), getRandomValue(xCeil, yFloor), tx);
            let xVal2 = smoothStep(getRandomValue(xFloor, yCeil), getRandomValue(xCeil, yCeil), tx);

            let finalVal = smoothStep(xVal1, xVal2, ty);
            result += finalVal / Math.pow(2,i-1);
            max += 1 / Math.pow(2,i-1);
        }
        return result / max;
    } 
}
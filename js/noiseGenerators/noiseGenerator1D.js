import { RandomGenerator } from "../tools/random.js";

export class NoiseGenerator1D {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = seed;
        this.baseScale = 0.02;
        this.octaves = 3;

        this.randomGenerator = new RandomGenerator(this.seed);

        let start = (this.mult * seed + this.inc) % this.mod
        this.randomValues = [start];
    }

    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x) { 
    
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (x) => {
            while(this.randomValues.length <= x) {
                this.randomValues.push(this.randomGenerator.random());
            }
            return this.randomValues[x];
        }

        let result = 0;
        let max = 0;
        for(let i=1; i<=this.octaves; i++) {
            let scaledX = x * this.baseScale * i + + Math.pow((this.seed % 10),i);
            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let t = scaledX - xFloor;
            let val = smoothStep(getRandomValue(xFloor), getRandomValue(xCeil), t);
            result += val / Math.pow(2, i-1);
            max += 1 / Math.pow(2,i-1);
        }
        return result / max;
    }
}

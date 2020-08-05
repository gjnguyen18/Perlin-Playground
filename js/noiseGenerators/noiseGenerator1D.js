import * as Random from "../tools/random.js";

const TABLE_SIZE = 1024;
export class NoiseGenerator1D {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = seed;
        this.baseScale = 0.02;
        this.octaves = 3;
        this.randomGenerator = new Random.RandomGenerator(this.seed);

        let generateTable = () => {
            let table = [];
            for(let i=0; i<TABLE_SIZE; i++) {
                table.push(this.randomGenerator.random());
            }
            return table;
        }

        this.randomValues = generateTable();
        this.permutationTable = Random.createPermutationTable(TABLE_SIZE, 1, this.randomGenerator);
    }

    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x) { 
    
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (pos) => {
            let index = 0;
            index = this.permutationTable[pos % TABLE_SIZE];
            return this.randomValues[index % TABLE_SIZE];
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

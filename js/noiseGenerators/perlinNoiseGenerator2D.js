import * as Random from "../tools/random.js";
import * as Vector from "../tools/vectors.js"

const TABLE_SIZE = 1024;
export class PerlinNoiseGenerator2D {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = seed;
        this.baseScale = 0.02;
        this.octaves = 3;
        this.randomGenerator = new Random.RandomGenerator(this.seed);

        let generateVector2D = (ang) => {
            let angle = ang * 2 * Math.PI;
            let x = Math.cos(angle);
            let y = Math.sin(angle);
            return [x,y];
        }

        let generateVectorTable = () => {
            let table = [];
            for(let i=0; i<TABLE_SIZE; i++) {
                table.push(generateVector2D(this.randomGenerator.random()));
            }
            return table;
        }

        this.randomValues = generateVectorTable();
        this.permutationTable = Random.createPermutationTable(TABLE_SIZE, 2, this.randomGenerator);
    }

    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x, y) {
        // quintic smoothstep function
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        // created mod function since % doesn't work properly with negatives
        let mod = (x, n) => { 
            return (x % n + n) % n;
        }

        // retrieves random angle from table of angles by using a permutation table
        // let getRandomValue = (pos) => {
        //     let index = 0;
        //     for(let i=0; i<pos.length; i++) {
        //         index = this.permutationTable[index + mod(pos[i],TABLE_SIZE)];
        //     }
        //     return this.randomValues[index % TABLE_SIZE];
        // }

        let getRandomValue = (pos) => {
            let index = 0;
            for(let i=0; i<pos.length; i++) {
                index = this.permutationTable[index + (pos[i] & (TABLE_SIZE-1))];
            }
            return this.randomValues[index & (TABLE_SIZE-1)];
        }

        let result = 0;
        let max = 0;
        for(let i=0; i<this.octaves; i++) {
            let scaledX = x * this.baseScale * Math.pow(2, i) + (this.seed % (5 + i*13)) * (i+7);
            let scaledY = y * this.baseScale * Math.pow(2, i) + (this.seed % (5 + i*13)) * (i+7);

            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let yFloor = Math.floor(scaledY);
            let yCeil = Math.ceil(scaledY);

            let v1 = Vector.dot(getRandomValue([xFloor, yFloor]), [scaledX-xFloor, scaledY-yFloor]);
            let v2 = Vector.dot(getRandomValue([xCeil, yFloor]), [scaledX-xCeil, scaledY-yFloor]);
            let v3 = Vector.dot(getRandomValue([xFloor, yCeil]), [scaledX-xFloor, scaledY-yCeil]);
            let v4 = Vector.dot(getRandomValue([xCeil, yCeil]), [scaledX-xCeil, scaledY-yCeil]);

            // interpolation using smoothstep
            let tx = scaledX - xFloor;
            let ty = scaledY - yFloor;
            let xVal1 = smoothStep(v1, v2, tx);
            let xVal2 = smoothStep(v3, v4, tx);

            let yVal = smoothStep(xVal1, xVal2, ty);
            let finalVal = (yVal + 1) / 2;
            result += finalVal / Math.pow(2,i);
            max += 1 / Math.pow(2,i);
        }
        return result / max;
    } 
}
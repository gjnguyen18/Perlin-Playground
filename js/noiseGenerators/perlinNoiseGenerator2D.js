import * as Random from "../tools/random.js";

const TABLE_SIZE = 1024;
export class PerlinNoiseGenerator2D {

    constructor(seed = Math.floor((Math.random()*999999999))) {
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
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (pos) => {
            let index = 0;
            for(let i=0; i<pos.length; i++) {
                index = this.permutationTable[index + (pos[i] % TABLE_SIZE)];
            }
            return this.randomValues[index % TABLE_SIZE];
        }

        let dot = (v1, v2) => {
            if(v1.length != v2.length) {
                return null;
            }
            let result = 0;
            for(let i=0; i<v1.length; i++) {
                result += v1[i] * v2[i];
            }
            return result;
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

            let v1 = dot(getRandomValue([xFloor, yFloor]), [scaledX-xFloor, scaledY-yFloor]);
            let v2 = dot(getRandomValue([xCeil, yFloor]), [scaledX-xCeil, scaledY-yFloor]);
            let v3 = dot(getRandomValue([xFloor, yCeil]), [scaledX-xFloor, scaledY-yCeil]);
            let v4 = dot(getRandomValue([xCeil, yCeil]), [scaledX-xCeil, scaledY-yCeil]);

            // bilinear interpolation
            let tx = scaledX - xFloor;
            let ty = scaledY - yFloor;
            let xVal1 = smoothStep(v1, v2, tx);
            let xVal2 = smoothStep(v3, v4, tx);

            let yVal = smoothStep(xVal1, xVal2, ty);
            let finalVal = (yVal + 1) / 2;
            result += finalVal / Math.pow(2,i-1);
            max += 1 / Math.pow(2,i-1);
        }
        return result / max;
    } 
}
import * as Random from "../tools/random.js";

const TABLE_SIZE = 1024;
export class PerlinNoiseGenerator3D {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = seed;
        this.baseScale = 0.02;
        this.octaves = 3;
        this.randomGenerator = new Random.RandomGenerator(this.seed);

        let generateVector3D = (ang1, ang2) => {
            let angle1 = ang1 * 2 * Math.PI;
            let angle2 = ang2 * 2 * Math.PI;
            let x = Math.sin(angle1) * Math.cos(angle2);
            let y = Math.sin(angle1) * Math.sin(angle2);
            let z = Math.cos(angle1);
            return [x,y,z];
        }

        let generateVectorTable = () => {
            let table = [];
            for(let i=0; i<TABLE_SIZE; i++) {
                table.push(generateVector3D(this.randomGenerator.random(), this.randomGenerator.random()));
            }
            return table;
        }

        this.randomValues = generateVectorTable();
        this.permutationTable = Random.createPermutationTable(TABLE_SIZE, 2, this.randomGenerator);
    }

    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x, y, z) {
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        // created mod function since % doesn't work properly with negatives
        // let mod = (x, n) => { 
        //     return (x % n + n) % n;
        // }

        // let getRandomValue = (pos) => {
        //     let index = 0;
        //     for(let i=0; i<pos.length; i++) {
        //         index = this.permutationTable[index + mod(pos[i], TABLE_SIZE)];
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
        for(let i=0; i<this.octaves; i++) {
            let scaledX = x * this.baseScale * Math.pow(2, i) + (this.seed % (5 + i*13)) * (i+7);
            let scaledY = y * this.baseScale * Math.pow(2, i) + (this.seed % (5 + i*13)) * (i+7);
            let scaledZ = z * this.baseScale * Math.pow(2, i) + (this.seed % (5 + i*13)) * (i+7);

            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let yFloor = Math.floor(scaledY);
            let yCeil = Math.ceil(scaledY);
            let zFloor = Math.floor(scaledZ);
            let zCeil = Math.ceil(scaledZ);

            let v1 = dot(getRandomValue([xFloor, yFloor, zFloor]), [scaledX-xFloor, scaledY-yFloor, scaledZ-zFloor]);
            let v2 = dot(getRandomValue([xCeil, yFloor, zFloor]), [scaledX-xCeil, scaledY-yFloor, scaledZ-zFloor]);
            let v3 = dot(getRandomValue([xFloor, yCeil, zFloor]), [scaledX-xFloor, scaledY-yCeil, scaledZ-zFloor]);
            let v4 = dot(getRandomValue([xCeil, yCeil, zFloor]), [scaledX-xCeil, scaledY-yCeil, scaledZ-zFloor]);

            let v5 = dot(getRandomValue([xFloor, yFloor, zCeil]), [scaledX-xFloor, scaledY-yFloor, scaledZ-zCeil]);
            let v6 = dot(getRandomValue([xCeil, yFloor, zCeil]), [scaledX-xCeil, scaledY-yFloor, scaledZ-zCeil]);
            let v7 = dot(getRandomValue([xFloor, yCeil, zCeil]), [scaledX-xFloor, scaledY-yCeil, scaledZ-zCeil]);
            let v8 = dot(getRandomValue([xCeil, yCeil, zCeil]), [scaledX-xCeil, scaledY-yCeil, scaledZ-zCeil]);

            // bilinear interpolation
            let tx = scaledX - xFloor;
            let ty = scaledY - yFloor;
            let tz = scaledZ - zFloor;

            let xVal1 = smoothStep(v1, v2, tx);
            let xVal2 = smoothStep(v3, v4, tx);
            let xVal3 = smoothStep(v5, v6, tx);
            let xVal4 = smoothStep(v7, v8, tx);

            let yVal1 = smoothStep(xVal1, xVal2, ty);
            let yVal2 = smoothStep(xVal3, xVal4, ty);

            let zVal = smoothStep(yVal1, yVal2, tz);

            let finalVal = (zVal + 1) / 2;
            result += finalVal / Math.pow(2,i);
            max += 1 / Math.pow(2,i);
        }
        return result / max;
    } 
}
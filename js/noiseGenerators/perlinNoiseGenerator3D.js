import { RandomGenerator } from "../tools/random.js";

export class PerlinNoiseGenerator3D {

    constructor(seed = Math.floor((Math.random()*999999999))) {
        this.seed = seed;
        this.baseScale = 0.02;
        this.octaves = 3;

        this.randomGenerator = new RandomGenerator(this.seed);

        let generateVector3D = (ang1, ang2) => {
            let angle1 = ang1 * 2 * Math.PI;
            let angle2 = ang2 * 2 * Math.PI;
            let x = Math.sin(angle1) * Math.cos(angle2);
            let y = Math.sin(angle1) * Math.sin(angle2);
            let z = Math.cos(angle1);
            return [x,y,z];
        }

        //pregenerated grid of values
        this.gridSize = 200;
        this.randomValues = [];
        for(let i=0; i<this.gridSize; i++) {
            let column = [];
            for(let k=0; k<this.gridSize; k++) {
                let row = [];
                for(let j=0; j<this.gridSize; j++) {
                    let vector3D = generateVector3D(this.randomGenerator.random(), this.randomGenerator.random());
                    row.push(vector3D);
                }
                column.push(row);
            }
            this.randomValues.push(column);
        }
    }

    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x, y, z) {
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (x, y, z) => {
            return this.randomValues[x % this.gridSize][y % this.gridSize][z % this.gridSize];
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
            let scaledX = x * this.baseScale * i + Math.pow((this.seed % 17),i);
            let scaledY = y * this.baseScale * i + Math.pow((this.seed % 23),i);
            let scaledZ = z * this.baseScale * i + Math.pow((this.seed % 31),i);

            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let yFloor = Math.floor(scaledY);
            let yCeil = Math.ceil(scaledY);
            let zFloor = Math.floor(scaledZ);
            let zCeil = Math.ceil(scaledZ);

            let v1 = dot(getRandomValue(xFloor, yFloor, zFloor), [scaledX-xFloor, scaledY-yFloor, scaledZ-zFloor]);
            let v2 = dot(getRandomValue(xCeil, yFloor, zFloor), [scaledX-xCeil, scaledY-yFloor, scaledZ-zFloor]);
            let v3 = dot(getRandomValue(xFloor, yCeil, zFloor), [scaledX-xFloor, scaledY-yCeil, scaledZ-zFloor]);
            let v4 = dot(getRandomValue(xCeil, yCeil, zFloor), [scaledX-xCeil, scaledY-yCeil, scaledZ-zFloor]);

            let v5 = dot(getRandomValue(xFloor, yFloor, zCeil), [scaledX-xFloor, scaledY-yFloor, scaledZ-zFloor]);
            let v6 = dot(getRandomValue(xCeil, yFloor, zCeil), [scaledX-xCeil, scaledY-yFloor, scaledZ-zFloor]);
            let v7 = dot(getRandomValue(xFloor, yCeil, zCeil), [scaledX-xFloor, scaledY-yCeil, scaledZ-zFloor]);
            let v8 = dot(getRandomValue(xCeil, yCeil, zCeil), [scaledX-xCeil, scaledY-yCeil, scaledZ-zFloor]);

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
            result += finalVal / Math.pow(2,i-1);
            max += 1 / Math.pow(2,i-1);
        }
        return result / max;
    } 
}
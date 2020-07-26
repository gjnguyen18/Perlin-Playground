export class perlinNoiseGenerator2D {

    constructor(seed = Math.random()*999999999) {
        this.seed = seed;
        this.baseScale = 0.01;
        this.baseAmplitude = 1;
        this.octaves = 2;

        this.mult = 51352;
        this.inc = 581128;
        this.mod = 941203;

        let start = (this.mult * seed + this.inc) % this.mod

        let generateRandomVector2D = () => {
            let angle = Math.random() * 2 * Math.PI;
            let x = Math.cos(angle);
            let y = Math.sin(angle);
            return [x,y];
        }

        //pregenerated grid of values
        this.gridSize = 1000;
        this.randomValues = [];
        for(let i=0; i<this.gridSize; i++) {
            let column = [];
            for(let k=0; k<this.gridSize; k++) {
                let vector2D = generateRandomVector2D();
                column.push(vector2D);
            }
            this.randomValues.push(column);
        }
    }

    getVal(x, y) {
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (x, y) => {
            return this.randomValues[x % this.gridSize][y % this.gridSize];
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
        for(let i=1; i<=this.octaves; i++) {
            let scaledX = (x + Math.pow((this.seed % 10),i)) * this.baseScale * i;
            let scaledY = (y + Math.pow((this.seed % 10),i)) * this.baseScale * i;

            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let yFloor = Math.floor(scaledY);
            let yCeil = Math.ceil(scaledY);

            let v1 = dot(getRandomValue(xFloor, yFloor), [scaledX-xFloor, scaledY-yFloor]);
            let v2 = dot(getRandomValue(xCeil, yFloor), [scaledX-xCeil, scaledY-yFloor]);
            let v3 = dot(getRandomValue(xFloor, yCeil), [scaledX-xFloor, scaledY-yCeil]);
            let v4 = dot(getRandomValue(xCeil, yCeil), [scaledX-xCeil, scaledY-yCeil]);

            // bilinear interpolation
            let tx = scaledX - xFloor;
            let ty = scaledY - yFloor;
            let xVal1 = smoothStep(v1, v2, tx);
            let xVal2 = smoothStep(v3, v4, tx);

            let yVal = smoothStep(xVal1, xVal2, ty);
            let finalVal = (yVal + 1) / 2;
            result += (finalVal / i);
        }
        // return result * this.baseAmplitude / 2;
        let val = 0;
        for(let i=0; i<10; i++) {
            if(result>i*.1) {
                val += 0.1;
            }
        }
        return val;
        // return (Math.atan2(getRandomValue(x,y)[1],getRandomValue(x,y)[0]) / (Math.PI * 2) + 1)/2;
        // return Math.random();
    } 
}
export class simpleNoiseGenerator2D {

    constructor(seed = Math.random()*999999999) {
        this.seed = seed;
        this.baseScale = 0.05;
        this.baseAmplitude = 1;
        this.octaves = 3;

        this.mult = 51352;
        this.inc = 581128;
        this.mod = 941203;

        let start = (this.mult * seed + this.inc) % this.mod

        //pregenerated grid of values
        this.gridSize = 1000;
        this.randomValues = [];
        for(let i=0; i<this.gridSize; i++) {
            let column = [];
            for(let k=0; k<this.gridSize; k++) {
                column.push(Math.random());
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

        let result = 0;
        for(let i=1; i<=this.octaves; i++) {
            let scaledX = (x + Math.pow((this.seed % 10),i)) * this.baseScale * i;
            let scaledY = (y + Math.pow((this.seed % 10),i)) * this.baseScale * i;

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
            result += (finalVal / i);
        }
        return result * this.baseAmplitude / 2;
    } 
}
export class NoiseGenerator1D {

    constructor(seed = Math.random()*999999999) {
        this.seed = seed;
        this.baseScale = 0.01;
        this.baseAmplitude = 1;
        this.octaves = 5;

        this.mult = 51352;
        this.inc = 581128;
        this.mod = 941203;

        let start = (this.mult * seed + this.inc) % this.mod
        this.randomValues = [start];
    }

    setAmplitude(x) { this.baseAmplitude = x; }
    setScale(x) { this.baseScale = x; }
    setOctaves(x) { this.octaves = x; }

    getVal(x) { 
    
        let smoothStep = (a, b, t) => {
            let step = t * t * t * (10 - 15 * t + 6 * t * t)
            let diff = b - a;
            return a + diff * step;
        }

        let getRandomValue = (x) => {
            let getPsuedoRandomValue = (prev) => {
                return (this.mult * prev + this.inc) % this.mod;
            }   
            while(this.randomValues.length <= x) {
                this.randomValues.push(getPsuedoRandomValue(this.randomValues[this.randomValues.length-1]));
            }
            return (this.randomValues[x] / this.mod);
        }

        let result = 0;
        for(let i=1; i<=this.octaves; i++) {
            let scaledX = (x + Math.pow((this.seed % 10),i)) * this.baseScale * i;
            let xFloor = Math.floor(scaledX);
            let xCeil = Math.ceil(scaledX);
            let t = scaledX - xFloor;
            let val = smoothStep(getRandomValue(xFloor), getRandomValue(xCeil), t);
            result += (val * this.baseAmplitude / i) - (this.baseAmplitude / (2 * i));
        }
        return result;
    }
}

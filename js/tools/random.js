export class RandomGenerator {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = Math.floor(seed);
        this.prev = seed;

        this.mult = Math.pow(Math.floor(
            Math.floor(((this.seed%1000)/100)) * 17 + 
            Math.floor(((this.seed%1000000)/100000)) * 137 +
            Math.floor(((this.seed%1000000000)/100000000)) * 1129
        ), 2);
        this.inc = Math.pow(Math.floor(
            Math.floor(((this.seed%100)/10)) * 7 + 
            Math.floor(((this.seed%100000)/10000)) * 233 + 
            Math.floor(((this.seed%100000000)/10000000)) * 907
        ), 2);
        this.mod = Math.pow(Math.floor(
            Math.floor(((this.seed%10)/1))*13 +
            Math.floor(((this.seed%10000)/1000))*151 + 
            Math.floor(((this.seed%10000000)/1000000)) * 947
        ), 2);
    }

    random() {
        let newNum = (this.mult * this.prev + this.inc) % this.mod;
        this.prev = newNum;
        return (newNum / this.mod);
    }

}
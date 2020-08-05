export class RandomGenerator {

    constructor(seed = Math.floor(Math.random()*999999999)) {
        this.seed = Math.floor(seed);
        this.prev = seed;

        this.mult = Math.pow(Math.floor(
            Math.floor(((this.seed%1000)/100) + 3) * 17 + 
            Math.floor(((this.seed%1000000)/100000) + 13) * 137 +
            Math.floor(((this.seed%1000000000)/100000000) + 17) * 1129
        ), 2);
        this.inc = Math.pow(Math.floor(
            Math.floor(((this.seed%100)/10) + 503) * 13 + 
            Math.floor(((this.seed%100000)/10000) + 3) * 233 + 
            Math.floor(((this.seed%100000000)/10000000) + 7) * 907
        ), 2);
        this.mod = Math.pow(Math.floor(
            Math.floor(((this.seed%10)/1) + 31)*13 +
            Math.floor(((this.seed%10000)/1000) + 7)*151 + 
            Math.floor(((this.seed%10000000)/1000000) + 2) * 947
        ), 2);
        // console.log(this.mult + " " + this.inc + " " + this.mod)
    }

    random() {
        let newNum = (this.mult * this.prev + this.inc) % this.mod;
        this.prev = newNum;
        return (newNum / this.mod);
    }

}

export function createPermutationTable(size, numDim, generator) {
    let table = [];

    for(let i=0; i<size; i++) {
        table.push(i);
    }

    for(let i=0; i<size*4; i++) {
        let index1 = (Math.floor(generator.random() * size * 23) + i) % size;
        let index2 = (Math.floor(generator.random() * size * 17) + i) % size;

        let val = table[index1];
        table[index1] = table[index2];
        table[index2] = val;
    }

    for(let i=0; i<numDim-1; i++) {
        for(let k=0; k<size; k++) {
            table.push(table[k]);
        }
    }
    return table;
}
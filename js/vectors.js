export class Vector {
    static sum(v1, v2) {
        if(v1.length != v2.length) {
            return null;
        }
        let result = [];
        for(let i=0; i<v1.length; i++) {
            result.push(v1[i]+v2[i]);
        }
        return result;
    }

    static difference(v1, v2) {
        if(v1.length != v2.length) {
            return null;
        }
        let result = [];
        for(let i=0; i<v1.length; i++) {
            result.push(v1[i]-v2[i]);
        }
        return result;
    }

    static dot(v1, v2) {
        if(v1.length != v2.length) {
            return null;
        }
        let result = 0;
        for(let i=0; i<v1.length; i++) {
            result += v1[i] * v2[i];
        }
        return result;
    }
}

let lerp = (a, b, t) => {
    return a + (b - a) * t;
}

let getMidPoint = (p1, p2) => {
    return [lerp(p1[0], p2[0], .5), lerp(p1[1], p2[1], .5)];
}

let getMidPointLerp = (p1, p2, threshold) => {
    let t = (threshold - p1[2]) / (p2[2] - p1[2]);
    return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t)];
}

// values in order: 00, 10, 01, 11
export function fillMarchingSquare(x, y, length, values, threshold, interpolatePoints, color, context) {

    let corners = [];
    corners.push([x, y, values[0]]);
    corners.push([x+length, y, values[1]]);
    corners.push([x+length, y+length, values[2]]);
    corners.push([x, y+length, values[3]]);

    let points = [];
    for(let i=0; i<4; i++) {
        let val1 = corners[i][2] > threshold ? 1 : 0;
        let val2 = corners[(i+1) % 4][2] > threshold ? 1 : 0;

        if(val1 == 1) {
            points.push(corners[i]);
        }
        if(val1 != val2) {
            if(interpolatePoints) {
                points.push(getMidPointLerp(corners[i], corners[(i+1) % 4], threshold));
            }
            else {
                points.push(getMidPoint(corners[i], corners[(i+1) % 4]));
            }
        }
    }

    if(points.length == 0) {
        return;
    }

    context.moveTo(points[points.length-1][0], points[points.length-1][1])
    context.beginPath();
    for(let i=0; i<points.length; i++) {
        context.lineTo(points[i][0], points[i][1]);
    }
    context.closePath();
    context.fillStyle = color;
    context.fill();
}
// table from http://paulbourke.net/geometry/polygonise/

import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { triTable, edgeTable, edgeCorners } from "../tools/marchingCubesTables.js";

let lerp = (a, b, t) => {
    return a + (b - a) * t;
}

let getMidPoint = (p1, p2) => {
    return [lerp(p1[0], p2[0], .5), lerp(p1[1], p2[1], .5), lerp(p1[2], p2[2], .5)];
}

let getMidPointLerp = (p1, p2, threshold) => {
    let t = (threshold - p1[3]) / (p2[3] - p1[3]);
    return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t), lerp(p1[2], p2[2], t)];
}

export function fillMarchingCube(x, y, z, blockSize, values, threshold, interpolatePoints, geometry, geometryVertices) {

    // get corners
    let corners = [];
    corners.push([0, 0, 0, values[0]]);
    corners.push([1, 0, 0, values[1]]);
    corners.push([1, 0, 1, values[2]]);
    corners.push([0, 0, 1, values[3]]);
    corners.push([0, 1, 0, values[4]]);
    corners.push([1, 1, 0, values[5]]);
    corners.push([1, 1, 1, values[6]]);
    corners.push([0, 1, 1, values[7]]);

    // find out which corners are above threshold and get cube index
    let cubeIndex = 0;
    let mult = 1;
    for(let i = 0; i<8; i++) {
        if(corners[i][3] > threshold) {
            cubeIndex += mult;
        }
        mult += mult;
    }

    if(cubeIndex == 0 || cubeIndex == 255) {
        return;
    }

    // find out which edges are used from edge table
    let edge = edgeTable[cubeIndex];
    let edgeNums = [];
    for(let i=0; i<12; i++) {
        let val = 1 << i;
        if((val & edge) > 0) {
            edgeNums.push(i);
        }
    }

    // get the points corresponding to the edges found
    let edgePoints = [];
    for(let i=0; i<edgeNums.length; i++) {
        let edgeCorner = edgeCorners[edgeNums[i]]; // the numbers of the two corners of the edge
        let p1 = corners[edgeCorner[0]]; // corner 1
        let p2 = corners[edgeCorner[1]]; // corner 2

        let pointNum = 0;

        let hashCords = [[p1[0]+x, p1[1]+y, p1[2]+z], [p2[0]+x, p2[1]+y, p2[2]+z]].toString();
        let mappedPoint = geometryVertices.get(hashCords); // find the edge vertex in the map
        if(mappedPoint == undefined) { // if doesn't exist, create the edge vertex and add it
            let func = interpolatePoints ? getMidPointLerp : getMidPoint;
            let point = func(p1, p2, threshold);
            pointNum = geometryVertices.size;
            geometryVertices.set(hashCords, geometryVertices.size);
            geometry.vertices.push(new T.Vector3(
                (point[0] + x) * blockSize, 
                (point[1] + y) * blockSize, 
                (point[2] + z) * blockSize
            ));
        } else {
            pointNum = mappedPoint;
        }
        edgePoints.push(pointNum);
    }

    let facePoints = triTable[cubeIndex]; // order of edges points to draw faces

    for(let i=0; i<facePoints.length; i+=3) {
        geometry.faces.push(new T.Face3(
            edgePoints[edgeNums.indexOf(facePoints[i])], 
            edgePoints[edgeNums.indexOf(facePoints[i+1])],
            edgePoints[edgeNums.indexOf(facePoints[i+2])]
        ));
    }
}
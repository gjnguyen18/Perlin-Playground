import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { triTable, edgeTable, edgeCorners } from "../tools/marchingCubesTables.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";

var size = 50;
var threshold = 0.5;
var scale = 0.05;
var octaves = 3;
var res = 2;
var resOptions = [25, 40, 50, 80, 100, 200];
var interpolatePoints = true;
var makeSphere = false;
const TERRAIN_SIZE = 400;

var seed = 0;

function drawPerlin3D() {

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);
    let meshPoints = [];

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "marchingCubesCanvas"
    ));
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 2000);
    let scene = new T.Scene(); 

    let createLights = () => {
        let ambientLight = new T.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        let pointLight = new T.PointLight(0xffffff, 1, 2000);
        pointLight.position.set(800, 500, 800);
        scene.add(pointLight);
    }

    let lerp = (a, b, t) => {
        return a + (b - a) * t;
    }

    let getMidPoint = (p1, p2) => {
        return [lerp(p1[0], p2[0], .5), lerp(p1[1], p2[1], .5), lerp(p1[2], p2[2], .5)];
    }
    
    let getMidPointLerp = (p1, p2) => {
        let t = (threshold - p1[3]) / (p2[3] - p1[3]);
        return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t), lerp(p1[2], p2[2], t)];
    }

    // geometryVertices.set([[4, 2, 1],[5, 2, 1]].toString(), 25);
    // console.log(geometryVertices.get([[4, 2, 1],[5, 2, 1]].toString()));
    // console.log(geometryVertices.get([[4, 4, 1],[5, 2, 1]].toString()));
    // if(geometryVertices.get([[4, 4, 1],[5, 2, 1]].toString()) == undefined) {
    //     console.log("undefined set");
    // }
    // console.log([[4, 2, 1],[5, 2, 1]].toString());

    let fillCube = (x, y, z, geometry, geometryVertices, values) => {
        // let v0 = perlinNoiseGenerator.getVal(x, y, z);
        // let v1 = perlinNoiseGenerator.getVal(x+1, y, z);
        // let v2 = perlinNoiseGenerator.getVal(x+1, y, z+1);
        // let v3 = perlinNoiseGenerator.getVal(x, y, z+1);
        // let v4 = perlinNoiseGenerator.getVal(x, y+1, z);
        // let v5 = perlinNoiseGenerator.getVal(x+1, y+1, z);
        // let v6 = perlinNoiseGenerator.getVal(x+1, y+1, z+1);
        // let v7 = perlinNoiseGenerator.getVal(x, y+1, z+1);

        // let v0 = 1;
        // let v1 = 0;
        // let v2 = 0;
        // let v3 = 1;
        // let v4 = 0;
        // let v5 = 0;
        // let v6 = 0;
        // let v7 = 0;

        let corners = [];
        corners.push([0, 0, 0, values[0]]);
        corners.push([1, 0, 0, values[1]]);
        corners.push([1, 0, 1, values[2]]);
        corners.push([0, 0, 1, values[3]]);
        corners.push([0, 1, 0, values[4]]);
        corners.push([1, 1, 0, values[5]]);
        corners.push([1, 1, 1, values[6]]);
        corners.push([0, 1, 1, values[7]]);

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

        // console.log(cubeIndex);
        // console.log(triTable[cubeIndex]);
        // console.log(edgeTable[cubeIndex].toString(16));
        // console.log(edgeTable[cubeIndex]);

        let edge = edgeTable[cubeIndex];
        let edgeNums = [];
        for(let i=0; i<12; i++) {
            let val = 1 << i;
            if((val & edge) > 0) {
                edgeNums.push(i);
            }
        }

        // console.log(edgeNums);
        let blockSize = TERRAIN_SIZE/size;

        let edgePoints = [];
        for(let i=0; i<edgeNums.length; i++) {
            let edgeCorner = edgeCorners[edgeNums[i]];
            // console.log(edgeCorners)
            let p1 = corners[edgeCorner[0]];
            let p2 = corners[edgeCorner[1]];

            let pointNum = 0;

            let hashCords = [[p1[0]+x, p1[1]+y, p1[2]+z], [p2[0]+x, p2[1]+y, p2[2]+z]].toString();
            let mappedPoint = geometryVertices.get(hashCords);
            if(mappedPoint == undefined) {
                let func = interpolatePoints ? getMidPointLerp : getMidPoint;
                let point = func(p1, p2);
                pointNum = geometryVertices.size;
                geometryVertices.set(hashCords, geometryVertices.size);
                geometry.vertices.push(new T.Vector3(
                    (point[0] + x) * blockSize, 
                    (point[1] + y) * blockSize, 
                    (point[2] + z) * blockSize
                ));
                // console.log("new vector")
            } else {
                pointNum = mappedPoint;
            }

            // console.log(geometry.vertices[pointNum]);
            edgePoints.push(pointNum);
            // if(interpolatePoints) {
            //     point = getMidPointLerp(p1, p2);
            // } else {
            //     point = getMidPoint(p1, p2);
            // }
        }

        // console.log(geometry.vertices);
        // console.log(edgePoints);
        let facePoints = triTable[cubeIndex];
        // console.log(edgeNums);

        // for(let i=0; i<edgePoints; i++) {
        //     let edgePoint = edgePoints[i];
        //     geometry.vertices.push(new T.Vector3(edgePoint[0], edgePoint[1], edgePoint[2]))
        // }
        // console.log(facePoints);

        for(let i=0; i<facePoints.length; i+=3) {
            // console.log(edgePoints[edgeNums.indexOf[facePoints[i]]] + " " + edgePoints[edgeNums.indexOf[facePoints[i+1]]] + " " + edgePoints[edgeNums.indexOf[facePoints[i+2]]])
            // console.log(facePoints[i] + " " + facePoints[i+1] + " " + facePoints[i+2]);
            // console.log(edgeNums.indexOf(facePoints[i]) + " " + edgeNums.indexOf(facePoints[i+1]) + " " + edgeNums.indexOf(facePoints[i+2]));
            geometry.faces.push(new T.Face3(
                edgePoints[edgeNums.indexOf(facePoints[i])], 
                edgePoints[edgeNums.indexOf(facePoints[i+1])],
                edgePoints[edgeNums.indexOf(facePoints[i+2])]
            ));
        }

        // console.log(edgePoints);
    }
    // fillCube(0,0,0, new T.Geometry());

    let distanceFromCenter = (a, b, c) => {
        let blockSize = TERRAIN_SIZE/size;
        let aDist = Math.abs(a * blockSize - TERRAIN_SIZE/2);
        let bDist = Math.abs(b * blockSize - TERRAIN_SIZE/2);
        let cDist = Math.abs(c * blockSize - TERRAIN_SIZE/2);

        return Math.sqrt(aDist*aDist + bDist*bDist + cDist*cDist);
    }

    let getPoints = () => {
        meshPoints = [];
        for(let i=0; i<size+1; i++) {
            let column = [];
            for(let k=0; k<size+1; k++) {
                let row = [];
                for(let j=0; j<size+1; j++) {
                    if(makeSphere) {
                        if(distanceFromCenter(i, k, j) >= TERRAIN_SIZE * 0.5) {
                            row.push(0);
                        } else {
                            let result = perlinNoiseGenerator.getVal(i, k, j);
                            row.push(result);
                        }
                    } else {
                        if(i == 0 || k == 0 || j == 0|| i == size || k == size || j == size) {
                            row.push(0);
                        } else {
                            let result = perlinNoiseGenerator.getVal(i, k, j);
                            row.push(result);
                        }
                    }
                }
                column.push(row);
            }
            meshPoints.push(column);
        }
    }

    let createGeometry = () => {
        let geometry = new T.Geometry();
        let geometryVertices = new Map();
        // let drawSquare = (p1, p2, p3, p4) => {
        //     geometry.faces.push(new T.Face3(p1, p2, p4));
        //     geometry.faces.push(new T.Face3(p1, p4, p3));
        // }
        // let blockSize = TERRAIN_SIZE/size;
        // for(let i=0; i<size+1; i++) {
        //     for(let k=0; k<size+1; k++) {
        //         for(let j=0; j<size+1; j++) {
        //             geometry.vertices.push(new T.Vector3(i*blockSize, k*blockSize, j*blockSize));
        //         }
        //     }
        // }

        // let distanceFromCenter = (a, b, c) => {
        //     let aDist = Math.abs(a * blockSize - TERRAIN_SIZE/2);
        //     let bDist = Math.abs(b * blockSize - TERRAIN_SIZE/2);
        //     let cDist = Math.abs(c * blockSize - TERRAIN_SIZE/2);

        //     return Math.sqrt(aDist*aDist + bDist*bDist + cDist*cDist);
        // }

        console.log("size " + size)
        for(let x=0; x<size; x++) {
            for(let y=0; y<size; y++) {
                for(let z=0; z<size; z++) {
                    let v0 = meshPoints[x][y][z];
                    let v1 = meshPoints[x+1][y][z];
                    let v2 = meshPoints[x+1][y][z+1];
                    let v3 = meshPoints[x][y][z+1];
                    let v4 = meshPoints[x][y+1][z];
                    let v5 = meshPoints[x+1][y+1][z];
                    let v6 = meshPoints[x+1][y+1][z+1];
                    let v7 = meshPoints[x][y+1][z+1];
                    
                    fillCube(x, y, z, geometry, geometryVertices, [v0, v1, v2, v3, v4, v5, v6, v7]);
                }
            }
        }
        return geometry;
    }

    let createTerrain = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        createLights();

        getPoints();
        let material = new T.MeshLambertMaterial({ color: "lightblue" })
        let geometry = createGeometry();
        geometry.computeFaceNormals();
        let terrainMesh = new T.Mesh(geometry, material);

        let terrainGroup = new T.Group();
        terrainGroup.add(terrainMesh);
        terrainMesh.position.x = -TERRAIN_SIZE/2;
        terrainMesh.position.y = -TERRAIN_SIZE/2;
        terrainMesh.position.z = -TERRAIN_SIZE/2;

        scene.add(terrainGroup);
    }
    createTerrain();

    camera.position.z = TERRAIN_SIZE*1.2;
    camera.position.y = TERRAIN_SIZE*1.2;
    camera.position.x = -TERRAIN_SIZE*1.2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));

    let resolutionSlider = createSlider("Resolution", 0, resOptions.length-1, 1, res);
    let scaleSlider = createSlider("Scale", 0.0001, 0.4, 0.0001, scale);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);
    let thresholdSlider = createSlider("Threshold", 0, 1, 0.001, threshold);

    let lastSize = size;

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 0 and 999,999,999 inclusive";
        }
        else {
            seed = Number(seedBox.value)
            perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);
            perlinNoiseGenerator.setScale(Number(scaleSlider.value));
            perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
            createTerrain();
            seedWarning.innerHTML = "";
        }
    }

    resolutionSlider[0].oninput = () => { 
        res = resolutionSlider[0].value;
        size = resOptions[res];
        resolutionSlider[1].innerHTML = "Resolution: " + size + " x " + size;
    }
    resolutionSlider[1].innerHTML = "Resolution: " + size + " x " + size;
    resolutionSlider[0].onchange = () => {
        res = resolutionSlider[0].value;
        size = resOptions[res];
        if(autoAdjustScaleCheck.checked) {
            let ratio = size / lastSize;
            let curScale = scaleSlider[0].value;
            scale = curScale / ratio;
            scaleSlider[0].value = scale;
            scaleSlider[1].innerHTML = "Scale: " + scale;
        }
        lastSize = size;
        createTerrain();
    }

    scaleSlider[0].oninput = () => {
        scaleSlider[1].innerHTML = "Scale: " + scaleSlider[0].value;
    }
    scaleSlider[0].onchange = () => {
        scale = scaleSlider[0].value;
        createTerrain();
    }

    octavesSlider[0].oninput = () => {
        octavesSlider[1].innerHTML = "Octaves: " + octavesSlider[0].value;
    }
    octavesSlider[0].onchange = () => {
        octaves = octavesSlider[0].value;
        createTerrain();
    }
    
    thresholdSlider[0].oninput = () => {
        thresholdSlider[1].innerHTML = "Threshold: " + thresholdSlider[0].value;
    }
    thresholdSlider[0].onchange = () => {
        threshold = thresholdSlider[0].value;
        createTerrain();
    }

    let terrainRotation = 0;
    function animate() {
        requestAnimationFrame(animate);
        terrainRotation += 0.002;
        scene.children[2].rotation.z = terrainRotation;
        scene.children[2].rotation.y = terrainRotation;
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin3D);

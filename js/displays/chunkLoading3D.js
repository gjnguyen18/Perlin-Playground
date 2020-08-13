import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";
import { fillMarchingCube } from "../tools/marchingCubesHelper.js"
import { OrbitControls } from "../../libs/CS559-THREE/examples/jsm/controls/OrbitControls.js"

var size = 50;
var threshold = 0.59;
var scale = 0.05;
var octaves = 2;
var interpolatePoints = true;

var chunkSize = 16;
var spaceBetweenVertices = 0.005;
var addChunkRange = 5;
var deleteChunkRange = 6;
var moveSpeed = 0.001;
var chunksToLoadPerFrame = 2;

let cameraDistance = 1;

const TERRAIN_SIZE = 800;

var seed = 0;

function drawMarchingCubesTerrain() {

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);

    var playerPosition = [0, 0, 0];
    var nearChunks = new Map();
    var prevNearChunks = new Map();
    var chunkQueue = [];
    var chunkUnloadQueue = [];

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "chunkLoading3DCanvas"
    ));
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 5000);
    let scene = new T.Scene(); 

    let ambientLight = new T.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    let pointLight = new T.PointLight(0xffffff, 0.9, 100);
    pointLight.position.set(800, 500, 800);
    scene.add(pointLight);

    let fogColor = "#000000";
    scene.background = new T.Color(fogColor);
    scene.fog = new T.Fog(fogColor, chunkSize * spaceBetweenVertices * (addChunkRange-2), chunkSize * spaceBetweenVertices * (addChunkRange+1.5));
    // scene.fog = new T.FogExp2("0xFFFFFF", 0.05);

    let getPlayerChunk = () => {
        return [
            Math.floor(playerPosition[0]/(spaceBetweenVertices*chunkSize)),  
            Math.floor(playerPosition[1]/(spaceBetweenVertices*chunkSize)),
            Math.floor(playerPosition[2]/(spaceBetweenVertices*chunkSize)),
        ];
    }

    // let createChunkMesh = (x, y, z) => {
    //     let geometry = new T.Geometry();
    //     let material = new T.MeshLambertMaterial({ color: "lightblue", side: "double" });
    //     let geometryVertices = new Map();

    //     let meshPoints = new Map();

    //     for(let i = x * chunkSize; i < x * chunkSize + chunkSize; i++) {
    //         for(let k = y * chunkSize; k < y * chunkSize + chunkSize; k++) {
    //             for(let j = z * chunkSize; j < z * chunkSize + chunkSize; j++) {
    //                 let values = [];

    //                 // v0
    //                 if(meshPoints.has([i, k, j].toString())) {
    //                     values.push(meshPoints.get([i, k, j].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i, k, j);
    //                     meshPoints.set([i, k, j].toString(), val);
    //                     values.push(val);
    //                 }
                    
    //                 // v1
    //                 if(meshPoints.has([i+1, k, j].toString())) {
    //                     values.push(meshPoints.get([i+1, k, j].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i+1, k, j);
    //                     meshPoints.set([i+1, k, j].toString(), val);
    //                     values.push(val);
    //                 }

    //                 // v2
    //                 if(meshPoints.has([i+1, k, j+1].toString())) {
    //                     values.push(meshPoints.get([i+1, k, j+1].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i+1, k, j+1);
    //                     meshPoints.set([i+1, k, j+1].toString(), val);
    //                     values.push(val);
    //                 }

    //                 // v3
    //                 if(meshPoints.has([i, k, j+1].toString())) {
    //                     values.push(meshPoints.get([i, k, j+1].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i, k, j+1);
    //                     meshPoints.set([i, k, j+1].toString(), val);
    //                     values.push(val);
    //                 }

    //                 // v4
    //                 if(meshPoints.has([i, k+1, j].toString())) {
    //                     values.push(meshPoints.get([i, k+1, j].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i, k+1, j);
    //                     meshPoints.set([i, k+1, j].toString(), val);
    //                     values.push(val);
    //                 }
                    
    //                 // v5
    //                 if(meshPoints.has([i+1, k+1, j].toString())) {
    //                     values.push(meshPoints.get([i+1, k+1, j].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i+1, k+1, j);
    //                     meshPoints.set([i+1, k+1, j].toString(), val);
    //                     values.push(val);
    //                 }

    //                 // v6
    //                 if(meshPoints.has([i+1, k+1, j+1].toString())) {
    //                     values.push(meshPoints.get([i+1, k+1, j+1].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i+1, k+1, j+1);
    //                     meshPoints.set([i+1, k+1, j+1].toString(), val);
    //                     values.push(val);
    //                 }

    //                 // v7
    //                 if(meshPoints.has([i, k+1, j+1].toString())) {
    //                     values.push(meshPoints.get([i, k+1, j+1].toString()));
    //                 } else {
    //                     let val = perlinNoiseGenerator.getVal(i, k+1, j+1);
    //                     meshPoints.set([i, k+1, j+1].toString(), val);
    //                     values.push(val);
    //                 }

    //                 fillMarchingCube(i, k, j, spaceBetweenVertices, values, threshold, interpolatePoints, geometry, geometryVertices);
    //             }
    //         }
    //     }

    //     // console.log(meshPoints);

    //     geometry.computeFaceNormals();

    //     let terrain = new T.Mesh(geometry, material);
    //     return terrain;
    // }

    let createChunkMesh = (x, y, z) => {
        let geometry = new T.Geometry();
        let material = new T.MeshLambertMaterial({ color: "lightblue", side: "double" });
        let geometryVertices = new Map();

        let meshPoints = [];
        // for(let i=0; i<chunkSize+1; i++) {
        //     let column = [];
        //     for(let k=0; k<chunkSize+1; k++) {
        //         let row = [];
        //         for(let j=0; j<chunkSize+1; j++) {
        //             let result = perlinNoiseGenerator.getVal(x * chunkSize + i, y * chunkSize + k, z * chunkSize + j);
        //             row.push(result);
        //         }
        //         column.push(row);
        //     }
        //     meshPoints.push(column);
        // }

        // i-k face
        for(let i=0; i<chunkSize+1; i++) {
            let column = [];
            for(let k=0; k<chunkSize+1; k++) {
                let result = perlinNoiseGenerator.getVal(x * chunkSize + i, y * chunkSize + k, z * chunkSize + 0);
                let row = [result];
                column.push(row);
            }
            meshPoints.push(column);
        }

        // i-j face
        for(let i=0; i<chunkSize+1; i++) {
            let row = meshPoints[i][0];
            for(let j=1; j<chunkSize+1; j++) {
                let result = perlinNoiseGenerator.getVal(x * chunkSize + i, y * chunkSize + 0, z * chunkSize + j);
                row.push(result);
            }
        }

        // k-j face
        for(let k=1; k<chunkSize+1; k++) {
            for(let j=1; j<chunkSize+1; j++) {
                let result = perlinNoiseGenerator.getVal(x * chunkSize + 0, y * chunkSize + k, z * chunkSize + j);
                meshPoints[0][k].push(result);
            }
        }



        for(let i = 0; i < chunkSize; i++) {
            for(let k = 0; k < chunkSize; k++) {
                for(let j = 0; j < chunkSize; j++) {
                    let result = perlinNoiseGenerator.getVal(x * chunkSize + i + 1, y * chunkSize + k + 1, z * chunkSize + j + 1);
                    meshPoints[i+1][k+1].push(result);

                    let v0 = meshPoints[i][k][j];
                    let v1 = meshPoints[i+1][k][j];
                    let v2 = meshPoints[i+1][k][j+1];
                    let v3 = meshPoints[i][k][j+1];
                    let v4 = meshPoints[i][k+1][j];
                    let v5 = meshPoints[i+1][k+1][j];
                    let v6 = meshPoints[i+1][k+1][j+1];
                    let v7 = meshPoints[i][k+1][j+1];
                
                    let values = [v0, v1, v2, v3, v4, v5, v6, v7];

                    fillMarchingCube(i + x * chunkSize, k + y * chunkSize, j + z * chunkSize, spaceBetweenVertices, values, threshold, interpolatePoints, geometry, geometryVertices);
                }
            }
        }

        // console.log(meshPoints);

        geometry.computeFaceNormals();

        let terrain = new T.Mesh(geometry, material);
        return terrain;
    }

    let updateChunks = (currChunk) => {
        for(let i=currChunk[0]-addChunkRange; i<=currChunk[0]+addChunkRange; i++) {
            for(let k=currChunk[1]-addChunkRange; k<=currChunk[1]+addChunkRange; k++) {
                for(let j=currChunk[2]-addChunkRange; j<=currChunk[2]+addChunkRange; j++) {
                    let distanceToPlayerChunk = Math.sqrt((currChunk[0] - i) * (currChunk[0] - i) + (currChunk[1] - k) * (currChunk[1] - k) + (currChunk[2] - j) * (currChunk[2] - j));
                    if(distanceToPlayerChunk < addChunkRange && !nearChunks.has([i, k, j].toString())) {
                        nearChunks.set([i, k, j].toString(), [i, k, j]);
                    }
                }
            }
        }
        nearChunks.forEach(function(value, key) {
            let distanceToPlayerChunk = Math.sqrt(
                (currChunk[0] - value[0]) * (currChunk[0] - value[0]) + 
                (currChunk[1] - value[1]) * (currChunk[1] - value[1]) + 
                (currChunk[2] - value[2]) * (currChunk[2] - value[2])
            );
            if(distanceToPlayerChunk >= deleteChunkRange) {
                nearChunks.delete(value.toString());
                let mesh = prevNearChunks.get(value.toString());
                chunkUnloadQueue.push(mesh);
                // scene.remove(mesh);
                prevNearChunks.delete(value.toString());
            }
        })
    }

    let updateTerrain = () => {
        let playerChunk = getPlayerChunk();
        updateChunks(playerChunk);
        nearChunks.forEach(function(value, key) {
            if(!prevNearChunks.has(key)) {
                chunkQueue.push(value);
                prevNearChunks.set(key, value);
            }
        });
        for(let i=0; i<chunksToLoadPerFrame; i++) {
            if(chunkQueue.length > 0) {
                let value = chunkQueue.shift();
                if(nearChunks.has(value.toString())) {
                    let mesh = createChunkMesh(value[0], value[1], value[2]);
                    prevNearChunks.set(value.toString(), mesh);
                    scene.add(mesh);
                } else {
                    i--;
                }
            }
            else {
                i = chunksToLoadPerFrame;
            }
        }

        for(let i=0; i<chunksToLoadPerFrame*2; i++) {
            if(chunkUnloadQueue.length > 0) {
                let mesh = chunkUnloadQueue.shift();
                mesh.geometry.dispose();
                mesh.material.dispose();
                scene.remove(mesh);
            }
            else {
                i = chunksToLoadPerFrame*2;
            }
        }
    }

    let clearTerrain = () => {
        nearChunks.forEach(function(value, key) {
            chunkQueue = [];
            let mesh = prevNearChunks.get(value.toString());
            scene.remove(mesh);
            nearChunks.delete(value.toString());
            prevNearChunks.delete(value.toString());
        });
    }

    let recreateTerrain = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);
        clearTerrain();
        updateTerrain();
    }
    recreateTerrain();

    
    let updateCamera = () => {
        // camera.position.set(playerPosition[0], playerPosition[1] + cameraDistance*1.5, playerPosition[2] + cameraDistance*1.2);
        // pointLight.position.set(playerPosition[0] + cameraDistance * 1.2, playerPosition[1] + cameraDistance * .6, playerPosition[2] + cameraDistance * 1.2);
        // camera.lookAt(playerPosition[0], playerPosition[1], playerPosition[2]);

        camera.position.set(playerPosition[0], playerPosition[1], playerPosition[2]+chunkSize*spaceBetweenVertices*addChunkRange);
        camera.lookAt(playerPosition[0], playerPosition[1], playerPosition[2]+chunkSize*spaceBetweenVertices*addChunkRange - 100);
        pointLight.position.set(playerPosition[0], playerPosition[1], playerPosition[2]+chunkSize*spaceBetweenVertices*addChunkRange);

        // camera.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);
        // camera.lookAt(playerPosition[0], playerPosition[1], playerPosition[2]- 100);
        // pointLight.position.set(playerPosition[0], playerPosition[1], playerPosition[2]);
    }

    renderer.render(scene, camera);
        
    

    // - - - - - - - - - - - - - KEYBOARD INPUTS - - - - - - - - -



    let keyMap = new Map();
    let activateKey = (e) => {
        keyMap.set(e.key, true)
    }
    let deactivateKey = (e) => {
        keyMap.set(e.key, false)
    }
    document.addEventListener('keydown', activateKey);
    document.addEventListener('keyup', deactivateKey);

    let movePlayer = () => {
        if(keyMap.get("w")) {
            playerPosition[2] -= moveSpeed;
        }
        if(keyMap.get("s")) {
            playerPosition[2] += moveSpeed;
        }
        if(keyMap.get("a")) {
            playerPosition[0] -= moveSpeed;
        }
        if(keyMap.get("d")) {
            playerPosition[0] += moveSpeed;
        }
        if(keyMap.get("e")) {
            playerPosition[1] += moveSpeed;
        }
        if(keyMap.get("q")) {
            playerPosition[1] -= moveSpeed;
        }
    }
    


    // - - - - - - - - - - - - - INPUTS - - - - - - - - - - - - -

    

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));

    let lerpCheck = createCheckbox("Linear Interpolation", interpolatePoints);

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
            recreateTerrain();
            seedWarning.innerHTML = "";
        }
    }

    lerpCheck.onclick = () => {
        interpolatePoints = lerpCheck.checked;
        recreateTerrain();
    }

    scaleSlider[0].oninput = () => {
        scaleSlider[1].innerHTML = "Scale: " + scaleSlider[0].value;
    }
    scaleSlider[0].onchange = () => {
        scale = scaleSlider[0].value;
        recreateTerrain();
    }

    octavesSlider[0].oninput = () => {
        octavesSlider[1].innerHTML = "Octaves: " + octavesSlider[0].value;
    }
    octavesSlider[0].onchange = () => {
        octaves = octavesSlider[0].value;
        recreateTerrain();
    }
    
    thresholdSlider[0].oninput = () => {
        thresholdSlider[1].innerHTML = "Threshold: " + thresholdSlider[0].value;
    }
    thresholdSlider[0].onchange = () => {
        threshold = thresholdSlider[0].value;
        recreateTerrain();
    }

    // let terrainRotation = 0;
    // let controls = new OrbitControls(camera, renderer.domElement);
    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        updateTerrain();
        updateCamera();
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawMarchingCubesTerrain);

import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { OrbitControls } from "../../libs/CS559-THREE/examples/jsm/controls/OrbitControls.js";
import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";

var amplitude = 500;
var scale = 0.014;
var octaves = 7;
var chunkSize = 16;
var spaceBetweenVertices = 2;
var addChunkRange = 8;
var deleteChunkRange = 12;
var moveSpeed = 4;
let cameraDistance = 400;
var chunksToLoadPerFrame = 10;

var seed = 0;

function drawPerlin2DTerrain() {
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    var playerPosition = [0, 0];
    var nearChunks = new Map();
    var prevNearChunks = new Map();
    var chunkQueue = [];

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "chunkLoading2DTerrainCanvas"
    ));
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 4000);
    let scene = new T.Scene(); 

    // createLights
    let ambientLight = new T.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);
    let pointLight = new T.PointLight(0xffffff, 1, 4000);
    pointLight.position.set(chunkSize * spaceBetweenVertices * 0.75, 200, 0);
    scene.add(pointLight);

    let createChunkMesh = (x, y) => {
        let geometry = new T.Geometry();
        let material = new T.MeshLambertMaterial({ color: "lightblue" });

        for(let i = x * chunkSize; i < x * chunkSize + chunkSize + 1; i++) {
            for(let k = y * chunkSize; k < y * chunkSize + chunkSize + 1; k++) {
                let result = perlinNoiseGenerator.getVal(i, k) * amplitude;
                geometry.vertices.push(new T.Vector3(i*spaceBetweenVertices, result, k*spaceBetweenVertices));
            }
        }

        for(let i=0; i<chunkSize; i++) {
            for(let k=0; k<chunkSize; k++) {
                geometry.faces.push(new T.Face3(i*(chunkSize+1)+k+1, (i+1)*(chunkSize+1)+k+1, i*(chunkSize+1)+k));
                geometry.faces.push(new T.Face3((i+1)*(chunkSize+1)+k+1, (i+1)*(chunkSize+1)+k, i*(chunkSize+1)+k));
            }
        }

        geometry.computeFaceNormals();

        let terrain = new T.Mesh(geometry, material);
        return terrain;
    }

    let getPlayerChunk = () => {
        return [
            Math.floor(playerPosition[0]/(spaceBetweenVertices*chunkSize)),  
            Math.floor(playerPosition[1]/(spaceBetweenVertices*chunkSize))
        ];
    }

    let updateChunks = (currChunk) => {
        for(let i=currChunk[0]-addChunkRange; i<=currChunk[0]+addChunkRange; i++) {
            for(let k=currChunk[1]-addChunkRange; k<=currChunk[1]+addChunkRange; k++) {
                let distanceToPlayerChunk = Math.sqrt((currChunk[0] - i) * (currChunk[0] - i) + (currChunk[1] - k) * (currChunk[1] - k));
                if(distanceToPlayerChunk < addChunkRange && !nearChunks.has([i, k].toString())) {
                    nearChunks.set([i, k].toString(), [i, k]);
                }
            }
        }
        nearChunks.forEach(function(value, key) {
            let distanceToPlayerChunk = Math.sqrt((currChunk[0] - value[0]) * (currChunk[0] - value[0]) + (currChunk[1] - value[1]) * (currChunk[1] - value[1]));
            if(distanceToPlayerChunk >= deleteChunkRange) {
                nearChunks.delete(value.toString());
                let mesh = prevNearChunks.get(value.toString());
                scene.remove(mesh);
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
                // let mesh = createChunkMesh(value[0], value[1], chunkSize);
                // prevNearChunks.set(key, mesh);
                // scene.add(mesh);
                prevNearChunks.set(key, value);
            }
        });
        for(let i=0; i<chunksToLoadPerFrame; i++) {
            if(chunkQueue.length > 0) {
                let value = chunkQueue.shift();
                if(nearChunks.has(value.toString())) {
                    let mesh = createChunkMesh(value[0], value[1], chunkSize);
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
        camera.position.set(playerPosition[0], cameraDistance*1.5, playerPosition[1] + cameraDistance*1.2);
        pointLight.position.set(playerPosition[0] + cameraDistance * 1.2, cameraDistance * .6, playerPosition[1] + cameraDistance * 1.2);
        camera.lookAt(playerPosition[0], 200, playerPosition[1]);
    }
    
    

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
            playerPosition[1] -= moveSpeed;
        }
        if(keyMap.get("s")) {
            playerPosition[1] += moveSpeed;
        }
        if(keyMap.get("a")) {
            playerPosition[0] -= moveSpeed;
        }
        if(keyMap.get("d")) {
            playerPosition[0] += moveSpeed;
        }
    }



    // - - - - - - - - - - - - - INPUTS - - - - - - - - - - - - -



    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));

    let cameraDistanceSlider = createSlider("Camera Distance", 100, 2000, 10, cameraDistance);
    let spaceBetweenVerticesSlider = createSlider("Space Between Vertices", 1, 20, 1, spaceBetweenVertices);
    let chunkSizeSlider = createSlider("Chunk Size", 1, 40, 1, chunkSize);
    let chunkRangeSlider = createSlider("Chunk Range", 2, 32, 1, addChunkRange);
    let chunksToLoadPerFrameSlider = createSlider("Chunks Loaded per Frame", 1, 50, 1, chunksToLoadPerFrame);
    let scaleSlider = createSlider("Scale", 0.0001, 0.4, 0.0001, scale);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);
    let amplitudeSlider = createSlider("Amplitude", 0, 800, 1, amplitude);

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 0 and 999,999,999 inclusive";
        }
        else {
            seed = Number(seedBox.value)
            perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);
            perlinNoiseGenerator.setScale(Number(scaleSlider.value));
            perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
            recreateTerrain();
            seedWarning.innerHTML = "";
        }
    }

    cameraDistanceSlider[0].oninput = () => {
        cameraDistanceSlider[1].innerHTML = "Camera Distance: " + cameraDistanceSlider[0].value;
        cameraDistance = cameraDistanceSlider[0].value;
    }

    spaceBetweenVerticesSlider[0].oninput = () => {
        spaceBetweenVerticesSlider[1].innerHTML = "Space Between Vertices: " + spaceBetweenVerticesSlider[0].value;
    }
    spaceBetweenVerticesSlider[0].onchange = () => {
        spaceBetweenVertices = spaceBetweenVerticesSlider[0].value;
        recreateTerrain();
    }

    chunkSizeSlider[0].oninput = () => {
        chunkSizeSlider[1].innerHTML = "Chunk Size: " + chunkSizeSlider[0].value;
    }
    chunkSizeSlider[0].onchange = () => {
        chunkSize = Number(chunkSizeSlider[0].value);
        recreateTerrain();
    }

    chunkRangeSlider[0].oninput = () => {
        chunkRangeSlider[1].innerHTML = "Chunk Range: " + chunkRangeSlider[0].value;
    }
    chunkRangeSlider[0].onchange = () => {
        addChunkRange = Number(chunkRangeSlider[0].value);
        deleteChunkRange = addChunkRange + 4;
        recreateTerrain();
    }

    chunksToLoadPerFrameSlider[0].oninput = () => {
        chunksToLoadPerFrameSlider[1].innerHTML = "Chunks Loaded per Frame: " + chunksToLoadPerFrameSlider[0].value;
    }
    chunksToLoadPerFrameSlider[0].onchange = () => {
        chunksToLoadPerFrame = Number(chunksToLoadPerFrameSlider[0].value);
        // recreateTerrain();
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
    
    amplitudeSlider[0].oninput = () => {
        amplitudeSlider[1].innerHTML = "Amplitude: " + amplitudeSlider[0].value;
    }
    amplitudeSlider[0].onchange = () => {
        amplitude = amplitudeSlider[0].value;
        recreateTerrain();
    }

    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        updateTerrain();
        updateCamera();
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin2DTerrain);

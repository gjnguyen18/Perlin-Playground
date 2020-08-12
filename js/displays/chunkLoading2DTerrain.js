import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { OrbitControls } from "../../libs/CS559-THREE/examples/jsm/controls/OrbitControls.js";
import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 100;
var amplitude = 500;
var scale = 0.014;
var octaves = 7;
var res = 2;
var resOptions = [25, 50, 100, 200, 400];
var chunkSize = 16;
var spaceBetweenVertices = 2;
var autoAdjust = true;
var addChunkRange = 8;
var deleteChunkRange = 12;
var moveSpeed = 4;
let cameraDistance = 400;

var seed = 0;

function drawPerlin2DTerrain() {
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    var playerPosition = [0, 0];
    var nearChunks = new Map();
    var prevNearChunks = new Map();

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "chunkLoading2DTerrainCanvas"
    ));
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 2000);
    let scene = new T.Scene(); 

    // createLights
    let ambientLight = new T.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);
    let pointLight = new T.PointLight(0xffffff, 1, 2000);
    pointLight.position.set(chunkSize * spaceBetweenVertices * 0.75, 200, 0);
    scene.add(pointLight);

    let createChunkMesh = (x, y) => {
        let geometry = new T.Geometry();
        let material = new T.MeshLambertMaterial({ color: "lightblue" });

        // add vertices to geometry
        for(let i = x * chunkSize; i < x * chunkSize + chunkSize + 1; i++) {
            for(let k = y * chunkSize; k < y * chunkSize + chunkSize + 1; k++) {
                let result = perlinNoiseGenerator.getVal(i, k) * amplitude;
                geometry.vertices.push(new T.Vector3(i*spaceBetweenVertices, result, k*spaceBetweenVertices));
            }
        }

        // add faces to geometry
        for(let i=0; i<chunkSize; i++) {
            for(let k=0; k<chunkSize; k++) {
                geometry.faces.push(new T.Face3(i*(chunkSize+1)+k+1, (i+1)*(chunkSize+1)+k+1, i*(chunkSize+1)+k));
                geometry.faces.push(new T.Face3((i+1)*(chunkSize+1)+k+1, (i+1)*(chunkSize+1)+k, i*(chunkSize+1)+k));
            }
        }

        // console.log(geometry);
        geometry.computeFaceNormals();

        let terrain = new T.Mesh(geometry, material);
        // let terrainGroup = new T.Group();
        // terrainGroup.add(terrain);
        // terrain.position.x = -TERRAIN_SIZE/2;
        // terrain.position.z = -TERRAIN_SIZE/2;
        // terrain.position.y = -amplitude/2;
        return terrain;
    }

    // let terrainGroup = new T.Group();
    // scene.add(terrainGroup);
    // let terrainMeshes = new Map();

    let getPlayerChunk = () => {
        let spacing = length/size;
        return [
            Math.floor(playerPosition[0]/(spaceBetweenVertices*chunkSize)),  
            Math.floor(playerPosition[1]/(spaceBetweenVertices*chunkSize))
        ];
    }

    let updateChunks = (currChunk, closeRange, farRange) => {
        for(let i=currChunk[0]-closeRange; i<=currChunk[0]+closeRange; i++) {
            for(let k=currChunk[1]-closeRange; k<=currChunk[1]+closeRange; k++) {
                let distanceToPlayerChunk = Math.sqrt((currChunk[0] - i) * (currChunk[0] - i) + (currChunk[1] - k) * (currChunk[1] - k));
                if(distanceToPlayerChunk < closeRange && !nearChunks.has([i, k].toString())) {
                    nearChunks.set([i, k].toString(), [i, k]);
                }
            }
        }
        nearChunks.forEach(function(value, key) {
            let distanceToPlayerChunk = Math.sqrt((currChunk[0] - value[0]) * (currChunk[0] - value[0]) + (currChunk[1] - value[1]) * (currChunk[1] - value[1]));
            if(distanceToPlayerChunk >= farRange) {
                nearChunks.delete(value.toString());
                // terrainGroup.remove(terrainGroup.children[prevNearChunks.get(value.toString())]);
                let mesh = prevNearChunks.get(value.toString());
                scene.remove(mesh);
                prevNearChunks.delete(value.toString());
            }
        })
    }

    let updateTerrain = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        let playerChunk = getPlayerChunk();
        updateChunks(playerChunk, addChunkRange, deleteChunkRange, nearChunks);
        nearChunks.forEach(function(value, key) {
            if(!prevNearChunks.has(key)) {
                let mesh = createChunkMesh(value[0], value[1]);
                prevNearChunks.set(key, mesh);
                // console.log(terrainGroup.children.length);
                // terrainMeshes.add(mesh)
                scene.add(mesh);
            }
        });

        // scene.add(mesh);

        // terrainGroup.position.x = chunkSize*2.5;
        // terrainGroup.position.z = -chunkSize*20;

        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = T.PCFSoftShadowMap;
        // scene.children[1].castShadow = true;
        // terrain.castShadow = true;
        // terrain.receiveShadow = true;

        // renderer.render(scene, camera);
    }

    let updateCamera = () => {
        camera.position.set(playerPosition[0], cameraDistance*1.5, playerPosition[1] + cameraDistance*1.2);
        pointLight.position.set(playerPosition[0] + cameraDistance * 1.2, cameraDistance * .6, playerPosition[1] + cameraDistance * 1.2);
        camera.lookAt(playerPosition[0], 200, playerPosition[1]);
    }
    // let controls = new OrbitControls(camera, renderer.domElement);
    
    

    // - - - - - - - - - - - - - KEYBOARD INPUTS - - - - - - - - -



    let keyMap = new Map();
    let activateKey = (e) => {
        keyMap.set(e.key, true)
        // movePlayer();
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
            createTerrain();
            seedWarning.innerHTML = "";
        }
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

import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";

var size = 80;
var threshold = 0.5;
var scale = 0.05;
var octaves = 3;
var res = 3;
var resOptions = [25, 40, 50, 80, 100, 200];
const TERRAIN_SIZE = 400;

var seed = 0;

function drawPerlin3D() {
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);
    let meshPoints = [];

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "3DTerrainCanvas"
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

    let getPoints = () => {
        meshPoints = [];
        for(let i=0; i<size+1; i++) {
            let column = [];
            for(let k=0; k<size+1; k++) {
                let row = [];
                for(let j=0; j<size+1; j++) {
                    let result = perlinNoiseGenerator.getVal(i, k, j);
                    row.push(result);
                }
                column.push(row);
            }
            meshPoints.push(column);
        }
    }

    let createGeometry = () => {
        let geometry = new T.Geometry();
        let drawSquare = (p1, p2, p3, p4) => {
            geometry.faces.push(new T.Face3(p1, p2, p4));
            geometry.faces.push(new T.Face3(p1, p4, p3));
        }
        let blockSize = TERRAIN_SIZE/size;
        for(let i=0; i<size+1; i++) {
            for(let k=0; k<size+1; k++) {
                for(let j=0; j<size+1; j++) {
                    geometry.vertices.push(new T.Vector3(i*blockSize, k*blockSize, j*blockSize));
                }
            }
        }

        let line = size+1;
        let square = (size+1) * (size+1);

        let distanceFromCenter = (a, b, c) => {
            let aDist = Math.abs(a * blockSize - TERRAIN_SIZE/2);
            let bDist = Math.abs(b * blockSize - TERRAIN_SIZE/2);
            let cDist = Math.abs(c * blockSize - TERRAIN_SIZE/2);

            return Math.sqrt(aDist*aDist + bDist*bDist + cDist*cDist);
        }

        for(let i=0; i<size; i++) {
            for(let k=0; k<size; k++) {
                for(let j=0; j<size; j++) {
                    let curr = i + line * k + square * j;
                    if(meshPoints[i][k][j] > threshold && distanceFromCenter(i, k, j) < TERRAIN_SIZE/2) {
                        if(i > 0) {
                            if(meshPoints[i-1][k][j] < threshold || distanceFromCenter(i-1, k, j) >= TERRAIN_SIZE/2) {
                                drawSquare(curr + square, curr, curr + square + line, curr + line);
                            }
                        } 
                        else {
                            drawSquare(curr+square, curr, curr + square + line, curr + line);
                        }
                        if(k > 0) {
                            if(meshPoints[i][k-1][j] < threshold || distanceFromCenter(i, k-1, j) >= TERRAIN_SIZE/2) {
                                drawSquare(curr+square+1, curr + 1, curr+square, curr);
                            }
                        } 
                        else {
                            drawSquare(curr+square+1, curr + 1, curr+square, curr);
                        }
                        if(j > 0) {
                            if(meshPoints[i][k][j-1] < threshold || distanceFromCenter(i, k, j-1) >= TERRAIN_SIZE/2) {
                                drawSquare(curr, curr + 1, curr + line, curr + line + 1);
                            }
                        }
                        else {
                            drawSquare(curr, curr + 1, curr + line, curr + line + 1);
                        }
                        if(meshPoints[i+1][k][j] < threshold || i == size - 1 || distanceFromCenter(i+1, k, j) >= TERRAIN_SIZE/2) {
                            drawSquare(curr + 1, curr + square + 1, curr + line + 1, curr + square + line + 1)
                        }
                        if(meshPoints[i][k+1][j] < threshold || k == size - 1 || distanceFromCenter(i, k+1, j) >= TERRAIN_SIZE/2) {
                            drawSquare(curr + square + line, curr + line, curr + square + line + 1, curr + line + 1)
                        }
                        if(meshPoints[i][k][j+1] < threshold || j == size - 1 || distanceFromCenter(i, k, j+1) >= TERRAIN_SIZE/2) {
                            drawSquare(curr + square + 1, curr + square, curr + square + line + 1, curr + square + line)
                        }
                    }
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

    camera.position.z = TERRAIN_SIZE;
    camera.position.y = TERRAIN_SIZE;
    camera.position.x = -TERRAIN_SIZE;
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

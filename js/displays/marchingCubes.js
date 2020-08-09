import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";
import { fillMarchingCube } from "../tools/marchingCubesHelper.js"

var size = 50;
var threshold = 0.52;
var scale = 0.03;
var octaves = 3;
var res = 2;
var resOptions = [25, 40, 50, 80, 100, 200];
var interpolatePoints = true;
var makeSphere = false;
var autoAdjust = true;
const TERRAIN_SIZE = 400;

var seed = 0;

function drawMarchingCubesTerrain() {

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
                    
                    let blockSize = TERRAIN_SIZE/size;
                    let values = [v0, v1, v2, v3, v4, v5, v6, v7];
                    fillMarchingCube(x, y, z, blockSize, values, threshold, interpolatePoints, geometry, geometryVertices);
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
    


    // - - - - - - - - - - - - - INPUTS - - - - - - - - - - - - -

    

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));

    let lerpCheck = createCheckbox("Linear Interpolation", interpolatePoints);
    let makeSphereCheck = createCheckbox("Make Sphere", makeSphere);
    let autoAdjustScaleCheck = createCheckbox("Auto Adjust Scale", autoAdjust);

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

    lerpCheck.onclick = () => {
        interpolatePoints = lerpCheck.checked;
        createTerrain();
    }
    makeSphereCheck.onclick = () => {
        makeSphere = makeSphereCheck.checked;
        createTerrain();
    }
    autoAdjustScaleCheck.onclick = () => {
        autoAdjust = autoAdjustScaleCheck.checked;
    }

    resolutionSlider[0].oninput = () => { 
        res = resolutionSlider[0].value;
        size = resOptions[res];
        resolutionSlider[1].innerHTML = "Resolution: " + size + " x " + size + " x " + size;
    }
    resolutionSlider[1].innerHTML = "Resolution: " + size + " x " + size + " x " + size;
    resolutionSlider[0].onchange = () => {
        res = resolutionSlider[0].value;
        size = resOptions[res];
        if(autoAdjust) {
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
        if(size <= 25) {
            threshold = thresholdSlider[0].value;
            createTerrain();
        }
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

onWindowOnload(drawMarchingCubesTerrain);

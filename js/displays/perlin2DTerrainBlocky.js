import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { PerlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 100;
var amplitude = 500;
var scale = 0.03;
var octaves = 3;
var res = 2;
var resOptions = [25, 50, 100, 200, 400];
const terrainSize = 400;

var seed = 0;

function drawPerlin2DTerrain() {
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D();
    let meshPoints = [];

    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "blockyTerrainPerlin2DCanvas"
    ));
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 1000);
    let scene = new T.Scene(); 

    let getPoints = () => {
        meshPoints = [];
        for(let i=0; i<size+1; i++) {
            let column = [];
            for(let k=0; k<size+1; k++) {
                let result = perlinNoiseGenerator.getVal(i, k);
                let blockHeight = terrainSize / size;
                let val = Math.floor(result * amplitude / blockHeight);
                column.push(val * blockHeight);
            }
            meshPoints.push(column);
        }
    }

    let createGeometry = () => {
        let geometry = new T.Geometry();
        let drawSquare = (p1, p2, p3, p4) => {
            geometry.faces.push(new T.Face3(p4, p2, p1));
            geometry.faces.push(new T.Face3(p3, p4, p1));
        }
        for(let i=0; i<size; i++) {
            for(let k=0; k<size; k++) {
                let thisVal = meshPoints[k][i];
                geometry.vertices.push(new T.Vector3(k*terrainSize/size, thisVal, i*terrainSize/size));
                geometry.vertices.push(new T.Vector3((k+1)*terrainSize/size, thisVal, i*terrainSize/size));
                geometry.vertices.push(new T.Vector3(k*terrainSize/size, thisVal, (i+1)*terrainSize/size));
                geometry.vertices.push(new T.Vector3((k+1)*terrainSize/size, thisVal, (i+1)*terrainSize/size));

                let l = geometry.vertices.length;
                drawSquare(l-4,l-3,l-2,l-1);

                if(k>0) {
                    if(meshPoints[k-1][i] < thisVal) {
                        drawSquare(l-5,l-7,l-2,l-4);
                    }
                    else if(meshPoints[k-1][i] > thisVal) {
                        drawSquare(l-4,l-2,l-7,l-5);
                    }
                }

                if(i>0) {
                    let iStep = size * 4;
                    if(meshPoints[k][i-1] < thisVal) {
                        drawSquare(l-2-iStep,l-1-iStep,l-4,l-3);
                    }
                    else if(meshPoints[k][i-1] > thisVal) {
                        drawSquare(l-3, l-4, l-1-iStep, l-2-iStep);
                    }
                }
            }
        }
        return geometry;
    }

    let createLights = () => {
        let ambientLight = new T.AmbientLight(0xffffff, 0.25);
        scene.add(ambientLight);
        let pointLight = new T.PointLight(0xffffff, 1);
        pointLight.position.set(800, 500, 800);
        scene.add(pointLight);
    }

    let createTerrain = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        createLights();

        let material = new T.MeshLambertMaterial({ color: "lightblue" });
        getPoints();
        let geometry = createGeometry();
        geometry.computeFaceNormals();

        let terrain = new T.Mesh(geometry, material);

        let terrainGroup = new T.Group();
        terrainGroup.add(terrain);
        terrain.position.x = -terrainSize/2;
        terrain.position.z = -terrainSize/2;
        terrain.position.y = -amplitude/2;
        scene.add(terrainGroup);
        renderer.render(scene, camera);
    }
    createTerrain();

    camera.position.z = 240;
    camera.position.y = 320;
    camera.position.x = -240;
    camera.lookAt(0,-terrainSize*.15,0);

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));

    let resolutionSlider = createSlider("Resolution", 0, resOptions.length-1, 1, res);
    let scaleSlider = createSlider("Scale", 0.0001, 0.4, 0.0001, scale);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);
    let amplitudeSlider = createSlider("Amplitude", 0, 800, 1, amplitude);

    let lastSize = size;

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
            drawCanvas();
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
    
    amplitudeSlider[0].oninput = () => {
        amplitudeSlider[1].innerHTML = "Amplitude: " + amplitudeSlider[0].value;
    }
    amplitudeSlider[0].onchange = () => {
        amplitude = amplitudeSlider[0].value;
        createTerrain();
    }
  
    let terrainRotation = 0;
    function animate() {
        requestAnimationFrame(animate);
        terrainRotation += 0.001;
        scene.children[2].rotation.y = terrainRotation;
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin2DTerrain);


import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../../libs/helpers.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";

var numSquares = 50;
var threshold = 0.5;
const terrainSize = 400;

var seed = 0;

function drawPerlin3D() {

    // create surface points
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);

    perlinNoiseGenerator.setScale(0.06);
    perlinNoiseGenerator.setOctaves(1);

    let meshPoints = [];

    // create canvas  
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "3DTerrainCanvas"
    ));
    
    // Set up the renderer, which will create the Canvas for us
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    
    // the aspect ratio is set to 1 - since we're making the window 200x200
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 2000);
    let scene = new T.Scene(); 

    let createLights = () => {
        let ambientLight = new T.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        let pointLight = new T.PointLight(0xffffff, 1, 2000);
        pointLight.position.set(800, 500, 800);
        scene.add(pointLight);

        // let pointLight2 = new T.PointLight(0xff00ff, 1, 2000);
        // pointLight2.position.set(-800, -500, -800);
        // scene.add(pointLight2);
    }

    let getPoints = () => {
        meshPoints = [];
        for(let i=0; i<numSquares+1; i++) {
            let column = [];
            for(let k=0; k<numSquares+1; k++) {
                let row = [];
                for(let j=0; j<numSquares+1; j++) {
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
        let blockSize = terrainSize/numSquares;
        for(let i=0; i<numSquares+1; i++) {
            for(let k=0; k<numSquares+1; k++) {
                for(let j=0; j<numSquares+1; j++) {
                    geometry.vertices.push(new T.Vector3(i*blockSize, k*blockSize, j*blockSize));
                }
            }
        }

        let line = numSquares+1;
        let square = (numSquares+1) * (numSquares+1);

        let distanceFromCenter = (a, b, c) => {
            let aDist = Math.abs(a * blockSize - terrainSize/2);
            let bDist = Math.abs(b * blockSize - terrainSize/2);
            let cDist = Math.abs(c * blockSize - terrainSize/2);

            return Math.sqrt(aDist*aDist + bDist*bDist + cDist*cDist);
        }

        for(let i=0; i<numSquares; i++) {
            for(let k=0; k<numSquares; k++) {
                for(let j=0; j<numSquares; j++) {
                    let curr = i + line * k + square * j;
                    if(meshPoints[i][k][j] > threshold && distanceFromCenter(i, k, j) < terrainSize/2) {
                        if(i > 0) {
                            if(meshPoints[i-1][k][j] < threshold || distanceFromCenter(i-1, k, j) >= terrainSize/2) {
                                drawSquare(curr + square, curr, curr + square + line, curr + line);
                            }
                        } 
                        else {
                            drawSquare(curr+square, curr, curr + square + line, curr + line);
                        }
                        if(k > 0) {
                            if(meshPoints[i][k-1][j] < threshold || distanceFromCenter(i, k-1, j) >= terrainSize/2) {
                                drawSquare(curr+square+1, curr + 1, curr+square, curr);
                            }
                        } 
                        else {
                            drawSquare(curr+square+1, curr + 1, curr+square, curr);
                        }
                        if(j > 0) {
                            if(meshPoints[i][k][j-1] < threshold || distanceFromCenter(i, k, j-1) >= terrainSize/2) {
                                drawSquare(curr, curr + 1, curr + line, curr + line + 1);
                            }
                        }
                        else {
                            drawSquare(curr, curr + 1, curr + line, curr + line + 1);
                        }
                        if(meshPoints[i+1][k][j] < threshold || i == numSquares - 1 || distanceFromCenter(i+1, k, j) >= terrainSize/2) {
                            drawSquare(curr + 1, curr + square + 1, curr + line + 1, curr + square + line + 1)
                        }
                        if(meshPoints[i][k+1][j] < threshold || k == numSquares - 1 || distanceFromCenter(i, k+1, j) >= terrainSize/2) {
                            drawSquare(curr + square + line, curr + line, curr + square + line + 1, curr + line + 1)
                        }
                        if(meshPoints[i][k][j+1] < threshold || j == numSquares - 1 || distanceFromCenter(i, k, j+1) >= terrainSize/2) {
                            drawSquare(curr + square + 1, curr + square, curr + square + line + 1, curr + square + line)
                        }
                    }
                }
            }
        }
        return geometry;
        // return new T.BoxGeometry(terrainSize, terrainSize, terrainSize);
    }

    let createTerrain = () => {
        console.log("create");
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
        terrainMesh.position.x = -terrainSize/2;
        terrainMesh.position.y = -terrainSize/2;
        terrainMesh.position.z = -terrainSize/2;

        scene.add(terrainGroup);
    }
    createTerrain();

    camera.position.z = terrainSize;
    camera.position.y = terrainSize;
    camera.position.x = -terrainSize;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let resolutionSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DResolutionSlider"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));
    let scaleSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DScaleSlider"));
    let octavesSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DOctavesSlider"));
    let thresholdSlider = /** @type {HTMLInputElement} */ (document.getElementById("thresholdSlider"));

    let lastSize = numSquares;

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 1 and 999999999 inclusive";
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

    resolutionSlider.oninput = () => {
        let res = Number(resolutionSlider.value);
        switch(res) {
            case 0:
                numSquares = 25
            break;
            case 1:
                numSquares = 40;
            break;
            case 2:
                numSquares = 50;
            break;
            case 3:
                numSquares = 80;
            break;
            case 4:
                numSquares = 100;
            break;
            default:
                numSquares = 100;
        }
        document.getElementById("resNum").innerHTML = numSquares + " x " + numSquares;
    }
    resolutionSlider.onchange = () => {
        let res = Number(resolutionSlider.value);;
        switch(res) {
            case 0:
                numSquares = 25
            break;
            case 1:
                numSquares = 40;
            break;
            case 2:
                numSquares = 50;
            break;
            case 3:
                numSquares = 80;
            break;
            case 4:
                numSquares = 100;
            break;
            default:
                numSquares = 100;
        }
        if(autoAdjustScaleCheck.checked) {
            let ratio = numSquares / lastSize;
            console.log(ratio);
            let curScale = Number(scaleSlider.value);
            let newScale = curScale / ratio;
            scaleSlider.value = newScale;
            perlinNoiseGenerator.setScale(newScale);
            document.getElementById("scaleNum").innerHTML = newScale;
        }
        lastSize = numSquares;
        createTerrain();
    }

    scaleSlider.oninput = () => {
        document.getElementById("scaleNum").innerHTML = Number(scaleSlider.value);
    }
    scaleSlider.onchange = () => {
        perlinNoiseGenerator.setScale(Number(scaleSlider.value));
        createTerrain();
    }
    
    octavesSlider.oninput = () => {
        document.getElementById("octavesNum").innerHTML = Number(octavesSlider.value);
    }
    octavesSlider.onchange = () => {
        perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
        createTerrain();
    }

    thresholdSlider.oninput = () => {
        document.getElementById("thresholdNum").innerHTML = Number(thresholdSlider.value);
    }
    thresholdSlider.onchange = () => {
        threshold = Number(thresholdSlider.value);
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

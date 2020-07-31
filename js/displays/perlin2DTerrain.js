
import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../../libs/helpers.js";
import { PerlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

var numSquares = 100;
var amplitude = 200;
const terrainSize = 400;

var seed = 0;

// let getQuadUV = (x, y, width, height, scaleX = numSquares, scaleY = numSquares) => {
//     return [
//         [
//             new T.Vector2(x / scaleX, y / scaleY),
//             new T.Vector2((x + width) / scaleX, (y + height) / scaleY),
//             new T.Vector2((x + width) / scaleX, y / scaleY)
//         ],
//         [
//             new T.Vector2(x / scaleX, y / scaleY),
//             new T.Vector2(x / scaleX, (y + height) / scaleY),
//             new T.Vector2((x + width) / scaleX, (y + height) / scaleY)
//         ]
//     ]
// }

function drawPerlin2DTerrain() {

    // create surface points
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    perlinNoiseGenerator.setScale(0.06);
    perlinNoiseGenerator.setOctaves(3);

    let meshPoints = [];

    let getPoints = () => {
        meshPoints = [];
        for(let i=0; i<numSquares+1; i++) {
            let column = [];
            for(let k=0; k<numSquares+1; k++) {
                let result = perlinNoiseGenerator.getVal(i, k);
                let val = Math.floor(result * 20) / 20;
                column.push(result*amplitude);
            }
            meshPoints.push(column);
        }
    }

    // create canvas  
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "terrainPerlin2DCanvas"
    ));
    
    // Set up the renderer, which will create the Canvas for us
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    
    // the aspect ratio is set to 1 - since we're making the window 200x200
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 1000);
    let scene = new T.Scene(); 
  
    //lighting
    // let ambientLight = new T.AmbientLight(0xffffff, 0.25);
    // scene.add(ambientLight);
    // let pointLight = new T.PointLight(0xffffff, 1);
    // pointLight.position.set(400, 300, 400);
    // scene.add(pointLight);

    let createTerrain = () => {
        console.log("create");
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }

        // lighting
        let ambientLight = new T.AmbientLight(0xffffff, 0.25);
        scene.add(ambientLight);
        let pointLight = new T.PointLight(0xffffff, 1);
        pointLight.position.set(800, 500, 800);
        scene.add(pointLight);

        let geometry = new T.Geometry();
        let material = new T.MeshLambertMaterial({ color: "lightblue" });

        getPoints();

        for(let i=0; i<numSquares+1; i++) {
            for(let k=0; k<numSquares+1; k++) {
                geometry.vertices.push(new T.Vector3(i*terrainSize/numSquares, meshPoints[i][k], k*terrainSize/numSquares));
            }
        }

        for(let i=0; i<numSquares; i++) {
            for(let k=0; k<numSquares; k++) {
                geometry.faces.push(new T.Face3(i*(numSquares+1)+k+1, (i+1)*(numSquares+1)+k+1, i*(numSquares+1)+k));
                geometry.faces.push(new T.Face3((i+1)*(numSquares+1)+k+1, (i+1)*(numSquares+1)+k, i*(numSquares+1)+k));
            }
        }

        // geometry.faceVertexUvs = [[]];
        geometry.computeFaceNormals();
        // geometry.uvsNeedUpdate = true;

        // for(let i=0; i<numSquares; i++) {
        //     for(let k=0; k<numSquares; k++) {
        //         let face = getQuadUV(k, i, 1, 1);
        //         geometry.faceVertexUvs[0].push(face[0]);
        //         geometry.faceVertexUvs[0].push(face[1]);
        //     }
        // }

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
    let resolutionSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DResolutionSlider"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));
    let scaleSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DScaleSlider"));
    let octavesSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DOctavesSlider"));
    let amplitudeSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise1DAmplitudeSlider"));
    let stepsSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DStepsSlider"));

    let lastSize = numSquares;

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 0 and 999999999 inclusive";
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

    resolutionSlider.oninput = () => {
        let res = Number(resolutionSlider.value);
        switch(res) {
            case 0:
                numSquares = 25
            break;
            case 1:
                numSquares = 50;
            break;
            case 2:
                numSquares = 100;
            break;
            case 3:
                numSquares = 200;
            break;
            case 4:
                numSquares = 400;
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
                numSquares = 50;
            break;
            case 2:
                numSquares = 100;
            break;
            case 3:
                numSquares = 200;
            break;
            case 4:
                numSquares = 400;
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

    amplitudeSlider.oninput = () => {
        document.getElementById("1DAmplitudeTag").innerHTML = Number(amplitudeSlider.value);
    }
    amplitudeSlider.onchange = () => {
        amplitude = Number(amplitudeSlider.value);
        createTerrain();
    }

    // stepsSlider.oninput = () => {
    //     document.getElementById("stepsNum").innerHTML = Number(stepsSlider.value);
    // }
    // stepsSlider.onchange = () => {
    //     numSteps = Number(stepsSlider.value);
    //     createTerrain();
    // }

    // renderer.render(scene, camera);
  
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

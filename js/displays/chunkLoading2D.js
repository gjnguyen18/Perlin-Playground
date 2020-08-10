import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";
import { fillMarchingSquare } from "../tools/marchingSquaresHelper.js";

var size = 50;
var scale = 0.06;
var octaves = 3;
// var numSteps = 2;
var seed = 0;
var res = 2;
var threshold = 0.5;
var interpolatePoints = true;
var autoAdjust = true;
var resOptions = [10, 25, 50, 100, 200, 400];
var chunkSize = 5;
var moveSpeed = 1;
var chunkRange = 5;

let drawChunkLoad2D = () => {

    // setup
    let canvas = document.getElementById("chunkLoading2DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    var playerPosition = [0, 0];

    // let drawGrid = () => {
    //     context.fillStyle = "Green";
    //     for(let i=1; i<length; i+=chunkSize*length/size) {
    //         context.fillRect(i-1, 0, 2, length);
    //         context.fillRect(0, i-1, length, 2);
    //     }
    // }

    let drawPlayer = () => {
        context.beginPath();
        // context.arc(playerPosition[0]+length/2, playerPosition[1]+height/2, 3, 0, Math.PI*2);
        context.arc(length/2, height/2, 3, 0, Math.PI*2);
        context.fillStyle = "Red";
        context.fill();
    }

    let getPlayerChunk = () => {
        let spacing = length/size;
        return [Math.floor( (size/length) * playerPosition[0]/chunkSize),  Math.floor((size/height) * playerPosition[1]/chunkSize)];
    }

    let getNearbyChunks = (currChunk, range) => {
        let nearChunks = [];
        for(let i=currChunk[0]-range; i<=currChunk[0]+range; i++) {
            for(let k=currChunk[1]-range; k<=currChunk[1]+range; k++) {
                if(Math.sqrt((currChunk[0] - i) * (currChunk[0] - i) + (currChunk[1] - k) * (currChunk[1] - k)) <= range) {
                    nearChunks.push([i, k]);
                }
            }
        }
        return nearChunks;
    }

    let drawChunk = (x, y) => {
        context.fillStyle = "Blue";
        let spacing = length/size;
        context.fillRect(x*chunkSize*spacing-playerPosition[0]+length/2, y*chunkSize*spacing-playerPosition[1]+length/2, chunkSize * spacing, chunkSize * spacing);
        for(let i=x*chunkSize; i<x*chunkSize+chunkSize; i++) {
            for(let k=y*chunkSize; k<y*chunkSize+chunkSize; k++) {
                if(i == undefined || k == undefined) {
                    console.log("found undef")
                }
                let values = [
                    perlinNoiseGenerator.getVal(i, k),
                    perlinNoiseGenerator.getVal(i+1, k),
                    perlinNoiseGenerator.getVal(i+1, k+1),
                    perlinNoiseGenerator.getVal(i, k+1)
                ]
                fillMarchingSquare(i*spacing-playerPosition[0]+length/2, k*spacing-playerPosition[1]+length/2, spacing, values, threshold, interpolatePoints, "White", context);
                // context.beginPath();
                // context.arc(i*spacing, k*spacing, 1, 0 , Math.PI*2);
                // context.fillStyle = "blue";
                // context.fill();
            }
        }
    }

    let drawCanvas = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        context.fillStyle = "Black";
        context.fillRect(0, 0, length*2, height);

        // let spacing = length/size;
        // for(let i=0; i<size+1; i++) {
        //     for(let k=0; k<size+1; k++) {
        //         let values = [
        //             perlinNoiseGenerator.getVal(i, k),
        //             perlinNoiseGenerator.getVal(i+1, k),
        //             perlinNoiseGenerator.getVal(i+1, k+1),
        //             perlinNoiseGenerator.getVal(i, k+1)
        //         ]
        //         fillMarchingSquare(i*spacing-playerPosition[0], k*spacing-playerPosition[1], spacing, values, threshold, interpolatePoints, "White", context);
        //         // context.beginPath();
        //         // context.arc(i*spacing, k*spacing, 1, 0 , Math.PI*2);
        //         // context.fillStyle = "blue";
        //         // context.fill();
        //     }
        // }
        let playerChunk = getPlayerChunk();
        let nearChunks = getNearbyChunks(playerChunk, chunkRange);
        // nearChunks.forEach(chunk => {
        //     drawChunk(chunk[0], chunk[1]);
        // });
        // console.log(playerChunk);
        for(let i=0; i<nearChunks.length; i++) {
            drawChunk(nearChunks[i][0], nearChunks[i][1]);
        }

        // drawGrid();
        drawPlayer();
    }

    drawCanvas();
    
    

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

    let lerpCheck = createCheckbox("Linear Interpolation", interpolatePoints);
    let autoAdjustScaleCheck = createCheckbox("Auto Adjust Scale", autoAdjust);

    let resolutionSlider = createSlider("Number of Points", 0, resOptions.length-1, 1, res);
    let scaleSlider = createSlider("Scale", 0.0001, 1, 0.0001, scale);
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
            perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);
            perlinNoiseGenerator.setScale(Number(scaleSlider.value));
            perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
            drawCanvas();
            seedWarning.innerHTML = "";
        }
    }

    lerpCheck.onclick = () => {
        interpolatePoints = lerpCheck.checked;
        drawCanvas();
    }
    autoAdjustScaleCheck.onclick = () => {
        autoAdjust = autoAdjustScaleCheck.checked;
    }

    resolutionSlider[0].oninput = () => {
        let res = resolutionSlider[0].value;
        size = resOptions[res];
        resolutionSlider[1].innerHTML = "Number of Points: " + size + " x " + size;
    }
    resolutionSlider[1].innerHTML = "Number of Points: " + size + " x " + size;
    resolutionSlider[0].onchange = () => {
        let res = resolutionSlider[0].value;
        size = resOptions[res];
        if(autoAdjust) {
            let ratio = size / lastSize;
            let curScale = scaleSlider[0].value;
            scale = curScale / ratio;
            scaleSlider[0].value = scale;
            scaleSlider[1].innerHTML = "Scale: " + scale;
        }
        lastSize = size;
        drawCanvas();
    }

    scaleSlider[0].oninput = () => {
        scaleSlider[1].innerHTML = "Scale: " + scaleSlider[0].value;
    }
    scaleSlider[0].onchange = () => {
        scale = scaleSlider[0].value;
        drawCanvas();
    }

    octavesSlider[0].oninput = () => {
        octavesSlider[1].innerHTML = "Octaves: " + octavesSlider[0].value;
    }
    octavesSlider[0].onchange = () => {
        octaves = octavesSlider[0].value;
        drawCanvas();
    }

    thresholdSlider[0].oninput = () => {
        thresholdSlider[1].innerHTML = "Threshold: " + thresholdSlider[0].value;
        threshold = thresholdSlider[0].value;
        drawCanvas();
    }
    // thresholdSlider[0].onchange = () => {
    //     threshold = thresholdSlider[0].value;
    //     drawCanvas();
    // }
    let lastPos = [playerPosition[0], playerPosition[1]];
    function animate() {
       movePlayer();
       if(lastPos[0] != playerPosition[0] || lastPos[1] != playerPosition[1]) {
           drawCanvas();
           lastPos[0] = playerPosition[0];
           lastPos[1] = playerPosition[1];
           let curChunk = getPlayerChunk();
        //    console.log(curChunk[0] + " " + curChunk[1]);
       }
       requestAnimationFrame(animate);
    }
    animate();
};

onWindowOnload(drawChunkLoad2D);
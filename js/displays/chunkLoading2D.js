import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 50;
var scale = 0.06;
var octaves = 3;
var seed = 0;
var res = 2;
var interpolatePoints = true;
var autoAdjust = true;
var resOptions = [10, 25, 50, 100, 200, 400];
var chunkSize = 10;
var moveSpeed = 1;
var addChunkRange = 4;
var deleteChunkRange = 6;

let drawChunkLoad2D = () => {

    // setup
    let canvas = document.getElementById("chunkLoading2DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    var playerPosition = [0, 0];

    let drawPlayer = () => {
        context.beginPath();
        context.arc(length/2, height/2, 3, 0, Math.PI*2);
        context.fillStyle = "Red";
        context.fill();
    }

    let getPlayerChunk = () => {
        let spacing = length/size;
        return [Math.floor( (size/length) * playerPosition[0]/chunkSize),  Math.floor((size/height) * playerPosition[1]/chunkSize)];
    }

    let updateChunks = (currChunk, closeRange, farRange, chunkMap) => {
        for(let i=currChunk[0]-closeRange; i<=currChunk[0]+closeRange; i++) {
            for(let k=currChunk[1]-closeRange; k<=currChunk[1]+closeRange; k++) {
                let distanceToPlayerChunk = Math.sqrt((currChunk[0] - i) * (currChunk[0] - i) + (currChunk[1] - k) * (currChunk[1] - k));
                if(distanceToPlayerChunk < closeRange && !chunkMap.has([i, k].toString())) {
                    chunkMap.set([i, k].toString(), [i, k]);
                }
            }
        }
        chunkMap.forEach(function(value, key) {
            let distanceToPlayerChunk = Math.sqrt((currChunk[0] - value[0]) * (currChunk[0] - value[0]) + (currChunk[1] - value[1]) * (currChunk[1] - value[1]));
            if(distanceToPlayerChunk >= farRange) {
                chunkMap.delete(value.toString());
            }
        })
    }

    let drawSquare = (x, y, val) => {
        let color = "#";
        for(let i=0; i<3; i++) {
            let grey = (Math.floor(val * 255)).toString(16);
            if(grey.length==1) {
                color += "0" + grey;
            }
            else {
                color += grey;
            }
        }
        context.fillStyle = color;       
        context.fillRect(x, y, length/size, height/size);
    }

    let drawChunk = (x, y) => {
        context.fillStyle = "Blue";
        let spacing = length/size;
        context.fillRect(x*chunkSize*spacing-playerPosition[0]+length/2, y*chunkSize*spacing-playerPosition[1]+length/2, chunkSize * spacing, chunkSize * spacing);
        for(let i=x*chunkSize; i<x*chunkSize+chunkSize; i++) {
            for(let k=y*chunkSize; k<y*chunkSize+chunkSize; k++) {
                let result = perlinNoiseGenerator.getVal(i, k);
                drawSquare(i*spacing-playerPosition[0]+length/2, k*spacing-playerPosition[1]+length/2, result);
            }
        }
    }

    let nearChunks = new Map();
    let drawCanvas = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        context.fillStyle = "Black";
        context.fillRect(0, 0, length*2, height);

        let playerChunk = getPlayerChunk();
        updateChunks(playerChunk, addChunkRange, deleteChunkRange, nearChunks);
        nearChunks.forEach(function(value, key) {
            drawChunk(value[0], value[1]);
        });
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

    let lastPos = [playerPosition[0], playerPosition[1]];
    function animate() {
        // console.time("frame");
        movePlayer();
        if(lastPos[0] != playerPosition[0] || lastPos[1] != playerPosition[1]) {
            drawCanvas();
            lastPos[0] = playerPosition[0];
            lastPos[1] = playerPosition[1];
        }
        // console.timeEnd("frame");
        requestAnimationFrame(animate);
    }
    animate();
};

onWindowOnload(drawChunkLoad2D);
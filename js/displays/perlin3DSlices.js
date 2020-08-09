import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";

var size = 100;
var scale = 0.03;
var octaves = 3;
var level = 0;
var seed = 0;
var numSteps = 30;
var res = 2;
var resOptions = [25, 50, 100, 200, 400];

let drawPerlinNoise3DSlices = () => {
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);

    let canvas = document.getElementById("perlin3DSlicesCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height;

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

    let drawCanvas = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);
        for(let i=0; i<size; i++) {
            for(let k=0; k<size; k++) {
                let result = perlinNoiseGenerator.getVal(i, level, k);
                let val = Math.floor(result * numSteps) / numSteps;
                drawSquare(i*length/size, k*height/size, val);
            }
        }
    }

    drawCanvas();
    


    // - - - - - - - - - - - - - INPUTS - - - - - - - - - - - - -



    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));

    let resolutionSlider = createSlider("Resolution", 0, resOptions.length-1, 1, res);
    let scaleSlider = createSlider("Scale", 0.0001, 0.4, 0.0001, scale);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);
    let numStepsSlider = createSlider("Number of Steps", 1, 100, 1, numSteps);
    let levelSlider = createSlider("Level", 0, size, 1, level);

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
            drawCanvas();
            seedWarning.innerHTML = "";
        }
    }

    resolutionSlider[0].oninput = () => { 
        let res = resolutionSlider[0].value;
        size = resOptions[res];
        resolutionSlider[1].innerHTML = "Resolution: " + size + " x " + size;
    }
    resolutionSlider[1].innerHTML = "Resolution: " + size + " x " + size;
    resolutionSlider[0].onchange = () => {
        let res = resolutionSlider[0].value;
        size = resOptions[res];
        if(autoAdjustScaleCheck.checked) {
            let ratio = size / lastSize;
            let curScale = scaleSlider[0].value;
            scale = curScale / ratio;
            scaleSlider[0].value = scale;
            scaleSlider[1].innerHTML = "Scale: " + scale;
            levelSlider[0].setAttribute("max", size);
            level *= ratio;
            level = level >= size ? size : level;
            levelSlider[1].innerHTML = "Level: " + level;
            levelSlider[0].value = level;
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

    numStepsSlider[0].oninput = () => {
        numStepsSlider[1].innerHTML = "Number of Steps: " + numStepsSlider[0].value;
    }
    numStepsSlider[0].onchange = () => {
        numSteps = numStepsSlider[0].value;
        drawCanvas();
    }
    
    levelSlider[0].oninput = () => {
        levelSlider[1].innerHTML = "Level: " + levelSlider[0].value;
        level = levelSlider[0].value;
        drawCanvas();
    }
};

onWindowOnload(drawPerlinNoise3DSlices);
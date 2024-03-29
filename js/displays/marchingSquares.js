import { onWindowOnload, createSlider, createCheckbox } from "../tools/helpers.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";
import { fillMarchingSquare } from "../tools/marchingSquaresHelper.js";

var size = 50;
var scale = 0.06;
var octaves = 3;
var seed = 0;
var res = 2;
var threshold = 0.5;
var interpolatePoints = true;
var autoAdjust = true;
var resOptions = [10, 25, 50, 100, 200, 400];

let drawMarchingSquaresTerrain = () => {
    // setup
    let canvas = document.getElementById("marchingSquaresCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width/2;
    let height = canvas.height;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

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

        context.fillStyle = "Black";
        context.fillRect(0, 0, length*2, height);

        let spacing = length/size;
        for(let i=0; i<size+1; i++) {
            for(let k=0; k<size+1; k++) {
                let values = [
                    perlinNoiseGenerator.getVal(i, k),
                    perlinNoiseGenerator.getVal(i+1, k),
                    perlinNoiseGenerator.getVal(i+1, k+1),
                    perlinNoiseGenerator.getVal(i, k+1)
                ]
                fillMarchingSquare(i*spacing, k*spacing, spacing, values, threshold, interpolatePoints, "White", context);
            }
        }

        for(let i=0; i<size+1; i++) {
            for(let k=0; k<size+1; k++) {
                let result = perlinNoiseGenerator.getVal(i, k);
                let val = result > threshold ? 1 : 0;
                drawSquare(i*spacing+length, k*spacing, val)
            }
        }

        context.fillStyle = "#14c94b";
        context.fillRect(length-2, 0, 4, height)
    }

    drawCanvas();



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
};

onWindowOnload(drawMarchingSquaresTerrain);
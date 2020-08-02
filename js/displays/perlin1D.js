import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { NoiseGenerator1D } from "./../noiseGenerators/noiseGenerator1D.js"

var numPoints = 200;
var amplitude = 200;
var scale = 0.02;
var octaves = 3;
var seed = 0;

let drawNoiseLine = () => {

    // setup
    let canvas = document.getElementById("perlin1DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height/2;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let generator = new NoiseGenerator1D(seed);

    let styleAndDraw = (fillColor, strokeColor, strokeThickness) => {
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeThickness;
        context.stroke();
    }

    let drawCanvas = () => {
        generator.setScale(scale);
        generator.setOctaves(octaves);
        
        context.fillStyle = "White";
        context.fillRect(0,0,length,height);

        // random line
        context.beginPath();
        context.moveTo(-50, height/2);
        for(let i=0; i<numPoints+1; i++) {
            let curVal = Math.random();
            context.lineTo(i*length/(numPoints-1), height * 0.5 + curVal * amplitude - amplitude / 2);
        }

        context.lineTo(length+50, height/2);
        context.lineTo(length+50, height+50);
        context.lineTo(-50, height+50);
        context.closePath();

        styleAndDraw("LightBlue", "Blue", 1);
        
        context.fillStyle = "White";
        context.fillRect(0,height,length,height);

        // 1d noise

        context.beginPath();
        context.moveTo(-50, height/2 + height);
        for(let i=0; i<numPoints+1; i++) {
            context.lineTo(i*length/(numPoints-1), height * 1.5 + generator.getVal(i) * amplitude - amplitude / 2);
        }

        context.lineTo(length+50, height/2 + height);
        context.lineTo(length+50, height+50 + height);
        context.lineTo(-50, height+50 + height);
        context.closePath();

        styleAndDraw("LightBlue", "Blue", 1);
    }

    drawCanvas();

    let lastSize = numPoints;

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));

    let numPointsSlider = createSlider("Number of Points", 5, 400, 1, numPoints);
    let scaleSlider = createSlider("Scale", 0.0001, 1, 0.0001, scale);
    let amplitudeSlider = createSlider("Amplitude", 0, 350, 1, amplitude);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 0 and 999,999,999 inclusive";
        }
        else {
            seed = Number(seedBox.value)
            generator = new NoiseGenerator1D(seed);
            generator.setScale(scaleSlider);
            generator.setOctaves(octaves);
            drawCanvas();
            seedWarning.innerHTML = "";
        }
    }

    numPointsSlider[0].oninput = () => {
        numPointsSlider[1].innerHTML = "Number of Points: " + numPointsSlider[0].value;
    }
    numPointsSlider[0].onchange = () => {
        numPoints = numPointsSlider[0].value;
        if(autoAdjustScaleCheck.checked) {
            let ratio = numPoints / lastSize;
            let curScale = scaleSlider[0].value;
            scale = curScale / ratio;
            generator.setScale(scale);

            scaleSlider[0].value = scale;
            scaleSlider[1].innerHTML = "Scale: " + scale;
        }
        lastSize = numPoints;
        drawCanvas();
    }

    scaleSlider[0].oninput = () => {
        scaleSlider[1].innerHTML = "Scale: " + scaleSlider[0].value;
    }
    scaleSlider[0].onchange = () => {
        scale = scaleSlider[0].value;
        drawCanvas();
    }

    amplitudeSlider[0].oninput = () => {
        amplitudeSlider[1].innerHTML = "Amplitude: " + amplitudeSlider[0].value;
    }
    amplitudeSlider[0].onchange = () => {
        amplitude = amplitudeSlider[0].value;
        drawCanvas();
    }

    octavesSlider[0].oninput = () => {
        octavesSlider[1].innerHTML = "Octaves: " + octavesSlider[0].value;
    }
    octavesSlider[0].onchange = () => {
        octaves = octavesSlider[0].value;
        drawCanvas();
    }
};

onWindowOnload(drawNoiseLine);
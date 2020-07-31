import { onWindowOnload } from "../../libs/helpers.js";
import { NoiseGenerator1D } from "./../noiseGenerators/noiseGenerator1D.js"

var numPoints = 400;
var amplitude = 200;
var seed = 0;

let drawNoiseLine = () => {

    let styleAndDraw = (fillColor, strokeColor, strokeThickness) => {
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeThickness;
        context.stroke();
    }

    // gets canvas and context
    let canvas = document.getElementById("perlin1DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height/2;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let generator = new NoiseGenerator1D(seed);

    let drawCanvas = () => {
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

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("1DseedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("1DseedWarning"));
    let numPointsSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise1DNumPointsSlider"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("1DAutoAdjustScaleCheck"));
    let scaleSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise1DScaleSlider"));
    let amplitudeSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise1DAmplitudeSlider"));
    let octavesSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise1DOctavesSlider"));

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 1 and 999999999 inclusive";
        }
        else {
            seed = Number(seedBox.value)
            generator = new NoiseGenerator1D(seed);
            generator.setScale(Number(scaleSlider.value));
            generator.setOctaves(Number(octavesSlider.value));
            drawCanvas();
            seedWarning.innerHTML = "";
        }
    }

    numPointsSlider.oninput = () => {
        document.getElementById("1DNumPointsTag").innerHTML = Number(numPointsSlider.value);
    }
    numPointsSlider.onchange = () => {
        numPoints = Number(numPointsSlider.value);
        if(autoAdjustScaleCheck.checked) {
            let ratio = numPoints / lastSize;
            let curScale = Number(scaleSlider.value);
            let newScale = curScale / ratio;
            scaleSlider.value = newScale;
            generator.setScale(newScale);
            document.getElementById("1DScaleTag").innerHTML = newScale;
        }
        lastSize = numPoints;
        drawCanvas();
    }

    scaleSlider.oninput = () => {
        document.getElementById("1DScaleTag").innerHTML = Number(scaleSlider.value);
    }
    scaleSlider.onchange = () => {
        generator.setScale(Number(scaleSlider.value));
        drawCanvas();
    }

    amplitudeSlider.oninput = () => {
        document.getElementById("1DAmplitudeTag").innerHTML = Number(amplitudeSlider.value);
    }
    amplitudeSlider.onchange = () => {
        amplitude = Number(amplitudeSlider.value);
        drawCanvas();
    }

    octavesSlider.oninput = () => {
        document.getElementById("1DOctavesTag").innerHTML = Number(octavesSlider.value);
    }
    octavesSlider.onchange = () => {
        generator.setOctaves(Number(octavesSlider.value));
        drawCanvas();
    }
};

onWindowOnload(drawNoiseLine);
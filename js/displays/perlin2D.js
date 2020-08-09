import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { SimpleNoiseGenerator2D } from "./../noiseGenerators/simpleNoiseGenerator2D.js";
import { PerlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 100;
var scale = 0.02;
var octaves = 3;
var numSteps = 20;
var seed = 0;
var res = 2;
var resOptions = [25, 50, 100, 200, 400];

let drawPerlinNoise2D = () => {

    // setup
    let canvas = document.getElementById("perlin2DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width/2;
    let height = canvas.height/2;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);
    let simpleNoiseGenerator = new SimpleNoiseGenerator2D(seed);

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
        simpleNoiseGenerator.setScale(scale);
        simpleNoiseGenerator.setOctaves(octaves);
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        for(let i=0; i<size; i++) {
            for(let k=0; k<size; k++) {
                let result = perlinNoiseGenerator.getVal(i, k);
                let val = Math.floor(result * numSteps) / numSteps;

                // random value
                drawSquare(i*length/size, k*height/size, Math.random());

                // simple noise
                drawSquare(i*length/size+length, k*height/size, simpleNoiseGenerator.getVal(i, k));

                // perlin noise
                drawSquare(i*length/size, k*height/size+height, result);

                // perlin noise with levels
                drawSquare(i*length/size+length, k*height/size+height, val);
            }
        }
    }

    drawCanvas();



    // - - - - - - - - - - - - - INPUTS - - - - - - - - - - - - -

    

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));

    let resolutionSlider = createSlider("Resolution", 0, resOptions.length-1, 1, res);
    let scaleSlider = createSlider("Scale", 0.0001, 1, 0.0001, scale);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);
    let numStepsSlider = createSlider("Number of Steps", 1, 100, 1, numSteps);

    let lastSize = size;

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 0 and 999,999,999 inclusive";
        }
        else {
            seed = Number(seedBox.value)
            perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);
            simpleNoiseGenerator = new SimpleNoiseGenerator2D(seed);
            perlinNoiseGenerator.setScale(Number(scaleSlider.value));
            perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
            simpleNoiseGenerator.setScale(Number(scaleSlider.value));
            simpleNoiseGenerator.setOctaves(Number(octavesSlider.value));
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
};

onWindowOnload(drawPerlinNoise2D);
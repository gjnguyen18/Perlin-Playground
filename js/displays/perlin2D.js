import { onWindowOnload } from "../../libs/helpers.js";
import { SimpleNoiseGenerator2D } from "./../noiseGenerators/simpleNoiseGenerator2D.js";
import { PerlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 200;
var scale = 0.02;
var numSteps = 20;
var seed = 0;

let drawPerlinNoise2D = () => {

    // gets canvas and context
    let canvas = document.getElementById("perlin2DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width/2;
    let height = canvas.height/2;

    context.fillStyle = "White";
    context.fillRect(0,0,length*2,height*2);

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

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);
    let simpleNoiseGenerator = new SimpleNoiseGenerator2D(seed);

    let drawCanvas = () => {
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

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let resolutionSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DResolutionSlider"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));
    let scaleSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DScaleSlider"));
    let octavesSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DOctavesSlider"));
    let stepsSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DStepsSlider"));

    let lastSize = size;

    seedBox.value = seed;
    seedBox.onchange = () => {
        if(Number(seedBox.value) < 0 || Number(seedBox.value) > 999999999) {
            seedWarning.innerHTML = "Seed must be between 0 and 999999999 inclusive";
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

    resolutionSlider.oninput = () => {
        let res = Number(resolutionSlider.value);
        switch(res) {
            case 0:
                size = 25
            break;
            case 1:
                size = 50;
            break;
            case 2:
                size = 100;
            break;
            case 3:
                size = 200;
            break;
            case 4:
                size = 400;
            break;
            default:
                size = 200;
        }
        document.getElementById("resNum").innerHTML = size + " x " + size;
    }
    resolutionSlider.onchange = () => {
        let res = Number(resolutionSlider.value);;
        switch(res) {
            case 0:
                size = 25
            break;
            case 1:
                size = 50;
            break;
            case 2:
                size = 100;
            break;
            case 3:
                size = 200;
            break;
            case 4:
                size = 400;
            break;
            case 5:
                size = 800;
            break;
            default:
                size = 200;
        }
        if(autoAdjustScaleCheck.checked) {
            let ratio = size / lastSize;
            console.log(ratio);
            let curScale = Number(scaleSlider.value);
            let newScale = curScale / ratio;
            scaleSlider.value = newScale;
            perlinNoiseGenerator.setScale(newScale);
            simpleNoiseGenerator.setScale(newScale);
            document.getElementById("scaleNum").innerHTML = newScale;
        }
        lastSize = size;
        drawCanvas();
    }

    scaleSlider.oninput = () => {
        document.getElementById("scaleNum").innerHTML = Number(scaleSlider.value);
    }
    scaleSlider.onchange = () => {
        perlinNoiseGenerator.setScale(Number(scaleSlider.value));
        simpleNoiseGenerator.setScale(Number(scaleSlider.value));
        drawCanvas();
    }
    
    octavesSlider.oninput = () => {
        document.getElementById("octavesNum").innerHTML = Number(octavesSlider.value);
    }
    octavesSlider.onchange = () => {
        perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
        simpleNoiseGenerator.setOctaves(Number(octavesSlider.value));
        drawCanvas();
    }

    stepsSlider.oninput = () => {
        document.getElementById("stepsNum").innerHTML = Number(stepsSlider.value);
    }
    stepsSlider.onchange = () => {
        numSteps = Number(stepsSlider.value);
        drawCanvas();
    }
};

onWindowOnload(drawPerlinNoise2D);
import { onWindowOnload } from "../../libs/helpers.js";
import { SimpleNoiseGenerator2D } from "./../noiseGenerators/simpleNoiseGenerator2D.js";
import { PerlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 200;
var numSteps = 20;

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

    let perlinNoiseGenerator = new PerlinNoiseGenerator2D();
    let simpleNoiseGenerator = new SimpleNoiseGenerator2D();

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

    let scaleSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DScaleSlider"));
    scaleSlider.onchange = () => {
        perlinNoiseGenerator.setScale(Number(scaleSlider.value));
        simpleNoiseGenerator.setScale(Number(scaleSlider.value));
        drawCanvas();
    }
    
    let octavesSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DOctavesSlider"));
    octavesSlider.onchange = () => {
        perlinNoiseGenerator.setOctaves(Number(octavesSlider.value));
        simpleNoiseGenerator.setOctaves(Number(octavesSlider.value));
        drawCanvas();
    }

    let stepsSlider = /** @type {HTMLInputElement} */ (document.getElementById("noise2DStepsSlider"));
    stepsSlider.onchange = () => {
        numSteps = Number(stepsSlider.value);
        drawCanvas();
    }
};

onWindowOnload(drawPerlinNoise2D);
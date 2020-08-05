import { onWindowOnload, createSlider } from "../tools/helpers.js";
import { SimpleNoiseGenerator2D } from "../noiseGenerators/simpleNoiseGenerator2D.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";

var size = 50;
var scale = 0.1;
var octaves = 3;
// var numSteps = 2;
var seed = 0;
var res = 1;
var threshold = 0.5;
var interpolatePoints = false;
var resOptions = [25, 50, 100, 200, 400];

let drawPerlinNoise2D = () => {

    // setup
    let canvas = document.getElementById("marchingSquaresCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height;

    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    // let drawSquare = (x, y, val) => {
    //     let color = "#";
    //     for(let i=0; i<3; i++) {
    //         let grey = (Math.floor(val * 255)).toString(16);
    //         if(grey.length==1) {
    //             color += "0" + grey;
    //         }
    //         else {
    //             color += grey;
    //         }
    //     }
    //     context.fillStyle = color;       
    //     context.fillRect(x, y, length/size, height/size);
    // }

    // corners: 0 - top left, 1 - top right, 2 - bottom right, 3 - bottom left
    let styleAndDraw = (fillColor, strokeColor, strokeThickness) => {
        context.fillStyle = fillColor;
        context.fill();
        // context.strokeStyle = strokeColor;
        // context.lineWidth = strokeThickness;
        // context.stroke();
    }

    let lerp = (a, b, t) => {
        return a + (b - a) * t;
    }

    let getMidPoint = (p1, p2) => {
        return [lerp(p1[0], p2[0], .5), lerp(p1[1], p2[1], .5)];
    }

    let fillSquare = (x, y) => {

        let v00 = perlinNoiseGenerator.getVal(x, y);
        let v10 = perlinNoiseGenerator.getVal(x+1, y);
        let v01 = perlinNoiseGenerator.getVal(x, y+1);
        let v11 = perlinNoiseGenerator.getVal(x+1, y+1);

        let corners = [];
        corners.push([0, 0, v00]);
        corners.push([1, 0, v10]);
        corners.push([1, 1, v11]);
        corners.push([0, 1, v01]);

        let points = [];

        for(let i=0; i<4; i++) {
            if(interpolatePoints) {

            } else {
                let val1 = corners[i][2] > threshold ? 1 : 0;
                let val2 = corners[(i+1) % 4][2] > threshold ? 1 : 0;

                if(val1 == 1) {
                    points.push(corners[i]);
                }
                if(val1 != val2) {
                    points.push(getMidPoint(corners[i], corners[(i+1) % 4]));
                }
            }
        }

        if(points.length == 0) {
            return;
        }
        let spacing = length/size;
        context.moveTo(points[points.length-1][0]+x*spacing, points[points.length-1][1]+y*spacing)
        context.beginPath();
        for(let i=0; i<points.length; i++) {
            context.lineTo((points[i][0] + x) * spacing, (points[i][1] + y) * spacing);
        }
        context.closePath();
        styleAndDraw("Black", "Blue", 0);

    }

    let drawCanvas = () => {
        perlinNoiseGenerator.setScale(scale);
        perlinNoiseGenerator.setOctaves(octaves);

        context.fillStyle = "White";
        context.fillRect(0, 0, length, height);

        for(let i=0; i<size+1; i++) {
            for(let k=0; k<size+1; k++) {
                fillSquare(i, k);

                // context.fillStyle = "Blue";
                // let spacing = length/size;
                // context.beginPath();
                // context.arc(i*spacing, k*spacing, 1, 0, Math.PI * 2);
                // context.fill();
                // context.closePath();

                // if(perlinNoiseGenerator.getVal(i, k) > threshold) {
                //     context.fillStyle = "Red";
                //     context.beginPath();
                //     context.arc(i*spacing, k*spacing, 1, 0, Math.PI * 2);
                //     context.fill();
                //     context.closePath();
                // }
            }
        }
    }

    drawCanvas();

    let seedBox = /** @type {HTMLInputElement} */ (document.getElementById("seedBox"));
    let seedWarning = /** @type {HTMLInputElement} */ (document.getElementById("seedWarning"));
    let autoAdjustScaleCheck = /** @type {HTMLInputElement} */ (document.getElementById("autoAdjustScaleCheck"));

    let resolutionSlider = createSlider("Resolution", 0, resOptions.length-1, 1, res);
    let scaleSlider = createSlider("Scale", 0.0001, 1, 0.0001, scale);
    let octavesSlider = createSlider("Octaves", 1, 10, 1, octaves);
    let thresholdSlider = createSlider("Threshold", 0, 1, 0.001, threshold);
    // let numStepsSlider = createSlider("Number of Steps", 1, 100, 1, numSteps);

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

    thresholdSlider[0].oninput = () => {
        thresholdSlider[1].innerHTML = "Threshold: " + thresholdSlider[0].value;
        threshold = thresholdSlider[0].value;
        drawCanvas();
    }
    // thresholdSlider[0].onchange = () => {
    //     threshold = thresholdSlider[0].value;
    //     drawCanvas();
    // }

    // numStepsSlider[0].oninput = () => {
    //     numStepsSlider[1].innerHTML = "Number of Steps: " + numStepsSlider[0].value;
    // }
    // numStepsSlider[0].onchange = () => {
    //     numSteps = numStepsSlider[0].value;
    //     drawCanvas();
    // }
};

onWindowOnload(drawPerlinNoise2D);
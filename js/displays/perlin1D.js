import { onWindowOnload } from "../../libs/helpers.js";
import { NoiseGenerator1D } from "./../noiseGenerators/noiseGenerator1D.js"

const numPoints = 400;

let drawPerlinNoiseLine = () => {

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

    context.fillStyle = "White";
    context.fillRect(0,0,length,height);

    // random line
    context.beginPath();
    context.moveTo(-50, height/2);
    for(let i=0; i<numPoints+1; i++) {
        context.lineTo(i*length/(numPoints-1), height-(Math.random()*height*.6-height*.3)-height/2);
    }

    context.lineTo(length+50, height/2);
    context.lineTo(length+50, height+50);
    context.lineTo(-50, height+50);
    context.closePath();

    styleAndDraw("LightBlue", "Blue", 1);

    context.fillStyle = "White";
    context.fillRect(0,height,length,height);

    // 1d noise
    let points = [];

    let generator = new NoiseGenerator1D();
    for(let i=0; i<numPoints; i++) {
        points.push(generator.getVal(i)*height*.3);
    }

    context.beginPath();
    context.moveTo(-50, height/2 + height);
    for(let i=0; i<numPoints+1; i++) {
        context.lineTo(i*length/(numPoints-1), height-points[i]-(height/2) + height);
    }

    context.lineTo(length+50, height/2 + height);
    context.lineTo(length+50, height+50 + height);
    context.lineTo(-50, height+50 + height);
    context.closePath();

    styleAndDraw("LightBlue", "Blue", 1);
};

onWindowOnload(drawPerlinNoiseLine);
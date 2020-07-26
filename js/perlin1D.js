import { onWindowOnload } from "../libs/helpers.js";
import { noiseGenerator1D } from "./noiseGenerator1D.js"

const numPoints = 1200;
const scale = 1;
const amplitude = 100;

let drawPerlinNoiseLine = () => {

    let styleAndDraw = (fillColor, strokeColor, strokeThickness) => {
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeThickness;
        context.stroke();
    }

    let drawDot = (x, y, r, color) => {
        context.beginPath();
        context.arc(x, y, 2, 0, Math.PI*2);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }

    // gets canvas and context
    let canvas = document.getElementById("perlin1DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height;

    context.fillStyle = "White";
    context.fillRect(0,0,length,height);

    let points = [];

    let generator = new noiseGenerator1D();
    for(let i=0; i<numPoints; i++) {
        points.push(generator.getVal(i));
    }

    context.beginPath();
    context.moveTo(-50, 300);
    for(let i=0; i<numPoints+1; i++) {
        context.lineTo(i*length/(numPoints-1), 600-points[i]-300);
    }

    context.lineTo(length+50, 300);
    context.lineTo(length+50, height+50);
    context.lineTo(-50, height+50);
    context.closePath();

    styleAndDraw("LightBlue", "Blue", 1);

    // for(let i=0; i<numPoints+1; i++) {
    //     drawDot(i*length/(numPoints-1), points[i]+300, 4, "Black");
    // }
};

onWindowOnload(drawPerlinNoiseLine);
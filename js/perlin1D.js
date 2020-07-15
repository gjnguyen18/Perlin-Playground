import { onWindowOnload } from "../libs/helpers.js";

let drawPerlinNoiseLine = () => {

    let styleAndDraw = (fillColor, strokeColor, strokeThickness) => {
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeThickness;
        context.stroke();
    }

    // gets canvas and context
    let canvas = document.getElementById("canvas1");
    let context = canvas.getContext('2d');

    context.fillStyle = "White";
    context.fillRect(0,0,600,600);

    let length = canvas.width;
    let numPoints = 50;

    let points = [];

    for(let i=0; i<numPoints; i++) {
        points.push(Math.random()*100-50);
    }

    context.beginPath();
    context.moveTo(0, 300);
    for(let i=0; i<numPoints+1; i++) {
        context.lineTo(i*length/(numPoints-1), points[i]+300);
    }
    context.lineTo(600, 600);
    context.lineTo(0, 600);
    context.closePath();

    styleAndDraw("LightBlue", "black", 3);
};

onWindowOnload(drawPerlinNoiseLine);
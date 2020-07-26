import { onWindowOnload } from "../libs/helpers.js";
import { noiseGenerator2DSimple } from "./noiseGenerator2DSimple.js";

const size = 600;

let drawPerlinNoise2DBasic = () => {

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
    let canvas = document.getElementById("perlin2DSimpleCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width;
    let height = canvas.height;

    context.fillStyle = "White";
    context.fillRect(0,0,length,height);

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

    let generator = new noiseGenerator2DSimple();

    for(let i=0; i<size; i++) {
        for(let k=0; k<size; k++) {
            drawSquare(i*length/size, k*height/size, generator.getVal(i, k));
        }
    }
};

onWindowOnload(drawPerlinNoise2DBasic);
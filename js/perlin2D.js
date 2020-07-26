import { onWindowOnload } from "../libs/helpers.js";
import { perlinNoiseGenerator2D } from "./perlinNoiseGenerator2D.js";

const size = 300;

let drawPerlinNoise2D = () => {

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
    let canvas = document.getElementById("perlin2DCanvas");
    let context = canvas.getContext('2d');

    let length = canvas.width/2;
    let height = canvas.height;

    context.fillStyle = "White";
    context.fillRect(0,0,length*2,height);

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

    let generator = new perlinNoiseGenerator2D();

    for(let i=0; i<size; i++) {
        for(let k=0; k<size; k++) {
            let result = generator.getVal(i, k);
            let val = 0;
            for(let i=0; i<20; i++) {
                if(result>i*.05) {
                    val += 0.05;
                }
            }
            drawSquare(i*length/size, k*height/size, result);
            drawSquare(i*length/size+length, k*height/size, val);
        }
    }
};

onWindowOnload(drawPerlinNoise2D);
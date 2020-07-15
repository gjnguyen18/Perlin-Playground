// JavaScript file to be filled in by the student for Box 3-1
// we'll give you something to get started...
import { onWindowOnload } from "../libs/helpers.js";

let startTestJS = () => {

    // gets canvas and context
    let canvas = document.getElementById("canvas1");
    let context = canvas.getContext('2d');

    // draws shape 1 (circle)
    let drawShape1 = (xPos, yPos, diameter, fillColor, strokeColor, strokeThickness) => {
        context.beginPath();
        context.arc(xPos+diameter/2, yPos+diameter/2, diameter/2, 0, Math.PI * 2); // full 360 arc is a circle
        styleAndDraw(fillColor, strokeColor, strokeThickness)
    }
    
    // draws shape 2 (triangle with top tip at center of length)
    let drawShape2 = (xPos, yPos, length, height, fillColor, strokeColor, strokeThickness) => {
        context.beginPath();
        context.moveTo(xPos+length/2,yPos);
        context.lineTo(xPos+length,yPos+height)
        context.lineTo(xPos,yPos+height)
        context.closePath();
        styleAndDraw(fillColor, strokeColor, strokeThickness)
    }
    
    // draws shape 3 (capsule)
    let drawShape3 = (xPos, yPos, length, height, fillColor, strokeColor, strokeThickness) => {
        context.beginPath();
        context.arc(xPos+height/2, yPos+height/2, height/2, Math.PI * .5, Math.PI * 1.5); // left semicircle
        context.arc(xPos+length-height/2, yPos+height/2, height/2, Math.PI * 1.5, Math.PI * 2.5); // right semicircle and will connect from previous halfcircle
        context.lineTo(xPos+height/2,yPos+height) // closes the shape
        styleAndDraw(fillColor, strokeColor, strokeThickness)
    }
    
    // draws shape 4 (sawtooth)
    let drawShape4 = (xPos, yPos, length, height, fillColor, strokeColor, strokeThickness) => {
        context.beginPath();
        context.moveTo(xPos,yPos+height/2);
        context.lineTo(xPos+length/4,yPos)
        context.lineTo(xPos+length/2,yPos+height/2)
        context.lineTo(xPos+length*.75,yPos)
        context.lineTo(xPos+length,yPos+height/2)
        context.lineTo(xPos+length,yPos+height)
        context.lineTo(xPos,yPos+height)
        context.closePath();
        context.closePath();
        styleAndDraw(fillColor, strokeColor, strokeThickness)
    }
    
    // helper function for setting the fill and stroke and drawing
    let styleAndDraw = (fillColor, strokeColor, strokeThickness) => {
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = strokeColor;
        context.lineWidth = strokeThickness;
        context.stroke();
    }

    // draws all the shapes
    drawShape1(10, 10, 60, 'Orchid', 'Purple', 5);
    drawShape2(10, 110, 60, 50, 'Orange', 'DarkGoldenRod', 5)
    drawShape3(100, 10, 120, 60, 'Pink', 'Maroon', 5)
    drawShape4(100, 100, 120, 60, 'Grey', 'Black', 5)
};

onWindowOnload(startTestJS);
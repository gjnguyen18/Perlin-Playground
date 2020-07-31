
import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../../libs/helpers.js";
import { PerlinNoiseGenerator3D } from "../noiseGenerators/perlinNoiseGenerator3D.js";
import { DoubleSide } from "../../libs/CS559-THREE/build/three.module.js";

var numSquares = 100;
var threshold = 0.6;
const terrainSize = 400;

var seed = 0;

function drawPerlin3D() {

    // create surface points
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator3D(seed);

    perlinNoiseGenerator.setScale(0.06);
    perlinNoiseGenerator.setOctaves(1);

    let meshPoints = [];

    // create canvas  
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "3DTerrainCanvas"
    ));
    
    // Set up the renderer, which will create the Canvas for us
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    
    // the aspect ratio is set to 1 - since we're making the window 200x200
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 2000);
    let scene = new T.Scene(); 

    let createLights = () => {
        let ambientLight = new T.AmbientLight(0xffffff, 0.25);
        scene.add(ambientLight);
        let pointLight = new T.PointLight(0xffffff, 1, 2000);
        pointLight.position.set(800, 500, 800);
        scene.add(pointLight);
    }

    let getPoints = () => {
        meshPoints = [];
        for(let i=0; i<numSquares+1; i++) {
            let column = [];
            for(let k=0; k<numSquares+1; k++) {
                let row = [];
                for(let j=0; j<numSquares+1; j++) {
                    let result = perlinNoiseGenerator.getVal(i, k, j);
                    let val = Math.floor(result * 20) / 20;
                    row.push(result);
                }
                column.push(row);
            }
            meshPoints.push(column);
        }
    }

    let createGeometry = () => {
        let geometry = new T.Geometry();
        let drawSquare = (p1, p2, p3, p4) => {
            geometry.faces.push(new T.Face3(p1, p2, p4));
            geometry.faces.push(new T.Face3(p1, p4, p3));
        }
        let blockSize = terrainSize/numSquares;
        for(let i=0; i<numSquares+1; i++) {
            for(let k=0; k<numSquares+1; k++) {
                for(let j=0; j<numSquares+1; j++) {
                    geometry.vertices.push(new T.Vector3(i*blockSize, k*blockSize, j*blockSize));
                }
            }
        }

        let line = numSquares+1;
        let square = (numSquares+1) * (numSquares+1);

        // meshPoints[0][0][0] = 1;

        for(let i=0; i<numSquares; i++) {
            for(let k=0; k<numSquares; k++) {
                for(let j=0; j<numSquares; j++) {
                    let curr = i + line * k + square * j;
                    if(meshPoints[i][k][j] > threshold) {
                        if(i > 0) {
                            if(meshPoints[i-1][k][j] < threshold) {
                                drawSquare(curr + square, curr, curr + square + line, curr + line);
                            }
                        } 
                        else {
                            drawSquare(curr+square, curr, curr + square + line, curr + line);
                        }
                        if(k > 0) {
                            if(meshPoints[i][k-1][j] < threshold) {
                                drawSquare(curr+square+1, curr + 1, curr+square, curr);
                            }
                        } 
                        else {
                            drawSquare(curr+square+1, curr + 1, curr+square, curr);
                        }
                        if(j > 0) {
                            if(meshPoints[i][k][j-1] < threshold) {
                                drawSquare(curr, curr + 1, curr + line, curr + line + 1);
                            }
                        }
                        else {
                            drawSquare(curr, curr + 1, curr + line, curr + line + 1);
                        }
                        if(meshPoints[i+1][k][j] < threshold || i == numSquares - 1) {
                            drawSquare(curr + 1, curr + square + 1, curr + line + 1, curr + square + line + 1)
                        }
                        if(meshPoints[i][k+1][j] < threshold || k == numSquares - 1) {
                            drawSquare(curr + square + line, curr + line, curr + square + line + 1, curr + line + 1)
                        }
                        if(meshPoints[i][k][j+1] < threshold || j == numSquares - 1) {
                            drawSquare(curr + square + 1, curr + square, curr + square + line + 1, curr + square + line)
                        }
                    }
                }
            }
        }
        return geometry;
        // return new T.BoxGeometry(terrainSize, terrainSize, terrainSize);
    }

    let createTerrain = () => {
        console.log("create");
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }

        createLights();

        // let outerGroup = new T.Group();
        let terrainGroup = new T.Group();

        getPoints();
        let material = new T.MeshLambertMaterial({ color: "lightblue" })
        let geometry = createGeometry();
        geometry.computeFaceNormals();

        let terrainMesh = new T.Mesh(geometry, material);

        // for(let i=0; i<numSquares+1; i++) {
        //     for(let k=0; k<numSquares+1; k++) {
        //         for(let j=0; j<numSquares+1; j++) {
        //             // geometry.vertices.push(new T.Vector4(i*terrainSize/numSquares, k*terrainSize/numSquares, j*terrainSize/numSquares, meshPoints[i][k][j]));
        //             if(meshPoints[i][k][j] > threshold) { 
        //                 let blockHeight = terrainSize / numSquares;
        //                 let geometry = new T.BoxGeometry(blockHeight, blockHeight, blockHeight);
        //                 let material = new T.MeshLambertMaterial({ color: "lightblue" })
        //                 let block = new T.Mesh(geometry, material);

        //                 block.position.x = i*terrainSize/numSquares;
        //                 block.position.y = k*terrainSize/numSquares;
        //                 block.position.z = j*terrainSize/numSquares;
        //                 terrainGroup.add(block);
        //             }
        //         }
        //     }
        // }

        // geometry.computeFaceNormals();

        // outerGroup.add(terrainGroup);

        terrainGroup.add(terrainMesh);
        terrainMesh.position.x = -terrainSize/2;
        terrainMesh.position.y = -terrainSize/2;
        terrainMesh.position.z = -terrainSize/2;

        scene.add(terrainGroup);
        renderer.render(scene, camera);
    }
    createTerrain();

    camera.position.z = 500;
    camera.position.y = 500;
    camera.position.x = -500;
    camera.lookAt(0, 0, 0);
  
    let terrainRotation = 0;
    function animate() {
        requestAnimationFrame(animate);
        terrainRotation += 0.002;
        scene.children[2].rotation.y = terrainRotation;
        scene.children[2].rotation.z = terrainRotation;
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin3D);


import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../../libs/helpers.js";
import { PerlinNoiseGenerator2D } from "../noiseGenerators/perlinNoiseGenerator2D.js";

var numSquares = 100;
var amplitude = 200;
const terrainSize = 400;

var seed = 0;

function drawPerlin3D() {

    // create surface points
    seed = (Math.floor(Math.random()*9)+1)*100000000 + Math.floor(Math.random()*99999999);
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D(seed);

    perlinNoiseGenerator.setScale(0.06);
    perlinNoiseGenerator.setOctaves(3);

    let meshPoints = [];

    // create canvas  
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "terrainPerlin2DCanvas"
    ));
    
    // Set up the renderer, which will create the Canvas for us
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    
    // the aspect ratio is set to 1 - since we're making the window 200x200
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 1000);
    let scene = new T.Scene(); 

    let createLights = () => {
        let ambientLight = new T.AmbientLight(0xffffff, 0.25);
        scene.add(ambientLight);
        let pointLight = new T.PointLight(0xffffff, 1);
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
                    row.push(result*amplitude);
                }
                column.push(row);
            }
            meshPoints.push(column);
        }
    }

    let createTerrain = () => {
        console.log("create");
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }

        createLights();

        let geometry = new T.Geometry();
        let material = new T.MeshLambertMaterial({ color: "lightblue" });

        getPoints();

        for(let i=0; i<numSquares+1; i++) {
            for(let k=0; k<numSquares+1; k++) {
                for(let j=0; j<numSquares+1; j++) {
                    geometry.vertices.push(new T.Vector4(i*terrainSize/numSquares, k*terrainSize/numSquares, j*terrainSize/numSquares, meshPoints[i][k][j]));
                }
            }
        }

        geometry.computeFaceNormals();

        let terrain = new T.Mesh(geometry, material);

        let terrainGroup = new T.Group();
        terrainGroup.add(terrain);
        terrain.position.x = -terrainSize/2;
        terrain.position.z = -terrainSize/2;
        terrain.position.y = -amplitude/2;

        scene.add(terrainGroup);
        renderer.render(scene, camera);
    }
    createTerrain();

    camera.position.z = 240;
    camera.position.y = 320;
    camera.position.x = -240;
    camera.lookAt(0,-terrainSize*.15,0);
  
    let terrainRotation = 0;
    function animate() {
        requestAnimationFrame(animate);
        terrainRotation += 0.001;
        scene.children[2].rotation.y = terrainRotation;
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin3D);

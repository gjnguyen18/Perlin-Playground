import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../../libs/helpers.js";
import { PerlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

const numSquares = 100;
const amplitude = 80;
const terrainSize = 200;

function drawPerlin2DTerrain() {

    // create surface points
    let perlinNoiseGenerator = new PerlinNoiseGenerator2D();

    perlinNoiseGenerator.setScale(0.04);
    perlinNoiseGenerator.setOctaves(4);

    let meshPoints = [];
    for(let i=0; i<numSquares+1; i++) {
        let column = [];
        for(let k=0; k<numSquares+1; k++) {
            let result = perlinNoiseGenerator.getVal(i, k);
            let val = Math.floor(result * 50) / 50;
            column.push(val*amplitude);
        }
        meshPoints.push(column);
    }

    // create canvas  
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "blockyTerrainPerlin2DCanvas"
    ));
    
    // Set up the renderer, which will create the Canvas for us
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    
    // the aspect ratio is set to 1 - since we're making the window 200x200
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 1000);
    let scene = new T.Scene(); 
  
    //lighting
    let ambientLight = new T.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);
    let pointLight = new T.PointLight(0xffffff, 1);
    pointLight.position.set(400, 300, 400);
    scene.add(pointLight);

    let geometry = new T.Geometry();
    let material = new T.MeshPhongMaterial({ color: "lightblue" });

    let drawSquare = (p1, p2, p3, p4) => {
        geometry.faces.push(new T.Face3(p4, p2, p1));
        geometry.faces.push(new T.Face3(p3, p4, p1));
    }

    for(let i=0; i<numSquares; i++) {
        for(let k=0; k<numSquares; k++) {
            let thisVal = meshPoints[k][i];
            geometry.vertices.push(new T.Vector3(k*terrainSize/numSquares, thisVal, i*terrainSize/numSquares));
            geometry.vertices.push(new T.Vector3((k+1)*terrainSize/numSquares, thisVal, i*terrainSize/numSquares));
            geometry.vertices.push(new T.Vector3(k*terrainSize/numSquares, thisVal, (i+1)*terrainSize/numSquares));
            geometry.vertices.push(new T.Vector3((k+1)*terrainSize/numSquares, thisVal, (i+1)*terrainSize/numSquares));

            let l = geometry.vertices.length;
            // geometry.faces.push(new T.Face3(vLength-1, vLength-3, vLength-4));
            // geometry.faces.push(new T.Face3(vLength-2, vLength-1, vLength-4));
            drawSquare(l-4,l-3,l-2,l-1);

            if(k>0) {
                if(meshPoints[k-1][i] < thisVal) {
                    drawSquare(l-5,l-7,l-2,l-4);
                }
                else if(meshPoints[k-1][i] > thisVal) {
                    drawSquare(l-4,l-2,l-7,l-5);
                }
            }

            if(i>0) {
                let iStep = numSquares * 4;
                if(meshPoints[k][i-1] < thisVal) {
                    drawSquare(l-2-iStep,l-1-iStep,l-4,l-3);
                }
                else if(meshPoints[k][i-1] > thisVal) {
                    drawSquare(l-3, l-4, l-1-iStep, l-2-iStep);
                }
            }
        }
    }



    // for(let i=0; i<numSquares; i++) {
    //     for(let k=0; k<numSquares; k++) {
    //         geometry.faces.push(new T.Face3(i*(numSquares+1)+k, (i+1)*(numSquares+1)+k+1, i*(numSquares+1)+k+1));
    //         geometry.faces.push(new T.Face3(i*(numSquares+1)+k, (i+1)*(numSquares+1)+k, (i+1)*(numSquares+1)+k+1));
    //     }
    // }

    geometry.faceVertexUvs = [[]];
    geometry.computeFaceNormals();
    geometry.uvsNeedUpdate = true;

    let terrain = new T.Mesh(geometry, material);

    let terrainGroup = new T.Group();
    terrainGroup.add(terrain);
    terrain.position.x = -terrainSize/2;
    terrain.position.z = -terrainSize/2;
    terrain.position.y = -amplitude/2;

    scene.add(terrainGroup);

    camera.position.z = 120;
    camera.position.y = 160;
    camera.position.x = -120;
    camera.lookAt(0,-terrainSize*.15,0);

    // renderer.shadowMapEnabled = true;
    // pointLight.castShadow = true;
    // terrain.castShadow = true;
    // terrain.receiveShadow = true;

    renderer.render(scene, camera);
  
    function animate() {
        requestAnimationFrame(animate);
        terrainGroup.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin2DTerrain);

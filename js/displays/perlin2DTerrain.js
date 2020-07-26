
import * as T from "../../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../../libs/helpers.js";
import { perlinNoiseGenerator2D } from "./../noiseGenerators/perlinNoiseGenerator2D.js";

const numSquares = 50;
const amplitude = 180;
const terrainSize = 200;

let getQuadUV = (x, y, width, height, scaleX = numSquares, scaleY = numSquares) => {
    return [
        [
            new T.Vector2(x / scaleX, y / scaleY),
            new T.Vector2((x + width) / scaleX, (y + height) / scaleY),
            new T.Vector2((x + width) / scaleX, y / scaleY)
        ],
        [
            new T.Vector2(x / scaleX, y / scaleY),
            new T.Vector2(x / scaleX, (y + height) / scaleY),
            new T.Vector2((x + width) / scaleX, (y + height) / scaleY)
        ]
    ]
}

function drawPerlin2DTerrain() {

    // create surface points
    let perlinNoiseGenerator = new perlinNoiseGenerator2D();

    perlinNoiseGenerator.setScale(0.06);
    perlinNoiseGenerator.setOctaves(4);

    let meshPoints = [];
    for(let i=0; i<numSquares+1; i++) {
        let column = [];
        for(let k=0; k<numSquares+1; k++) {
            let result = perlinNoiseGenerator.getVal(i, k);
            let val = Math.floor(result * 20) / 20;
            column.push(result*amplitude);
        }
        meshPoints.push(column);
    }

    // create canvas  
    let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
        "terrainPerlin2DCanvas"
    ));
    
    // Set up the renderer, which will create the Canvas for us
    let renderer = new T.WebGLRenderer({ canvas: canvas });
    
    // the aspect ratio is set to 1 - since we're making the window 200x200
    let camera = new T.PerspectiveCamera(50, 1, 0.1, 1000);
    let scene = new T.Scene(); 
  
    //lighting
    let ambientLight = new T.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    let pointLight = new T.PointLight(0xffffff, 1);
    pointLight.position.set(400, 300, 400);
    scene.add(pointLight);

    let geometry = new T.Geometry();
    let material = new T.MeshStandardMaterial({ color: "lightblue" });

    for(let i=0; i<numSquares+1; i++) {
        for(let k=0; k<numSquares+1; k++) {
            geometry.vertices.push(new T.Vector3(k*terrainSize/numSquares, meshPoints[i][k], i*terrainSize/numSquares));
        }
    }

    for(let i=0; i<numSquares; i++) {
        for(let k=0; k<numSquares; k++) {
            geometry.faces.push(new T.Face3(i*(numSquares+1)+k, (i+1)*(numSquares+1)+k+1, i*(numSquares+1)+k+1));
            geometry.faces.push(new T.Face3(i*(numSquares+1)+k, (i+1)*(numSquares+1)+k, (i+1)*(numSquares+1)+k+1));
        }
    }

    geometry.faceVertexUvs = [[]];
    geometry.computeFaceNormals();
    geometry.uvsNeedUpdate = true;

    for(let i=0; i<numSquares; i++) {
        for(let k=0; k<numSquares; k++) {
            let face = getQuadUV(k, i, 1, 1);
            geometry.faceVertexUvs[0].push(face[0]);
            geometry.faceVertexUvs[0].push(face[1]);
        }
    }

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

    renderer.render(scene, camera);
  
    function animate() {
        requestAnimationFrame(animate);
        terrainGroup.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

onWindowOnload(drawPerlin2DTerrain);

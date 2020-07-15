/**
 * 1-2.js - a simple JavaScript file that gets loaded with
 * page 1 of Workbook 7 (CS559).
 *
 * written by Michael Gleicher, January 2019
 * modified January 2020
 */

// @ts-check
/* jshint -W069, esversion:6 */

import * as T from "../libs/CS559-THREE/build/three.module.js";
import { onWindowOnload } from "../libs/helpers.js";

//
// this is exactly the code from
// https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
//
// with the following modifications:
//    - rather than making the render target fill the screen, it gets put in the
//      right location in the box at an appropriate size. this requires setting
//      the aspect ratio correctly
//    - i added a light source and used a material that responds to do
//    - lines are re-ordered
// in this version, I pass an existing canvas
function three2() {
  let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
    "canvas2"
  ));

  // Set up the renderer, which will create the Canvas for us
  let renderer = new T.WebGLRenderer({ canvas: canvas });

  // the aspect ratio is set to 1 - since we're making the window 200x200
  let camera = new T.PerspectiveCamera(50, 1, 0.1, 1000);

  let scene = new T.Scene();

  let geometry = new T.BoxGeometry(1, 1, 1);
  // this was "MeshBasicMaterial"
  let material = new T.MeshPhongMaterial({ color: 0x00ff00 });
  let cube = new T.Mesh(geometry, material);
  scene.add(cube);

  // we don't see anything if there is no light
  let ambientLight = new T.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  let pointLight = new T.PointLight(0xffffff, 1);
  pointLight.position.set(25, 50, 25);
  scene.add(pointLight);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);

    turnCube();

    renderer.render(scene, camera);
  }

  let turn = false;

  let activateTurn = (e) => {
    if(e.keyCode == 70) {
      turn = true;
    }
  }
  let deactivateTurn = (e) => {
    turn = false;
  }

  let turnCube = () => {
    if(turn) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
  }
  document.addEventListener('keydown', activateTurn);
  document.addEventListener('keyup', deactivateTurn);

  animate();
}

onWindowOnload(three2);

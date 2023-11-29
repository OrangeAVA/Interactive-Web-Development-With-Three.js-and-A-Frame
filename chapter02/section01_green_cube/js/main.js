//Import three.js
import * as THREE from "three";

// Create global variables
let renderer, scene, container, camera;



// Calls start function after the content is loaded
window.addEventListener("load", function () {
  start();
});



// Define start function
async function start() {

  // Create renderer and define its size
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Create a container div and append it to the DOM
  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  // Create scene to add elements inside
  scene = new THREE.Scene();

  // Create a camera
  camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  
  // Change the camera position to avoid the camera to be inside
  // other objects once everything is positioned at 0,0,0, coordinates by default
  camera.position.z = 5;

  // Create a box
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);

  //rotates the box to see the perspective
  cube.rotation.set(0, Math.PI / 4, 0);

  //add the box to the scene
  scene.add(cube);

  //render the scene with the current camera
  renderer.render(scene, camera);


}

import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, background;
let cube;

let angle = 0;
let radius = 5;


window.addEventListener("load", function () {
  start();
});


async function start() {

  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 10);
  camera.rotation.set(THREE.MathUtils.degToRad(-25), 0, 0); //rotates 20 degrees down

  background = new RGBELoader().load(
    "./assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    },
  );


  const geometryPlane = new THREE.PlaneGeometry(20, 20);
  const materialPlane = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(0, 0, 0);
  plane.rotation.set(-Math.PI/2, 0 , 0);
  plane.receiveShadow = true;
  scene.add(plane);


  const geometryCube = new THREE.BoxGeometry(2, 2, 2);

  const materialCube = new THREE.MeshStandardMaterial({color: 0xffff00, metalness: 0.1, roughness: 0 });
  cube = new THREE.Mesh(geometryCube, materialCube);
  cube.position.set(0, 1, 0);
  cube.rotation.set(0, Math.PI/4, 0);
  cube.castShadow = true;
  scene.add(cube);


  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);


  const spotLight = new THREE.SpotLight(0xffffff, 0.25, 500, 50);
  spotLight.castShadow = true;
  spotLight.target = cube;
  spotLight.position.set(-2, 5, 5);
  scene.add(spotLight);




  // Created a animation loop
  function animate() {

    // Rotates the cube
    cube.rotation.y += 0.01; 


    // Rotate the camera around the scene
    camera.position.x = radius * Math.cos(angle);
    camera.position.z = radius * Math.sin(angle);
    angle += 0.01;

    // points the camera to the cube
    camera.lookAt(cube.position);

    // Renders the scene
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // Call the animation method
  animate();


}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, background;
let cube01, cube02, materialCube01, materialCube02;

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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);


  const spotLight01 = new THREE.SpotLight(0xffffff, 0.25, 500, 50);
  spotLight01.castShadow = true;
  spotLight01.position.set(-2, 5, 5);
  scene.add(spotLight01);

  const spotLight02 = new THREE.SpotLight(0xffffff, 0.25, 500, 50);
  spotLight02.castShadow = true;
  spotLight02.position.set(2, 5, 5);
  scene.add(spotLight02);


  const geometryCube = new THREE.BoxGeometry(2, 2, 2);

  const map01 = new THREE.TextureLoader().load('./assets/images/texture01.jpg',
    function ( texture ) {
        materialCube01 = new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0.1, roughness: 0, map: texture });
        materialCube01.map.wrapS = THREE.MirroredRepeatWrapping;
        materialCube01.map.wrapT = THREE.MirroredRepeatWrapping;
        cube01 = new THREE.Mesh(geometryCube, materialCube01);
        cube01.position.set(-2, 1, 0);
        cube01.rotation.set(0, Math.PI/4, 0);
        cube01.castShadow = true;
        spotLight02.target = cube01;
        scene.add(cube01);
    }
  );

  
  const map02 = new THREE.TextureLoader().load('./assets/images/texture02.jpg',
    function ( texture ) {
        materialCube02 = new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0.1, roughness: 0, map: texture });
        materialCube02.map.wrapS = THREE.MirroredRepeatWrapping;
        materialCube02.map.wrapT = THREE.MirroredRepeatWrapping;
        cube02 = new THREE.Mesh(geometryCube, materialCube02);
        cube02.position.set(2, 1, 0);
        cube02.rotation.set(0, Math.PI/4, 0);
        cube02.castShadow = true;
        spotLight01.target = cube02;
        scene.add(cube02);
    }
  );




  // Created a animation loop
  function animate() {

    // update cube01 texture in the x axis
    if (materialCube01) materialCube01.map.offset.x += 0.01;

    // update cube02 texture in the y axis
    if (materialCube02) materialCube02.map.offset.y -= 0.01;

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
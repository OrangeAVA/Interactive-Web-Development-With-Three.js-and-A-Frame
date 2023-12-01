import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, background;
let geometrySphere;


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

  geometrySphere = new THREE.SphereGeometry(1, 32, 32);

  const materialSphere01 = new THREE.MeshStandardMaterial({color: 0xff0000, metalness: 0.1, roughness: 0 });
  const sphere01 = new THREE.Mesh(geometrySphere, materialSphere01);
  sphere01.position.set(-5, 1, 0);
  sphere01.rotation.set(0, Math.PI/4, 0);
  sphere01.castShadow = true;
  scene.add(sphere01);

  const materialSphere02 = new THREE.MeshStandardMaterial({color: 0xffff00, metalness: 0.1, roughness: 0 });
  const sphere02 = new THREE.Mesh(geometrySphere, materialSphere02);
  sphere02.position.set(0, 1, 0);
  sphere02.rotation.set(0, Math.PI/4, 0);
  sphere02.castShadow = true;
  scene.add(sphere02);

  const materialSphere03 = new THREE.MeshStandardMaterial({color: 0x00ff00, metalness: 0.1, roughness: 0 });
  const sphere03 = new THREE.Mesh(geometrySphere, materialSphere03);
  sphere03.position.set(5, 1, 0);
  sphere03.rotation.set(0, Math.PI/4, 0);
  sphere03.castShadow = true;
  scene.add(sphere03);


  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.25, 500, 50);
  pointLight.castShadow = true;
  pointLight.position.set(-6, 5, 5);
  scene.add(pointLight);

  const spotLight = new THREE.SpotLight(0xffffff, 0.25, 500, 50);
  spotLight.castShadow = true;
  spotLight.target = sphere02;
  spotLight.position.set(-2, 5, 5);
  scene.add(spotLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
  directionalLight.castShadow = true;
  directionalLight.target = sphere03;
  directionalLight.position.set(-6, 5, 5);
  scene.add(directionalLight);


  pointLight.shadow.mapSize.width = 64;
  pointLight.shadow.mapSize.height = 64;

  spotLight.shadow.mapSize.width = 256;
  spotLight.shadow.mapSize.height = 256;

  directionalLight.shadow.mapSize.width = 512;
  directionalLight.shadow.mapSize.height = 512;




  animate();
  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }


}

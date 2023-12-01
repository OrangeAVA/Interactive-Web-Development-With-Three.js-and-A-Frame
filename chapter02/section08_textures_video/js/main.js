import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, background;
let geometryCube, videoCube;

const videoElement = document.querySelector("#videoElement");

window.addEventListener("load", function () {
  start();
});


async function start() {

  document.querySelector("#videoPlayBtn").addEventListener("click", function () {
    videoElement.currentTime = 0;
    videoElement.play();
  });


  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1, 5);

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


  const materialVideo = new THREE.MeshStandardMaterial();
  const videoTexture = new THREE.VideoTexture(videoElement);
  materialVideo.map = videoTexture;

  geometryCube = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  videoCube = new THREE.Mesh(geometryCube, materialVideo);
  videoCube.position.set(0, 1.5, 0);
  videoCube.rotation.set(Math.PI/8, Math.PI/4, 0);
  scene.add(videoCube);


  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  scene.add(light02);


  animate();
  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }


}

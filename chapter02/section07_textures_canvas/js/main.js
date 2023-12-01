import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, background;
let geometryCube, canvasCube;

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
      render();
    },
  );


  //canvas texture
  const canvasElement = document.createElement("canvas");
  canvasElement.id = "canvasElement";
  canvasElement.width = 512;
  canvasElement.height = 512;
  const canvasContext = canvasElement.getContext("2d");
  canvasContext.fillStyle = "#ffffff";
  canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
  canvasContext.fillStyle = "#000000";
  canvasContext.fillRect(64, 64, 384, 384);
  document.body.appendChild(canvasElement)

  const materialCanvas = new THREE.MeshStandardMaterial();
  materialCanvas.map = new THREE.CanvasTexture(canvasElement);
  materialCanvas.map.needsUpdate = true;

  geometryCube = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  canvasCube = new THREE.Mesh(geometryCube, materialCanvas);
  canvasCube.position.set(0, 1.5, 0);
  canvasCube.rotation.set(Math.PI/8, Math.PI/4, 0);
  scene.add(canvasCube);




  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  scene.add(light02);



  render();


  function render() {
    renderer.render(scene, camera);
  }


}

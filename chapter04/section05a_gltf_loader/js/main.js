import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import Stats from "https://unpkg.com/three@0.153.0/examples/jsm/libs/stats.module";
import { GLTFLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, controls, stats1, stats2;
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

window.addEventListener("load", function () {
  start();
});

async function start() {
  renderer = new THREE.WebGLRenderer();
  scene = new THREE.Scene();
  stats1 = new Stats();
  stats1.showPanel(0); // Panel 0 = fps
  stats1.domElement.style.cssText = "position:absolute;top:0px;left:0px;";
  document.body.appendChild(stats1.domElement);

  stats2 = new Stats();
  stats2.showPanel(2);
  stats2.domElement.style.cssText = "position:absolute;top:0px;left:80px;";
  document.body.appendChild(stats2.domElement);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 5);

  const backgroundTexture = new RGBELoader().load(
    "../assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    },
  );

  controls = new OrbitControls(camera, renderer.domElement);

  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
  );
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "../assets/models/DamagedHelmet/binary/DamagedHelmet.glb",
    function (gltf) {
      scene.add(gltf.scene);
    },
    function (progress) {
      console.log((progress.loaded / progress.total) * 100 + "% loaded");
    },
    function (error) {
      console.error(error);
    },
  );

  animate();

  function animate() {
    stats1.update();
    stats2.update();

    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", onWindowResize);
}

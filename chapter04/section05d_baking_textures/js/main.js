import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, controls, animatedCharacter;
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
const clock = new THREE.Clock();

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
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  light01.castShadow = true;
  light01.shadow.mapSize.width = light01.shadow.mapSize.height = 1024;
  light01.shadow.radius = 5;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  light02.castShadow = true;
  light02.shadow.mapSize.width = light02.shadow.mapSize.height = 1024;
  light02.shadow.radius = 5;
  scene.add(light02);

  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
  );
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "../assets/models/coin/baked/coinBaked.glb",
    function (gltf) {
      animatedCharacter = gltf;

      scene.add(gltf.scene);
      gltf.scene.position.set(0, 0, 0);

      /// enable GLTF shadows
      gltf.scene.traverse(function (child) {
        if (!child.isMesh) return;
        child.castShadow = true;
      });
    },
    function (progress) {},
    function (error) {
      console.error(error);
    },
  );

  animate();

  function animate() {
    const delta = clock.getDelta();

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

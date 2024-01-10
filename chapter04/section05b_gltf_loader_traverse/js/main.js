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
  renderer = new THREE.WebGLRenderer({ antialias: true });
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

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -0.5, 0);
  plane.rotation.set(-Math.PI / 2, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
  );
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "../assets/models/DamagedHelmet/binary/DamagedHelmet.glb",
    function (gltf) {
      scene.add(gltf.scene);
      gltf.scene.position.set(-2.5, 0.5, 0);

      gltf.scene.traverse(function (child) {
        if (!child.isMesh) return;

        child.castShadow = true;

        /// uncomment the lines below to apply a Three.js material to the GLTF meshes
        // const childMaterial = new THREE.MeshStandardMaterial({
        //   color: 0x000000,
        //   metalness: 1,
        //   roughness: 0,
        // });
        // child.material = childMaterial;
      });
    },
    function (progress) {},
    function (error) {
      console.error(error);
    },
  );

  loader.load(
    "../assets/models/CandleHolder/binary/CandleHolder.glb",
    function (gltf) {
      scene.add(gltf.scene);
      gltf.scene.position.set(-0.5, -0.5, -0.3);
      gltf.scene.scale.set(5, 5, 5);

      /// enable GLTF shadows
      gltf.scene.traverse(function (child) {
        if (!child.isMesh) return;

        child.castShadow = true;
      });

      const candleHolderGlass = gltf.scene.getObjectByName("CandleHolder-glass");
      if (!candleHolderGlass || !candleHolderGlass.isMesh) return;
      const chromeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0,
      });
      const clearGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        opacity: 1,
        metalness: 0,
        roughness: 0,
        ior: 1.5,
        thickness: 0.02,
      });
      /// try to change between chromeMaterial and clearGlassMaterial
      candleHolderGlass.material = clearGlassMaterial;
    },
    function (progress) {},
    function (error) {
      console.error(error);
    },
  );

  loader.load(
    "../assets/models/WaterBottle/binary/WaterBottle.glb",
    function (gltf) {
      scene.add(gltf.scene);
      gltf.scene.position.set(1, 0.4, -0.3);
      gltf.scene.rotation.y = -Math.PI / 2;
      gltf.scene.scale.set(7, 7, 7);

      /// enable GLTF shadows
      gltf.scene.traverse(function (child) {
        if (!child.isMesh) return;
        child.castShadow = true;
      });
      const WaterBottle = gltf.scene.getObjectByProperty("CandleHolder-glass");
    },
    function (progress) {},
    function (error) {
      console.error(error);
    },
  );

  loader.load(
    "../assets/models/AnimatedCharacter/binary/AnimatedCharacter.glb",
    function (gltf) {
      scene.add(gltf.scene);
      gltf.scene.position.set(2.5, -0.5, 0);
      /// enable GLTF shadows
      gltf.scene.traverse(function (child) {
        if (!child.isMesh) return;
        child.castShadow = true;
      });

      /// it will list all armature bones from this GLTF file
      const objs = gltf.scene.getObjectsByProperty("isBone", true);
      console.log("Bones: ", objs);
    },
    function (progress) {},
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

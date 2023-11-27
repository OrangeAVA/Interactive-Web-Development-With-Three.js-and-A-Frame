import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/TransformControls.js";

let renderer, scene, container, camera, orbitControls, transformControls;

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
  camera.position.set(0, 1, 5);

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  light01.castShadow = true;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  light02.castShadow = true;
  scene.add(light02);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.rotation.set(0, Math.PI / 4, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -0.5, 0);
  plane.rotation.set(-Math.PI / 2, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  orbitControls = new OrbitControls(camera, renderer.domElement);

  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.attach(cube);
  scene.add(transformControls);

  transformControls.addEventListener("dragging-changed", function (event) {
    orbitControls.enabled = !event.value;
  });

  window.addEventListener("keydown", function (event) {
    switch (event.keyCode) {
      case 87: // W
        transformControls.setMode("translate");
        break;

      case 69: // E
        transformControls.setMode("rotate");
        break;

      case 82: // R
        transformControls.setMode("scale");
        break;
      case 81: // Q
        transformControls.setSpace(
          transformControls.space === "local" ? "world" : "local",
        );
        break;
    }
  });

  animate();

  function animate() {
    orbitControls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    animate();
  }

  window.addEventListener("resize", onWindowResize);
}

import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera;
let ball;
let gyroscopeData = { alpha: 0, beta: 0, gamma: 0 };
let gyroscopeEnabled = false;

const ballVel = new THREE.Vector3(0, 0, 0);
const bounciness = -0.7;
const minBounds = new THREE.Vector3(-1.25, 0, -2.25);
const maxBounds = new THREE.Vector3(1.25, 0, 2.25);

const debugDiv = document.querySelector("#debug");

function deviceMotionStart() {
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then((response) => {
      if (window.DeviceOrientationEvent) {
        window.addEventListener("deviceorientation", (event) => {
          gyroscopeData = event;
          gyroscopeEnabled = true;
          document.querySelector("#permissionButton").remove();
          start();
        });
      } else {
        alert("Gyroscope not supported on this device.");
      }
    });
  }
}

window.addEventListener("load", function () {
  document
    .querySelector("#permissionButton")
    .addEventListener("click", function () {
      deviceMotionStart();
    });
});

async function start() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  const backgroundTexture = new RGBELoader().load(
    "./assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;

      animate();
    },
  );

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 5, 0);

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  light01.castShadow = true;
  light01.shadow.mapSize.width = 1024;
  light01.shadow.mapSize.height = 1024;
  light01.shadow.radius = 8;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  light02.castShadow = true;
  light02.shadow.mapSize.width = 1024;
  light02.shadow.mapSize.height = 1024;
  light02.shadow.radius = 8;
  scene.add(light02);

  const geometrySphere = new THREE.SphereGeometry(0.5, 32, 32);
  const materialSphere = new THREE.MeshStandardMaterial({
    color: 0x00ccff,
    metalness: 1,
    roughness: 0.25,
  });
  ball = new THREE.Mesh(geometrySphere, materialSphere);
  ball.position.set(0, 0, 0);
  ball.castShadow = true;
  scene.add(ball);

  camera.lookAt(ball.position);

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -0.5, 0);
  plane.rotation.set(-Math.PI / 2, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  animate();

  function updateBallPosition() {
    if (gyroscopeEnabled) {
      const alpha = gyroscopeData.alpha;
      const beta = gyroscopeData.beta;
      const gamma = gyroscopeData.gamma;

      debugDiv.innerHTML = `alpha: ${gyroscopeData.alpha}<br>beta: ${gyroscopeData.beta}<br>gamma: ${gyroscopeData.gamma}`;

      const acceleration = new THREE.Vector3(
        Math.sin((gamma * (Math.PI / 180)) / 1000),
        0,
        Math.sin((beta * (Math.PI / 180)) / 1000),
      );

      ballVel.add(acceleration);

      ball.position.add(ballVel);

      if (ball.position.x < minBounds.x || ball.position.x > maxBounds.x) {
        ballVel.x *= bounciness;
        ball.position.x = THREE.MathUtils.clamp(
          ball.position.x,
          minBounds.x,
          maxBounds.x,
        );
      }

      if (ball.position.z < minBounds.z || ball.position.z > maxBounds.z) {
        ballVel.z *= bounciness;
        ball.position.z = THREE.MathUtils.clamp(
          ball.position.z,
          minBounds.z,
          maxBounds.z,
        );
      }
    }
  }

  function animate() {
    updateBallPosition();

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

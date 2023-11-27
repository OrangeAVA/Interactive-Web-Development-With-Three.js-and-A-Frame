import * as THREE from "three";
let renderer, scene, container, camera;

let arrowPressed = { left: false, right: false, up: false, down: false };
let increment = 0.025;

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

  document.addEventListener(
    "keydown",
    (event) => {
      const keyName = event.key;
      switch (keyName) {
        case "ArrowUp":
          arrowPressed.up = true;
          break;
        case "ArrowDown":
          arrowPressed.down = true;
          break;
        case "ArrowRight":
          arrowPressed.right = true;
          break;
        case "ArrowLeft":
          arrowPressed.left = true;
          break;
      }
    },
    false,
  );

  document.addEventListener(
    "keyup",
    (event) => {
      arrowPressed.up = false;
      arrowPressed.down = false;
      arrowPressed.right = false;
      arrowPressed.left = false;
    },
    false,
  );

  animate();

  function animate() {
    if (arrowPressed.left) cube.position.x -= increment;
    if (arrowPressed.right) cube.position.x += increment;
    if (arrowPressed.up) cube.position.z -= increment;
    if (arrowPressed.down) cube.position.z += increment;

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

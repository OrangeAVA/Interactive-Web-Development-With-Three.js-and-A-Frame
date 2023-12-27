import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/PointerLockControls.js";

let renderer, scene, container, camera, controls;

const clock = new THREE.Clock();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const increment = 100;

const raycaster = new THREE.Raycaster();
let raycasterOrigin = new THREE.Vector3();
let raycasterDirection = new THREE.Vector3();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const bulletArray = [];
const enemyArray = [];
let bulletObject, enemyObject;

const hexColors = [
  0xff5733, 0x7d3c98, 0x3498db, 0xf1c40f, 0xe74c3c, 0x2ecc71, 0x9b59b6,
  0x1abc9c, 0xf39c12, 0xc0392b,
];

let isReady = false;


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

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 1, 5);
  scene.add(camera);

  const lightCam = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 10, 0.25, 10);
  lightCam.castShadow = true;
  camera.add(lightCam);
  lightCam.position.set(0, 1, 0);

  const targetObject = new THREE.Object3D();
  targetObject.position.set(0, 1, -2);
  camera.add(targetObject);
  lightCam.target = targetObject;

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  light01.castShadow = true;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  light02.castShadow = true;
  scene.add(light02);

  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const floor = new THREE.Mesh(floorGeo, floorMaterial);
  floor.position.set(0, -0.5, 0);
  floor.rotation.set(-Math.PI / 2, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  controls = new PointerLockControls(camera, document.body);
  controls.pointerSpeed = 0.8;

  ///bullet reference object
  const bulletGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  bulletObject = new THREE.Mesh(bulletGeo, bulletMaterial);
  bulletObject.castShadow = true;
  bulletObject.receiveShadow = true;

  ///enemy reference object
  const enemyGeo = new THREE.BoxGeometry(1, 1, 1);
  const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  enemyObject = new THREE.Mesh(enemyGeo, enemyMaterial);
  enemyObject.castShadow = true;
  enemyObject.receiveShadow = true;

  createEnemies(100);

  createListeners();

  animate();

  function animate() {
    const delta = clock.getDelta();

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) {
      velocity.z -= direction.z * increment * delta;
    }
    if (moveLeft || moveRight) {
      velocity.x -= direction.x * increment * delta
    };

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    updateBullets();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function createListeners() {
  document.body.addEventListener("click", function () {
    isReady = true;
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    document.querySelector("#ui").classList.add("disabled");
  });

  controls.addEventListener("unlock", function () {
    document.querySelector("#ui").classList.remove("disabled");
  });

  document.addEventListener("keydown", function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
    }
  });

  document.addEventListener("keyup", function () {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
    }
  });

  document.addEventListener("mousedown", function () {
    if (!isReady) return;
    shoot();
  });

  window.addEventListener("resize", onWindowResize);
}

function createEnemies(amount) {
  for (let i = 0; i <= amount - 1; i++) {

    const enemyInstance = enemyObject.clone();
    enemyInstance.bBox = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3() );

    const randomColour = hexColors[Math.floor(Math.random() * hexColors.length)];
    enemyInstance.material = new THREE.MeshStandardMaterial({ color: randomColour });

    enemyInstance.position.set( THREE.MathUtils.randFloat(-50, 50), 0, THREE.MathUtils.randFloat(-50, 50) );
    enemyInstance.rotation.set( 0, THREE.MathUtils.randFloat(-Math.PI, Math.PI), 0 );
    enemyInstance.bBox.setFromObject(enemyInstance);

    scene.add(enemyInstance);
    enemyArray.push(enemyInstance);
  }
}

function shoot() {
  const bullet = bulletObject.clone();

  bullet.geometry.computeBoundingSphere();
  bullet.sphereBBox = new THREE.Sphere( bullet.position, bullet.geometry.boundingSphere.radius );
  scene.add(bullet);

  ///Set the bullet initial position and orientation based on the current camera position and orientation
  camera.getWorldPosition(bullet.position);
  camera.getWorldQuaternion(bullet.quaternion);

  bulletArray.push(bullet);
}

function removeBullet(bullet) {
  bullet.removeFromParent();
  bulletArray.splice(bulletArray.indexOf(bullet), 1);
}

function removeEnemy(enemy) {
  enemy.removeFromParent();
  enemyArray.splice(enemyArray.indexOf(enemy), 1);
}

function updateBullets() {
  if (!isReady) return;

  [...bulletArray].forEach((bullet) => {
    bullet.getWorldPosition(raycasterOrigin);
    bullet.getWorldDirection(raycasterDirection);

    bullet.position.add(raycasterDirection.multiplyScalar(-0.5));

    if ( bullet.position.x < -50 || bullet.position.x > 50 || bullet.position.z < -50 || bullet.position.z > 50 ) {
      removeBullet(bullet);
    }

    enemyArray.forEach(function (enemy, index) {
      if (bullet.sphereBBox.intersectsBox(enemy.bBox)) {
        removeBullet(bullet);
        removeEnemy(enemy);
      }
    });
  });
}
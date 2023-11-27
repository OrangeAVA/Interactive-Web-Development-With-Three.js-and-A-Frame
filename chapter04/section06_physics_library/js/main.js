import * as THREE from "three";
import { PointerLockControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/PointerLockControls.js";

let renderer, scene, container, camera, controls;

const clock = new THREE.Clock();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let isReady = false;

let world, sphereMesh, floorPhysicsMaterial, bulletObject, enemyObject;
let shootVelocity = 25;
let shootDirection = new THREE.Vector3();

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const increment = 100;

const bulletArray = [];
const enemyArray = [];

const hexColors = [
  0xff5733, 0x7d3c98, 0x3498db, 0xf1c40f, 0xe74c3c, 0x2ecc71, 0x9b59b6,
  0x1abc9c, 0xf39c12, 0xc0392b,
];

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

  await physicsSetup();

  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const floor = new THREE.Mesh(floorGeo, floorMaterial);
  floor.position.set(0, -0.5, 0);
  floor.rotation.set(-Math.PI / 2, 0, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // cannon.js floor object
  floorPhysicsMaterial = new CANNON.Material();
  const floorBody = new CANNON.Body({
    shape: new CANNON.Plane(
      floor.geometry.parameters.width,
      floor.geometry.parameters.depth,
    ),
    mass: 0,
    material: floorPhysicsMaterial,
  });
  floorBody.position.x = floor.position.x;
  floorBody.position.y = floor.position.y;
  floorBody.position.z = floor.position.z;
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);

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
}

function animate() {
  const delta = clock.getDelta();

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward)
    velocity.z -= direction.z * increment * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * increment * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  updateBullets();
  updateEnemies();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  if (delta > 0) {
    world.step(delta);
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

    const randomColour =
      hexColors[Math.floor(Math.random() * hexColors.length)];
    enemyInstance.material = new THREE.MeshStandardMaterial({
      color: randomColour,
    });

    enemyInstance.position.set(
      THREE.MathUtils.randFloat(-50, 50),
      0,
      THREE.MathUtils.randFloat(-50, 50),
    );

    enemyInstance.rotation.set(
      0,
      THREE.MathUtils.randFloat(-Math.PI, Math.PI),
      0,
    );
    let enemyBody = new CANNON.Body({
      mass: 5,
      shape: new CANNON.Box(
        new CANNON.Vec3(
          enemyInstance.geometry.parameters.width / 2,
          enemyInstance.geometry.parameters.height / 2,
          enemyInstance.geometry.parameters.depth / 2,
        ),
      ),
      position: enemyInstance.position.clone(),
    });

    enemyBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(
        enemyInstance.rotation.x,
        enemyInstance.rotation.y,
        enemyInstance.rotation.z,
      ),
      -Math.PI / 2,
    );

    enemyInstance.cannonRef = enemyBody;
    world.addBody(enemyBody);

    scene.add(enemyInstance);
    enemyArray.push(enemyInstance);
  }
}

function shoot() {
  const bullet = bulletObject.clone();
  camera.getWorldPosition(bullet.position);
  camera.getWorldQuaternion(bullet.quaternion);

  const matPhysicsBullet = new CANNON.Material();
  const matPhysicsBullet_ground = new CANNON.ContactMaterial(
    floorPhysicsMaterial,
    matPhysicsBullet,
    {
      friction: 0.0,
      restitution: 0.5,
    },
  );
  world.addContactMaterial(matPhysicsBullet_ground);

  const bulletBody = new CANNON.Body({
    mass: 1,
    position: bullet.position.clone(),
    shape: new CANNON.Sphere(bulletObject.geometry.parameters.radius),
    material: matPhysicsBullet,
  });

  getShootDirection(shootDirection);

  bulletBody.velocity.set(
    shootDirection.x * shootVelocity,
    shootDirection.y * shootVelocity,
    shootDirection.z * shootVelocity,
  );

  bullet.cannonRef = bulletBody;
  world.addBody(bulletBody);

  scene.add(bullet);
  bulletArray.push(bullet);
}

function updateBullets() {
  if (!isReady) return;
  [...bulletArray].forEach((bullet) => {
    if (!bullet.cannonRef) return;
    bullet.position.copy(bullet.cannonRef.position);
  });
}

function updateEnemies() {
  if (!isReady) return;
  [...enemyArray].forEach((enemy) => {
    if (!enemy.cannonRef) return;
    enemy.position.copy(enemy.cannonRef.position);
    enemy.quaternion.copy(enemy.cannonRef.quaternion);
  });
}

async function physicsSetup() {
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
}

function getShootDirection(targetVector) {
  let vector = targetVector;
  targetVector.set(0, 0, 1);
  vector.unproject(camera);
  const ray = new THREE.Ray(
    camera.position,
    vector.sub(camera.position).normalize(),
  );
  targetVector.copy(ray.direction);
}

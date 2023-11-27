import * as THREE from "three";
let renderer, scene, container, camera;

window.addEventListener("load", function () {
  start();
});

async function start() {
  renderer = new THREE.WebGLRenderer();
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

  //primitive: Cube
  const geometryCube = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const materialCube = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometryCube, materialCube);
  cube.position.set(-2, 1.5, 0);
  cube.rotation.set(0, Math.PI / 2, 0);
  scene.add(cube);

  //primitive: Plane
  const geometryPlane = new THREE.PlaneGeometry(0.5, 0.5);
  const materialPlane = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const plane = new THREE.Mesh(geometryPlane, materialPlane);
  plane.position.set(-1, 1.5, 0);
  scene.add(plane);

  //primitive: Sphere
  const geometrySphere = new THREE.SphereGeometry(0.35, 16, 16);
  const materialSphere = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometrySphere, materialSphere);
  sphere.position.set(0, 1.5, 0);
  scene.add(sphere);

  //primitive: Cylinder
  const geometryCylinder = new THREE.CylinderGeometry(0.35, 0.35, 0.75);
  const materialCylinder = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const cylinder = new THREE.Mesh(geometryCylinder, materialCylinder);
  cylinder.position.set(1, 1.5, 0);
  scene.add(cylinder);

  //primitive: Torus
  const geometryTorus = new THREE.TorusGeometry(0.4, 0.1, 16, 32);
  const materialTorus = new THREE.MeshStandardMaterial({ color: 0xfffff0 });
  const torus = new THREE.Mesh(geometryTorus, materialTorus);
  torus.position.set(2, 1.5, 0);
  scene.add(torus);

  //primitive: Capsule
  const geometryCapsule = new THREE.CapsuleGeometry(0.25, 0.5, 4, 8);
  const materialCapsule = new THREE.MeshStandardMaterial({ color: 0xff00ff });
  const capsule = new THREE.Mesh(geometryCapsule, materialCapsule);
  capsule.position.set(-2, 0, 0);
  scene.add(capsule);

  //primitive: Circle
  const geometryCircle = new THREE.CircleGeometry(0.5, 64);
  const materialCircle = new THREE.MeshStandardMaterial({ color: 0xfcc000 });
  const circle = new THREE.Mesh(geometryCircle, materialCircle);
  circle.position.set(-1, 0, 0);
  scene.add(circle);

  //primitive: Cone
  const geometryCone = new THREE.ConeGeometry(0.5, 1, 32);
  const materialCone = new THREE.MeshStandardMaterial({ color: 0xfccff0 });
  const cone = new THREE.Mesh(geometryCone, materialCone);
  cone.position.set(0, 0, 0);
  scene.add(cone);

  //primitive: Ring
  const geometryRing = new THREE.RingGeometry(0.2, 0.5, 32);
  const materialRing = new THREE.MeshStandardMaterial({ color: 0x0cc000 });
  const ring = new THREE.Mesh(geometryRing, materialRing);
  ring.position.set(1, 0, 0);
  scene.add(ring);

  //primitive: Torus Knot
  const geometryTorusKnot = new THREE.TorusKnotGeometry(0.25, 0.075, 64, 16);
  const materialTorusKnot = new THREE.MeshStandardMaterial({ color: 0xff00cc });
  const torusKnot = new THREE.Mesh(geometryTorusKnot, materialTorusKnot);
  torusKnot.position.set(2, 0, 0);
  scene.add(torusKnot);

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(3, 4, 5);
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-3, 3, 5);
  scene.add(light02);

  renderer.render(scene, camera);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", onWindowResize);
}

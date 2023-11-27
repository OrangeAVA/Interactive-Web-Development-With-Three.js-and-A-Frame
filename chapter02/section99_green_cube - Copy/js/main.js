import * as THREE from "three";
let renderer, scene, container, camera;
var angle = 0;
var radius = 5;

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

  window.THREE = THREE;
  window.scene = scene;
  window.renderer = renderer;
  window.camera = camera;

  const light = new THREE.PointLight(0xffffff, 1, 500, 50);
  light.position.set(3, 4, 5);
  scene.add(light);

  light.castShadow = true;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  material.map = new THREE.TextureLoader().load(
    "https://picsum.photos/seed/picsum/200/300",
  );
  material.map.wrapS = THREE.MirroredRepeatWrapping;

  const cube = new THREE.Mesh(geometry, material);
  cube.rotation.set(0, Math.PI / 4, 0);
  scene.add(cube);

  cube.castShadow = true;
  cube.receiveShadow = true;

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -0.5, 0);
  plane.rotation.set(-Math.PI / 2, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  // canvas texture
  // const canvasElement = document.createElement("canvas");
  // canvasElement.id = "canvasElement";
  // canvasElement.width = 512;
  // canvasElement.height = 512;
  // const canvasContext = canvasElement.getContext("2d");
  // canvasContext.fillStyle = "#ffffff";
  // canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
  // canvasContext.fillStyle = "#000000";
  // canvasContext.fillRect(64, 64, 384, 384);

  // material.map = new THREE.CanvasTexture(canvasElement);

  // const videoElement = document.getElementById("video");

  // document.querySelector("#videoPlay").addEventListener("click", function () {
  //   videoElement.play();
  // });

  // const videoTexture = new THREE.VideoTexture(videoElement);

  // material.map = videoTexture;

  renderer.render(scene, camera);

  animate();

  function animate() {
    cube.rotation.y += 0.01;
    camera.position.x = radius * Math.cos(angle);
    camera.position.z = radius * Math.sin(angle);
    camera.lookAt(cube.position);
    angle += 0.01;

    material.map.offset.x += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onWindowResize);
}

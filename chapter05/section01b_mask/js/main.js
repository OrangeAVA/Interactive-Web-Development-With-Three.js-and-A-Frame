import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

import { GUI } from "https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js";
import { EffectComposer } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/OutputPass.js";

import {
  MaskPass,
  ClearMaskPass,
} from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/MaskPass.js";
import { ClearPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/ClearPass.js";
import { TexturePass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/TexturePass.js";

let camera,
  composer,
  renderer,
  container,
  scene1,
  scene2,
  scene3,
  controls,
  gui,
  renderTarget;

let clearPass,
  clearMaskPass,
  maskPass1,
  maskPass2,
  maskPass3,
  texturePass1,
  texturePass2,
  texturePass3;

let plane, sphere, cube, torus;

const clock = new THREE.Clock();

window.addEventListener("load", function () {
  start();
});

function start() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    { stencilBuffer: true },
  );
  scene1 = new THREE.Scene();
  scene2 = new THREE.Scene();
  scene3 = new THREE.Scene();

  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    1000,
  );
  camera.position.z = 10;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial();
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -0.5, 0);
  plane.rotation.set(-Math.PI / 2, 0, 0);
  scene1.add(plane);

  const geoCube = new THREE.BoxGeometry(1, 1, 1);
  const matCube = new THREE.MeshStandardMaterial();
  cube = new THREE.Mesh(geoCube, matCube);
  cube.position.set(-1.5, 0, 0);
  cube.rotation.set(0, Math.PI / 4, 0);
  scene2.add(cube);

  const geoSphere = new THREE.SphereGeometry(0.5, 16, 16);
  const matSphere = new THREE.MeshStandardMaterial();
  sphere = new THREE.Mesh(geoSphere, matSphere);
  sphere.position.set(0, 0, 0);
  scene3.add(sphere);

  const geoTorus = new THREE.TorusGeometry(0.6, 0.3, 16, 32);
  const matTorus = new THREE.MeshStandardMaterial();
  torus = new THREE.Mesh(geoTorus, matTorus);
  torus.position.set(1.75, -0.25, 0);
  torus.rotation.set(Math.PI / 2, 0, 0);
  scene1.add(torus);

  ///Initialize the Post Processing Stack

  clearPass = new ClearPass();
  clearMaskPass = new ClearMaskPass();

  maskPass1 = new MaskPass(scene1, camera);
  maskPass2 = new MaskPass(scene2, camera);
  maskPass3 = new MaskPass(scene3, camera);

  const texture1 = new THREE.TextureLoader().load(
    "../assets/images/background_image_1.jpg",
  );
  texture1.colorSpace = THREE.SRGBColorSpace;
  texture1.minFilter = THREE.LinearFilter;
  const texture2 = new THREE.TextureLoader().load(
    "../assets/images/background_image_2.jpg",
  );
  texture2.colorSpace = THREE.SRGBColorSpace;

  const texture3 = new THREE.TextureLoader().load(
    "../assets/images/background_image_3.jpg",
  );
  texture3.colorSpace = THREE.SRGBColorSpace;

  texturePass1 = new TexturePass(texture1);
  texturePass2 = new TexturePass(texture2);
  texturePass3 = new TexturePass(texture3);

  composer = new EffectComposer(renderer, renderTarget);
  composer.addPass(clearPass); ///clear screen
  composer.addPass(maskPass1); ///renders the mask of texturePass1
  composer.addPass(texturePass1); ///renders texturePass1
  composer.addPass(maskPass2);
  composer.addPass(texturePass2);
  composer.addPass(maskPass3);
  composer.addPass(texturePass3);
  composer.addPass(clearMaskPass);

  ///final pass - mandatory when using maskPass
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  setupGUI();

  animate();
}

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function animate() {
  const delta = clock.getDelta();

  controls.update();
  composer.render(delta);

  requestAnimationFrame(animate);
}

function setupGUI() {
  gui = new GUI();

  gui.add(clearPass, "enabled").name("clearPass").setValue(true);
  gui.add(maskPass1, "enabled").name("maskPass1").setValue(true);
  gui.add(texturePass1, "enabled").name("texturePass1").setValue(true);
  gui.add(maskPass2, "enabled").name("maskPass2").setValue(true);
  gui.add(texturePass2, "enabled").name("texturePass2").setValue(true);
  gui.add(maskPass3, "enabled").name("maskPass3").setValue(true);
  gui.add(texturePass3, "enabled").name("texturePass3").setValue(true);
}

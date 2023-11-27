import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera, controls, animatedCharacter;
let animationMixers = [];
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
    "../assets/models/AnimatedCharacter/binary/AnimatedCharacter.glb",
    function (gltf) {
      animatedCharacter = gltf;

      scene.add(gltf.scene);
      gltf.scene.position.set(0, -0.5, 0);

      /// enable GLTF shadows
      gltf.scene.traverse(function (child) {
        if (!child.isMesh) return;
        child.castShadow = true;
      });

      /// create animation mixer
      const characterMixer = new THREE.AnimationMixer(gltf.scene);
      animationMixers.push(characterMixer);

      /// add available animation actions to an array of objects to make easier to play them
      gltf.actions = {};
      for (let i = 0; i < gltf.animations.length; i++) {
        const clip = gltf.animations[i];
        const action = characterMixer.clipAction(clip);
        gltf.actions[clip.name] = action;
        action.loop = THREE.LoopRepeat;
      }

      /// select the animation you want to play
      gltf.activeAction = gltf.actions["Idle"];

      /// clear the current animation (if is being played) and play the animation with a 0.5 seconds transition
      gltf.activeAction.reset();
      gltf.activeAction
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.5)
        .play();

      document.querySelector("#ui").classList.add("show");
    },
    function (progress) {},
    function (error) {
      console.error(error);
    },
  );

  const buttons = document.querySelectorAll("#ui button");
  buttons.forEach(function (element) {
    element.addEventListener("click", function (e) {
      const animationClipName = element.dataset.animation;
      fadeToAction(animatedCharacter, animationClipName, 0.5);
    });
  });

  animate();

  function animate() {
    const delta = clock.getDelta();

    controls.update();
    animationMixers.forEach((mixer) => {
      mixer.update(delta);
    });

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

  function fadeToAction(model, animationClipName, duration) {
    model.previousAction = model.activeAction;
    model.activeAction = model.actions[animationClipName];

    if (model.previousAction !== model.activeAction) {
      model.previousAction.fadeOut(duration);
    }

    model.activeAction.reset();
    model.activeAction
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();
  }
}

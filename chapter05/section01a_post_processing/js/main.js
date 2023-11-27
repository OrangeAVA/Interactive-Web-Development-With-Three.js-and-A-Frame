import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

import { LUTCubeLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/LUTCubeLoader.js";
import { GUI } from "https://unpkg.com/dat.gui@0.7.9/build/dat.gui.module.js";
import { EffectComposer } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/OutputPass.js";

import { HalftonePass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/HalftonePass.js";
import { LUTPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/LUTPass.js";
import { SAOPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/SAOPass.js";
import { SSAOPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/SSAOPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/BokehPass.js";
import { DotScreenPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/DotScreenPass.js";
import { FilmPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/FilmPass.js";
import { GlitchPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/GlitchPass.js";
import { RenderPixelatedPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/RenderPixelatedPass.js";
import { OutlinePass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/OutlinePass.js";
import { AfterimagePass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/AfterimagePass.js";

import { ShaderPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/ShaderPass.js";
import { SobelOperatorShader } from "https://unpkg.com/three@0.153.0/examples/jsm/shaders/SobelOperatorShader.js";

import { TexturePass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/TexturePass.js";
import { SMAAPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/SMAAPass.js";
import { SSAARenderPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/SSAARenderPass.js";
import { TAARenderPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/TAARenderPass.js";
import { SSRPass } from "https://unpkg.com/three@0.153.0/examples/jsm/postprocessing/SSRPass.js";

let renderer,
  scene,
  container,
  camera,
  controls,
  composer,
  halftonePass,
  lutPass,
  lutMap,
  saoPass,
  ssAOPass,
  unrealBloomPass,
  bokehPass,
  dotScreenPass,
  filmPass,
  glitchPass,
  renderPixelatedPass,
  outlinePass,
  afterimagePass,
  sobelOperatorShader,
  texturePass,
  sMAAPass,
  sSAARenderPass,
  tAARenderPass,
  sSRPass,
  outputPass,
  gui;
let plane, cube, sphere, torus;

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

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;

  const backgroundTexture = new RGBELoader().load(
    "../assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    },
  );

  const light01 = new THREE.PointLight(0xffffff, 0.5, 500, 50);
  light01.position.set(4, 5, 5);
  light01.castShadow = true;
  light01.shadow.mapSize.width = light01.shadow.mapSize.height = 1024;
  light01.shadow.radius = 5;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 0.5, 500, 50);
  light02.position.set(-4, 3, 5);
  light02.castShadow = true;
  light02.shadow.mapSize.width = light02.shadow.mapSize.height = 1024;
  light02.shadow.radius = 5;
  scene.add(light02);

  const light03 = new THREE.PointLight(0xffffff, 0.25, 500, 50);
  light03.position.set(-1, 4, -5);
  light03.castShadow = true;
  light03.shadow.mapSize.width = light03.shadow.mapSize.height = 1024;
  light03.shadow.radius = 5;
  scene.add(light03);

  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.set(0, -0.5, 0);
  plane.rotation.set(-Math.PI / 2, 0, 0);
  plane.receiveShadow = true;
  scene.add(plane);

  const geoCube = new THREE.BoxGeometry(1, 1, 1);
  const matCube = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geoCube, matCube);
  cube.position.set(-1.5, 0, 0);
  cube.rotation.set(0, Math.PI / 4, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);

  const geoSphere = new THREE.SphereGeometry(0.5, 16, 16);
  const matSphere = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 1,
    roughness: 0,
  });
  sphere = new THREE.Mesh(geoSphere, matSphere);
  sphere.position.set(0, 0, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  const geoTorus = new THREE.TorusGeometry(0.6, 0.3, 16, 32);
  const matTorus = new THREE.MeshStandardMaterial({
    color: 0xfffff0,
    metalness: 0.8,
    roughness: 0.4,
  });
  torus = new THREE.Mesh(geoTorus, matTorus);
  torus.position.set(1.75, -0.25, 0);
  torus.rotation.set(Math.PI / 2, 0, 0);
  torus.castShadow = true;
  torus.receiveShadow = true;
  scene.add(torus);

  ///Initialize the Post Processing Stack - Composer and Render passes
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);

  ///halftone pass
  halftonePass = new HalftonePass(window.innerWidth, window.innerHeight);
  console.log(halftonePass);
  halftonePass.params = {
    shape: 1,
    radius: 4,
    rotateR: Math.PI / 12,
    rotateG: (Math.PI / 12) * 3,
    rotateB: (Math.PI / 12) * 2,
    scatter: 0,
    greyscale: false,
    disable: false,
  };
  halftonePass.enabled = false;

  ///LUT pass - load the LUT tables to be used in the LUTPass
  lutPass = new LUTPass();
  lutPass.enabled = false;
  console.log(lutPass);
  lutMap = {
    "Bourbon 64.CUBE": null,
    "Chemical 168.CUBE": null,
    "Clayton 33.CUBE": null,
    "Cubicle 99.CUBE": null,
    "Remy 24.CUBE": null,
  };

  Object.keys(lutMap).forEach((name, index) => {
    new LUTCubeLoader().load(
      "https://threejs.org/examples/luts/" + name,
      function (result) {
        lutMap[name] = result;
        ///run setupGUI() when the last LUT table has been loaded
        if (index >= Object.keys(lutMap).length - 1) {
          setupGUI();
        }
      },
    );
  });

  /// SAO pass
  saoPass = new SAOPass(scene, camera);
  console.log(saoPass);
  saoPass.enabled = false;

  /// SSAO pass
  ssAOPass = new SSAOPass(scene, camera);
  console.log(ssAOPass);
  ssAOPass.enabled = false;

  /// Unreal Bloom pass
  unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85,
  );
  unrealBloomPass.enabled = false;
  console.log(unrealBloomPass);

  ///Bokeh pass
  bokehPass = new BokehPass(scene, camera, {
    focus: 1.0,
    aperture: 0.025,
    maxblur: 0.01,
  });
  bokehPass.enabled = false;
  console.log(bokehPass);

  ///DotScreen pass
  dotScreenPass = new DotScreenPass(
    new THREE.Vector2(0, 0), ///center
    0.5, ///angle
    0.8, ///scale
  );
  dotScreenPass.enabled = false;
  console.log(dotScreenPass);

  ///Film pass
  filmPass = new FilmPass();
  filmPass.uniforms.grayscale.value = true;
  filmPass.uniforms.nIntensity.value = 0.35;
  filmPass.uniforms.sIntensity.value = 0.05;
  filmPass.enabled = false;
  console.log(filmPass);

  ///Glitch pass
  glitchPass = new GlitchPass();
  glitchPass.enabled = false;
  console.log(glitchPass);

  ///Pixelated pass
  renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
  renderPixelatedPass.enabled = false;
  renderPixelatedPass.normalEdgeStrength = 0.3;
  renderPixelatedPass.normalEdgeStrength = 0.4;
  console.log(renderPixelatedPass);

  ///Outline pass
  outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera,
  );
  outlinePass.enabled = false;
  outlinePass.edgeStrength = 3;
  outlinePass.edgeGlow = 0;
  outlinePass.edgeThickness = 1;
  outlinePass.usePatternTexture = false;
  console.log(outlinePass);

  ///to enable the usePatternTexture option
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("../assets/images/tri_pattern.jpg", function (texture) {
    outlinePass.patternTexture = texture;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

  ///Afterimage pass
  afterimagePass = new AfterimagePass();
  afterimagePass.uniforms.damp.value = 0.96;
  afterimagePass.enabled = false;
  console.log(afterimagePass);

  ///Shader pass
  sobelOperatorShader = new ShaderPass(SobelOperatorShader);
  console.log(sobelOperatorShader);
  sobelOperatorShader.enabled = false;
  sobelOperatorShader.uniforms["resolution"].value.x =
    window.innerWidth * window.devicePixelRatio;
  sobelOperatorShader.uniforms["resolution"].value.y =
    window.innerHeight * window.devicePixelRatio;

  ///Texture pass
  texturePass = new TexturePass();
  texturePass.enabled = false;
  console.log(texturePass);
  textureLoader.load(
    "../assets/images/background_image_1.jpg",
    function (texture) {
      texturePass.map = texture;
    },
  );

  ///SMAA - Subpixel Morphological Antialiasing
  sMAAPass = new SMAAPass(
    window.innerWidth * renderer.getPixelRatio(),
    window.innerHeight * renderer.getPixelRatio(),
  );
  console.log(sMAAPass);
  sMAAPass.enabled = false;

  ///sSAA - Supersample Antialiasing
  sSAARenderPass = new SSAARenderPass(scene, camera);
  console.log(sSAARenderPass);
  sSAARenderPass.enabled = false;

  ///TAA - Temporal Antialiasing
  tAARenderPass = new TAARenderPass(scene, camera);
  console.log(tAARenderPass);
  tAARenderPass.enabled = false;

  ///SSR - Screen Space reflections
  const groundReflector = null;
  sSRPass = new SSRPass({
    renderer,
    scene,
    camera,
    width: innerWidth,
    height: innerHeight,
    groundReflector: groundReflector ? groundReflector : null,
    selects: groundReflector ? selects : null,
  });
  console.log(sSRPass);
  sSRPass.enabled = false;

  /// Post Processing Stack
  composer.addPass(renderPass);
  composer.addPass(halftonePass);
  composer.addPass(lutPass);
  composer.addPass(saoPass);
  composer.addPass(ssAOPass);
  composer.addPass(unrealBloomPass);
  composer.addPass(bokehPass);
  composer.addPass(dotScreenPass);
  composer.addPass(filmPass);
  composer.addPass(glitchPass);
  composer.addPass(renderPixelatedPass);
  composer.addPass(outlinePass);
  composer.addPass(afterimagePass);
  composer.addPass(sobelOperatorShader);
  composer.addPass(texturePass);
  composer.addPass(sMAAPass);
  composer.addPass(sSAARenderPass);
  composer.addPass(tAARenderPass);
  composer.addPass(sSRPass);

  // composer.addPass(maskPass);
  // composer.addPass(texturePass);

  /// final pass (optional) - to perform sRGB color space conversion
  outputPass = new OutputPass();
  console.log(outputPass);
  composer.addPass(outputPass);

  ///SMAA passe should be applied AFTER outputPass, otherwise it won't work properly
  composer.addPass(sMAAPass);

  animate();
}

function animate() {
  const delta = clock.getDelta();

  controls.update();
  composer.render(delta);

  requestAnimationFrame(animate);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

window.addEventListener("resize", onWindowResize);

function setupGUI() {
  gui = new GUI();

  const halftoneFolder = gui.addFolder("HalfTone Pass");
  halftoneFolder.add(halftonePass, "enabled").name("enabled");
  halftoneFolder
    .add(halftonePass.uniforms.radius, "value", 1, 10, 0.01)
    .name("radius")
    .setValue(halftonePass.uniforms.radius.value);

  const lutFolder = gui.addFolder("LUT Pass");
  lutFolder.add(lutPass, "enabled").name("enabled").setValue(false);

  const lutTable = lutFolder
    .add(lutPass.uniforms.lut, "value", Object.keys(lutMap))
    .name("LUT Table")
    .onChange(function (event) {
      if (!lutPass) return;
      lutPass.lut = lutMap[event].texture3D;
    });
  lutTable.setValue(Object.keys(lutMap)[0]);

  const saoFolder = gui.addFolder("SAO Pass");
  saoFolder.add(saoPass, "enabled").name("enabled").setValue(false);
  saoFolder.add(saoPass.params, "saoIntensity", 0, 1).setValue(0.01);
  saoFolder.add(saoPass.params, "saoScale", 0, 10).setValue(5);
  saoFolder.add(saoPass.params, "saoKernelRadius", 1, 100).setValue(20);
  saoFolder.add(saoPass.params, "saoBlur");
  saoFolder.add(saoPass.params, "saoBlurRadius", 0, 200).setValue(50);
  saoFolder.add(saoPass.params, "saoBlurStdDev", 0.5, 150).setValue(5);

  const ssAOFolder = gui.addFolder("SSAO Pass");
  ssAOFolder.add(ssAOPass, "kernelRadius").min(0).max(32);
  ssAOFolder.add(ssAOPass, "minDistance").min(0.001).max(0.02);
  ssAOFolder.add(ssAOPass, "maxDistance").min(0.01).max(0.3);
  ssAOFolder.add(ssAOPass, "enabled").setValue(false);

  const unrealBloomFolder = gui.addFolder("Unreal Bloom Pass");
  unrealBloomFolder.add(unrealBloomPass, "enabled").setValue(false);
  unrealBloomFolder
    .add(unrealBloomPass, "threshold", 0.0, 1.0)
    .onChange(function (value) {
      unrealBloomPass.threshold = Number(value);
    });

  unrealBloomFolder
    .add(unrealBloomPass, "strength", 0.0, 3.0)
    .onChange(function (value) {
      unrealBloomPass.strength = Number(value);
    });

  unrealBloomFolder
    .add(unrealBloomPass, "radius", 0.0, 1.0)
    .step(0.01)
    .onChange(function (value) {
      unrealBloomPass.radius = Number(value);
    });

  const bokehFolder = gui.addFolder("DoF / Bokeh Pass");
  bokehFolder.add(bokehPass, "enabled").setValue(false);
  bokehFolder
    .add(bokehPass.uniforms.focus, "value", 0.01, 10.0, 0.01)
    .setValue(1.5)
    .name("focus");
  bokehFolder
    .add(bokehPass.uniforms.aperture, "value", 0, 1, 0.01)
    .setValue(0.01)
    .name("aperture");
  bokehFolder
    .add(bokehPass.uniforms.maxblur, "value", 0.0, 0.02, 0.001)
    .setValue(0.01)
    .name("maxblur");

  const dotScreenFolder = gui.addFolder("DotScreen Pass");
  dotScreenFolder.add(dotScreenPass, "enabled").setValue(false);
  dotScreenFolder
    .add(dotScreenPass.uniforms.angle, "value", 0.0, Math.PI, 0.01)
    .setValue(0.5)
    .name("angle");
  dotScreenFolder
    .add(dotScreenPass.uniforms.scale, "value", 0.0, 2, 0.01)
    .setValue(0.8)
    .name("scale");

  const filmFolder = gui.addFolder("Film Pass");
  filmFolder.add(filmPass, "enabled").setValue(false);
  filmFolder
    .add(filmPass.uniforms.grayscale, "value")
    .setValue(1)
    .name("grayscale");
  filmFolder
    .add(filmPass.uniforms.nIntensity, "value", 0.0, 1, 0.01)
    .setValue(0.5)
    .name("nIntensity");
  filmFolder
    .add(filmPass.uniforms.sIntensity, "value", 0.0, 1, 0.01)
    .setValue(0.05)
    .name("sIntensity");

  const glitchFolder = gui.addFolder("Glitch Pass");
  glitchFolder.add(glitchPass, "enabled").setValue(false);
  glitchFolder.add(glitchPass, "goWild").name("continuous").setValue(false);

  const renderPixelatedFolder = gui.addFolder("Pixelated Pass");
  renderPixelatedFolder.add(renderPixelatedPass, "enabled").setValue(false);
  renderPixelatedFolder
    .add(renderPixelatedPass, "pixelSize")
    .min(1)
    .max(16)
    .step(1)
    .onChange(function (value) {
      renderPixelatedPass.setPixelSize(value);
    });
  renderPixelatedFolder
    .add(renderPixelatedPass, "normalEdgeStrength")
    .min(0)
    .max(2)
    .step(0.05);
  renderPixelatedFolder
    .add(renderPixelatedPass, "depthEdgeStrength")
    .min(0)
    .max(1)
    .step(0.05);

  const outlineFolder = gui.addFolder("Outline Pass");
  outlineFolder.add(outlinePass, "enabled").setValue(false);

  outlinePass.params = {
    plane: { enabled: false, object: plane },
    torus: { enabled: false, object: torus },
    cube: { enabled: false, object: cube },
    sphere: { enabled: false, object: sphere },
  };
  outlineFolder
    .add(outlinePass.params.plane, "enabled")
    .setValue(false)
    .name("plane")
    .onChange(function (value) {
      changeOutlineObjects(plane, value);
    });
  outlineFolder
    .add(outlinePass.params.cube, "enabled")
    .setValue(false)
    .name("cube")
    .onChange(function (value) {
      changeOutlineObjects(cube, value);
    });
  outlineFolder
    .add(outlinePass.params.sphere, "enabled")
    .setValue(false)
    .name("sphere")
    .onChange(function (value) {
      changeOutlineObjects(sphere, value);
    });
  outlineFolder
    .add(outlinePass.params.torus, "enabled")
    .setValue(false)
    .name("torus")
    .onChange(function (value) {
      changeOutlineObjects(torus, value);
    });

  outlineFolder
    .add(outlinePass, "edgeStrength", 0.0, 100, 0.01)
    .setValue(3)
    .name("edgeStrength");
  outlineFolder
    .add(outlinePass, "edgeGlow", 0.0, 20, 0.01)
    .setValue(0)
    .name("edgeGlow");
  outlineFolder
    .add(outlinePass, "edgeThickness", 0.0, 50, 0.01)
    .setValue(1)
    .name("edgeThickness");
  outlineFolder
    .add(outlinePass, "usePatternTexture")
    .setValue(false)
    .name("usePatternTexture");

  const changeOutlineObjects = function (object, value) {
    outlinePass.selectedObjects = [];
    Object.values(outlinePass.params).forEach(function (el) {
      if (el.enabled) outlinePass.selectedObjects.push(el.object);
    });
  };

  const afterimageFolder = gui.addFolder("Afterimage Pass");
  afterimageFolder.add(afterimagePass, "enabled").setValue(false);
  afterimageFolder
    .add(afterimagePass.uniforms["damp"], "value", 0, 1)
    .name("damp")
    .step(0.001);

  const sobelOperatorFolder = gui.addFolder("Shader Pass / Sobel shader");
  sobelOperatorFolder.add(sobelOperatorShader, "enabled").setValue(false);

  const textureFolder = gui.addFolder("Texture Pass");
  textureFolder.add(texturePass, "enabled").setValue(false);
  textureFolder.add(texturePass, "opacity", 0, 1, 0.1).setValue(0.5);
  texturePass.blending = "NormalBlending";
  textureFolder
    .add(texturePass, "blending", {
      NormalBlending: 1,
      AdditiveBlending: 2,
      SubtractiveBlending: 3,
      MultiplyBlending: 4,
    })
    .setValue(1)
    .onChange(function (value) {
      texturePass.material.blending = parseFloat(value);
    });

  const sMAAFolder = gui.addFolder("SMAA Pass");
  sMAAFolder.add(sMAAPass, "enabled").setValue(false);

  const sSAARenderFolder = gui.addFolder("SSAA Pass");
  sSAARenderFolder.add(sSAARenderPass, "enabled").setValue(false);
  sSAARenderFolder.add(sSAARenderPass, "sampleLevel", 1, 6, 1).setValue(2);

  const tAARenderFolder = gui.addFolder("TAA Pass");
  tAARenderFolder.add(tAARenderPass, "enabled").setValue(false);
  tAARenderFolder.add(tAARenderPass, "sampleLevel", 0, 5, 1).setValue(2);

  const sSRFolder = gui.addFolder("SSR Pass");
  sSRFolder.add(sSRPass, "enabled").setValue(false);
  sSRFolder.add(sSRPass, "blur").name("blur").setValue(true);
  sSRFolder.add(sSRPass, "opacity", 0, 1, 0.1).name("opacity").setValue(0.5);
  sSRFolder
    .add(sSRPass, "thickness", 0, 0.1, 0.001)
    .name("thickness")
    .setValue(0.5);

  // const maskFolder = gui.addFolder("Mask Pass");
  // maskFolder.add(maskPass, "enabled").setValue(false);

  const outputFolder = gui.addFolder("Output Pass");
  outputFolder.add(outputPass, "enabled").name("enabled").setValue(true);
}

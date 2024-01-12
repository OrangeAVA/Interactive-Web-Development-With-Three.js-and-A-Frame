import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import Stats from "https://unpkg.com/three@0.153.0/examples/jsm/libs/stats.module";
import { GLTFLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";


let renderer, scene, container, camera, controls, stats1, stats2, model, selectedColor = 0, selectedModel = -1, selectedStamp = 0;

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

window.addEventListener("load", function () {
  start();
});

async function start() {

  const textureLoader = new THREE.TextureLoader()
  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  stats1 = new Stats();
  stats1.showPanel(0); // Panel 0 = fps
  stats1.domElement.style.cssText = "position:absolute;top:0px;left:0px;";
  document.body.appendChild(stats1.domElement);

  stats2 = new Stats();
  stats2.showPanel(2);
  stats2.domElement.style.cssText = "position:absolute;top:0px;left:80px;";
  document.body.appendChild(stats2.domElement);

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
  camera.position.set(0, 2, 3);

  const backgroundTexture = new RGBELoader().load(
    "./assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.backgroundBlurriness = 0.5
      //scene.background = new THREE.Color(0xffffff);
      scene.environment = texture;
    },
  );

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target.set(0, 0.5, 0)

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

  const planeGeometry = new THREE.PlaneGeometry(5, 5);
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

  function animate() {
    stats1.update();
    stats2.update();

    controls.update();

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

  //Update shirt color on button press
  function updateShirtColor(newColor = '', newId = 0){
    if (!model) return;
 
     model.traverse((child)=>{
       if (!child.isMesh) return;
 
       child.material.color = new THREE.Color(newColor)
     })

     const colorPickers = document.querySelectorAll('.color-picker')
     selectedColor != -1? colorPickers[selectedColor].classList.remove('selected-color'):null

     selectedColor = newId

     colorPickers[selectedColor].classList.add('selected-color')

   }

  //Update shirt model on button press
  function updateObject(obj = {}, newId = 0)
 {
    //only updates if a new model is selected
    if (newId == selectedModel) return
    
    if (model)
      scene.remove(model)

    model = null

    const textureLoader = new THREE.TextureLoader()
    const normal = textureLoader.load(obj.normal)
    const orm = textureLoader.load(obj.orm)

    normal.flipY = false
    orm.flipY = false
  
    loader.load(
      obj.src,
      function (gltf) {
        model = gltf.scene
        scene.add(model);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.scale.set(0.2, 0.2, 0.2);
  
        gltf.scene.traverse(function (child) {
          if (!child.isMesh) return;
  
          child.castShadow = true;
  
          const childMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            normalMap: normal,
            aoMap: orm,
            side: THREE.DoubleSide,
            envMapIntensity: 1
           });
          child.material = childMaterial;
        });

      model.visible = false

      //update selected element on palette
      const shirtPickers = document.querySelectorAll('.shirt-picker')
      selectedModel != -1? shirtPickers[selectedModel].classList.remove('selected-shirt'): null
      selectedModel = newId
      shirtPickers[newId].classList.add('selected-shirt')

      //update colors and stamps every time the model updates 
      fetch("./assets/params.JSON")
      .then(res => res.json())
      .then(data => {
        updateShirtColor(data.shirtColors[selectedColor], selectedColor)
        updateStamp(data.shirtStamps[selectedStamp], selectedStamp)
        model.visible = true
        })
      },
      function (progress) {},
      function (error) {
        console.error(error);
      },
    );
 }

  //Update shirt stamp on button press. fix transparency
 function updateStamp(stampObj = '', newId = 0){
  
  let map
  let alphaMap = textureLoader.load("./assets/models/Shirt/textures/stamps/alphamap.png")
  if (newId != 0)
  {
    map = textureLoader.load(stampObj.map)
    map.flipY = false
    map.colorSpace = THREE.SRGBColorSpace
  }

  if (!model) return;

   model.traverse((child)=>{
     if (!child.isMesh) return;
      if (map)
      {
        child.material.map = map
        child.material.alphaMap = alphaMap
        child.material.transparent = true
      }
      else
      {
        child.material.map = null
        child.material.alphaMap = null
      }
      child.material.needsUpdate = true
   })

   //update selected element on palette
   const maps = document.querySelectorAll('.stamp-picker')
   maps[selectedStamp].classList.remove('selected-stamp')
   selectedStamp = newId
   maps[selectedStamp].classList.add('selected-stamp')
 }

  //initialize shirt on start
  function initializeShirt () {
    fetch("./assets/params.JSON")
    .then(res => res.json())
    .then(data => {
        updateObject(data.shirtTypes[0], 0)
        updateShirtColor(data.shirtColors[0], 0)
        updateStamp(data.shirtStamps[0], 0)
    })
  }

  //create html palettes
  function createPalletes(){
    fetch("./assets/params.JSON")
    .then(res => res.json())
    .then(data => {
        const colorContainer = document.getElementById('color-palette')
        const shirtContainer = document.getElementById('shirt-palette')
        const stampContainer = document.getElementById('stamp-palette')

        data.shirtColors.map((el, id)=>{
          const node = document.createElement('div')
          node.classList.add('color-picker')

          id == selectedColor? node.classList.add('selected-color') : null

          node.style = `background-color: ${el}`
          node.onclick = () => updateShirtColor(el, id)
          colorContainer.appendChild(node)
        })
    
        data.shirtTypes.map((el, id)=>{
          const node = document.createElement('img')
          node.classList.add('shirt-picker')
          node.src = el.thumb
          node.onclick = () => updateObject(el, id)
          shirtContainer.appendChild(node)
        })

        data.shirtStamps.map((el, id)=>{
          const node = document.createElement('img')
          node.classList.add('stamp-picker')
          node.src = el.thumb
          node.onclick = () => updateStamp(el, id)
          stampContainer.appendChild(node)
        })

        colorContainer.style.display = "flex"
        shirtContainer.style.display = "flex"
        stampContainer.style.display = "flex"
      })
      
  }

  createPalletes()
  initializeShirt()
  animate();
}

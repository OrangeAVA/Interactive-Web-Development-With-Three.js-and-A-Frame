import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";


let renderer, scene, container, camera, controls, modelBase, modelDesign, textureLoader, jsonData;
let selectedColor = 0;
let selectedModel = -1;
let selectedDesign = 0;

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

window.addEventListener("load", function () {
  start();
});


async function start() {

  textureLoader = new THREE.TextureLoader()
  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xe7e7e7 );

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 2, 3);

  const backgroundTexture = new RGBELoader().load(
    "./assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
    },
  );

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target.set(0, 0.5, 0)

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 7);
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 8);
  scene.add(light02);

  const light03 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light03.position.set(-2, 4, -8);
  scene.add(light03);

  dracoLoader.setDecoderPath( "https://www.gstatic.com/draco/versioned/decoders/1.5.6/" );
  loader.setDRACOLoader(dracoLoader);


  // load main json file with all the app parameters and data
  fetch("./js/params.json")
    .then(res => res.json())
    .then(data => {
        jsonData = data;

        // once the json is fully loaded, let's create the UI and initialize the t-shirt
        createUI();
        initializeShirt();
        animate();

  });



  function animate() {
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }


  //Update t-shirt color on button press
  function updateShirtColor(newColor = '', newId = 0) {
    if (!modelBase) return;

    modelBase.traverse((child)=>{
       if (!child.isMesh) return;
       child.material.color = new THREE.Color(newColor);
    })

    //update selected element on palette
    const colorPickers = document.querySelectorAll('.color-picker');

    if (selectedColor != -1) {
      colorPickers[selectedColor].classList.remove('selected-color');
    } 

    selectedColor = newId;
    colorPickers[selectedColor].classList.add('selected-color');

  }

  //Update t-shirt model on button press
  function updateObject(obj = {}, newId = 0) {
    //only updates if a new model is selected
    if (newId == selectedModel) return;

    // we need two t-shirts 3D models in the scene: one is the t-shirt base model which will receive the color
    // the other model is the t-shirt model that will receive the design. As it has transparency on the design map,
    // once the map is applied to the 3D model it will become transparent, so we need a base model to keep
    // the t-shirt in the scene and have the design over it
    
    // if there is a previous t-shirt 3D model in the scene, let's remove it to load a new one
    if (modelBase) scene.remove(modelBase);

    modelBase = null;

    // same for the t-shirt design model
    if (modelDesign) scene.remove(modelDesign);

    modelDesign = null;

    // normal map
    const normal = textureLoader.load(obj.normal);

    //ao + metalness + roughness
    const orm = textureLoader.load(obj.orm);

    normal.flipY = false;
    orm.flipY = false;
  
    loader.load(
      obj.src,
      function (gltf) {

        // load and initialize the base t-shirt model
        modelBase = gltf.scene;
        modelBase.name = 'tshirtBase';
        scene.add(modelBase);;
        modelBase.position.set(0, 0, 0);
        modelBase.scale.set(0.2, 0.2, 0.2);
  
        modelBase.traverse(function (child) {
          if (!child.isMesh) return;
  
          child.castShadow = true;
          child.receiveShadow = true;
  
          const childMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            normalMap: normal,
            aoMap: orm,
            side: THREE.DoubleSide,
            envMapIntensity: 1
           });
          child.material = childMaterial;
        });

        // load and initialize the design t-shirt model. We need to clone gltf.scene otherwise it will be affected by the changes on modelBase
        modelDesign = gltf.scene.clone();
        globalThis.modelDesign = modelDesign;
        modelDesign.name = 'tshirtDesign';
        scene.add(modelDesign);
        modelDesign.position.set(0, 0, 0);
        modelDesign.scale.set(0.2, 0.2, 0.2);

        modelDesign.traverse(function (child) {
          if (!child.isMesh) return;
  
          child.castShadow = true;
          child.receiveShadow = true;
  
          const childMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            normalMap: normal,
            aoMap: orm,
            side: THREE.DoubleSide,
            envMapIntensity: 1
           });
          child.material = childMaterial;
        });

      modelBase.visible = false;
      modelDesign.visible = false;

      //update selected element on palette
      const shirtPickers = document.querySelectorAll('.shirt-picker');
      if (selectedModel != -1) {
        selectedModel = shirtPickers[selectedModel].classList.remove('selected-shirt');
      } else {
        selectedModel = null;
      }
      selectedModel = newId;
      shirtPickers[newId].classList.add('selected-shirt');

      //update colors and desings every time the model updates 
      updateShirtColor(jsonData.shirtColors[selectedColor], selectedColor)
      updateDesign(jsonData.shirtDesigns[selectedDesign], selectedDesign)
      modelBase.visible = true
      modelDesign.visible = true
    });
  }

  // Update shirt design on button press
  function updateDesign(designObj = '', newId = 0){
    let map;

    map = textureLoader.load(designObj.map);
    map.flipY = false;
    map.colorSpace = THREE.SRGBColorSpace;

    if (!modelDesign) return;

    // apply the design on the modelDesign 3D model
    modelDesign.traverse((child)=>{
       if (!child.isMesh) return;
        if (map)
        {
          child.material.map = map;
          child.material.transparent = true;
        }
        else {
          child.material.map = null;
        }
        child.material.needsUpdate = true;
    })

    //update selected element on palette
    const maps = document.querySelectorAll('.design-picker');
    maps[selectedDesign].classList.remove('selected-design');
    selectedDesign = newId;
    maps[selectedDesign].classList.add('selected-design');
 }

  //initialize shirt on start
  function initializeShirt() {
    updateObject(jsonData.shirtTypes[0], 0);
    updateShirtColor(jsonData.shirtColors[0], 0);
    updateDesign(jsonData.shirtDesigns[0], 0);
  }

  //create UI
  function createUI(){
    const colorContainer = document.getElementById('color-palette');
    const shirtContainer = document.getElementById('shirt-palette');
    const designContainer = document.getElementById('design-palette');
    
    // load shirtColors from JSON and populates the UI color container
    jsonData.shirtColors.map((el, id)=> {
      const node = document.createElement('div');
      node.classList.add('color-picker');

      if (id == selectedColor) {
        node.classList.add('selected-color');
      }

      node.style = `background-color: ${el}`
      node.onclick = () => updateShirtColor(el, id)
      colorContainer.appendChild(node)
    })

    // load shirtTypes from JSON and populates the UI shirt types
    jsonData.shirtTypes.map((el, id)=>{
      const node = document.createElement('img');
      node.classList.add('shirt-picker');
      node.src = el.thumb;
      node.onclick = () => updateObject(el, id);
      shirtContainer.appendChild(node);
    })

    // load shirtDesigns from JSON and populates the UI shirt designs
    jsonData.shirtDesigns.map((el, id) => {
      const node = document.createElement('img');
      node.classList.add('design-picker');
      node.src = el.thumb;
      node.onclick = () => updateDesign(el, id);
      designContainer.appendChild(node);
    })

    colorContainer.style.display = "flex";
    shirtContainer.style.display = "flex";
    designContainer.style.display = "flex";
      
  }

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

window.addEventListener("resize", onWindowResize);
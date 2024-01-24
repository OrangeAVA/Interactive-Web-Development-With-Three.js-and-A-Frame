import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";
import { TransformControls } from "https://unpkg.com/three@0.153.0/examples/jsm/controls/TransformControls.js";

let clickableObjects = []
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const minDragDistance = 10;

let renderer, scene, container, camera, controls, textureLoader, jsonData, sceneData, openedMenu = -1, initializeData;
let selectedBox, selectedBoxHelper;
let transformControls;
let selectedObject = null;
let intersectedObject = null;
let canSelect = true;
let currentTransformMode = 0;
let isDown = false;
let isDragging = false;
let startCoords = { x: 0, y: 0 };
let endCoords = { x: 0, y: 0 };

const transformModes = ["translate", "rotate", "scale"];

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();

function onPointerMove( event ) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

//displays the light UI if any is selected
function displayLightUI(){
  if (!selectedObject) return;
  selectedObject.traverse((element)=>{
    if (element.isLight)
    {
      const control = selectedObject.getObjectByName('control')

      //show light slider UI
      const LightUI = document.getElementById("light-adjustments-container")
      LightUI.style.display = "flex"

      const intensityNode = document.getElementById("light-intensity-input")
      intensityNode.value = element.intensity
      
      const newColor = "#" + element.color.getHexString(THREE.SRGBColorSpace)
      const colorNode = document.getElementById("light-color-input")
      
      colorNode.value = newColor

      const intensityText = document.getElementById("light-intensity-text")
      const colorText = document.getElementById("light-color-text")

      intensityText.innerHTML = `Intensity: ${element.intensity}`
      colorText.innerHTML = `color: ${newColor}`

      //detect changes on light input
      function changeIntensity(event,element){
        element.intensity = event.target.value
        intensityText.innerHTML = `Intensity: ${event.target.value}`
      } 

      intensityNode.oninput = (event) => changeIntensity(event,element)

      //detect changes on color input
      function changeColor(event,element){
        element.color = new THREE.Color(event.target.value)
        colorText.innerHTML = `Color: ${event.target.value}`
        control.material.color = new THREE.Color(event.target.value)
      } 
      colorNode.oninput = (event) => changeColor(event,element)
    }
  })
}

//hides light UI
function hideLightUI(){
  const LightUI = document.getElementById("light-adjustments-container")
  LightUI.style.display = "none"
}

//handle mouse click on objects and outside of it
//for selection and de-selection
function mouseClickOnObject(event){

  if (isDragging) return;

  //click on object. Only if it is selectable
  if (!canSelect) return;
  if (event.button != 0) return;
  if (event.target.localName != "canvas") return;

  if (intersectedObject) {
    if (selectedObject) {
      transformControls.detach();
    }
      

    transformControls.attach(intersectedObject)
    selectedObject = intersectedObject

    selectedBox.setFromObject(selectedObject, true);

    //hides the light UI and only displays it again if a light is selected
    hideLightUI()
    displayLightUI()
  }
  //unselect object
  else
  {
    transformControls.detach(selectedObject)
    selectedObject = null
    selectedBox.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
    hideLightUI()
  }
}

//deletes the selected object
function deleteSelectedObject(){
  if (selectedObject)
  {
    const index = clickableObjects.indexOf(selectedObject)
    
    //for safety
    if (index != -1)
    {
      clickableObjects.splice(index, 1)
      transformControls.detach()
      scene.remove(selectedObject)
      selectedObject = null

      //hides light UI provided a light is deleted
      hideLightUI()
    }
  }
}

//handles all key events
function handleKeys(event){
  switch (event.key.toLowerCase()) {
    case 'q':
      changeTransformMode(0)
      break;
    case 'w':
      changeTransformMode(1)
      break;
    case 'e':
      changeTransformMode(2)
      break;
    case 'delete':
      deleteSelectedObject()
      break;
    case 'l':
      addLight(new THREE.Vector3(0,1,0))
      break;
    default:
      break;
  }
}

//initializes the UI transform buttons
function initTransformModes(){
  const transformModeElements = document.getElementById('mode-buttons-container')
  const tranformModeChildren = transformModeElements.getElementsByClassName('mode-btn')

  tranformModeChildren[0].classList.add('control-selected')

  for (let i = 0; i < tranformModeChildren.length; i++) {
    tranformModeChildren[i].onclick = () =>{
      changeTransformMode(i)
      transformControls.attach(selectedObject.object)
    }
  }
}

//closes object menu
function closeMenu(){
  if (openedMenu == -1) return;
  const menu = document.getElementById('menu-container')
  menu.style.display = "none"

  const categoryPalette = document.getElementById('category-palette')
  const categoryChildren = categoryPalette.childNodes

  categoryChildren[openedMenu].classList.remove('selected-category')
  openedMenu = -1;
}

//opens object menu
function openMenu(category){
  const categoryPalette = document.getElementById('category-palette')
  const categoryChildren = categoryPalette.childNodes

  if (openedMenu != -1)
    categoryChildren[openedMenu].classList.remove('selected-category')
  openedMenu = category.id
  categoryChildren[openedMenu].classList.add('selected-category')

  const menu = document.getElementById('menu-container')
  menu.style.display = "flex"

  const header = document.getElementById('menu-header')

  const title = document.getElementById('menu-title')
  title.innerText = category.name

  const closeBtn = document.getElementById('menu-close-btn')
  closeBtn.onclick = () => closeMenu()

  const contents = document.getElementById('menu-contents')
  contents.innerHTML = ""

  //filter objects based on the category
  jsonData.objects.filter((element)=>{
    return category.objects.includes(element.id)
  })
  //creates an object UI for each of them
  .map((element)=>{
    const newObject = document.createElement('article')
    const newObjectTitle = document.createElement('p')
    const newObjectImage = document.createElement('img')

    newObject.classList.add("object-container")
    newObject.onclick = () => addObject(element)

    newObjectTitle.innerText = element.name
    newObjectTitle.classList.add("object-title")

    newObjectImage.src = `./assets/images/furniture/${element.path}.jpg`
    newObjectImage.classList.add("object-image")

    newObject.appendChild(newObjectTitle)
    newObject.appendChild(newObjectImage)
    
    //appends a new object to the menu
    contents.appendChild(newObject)
  })
}

//Querys the object and initializes the categoty UI
function createUI(){
  const categories = document.getElementById('category-palette');

  // load the categories from JSON and populates the UI
  jsonData.categories.map((el, id)=>{
    const category = document.createElement('div');
    category.classList.add('category')
    category.onclick = () => openMenu(el, id);

    const text = document.createElement('h3');
    text.classList.add('category-text')
    text.innerHTML = el.name

    const node = document.createElement('img');
    node.classList.add('category-img');
    node.src = el.thumb;

    categories.appendChild(category)
    
    category.appendChild(text);
    category.appendChild(node);
  })
  categories.style.display = "flex";
}

//adds an object into a position
function addObject(object, 
                   position = new THREE.Vector3(0,0,0), 
                   rotation = new THREE.Vector3(0,0,0), 
                   scale = new THREE.Vector3(1,1,1),
                   select = true
                   ){
  const modelPath = `./assets/models/furniture/${object.path}.glb`

  loader.load(modelPath, (gltf)=>{
    const model = gltf.scene;
    selectedObject = model

    model.traverse(function(object){
      if (object.isMesh)
      {
        object.castShadow = true
        object.receiveShadow = true
      }
    })

    //all objects belong to a group so we can transform it as a whole
    const group = new THREE.Group()
    group.position.copy(position)

    group.rotation.setFromVector3(rotation)
    group.scale.copy(scale)

    group.add(model)
    group.name = 'group'

    clickableObjects.push(group)
    scene.add( group );
    selectedBox.setFromObject(group, true);

    if (transformControls && select)
    {
      transformControls.attach(group)
      selectedObject = group
    }
  })

  //closes the menu if it is open
    closeMenu()
}

//adds a light into a position
function addLight(position = new THREE.Vector3(0,1,0), intensity= 1, color = "#ffffff", select = true){
    //group to control the light
    const lightControlGroup = new THREE.Group()
    lightControlGroup.position.copy(position);
  
    //mesh to represent the light. Will be a simple wireframe
    const lightControlGeometry = new THREE.SphereGeometry(0.15,2,2);
    const lightControlMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: new THREE.Color(color), wireframeLinewidth: 5});
    const light01ControlMesh = new THREE.Mesh(lightControlGeometry, lightControlMaterial);
    light01ControlMesh.name = "control"
    
    //the point light itself. It will be accessed to control its intensity
    const light01 = new THREE.PointLight(color, intensity, 500, 50);
    light01.castShadow = true;
    light01.shadow.bias = -0.0001

    light01.name = "light"
    
    //adds the mesh and the light
    lightControlGroup.add(light01);
    lightControlGroup.add(light01ControlMesh)

    lightControlGroup.name = 'group'
    clickableObjects.push(lightControlGroup)

    scene.add( lightControlGroup );

    //selects last clicked light
    if (transformControls && select)
    {
      transformControls.attach(lightControlGroup)
      selectedObject = lightControlGroup
      displayLightUI()
    }
}

//Initialize the UI buttons
function initButtons(){
  const addLightBtn = document.getElementById('add-light-btn')
  const deleteObjectBtn = document.getElementById('delete-obj-btn')

  addLightBtn.onclick = () =>{
    addLight()
  }

  deleteObjectBtn.onclick = () =>{
   deleteSelectedObject();
  }
}

//handles transform modes: move, rotate and scale
function changeTransformMode(modeID){
  const transformModeElements = document.getElementById('mode-buttons-container')
  const tranformModeChildren = transformModeElements.getElementsByClassName('mode-btn')

  tranformModeChildren[currentTransformMode].classList.remove('control-selected')

  currentTransformMode = modeID
  transformControls.setMode(transformModes[currentTransformMode])
  tranformModeChildren[currentTransformMode].classList.add('control-selected')
}

//initializes a default scene loaded from the JSON in the line 470
async function initializeObjects() {

  await sceneData.map(async el => {
    
    if (el.type == "object")
    {
      const object = jsonData.objects.filter((object)=>{
        return object.id == el.id
      })

      const position = new THREE.Vector3(el.position[0], el.position[1], el.position[2])
      const rotation = new THREE.Vector3(el.rotation[0]* Math.PI / 180.0, el.rotation[1]* Math.PI / 180.0, el.rotation[2]* Math.PI / 180.0)
      const scale = new THREE.Vector3(el.scale[0], el.scale[1], el.scale[2])

      addObject(object[0], position, rotation, scale, false)
    }
    else if (el.type == "light") {
      const position = new THREE.Vector3(el.position[0], el.position[1], el.position[2])
      addLight(position, el.intensity, el.color, false)
    }
    
  });
    
  await Delay(100);

  transformControls.detach()
  selectedObject = null
  selectedBox.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));

}

window.addEventListener('mouseup', mouseClickOnObject)

window.addEventListener('mousemove', onPointerMove );

window.addEventListener('keydown', handleKeys );

window.addEventListener("load", function () {
  start();
});

async function start() {

  initTransformModes()
  initButtons()

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
  camera.position.set(4, 3, 3);

  //setup of helper that appears over selected objects
  selectedBox = new THREE.Box3();
  selectedBox.setFromCenterAndSize(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));
  selectedBoxHelper = new THREE.Box3Helper(selectedBox, 0xffff00);
  scene.add(selectedBoxHelper);

  const backgroundTexture = new RGBELoader().load(
    "./assets/bg/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
      scene.backgroundBlurriness = 0.1;
    },
  );

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target.set(0, 0.5, 0)


  dracoLoader.setDecoderPath( "https://www.gstatic.com/draco/versioned/decoders/1.5.6/" );
  loader.setDRACOLoader(dracoLoader);

  //setting tranform controls
  transformControls = new TransformControls(camera,  renderer.domElement);
  transformControls.addEventListener( 'dragging-changed', function ( event ) {
    controls.enabled = ! event.value;
    canSelect = !event.value;
  });

  transformControls.setTranslationSnap( 0.05 );
  transformControls.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
  transformControls.setScaleSnap( 0.1 );

  scene.add(transformControls)

  // load main json file with all the app parameters and data
  fetch("./js/params.json")
    .then(res => res.json())
    .then(data => {
        jsonData = data;

        // once the params JSON is fully loaded, let's create the UI
        createUI();

        //you can have different default scene setups (or even integrate it with a backend!)
        //just change the scene01.json or load scene02.json or any other JSON file with the same structure
        fetch("./js/scene01.json")
          .then(res => res.json())
          .then(data => {
              sceneData = data;
              initializeObjects()
              animate();
        })

  })
  

  function animate() {
    controls.update();
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length)
      {
        let childObject = intersects[0].object
        
        if (childObject)
        {
          while (childObject?.parent?.name != 'group') {
            childObject = childObject.parent
          }
  
          if (childObject.parent)
            childObject = childObject.parent
          intersectedObject = childObject
        }

      }
    else {
      intersectedObject = null;
    }
      
    if (selectedObject) selectedBox.setFromObject(selectedObject, true);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

window.addEventListener("resize", onWindowResize);


//prevent the user from selecting objects when dragging the camera/orbitControls
document.onmousedown = function() {
  isDown = true;
};

document.onmouseup = function() {
  isDown = false;
};

document.onmousemove = function() {
  if (!isDown) {
    isDragging = false;
    return;
  };
  isDragging = true;
};


const Delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};
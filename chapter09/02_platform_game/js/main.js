import * as THREE from "three";
import { PerspectiveCamera } from "three";

let renderer, scene, container, camera, world, character, characterBody;

//the default world material for physics simulation
const defaultMat = new CANNON.Material()

//what objects to update each frame
let objectsToUpdate = []
let coins = []
let flags = []
let enemies = [];
let environmentElements = [];

//character variables
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveLeft = false;
let moveRight = false;
let jump = false;
let characterRaycaster = new THREE.Raycaster()

//character constants
const JUMPFORCE = 5;
const PLAYERSPEED = 150
const ENEMYSPEED = 1

//Game state helpers
const clock = new THREE.Clock();
let oldElapsedTime = 0
let isReady = false;

//controls the states of the game
const gameStates = ["menu", "playing", "paused", "complete"]
let gameState = gameStates[0]

//stage settings
const STAGETILESIZE = 1.0
let groundTiles = []
let groundTileMeshes = [] //those will be checked by the player rayvast, to check if it is grounded. it allows the player to jump
let currentStage = 0
let stageCoinCount = 0 //coin count at the start of a stage. reset if player dies

//Camera settings
const CAMERAHEIGHT = 0.5; //extra camera height
const BOTTOMHEIGHT = 1.0; //extra height for bottom camera limit. so the tiles end won't show
const CAMERABLEED = 1.75  //extra camera bleeding to the sides
let cameraTarget = null   //helper for smoothly character following

const cameraSizes = {
  left:   -5 * window.innerWidth/window.innerHeight,
  right:   5 * window.innerWidth/window.innerHeight,
  top:     5,
  bottom: -5
}//camera size on the 4 sides. Will help to limit the camera bounds

//the camera limits. Where the camera will clamp to the sides
//it changes according to the loaded level
const cameraLimits = {
  left: -CAMERABLEED - cameraSizes.left, 
  right: 28 -cameraSizes.right + CAMERABLEED,
  top: 11 - cameraSizes.top + CAMERAHEIGHT + CAMERABLEED, 
  bottom: -CAMERABLEED - cameraSizes.bottom + CAMERAHEIGHT + BOTTOMHEIGHT, 
}

//stage event variables
let stageCompleted = false
let characterDied = false
const stages = ["level1", "level2", "level3"]

window.addEventListener("load", function () {
  start();
});

async function start() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#B4D4FF")

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container = document.querySelector("#threejsContainer");
  container.appendChild(renderer.domElement);

  setupLocalStorage()
  await physicsSetup();
  await loadStagesData(currentStage)
  
  setupCamera();

  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(20, 5, 5);
  light01.castShadow = true;
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(0, 3, 5);
  light02.castShadow = true;
  scene.add(light02);

  const light03 = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(light03);

  createListeners();
  setupUIButtons();
  animate();

  function animate() {
    
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    updateCamera(deltaTime);
    updatePhysicalBodies()
    updateCoins(elapsedTime, deltaTime)
    updateEnemies(elapsedTime,deltaTime)
    updateFlags()
    updateCharacter(deltaTime)
    renderer.render(scene, camera);

    //only request next frame not paused nor menu
    if (gameState != "playing") return

    requestAnimationFrame(animate);
    world.step(1/60, deltaTime, 3)
  }

  //unpauses game and unfreeze simulation
  function unpauseGame(){
    gameState = "playing"

    const menuUI = document.getElementById("menu-ui")
    menuUI.style.display = "none"

    const pauseUI = document.getElementById('pause-ui')
    pauseUI.style.display = "none"

    const gameCompleteUI = document.getElementById('game-completed-ui')
    gameCompleteUI.style.display = "none"

    const gameOverUI = document.getElementById('game-over-ui')
    gameOverUI.style.display = "none"

    //resets clock
    clock.start()
    oldElapsedTime = clock.getElapsedTime()

    requestAnimationFrame(animate)
  }

  //restarts from stage 1
  //also reopens main menu
  function restartGame(){
    console.log('restart game')
    currentStage = 0
    stageCoinCount = 0
    updateCoinCount(0)
    updateLivesCount(3)

    unpauseGame()
    deleteStage()
    loadStagesData(currentStage, true)
  }

  //handles game pause
  function handlePause(){
    console.log(gameState)
    //pauses if it is playing in playing state only
    if (gameState == "playing")
    {
      //sets new state and opens menu
      gameState = "paused"
      clock.stop()
      
      const pauseUI = document.getElementById('pause-ui')
      pauseUI.style.display = "flex"
    }
  }

  //gives functions to the UI buttons
  function setupUIButtons(){
    //handles start of game menu. It starts the game
    const startGameButton = document.getElementById("start-game")
    startGameButton.onclick = function(){
      unpauseGame()
    }

    //unpauses game
    const resumeGameButton = document.getElementById("resume-game")
    resumeGameButton.onclick = function(){
      unpauseGame()
    }

    //returns to menu
    const restartGameButton = document.getElementById("restart-game")
    restartGameButton.onclick = function(){
      restartGame()
    }

    const restartGameButton2 = document.getElementById("restart-game-2")
    restartGameButton2.onclick = function(){
      restartGame()
    }
  }

  //listen to key presses and events
  function createListeners() {
    document.addEventListener("keydown", function (event) {
      switch (event.code) {
        case "KeyA": case "ArrowLeft":
          moveLeft = true;
          break;
        case "KeyD": case "ArrowRight":
          moveRight = true;
          break;
        case "Space":
          jump = true;
          break;
        case "Escape": case "Enter":
          handlePause()
          break;
      }
    });
  
    document.addEventListener("keyup", function (event) {
      switch (event.code) {
        case "KeyA": case "ArrowLeft":
          moveLeft = false;
          break;
        case "KeyD": case "ArrowRight":
          moveRight = false;
          break;
        case "Space":
          jump = false;
          break;
      }
    });
  
    document.addEventListener("mousedown", function () {
      if (!isReady) return;
    });
  
    window.addEventListener("resize", onWindowResize);

    //pauses the game if the screen is not visible
    //this will make the simulation pause
    document.addEventListener("visibilitychange", function(){
      if (document.hidden)
      {
        handlePause()
      }
    });

  }
}

//sets up a local storage for coin and lives count
//it will be saved in the player's local storage. This data persists!
function setupLocalStorage(){
  localStorage.setItem("coins", 0);
  localStorage.setItem("lives", 3);

  const livesUI = document.getElementById('lives')
  const coinsUI = document.getElementById('coins')

  coinsUI.innerText = `Coins =${localStorage.getItem("coins")}`
  livesUI.innerText = `Lives = ${localStorage.getItem("lives")}`
}

//updates local storage and UI
function updateCoinCount(newCointCount){
  localStorage.setItem("coins", newCointCount)

  const coinsUI = document.getElementById('coins')
  coinsUI.innerText = `Coins =${localStorage.getItem("coins")}`
}

//updates local storage and UI
function updateLivesCount(newLifeCount){
  localStorage.setItem("lives", newLifeCount)

  const livesUI = document.getElementById('lives')
  livesUI.innerText = `Lives = ${localStorage.getItem("lives")}`
}

//updates the position of the meshes according to its physical bodies
function updatePhysicalBodies(){
  for (const object of objectsToUpdate) {
    //console.log(object)
    object.body.position.z = 0;
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
    //console.log(object.mesh.position.y)
    
    //delete objects if it goes below y -3
    //better dne with event listeners I think!
    if (object.mesh.position.y < -3)
    {
        scene.remove(object.mesh)
        const index = objectsToUpdate.indexOf(object)
        objectsToUpdate.splice(index,1)
        //object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)
        //console.log(objectsToUpdate)
    }
}
}

function setupCharacter(pos={x: 0, y:0, z: 0}){
  const characterGeo = new THREE.BoxGeometry(0.6,0.6,0.6,2,2,2)
  const characterMat = new THREE.MeshStandardMaterial({color: 'blue'});
  character = new THREE.Mesh(characterGeo, characterMat);
  character.castShadow = true;
  character.position.set(pos.x, pos.y, pos.z);
  
  scene.add(character)

  character.geometry.computeBoundingSphere()
  character.bbox = new THREE.Sphere(character.position, character.geometry.boundingSphere.radius - 0.1)

  const characterShape = new CANNON.Sphere(0.3);
  characterBody = new CANNON.Body({mass: 1, material: defaultMat, shape: characterShape})
  characterBody.position.copy(character.position)

  world.addBody(characterBody);
  //checks collision with the ground to allow jumping
  characterRaycaster = new THREE.Raycaster(character.position, new THREE.Vector3(0,-1,0),0.05,characterGeo.parameters.height/2 + 0.1)
}

//kills character if it is not dead already
//runs only once per stage gen
function killCharacter(){
  if (!characterDied)
  {
    console.log("character has lost a life!")
    characterDied = true
    
    //lose a life
    let lives = parseInt(localStorage.getItem("lives"))
    lives -= 1
  
    //gameover
    if (lives <=0)
    {
      console.log('game over')
      gameState = "gameover"
      const gameoverUI = document.getElementById('game-over-ui')
      gameoverUI.style.display = "flex"
    }
    else
    {
      //reset coin count
      updateCoinCount(stageCoinCount)
      updateLivesCount(lives)
  
      deleteStage()
      loadStagesData(currentStage)
    }
  }
}

//updates character on each frame
function updateCharacter(delta){
  if (gameState != "playing") return;
  
  if (character)
  {
    velocity.x -= velocity.x * 10.0 * delta;
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    //deactivates player movement ou pause
    if ((moveLeft || moveRight)) {
      velocity.x = direction.x * PLAYERSPEED * delta
    };

    characterBody.allowSleep = false;

    character.position.copy(characterBody.position)
    characterBody.velocity.x = velocity.x
    characterBody.position.z = 0;

    //sets a ray downwards starting from the caracter position
    characterRaycaster.set(character.position, new THREE.Vector3(0, -1, 0))

    const intersects = characterRaycaster.intersectObjects(groundTileMeshes)
   console.log(intersects)

    if (jump && intersects.length)
    {
      characterBody.velocity.y = JUMPFORCE;
      jump = false;
    }

    if (character.position.y < 0)
    {
      killCharacter()
    }

  }
}

//creates an enemy at a position
function createEnemy(position){
  const enemyGeo = new THREE.BoxGeometry(0.45,0.45,0.45,2,2,2)
  const enemyMat = new THREE.MeshStandardMaterial({color: 'red'});
  const enemy  = new THREE.Mesh(enemyGeo, enemyMat);
  enemy.castShadow = true;
  enemy.position.copy(position)

  //the raycaster will check if enemies are close to an edge. If they are, they turn around
  const rayVertical = new THREE.Raycaster(enemy.position, new THREE.Vector3(0,-1,0),0.05,enemyGeo.parameters.height/2 + 0.2)

   //they also turn around if they are moving and hit a wall
  const rayHorizontal = new THREE.Raycaster(enemy.position, new THREE.Vector3(1,0,0),0.05,enemyGeo.parameters.width/2 + 0.05)
  
  enemy.rayVertical = rayVertical
  enemy.rayHorizontal = rayHorizontal
  enemy.turnTime = 0;
  enemy.direction = 1;

  scene.add(enemy)

  enemy.geometry.computeBoundingSphere()
  enemy.bbox = new THREE.Sphere(enemy.position, enemy.geometry.boundingSphere.radius - 0.1)

  const enemyShape = new CANNON.Sphere(0.225);
  const enemyBody = new CANNON.Body({mass: 1, material: defaultMat, shape: enemyShape})
  enemyBody.position.copy(enemy.position)
  enemyBody.direction = 1;

  world.addBody(enemyBody);

  enemies.push({mesh: enemy, body: enemyBody})
}

//updates all enemies in the stage
function updateEnemies(elapsedTime, deltaTime){
  if (gameState != "playing") return 
  enemies.forEach(enemy => {
    const enemySize = enemy.mesh.geometry.parameters.width/2
    let enemyVelocity = 0
    let falling = enemy.body.velocity.y < 0

    enemyVelocity = lerp(enemy.body.velocity.x, enemy.mesh.direction * ENEMYSPEED, 10*deltaTime)

    //checks for ground in front of the enemy
    //if there's no ground, turn around
    enemy.mesh.rayVertical.set(
      new THREE.Vector3(enemy.body.position.x + enemy.mesh.direction * (enemySize), enemy.body.position.y, enemy.body.position.z), 
      new THREE.Vector3(0, -1, 0))
    //console.log(enemy.mesh.rayVertical)
    
    const inersectsDown = enemy.mesh.rayVertical.intersectObjects(groundTileMeshes)
    //console.log(inersectsDown)
    if (!inersectsDown.length && enemy.mesh.turnTime > 1.0)
    {
      enemy.mesh.direction *= -1;
      enemy.mesh.turnTime = 0
    }

    //collides with the wall on the left or the right
    //sets the direction of the raycaster
    enemy.mesh.rayHorizontal.set(enemy.mesh.position, new THREE.Vector3(1 * enemy.mesh.direction, 0, 0))

    //detects a collision. If it collides with a wall it will flip
    const intersectsRight = enemy.mesh.rayHorizontal.intersectObjects(groundTileMeshes)
    if (intersectsRight.length && enemy.mesh.turnTime > 1.0)
    {
      //console.log(intersectsRight)
      enemy.mesh.direction *= -1;
      enemy.mesh.turnTime = 0
    }
    
    enemy.mesh.turnTime += deltaTime

    enemy.body.velocity.x = enemyVelocity
    enemy.body.position.z = 0;
    enemy.mesh.position.copy(enemy.body.position)

    if (character)
    if (enemy.mesh.bbox.intersectsSphere(character.bbox)){
      console.log('character touched enemy')
      killCharacter()
    }
  });
}

//setups the camera and its target
function setupCamera(){
  camera = new PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.01, 100)
  camera.position.set(0,1,7)
  
  cameraTarget = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshBasicMaterial({color: 'white'}))
  cameraTarget.position.copy(character.position)
  cameraTarget.visible = false
  
  scene.add(camera)
  scene.add(cameraTarget)
}

//updates the camera
//smoothly follows the player
function updateCamera(deltaTime){

  if (!character) return
  const newCameraTargetPosition = {
    x: lerp(cameraTarget.position.x,character.position.x, deltaTime * 10),
    y: lerp(cameraTarget.position.y,character.position.y+CAMERAHEIGHT, deltaTime * 10),
    z: lerp(cameraTarget.position.z,character.position.z, deltaTime * 10),
  }

  //we clamp the camera target position to accout for max and min camera limits.
  //it also accounts for the camera size

  cameraTarget.position.x = clamp(newCameraTargetPosition.x, cameraLimits.left, cameraLimits.right)
  cameraTarget.position.y = clamp(newCameraTargetPosition.y, cameraLimits.bottom, cameraLimits.top)

  camera.position.x = cameraTarget.position.x;
  camera.position.y = cameraTarget.position.y;


  camera.lookAt(new THREE.Vector3(cameraTarget.position.x, cameraTarget.position.y -CAMERAHEIGHT, cameraTarget.position.z));
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

//color variation material for stage tiles
const stageTileMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.5,
  roughness: 0.5,
  color: '#cccccc'
})
const stageTileMaterial2 = new THREE.MeshStandardMaterial({
metalness: 0.5,
roughness: 0.5,
color: '#eeeeee'
})

const foregroundMateiral = new THREE.MeshStandardMaterial({
metalness: 0.5,
roughness: 0.5,
color: '#aaa'
})

const backgroundMaterial = new THREE.MeshStandardMaterial({
metalness: 0.5,
roughness: 0.5,
color: '#777'
})

//fetches data from the stages.json file and loads a stage
async function loadStagesData(curStageNumber, openMenu = false){
  let curStage = stages[curStageNumber % (stages.length)]
  
  await fetch("./js/stages.json")
    .then(res => res.json())
    .then(data => {
        //loads the current stage "level1"
        const stage = data[curStage].tiles

        //changes the camera limits on the stage according to the selected stage
        cameraLimits.top = stage.length-1 - cameraSizes.top + CAMERAHEIGHT + CAMERABLEED,
        cameraLimits.right = stage[0].length-1 -cameraSizes.right + CAMERABLEED

        //loads stage elements according to the "tiles" object
        for (let i = stage.length-1; i >= 0; i--) { //loops from bottom to top
          for (let j = 0; j < stage[i].length; j++) { //loops from left to right
            //creates ground tile
            if (stage[i][j] == 1)
            {
              const tilePos = new THREE.Vector3(j*STAGETILESIZE,(stage.length-1-i)*STAGETILESIZE,0)
              createStageTile({x: 1, y: 1, z: 1}, tilePos, (i + j)%2 == 0? stageTileMaterial : stageTileMaterial2)
            }
            //create coin collectible
            if (stage[i][j] == 2)
            {
              createCoin(0.2, new THREE.Vector3(j,stage.length-1-i,0))
            }
            //creates enemies
            if (stage[i][j] == 3)
            {
              createEnemy(new THREE.Vector3(j,stage.length-1-i,0))
            }
            //creates Stage End Flag
            if (stage[i][j] == 4)
            {
              createFlag(new THREE.Vector3(j,stage.length-1-i,0))
            }
            //creates Player
            if (stage[i][j] == 5)
            {
              setupCharacter({x: j, y: stage.length-1-i, z: 0})
            }
          }
        }

        const foreground = data[curStage].foreground
        //loads foreground
        foreground.forEach(element => {
          const pos = new THREE.Vector3(Math.ceil(element.position.x + element.scale.x/2), element.position.y + element.scale.y/2-1, element.position.z)
          createNonPhysicsBox(element.scale, pos, foregroundMateiral)
        });

        const background = data[curStage].background
        //loads foreground
        background.forEach(element => {
          const pos = new THREE.Vector3(Math.ceil(element.position.x + element.scale.x/2), element.position.y + element.scale.y/2-3, element.position.z)
          createNonPhysicsBox(element.scale, pos, backgroundMaterial)
        });

        characterDied = false
        stageCompleted = false

        //reopens menu for game restart
        if (openMenu)
        {
          gameState = "menu"
          const menuUI =document.getElementById('menu-ui')
          menuUI.style.display = "flex"
        }


  })
}

//setup physics world
async function physicsSetup() {
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.allowSleep = true

  const defaultContactMat = new CANNON.ContactMaterial(
      defaultMat, 
      defaultMat,
      {
          friction: 0.0,
          restitution: 0.0
      }
      )
  
  world.addContactMaterial(defaultContactMat)
  world.defaultContactMaterial = defaultContactMat
}

//creates a box without physics
//used for the environment
function createNonPhysicsBox(sizes, position, material){
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sizes.x, sizes.y, sizes.z,2,2,2),
      material
    )
    mesh.position.copy(position)
    mesh.castShadow = true
    environmentElements.push(mesh)
    scene.add(mesh)
}

//creates a physical box for the ground
function createStageTile(sizes, position, material){
  const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sizes.x, sizes.y, sizes.z,2,2,2),
      material
  )
  mesh.position.copy(position)
  mesh.receiveShadow = true
  scene.add(mesh)

  //cannon physics object
  const shape = new CANNON.Box(new CANNON.Vec3(sizes.x*0.5, sizes.y*0.5, sizes.z*0.5))
  const body = new CANNON.Body({
      shape: shape,
      mass: 0,
      position: position,
      material: defaultMat
  })

  world.addBody(body)
  groundTiles.push({mesh: mesh, body: body})
  groundTileMeshes.push(mesh)
}

//geometry and material for coins
const coinGeometry = (radius) => new THREE.IcosahedronGeometry(radius, 0)
const coinMaterial = new THREE.MeshStandardMaterial(
  {
      metalness: 0.5,
      roughness: 0.2,
      color: '#D9D002'
  }
)

//creates a coin
const createCoin = (radius, position) =>{
  const mesh = new THREE.Mesh(
      coinGeometry(radius),
      coinMaterial
  )
  mesh.position.copy(position)
  mesh.geometry.computeBoundingSphere()
  mesh.initialPosition = position
  mesh.scale.z = 0.5
  scene.add(mesh)

  //bounding box for collision detection
  mesh.bbox = new THREE.Sphere( mesh.position, mesh.geometry.boundingSphere.radius );
  coins.push(mesh)
}

//updates all coins
function updateCoins(currentTime, deltaTime) {
  //check for collisions with coins
  coins.forEach((coin, id) => {

    coin.rotation.y += deltaTime
    coin.position.y = coin.initialPosition.y + Math.sin(currentTime) * 0.1

    if (coin.bbox.intersectsSphere(character.bbox)){
      console.log('coin collected')

      //adds a cointo the count
      let coinCount = parseInt(localStorage.getItem("coins"))
      coinCount += 5;
      
      updateCoinCount(coinCount)
      coins.splice(id, 1)
      scene.remove(coin)
    }
  })
}

//creates a flag for level completion
//made of multiple meshes in a group
const createFlag = (position) =>{
  const flagTopGeo = new THREE.ConeGeometry(0.2, 0.5, 10, 10, false)
  const flagBottomGeo = new THREE.BoxGeometry(0.05, 1.5, 0.05)

  const flagTopMat = new THREE.MeshStandardMaterial({color: 'red'})
  const flagBottomMat = new THREE.MeshStandardMaterial({color: 'white'})

  const meshTop = new THREE.Mesh(
      flagTopGeo,
      flagTopMat
  )
  meshTop.rotation.z = Math.PI/2
  meshTop.position.y = 0.5;
  meshTop.position.x = -0.275;
  meshTop.scale.z = 0.2;

  const meshBottom = new THREE.Mesh(
    flagBottomGeo,
    flagBottomMat
)
  
  const group = new THREE.Group()
  group.add(meshTop)
  group.add(meshBottom)

  group.position.copy(position)
  group.position.z = 0

  group.bbox = new THREE.Box3( new THREE.Vector3(position.x - 0.2, position.y, position.z - 0.2), new THREE.Vector3(position.x + 0.2, position.y + 1.5, position.z + 0.2))
  scene.add(group)

  flags.push(group)
}

//updates flags
function updateFlags() {
  //check for collisions with flags
  flags.forEach((flag) => {
    if (flag.bbox.intersectsSphere(character.bbox) && !stageCompleted){
      stageCompleted = true
      currentStage += 1

      //the game was completed!
      if (currentStage == stages.length)
      {
         gameState = "complete"
         const gameCompleteUI = document.getElementById('game-completed-ui')

         const gameCompleteCoinCountUI = document.getElementById('game-complete-coin-count')
         gameCompleteCoinCountUI.innerText = `You Collected ${localStorage.getItem("coins")} coins!`

         const gameCompleteLivesCountUI = document.getElementById('game-complete-lives-count')
         gameCompleteLivesCountUI.innerText = `You Completed the game with ${localStorage.getItem("lives")} lives remaining!`

         gameCompleteUI.style.display = "flex"
      }
      //loads new level
      else
      {
        stageCoinCount = parseInt(localStorage.getItem("coins"))

        deleteStage()
        loadStagesData(currentStage)
      }
    }
  })
}

//dispose of everything in new stage
function deleteStage() {
  enemies.forEach((enemy)=>{
    world.remove(enemy.body)
    scene.remove(enemy.mesh)
  })

  groundTiles.forEach((tile)=>{
    world.remove(tile.body)
    scene.remove(tile.mesh)
  })

  flags.forEach((flag)=>{
    scene.remove(flag)
  })

  environmentElements.forEach((environment)=>{
    scene.remove(environment)
  })

  coins.forEach(coin => {
    scene.remove(coin)
  });

  world.remove(characterBody)
  scene.remove(character)

  character = null
  characterBody = null
  enemies = []
  groundTiles = []
  flags = []
  environmentElements = []
  coins = []
  objectsToUpdate = []
  groundTileMeshes = []
}

//linearly interpolates a value smoothly
function lerp (start, end, t){
  return (1-t)*start+t*end
}

//limits the value to a max, and min
function clamp(num, min, max){
  return Math.min(Math.max(num, min), max);
}
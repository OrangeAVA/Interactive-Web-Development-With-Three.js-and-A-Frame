import * as THREE from "three";

let renderer, scene, camera, canvas;
const boxRandomPosition = 15;        //The objects will spawn randomly in a box of 15m3
const parallaxPosAmplitude = 1.0     //By how much the camera will translate with the mouse cursor
const parallaxRotAmplitude = 0.15    //By how much the camera will rotate with the mouse cursor
const parallaxSpeedMultiplier = 4    //how fast it reaches the desired position in parallax
const distancebetweenScreens = 30    //how much the 3D world moves in a distance of 1vh (1 screen vertically)
let scrollY = window.scrollY         //the current scroll value. 0 at the top

//keeps the sizes of the screen
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

//keeps the cursor coordinates
const cursor = {
  x : 0,
  y : 0
}

setupEventListeners()

async function start() {
  //setup renderer
  canvas = document.getElementById("webglCanvas")
  renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
  scene = new THREE.Scene();
  renderer.setSize(window.innerWidth, window.innerHeight);

  //ramdomly spanws geometries around position
  //(count, geometry, position)
  createGeometries(50, new THREE.BoxGeometry(1,1,1), new THREE.Vector3(0,0,0))
  createGeometries(50, new THREE.TorusGeometry(0.5,0.1,4,20), new THREE.Vector3(0,-30,0))
  createGeometries(50, new THREE.SphereGeometry(0.5, 8,8), new THREE.Vector3(0,-60,0))

  //adds the camera to a group. We move the group for parallax, and the camera itself for scroll
  //this is so that both values do not collide with each other
  const cameraGroup = new THREE.Group()
  scene.add(cameraGroup)

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 5);
  cameraGroup.add(camera)
  
  //threejs clock instance. We use deltatime to make the experience frame rate independent
  const clock = new THREE.Clock(true)
  let previousTime = 0
  
  animate();

  function animate() {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //animates the camera using the scroll. It linearly interpolates to new position
    //ScrollY/sizes.height = 1 for a scroll of 1 screen.
    camera.position.y = lerp(camera.position.y, -scrollY / sizes.height * distancebetweenScreens, 5*deltaTime)
    camera.rotation.y = lerp(camera.rotation.y, -Math.sin(scrollY / sizes.height * Math.PI/2) * Math.PI/8, 5*deltaTime)

    //animates a parallax effect on mouse move
    const parallaxPosX = cursor.x * parallaxPosAmplitude
    const parallaxPosY = -cursor.y * parallaxPosAmplitude

    const parallaxRotX = cursor.x * parallaxRotAmplitude
    const parallaxRotY = -cursor.y * parallaxRotAmplitude

    //updates camera position
    cameraGroup.position.x +=  (parallaxPosX - cameraGroup.position.x) * parallaxSpeedMultiplier * deltaTime
    cameraGroup.position.y += (parallaxPosY - cameraGroup.position.y) * parallaxSpeedMultiplier * deltaTime
    cameraGroup.position.z +=  ((parallaxPosY + parallaxPosX)*2.0 - cameraGroup.position.z) * parallaxSpeedMultiplier * deltaTime * 3

    //updates camera rotation
    cameraGroup.rotation.x +=  (parallaxRotY - cameraGroup.rotation.x) * parallaxSpeedMultiplier * deltaTime
    cameraGroup.rotation.y +=  (parallaxRotX - cameraGroup.rotation.y) * parallaxSpeedMultiplier * deltaTime

    renderer.render(scene, camera);
    
    requestAnimationFrame(animate);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
  }

  window.addEventListener("resize", onWindowResize);
}

function createGeometries(count, geometry, centerPosition)
{
  let wireGeometry = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

  for (let i = 0; i < count; i++) {
    let wireMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 5 , transparent: true} );

      const randomPosition = new THREE.Vector3(
        (Math.random() - 0.5) * boxRandomPosition * 2.0,
        (Math.random() - 0.5) * boxRandomPosition * 2.0,
        (Math.random() - 1.0) * boxRandomPosition * 2.0
        )

      let wireframe = new THREE.LineSegments( wireGeometry, wireMaterial );

      //objects further away are transparent
      wireframe.material.opacity = 1.0-Math.pow(randomPosition.z/(boxRandomPosition * 2.0), 2) 
      //generates random colors
      wireframe.material.color = new THREE.Color(Math.random(), Math.random(), Math.random())
      wireframe.position.copy(randomPosition)
      wireframe.position.add(centerPosition)
      scene.add(wireframe)
  }
}

function setupEventListeners(){
  //updates cursor coordinates from [-0.5, 0.5]
  window.addEventListener('mousemove', (event) =>{
    cursor.x = (event.clientX/sizes.width-0.5)
    cursor.y = (event.clientY/sizes.height-0.5)
  })

  //updates scroll value
  window.addEventListener('scroll', () =>{
    scrollY = window.scrollY
  })

  window.addEventListener("load", function () {
    start();
  });

}

//linear interpolation function
function lerp (start, end, t){
  return (1-t)*start+t*end
}

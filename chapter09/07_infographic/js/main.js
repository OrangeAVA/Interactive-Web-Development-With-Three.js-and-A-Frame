import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

let renderer, scene, camera, labelRenderer;
const graphXSize = 3.5      //the graph size on X axis
const graphYSize = 2        //thegraph size on Y axis
const graphWallsGap = 0.15  //the graph separation from the walls
const titleGap = 1          //the title separation

setupEventListeners()

async function start() {
  //setup renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild( renderer.domElement );

  //setup label renderer
  //it is used to draw 2D text on 3D space
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( window.innerWidth, window.innerHeight );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild( labelRenderer.domElement );

  scene = new THREE.Scene();

  //setup camera
  const cameraGroup = new THREE.Group()
  scene.add(cameraGroup)
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1, 5);
  cameraGroup.add(camera)
  
  //setup background for reflections
  const backgroundTexture = new RGBELoader().load(
    "assets/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
      scene.backgroundBlurriness = 0.3
    },
  );

  //orbit controls. it uses the labelrenderer
  const controls = new OrbitControls( camera, labelRenderer.domElement );

  //scene light
  const pointLight = new THREE.PointLight(0xffffff, 1, 50)
  pointLight.position.z = 5
  pointLight.position.y = 5  
  pointLight.castShadow = true
  pointLight.shadow.mapSize.set(2048,2048)
  scene.add(pointLight)

  drawGraph()
  animate();

  function animate() {
    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera)
    
    requestAnimationFrame(animate);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
  }

  window.addEventListener("resize", onWindowResize);
}

function drawGraph(){
  //the whole graph will be put into a group
  //we can scale it as a whole later
  const graphGroup = new THREE.Group()
  
  //settings for line extrusion
  const extrudeSettings = { 
    steps: 6,
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.0075,
    bevelOffset: 0.01,
    bevelSegments: 10
  };


  //infographic title
  const titleDiv = document.createElement( 'div' );
  titleDiv.className = 'label';
  titleDiv.textContent = `GDP Contribution from AR and VR, USA and Rest of the World - US$ - PwC Estimates`;
  titleDiv.style.backgroundColor = 'transparent';
  titleDiv.style.fontSize = '22px';

  const titleLabel = new CSS2DObject( titleDiv );
  titleLabel.position.set(0,3,0);
  scene.add(titleLabel)



  fetch("js/data.json")
  .then(res => res.json())
  .then(data =>{  
      //loop through each line, and create a geometry for it
      data.graphs.forEach((graph)=>{
        const material = new THREE.MeshStandardMaterial({color: graph.color, roughness: 0.1, metalness: 0.3})
      
        //creates a shape based on the json data
        const lineShape = new THREE.Shape();
        lineShape.moveTo(0,graph["y"][0]/700 * graphYSize)

        for (let i = 0; i < graph["y"].length; i++) {
          let value = graph["y"][i]/700 * graphYSize
          lineShape.lineTo(i * graphXSize/(graph["y"].length-1),value)
        }

        for (let i = graph["y"].length-1; i >= 0; i--) {
          let value = graph["y"][i]/700 * graphYSize
          lineShape.lineTo(i * graphXSize/(graph["y"].length-1),value+ 0.01)
        }

        //extrudes the shape
        const geometry = new THREE.ExtrudeGeometry( lineShape, extrudeSettings );
        const mesh = new THREE.Mesh( geometry, material );

        mesh.castShadow = true
        mesh.receiveShadow = true

        //gets the bounding box size so we can separate the lines
        const boundingBox = new THREE.Box3()
        boundingBox.setFromObject(mesh)
        const sizes = new THREE.Vector3()
        boundingBox.getSize(sizes)

        mesh.position.z = graph.id * sizes.z
        graphGroup.add(mesh)
      })
   
      //adds the graph to a group, so it can be centered as a whole
      scene.add(graphGroup)
      const boundingBox = new THREE.Box3()
      boundingBox.setFromObject(graphGroup)

      const sizes = new THREE.Vector3()
      boundingBox.getSize(sizes)

      graphGroup.bbox = boundingBox
      graphGroup.position.x -=sizes.x/2
      graphGroup.position.z -=sizes.z/2 

      //add graph planes
      //floor
      const floorGeo = new THREE.PlaneGeometry(sizes.x, sizes.z + graphWallsGap,2,2)
      const floorMaterial = new THREE.MeshStandardMaterial({color: "gray", roughness: 0.5})
      const floorMesh = new THREE.Mesh(floorGeo, floorMaterial)
      floorMesh.rotation.x = -Math.PI/2
      floorMesh.receiveShadow = true
      scene.add(floorMesh)

      //side wall
      const wallSideGeo = new THREE.PlaneGeometry(sizes.z + graphWallsGap, sizes.y + graphWallsGap,2,2)
      const wallSideMesh = new THREE.Mesh(wallSideGeo, floorMaterial)
      wallSideMesh.rotation.y = Math.PI/2
      wallSideMesh.position.x = -sizes.x/2
      wallSideMesh.position.y = sizes.y/2 + graphWallsGap/2
      wallSideMesh.receiveShadow = true
      scene.add(wallSideMesh)

      //back wall
      const wallBackGeo = new THREE.PlaneGeometry(sizes.x, sizes.y + graphWallsGap,2,2)
      const wallBackMesh = new THREE.Mesh(wallBackGeo, floorMaterial)
      wallBackMesh.position.y = sizes.y/2 + graphWallsGap/2
      wallBackMesh.position.z = -sizes.z/2 - graphWallsGap/2
      wallBackMesh.receiveShadow = true
      scene.add(wallBackMesh)

      //draw lines and labels
      const lineMaterial = new THREE.LineDashedMaterial( 
      { 
        color: 0xCCCCCC,
        dashSize: 0.1,
        gapSize: 0.05, 
        width: 3
      });

      //separation of each line
      let wallLinesInterval = 1 / (data.parameters.yLines) * graphYSize

      //data of each line
      let wallDataInterval = (1 / (data.parameters.yLines)) * (data.parameters.yLimits[1] - data.parameters.yLimits[0])

      //draws lines on the walls and its labels
      //side wall
      for (let i = 0; i < data.parameters.yLines+1; i++) {
        //makes some points to draw a line
        const points = [];
        points.push( new THREE.Vector3( -sizes.x/2 + 0.01, wallLinesInterval*i, -sizes.z/2 - graphWallsGap/2) );
        points.push( new THREE.Vector3( -sizes.x/2 + 0.01, wallLinesInterval*i, sizes.z/2 + graphWallsGap/2) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, lineMaterial );
        scene.add( line );
        line.computeLineDistances();
      
        //create labels for the lines
        const labelDiv = document.createElement( 'div' );
        labelDiv.className = 'label';
        labelDiv.textContent = `${(data.parameters.yLimits[0] + wallDataInterval * i).toFixed(0)}`;
        labelDiv.style.backgroundColor = 'transparent';
  
        const numberLabel = new CSS2DObject( labelDiv );
        numberLabel.position.set(-sizes.x/2 + 0.01 - 0.1, wallLinesInterval*i, sizes.z/2 + graphWallsGap/2);
        scene.add(numberLabel)
      }

      //back wall
      for (let i = 0; i < data.parameters.yLines+1; i++) {
        //makes some points to draw a line
        const points = [];
        points.push( new THREE.Vector3( -sizes.x/2, wallLinesInterval*i, -sizes.z/2 - graphWallsGap/2 + 0.01) );
        points.push( new THREE.Vector3( sizes.x/2, wallLinesInterval*i, -sizes.z/2 - graphWallsGap/2 + 0.01) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, lineMaterial );
        scene.add( line );
        line.computeLineDistances();

        //create labels for the lines
        const labelDiv = document.createElement( 'div' );
        labelDiv.className = 'label';
        labelDiv.textContent = `${(data.parameters.yLimits[0] + wallDataInterval * i).toFixed(0)}`;
        labelDiv.style.backgroundColor = 'transparent';

        const numberLabel = new CSS2DObject( labelDiv );
        numberLabel.position.set(sizes.x/2 + 0.1, wallLinesInterval*i, -sizes.z/2 - graphWallsGap/2 + 0.01);
        scene.add(numberLabel)
      }
      //separation of each line
      let floorLinesInterval = 1 / (data.parameters.xLines) * graphXSize

      //data of each line
      let floorDataInterval = (1 / (data.parameters.xLines)) * (data.parameters.xLimits[1] - data.parameters.xLimits[0])

      //Floor
      for (let i = 0; i < data.parameters.xLines+1; i++) {
        //makes some points to draw a line
        const points = [];
        points.push( new THREE.Vector3( -sizes.x/2 + floorLinesInterval*i, 0.01, -sizes.z/2 - graphWallsGap/2 + 0.01) );
        points.push( new THREE.Vector3( -sizes.x/2 + floorLinesInterval*i, 0.01, sizes.z/2 + graphWallsGap/2 + 0.01) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, lineMaterial );
        scene.add( line );
        line.computeLineDistances();

        //create labels for the lines
        const labelDiv = document.createElement( 'div' );
        labelDiv.className = 'label';
        labelDiv.textContent = `${(data.parameters.xLimits[0] + floorDataInterval * i).toFixed(0)}`;
        labelDiv.style.backgroundColor = 'transparent';

        const numberLabel = new CSS2DObject( labelDiv );
        numberLabel.position.set(-sizes.x/2 + floorLinesInterval*i, -0.1, sizes.z/2 + graphWallsGap/2 + 0.01);
        scene.add(numberLabel)
      }

      //titles and legend
      for (let i = 0; i < data.graphs.length; i++) {
          //creates box to represent the legend
          const graph = data.graphs[i]
          const boxGeometry = new THREE.BoxGeometry(0.1,0.1,0.1)
          const boxMaterial = new THREE.MeshStandardMaterial({color: graph.color, roughness: 0.2, metalness: 0.3})
          const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)

          boxMesh.position.set(-sizes.x/2 + i * titleGap, -0.3, sizes.z/2)
          boxMesh.castShadow = true
          boxMesh.receiveShadow = true
          scene.add(boxMesh)

          //create labels for the boxes
          const labelDiv = document.createElement( 'div' );
          labelDiv.className = 'label';
          labelDiv.style.color = `${graph.color}`
          labelDiv.textContent = `${graph.name}`;
          labelDiv.style.backgroundColor = 'transparent';

          const numberLabel = new CSS2DObject( labelDiv );
          numberLabel.position.set(0.25,0,0);
          boxMesh.add(numberLabel)
      }

      scene.position.y -= 1
  })
}


function setupEventListeners(){
  window.addEventListener("load", function () {
    start();
  });
}
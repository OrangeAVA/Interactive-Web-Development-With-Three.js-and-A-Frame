import * as THREE from "three";
import { RGBELoader } from "https://unpkg.com/three@0.153.0/examples/jsm/loaders/RGBELoader.js";

let renderer, scene, container, camera;

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
  camera.position.set(0, 1, 5);

  const backgroundTexture = new RGBELoader().load(
    "./assets/images/pisa.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;

      //HDR maps are heavy, don't forget to render the scene again!
      render();
    },
  );

  const geometrySphere = new THREE.SphereGeometry(0.35, 16, 16);


  /// Mesh Basic Material
  const materialSphere01 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const sphere01 = new THREE.Mesh(geometrySphere, materialSphere01);
  sphere01.position.set(-3, 1.5, 0);
  scene.add(sphere01);


  /// Mesh Phong Material
  const materialSphere02 = new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0xffffff, shininess: 50 });
  const sphere02 = new THREE.Mesh(geometrySphere, materialSphere02);
  sphere02.position.set(-2, 1.5, 0);
  scene.add(sphere02);


  /// Mesh Lambert Material
  const materialSphere03 = new THREE.MeshLambertMaterial({
    color: 0xff0000
  });
  const sphere03 = new THREE.Mesh(geometrySphere, materialSphere03);
  sphere03.position.set(-1, 1.5, 0);
  scene.add(sphere03);


  /// Mesh Standard Material (PBR) - metallic
  const materialSphere04a = new THREE.MeshStandardMaterial({ color: 0x0000ff, metalness: 1, roughness: 0 });
  const sphere04a = new THREE.Mesh(geometrySphere, materialSphere04a);
  sphere04a.position.set(0, 2.5, 0);
  scene.add(sphere04a);


  /// Mesh Standard Material (PBR) - metallic rough
  const materialSphere04b = new THREE.MeshStandardMaterial({
    color: 0x00ccff,
    metalness: 1,
    roughness: 0.25,
  });
  const sphere04b = new THREE.Mesh(geometrySphere, materialSphere04b);
  sphere04b.position.set(0, 1.5, 0);
  scene.add(sphere04b);


  /// Mesh Standard Material (PBR) - full rough
  const materialSphere04c = new THREE.MeshStandardMaterial({
    color: 0x00ccff,
    metalness: 0,
    roughness: 1,
  });
  const sphere04c = new THREE.Mesh(geometrySphere, materialSphere04c);
  sphere04c.position.set(0, 0.5, 0);
  scene.add(sphere04c);


  /// Mesh Physical Material (PBR)
  const materialSphere05 = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    ior: 1.5,
    transmission: 1,
    opacity: 1,
    transparent: true,
    side: THREE.DoubleSide
  });
  const sphere05 = new THREE.Mesh(geometrySphere, materialSphere05);
  sphere05.position.set(1, 1.5, 0);
  scene.add(sphere05);


  /// Toon material

  const materialSphere06 = new THREE.MeshToonMaterial( { color: 0xff0000 } );
  const sphere06 = new THREE.Mesh(geometrySphere, materialSphere06);
  sphere06.position.set(2, 1.5, 0);
  scene.add(sphere06);


  /// Sprite material - used along with THREE.Sprite()
  const map = new THREE.TextureLoader().load(
    './assets/images/three-js-logo.png',
    function ( texture ) {
        const spriteMaterial = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
        const sprite = new THREE.Sprite( spriteMaterial );
        sprite.position.set(3, 1.5, 0);
        scene.add( sprite );
    }
  );


  const light01 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light01.position.set(4, 5, 5);
  scene.add(light01);

  const light02 = new THREE.PointLight(0xffffff, 1, 500, 50);
  light02.position.set(-4, 3, 5);
  scene.add(light02);


  render();
  

  function render() {
    renderer.render(scene, camera);
  }

}

AFRAME.registerComponent('scene-environment', {

    schema: {
        enabled: {default: true},
        hdrImage: {default: ''},
        hdrExposure: {default: 1}
    },

    init: function() {

      let enabled = this.data.enabled;
      let hdrImage = this.data.hdrImage;
      let hdrExposure = this.data.hdrExposure;
      
      if (!enabled) return;

      const sceneEl = this.el;
      const scene = sceneEl.object3D;
      const renderer = sceneEl.renderer;

      new THREE.RGBELoader()
        .load( hdrImage, function ( texture ) {

          texture.mapping = THREE.EquirectangularReflectionMapping;
          
          scene.background = texture;
          scene.environment = texture;

          renderer.toneMapping = THREE.LinearToneMapping;
          renderer.toneMappingExposure = hdrExposure;

          renderer.outputEncoding = THREE.sRGBEncoding;

      } );
    },
    update: function() {
    },
    tick: function() {
    }
});

AFRAME.registerComponent('art-pieces', {

  schema: {
      path: {default: ""},
      customScale: {default: 2}
  },

  init: function() {

    //console.log(this.data.path)
    const el = this.el

    fetch(this.data.path)
      .then((response)=> response.json())
      .then((json) => 
      {
        //console.log(json)
        //console.log(el)
       
        Object.keys(json).map((pieceKey, index) =>{
          
          const curPiece = json[pieceKey] 
          
          el.innerHTML += `
          <a-box 
          material="src: ${curPiece.src}"
          scale=" ${curPiece.dimensions[1] * curPiece.customScale} ${curPiece.dimensions[0] * curPiece.customScale} 0.08"
          position="${curPiece.position[0]} ${curPiece.position[1]} ${curPiece.position[2]}"
          rotation="${curPiece.rotation[0]} ${curPiece.rotation[1]} ${curPiece.rotation[2]}"
          >
          </a-box>
          `
        })
      })
  },
  update: function() {
  },
  tick: function() {
  }
});

AFRAME.registerComponent('mesh-basic-material', {
  
  schema: {
    map: {default: ""},
},
  
  init: function(){
      let el = this.el;
      let mapSrc = this.data.map
      let texture = new THREE.TextureLoader().load(mapSrc)
      
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace
      
      el.addEventListener("model-loaded", e =>{
          el.object3D.traverse(function(node){
              if (node.isMesh){                           
                  node.material = new THREE.MeshBasicMaterial({
                    map: texture
                  })
                  node.material.needsUpdate = true;
              }
          });
      });
  }
}); 
AFRAME.registerComponent('art-room-material', {
  
  schema: {
    map: {default: ""},
},
  
  init: function() {
      let el = this.el;
      let mapSrc = this.data.map;
      let texture = new THREE.TextureLoader().load(mapSrc);
      
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      
      el.addEventListener("model-loaded", e =>{
          el.object3D.traverse(function(child){
              if (child.isMesh){                           
                  child.material = new THREE.MeshStandardMaterial({
                    map: texture
                  })
                  child.material.needsUpdate = true;
              }
          });
      });
  }
}); 


AFRAME.registerComponent('art-pieces', {

  schema: {
      path: {default: ""}
  },

  init: function() {

    const el = this.el;

    
    fetch(this.data.path)
      .then((response)=> response.json())
      .then((json) => 
      {
       
        Object.keys(json).map((artPieceKey, index) =>{
          
          const currentArtPiece = json[artPieceKey];
          
          // load paints
          if (currentArtPiece.type === "paint") {
            el.innerHTML += `
              <a-box 
                material="src: ${currentArtPiece.src}"
                scale=" ${currentArtPiece.dimensions[1] * currentArtPiece.customScale} ${currentArtPiece.dimensions[0] * currentArtPiece.customScale} 0.08"
                position="${currentArtPiece.position[0]} ${currentArtPiece.position[1]} ${currentArtPiece.position[2]}"
                rotation="${currentArtPiece.rotation[0]} ${currentArtPiece.rotation[1]} ${currentArtPiece.rotation[2]}"
                data-index="${index}"
                class="clickable artpiece"
                shadow="cast: true; receive: true"
              >
              </a-box>
            `;
          }

          //load models
          else
          {
            el.innerHTML += `
              <a-entity
                  gltf-model="${currentArtPiece.src}"
                  rotation="${currentArtPiece.rotation[0]} ${currentArtPiece.rotation[1]} ${currentArtPiece.rotation[2]}"
                  position= "${currentArtPiece.position[0]} ${currentArtPiece.position[1]} ${currentArtPiece.position[2]}" 
                  scale="${currentArtPiece.customScale} ${currentArtPiece.customScale} ${currentArtPiece.customScale}"
                  data-index="${index}"
                  class="clickable artpiece"
                  shadow="cast: true; receive: true"
              >
              </a-entity>
            `;
          }
        })


        //add click event listener to the art pieces
        const artPieces = document.querySelectorAll('.clickable.artpiece');
        
        artPieces.forEach(function(element) {
          const index = element.dataset.index;

          element.addEventListener('click', function() {
            const artPieceData = Object.entries(json)[index][1];
            openPopup(artPieceData);
          })
        })
      })
  }
});




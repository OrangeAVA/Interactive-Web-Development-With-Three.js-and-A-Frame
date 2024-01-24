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



AFRAME.registerComponent('product-component', {
  schema: {
    color: {type: 'color', default: '0x000000'},
  },
  init: function () {
    const scope = this;

    scope.changeColor = function(element, color) {

      const elementMesh = element.getObject3D('mesh');

      elementMesh.traverse(function(child) {
        if (child.isMesh && (child.name === 'product_base' || (child.name === 'product_hood'))) {
          child.material.color.setHex(color);
        }
      })
    }

  },
  update: function () {
    const scope = this;
    if (!scope.el.getObject3D('mesh')) {
      scope.el.addEventListener("model-loaded", (e) => {
        scope.changeColor(scope.el, scope.data.color);
      })
    } else {
      scope.changeColor(scope.el, scope.data.color);
    }
  },
  tick: function () {
  },
  remove: function () {
    
  }
});




AFRAME.registerComponent("tap-to-place", {
  schema: {
    enabled: { default: false },
  },
  init: function () {
  },
  
  tick: function () {
    if (document.getElementById("camera") && this.data.enabled) {
      let camrot = document.getElementById("camera").getAttribute("rotation");
      let ra = ((camrot.y % 360) + 360) % 360; // ra - Restricted angle

      this.el.object3D.rotation.y = ra * (Math.PI / 180)
    }

  },
});


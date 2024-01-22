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


AFRAME.registerComponent('group-opacity', {
  schema: {default: 1.0},
  init: function () {
  },
  update: function () {

    const mesh = this.el.object3D;

    var data = this.data;
    if (!mesh) { return; }

    mesh.traverse(function (node) {
      
      if (node.isMesh) {

        if (node.el.components.text) {
          node.el.setAttribute('opacity', data);
        }

        node.material.opacity = data;
        node.material.needsUpdate = true;

        if (node.material.opacity <= 0) {
          node.visible = false;
        } else {
          node.visible = true;
        }
      }
    });
  }
});

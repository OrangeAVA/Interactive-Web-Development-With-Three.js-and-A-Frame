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

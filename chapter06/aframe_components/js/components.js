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


AFRAME.registerComponent('character-tshirt', {
  schema: {
    color: {type: 'color', default: '0x000000'},
  },
  init: function () {
    const scope = this;

    scope.changeCandleColor = function(element, color) {

      const elementMesh = element.getObject3D('mesh').children[0];

      elementMesh.traverse(function(child) {
        if (child.isMesh && child.name === 'Wolf3D_Outfit_Top') {
          child.material.color.setHex(color);
        }
      })
    }

  },
  update: function () {
    const scope = this;
    if (!scope.el.getObject3D('mesh')) {
      scope.el.addEventListener("model-loaded", (e) => {
        scope.changeCandleColor(scope.el, scope.data.color);
      })
    } else {
      scope.changeCandleColor(scope.el, scope.data.color);
    }
  },
  tick: function () {
  },
  remove: function () {
    
  }
});



AFRAME.registerComponent('helmet-float', {
  schema: {
    amount: {type: 'number', default: 1}
  },
  init: function () {
    this.currentY = 1;
    this.newY = this.currentY + this.data.amount;
  },
  update: function () {
    this.el.setAttribute('animation__float','property:position.y; from: '+this.currentY+'; to:'+this.newY+'; dur: 1000; ; easing: easeInOutElastic; loop: true; dir: alternate;')
  },
  tick: function () {
  },
  remove: function () {
    this.el.removeAttribute('animation__float');
    this.el.setAttribute('animation__back','property:position.y; to:'+this.currentY+'; dur: 1000; ; easing: easeInOutElastic; loop: false;')
    setTimeout(()=>{
      this.el.removeAttribute('animation__back');
    }, 1100);
  }
});



AFRAME.registerComponent('candle-holder-glass', {
  schema: {
    color: {type: 'color', default: '0x000000'},
  },
  init: function () {
    const scope = this;

    scope.changeCandleColor = function(element, color) {
      element.object3D.traverse(function(child) {
        if (child.isMesh && child.name === 'CandleHolder-glass') {
          child.material.color.setHex(color);
        }
      })
    }
  },
  update: function () {
    const scope = this;

    if (!scope.el.getObject3D('mesh')) {
      scope.el.addEventListener("model-loaded", (e) => {
        scope.changeCandleColor(scope.el, scope.data.color);
      })
    } else {
      scope.changeCandleColor(scope.el, scope.data.color);
    }
  },
  tick: function () {
  },
  remove: function () {
    
  }
});


AFRAME.registerComponent("look-ahead", {
  multiple: true,
  schema: {
    enabled: { default: false },
  },

  init: function () {
    this.lookAheadMessage = document.querySelector('#look_ahead_message');
  },

  tick: function () {
    if (document.getElementById("camera") && this.data.enabled) {
      let camrot = document.getElementById("camera").getAttribute("rotation");
      
      if (camrot.y < 45 && camrot.y > -45) {
        this.lookAheadMessage.classList.remove('show');
      } else {
        this.lookAheadMessage.classList.add('show');
      }
    }
    
  },
});
AFRAME.registerComponent('nav-pointer', {
  init: function () {
    const el = this.el;

    // On click, send the NPC to the target location.
    el.addEventListener('click', (e) => {
      const ctrlEl = el.sceneEl.querySelector('[nav-agent]');
      ctrlEl.setAttribute('nav-agent', {
        active: true,
        destination: e.detail.intersection.point
      });
    });

    // When hovering on the nav mesh, show a green cursor.
    el.addEventListener('mouseenter', () => {
      el.setAttribute('material', {color: 'green'});
    });
    el.addEventListener('mouseleave', () => {
      el.setAttribute('material', {color: 'crimson'})
    });

    // Refresh the raycaster after models load.
    el.sceneEl.addEventListener('object3dset', () => {
      this.el.components.raycaster.refreshObjects();
    });
  }
});





AFRAME.registerComponent('camera-cube-env', {
  schema: {
      resolution: { type:'number', default: 128},
      distance: {type:'number', default: 100000},
      interval: { type:'number', default: 1000},
      repeat: { type:'boolean', default: false}
    },
    multiple: false,

    init: function(){
      this.counter = this.data.interval;
      this.cam = new THREE.CubeCamera( 1.0, this.data.distance, this.data.resolution);
    
      this.cam.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.cam.renderTarget.texture.generateMipmaps = true;
      this.el.object3D.add( this.cam );

      this.done = false;

      var myCam = this.cam;
      var myEl = this.el;
      var myMesh = this.el.getObject3D('mesh');

      document.querySelector('a-scene').addEventListener('loaded', function (myCam, myEl, myMesh) {
        if(myMesh){
          myMesh.traverse( function( child ) { 
            if ( child instanceof THREE.Mesh ) {
              child.material.envMap = myCam.renderTarget.texture;
              child.material.needsUpdate = true;
            }
          });
        }
      });      
        
    },
    
    tick: function(t,dt){
      var myCam = this.cam;
      if(!this.done){
        if( this.counter > 0){
          this.counter -=dt;
        } else {

          this.mesh = this.el.getObject3D('mesh');
          
          if(this.mesh){
              this.mesh.visible = false;

              AFRAME.scenes[0].renderer.autoClear = true;

              myCam.position.copy(this.el.object3D.worldToLocal(this.el.object3D.getWorldPosition(myCam.position)));
              myCam.update( AFRAME.scenes[0].renderer, this.el.sceneEl.object3D );

              this.mesh.traverse( function( child ) { 
                  if ( child instanceof THREE.Mesh ){
                    child.material.envMap = myCam.renderTarget.texture;
                    child.material.needsUpdate = true;
                  }
              });
              
              this.mesh.visible = true;
          
              if(!this.data.repeat){
                this.done = true;
                this.counter = this.data.interval;
              }
          }
        }
      }
    },

    update: function (oldData) {
      this.counter = this.data.interval;
      this.cam = new THREE.CubeCamera( 1.0, this.data.distance, this.data.resolution);
      this.cam.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
      this.el.object3D.add( this.cam );
      this.done = false;
      var myCam = this.cam;
        
      this.mesh = this.el.getObject3D('mesh');
      if(this.mesh){
        this.mesh.traverse( function( child ) { 
          if ( child instanceof THREE.Mesh ) {
            child.material.envMap = myCam.renderTarget.texture;
            myCam.renderTarget.texture.generateMipmaps = true;
            child.material.needsUpdate = true;
          }
        });
      }
    },
    remove: function () {},
    pause: function () { },
    play: function () { }
});
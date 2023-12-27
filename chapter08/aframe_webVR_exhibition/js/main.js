const videoEl = document.getElementById("videoEl");
const video = document.querySelector('#video_mp4');
video.pause();



window.addEventListener("load", function () {
  start();
});

async function start() {

  return;
  
  if (!window.AnimationEvent) {
    return;
  }
  var anchors = document.getElementsByTagName("a");

  for (var idx = 0; idx < anchors.length; idx += 1) {
    if (
      anchors[idx].hostname !== window.location.hostname ||
      anchors[idx].pathname === window.location.pathname
    ) {
      continue;
    }
    anchors[idx].addEventListener("click", function (event) {
      var fader = document.getElementById("fader"),
        anchor = event.currentTarget;

      var listener = function () {
        window.location = anchor.href;
        fader.removeEventListener("animationend", listener);
      };
      fader.addEventListener("animationend", listener);

      event.preventDefault();
      fader.classList.add("fade-in");
    });
  }
  
}






// document.getElementById("icon_message").addEventListener("click", function (event) {
//   event.preventDefault();
//   camAnimator('#shortcut_mensagem', 4000);

//   document.getElementById('navbarSupportedContent').classList.remove('show');

//   const obj = {
//     'posY': 0,
//   }

//   AFRAME.ANIME({
//     targets: obj,
//     posY: [videoEl.object3D.position.y, 2],
//     easing: 'easeInOutSine',
//     duration: 3000,
//     delay: 1000,
//     update() {
//       videoEl.object3D.position.y = obj.posY;
//     },
//     complete(anim) {
//       video.currentTime = 0; 
//       video.muted = "";
//       video.play(); 
//     },
//   })
// });


// document.getElementById("icon_albuns").addEventListener("click", function (event) {

//   camAnimator('#shortcut_albuns_1', 3000);

//   document.getElementById('navbarSupportedContent').classList.remove('show');

//   setTimeout(function () {

//       camAnimator('#shortcut_albuns_2', 3000);

//   }, 3000);
  
// });


// document.getElementById("icon_stories").addEventListener("click", function (event) {

//   camAnimator('#shortcut_stories_1', 3000);

//   document.getElementById('navbarSupportedContent').classList.remove('show');

//   setTimeout(function () {

//       camAnimator('#shortcut_stories_2', 3000);

//   }, 3000);
  
// });


// document.getElementById("icon_curiosidades").addEventListener("click", function (event) {

//   camAnimator('#shortcut_curiosidades_1', 3000);

//   document.getElementById('navbarSupportedContent').classList.remove('show');

//   setTimeout(function () {

//       camAnimator('#shortcut_curiosidades_2', 3000);

//   }, 3000);
  
// });




// document.getElementById("video").addEventListener("click", function (event) {

//   document.getElementById('navbarSupportedContent').classList.remove('show');

//   if (video.paused) 
//     video.play(); 
//   else 
//     video.pause();
// });

// document.getElementById("closeBtn").addEventListener("click", function (event) {
//   video.pause();

//   const obj = {
//     'posY': 0,
//   }

//   AFRAME.ANIME({
//     targets: obj,
//     posY: [videoEl.object3D.position.y, -2.5],
//     easing: 'easeInOutSine',
//     duration: 3000,
//     delay: 1000,
//     update() {
//       videoEl.object3D.position.y = obj.posY;
//     },
//     complete(anim) {
//     },
//   })
    
// });


// // document.querySelector( ".closeBtn" ).addEventListener("click", function() {
// //   this.parentElement.classList.remove('visible');
// // });

// const globalSlickProperties = {
//     dots: true,
//     infinite: true,
//     speed: 500
//   }

// document.getElementById("album01_content01").addEventListener("click", function (event) {
//   document.getElementById("album01_content01_popup").classList.add('visible');
// });

// document.getElementById("album01_content02").addEventListener("click", function (event) {
//   document.getElementById("album01_content02_popup").classList.add('visible');
// });

// document.getElementById("album01_content03").addEventListener("click", function (event) {
//   document.getElementById("album01_content03_popup").classList.add('visible');
// });

// document.getElementById("album01_content04").addEventListener("click", function (event) {
//   document.getElementById("album01_content04_popup").classList.add('visible');
// });



// // Minhas Historias

// document.getElementById("stories01_btn").addEventListener("click", function (event) {
//   document.getElementById("stories01_popup").classList.add('visible');
//   $('#stories01_popup .gallery').slick(globalSlickProperties);
// });

// document.getElementById("stories02_btn").addEventListener("click", function (event) {
//   document.getElementById("stories02_popup").classList.add('visible');
//   $('#stories02_popup .gallery').slick(globalSlickProperties);
// });



// // Curiosidades

// document.getElementById("curiosities01_btn").addEventListener("click", function (event) {
//   document.getElementById("curiosities01_popup").classList.add('visible');
//   $('#curiosities01_popup .gallery').slick(globalSlickProperties);
// });

// document.getElementById("curiosities02_btn").addEventListener("click", function (event) {
//   document.getElementById("curiosities02_popup").classList.add('visible');
//   $('#curiosities02_popup .gallery').slick(globalSlickProperties);
// });







// window.addEventListener("pageshow", function (event) {
//   if (!event.persisted) {
//     return;
//   }
//   var fader = document.getElementById("fader");
//   fader.classList.remove("fade-in");
  
// });








    //convert vector source cam position
    function objToPosS(posObject) {

      let gapX = posObject.x;
      let gapZ = posObject.z;

      return gapX + " " + posObject.y + " " + gapZ;
    }

    //convert vector target cam position
    function objToPosT(posObject) {

      let gapX;
      let gapZ;

      if (posObject.x >= 0) {
        gapX = posObject.x - 0
      } else {
        gapX = posObject.x + 0
      }

      if (posObject.z >= 0) {
        gapZ = posObject.z - 0
      } else {
        gapZ = posObject.z + 0
      }

      return gapX + " " + posObject.y + " " + gapZ;
    }

    //convert vector target cam rotation 
    function objToRotT(posObject) {
      return posObject.x + " " + posObject.y + " " + posObject.z;
    }

    function objToRotS(posObject) {
      let adjCam = posObject.y;
      return posObject.x + " " + adjCam + " " + posObject.z;
    }


    //camera click-animation
    function camAnimator(target, duration) {

      let cameraEnt = document.querySelector('#camera');
      let cameraEntRot = objToRotS(cameraEnt.getAttribute("rotation"));
      let cameraEntLook = document.querySelector('#camera').components['look-controls'];
      cameraEnt.setAttribute('look-controls', 'enabled', false);
      cameraEntLook.pitchObject.rotation.x = 0;
      cameraEntLook.yawObject.rotation.y = 0;
      cameraEnt.setAttribute('animation', `property: rotation; from: ${cameraEntRot}; to: 0 0 0; dur: ${duration}; easing: easeInOutSine; `);

      let cameraRig = document.querySelector('#rig');


      let camPos = objToPosS(cameraRig.getAttribute("position"));
      let camRot = objToRotS(cameraRig.getAttribute("rotation"));



      let goal = document.querySelector(target)

      let targetPos = objToPosT(goal.getAttribute("position"));
      let targetRot = objToRotT(goal.getAttribute("rotation"));


      // console.log(":: Source ::" + camPos + ":: " + camRot + ":: Target ::" + targetPos + ":: " + targetRot);
      // console.log(goal.object3D)

      cameraRig.setAttribute('animation', `property: position; from: ${camPos}; to: ${targetPos}; dur: ${duration}; easing: easeInOutSine; `);
      cameraRig.setAttribute('animation__2', `property: rotation; from: ${camRot}; to: ${targetRot}; dur: ${duration}; easing: easeInOutSine; `);

      setTimeout(function () {

        cameraEnt.setAttribute('look-controls', 'enabled', true);

      }, 5000);


    }

    function videoAutoPlay() {

      let vid = document.querySelector('#video_mp4');
      /*       if (!vid) {return;}
            
            vid.load();
            vid.play(); */
      vid.src = "./assets/videos/video_manifest.mp4";
      vid.autoplay = false;
      //console.log(vid);

      setTimeout(function () {
        vid.src = "./assets/videos/video_manifest.mp4";
        vid.muted = "muted";
        vid.autoplay = true;
        vid.pause();
        vid.play();


      }, 5000);

    }
    // videoAutoPlay();


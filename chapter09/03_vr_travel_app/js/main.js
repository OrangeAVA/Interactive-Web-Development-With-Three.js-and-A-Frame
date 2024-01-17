window.addEventListener("load", function () {
  start();
});

// const closeBtn = document.querySelector('#close_btn');
// const popup = document.querySelector('#popup');
// const popupText = document.querySelector('#popup_text');

const videos = document.querySelector('#videos');
const vrEnvironment = document.querySelector('#vr_environment');
const menuContainer = document.querySelector('#menu_container');

let jsonData;

async function start() {

  // load main json file with all the app parameters and data
  fetch("./js/params.json")
    .then(res => res.json())
    .then(data => {
        jsonData = data;
        loadVideos();
        createUI();
  });


  // const menuBtns = document.querySelectorAll('.clickable.menu');

  // menuBtns.forEach(function(element) {
  //   element.addEventListener('click', function() {
  //     popup.setAttribute('visible','true');
  //     popupText.setAttribute('value', element.id);
  //   })
  // })

  // closeBtn.addEventListener('click', function() {
  //   popup.setAttribute('visible','false');
  // })

}


const loadVideos = function() {

  let videosLoop = '';

  jsonData.map((el, id)=> {

      videosLoop += `<video id="vr_${el.id}" loop crossorigin="anonymous" playsinline src="${el.video}"></video>`;
      

  });

  videos.innerHTML = videosLoop;
}


//create UI
const createUI = function(){
    
    // load JSON data and creates the VR menu
    jsonData.map((el, id)=> {

      const thumbContainer = document.createElement('a-entity');
      const thumb = document.createElement('a-plane');
      thumbContainer.appendChild(thumb);

      thumb.id = el.id;
      thumb.setAttribute('position','0 1 -2');
      thumb.setAttribute('width', '0.6');
      thumb.setAttribute('height', '0.343');
      thumb.setAttribute('src', el.thumb);
      thumb.classList.add('clickable');
      thumb.onclick = () => showVREnvironment(id);

      const rotationVariation = 120/jsonData.length;
      
      thumbContainer.setAttribute('rotation',`0 -${id*rotationVariation} 0`);

      menuContainer.appendChild(thumbContainer);

      const halfpoint = rotationVariation/2*jsonData.length - rotationVariation/2;
      menuContainer.setAttribute('rotation',`0 ${halfpoint} 0`);
      

    })

}


const showVREnvironment = function(id) {
  const video = '#vr_'+jsonData[id].id;
  vrEnvironment.setAttribute('src', video);
  vrEnvironment.setAttribute('visible','true');
  document.querySelector(video).play();
}
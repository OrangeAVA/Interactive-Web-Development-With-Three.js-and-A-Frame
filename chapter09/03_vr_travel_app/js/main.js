window.addEventListener("load", function () {
  start();
});

const Delay = (milliseconds) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};


const videos = document.querySelector('#videos');
const vrEnvironment = document.querySelector('#vr_environment');
const menuContainer = document.querySelector('#menu_container');
const vrInterface = document.querySelector('#vr_interface');
const closeBtn = document.querySelector('#close_btn');

let jsonData, video, menuItems = [];

async function start() {

  // load main json file with all the app parameters and data
  fetch("./js/params.json")
    .then(res => res.json())
    .then(data => {
        jsonData = data;
        loadVideos();
        createUI();
  });

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
      const thumb = document.createElement('a-image');
      thumbContainer.appendChild(thumb);

      thumb.id = el.id;
      thumb.setAttribute('position','0 1 -2');
      thumb.setAttribute('width', '0.512');
      thumb.setAttribute('height', '0.256');
      thumb.setAttribute('src', el.thumb);
      thumb.classList.add('clickable');
      menuItems.push(thumb);
      thumb.onclick = () => showVREnvironment(id);

      const blur = document.createElement('a-image');
      thumbContainer.appendChild(blur);
      blur.setAttribute('position','0 1 -2.01');
      blur.setAttribute('width', '0.512');
      blur.setAttribute('height', '0.256');
      blur.setAttribute('scale', '2.2 2 2');
      blur.setAttribute('src', '#blur_img');

      const title = document.createElement('a-text');
      thumbContainer.appendChild(title);
      title.setAttribute('position','0 0.8 -2.01');
      title.setAttribute('width', '1.6');
      title.setAttribute('align', 'center');
      title.setAttribute('value', el.name);

      const rotationVariation = 120/jsonData.length;
      
      thumbContainer.setAttribute('rotation',`0 -${id*rotationVariation} 0`);

      menuContainer.appendChild(thumbContainer);

      const halfpoint = rotationVariation/2*jsonData.length - rotationVariation/2;
      menuContainer.setAttribute('rotation',`0 ${halfpoint} 0`);
      
    })

}


const showVREnvironment = async function(id) {

  vrInterface.emit('fadeOut');

  await Delay(1000);

  video = '#vr_'+jsonData[id].id;
  vrEnvironment.setAttribute('src', video);
  vrEnvironment.setAttribute('visible','true');
  vrEnvironment.emit('fadeIn');
  document.querySelector(video).play();

  closeBtn.setAttribute('visible','true');
  closeBtn.classList.add('clickable');

  menuItems.forEach(function(el) {
    el.classList.remove('clickable');
  })

}



const closeBtnFunction = async function(id) {

  closeBtn.setAttribute('visible','false');
  closeBtn.classList.remove('clickable');

  document.querySelector(video).pause();
  vrEnvironment.emit('fadeOut');

  await Delay(1000);

  vrInterface.emit('fadeIn');

  menuItems.forEach(function(el) {
    el.classList.add('clickable');
  })

}


closeBtn.addEventListener('click', closeBtnFunction);

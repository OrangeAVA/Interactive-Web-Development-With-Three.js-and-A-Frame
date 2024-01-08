const rig = document.querySelector('#rig');
const navMesh = document.querySelector('#navmesh');
const btnFirstFloor = document.querySelector('#btn_first_floor');
const btnSecondFloor = document.querySelector('#btn_second_floor');
const closeBtn = document.querySelector('#close_btn');
const popup = document.querySelector('#popup');
const popupName = document.querySelector('#popup_name');
const popupAuthor = document.querySelector('#popup_author');
const popupDate = document.querySelector('#popup_date');


window.addEventListener("load", function () {
  start();
});


async function start() {

  closeBtn.addEventListener('click', function() {
    closePopup();
  })

  btnFirstFloor.addEventListener('click', function() {
    navMesh.removeAttribute('nav-mesh')
    rig.setAttribute('position','4.2 0.2 0');
    rig.setAttribute('rotation','0 90 0');
    navMesh.setAttribute('nav-mesh', true)
  })

  btnSecondFloor.addEventListener('click', function() {
    navMesh.removeAttribute('nav-mesh')
    rig.setAttribute('position','-3.78 3.33 -4.8');
    rig.setAttribute('rotation','0 180 0');
    navMesh.setAttribute('nav-mesh', true)
  })
}


const openPopup = function(data) {
    popup.setAttribute('visible','true');
    popup.emit('scaleUp');
    popupName.setAttribute('value', data.name);
    popupAuthor.setAttribute('value', 'Artist: '+ data.author);
    popupDate.setAttribute('value', 'Date: '+ data.date);
}

const closePopup = function(data) {
    popup.emit('scaleDown');
    popup.addEventListener('animationcomplete____scale_down', function() {
      popup.setAttribute('visible','false');
    })
}
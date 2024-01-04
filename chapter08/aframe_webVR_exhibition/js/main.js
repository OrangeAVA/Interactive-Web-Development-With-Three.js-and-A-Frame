window.addEventListener("load", function () {
  start();
});

const rig = document.querySelector('#rig');
const btnFirstFloor = document.querySelector('#btn_first_floor');
const btnSecondFloor = document.querySelector('#btn_second_floor');
const closeBtn = document.querySelector('#close_btn');
const popup = document.querySelector('#popup');
const popupText = document.querySelector('#popup_text');

async function start() {

  const menuBtns = document.querySelectorAll('.clickable.menu');

  menuBtns.forEach(function(element) {
    element.addEventListener('click', function() {
      popup.setAttribute('visible','true');
      popupText.setAttribute('value', element.id);
    })
  })

  closeBtn.addEventListener('click', function() {
    popup.setAttribute('visible','false');
  })

  btnFirstFloor.addEventListener('click', function() {
    rig.setAttribute('position','4.65 0 -0.08');
    rig.setAttribute('rotation','0 90 0');
  })

  btnSecondFloor.addEventListener('click', function() {
    rig.setAttribute('position','-3.786310680989204 3.33 -4.8');
    rig.setAttribute('rotation','0 180 0');
  })

}
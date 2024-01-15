window.addEventListener("load", function () {
  start();
});

const closeBtn = document.querySelector('#close_btn');
const popup = document.querySelector('#popup');
const popupText = document.querySelector('#popup_text');

let jsonData;

async function start() {

  // load main json file with all the app parameters and data
  fetch("./js/params.json")
    .then(res => res.json())
    .then(data => {
        jsonData = data;
        console.log(jsonData)
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
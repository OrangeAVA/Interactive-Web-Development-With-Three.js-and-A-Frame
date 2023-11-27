window.addEventListener("load", function () {
  start();
});

async function start() {
  const character = document.querySelector('#character');

  const buttons = document.querySelectorAll("#ui button");
  buttons.forEach(function (element) {
    element.addEventListener("click", function (e) {
      const animationClipName = element.dataset.animation;
      character.setAttribute('animation-mixer','crossFadeDuration: 0.5; clip:'+animationClipName)
    });
  });

}

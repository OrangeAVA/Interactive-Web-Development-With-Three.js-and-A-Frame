let sceneEl, messageBox;

window.addEventListener("load", function () {
  start();
});

async function start() {

  sceneEl = document.querySelector('a-scene');
  messageBox = document.querySelector('#ui p');

  ///triggered when MindAR is ready for use
  sceneEl.addEventListener("arReady", (event) => {
    messageBox.innerHTML = "MindAR is ready";
  });

  // triggered when MindAR face is found
  sceneEl.addEventListener("targetFound", event => {
    messageBox.innerHTML = "AR face found";
  });

  // triggered when MindAR face is lost
  sceneEl.addEventListener("targetLost", event => {
    messageBox.innerHTML = "AR face lost";
  });

  
}

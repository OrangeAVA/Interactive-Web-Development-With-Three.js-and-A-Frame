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

  // triggered when MindAR target is found
  document.querySelector('#ar_container').addEventListener("targetFound", event => {
    messageBox.innerHTML = "AR target found";
  });

  // triggered when MindAR target is lost
  document.querySelector('#ar_container').addEventListener("targetLost", event => {
    messageBox.innerHTML = "AR target lost";
  });

  
}

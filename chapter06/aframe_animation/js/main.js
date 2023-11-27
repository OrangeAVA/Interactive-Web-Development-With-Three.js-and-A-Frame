window.addEventListener("load", function () {
  start();
});

async function start() {

  document.querySelector('#interactive_box').addEventListener('animationbegin', function() {
    console.log('animation on blue box began');
  })

  document.querySelector('#interactive_box').addEventListener('animationcomplete', function() {
    console.log('animation on blue box is completed');
  })

  document.querySelector('#button_box').addEventListener('click', function() {
    document.querySelector('#interactive_box').emit('clickToScale');
  })
  
}

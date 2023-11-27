window.addEventListener("load", function () {
  start();
});

async function start() {
  const box = document.querySelector('#box');
  const colors = ["#ff0000","#ffff00","#ff00ff","#0000ff"]

  document.querySelector('#button_add').addEventListener('click',function() {
    box.setAttribute('animation__scale_animation','property: scale; from: 1 1 1; to: 1.5 1.5 1.5; dur: 1000; easing: easeInOutElastic; loop: true; dir: alternate;')
  })

  document.querySelector('#button_remove').addEventListener('click',function() {
    box.removeAttribute('animation__scale_animation')
  })

  document.querySelector('#button_modify').addEventListener('click',function() {
    box.setAttribute('animation__scale_animation','property: scale; from: 1 1 1; to: 2 2 2; dur: 1000; easing: easeInOutElastic; loop: true; dir: alternate;')
  })

  document.querySelector('#button_color').addEventListener('click',function() {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    box.setAttribute('material','color:'+randomColor);
  })

  document.querySelector('#button_texture').addEventListener('click',function() {
    box.setAttribute('material','src: #texture');
  })

  document.querySelector('#button_less').addEventListener('click',function() {
    const offsetX = box.getAttribute('material').offset.x += 0.025;
    box.setAttribute('material','offset', { x: offsetX, y: 0 });
  })

  document.querySelector('#button_plus').addEventListener('click',function() {
    const offsetX = box.getAttribute('material').offset.x -= 0.025;
    box.setAttribute('material','offset', { x: offsetX, y: 0 });
  })

}

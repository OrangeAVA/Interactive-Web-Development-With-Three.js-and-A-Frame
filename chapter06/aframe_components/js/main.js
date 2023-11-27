window.addEventListener("load", function () {
  start();
});

async function start() {

  document.querySelector('#character_dropdown').addEventListener("change", function() {
      if (!character_dropdown.value) return;
      document.querySelector('#character').setAttribute('character-tshirt','color: ' + character_dropdown.value);
  });

  document.querySelector('#candle_glass_color').addEventListener("change", function() {
    if (!candle_glass_color.value) return;
    document.querySelector('#candle-holder').setAttribute('candle-holder-glass','color: ' + candle_glass_color.value);
  });

  document.querySelector('#button_helmet_float').addEventListener('click', function() {

    document.querySelector('#button_helmet_float').classList.toggle('disabled');

    if (!document.querySelector('#helmet').components['helmet-float']) {
      document.querySelector('#helmet').setAttribute('helmet-float','amount: 1');
    } else {
      document.querySelector('#helmet').removeAttribute('helmet-float');
    }
  })

}

import AFRAME from 'aframe';

// Grip イベントを el.girpState に反映するコンポーネント
AFRAME.registerComponent('grip-control', {
  init: function () {
    this.el.gripState = false;
    this.el.addEventListener('gripdown', (evt) => {
      this.el.gripState = true;
      console.log("Grip on!")
    });
    this.el.addEventListener('gripup', (evt) => {
      this.el.gripState = false;
    });
  }

});

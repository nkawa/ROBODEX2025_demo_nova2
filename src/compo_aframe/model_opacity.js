import AFRAME from 'aframe';

AFRAME.registerComponent("model-opacity", {
  schema: {
    opacity: { type: "number", default: 0.5 }
  },
  init: function () {
    this.el.addEventListener("model-loaded", this.update.bind(this));
  },
  update: function () {
    var mesh = this.el.getObject3D("mesh");
    var data = this.data;
    if (!mesh || !data) {
      return;
    }
    mesh.traverse(function (node) {
      if (node.isMesh) {
        node.material.opacity = data.opacity;
        node.material.transparent = data.opacity < 1.0;
        node.material.needsUpdate = true;
        //                  node.material.format = THREE.RGBAFormat;
      }
    });
  }
});

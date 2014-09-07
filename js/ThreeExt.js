THREE.Scene.prototype.add = function(object) {
  if (object instanceof Oppai.Oppai) {
    this.add(object.threeMesh);
  }
  else {
    THREE.Object3D.prototype.add.call(this, object);
  }
}

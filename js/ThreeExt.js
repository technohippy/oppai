THREE.Scene.prototype.add = function(object) {
  if (object instanceof Oppai.Oppai) {
    this.add(object.threeMesh);
  }
  else if (object instanceof Oppai.Hand) {
    this.add(object.threeFinger);
  }
  else {
    THREE.Object3D.prototype.add.call(this, object);
  }
}

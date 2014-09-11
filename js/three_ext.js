THREE.Scene.prototype.add = function(object) {
  if (object instanceof Oppai.Oppai) {
    this.add(object.threeMesh);
//    this.add(object.threeLensFlare); // TODO
  }
  else if (object instanceof Oppai.Hand) {
    this.add(object.threeFinger);
  }
  else {
    THREE.Object3D.prototype.add.call(this, object);
  }
}

THREE.Vector3.prototype.applyQuaternion = function ( q ) {
  var x = this.x;
  var y = this.y;
  var z = this.z;

  var qx = q.x;
  var qy = q.y;
  var qz = q.z;
  var qw = q.w;

  // calculate quat * vector

  var ix =  qw * x + qy * z - qz * y;
  var iy =  qw * y + qz * x - qx * z;
  var iz =  qw * z + qx * y - qy * x;
  var iw = - qx * x - qy * y - qz * z;

  // calculate result * inverse quat

  this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
  this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
  this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

  return this;
};

var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.RingControls = function(camera, center, lookAt, distance, initialAngle) {
  this.camera = camera;
  this.center = center || new THREE.Vector3(0, 0, 0);
  this.lookAt = lookAt || this.center;
//  this.angle = initialAngle || 2 * Math.PI / 3;
//  this.angle = initialAngle || 3 * Math.PI / 4;
  this.angle = initialAngle || 9 * Math.PI / 10;
  this.distance = distance || 30;

  document.addEventListener('keypress', function(event) {
    if (event.keyCode == 60/*<*/ || event.keyCode == 122/*z*/) {
      this.angle -= Math.PI * 0.01;
    }
    else if (event.keyCode == 62/*>*/ || event.keyCode == 99/*c*/) {
      this.angle += Math.PI * 0.01;
    }
  }.bind(this));
};

Oppai.RingControls.prototype.update = function() {
  this.camera.position = new THREE.Vector3(
    this.center.x + this.distance * Math.sin(this.angle), 
    this.center.y, 
    this.center.z + this.distance * Math.cos(this.angle)
  );
  //this.camera.lookAt(this.center);
  this.camera.lookAt(this.lookAt);
};

}).call(this, Oppai);

var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.RingControls = function(camera, center, lookAt, distance, initialAngle) {
  this.camera = camera;
  this.center = center || new THREE.Vector3(0, 0, 0);
  this.lookAt = lookAt || this.center;
  if (Oppai.isSmartphone) {
    this.distance = distance || 50;
    this.angle = initialAngle || 2 * Math.PI / 3;
  }
  else {
    this.distance = distance || 30;
    this.angle = initialAngle || Math.PI / 2;
  }

  document.addEventListener('keydown', function(event) {
    if ((!event.shiftKey && event.keyCode == 39) || event.keyCode == 122) {
      this.angle -= Math.PI * 0.01;
    }
    else if ((!event.shiftKey && event.keyCode == 37) || event.keyCode == 99) {
      this.angle += Math.PI * 0.01;
    }
    else if (!event.shiftKey && event.keyCode == 38) {
      this.distance -= 0.5;
    }
    else if (!event.shiftKey && event.keyCode == 40) {
      this.distance += 0.5;
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

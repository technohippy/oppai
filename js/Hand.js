var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.Hand = function(oppai) {
  this.cannonFinger = new CANNON.RigidBody(5, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
  this.cannonFinger.position.set(0, -100, 0);
  oppai.cannonWorld.add(this.cannonFinger);
  this.threeFinger = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshPhongMaterial({color: 0xff0000}));
  this.threeFinger.castShadow = true;
  this.threeFinger.receiveShadow = false;

  document.addEventListener('keypress', function(event) {
    if (event.keyCode == 32/*spc*/) {
      //this.cannonFinger.position.set(25, 2, 0);
      this.cannonFinger.position.set(25, 2, Math.random() * 30 - 15);
      this.cannonFinger.velocity.set(-50, 0, 0);
    }
  }.bind(this));
};

Oppai.Hand.prototype.step = function() {
  this.threeFinger.position.copy(this.cannonFinger.position);
  this.threeFinger.quaternion.copy(this.cannonFinger.quaternion);
};

}).call(this, Oppai);

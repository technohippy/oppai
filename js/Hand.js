var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.Hand = function(oppai) {
  this.cannonFinger = new CANNON.RigidBody(5, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
  this.cannonFinger.position.set(0, -100, 0);
  oppai.cannonWorld.add(this.cannonFinger);
  this.threeFinger = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16), 
    //new THREE.MeshPhongMaterial({color: 0xffff00, opacity: 0.5, transparent: true})
    new THREE.MeshPhongMaterial({color: 0x0000ff})
  );
  this.threeFinger.castShadow = true;
  this.threeFinger.receiveShadow = false;

  document.addEventListener('keypress', function(event) {
    if (event.keyCode == 32/*spc*/) this.touch();
  }.bind(this));

  document.addEventListener('touchend', function(event) {
    this.touch();
  }.bind(this));

  document.addEventListener('click', function(event) {
    this.touch();
  }.bind(this));
};

Oppai.Hand.prototype.touch = function() {
  this.cannonFinger.position.set(25, Math.random() * 16 - 8, Math.random() * 20 - 10);
  this.cannonFinger.velocity.set(-50, 0, 0);
};

Oppai.Hand.prototype.step = function() {
  this.threeFinger.position.copy(this.cannonFinger.position);
  this.threeFinger.quaternion.copy(this.cannonFinger.quaternion);
};

}).call(this, Oppai);

var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.Hand = function(oppai, camera, scene) {
  this.oppai = oppai;
  this.camera = camera;
  this.scene = scene;
  this.touching = false;
  this.projector = new THREE.Projector();

  this.threeFinger = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16), 
    new THREE.MeshPhongMaterial({
      color: 0x0000ff, wireframe: this.oppai.threeMesh.material.wireframe
    })
  );
  this.threeFinger.position.set(0, -100, 0);
  if (!Oppai.isSmartphone) {
    this.threeFinger.castShadow = true;
    this.threeFinger.receiveShadow = false;
  }
  this.oppai.threeFingers.push(this.threeFinger);

  document.addEventListener('keypress', function(event) {
    if (event.keyCode == 32/*spc*/) this.touch();
  }.bind(this));

  document.addEventListener('touchstart', function(event) {
    event.preventDefault();
    for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      var touchX = (touch.pageX / window.innerWidth ) * 2 - 1;
      var touchY = (touch.pageY / window.innerHeight) * -2 + 1;
      this.touchAt(touchX, touchY);
    }
  }.bind(this));

  document.addEventListener('touchmove', function(event) {
    event.preventDefault();
    for (var i = 0; i < event.touches.length; i++) {
      var touch = event.touches[i];
      var touchX = (touch.pageX / window.innerWidth ) * 2 - 1;
      var touchY = (touch.pageY / window.innerHeight) * -2 + 1;
      this.touchAt(touchX, touchY);
    }
  }.bind(this));

  document.addEventListener('mousedown', function(event) {
    this.touching = true;
    var mouseX = (event.clientX / window.innerWidth ) * 2 - 1;
    var mouseY = (event.clientY / window.innerHeight) * -2 + 1;
    this.touchAt(mouseX, mouseY);
  }.bind(this));

  document.addEventListener('mousemove', function(event) {
    if (this.touching) {
      var mouseX = (event.clientX / window.innerWidth ) * 2 - 1;
      var mouseY = (event.clientY / window.innerHeight) * -2 + 1;
      this.touchAt(mouseX, mouseY);
    }
  }.bind(this));

  document.addEventListener('mouseup', function(event) {
    this.touching = false;
  }.bind(this));
};

Oppai.Hand.prototype.touchAt = function(x, y) {
  var ray = this.projector.pickingRay(new THREE.Vector3(x, y, -1), this.camera);
  var intersects = ray.intersectObject(this.oppai.threeMesh); // TODO
  if (intersects.length == 0) return;
  if (2 < intersects.length) intersects = intersects.slice(0, 2);
  this.oppai.touchAt(
    intersects[0].point, 
    intersects.map(function(intersect) { return intersect.face })
  );
};

Oppai.Hand.prototype.touch = function() {
  this.oppai.touch();
};

}).call(this, Oppai);

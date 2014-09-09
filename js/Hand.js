var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.Hand = function(oppai, camera, scene) {
  this.oppai = oppai;
  this.camera = camera;
  this.scene = scene;
  this.touching = false;
  this.projector = new THREE.Projector();

  /*
  //this.cannonFinger = new CANNON.RigidBody(5, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
  this.cannonFinger = new CANNON.RigidBody(15, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
  this.cannonFinger.position.set(0, -100, 0);
  this.oppai.cannonWorld.add(this.cannonFinger);
  this.threeFinger = new THREE.Mesh(
    new THREE.SphereGeometry(2, 16, 16), 
    new THREE.MeshPhongMaterial({color: 0xffff00, opacity: 0, transparent: true})
    //new THREE.MeshPhongMaterial({color: 0x0000ff})
  );
  this.threeFinger.castShadow = true;
  this.threeFinger.receiveShadow = false;
  */

//  document.addEventListener('keypress', function(event) {
//    if (event.keyCode == 32/*spc*/) this.touch();
//  }.bind(this));

  document.addEventListener('touchstart', function(event) {
    event.touches.forEach(function(touch, i) {
      var touchX = (touch.pageX / window.innerWidth ) *  2 - 1;
      var touchY = (touch.pageY / window.innerHeight) * 2 + 1;
      this.touchAt(touchX, touchY);
    }.bind(this));
  }.bind(this));

  document.addEventListener('touchmove', function(event) {
    event.preventDefault();
    event.touches.forEach(function(touch, i) {
      var touchX = (touch.pageX / window.innerWidth ) *  2 - 1;
      var touchY = (touch.pageY / window.innerHeight) * 2 + 1;
      this.touchAt(touchX, touchY);
    }.bind(this));
  }.bind(this));

  document.addEventListener('mousedown', function(event) {
    this.touching = true;
    var mouseX = (event.clientX / window.innerWidth ) *  2 - 1;
    var mouseY = (event.clientY / window.innerHeight) * -2 + 1;
    this.touchAt(mouseX, mouseY);
  }.bind(this));

  document.addEventListener('mousemove', function(event) {
    if (this.touching) {
      var mouseX = (event.clientX / window.innerWidth ) *  2 - 1;
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
  intersects.forEach(function(intersect) {
    var ba = this.oppai.cannonBodies[intersect.face.a];
    var bb = this.oppai.cannonBodies[intersect.face.b];
    var bc = this.oppai.cannonBodies[intersect.face.c];

    var force = 100;
    var da = new THREE.Vector3(0, 0, 0).subSelf(ba.position).normalize();
    ba.applyForce(da.multiplyScalar(force), ba.position);

    var db = new THREE.Vector3(0, 0, 0).subSelf(bb.position).normalize();
    bb.applyForce(db.multiplyScalar(force), bb.position);

    var dc = new THREE.Vector3(0, 0, 0).subSelf(bc.position).normalize();
    bc.applyForce(dc.multiplyScalar(force), bc.position);
  }.bind(this));
};

Oppai.Hand.prototype.touchAt2 = function(x, y) {
  var ray = this.projector.pickingRay(new THREE.Vector3(x, y, -1), this.camera);
  var intersects = ray.intersectObject(this.oppai.threeMesh); // TODO
//console.log(intersects);
  if (intersects.length != 0) {
    var intersect = intersects[0];
    var object = intersect.object;
    var geo = object.geometry;
//    var point = geo.vertices[intersect.face.a].clone().add(object.position); // TODO
    var point = geo.vertices[intersect.face.a];
    var direction = new THREE.Vector3(0, 0, 0).subSelf(point).normalize();
    var pos = new THREE.Vector3(point.x - direction.x, point.y - direction.y, point.z - direction.z); // TODO
    var vel = direction.clone().multiplyScalar(10);
    this.cannonFinger.position.set(pos.x, pos.y, pos.z);
    this.cannonFinger.velocity.set(vel.x, vel.y, vel.z);
  }
};

/*
Oppai.Hand.prototype.touch = function() {
  this.cannonFinger.position.set(25, Math.random() * 16 - 8, Math.random() * 20 - 10);
  this.cannonFinger.velocity.set(-50, 0, 0);
};

Oppai.Hand.prototype.step = function() {
  this.threeFinger.position.copy(this.cannonFinger.position);
  this.threeFinger.quaternion.copy(this.cannonFinger.quaternion);
};
*/

}).call(this, Oppai);

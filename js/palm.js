var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.Palm = function(center) {
  this.unit = 1.5;
  this.handMaterial = new THREE.MeshPhongMaterial({color:0xffffff, opacity:0.2, transparent:true});
  var palm1Geometry = new THREE.CubeGeometry(this.unit, this.unit*4, this.unit*5);
  var palm2Geometry = new THREE.CubeGeometry(this.unit, this.unit*4/3, this.unit*4);
  var finger0Geometry = new THREE.CubeGeometry(this.unit, this.unit*10/3, this.unit);
  var finger1Geometry = new THREE.CubeGeometry(this.unit, this.unit*4, this.unit);
  var finger2Geometry = new THREE.CubeGeometry(this.unit, this.unit*14/3, this.unit);
  var finger3Geometry = new THREE.CubeGeometry(this.unit, this.unit*13/3, this.unit);
  var finger4Geometry = new THREE.CubeGeometry(this.unit, this.unit*10/3, this.unit);
  this.palm1 = new THREE.Mesh(palm1Geometry, this.handMaterial);
  this.palm2 = new THREE.Mesh(palm2Geometry, this.handMaterial);
  this.finger0 = new THREE.Mesh(finger0Geometry, this.handMaterial);
  this.finger1 = new THREE.Mesh(finger1Geometry, this.handMaterial);
  this.finger2 = new THREE.Mesh(finger2Geometry, this.handMaterial);
  this.finger3 = new THREE.Mesh(finger3Geometry, this.handMaterial);
  this.finger4 = new THREE.Mesh(finger4Geometry, this.handMaterial);

  this.isRight = center.z < 0 ? -1 : 1;
  this.palm1.position.set(0, 1, 0);
  this.palm2.position.set(-this.unit/3, -this.unit*2, this.unit/3 * this.isRight);
  this.palm2.rotation.z = -Math.PI / 180 * 30;
  this.finger0.position.set(-this.unit, this.unit, -this.unit*4 * this.isRight);
  this.finger0.rotation.x = -Math.PI / 180 * 30 * this.isRight;
  this.finger1.position.set(-this.unit*4/3, this.unit*14/3+this.unit/15, -this.unit*7/3 * this.isRight);
  this.finger1.rotation.x = -Math.PI / 180 * 10 * this.isRight;
  this.finger2.position.set(-this.unit*4/3, this.unit*15/3+this.unit/15, -this.unit*12/15 * this.isRight);
  this.finger2.rotation.x = -Math.PI / 180 * 3 * this.isRight;
  this.finger3.position.set(-this.unit*4/3, 4.1+6.5/2, (1+0.2) * this.isRight);
  this.finger3.rotation.x = Math.PI / 180 * 3 * this.isRight;
  this.finger4.position.set(-this.unit*4/3, 4.1+5/2, (3+0.5) * this.isRight);
  this.finger4.rotation.x = Math.PI / 180 * 10 * this.isRight;

  this.grab(30);

  this.threeMesh = new THREE.Object3D();
  this.threeMesh.add(this.palm1);
  this.threeMesh.add(this.palm2);
  this.threeMesh.add(this.finger0);
  this.threeMesh.add(this.finger1);
  this.threeMesh.add(this.finger2);
  this.threeMesh.add(this.finger3);
  this.threeMesh.add(this.finger4);

  this.threeMesh.castShadow = true;
  this.threeMesh.position.set(center.x, center.y, center.z);
};

Oppai.Palm.prototype.grab = function(degree) {
  var rad = Math.PI / 180 * degree;
  this.finger0.rotation.z = rad;
  this.finger1.rotation.z = rad;
  this.finger2.rotation.z = rad;
  this.finger3.rotation.z = rad;
  this.finger4.rotation.z = rad;

  this.finger0.position.set(
    -(this.unit*10/3)/2*Math.sin(rad), 
    this.unit/2+(this.unit*10/3)/2*Math.cos(rad), 
    -this.unit*4 * this.isRight
  );
  this.finger1.position.set(
    -(this.unit*4)/2*Math.sin(rad), 
    this.unit*2.8+(this.unit*4)/2*Math.cos(rad), 
    -this.unit*7/3 * this.isRight
  );
  this.finger2.position.set(
    -(this.unit*14/3)/2*Math.sin(rad), 
    this.unit*2.8+(this.unit*14/3)/2*Math.cos(rad), 
    -this.unit*12/15 * this.isRight
  );
  this.finger3.position.set(
    -(this.unit*13/3)/2*Math.sin(rad),
    this.unit*2.8+(this.unit*13/3)/2*Math.cos(rad),
    (1+0.2) * this.isRight
  );
  this.finger4.position.set(
    -(this.unit*10/3)/2*Math.sin(rad),
    this.unit*2.8+(this.unit*10/3)/2*Math.cos(rad),
    (3+0.5) * this.isRight
  );
};

}).call(this, Oppai);

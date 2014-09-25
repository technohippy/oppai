var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

var ua = navigator.userAgent.toLowerCase();
Oppai.isSmartphone = (0 <= ua.indexOf('iphone') || 0 <= ua.indexOf('android'));

Oppai.oppaiId = 1;

Oppai.Oppai = function(center, worker) {
  this.id = Oppai.oppaiId;
  Oppai.oppaiId += 1;
  this.center = center || {x:0, y:0, z:0};
  this.threeGeometry = new THREE.IcosahedronGeometry(10, 3);
  this.threeGeometry.vertices.forEach(function(vertex, i) {
    var yDia = vertex.y - this.center.y;
    if (0 < yDia) vertex.y = yDia * 1.3 + this.center.y;
    if (vertex.x < -1) vertex.x = -1;
  }, this);
  this.threeGeometry.verticesNeedUpdate = true;
  this.threeGeometry.computeFaceNormals();
  this.threeGeometry.computeVertexNormals();
  var material = new THREE.MeshPhongMaterial({
    color: 0xffccaa, emissive: 0x0f0603, wireframe: Oppai.isSmartphone
  });
  this.threeMesh = new THREE.Mesh(this.threeGeometry, material);
  this.threeMesh.position.copy(this.center);
  if (!Oppai.isSmartphone) {
//    this.threeMesh.castShadow = true;
    this.threeMesh.receiveShadow = true;
  }
//  this.coreGeometry = new THREE.IcosahedronGeometry(7.2, 2)
//  this.coreMesh = new THREE.Mesh(this.coreGeometry, material);
  this.threeFingers = [];
  if (typeof(worker) === 'undefined') {
    this.worker = new Worker('js/oppai_worker.js');
    this.setupWorker('initialize');
  }
  else {
    this.worker = worker;
    this.setupWorker('constructOppai');
  }
};

Oppai.Oppai.prototype.setupWorker = function(command) {
  this.worker.postMessage({
    id:this.id,
    command:command,
    geometry:this.threeGeometry, 
    center:this.center,
    coreGeometry:this.coreGeometry
  });

  this.worker.addEventListener('message', function(event) {
    if (event.data.id != this.id) return;

    var oppaiPoisitions = event.data.oppaiPositions;
    oppaiPoisitions.forEach(function(position, i) {
      this.threeGeometry.vertices[i].set(position.x, position.y, position.z);
    }, this);
//    this.threeGeometry.dynamic = true;
    this.threeGeometry.verticesNeedUpdate = true;
//    this.threeGeometry.uvsNeedUpdate = true;
//    this.threeGeometry.computeFaceNormals();
//    this.threeGeometry.computeVertexNormals();
//    this.threeGeometry.computeTangents();

//this.threeGeometry.uvsNeedUpdate = true;
//this.threeGeometry.normalsNeedUpdate = true;
this.threeGeometry.tangentsNeedUpdate = true;
//this.threeGeometry.colorsNeedUpdate = true;
//this.threeGeometry.lineDistancesNeedUpdate = true;

	this.buffersNeedUpdate = false;
	this.groupsNeedUpdate = false;

    if (typeof(this.coreGeometry) !== 'undefined') {
      var corePositions = event.data.corePositions;
      oppaiPoisitions.forEach(function(position, i) {
        if (this.coreGeometry.vertices[i]) {
          this.coreGeometry.vertices[i].set(position.x, position.y, position.z);
        }
      }, this);
      this.coreGeometry.verticesNeedUpdate = true;
//      this.coreGeometry.computeFaceNormals();
//      this.coreGeometry.computeVertexNormals();
    }

    if (event.data.showFingers) {
      var fingerPositions = event.data.fingerPositions;
      fingerPositions.forEach(function(position, i) {
        var finger = this.threeFingers[i];
        if (typeof(finger) !== 'undefined') {
          finger.position.copy(position);
//          finger.quaternion.copy(quaternion);
        }
      }, this);
    }
    else {
      this.threeFingers.forEach(function(finger, i) {
        finger.position.set(-1000, 0, 0);
      }, this);
    }
  }.bind(this));
};

Oppai.Oppai.prototype.setPressure = function(pressure) {
  this.worker.postMessage({
    id: this.id,
    command:'setPressure', 
    pressure:pressure
  });
};

Oppai.Oppai.prototype.togglePressure = function() {
  this.worker.postMessage({
    id: this.id,
    command:'togglePressure'
  });
};

Oppai.Oppai.prototype.touch = function() {
  this.worker.postMessage({
    id: this.id,
    command:'touch'
  });
};

Oppai.Oppai.prototype.touchAt = function(point, faces) {
  this.worker.postMessage({
    id: this.id,
    command:'touchAt', 
    point:point,
    faces:faces
  });
};

Oppai.Oppai.prototype.shake = function() {
  this.worker.postMessage({
    id: this.id,
    command:'shake'
  });
};

}).call(this, Oppai);

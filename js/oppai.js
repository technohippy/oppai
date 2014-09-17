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
  }.bind(this));
  this.threeGeometry.verticesNeedUpdate = true;
  this.threeGeometry.computeFaceNormals();
  this.threeGeometry.computeVertexNormals();
  var material = new THREE.MeshPhongMaterial({
//    color: 0xffffff
    color: 0xffccaa
    , emissive: 0x0f0603
//    ,wireframe: true
  });
  this.threeMesh = new THREE.Mesh(this.threeGeometry, material);
  this.threeMesh.position.copy(this.center);
  if (!Oppai.isSmartphone) {
//    this.threeMesh.castShadow = true;
    this.threeMesh.receiveShadow = true;
  }
  this.threeFingers = [];
  if (typeof(worker) === 'undefined') {
    this.setupWorker();
  }
  else {
    this.worker = worker;
  }
};

Oppai.Oppai.prototype.setupWorker = function() {
  this.worker = new Worker('js/oppai_worker.js');
  this.worker.postMessage({
    id: this.id,
    command:'initialize', 
    geometry:this.threeGeometry, 
    center:this.center
  });
  this.worker.addEventListener('message', function(event) {
    var oppaiPoisitions = event.data.oppaiPositions;
    oppaiPoisitions.forEach(function(position, i) {
      this.threeGeometry.vertices[i].set(position.x, position.y, position.z);
    }.bind(this));
    this.threeGeometry.verticesNeedUpdate = true;
    this.threeGeometry.computeFaceNormals();
    this.threeGeometry.computeVertexNormals();

    var fingerPositions = event.data.fingerPositions;
    fingerPositions.forEach(function(position, i) {
      var finger = this.threeFingers[i];
      if (typeof(finger) !== 'undefined') {
        finger.position.copy(position);
//        finger.quaternion.copy(quaternion);
      }
    }.bind(this));
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

Oppai.Oppai.prototype.touchAt = function(faces) {
  this.worker.postMessage({
    id: this.id,
    command:'touchAt', 
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

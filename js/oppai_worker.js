importScripts('../lib/cannon.js');

function Oppai(id, geometry, center, fingerCount) {
  this.id = id;
  this.oppaiGeometry = geometry;
  this.center = typeof(center) === 'undefined' ? {x:0, y:0, z:0} : center;
  this.fingerCount = typeof(fingerCount) === 'undefined' ? 1 : fingerCount;
  this.oppaiBodies = [];
  this.fingerBodies = [];

  var mass = 0.5;
  var len = 0.03;
  this.oppaiGeometry.vertices.forEach(function(vertex, i) {
    vertex = new CANNON.Vec3(vertex.x + this.center.x, vertex.y + this.center.y, vertex.z + this.center.z);
    var body = new CANNON.RigidBody(
      vertex.x < 0 ? 0 : mass, 
      new CANNON.Box(new CANNON.Vec3(len, len, len))
    );
    body.position.set(vertex.x, vertex.y, vertex.z); // TODO: copy?
    body.linearDamping = self.clamp(0.1 + 0.4 * (vertex.y - vertex.x + 10) / 30, 0.1, 0.5);
    this.oppaiBodies.push(body);
    self.world.add(body);
  }.bind(this));

  var connected = {};
  this.oppaiGeometry.faces.forEach(function(face, i) {
    var va = this.oppaiBodies[face.a];
    var vb = this.oppaiBodies[face.b];
    var vc = this.oppaiBodies[face.c];
    var abDist = va.position.distanceTo(vb.position);
    var bcDist = vb.position.distanceTo(vc.position);
    var caDist = vc.position.distanceTo(va.position);
    var abKey = Math.min(face.a, face.b) + ' ' + Math.max(face.a, face.b);
    var bcKey = Math.min(face.b, face.c) + ' ' + Math.max(face.b, face.c);
    var caKey = Math.min(face.c, face.a) + ' ' + Math.max(face.c, face.a);
    if (!connected[abKey]) {
      connected[abKey] = true;
      self.world.addConstraint(new CANNON.DistanceConstraint(va, vb, abDist));
    }
    if (!connected[bcKey]) {
      connected[bcKey] = true;
      self.world.addConstraint(new CANNON.DistanceConstraint(vb, vc, bcDist));
    }
    if (!connected[caKey]) {
      connected[caKey] = true;
      self.world.addConstraint(new CANNON.DistanceConstraint(vc, va, caDist));
    }
  }.bind(this));

  for (var i = 0; i < this.fingerCount; i++) {
    var fingerBody = new CANNON.RigidBody(5, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
    fingerBody.position.set(0, -100, 100 * (i + 1));
    self.world.add(fingerBody);
    this.fingerBodies.push(fingerBody);
  }
};

Oppai.prototype.applyPressure = function() {
  var tkbIndex = 949;
  this.oppaiGeometry.faces.forEach(function(face, i) {
    var va = this.oppaiBodies[face.a];
    var vb = this.oppaiBodies[face.b];
    var vc = this.oppaiBodies[face.c];
    var pa = va.position;
    var pb = vb.position;
    var pc = vc.position;
    var ab = pb.vsub(pa);
    var ac = pc.vsub(pa);
    var lab = pa.distanceTo(pb);
    var lac = pa.distanceTo(pc);
    var rad = Math.acos(ab.dot(ac) / lab / lac);
    var fbasesize = lab * lac * Math.sin(rad);
    var fdir = ab.copy().cross(ac);
    fdir.normalize();
    var force = fdir.mult(self.pressure * fbasesize * (i == tkbIndex ? 15 : 1));
    va.applyForce(force, va.position);
    vb.applyForce(force, vb.position);
    vc.applyForce(force, vc.position);
  }.bind(this));
};

Oppai.prototype.step = function(dt) {
  if (typeof(dt) === 'undefined') dt = 1/24;
  this.applyPressure();
  if (self.autoSwing) {
    self.world.gravity.x = 0.5 * self.autoSwingSize * Math.cos(self.autoSwingCycle * 0.5);
    self.world.gravity.z = self.autoSwingSize * Math.sin(self.autoSwingCycle);
    self.autoSwingCycle += self.autoSwingStep / 180 * Math.PI;
  }
  self.world.step(dt);
  self.postMessage({
    id: this.id,
    command:'step', 
    oppaiPositions:this.oppaiBodies.map(function(body) {
      return {
        x:body.position.x - this.center.x, 
        y:body.position.y - this.center.y,
        z:body.position.z - this.center.z
      };
    }.bind(this)),
    fingerPositions:this.fingerBodies.map(function(body) {
      return {
        x:body.position.x,
        y:body.position.y,
        z:body.position.z
      };
    }.bind(this))
  });
};

Oppai.prototype.shake = function() {
  this.oppaiBodies.forEach(function(body) {
    if (0 < body.position.x) {
      body.applyImpulse(new CANNON.Vec3(0, 1, 0).mult(body.position.x), body.position);
    }
  });
};

Oppai.prototype.touch = function(index) {
  var fingerIndex = typeof(index) === 'undefined' ? 0 : index;
  var fingerBody = this.fingerBodies[fingerIndex];
  fingerBody.position.set(
    this.center.x + 25,
    this.center.y + Math.random() * 16 - 8, 
    this.center.z + Math.random() * 20 - 10
  );
  fingerBody.velocity.set(-50, 0, 0);
};

Oppai.prototype.touchAt = function(faces) {
  faces.forEach(function(face) {
    var ba = this.oppaiBodies[face.a];
    var bb = this.oppaiBodies[face.b];
    var bc = this.oppaiBodies[face.c];

    var force = 100;
    var targetPoint = new CANNON.Vec3(-3, 0, 0);
    var da = targetPoint.copy().vsub(ba.position);
    da.normalize();
    ba.applyForce(da.mult(force), ba.position);

    var db = targetPoint.copy().vsub(bb.position);
    db.normalize();
    bb.applyForce(db.mult(force), bb.position);

    var dc = targetPoint.copy().vsub(bc.position);
    dc.normalize();
    bc.applyForce(dc.mult(force), bc.position);
  }.bind(this));
};

self.oppais = {};

self.autoSwing = true;
self.autoSwingStep = 5;
self.autoSwingSize = 2;
self.autoSwingCycle = 0;
self.pressure = 1; /* TODO */
self.world = new CANNON.World();
self.world.gravity.set(0,-9.82,0);
self.world.broadphase = new CANNON.NaiveBroadphase();
self.world.solver.iterations = 8; /* TODO */

self.clamp = function(val, min, max) { return Math.max(max, Math.min(min, val)); };

self.initialize = function(data) {
  self.constructOppai(data);
  self.step();
};

self.constructOppai = function(data) {
  if (typeof(data.center) !== 'undefined') self.center = data.center;
  self.oppais[data.id] = new Oppai(data.id, data.geometry, data.center, data.fingerCount);

  /*
  var id = data.id + 10;
  var center = {x:data.center.x, y:data.center.y - 0, z:data.center.z};
  self.oppais[id] = new Oppai(id, data.coreGeometry, center, 0);
  */
};

self.setPressure = function(data) {
  self.pressure = data.pressure;
};

self.togglePressure = function() {
  self.pressure = Math.pow(self.pressure - 1, 2);
};

self.getOppaiById = function(id) {
  var oppai = self.oppais[id];
  if (typeof(oppai) === 'undefined') {
    var nullFunc = function() {};
    return {
      shake: nullFunc,
      touch: nullFunc,
      touchAt: nullFunc
    }
  }
  else {
    return oppai;
  }
};

self.shake = function(data) {
  self.getOppaiById(data.id).shake();
};

self.touch = function(data) {
  self.getOppaiById(data.id).touch(data.index);
};

self.touchAt = function(data) {
  self.getOppaiById(data.id).touchAt(data.faces);
};

self.step = function(dt) {
  if (typeof(dt) === 'undefined') dt = 1/24;
  for (var id in self.oppais) {
    var oppai = self.oppais[id];
    oppai.step(dt);
  }
  setTimeout(self.step, 1/60*1000);
};

self.addEventListener('message', function(event) {
  var data = event.data;
  self[data.command](data);
});

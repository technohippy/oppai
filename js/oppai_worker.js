importScripts('../lib/cannon.js');

function Oppai(id, geometry, center, fingerCount, isCore) {
  this.id = id;
  this.oppaiGeometry = geometry;
  this.center = typeof(center) === 'undefined' ? {x:0, y:0, z:0} : center;
  this.fingerCount = typeof(fingerCount) === 'undefined' ? 5 : fingerCount;
  this.isCore = isCore;
  this.oppaiBodies = [];
  this.fingerBodies = [];
  this.showFingers = true;
  this.currentFingerIndex = 0;
  this.coreOppai = null;

  var mass = this.isCore ? 0.1 : 0.5;
  var len = this.isCore ? 0.01 : 0.03;
  this.oppaiGeometry.vertices.forEach(function(vertex, i) {
    vertex = new CANNON.Vec3(vertex.x + this.center.x, vertex.y + this.center.y, vertex.z + this.center.z);
    var body = new CANNON.RigidBody(
      //!this.isCore && vertex.x < 0 && 9 < vertex.distanceTo(this.center) ? 0 : mass, 
      !this.isCore && vertex.x < 0 ? 0 : mass, 
      new CANNON.Box(new CANNON.Vec3(len, len, len))
    );
    body.position.set(vertex.x, vertex.y, vertex.z); // TODO: copy?
    if (!this.isCore) {
      body.linearDamping = self.clamp(0.1 + 0.6 * (vertex.y - vertex.x + 10) / 30, 0.1, 0.7);
    }
    this.oppaiBodies.push(body);
    self.world.add(body);
  }, this);

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
  }, this);

  var fingerMaterial = new CANNON.Material('fingerMaterial');
  for (var i = 0; i < this.fingerCount; i++) {
    var fingerBody = new CANNON.RigidBody(5-0.8*i, new CANNON.Box(new CANNON.Vec3(2, 2, 2)), fingerMaterial);
    fingerBody.position.set(0, -100, 100 * (i + 1));
    self.world.add(fingerBody);
    this.fingerBodies.push(fingerBody);
  }
};

Oppai.prototype.createPalmBody = function() {
  var unit = 1.5;

  var palm1Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*4, unit*5));
  var palm2Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*4/3, unit*4));
  var finger0Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*10/3, unit));
  var finger1Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*4, unit));
  var finger2Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*14/3, unit));
  var finger3Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*13/3, unit));
  var finger4Shape = new CANNON.Box(new CANNON.Vec3(unit, unit*10/3, unit));

  var isRight = this.center.z < 0 ? -1 : 1;
  var shape = new CANNON.Compound();
  shape.addChild(
    palm1Shape, 
    new CANNON.Vec3(0, 1, 0) 
  );
  shape.addChild(
    palm2Shape, 
    new CANNON.Vec3(unit/3, -unit*2.2, unit/3 * isRight), 
    this.getPalmQuaternion(0, Math.PI / 180 * 30)
  );
  shape.addChild(
    finger0Shape,
    new CANNON.Vec3(-unit, unit, -unit*4 * isRight), 
    this.getPalmQuaternion(-Math.PI / 180 * 30 * isRight, Math.PI / 180 * 30)
  );
  shape.addChild(
    finger1Shape, 
    new CANNON.Vec3(-unit*4/3, unit*14/3+unit/15, -unit*7/3 * isRight), 
    this.getPalmQuaternion(-Math.PI / 180 * 10 * isRight, Math.PI / 180 * 30)
  );
  shape.addChild(
    finger2Shape,
    new CANNON.Vec3(-unit*4/3, unit*15/3+unit/15, -unit*12/15 * isRight), 
    this.getPalmQuaternion(-Math.PI / 180 * 3 * isRight, Math.PI / 180 * 30)
  );
  shape.addChild(
    finger3Shape,
    new CANNON.Vec3(-unit*4/3, 4.1+6.5/2, (1+0.2) * isRight), 
    this.getPalmQuaternion(Math.PI / 180 * 3 * isRight, Math.PI / 180 * 30)
  );
  shape.addChild(
    finger4Shape,
    new CANNON.Vec3(-unit*4/3, 4.1+5/2, (3+0.5) * isRight), 
    this.getPalmQuaternion(Math.PI / 180 * 10 * isRight, Math.PI / 180 * 30)
  );
  var rigidBody = new CANNON.RigidBody(0, shape);
  //rigidBody.quaternion = this.getPalmQuaternion(Math.PI / 3 * isRight, 0);
  return rigidBody;
};

Oppai.prototype.getPalmQuaternion = function(x, z) {
  var qx = new CANNON.Quaternion();
  qx.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), x);
  var qz = new CANNON.Quaternion();
  qz.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), z);
  return qx.mult(qz);
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
//    var force = fdir.mult(self.pressure * fbasesize * (i == tkbIndex ? 15 : 1));
    var pressure = this.isCore ? 0.1 : self.pressure;
    var force = fdir.mult(pressure * fbasesize * (i == tkbIndex ? 15 : 1));
    va.applyForce(force, va.position);
    vb.applyForce(force, vb.position);
    vc.applyForce(force, vc.position);
  }, this);
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

  var messageParams = {
    id: this.id,
    command:'step', 
    oppaiPositions:this.oppaiBodies.map(function(body) {
      return {
        x:body.position.x - this.center.x, 
        y:body.position.y - this.center.y,
        z:body.position.z - this.center.z
      };
    }, this),
    showFingers:this.showFingers,
    fingerPositions:this.fingerBodies.map(function(body) {
      return {
        x:body.position.x,
        y:body.position.y,
        z:body.position.z
      };
    }, this)
  };
  if (this.palmBody) {
    messageParams['handPositions'] = {
      hand: {
        x: this.palmBody.position.x,
        y: this.palmBody.position.y,
        z: this.palmBody.position.z
      }
    };
  }
  if (this.coreOppai) {
    messageParams['corePositions'] = this.coreOppai.oppaiBodies.map(function(body) {
      return {
        x:body.position.x - this.center.x, 
        y:body.position.y - this.center.y,
        z:body.position.z - this.center.z
      };
    }, this);
  }
  self.postMessage(messageParams);
};

Oppai.prototype.moveHand = function(dx, dy, dz) {
  this.palmBody.position.x += dx;
  this.palmBody.position.y += dy;
  this.palmBody.position.z += dz;
};

Oppai.prototype.movePalm = function(point) {
  if (typeof(point.x) !== 'undefined') this.palmBody.position.x = point.x + center.x;
  if (typeof(point.y) !== 'undefined') this.palmBody.position.y = point.y + center.y;
  if (typeof(point.z) !== 'undefined') this.palmBody.position.z = point.z + center.z;
};

Oppai.prototype.grabPalm = function(degree) {
  var unit = 1.5;
  var isRight = this.center.z < 0 ? -1 : 1;

  var rad = Math.PI / 180 * degree;

  this.palmBody.shape.childOrientations[2] = 
    this.getPalmQuaternion(-Math.PI / 180 * 30 * isRight, rad);
  this.palmBody.shape.childOrientations[3] =
    this.getPalmQuaternion(-Math.PI / 180 * 10 * isRight, rad);
  this.palmBody.shape.childOrientations[4] =
    this.getPalmQuaternion(-Math.PI / 180 * 3 * isRight, rad);
  this.palmBody.shape.childOrientations[5] =
    this.getPalmQuaternion(Math.PI / 180 * 3 * isRight, rad);
  this.palmBody.shape.childOrientations[6] =
    this.getPalmQuaternion(Math.PI / 180 * 10 * isRight, rad);

  this.palmBody.shape.childOffsets[2].set(
    -(unit*10/3)/2*Math.sin(rad), 
    unit/2+(unit*10/3)/2*Math.cos(rad), 
    -unit*4 * isRight
  );
  this.palmBody.shape.childOffsets[3].set(
    -(unit*4)/2*Math.sin(rad), 
    unit*2.8+(unit*4)/2*Math.cos(rad), 
    -unit*7/3 * isRight
  );
  this.palmBody.shape.childOffsets[4].set(
    -(unit*14/3)/2*Math.sin(rad), 
    unit*2.8+(unit*14/3)/2*Math.cos(rad), 
    -unit*12/15 * isRight
  );
  this.palmBody.shape.childOffsets[5].set(
    -(unit*13/3)/2*Math.sin(rad),
    unit*2.8+(unit*13/3)/2*Math.cos(rad),
    (1+0.2) * isRight
  );
  this.palmBody.shape.childOffsets[6].set(
    -(unit*10/3)/2*Math.sin(rad),
    unit*2.8+(unit*10/3)/2*Math.cos(rad),
    (3+0.5) * isRight
  );
};

Oppai.prototype.rotatePalm = function(radian) {
  this.palmBody.quaternion = this.getPalmQuaternion(radian, 0);
};

Oppai.prototype.shake = function() {
  this.oppaiBodies.forEach(function(body) {
    if (0 < body.position.x) {
      body.applyImpulse(new CANNON.Vec3(0, 1, 0).mult(body.position.x), body.position);
    }
  });
};

Oppai.prototype.touch = function(index) {
  this.showFingers = true;
  var fingerIndex = typeof(index) === 'undefined' ? 0 : index;
  var fingerBody = this.fingerBodies[fingerIndex];
  fingerBody.position.set(
    this.center.x + 25,
    this.center.y + Math.random() * 16 - 8, 
    this.center.z + Math.random() * 20 - 10
  );
  fingerBody.velocity.set(-50, 0, 0);
};

Oppai.prototype.touchAt = function(center, faces) {
  this.showFingers = false;
  var face = faces[0];
  if (typeof(face) === 'undefined') return;

  var relativePosition = new CANNON.Vec3(
    face.normal.x,
    face.normal.y,
    face.normal.z
  ).mult(3);
  var position = new CANNON.Vec3(
    center.x + relativePosition.x,
    center.y + relativePosition.y,
    center.z + relativePosition.z
  );
  var velocity = new CANNON.Vec3(
    -face.normal.x,
    -face.normal.y,
    -face.normal.z
  ).mult(10);
  var fingerBody = this.fingerBodies[this.currentFingerIndex];
  this.currentFingerIndex = (this.currentFingerIndex + 1) % this.fingerBodies.length;
  fingerBody.position.set(position.x, position.y, position.z);
  fingerBody.velocity.set(velocity.x, velocity.y, velocity.z);
};

Oppai.prototype.deprecatdTouchAt = function(center, faces) {
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
  }, this);
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

  if (typeof(data.coreGeometry) !== 'undefined') {
    var center = {x:data.center.x, y:data.center.y, z:data.center.z};
    self.oppais[data.id].coreOppai = new Oppai(data.id+10, data.coreGeometry, center, 0, true);
  }
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
  self.getOppaiById(data.id).touchAt(data.point, data.faces);
};

self.moveHand = function(data) {
  self.getOppaiById(data.id).moveHand(data.dx, data.dy, data.dz);
};

self.setupPalm = function(data) {
  var oppai = self.getOppaiById(data.id);
  oppai.palmBody = oppai.createPalmBody();
  oppai.palmBody.position.set(oppai.center.x + 12.5, oppai.center.y + 0, oppai.center.z + 0);
  self.world.add(oppai.palmBody);
};

self.movePalm = function(data) {
  self.getOppaiById(data.id).movePalm(data.point);
};

self.grabPalm = function(data) {
  self.getOppaiById(data.id).grabPalm(data.degree);
};

self.rotatePalm = function(data) {
  self.getOppaiById(data.id).rotatePalm(data.radian);
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

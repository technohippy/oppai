importScripts('../lib/cannon.js');

self.autoSwing = true;
self.autoSwingStep = 5;
self.autoSwingSize = 2;
self.autoSwingCycle = 0;
self.pressure = 1; /* TODO */
self.center = {x:0, y:0, z:0};
self.oppaiGeometry = null;
self.oppaiBodies = [];
self.fingerBodies = [];
self.world = new CANNON.World();
self.world.gravity.set(0,-9.82,0);
self.world.broadphase = new CANNON.NaiveBroadphase();
self.world.solver.iterations = 8; /* TODO */

self.clamp = function(val, min, max) { return Math.max(max, Math.min(min, val)); };

self.initialize = function(data) {
  if (typeof(data.center) !== 'undefined') self.center = data.center;
  self.oppaiGeometry = data.geometry;

  var mass = 0.5;
  var len = 0.03;
  self.oppaiGeometry.vertices.forEach(function(vertex, i) {
    vertex = new CANNON.Vec3(vertex.x + self.center.x, vertex.y + self.center.y, vertex.z + self.center.z);
    //vertex = vertex.addSelf(self.center);
    var body = new CANNON.RigidBody(
      vertex.x < 0 ? 0 : mass, 
      new CANNON.Box(new CANNON.Vec3(len, len, len))
    );
    body.position.set(vertex.x, vertex.y, vertex.z); // TODO: copy?
    body.linearDamping = self.clamp(0.1 + 0.4 * (vertex.y - vertex.x + 10) / 30, 0.1, 0.5);
    self.oppaiBodies.push(body);
    self.world.add(body);
  });

  var connected = {};
  self.oppaiGeometry.faces.forEach(function(face, i) {
    var va = self.oppaiBodies[face.a];
    var vb = self.oppaiBodies[face.b];
    var vc = self.oppaiBodies[face.c];
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
  });

  var fingerCount = typeof(data.fingerCount) === 'undefined' ? 1 : data.fingerCount;
  for (var i = 0; i < fingerCount; i++) {
    var fingerBody = new CANNON.RigidBody(5, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
    fingerBody.position.set(0, -100, 100 * (i + 1));
    self.world.add(fingerBody);
    self.fingerBodies.push(fingerBody);
  }

  self.step();
};

self.applyPressure = function() {
  var tkbIndex = 949;
  self.oppaiGeometry.faces.forEach(function(face, i) {
    var va = self.oppaiBodies[face.a];
    var vb = self.oppaiBodies[face.b];
    var vc = self.oppaiBodies[face.c];
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
  });
};

self.setPressure = function(data) {
  self.pressure = data.pressure;
};

self.togglePressure = function() {
  self.pressure = Math.pow(self.pressure - 1, 2);
};

self.shake = function() {
  self.oppaiBodies.forEach(function(body) {
    if (0 < body.position.x) {
      body.applyImpulse(new CANNON.Vec3(0, 1, 0).mult(body.position.x), body.position);
    }
  });
};

self.touch = function(data) {
  var fingerIndex = typeof(data.index) === 'undefined' ? 0 : data.index;
  var fingerBody = self.fingerBodies[fingerIndex];
  fingerBody.position.set(
    self.center.x + 25,
    self.center.y + Math.random() * 16 - 8, 
    self.center.z + Math.random() * 20 - 10
  );
  fingerBody.velocity.set(-50, 0, 0);
};

self.touchAt = function(data) {
  var faces = data.faces;
  faces.forEach(function(face) {
    var ba = self.oppaiBodies[face.a];
    var bb = self.oppaiBodies[face.b];
    var bc = self.oppaiBodies[face.c];

    var force = 200;
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
  });
};

self.step = function(dt) {
  if (typeof(dt) === 'undefined') dt = 1/24;
  self.applyPressure();
  if (self.autoSwing) {
    self.world.gravity.x = 0.5 * self.autoSwingSize * Math.cos(self.autoSwingCycle * 0.5);
    self.world.gravity.z = self.autoSwingSize * Math.sin(self.autoSwingCycle);
    self.autoSwingCycle += self.autoSwingStep / 180 * Math.PI;
  }
  self.world.step(dt);
  self.postMessage({
    command:'step', 
    oppaiPositions:self.oppaiBodies.map(function(body) {
      return {
        x:body.position.x - self.center.x, 
        y:body.position.y - self.center.y,
        z:body.position.z - self.center.z
      };
    }.bind(this)),
    fingerPositions:self.fingerBodies.map(function(body) {
      return {
        x:body.position.x,
        y:body.position.y,
        z:body.position.z
      };
    }.bind(this))
  });
  setTimeout(self.step, 1/60*1000);
};

self.addEventListener('message', function(event) {
  var data = event.data;
  switch (data.command) {
    case 'initialize':
      self.initialize(data);
      break;
    case 'setPressure':
      self.setPressure(data);
      break;
    case 'togglePressure':
      self.togglePressure(data);
      break;
    case 'shake':
      self.shake(data);
      break;
    case 'touch':
      self.touch(data);
      break;
    case 'touchAt':
      self.touchAt(data);
      break;
    default:
      break;
  }
});

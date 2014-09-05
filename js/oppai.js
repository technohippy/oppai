var Oppai = Oppai || {};

(function(Oppai) {
"use strict";

Oppai.Oppai = function() {
  this.pressure = 0.6;

  this.threeGeometry = new THREE.IcosahedronGeometry(10, 3);
  var material = new THREE.MeshPhongMaterial({color: 0xffffff});
  this.threeMesh = new THREE.Mesh(this.threeGeometry, material);
  this.threeMesh.castShadow = true;
  this.threeMesh.receiveShadow = true;

  this.cannonWorld = new CANNON.World();
  this.cannonWorld.gravity.set(0,-9.82,0);
  this.cannonWorld.broadphase = new CANNON.NaiveBroadphase();
  //this.cannonWorld.solver.iterations = 2;
  this.cannonWorld.solver.iterations = 8;

//  var core = new CANNON.RigidBody(0, new CANNON.Sphere(5));
//  core.position.y -= 3;
//  this.cannonWorld.add(core);

  this.cannonBodies = [];
  var mass = 0.5;
  var len = 0.05;
  this.threeGeometry.vertices.forEach(function(vertex, i) {
    var body = new CANNON.RigidBody(
      vertex.x < 0 ? 0 : mass, 
      new CANNON.Box(new CANNON.Vec3(len, len, len))
    );
    if (0 < vertex.x) body.force.z = 1000;
    body.position.set(vertex.x, vertex.y, vertex.z); // TODO: copy?
    this.cannonBodies.push(body);
    this.cannonWorld.add(body);
  }.bind(this));

  var connected = {};
  this.threeGeometry.faces.forEach(function(face, i) {
    var va = this.cannonBodies[face.a];
    var vb = this.cannonBodies[face.b];
    var vc = this.cannonBodies[face.c];
    var abDist = va.position.distanceTo(vb.position);
    var bcDist = vb.position.distanceTo(vc.position);
    var caDist = vc.position.distanceTo(va.position);
    var abKey = Math.min(face.a, face.b) + ' ' + Math.max(face.a, face.b);
    var bcKey = Math.min(face.b, face.c) + ' ' + Math.max(face.b, face.c);
    var caKey = Math.min(face.c, face.a) + ' ' + Math.max(face.c, face.a);
    if (!connected[abKey]) {
      connected[abKey] = true;
      this.cannonWorld.addConstraint(new CANNON.DistanceConstraint(va, vb, abDist));
    }
    if (!connected[bcKey]) {
      connected[bcKey] = true;
      this.cannonWorld.addConstraint(new CANNON.DistanceConstraint(vb, vc, bcDist));
    }
    if (!connected[caKey]) {
      connected[caKey] = true;
      this.cannonWorld.addConstraint(new CANNON.DistanceConstraint(vc, va, caDist));
    }
  }.bind(this));
};

Oppai.Oppai.prototype.applyPressure = function() {
  this.threeGeometry.faces.forEach(function(face, i) {
    var va = this.cannonBodies[face.a];
    var vb = this.cannonBodies[face.b];
    var vc = this.cannonBodies[face.c];
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
    var force = fdir.mult(this.pressure * fbasesize);
    va.applyForce(force, va.position);
    vb.applyForce(force, vb.position);
    vc.applyForce(force, vc.position);
  }.bind(this));
};

Oppai.Oppai.prototype.step = function(worldOrScene) {
  this.applyPressure();
  this.cannonWorld.step(1/24);
  this.cannonBodies.forEach(function(body, i) {
    this.threeGeometry.vertices[i].set(body.position.x, body.position.y, body.position.z);
  }.bind(this));
  this.threeGeometry.verticesNeedUpdate = true;
};

}).call(this, Oppai);

(function() {
"use strict";

function constructDirectionalLight(color) {
  if (typeof(color) === 'undefined') color = 0xffffff;
  var threeLight = new THREE.DirectionalLight(color);
  threeLight.position = new THREE.Vector3(1, 1, -1);
  threeLight.castShadow = true;
  threeLight.shadowBias = 0.001;
  threeLight.shadowCameraNear = -100;
  threeLight.shadowCameraFar = 100;
  threeLight.shadowCameraLeft = -100;
  threeLight.shadowCameraRight = 100;
  threeLight.shadowCameraTop = 100;
  threeLight.shadowCameraBottom = -100;
  threeLight.shadowMapWidth = 3072;
  threeLight.shadowMapHeight = 3072;
  //threeLight.shadowCameraVisible = true;
  return threeLight;
}

function constructRenderer() {
  var threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setClearColor(0x000000, 1);
  threeRenderer.shadowMapEnabled = true;
  threeRenderer.shadowMapSoft = true;
  threeRenderer.shadowMapType = THREE.PCFShadowMap;
  return threeRenderer;
}

var threeScene = new THREE.Scene();
threeScene.add(constructDirectionalLight());
threeScene.add(new THREE.AmbientLight(0x333333));

var threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight);
var controls = new Oppai.RingControls(threeCamera, new THREE.Vector3(0, 8, 0), new THREE.Vector3(0, 0, 0));

var threeRenderer = constructRenderer();
document.body.appendChild(threeRenderer.domElement);

var oppai = location.search === '?2' ? 
  new Oppai.Oppai(new THREE.Vector3(0, 0, -11)) :
  new Oppai.Oppai(new THREE.Vector3(0, 0, 0));
threeScene.add(oppai);
if (location.search === '?2') {
  var oppai2 = new Oppai.Oppai(new THREE.Vector3(0, 0, 11), oppai.cannonWorld);
  threeScene.add(oppai2);
}

var hand = new Oppai.Hand(oppai);
threeScene.add(hand);

document.addEventListener('keypress', function(event) {
  if (event.keyCode == 13/*enter*/) {
    oppai.cannonBodies.forEach(function(body) {
      if (5 < body.position.x) body.applyImpulse(new CANNON.Vec3(0, 5, 0), body.position);
    });
  }
  else if (event.keyCode == 119/*w*/) {
    oppai.threeMesh.material.wireframe = !oppai.threeMesh.material.wireframe;
    if (oppai2) oppai2.threeMesh.material.wireframe = !oppai2.threeMesh.material.wireframe;
  }
  else if (event.keyCode == 120/*x*/) {
    oppai.pressure = Math.pow(oppai.pressure - 1, 2);
  }
});

(function render() {
  window.requestAnimationFrame(render);
  oppai.step();
  if (oppai2) oppai2.step();
  hand.step();
  controls.update();
  threeRenderer.render(threeScene, threeCamera);
})();

})();

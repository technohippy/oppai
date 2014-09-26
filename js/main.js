//(function() {
//"use strict";

function constructSpotLight() {
  var light = new THREE.SpotLight(0xffffff, 4, 40, Math.PI*3/4, 0.1);
  light.position.set(30, 20, 0);
  light.target.position = new THREE.Vector3();
  light.castShadow = true;
  light.shadowDarkness = 0.3;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 50;
  //light.shadowCameraVisible = true;
  return light;
}

function constructDirectionalLight(direction, color) {
  if (typeof(direction) === 'undefined') direction = new THREE.Vector3(1, 1, -1);
  if (typeof(color) === 'undefined') color = 0xffffff;
  var threeLight = new THREE.DirectionalLight(color);
  threeLight.position = direction;
/*
  if (!Oppai.isSmartphone) {
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
  }
*/
  return threeLight;
}

function constructRenderer() {
  var threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setClearColor(0x000000, 1);
  if (!Oppai.isSmartphone) {
    threeRenderer.shadowMapEnabled = true;
    threeRenderer.shadowMapSoft = true;
    threeRenderer.shadowMapType = THREE.PCFShadowMap;
  }
  return threeRenderer;
}

var threeScene = new THREE.Scene();
threeScene.add(constructSpotLight());
//threeScene.add(constructDirectionalLight(new THREE.Vector3(0.3, -1, 0), 0x333333));
threeScene.add(constructDirectionalLight(new THREE.Vector3(0.3, -1, 0), 0x443333));
threeScene.add(new THREE.AmbientLight(0x0f0603));

var threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight);
var controls = new Oppai.RingControls(threeCamera, new THREE.Vector3(0, 0, 0), new THREE.Vector3(4, 0, 0));

var threeRenderer = constructRenderer();
document.body.appendChild(threeRenderer.domElement);

var oppai, oppai2, hand, hand2;
if (location.search === '?1') {
  oppai = new Oppai.Oppai(new THREE.Vector3(0, 0, 0));
  hand = new Oppai.Hand(oppai, threeCamera, threeScene);
  threeScene.add(oppai);
  threeScene.add(hand);
}
else {
  oppai = new Oppai.Oppai(new THREE.Vector3(0, 0, -11));
  //oppai2 = new Oppai.Oppai(new THREE.Vector3(0, 0, 11), oppai.worker);
  oppai2 = new Oppai.Oppai(new THREE.Vector3(0, 0, 11));
  hand = new Oppai.Hand(oppai, threeCamera, threeScene);
  hand2 = new Oppai.Hand(oppai2, threeCamera, threeScene);
  threeScene.add(oppai);
  threeScene.add(oppai2);
  threeScene.add(hand);
  threeScene.add(hand2);
}

/*
var bodyGeometry = new THREE.IcosahedronGeometry(20, 3);
bodyGeometry.vertices.forEach(function(vertex, i) {
  if (15 < vertex.y) vertex.y = 15;
  if (vertex.y < -15) vertex.y = -15;
  vertex.z *= 1.3;
  vertex.x *= 0.5;
});
var body = new THREE.Mesh(bodyGeometry, oppai.threeMesh.material);
body.position.x -= 8;
body.receiveShadow = true;
threeScene.add(body);
*/

document.addEventListener('keydown', function(event) {
  if (event.keyCode === 13/*enter*/) {
    oppai.shake();
    if (oppai2) oppai2.shake();
  }
  else if (event.keyCode === 87/*w*/) {
    oppai.threeMesh.material.wireframe = !oppai.threeMesh.material.wireframe;
    if (oppai2) oppai2.threeMesh.material.wireframe = !oppai2.threeMesh.material.wireframe;
  }
  else if (event.keyCode === 88/*x*/) {
    oppai.togglePressure();
    if (oppai2) oppai2.togglePressure();
  }
});

(function render() {
  window.requestAnimationFrame(render);
  controls.update();
  threeRenderer.render(threeScene, threeCamera);
})();

//})();

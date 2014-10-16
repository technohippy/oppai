//(function() {
//"use strict";

function constructSpotLight() {
  //var light = new THREE.SpotLight(0xffffff, 3, 100, Math.PI*3/4, 0.1);
  var light = new THREE.SpotLight(0xffffff, 3, 110, Math.PI*3/4, 0.1);
  light.position.set(60, 40, 0);
  //light.position.set(60, 40, 30);
  light.target.position = new THREE.Vector3();
  light.castShadow = true;
  light.shadowDarkness = 0.3;
  light.shadowCameraNear = 50;
  light.shadowCameraFar = 100;
  light.shadowMapWidth = 1024;
  light.shadowMapHeight = 1024;
  //light.shadowCameraVisible = true;
  return light;
}

function constructDirectionalLight(direction, color) {
  if (typeof(direction) === 'undefined') direction = new THREE.Vector3(1, 1, -1);
  if (typeof(color) === 'undefined') color = 0xffffff;
  var threeLight = new THREE.DirectionalLight(color);
  threeLight.position = direction;
  return threeLight;
}

function constructPointLight() {
  var light = new THREE.PointLight(0xffffff, 5, 10);
  light.position.x += 10;
  light.position.y += 10;
  return light;
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

function startPalm(threeScene, opi, opi2) {
  if (typeof(opi.palm) !== 'undefined') return;

  opi.setupPalm();
  threeScene.add(opi.palm);
  if (opi2) {
    opi2.setupPalm();
    threeScene.add(opi2.palm);
  }

  var detector = new Detector();
  detector.addDetectHandler(function(data, gc) {
    if (data.size < 10) return;

    var center = data.centerAverage;
    var dx = center.x / Detector.DEFAULT_WIDTH - 0.5;
    var dy = center.y / Detector.DEFAULT_HEIGHT - 0.5;

    var x = 15 - (data.size - 10) / 150;
    var y = -dy * 15 - 2;
    var z = dx * 15;
    opi.movePalm({x:x, y:y, z:z});
    var aspectRatio = data.aspectRatioAverage < 1 ? 1 / data.aspectRatioAverage : data.aspectRatioAverage;
    if (!isNaN(aspectRatio)) opi.grabPalm(aspectRatio * 40);

    if (opi2) opi2.movePalm({x:x, y:y, z:z});
  });
  detector.debug(false);
  detector.start();
  detector.detect();
}

var threeScene = new THREE.Scene();
threeScene.add(constructSpotLight());
//threeScene.add(constructDirectionalLight(new THREE.Vector3(0.3, -1, 0), 0x333333));
threeScene.add(constructDirectionalLight(new THREE.Vector3(0.3, -1, 0), 0x443333));
//threeScene.add(constructPointLight());
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
  else if (event.keyCode === 70/*f*/) {
    oppai.moveHand(-0.1, 0, 0);
    if (oppai2) oppai2.moveHand(-0.1, 0, 0);
  }
  else if (event.keyCode === 66/*b*/) {
    oppai.moveHand(0.1, 0, 0);
    if (oppai2) oppai2.moveHand(0.1, 0, 0);
  }
  else if (event.shiftKey) {
    // cursor keys
    if (event.keyCode === 37) {
      oppai.moveHand(0, 0, 0.1);
      if (oppai2) oppai2.moveHand(0, 0, 0.1);
    }
    else if (event.keyCode === 38) {
      oppai.moveHand(0, 0.1, 0);
      if (oppai2) oppai2.moveHand(0, 0.1, 0);
    }
    else if (event.keyCode === 39) {
      oppai.moveHand(0, 0, -0.1);
      if (oppai2) oppai2.moveHand(0, 0, -0.1);
    }
    else if (event.keyCode === 40) {
      oppai.moveHand(0, -0.1, 0);
      if (oppai2) oppai2.moveHand(0, -0.1, 0);
    }
  }
});

(function render() {
  window.requestAnimationFrame(render);
  controls.update();
  threeRenderer.render(threeScene, threeCamera);
})();

//})();

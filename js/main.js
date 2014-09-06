var oppai = new Oppai.Oppai();

var threeScene = new THREE.Scene();
threeScene.add(oppai.threeMesh);

var threeLight = new THREE.DirectionalLight(0xffffff);
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
threeScene.add(threeLight);
threeScene.add(new THREE.AmbientLight(0x333333));

var cameraAngle = Math.PI;
var cameraDistance = 30;
function setCamera() {
  threeCamera.position = new THREE.Vector3(
    cameraDistance * Math.sin(cameraAngle), 
    8, 
    cameraDistance * Math.cos(cameraAngle)
  );
  threeCamera.lookAt(new THREE.Vector3(0, 0, 0));
}
var threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight);
setCamera();

//var threeControls = new THREE.OrbitControls(threeCamera);

var threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
threeRenderer.setSize(window.innerWidth, window.innerHeight);
threeRenderer.setClearColor(0x000000, 1);
threeRenderer.shadowMapEnabled = true;
threeRenderer.shadowMapSoft = true;
threeRenderer.shadowMapType = THREE.PCFShadowMap;
document.body.appendChild(threeRenderer.domElement);

/*
var wall = new THREE.Mesh(new THREE.CubeGeometry(10, 20, 20), new THREE.MeshPhongMaterial({color: 0xff0000}));
wall.position.copy(oppai.wall.position);
threeScene.add(wall);
*/

var cannonBox = new CANNON.RigidBody(5, new CANNON.Box(new CANNON.Vec3(2, 2, 2)));
cannonBox.position.set(0, -100, 0);
oppai.cannonWorld.add(cannonBox);
var threeBox = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshPhongMaterial({color: 0xff0000}));
threeBox.castShadow = true;
threeBox.receiveShadow = false;
threeScene.add(threeBox);
document.addEventListener('keypress', function(event) {
  console.log(event.keyCode);
  if (event.keyCode == 32/*spc*/) {
    cannonBox.position.set(25, 2, 0);
    cannonBox.velocity.set(-50, 0, 0);
  }
  else if (event.keyCode == 60/*<*/ || event.keyCode == 122/*z*/) {
    cameraAngle -= Math.PI * 0.02;
    setCamera();
  }
  else if (event.keyCode == 62/*>*/ || event.keyCode == 99/*c*/) {
    cameraAngle += Math.PI * 0.02;
    setCamera();
  }
  else if (event.keyCode == 13/*enter*/) {
    oppai.cannonBodies.forEach(function(body) {
      if (5 < body.position.x) {
        body.applyImpulse(new CANNON.Vec3(0, 5, 0), body.position);
      }
    });
  }
  else if (event.keyCode == 119/*w*/) {
    oppai.threeMesh.material.wireframe = !oppai.threeMesh.material.wireframe;
  }
});

function render() {
  window.requestAnimationFrame(render);
  oppai.step();
  threeBox.position.copy(cannonBox.position);
  threeBox.quaternion.copy(cannonBox.quaternion);
//  threeControls.update();
  threeRenderer.render(threeScene, threeCamera);
}
render();

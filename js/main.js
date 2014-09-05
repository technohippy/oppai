var oppai = new Oppai.Oppai();

var threeScene = new THREE.Scene();
threeScene.add(oppai.threeMesh);

var threeLight = new THREE.DirectionalLight(0xffffff);
threeLight.position = new THREE.Vector3(-1, -1, -1);
threeLight.castShadow = true;
threeLight.shadowBias = 0.0001;
threeLight.shadowCameraNear = 1;
threeLight.shadowCameraFar = 100;
threeLight.shadowCameraLeft = -50;
threeLight.shadowCameraRight = 50;
threeLight.shadowCameraTop = 50;
threeLight.shadowCameraBottom = -50;
threeLight.shadowMapWidth = 1024;
threeLight.shadowMapHeight = 1024;
threeScene.add(threeLight);
threeScene.add(new THREE.AmbientLight(0x333333));

var threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight);
threeCamera.position = new THREE.Vector3(0, 8, -30);
threeCamera.lookAt(new THREE.Vector3(0, 0, 0));
var threeRenderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
threeRenderer.setSize(window.innerWidth, window.innerHeight);
threeRenderer.setClearColor(0x000000, 1);
threeRenderer.shadowMapEnabled = true;
threeRenderer.shadowMapSoft = true;
threeRenderer.shadowMapType = THREE.PCFShadowMap;
document.body.appendChild(threeRenderer.domElement);

function render() {
  window.requestAnimationFrame(render);
  oppai.step();
  threeRenderer.render(threeScene, threeCamera);
}
render();

function clickEvent() { return Oppai.isSmartphone ? 'touchend' : 'click'; }

document.getElementById('sidebar-button').addEventListener(clickEvent(), function(event) {
  if (event.target.classList.contains('close')) {
    event.target.classList.remove('close');
    event.target.classList.add('open');
    document.getElementById('sidebar').className = 'open';
  }
  else {
    event.target.classList.remove('open');
    event.target.classList.add('close');
    document.getElementById('sidebar').className = 'close';
  }
});
document.getElementById('plane-button').addEventListener(clickEvent(), function(event) {
  oppai.threeMesh.material.wireframe = false;
  if (oppai2) oppai2.threeMesh.material.wireframe = false;
  hand.threeFinger.material.wireframe = false;
});
document.getElementById('mesh-button').addEventListener(clickEvent(), function(event) {
  oppai.threeMesh.material.wireframe = true;
  if (oppai2) oppai2.threeMesh.material.wireframe = true;
  hand.threeFinger.material.wireframe = true;
});
document.getElementById('turn-right-button').addEventListener(clickEvent(), function(event) {
  controls.angle -= Math.PI * 0.01;
});
document.getElementById('turn-left-button').addEventListener(clickEvent(), function(event) {
  controls.angle += Math.PI * 0.01;
});
document.getElementById('zoom-in-button').addEventListener(clickEvent(), function(event) {
  controls.distance -= 0.5;
});
document.getElementById('zoom-out-button').addEventListener(clickEvent(), function(event) {
  controls.distance += 0.5;
});
document.getElementById('throw-button').addEventListener(clickEvent(), function(event) {
  hand.touch();
  if (hand2) hand2.touch();
});
document.getElementById('shake-button').addEventListener(clickEvent(), function(event) {
  oppai.shake();
  if (oppai2) oppai2.shake();
});
document.getElementById('inflate-button').addEventListener(clickEvent(), function(event) {
  oppai.setPressure(1);
  if (oppai2) oppai2.setPressure(1);
});
document.getElementById('deflate-button').addEventListener(clickEvent(), function(event) {
  oppai.setPressure(0);
  if (oppai2) oppai2.setPressure(0);
});

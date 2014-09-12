document.getElementById('sidebar-button').addEventListener('click', function(event) {
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
document.getElementById('plane-button').addEventListener('click', function(event) {
  oppai.threeMesh.material.wireframe = false;
  if (oppai2) oppai2.threeMesh.material.wireframe = false;
  hand.threeFinger.material.wireframe = false;
});
document.getElementById('mesh-button').addEventListener('click', function(event) {
  oppai.threeMesh.material.wireframe = true;
  if (oppai2) oppai2.threeMesh.material.wireframe = true;
  hand.threeFinger.material.wireframe = true;
});
document.getElementById('throw-button').addEventListener('click', function(event) {
  hand.touch();
});
document.getElementById('shake-button').addEventListener('click', function(event) {
  oppai.shake();
});



/*とりあえず*/
document.getElementById('sidebar-button').addEventListener('touchend', function(event) {
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
document.getElementById('plane-button').addEventListener('touchend', function(event) {
  oppai.threeMesh.material.wireframe = false;
  if (oppai2) oppai2.threeMesh.material.wireframe = false;
  hand.threeFinger.material.wireframe = false;
});
document.getElementById('mesh-button').addEventListener('touchend', function(event) {
  oppai.threeMesh.material.wireframe = true;
  if (oppai2) oppai2.threeMesh.material.wireframe = true;
  hand.threeFinger.material.wireframe = true;
});
document.getElementById('throw-button').addEventListener('touchend', function(event) {
  hand.touch();
});
document.getElementById('shake-button').addEventListener('touchend', function(event) {
  oppai.shake();
});


function clickEvent() { return Oppai.isSmartphone ? 'touchend' : 'click'; }

function addClickEventListener(id, listener) {
  document.getElementById(id).addEventListener(clickEvent(), function(event) {
    listener(event);
    event.target.blur();
  });
}

addClickEventListener('sidebar-button', function(event) {
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
addClickEventListener('help-button', function(event) {
  var target = document.getElementById('help');
  if (target.classList.contains('hide')) {
    target.classList.remove('hide');
    target.classList.add('show');
  }
  else {
    target.classList.remove('show');
    target.classList.add('hide');
  }
});
addClickEventListener('plane-button', function(event) {
  oppai.threeMesh.material.wireframe = false;
  oppai.threeFingers.forEach(function(finger, i) {
    finger.material.wireframe = false;
  }, this);
  if (oppai2) {
    oppai2.threeMesh.material.wireframe = false;
    oppai2.threeFingers.forEach(function(finger, i) {
      finger.material.wireframe = false;
    }, this);
  }
});
addClickEventListener('mesh-button', function(event) {
  oppai.threeMesh.material.wireframe = true;
  oppai.threeFingers.forEach(function(finger, i) {
    finger.material.wireframe = true;
  }, this);
  if (oppai2) {
    oppai2.threeMesh.material.wireframe = true;
    oppai2.threeFingers.forEach(function(finger, i) {
      finger.material.wireframe = true;
    }, this);
  }
});
addClickEventListener('turn-right-button', function(event) {
  controls.angle -= Math.PI * 0.01;
});
addClickEventListener('turn-left-button', function(event) {
  controls.angle += Math.PI * 0.01;
});
addClickEventListener('zoom-in-button', function(event) {
  controls.distance -= 0.5;
});
addClickEventListener('zoom-out-button', function(event) {
  controls.distance += 0.5;
});
addClickEventListener('throw-button', function(event) {
  hand.touch();
  if (hand2) hand2.touch();
});
addClickEventListener('shake-button', function(event) {
  oppai.shake();
  if (oppai2) oppai2.shake();
});
addClickEventListener('inflate-button', function(event) {
  oppai.setPressure(1);
  if (oppai2) oppai2.setPressure(1);
});
addClickEventListener('deflate-button', function(event) {
  oppai.setPressure(0);
  if (oppai2) oppai2.setPressure(0);
});
addClickEventListener('webcam-button', function(event) {
  togglePalm(threeScene, oppai, oppai2);
});
addClickEventListener('debug-button', function(event) {
  detector.debug(!detector.debugOn);
});

"use strict";

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia || navigator.msGetUserMedia;

var Detector = function(videoOrId, canvasOrId) {
  this.videoCreated = false;
  if (videoOrId === undefined) {
    this.videoCreated = true;
    this.video = document.createElement('video');
    this.video.width = Detector.DEFAULT_WIDTH;
    this.video.height = Detector.DEFAULT_HEIGHT;
    this.video.style.position = 'absolute';
    this.video.style.top = -Detector.DEFAULT_HEIGHT;
    document.body.appendChild(this.video);
  }
  else if (videoOrId instanceof HTMLElement) {
    this.video = videoOrId;
  }
  else {
    this.video = document.getElementById(videoOrId);
  }

  this.canvasCreated = false;
  if (canvasOrId === undefined) {
    this.canvasCreated = true;
    this.canvas = document.createElement('canvas');
    this.canvas.width = Detector.DEFAULT_WIDTH;
    this.canvas.height = Detector.DEFAULT_HEIGHT;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = -Detector.DEFAULT_HEIGHT;
    document.body.appendChild(this.canvas);
  }
  else if (canvasOrId instanceof HTMLElement) {
    this.canvas = canvasOrId;
  }
  else {
    this.canvas = document.getElementById(canvasOrId);
  }
  this.gc = this.canvas.getContext('2d');

  this.worker = null;
  this.detectHandlers = [];
  this.errorHandlers = [];
  this.isDetecting = true;
  this.isDebug = false;
};

Detector.DEFAULT_WIDTH = 400;
Detector.DEFAULT_HEIGHT = 300;

Detector.prototype.debug = function(flag) {
  return;

  this.debugOn = flag;
  if (!this.debugHandler) {
    this.debugHandler = function(data, gc) {
      data.points.forEach(function(point) {
        gc.fillStyle = '#00FF00';
        gc.beginPath();
        gc.fillRect(point.x, point.y, 5, 5);
      });
    };
  }

  if (this.debugOn) {
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.addDetectHandler(this.debugHandler);
  }
  else {
    this.canvas.style.top = -Detector.DEFAULT_HEIGHT;
    this.removeDetectHandler(this.debugHandler);
  }
};

Detector.prototype.addDetectHandler = function(handler) {
  this.detectHandlers.push(handler);
};

Detector.prototype.removeDetectHandler = function(handler) {
  // TODO: 仮
  this.detectHandlers.pop();
};

Detector.prototype.addErrorHandler = function(handler) {
  this.errorHandlers.push(handler);
};

Detector.prototype.startCamera = function() {
  navigator.getUserMedia(
    {video: true},
    function(localMediaStream) {
      this.video.src = window.URL.createObjectURL(localMediaStream);
      this.video.play();
    }.bind(this),
    function(err) {
      this.errorHandlers.forEach(function(handler) {
        handler(err);
      });
    }.bind(this)
  );
};

Detector.prototype.startWorker = function() {
  //this.worker = new Worker('js/detector_worker.js');
  this.worker = new Worker('lib/detector_worker.js');
  this.worker.addEventListener('message', function(event) {
    this.detectHandlers.forEach(function(handler) {
      handler(event.data, this.gc);
    }.bind(this));
    if (this.isDetecting) setTimeout(this.detect.bind(this), 10);
  }.bind(this));
};

Detector.prototype.start = function() {
  if (this.isDebug) {
    if (this.videoCreated) {
      this.video.style.position = 'static';
      this.video.style.top = undefined;
    }
    if (this.canvasCreated) {
      this.canvas.style.position = 'static';
      this.canvas.style.top = undefined;
    }
  }
  this.startCamera();
  this.startWorker();
};

Detector.prototype.detect = function() {
  this.isDetecting = true;
  this.gc.drawImage(this.video, 0, 0, this.video.width, this.video.height);
  this.worker.postMessage(this.gc.getImageData(0, 0, this.video.width, this.video.height));
};

Detector.prototype.stop = function() {
  this.isDetecting = false;
};

"use strict";

var centers = [];

addEventListener('message', function(event) {
  var imageData = event.data;
  var width = imageData.width;
  var height = imageData.height;
  var data = imageData.data;
  var redPoints = [];
  var greenPoints = [];
  var bluePoints = [];

  var step = 5;
  for (var x = 0; x < width; x+=step) {
    for (var y = 0; y < height; y+=step) {
      var base = x * 4 + y * width * 4;
      var r = data[base];
      var g = data[base+1];
      var b = data[base+2];
      var a = data[base+3];
      if (isRed(r, g, b, a)) {
        redPoints.push({x:x, y:y});
      }
      else if (isGreen(r, g, b, a)) {
        greenPoints.push({x:x, y:y});
      }
      else if (isBlue(r, g, b, a)) {
        bluePoints.push({x:x, y:y});
      }
    }
  }

  var center = getCenter(redPoints);
  while (10 <= centers.length) {
    centers.shift();
  }
  centers.push(center);
  var centerAverage = getCenterAverage(centers);
  
  postMessage({
    redPoints:{points:redPoints, center:center, centerAverage:centerAverage, size:redPoints.length},
    greenPoints:{points:greenPoints, size:greenPoints.length},
    bluePoints:{points:bluePoints, size:bluePoints.length},
    isShot:25 < bluePoints.length && redPoints.length < bluePoints.length
  });
});

function isRed(r, b, g, a) {
  return 250 < a && 100 < r && g < r/2.0 && b < r/2.0;
}

function isGreen(r, g, b, a) {
  return 250 < a && r < g/2.0 && 100 < g && b < g/2.0;
}

function isBlue(r, g, b, a) {
  return 250 < a && r < b/2.0 && g < b/2.0 && 100 < b;
}

function getCenter(points) {
  var meanValue = {x:0, y:0};
  points.forEach(function(p) {
    meanValue.x += p.x;
    meanValue.y += p.y;
  });
  meanValue.x /= points.length;
  meanValue.y /= points.length;

  var standardDeviation = {x:0, y:0};
  points.forEach(function(p) {
    standardDeviation.x += Math.pow(p.x - meanValue.x, 2);
    standardDeviation.y += Math.pow(p.y - meanValue.y, 2);
  });
  standardDeviation.x /= points.length;
  standardDeviation.y /= points.length;
  standardDeviation.x = Math.sqrt(standardDeviation.x);
  standardDeviation.y = Math.sqrt(standardDeviation.y);

  var ret = {x:0, y:0};
  for (var i = 0; i < points.length; i++) {
    var deviationX = 10 * (points[i].x - meanValue.x) / standardDeviation.x;
    var deviationY = 10 * (points[i].y - meanValue.y) / standardDeviation.y;
  }

  // TODO: あとで標準偏差の大きいものと小さいものを外す
  return meanValue;
}

function getCenterAverage(centers) {
  var ave = {x:0, y:0};
  centers.forEach(function(center) {
    ave.x += center.x;
    ave.y += center.y;
  });
  ave.x /= centers.length;
  ave.y /= centers.length;
  return ave;
}

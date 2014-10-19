"use strict";

var redCenters = [];
var blueCenters = [];
var aspectRatios = [];

addEventListener('message', function(event) {
  var redPoints = retrievePoints(event.data, isRed, 5, true);

  var redCenter = getCenter(redPoints);
  while (10 <= redCenters.length) {
    redCenters.shift();
  }
  redCenters.push(redCenter);
  var redCenterAverage = getCenterAverage(redCenters);

  var aspectRatio = getAspectRatio(redPoints);
  while (10 <= aspectRatios.length) {
    aspectRatios.shift();
  }
  aspectRatios.push(aspectRatio);
  var aspectRatioAverage = getAspectRatioAverage(aspectRatios);

  var bluePoints = retrievePoints(event.data, isBlue, 5, true);
  var blueCenter = getCenter(bluePoints);
  while (10 <= blueCenters.length) {
    blueCenters.shift();
  }
  blueCenters.push(blueCenter);
  var blueCenterAverage = getCenterAverage(blueCenters);
  var angle = Math.atan((blueCenterAverage.x - redCenterAverage.x) / (blueCenterAverage.y - redCenterAverage.y));
  
  postMessage({
    points:redPoints, 
    center:redCenter, 
    centerAverage:redCenterAverage, 
    size:redPoints.length,
    aspectRatio:aspectRatio,
    aspectRatioAverage:aspectRatioAverage,
    angle:angle
  });
});

function retrievePoints(imageData, filter, step, onlyLargestCluster) {
  var width = imageData.width;
  var height = imageData.height;
  var data = imageData.data;
  var points = [];

  var clusterTable = [];
  for (var x = 0; x < width; x += step) {
    var row = [];
    clusterTable.push(row);
    for (var y = 0; y < height; y += step) {
      var base = x * 4 + y * width * 4;
      var r = data[base];
      var g = data[base+1];
      var b = data[base+2];
      var a = data[base+3];
      if (filter(r, g, b, a)) {
        points.push({x:x, y:y});
        row[y/step] = 0;
      }

      if (typeof(row[y/step]) === 'undefined') {
        row[y/step] = -1;
      }
    }
  }

  if (onlyLargestCluster) {
    points = retrieveLargestCluster(imageData, points, step, clusterTable);
  }

  return points;
}

function retrieveLargestCluster(imageData, points, step, clusterTable) {
  var width = imageData.width;
  var height = imageData.height;
  var data = imageData.data;

  var clusterId = 1;
  var clusterCount = {};
  for (var x = 0; x < Math.floor(width/step); x++) {
    for (var y = 0; y < Math.floor(height/step); y++) {
      if (0 <= clusterTable[x][y]) {
        if (0 < x && 0 < clusterTable[x-1][y]) {
          clusterTable[x][y] = clusterTable[x-1][y];
          clusterCount[clusterTable[x-1][y]] += 1;
          if (0 < y && 0 < clusterTable[x][y-1]) {
            if (clusterTable[x-1][y] != clusterTable[x][y-1]) {
              clusterCount[clusterTable[x-1][y]] += clusterCount[clusterTable[x][y-1]];
              clusterCount[clusterTable[x][y-1]] = 0;
              updateTable(clusterTable, clusterTable[x][y-1], clusterTable[x-1][y], x, height, step);
            }
          }
        }
        else if (0 < y && 0 < clusterTable[x][y-1]) {
          clusterTable[x][y] = clusterTable[x][y-1];
          clusterCount[clusterTable[x][y-1]] += 1;
        }
        else {
          clusterTable[x][y] = clusterId;
          clusterCount[clusterId] = 1;
          clusterId++;
        }
      }
    }
  }

  var keys = Object.keys(clusterCount)
  var maxClusterId = keys.shift();
  keys.forEach(function(key) {
    if (clusterCount[maxClusterId] < clusterCount[key]) {
      maxClusterId = key;
    }
  });

  var ret = [];
  for (var x = 0; x < Math.floor(width/step); x++) {
    for (var y = 0; y < Math.floor(height/step); y++) {
      if (clusterTable[x][y] === +maxClusterId) {
        ret.push({x:x*step, y:y*step});
      }
    }
  }

  return ret;
}

function updateTable(table, from, to, maxX, height, step) {
  for (var x = 0; x <= maxX; x++) {
    for (var y = 0; y < Math.floor(height/step); y++) {
      if (table[x][y] == from) table[x][y] = to;
    }
  }
}

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

function getAspectRatio(points) {
  var minX = 9999;
  var maxX = -1;
  var minY = 9999;
  var maxY = -1;
  points.forEach(function(point) {
    if (point.x < minX) minX = point.x;
    if (maxX < point.x) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (maxY < point.y) maxY = point.y;
  });
  return (maxX - minX) / (maxY - minY);
}

function getAspectRatioAverage(aspectRatios) {
  var ave = 0;
  aspectRatios.forEach(function(aspectRatio) {
    ave += aspectRatio;
  });
  return ave / aspectRatios.length;
}

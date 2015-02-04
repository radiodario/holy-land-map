var d3 = require('d3');

var solver = require('./solver');


var canvas;
var image;
var width;
var height;
var c;
var tris;
/*

1. delaunay-triangulate the points
2. for each triangle:
  1. find the from points
  2. find the to points
  3. draw triangle
*/

var fromPoints = [];
var toPoints = [];


// draws a mapped triangle that looks like
/*
  tri = {
    from: [three points],
    to: [three points]
  }

  image : the image to draw
  c : canvas context
*/
module.exports = {

  init: function(source, destination, w, h, nodes) {
    width = w;
    height = h;
    image = source;
    canvas = destination;
    tris = this.delaunayTriangulate(nodes);
    c = canvas.getContext('2d');
  },

  drawTriangle: function drawTriangle(tri, nodes) {

    var fromPoints = tri;

    var toPoints = [];

    function searchPoint(point, nodes) {
      if (typeof point.name === "undefined") {
        return {
          x : point[0],
          y : point[1]
        };
      }

      var i, l;
      for (i = 0, l = nodes.length; i < l; i++) {
        var n = nodes[i];
        if (n.name === point.name) {
          return n;
        }
      }

      throw new Error("couldn't find node for", point);
    }

    var toPoints = fromPoints.map(function(point) {
      return searchPoint(point, nodes);
    });


    // XXX make them all have the same structure
    var xm = solver(
      fromPoints[0][0], fromPoints[0][1], toPoints[0].x,
      fromPoints[1][0], fromPoints[1][1], toPoints[1].x,
      fromPoints[2][0], fromPoints[2][1], toPoints[2].x
    );

    var ym = solver(
      fromPoints[0][0], fromPoints[0][1], toPoints[0].y,
      fromPoints[1][0], fromPoints[1][1], toPoints[1].y,
      fromPoints[2][0], fromPoints[2][1], toPoints[2].y
    );

    c.save();
    c.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
    c.beginPath();
    c.moveTo(fromPoints[0][0], fromPoints[0][1]);
    c.lineTo(fromPoints[1][0], fromPoints[1][1]);
    c.lineTo(fromPoints[2][0], fromPoints[2][1]);
    c.lineTo(fromPoints[0][0], fromPoints[0][1]);
    c.closePath();
    // c.stroke();
    c.clip();
    c.drawImage(image, 0, 0, width, height);
    c.restore();

  },

  draw: function(nodes) {
    c.clearRect(0, 0, width, height)
    var i, l;
    for (i = 0, l = tris.length; i < l; i++) {
      this.drawTriangle(tris[i], nodes)
    }

  },

  delaunayTriangulate: function delaunayTriangulate(points) {
    var verts = points.map(function(p) {
      var vert = [p.x, p.y];
      vert.name = p.name;
      return vert;
    })
    verts.push([0, 0]);
    verts.push([width/2, 0]);
    verts.push([width, 0]);
    verts.push([0, height]);
    verts.push([0, height/2]);
    verts.push([width, height/2]);
    verts.push([width/2, height]);
    verts.push([width, height]);
    var tris = d3.geom.delaunay(verts)

    return tris;
  }
}






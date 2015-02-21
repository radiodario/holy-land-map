var d3 = require('d3');
var map = require('./map');
var graph = require('./graph');
var processData = require('./processData');
var offset = require('./offset');
var width = 760;
var height = 1160;

var cont = d3.select("div#map").append("div")
  .attr("class", "container");

var canvas = cont.append("canvas")
  .attr('class', "sourceCanvas")
  .attr("width", width)
  .attr("height", height)

var warpedMapCanvas = cont.append("canvas")
  .attr('class', "destCanvas")
  .attr("width", width)
  .attr("height", height)

var mapSvg = cont.append("svg")
  .attr("class", "mapSvg")
  .attr("width", width)
  .attr("height", height);

var graphSvg = cont.append("svg")
  .attr("class", "graphSvg")
  .attr("width", width)
  .attr("height", height);



map.init(mapSvg, graphSvg, width, height);
map.initCanvas(canvas, width, height);
graph.init(graphSvg, width, height);

var holyLand, towns, trips;

// XXX use promises for this
d3.json("data/holy_land.json", function(error, holyLand) {
  if (error) return console.error(error);

  map.processData(holyLand)

  // map.drawCanvas(holyLand)
  map.drawSVG(holyLand)
  // map.mapToCanvas();

  d3.json("data/towns.json", function(error, towns) {
    if (error) return console.error(error);

    d3.csv("data/trips.csv", function(error, trips) {

      if (error) return console.error(error);

      map.drawTrips(towns, trips);
      map.drawTowns(towns);

      graph.draw(processData.towns(towns), processData.trips(towns, trips), canvas.node(), warpedMapCanvas.node());

    });

  });

});


// set up temporary buttons
var showMap = document.querySelector('#showMap');
var hideMap = document.querySelector('#hideMap');
var showTrips = document.querySelector('#showTrips');
var hideTrips = document.querySelector('#hideTrips');
var showTowns = document.querySelector('#showTowns');
var hideTowns = document.querySelector('#hideTowns');
var doGraph = document.querySelector('#doGraph');
var doMapToCanvas = document.querySelector('#doMapToCanvas');

showMap.addEventListener('click', map.showMap.bind(map));
hideMap.addEventListener('click', map.hideMap.bind(map));
showTrips.addEventListener('click', map.showTrips.bind(map));
hideTrips.addEventListener('click', map.hideTrips.bind(map));
showTowns.addEventListener('click', map.showTowns.bind(map));
hideTowns.addEventListener('click', map.hideTowns.bind(map));
doGraph.addEventListener('click', function() {
  map.mapToCanvas();
  graph.start();
});
// doMapToCanvas.addEventListener('click', map.mapToCanvas.bind(map));

var map_cont = document.querySelector('div#map');
var content_element = document.querySelector('div#content');

// make canvas stay at top
function stick(e) {
  e.preventDefault();
  var art_top = offset(content_element).top;
  if (art_top <= 0) {
    map_cont.style.top = (20 + Math.abs(art_top) | 0) + 'px'
  } else {
    map_cont.style.top = 20 + 'px';
  }

}

document.addEventListener('scroll', stick);

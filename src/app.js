var d3 = require('d3');
var map = require('./map');
var graph = require('./graph');
var processData = require('./processData');

var width = 760;
var height = 1160;

var cont = d3.select("body").append("div")
  .attr("class", "container");

var canvas = cont.append("canvas")
  .attr("width", width)
  .attr("height", height);

var svg = cont.append("svg")
  .attr("width", width)
  .attr("height", height);


map.init(svg, width, height);
map.initCanvas(canvas, width, height);
graph.init(svg, width, height);

var holyLand, towns, trips;

// XXX use promises for this
d3.json("data/holy_land.json", function(error, holyLand) {
  if (error) return console.error(error);

  map.processData(holyLand)

  map.drawCanvas(holyLand)
  // map.drawSVG(holyLand)

  d3.json("data/towns.json", function(error, towns) {
    if (error) return console.error(error);

    d3.csv("data/trips.csv", function(error, trips) {

      if (error) return console.error(error);

      map.drawTrips(towns, trips);
      map.drawTowns(towns);

      graph.draw(processData.towns(towns), processData.trips(towns, trips));

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

showMap.addEventListener('click', map.showMap.bind(map));
hideMap.addEventListener('click', map.hideMap.bind(map));
showTrips.addEventListener('click', map.showTrips.bind(map));
hideTrips.addEventListener('click', map.hideTrips.bind(map));
showTowns.addEventListener('click', map.showTowns.bind(map));
hideTowns.addEventListener('click', map.hideTowns.bind(map));
doGraph.addEventListener('click', graph.start);
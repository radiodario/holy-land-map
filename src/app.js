var d3 = require('d3');

var map = require('./map');

var width = 760;
var height = 1160;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

map.init(svg, width, height);


d3.json("data/holy_land.json", function(error, holyLand) {
  if (error) return console.error(error);

  map.draw(holyLand)

  d3.json("data/towns.json", function(error, towns) {
    if (error) return console.error(error);

    map.drawTowns(towns);

    d3.csv("data/trips.csv", function(error, trips) {

      if (error) return console.error(error);

      map.drawTrips(towns, trips);

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

showMap.addEventListener('click', map.showMap.bind(map));
hideMap.addEventListener('click', map.hideMap.bind(map));
showTrips.addEventListener('click', map.showTrips.bind(map));
hideTrips.addEventListener('click', map.hideTrips.bind(map));
showTowns.addEventListener('click', map.showTowns.bind(map));
hideTowns.addEventListener('click', map.hideTowns.bind(map));
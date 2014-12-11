var d3 = require('d3');
var topojson = require('topojson');


var width = 960;
var height = 1160;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

var mapLayer = svg.append("g")
  .attr("class", "map-layer");

var tripsLayer = svg.append("g")
  .attr("class", "trips-layer")


d3.json("data/holy_land.json", function(error, holyLand) {
  if (error) return console.error(error);

  var subunits = topojson.feature(holyLand, holyLand.objects.holy_admin);
  var places  = topojson.feature(holyLand, holyLand.objects.holy_places);

  var projection = d3.geo.albers()
    .center([35.5, 31.08])
    .parallels([30, 40])
    .rotate([0, 0])
    .scale(20000)
    .translate([width/2, height/2]);

  var path = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

  mapLayer.selectAll(".subunit")
    .data(subunits.features)
    .enter()
      .append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", path)

  mapLayer.append("path")
    .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
      return a !== b }))
    .attr("d", path)
    .attr("class", "subunit-boundary")

  mapLayer.append("path")
    .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
      return a === b && ": EGY JOR LBN SYR".indexOf(a.id) > 0}))
    .attr("d", path)
    .attr("class", "subunit-boundary neighbour")


  mapLayer.selectAll(".subunit-label")
    .data(subunits.features)
    .enter()
      .append("text")
      .attr("class", function(d) { return "subunit-label " + d.id; })
      .attr("dy", ".35em")
      .attr("transform", function(d) {

        var offset = [0, 0];

        // special case so that israel's label doesn't
        // fall inside the west bank ;_;
        if (d.properties.name === "Israel") {
          offset = [-70, -30];
        }

        var centroid = path.centroid(d)
        var position = centroid.map(function(d, i) {
          return d + offset[i];
        })

        return "translate(" + position + ")";
      })
      .text(function(d) {
        return d.properties.name;
      })

  mapLayer.append("path")
    .datum(places)
    .attr("d", path)
    .attr("class", "place");

  mapLayer.selectAll(".place-label")
    .data(places.features)
    .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) {
        console.log(d.geometry.coordinates)
        return "translate(" + projection(d.geometry.coordinates) + ")";
      })
      .attr("dy", ".35em")
      .attr("dx", 6)
      .text(function(d) {
        return d.properties.name;
      })

  d3.json("data/towns.json", function(error, towns) {
    if (error) return console.error(error);
    d3.csv("data/trips.csv", function(error, trips) {

      if (error) return console.error(error);

      var lines = tripsLayer.selectAll("line")
        .data(trips);

      lines.enter()
        .append("line")
        .attr("class", "trip")
        .attr("x1", function(d) {
          return projection(towns.places[d.from].coordinates)[0]
        })
        .attr("y1", function(d) {
          return projection(towns.places[d.from].coordinates)[1]
        })
        .attr("x2", function(d) {
          console.log(d.to)
          return projection(towns.places[d.to].coordinates)[0]
        })
        .attr("y2", function(d) {
          return projection(towns.places[d.to].coordinates)[1]
        })

    })
  })


});
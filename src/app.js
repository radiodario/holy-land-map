var d3 = require('d3');
var topojson = require('topojson');


var width = 960;
var height = 1160;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);


d3.json("data/holy_land.json", function(error, holyLand) {
  if (error) return console.error(error);

  var subunits = topojson.feature(holyLand, holyLand.objects.holy_admin);
  var places  = topojson.feature(holyLand, holyLand.objects.holy_places);

  var projection = d3.geo.albers()
    .center([35.5, 31.5])
    .parallels([30, 40])
    .rotate([0, 0])
    .scale(16000)
    .translate([width/2, height/2]);

  var path = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

  svg.selectAll(".subunit")
    .data(subunits.features)
    .enter()
      .append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", path)

  svg.append("path")
    .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
      return a !== b }))
    .attr("d", path)
    .attr("class", "subunit-boundary")

  svg.append("path")
    .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
      return a === b && ": EGY JOR LBN SYR".indexOf(a.id) > 0}))
    .attr("d", path)
    .attr("class", "subunit-boundary neighbour")


  svg.selectAll(".subunit-label")
    .data(subunits.features)
    .enter()
      .append("text")
      .attr("class", function(d) { return "subunit-label " + d.id; })
      .attr("dy", ".35em")
      .attr("transform", function(d) {

        var offset = [0, 0]

        // special case so that israel's label doesn't
        // fall inside the west bank ;_;
        if (d.properties.name === "Israel") {
          offset = [-60, -30];
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

  svg.append("path")
    .datum(places)
    .attr("d", path)
    .attr("class", "place");

  svg.selectAll(".place-label")
    .data(places.features)
    .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) {
        return "translate(" + projection(d.geometry.coordinates) + ")";
      })
      .attr("dy", ".35em")
      .attr("dx", 6)
      .text(function(d) {
        return d.properties.name;
      })




});
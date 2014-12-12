var d3 = require('d3');
var topojson = require('topojson');


var width = 760;
var height = 1160;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

var politicalLayer = svg.append("g")
  .attr("class", "political-layer");

var waterLayer = svg.append("g")
  .attr("class", "water-layer");

var tripsLayer = svg.append("g")
  .attr("class", "trips-layer");

var townsLayer = svg.append("g")
  .attr("class", "towns-layer");

var timeScale = d3.scale.linear()
   .range(["rgb(44,163,219)", "rgb(253,88,6)"])
   .interpolate(d3.interpolateHcl);


d3.json("data/holy_land.json", function(error, holyLand) {
  if (error) return console.error(error);

  var subunits = topojson.feature(holyLand, holyLand.objects.holy_admin);
  var places  = topojson.feature(holyLand, holyLand.objects.holy_places);
  var water = topojson.feature(holyLand, holyLand.objects.holy_water);
  var rivers = topojson.feature(holyLand, holyLand.objects.holy_rivers);

  var projection = d3.geo.albers()
    .center([35.0, 31.2])
    .parallels([30, 40])
    .rotate([0, 0])
    .scale(20000)
    .translate([width/2, height/2]);

  var path = d3.geo.path()
    .projection(projection)
    .pointRadius(2);

  politicalLayer.selectAll(".subunit")
    .data(subunits.features)
    .enter()
      .append("path")
      .attr("class", function(d) { return "subunit " + d.id; })
      .attr("d", path)

  politicalLayer.append("path")
    .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
      return a !== b }))
    .attr("d", path)
    .attr("class", "subunit-boundary")

  politicalLayer.append("path")
    .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
      return a === b && ": EGY JOR LBN SYR".indexOf(a.id) > 0}))
    .attr("d", path)
    .attr("class", "subunit-boundary neighbour")


  politicalLayer.selectAll(".subunit-label")
    .data(subunits.features)
    .enter()
      .append("text")
      .attr("class", function(d) { return "subunit-label " + d.id; })
      .attr("dy", ".35em")
      .attr("transform", function(d) {

        var offset;

        // special case so that israel's label doesn't
        // fall inside the west bank ;_;
        switch (d.properties.name) {
          case "Israel":
            offset = [-70, -30];
            break;
          case "Egypt":
            offset = [750, -1700];
            break;
          case "Jordan":
            offset = [-200, 0];
            break;
          case "Syria":
            offset = [-240, 1040];
            break;
          case "Gaza":
            offset = [-20, 30];
            break;
          default:
            offset = [0,0];
            break;
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

  // townsLayer.append("path")
  //   .datum(places)
  //   .attr("d", path)
  //   .attr("class", "place");

  // townsLayer.selectAll(".place-label")
  //   .data(places.features)
  //   .enter()
  //     .append("text")
  //     .attr("class", "place-label")
  //     .attr("transform", function(d) {
  //       return "translate(" + projection(d.geometry.coordinates) + ")";
  //     })
  //     .attr("dy", ".35em")
  //     .attr("dx", 6)
  //     .text(function(d) {
  //       return d.properties.name;
  //     })

  waterLayer.selectAll(".water-feature")
    .data(water.features)
    .enter()
      .append("path")
      .attr("class", function(d) {
        return "water-feature " + d.properties.name;
      })
      .attr("d", path)

  waterLayer.selectAll(".river")
    .data(rivers.features)
    .enter()
      .append("path")
      .attr("class", function(d) { return "river " + d.properties.name })
      .attr("d", path)

  d3.json("data/towns.json", function(error, towns) {
    if (error) return console.error(error);

    var townList = d3.keys(towns.places).map(function(d) {
      return towns.places[d];
    });

    d3.csv("data/trips.csv", function(error, trips) {

      if (error) return console.error(error);

      var lines = tripsLayer.selectAll("line")
        .data(trips);

      var timeDomain = [0, d3.max(trips, function(d) { return +d.time; })];

      timeScale.domain(timeDomain);


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
          return projection(towns.places[d.to].coordinates)[0]
        })
        .attr("y2", function(d) {
          return projection(towns.places[d.to].coordinates)[1]
        })
        .style("stroke", function(d) {
          return timeScale(+d.time)
        })

      var places = townsLayer.selectAll("g")
        .data(townList);

      placesEnter = places.enter().append('g')
        .attr("class", "place")
        .attr('transform', function(d) {
          return "translate(" + projection(d.coordinates) + ")"
        });

      placesEnter.append('circle')
        .attr("r", 2);

      placesEnter.append('text')
        .attr("class", "place-label")
        .style("text-anchor", function(d) {
          return d.anchor;
        })
        .attr("dy", ".35em")
        .attr("dx", function(d) {
          return (d.anchor === "start") ? 6 : -6;
        })
        .text(function(d) {
          return d.name;
        });

    })
  })


});
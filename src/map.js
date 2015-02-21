var d3 = require('d3');
var topojson = require('topojson');
var canvg = require('./svgToCanvas/canvg');
var colors = require('./colors');

var subunits;
var places;
var water;
var rivers;

var w, h;

var politicalLayer;
var waterLayer;
var tripsLayer;
var townsLayer;

var duration = 200;

var timeScale = d3.scale.linear()
   .range(["rgb(44,163,219)", "rgb(253,88,6)"])
   .interpolate(d3.interpolateHcl);

var projection = d3.geo.albers()
  .center([35.0, 31.2])
  .parallels([30, 40])
  .rotate([0, 0])
  .scale(20000);

var path = d3.geo.path()
  .projection(projection)
  .pointRadius(2);

var canvasPath = d3.geo.path()
  .projection(projection)
  .pointRadius(2);

var path = d3.geo.path()
  .projection(projection)
  .pointRadius(2);

var mapSvg, graphSvg;
var canvas;
var ctx;

var towns;

var holyLand;

module.exports = {

  init: function(mapContainer, graphContainer, width, height) {

    w = width;
    h = height;

    projection
      .translate([width/2, height/2])
      .clipExtent([[0, 0], [width, height]]);

    mapSvg = mapContainer;
    // mapSvg = d3.select(document.createElement('svg'));
    graphSvg = graphContainer;
  },

  // process all the topojson related tings
  processData: function(topojsonData) {

    holyLand = topojsonData;

    subunits = topojson.feature(holyLand, holyLand.objects.holy_admin);
    places  = topojson.feature(holyLand, holyLand.objects.holy_places);
    water = topojson.feature(holyLand, holyLand.objects.holy_water);
    rivers = topojson.feature(holyLand, holyLand.objects.holy_rivers);

  },


  initCanvas: function(container, width, height) {
    canvas = container.node();
    ctx = canvas.getContext("2d");
    canvasPath.context(ctx);
  },

  mapToCanvas: function() {

    var tmp = document.createElement("div");
    tmp.appendChild(mapSvg.node());
    var mapSvgString = tmp.innerHTML;

    canvg(canvas, mapSvgString, 0, 0, w, h);
  },

  drawCanvas: function() {
    // draw the sea
    ctx.fillStyle = colors.water.sea;
    ctx.fillRect(0, 0, w, h);


    // draw subunits (countries)
    ctx.fillStyle = colors.land.rest;
    canvasPath(subunits)
    // ctx.stroke();
    ctx.fill();


    // draw israel
    holyLand.objects.holy_admin

    // draw the boundary lines
    canvasPath(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
        return a !== b }))
    ctx.setLineDash([2,2])
    ctx.lineWidth = 0.25
    ctx.stroke();


    canvasPath()


    ctx.beginPath();
    // draw the water features
    ctx.strokeStyle = colors.water.rivers;
    ctx.setLineDash([])
    canvasPath(rivers)
    ctx.stroke();
    ctx.fillStyle = colors.water.rivers;
    ctx.closePath();

    ctx.lineWidth = .75
    canvasPath(water);
    ctx.stroke();
    // ctx.fill();

  },


  drawSVG : function() {

    mapSvg.append("rect")
      .classed("sea", true)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', w)
      .attr('height', h)
      .style("fill", colors.water.sea)


    politicalLayer = mapSvg.append("g")
      .attr("class", "political-layer");

    waterLayer = mapSvg.append("g")
      .attr("class", "water-layer");

    politicalLayer.selectAll(".subunit")
      .data(subunits.features)
      .enter()
        .append("path")
        .attr("class", function(d) { return "subunit " + d.id; })
        .attr("d", path)
        .attr("fill", function(d) {
          if (d.id === 'GAZ') {
            return colors.land.GAZ;
          }
          if (d.id === 'ISR') {
            return colors.land.ISR;
          }
          if (d.id === 'WEB') {
            return colors.land.WEB;
          }
          return colors.land.rest;
        });

    politicalLayer.append("path")
      .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
        return a !== b }))
      .attr("d", path)
      .attr("class", "subunit-boundary")
      .style("fill", "none")
      .style("stroke", colors.boundaries.subunit)
      .style("stroke-dasharray", "2,2")
      .style("stroke-linejoin", "round")



    politicalLayer.append("path")
      .datum(topojson.mesh(holyLand, holyLand.objects.holy_admin, function(a, b) {
        return a === b && ": EGY JOR LBN SYR".indexOf(a.id) > 0}))
      .attr("d", path)
      .attr("class", "subunit-boundary neighbour")
      .style("stroke-dasharray", "0.1,0.1")
      .style("fill", "none");


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

          if (!position[0] || !position[1]) {
            position = [-1000, -1000];
          }

          return "translate(" + position + ")";
        })
        .text(function(d) {
          return d.properties.name;
        })
        .style({
          "fill" : colors.boundaries.label,
          "fill-opacity" : .5,
          "font-size" : "20px",
          "font-weight" : 300,
          "text-anchor" : "middle"
        });

    waterLayer.selectAll(".water-feature")
      .data(water.features)
      .enter()
        .append("path")
        .attr("class", function(d) {
          return "water-feature " + d.properties.name;
        })
        .attr("d", path)
        .style("fill-opacity", 0.5)
        .style("fill", colors.water.rivers)

    waterLayer.selectAll(".river")
      .data(rivers.features)
      .enter()
        .append("path")
        .attr("class", function(d) { return "river " + d.properties.name })
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", colors.water.rivers)
        .style("stroke-opacity", 0.05);
  },

  drawTrips: function(towns, trips) {

    tripsLayer = graphSvg.append("g")
      .attr("class", "trips-layer");

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
      });
  },

  drawTowns: function(towns) {

    townsLayer = graphSvg.append("g")
      .attr("class", "towns-layer");


    var townList = d3.keys(towns.places).map(function(d) {
      var t = towns.places[d];
      var c = projection(t.coordinates);
      t.x = c[0];
      t.y = c[1];
      return t;
    });

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
        if (d.hasOwnProperty('displayname')) return d.displayname;
        return d.name;
      });
  },

  hideTowns: function() {
    townsLayer.transition()
      .duration(duration)
      .style('opacity', 0)
      .each('end', function() {
        d3.select(this).style('display', 'none')
      })
  },

  showTowns : function() {
    townsLayer
      .style('display', null)
      .transition()
      .duration(duration)
      .style('opacity', 1)

  },

  hideTrips: function() {
    tripsLayer.transition()
      .duration(duration)
      .style('opacity', 0)
      .each('end', function() {
        d3.select(this).style('display', 'none')
      })
  },

  showTrips : function() {
    tripsLayer
      .style('display', null)
      .transition()
      .duration(duration)
      .style('opacity', 1)

  },

  hideMap : function() {
    svg.selectAll('rect.sea, .political-layer, .water-layer')
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .each('end', function() {
        d3.select(this).style('display', 'none')
      })

  },

  showMap : function() {

    svg.selectAll('rect.sea, .political-layer, .water-layer')
      .style('display', null)
      .transition()
      .duration(duration)
      .style('opacity', 1)

  }


}
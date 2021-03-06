var d3 = require('d3');
var warper = require('./warper');

var force = d3.layout.force()
    .gravity(0)
    .charge(-1000)
    .friction(0.01)

var svg;

var nodeG, linkG;

var w, h;

module.exports = {

  init: function(container, width, height) {
    w = width;
    h = height;
    force.size([width, height]);
    svg = container;
  },

  draw: function (nodes, links, sourceCanvas, destinationCanvas) {

    nodeG = svg.selectAll('.towns-layer .place');
    linkG = svg.selectAll('.trips-layer .trip');

    nodeG.data(nodes)
    linkG.data(links)

    warper.init(sourceCanvas, destinationCanvas, w, h, nodes);

    // var avgSpeed = 0;

    // links.map(function(d) {
    //   d.speed = d.distance / (+d.time/60);
    //   avgSpeed += d.speed;
    // })

    // avgSpeed /= links.length;

    force
      .linkDistance(function(d) {
        return +d.time;
      })
      .nodes(nodes)
      .links(links)
      .on("tick", function() {
        warper.draw(nodes);
        nodeG
          .attr('transform', function(d) {
            var nodeW = this.getBBox().width;
            var nodeH = this.getBBox().height;

            // bounding box so gaza doesn't scurry
            // off into the mediterranean
            d.x = Math.max(nodeW, Math.min(w - nodeW, d.x));
            d.y = Math.max(nodeH, Math.min(h - nodeH, d.y));

            return "translate(" + d.x + ',' + d.y + ')';
          });

        linkG
          .attr("x1", function(d) { return d.source.x; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("y2", function(d) { return d.target.y; });
      });

  },

  start: function() {

    svg.selectAll('.towns-layer .place circle').transition()
      .duration(100)
      .attr('r', 3)

    force.start();
  }

}
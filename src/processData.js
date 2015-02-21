// create a nodes array by iterating over the keys
function townlist(towns) {
  return Object.keys(towns.places).map(function(k) {
      return towns.places[k];
    });
}

// lookup a town
function lookupTown(townlist, townname) {
  var i, l;

  for (i = 0, l = townlist.length; i < l; i++) {
    if (townlist[i].name === townname) return i;
    if (townlist[i].displayname === townname) return i;
  }

  throw new Error("couldn't find " + townname)

}

// radius of Earth
var R = 6371

// calculate the distance in km
function haversineDistance(from, to) {

  lat1 = from[0];
  lat2 = to[0];
  lon1 = from[1];
  lon2 = to[1];

  var φ1 = lat1 * (Math.PI/180);
  var φ2 = lat2 * (Math.PI/180);
  var Δφ = (lat2-lat1) * (Math.PI/180);
  var Δλ = (lon2-lon1) * (Math.PI/180);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;

  return d;

}



module.exports = {

  towns: townlist,

  trips: function(towns, trips) {

    var tlist = townlist(towns);

    return trips.map(function(t) {

      var t1 = lookupTown(tlist, t.from);
      var t2 = lookupTown(tlist, t.to);

      return {
        time: t.time,
        source: t1,
        target: t2,
        distance: haversineDistance(tlist[t1].coordinates, tlist[t2].coordinates)
      };

    });
  }
};




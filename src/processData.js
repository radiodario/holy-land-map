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
  }

  return -1 // we haven't found it;

}



module.exports = {

  towns: townlist,

  trips: function(towns, trips) {

    var tlist = townlist(towns);

    return trips.map(function(t) {

      return {
        time: t.time,
        source: lookupTown(tlist, t.from),
        target: lookupTown(tlist, t.to)
      };

    });
  }
};




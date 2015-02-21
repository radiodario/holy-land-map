module.exports = function(el) {
  if (el.getBoundingClientRect) {
      return el.getBoundingClientRect();
  }
  else {
    var x = 0, y = 0;
    do {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
    }
    while (el = el.offsetParent);

    return { "left": x, "top": y }
  }
}
module.exports = function debounce(fn, delay) {
  var timer = null;

  return function debouncer() {
    var context = this;
    var args = arguments;

    clearTimeout(timer);
    timer = setTimeout(function timeoutHandler() { fn.apply(context, args); }, delay);
  };
};

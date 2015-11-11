var registerHandler = function (key, fn, into) {
  if (into[key]) {
    throw new Error("Key `"+key+"` already has attached handler.");
  } else {
    into[key] = fn;
  }
};

var Dispatcher = function () {
  var handlers = {};

  return {
    registerHandler: function (k, fn) { registerHandler(k, fn, handlers); },
    dispatch: function (e) { return handlers[e[0]]; }
  };
};


module.exports = Dispatcher;

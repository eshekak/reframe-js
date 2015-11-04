var wrapHandler = function (handlerFn) {
  return function (e, updateFn) {
    updateFn(function (data) { return handlerFn(data, e); });
  };
};

var registerHandler = function (key, fn, into) {
  if (into[key]) {
    throw new Error("Key `"+key+"` already has attached handler.");
  } else {
    into[key] = wrapHandler(fn);
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

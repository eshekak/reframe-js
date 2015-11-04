"use strict";

var wrapHandler = function wrapHandler(handlerFn) {
  return function (e, updateFn) {
    updateFn(function (data) {
      return handlerFn(data, e);
    });
  };
};

var _registerHandler = function _registerHandler(key, fn, into) {
  if (into[key]) {
    throw new Error("Key `" + key + "` already has attached handler.");
  } else {
    into[key] = wrapHandler(fn);
  }
};

var Dispatcher = function Dispatcher() {
  var handlers = {};

  return {
    registerHandler: function registerHandler(k, fn) {
      _registerHandler(k, fn, handlers);
    },
    dispatch: function dispatch(e) {
      return handlers[e[0]];
    }
  };
};

module.exports = Dispatcher;
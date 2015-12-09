"use strict";

var logFn = function logFn() {};

module.exports = {
  setLogger: function setLogger(f) {
    logFn = f;
  },
  log: function log() {
    logFn.apply(null, arguments);
  }
};
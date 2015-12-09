var logFn = function () {};

module.exports = {
  setLogger: function (f) { logFn = f; },
  log: function () { logFn.apply(null, arguments); }
};

var zip = require('lodash/array/zip');
var immstruct = require('immstruct');


var ReactiveQuery = function (args, dependencies, transformFn) {
  var listeners = [];
  var transformFnArgs = dependencies.map(d => d.deref());
  var struct = immstruct(transformFn.apply(null, transformFnArgs));

  var dispose = function () {
    var pairs = zip(dependencies, listeners);
    pairs.forEach(function (p) {
      var d = p[0];
      var l = p[1];
      d.struct().removeListener('swap', l);
    });
  };

  var retain = function (pool) {
    pool.retain(args);
    dependencies.forEach((dep) => dep.retain(pool));
  };

  dependencies.forEach(function (d) {
    var l = function (is, was) {
      if (is.equals(was)) { return; }
      struct.cursor().set(transformFn.apply(null, dependencies.map(d => d.deref())));
    };
    d.struct().on('swap', l);
    listeners.push(l);
  });

  return {
    deref: function () { return struct.cursor().deref(); },
    struct: function () { return struct; },
    dispose: dispose,
    retain: retain
  }
};


module.exports = ReactiveQuery;

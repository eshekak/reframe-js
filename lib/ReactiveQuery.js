var immstruct = require('immstruct');


var ReactiveQuery = function (dependencies, transformFn) {
  var transformFnArgs = dependencies.map(d => d.deref());
  var struct = immstruct(transformFn.apply(null, transformFnArgs));

  dependencies.forEach(function (d) {
    d.struct().on('swap', function (is, was) {
      if (is.equals(was)) { return; }
      struct.cursor().set(transformFn.apply(null, dependencies.map(d => d.deref())));
    });
  });

  return {
    deref: function () { return struct.cursor().deref(); },
    struct: function () { return struct; },
    dispose: function () { dependencies.forEach(d => d.struct().removeAllListeners()); }
  }
};


module.exports = ReactiveQuery;

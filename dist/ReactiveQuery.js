'use strict';

var immstruct = require('immstruct');

var ReactiveQuery = function ReactiveQuery(args, dependencies, transformFn) {
  var transformFnArgs = dependencies.map(function (d) {
    return d.deref();
  });
  var _struct = immstruct(transformFn.apply(null, transformFnArgs));

  dependencies.forEach(function (d) {
    d.struct().on('swap', function (is, was) {
      if (is.equals(was)) {
        return;
      }
      console.log('recomputing query:', args);
      _struct.cursor().set(transformFn.apply(null, dependencies.map(function (d) {
        return d.deref();
      })));
    });
  });

  return {
    deref: function deref() {
      return _struct.cursor().deref();
    },
    struct: function struct() {
      return _struct;
    },
    dispose: function dispose() {
      dependencies.forEach(function (d) {
        return d.struct().removeAllListeners();
      });
    }
  };
};

module.exports = ReactiveQuery;
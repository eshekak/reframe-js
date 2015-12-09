'use strict';

var zip = require('lodash/array/zip');
var immstruct = require('immstruct');

var ReactiveQuery = function ReactiveQuery(args, dependencies, transformFn) {
  var listeners = [];
  var transformFnArgs = dependencies.map(function (d) {
    return d.deref();
  });
  var _struct = immstruct(transformFn.apply(null, transformFnArgs));

  var dispose = function dispose() {
    var pairs = zip(dependencies, listeners);
    pairs.forEach(function (p) {
      var d = p[0];
      var l = p[1];
      d.struct().removeListener('swap', l);
    });
  };

  var retain = function retain(pool) {
    pool.retain(args);
    dependencies.forEach(function (dep) {
      return dep.retain(pool);
    });
  };

  dependencies.forEach(function (d) {
    var l = function l(is, was) {
      if (is.equals(was)) {
        return;
      }
      _struct.cursor().set(transformFn.apply(null, dependencies.map(function (d) {
        return d.deref();
      })));
    };
    d.struct().on('swap', l);
    listeners.push(l);
  });

  return {
    deref: function deref() {
      return _struct.cursor().deref();
    },
    struct: function struct() {
      return _struct;
    },
    dispose: dispose,
    retain: retain
  };
};

module.exports = ReactiveQuery;
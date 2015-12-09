'use strict';

var ReactiveQuery = require('./ReactiveQuery');

var QueryCache = function QueryCache(pool) {
  var queryDescriptionFns = {};
  var db;

  var registerQuery = function registerQuery(key, queryDescriptionFn) {
    if (queryDescriptionFns[key]) {
      throw new Error('Query `' + key + '` is already registered.');
    } else {
      queryDescriptionFns[key] = queryDescriptionFn;
    }
  };

  var query = function query(args) {
    var q;
    args = Array.prototype.slice.apply(args, [0, args.length]);
    var key = args[0];
    if (key == '*db*') {
      return db;
    } else if (queryDescriptionFns[key]) {
      var fnArgs = args.slice(1, args.length);
      if (pool.has(args)) {
        q = pool.get(args);
        q.retain(pool);
        return q;
      } else {
        var queryDescription = queryDescriptionFns[key].apply(null, fnArgs);
        var depsDescriptions = queryDescription.slice(0, queryDescription.length - 1);
        var transformFn = queryDescription[queryDescription.length - 1];
        var deps = depsDescriptions.map(query);
        q = ReactiveQuery(args, deps, transformFn);
        pool.put(args, q);
        q.retain(pool);
        return q;
      }
    } else {
      throw new Error('Query `' + key + '` not registered.');
    }
  };

  return {
    registerQuery: registerQuery,
    query: query,
    setDb: function setDb(initial) {
      db = initial;
    }
  };
};

module.exports = QueryCache;
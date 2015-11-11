var ReactiveQuery = require('./ReactiveQuery');


var QueryCache = function () {
  var db;
  var queryDescriptionFns = {};

  var registerQuery = function (key, queryDescriptionFn) {
    if (queryDescriptionFns[key]) {
      throw new Error('Query `'+key+'` is already registered.');
    } else {
      queryDescriptionFns[key] = queryDescriptionFn;
    }
  };

  var query = function (args) {
    var key = args[0];
    if (key == '*db*') {
      return db;
    } else if (queryDescriptionFns[key]) {
      var fnArgs = args.slice(1, args.length);
      var queryDescription = queryDescriptionFns[key].apply(null, fnArgs);
      var depsDescriptions = queryDescription.slice(0, queryDescription.length-1);
      var transformFn = queryDescription[queryDescription.length-1];
      var deps = depsDescriptions.map(query);
      return ReactiveQuery(deps, transformFn)
    } else {
      throw new Error('Query `'+key+'` not registered.')
    }
  };

  return {
    registerQuery: registerQuery,
    query: query,
    setDb: function (initial) { db = initial; }
  }
};


module.exports = QueryCache;

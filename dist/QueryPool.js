'use strict';

var I = require('immutable');

var QueryPool = function QueryPool() {
  var pool = I.Map();

  return {
    has: function has(key) {
      var immKey = I.fromJS(key);
      return pool.has(immKey);
    },
    get: function get(key) {
      var immKey = I.fromJS(key);
      if (!pool.has(immKey)) {
        throw new Error();
      } else {
        return pool.get(immKey, 'ref');
      }
    },
    put: function put(key, q) {
      var immKey = I.fromJS(key);
      pool = pool.set(immKey, q);
    },
    report: function report() {
      return pool;
    }
  };
};

module.exports = QueryPool;
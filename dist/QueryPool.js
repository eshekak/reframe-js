'use strict';

var logging = require('./logging');
var I = require('immutable');

var QueryPool = function QueryPool() {
  var retainedKeys = I.Set();
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
    retain: function retain(key) {
      var immKey = I.fromJS(key);
      retainedKeys = retainedKeys.add(immKey);
    },
    flush: function flush() {
      var nonRetainedKeys = I.Set(pool.keys()).subtract(retainedKeys);
      logging.log("RETAINED", retainedKeys.toString());
      logging.log("NON RETAINED", nonRetainedKeys.toString());
      nonRetainedKeys.forEach(function (k) {
        var q = pool.get(k);
        q.dispose();
        pool = pool.remove(k);
      });
      retainedKeys = I.Set();
    },
    report: function report() {
      return pool;
    }
  };
};

module.exports = QueryPool;
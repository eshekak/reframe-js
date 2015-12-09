'use strict';
var logging = require('./logging');
var I = require('immutable');

var QueryPool = function QueryPool() {
  var retainedKeys = I.Set();
  var pool = I.Map();

  return {
    has: function (key) {
      var immKey = I.fromJS(key);
      return pool.has(immKey);
    },
    get: function (key) {
      var immKey = I.fromJS(key);
      if (!pool.has(immKey)) {
        throw new Error();
      } else {
        return pool.get(immKey, 'ref');
      }
    },
    put: function (key, q) {
      var immKey = I.fromJS(key);
      pool = pool.set(immKey, q);
    },
    retain: function (key) {
      var immKey = I.fromJS(key);
      retainedKeys = retainedKeys.add(immKey);
    },
    flush: function () {
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
    report: function () { return pool }
  };
};

module.exports = QueryPool;

var I = require('immutable');


var QueryPool = function (initialPool, disposeFn) {
    var pool = initialPool;
    var disposeBuffer = [];

    return {
        has: function (key) {
          var immKey = I.fromJS(key);
          return pool.has(immKey);
        },
        get: function (key) {
          var immKey = I.fromJS(key);
          if (!pool.has(immKey)) {
            throw new Error ();
          } else {
            pool = pool.updateIn([immKey, 'refCount'], x => x+1);
            return pool.getIn([immKey, 'ref']);
          }
        },
        put: function (key, ref) {
          var immKey = I.fromJS(key);
          if (pool.has(immKey)) {
            throw new Error ();
          }
          pool = pool.set(immKey, I.Map([['refCount', 1], ['ref', ref]]));
        },
        scheduleDispose: function (key) {
          disposeBuffer.push(I.fromJS(key));
        },
        flush: function () {
          I.Seq(disposeBuffer).forEach(function (immKey) {
            if (pool.has(immKey)) {
              pool = pool.updateIn([immKey, 'refCount'], x => x-1);
            }
          });
          if (disposeBuffer.length > 0) {
            var grouped = pool.groupBy(val => val.get('refCount') > 0);
            pool = grouped.get(true);
            var disposed = grouped.get(false, I.Map());
            disposed.forEach(function (d) {
              if (d.get('refCount') < 0) {
                throw new Error('Invalid ref count: '+d.get('refCount'));
              } else {
                disposeFn(d.get('ref'));
              }
            });
            disposeBuffer = [];
          }
        },
        report: function () {
          return pool.map(val => val.get('refCount'));
        },
        reportScheduledDisposals: function (key) {
          return I.fromJS(disposeBuffer);
        }
    }
};


module.exports = QueryPool;

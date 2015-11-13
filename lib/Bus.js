var csp = require('js-csp');


var Bus = function (dbChan, struct, dispatchFn) {
  var events = csp.chan();
  var db;

  var dispatchEvent = function (e) {
    var handler = dispatchFn(e);
    if(handler) {
      return  handler(db, e, put);
    } else {
      console.error("No handler found for", e);
    }
  };

  var put = function (e) {
    csp.putAsync(events, e);
  };

  var putSync = function (e) {
    var newDb = dispatchEvent(e);
    struct.current = newDb;
    struct.emit('set-sync', newDb, db, []);
    db = newDb;
  };

  csp.go(function* () {
    db = yield csp.take(dbChan);
    while (true) {
      var e = yield csp.take(events);
      if (e === csp.CLOSED) { break; }
      db = dispatchEvent(e);
      struct.cursor().set(db);
    }
  });

  return {
    put: put,
    putSync: putSync
  };
};


module.exports = Bus;

var csp = require('js-csp');


var Bus = function (dbChan, struct, dispatchFn) {
  var events = csp.chan();
  var db;

  var dispatchEvent = function (db, e) {
    var handler = dispatchFn(e);
    if(handler) {
      return  handler(db, e);
    } else {
      console.error("No handler found for", e);
    }
  };

  //csp.go(function* () {
  //  while(true) {
  //    db = yield csp.take(dbChan);
  //
  //  }
  //});

  csp.go(function* () {
    db = yield csp.take(dbChan);
    while (true) {
      var e = yield csp.take(events);
      if (e === csp.CLOSED) { break; }
      db = dispatchEvent(db, e);
      struct.cursor().set(db);
      //yield csp.put(dbChan, newDb);
    }
  });

  return {
    shutdown: function () { events.close();  },
    put: function (e) { csp.putAsync(events, e); },
    putSync: function (e) {
      var newDb = dispatchEvent(db, e);
      struct.current = newDb;
      struct.emit('set-sync', newDb, db, []);
      db = newDb;
    }
  };
};


module.exports = Bus;

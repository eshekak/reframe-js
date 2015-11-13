'use strict';

var csp = require('js-csp');

var Bus = function Bus(dbChan, struct, dispatchFn) {
  var events = csp.chan();
  var db;

  var dispatchEvent = function dispatchEvent(e) {
    var handler = dispatchFn(e);
    if (handler) {
      return handler(db, e, put);
    } else {
      console.error("No handler found for", e);
    }
  };

  var put = function put(e) {
    csp.putAsync(events, e);
  };

  var putSync = function putSync(e) {
    var newDb = dispatchEvent(e);
    struct.current = newDb;
    struct.emit('set-sync', newDb, db, []);
    db = newDb;
  };

  csp.go(regeneratorRuntime.mark(function _callee() {
    var e;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return csp.take(dbChan);

        case 2:
          db = _context.sent;

        case 3:
          if (!true) {
            _context.next = 13;
            break;
          }

          _context.next = 6;
          return csp.take(events);

        case 6:
          e = _context.sent;

          if (!(e === csp.CLOSED)) {
            _context.next = 9;
            break;
          }

          return _context.abrupt('break', 13);

        case 9:
          db = dispatchEvent(e);
          struct.cursor().set(db);
          _context.next = 3;
          break;

        case 13:
        case 'end':
          return _context.stop();
      }
    }, _callee, this);
  }));

  return {
    put: put,
    putSync: putSync
  };
};

module.exports = Bus;
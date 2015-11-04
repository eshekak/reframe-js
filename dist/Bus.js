"use strict";

var csp = require('js-csp');

var Bus = function Bus(dispatchFn, updateFn) {
  var events = csp.chan();
  var running = true;

  var dispatchEvent = function dispatchEvent(e) {
    var handler = dispatchFn(e);
    if (handler) {
      handler(e, updateFn);
    } else {
      console.error("No handler found for", e);
    }
  };

  csp.go(regeneratorRuntime.mark(function _callee(chan) {
    var e;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          if (!running) {
            _context.next = 7;
            break;
          }

          _context.next = 3;
          return csp.take(events);

        case 3:
          e = _context.sent;

          dispatchEvent(e);
          _context.next = 0;
          break;

        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));

  return {
    shutdown: function shutdown() {
      running = false;
    },
    put: function put(e) {
      csp.putAsync(events, e);
    },
    putSync: function putSync(e) {
      dispatchEvent(e);
    }
  };
};

module.exports = Bus;
var csp = require('js-csp');


var Bus = function (dispatchFn, updateFn) {
  var events = csp.chan();
  var running = true;

  var dispatchEvent = function (e) {
    var handler = dispatchFn(e);
    if(handler) {
      handler(e, updateFn);
    } else {
      console.error("No handler found for", e);
    }
  }

  csp.go(function* (chan) {
    while(running) {
      var e = yield csp.take(events);
      dispatchEvent(e);
    }
  });

  return {
    shutdown: function () { running = false;  },
    put: function (e) { csp.putAsync(events, e); },
    putSync: function (e) { dispatchEvent(e); }
  };
};


module.exports = Bus;

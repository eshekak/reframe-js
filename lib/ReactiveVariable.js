var immstruct = require('immstruct');

var ReactiveVariable = function (struct, onAnimationFrame) {

  struct.on('next-animation-frame', function () {
    onAnimationFrame();
  });

  struct.on('set-sync', function (is, was, path) {
    struct.emit('swap', is, was, path);
    onAnimationFrame();
  });

  return {
    deref: function () { return struct.cursor().deref(); },
    struct: function () { return struct; },
    set: function (val) { struct.cursor().set(val); },
    retain: function (pool) {}
  };
};


module.exports = ReactiveVariable;

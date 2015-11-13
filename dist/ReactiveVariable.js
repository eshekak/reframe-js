'use strict';

var immstruct = require('immstruct');

var ReactiveVariable = function ReactiveVariable(_struct, onAnimationFrame) {

  _struct.on('next-animation-frame', function () {
    onAnimationFrame();
  });

  _struct.on('set-sync', function (is, was, path) {
    _struct.emit('swap', is, was, path);
    onAnimationFrame();
  });

  return {
    deref: function deref() {
      return _struct.cursor().deref();
    },
    struct: function struct() {
      return _struct;
    },
    set: function set(val) {
      _struct.cursor().set(val);
    }
  };
};

module.exports = ReactiveVariable;
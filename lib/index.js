require('babel-core/register')({ignore: false});
var immstruct = require('immstruct');

var Bus = require('./Bus.js');
var Dispatcher = require('./Dispatcher.js');


var ReFrame = function (initialDb) {
  var db = immstruct(initialDb);
  var dispatcher = Dispatcher();
  var bus = Bus(dispatcher.dispatch, function (h) { return db.cursor().update(h); });

  return {
    bus: bus,
    dispatcher: dispatcher
  };
};


module.exports = ReFrame;

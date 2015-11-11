require('babel-polyfill');
var immstruct = require('immstruct');
var I = require('immutable');
var csp = require('js-csp');

var Bus = require('./Bus.js');
var Dispatcher = require('./Dispatcher.js');
var QueryPool = require('./QueryPool');
var ReactiveVariable = require('./ReactiveVariable');
//var ReactiveQuery = require('./ReactiveQuery');
var QueryCache = require('./QueryCache');


var ReFrame = function () {
  var dbChan = csp.chan();
  var dispatcher = Dispatcher();
  var queryCache = QueryCache();


  return {
    start: function (data) {
      var struct = immstruct(data);
      var bus = Bus(dbChan, struct, dispatcher.dispatch);
      var db = ReactiveVariable(struct, function () { console.log('---------'); });
      queryCache.setDb(db);

      csp.go(function* () {
        yield csp.put(dbChan, struct.cursor().deref());
      });

      return {
        bus: bus,
        query: queryCache.query
      };
    },
    registerHandler: dispatcher.registerHandler,
    registerQuery: queryCache.registerQuery
  };
};


module.exports = ReFrame;

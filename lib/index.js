require('babel-polyfill');
var immstruct = require('immstruct');
var csp = require('js-csp');
var React = require('react');
var ReactDOM = require('react-dom');

var logging = require('./logging');
var components = require('./components');
var Bus = require('./Bus.js');
var Dispatcher = require('./Dispatcher.js');
var QueryPool = require('./QueryPool');
var ReactiveVariable = require('./ReactiveVariable');
var QueryCache = require('./QueryCache');


var RootComponent = React.createClass({
  childContextTypes: {
    $query: React.PropTypes.func,
    $bus: React.PropTypes.object
  },
  getChildContext: function() {
    return {
      $query: this.props.query,
      $bus: this.props.bus
    }
  },
  render: function () {
    var App = this.props.app;
    return React.createElement(App, this.props.appProps);
  }
});


var ReFrame = function () {
  var dbChan = csp.chan();
  var dispatcher = Dispatcher();
  var pool = QueryPool();
  var queryCache = QueryCache(pool);


  return {
    render: function (data, Component, props, element) {
      var struct = immstruct(data);
      var bus = Bus(dbChan, struct, dispatcher.dispatch);

      var doRender = function () {
        var rootElement = React.createElement(RootComponent, {
          query: function (args) {
            return queryCache.query(args).deref();
          },
          bus: bus,
          app: Component,
          appProps: props
        });
        ReactDOM.render(rootElement, element, function () {
          pool.flush();
        });
      };

      var db = ReactiveVariable(struct, doRender);

      queryCache.setDb(db);
      doRender();
      csp.putAsync(dbChan, struct.cursor().deref());

      return {
        bus: bus,
        query: queryCache.query
      };
    },
    registerHandler: dispatcher.registerHandler,
    registerQuery: queryCache.registerQuery
  };
};

ReFrame.component = function () { return components.Component.apply(null, arguments); };
ReFrame.setLogger = function (f) { logging.setLogger(f); };


module.exports = ReFrame;

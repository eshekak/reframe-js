var I = require('immutable');
var React = require('react');


var queryMixin = {
  contextTypes: {
    $query: React.PropTypes.func,
    $bus: React.PropTypes.object
  }
};


var Component = function (lifecycleMixin, renderFn) {
  return React.createClass({
    mixins: [lifecycleMixin, queryMixin],
    render: function () {
      return renderFn(this.props, this.context.$query, this.context.$bus);
    }
  });
};


module.exports = {
  Component: Component,
  queryMixin: queryMixin
};

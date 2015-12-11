var I = require('immutable');
var ReactDOM = require('react-dom');
var React = require('react');
var range = require('lodash/utility/range');
var ReFrame = require('../../../dist/index');

var App = ReFrame.component({}, function (props, query, bus) {
    var row = query(['row']);
    var count = query(['grid-count']);
    return (
        <div>
            <h3>
                Row is...
                (<a href onClick={function (e) { bus.put(['remove-row-tile']); e.preventDefault(); }}>-</a>)
                (<a href onClick={function (e) { bus.put(['add-row-tile']); e.preventDefault(); }}>+</a>)
            </h3>
            <Row row={row} />
            <hr />
            <h3>
                Displaying {count.get('count')} cartesian products...
                (<a href onClick={function (e) { bus.put(['decrement-grid-count']); e.preventDefault(); }}>-</a>)
                (<a href onClick={function (e) { bus.put(['increment-grid-count']); e.preventDefault(); }}>+</a>)
            </h3>
            {range(count.get('count')).map(function (i) {
                return <Grid key={i} />
            })}
        </div>
    );
});

var Row = ReFrame.component({}, function (props, query, bus) {
    return (
        <table className="row">
            <tbody>
                <tr>
                    {props.row.map(function (v, idx) {
                        return <td key={idx}
                                   className={v ? 'active' : 'inactive'}
                                   onMouseEnter={function () { bus.put(['toggle', idx]); }}></td>;
                    })}
                </tr>
            </tbody>
        </table>
    );
});

var Grid = ReFrame.component({}, function (props, query, bus) {
    var product = query(['row-product']);
    return (
        <div className="cartesian-container">
            <table className="cartesian">
                <tbody>
                    {product.map(function (row, idx) {
                        return (
                            <tr key={idx}>
                                {row.map(function (v, idx) {
                                    return <td key={idx}
                                               className={v ? 'active' : 'inactive'}></td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
});


var reframe = ReFrame();

reframe.registerHandler('toggle', function (db, e, put) {
    var idx = e[1];
    return db.updateIn(['row', idx], function (c) { return !c; });
});

reframe.registerHandler('increment-grid-count', function (db, e, put) {
    return db.update('gridCount', function (c) { return c+1; });
});

reframe.registerHandler('decrement-grid-count', function (db, e, put) {
    return db.update('gridCount', function (c) { return c-1; });
});

reframe.registerHandler('add-row-tile', function (db, e, put) {
    return db.update('row', function (r) { return r.push(false); });
});

reframe.registerHandler('remove-row-tile', function (db, e, put) {
    return db.update('row', function (r) { return r.pop(); });
});

reframe.registerQuery('row', function () {
    return [
        ['*db*'],
        function (db) {
            return db.get('row');
        }
    ];
});

reframe.registerQuery('grid-count', function () {
   return [
       ['*db*'],
       function (db) {
           return I.Map({count: db.get('gridCount')});
       }
   ];
});

reframe.registerQuery('row-product', function () {
    return [
        ['row'],
        function (row) {
            console.log('recalculating cartesian product.');
            var result = [];
            row.forEach(function (y) {
                var singleRow = [];
                row.forEach(function (x) {
                    singleRow.push(x && y);
                });
                result.push(singleRow);
            });
            return I.fromJS(result);
        }
    ];
});

var model = I.fromJS({
    gridCount: 1,
    row: [false, false, false, false, false, false, false, false, false]
});

reframe.render(model, App, {}, document.getElementById('page'));

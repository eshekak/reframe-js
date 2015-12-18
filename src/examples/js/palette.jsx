var I = require('immutable');
var ReactDOM = require('react-dom');
var React = require('react');
var range = require('lodash/utility/range');
var ReFrame = require('reframe-js');

var App = ReFrame.component({}, function (props, query, bus) {
    return (
        <div>
            <Picker />
            <hr />
            <Palette />
        </div>
    );
});

var Picker = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected-color']).get('value');
    var colorNames = I.List(query(['available-colors']).keys());
    return (
        <select value={selected} onChange={function (e) { bus.put(['color-selected', e.target.value]) }}>
            {colorNames.map(function (cn) {
                return <option key={cn} value={cn}>{cn}</option>
            })}
        </select>
    );
});

var Palette = ReFrame.component({}, function (props, query, bus) {
    var selected = query(['selected-color']).get('value');
    var size = query(['palette-size']).get('value');
    var paletteColors = query(['palette', size]);
    return (
        <div>
            <div>Showing palette for: {selected}</div>
            <div>Resize:
                <a href onClick={function (e) { bus.put(['resize-palette', -1]); e.preventDefault(); }}>(-)</a>
                <a href onClick={function (e) { bus.put(['resize-palette', 1]); e.preventDefault(); }}>(+)</a>
            </div>
            {paletteColors.map(function (c, idx) {
                var r = c.get(0);
                var g = c.get(1);
                var b = c.get(2);
                var backgroundColor = 'rgb('+r+','+g+','+b+')';
                return <div key={idx}
                            className='palette-element'
                            style={{backgroundColor: backgroundColor}}></div>;
            })}
        </div>
    );
});

var reframe = ReFrame();

var model = I.fromJS({
    data: {
        availableColors: {
            red: [255, 0, 0],
            green: [0, 255, 0],
            blue: [0, 0, 255],
            yellow: [255, 255, 0],
            cyan: [0, 255, 255],
            violet: [255, 0, 255],
            white: [255, 255, 255]
        }
    },
    ui: {
        selectedColor: 'violet',
        paletteSize: 25
    }
});

reframe.registerQuery('selected-color', function () {
    return [
        ['*db*'],
        function (db) {
            return I.Map({value: db.getIn(['ui', 'selectedColor'])});
        }
    ];
});

reframe.registerQuery('palette-size', function () {
    return [
        ['*db*'],
        function (db) {
            return I.Map({value: db.getIn(['ui', 'paletteSize'])});
        }
    ];
});

reframe.registerQuery('available-colors', function () {
    return [
        ['*db*'],
        function (db) {
            return db.getIn(['data', 'availableColors']);
        }
    ];
});

reframe.registerQuery('palette', function (size) {
    return [
        ['selected-color'],
        ['available-colors'],
        function (selectedColor, availableColors) {
            var lookupKey = selectedColor.get('value');
            var baseColor = availableColors.get(lookupKey);
            return I.List(I.Range(0, size).map(function (n) {
                return baseColor.map(function (c) { return Math.floor(c*(n/size)); });
            }));
        }
    ];
});

reframe.registerHandler('color-selected', function (db, e, put) {
    var colorName = e[1];
    return db.setIn(['ui', 'selectedColor'], colorName);
});

reframe.registerHandler('resize-palette', function (db, e, put) {
    var delta = e[1];
    return db.updateIn(['ui', 'paletteSize'], function (s) {
        return Math.max(1, s+delta);
    });
});

reframe.render(model, App, {}, document.getElementById('app-container'));
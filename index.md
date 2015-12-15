---
layout: page
title: "Reframe.js"
---

## What?

**Reframe.js** is a reference implementation of
[re-frame](https://github.com/Day8/re-frame) done purely in
javascript. It is a basis for creating single pages application following
patterns prescribed by
[ClojureScripts](https://github.com/clojure/clojurescript)
[re-frame](https://github.com/Day8/re-frame).

## Quickstart

### Install

    npm install git+https://github.com/karolmajta/reframe-js.git

> Reframe.js is not yet published to npm index. For now please use
> provided repo.

### Minimal example

After installing Reframe.js from npm just put this `index.html` in your
project root. It will give you a bare minimum Reframe.js application showing
a dynamic color palette.

    <!DOCTYPE html>
    <html lang="en-us">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.23/browser.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/immutable/3.7.5/immutable.js"></script>
        <script src="node_modules/reframe-js/browser/index.js"></script>
        <style>
            .palette-element {
                margin: 1px;
                width: 100px;
                height: 10px;
            }
        </style>
      </head>
      <body>
         <div id="app-container">
         </div>
      </body>
      <script type="text/babel">
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
            var colorNames = Immutable.List(query(['available-colors']).keys());
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
    
        var model = Immutable.fromJS({
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
                    return Immutable.Map({value: db.getIn(['ui', 'selectedColor'])});
                }
            ];
        });
    
        reframe.registerQuery('palette-size', function () {
            return [
                ['*db*'],
                function (db) {
                    return Immutable.Map({value: db.getIn(['ui', 'paletteSize'])});
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
                    return Immutable.List(Immutable.Range(0, size).map(function (n) {
                        return baseColor.map(function (c) { return Math.floor(c*(n/size)); });
                    }));
                }
            ];
        })
    
        reframe.registerHandler('color-selected', function (db, e, put) {
            var colorName = e[1];
            return db.setIn(['ui', 'selectedColor'], colorName);
        });
    
        reframe.registerHandler('resize-palette', function (db, e, put) {
            var delta = e[1];
            return db.updateIn(['ui', 'paletteSize'], function (s) {
                return Math.max(1, s+delta);
            });
        })
    
        reframe.render(model, App, {}, document.getElementById('app-container'));
      </script>
    </html>

> Please note, that while `node_modules/reframe-js/browser/index.js` exists
> for demonstration purposes. It is not intended for production. Reframe.js
> is primarily intended for use with [browserify](http://browserify.org/).
> **The browser build is over 1MB and is not something you want on production**.
> This could be (partially) fixed using envify (if you feel like it, please do!)
> but some dependencies (js-csp) do not have browser builds, so it would have
> to be bundled anyways. Summing up: **use browserify**.

## Where to go from here?

While I do my best to provide further docs, this is still work in progress.
There are some working examples in the
[example](https://github.com/karolmajta/reframe-js/tree/master/example) directory
in the repo. Feel free to check them out. They work out of the box after cloning
the repository (just open the files in your browser).
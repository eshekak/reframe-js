---
layout: doc
---

## Quickstart code walkthrough

This walkthrough is just a quick explanation of what and why happens in the
quickstart example. It will help you get your feet wet with Reframe.js.
You can see the quickstart example live at
[karolmajta.github.io/reframe-js/examples/palette/](../examples/palette/)

### Reframe.js components

Reframe.js provides its own `ReFrame.component` function. It's just a thin
wrapper around `React.createClass`. For now you don't have to understand its
internals (which by the way are pretty simple), but it's good to know what
is the contract for it's arguments. Let's look at `App` component:

    var App = ReFrame.component({}, function (props, query, bus) {
        return (
            <div>
                <Picker />
                <hr />
                <Palette />
            </div>
        );
    });

It's pretty simple.

The first argument to `ReFrame.component` are is the lifecycle
mixin of react component. It's just an object containing `getInitialState` etc...
You will probably use it only on occasion with Reframe.js, however the possibility
is always there if you feel the need.

The second argument - render function - is much more interesting. It takes three
arguments:

- `props` - the same `props` object that you're already familiar with from
  regular react components.
- `query` - a query function. You will use it to query your data.
- `bus` - an object exposing two public methods, namely `put` and `putSync`

Ok, so what's the deal with these arguments? They are **everything** that you will
ever use in your components. They are given to your render function and are the
only things that it can touch. Now lets list the three commandments of render function:

1. You will (sparingly) use `props` to modify how the component works.
2. You will **only** use `query` to access your data.
3. You will use `bus.put` and sometimes `bus.putSync` to react to events and schedule
   appropriate reactions to events (called *actions*).
   
Let's stress it again: *everything you need in render function is passed by value*, this
means **any funky stuff is strictly forbidden**. So let's add a few more commandments:

4. Your render function will never depend on any global variable for getting data.
5. You will (almost) never handle events differently, then by using `bus`.

Ok, armed with these 5 rules, let's dissect the body of render function. It's quite
uninspiring - the only thing it does is rendering a `div` with two other Reframe components
(discussed below). The function completely ignores both `bus` and `query`, so it might
be tempting to write it as a regular React component. However, keep in mind, that it
returns a div containing other Reframe components, and that's why it also must be
a Reframe component, for the inner ones to work. That's worth keeping in mind.

Let's get to the `Picker` component.

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

This is much more interesting! It uses both `query` and `bus`.

`query(['selected-color'])` and `query(['available-colors'])` are both
queries, they both have a way of talking to "database" and returning the result
of the query. Just like with SQL you could do:

    select * from colors;

With reframe you just do:

    query(['available-colors'])
    
In a while will discuss how do you declare what queries are available to your components,
but for now you can take them for granted. It's just something you can use to get data.

**`query` always returns either `Immutable.List` or `Immutable.Map`**. Please note, that
when we query for `selected-color` the result could be a scalar value like "red" or "blue".
Yet, since queries are obliged to return `Immutable.Map` or `Immutable.List`, a map in
form `Immutable.Map({value: "red"})` is returned instead, so we must do `.get('value')` to
pull out actual scalar. In case of `colorNames` we get a map as a result of query, but
we are only interested in keys, so we just perform some transformation before assigning the
query result to variable.

Ok, enough about the data. Now let's talk about reacting to change. The only event handler
we use is `onChange`, and everytime the color selection changes we just do:

    bus.put(['color-selected', e.target.value])

In plain English this call means:

> Not now, but ASAP, find an *action* named `color-selected` and pass the
> `['color-selected', e.target.value]` as it's event argument.

We'll get to actions in a moment too. For now it's sufficient to know that this action
will access the database and change its state, so that the result of `query['selected-color']`
will match `e.target.value`.

If you look at `Picker` from a birds view you can notice two things:

- it's pretty dumb. It does not do much. It queries data, renders, and decides which
  actions to trigger in reaction to DOM events.
- it's pretty declarative. It is only **concerned with "what?", and never with "how?"**.
  It says **what data it needs**, and **what to do** when something happens.
  It knows nothing about how to get the data, nor how to react to events.
  
You should try to keep your Reframe.js components that way.

Let's get to the `Palette` component.

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
                                style=></div>;
                })}
            </div>
        );
    });
    
It displays a palette of colors based on which color is currently selected.
It queries for selected color (just like the `Picker` did).
`Picker` needed it to display proper label on the select bar, and `Palette` needs it
because it shows a palette of shades of yellow, or shades of red.

You might be puzzled by the fact, that we call the query again in different
component. Usually *querying* is considered a pain - it takes time, so you try
to avoid it, and reuse the result as much as possible.

Rest assured, with Reframe.js querying is cheap. Actually running query
is close to no-op. You should be using `query` liberally and not be afraid
of querying many times for the same thing.

You also should prefer *querying* for data in render functions of components
in favor of passing data in props. Why?

Well, technically we could take `selected` from `Picker` and pass it down to
`Palette` in props, but for that to happen, `Palette` would have to be a
child of `Picker`. It's not, they're siblings, and we don't want to change that.
We also don't want to care at all! `Palette` and `Picker` would work the same
if they were syblings, if `Palette` was `Picker`'s parent and vice-versa.

This is one of biggest perks of using Reframe.js.

> Querying decouples **shape of your DOM** from **shape of your data**.
> Don't be afraid to use it. **Prefer querying from passing data top-down**.
> *Any component is free to query for any data it needs!*

`Palette` performs 3 queries it needs, and just renders a list of colorful divs.
After dissecting `Picker` it should be obvious what happens inside it's render function.
One thing that's worth noting is the query for palette:

    query(['palette', size])

This is an example of parametrized query, and its SQL counterpart would be something
like:

    select * from palette limit <size>;


### Reframe.js queries

Before we discuss queries themselves lets say a few words about our data model.
All data in Reframe is stored in a map. The map itself is implemented as `Immutable.Map`,
that's why we define our *initial state of database* as an immutable map:

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
    
Keep in mind, that while backed by an immutable data structure, the overal view
of the database throughout the system will change in time.

Then we need to create an instance of `ReFrame`:

    var reframe = ReFrame();

While components are "static" things (hence, they're created with static method
`ReFrame.component`) queries are bound to a particular instance of `Reframe` and
therefore are created using instance methods.

To declare a query you should use `registerQuery`:

    reframe.registerQuery('selected-color', function () {
        return [
            ['*db*'],
            function (db) {
                return Immutable.Map({value: db.getIn(['ui', 'selectedColor'])});
            }
        ];
    });

It takes query name as first argument, and variadic function as second one.
It should return an array. This array's *init*  (all elements except last)
represent this querie's dependencies and should consist of definitions of queries
that the defined one depends on. `['*db*']` is a special "query" that denotes
whole database. Please bear in mind that queries that declare `['*db*']` as their
dependency *will get recomputed everytime anything in the database changes*
(even if it's not affecting the query result).

Last element of the returned list is another variadic function (so called
transformation function). It takes as many arguments, as many dependencies
the query declared. In the example above, since we declared one dependency,
we must accept one argument - the *db* itself. The purpose of transformation
function is to return proper result of the query based on given arguments.
**Keep in mind, that transformation function must return `Immutable.List` or
`Immutable.Map`**. Discussed transformation function for `selected-color`
query returns a map with single key - *value* that contains the selected
color.

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

`palette-size` query and `available-colors` are not really diffferent from
the previous one, so we will focus on `palette` query:
 
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
     });

It's a so-called parametrized query (it takes arguments), and therefore
inside components' render function is used like this:

    query(['palette', 15])

Function we passed to `registerQuery` will then get applied with
tail of the `['palette', 15]` list (all elements excluding first). This
argument can then be used inside both dependency declarations and transformation
function to modify the final result of query.

Please note how we didn't use `['*db*']` in dependency list. It means, that
`palette` will only recompute when either `['selected-color']` or `['available-colors']`
query result changes.

If you're a cautious reader you could point out that (since we already have
`palette-size` query declared) `palette` could be rewritten like:

    reframe.registerQuery('palette', function () {
         return [
             ['selected-color'],
             ['available-colors'],
             ['palette-size']
             function (selectedColor, availableColors, size) {
                 var lookupKey = selectedColor.get('value');
                 var baseColor = availableColors.get(lookupKey);
                 return Immutable.List(Immutable.Range(0, size).map(function (n) {
                     return baseColor.map(function (c) { return Math.floor(c*(n/size)); });
                 }));
             }
         ];
     });

It's true, and it's a valid point, but I chose to show you how to parametrize
queries. Both parametrized and non-parametrized queries are fine, and it
takes some time to figure when to use which.


### Reframe.js actions

Components and queries are enough to render the application initial state, but
we want to put some life to our app! This is what actions are for.

Actions are responsible for modifying the database state. However, they do it
in a pretty interesting way - they are pure functions. Since our database is
backed by immutable data structure, it cannot be modified in place. Instead,
an action receives db as arguments and is obliged to return new db, that will
represent app state after the action.

Let's have a look at how this works in practice:

    reframe.registerHandler('color-selected', function (db, e, put) {
        var colorName = e[1];
        return db.setIn(['ui', 'selectedColor'], colorName);
    });

First argument - `db` represents is database value before the action
kicked in.

Second argument - `e` is the same list that was given to
`bus.put(['event-name', arg1, arg2, ...])`. In case of selected color
we were calling `bus.put(['color-selected', e.target.value])`, so indeed
`e[1]` will be a string representing color selected in the dropdown.
Based on that we return a new database value.

Third argument is "put function". It's actually the same thing as
`bus.put` inside a handler. It can be used to schedule another action
from within an action. You will see how it works in other examples.

The second handler, `resize-palette` works in the same vein.

### Running it

All we did until now, was defining our system. We created a set of rules
for rendering data, querying data, and reacting to events. However, rules
are just rules - they do nothing on their own, until someone puts things
in motion:

    reframe.render(model, App, {}, document.getElementById('app-container'));

This call, taking initial database state, root component, props to be passed
to root component, and element where the component should be rendered
runs the actual loop (backed by [js-csp](https://github.com/ubolonton/js-csp))
that will keep the application running.

### Summing things up

This brief intro should be enough for you to build simple Reframe.js
applications. Things to remember:

- components
    - are really dumb
    - focus on "what?", not "how?"
    - only use what's passed as arguments to render function
    
- queries
    - are cheap and fun to use
    - can be parametrized
    - only recompute if any of it's dependencies value changes

- actions
    - must return a new database state
    - can schedule another action

I hope you have fun trying this stuff out!
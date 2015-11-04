'use strict';

var I = require('immutable');
var immstruct = require('immstruct');
var bacon = require('baconjs');

var Bus = require('./Bus.js');
var Dispatcher = require('./Dispatcher.js');

var db = immstruct(I.Map([['users', I.Set([I.fromJS({ name: 'Mike Jordan', job: 'NBA Player' }), I.fromJS({ name: 'John Wayne', job: 'Cowboy' })])]]));

// ----------------------------------------------------------------------------

var dispatcher = Dispatcher();
var bus = Bus(dispatcher.dispatch, function (h) {
  return db.cursor().update(h);
});

dispatcher.registerHandler('users.add', function (db, event) {
  db = db.update('users', function (users) {
    return users.add(event[1]);
  });
  bus.put(['report']);
  return db;
});

dispatcher.registerHandler('users.remove', function (db, event) {
  db = db.update('users', function (users) {
    return users.remove(event[1]);
  });
  bus.put(['report']);
  return db;
});

bus.put(['users.add', I.fromJS({ name: 'Michael Jackson', job: 'Artist' })]);
bus.put(['users.add', I.fromJS({ name: 'Mike Jordan', job: 'NBA Player' })]);
bus.put(['users.add', I.fromJS({ name: 'Bob Dylan', job: 'Songwriter' })]);
bus.put(['users.remove', I.fromJS({ name: 'Mike Jordan', job: 'NBA Player' })]);
bus.put(['users.remove', I.fromJS({ name: 'ET', job: 'Alien' })]);
bus.putSync(['test']);

// ----------------------------------------------------------------------------
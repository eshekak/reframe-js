'use strict';

require('babel-polyfill');
var I = require('immutable');
var ReFrame = require('./index');

var data = {
  users: ['Mike', 'Michael']
};

var reframe = ReFrame();

//----------------

reframe.registerHandler('conj-name', function (db, e, put) {
  var newDb = db.update('users', function (us) {
    return us.push(e[1]);
  });
  setTimeout(function () {
    put(['conj-name', 'Mr. Bean...']);
  }, 1000);
  return newDb;
});

//----------------

reframe.registerQuery('users', function () {
  return [['*db*'], function (db) {
    return db.get('users');
  }];
});

reframe.registerQuery('lettered-users', function (letter) {
  return [['users'], function (users) {
    return I.List(I.Set(users.filter(function (u) {
      return u[0] == letter;
    })));
  }];
});

reframe.registerQuery('lettered-users-count', function (letter) {
  return [['lettered-users', letter], function (letteredUsers) {
    console.log(letteredUsers);
    return I.Map({ count: letteredUsers.count() });
  }];
});

//----------------

var startedReframe = reframe.render(data);

var bus = startedReframe.bus;
var query = startedReframe.query;

bus.put(['conj-name', 'Kate']);

query(['lettered-users-count', 'M']);
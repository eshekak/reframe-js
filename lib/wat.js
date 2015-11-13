require('babel-polyfill');
var I = require('immutable');
var ReFrame = require('./index');


var data = {
  users: ['Mike', 'Michael']
};

var reframe = ReFrame();


//----------------

reframe.registerHandler('conj-name', function (db, e, put) {
  var newDb = db.update('users', (us) => us.push(e[1]));
  setTimeout(function () { put(['conj-name', 'Mr. Bean...']); }, 1000);
  return newDb;
});


//----------------


reframe.registerQuery('users', () => [
  ['*db*'],
  (db) => {
    return db.get('users');
  }
]);

reframe.registerQuery('lettered-users', (letter) => [
  ['users'],
  (users) => {
    return I.List(I.Set(users.filter(u => u[0] == letter)));
  }
]);

reframe.registerQuery('lettered-users-count', (letter) => [
  ['lettered-users', letter],
  (letteredUsers) => {
    console.log(letteredUsers);
    return I.Map({count: letteredUsers.count()});
  }
]);


//----------------


var startedReframe = reframe.render(data);

var bus = startedReframe.bus;
var query = startedReframe.query;


bus.put(['conj-name', 'Kate']);

query(['lettered-users-count', 'M']);

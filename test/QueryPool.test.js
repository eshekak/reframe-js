var I = require('immutable');
var expect = require('chai').expect;
var sinon = require('sinon');

var QueryPool = require('./../lib/QueryPool');


describe('QueryPool#acquire', function () {
  describe('when query is already in pool', function () {
    it('should return whatever is stored in ref field', function () {
      var initial = I.Map([
        [I.fromJS(["query1", 1, 2]), I.fromJS({ref: 'i am ref1'})],
        [I.fromJS(["query1", 2, 3]), I.fromJS({ref: 'i am ref2'})],
        [I.fromJS(["query2", 1]), I.fromJS({ref: 'i am ref3'})]
      ]);
      var pool = QueryPool(initial, function () {}, function () {});
      expect(pool.acquire(["query1", 1, 2])).to.equal('i am ref1');
      expect(pool.acquire(["query1", 2, 3])).to.equal('i am ref2');
      expect(pool.acquire(["query2", 1])).to.equal('i am ref3');
    });
    it('should increment the refcount for given key', function () {
      var initial = I.Map([
        [I.fromJS(["query1", 1, 2]), I.fromJS({refCount: 3, ref: 'i am ref1'})]
      ]);
      var pool = QueryPool(initial, function () {}, function () {});
      pool.acquire(["query1", 1, 2]);
      expect(pool.report().get(I.fromJS(["query1", 1, 2]))).to.equal(4);
    })
  });
  describe('when query is not in pool', function () {
    it('should return whatever query factory function returned', function () {
      var pool = QueryPool(I.Map(), function () { return 'new ref' }, function () {});
      expect(pool.acquire(["query"])).to.equal('new ref');
    });
    it('should apply query factory function with acquire argument', function () {
      var queryFactory = sinon.spy();
      var pool = QueryPool(I.Map(), queryFactory, function () {});
      pool.acquire(["query1", 1, 2, "bob"]);
      expect(queryFactory.calledWith("query1", 1, 2, "bob")).to.be.true;
    });
    it('should put result from query factory function on pool and set refCount to 1', function () {
      var pool = QueryPool(I.Map(), function () {}, function () {});
      pool.acquire(["query", 1, 2]);
      expect(pool.report().get(I.fromJS(["query", 1, 2]))).to.equal(1);
    });
  });
});

describe('QueryPool#scheduleDispose', function () {
  it('should put what was given onto disposeBuffer in order of calling', function () {
    var pool = QueryPool(I.Map(), function () {}, function () {});
    pool.scheduleDispose(["query1", 1, 2]);
    pool.scheduleDispose(["query1", 1, 2]);
    pool.scheduleDispose(["query2", 1]);
    var expected = I.List.of(
      I.fromJS(["query1", 1, 2]),
      I.fromJS(["query1", 1, 2]),
      I.fromJS(["query2", 1])
    );
    expect(expected.equals(pool.reportScheduledDisposals())).to.be.true;
  });
});

describe('QueryPool#flush', function () {
  var pool;
  beforeEach(function () {
    var initial = I.Map([
      [I.fromJS(["query1", 1, 2]), I.fromJS({ref: 'i am ref1', refCount: 2})],
      [I.fromJS(["query1", 2, 3]), I.fromJS({ref: 'i am ref2', refCount: 1})],
      [I.fromJS(["query2", 1]), I.fromJS({ref: 'i am ref3', refCount: 5})]
    ]);
    pool = QueryPool(initial, function () {}, function () {});
  });
  it('should decrement refcount for each match in disposeBuffer', function () {
    pool.scheduleDispose(["query1", 1, 2]);
    pool.scheduleDispose(["query2", 1]);
    pool.scheduleDispose(["query2", 1]);
    pool.scheduleDispose(["query2", 2]);
    pool.flush();
    var expected = I.Map([
      [I.fromJS(["query1", 1, 2]), 1],
      [I.fromJS(["query1", 2, 3]), 1],
      [I.fromJS(["query2", 1]), 3]
    ]);
    expect(expected.equals(pool.report())).to.be.true;
  });
  it('should empty the buffer', function () {
    pool.scheduleDispose(["query1", 1, 2]);
    pool.flush();
    expect(pool.reportScheduledDisposals().equals(I.List.of())).to.be.true;
  });
  it('should remove entries with 0 refcount', function () {
    pool.scheduleDispose(["query1", 2, 3]);
    pool.flush();
    var expected = I.Map([
      [I.fromJS(["query1", 1, 2]), 2],
      [I.fromJS(["query2", 1]), 5]
    ]);
    expect(expected.equals(pool.report())).to.be.true;
  });
  it('should call onDispose with every ref with 0 refcount', function () {
    var onDispose = sinon.spy();
    var initial = I.Map([
      [I.fromJS(["query1", 1, 2]), I.fromJS({ref: 'i am ref1', refCount: 2})],
      [I.fromJS(["query1", 2, 3]), I.fromJS({ref: 'i am ref2', refCount: 1})],
      [I.fromJS(["query2", 1]), I.fromJS({ref: 'i am ref3', refCount: 5})]
    ]);
    var pool = QueryPool(initial, function () {}, onDispose);
    pool.scheduleDispose(["query1", 1, 2]);
    pool.scheduleDispose(["query1", 1, 2]);
    pool.scheduleDispose(["query1", 2, 3]);
    pool.scheduleDispose(["query2", 1]);
    pool.flush();
    expect(onDispose.calledWith('i am ref1')).to.be.true;
    expect(onDispose.calledWith('i am ref2')).to.be.true;
    expect(onDispose.calledWith('i am ref3')).to.be.false;
  });
  it('should throw if finds out refcount smaller than 0', function () {
    pool.scheduleDispose(["query1", 2, 3]);
    pool.scheduleDispose(["query1", 2, 3]);
    expect(() => pool.flush()).to.throw(/ref count/);
  });
});

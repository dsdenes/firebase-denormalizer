'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

_firebase2.default.initializeApp(_config2.default.get('firebase'));

/*
* firebase.ref()
* */

var modelDenormalizer = (0, _index2.default)(_firebase2.default.database());
var dogs = modelDenormalizer('Dogs');

describe('getPathString', function () {
  it('should work with one string parameter', function () {
    expect((0, _index.getPathString)()).toBe('');
    expect((0, _index.getPathString)('/')).toBe('');
    expect((0, _index.getPathString)('dogs')).toBe('dogs');
    expect((0, _index.getPathString)('/dogs')).toBe('dogs');
    expect((0, _index.getPathString)('/dogs/kennels')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs/kennels')).toBe('dogs/kennels');
  });

  it('should work with multiple string parameter', function () {
    expect((0, _index.getPathString)('dogs', 'kennels')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels/')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels/')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels/', '', 'wolfdog')).toBe('dogs/kennels/wolfdog');
  });

  it('should work with multiple array', function () {
    expect((0, _index.getPathString)([''], ['kennels'])).toBe('kennels');
    expect((0, _index.getPathString)(['dogs'], ['kennels'])).toBe('dogs/kennels');
    expect((0, _index.getPathString)(['dogs'], [''])).toBe('dogs');
    expect((0, _index.getPathString)(['dogs'], ['kennels', 'wolfdog'], ['othertype'])).toBe('dogs/kennels/wolfdog/othertype');
  });

  it('should work with combined array and contated string parameters', function () {
    expect((0, _index.getPathString)('dogs/kennels', ['wolfdog'])).toBe('dogs/kennels/wolfdog');
  });
});

describe('getKey', function () {
  it('should encode keys', function () {
    expect((0, _index.getKey)('')).toBe('');
    expect((0, _index.getKey)('key')).toBe('key');
    expect((0, _index.getKey)('john Doe')).toBe('john Doe');
    expect((0, _index.getKey)('John Doe')).toBe('John Doe');
    expect((0, _index.getKey)('John--Doe')).toBe('John--Doe');
    expect((0, _index.getKey)('John/Doe/')).toBe('John%2FDoe%2F');
    expect((0, _index.getKey)('John.Doe.')).toBe('John%2EDoe%2E');
    expect((0, _index.getKey)('John\'s kennel')).toBe('John\'s kennel');
  });
});

describe('getDenormalizedCollectionName', function () {
  it('should encode keys', function () {
    expect(function () {
      return (0, _index.getDenormalizedCollectionName)('', '');
    }).toThrow();
    expect((0, _index.getDenormalizedCollectionName)('johns', 'doe')).toBe('john-does');
    expect((0, _index.getDenormalizedCollectionName)('John', 'doe')).toBe('John-does');
    expect((0, _index.getDenormalizedCollectionName)('john does', 'john doe')).toBe('john doe-john does');
    expect((0, _index.getDenormalizedCollectionName)('John Doe', 'John Doe')).toBe('John Doe-John Does');
  });
});

describe('denormalizer', function () {

  beforeEach(function () {
    _firebase2.default.database().ref().remove();
  });

  it('should push, and remove', _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var aDog, id1, id2;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            dogs.filterableProperty('type');
            dogs.filterableProperty('kennel');
            dogs.filterableProperty('Type');
            dogs.filterableProperty('Kennel');

            aDog = {
              type: 'wolfdog',
              kennel: "John's kennel"
            };
            _context.next = 7;
            return dogs.push(aDog);

          case 7:
            id1 = _context.sent;
            _context.next = 10;
            return dogs.push(aDog);

          case 10:
            id2 = _context.sent;

            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();

            _context.t0 = expect;
            _context.next = 16;
            return dogs.getById(id1);

          case 16:
            _context.t1 = _context.sent;
            _context.t2 = aDog;
            (0, _context.t0)(_context.t1).toEqual(_context.t2);
            _context.t3 = expect;
            _context.next = 22;
            return dogs.get(['Dog-types', 'wolfdog', id1]);

          case 22:
            _context.t4 = _context.sent;
            (0, _context.t3)(_context.t4).toBe(true);
            _context.t5 = expect;
            _context.next = 27;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id1]);

          case 27:
            _context.t6 = _context.sent;
            (0, _context.t5)(_context.t6).toBe(true);
            _context.t7 = expect;
            _context.next = 32;
            return dogs.get(['Dog-Types', 'wolfdog', id1]);

          case 32:
            _context.t8 = _context.sent;
            (0, _context.t7)(_context.t8).toBe(null);
            _context.t9 = expect;
            _context.next = 37;
            return dogs.get(['Dog-Kennels', 'John\'s kennel', id1]);

          case 37:
            _context.t10 = _context.sent;
            (0, _context.t9)(_context.t10).toBe(null);
            _context.t11 = expect;
            _context.next = 42;
            return dogs.getById(id2);

          case 42:
            _context.t12 = _context.sent;
            _context.t13 = aDog;
            (0, _context.t11)(_context.t12).toEqual(_context.t13);
            _context.t14 = expect;
            _context.next = 48;
            return dogs.get(['Dog-types', 'wolfdog', id2]);

          case 48:
            _context.t15 = _context.sent;
            (0, _context.t14)(_context.t15).toBe(true);
            _context.t16 = expect;
            _context.next = 53;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id2]);

          case 53:
            _context.t17 = _context.sent;
            (0, _context.t16)(_context.t17).toBe(true);
            _context.next = 57;
            return dogs.removeById(id1);

          case 57:
            _context.t18 = expect;
            _context.next = 60;
            return dogs.getById(id1);

          case 60:
            _context.t19 = _context.sent;
            (0, _context.t18)(_context.t19).toBe(null);
            _context.t20 = expect;
            _context.next = 65;
            return dogs.get(['Dog-types', 'wolfdog', id1]);

          case 65:
            _context.t21 = _context.sent;
            (0, _context.t20)(_context.t21).toBe(null);
            _context.t22 = expect;
            _context.next = 70;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id1]);

          case 70:
            _context.t23 = _context.sent;
            (0, _context.t22)(_context.t23).toBe(null);
            _context.t24 = expect;
            _context.next = 75;
            return dogs.getById(id2);

          case 75:
            _context.t25 = _context.sent;
            _context.t26 = aDog;
            (0, _context.t24)(_context.t25).toEqual(_context.t26);
            _context.t27 = expect;
            _context.next = 81;
            return dogs.get(['Dog-types', 'wolfdog', id2]);

          case 81:
            _context.t28 = _context.sent;
            (0, _context.t27)(_context.t28).toBe(true);
            _context.t29 = expect;
            _context.next = 86;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id2]);

          case 86:
            _context.t30 = _context.sent;
            (0, _context.t29)(_context.t30).toBe(true);
            _context.next = 90;
            return dogs.removeById(id2);

          case 90:
            _context.t31 = expect;
            _context.next = 93;
            return dogs.getById(id1);

          case 93:
            _context.t32 = _context.sent;
            (0, _context.t31)(_context.t32).toBe(null);
            _context.t33 = expect;
            _context.next = 98;
            return dogs.get(['Dog-types', 'wolfdog', id1]);

          case 98:
            _context.t34 = _context.sent;
            (0, _context.t33)(_context.t34).toBe(null);
            _context.t35 = expect;
            _context.next = 103;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id1]);

          case 103:
            _context.t36 = _context.sent;
            (0, _context.t35)(_context.t36).toBe(null);
            _context.t37 = expect;
            _context.next = 108;
            return dogs.getById(id2);

          case 108:
            _context.t38 = _context.sent;
            (0, _context.t37)(_context.t38).toEqual(null);
            _context.t39 = expect;
            _context.next = 113;
            return dogs.get(['Dog-types', 'wolfdog', id2]);

          case 113:
            _context.t40 = _context.sent;
            (0, _context.t39)(_context.t40).toBe(null);
            _context.t41 = expect;
            _context.next = 118;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id2]);

          case 118:
            _context.t42 = _context.sent;
            (0, _context.t41)(_context.t42).toBe(null);

          case 120:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it('should push and update', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var aDog, id1, id2;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            dogs.filterableProperty('type');
            dogs.filterableProperty('kennel');

            aDog = {
              type: 'wolfdog',
              kennel: "John's kennel"
            };
            _context2.next = 5;
            return dogs.push(aDog);

          case 5:
            id1 = _context2.sent;
            _context2.next = 8;
            return dogs.push(aDog);

          case 8:
            id2 = _context2.sent;
            _context2.next = 11;
            return dogs.updateById(id1, { name: 'newName' });

          case 11:
            _context2.t0 = expect;
            _context2.next = 14;
            return dogs.getById(id1);

          case 14:
            _context2.t1 = _context2.sent;
            _context2.t2 = Object.assign({}, aDog, { name: 'newName' });
            (0, _context2.t0)(_context2.t1).toEqual(_context2.t2);
            _context2.t3 = expect;
            _context2.next = 20;
            return dogs.getById(id2);

          case 20:
            _context2.t4 = _context2.sent;
            _context2.t5 = aDog;
            (0, _context2.t3)(_context2.t4).toEqual(_context2.t5);
            _context2.next = 25;
            return dogs.updateById(id1, { type: 'pumi' });

          case 25:
            _context2.t6 = expect;
            _context2.next = 28;
            return dogs.getById(id1);

          case 28:
            _context2.t7 = _context2.sent;
            _context2.t8 = Object.assign({}, aDog, { name: 'newName', type: 'pumi' });
            (0, _context2.t6)(_context2.t7).toEqual(_context2.t8);
            _context2.t9 = expect;
            _context2.next = 34;
            return dogs.get(['Dog-types', 'wolfdog', id1]);

          case 34:
            _context2.t10 = _context2.sent;
            (0, _context2.t9)(_context2.t10).toBe(null);
            _context2.t11 = expect;
            _context2.next = 39;
            return dogs.get(['Dog-types', 'pumi', id1]);

          case 39:
            _context2.t12 = _context2.sent;
            (0, _context2.t11)(_context2.t12).toBe(true);
            _context2.t13 = expect;
            _context2.next = 44;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id1]);

          case 44:
            _context2.t14 = _context2.sent;
            (0, _context2.t13)(_context2.t14).toBe(true);
            _context2.next = 48;
            return dogs.updateById(id1, { type: 'wolfdog' });

          case 48:
            _context2.t15 = expect;
            _context2.next = 51;
            return dogs.getById(id1);

          case 51:
            _context2.t16 = _context2.sent;
            _context2.t17 = Object.assign({}, aDog, { name: 'newName', type: 'wolfdog' });
            (0, _context2.t15)(_context2.t16).toEqual(_context2.t17);
            _context2.t18 = expect;
            _context2.next = 57;
            return dogs.get(['Dog-types', 'wolfdog', id1]);

          case 57:
            _context2.t19 = _context2.sent;
            (0, _context2.t18)(_context2.t19).toBe(true);
            _context2.t20 = expect;
            _context2.next = 62;
            return dogs.get(['Dog-types', 'pumi', id1]);

          case 62:
            _context2.t21 = _context2.sent;
            (0, _context2.t20)(_context2.t21).toBe(null);
            _context2.t22 = expect;
            _context2.next = 67;
            return dogs.get(['Dog-kennels', 'John\'s kennel', id1]);

          case 67:
            _context2.t23 = _context2.sent;
            (0, _context2.t22)(_context2.t23).toBe(true);
            _context2.t24 = expect;
            _context2.next = 72;
            return dogs.getById(id2);

          case 72:
            _context2.t25 = _context2.sent;
            _context2.t26 = aDog;
            (0, _context2.t24)(_context2.t25).toEqual(_context2.t26);

          case 75:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  it('should push and set', _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
    var aDog, id1, id2;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            dogs.filterableProperty('type');
            dogs.filterableProperty('kennel');

            aDog = {
              type: 'wolfdog',
              kennel: "John's kennel"
            };
            _context3.next = 5;
            return dogs.push(aDog);

          case 5:
            id1 = _context3.sent;
            _context3.next = 8;
            return dogs.push(aDog);

          case 8:
            id2 = _context3.sent;
            _context3.next = 11;
            return dogs.setById(id1, { name: 'new name' });

          case 11:
            _context3.t0 = expect;
            _context3.next = 14;
            return dogs.getById(id1);

          case 14:
            _context3.t1 = _context3.sent;
            _context3.t2 = { name: 'new name' };
            (0, _context3.t0)(_context3.t1).toEqual(_context3.t2);
            _context3.t3 = expect;
            _context3.next = 20;
            return dogs.getById(id2);

          case 20:
            _context3.t4 = _context3.sent;
            _context3.t5 = aDog;
            (0, _context3.t3)(_context3.t4).toEqual(_context3.t5);
            _context3.next = 25;
            return dogs.setById(id1, { name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });

          case 25:
            _context3.t6 = expect;
            _context3.next = 28;
            return dogs.getById(id1);

          case 28:
            _context3.t7 = _context3.sent;
            _context3.t8 = { name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' };
            (0, _context3.t6)(_context3.t7).toEqual(_context3.t8);
            _context3.t9 = expect;
            _context3.next = 34;
            return dogs.get(['Dog-types', 'wolfdog', id1]);

          case 34:
            _context3.t10 = _context3.sent;
            (0, _context3.t9)(_context3.t10).toBe(null);
            _context3.t11 = expect;
            _context3.next = 39;
            return dogs.get(['Dog-types', 'pumi', id1]);

          case 39:
            _context3.t12 = _context3.sent;
            (0, _context3.t11)(_context3.t12).toBe(true);
            _context3.t13 = expect;
            _context3.next = 44;
            return dogs.getById(id2);

          case 44:
            _context3.t14 = _context3.sent;
            _context3.t15 = aDog;
            (0, _context3.t13)(_context3.t14).toEqual(_context3.t15);

          case 47:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));

  describe('findValue', function () {

    it('should find by properties', _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              dogs.filterableProperty('type');
              dogs.filterableProperty('kennel');

              _context4.next = 4;
              return dogs.push({ name: 'Petee', type: 'wolfdog', kennel: "John's kennel" });

            case 4:
              _context4.next = 6;
              return dogs.push({ name: 'Lolly', type: 'wolfdog', kennel: "John's kennel" });

            case 6:
              _context4.next = 8;
              return dogs.push({ type: 'pumi', kennel: "John's kennel" });

            case 8:
              _context4.next = 10;
              return dogs.push({ type: 'pumi', kennel: "Barbara's kennel" });

            case 10:
              _context4.next = 12;
              return dogs.push({ type: 'puli', kennel: "Barbara's kennel" });

            case 12:
              _context4.t0 = expect;
              _context4.next = 15;
              return dogs.findValue({
                name: 'Petee'
              });

            case 15:
              _context4.t1 = _context4.sent;
              (0, _context4.t0)(_context4.t1).toHaveLength(1);
              _context4.t2 = expect;
              _context4.next = 20;
              return dogs.findValue({
                name: 'Petee',
                kennel: 'John\'s kennel'
              });

            case 20:
              _context4.t3 = _context4.sent;
              (0, _context4.t2)(_context4.t3).toHaveLength(1);
              _context4.t4 = expect;
              _context4.next = 25;
              return dogs.findValue({
                kennel: 'John\'s kennel'
              });

            case 25:
              _context4.t5 = _context4.sent;
              (0, _context4.t4)(_context4.t5).toHaveLength(3);
              _context4.t6 = expect;
              _context4.next = 30;
              return dogs.findValue({
                type: 'wolfdog',
                kennel: 'John\'s kennel'
              });

            case 30:
              _context4.t7 = _context4.sent;
              (0, _context4.t6)(_context4.t7).toHaveLength(2);
              _context4.t8 = expect;
              _context4.next = 35;
              return dogs.findValue({
                type: 'pumi',
                kennel: 'John\'s kennel'
              });

            case 35:
              _context4.t9 = _context4.sent;
              (0, _context4.t8)(_context4.t9).toHaveLength(1);
              _context4.t10 = expect;
              _context4.next = 40;
              return dogs.findValue({
                type: 'puli',
                kennel: 'John\'s kennel'
              });

            case 40:
              _context4.t11 = _context4.sent;
              (0, _context4.t10)(_context4.t11).toHaveLength(0);

            case 42:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));
  });

  describe.only('find', function () {

    beforeEach(_asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              dogs.filterableProperty('type');
              dogs.filterableProperty('Kennel');

              _context5.next = 4;
              return dogs.push({ name: 'Petee', type: 'wolfdog', Kennel: "John's kennel" });

            case 4:
              _context5.next = 6;
              return dogs.push({ name: 'Lolly', type: 'wolfdog', Kennel: "John's kennel" });

            case 6:
              _context5.next = 8;
              return dogs.push({ type: 'pumi', Kennel: "John's kennel" });

            case 8:
              _context5.next = 10;
              return dogs.push({ type: 'pumi', Kennel: "Barbara's kennel" });

            case 10:
              _context5.next = 12;
              return dogs.push({ type: 'puli', Kennel: "Barbara's kennel" });

            case 12:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));

    it('should find by properties', _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.t0 = expect;
              _context6.next = 3;
              return dogs.findValue({
                type: 'pumi'
              });

            case 3:
              _context6.t1 = _context6.sent;
              (0, _context6.t0)(_context6.t1).toHaveLength(2);
              _context6.t2 = expect;
              _context6.next = 8;
              return dogs.findValue({
                name: 'Petee',
                Kennel: 'John\'s kennel'
              });

            case 8:
              _context6.t3 = _context6.sent;
              (0, _context6.t2)(_context6.t3).toHaveLength(1);
              _context6.t4 = expect;
              _context6.next = 13;
              return dogs.findValue({
                Kennel: 'John\'s kennel'
              });

            case 13:
              _context6.t5 = _context6.sent;
              (0, _context6.t4)(_context6.t5).toHaveLength(3);
              _context6.t6 = expect;
              _context6.next = 18;
              return dogs.findValue({
                type: 'wolfdog',
                Kennel: 'John\'s kennel'
              });

            case 18:
              _context6.t7 = _context6.sent;
              (0, _context6.t6)(_context6.t7).toHaveLength(2);
              _context6.t8 = expect;
              _context6.next = 23;
              return dogs.findValue({
                type: 'pumi',
                Kennel: 'John\'s kennel'
              });

            case 23:
              _context6.t9 = _context6.sent;
              (0, _context6.t8)(_context6.t9).toHaveLength(1);
              _context6.t10 = expect;
              _context6.next = 28;
              return dogs.findValue({
                type: 'puli',
                Kennel: 'John\'s kennel'
              });

            case 28:
              _context6.t11 = _context6.sent;
              (0, _context6.t10)(_context6.t11).toHaveLength(0);

            case 30:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });
});
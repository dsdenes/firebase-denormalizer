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

const modelDenormalizer = (0, _index2.default)(_firebase2.default.database());
const dogs = modelDenormalizer('dogs');

describe('getPathString', () => {
  it('should work with one string parameter', () => {
    expect((0, _index.getPathString)()).toBe('');
    expect((0, _index.getPathString)('/')).toBe('');
    expect((0, _index.getPathString)('dogs')).toBe('dogs');
    expect((0, _index.getPathString)('/dogs')).toBe('dogs');
    expect((0, _index.getPathString)('/dogs/kennels')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs/kennels')).toBe('dogs/kennels');
  });

  it('should work with multiple string parameter', () => {
    expect((0, _index.getPathString)('dogs', 'kennels')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels/')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels/')).toBe('dogs/kennels');
    expect((0, _index.getPathString)('dogs', '/kennels/', '', 'wolfdog')).toBe('dogs/kennels/wolfdog');
  });

  it('should work with multiple array', () => {
    expect((0, _index.getPathString)([''], ['kennels'])).toBe('kennels');
    expect((0, _index.getPathString)(['dogs'], ['kennels'])).toBe('dogs/kennels');
    expect((0, _index.getPathString)(['dogs'], [''])).toBe('dogs');
    expect((0, _index.getPathString)(['dogs'], ['kennels', 'wolfdog'], ['othertype'])).toBe('dogs/kennels/wolfdog/othertype');
  });

  it('should work with combined array and contated string parameters', () => {
    expect((0, _index.getPathString)('dogs/kennels', ['wolfdog'])).toBe('dogs/kennels/wolfdog');
  });
});

describe('getKey', () => {
  it('should encode keys', () => {
    expect((0, _index.getKey)('')).toBe('');
    expect((0, _index.getKey)('key')).toBe('key');
    expect((0, _index.getKey)('John Doe')).toBe('johnDoe');
    expect((0, _index.getKey)('John--Doe')).toBe('johnDoe');
    expect((0, _index.getKey)('John/Doe/')).toBe('john!2FDoe!2F');
    expect((0, _index.getKey)('John.Doe.')).toBe('johnDoe');
    expect((0, _index.getKey)('John\'s kennel')).toBe('john\'sKennel');
  });
});

describe('getDenormalizedCollectionName', () => {
  it('should encode keys', () => {
    expect((0, _index.getDenormalizedCollectionName)('', '')).toBe('');
    expect((0, _index.getDenormalizedCollectionName)('john', 'doe')).toBe('johnDoes');
    expect((0, _index.getDenormalizedCollectionName)('john doe', 'john doe')).toBe('johnDoeJohnDoes');
  });
});

describe('denormalizer', () => {

  beforeEach(() => {
    _firebase2.default.database().ref().remove();
  });

  it('should push, and remove', _asyncToGenerator(function* () {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = yield dogs.push(aDog);
    const id2 = yield dogs.push(aDog);
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();

    expect((yield dogs.getById(id1))).toEqual(aDog);
    expect((yield dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(true);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(true);

    expect((yield dogs.getById(id2))).toEqual(aDog);
    expect((yield dogs.get(['dogTypes', 'wolfdog', id2]))).toBe(true);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id2]))).toBe(true);

    yield dogs.removeById(id1);
    expect((yield dogs.getById(id1))).toBe(null);
    expect((yield dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(null);
    expect((yield dogs.getById(id2))).toEqual(aDog);
    expect((yield dogs.get(['dogTypes', 'wolfdog', id2]))).toBe(true);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id2]))).toBe(true);

    yield dogs.removeById(id2);
    expect((yield dogs.getById(id1))).toBe(null);
    expect((yield dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(null);
    expect((yield dogs.getById(id2))).toEqual(null);
    expect((yield dogs.get(['dogTypes', 'wolfdog', id2]))).toBe(null);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id2]))).toBe(null);
  }));

  it('should push and update', _asyncToGenerator(function* () {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = yield dogs.push(aDog);
    const id2 = yield dogs.push(aDog);

    yield dogs.updateById(id1, { name: 'newName' });
    expect((yield dogs.getById(id1))).toEqual(Object.assign({}, aDog, { name: 'newName' }));
    expect((yield dogs.getById(id2))).toEqual(aDog);

    yield dogs.updateById(id1, { type: 'pumi' });
    expect((yield dogs.getById(id1))).toEqual(Object.assign({}, aDog, { name: 'newName', type: 'pumi' }));
    expect((yield dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((yield dogs.get(['dogTypes', 'pumi', id1]))).toBe(true);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(true);

    yield dogs.updateById(id1, { type: 'wolfdog' });
    expect((yield dogs.getById(id1))).toEqual(Object.assign({}, aDog, { name: 'newName', type: 'wolfdog' }));
    expect((yield dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(true);
    expect((yield dogs.get(['dogTypes', 'pumi', id1]))).toBe(null);
    expect((yield dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(true);

    expect((yield dogs.getById(id2))).toEqual(aDog);
  }));

  it('should push and set', _asyncToGenerator(function* () {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = yield dogs.push(aDog);
    const id2 = yield dogs.push(aDog);

    yield dogs.setById(id1, { name: 'new name' });
    expect((yield dogs.getById(id1))).toEqual({ name: 'new name' });
    expect((yield dogs.getById(id2))).toEqual(aDog);

    yield dogs.setById(id1, { name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });
    expect((yield dogs.getById(id1))).toEqual({ name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });
    expect((yield dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((yield dogs.get(['dogTypes', 'pumi', id1]))).toBe(true);

    expect((yield dogs.getById(id2))).toEqual(aDog);
  }));

  describe('findValue', () => {

    it('should find by properties', _asyncToGenerator(function* () {
      dogs.filterableProperty('type');
      dogs.filterableProperty('kennel');

      yield dogs.push({ name: 'Petee', type: 'wolfdog', kennel: "John's kennel" });
      yield dogs.push({ name: 'Lolly', type: 'wolfdog', kennel: "John's kennel" });
      yield dogs.push({ type: 'pumi', kennel: "John's kennel" });
      yield dogs.push({ type: 'pumi', kennel: "Barbara's kennel" });
      yield dogs.push({ type: 'puli', kennel: "Barbara's kennel" });

      expect((yield dogs.findValue({
        name: 'Petee'
      }))).toHaveLength(1);

      expect((yield dogs.findValue({
        name: 'Petee',
        kennel: 'John\'s kennel'
      }))).toHaveLength(1);

      expect((yield dogs.findValue({
        kennel: 'John\'s kennel'
      }))).toHaveLength(3);

      expect((yield dogs.findValue({
        type: 'wolfdog',
        kennel: 'John\'s kennel'
      }))).toHaveLength(2);

      expect((yield dogs.findValue({
        type: 'pumi',
        kennel: 'John\'s kennel'
      }))).toHaveLength(1);

      expect((yield dogs.findValue({
        type: 'puli',
        kennel: 'John\'s kennel'
      }))).toHaveLength(0);
    }));
  });

  describe('find', () => {

    beforeEach(_asyncToGenerator(function* () {
      dogs.filterableProperty('type');
      dogs.filterableProperty('kennel');

      yield dogs.push({ name: 'Petee', type: 'wolfdog', kennel: "John's kennel" });
      yield dogs.push({ name: 'Lolly', type: 'wolfdog', kennel: "John's kennel" });
      yield dogs.push({ type: 'pumi', kennel: "John's kennel" });
      yield dogs.push({ type: 'pumi', kennel: "Barbara's kennel" });
      yield dogs.push({ type: 'puli', kennel: "Barbara's kennel" });
    }));

    it('should find by properties', _asyncToGenerator(function* () {

      const result = dogs.find({
        type: 'wolfdog'
      });

      result.once('value', function (snapshot) {
        expect(snapshot.val()).toHaveLength(2);
      });

      // expect(await dogs.findValue({
      //   name: 'Petee'
      // })).toHaveLength(1);
      //
      // expect(await dogs.findValue({
      //   name: 'Petee',
      //   kennel: 'John\'s kennel'
      // })).toHaveLength(1);
      //
      // expect(await dogs.findValue({
      //   kennel: 'John\'s kennel'
      // })).toHaveLength(3);
      //
      // expect(await dogs.findValue({
      //   type: 'wolfdog',
      //   kennel: 'John\'s kennel'
      // })).toHaveLength(2);
      //
      // expect(await dogs.findValue({
      //   type: 'pumi',
      //   kennel: 'John\'s kennel'
      // })).toHaveLength(1);
      //
      // expect(await dogs.findValue({
      //   type: 'puli',
      //   kennel: 'John\'s kennel'
      // })).toHaveLength(0);
    }));
  });
});
'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const config = {
  apiKey: "AIzaSyDLOW4voY8C_v-ClaqbtnwnT0O3rmqv1-c",
  authDomain: "fir-denormalizer.firebaseapp.com",
  databaseURL: "https://fir-denormalizer.firebaseio.com",
  projectId: "fir-denormalizer",
  storageBucket: "fir-denormalizer.appspot.com",
  messagingSenderId: "949167701661"
};
_firebase2.default.initializeApp(config);

/*
* firebase.ref()
* */

const modelDenormalizer = (0, _index2.default)(_firebase2.default.database());
const dogs = modelDenormalizer('dogs');

describe.skip('getPathString', () => {
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

describe.skip('getKey', () => {
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

describe.skip('getDenormalizedCollectionName', () => {
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

  it.skip('should push, and remove', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = await dogs.push(aDog);
    const id2 = await dogs.push(aDog);
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();

    expect((await dogs.getById(id1))).toEqual(aDog);
    expect((await dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(true);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(true);

    expect((await dogs.getById(id2))).toEqual(aDog);
    expect((await dogs.get(['dogTypes', 'wolfdog', id2]))).toBe(true);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id2]))).toBe(true);

    await dogs.removeById(id1);
    expect((await dogs.getById(id1))).toBe(null);
    expect((await dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(null);
    expect((await dogs.getById(id2))).toEqual(aDog);
    expect((await dogs.get(['dogTypes', 'wolfdog', id2]))).toBe(true);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id2]))).toBe(true);

    await dogs.removeById(id2);
    expect((await dogs.getById(id1))).toBe(null);
    expect((await dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(null);
    expect((await dogs.getById(id2))).toEqual(null);
    expect((await dogs.get(['dogTypes', 'wolfdog', id2]))).toBe(null);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id2]))).toBe(null);
  });

  it.skip('should push and update', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = await dogs.push(aDog);
    const id2 = await dogs.push(aDog);

    await dogs.updateById(id1, { name: 'newName' });
    expect((await dogs.getById(id1))).toEqual(Object.assign({}, aDog, { name: 'newName' }));
    expect((await dogs.getById(id2))).toEqual(aDog);

    await dogs.updateById(id1, { type: 'pumi' });
    expect((await dogs.getById(id1))).toEqual(Object.assign({}, aDog, { name: 'newName', type: 'pumi' }));
    expect((await dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((await dogs.get(['dogTypes', 'pumi', id1]))).toBe(true);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(true);

    await dogs.updateById(id1, { type: 'wolfdog' });
    expect((await dogs.getById(id1))).toEqual(Object.assign({}, aDog, { name: 'newName', type: 'wolfdog' }));
    expect((await dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(true);
    expect((await dogs.get(['dogTypes', 'pumi', id1]))).toBe(null);
    expect((await dogs.get(['dogKennels', 'john\'sKennel', id1]))).toBe(true);

    expect((await dogs.getById(id2))).toEqual(aDog);
  });

  it.skip('should push and set', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = await dogs.push(aDog);
    const id2 = await dogs.push(aDog);

    await dogs.setById(id1, { name: 'new name' });
    expect((await dogs.getById(id1))).toEqual({ name: 'new name' });
    expect((await dogs.getById(id2))).toEqual(aDog);

    await dogs.setById(id1, { name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });
    expect((await dogs.getById(id1))).toEqual({ name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });
    expect((await dogs.get(['dogTypes', 'wolfdog', id1]))).toBe(null);
    expect((await dogs.get(['dogTypes', 'pumi', id1]))).toBe(true);

    expect((await dogs.getById(id2))).toEqual(aDog);
  });

  it('should find by properties', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    await dogs.push({ name: 'Petee', type: 'wolfdog', kennel: "John's kennel" });
    await dogs.push({ name: 'Lolly', type: 'wolfdog', kennel: "John's kennel" });
    await dogs.push({ type: 'pumi', kennel: "John's kennel" });
    await dogs.push({ type: 'pumi', kennel: "Barbara's kennel" });
    await dogs.push({ type: 'puli', kennel: "Barbara's kennel" });

    expect((await dogs.find({
      name: 'Petee'
    }))).toHaveLength(1);

    expect((await dogs.find({
      name: 'Petee',
      kennel: 'John\'s kennel'
    }))).toHaveLength(1);

    expect((await dogs.find({
      kennel: 'John\'s kennel'
    }))).toHaveLength(3);

    expect((await dogs.find({
      type: 'wolfdog',
      kennel: 'John\'s kennel'
    }))).toHaveLength(2);

    expect((await dogs.find({
      type: 'pumi',
      kennel: 'John\'s kennel'
    }))).toHaveLength(1);

    expect((await dogs.find({
      type: 'puli',
      kennel: 'John\'s kennel'
    }))).toHaveLength(0);
  });
});
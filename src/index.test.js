jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

import {
  default as FirebaseDenormalizer,
  getPathString,
  getPathArray,
  getDenormalizedCollectionName,
  getKey
} from './index';

import config from 'config';
import firebase from 'firebase';

firebase.initializeApp(config.get('firebase'));

/*
* firebase.ref()
* */

const modelDenormalizer = FirebaseDenormalizer(firebase.database());
const dogs = modelDenormalizer('dogs');

describe('getPathString', () => {
  it('should work with one string parameter', () => {
    expect(getPathString()).toBe('');
    expect(getPathString('/')).toBe('');
    expect(getPathString('dogs')).toBe('dogs');
    expect(getPathString('/dogs')).toBe('dogs');
    expect(getPathString('/dogs/kennels')).toBe('dogs/kennels');
    expect(getPathString('dogs/kennels')).toBe('dogs/kennels');
  });

  it('should work with multiple string parameter', () => {
    expect(getPathString('dogs', 'kennels')).toBe('dogs/kennels');
    expect(getPathString('dogs', '/kennels')).toBe('dogs/kennels');
    expect(getPathString('dogs', '/kennels/')).toBe('dogs/kennels');
    expect(getPathString('dogs', '/kennels/')).toBe('dogs/kennels');
    expect(getPathString('dogs', '/kennels/', '', 'wolfdog')).toBe('dogs/kennels/wolfdog');
  });

  it('should work with multiple array', () => {
    expect(getPathString([''], ['kennels'])).toBe('kennels');
    expect(getPathString(['dogs'], ['kennels'])).toBe('dogs/kennels');
    expect(getPathString(['dogs'], [''])).toBe('dogs');
    expect(getPathString(['dogs'], ['kennels', 'wolfdog'], ['othertype'])).toBe('dogs/kennels/wolfdog/othertype');
  });

  it('should work with combined array and contated string parameters', () => {
    expect(getPathString('dogs/kennels', ['wolfdog'])).toBe('dogs/kennels/wolfdog');
  });

});

describe('getKey', () => {
  it('should encode keys', () => {
    expect(getKey('')).toBe('');
    expect(getKey('key')).toBe('key');
    expect(getKey('John Doe')).toBe('johnDoe');
    expect(getKey('John--Doe')).toBe('johnDoe');
    expect(getKey('John/Doe/')).toBe('john!2FDoe!2F');
    expect(getKey('John.Doe.')).toBe('johnDoe');
    expect(getKey('John\'s kennel')).toBe('john\'sKennel');
  });
});

describe('getDenormalizedCollectionName', () => {
  it('should encode keys', () => {
    expect(getDenormalizedCollectionName('', '')).toBe('');
    expect(getDenormalizedCollectionName('john', 'doe')).toBe('johnDoes');
    expect(getDenormalizedCollectionName('john doe', 'john doe')).toBe('johnDoeJohnDoes');
  });
});

describe('denormalizer', () => {

  beforeEach(() => {
    firebase.database().ref().remove();
  });

  it('should push, and remove', async () => {
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

    expect(await dogs.getById(id1)).toEqual(aDog);
    expect(await dogs.get(['dogTypes', 'wolfdog', id1])).toBe(true);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id1])).toBe(true);

    expect(await dogs.getById(id2)).toEqual(aDog);
    expect(await dogs.get(['dogTypes', 'wolfdog', id2])).toBe(true);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id2])).toBe(true);

    await dogs.removeById(id1);
    expect(await dogs.getById(id1)).toBe(null);
    expect(await dogs.get(['dogTypes', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id1])).toBe(null);
    expect(await dogs.getById(id2)).toEqual(aDog);
    expect(await dogs.get(['dogTypes', 'wolfdog', id2])).toBe(true);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id2])).toBe(true);

    await dogs.removeById(id2);
    expect(await dogs.getById(id1)).toBe(null);
    expect(await dogs.get(['dogTypes', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id1])).toBe(null);
    expect(await dogs.getById(id2)).toEqual(null);
    expect(await dogs.get(['dogTypes', 'wolfdog', id2])).toBe(null);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id2])).toBe(null);
  });

  it('should push and update', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = await dogs.push(aDog);
    const id2 = await dogs.push(aDog);

    await dogs.updateById(id1, { name: 'newName' });
    expect(await dogs.getById(id1)).toEqual({...aDog, name: 'newName'});
    expect(await dogs.getById(id2)).toEqual(aDog);

    await dogs.updateById(id1, { type: 'pumi' });
    expect(await dogs.getById(id1)).toEqual({...aDog, name: 'newName', type: 'pumi'});
    expect(await dogs.get(['dogTypes', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['dogTypes', 'pumi', id1])).toBe(true);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id1])).toBe(true);

    await dogs.updateById(id1, { type: 'wolfdog' });
    expect(await dogs.getById(id1)).toEqual({...aDog, name: 'newName', type: 'wolfdog'});
    expect(await dogs.get(['dogTypes', 'wolfdog', id1])).toBe(true);
    expect(await dogs.get(['dogTypes', 'pumi', id1])).toBe(null);
    expect(await dogs.get(['dogKennels', 'john\'sKennel', id1])).toBe(true);

    expect(await dogs.getById(id2)).toEqual(aDog);
  });

  it('should push and set', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = await dogs.push(aDog);
    const id2 = await dogs.push(aDog);

    await dogs.setById(id1, { name: 'new name' });
    expect(await dogs.getById(id1)).toEqual({ name: 'new name' });
    expect(await dogs.getById(id2)).toEqual(aDog);

    await dogs.setById(id1, { name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });
    expect(await dogs.getById(id1)).toEqual({name: 'new name', type: 'pumi', kennel: 'Barbara\'s kennel' });
    expect(await dogs.get(['dogTypes', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['dogTypes', 'pumi', id1])).toBe(true);

    expect(await dogs.getById(id2)).toEqual(aDog);
  });

  describe('findValue', () => {

    it('should find by properties', async () => {
      dogs.filterableProperty('type');
      dogs.filterableProperty('kennel');

      await dogs.push({ name: 'Petee', type: 'wolfdog', kennel: "John's kennel"});
      await dogs.push({ name: 'Lolly', type: 'wolfdog', kennel: "John's kennel"});
      await dogs.push({ type: 'pumi', kennel: "John's kennel"});
      await dogs.push({ type: 'pumi', kennel: "Barbara's kennel"});
      await dogs.push({ type: 'puli', kennel: "Barbara's kennel"});

      expect(await dogs.findValue({
        name: 'Petee'
      })).toHaveLength(1);

      expect(await dogs.findValue({
        name: 'Petee',
        kennel: 'John\'s kennel'
      })).toHaveLength(1);

      expect(await dogs.findValue({
        kennel: 'John\'s kennel'
      })).toHaveLength(3);

      expect(await dogs.findValue({
        type: 'wolfdog',
        kennel: 'John\'s kennel'
      })).toHaveLength(2);

      expect(await dogs.findValue({
        type: 'pumi',
        kennel: 'John\'s kennel'
      })).toHaveLength(1);

      expect(await dogs.findValue({
        type: 'puli',
        kennel: 'John\'s kennel'
      })).toHaveLength(0);

    });

  });

  describe('find', () => {

    beforeEach(async () => {
      dogs.filterableProperty('type');
      dogs.filterableProperty('kennel');

      await dogs.push({ name: 'Petee', type: 'wolfdog', kennel: "John's kennel"});
      await dogs.push({ name: 'Lolly', type: 'wolfdog', kennel: "John's kennel"});
      await dogs.push({ type: 'pumi', kennel: "John's kennel"});
      await dogs.push({ type: 'pumi', kennel: "Barbara's kennel"});
      await dogs.push({ type: 'puli', kennel: "Barbara's kennel"});
    });

    it('should find by properties', async () => {

      const result = dogs.find({
        type: 'wolfdog'
      });

      result.once('value', snapshot => {
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

    });

  });



});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

import dotenv from 'dotenv';
dotenv.config();

import {
  default as FirebaseDenormalizer,
  getPathString,
  getDenormalizedCollectionName,
  getKey
} from './index';

import firebase from 'firebase';
firebase.initializeApp(JSON.parse(process.env.FIREBASE));

/*
* firebase.ref()
* */

const modelDenormalizer = FirebaseDenormalizer(firebase.database());
const dogs = modelDenormalizer('Dogs');

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
    expect(getKey('john Doe')).toBe('john Doe');
    expect(getKey('John Doe')).toBe('John Doe');
    expect(getKey('John--Doe')).toBe('John--Doe');
    expect(getKey('John/Doe/')).toBe('John%2FDoe%2F');
    expect(getKey('John.Doe.')).toBe('John%2EDoe%2E');
    expect(getKey('John\'s kennel')).toBe('John\'s kennel');
  });
});

describe('getDenormalizedCollectionName', () => {
  it('should encode keys', () => {
    expect(() => getDenormalizedCollectionName('', '')).toThrow();
    expect(getDenormalizedCollectionName('johns', 'doe')).toBe('john-does');
    expect(getDenormalizedCollectionName('John', 'doe')).toBe('John-does');
    expect(getDenormalizedCollectionName('john does', 'john doe')).toBe('john doe-john does');
    expect(getDenormalizedCollectionName('John Doe', 'John Doe')).toBe('John Doe-John Does');
  });
});

describe('denormalizer', () => {

  beforeEach(() => {
    firebase.database().ref().remove();
  });

  it('should push, and remove', async () => {
    dogs.filterableProperty('type');
    dogs.filterableProperty('kennel');
    dogs.filterableProperty('Type');
    dogs.filterableProperty('Kennel');

    const aDog = {
      type: 'wolfdog',
      kennel: "John's kennel"
    };

    const id1 = await dogs.push(aDog);
    const id2 = await dogs.push(aDog);
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();

    expect(await dogs.getById(id1)).toEqual(aDog);
    expect(await dogs.get(['Dog-types', 'wolfdog', id1])).toBe(true);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id1])).toBe(true);
    expect(await dogs.get(['Dog-Types', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['Dog-Kennels', 'John\'s kennel', id1])).toBe(null);

    expect(await dogs.getById(id2)).toEqual(aDog);
    expect(await dogs.get(['Dog-types', 'wolfdog', id2])).toBe(true);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id2])).toBe(true);

    await dogs.removeById(id1);
    expect(await dogs.getById(id1)).toBe(null);
    expect(await dogs.get(['Dog-types', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id1])).toBe(null);

    expect(await dogs.getById(id2)).toEqual(aDog);
    expect(await dogs.get(['Dog-types', 'wolfdog', id2])).toBe(true);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id2])).toBe(true);

    await dogs.removeById(id2);
    expect(await dogs.getById(id1)).toBe(null);
    expect(await dogs.get(['Dog-types', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id1])).toBe(null);

    expect(await dogs.getById(id2)).toEqual(null);
    expect(await dogs.get(['Dog-types', 'wolfdog', id2])).toBe(null);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id2])).toBe(null);
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
    expect(await dogs.get(['Dog-types', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['Dog-types', 'pumi', id1])).toBe(true);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id1])).toBe(true);

    await dogs.updateById(id1, { type: 'wolfdog' });
    expect(await dogs.getById(id1)).toEqual({...aDog, name: 'newName', type: 'wolfdog'});
    expect(await dogs.get(['Dog-types', 'wolfdog', id1])).toBe(true);
    expect(await dogs.get(['Dog-types', 'pumi', id1])).toBe(null);
    expect(await dogs.get(['Dog-kennels', 'John\'s kennel', id1])).toBe(true);

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
    expect(await dogs.get(['Dog-types', 'wolfdog', id1])).toBe(null);
    expect(await dogs.get(['Dog-types', 'pumi', id1])).toBe(true);

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
      dogs.filterableProperty('Kennel');

      await dogs.push({ name: 'Petee', type: 'wolfdog', Kennel: "John's kennel"});
      await dogs.push({ name: 'Lolly', type: 'wolfdog', Kennel: "John's kennel"});
      await dogs.push({ type: 'pumi', Kennel: "John's kennel"});
      await dogs.push({ type: 'pumi', Kennel: "Barbara's kennel"});
      await dogs.push({ type: 'puli', Kennel: "Barbara's kennel"});
    });

    it('should find by properties', async () => {

      expect(await dogs.findValue({
        type: 'pumi'
      })).toHaveLength(2);

      expect(await dogs.findValue({
        name: 'Petee',
        Kennel: 'John\'s kennel'
      })).toHaveLength(1);

      expect(await dogs.findValue({
        Kennel: 'John\'s kennel'
      })).toHaveLength(3);

      expect(await dogs.findValue({
        type: 'wolfdog',
        Kennel: 'John\'s kennel'
      })).toHaveLength(2);

      expect(await dogs.findValue({
        type: 'pumi',
        Kennel: 'John\'s kennel'
      })).toHaveLength(1);

      expect(await dogs.findValue({
        type: 'puli',
        Kennel: 'John\'s kennel'
      })).toHaveLength(0);

    });

  });



});

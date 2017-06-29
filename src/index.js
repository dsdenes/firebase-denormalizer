//@flow
import flattenDeep from 'lodash.flattendeep';
import compact from 'lodash.compact';
import omit from 'lodash.omit';
import mergeWith from 'lodash.mergewith';
import intersection from 'lodash.intersection';
import pick from 'lodash.pick';
import pluralize from 'pluralize';
import EventEmitter from 'events';
import {
  encode as firebaseKeyEncode,
  decode as firebaseKeyDecode
} from 'firebase-key';
import camelcase from 'lodash.camelcase';

export default function firebaseDenormalizer(firebase) {

  return function modelDenormalizer(modelName) {
    let filterables = {};

    return Object.freeze({
      filterableProperty,
      nonFilterableProperty,
      get,
      getById,
      push,
      update,
      updateById,
      set,
      setById,
      remove,
      removeById,
      find,
      findValue
    });

    function filterableProperty(propName) {
      filterables[propName] = true;
    }

    async function nonFilterableProperty(propName) {
      filterables = omit(filterables, propName);
      return firebase.ref(getDenormalizedCollectionName(modelName, propName))
        .remove();
    }

    async function push(payload) {
      const pushedId = firebase.ref(getPathString(modelName))
        .push(payload).key;
      await actionOnFilterables(modelName, payload, (joinCollectionName, filterableKey, filterableValue) => {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pushedId))
          .set(true);
      });
      return pushedId;
    }

    function pushTo(path, payload) {
      return firebase.ref(getPathString(path))
        .push(payload).key;
    }

    async function setById(id, payload) {
      return set([modelName, id], payload);
    }

    async function set(path, payload) {
      await remove(path);
      const pathRef = firebase.ref(getPathString(path));
      await pathRef.set(payload);
      await actionOnFilterables(modelName, payload, (joinCollectionName, filterableKey, filterableValue) => {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key))
          .set(true);
      });
      return payload;
    }

    async function updateById(id, payload) {
      return update([modelName, id], payload);
    }

    async function update(path, payload) {
      const pathObject = await get(path);
      const pathRef = firebase.ref(getPathString(path));
      await pathRef.update(payload);
      await actionOnFilterables(modelName, payload, (joinCollectionName, filterableKey, filterableValue) => {
        if (pathObject.hasOwnProperty(filterableKey) &&
          pathObject[filterableKey] != filterableValue) {
          return Promise.all([
            firebase.ref(getPathString(joinCollectionName, pathObject[filterableKey], pathRef.key))
              .remove(),
            firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key))
              .set(true)
          ]);
        }
      });
      return payload;
    }

    async function removeById(id) {
      return remove([modelName, id]);
    }

    async function remove(path) {
      const pathObject = await get(path);
      const pathRef = firebase.ref(getPathString(path));
      await pathRef.remove();
      return actionOnFilterables(modelName, pathObject, (joinCollectionName, filterableKey, filterableValue) => {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key))
          .remove();
      });
    }

    async function getById(id) {
      return get([modelName, id]);
    }

    async function get(path) {
      const snapshot = await firebase.ref(getPathString(path))
        .once('value');
      return snapshot.val();
    }

    function find(payload) {
      const resultEventEmitter = new EventEmitter();
      const findActions = [];
      for (let filterKey in payload) {
        const filterValue = payload[filterKey];
        if (filterables.hasOwnProperty(filterKey)) {
          findActions.push(filterByDenormalizedProperty(modelName, filterKey, filterValue));
        } else {
          findActions.push(filterByNonDenormalizedProperty(modelName, filterKey, filterValue));
        }
      }

      Promise.all(findActions)
        .then(compact)
        .then(getFiltersIntersection)
        .then(completeResultObjects)
        .then(result => onValue(resultEventEmitter, result));

      return resultEventEmitter;
    }

    function findValue(payload) {
      const resultEvents = find(payload);
      return new Promise(resolve => {
        resultEvents.once('value', snapshot => resolve(snapshot.val()));
      });
    }

    async function onValue(resultEventEmitter, result) {
      resultEventEmitter.emit('value', resultToSnapshot(result));
    }

    function resultToSnapshot(result) {
      return {
        key: modelName,
        val: () => result
      }
    }

    async function filterByDenormalizedProperty(modelName, filterKey, filterValue) {
      const denormalizedCollectionName = getDenormalizedCollectionName(modelName, filterKey);
      const path = getPathString(denormalizedCollectionName, getKey(filterValue));
      const snapshot = await firebase.ref(path).once('value');
      return snapshot.val();
    }

    async function filterByNonDenormalizedProperty(modelName, filterKey, filterValue) {
      const path = getPathString(modelName);
      const snapshot = await firebase.ref(path).orderByChild(filterKey).equalTo(filterValue).once('value');
      return snapshot.val();
    }

    function getFiltersIntersection(filterResults: Array<object>) {
      const mergedFilterResults = filterResults.reduce((acc, val) => mergeWith(acc, val, fullObjectPriority), {});
      const ids = filterResults.map(filterResult => Object.keys(filterResult));
      const intersectionIds = intersection.apply(null, ids);
      return pick(mergedFilterResults, intersectionIds);
    }

    function completeResultObjects(results: {}) {
      return Promise.all(Object.keys(results).map(resultKey => completeResultObject(results, resultKey)));
    }

    function completeResultObject(results: {}, resultKey: string) {
      const resultObject = results[resultKey];
      if (isCompleteResultObject(resultObject)) {
        return resultObject;
      } else {
        return getById(resultKey);
      }
    }

    function isCompleteResultObject(resultObject) {
      return typeof resultObject === 'object';
    }

    async function actionOnFilterables(modelName, payload, action) {
      const actions = [];
      for (let filterableKey in payload) {
        if (filterables.hasOwnProperty(filterableKey)) {
          const filterableValue = payload[filterableKey];
          const joinCollectionName = getDenormalizedCollectionName(modelName, filterableKey);
          actions.push(action(joinCollectionName, filterableKey, filterableValue));
        }
      }
      return Promise.all(actions);
    }
  }
}

export function fullObjectPriority(objValue, srcValue) {
  if (typeof objValue === 'object' || typeof srcValue === 'object') {
    return (typeof objValue === 'object') ?
      Object.assign({}, objValue, srcValue) :
      Object.assign({}, srcValue, objValue);
  } else {
    return srcValue;
  }
}

export function getKey(name) {
  return firebaseKeyEncode(camelcase(name));
}

export function getDenormalizedCollectionName(modelName, joinModel) {
  return getKey(`${pluralize.singular(modelName)} ${pluralize.plural(joinModel)}`);
}

export function getPathArray(...paths) {
  return getPathString(...paths).split('/');
}

export function getPathString(...paths) {
  paths = compact(flattenDeep(paths));
  return `${compact(flattenDeep(paths.map(path => path.split('/')))).join('/')}`
    .replace(/\/$/, '');
}

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = firebaseDenormalizer;
exports.fullObjectPriority = fullObjectPriority;
exports.getKey = getKey;
exports.getDenormalizedCollectionName = getDenormalizedCollectionName;
exports.getPathArray = getPathArray;
exports.getPathString = getPathString;

var _lodash = require('lodash.flattendeep');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.compact');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.omit');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.mergewith');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lodash9 = require('lodash.intersection');

var _lodash10 = _interopRequireDefault(_lodash9);

var _lodash11 = require('lodash.pick');

var _lodash12 = _interopRequireDefault(_lodash11);

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _firebaseKey = require('firebase-key');

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function firebaseDenormalizer(firebase) {

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
      find
    });

    function filterableProperty(propName) {
      filterables[propName] = true;
    }

    async function nonFilterableProperty(propName) {
      filterables = (0, _lodash6.default)(filterables, propName);
      return firebase.ref(getDenormalizedCollectionName(modelName, propName)).remove();
    }

    async function push(payload) {
      const pushedId = firebase.ref(getPathString(modelName)).push(payload).key;
      await actionOnFilterables(modelName, payload, (joinCollectionName, filterableKey, filterableValue) => {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pushedId)).set(true);
      });
      return pushedId;
    }

    function pushTo(path, payload) {
      return firebase.ref(getPathString(path)).push(payload).key;
    }

    async function setById(id, payload) {
      return set([modelName, id], payload);
    }

    async function set(path, payload) {
      await remove(path);
      const pathRef = firebase.ref(getPathString(path));
      await pathRef.set(payload);
      await actionOnFilterables(modelName, payload, (joinCollectionName, filterableKey, filterableValue) => {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true);
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
        if (pathObject.hasOwnProperty(filterableKey) && pathObject[filterableKey] != filterableValue) {
          return Promise.all([firebase.ref(getPathString(joinCollectionName, pathObject[filterableKey], pathRef.key)).remove(), firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true)]);
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
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).remove();
      });
    }

    async function getById(id) {
      return get([modelName, id]);
    }

    async function get(path) {
      const snapshot = await firebase.ref(getPathString(path)).once('value');
      return snapshot.val();
    }

    async function find(payload) {
      const findActions = [];
      for (let filterKey in payload) {
        const filterValue = payload[filterKey];
        if (filterables.hasOwnProperty(filterKey)) {
          findActions.push(filterByDenormalizedProperty(modelName, filterKey, filterValue));
        } else {
          findActions.push(filterByNonDenormalizedProperty(modelName, filterKey, filterValue));
        }
      }
      const resultsIntersect = getFiltersIntersection((await Promise.all(findActions)));
      const completeResults = await completeResultObjects(resultsIntersect);
      return completeResults;
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

    function getFiltersIntersection(filterResults) {
      const mergedFilterResults = filterResults.reduce((acc, val) => (0, _lodash8.default)(acc, val, fullObjectPriority), {});
      const ids = filterResults.map(filterResult => Object.keys(filterResult));
      const intersectionIds = _lodash10.default.apply(null, ids);
      return (0, _lodash12.default)(mergedFilterResults, intersectionIds);
    }

    function completeResultObjects(results) {
      return Promise.all(Object.keys(results).map(resultKey => completeResultObject(results, resultKey)));
    }

    function completeResultObject(results, resultKey) {
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
  };
}
function fullObjectPriority(objValue, srcValue) {
  if (typeof objValue === 'object' || typeof srcValue === 'object') {
    return typeof objValue === 'object' ? Object.assign({}, objValue, srcValue) : Object.assign({}, srcValue, objValue);
  } else {
    return srcValue;
  }
}

function getKey(name) {
  return (0, _firebaseKey.encode)((0, _camelcase2.default)(name));
}

function getDenormalizedCollectionName(modelName, joinModel) {
  return getKey(`${_pluralize2.default.singular(modelName)} ${_pluralize2.default.plural(joinModel)}`);
}

function getPathArray(...paths) {
  return getPathString(...paths).split('/');
}

function getPathString(...paths) {
  paths = (0, _lodash4.default)((0, _lodash2.default)(paths));
  return `${(0, _lodash4.default)((0, _lodash2.default)(paths.map(path => path.split('/')))).join('/')}`.replace(/\/$/, '');
}
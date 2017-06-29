'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _firebaseKey = require('firebase-key');

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function firebaseDenormalizer(firebase) {

  return function modelDenormalizer(modelName) {
    var filterables = {};

    return Object.freeze({
      filterableProperty: filterableProperty,
      nonFilterableProperty: nonFilterableProperty,
      get: get,
      getById: getById,
      push: push,
      update: update,
      updateById: updateById,
      set: set,
      setById: setById,
      remove: remove,
      removeById: removeById,
      find: find,
      findValue: findValue
    });

    function filterableProperty(propName) {
      filterables[propName] = true;
    }

    async function nonFilterableProperty(propName) {
      filterables = (0, _lodash6.default)(filterables, propName);
      return firebase.ref(getDenormalizedCollectionName(modelName, propName)).remove();
    }

    async function push(payload) {
      var pushedId = firebase.ref(getPathString(modelName)).push(payload).key;
      await actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
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
      var pathRef = firebase.ref(getPathString(path));
      await pathRef.set(payload);
      await actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true);
      });
      return payload;
    }

    async function updateById(id, payload) {
      return update([modelName, id], payload);
    }

    async function update(path, payload) {
      var pathObject = await get(path);
      var pathRef = firebase.ref(getPathString(path));
      await pathRef.update(payload);
      await actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
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
      var pathObject = await get(path);
      var pathRef = firebase.ref(getPathString(path));
      await pathRef.remove();
      return actionOnFilterables(modelName, pathObject, function (joinCollectionName, filterableKey, filterableValue) {
        return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).remove();
      });
    }

    async function getById(id) {
      return get([modelName, id]);
    }

    async function get(path) {
      var snapshot = await firebase.ref(getPathString(path)).once('value');
      return snapshot.val();
    }

    function find(payload) {
      var resultEventEmitter = new _events2.default();
      var findActions = [];
      for (var filterKey in payload) {
        var filterValue = payload[filterKey];
        if (filterables.hasOwnProperty(filterKey)) {
          findActions.push(filterByDenormalizedProperty(modelName, filterKey, filterValue));
        } else {
          findActions.push(filterByNonDenormalizedProperty(modelName, filterKey, filterValue));
        }
      }

      Promise.all(findActions).then(_lodash4.default).then(getFiltersIntersection).then(completeResultObjects).then(function (result) {
        return onValue(resultEventEmitter, result);
      });

      return resultEventEmitter;
    }

    function findValue(payload) {
      var resultEvents = find(payload);
      return new Promise(function (resolve) {
        resultEvents.once('value', function (snapshot) {
          return resolve(snapshot.val());
        });
      });
    }

    async function onValue(resultEventEmitter, result) {
      resultEventEmitter.emit('value', resultToSnapshot(result));
    }

    function resultToSnapshot(result) {
      return {
        key: modelName,
        val: function val() {
          return result;
        }
      };
    }

    async function filterByDenormalizedProperty(modelName, filterKey, filterValue) {
      var denormalizedCollectionName = getDenormalizedCollectionName(modelName, filterKey);
      var path = getPathString(denormalizedCollectionName, getKey(filterValue));
      var snapshot = await firebase.ref(path).once('value');
      return snapshot.val();
    }

    async function filterByNonDenormalizedProperty(modelName, filterKey, filterValue) {
      var path = getPathString(modelName);
      var snapshot = await firebase.ref(path).orderByChild(filterKey).equalTo(filterValue).once('value');
      return snapshot.val();
    }

    function getFiltersIntersection(filterResults) {
      var mergedFilterResults = filterResults.reduce(function (acc, val) {
        return (0, _lodash8.default)(acc, val, fullObjectPriority);
      }, {});
      var ids = filterResults.map(function (filterResult) {
        return Object.keys(filterResult);
      });
      var intersectionIds = _lodash10.default.apply(null, ids);
      return (0, _lodash12.default)(mergedFilterResults, intersectionIds);
    }

    function completeResultObjects(results) {
      return Promise.all(Object.keys(results).map(function (resultKey) {
        return completeResultObject(results, resultKey);
      }));
    }

    function completeResultObject(results, resultKey) {
      var resultObject = results[resultKey];
      if (isCompleteResultObject(resultObject)) {
        return resultObject;
      } else {
        return getById(resultKey);
      }
    }

    function isCompleteResultObject(resultObject) {
      return (typeof resultObject === 'undefined' ? 'undefined' : _typeof(resultObject)) === 'object';
    }

    async function actionOnFilterables(modelName, payload, action) {
      var actions = [];
      for (var filterableKey in payload) {
        if (filterables.hasOwnProperty(filterableKey)) {
          var filterableValue = payload[filterableKey];
          var joinCollectionName = getDenormalizedCollectionName(modelName, filterableKey);
          actions.push(action(joinCollectionName, filterableKey, filterableValue));
        }
      }
      return Promise.all(actions);
    }
  };
}

function fullObjectPriority(objValue, srcValue) {
  if ((typeof objValue === 'undefined' ? 'undefined' : _typeof(objValue)) === 'object' || (typeof srcValue === 'undefined' ? 'undefined' : _typeof(srcValue)) === 'object') {
    return (typeof objValue === 'undefined' ? 'undefined' : _typeof(objValue)) === 'object' ? Object.assign({}, objValue, srcValue) : Object.assign({}, srcValue, objValue);
  } else {
    return srcValue;
  }
}

function getKey(name) {
  return (0, _firebaseKey.encode)((0, _camelcase2.default)(name));
}

function getDenormalizedCollectionName(modelName, joinModel) {
  return getKey(_pluralize2.default.singular(modelName) + ' ' + _pluralize2.default.plural(joinModel));
}

function getPathArray() {
  return getPathString.apply(undefined, arguments).split('/');
}

function getPathString() {
  for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
    paths[_key] = arguments[_key];
  }

  paths = (0, _lodash4.default)((0, _lodash2.default)(paths));
  return ('' + (0, _lodash4.default)((0, _lodash2.default)(paths.map(function (path) {
    return path.split('/');
  }))).join('/')).replace(/\/$/, '');
}
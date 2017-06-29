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

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _firebaseKey = require('firebase-key');

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function firebaseDenormalizer(firebase) {

  return function modelDenormalizer(modelName) {
    let nonFilterableProperty = (() => {
      var _ref = _asyncToGenerator(function* (propName) {
        filterables = (0, _lodash6.default)(filterables, propName);
        return firebase.ref(getDenormalizedCollectionName(modelName, propName)).remove();
      });

      return function nonFilterableProperty(_x) {
        return _ref.apply(this, arguments);
      };
    })();

    let push = (() => {
      var _ref2 = _asyncToGenerator(function* (payload) {
        const pushedId = firebase.ref(getPathString(modelName)).push(payload).key;
        yield actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
          return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pushedId)).set(true);
        });
        return pushedId;
      });

      return function push(_x2) {
        return _ref2.apply(this, arguments);
      };
    })();

    let setById = (() => {
      var _ref3 = _asyncToGenerator(function* (id, payload) {
        return set([modelName, id], payload);
      });

      return function setById(_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    })();

    let set = (() => {
      var _ref4 = _asyncToGenerator(function* (path, payload) {
        yield remove(path);
        const pathRef = firebase.ref(getPathString(path));
        yield pathRef.set(payload);
        yield actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
          return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true);
        });
        return payload;
      });

      return function set(_x5, _x6) {
        return _ref4.apply(this, arguments);
      };
    })();

    let updateById = (() => {
      var _ref5 = _asyncToGenerator(function* (id, payload) {
        return update([modelName, id], payload);
      });

      return function updateById(_x7, _x8) {
        return _ref5.apply(this, arguments);
      };
    })();

    let update = (() => {
      var _ref6 = _asyncToGenerator(function* (path, payload) {
        const pathObject = yield get(path);
        const pathRef = firebase.ref(getPathString(path));
        yield pathRef.update(payload);
        yield actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
          if (pathObject.hasOwnProperty(filterableKey) && pathObject[filterableKey] != filterableValue) {
            return Promise.all([firebase.ref(getPathString(joinCollectionName, pathObject[filterableKey], pathRef.key)).remove(), firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true)]);
          }
        });
        return payload;
      });

      return function update(_x9, _x10) {
        return _ref6.apply(this, arguments);
      };
    })();

    let removeById = (() => {
      var _ref7 = _asyncToGenerator(function* (id) {
        return remove([modelName, id]);
      });

      return function removeById(_x11) {
        return _ref7.apply(this, arguments);
      };
    })();

    let remove = (() => {
      var _ref8 = _asyncToGenerator(function* (path) {
        const pathObject = yield get(path);
        const pathRef = firebase.ref(getPathString(path));
        yield pathRef.remove();
        return actionOnFilterables(modelName, pathObject, function (joinCollectionName, filterableKey, filterableValue) {
          return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).remove();
        });
      });

      return function remove(_x12) {
        return _ref8.apply(this, arguments);
      };
    })();

    let getById = (() => {
      var _ref9 = _asyncToGenerator(function* (id) {
        return get([modelName, id]);
      });

      return function getById(_x13) {
        return _ref9.apply(this, arguments);
      };
    })();

    let get = (() => {
      var _ref10 = _asyncToGenerator(function* (path) {
        const snapshot = yield firebase.ref(getPathString(path)).once('value');
        return snapshot.val();
      });

      return function get(_x14) {
        return _ref10.apply(this, arguments);
      };
    })();

    let onValue = (() => {
      var _ref11 = _asyncToGenerator(function* (resultEventEmitter, result) {
        resultEventEmitter.emit('value', resultToSnapshot(result));
      });

      return function onValue(_x15, _x16) {
        return _ref11.apply(this, arguments);
      };
    })();

    let filterByDenormalizedProperty = (() => {
      var _ref12 = _asyncToGenerator(function* (modelName, filterKey, filterValue) {
        const denormalizedCollectionName = getDenormalizedCollectionName(modelName, filterKey);
        const path = getPathString(denormalizedCollectionName, getKey(filterValue));
        const snapshot = yield firebase.ref(path).once('value');
        return snapshot.val();
      });

      return function filterByDenormalizedProperty(_x17, _x18, _x19) {
        return _ref12.apply(this, arguments);
      };
    })();

    let filterByNonDenormalizedProperty = (() => {
      var _ref13 = _asyncToGenerator(function* (modelName, filterKey, filterValue) {
        const path = getPathString(modelName);
        const snapshot = yield firebase.ref(path).orderByChild(filterKey).equalTo(filterValue).once('value');
        return snapshot.val();
      });

      return function filterByNonDenormalizedProperty(_x20, _x21, _x22) {
        return _ref13.apply(this, arguments);
      };
    })();

    let actionOnFilterables = (() => {
      var _ref14 = _asyncToGenerator(function* (modelName, payload, action) {
        const actions = [];
        for (let filterableKey in payload) {
          if (filterables.hasOwnProperty(filterableKey)) {
            const filterableValue = payload[filterableKey];
            const joinCollectionName = getDenormalizedCollectionName(modelName, filterableKey);
            actions.push(action(joinCollectionName, filterableKey, filterableValue));
          }
        }
        return Promise.all(actions);
      });

      return function actionOnFilterables(_x23, _x24, _x25) {
        return _ref14.apply(this, arguments);
      };
    })();

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

    function pushTo(path, payload) {
      return firebase.ref(getPathString(path)).push(payload).key;
    }

    function find(payload) {
      const resultEventEmitter = new _events2.default();
      const findActions = [];
      for (let filterKey in payload) {
        const filterValue = payload[filterKey];
        if (filterables.hasOwnProperty(filterKey)) {
          findActions.push(filterByDenormalizedProperty(modelName, filterKey, filterValue));
        } else {
          findActions.push(filterByNonDenormalizedProperty(modelName, filterKey, filterValue));
        }
      }

      Promise.all(findActions).then(_lodash4.default).then(getFiltersIntersection).then(completeResultObjects).then(result => onValue(resultEventEmitter, result));

      return resultEventEmitter;
    }

    function findValue(payload) {
      const resultEvents = find(payload);
      return new Promise(resolve => {
        resultEvents.once('value', snapshot => resolve(snapshot.val()));
      });
    }

    function resultToSnapshot(result) {
      return {
        key: modelName,
        val: () => result
      };
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
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

var _lodash13 = require('lodash.camelcase');

var _lodash14 = _interopRequireDefault(_lodash13);

var _regeneratorRuntime = require('regenerator-runtime');

var _regeneratorRuntime2 = _interopRequireDefault(_regeneratorRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function firebaseDenormalizer(firebase) {

  return function modelDenormalizer(modelName) {
    var nonFilterableProperty = function () {
      var _ref = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee(propName) {
        return _regeneratorRuntime2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                filterables = (0, _lodash6.default)(filterables, propName);
                return _context.abrupt('return', firebase.ref(getDenormalizedCollectionName(modelName, propName)).remove());

              case 2:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function nonFilterableProperty(_x) {
        return _ref.apply(this, arguments);
      };
    }();

    var push = function () {
      var _ref2 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee2(payload) {
        var pushedId;
        return _regeneratorRuntime2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                pushedId = firebase.ref(getPathString(modelName)).push(payload).key;
                _context2.next = 3;
                return actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
                  return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pushedId)).set(true);
                });

              case 3:
                return _context2.abrupt('return', pushedId);

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function push(_x2) {
        return _ref2.apply(this, arguments);
      };
    }();

    var setById = function () {
      var _ref3 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee3(id, payload) {
        return _regeneratorRuntime2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt('return', set([modelName, id], payload));

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function setById(_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    }();

    var set = function () {
      var _ref4 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee4(path, payload) {
        var pathRef;
        return _regeneratorRuntime2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return remove(path);

              case 2:
                pathRef = firebase.ref(getPathString(path));
                _context4.next = 5;
                return pathRef.set(payload);

              case 5:
                _context4.next = 7;
                return actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
                  return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true);
                });

              case 7:
                return _context4.abrupt('return', payload);

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function set(_x5, _x6) {
        return _ref4.apply(this, arguments);
      };
    }();

    var updateById = function () {
      var _ref5 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee5(id, payload) {
        return _regeneratorRuntime2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt('return', update([modelName, id], payload));

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function updateById(_x7, _x8) {
        return _ref5.apply(this, arguments);
      };
    }();

    var update = function () {
      var _ref6 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee6(path, payload) {
        var pathObject, pathRef;
        return _regeneratorRuntime2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return get(path);

              case 2:
                pathObject = _context6.sent;
                pathRef = firebase.ref(getPathString(path));
                _context6.next = 6;
                return pathRef.update(payload);

              case 6:
                _context6.next = 8;
                return actionOnFilterables(modelName, payload, function (joinCollectionName, filterableKey, filterableValue) {
                  if (pathObject.hasOwnProperty(filterableKey) && pathObject[filterableKey] != filterableValue) {
                    return Promise.all([firebase.ref(getPathString(joinCollectionName, pathObject[filterableKey], pathRef.key)).remove(), firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).set(true)]);
                  }
                });

              case 8:
                return _context6.abrupt('return', payload);

              case 9:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function update(_x9, _x10) {
        return _ref6.apply(this, arguments);
      };
    }();

    var removeById = function () {
      var _ref7 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee7(id) {
        return _regeneratorRuntime2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt('return', remove([modelName, id]));

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      return function removeById(_x11) {
        return _ref7.apply(this, arguments);
      };
    }();

    var remove = function () {
      var _ref8 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee8(path) {
        var pathObject, pathRef;
        return _regeneratorRuntime2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return get(path);

              case 2:
                pathObject = _context8.sent;
                pathRef = firebase.ref(getPathString(path));
                _context8.next = 6;
                return pathRef.remove();

              case 6:
                return _context8.abrupt('return', actionOnFilterables(modelName, pathObject, function (joinCollectionName, filterableKey, filterableValue) {
                  return firebase.ref(getPathString(joinCollectionName, getKey(filterableValue), pathRef.key)).remove();
                }));

              case 7:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      return function remove(_x12) {
        return _ref8.apply(this, arguments);
      };
    }();

    var getById = function () {
      var _ref9 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee9(id) {
        return _regeneratorRuntime2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt('return', get([modelName, id]));

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      return function getById(_x13) {
        return _ref9.apply(this, arguments);
      };
    }();

    var get = function () {
      var _ref10 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee10(path) {
        var snapshot;
        return _regeneratorRuntime2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return firebase.ref(getPathString(path)).once('value');

              case 2:
                snapshot = _context10.sent;
                return _context10.abrupt('return', snapshot.val());

              case 4:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      return function get(_x14) {
        return _ref10.apply(this, arguments);
      };
    }();

    var onValue = function () {
      var _ref11 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee11(resultEventEmitter, result) {
        return _regeneratorRuntime2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                resultEventEmitter.emit('value', resultToSnapshot(result));

              case 1:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      return function onValue(_x15, _x16) {
        return _ref11.apply(this, arguments);
      };
    }();

    var filterByDenormalizedProperty = function () {
      var _ref12 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee12(modelName, filterKey, filterValue) {
        var denormalizedCollectionName, path, snapshot;
        return _regeneratorRuntime2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                denormalizedCollectionName = getDenormalizedCollectionName(modelName, filterKey);
                path = getPathString(denormalizedCollectionName, getKey(filterValue));
                _context12.next = 4;
                return firebase.ref(path).once('value');

              case 4:
                snapshot = _context12.sent;
                return _context12.abrupt('return', snapshot.val());

              case 6:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      return function filterByDenormalizedProperty(_x17, _x18, _x19) {
        return _ref12.apply(this, arguments);
      };
    }();

    var filterByNonDenormalizedProperty = function () {
      var _ref13 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee13(modelName, filterKey, filterValue) {
        var path, snapshot;
        return _regeneratorRuntime2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                path = getPathString(modelName);
                _context13.next = 3;
                return firebase.ref(path).orderByChild(filterKey).equalTo(filterValue).once('value');

              case 3:
                snapshot = _context13.sent;
                return _context13.abrupt('return', snapshot.val());

              case 5:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      return function filterByNonDenormalizedProperty(_x20, _x21, _x22) {
        return _ref13.apply(this, arguments);
      };
    }();

    var actionOnFilterables = function () {
      var _ref14 = _asyncToGenerator(_regeneratorRuntime2.default.mark(function _callee14(modelName, payload, action) {
        var actions, filterableKey, filterableValue, joinCollectionName;
        return _regeneratorRuntime2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                actions = [];

                for (filterableKey in payload) {
                  if (filterables.hasOwnProperty(filterableKey)) {
                    filterableValue = payload[filterableKey];
                    joinCollectionName = getDenormalizedCollectionName(modelName, filterableKey);

                    actions.push(action(joinCollectionName, filterableKey, filterableValue));
                  }
                }
                return _context14.abrupt('return', Promise.all(actions));

              case 3:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      return function actionOnFilterables(_x23, _x24, _x25) {
        return _ref14.apply(this, arguments);
      };
    }();

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

    function pushTo(path, payload) {
      return firebase.ref(getPathString(path)).push(payload).key;
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

    function resultToSnapshot(result) {
      return {
        key: modelName,
        val: function val() {
          return result;
        }
      };
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
  return (0, _firebaseKey.encode)((0, _lodash14.default)(name));
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
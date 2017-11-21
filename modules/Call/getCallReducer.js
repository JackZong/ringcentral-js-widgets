'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.getCallStatusReducer = getCallStatusReducer;
exports.getToNumberReducer = getToNumberReducer;
exports.getToNumberEntitiesReducer = getToNumberEntitiesReducer;
exports.getLastCallNumberReducer = getLastCallNumberReducer;
exports.default = getCallReducer;

var _redux = require('redux');

var _getModuleStatusReducer = require('../../lib/getModuleStatusReducer');

var _getModuleStatusReducer2 = _interopRequireDefault(_getModuleStatusReducer);

var _callStatus = require('./callStatus');

var _callStatus2 = _interopRequireDefault(_callStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCallStatusReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _callStatus2.default.idle;
    var _ref = arguments[1];
    var type = _ref.type;

    switch (type) {
      case types.connect:
        return _callStatus2.default.connecting;

      case types.connectSuccess:
      case types.connectError:
        return _callStatus2.default.idle;

      default:
        return state;
    }
  };
}

function getToNumberReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var _ref2 = arguments[1];
    var type = _ref2.type,
        data = _ref2.data;

    switch (type) {
      case types.toNumberChanged:
        return data;
      case types.connectError:
        return state;
      case types.resetSuccess:
      case types.connectSuccess:
        return '';
      default:
        return state;
    }
  };
}

function getToNumberEntitiesReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var _ref3 = arguments[1];
    var type = _ref3.type,
        data = _ref3.data;

    switch (type) {
      case types.toNumberMatched:
        return [].concat((0, _toConsumableArray3.default)(state), [data]);
      case types.cleanToNumberEntities:
      case types.resetSuccess:
        return [];
      default:
        return state;
    }
  };
}

function getLastCallNumberReducer(types) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var _ref4 = arguments[1];
    var type = _ref4.type,
        number = _ref4.number;

    switch (type) {
      case types.connect:
        return number;
      default:
        return state;
    }
  };
}

function getCallReducer(types) {
  return (0, _redux.combineReducers)({
    status: (0, _getModuleStatusReducer2.default)(types),
    callStatus: getCallStatusReducer(types),
    toNumber: getToNumberReducer(types),
    toNumberEntities: getToNumberEntitiesReducer(types)
  });
}
//# sourceMappingURL=getCallReducer.js.map
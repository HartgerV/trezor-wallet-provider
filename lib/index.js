"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _hookedWallet = _interopRequireDefault(require("./hooked-wallet"));

var _TrezorWallet = _interopRequireDefault(require("./TrezorWallet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _default(_x, _x2, _x3, _x4) {
  return _ref.apply(this, arguments);
}

function _ref() {
  _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(networkId, accountsOffset, accountsQuantity, eventEmitter) {
    var trezor;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (networkId == null) {
              networkId = 1; //default to mainnet network id
            }

            trezor = new _TrezorWallet.default(networkId, accountsOffset, accountsQuantity, eventEmitter);
            return _context.abrupt("return", new _hookedWallet.default(trezor));

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _ref.apply(this, arguments);
}
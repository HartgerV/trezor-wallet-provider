"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ethereumjsTx = _interopRequireDefault(require("ethereumjs-tx"));

var _ethereumjsUtil = require("ethereumjs-util");

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _promiseTimeout = require("promise-timeout");

var _hdkey = _interopRequireDefault(require("hdkey"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var trezor = require('trezor.js');

var currentSession = null;
var currentDevice = null;
var CUSTOM_TIME_OUT = 30000;
var hardeningConstant = 0x80000000;
var defaultAddress = [(44 | hardeningConstant) >>> 0, (60 | hardeningConstant) >>> 0, (0 | hardeningConstant) >>> 0, 0];
var deviceList = new trezor.DeviceList();

var TrezorWallet =
/*#__PURE__*/
function () {
  function TrezorWallet(networkId) {
    var accountsOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var accountsQuantity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
    var eventEmitter = arguments.length > 3 ? arguments[3] : undefined;

    _classCallCheck(this, TrezorWallet);

    this.networkId = networkId; // Function which should return networkId

    this.getAccounts = this.getAccounts.bind(this);
    this.signTransaction = this.signTransaction.bind(this);
    this.accountsOffset = accountsOffset;
    this.accountsQuantity = accountsQuantity;
    this.eventEmitter = eventEmitter;
    this.wallets = [];
  }

  _createClass(TrezorWallet, [{
    key: "_getAccountIndex",
    value: function _getAccountIndex(address) {
      return this.wallets.filter(function (wallet) {
        return wallet.address === address;
      })[0].index;
    }
  }, {
    key: "_getAddressByIndex",
    value: function _getAddressByIndex(index) {
      return defaultAddress.concat([+index]);
    }
  }, {
    key: "_pinCallback",
    value: function _pinCallback(type, callback) {
      this.eventEmitter.off('ON_PIN', function () {});
      this.eventEmitter.on('ON_PIN', function (err, enteredPin) {
        callback(err, enteredPin);
      });
      this.eventEmitter.emit('TREZOR_PIN_REQUEST');
    }
  }, {
    key: "_passphraseCallback",
    value: function _passphraseCallback(callback) {
      this.eventEmitter.off('ON_PASSPHRASE', function () {});
      this.eventEmitter.on('ON_PASSPHRASE', function (err, enteredPassphrase) {
        callback(err, enteredPassphrase);
      });
      this.eventEmitter.emit('TREZOR_PASSPHRASE_REQUEST');
    }
  }, {
    key: "_getCurrentSession",
    value: function () {
      var _getCurrentSession2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _ref, device, session;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (deviceList.transport) {
                  _context.next = 2;
                  break;
                }

                throw new Error('TREZOR_BRIDGE_NOT_FOUND');

              case 2:
                if (!currentSession) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", currentSession);

              case 4:
                if (!currentDevice) {
                  _context.next = 7;
                  break;
                }

                _context.next = 7;
                return currentDevice.steal();

              case 7:
                _context.next = 9;
                return deviceList.acquireFirstDevice(true);

              case 9:
                _ref = _context.sent;
                device = _ref.device;
                session = _ref.session;
                device.on('disconnect', function () {
                  currentDevice = null;
                  currentSession = null;
                });
                device.on('changedSessions', function (isUsed, isUsedHere) {
                  if (isUsedHere) {
                    currentSession = null;
                  }
                });
                device.on('pin', this._pinCallback.bind(this));
                device.on('passphrase', this._passphraseCallback.bind(this));
                currentDevice = device;
                currentSession = session;
                return _context.abrupt("return", currentSession);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _getCurrentSession() {
        return _getCurrentSession2.apply(this, arguments);
      }

      return _getCurrentSession;
    }()
  }, {
    key: "signTransactionAsync",
    value: function () {
      var _signTransactionAsync = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(txData) {
        var accountIndex, session, signPromise, signed, signedTx;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                accountIndex = this.getAccountIndex(txData.from);
                Object.keys(txData).forEach(function (key) {
                  var val = txData[key];
                  val = val.replace(hexPrefix, '').toLowerCase();
                  txData[key] = val.length % 2 !== 0 ? "0".concat(val) : val;
                });
                _context2.next = 4;
                return _getCurrentSession();

              case 4:
                session = _context2.sent;
                signPromise = session.signEthTx(_getAddressByIndex(accountIndex), txData.nonce, txData.gasPrice, txData.gasLimit, txData.to, txData.value, txData.data, chainId);
                signed = null;
                _context2.prev = 7;
                _context2.next = 10;
                return (0, _promiseTimeout.timeout)(signPromise, CUSTOM_TIME_OUT);

              case 10:
                signed = _context2.sent;
                _context2.next = 17;
                break;

              case 13:
                _context2.prev = 13;
                _context2.t0 = _context2["catch"](7);

                if (_context2.t0 instanceof _promiseTimeout.TimeoutError) {
                  currentSession = null;
                }

                throw _context2.t0;

              case 17:
                signedTx = new _ethereumjsTx.default(_objectSpread({
                  s: addHexPrefix(signed.s),
                  v: addHexPrefix(new _bignumber.default(signed.v).toString(16)),
                  r: addHexPrefix(signed.r.toString())
                }, args.dataToSign));
                return _context2.abrupt("return", {
                  raw: hexPrefix + signedTx.serialize().toString('hex')
                });

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[7, 13]]);
      }));

      function signTransactionAsync(_x) {
        return _signTransactionAsync.apply(this, arguments);
      }

      return signTransactionAsync;
    }()
    /**
       * Gets a list of accounts from a device - currently it's returning just
       * first one according to derivation path
       * @param {failableCallback} callback
       */

  }, {
    key: "getAccounts",
    value: function () {
      var _getAccounts = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(callback) {
        var session, addressN, result, chainCode, publicKey, hdk, pathBase, wallets, addresses, i, index, dkey, address;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return this._getCurrentSession();

              case 3:
                session = _context3.sent;
                addressN = {
                  address_n: defaultAddress
                };
                _context3.next = 7;
                return session.typedCall('GetPublicKey', 'PublicKey', addressN);

              case 7:
                result = _context3.sent;
                chainCode = result.message.node.chain_code;
                publicKey = result.message.node.public_key;
                hdk = new _hdkey.default();
                hdk.publicKey = Buffer.from(publicKey, 'hex');
                hdk.chainCode = Buffer.from(chainCode, 'hex');
                pathBase = 'm';
                wallets = [];
                addresses = [];

                for (i = 0; i < this.accountsQuantity; i++) {
                  index = i + this.accountsOffset;
                  dkey = hdk.derive("".concat(pathBase, "/").concat(index));
                  address = "0x".concat((0, _ethereumjsUtil.publicToAddress)(dkey.publicKey, true).toString('hex'));
                  addresses.push(address);
                  wallets.push({
                    address: address,
                    index: index
                  });
                }

                this.wallets = wallets;
                callback(null, addresses);
                _context3.next = 24;
                break;

              case 21:
                _context3.prev = 21;
                _context3.t0 = _context3["catch"](0);
                callback(_context3.t0, null);

              case 24:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 21]]);
      }));

      function getAccounts(_x2) {
        return _getAccounts.apply(this, arguments);
      }

      return getAccounts;
    }()
    /**
       * Signs txData in a format that ethereumjs-tx accepts
       * @param {object} txData - transaction to sign
       * @param {failableCallback} callback - callback
       */

  }, {
    key: "signTransaction",
    value: function signTransaction(txData, callback) {
      this.signTransactionAsync(txData).then(function (res) {
        return callback(null, res);
      }).catch(function (err) {
        return callback(err, null);
      });
    }
  }]);

  return TrezorWallet;
}();

exports.default = TrezorWallet;
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

    this._handleEvents();
  }

  _createClass(TrezorWallet, [{
    key: "_handleEvents",
    value: function _handleEvents() {
      var _this = this;

      deviceList.on('transport', function () {
        return _this.eventEmitter.emit('TREZOR_TRASNPORT_INITIALIZED');
      });
      deviceList.on('error', function (error) {
        return _this.eventEmitter.emit('TREZOR_ERROR', error);
      });
    }
  }, {
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
      this.eventEmitter.on('ON_PIN', function (err, enteredPin) {
        callback(err, enteredPin);
      });
      this.eventEmitter.emit('TREZOR_PIN_REQUEST');
    }
  }, {
    key: "_passphraseCallback",
    value: function _passphraseCallback(callback) {
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
      regeneratorRuntime.mark(function _callee2() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee(resolve, reject) {
                    var _ref2, device, session;

                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!deviceList.transport) {
                              reject(new Error('TREZOR_BRIDGE_NOT_FOUND'));
                            }

                            if (!currentSession) {
                              _context.next = 3;
                              break;
                            }

                            return _context.abrupt("return", currentSession);

                          case 3:
                            if (!currentDevice) {
                              _context.next = 6;
                              break;
                            }

                            _context.next = 6;
                            return currentDevice.steal();

                          case 6:
                            _context.next = 8;
                            return deviceList.acquireFirstDevice(true);

                          case 8:
                            _ref2 = _context.sent;
                            device = _ref2.device;
                            session = _ref2.session;
                            device.on('disconnect', function () {
                              currentDevice = null;
                              currentSession = null;
                            });
                            device.on('changedSessions', function (isUsed, isUsedHere) {
                              if (isUsedHere) {
                                currentSession = null;
                              }
                            });
                            device.on('pin', _this2._pinCallback);
                            device.on('passphrase', _this2._passphraseCallback);
                            currentDevice = device;
                            currentSession = session;
                            resolve(currentSession);

                          case 18:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                  };
                }()));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
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
      regeneratorRuntime.mark(function _callee3(txData) {
        var accountIndex, session, signPromise, signed, signedTx;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                accountIndex = this.getAccountIndex(txData.from);
                Object.keys(txData).forEach(function (key) {
                  var val = txData[key];
                  val = val.replace(hexPrefix, '').toLowerCase();
                  txData[key] = val.length % 2 !== 0 ? "0".concat(val) : val;
                });
                _context3.next = 4;
                return _getCurrentSession();

              case 4:
                session = _context3.sent;
                signPromise = session.signEthTx(_getAddressByIndex(accountIndex), txData.nonce, txData.gasPrice, txData.gasLimit, txData.to, txData.value, txData.data, chainId);
                signed = null;
                _context3.prev = 7;
                _context3.next = 10;
                return (0, _promiseTimeout.timeout)(signPromise, CUSTOM_TIME_OUT);

              case 10:
                signed = _context3.sent;
                _context3.next = 17;
                break;

              case 13:
                _context3.prev = 13;
                _context3.t0 = _context3["catch"](7);

                if (_context3.t0 instanceof _promiseTimeout.TimeoutError) {
                  currentSession = null;
                }

                throw _context3.t0;

              case 17:
                signedTx = new _ethereumjsTx.default(_objectSpread({
                  s: addHexPrefix(signed.s),
                  v: addHexPrefix(new _bignumber.default(signed.v).toString(16)),
                  r: addHexPrefix(signed.r.toString())
                }, args.dataToSign));
                return _context3.abrupt("return", {
                  raw: hexPrefix + signedTx.serialize().toString('hex')
                });

              case 19:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[7, 13]]);
      }));

      function signTransactionAsync(_x3) {
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
    value: function getAccounts(callback) {
      var _this3 = this;

      this._getCurrentSession().then(function (session) {
        var addressN = {
          address_n: defaultAddress
        };
        session.typedCall('GetPublicKey', 'PublicKey', addressN).then(function (result) {
          var chainCode = result.message.node.chain_code;
          var publicKey = result.message.node.public_key;
          var hdk = new _hdkey.default();
          hdk.publicKey = Buffer.from(publicKey, 'hex');
          hdk.chainCode = Buffer.from(chainCode, 'hex');
          var pathBase = 'm';
          var wallets = [];

          for (var i = 0; i < _this3.accountsQuantity; i++) {
            var index = i + _this3.accountsOffset;
            var dkey = hdk.derive("".concat(pathBase, "/").concat(index));
            var address = "0x".concat((0, _ethereumjsUtil.publicToAddress)(dkey.publicKey, true).toString('hex'));
            wallets.push({
              address: address,
              index: index
            });
          }

          _this3.wallets = wallets;
          callback(null, wallets);
        }).catch(function (err) {
          return callback(err, null);
        });
      }).catch(function (err) {
        return callback(err, null);
      });
    }
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
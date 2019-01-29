'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _ethereumjsTx = require('ethereumjs-tx');

var _ethereumjsTx2 = _interopRequireDefault(_ethereumjsTx);

var _trezorConnect = require('trezor-connect');

var _trezorConnect2 = _interopRequireDefault(_trezorConnect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrezorWallet = function () {
  function TrezorWallet(networkId, path) {
    (0, _classCallCheck3.default)(this, TrezorWallet);

    this.networkId = networkId; // Function which should return networkId
    this.getAccounts = this.getAccounts.bind(this);
    this.signTransaction = this.signTransaction.bind(this);
    this.setDerivationPath = this.setDerivationPath.bind(this);
    this.setDerivationPath(path);
  }

  (0, _createClass3.default)(TrezorWallet, [{
    key: 'setDerivationPath',
    value: function setDerivationPath(path) {
      var newPath = path || "44'/60'/0'/0"; // default path for trezor

      this.path = newPath;
    }
  }, {
    key: 'signTransactionAsync',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(txData) {
        var _this = this;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', new _promise2.default(function (resolve, reject) {
                  //// Uncomment for debugging purposes:
                  // TrezorConnect.closeAfterFailure(false);
                  // TrezorConnect.closeAfterSuccess(false);

                  // Set the EIP155 bits
                  var tx = new _ethereumjsTx2.default(txData);
                  tx.raw[6] = Buffer.from([_this.networkId]); // v
                  tx.raw[7] = Buffer.from([]); // r
                  tx.raw[8] = Buffer.from([]); // s

                  _trezorConnect2.default.ethereumSignTx(_this.path, TrezorWallet.makeHexEven(txData.nonce), TrezorWallet.makeHexEven(txData.gasPrice), TrezorWallet.makeHexEven(txData.gas), TrezorWallet.makeHexEven(txData.to), TrezorWallet.makeHexEven(txData.value), TrezorWallet.makeHexEven(txData.data), _this.networkId, function (r) {
                    console.log(r);
                    if (r.success) {
                      console.log((0, _typeof3.default)(r.v));
                      tx.v = Buffer.from(r.v.toString(16), 'hex');
                      tx.r = Buffer.from(r.r, 'hex');
                      tx.s = Buffer.from(r.s, 'hex');
                    } else {
                      reject(r.error); // error message
                    }
                    console.log('0x' + tx.serialize().toString('hex'));
                    // return signed transaction
                    resolve('0x' + tx.serialize().toString('hex'));
                  });
                }));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function signTransactionAsync(_x) {
        return _ref.apply(this, arguments);
      }

      return signTransactionAsync;
    }()

    // Prepend 0 in case of uneven hex char count

  }, {
    key: 'getAccounts',


    /**
       * Gets a list of accounts from a device - currently it's returning just
       * first one according to derivation path
       * @param {failableCallback} callback
       */
    value: function getAccounts(callback) {
      _trezorConnect2.default.ethereumGetAddress(this.path, function (result) {
        if (result.success) {
          callback(null, ['0x' + result.address]);
        } else {
          callback(new Error('failed to get address from trezor'), null);
        }
      });
    }

    /**
       * Signs txData in a format that ethereumjs-tx accepts
       * @param {object} txData - transaction to sign
       * @param {failableCallback} callback - callback
       */

  }, {
    key: 'signTransaction',
    value: function signTransaction(txData, callback) {
      this.signTransactionAsync(txData).then(function (res) {
        return callback(null, res);
      }).catch(function (err) {
        return callback(err, null);
      });
    }

    // signMessage(txData, callback) {
    //     this.signMessageAsync(txData)
    //         .then(res => callback(null, res))
    //         .catch(err => callback(err, null));
    // }

  }], [{
    key: 'obtainPathComponentsFromDerivationPath',
    value: function obtainPathComponentsFromDerivationPath(derivationPath) {
      // check if derivation path follows 44'/60'/x'/n pattern
      var regExp = /^(44'\/6[0|1]'\/\d+'?\/)(\d+)$/;
      var matchResult = regExp.exec(derivationPath);
      if (matchResult === null) {
        throw new Error("To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ");
      }

      return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
    }
  }, {
    key: 'makeHexEven',
    value: function makeHexEven(input) {
      console.log(input);
      var output = void 0;
      if (input.length % 2 !== 0) {
        output = '0' + input.slice(2);
      } else {
        output = input.slice(2);
      }
      console.log(output);
      return output;
    }
  }]);
  return TrezorWallet;
}();

exports.default = TrezorWallet;
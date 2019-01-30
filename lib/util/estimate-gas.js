"use strict";

/* eslint-disable */
var createPayload = require('./create-payload.js');
/*

This is a work around for https://github.com/ethereum/go-ethereum/issues/2577

*/


function estimateGas(provider, txParams, cb) {
  provider.sendAsync(createPayload({
    method: 'eth_estimateGas',
    params: [txParams]
  }), function (err, res) {
    if (err) {
      // handle simple value transfer case
      if (err.message === 'no contract code at given address') {
        return cb(null, '0xcf08');
      }

      return cb(err);
    }

    cb(null, res.result);
  });
}

module.exports = estimateGas;
"use strict";

/* eslint-disable */
var createPayload = require('./util/create-payload.js'); // this is the base class for a subprovider -- mostly helpers


function SubProvider() {}

SubProvider.prototype.setEngine = function (engine) {
  var self = this;
  self.engine = engine;
  engine.on('block', function (block) {
    self.currentBlock = block;
  });
};

SubProvider.prototype.handleRequest = function (payload, next, end) {
  throw new Error("Subproviders should override `handleRequest`.  ".concat(payload, " ").concat(next, " ").concat(end));
};

SubProvider.prototype.emitPayload = function (payload, cb) {
  var self = this;
  self.engine.sendAsync(createPayload(payload), cb);
};

module.exports = SubProvider;
/* eslint-disable */

const createPayload = require('./util/create-payload.js');

// this is the base class for a subprovider -- mostly helpers


function SubProvider() {

}

SubProvider.prototype.setEngine = function (engine) {
  const self = this;
  self.engine = engine;
  engine.on('block', (block) => {
    self.currentBlock = block;
  });
};

SubProvider.prototype.handleRequest = function (payload, next, end) {
  throw new Error(`Subproviders should override \`handleRequest\`.  ${payload} ${next} ${end}`);
};

SubProvider.prototype.emitPayload = function (payload, cb) {
  const self = this;
  self.engine.sendAsync(createPayload(payload), cb);
};
module.exports = SubProvider;

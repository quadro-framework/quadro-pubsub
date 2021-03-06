module.exports = function(config, log) {
  const PubsubClient = require('../lib/client')
  PubsubClient.prototype.publish = PubsubClient.prototype.send
  const pubsubConfig = config.get('pubsub')
  return new PubsubClient({ log, ...pubsubConfig })
}

module.exports['@aliases'] = ['pubsub']

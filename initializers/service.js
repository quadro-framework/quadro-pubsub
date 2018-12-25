module.exports = async function(container, pubsub, app, config) {
  if (app.isTestEnv) return

  const handles = config.get('service.handles', [])
  const publishes = config.get('service.publishes', [])
  const subscribes = config.get('service.subscribes', [])
  const manifest = { handles, publishes, subscribes }

  const serviceName = config.get('service.name')
  const MANIFEST_VERSION = '1'
  await pubsub.initialize(serviceName, MANIFEST_VERSION, manifest)

  const handlersList = await container.getAsync('handlersList')

  await pubsub.processMessages(async msg => {
    return handlersList.execute(msg)
  })
}

const path = require('path')

const Context = require('../lib/context')

const MessageHandlingError = Q.Errors.declare('MessageHandlingError')
const UnknownMessageHandlerError = Q.Errors.declare('UnknownMessageHandlerError')

const WILDCARD_HANDLER = '_all'

module.exports = class Handlers {
  constructor(app) {
    this.app = app
  }

  async initialize() {
    const handlers = Promise.map(
      this.app.glob(`handlers/**/*.js`),
      file => Promise.props({ messageType: path.basename(file, '.js'), handler: require(file) })
    )

    this.handlersMap = await Promise.reduce(
      handlers,
      (acc, { messageType, handler }) => acc.set(messageType, handler),
      new Map()
    )
  }

  async execute(message) {
    const Handler = this.handlersMap.get(message.type) || this.handlersMap.get(WILDCARD_HANDLER)
    if (!Handler) throw new UnknownMessageHandlerError({ type: message.type })

    const handler = await Q.container.create(Handler)
    const ctx = new Context(message)
    try {
      await handler.handle(ctx)
    } catch (err) {
      ctx.failure(err.message, 1)
    }

    if (ctx.isFailure()) {
      const { code, message } = ctx._error || {}
      throw new MessageHandlingError(message, { code })
    }

    ctx.success()

    return ctx
  }
}

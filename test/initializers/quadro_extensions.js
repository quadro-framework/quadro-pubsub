module.exports = function(handlersList = 'quadroPubsub:handlersList') {
  class MessageHandlerExpectation {
    constructor(type, content, metadata) {
      this.message = { type, content, ...metadata }
    }

    execute() {
      return handlersList.execute(this.message)
    }

    async expectFailure(messageOrCode) {
      const ctx = await this.execute()
      expect(ctx.isFailed()).to.be.true
      const { code, message } = ctx.error

      /* eslint eqeqeq: 0 */
      expect(message == messageOrCode || code == messageOrCode)
    }

    async expectSuccess() {
      const ctx = await this.execute()

      /* eslint no-unused-expressions: 0 */
      expect(ctx.isSuccess()).to.be.true
    }
  }

  QT.onMessage = function(type, content, metadata = {}) {
    return new MessageHandlerExpectation(type, content, metadata)
  }
}
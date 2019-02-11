const HandlersList = require('../services/handlers_list')

/* eslint no-unused-expressions: 0 */
describe.only('HandlersList', function() {
  describe('execute', function() {
    let handlersList
    beforeEach(async function() {
      handlersList = new HandlersList()
      handlersList.handlersMap = new Map()
    })

    it('falls back to `_all` for non registered messages', async function() {
      const stub = this.sinon.spy()
      handlersList.handlersMap.set('_all', class { handle() { stub() } })
      await handlersList.execute({ type: 'some.unknonwn.message' })
      expect(stub).to.have.been.called
    })

    it('throws a meaningful error if handler is missing', async function() {
      await expect(handlersList.execute({ type: 'some.unknonwn.message' }))
        .to.be.rejectedWith(Q.Errors.UnknownMessageHandlerError)
    })
  })
})

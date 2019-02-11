const HandlersList = require('../../services/handlers_list')

/* eslint no-unused-expressions: 0 */
describe.only('HandlersList', function() {
  describe('.execute', function() {
    let handlersList
    let fallback
    beforeEach(async function() {
      fallback = this.sinon.spy()
      handlersList = new HandlersList()
      handlersList.handlersMap = new Map()
      handlersList.handlersMap.set('some.registered.message', class { handle() { } })
      handlersList.handlersMap.set('_all', class { handle() { fallback() } })
    })

    it('falls back to `_all` for non registered messages', async function() {
      await handlersList.execute({ type: 'some.unknown.message' })
      expect(fallback).to.have.been.called
    })

    it('does not use `_all` for registered messages', async function() {
      await handlersList.execute({ type: 'some.registered.message' })
      expect(fallback).to.have.not.been.called
    })

    it('throws a meaningful error if handler is missing', async function() {
      handlersList = new HandlersList()
      handlersList.handlersMap = new Map()
      await expect(handlersList.execute({ type: 'some.unknown.message' }))
        .to.be.rejectedWith(Q.Errors.UnknownMessageHandlerError)
    })
  })
})

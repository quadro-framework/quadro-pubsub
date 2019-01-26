describe('Quadro PubSub Test extensions', function() {
  class Handler {
    handle() {}
  }

  before(async function() {
    const handlersList = await Q.container.getAsync('quadroPubsub:handlersList')
    handlersList.handlersMap.set('someEvent', Handler)
  })

  it('defaults to success', async function() {
    this.sinon.stub(Handler.prototype, 'handle').callsFake(() => {})
    await QT.onMessage('someEvent', {}).expectSuccess()
  })

  it('fails if error thrown', async function() {
    this.sinon.stub(Handler.prototype, 'handle').throws(new Q.Errors.InvalidOperationError())
    await QT.onMessage('someEvent', {}).expectFailure()
  })

  it('fails if failure was called', async function() {
    this.sinon.stub(Handler.prototype, 'handle').callsFake(ctx => ctx.failure('error', 333))
    await QT.onMessage('someEvent', {}).expectFailure('error')
  })
})

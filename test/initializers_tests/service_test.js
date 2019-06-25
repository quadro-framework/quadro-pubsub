const initializer = require('../../initializers/service')

describe('Initializers tests', function () {
  let pubsub, processMessages

  beforeEach(async function () {
    this.sinon.stub(Q.app, 'isTestEnv').value(false)
    pubsub = await Q.container.getAsync('pubsub')
    processMessages = this.sinon.stub(pubsub, 'processMessages')
    this.sinon.stub(pubsub, 'initialize')
  })

  describe('concurrency', function () {
    it('passes concurrency', async function () {
      QT.stubConfig('service.concurrency', 22)
      await Q.container.run(initializer)
      expect(processMessages).to.have.been.calledWith(this.sinon.match.func, { concurrency: 22 })
    })

    it('defaults concurrency to 10', async function () {
      await Q.container.run(initializer)
      expect(processMessages).to.have.been.calledWith(this.sinon.match.func, { concurrency: 10 })
    })
  })
})

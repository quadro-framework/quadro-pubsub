/* eslint no-unused-expressions: 0 */
describe('Pubsub matchers', function() {
  let pubsub

  beforeEach(async function() {
    pubsub = await Q.container.getAsync('pubsub')
  })

  describe('.published', function() {
    it('succeeds if message was published', async function() {
      await pubsub.publish('hello', {})
      expect('hello').to.have.been.published
    })

    it('succeeds if message was published', async function() {
      await pubsub.publish('hello', {})
      expect('hi').to.not.have.been.published
    })
  })

  describe('.publishedWithSubset', function() {
    it('succeeds if message was published with subset', async function() {
      await pubsub.publish('hello', { hello: 'world', foo: 'bar' })
      expect('hello').to.have.been.publishedWithSubset({ hello: 'world' })
    })

    it('succeeds if message was published with subset', async function() {
      await pubsub.publish('hello', { hello: 'world', foo: 'bar' })
      expect(function() {
        expect('hello').to.have.been.publishedWithSubset({ foo: 'world' })
      }).to.throw(/expected publish to have.* contains/)
    })
  })
})

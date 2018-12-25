const Client = require('../../lib/client')
const WSServer = require('./test_ws_server')
const TEST_PORT = WSServer.port

/* eslint no-unused-expressions: 0 */
describe('PubSub Client', function() {
  def('serviceName', 'someService')
  def('manifest', {})

  def('client', async function() {
    const client = new Client({ host: `http://localhost:${TEST_PORT}` })
    await client.initialize(get.serviceName, 1, get.manifest)
    return client
  })

  describe('processMessages', function() {
    describe('connection close', function() {
      it('retries connection if server is down', async function() {
        get.client.then(client => {
          client.processMessages()
          return client
        })

        await Promise.delay(100)

        let server
        const connected = new Promise(function(resolve, reject) {
          server = new WSServer({ wsConnection: resolve })
          server.start().catch(reject)
        })

        await expect(connected).to.eventually.be.fulfilled
        await server.close()
      })

      it('reconnects', async function() {
        const server1 = new WSServer()
        await server1.start()
        const client = await get.client
        await client.processMessages(() => {})
        await server1.close()
        let server2
        const secondConnectionReceived = new Promise(async function(resolve) {
          server2 = new WSServer({ wsConnection: resolve })
          server2.start()
        })
        await expect(secondConnectionReceived).to.eventually.be.fulfilled
        expect(client).to.be.ok
        await server2.close()
      })
    })
  })
})

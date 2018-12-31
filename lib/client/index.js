const WebSocket = require('ws')
const Axios = require('axios')
const DefaultLogger = require('./logger')
const { retryMethod } = require('./retries')

const DELAY_AFTER_DISCONNECT = 1000

module.exports = class PubSubClient {
  constructor({ host = 'http://localhost:8080', log = new DefaultLogger() } = {}) {
    this.log = log
    this.log.trace({ host }, 'Connecting to pubsub server')
    this.host = host
    this._inflightMessages = []

    this.axios = Axios.create({ baseURL: host })
    retryMethod(this.axios, 'put')
    retryMethod(this.axios, 'post')
    retryMethod(this, 'processMessages')
  }

  /**
   * @param {string} name     - Service name
   * @param {number} version  - Manifest version
   * @param {object} manifest - Service manifest
   * @param {Array[string]} manifest.handles - List of commands service is responding to
   * @param {Array[string]} manifest.publishes - List of events service is publishing
   * @param {Array[string]} manifest.subscribes - List of events service is subscribing to
   */
  initialize(name, version, manifest) {
    this.serviceName = name

    return this.axios.put(`/services/${this.serviceName}/manifests/${version}`, manifest)
  }

  /**
   *
   * @param {string} type - message type name (e.g. orders.order_completed)
   * @param {Object} content - message content
   */
  send(type, content, metadata) {
    const envelope = { type, content, ...metadata }
    return this.axios.post(`/services/${this.serviceName}/messages`, envelope)
  }

  async _processSingleMessage(msg, handler) {
    msg = JSON.parse(msg)
    let done

    const donePromise = new Promise(resolve => {
      done = () => {
        const removeIndex = this._inflightMessages.indexOf(donePromise)
        this._inflightMessages.splice(removeIndex, 1)
        resolve(true)
      }
    })
    this._inflightMessages.push(donePromise)

    this.log.trace({ message: msg }, 'Client received')
    try {
      await handler(msg)
      await this.reply({ command: 'ack', ackKey: msg.ackKey })
    } catch (err) {
      const failure = { message: err.message, extra: err.extra, type: err.constructor.name }
      await this.reply({ command: 'fail', ackKey: msg.ackKey, failure })
    } finally {
      done()
    }
  }

  async processMessages(handler, { concurrency = 10 } = {}) {
    const url = `${this.host}/services/${this.serviceName}/ws?concurrency=${concurrency}`
    Q.log.info({ url }, 'Consuming messages')
    const ws = new WebSocket(url)
    this.ws = ws
    await new Promise((resolve, reject) => {
      ws.on('open', () => {
        this._listenForClose(handler)
        resolve(true)
      })
      ws.on('error', reject)
      ws.on('message', msg => this._processSingleMessage(msg, handler))
    })
  }

  _listenForClose(handler) {
    this._closePromise = new Promise(resolve => {
      this.ws.on('close', code => {
        if (this._closeRequested) return resolve(true)

        this.log.warn('WebSocket Disconnected', { code })
        Promise.delay(DELAY_AFTER_DISCONNECT).then(() => this.processMessages(handler))
      })
    })
  }

  reply(content) {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify(content), err => err ? reject(err) : resolve(true))
    })
      .catch(err => this.log.error(err, 'Error replying via websocket'))
  }

  async close() {
    this._closeRequested = true
    await Promise.all(this._inflightMessages)
    if (this.ws) {
      this.ws.close()
      return this._closePromise
    }
  }
}

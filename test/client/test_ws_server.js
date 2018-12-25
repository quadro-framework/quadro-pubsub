const http = require('http')
const WebSocket = require('ws')
const SERVER_PORT = 9001

class WSServer {
  constructor({ wsConnection } = {}) {
    this.wsConnection = wsConnection
    this._requestedPaths = []
  }

  start() {
    this.server = http.createServer((req, res) => {
      this._requestedPaths.push(req.url)
      res.writeHead(200, {})
      res.end('ok')
    })

    this.wsServer = new WebSocket.Server({ server: this.server })
    this.wsServer.on('connection', (ws) => {
      if (this.wsConnection) this.wsConnection(ws)
    })

    return new Promise((resolve, reject) => this.server.listen(SERVER_PORT, err =>
      err ? reject(err) : resolve(this.server)
    ))
  }

  async close() {
    if (!this.server) return;
    await new Promise((resolve, reject) => this.wsServer.close(err => err ? reject(err) : resolve(true)))
    await new Promise((resolve, reject) => this.server.close(err => err ? reject(err) : resolve(true)))
  }
}

WSServer.port = SERVER_PORT

module.exports = WSServer

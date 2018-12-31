module.exports = class Context {
  constructor(msg) {
    this.message = msg
  }

  success() {
    this._success = true
  }

  failed(message, code = -1) {
    this._error = { message, code }
  }

  isFailed() {
    return !!this._error
  }

  isSuccess() {
    return !this.isFailed() && this._success
  }
}

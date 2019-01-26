module.exports = class Context {
  constructor(msg) {
    this.message = msg
  }

  success() {
    this._success = true
  }

  failure(message, code = -1) {
    this._error = { message, code }
  }

  isFailure() {
    return !!this._error
  }

  isSuccess() {
    return !this.isFailure() && (this._success || this._success === undefined)
  }
}

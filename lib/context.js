module.exports = class Context {
  constructor(msg) {
    this.message = msg
  }

  success() {
    this.success = true
  }

  failed(message, code = -1) {
    this.error = { message, code }
  }

  isFailed() {
    return !!this.error
  }
}

module.exports = class ConsoleLogger {
  trace(...args) { this._write('trace', ...args) }
  debug(...args) { this._write('debug', ...args) }
  info(...args) { this._write('info', ...args) }
  warn(...args) { this._write('warn', ...args) }
  error(...args) { this._write('error', ...args) }
  fatal(...args) { this._write('fatal', ...args) }

  _write(level, ...args) {
    console.log(`${level}:`, ...args)
  }
}

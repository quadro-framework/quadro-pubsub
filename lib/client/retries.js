const retry = require('retry')

function createRetryOperation() {
  return retry.operation({
    retries: 1000000,
    factor: 2,
    minTimeout: 100, // 100 ms
    maxTimeout: 60000, // 1 min
    randomize: true
  })
}

function retryOriginalMethod(original, methodName, ...args) {
  const retryOperation = createRetryOperation()
  return new Promise(function(resolve, reject) {
    retryOperation.attempt((currentAttempt) => {
      if (currentAttempt !== 1) console.log({ methodName, currentAttempt }, 'Retrying method')
      original(...args)
        .then(resolve)
        .catch(err => {
          if (!retryOperation.retry(err)) return reject(err)
        })
    })
  })
}

module.exports = {
  retryMethod(obj, method) {
    const original = obj[method].bind(obj)
    obj[method] = function(...args) {
      return retryOriginalMethod(original, method, ...args)
    }
  }
}

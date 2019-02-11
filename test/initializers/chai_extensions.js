const chai = require('chai')

module.exports = function(pubsub) {
  beforeEach(function() {
    if (pubsub.publish.restore) pubsub.publish.restore()
    this.sinon.stub(pubsub, 'publish').callsFake((type, content) => {
      QT.currentTest.lastPublishedMessage = { type, content }
    })
  })

  chai.use(function(chai, utils) {
    const { Assertion } = chai
    function getBaseAssertion() {
      const isNegative = utils.flag(this, 'negate')
      const assertion = new Assertion(pubsub.publish).to
      return isNegative ? assertion.not : assertion
    }

    utils.addProperty(Assertion.prototype, 'published', function() {
      return getBaseAssertion.apply(this).have.been.calledWith(this._obj)
    })

    utils.addMethod(Assertion.prototype, 'publishedWithSubset', function(subset) {
      return getBaseAssertion.apply(this).have.been.calledWith(
        this._obj,
        QT.currentTest.sinon.match.containSubset(subset)
      )
    })
  })
}

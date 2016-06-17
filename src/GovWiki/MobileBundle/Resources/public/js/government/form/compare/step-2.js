/**
 *
 * @param FormState
 * @param container
 * @returns {*}
 */
function init(FormState, container) {
  var Step1 = require('./step-1.js');
  return new Step1(FormState, container);
}

module.exports = init;

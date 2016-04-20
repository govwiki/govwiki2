var Search = require('../../search/government.js');
/**
 * Constructor
 *
 * @param FormState
 * @param container
 * @constructor
 */
function Step(FormState, container) {
  this.container = container;
  this.$container = $(container);
  this.CurrentFormState = container === '.first-condition' ? FormState.firstStep : FormState.secondStep;
  this.$select = $(container + ' select');
  this.$loader = $('<div class="loader"></div>');
  this.init();
}
/**
 * Init step
 */
Step.prototype.init = function init() {
  var self = this;
  self.handler_onMouseDownSelect();
  self.handler_onChangeSelect();
  // Typeahead initialization
  self.search = new Search(self.container, self.searchResponseCallback);
  // Pressed mouse or enter button
  self.search.$typeahead.bind('typeahead:selected', function selected(e, selectedGovernment) {
    self.CurrentFormState.data = selectedGovernment;
    self.createYearOptions(selectedGovernment);
  });
  // Start typing, triggered after select item
  self.search.$typeahead.bind('typeahead:asyncrequest', function asyncrequest() {
    self.loading(true);
  });
  self.search.$typeahead.bind('typeahead:asyncreceive', function asyncreceive() {
    self.loading(false);
  });
  self.search.$typeahead.bind('typeahead:asynccancel', function asynccancel() {
    self.loading(false);
    self.lockSelect();
  });
  self.search.$typeahead.bind('typeahead:open', function open() {
    self.lockSelect();
    self.CurrentFormState.incomplete();
  });
};
/**
 * (DOM)
 *
 * Unlock step
 */
Step.prototype.unlock = function unlock() {
  this.search.$typeahead.toggleClass('disabled', false);
};
/**
 * (DOM)
 *
 * Lock step
 */
Step.prototype.lock = function lock() {
  this.search.$typeahead.toggleClass('disabled', true);
  this.$select.toggleClass('disabled', true);
};
/**
 * (DOM)
 *
 * Lock step
 */
Step.prototype.lockSelect = function lockSelect() {
  this.$select.toggleClass('disabled', true);
};
/**
 * (DOM)
 *
 * Loading state
 * @param isLoading
 */
Step.prototype.loading = function loading(isLoading) {
  var display = isLoading ? 'none' : 'block';
  this.$select.css({ display: display });
  if (isLoading) {
    this.$container.append(this.$loader);
  } else {
    this.$loader.remove();
  }
};
/**
 * (DOM)
 *
 * @param data
 * @returns {boolean}
 */
Step.prototype.createYearOptions = function createYearOptions(government) {
  var self = this;
  var sortedYears;
  if (!government) {
    console.error('First argument not passed in createYearOptions() ');
    return true;
  }
  sortedYears = government.years.sort(function loop(a, b) {
    return a < b;
  });
  self.CurrentFormState.data.year = government.years[0];
  disableSelect(false);
  self.$select.html('');
  sortedYears.forEach(function loop(year, index) {
    var selected = index === 0 ? 'selected' : '';
    self.$select.append('<option value="' + government.id + '" ' + selected + '>' + year + '</option>');
  });
  correctForm(true);
  /**
   * Disable select
   * @param {Boolean} disabled
   */
  function disableSelect(disabled) {
    self.$select.toggleClass('disabled', !!disabled);
  }

  /**
   *
   * @param isCorrect
   */
  function correctForm(isCorrect) {
    if (isCorrect) {
      self.CurrentFormState.complete();
    } else {
      self.CurrentFormState.incomplete();
    }
  }
  return true;
};
/**
 * (Handler)
 *
 * On change select
 */
Step.prototype.handlerOnChangeSelect = function handlerOnChangeSelect() {
  var self = this;
  self.$select.on('change', function change(e) {
    var $el = $(e.target);
    var $selected = $el.find('option:selected');
    var year = $selected.text();
    if (year) {
      self.CurrentFormState.data.year = parseInt(year, 10);
      self.CurrentFormState.complete();
    } else {
      alert('Please choose correct year');
      self.CurrentFormState.incomplete();
    }
    return true;
  });
};
/**
 * Show error message if government not selected
 */
Step.prototype.handlerOnMouseDownSelect = function handlerOnMouseDownSelect() {
  var self = this;
  self.$select.on('mousedown', function mousedown(e) {
    var $el = $(e.target);
    if ($el.hasClass('disabled')) {
      alert('Please, first select government');
      return false;
    }
    return true;
  });
};
module.exports = Step;

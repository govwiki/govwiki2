var Handlebars = require('handlebars');
require('typeahead');

/**
 * Typeahead search
 *
 * @param {Selector} container - May be .first-condition or .second-condition
 */
function typeahead(container) {
  var self = this;
  if (!container) {
    alert('Please pass container selector');
    return true;
  }

  // Request delay.
  self.delay = 750;
  self.timer = undefined;
  self.governmentData = {};
  self.$typeahead = $(container + ' .typeahead_government');
  self.searchValue = '';

    // Init typeahead
  self.$typeahead.typeahead({
    hint: true,
    highlight: true,
    minLength: 3
  }, {
    name: 'countries',
    source: findMatches,
    templates: {
      empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
      suggestion: Handlebars.compile('<div class="sugg-box">' +
                '<div class="sugg-name">{{name}}</div>' +
                '</div>')
    },
    updater: function updater(item) {
      alert(item);
    }
  });

    // Pressed mouse or enter button
  self.$typeahead.bind('typeahead:selected', function selected(obj, selectedGovernment) {
    self.$typeahead.typeahead('val', selectedGovernment.name);
  });

    // Move cursor via arrows keys
  self.$typeahead.bind('typeahead:cursorchange', function cursorchange() {
    self.$typeahead.typeahead('val', self.searchValue);
  });

    // Store search value on typing
  self.$typeahead.keyup(function keyup(event) {
    self.searchValue = $(event.target).val();

    // Remove request
    if (self.searchValue.length < 3) {
      clearTimeout(self.timer)
    }
  });

    /**
     * (Ajax)
     *
     * Matcher for typeahead
     * @param query
     * @param syncCallback
     * @param asyncCallback
     **/
  function findMatches(query, syncCallback, asyncCallback) {
    if (self.timer) {
      clearTimeout(self.timer);
    }

    self.timer = setTimeout(function request() {
      $.ajax({
        method: 'GET',
        url: window.gw.urls.search + '?search=' + query
      }).success(function success(data) {
        asyncCallback(data);
      });
    }, self.delay);
  }

  return self;
}

module.exports = typeahead;

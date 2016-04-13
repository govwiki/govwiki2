var Handlebars = require('handlebars');

/**
 * Typeahead search
 *
 * @param {Selector} container - May be .first-condition or .second-condition
 */
function typeahead(container) {

  if (!container) {
    alert('Please pass container selector');
    return true;
  }

  var self = this;
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
    updater: function(item) {
        alert(item);
      }
  });

    // Pressed mouse or enter button
  self.$typeahead.bind('typeahead:selected', function(obj, selectedGovernment) {
    self.$typeahead.typeahead('val', selectedGovernment.name);
  });

    // Move cursor via arrows keys
  self.$typeahead.bind('typeahead:cursorchange', function(obj) {
    self.$typeahead.typeahead('val', self.searchValue);
  });

    // Store search value on typing
  self.$typeahead.keyup(function(event) {
    self.searchValue = $(event.target).val();
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
    $.ajax({
      method: 'GET',
      url: window.gw.urls.search + '?search=' + query
    }).success(function(data) {
        asyncCallback(data);
      });
  }

  return self;

}

module.exports = typeahead;

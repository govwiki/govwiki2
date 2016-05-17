var Handlebars = require('../vendor/handlebars.js');
var searchValue;
var $typeahead;
var timer;

// Request delay.
var delay = 750;

/**
 * Typeahead search
 */
var findMatches = function findMatches(query, syncCallback, asyncCallback) {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(function request() {
    $.ajax({
      method: 'GET',
      url: window.gw.urls.search + '?search=' + query
    }).success(function success(data) {
      asyncCallback(data);
    });
  }, delay);
};

Handlebars.registerHelper('if_eq', function ifEq(a, b, opts) {
  if (a === b) {
    return opts.fn(this);
  }

  return opts.inverse(this);
});
searchValue = '';

// Init typeahead
$typeahead = $('.typeahead_custom').typeahead({
  hint: true,
  highlight: true,
  minLength: 3
}, {
  name: 'elected_officials',
  source: findMatches,
  templates: {
    empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
    suggestion: Handlebars.compile(searchResultTemplate())
  },
  updater: function updater(item) {
    alert(item);
  }
});

// Pressed mouse or enter button
$typeahead.bind('typeahead:selected', function selected(obj, selectedItemData) {
  var name;
  var location;

  if (selectedItemData.type === 'government') {
    // Selected item is government.
    name = selectedItemData.name;
    location = [
      selectedItemData.altTypeSlug,
      selectedItemData.slug
    ].join('/');
  } else {
    // Selected item is electedOfficials.
    name = selectedItemData.fullName;
    location = [
      selectedItemData.government.altTypeSlug,
      selectedItemData.government.slug,
      selectedItemData.slug
    ].join('/');
  }

  $typeahead.typeahead('val', name);
  window.location.pathname += location;
});

// Move cursor via arrows keys
$typeahead.bind('typeahead:cursorchange', function cursorchange() {
  $typeahead.typeahead('val', searchValue);
});

// Store search value on typing
$typeahead.keyup(function keyup(event) {
  searchValue = $(event.target).val();
  if (searchValue.length < 3) {
    clearTimeout(timer);
  }
});

$typeahead.attr('disabled', false);

/**
 * Generate and return handlebars template.
 * @return {string}
 */
function searchResultTemplate() {
  var template = '<div class="sugg-box">';

  template += "{{#if_eq type 'government'}}";
  template += '<div class="sugg-state">{{state}}</div>';
  template += '<div class="sugg-name">{{name}}</div>';
  template += '{{else}}';
  template += '<div class="sugg-name">{{fullName}}</div>';
  template += '<div class="sugg-govname">{{government.name}}</div>';
  template += '{{/if_eq}}';
  template += '</div>';

  return template;
}

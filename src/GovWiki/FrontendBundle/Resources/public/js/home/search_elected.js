var Handlebars = require('../vendor/handlebars.js');
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
      url: window.gw.urls.search_elected + '?search=' + query
    }).success(function success(data) {
      asyncCallback(data);
    });
  }, delay);
};

var searchValue = '';

// Init typeahead
var $typeahead = $('.typeahead_elected').typeahead({
  hint: true,
  highlight: true,
  minLength: 3
}, {
  name: 'elected_officials',
  source: findMatches,
  templates: {
    empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
    suggestion: Handlebars.compile('<div class="sugg-box">' +
        '<div class="sugg-name">{{fullName}}</div>' +
        '<div class="sugg-govname">{{government.name}}</div>' +
        '</div>')
  },
  updater: function updater(item) {
    alert(item);
  }
});

// Pressed mouse or enter button
$typeahead.bind('typeahead:selected', function selected(obj, selectedItemData) {
  $typeahead.typeahead('val', selectedItemData.fullName);
  window.location.pathname += [
    selectedItemData.government.altTypeSlug,
    selectedItemData.government.slug,
    selectedItemData.slug
  ].join('/');
});

// Move cursor via arrows keys
$typeahead.bind('typeahead:cursorchange', function cursorchange() {
  $typeahead.typeahead('val', searchValue);
});

// Remove request
$typeahead.bind('keyup', function typeaheadChange() {
  if ($typeahead.val().length < 3) {
    clearTimeout(timer);
  }
});

// Store search value on typing
$typeahead.keyup(function keyup(event) {
  searchValue = $(event.target).val();
});

$typeahead.attr('placeholder', 'ELECTED OFFICIAL NAME');
$typeahead.attr('disabled', false);

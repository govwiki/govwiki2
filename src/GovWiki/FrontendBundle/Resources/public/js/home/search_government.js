var Handlebars = require('../vendor/handlebars.js');

/**
 * Typeahead search
 */

$(function() {

  var findMatches = function findMatches(query, syncCallback, asyncCallback) {
      $.ajax({
          method: 'GET',
          url: window.gw.urls.search_government + '?search=' + query
        }).success(function(data) {
          asyncCallback(data);
        });
    };

  var searchValue = '';

    // Init typeahead
  var $typeahead = $('.typeahead_government').typeahead({
      hint: true,
      highlight: true,
      minLength: 3
    }, {
      name: 'countries',
      source: findMatches,
      templates: {
          empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
          suggestion: Handlebars.compile('<div class="sugg-box">' +
                '<div class="sugg-state">{{state}}</div>' +
                '<div class="sugg-name">{{name}}</div>' +
                '<div class="sugg-type">{{type}}</div>' +
                '</div>')
        },
      updater: function(item) {
          alert(item);
        }
    });

    // Pressed mouse or enter button
  $typeahead.bind('typeahead:selected', function(obj, selectedItemData) {
      $typeahead.typeahead('val', selectedItemData.name);
      window.location.pathname += [selectedItemData.altTypeSlug, selectedItemData.slug].join('/');
    });

    // Move cursor via arrows keys
  $typeahead.bind('typeahead:cursorchange', function(obj) {
      $typeahead.typeahead('val', searchValue);
    });

    // Store search value on typing
  $typeahead.keyup(function(event) {
      searchValue = $(event.target).val();
    });

    // $typeahead.attr('placeholder', 'GOVERNMENT NAME');
  $typeahead.attr('disabled', false);

});

/**
 * Typeahead search
 */

$(function() {

    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp('('+q+')', 'gi');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str.gov_name)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };

    $.get('/data/search.json', function (data){

        var searchValue = '';

        // Init typeahead
        var $typeahead = $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: 'countries',
            source: substringMatcher(data.record),
            templates: {
                empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
                suggestion: Handlebars.compile('<div class="sugg-box">'+
                    '<div class="sugg-state">{{state}}</div>' +
                    '<div class="sugg-name">{{gov_name}}</div>' +
                    '<div class="sugg-type">{{gov_type}}</div>' +
                    '</div>')
            },
            updater: function (item) {
                alert(item);
            }
        });

        // Pressed mouse or enter button
        $typeahead.bind("typeahead:selected", function(obj, selectedItemData) {
            $typeahead.typeahead('val', selectedItemData.gov_name);
            window.location.pathname = [selectedItemData.altTypeSlug, selectedItemData.slug].join('/');
        });

        // Move cursor via arrows keys
        $typeahead.bind("typeahead:cursorchange", function(obj) {
            $typeahead.typeahead('val', searchValue);
        });

        // Store search value on typing
        $typeahead.keyup(function(event) {
            searchValue = $(event.target).val();
        });

        $typeahead.attr('placeholder', 'GOVERNMENT NAME');
        $typeahead.attr('disabled', false);

    });

});
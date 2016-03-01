var Handlebars = require('handlebars');

/**
 * Typeahead search
 *
 * @param {FormState} formState
 * @param {Selector} container - May be .first-condition or .second-condition
 */
function typeahead(container, formState) {

    if (!container) {
        alert('Please pass container selector');
        return true;
    }

    var self = this;
    self.governmentData = {};

    var searchValue = '',
        $container = $(container),
        $select = $container.find('select'),
        $typeaheadGovernment = $container.find('.typeahead_government'),
        $governmentCategories = $('.government-categories select');

    // Init typeahead
    $typeaheadGovernment.typeahead({
        hint: true,
        highlight: true,
        minLength: 3
    }, {
        name: 'countries',
        source: findMatches,
        templates: {
            empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
            suggestion: Handlebars.compile('<div class="sugg-box">'+
                '<div class="sugg-name">{{name}}</div>' +
                '</div>')
        },
        updater: function (item) {
            alert(item);
        }
    });

    // Pressed mouse or enter button
    $typeaheadGovernment.bind("typeahead:selected", function(obj, selectedGovernment) {

        $typeaheadGovernment.typeahead('val', selectedGovernment.name);

        self.governmentData = selectedGovernment
        loadFinancialYears(selectedGovernment.id);

    });

    // Move cursor via arrows keys
    $typeaheadGovernment.bind("typeahead:cursorchange", function(obj) {
        $typeaheadGovernment.typeahead('val', searchValue);
    });

    // Store search value on typing
    $typeaheadGovernment.keyup(function(event) {
        searchValue = $(event.target).val();
    });

    $typeaheadGovernment.attr('disabled', false);

    /**
     * Show error message if government not selected
     */
    $select.on('mousedown', function(e) {

        var $el = $(e.target);

        if ($el.hasClass('disabled')) {
            alert('Please, first select government');
            return false;
        }

    });

    $select.on('change', function(e) {

        var $el = $(e.target);

        var $selected = $el.find('option:selected');
        var value = $selected.attr('value');
        var text = $selected.text();

        if (value) {
            self.governmentData.year = {};
            self.governmentData.year.id = value;
            self.governmentData.year.year = text;
        }

    });

    /**
     * (Ajax, DOM)
     *
     * @param governmentId
     */
    function loadFinancialYears(governmentId) {

        if (!governmentId) {
            throw new Error('Please pass governmentId');
        }

        $.ajax({
            url: location.href,
            type: 'POST',
            data: 'yearByGovId=' + governmentId,
            success: createYearOptions,
            error: function () {
                alert('Something wrong, please try another government');
            }
        });

        /**
         * (DOM)
         *
         * @param data
         * @returns {boolean}
         */
        function createYearOptions(data) {

            if (!data || data.length == 0) {
                alert('Government has no data, please choose another');
                $typeaheadGovernment.typeahead('val', '');
                disableSelect(true);
                correctForm(false);
                return true;
            }

            disableSelect(false);
            correctForm(true);

            if (data.length === 1) {
                self.governmentData.year = {};
                self.governmentData.year.id = data[0].id;
                self.governmentData.year.year = data[0].year;
            }

            data.forEach(function(government) {
                $select.append('<option value="' + government.id + '">' + government.year + '</option>');
            });

        }

        /**
         * Disable select
         * @param {Boolean} disabled
         */
        function disableSelect(disabled) {

            $select.toggleClass('disabled', !!disabled);
            if (!!disabled) {
                $select.html('<option>YEAR</option>');
            } else {
                $select.html('');
            }

        }

        /**
         *
         * @param isCorrect
         */
        function correctForm(isCorrect) {

            if (container === '.first-condition') {
                formState.firstConditionCorrect = isCorrect;
            } else if (container === '.second-condition') {
                formState.secondConditionCorrect = isCorrect;
            }

            if (formState.firstConditionCorrect && formState.secondConditionCorrect ) {
                $governmentCategories.toggleClass('disabled', false);
                $governmentCategories.mousedown(); // TODO: Hardcoded, call outer handler
            } else {
                $governmentCategories.toggleClass('disabled', true);
            }

        }

    }

    /**
     * (Ajax)
     *
     * Matcher for typeahead
     * @param query
     * @param syncCallback
     * @param asyncCallback
     */
    var findMatches = function findMatches(query, syncCallback, asyncCallback) {
        $.ajax({
            method: 'GET',
            url: window.gw.urls.search +'?search='+ query
        }).success(function(data) {
            asyncCallback(data);
        });
    };

    return self;

}

module.exports = typeahead;

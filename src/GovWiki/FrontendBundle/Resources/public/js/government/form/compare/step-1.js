var Search = require('../../search/government.js');

/**
 * Constructor
 *
 * @param FormState
 * @param container
 * @constructor
 */
function Step (FormState, container) {

    this.container = container;
    this.$container = $(container);
    this.CurrentFormState = container == '.first-condition' ? FormState.firstStep : FormState.secondStep;
    this.$select = $(container + ' select');
    this.$loader = $('<div class="loader"></div>');
    this.init();

}

/**
 * Init step
 */
Step.prototype.init = function () {

    var self = this;

    self.handler_onMouseDownSelect();
    self.handler_onChangeSelect();

    //Typeahead initialization
    self.search = new Search(self.container, self.searchResponseCallback);

    // Pressed mouse or enter button
    self.search.$typeahead.bind("typeahead:selected", function (e, selectedGovernment) {
        self.CurrentFormState.data = selectedGovernment;
        self.createYearOptions(selectedGovernment);
    });

    // Start typing, triggered after select item
    self.search.$typeahead.bind('typeahead:asyncrequest', function(e) {
        self.loading(true);
    });


    self.search.$typeahead.bind('typeahead:asyncreceive', function(e) {
        self.loading(false);
    });

    self.search.$typeahead.bind('typeahead:asynccancel', function(e) {
        self.loading(false);
        self.lockSelect();
    });

    self.search.$typeahead.bind('typeahead:open', function(e) {
        self.lockSelect();
        self.CurrentFormState.incomplete();
    });

};


/**
 * (DOM)
 *
 * Unlock step
 */
Step.prototype.unlock = function() {
    this.search.$typeahead.toggleClass('disabled', false);
};


/**
 * (DOM)
 *
 * Lock step
 */
Step.prototype.lock = function() {
    this.search.$typeahead.toggleClass('disabled', true);
    this.$select.toggleClass('disabled', true);
};


/**
 * (DOM)
 *
 * Lock step
 */
Step.prototype.lockSelect = function() {
    this.$select.toggleClass('disabled', true);
};

/**
 * (DOM)
 *
 * Loading state
 * @param isLoading
 */
Step.prototype.loading = function(isLoading) {

    var display = isLoading ? 'none' : 'block';
    this.$select.css({display: display});

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
Step.prototype.createYearOptions = function(government) {

    var self = this;

    if (!government) {
        console.error('First argument not passed in createYearOptions() ');
        return true;
    }

    var sortedYears = government.years.sort(function(a, b) {
        return a < b;
    });

    self.CurrentFormState.data.year = government.years[0];

    disableSelect(false);

    self.$select.html('<option>YEAR</option>');

    sortedYears.forEach(function (year, index) {
        var selected = index == 0 ? 'selected' : '';
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
        isCorrect ? self.CurrentFormState.complete() : self.CurrentFormState.incomplete();
    }

};


/**
 * (Handler)
 *
 * On change select
 */
Step.prototype.handler_onChangeSelect = function () {

    var self = this;

    self.$select.on('change', function (e) {

        var $el = $(e.target);

        var $selected = $el.find('option:selected');
        var value = $selected.attr('value');
        var text = $selected.text();

        if (value) {
            self.CurrentFormState.data.year = value;
            self.CurrentFormState.complete();
        } else {
            alert('Please choose correct year');
            self.CurrentFormState.incomplete();
        }

    });

};


/**
 * Show error message if government not selected
 */
Step.prototype.handler_onMouseDownSelect = function () {

    var self = this;

    self.$select.on('mousedown', function (e) {

        var $el = $(e.target);

        if ($el.hasClass('disabled')) {
            alert('Please, first select government');
            return false;
        }

    });

};

module.exports = Step;
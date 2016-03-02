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
    this.CurrentFormState = container == '.first-condition' ? FormState.firstStep : FormState.secondStep;
    this.$select = $(container + ' select');
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
    self.search = new Search(self.container);

    // Pressed mouse or enter button
    self.search.$typeahead.bind("typeahead:selected", function (obj, selectedGovernment) {
        self.CurrentFormState.data = selectedGovernment;
        self.loadFinancialYears(selectedGovernment.id);
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
};


/**
 * (Ajax, DOM)
 *
 * @param governmentId
 */
Step.prototype.loadFinancialYears = function(governmentId) {

    if (!governmentId) {
        throw new Error('Please pass governmentId');
    }

    var self = this;

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
            self.search.$typeahead.typeahead('val', '');
            disableSelect(true);
            correctForm(false);
            return true;
        }

        disableSelect(false);
        correctForm(true);

        if (data.length === 1) {
            self.CurrentFormState.data.year = {};
            self.CurrentFormState.data.year.id = data[0].id;
            self.CurrentFormState.data.year.year = data[0].year;
        }

        data.forEach(function (government) {
            self.$select.append('<option value="' + government.id + '">' + government.year + '</option>');
        });

    }

    /**
     * Disable select
     * @param {Boolean} disabled
     */
    function disableSelect(disabled) {

        self.$select.toggleClass('disabled', !!disabled);
        if (!!disabled) {
            self.$select.html('<option>YEAR</option>');
        } else {
            self.$select.html('');
        }

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
            self.CurrentFormState.data.year = {};
            self.CurrentFormState.data.year.id = value;
            self.CurrentFormState.data.year.year = text;
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
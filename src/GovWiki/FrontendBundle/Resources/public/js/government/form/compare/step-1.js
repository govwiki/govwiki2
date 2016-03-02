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
        self.createYearOptions(selectedGovernment);

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

    if (government.years.length == 1) {
        console.log(self.CurrentFormState.data);
        self.CurrentFormState.data.year = government.years[0];
    }

    disableSelect(false);

    government.years.forEach(function (year) {
        var selected = government.years.length == 1 ? 'selected' : '';
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

        if (!value) {
            alert('Please choose correct year');
            self.CurrentFormState.incomplete();
        } else {
            self.CurrentFormState.complete();
        }

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
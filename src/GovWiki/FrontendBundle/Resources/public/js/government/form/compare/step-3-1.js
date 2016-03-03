/**
 * Constructor
 * @param FormState
 * @param container
 * @constructor
 */
function Step (FormState, container) {

    this.container = container;
    this.$governmentCategories = $(container);
    this.firstStep = FormState.firstStep;
    this.secondStep = FormState.secondStep;
    this.init();
}

/**
 * Init step
 */
Step.prototype.init = function () {

    this.handler_onChangeSelect();
    this.handler_onClickSelect();

};

/**
 * (Ajax, DOM)
 *
 * Unlock step
 */
Step.prototype.unlock = function() {
    this.$governmentCategories.toggleClass('disabled', false);
};

/**
 * Lock step
 */
Step.prototype.lock = function() {
    this.$governmentCategories.toggleClass('disabled', true);
};

/**
 * @param data
 * @param blockId
 */
Step.prototype.drawDiagramm = function(government, blockId, comparedData) {

    var chart, options, r, rows, vis_data;

    vis_data = new google.visualization.DataTable();

    vis_data.addColumn('string', 'Caption');
    vis_data.addColumn('number', 'Total Funds');
    rows = [];

    var captions = government.data;
    captions.forEach(function(item) {
        if (item.amount < 0) {
            item.amount = -parseInt(item.amount)
        }
        rows.push([item.caption, parseInt(item.amount)]);
    });

    vis_data.addRows(rows);
    options = {
        'title': 'Total ' + comparedData.category + ': ' + government.name,
        'titleTextStyle': {
            'fontSize': 16
        },
        'tooltip': {
            'textStyle': {
                'fontSize': 12
            }
        },
        'width': 470,
        'height': 350,
        'pieStartAngle': 60,
        'sliceVisibilityThreshold': 0,
        'forceIFrame': true,
        'chartArea': {
            width: '90%',
            height: '75%'
        }
    };
    chart = new google.visualization.PieChart(document.getElementById(blockId));
    chart.draw(vis_data, options);

};

/**
 * (Ajax, DOM)
 * TODO: Draft
 * If option selected, draw chart
 */
Step.prototype.handler_onChangeSelect = function() {

    var self = this;


    $(self.container).on('change', function (e) {

        var $el = $(e.target);
        var $selected = $el.find('option:selected');
        var tab = $selected.parent('optgroup').attr('label');

        var category = $selected.val();

        if (category) {
            $('#total-compare-column').hide();
            $('#total-compare-first-pie').show();
            $('#total-compare-second-pie').show();
            $('.government-categories .category').addClass('selected');
            $('.government-categories .caption').removeClass('selected');
        } else {
            alert('Please select one of category');
            return true;
        }

        var data = {
            firstGovernment: {
                id: self.firstStep.data.id,
                name: self.firstStep.data.name,
                year: self.firstStep.data.year
            },
            secondGovernment: {
                id: self.secondStep.data.id,
                name: self.secondStep.data.name,
                year: self.firstStep.data.year
            },
            category: category,
            tab: tab
        };

        data = JSON.stringify(data);

        $.ajax({
            url: window.gw.urls.compare,
            type: 'POST',
            data: data,
            contentType: 'application/json',
            success: function (comparedData) {
                self.drawDiagramm(comparedData.firstGovernment, 'total-compare-first-pie', comparedData);
                self.drawDiagramm(comparedData.secondGovernment, 'total-compare-second-pie', comparedData);
            }
        });

    });

};


/**
 * (Ajax, DOM)
 *
 * Check third input, if previous form items filled correct - load governments categories
 */
Step.prototype.handler_onClickSelect = function() {

    var self = this;

    $('.government-categories').on('mousedown', function (e) {

        var $el = $(e.target);

        if ($el.hasClass('disabled')) {
            alert('Please, first select governments');
            return false;
        } else if (!self.firstStep.completed || !self.secondStep.completed) {
            alert('Please, first enter all fields');
            return false;
        }

    });

};

module.exports = Step;

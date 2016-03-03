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
    this.loadMatchedCategories();
    this.$governmentCategories.toggleClass('disabled', false);
};

/**
 * Lock step
 */
Step.prototype.lock = function() {
    this.$governmentCategories.toggleClass('disabled', true);
};

/**
 * (Ajax, DOM)
 */
Step.prototype.loadMatchedCategories = function() {

    var self = this;
    var captions = {
        captions : [
            {
                id: self.firstStep.data.id,
                year: self.firstStep.data.year
            },
            {
                id: self.secondStep.data.id,
                year: self.secondStep.data.year
            }
        ]
    };

    var captionsJson = JSON.stringify(captions);

    $.ajax({
        url: window.gw.urls.captions,
        type: 'POST',
        contentType: 'application/json',
        data: captionsJson,
        success: function (data) {

            if (!data || data.length == 0) {
                alert('Not can find categories for current comparison');
                self.$governmentCategories.html('<option>ALL CATEGORIES</option>');
                self.$governmentCategories.toggleClass('disabled', true);
                return true;
            }

            self.$governmentCategories.toggleClass('disabled', false);

            /**
             * Create revenues group
             */
            var revenues = data.filter(function(item) {
                return item.category == 'Revenues';
            });

            if (revenues.length > 0) {
                self.$governmentCategories.append('<optgroup label="Revenues"></optgroup>');

                revenues.forEach(function (revenue) {
                    var $revenueGroup = self.$governmentCategories.find('[label="Revenues"]');
                    $revenueGroup.append('<option value="' + revenue.name + '">' + revenue.name + '</option>');
                });

            }

            /**
             * Create expenditures group
             */
            var expenditures = data.filter(function(item) {
                return item.category == 'Expenditures';
            });

            if (expenditures.length > 0) {
                self.$governmentCategories.append('<optgroup label="Expenditures"></optgroup>');

                expenditures.forEach(function (expenditure) {
                    var $expenditureGroup = self.$governmentCategories.find('[label="Expenditures"]');
                    $expenditureGroup.append('<option value="' + expenditure.name + '">' + expenditure.name + '</option>');
                });

            }

        },
        error: function () {
            alert('Something wrong, please try another government');
            self.$governmentCategories.toggleClass('disabled', true);
        }
    });

};

/**
 * @param data
 * @param blockId
 */
Step.prototype.drawDiagramm = function(government, blockId, captionCategory) {

    var chart, options, r, rows, vis_data;

    vis_data = new google.visualization.DataTable();

    vis_data.addColumn('string', 'Caption');
    vis_data.addColumn('number', 'Total Funds');
    rows = [];

    rows.push(['Total ' + captionCategory, parseInt(government.total)]);

    var captions = government.data;
    captions.forEach(function(item) {
        rows.push([item.caption, parseInt(item.amount)]);
    });
    console.log(rows);

    vis_data.addRows(rows);
    options = {
        'title': 'Compare',
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

        var caption = $selected.val();
        var category = $selected.parent('optgroup').attr('label');

        if (!caption) {
            alert('Please select one of captions');
            return true;
        }

        $('#total-compare-column').show();
        $('#total-compare-first-pie').hide();
        $('#total-compare-second-pie').hide();
        $('.government-categories .category').removeClass('selected');
        $('.government-categories .caption').addClass('selected');

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
            caption: caption,
            category: category
        };

        data = JSON.stringify(data);

        $.ajax({
            url: window.gw.urls.compare,
            type: 'POST',
            data: data,
            contentType: 'application/json',
            success: function (comparedData) {
                self.drawColumnChart(comparedData, 'total-compare-column');
                //self.drawDiagramm(comparedData.secondGovernment, 'total-compare-second-pie', comparedData.category);
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

Step.prototype.drawColumnChart = function(comparedData, blockId) {

    var chart, item, len3, options, p, r, ref1, rows, vis_data;

    var firstGovernment = comparedData.firstGovernment;
    var secondGovernment = comparedData.secondGovernment;

    rows = [
        ['City', 'Amount']
    ];

    rows.push([firstGovernment.name, parseInt(firstGovernment.data[0].amount)]);
    rows.push([secondGovernment.name, parseInt(secondGovernment.data[0].amount)]);

    options = {
        'title': 'Total ' + comparedData.category + ': ' + comparedData.caption,
        'titleTextStyle': {
            'fontSize': 16
        },
        'tooltip': {
            'textStyle': {
                'fontSize': 12
            }
        },
        'width': 500,
        'height': 350,
        'pieStartAngle': 60,
        'sliceVisibilityThreshold': .05,
        'forceIFrame': true,
        'chartArea': {
            width: '90%',
            height: '75%'
        }
    };
    vis_data = new google.visualization.arrayToDataTable(rows);
    chart = new google.visualization.ColumnChart(document.getElementById(blockId));
    chart.draw(vis_data, options);

};

module.exports = Step;

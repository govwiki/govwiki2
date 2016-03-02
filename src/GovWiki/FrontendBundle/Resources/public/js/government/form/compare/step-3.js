/**
 * Constructor
 * @param FormState
 * @param container
 * @constructor
 */
function Step (FormState, container) {

    this.$governmentCategories = $(container + ' select');
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

    $.ajax({
        url: location.href,
        type: 'POST',
        data: {
            governmentsId: [self.firstStep.data.id, self.firstStep.data.id]
        },
        success: function (data) {

            if (!data || data.length == 0) {
                alert('Not can find categories for current comparison');
                self.$governmentCategories.html('<option>ALL CATEGORIES</option>');
                self.$governmentCategories.toggleClass('disabled', true);
                return true;
            }

            self.$governmentCategories.toggleClass('disabled', false);
            self.$governmentCategories.html('');

            data.forEach(function (financial) {
                self.$governmentCategories.append('<option value="' + financial.id + '">' + financial.caption + '</option>');
            });

        },
        error: function () {
            alert('Something wrong, please try another government');
        }
    });

};

/**
 * @param data
 * @param blockId
 */
Step.prototype.drawDiagramm = function(data, blockId) {

    var chart, options, r, rows, vis_data;

    vis_data = new google.visualization.DataTable();

    vis_data.addColumn('string', 'Caption');
    vis_data.addColumn('number', 'Total Funds');
    rows = [];

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            r = [data[key].caption, parseInt(data[key].totalfunds)];
            rows.push(r);
        }
    }

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
        'sliceVisibilityThreshold': .05,
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

    $('.government-categories').on('change', function (e) {

        var $el = $(e.target);
        var $selected = $el.find('option:selected');

        var id = $selected.val();
        var category = $selected.text();

        var data = {
            comparedData: {
                firstMunicipality: {
                    id: self.firstStep.data.id,
                    name: self.firstStep.data.name,
                    year: {
                        id: self.firstStep.data.year.id,
                        name: self.firstStep.data.year.year
                    },
                    data: {}
                },
                secondMunicipality: {
                    id: self.secondStep.data.id,
                    name: self.secondStep.data.name,
                    year: {
                        id: self.secondStep.data.year.id,
                        name: self.secondStep.data.year.year
                    },
                    data: {}
                },
                category: {
                    id: id,
                    name: category
                }
            }
        };

        $.ajax({
            url: location.href,
            type: 'POST',
            data: data,
            success: function (comparedData) {

                if (comparedData.length > 0) {
                    for (i = 0; i < comparedData.length; i++) {
                        if (comparedData[i].governmentId == data.comparedData.firstMunicipality.id) {
                            data.comparedData.firstMunicipality['data'][comparedData[i].id] = comparedData[i];
                        }
                        if (comparedData[i].governmentId == data.comparedData.secondMunicipality.id) {
                            data.comparedData.secondMunicipality['data'][comparedData[i].id] = comparedData[i];
                        }
                    }
                }

                self.drawDiagramm(data.comparedData.firstMunicipality['data'], 'total-compare-first-pie');
                self.drawDiagramm(data.comparedData.secondMunicipality['data'], 'total-compare-second-pie');
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


$(function() {

    require('./graphs.js');
    new (require('./rank-popover.js'))();
    var Condition = require('./search/government.js');

    /**
     * Status of form fields
     * If form not filled - dependency fields will be .disabled
     *
     * @typedef FormState
     * @type {{firstConditionCorrect: boolean, secondConditionCorrect: boolean}}
     */
    var FormState = {
        firstConditionCorrect: false,
        secondConditionCorrect: false
    };

    var firstCondition = new Condition('.first-condition', FormState);
    var secondCondition = new Condition('.second-condition', FormState);

    var $governmentCategories = $('.government-categories select');
    var categoriesLoaded = false;

    /**
     * (Ajax, DOM)
     *
     * Check third input, if previous form items filled correct - load governments categories
     */
    $('.government-categories').on('mousedown', function(e) {

        var $el = $(e.target);

        if ($el.hasClass('disabled')) {
            alert('Please, first select governments');
            return false;
        } else if (!FormState.firstConditionCorrect || !FormState.secondConditionCorrect) {
            alert('Please, first enter all fields');
            return false;
        }

        if (!categoriesLoaded) {
            loadMatchedCategories();
        }

    });

    /**
     * (Ajax, DOM)
     * TODO: Draft
     * If option selected, draw chart
     */
    $('.government-categories').on('change', function(e) {

        var $el = $(e.target);
        var $selected = $el.find('option:selected');

        var id = $selected.val();
        var category = $selected.text();

        var data = {
            comparedData: {
                firstMunicipality: {
                    id: firstCondition.governmentData.id,
                    name: firstCondition.governmentData.name,
                    year: {
                        id: firstCondition.governmentData.year.id,
                        name: firstCondition.governmentData.year.year
                    },
                    data: {}
                },
                secondMunicipality: {
                    id: secondCondition.governmentData.id,
                    name: secondCondition.governmentData.name,
                    year: {
                        id: secondCondition.governmentData.year.id,
                        name: secondCondition.governmentData.year.year
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

                drawDiagramm(data.comparedData, 'total-compare-pie', 'Compare');
            }
        });

    });

    /**
     * (Ajax, DOM)
     */
    function loadMatchedCategories() {

        $.ajax({
            url: location.href,
            type: 'POST',
            data: {
                governmentsId: [firstCondition.governmentData.id, secondCondition.governmentData.id]
            },
            success: function (data) {

                if (!data || data.length == 0) {
                    alert('Not can find categories for current comparison');
                    $governmentCategories.html('<option>ALL CATEGORIES</option>');
                    $governmentCategories.toggleClass('disabled', true);
                    return true;
                }

                $governmentCategories.toggleClass('disabled', false);

                data.forEach(function(financial) {
                    $governmentCategories.append('<option value="' + financial.id + '">' + financial.caption + '</option>');
                });

            },
            error: function() {
                alert('Something wrong, please try another government');
            }
        });

    }


    /**
     * @param data
     * @param blockId
     */
    function drawDiagramm (data, blockId) {
        var obj = this;
        var chart, item, len3, options, p, r, ref1, rows, vis_data;

        vis_data = new google.visualization.DataTable();

        vis_data.addColumn('string', 'Total Gov. Expenditures');
        vis_data.addColumn('number', 'Total');
        rows = [];

        var revenues = data.firstMunicipality.data;
        for(var key in revenues){
            if(revenues.hasOwnProperty(key) && (revenues[key].caption != title)) {
                r = [revenues[key].caption, parseInt(revenues[key].dollarAmount)];
                rows.push(r);
            }
        }

        var revenues2 = data.secondMunicipality.data;
        for(var key2 in revenues2){
            if(revenues2.hasOwnProperty(key2) && (revenues2[key2].caption != title)) {
                r = [revenues2[key2].caption, parseInt(revenues2[key2].dollarAmount)];
                rows.push(r);
            }
        }

        vis_data.addRows(rows);
        options = {
            'title': title,
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
    }

    /**
     * Change fin statement year.
     */
    $('#fin-stmt-year').change(function() {
        var $this = $(this);
        $this.closest('form').submit();
        window.localStorage.setItem('tab', 'Financial_Statements');
    });

    var tab = window.localStorage.getItem('tab');
    if (tab) {
        window.localStorage.removeItem('tab');
        $('.nav-pills a[href="#' + tab + '"]').tab('show');
    }

});

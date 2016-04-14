var data = require('./glob.js').data;
var chart = require('./config.js').chart;
var rowSortFunction = require('./utils.js').rowSortFunction;

/**
 * Initialization
 */
function init() {

    handler_switchColumnOnFinancialTable();
    handler_switchChart();
    financialStatements_revenue();
    financialStatements_expenditures();

}

/**
 * #total-revenue-pie
 */
function financialStatements_revenue() {

    var chart, options, r, container, rows, vis_data;
    vis_data = new google.visualization.DataTable();
    vis_data.addColumn('string', 'Total Gov. Revenues');
    vis_data.addColumn('number', 'Total');
    vis_data.addColumn({type:'string', role:'tooltip'});
    rows = [];

    var revenues = data.financialStatements.Revenues;

    var total_amount = 0;

    // Prepare Revenues data to Google Tree Chart
    for(var rKey in revenues) {
        if (revenues.hasOwnProperty(rKey) && (revenues[rKey].caption != 'Total Revenues')){

            var subCategory = revenues[rKey];
            var subCatValue = getSubCatValue(subCategory);
            if (!subCatValue) {
                continue;
            }

            total_amount += parseInt(subCatValue);

        }
    }

    function renderTooltip(caption, totalfunds) {
        var percent = totalfunds * 100 / total_amount;
        percent = percent.toFixed(2);
        return '' + caption + ': ' + numeral(totalfunds).format('$0,0') + ' (' + percent + '%)';
    }

    for(var key in revenues){
        if(revenues.hasOwnProperty(key) && (revenues[key].caption != 'Total Revenues')) {
            var caption = revenues[key].translatedCaption;
            var totalfunds = parseInt(revenues[key].totalfunds);
            var tooltip = renderTooltip(caption, totalfunds);
            r = [caption, totalfunds, tooltip];
            rows.push(r);
        }
    }

    // Sort all records by amount
    rows.sort(rowSortFunction);

    vis_data.addRows(rows);

     container = 'total-revenue-pie';
     options = {
         'title': data.translations.total_revenue,
         'titleTextStyle': {
             'fontSize': 16
         },
         'tooltip': {
             'textStyle': {
                 'fontSize': 12
             }
         },
         width: '100%',
         height: '100%',
         'sliceVisibilityThreshold': 0,
         'forceIFrame': true,
         chartArea: {
             left: "3%",
             top: "13%",
             height: "94%",
             width: "94%"
         },
         legend: {
             position: 'top', maxLines: '6'
         }
     };

    chart = new google.visualization.PieChart(document.getElementById(container));
    chart.draw(vis_data, options);

}

/**
 * #total-expenditures-pie
 */
function financialStatements_expenditures() {

    var chart, options, r, container, rows, vis_data;
    vis_data = new google.visualization.DataTable();
    vis_data.addColumn('string', 'Total Gov. Expenditures');
    vis_data.addColumn('number', 'Total');
    vis_data.addColumn({type:'string', role:'tooltip'});
    rows = [];

    var expenditures = data.financialStatements.Expenditures;
    var total_amount = 0;

    // Prepare Revenues data to Google Tree Chart
    for(var rKey in expenditures) {
        if (expenditures.hasOwnProperty(rKey) && (expenditures[rKey].caption != 'Total Revenues')){

            var subCategory = expenditures[rKey];
            var subCatValue = getSubCatValue(subCategory);
            if (!subCatValue) {
                continue;
            }

            total_amount += parseInt(subCatValue);

        }
    }

    function renderTooltip(caption, totalfunds) {
        var percent = totalfunds * 100 / total_amount;
        percent = percent.toFixed(2);
        return '' + caption + ': ' + numeral(totalfunds).format('$0,0') + ' (' + percent + '%)';
    }

    for(var key in expenditures){
        if(expenditures.hasOwnProperty(key) && (expenditures[key].caption != 'Total Expenditures')) {
            var caption = expenditures[key].translatedCaption;
            var totalfunds = parseInt(expenditures[key].totalfunds);
            var tooltip = renderTooltip(caption, totalfunds);
            r = [caption, totalfunds, tooltip];
            rows.push(r);
        }
    }

    // Sort all records by amount
    rows.sort(rowSortFunction);

    vis_data.addRows(rows);

    container = 'total-expenditures-pie';
    options = {
        'title': data.translations.total_revenue,
        'titleTextStyle': {
            'fontSize': 16
        },
        'tooltip': {
            'textStyle': {
                'fontSize': 12
            }
        },
        width: '100%',
        height: '100%',
        'sliceVisibilityThreshold': 0,
        'forceIFrame': true,
        chartArea: {
            left: "3%",
            top: "13%",
            height: "94%",
            width: "94%"
        },
        legend: {
            position: 'top', maxLines: '6'
        }
    };

    chart = new google.visualization.PieChart(document.getElementById(container));
    chart.draw(vis_data, options);

}


/**
 * TODO: Refactor
 * #total-revenue-tree
 */
function financialStatementsTree_revenues() {

    var chart, RevenuesDataTable, vis_data, total_amount = 0, options, container;

    RevenuesDataTable = [
        ['Location', 'Parent', 'FinData', 'Heat'],
        [data.translations.total_revenue, null, 0, 0]
    ];

    var RevenuesData = data.financialStatements.Revenues;

    // Prepare Revenues data to Google Tree Chart
    for(var rKey in RevenuesData) {
        if (RevenuesData.hasOwnProperty(rKey) && (RevenuesData[rKey].caption != 'Total Revenues')){

            var subCategory = RevenuesData[rKey];
            var subCatValue = getSubCatValue(subCategory);
            if (!subCatValue) {
                continue;
            }

            RevenuesDataTable.push(
                [subCategory.translatedCaption, data.translations.total_revenue, parseInt(subCatValue), parseInt(subCatValue)]
            );

            total_amount += parseInt(subCatValue);

        }
    }

    container = 'total-revenue-tree';
    options = {
        highlightOnMouseOver: true,
        maxDepth: 1,
        maxPostDepth: 2,
        minHighlightColor: '#8c6bb1',
        midHighlightColor: '#9ebcda',
        maxHighlightColor: '#edf8fb',
        minColor: '#009688',
        midColor: '#f7f7f7',
        maxColor: '#ee8100',
        headerHeight: 15,
        showScale: true,
        width: '100%',
        height: 500,
        useWeightedAverageForAggregation: true,
        generateTooltip: revenuesTooltip
    };

    function revenuesTooltip(row, size, value) {
        var caption = vis_data.getValue(row, 0);
        var val = vis_data.getValue(row, 2);
        var percent = val * 100 / total_amount;
        percent = percent.toFixed(2);
        return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">' + caption + ': ' +
            numeral(val).format('$0,0') + ' (' + percent + '%)</div>';
    }


    vis_data = new google.visualization.arrayToDataTable(RevenuesDataTable);
    chart = new google.visualization.TreeMap(document.getElementById(container));
    chart.draw(vis_data, options);
}

/**
 * TODO: Refactor
 * #total-expenditures-tree
 */
function financialStatementsTree_expenditures() {

    var chart, ExpendituresDataTable, vis_data, total_amount = 0, options, container;

    ExpendituresDataTable = [
        ['Location', 'Parent', 'FinData', 'Heat'],
        [data.translations.total_expenditure, null, 0, 0]
    ];

    var ExpendituresData = data.financialStatements.Expenditures;

    // Prepare ExpendituresData data to Google Tree Chart
    for(var eKey in ExpendituresData) {
        if (ExpendituresData.hasOwnProperty(eKey)  && (ExpendituresData[eKey].caption != 'Total Expenditures')){

            var subCategory = ExpendituresData[eKey];
            var subCatValue = getSubCatValue(subCategory);
            if (!subCatValue) {
                continue;
            }

            ExpendituresDataTable.push(
                [subCategory.translatedCaption, data.translations.total_expenditure, parseInt(subCatValue), parseInt(subCatValue)]
            );

            total_amount += parseInt(subCatValue);

        }
    }

    container = 'total-expenditures-tree';
    options = {
        highlightOnMouseOver: true,
        maxDepth: 1,
        maxPostDepth: 2,
        minHighlightColor: '#8c6bb1',
        midHighlightColor: '#9ebcda',
        maxHighlightColor: '#edf8fb',
        minColor: '#009688',
        midColor: '#f7f7f7',
        maxColor: '#ee8100',
        headerHeight: 15,
        showScale: true,
        height: 500,
        useWeightedAverageForAggregation: true,
        generateTooltip: expendituresTooltip
    };

    function expendituresTooltip(row, size, value) {
        var caption = vis_data.getValue(row, 0);
        var val = vis_data.getValue(row, 2);
        var percent = val * 100 / total_amount;
        percent = percent.toFixed(2);
        return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">' + caption + ': ' +
            numeral(val).format('$0,0') + ' (' + percent + '%)</div>';
    }

    vis_data = new google.visualization.arrayToDataTable(ExpendituresDataTable);
    chart = new google.visualization.TreeMap(document.getElementById(container));
    chart.draw(vis_data, options);

}

function handler_switchColumnOnFinancialTable() {
    $('.financial-table select').on('change', function (e) {
        var $select = $(e.currentTarget);

        var $financialTable = $select.closest('.financial-table');
        $financialTable.find('tbody td:not(:first-child)').css({display: 'none'});

        var selectedColumn = $select.val();
        $financialTable.find('tbody td:nth-child(' + selectedColumn + ')').css({display: 'table-cell'});
    })
}

/**
 * #Financial_Statements (.chart-controls .btn)
 */
function handler_switchChart() {

    hideChartGroup('pie-charts', false);
    hideChartGroup('compare-charts', true);
    hideChartGroup('tree-charts', true);
    hideTableGroup('financialTable', true);
    hideTableGroup('compareTables', false);

    var mobile = '';

    $('#' + mobile + 'Financial_Statements').on('click', '.chart-controls .btn', function() {

        var chartType = this.getElementsByTagName('input')[0].id;

        if (chartType == 'chart'){
            hideTableGroup('financialTable', true);
            hideTableGroup('compareTables', false);
            hideChartGroup('pie-charts', false);
            hideChartGroup('compare-charts', true);
            hideChartGroup('tree-charts', true);
            if (!chart.financialStatements_revenues.init || !chart.financialStatements_expenditures.init) {
                financialStatements_revenue();
                financialStatements_expenditures();
            }

        } else if (chartType == 'tree-charts') {
            hideTableGroup('financialTable', true);
            hideTableGroup('compareTables', false);
            hideChartGroup('pie-charts', true);
            hideChartGroup('compare-charts', true);
            hideChartGroup('tree-charts', false);
            if (!chart.financialStatementsTree_expenditures.init || !chart.financialStatementsTree_revenues.init) {
                financialStatementsTree_expenditures();
                financialStatementsTree_revenues();
            }
        } else if (chartType == 'compare-charts') {
            hideTableGroup('financialTable', false);
            hideTableGroup('compareTables', true);
            hideChartGroup('pie-charts', true);
            hideChartGroup('compare-charts', false);
            hideChartGroup('tree-charts', true);
            if (!chart.financialStatementsTree_expenditures.init || !chart.financialStatementsTree_revenues.init) {
                financialStatementsTree_expenditures();
                financialStatementsTree_revenues();
            }
        }

    });

    function hideTableGroup(tableGroup, hide) {

        var display = hide ? {display: 'none'} : {display: 'table'};

        if (tableGroup == 'financialTable') {
            $('.compare-first-table').css(display);
            $('.compare-second-table').css(display);

        } else if (tableGroup == 'compareTables') {
            $('.financial-table').css(display);
        }

    }

    /**
     * Hide chart group. Group may contain few charts
     */
    function hideChartGroup(chartGroup, hide) {

        var display = hide ? {display: 'none'} : {display: 'block'};

        var mobile = '';

        if (chartGroup == 'pie-charts') {
            $('#' + mobile + 'total-expenditures-pie').css(display);
            $('#' + mobile + 'total-revenue-pie').css(display);

        } else if (chartGroup == 'compare-charts') {
            if (hide) {
                $('#' + mobile + 'total-compare-pie').css(display);
                $('#' + mobile + 'total-compare-first-pie').css(display);
                $('#' + mobile + 'total-compare-second-pie').css(display);
                $('#' + mobile + 'total-compare-column').css(display);
            } else {
                var $selected = $('.government-categories .selected');
                var category = $selected.hasClass('category');
                var caption = $selected.hasClass('caption');
                if (category) {
                    $('#' + mobile + 'total-compare-first-pie').css(display);
                    $('#' + mobile + 'total-compare-second-pie').css(display);
                } else if (caption) {
                    $('#' + mobile + 'total-compare-column').css(display);
                } else {
                    $('#' + mobile + 'total-compare-first-pie').css(display);
                    $('#' + mobile + 'total-compare-second-pie').css(display);
                }

                $('#' + mobile + 'total-compare-pie').css(display);

            }

        } else if (chartGroup == 'tree-charts') {
            $('#' + mobile + 'total-expenditures-tree').css(display);
            $('#' + mobile + 'total-revenue-tree').css(display);
        }

    }

}

/**
 * TODO: Hardcoded!! Please ask the question to client, which field must be there?
 */
function getSubCatValue(subCategory) {

    if (subCategory.totalfunds) {

        if (subCategory.totalfunds < 0) {
            subCategory.totalfunds = -(subCategory.totalfunds);
        }

    }

    return subCategory.totalfunds || false;
}

module.exports = {
    init: init,
    initAll: init,
    handler_switchChart: handler_switchChart
};
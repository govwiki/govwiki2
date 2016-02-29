var data = require('./glob.js').data;
var chart = require('./config.js').chart;

/**
 * Initialization
 */
function init() {
    handler_switchChart();
    financialStatements_revenue();
    financialStatements_expenditures();
    financialStatementsTree_expenditures();
    financialStatementsTree_revenues();
}

/**
 * #total-revenue-pie
 */
function financialStatements_revenue() {

    var chart, item, len3, options, p, r, ref1, rows, vis_data;
    vis_data = new google.visualization.DataTable();
    vis_data.addColumn('string', 'Total Gov. Expenditures');
    vis_data.addColumn('number', 'Total');
    rows = [];

    var revenues = data.financialStatements.Revenues;
    for(var key in revenues){
        if(revenues.hasOwnProperty(key) && (revenues[key].caption != 'Total Revenues')) {
            r = [revenues[key].caption, parseInt(revenues[key].totalfunds)];
            rows.push(r);
        }
    }

    vis_data.addRows(rows);
    options = {
        'title': 'Total Revenues',
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
    chart = new google.visualization.PieChart(document.getElementById('total-revenue-pie'));
    chart.draw(vis_data, options);
}

/**
 * #total-expenditures-pie
 */
function financialStatements_expenditures() {

    var chart, item, len3, options, p, r, ref1, rows, vis_data;
    vis_data = new google.visualization.DataTable();
    vis_data.addColumn('string', 'Total Gov. Expenditures');
    vis_data.addColumn('number', 'Total');
    rows = [];

    var expenditures = data.financialStatements.Expenditures;
    for(var key in expenditures){
        if(expenditures.hasOwnProperty(key) && (expenditures[key].caption != 'Total Expenditures')) {
            r = [expenditures[key].caption, parseInt(expenditures[key].totalfunds)];
            rows.push(r);
        }
    }

    vis_data.addRows(rows);
    options = {
        'title': 'Total Expenditures',
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
    chart = new google.visualization.PieChart(document.getElementById('total-expenditures-pie'));
    chart.draw(vis_data, options);
}


/**
 * TODO: Refactor
 * #total-revenue-tree
 */
function financialStatementsTree_revenues() {

    var chart, item, len3, options, p, r, ref1, RevenuesDataTable, vis_data;

    RevenuesDataTable = [
        ['Location', 'Parent', 'FinData', 'Heat'],
        ['Total Revenues', null, 0, 0]
    ];

    var RevenuesData = data.financialStatements.Revenues;

    // Prepare Revenues data to Google Tree Chart
    for(var rKey in RevenuesData) {
        if (RevenuesData.hasOwnProperty(rKey)){

            var subCategory = RevenuesData[rKey];
            var subCatValue = getSubCatValue(subCategory);
            if (!subCatValue) {
                continue;
            }

            RevenuesDataTable.push(
                [subCategory.caption, 'Total Revenues', parseInt(subCatValue), parseInt(subCatValue)]
            );

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

    var options = {
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
        generateTooltip: revenuesTooltip
    };

    function revenuesTooltip(row, size, value) {
        var val = vis_data.getValue(row, 2);
        return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">Total Funds: ' +
            numeral(val).format('$0,0'); + '</div>';
    }


    vis_data = new google.visualization.arrayToDataTable(RevenuesDataTable);
    chart = new google.visualization.TreeMap(document.getElementById('total-revenue-tree'));
    chart.draw(vis_data, options);
}

/**
 * TODO: Refactor
 * #total-expenditures-tree
 */
function financialStatementsTree_expenditures() {

    var chart, item, len3, options, p, r, ref1, ExpendituresDataTable, RevenuesDataTable, vis_data;

    ExpendituresDataTable = [
        ['Location', 'Parent', 'FinData', 'Heat'],
        ['Total Expenditures', null, 0, 0]
    ];

    var ExpendituresData = data.financialStatements.Expenditures;

    // Prepare ExpendituresData data to Google Tree Chart
    for(var eKey in ExpendituresData) {
        if (ExpendituresData.hasOwnProperty(eKey)){

            var subCategory = ExpendituresData[eKey];
            var subCatValue = getSubCatValue(subCategory);
            if (!subCatValue) {
                continue;
            }

            ExpendituresDataTable.push(
                [subCategory.caption, 'Total Expenditures', parseInt(subCatValue), parseInt(subCatValue)]
            );

        }
    }

    function getSubCatValue(subCategory) {

        if (subCategory.totalfunds) {

            if (subCategory.totalfunds < 0) {
                subCategory.totalfunds = -(subCategory.totalfunds);
            }

        }

        return subCategory.totalfunds || false;
    }

    var options = {
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
        var val = vis_data.getValue(row, 2);
        return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">Total Funds: ' +
            numeral(val).format('$0,0'); + '</div>';
    }

    vis_data = new google.visualization.arrayToDataTable(ExpendituresDataTable);
    chart = new google.visualization.TreeMap(document.getElementById('total-expenditures-tree'));
    chart.draw(vis_data, options);

}

/**
 * #Financial_Statements (.chart-controls .btn)
 */
function handler_switchChart() {
    $('#Financial_Statements').on('click', '.chart-controls .btn', function() {

        var chartType = this.getElementsByTagName('input')[0].id;

        if (chartType == 'chart'){
            hideChartGroup('pie-charts', false);
            hideChartGroup('tree-chart', true);
            hideChartGroup('tree-charts', true);
            if (!chart.financialStatements_revenues.init || !chart.financialStatements_expenditures.init) {
                financialStatements_revenue();
                financialStatements_expenditures();
            }

        } else if (chartType == 'tree-charts') {
            hideChartGroup('pie-charts', true);
            hideChartGroup('tree-chart', true);
            hideChartGroup('tree-charts', false);
            if (!chart.financialStatementsTree_expenditures.init || !chart.financialStatementsTree_revenues.init) {
                financialStatementsTree_expenditures();
                financialStatementsTree_revenues();
            }
        }

        /**
         * Hide chart group. Group may contain few charts
         */
        function hideChartGroup(chartGroup, hide) {

            var display = hide ? {display: 'none'} : {display: 'block'};

            if (chartGroup == 'pie-charts') {
                $('#total-expenditures-pie').css(display);
                $('#total-revenue-pie').css(display);

            } else if (chartGroup == 'tree-chart') {
                $('#total-tree').css(display);

            } else if (chartGroup == 'tree-charts') {
                $('#total-expenditures-tree').css(display);
                $('#total-revenue-tree').css(display);
            }

        }

    });
}

module.exports = {
    init: init,
    initAll: init
};
var data = require('./glob.js').data;
var chartStatus = require('./config.js').chart;
var rowSortFunction = require('./utils.js').rowSortFunction;

/**
 * Initialization
 */
function init() {
  handlerSwitchChart();
  revenuePie();
  expendituresPie();
}

function renderTooltip(caption, totalfunds, totalAmount) {
  var percent = totalfunds * 100 / totalAmount;
  percent = percent.toFixed(2);
  return '' + caption + ': ' + numeral(totalfunds).format('$0,0') + ' (' + percent + '%)';
}

/**
 * #total-revenue-pie
 */
function revenuePie() {
  var subCatValue;
  var subCategory;
  var rKey;
  var tooltip;
  var totalfunds;
  var caption;
  var chart;
  var options;
  var r;
  var container;
  var rows;
  var visData;
  var revenues = data.financialStatements.Revenues;
  var totalAmount = 0;
  var key;

  visData = new google.visualization.DataTable();
  visData.addColumn('string', 'Total Gov. Revenues');
  visData.addColumn('number', 'Total');
  visData.addColumn({ type: 'string', role: 'tooltip' });
  rows = [];

  // Prepare Revenues data to Google Tree Chart
  for (rKey in revenues) {
    if (revenues.hasOwnProperty(rKey) && (revenues[rKey].caption !== 'Total Revenues')) {
      subCategory = revenues[rKey];
      subCatValue = getSubCatValue(subCategory);
      if (!subCatValue) {
        continue;
      }

      totalAmount += parseInt(subCatValue, 10);
    }
  }

  for (key in revenues) {
    if (revenues.hasOwnProperty(key) && (revenues[key].caption !== 'Total Revenues')) {
      caption = revenues[key].translatedCaption;
      totalfunds = parseInt(revenues[key].totalfunds, 10);
      tooltip = renderTooltip(caption, totalfunds, totalAmount);
      r = [caption, totalfunds, tooltip];
      rows.push(r);
    }
  }

  // Sort all records by amount
  rows.sort(rowSortFunction);

  visData.addRows(rows);

  container = 'total-revenue-pie';
  options = {
    title: data.translations.total_revenue,
    titleTextStyle: {
      fontSize: 16
    },
    tooltip: {
      textStyle: {
        fontSize: 12
      }
    },
    width: 470,
    height: 350,
    sliceVisibilityThreshold: 0,
    forceIFrame: true,
    chartArea: {
      width: '90%',
      height: '75%'
    }
  };

  chart = new google.visualization.PieChart(document.getElementById(container));
  chart.draw(visData, options);
}

/**
 * #total-expenditures-pie
 */
function expendituresPie() {
  var subCatValue;
  var subCategory;
  var tooltip;
  var totalfunds;
  var caption;
  var chart;
  var options;
  var r;
  var container;
  var rows;
  var visData;
  var rKey;
  var key;
  var expenditures = data.financialStatements.Expenditures;
  var totalAmount = 0;

  visData = new google.visualization.DataTable();
  visData.addColumn('string', 'Total Gov. Expenditures');
  visData.addColumn('number', 'Total');
  visData.addColumn({ type: 'string', role: 'tooltip' });
  rows = [];

  // Prepare Revenues data to Google Tree Chart
  for (rKey in expenditures) {
    if (expenditures.hasOwnProperty(rKey) && (expenditures[rKey].caption !== 'Total Revenues')) {
      subCategory = expenditures[rKey];
      subCatValue = getSubCatValue(subCategory);
      if (!subCatValue) {
        continue;
      }

      totalAmount += parseInt(subCatValue, 10);
    }
  }

  for (key in expenditures) {
    if (expenditures.hasOwnProperty(key) && (expenditures[key].caption !== 'Total Expenditures')) {
      caption = expenditures[key].translatedCaption;
      totalfunds = parseInt(expenditures[key].totalfunds, 10);
      tooltip = renderTooltip(caption, totalfunds);
      r = [caption, totalfunds, tooltip];
      rows.push(r);
    }
  }

  // Sort all records by amount
  rows.sort(rowSortFunction);

  visData.addRows(rows);

  container = 'total-expenditures-pie';
  options = {
    title: data.translations.total_expenditure,
    titleTextStyle: {
      fontSize: 16
    },
    tooltip: {
      textStyle: {
        fontSize: 12
      }
    },
    width: 470,
    height: 350,
    sliceVisibilityThreshold: 0,
    forceIFrame: true,
    chartArea: {
      width: '90%',
      height: '75%'
    }
  };

  chart = new google.visualization.PieChart(document.getElementById(container));
  chart.draw(visData, options);
}


/**
 * TODO: Refactor
 * #total-revenue-tree
 */
function revenuesTree() {
  var chart;
  var RevenuesDataTable;
  var visData;
  var totalAmount = 0;
  var options;
  var container;
  var subCatValue;
  var subCategory;
  var rKey;
  var RevenuesData = data.financialStatements.Revenues;

  RevenuesDataTable = [
    ['Location', 'Parent', 'FinData', 'Heat'],
    [data.translations.total_revenue, null, 0, 0]
  ];

  // Prepare Revenues data to Google Tree Chart
  for (rKey in RevenuesData) {
    if (RevenuesData.hasOwnProperty(rKey) && (RevenuesData[rKey].caption !== 'Total Revenues')) {
      subCategory = RevenuesData[rKey];
      subCatValue = getSubCatValue(subCategory);

      if (!subCatValue) {
        continue;
      }

      RevenuesDataTable.push(
        [
          subCategory.translatedCaption,
          data.translations.total_revenue,
          parseInt(subCatValue, 10),
          parseInt(subCatValue, 10)
        ]
      );

      totalAmount += parseInt(subCatValue, 10);
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
    height: 500,
    useWeightedAverageForAggregation: true,
    generateTooltip: revenuesTooltip
  };

  function revenuesTooltip(row) {
    var caption = visData.getValue(row, 0);
    var val = visData.getValue(row, 2);
    var percent = val * 100 / totalAmount;
    percent = percent.toFixed(2);
    return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">' + caption + ': ' +
      numeral(val).format('$0,0') + ' (' + percent + '%)</div>';
  }


  visData = google.visualization.arrayToDataTable(RevenuesDataTable);
  chart = new google.visualization.TreeMap(document.getElementById(container));
  chart.draw(visData, options);
}

/**
 * TODO: Refactor
 * #total-expenditures-tree
 */
function expendituresTree() {
  var subCatValue;
  var subCategory;
  var chart;
  var ExpendituresDataTable;
  var visData;
  var eKey;
  var totalAmount = 0;
  var options;
  var container;
  var ExpendituresData = data.financialStatements.Expenditures;

  ExpendituresDataTable = [
    ['Location', 'Parent', 'FinData', 'Heat'],
    [data.translations.total_expenditure, null, 0, 0]
  ];

  // Prepare ExpendituresData data to Google Tree Chart
  for (eKey in ExpendituresData) {
    if (ExpendituresData.hasOwnProperty(eKey) && (ExpendituresData[eKey].caption !== 'Total Expenditures')) {
      subCategory = ExpendituresData[eKey];
      subCatValue = getSubCatValue(subCategory);
      if (!subCatValue) {
        continue;
      }

      ExpendituresDataTable.push(
        [
          subCategory.translatedCaption,
          data.translations.total_expenditure,
          parseInt(subCatValue, 10),
          parseInt(subCatValue, 10)
        ]
      );

      totalAmount += parseInt(subCatValue, 10);
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

  function expendituresTooltip(row) {
    var caption = visData.getValue(row, 0);
    var val = visData.getValue(row, 2);
    var percent = val * 100 / totalAmount;
    percent = percent.toFixed(2);
    return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">' + caption + ': ' +
      numeral(val).format('$0,0') + ' (' + percent + '%)</div>';
  }

  visData = google.visualization.arrayToDataTable(ExpendituresDataTable);
  chart = new google.visualization.TreeMap(document.getElementById(container));
  chart.draw(visData, options);
}

/**
 * #Financial_Statements (.chart-controls .btn)
 */
function handlerSwitchChart() {
  hideChartGroup('pie-charts', false);
  hideChartGroup('compare-charts', true);
  hideChartGroup('tree-charts', true);

  $('#Financial_Statements').on('click', '.chart-controls .btn', function click() {
    var chartType = this.getElementsByTagName('input')[0].id;

    if (chartType === 'chart') {
      hideTableGroup('financialTable', true);
      hideTableGroup('compareTables', false);
      hideChartGroup('pie-charts', false);
      hideChartGroup('compare-charts', true);
      hideChartGroup('tree-charts', true);
      if (!chartStatus.revenuePie.init ||
        !chartStatus.expendituresPie.init) {
        revenuePie();
        expendituresPie();
      }
    } else if (chartType === 'tree-charts') {
      hideTableGroup('financialTable', true);
      hideTableGroup('compareTables', false);
      hideChartGroup('pie-charts', true);
      hideChartGroup('compare-charts', true);
      hideChartGroup('tree-charts', false);
      if (!chartStatus.expendituresTree.init ||
        !chartStatus.revenuesTree.init) {
        expendituresTree();
        revenuesTree();
      }
    } else if (chartType === 'compare-charts') {
      hideTableGroup('financialTable', false);
      hideTableGroup('compareTables', true);
      hideChartGroup('pie-charts', true);
      hideChartGroup('compare-charts', false);
      hideChartGroup('tree-charts', true);
      if (!chartStatus.expendituresTree.init ||
        !chartStatus.revenuesTree.init) {
        expendituresTree();
        revenuesTree();
      }
    }
  });

  function hideTableGroup(tableGroup, hide) {
    var display = hide ? { display: 'none' } : { display: 'table' };

    if (tableGroup === 'financialTable') {
      $('.compare-first-table').css(display);
      $('.compare-second-table').css(display);
    } else if (tableGroup === 'compareTables') {
      $('.financial-table').css(display);
    }
  }

  /**
   * Hide chart group. Group may contain few charts
   */
  function hideChartGroup(chartGroup, hide) {
    var caption;
    var category;
    var $selected;
    var display = hide ? { display: 'none' } : { display: 'block' };

    if (chartGroup === 'pie-charts') {
      $('#total-expenditures-pie').css(display);
      $('#total-revenue-pie').css(display);
    } else if (chartGroup === 'compare-charts') {
      if (hide) {
        $('#total-compare-pie').css(display);
        $('#total-compare-first-pie').css(display);
        $('#total-compare-second-pie').css(display);
        $('#total-compare-column').css(display);
      } else {
        $selected = $('.government-categories .selected');
        category = $selected.hasClass('category');
        caption = $selected.hasClass('caption');
        if (category) {
          $('#total-compare-first-pie').css(display);
          $('#total-compare-second-pie').css(display);
        } else if (caption) {
          $('#total-compare-column').css(display);
        } else {
          $('#total-compare-first-pie').css(display);
          $('#total-compare-second-pie').css(display);
        }

        $('#total-compare-pie').css(display);
      }
    } else if (chartGroup === 'tree-charts') {
      $('#total-expenditures-tree').css(display);
      $('#total-revenue-tree').css(display);
    }
  }
}

/**
 * TODO: Hardcoded!! Please ask the question to client, which field must be there?
 */
function getSubCatValue(subCategory) {
  var cpySubCategory = $.extend({}, subCategory);
  if (cpySubCategory.totalfunds) {
    if (cpySubCategory.totalfunds < 0) {
      cpySubCategory.totalfunds = -(subCategory.totalfunds);
    }
  }

  return cpySubCategory.totalfunds || false;
}

module.exports = {
  init: init,
  initAll: init,
  handlerSwitchChart: handlerSwitchChart
};

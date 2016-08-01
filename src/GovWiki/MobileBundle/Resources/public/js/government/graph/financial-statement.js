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

  function renderTooltip(tooltipCaption, tooltipTotalfunds) {
    var percent = tooltipTotalfunds * 100 / totalAmount;
    percent = percent.toFixed(2);
    return '' + tooltipCaption + ': ' + numeral(tooltipTotalfunds).format('$0,0') + ' (' + percent + '%)';
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
    width: '100%',
    height: '100%',
    sliceVisibilityThreshold: 0,
    forceIFrame: true,
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

  // Prepare Expenditures data to Google Tree Chart
  for (rKey in expenditures) {
    if (expenditures.hasOwnProperty(rKey) && (expenditures[rKey].caption !== 'Total Expenditures')) {
      subCategory = expenditures[rKey];
      subCatValue = getSubCatValue(subCategory);
      if (!subCatValue) {
        continue;
      }

      totalAmount += parseInt(subCatValue, 10);
    }
  }

  function renderTooltip(tooltipCaption, tooltipTotalfunds) {
    var percent = tooltipTotalfunds * 100 / totalAmount;
    percent = percent.toFixed(2);
    return '' + tooltipCaption + ': ' + numeral(tooltipTotalfunds).format('$0,0') + ' (' + percent + '%)';
  }

  for (key in expenditures) {
    if (expenditures.hasOwnProperty(key) && (expenditures[key].caption !== 'Total Expenditures')) {
      caption = expenditures[key].translatedCaption;
      totalfunds = parseInt(expenditures[key].totalfunds, 10);
      tooltip = renderTooltip(caption, totalfunds, totalAmount);
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
    width: '100%',
    height: '100%',
    sliceVisibilityThreshold: 0,
    forceIFrame: true,
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
  chart.draw(visData, options);
}


/**
 * TODO: Refactor
 * #total-revenue-tree
 */
function revenuesTree() {
  //var chart;
  //var RevenuesDataTable;
  //var visData;
  //var totalAmount = 0;
  //var options;
  //var container;
  //var subCatValue;
  //var subCategory;
  //var rKey;
  //var RevenuesData = data.financialStatements.Revenues;
  //
  //RevenuesDataTable = [
  //  ['Location', 'Parent', 'FinData', 'Heat'],
  //  [data.translations.total_revenue, null, 0, 0]
  //];
  //
  //// Prepare Revenues data to Google Tree Chart
  //for (rKey in RevenuesData) {
  //  if (RevenuesData.hasOwnProperty(rKey) && (RevenuesData[rKey].caption !== 'Total Revenues')) {
  //    subCategory = RevenuesData[rKey];
  //    subCatValue = getSubCatValue(subCategory);
  //
  //    if (!subCatValue) {
  //      continue;
  //    }
  //
  //    RevenuesDataTable.push(
  //      [
  //        subCategory.translatedCaption,
  //        data.translations.total_revenue,
  //        parseInt(subCatValue, 10),
  //        parseInt(subCatValue, 10)
  //      ]
  //    );
  //
  //    totalAmount += parseInt(subCatValue, 10);
  //  }
  //}
  //
  //container = 'total-revenue-tree';
  //options = {
  //  highlightOnMouseOver: true,
  //  maxDepth: 1,
  //  maxPostDepth: 2,
  //  minHighlightColor: '#8c6bb1',
  //  midHighlightColor: '#9ebcda',
  //  maxHighlightColor: '#edf8fb',
  //  minColor: '#009688',
  //  midColor: '#f7f7f7',
  //  maxColor: '#ee8100',
  //  headerHeight: 15,
  //  showScale: true,
  //  width: '100%',
  //  height: 500,
  //  useWeightedAverageForAggregation: true,
  //  generateTooltip: revenuesTooltip
  //};
  //
  //function revenuesTooltip(row) {
  //  var caption = visData.getValue(row, 0);
  //  var val = visData.getValue(row, 2);
  //  var percent = val * 100 / totalAmount;
  //  percent = percent.toFixed(2);
  //  return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">' + caption + ': ' +
  //    numeral(val).format('$0,0') + ' (' + percent + '%)</div>';
  //}
  //
  //
  //visData = google.visualization.arrayToDataTable(RevenuesDataTable);
  //chart = new google.visualization.TreeMap(document.getElementById(container));
  //chart.draw(visData, options);

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

//function handlerSwitchColumnOnFinancialTable() {
//  $('.financial-table select').on('change', function (e) {
//    var $select = $(e.currentTarget);
//	var financialTable;
//	var selectedColumn;
//
//    $financialTable = $select.closest('.financial-table');
//    $financialTable.find('tbody td:not(:first-child)').css({display: 'none'});
//
//    selectedColumn = $select.val();
//    $financialTable.find('tbody td:nth-child(' + selectedColumn + ')').css({display: 'table-cell'});
//  })
//}

/**
 * #Financial_Statements (.chart-controls .btn)
 */
function handlerSwitchChart() {
  var mobile = '';

  hideChartGroup('pie-charts', false);
  hideChartGroup('compare-charts', true);
  hideChartGroup('tree-charts', true);
  hideTableGroup('financialTable', true);
  hideTableGroup('compareTables', false);

  $('#' + mobile + 'Financial_Statements').on('click', '.chart-controls .btn',
    function mobileFinancialStatementClick() {
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
      $('#' + mobile + 'total-expenditures-pie').css(display);
      $('#' + mobile + 'total-revenue-pie').css(display);
    } else if (chartGroup === 'compare-charts') {
      if (hide) {
        $('#' + mobile + 'total-compare-pie').css(display);
        $('#' + mobile + 'total-compare-first-pie').css(display);
        $('#' + mobile + 'total-compare-second-pie').css(display);
        $('#' + mobile + 'total-compare-column').css(display);
      } else {
        $selected = $('.government-categories .selected');
        category = $selected.hasClass('category');
        caption = $selected.hasClass('caption');
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
    } else if (chartGroup === 'tree-charts') {
      $('#' + mobile + 'total-expenditures-tree').css(display);
      $('#' + mobile + 'total-revenue-tree').css(display);
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
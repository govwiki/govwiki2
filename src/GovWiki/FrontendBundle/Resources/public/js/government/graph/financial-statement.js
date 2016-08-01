var data = require('./glob.js').data;
var chartStatus = require('./config.js').chart;
var rowSortFunction = require('./utils.js').rowSortFunction;
var d3 = require('d3');

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
  var selector = '#total-revenue-tree';
  var width = $(selector).width() - 50;
  var treemap;
  var root;
  var tooltip;
  var treemapView;
  var color;
  var fontSize;
  var rKey;
  var subCategory;
  var subCatValue;
  var totalAmount = 0.0;
  var minAmount = Number.MAX_VALUE;
  var maxAmount = 0.0;
  var index = 0;
  var RevenuesData = data.financialStatements.Revenues;
  var revenues = {
    name: data.translations.total_revenue,
    children: []
  };

  // Set treemap title.
  $('#total-revenue-tree-title').text(data.translations.total_revenue);

  // Prepare Revenues data to Google Tree Chart
  for (rKey in RevenuesData) {
    if (RevenuesData.hasOwnProperty(rKey) && (RevenuesData[rKey].caption !== 'Total Revenues')) {
      subCategory = RevenuesData[rKey];
      subCatValue = parseInt(getSubCatValue(subCategory), 10);

      if (!subCatValue) {
        continue;
      }

      revenues.children.push({
        name: subCategory.translatedCaption,
        index: index++,
        amount: subCatValue
      });

      if (subCatValue < minAmount) {
        minAmount = subCatValue;
      }
      if (subCatValue > maxAmount) {
        maxAmount = subCatValue;
      }

      totalAmount += subCatValue;
    }
  }

  // Create tooltip.
  tooltip = d3.select("body").append("div")
    .attr("class", "treemap-tooltip")
    .style("opacity", 0);

  // Init treemap layout.
  treemap = d3
    .treemap()
    .size([ width, width ])
    .padding(1);

  // Prepare data for d3.
  root = d3.hierarchy(revenues)
    .sum(function(row) { return row.amount; } );

  // Init color.
  color = d3.scaleOrdinal()
    .range(d3.schemeCategory10.map(function (c) {
      var _c = d3.rgb(c);
      _c.opacity = 0.6;
      return _c;
    }));

  // Init fontSize.
  fontSize = d3.scaleLinear()
    .domain([minAmount, maxAmount])
    .rangeRound([10, 20]);

  // Form data in treemap.
  treemap(root);

  // Add treemap root svg element.
  treemapView = d3.select(selector)
    .append('div')
    .style('width', width + 'px')
    .style('height', width + 'px')
    .style('position', 'relative');

  // Create treemap group element.
  treemapView
    .selectAll('div')
    .data(root.leaves())
    .enter()
      .append('div')
        .attr('id', function (row) { return 'rect-' + row.data.key; })
        .style('overflow', 'hidden')
        .style('text-align', 'center')
        .style('display', 'table')
        .style('left', function (row) { return row.x0 + 'px'; })
        .style('top', function (row) { return row.y0 + 'px'; })
        .style('width', function (row) { return (row.x1 - row.x0) + 'px'; })
        .style('height', function (row) { return (row.y1 - row.y0) + 'px'; })
        .style('position', 'absolute')
        .style('background-color', function (row) { return color(row.data.index); })
        .on('mouseover', function (row) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html(revenuesTooltip(row))
            .style("left", (d3.event.pageX + 28) + "px")
            .style("top", (d3.event.pageY - 52) + "px");
        })
        .on("mousemove", function() {
          return tooltip
            .style("left",(event.pageX + 28) + "px")
            .style("top", (event.pageY - 52) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
      .append('p')
        .style('font-weight', 'bold')
        .style('overflow-wrap', 'break-word')
        .style('display', 'table-cell')
        .style('vertical-align', 'middle')
        .style('padding', '3px')
        .style('margin', 0)
        .style('font-size', function (row) {
          return fontSize(row.data.amount) + 'px';
        })
        .html(function(row) {
          if ((row.x1 - row.x0) < 40) {
            return '';
          }
          return row.data.name;
        });

  // Add rectangle.
  //treemapView.append('rect')
  //  .attr('id', function (row) { return 'rect-' + row.data.key; })
  //  .attr('width', function (row) { return row.x1 - row.x0; })
  //  .attr('height', function (row) { return row.y1 - row.y0; })
  //  .style('fill', function () { return '#fff000'; });

  // Add text.
  //text = treemapView.append('text')
  //  .attr('x', function(row) { return (row.x1 - row.x0) / 2; })
  //  .attr('y', function(row) { return (row.y1 - row.y0) / 2; })
  //  .attr('text-anchor', 'middle');

  function revenuesTooltip(row) {
    var percent = (row.data.amount * 100) / totalAmount;
    percent = percent.toFixed(2);
    return row.data.name + ': '
      + numeral(row.data.amount).format('$0,0')
      + ' (' + percent + '%)';
  }
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

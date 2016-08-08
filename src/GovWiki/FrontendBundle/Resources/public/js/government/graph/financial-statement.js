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
  var selector = '#total-revenue-tree';
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

  drawTreemap(revenues, {
    selector: selector,
    width: $(selector).width() - 50,
    height: $(selector).width() - 150,
    minAmount: minAmount,
    maxAmount: maxAmount,
    totalAmount: totalAmount
  })
}

/**
 * TODO: Refactor
 * #total-expenditures-tree
 */
function expendituresTree() {
  var selector = '#total-expenditures-tree';
  var subCatValue;
  var subCategory;
  var eKey;
  var totalAmount = 0;
  var minAmount = Number.MAX_VALUE;
  var maxAmount = 0.0;
  var index = 0;
  var ExpendituresData = data.financialStatements.Expenditures;
  var expenditures = {
    name: data.translations.total_expenditure,
    children: []
  };

  // Set treemap title.
  $('#total-expenditures-tree-title').text(data.translations.total_expenditure);


  // Prepare ExpendituresData data to Google Tree Chart
  for (eKey in ExpendituresData) {
    if (ExpendituresData.hasOwnProperty(eKey) && (ExpendituresData[eKey].caption !== 'Total Expenditures')) {
      subCategory = ExpendituresData[eKey];
      subCatValue = parseInt(getSubCatValue(subCategory), 10);

      if (!subCatValue) {
        continue;
      }

      expenditures.children.push({
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

  drawTreemap(expenditures, {
    selector: selector,
    width: $(selector).width() - 50,
    height: $(selector).width() - 150,
    minAmount: minAmount,
    maxAmount: maxAmount,
    totalAmount: totalAmount
  })
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
      $('#charts-row').css('margin-bottom', '0');
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
      $('#charts-row').css('margin-bottom', '52px');
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
      $('#charts-row').css('margin-bottom', '0');
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

function drawTreemap(values, params) {
  var tooltip;
  var treemap;
  var root;
  var color;
  var fontSize;
  var treemapView;

  // Create tooltip.
  tooltip = d3.select("body").append("div")
    .attr("class", "treemap-tooltip")
    .style("opacity", 0);

  // Init treemap layout.
  treemap = d3
    .treemap()
    .size([ params.width, params.height ])
    .padding(1);

  // Prepare data for d3.
  root = d3.hierarchy(values)
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
    .domain([params.minAmount, params.maxAmount])
    .rangeRound([10, 20]);

  // Form data in treemap.
  treemap(root);

  // Add treemap root svg element.
  $(params.selector).html('');
  treemapView = d3.select(params.selector)
    .append('div')
    .style('width', params.width + 'px')
    .style('height', params.height + 'px')
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
    .style('position', 'absolute')
    .style('vertical-align', 'middle')
    .style('padding', '3px')
    .style('margin', 0)
    .style('width', '100%')
    .style('top', '50%')
    .style('transform', 'translate(0, -50%)')
    .style('font-size', function (row) {
      return fontSize(row.data.amount) + 'px';
    })
    .html(function(row) {
      if (((row.data.amount * 100) / params.totalAmount) < 1.0) {
        return '';
      }
      return row.data.name;
    });

  function revenuesTooltip(row) {
    var percent = (row.data.amount * 100) / params.totalAmount;
    percent = percent.toFixed(2);
    return row.data.name + ': '
      + numeral(row.data.amount).format('$0,0')
      + ' (' + percent + '%)';
  }
}

module.exports = {
  init: init,
  initAll: init,
  handlerSwitchChart: handlerSwitchChart
};

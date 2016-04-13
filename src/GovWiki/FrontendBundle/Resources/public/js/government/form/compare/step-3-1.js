var rowSortFunction = require('../../graph/utils.js').rowSortFunction;

/**
 * Constructor
 * @param FormState
 * @param container
 * @constructor
 */
function Step(FormState, container) {

  this.container = container;
  this.$select = $(container);
  this.firstStep = FormState.firstStep;
  this.secondStep = FormState.secondStep;
  this.init();
}

/**
 * Init step
 */
Step.prototype.init = function() {

  this.handler_onChangeSelect();
  this.handler_onClickSelect();

};

/**
 * (Ajax, DOM)
 *
 * Unlock step
 */
Step.prototype.unlock = function() {
  this.$select.toggleClass('disabled', false);
};

/**
 * Lock step
 */
Step.prototype.lock = function() {
  this.$select.toggleClass('disabled', true);
};

/**
 * @param data
 * @param blockId
 */
Step.prototype.drawDiagramm = function(government, blockId, comparedData) {
  var chart, options, rows, vis_data;

  vis_data = new google.visualization.DataTable();

  vis_data.addColumn('string', 'Caption');
  vis_data.addColumn('number', 'Total Funds');
  rows = [];

  var captions = government.data;
  captions.forEach(function(item) {
    if (item.amount < 0) {
      item.amount = -parseInt(item.amount);
    }
    rows.push([item.translatedCaption, parseInt(item.amount)]);
  });

  rows.sort(rowSortFunction);

  vis_data.addRows(rows);
  options = {
    'title': 'Total ' + comparedData.translatedCategory + ': ' + government.name,
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
 * (DOM)
 *
 * Manipulate tab state
 */
Step.prototype.switchGraphs = function() {

  var $firstPie = $('#total-compare-first-pie');
  var $secondPie = $('#total-compare-second-pie');
  var $compareColumn = $('#total-compare-column');
  var $firstPreloader = $('<div class="loader"></div>');
  var $secondPreloader = $('<div class="loader"></div>');

    // Add background on selected items
  $('.government-categories .category').addClass('selected');
  $('.government-categories .caption').removeClass('selected');

    // View state
  $compareColumn.hide();
  $firstPie.show();
  $secondPie.show();

    // Show preloaders
  $firstPie.find('p').append($firstPreloader);
  $secondPie.find('p').append($secondPreloader);

};

/**
 *
 * @param container
 * @param comparedData
 */
Step.prototype.drawTable = function(container, comparedData) {

  var $container = $(container);
  $container.html('');
  var governmentNumber = (container == '.compare-first-table') ? 'firstGovernment' : 'secondGovernment';

  var category = comparedData.translatedCategory;
  var governmentName = comparedData[governmentNumber].name;
  var year = comparedData[governmentNumber].year;

  var thead = '<thead><tr><th colspan="2" style="text-align: center">' + governmentName + ' (' + year + ')</th></tr><tr><th>' + category + '</th><th> Total </th></tr>></thead>';
  var tbody = '<tbody>';

  comparedData[governmentNumber].data.forEach(function(row) {
    tbody += '<tr><td>' + row.translatedCaption + '</td><td>' + numeral(row.amount).format('$0,0') + '</td></tr>';
  });

  tbody += '</tbody>';

  $container.append(thead);
  $container.append(tbody);

};


/**
 * (Ajax, DOM)
 * TODO: Draft
 * If option selected, draw chart
 */
Step.prototype.handler_onChangeSelect = function() {

  var self = this;


  $(self.container).on('change', function(e) {

    var $el = $(e.target);
    var $selected = $el.find('option:selected');
    var tab = $selected.parent('optgroup').data('name');

    var category = $selected.val();

    if (!category) {
      alert('Please select one of category');
      return true;
    }

    self.loadComparedData(tab, category);

  });

};

/**
 * (Ajax, DOM)
 *
 * Load compared data for two governments
 * Draw table, and charts
 *
 * @param {String} tab - example: 'Financial Statement', 'General Information', 'Financial Highlights', ...
 * @param {String} category - only two: 'Revenues', 'Expenditures'
 * @param {Boolean} select - true(mark category in select as active/selected), false(not mark)
 */
Step.prototype.loadComparedData = function(tab, category, select) {

  var self = this;

  if (!tab || !category) {
    alert('Something went wrong, please contact with us');
    console.error('Please pass all required arguments into loadComparedData() function');
    return false;
  }

  if (select) {
    self.$select.find('[value="' + category + '"]').attr('selected', true);
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
      year: self.secondStep.data.year
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
    success: function(comparedData) {
      self.switchGraphs();
      self.drawTable('.compare-first-table', comparedData);
      self.drawTable('.compare-second-table', comparedData);
      self.drawDiagramm(comparedData.firstGovernment, 'total-compare-first-pie', comparedData);
      self.drawDiagramm(comparedData.secondGovernment, 'total-compare-second-pie', comparedData);
    },
    error: function(error) {
      alert('Cant load data for this governments, please try later');
      return true;
    }
  });

};


/**
 * (Ajax, DOM)
 *
 * Check third input, if previous form items filled correct - load governments categories
 */
Step.prototype.handler_onClickSelect = function() {

  var self = this;

  self.$select.on('mousedown', function(e) {

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

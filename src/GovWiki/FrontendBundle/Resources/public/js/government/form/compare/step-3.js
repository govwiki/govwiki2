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
  this.$loader = $('<div class="loader"></div>');
  this.init();
}
/**
 * Init step
 */
Step.prototype.init = function init() {
  this.handler_onChangeSelect();
  this.handler_onClickSelect();
};
/**
 * (Ajax, DOM)
 *
 * Unlock step
 */
Step.prototype.unlock = function unlock() {
  this.loading(true);
  this.loadMatchedCategories();
  this.$select.toggleClass('disabled', false);
};
/**
 * Lock step
 */
Step.prototype.lock = function lock() {
  this.$select.html('<option>' + this.$select.data('default-item') + '</option>');
  this.$select.toggleClass('disabled', true);
};
/**
 * (DOM)
 *
 * Loading state
 * @param isLoading
 */
Step.prototype.loading = function loading(isLoading) {
  var display = isLoading ? 'none' : 'block';
  this.$select.css({ display: display });
  if (isLoading) {
    this.$select.parent().append(this.$loader);
  } else {
    this.$loader.remove();
  }
};
/**
 * (DOM)
 *
 * Manipulate tab state
 */
Step.prototype.switchGraphs = function switchGraphs() {
  var $preloader = $('<div class="loader"></div>');
  var $firstPie = $('#total-compare-first-pie');
  var $secondPie = $('#total-compare-second-pie');
  var $compareColumn = $('#total-compare-column');
  // Add background on selected items
  $('.government-categories .category').removeClass('selected');
  $('.government-categories .caption').addClass('selected');
  // View state
  $compareColumn.show();
  $firstPie.hide();
  $secondPie.hide();
  // Show preloaders
  $compareColumn.find('p').append($preloader);
};
/**
 * (Ajax, DOM)
 */
Step.prototype.loadMatchedCategories = function loadMatchedCategories() {
  var self = this;
  var captions = {
    captions: [
      {
        id: self.firstStep.data.id,
        year: self.firstStep.data.year,
        altType: self.firstStep.data.altType
      },
      {
        id: self.secondStep.data.id,
        year: self.secondStep.data.year,
        altType: self.secondStep.data.altType
      }
    ]
  };
  var captionsJson = JSON.stringify(captions);
  $.ajax({
    url: window.gw.urls.captions,
    type: 'POST',
    contentType: 'application/json',
    data: captionsJson,
    success: function success(data) {
      var expenditures;
      var availableTabs;
      self.loading(false);
      if (!data || data.length === 0) {
        alert('Not can find categories for current comparison');
        self.lock();
        return true;
      }
      self.$select.toggleClass('disabled', false);
      /**
       * Create expenditures group
       */
      expenditures = data.filter(function loop(item) {
        return item.category === 'Expenditures';
      });
      availableTabs = [];
      data.forEach(function loop(item) {
        availableTabs.indexOf(item.translatedTab) != -1 ? false : availableTabs.push({
          translated: item.translatedTab,
          normal: item.tab
        });
      });
      availableTabs.forEach(function loop(tab) {
        self.$select.append('<optgroup data-name="' + tab.normal + '" label="' + tab.translated + '"></optgroup>');
      });
      data.forEach(function loop(caption) {
        var value = caption.fieldName || caption.name;
        var $expenditureGroup = self.$select.find('[label="' + caption.translatedTab + '"]');
        $expenditureGroup.append('<option value="' + value + '">' + caption.translatedName + '</option>');
      });
      return true;
    },
    error: function error() {
      self.loading(false);
      alert('Something wrong, please try another government');
      self.$select.toggleClass('disabled', true);
    }
  });
};
/**
 * @param data
 * @param blockId
 */
Step.prototype.drawDiagramm = function drawDiagramm(government, blockId, captionCategory) {
  var chart;
  var options;
  var rows;
  var visData;
  var captions;
  visData = new google.visualization.DataTable();
  visData.addColumn('string', 'Caption');
  visData.addColumn('number', 'Total Funds');
  rows = [];
  rows.push(['Total ' + captionCategory, parseInt(government.total, 10)]);
  captions = government.data;
  captions.forEach(function loop(item) {
    rows.push([item.caption, parseInt(item.amount, 10)]);
  });
  visData.addRows(rows);
  options = {
    title: 'Compare',
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
    pieStartAngle: 60,
    sliceVisibilityThreshold: 0,
    forceIFrame: true,
    chartArea: {
      width: '90%',
      height: '75%'
    }
  };
  chart = new google.visualization.PieChart(document.getElementById(blockId));
  chart.draw(visData, options);
};
/**
 * (Ajax, DOM)
 * TODO: Draft
 * If option selected, draw chart
 */
Step.prototype.handler_onChangeSelect = function handler_onChangeSelect() {
  var self = this;
  var data;
  $(self.container).on('change', function change(e) {
    var $el = $(e.target);
    var $selected = $el.find('option:selected');
    var caption = $selected.text();
    var tab = $selected.parent('optgroup').data('name');
    if (!caption) {
      alert('Please select one of captions');
      return true;
    }
    self.switchGraphs();
    data = {
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
      tab: tab
    };
    if (tab !== 'Financial Statement') {
      data.fieldName = $selected.val();
    }
    data = JSON.stringify(data);
    console.log(data);
    $.ajax({
      url: window.gw.urls.compare,
      type: 'POST',
      data: data,
      contentType: 'application/json',
      success: function success(comparedData) {
        self.drawColumnChart(comparedData, 'total-compare-column');
      }
    });

    return true;
  });
};
/**
 * (Ajax, DOM)
 *
 * Check third input, if previous form items filled correct - load governments categories
 */
Step.prototype.handler_onClickSelect = function handler_onClickSelect() {
  var self = this;
  self.$select.on('mousedown', function mousedown(e) {
    var $el = $(e.target);
    if ($el.hasClass('disabled')) {
      alert('Please, first select governments');
    } else if (!self.firstStep.completed || !self.secondStep.completed) {
      alert('Please, first enter all fields');
    }
    return true;
  });
};
Step.prototype.drawColumnChart = function drawColumnChart(comparedData, blockId) {
  var chart;
  var options;
  var rows;
  var visData;
  var firstGovernment = comparedData.firstGovernment;
  var secondGovernment = comparedData.secondGovernment;
  rows = [
    ['City', 'Amount']
  ];
  rows.push([firstGovernment.name, parseInt(firstGovernment.data[0].amount, 10)]);
  rows.push([secondGovernment.name, parseInt(secondGovernment.data[0].amount, 10)]);
  options = {
    title: comparedData.caption,
    titleTextStyle: {
      fontSize: 16
    },
    tooltip: {
      textStyle: {
        fontSize: 12
      }
    },
    width: 500,
    height: 350,
    pieStartAngle: 60,
    sliceVisibilityThreshold: 0.05,
    forceIFrame: true,
    chartArea: {
      width: '90%',
      height: '75%'
    }
  };
  visData = google.visualization.arrayToDataTable(rows);
  chart = new google.visualization.ColumnChart(document.getElementById(blockId));
  chart.draw(visData, options);
};
module.exports = Step;

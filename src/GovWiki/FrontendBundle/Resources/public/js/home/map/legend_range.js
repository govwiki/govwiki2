var config = require('./config.js');
var sublayer = require('./sublayer.js');
var Style = require('./style.js');

function init(showOnTop) {
  var $legend;
  var legendClass = 'cartodb-legend-stack';
  var conditionColor;
  var conditionText;
  var legendItems = '';
  var activeConditions = [];
  var completeConditions = [];
  var conditionData;
  var fieldName = window.gw.map.county.localized_name;
  var conditions = window.gw.map.county.conditions;
  var disabledConditions;
  var periodConditions;
  var simpleConditions;
  var nullCondition;
  window.activeConditions = activeConditions;

  if (!window.gw.map.county.colorized) {
    return false;
  }

  // var fieldName = window.gw.map.county.fieldName.replace(/_/g, ' ');
  periodConditions = Style.getConditionsByType(conditions, 'period');
  simpleConditions = Style.getConditionsByType(conditions, 'simple');
  nullCondition = Style.getConditionsByType(conditions, 'null');

  // Build legend items for period conditions
  if (periodConditions.length !== 0) {
    periodConditions.forEach(function loop(condition) {
      conditionColor = 'background: ' + condition.color;
      conditionText = condition.min + ' - ' + condition.max;
      legendItems += '<li data-condition="' + JSON.stringify(condition).replace(/"/g, '&quot;') +
        '"><div class="bullet" style="' + conditionColor + '"></div>' +
        conditionText +
        '</li>';
    });
  }

  // Build legend items for simple conditions
  if (simpleConditions.length !== 0) {
    simpleConditions.forEach(function loop(condition) {
      conditionColor = 'background: ' + condition.color;
      conditionText = condition.operation + ' ' + condition.value;
      legendItems += '<li data-condition="' + JSON.stringify(condition).replace(/"/g, '&quot;') +
        '"><div class="bullet" style="' + conditionColor + '"></div>' +
        conditionText +
        '</li>';
    });
  }

  // Build legend items for null conditions
  if (nullCondition.length !== 0) {
    conditionColor = 'background: ' + nullCondition[0].color;
    legendItems += '<li data-condition="' + JSON.stringify(nullCondition[0]).replace(/"/g, '&quot;') +
      '"><div class="bullet" style="' + conditionColor + '"></div>null</li>';
  }

  if (showOnTop) {
    legendClass += ' cartodb-legend-stack__top';
  }
  $legend = $('<div class="' + legendClass + '" style="">' +
    '<div class="cartodb-legend custom horizontal"' +
    ' style="display: block;"><div class="legend-title">' +
    fieldName +
    '</div><ul>' +
    legendItems +
    '</ul></div></div>');
  $('#menu').after($legend);

  $legend.on('click', 'li', function legendItemClick() {
    var $el = $(this);
    var isActive = $el.hasClass('active');

    completeConditions = [];
    conditionData = JSON.parse($(this).attr('data-condition'));

    // Toggle range button
    if (isActive) {
      removeActiveCondition(activeConditions, conditionData);
    } else {
      addActiveCondition(activeConditions, conditionData);
    }

    if (activeConditions.length > 0) {
      disabledConditions = findDisabledConditions(activeConditions);
      addActiveConditions(completeConditions, activeConditions);
      addDisabledConditions(completeConditions, disabledConditions);
    } else {
      completeConditions = config.defaultConditions;
    }

    console.group();
    console.log('Clicked element data: ', conditionData);
    console.log('Active conditions: ', activeConditions);
    console.log('Disabled conditions: ', disabledConditions);
    console.log('Complete conditions: ', completeConditions);
    console.groupEnd();

    sublayer.removeAllSubLayers();
    sublayer.reInit({ conditions: completeConditions });

    $el.toggleClass('active');
  });
  return true;
}

/**
 * @param activeConditions
 * @param conditionData
 */
function removeActiveCondition(activeConditions, conditionData) {
  var index = findCondition(activeConditions, conditionData);
  if (index !== -1) {
    debugger;
    activeConditions.splice(index, 1);
  }
  return index;
}

/**
 * @param activeConditions
 * @param conditionData
 */
function addActiveCondition(activeConditions, conditionData) {
  return activeConditions.push(conditionData);
}

/**
 * @param completeConditions
 * @param activeConditions
 */
function addActiveConditions(completeConditions, activeConditions) {
  activeConditions.forEach(function loop(activeCondition) {
    completeConditions.push(activeCondition);
  });
}

/**
 * @param completeConditions
 * @param disabledConditions
 */
function addDisabledConditions(completeConditions, disabledConditions) {
  _.forEach(disabledConditions, function loop(disabledCondition) {
    var completeCondition = _.assign({}, disabledCondition);
    completeCondition.color = '#dddddd';
    completeConditions.push(completeCondition);
  });
}

/**
 * @param activeConditions
 * @returns {*}
 */
function findDisabledConditions(activeConditions) {
  return config.defaultConditions.filter(function loop(condition) {
    return findCondition(activeConditions, condition) === -1;
  });
}

/**
 * Search one condition in conditions
 * @param conditions
 * @param oneCondition
 * @return {Number}
 */
function findCondition(conditions, oneCondition) {
  var findIndex = null;
  if (!conditions) {
    return -1;
  }

  if (conditions.length > 0) {
    conditions.forEach(function loop(condition, index) {
      if (oneCondition.type === 'simple') {
        if (condition.operation === oneCondition.operation && condition.value === oneCondition.value) {
          findIndex = index;
        }
      } else if (oneCondition.type === 'period') {
        if (condition.min === oneCondition.min && condition.max === oneCondition.max) {
          findIndex = index;
        }
      } else if (oneCondition.type === 'null') {
        if (condition.color === oneCondition.color) {
          findIndex = index;
        }
      }
    });
  }
  return findIndex !== null ? findIndex : -1;
}

module.exports = {
  init: init
};


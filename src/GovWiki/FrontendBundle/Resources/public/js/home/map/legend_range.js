var Sublayer = require('./sublayer.js');
function init(showOnTop) {
  var $legend;
  var legendClass = 'cartodb-legend-stack';
  var conditionColor;
  var conditionText;
  var legendItems = '';
  var activeConditionsInRangeLegend = [];
  var completeConditions = [];
  var conditionData;
  var fieldName = window.gw.map.county.localized_name;
  var conditions = window.gw.map.county.conditions;
  var defaultConditions = JSON.parse(JSON.stringify(conditions));
  var cpyDefaultConditions;
  var diffConditions;
  window.activeConditionsInRangeLegend = activeConditionsInRangeLegend;

  if (!window.gw.map.county.colorized) {
    return false;
  }

  // var fieldName = window.gw.map.county.fieldName.replace(/_/g, ' ');
  var periodConditions = getConditionsByType(conditions, 'period');
  var simpleConditions = getConditionsByType(conditions, 'simple');
  var nullCondition = getConditionsByType(conditions, 'null');

  // Build legend items for period conditions
  if (periodConditions.length !== 0) {
    periodConditions.forEach(function loop(condition) {
      conditionColor = 'background: ' + condition.color;
      conditionText = condition.min + ' - ' + condition.max;
      legendItems += '<li data-condition="' + JSON.stringify(condition).replace(/\"/g, '&quot;') +
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
      legendItems += '<li data-condition="' + JSON.stringify(condition).replace(/\"/g, '&quot;') +
        '"><div class="bullet" style="' + conditionColor + '"></div>' +
        conditionText +
        '</li>';
    });
  }

  // Build legend items for null conditions
  if (nullCondition.length !== 0) {
    conditionColor = 'background: ' + nullCondition[0].color;
    legendItems += '<li data-condition="' + JSON.stringify(nullCondition[0]).replace(/\"/g, '&quot;') +
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
    var index;
    var $el = $(this);
    var $ul = $legend.closest('ul');
    var $liTags = $ul.find('li');
    conditionData = JSON.parse($(this).attr('data-condition'));
    // Toggle range button
    if ($el.hasClass('active')) {
      $el.removeClass('active');
      if (conditions.length > 0) {
        index = findCondition(activeConditionsInRangeLegend, conditionData);
        if (index !== -1) {
          activeConditionsInRangeLegend.splice(index, 1);
        }
      } else {
        conditions = defaultConditions;
      }
    } else {
      $el.addClass('active');
      activeConditionsInRangeLegend.push(conditionData);
    }
    // Mark others with gray color
    if (activeConditionsInRangeLegend.length > 0) {
      cpyDefaultConditions = JSON.parse(JSON.stringify(defaultConditions));
      diffConditions = cpyDefaultConditions.filter(function loop(condition) {
        index = findCondition(activeConditionsInRangeLegend, condition);
        return index === -1;
      });
      // Copy activeConditions into completeConditions array
      activeConditionsInRangeLegend.forEach(function loop(activecondition) {
        completeConditions.push(activecondition);
      });
      // Copy diffConditions into completeConditions array
      diffConditions.forEach(function loop(diffCondition) {
        diffCondition.color = '#dddddd';
        completeConditions.push(diffCondition);
      });
    } else {
      completeConditions = defaultConditions;
    }
    Sublayer.removeAllSubLayers();
    Sublayer.reInit({ conditions: completeConditions });
    $liTags.not($el).removeClass('active');
  });
  return true;
}
/**
 * Search one condition in conditions
 * @param conditions
 * @param oneCondition
 * @return {Number}
 */
function findCondition(conditions, oneCondition) {
  var findIndex;
  var filteredConditionsByType;
  var conditionType;
  if (!conditions) {
    return -1;
  }
  conditionType = oneCondition.type;
  filteredConditionsByType = conditions.filter(function loop(condition) {
    return condition.type === conditionType;
  });
  if (filteredConditionsByType.length > 0) {
    filteredConditionsByType.forEach(function loop(condition, index) {
      switch (conditionType) {
        case 'simple':
          if (condition.operation === oneCondition.operation && condition.value === oneCondition.value) {
            findIndex = index;
          }
          break;
        case 'period':
          if (condition.min === oneCondition.min && condition.max === oneCondition.max) {
            findIndex = index;
          }
          break;
        case 'null':
          if (condition.color === oneCondition.color) {
            findIndex = index;
          }
          break;
        default:
      }
    });
  }
  return findIndex !== null ? findIndex : -1;
}
/**
 * Get condition filtered by conditionType
 * @param {Array} conditions
 * @param {String} conditionType - period, simple, null
 * @returns {*}
 */
function getConditionsByType(conditions, conditionType) {
  return conditions.filter(function loop(condition) {
    return condition.type === conditionType;
  });
}
module.exports = {
  init: init
};


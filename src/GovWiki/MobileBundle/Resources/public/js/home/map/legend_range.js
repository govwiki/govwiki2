var glob = require('../../global.js');
var config = require('./config.js');
var sublayer = require('./sublayer.js');
var Style = require('./style.js');
var methods;

function init(showOnTop) {
  var $legend;
  var legendClass = 'cartodb-legend-stack';
  var conditionColor;
  var conditionText;
  var legendItems = '';

  var fieldName = window.gw.map.coloringConditions.localized_name;
  var conditions = window.gw.map.coloringConditions.conditions;

  var periodConditions;
  var simpleConditions;
  var nullCondition;

  if (!window.gw.map.coloringConditions.colorized) {
    return false;
  }

  // var fieldName = window.gw.map.coloringConditions.fieldName.replace(/_/g, ' ');
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

  handlerToggleConditions($legend);
  return true;
}

/**
 * Click on range legend item, to disable layers
 * @param $container
 */
function handlerToggleConditions($container) {
  // Each clicked element contain conditionData in attribute 'data-condition'
  // It simple stringifyed object, for example: JSON.stringify(window.gw.map.coloringConditions.conditions[0])
  // <li data-condition='{"type":"simple","color":"#80ff00","value":"1","operation":"<="}'>
  var conditionData;
  var activeConditions = [];
  var disabledConditions;
  var completeConditions = [];

  $container.on('click', 'li', function legendItemClick() {
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
      disabledConditions = findDisabledConditions(
        activeConditions,
        config.defaultConditions.conditions
      );
      addActiveConditions(completeConditions, activeConditions);
      addDisabledConditions(completeConditions, disabledConditions);
    } else {
      completeConditions = config.defaultConditions.conditions;
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
}

/**
 * @param activeConditions
 * @param conditionData
 */
function removeActiveCondition(activeConditions, conditionData) {
  var index = findCondition(activeConditions, conditionData);
  if (index !== -1) {
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
 * @param disabledConditions
 * @returns {*}
 */
function findDisabledConditions(activeConditions, defaultConditions) {
  return defaultConditions.filter(function loop(condition) {
    // console.log(condition);
    // console.log(findCondition(activeConditions, condition));
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
      if (oneCondition.type === 'simple' && oneCondition.type === condition.type) {
        if (condition.operation === oneCondition.operation && condition.value === oneCondition.value) {
          findIndex = index;
        }
      } else if (oneCondition.type === 'period' && oneCondition.type === condition.type) {
        if (condition.min === oneCondition.min && condition.max === oneCondition.max) {
          findIndex = index;
        }
      } else if (oneCondition.type === 'null' && oneCondition.type === condition.type) {
        if (condition.color === oneCondition.color) {
          findIndex = index;
        }
      }
    });
  }
  return findIndex !== null ? findIndex : -1;
}

methods = {
  init: init
};

if (glob.isTest) {
  methods = {
    findDisabledConditions: findDisabledConditions,
    addDisabledConditions: addDisabledConditions,
    addActiveConditions: addActiveConditions,
    addActiveCondition: addActiveCondition,
    removeActiveCondition: removeActiveCondition
  };
}

module.exports = methods;

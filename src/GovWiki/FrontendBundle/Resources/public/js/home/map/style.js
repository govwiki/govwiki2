
/**
 * Get period conditions as css string
 *
 * @param conditions - window.gw.map.county.conditions
 * @param options
 * @returns {string} CSS String || ''
 */
function getPeriodConditionsAsCss(conditions, options) {
  var stroke;
  var min;
  var max;
  var style;
  var cssConditions = '';
  var periodConditions = getConditionsByType(conditions, 'period');

  if (!conditions) {
    console.warn('You don\'t pass condition array into getPeriodConditionsAsCss() function');
    return '';
  }

  // If simple conditions found
  if (periodConditions.length !== 0) {
    periodConditions.forEach(function loop(condition) {
      // Fill polygon or marker
      var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
      var fillColor = options.isMarkerLayer ? condition.color : condition.color;
      var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
      var fill = fillRule + ': ' + fillColor + ';' + markerTypeCss;
      // Stroke polygon or marker
      var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
      var lineColor = options.isMarkerLayer ? condition.color : '#FFFFFF';
      var line = lineColorRule + ': ' + lineColor + ';';
      if (options.markerLineColorColorCss) {
        line = options.markerLineColorColorCss;
      }
      stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';
      min = '[data >= ' + condition.min + ']';
      max = '[data <= ' + condition.max + ']';
      style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
      cssConditions += '#layer' + min + max + style;
    });
  }
  return cssConditions || '';
}
/**
 * Get simple conditions as css string
 *
 * @param conditions - window.gw.map.county.conditions
 * @param options
 * @returns {string} CSS String || ''
 */
function getSimpleConditionsAsCss(conditions, options) {
  var opt;
  var cssConditions;
  var simpleConditions;

  var fillRule;
  var fillColor;
  var markerTypeCss;
  var fill;

  var lineColorRule;
  var lineColor;
  var line;

  var stroke;
  var value;
  var style;

  if (!conditions) {
    console.warn('You don\'t pass condition array into getSimpleConditionsAssCss() function');
    return '';
  }

  opt = $.extend({}, options);

  cssConditions = '';
  simpleConditions = getConditionsByType(conditions, 'simple');

  // If simple conditions found
  if (simpleConditions.length !== 0) {
    // Sort by desc, because cartodb specifically processes css rules
    simpleConditions.sort(function loop(cur, next) {
      return cur.value < next.value;
    });
    simpleConditions.forEach(function loop(condition) {
      // Fill polygon or marker
      fillRule = opt.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
      fillColor = opt.isMarkerLayer ? condition.color : condition.color;
      markerTypeCss = opt.markerFileCss ? opt.markerFileCss : '';
      fill = fillRule + ': ' + fillColor + '; ' + markerTypeCss;
      // Stroke polygon or marker
      lineColorRule = opt.isMarkerLayer ? 'marker-line-color' : 'line-color';
      lineColor = opt.isMarkerLayer ? condition.color : '#FFFFFF';
      line = lineColorRule + ': ' + lineColor + ';';
      if (opt.markerLineColorColorCss) {
        line = opt.markerLineColorColorCss;
      }
      stroke = opt.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';
      value = '[data ' + condition.operation + ' ' + condition.value + ']';
      style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
      cssConditions += '#layer' + value + style;
    });
  }
  return cssConditions || '';
}
/**
 * Get Null condition as css string
 *
 * @param conditions - window.gw.map.county.conditions
 * @param options
 * @returns {string} CSS String || ''
 */
function getNullConditionAsCss(conditions, options) {
  var opt = $.extend({}, options);
  var cssConditions = '';
  var nullCondition = getConditionsByType(conditions, 'null');

  var fillRule;
  var fillColor;
  var markerTypeCss;
  var fill;

  var lineColorRule;
  var lineColor;
  var line;

  var stroke;
  var style;

  if (!conditions) {
    console.warn('You don\'t pass condition array into getNullConditionAsCss() function');
    return '';
  }
  // If null condition found
  if (nullCondition.length !== 0) {
    // Fill polygon or marker
    fillRule = opt.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
    fillColor = opt.isMarkerLayer ? nullCondition[0].color : nullCondition[0].color;
    markerTypeCss = opt.markerFileCss ? opt.markerFileCss : '';
    fill = fillRule + ': ' + fillColor + ';' + markerTypeCss;
    // Stroke polygon or marker
    lineColorRule = opt.isMarkerLayer ? 'marker-line-color' : 'line-color';
    lineColor = opt.isMarkerLayer ? nullCondition[0].color : '#FFFFFF';
    line = lineColorRule + ': ' + lineColor + ';';
    if (opt.markerLineColorColorCss) {
      line = opt.markerLineColorColorCss;
    }
    stroke = opt.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';
    style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
    cssConditions += '#layer[data = null]' + style;
  }
  return cssConditions || '';
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
  getPeriodConditionsAsCss: getPeriodConditionsAsCss,
  getSimpleConditionsAsCss: getSimpleConditionsAsCss,
  getNullConditionAsCss: getNullConditionAsCss,
  getConditionsByType: getConditionsByType
};

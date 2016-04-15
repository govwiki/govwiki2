/**
 * Get period conditions as css string
 *
 * @param conditions - window.gw.map.county.conditions
 * @param options
 * @returns {string} CSS String || ''
 */
function getPeriodConditionsAsCss(conditions, options) {
  var cssConditions = '';
  var periodConditions = getConditionsByType(conditions, 'period');
  if (!conditions) {
    console.warn('You don\'t pass condition array into getPeriodConditionsAsCss() function');
    return '';
  }
  // If simple conditions found
  if (periodConditions.length !== 0) {
    periodConditions.forEach(function (condition) {
      // Fill polygon or marker
      var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
      var fillColor = options.isMarkerLayer ? condition.color : condition.color;
      var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
      var fill = fillRule + ': ' + fillColor + ';' + markerTypeCss;
      // Stroke polygon or marker
      var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
      var lineColor = options.isMarkerLayer ? color : '#FFFFFF';
      var line = lineColorRule + ': ' + lineColor + ';';
      if (options.markerLineColorColorCss) {
        line = options.markerLineColorColorCss;
      }
      var stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';
      var min = '[data >= ' + condition.min + ']';
      var max = '[data <= ' + condition.max + ']';
      var style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
      cssConditions += '#layer' + min + max + style;
    });
  }
  return cssConditions ? cssConditions : '';
}
/**
 * Get simple conditions as css string
 *
 * @param conditions - window.gw.map.county.conditions
 * @param options
 * @returns {string} CSS String || ''
 */
function getSimpleConditionsAsCss(conditions, options) {
  if (!conditions) {
    console.warn('You don\'t pass condition array into getSimpleConditionsAssCss() function');
    return '';
  }
  options = options || {};
  var cssConditions = '';
  var simpleConditions = getConditionsByType(conditions, 'simple');
  // If simple conditions found
  if (simpleConditions.length !== 0) {
    // Sort by desc, because cartodb specifically processes css rules
    simpleConditions.sort(function (cur, next) {
      return cur.value < next.value;
    });
    simpleConditions.forEach(function (condition) {
      // Fill polygon or marker
      var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
      var fillColor = options.isMarkerLayer ? condition.color : condition.color;
      var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
      var fill = fillRule + ': ' + fillColor + '; ' + markerTypeCss;
      // Stroke polygon or marker
      var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
      var lineColor = options.isMarkerLayer ? color : '#FFFFFF';
      var line = lineColorRule + ': ' + lineColor + ';';
      if (options.markerLineColorColorCss) {
        line = options.markerLineColorColorCss;
      }
      var stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';
      var value = '[data ' + condition.operation + ' ' + condition.value + ']';
      var style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
      cssConditions += '#layer' + value + style;
    });
  }
  return cssConditions ? cssConditions : '';
}
/**
 * Get Null condition as css string
 *
 * @param conditions - window.gw.map.county.conditions
 * @param options
 * @returns {string} CSS String || ''
 */
function getNullConditionAsCss(conditions, options) {
  var cssConditions = '';
  var nullCondition = getConditionsByType(conditions, 'null');
  if (!conditions) {
    console.warn('You don\'t pass condition array into getNullConditionAsCss() function');
    return '';
  }
  // If null condition found
  if (nullCondition.length !== 0) {
    // Fill polygon or marker
    var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
    var fillColor = options.isMarkerLayer ? nullCondition[0].color : nullCondition[0].color;
    var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
    var fill = fillRule + ': ' + fillColor + ';' + markerTypeCss;
    // Stroke polygon or marker
    var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
    var lineColor = options.isMarkerLayer ? color : '#FFFFFF';
    var line = lineColorRule + ': ' + lineColor + ';';
    if (options.markerLineColorColorCss) {
      line = options.markerLineColorColorCss;
    }
    var stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';
    var style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
    cssConditions += '#layer[data = null]' + style;
  }
  return cssConditions ? cssConditions : '';
}

module.exports = {
  getPeriodConditionsAsCss: getPeriodConditionsAsCss,
  getSimpleConditionsAsCss: getSimpleConditionsAsCss,
  getNullConditionAsCss: getNullConditionAsCss
};

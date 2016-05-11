var config = require('./config');

/**
 * Get period conditions as css string
 *
 * @param conditions - window.gw.map.coloringConditions.conditions
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
 * @param conditions - window.gw.map.coloringConditions.conditions
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
 * @param conditions - window.gw.map.coloringConditions.conditions
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
 * Get colors for map layer FROM legend by altType !!!
 *
 * @param altType
 */
function getColorsFromLegend(altType) {
  var foundLegend;
  var url;
  var markerFileCss;
  var markerFillColorCss;
  var markerLineColorColorCss;

  // Search current altType in legend (window.gw.map.legend = [Object, Object, ...])
  foundLegend = config.legend.filter(function loop(item) {
    return item.altType === altType;
  })[0];

  if (!foundLegend) {
    return false;
  }

  if (config.debug) {
    url = 'http://california.govwiki.freedemster.com';
  } else {
    url = window.location.href.substr(0, window.location.href.length - 1);
  }

  if (foundLegend.color || foundLegend.shape) {
    // If url to marker exist, create new css rule (path to marker icon)
    markerFileCss = 'marker-file: url(' + url + foundLegend.shape + ');';

    markerFillColorCss = 'marker-fill: ' + foundLegend.color + '; ';
    markerLineColorColorCss = 'marker-line-color: ' + foundLegend.color + '; ';
  } else {
    console.error('Legend not contain style properties, please fix it !!!');
    markerFileCss = '';
    markerFillColorCss = '';
    markerLineColorColorCss = '';
  }

  return {
    markerFileCss: markerFileCss,
    markerFillColorCss: markerFillColorCss,
    markerLineColorColorCss: markerLineColorColorCss
  };
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
  getConditionsByType: getConditionsByType,
  getColorsFromLegend: getColorsFromLegend
};

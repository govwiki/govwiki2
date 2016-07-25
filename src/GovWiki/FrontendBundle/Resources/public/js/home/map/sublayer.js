var config = require('./config.js');
var Tooltip = require('./tooltip.js');
var Style = require('./style.js');
/**
 * ============================
 *       Sublayer module
 * ============================
 */

// Polygon variables and functions
var polygon = {};
// What should our polygon hover style look like?
var polygonStyle = {
  color: '#808080',
  weight: 1,
  opacity: 1,
  fillOpacity: 0.6,
  fillColor: '#000000',
  clickable: false
};
function drawAppropriatePolygon(data) {
  removeAllHoverShapes();
  polygon = new L.GeoJSON(JSON.parse(data.geometry), {
    style: polygonStyle
  });
  config.map.addLayer(polygon);
  polygon.cartodb_id = data.cartodb_id;
}
/**
 * Initialization County SubLayer
 *
 * Tooltip window
 * Tooltip work with 3.11-13 version, 3.15 is buggy
 *
 * @public
 */
function initCountySubLayer(altType) {
  // Default county color
  var cartocss = '#layer { polygon-fill: #DDDDDD; polygon-opacity: 0.7; line-color: #FFF;' +
    ' line-width: 0.5; line-opacity: 1; } ';
  var cLayer;
  var _altType;
  var colorized = window.gw.map.coloringConditions.colorized;

  if (colorized) {
    cartocss += getConditionsColorsAsCartoCss({});
  }

  cLayer = {
    cartocss: cartocss,
    sql: "SELECT *, (data_json::json->>'" + window.gw.map.year +
    "')::float AS data, ST_AsGeoJSON(the_geom) AS geometry FROM " +
    window.gw.environment + " WHERE  alt_type_slug = '" +
    altType + "'",
    interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometry', 'data', 'name']
  };

  config.countySubLayer = config.baseLayer.createSubLayer(cLayer);

  _altType = altType.toLowerCase();
  config.subLayers[_altType] = config.countySubLayer;
  Tooltip.init(_altType);
}
/**
 * Initialization Marker SubLayer
 *
 * Tooltip window
 * Tooltip work with 3.11-13 version, 3.15 is buggy
 *
 * @public
 *
 */
function initMarkerSubLayer(altType) {
  var _altType = altType.toLowerCase();
  var cartocss = '';

  var isRangeLegend = window.gw.map.coloringConditions.colorized;
  var options = { isMarkerLayer: true };
  var legendColorsAsCartoCss = Style.getColorsFromLegend(altType);

  options.markerFileCss = legendColorsAsCartoCss.markerFileCss;
  options.markerFillColorCss = legendColorsAsCartoCss.markerFillColorCss;
  options.markerLineColorColorCss = legendColorsAsCartoCss.markerLineColorColorCss;

  if (isRangeLegend) {
    cartocss += '#layer { ' +
      legendColorsAsCartoCss.markerFileCss +
      legendColorsAsCartoCss.markerLineColorColorCss +
      ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
    cartocss += getConditionsColorsAsCartoCss(options);
  } else {
    cartocss += '#layer { ' +
      legendColorsAsCartoCss.markerFileCss +
      legendColorsAsCartoCss.markerFillColorCss +
      ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
  }
  config.subLayers[_altType] = config.baseLayer.createSubLayer({
    sql: "SELECT *, (data_json::json->>'" + window.gw.map.year +
    "')::float AS data, GeometryType(the_geom) AS geometrytype FROM " + window.gw.environment +
    " WHERE alt_type_slug = '" + altType + "'",
    cartocss: cartocss,
    interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometrytype', 'data', 'name']
  });
  Tooltip.init(_altType);
}

function initCmfMarkerSublayer(altType) {
  var _altType = altType.toLowerCase();
  var cartocss = '';

  var isRangeLegend = window.gw.map.coloringConditions.colorized;
  var options = { isMarkerLayer: true };
  var legendColorsAsCartoCss = Style.getColorsFromLegend(altType);

  var sql = [
    'SELECT',
    ' case',
    "   when name != 'Honolulu' and name != 'Anchorage'",
    '   then ST_Transform(the_geom_webmercator,42303)',
    "   when name = 'Anchorage'",
    '   then ST_Rotate(ST_Scale(',
    '     ST_Transform(',
    '       ST_Translate(',
    '         the_geom,90,-50',
    '       )',
    '       ,3857',
    '     )',
    '     , 0.4',
    '     , 0.5',
    '   ),0)',
    "   when name = 'Honolulu'",
    '   then ST_Scale(',
    '     ST_Transform(',
    '       ST_Translate(',
    '         the_geom,55,3',
    '       )',
    '       ,42303',
    '     )',
    '     , 1.5',
    '     , 1.5',
    '   )',
    ' end as the_geom_webmercator, cartodb_id, name',
    'FROM cmf'
  ].join(' ');

  options.markerFileCss = legendColorsAsCartoCss.markerFileCss;
  options.markerFillColorCss = legendColorsAsCartoCss.markerFillColorCss;
  options.markerLineColorColorCss = legendColorsAsCartoCss.markerLineColorColorCss;

  if (isRangeLegend) {
    cartocss += '#layer { ' +
                legendColorsAsCartoCss.markerFileCss +
                legendColorsAsCartoCss.markerLineColorColorCss +
                ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
    cartocss += getConditionsColorsAsCartoCss(options);
  } else {
    cartocss += '#layer { ' +
                legendColorsAsCartoCss.markerFileCss +
                legendColorsAsCartoCss.markerFillColorCss +
                ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
  }
  config.subLayers[_altType] = config.baseLayer.createSubLayer({
    sql: sql,
    cartocss: cartocss,
    interactivity: ['cartodb_id', 'name']
  });
  Tooltip.init(_altType);
}

/**
 * @param options
 * @returns {string}
 */
function getConditionsColorsAsCartoCss(options) {
  var cartocss = '';
  var conditionsAsCartoCss = '';
  var conditions = window.gw.map.coloringConditions.conditions;

  conditionsAsCartoCss += Style.getPeriodConditionsAsCss(conditions, options);
  conditionsAsCartoCss += Style.getSimpleConditionsAsCss(conditions, options);
  conditionsAsCartoCss += Style.getNullConditionAsCss(conditions, options);

  if (conditionsAsCartoCss === '') {
    console.warn('Can\'t find any condition, please verify your window.gw.map.coloringConditions.conditions data');
    console.warn('or check getPeriodConditionsAsCss, getSimpleConditionsAsCss, getNullConditionAsCss functions');
  }

  cartocss += conditionsAsCartoCss;
  return cartocss;
}

/**
 * Set handlers on SubLayers
 *
 * @public
 *
 */
function initSublayerHandlers() {
  var hovers = [];
  var key;
  var layer;
  for (key in config.subLayers) {
    if (config.subLayers.hasOwnProperty(key)) {
      layer = config.subLayers[key];
      // Allow events on layer
      layer.setInteraction(true);
      /**
       * Show tooltip on hover
       * Or highlight current county
       * It depends on the current Layer position
       */
      layer.bind('mouseover', function mouseover(e, latlon, pxPos, data, layerIndex) {
        hovers[layerIndex] = 1;
        /**
         * If hover active
         */
        if (_.some(hovers)) {
          $('#map').css('cursor', 'pointer');
          /**
           * If hover on county layer
           */
          if (config.countySubLayer &&
            (layerIndex === config.countySubLayer._position)) {
            drawAppropriatePolygon(data);
          } else {
            removeAllHoverShapes();
          }
          /**
           * Open current tooltip, close another
           */
          _.forOwn(config.tooltips, function loop(tooltip) {
            if (tooltip !== null) {
              if (tooltip.getLayerIndex() === layerIndex) {
                tooltip.enable();
              } else {
                tooltip.disable();
              }
            }
          });
        }
      });
      /**
       * Hide tooltip on hover
       * Or remove highlight on current county
       * It depends on the current Layer position
       */
      layer.bind('mouseout', function mouseout(layerIndex) {
        hovers[layerIndex] = 0;
        /**
         * If hover not active
         */
        if (!_.some(hovers)) {
          $('#map').css('cursor', 'auto');
          removeAllHoverShapes();
          /**
           *  Close all tooltips, if cursor outside of layers
           */
          _.forOwn(config.tooltips, function loop(tooltip) {
            if (tooltip !== null) {
              if (tooltip.getLayerIndex() === layerIndex) {
                tooltip.disable();
              }
            }
          });
        }
      });
      /**
       * Change window location after click on marker or county
       */
      layer.on('featureClick', function featureClick(event, latlng, pos, data) {
        var pathname;
        if (!data.alt_type_slug || !data.slug) {
          alert('Please verify your data, altTypeSlug or governmentSlug may can not defined, more info in console.log');
          return true;
        }
        pathname = window.location.pathname;
        if (pathname[pathname.length - 1] !== '/') {
          pathname += '/';
        }
        window.location.pathname = pathname + data.alt_type_slug + '/' + data.slug;

        return true;
      });
    }
  }
}
/**
 * @public
 */
function removeAllHoverShapes() {
  config.map.removeLayer(polygon);
  polygon.cartodb_id = null;
}
/**
 * Remove all sub layers
 * @public
 */
function removeAllSubLayers() {
  var key;
  removeAllHoverShapes();
  for (key in config.subLayers) {
    if (config.subLayers.hasOwnProperty(key)) {
      config.subLayers[key].remove();
    }
  }
}

/**
 * Create additional subLayers by altType
 *
 * @param altTypes Unique altTypes from MySQL
 */
function initSubLayers(altTypes) {
  var countySubLayers = altTypes.filter(function loop(altType) {
    return (altType.geometrytype === 'MULTIPOLYGON' || altType.geometrytype === 'POLYGON');
  });
  var markerSubLayers = altTypes.filter(function loop(altType) {
    return (altType.geometrytype !== 'MULTIPOLYGON' && altType.geometrytype !== 'POLYGON');
  });
  countySubLayers.forEach(function loop(altType) {
    initCountySubLayer(altType.alt_type_slug);
  });
  // Hardcode for CMF environment.
  if (window.gw.environment.indexOf('cmf') !== -1) {
    markerSubLayers.forEach(function loop(altType) {
      initCmfMarkerSublayer(altType.alt_type_slug);
    });
  } else {
    markerSubLayers.forEach(function loop(altType) {
      initMarkerSubLayer(altType.alt_type_slug);
    });
  }
  initSublayerHandlers();
}

/**
 * Reinitialize map with
 */
function reInit(settings) {
  var altTypes;
  if (settings) {
    window.gw.map.coloringConditions.conditions = (settings.conditions.length > 0)
        ? settings.conditions
        : config.defaultConditions;
  }
  altTypes = config.layersData.rows.filter(function loop(alt) {
    return !!alt.alt_type_slug;
  });
  initSubLayers(altTypes);
  Tooltip.initTooltips();
}

module.exports = {
  initCountySubLayer: initCountySubLayer,
  initMarkerSubLayer: initMarkerSubLayer,
  initCmfMarkerSublayer: initCmfMarkerSublayer,
  initSublayerHandlers: initSublayerHandlers,
  removeAllHoverShapes: removeAllHoverShapes,
  removeAllSubLayers: removeAllSubLayers,
  initSubLayers: initSubLayers,
  reInit: reInit
};

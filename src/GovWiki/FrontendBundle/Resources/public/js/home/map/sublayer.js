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
  var dataSelection;
  var colorized = window.gw.map.coloringConditions.colorized;

  if (colorized) {
    cartocss += getConditionsColorsAsCartoCss({});
  }

  // Change data selection depending on requested year value.
  if (window.gw.map.year === 'latest') {
    dataSelection = [
      '(data_json::json->>(',
      ' SELECT',
      '  json_object_keys(data_json::json) as latest_year',
      ' FROM ' + window.gw.environment,
      ' WHERE cartodb_id = e.cartodb_id',
      ' ORDER BY 1 DESC',
      ' LIMIT 1',
      '))::float AS data'
    ].join(' ');
  } else {
    dataSelection = "(data_json::json->>'" + window.gw.map.year
      + "')::float AS data";
  }

  cLayer = {
    cartocss: cartocss,
    sql: 'SELECT *,'
      + dataSelection + ', ST_AsGeoJSON(the_geom) AS geometry FROM '
      + window.gw.environment + " e WHERE  alt_type_slug = '" + altType + "'",
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
  var dataSelection;

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

  // Change data selection depending on requested year value.
  if (window.gw.map.year === 'latest') {
    dataSelection = [
      '(data_json::json->>(',
      ' SELECT',
      '  json_object_keys(data_json::json) as latest_year',
      ' FROM ' + window.gw.environment,
      ' WHERE cartodb_id = e.cartodb_id AND ',
      " data_json <> 'null'",
      ' ORDER BY 1 DESC',
      ' LIMIT 1',
      '))::float'
    ].join(' ');
  } else {
    dataSelection = "(data_json::json->>'" + window.gw.map.year
      + "')::float";
  }

  config.subLayers[_altType] = config.baseLayer.createSubLayer({
    sql: 'SELECT *, '
      + dataSelection + ' AS data, GeometryType(the_geom) AS geometrytype FROM '
      + window.gw.environment + " e WHERE alt_type_slug = '" + altType + "'"
      + ' AND ' + dataSelection + ' IS NOT NULL',
    cartocss: cartocss,
    interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometrytype', 'data', 'name']
  });
  Tooltip.init(_altType);
}

function initCmfMarkerSublayer(altType) {
  var _altType = altType.toLowerCase();
  var cartocss;
  var dataSelection;
  var sql;

  var isRangeLegend = window.gw.map.coloringConditions.colorized;
  var options = { isMarkerLayer: true };
  var legendColorsAsCartoCss = Style.getColorsFromLegend(altType);

  if (window.gw.map.year === 'latest') {
    dataSelection = [
      '(data_json::json->>(',
      ' SELECT',
      '  json_object_keys(data_json::json) as latest_year',
      ' FROM ' + window.gw.environment,
      ' WHERE cartodb_id = e.cartodb_id AND',
      "  data_json <> 'null'",
      ' ORDER BY 1 DESC',
      ' LIMIT 1',
      '))::float'
    ].join(' ');
  } else {
    dataSelection = "(data_json::json->>'" + window.gw.map.year
    + "')::float";
  }

  sql = [
    'SELECT',
    ' actual_geom as the_geom_webmercator,',
    ' cartodb_id,',
    ' name,',
    ' alt_type_slug,',
    ' slug,',
    dataSelection + ' AS data',
    'FROM ' + window.gw.environment + ' e',
    'WHERE ' + dataSelection + ' IS NOT NULL'
  ];

  options.markerFileCss = legendColorsAsCartoCss.markerFileCss;
  options.markerFillColorCss = legendColorsAsCartoCss.markerFillColorCss;
  options.markerLineColorColorCss = legendColorsAsCartoCss.markerLineColorColorCss;

  cartocss = '#layer { ' +
    legendColorsAsCartoCss.markerFileCss +
    legendColorsAsCartoCss.markerFillColorCss +
    ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';

  if (isRangeLegend) {
    cartocss += getConditionsColorsAsCartoCss(options);
  }

  config.subLayers[_altType] = config.baseLayer.createSubLayer({
    sql: sql.join(' '),
    cartocss: cartocss,
    interactivity: ['cartodb_id', 'name', 'alt_type_slug', 'slug', 'data']
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
          $('.leaflet-container').css('cursor', 'pointer');
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
          $('.leaflet-container').css('cursor', 'auto');
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
        window.location.href = pathname + data.alt_type_slug + '/' + data.slug
          + '?year=' + window.gw.map.year;

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

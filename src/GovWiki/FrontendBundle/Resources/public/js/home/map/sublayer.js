var config = require('./config.js');
var Tooltip = require('./tooltip.js');
var Legend = require('./legend');
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
  map.addLayer(polygon);
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
  var cartocss = '';
  var conditions;
  var cLayer;
  var countySubLayer;
  var _altType;
  var colorized = window.gw.map.county.colorized;
  if (colorized) {
    conditions = window.gw.map.county.conditions;
    // Default county color
    cartocss += '#layer { polygon-fill: #DDDDDD; polygon-opacity: 0.7; line-color: #FFF;' +
      ' line-width: 0.5; line-opacity: 1; } ';
    cartocss += Style.getPeriodConditionsAsCss(conditions);
    cartocss += Style.getSimpleConditionsAsCss(conditions);
    cartocss += Style.getNullConditionAsCss(conditions);
    if (cartocss === '') {
      console.warn('Can\'t find any condition, please verify your window.gw.map.county.conditions data');
      console.warn('or check getPeriodConditionsAsCss, getSimpleConditionsAsCss, getNullConditionAsCss functions');
    }
  } else {
    // Default county color if colorized disabled (flag in admin panel)
    cartocss = '#layer { polygon-fill: #DDDDDD; polygon-opacity: 0.7; line-color: #FFF;' +
      ' line-width: 0.5; line-opacity: 1; } ';
  }
  cLayer = {
    cartocss: cartocss,
    sql: "SELECT *, (data_json::json->>'" + window.gw.map.year +
    "')::float AS data, ST_AsGeoJSON(the_geom) AS geometry FROM " +
    window.gw.environment + " WHERE  alt_type_slug = '" +
    altType + "'",
    interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometry', 'data', 'name']
  };
  countySubLayer = layer.createSubLayer(cLayer);
  _altType = altType.toLowerCase();
  config.subLayers[_altType] = countySubLayer;
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
  var colorized = window.gw.map.county.colorized;
  var legendItemCss = {};
  if (colorized) {
    var conditions = window.gw.map.county.conditions,
      options = {
        isMarkerLayer: true
      };
    legendItemCss = Legend.getLegendItemAsCss(altType);
    if (legendItemCss) {
      options.markerFileCss = legendItemCss.markerFileCss;
      options.markerLineColorColorCss = legendItemCss.markerLineColorColorCss;
    }
    // Default marker color
    cartocss += '#layer { ' + legendItemCss.markerFileCss + legendItemCss.markerLineColorColorCss +
      ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
    cartocss += Style.getPeriodConditionsAsCss(conditions, options);
    cartocss += Style.getSimpleConditionsAsCss(conditions, options);
    cartocss += Style.getNullConditionAsCss(conditions, options);
    if (cartocss === '') {
      console.warn('Can\'t find any condition, please verify your window.gw.map.county.conditions data');
      console.warn('or check getPeriodConditionsAsCss, getSimpleConditionsAsCss, getNullConditionAsCss functions');
    }
  } else {
    legendItemCss = Style.getLegendItemAsCss(altType, true);
    cartocss = '#layer { ' + legendItemCss.markerFileCss + legendItemCss.markerLineColorColorCss +
      ' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
  }
  config.subLayers[_altType] = layer.createSubLayer({
    sql: "SELECT *, (data_json::json->>'" + window.gw.map.year +
    "')::float AS data, GeometryType(the_geom) AS geometrytype FROM " + window.gw.environment +
    " WHERE alt_type_slug = '" + altType + "'",
    cartocss: cartocss,
    interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometrytype', 'data', 'name']
  });
  Tooltip.init(_altType);
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
        var key;
        var tooltip;
        // TODO: Must be deleted, when data will be replaced, now it's hardcoded
        data.slug = data.slug.replace(/_/g, ' ');
        hovers[layerIndex] = 1;
        /**
         * If hover active
         */
        if (_.some(hovers)) {
          $('#map').css('cursor', 'pointer');
          /**
           * If hover on county layer
           */
          if (layerIndex === countySubLayer._position) {
            drawAppropriatePolygon(data);
          } else {
            removeAllHoverShapes();
          }
          /**
           * Open current tooltip, close another
           */
          for (key in tooltips) {
            if (tooltips.hasOwnProperty(key)) {
              tooltip = config.tooltips[key];
              if (tooltip !== null) {
                if (tooltip.getLayerIndex() === layerIndex) {
                  tooltip.enable();
                } else {
                  tooltip.disable();
                }
              }
            }
          }
        }
      });
      /**
       * Hide tooltip on hover
       * Or remove highlight on current county
       * It depends on the current Layer position
       */
      layer.bind('mouseout', function mouseout(layerIndex) {
        var key;
        var tooltip;
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
          for (key in tooltips) {
            if (tooltips.hasOwnProperty(key)) {
              tooltip = config.tooltips[key];
              if (tooltip !== null) {
                if (tooltip.getLayerIndex() === layerIndex) {
                  tooltip.disable();
                }
              }
            }
          }
        }
      });
      /**
       * Change window location after click on marker or county
       */
      layer.on('featureClick', function featureClick(event, latlng, pos, data) {
        var pathname;
        if (!data.alt_type_slug || !data.slug) {
          alert('Please verify your data, altTypeSlug or governmentSlug may can not defined, more info in console.log');
          console.log(data);
          return false;
        }
        /**
         * TODO: Hardcoded, data must be in underscore style
         */
        data.slug = data.slug.replace(/ /g, '_');
        pathname = window.location.pathname;
        if (pathname[pathname.length - 1] !== '/') {
          pathname += '/';
        }
        window.location.pathname = pathname + data.alt_type_slug + '/' + data.slug;
      });
    }
  }
}
/**
 * @public
 */
function removeAllHoverShapes() {
  map.removeLayer(polygon);
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
 * Reinitialize map with
 */
function reInit(settings) {
  var altTypes;
  if (settings) {
    if (settings.conditions.length > 0) {
      window.gw.map.county.conditions = settings.conditions;
    } else {
      window.gw.map.county.conditions = defaultConditions;
    }
  }
  altTypes = layersData.rows.filter(function loop(alt) {
    return !!alt.alt_type_slug;
  });
  initSubLayers(altTypes);
  initTooltips();
}
module.exports = {
  initCountySubLayer: initCountySubLayer,
  initMarkerSubLayer: initMarkerSubLayer,
  initSublayerHandlers: initSublayerHandlers,
  removeAllHoverShapes: removeAllHoverShapes,
  removeAllSubLayers: removeAllSubLayers,
  reInit: reInit
};

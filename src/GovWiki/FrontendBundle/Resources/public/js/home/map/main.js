require('../../vendor/bootstrap.js');
require('./config.js');
require('./cartodb_util.js');
// Search forms
require('../search_elected.js');
require('../search_government.js');

var sublayer = require('./sublayer.js');
var legend = require('./legend.js');
var legendRange = require('./legend_range.js');
var Tooltip = require('./tooltip.js');
var map;

// Create the leaflet map
map = L.map('map', {
  zoomControl: true,
  center: [window.gw.map.centerLatitude, window.gw.map.centerLongitude],
  zoom: window.gw.map.zoom
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: 'GovWiki'
}).addTo(map);

cartodb.createLayer(map, {
  user_name: window.gw.map.username,
  type: 'cartodb',
  sublayers: []
})
  .addTo(map)
  .done(function mapLoaded() {
    var sql;
    var select;
    var where;

    /**
     * Create new SQL request
     */
    sql = new cartodb.SQL({ user: window.gw.map.username });

    /**
     * SubLayers & tooltips initialization
     * Get unique altTypes and render new subLayers by them
     */
    select = 'SELECT GeometryType(the_geom), alt_type_slug FROM ' + window.gw.environment;
    where = 'WHERE the_geom IS NOT NULL GROUP BY GeometryType(the_geom), alt_type_slug ORDER BY alt_type_slug';
    sql.execute(select + '' + where)
      .done(function sqlLoaded(data) {
        init(data);
      })
      .error(function error(errors) {
        return cartodbError(errors);
      });
  });
function cartodbError() {
  var $mapProcessing = $('.mapOnProcessing');
  $mapProcessing
    .find('h5').eq(0)
    .text('Something went wrong, please contact with us (contact@californiapolicycenter.org) ');
  $mapProcessing.css({ opacity: 1 });
  $mapProcessing.show();
}
/**
 * Init
 */
function init(data) {
  var isAltTypeLegendUsed;
  var altTypes = data.rows.filter(function loop(alt) {
    return !!alt.alt_type_slug;
  });

  initSubLayers(altTypes);

  isAltTypeLegendUsed = false;

  if (findLegendType('altTypes')) {
    legend.init(altTypes);
    isAltTypeLegendUsed = true;
  }
  if (findLegendType('range')) {
    legendRange.init(!isAltTypeLegendUsed);
  }
  Tooltip.init();
  function findLegendType(legendType) {
    return window.gw.map.legendTypes.filter(function (legend) {
      return legend === legendType;
    })[0];
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
    sublayer.initCountySubLayer(altType.alt_type_slug);
  });
  markerSubLayers.forEach(function loop(altType) {
    sublayer.initMarkerSubLayer(altType.alt_type_slug);
  });
  sublayer.initSublayerHandlers();
}
/**
 * Add tooltips on page
 * @type {*[]}
 */
function initTooltips(tooltips) {
  var key;
  var tooltip;
  for (key in tooltips) {
    if (tooltips.hasOwnProperty(key)) {
      tooltip = tooltips[key];
      if (tooltip !== null) {
        $('#map_wrap').append(tooltip.render().el);
      }
    }
  }
}



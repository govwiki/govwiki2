require('../../vendor/bootstrap.js');
require('./config.js');
require('./cartodb_util.js');
// Search forms
require('../search_elected.js');
require('../search_government.js');

/* eslint-disable */
var config = require('./config.js');
var sublayer = require('./sublayer.js');
var legend = require('./legend.js');
var legendRange = require('./legend_range.js');
var tooltip = require('./tooltip.js');
/* eslint-enable */

// Create the leaflet map
config.map = L.map('map', {
  zoomControl: true,
  center: [window.gw.map.centerLatitude, window.gw.map.centerLongitude],
  zoom: window.gw.map.zoom
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: 'GovWiki'
}).addTo(config.map);

cartodb.createLayer(config.map, {
  user_name: window.gw.map.username,
  type: 'cartodb',
  sublayers: []
})
  .addTo(config.map)
  .done(function mapLoaded(baseLayer) {
    var sql;
    var select;
    var where;

    var $map = $('#map');
    var $loader = $('#map_wrap').find('.loader');

    baseLayer.on('load', function load() {
      $loader.hide();
      $map.show();
      $map.css({ opacity: 1 });
    });

    config.baseLayer = baseLayer;

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
    sql.execute(select + ' ' + where)
      .done(function sqlLoaded(data) {
        config.layersData = data;
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

  sublayer.initSubLayers(altTypes);
  tooltip.initTooltips();

  isAltTypeLegendUsed = false;

  if (findLegendType('altTypes')) {
    legend.init(altTypes);
    isAltTypeLegendUsed = true;
  }
  if (findLegendType('range')) {
    legendRange.init(!isAltTypeLegendUsed);
  }

  function findLegendType(legendType) {
    return _.forOwn(window.gw.map.legendTypes, function loop(legendName) {
      return legendName === legendType;
    })[0];
  }
}

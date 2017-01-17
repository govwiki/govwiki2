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
// For cmf environment we use custom map as tile layer.
if (window.gw.environment.indexOf('cmf') !== -1) {
  cartodb.createVis(
    'map',
    'https://joffemd.carto.com/api/v2/viz/8671cd00-dc75-11e6-9a78-0e3ebc282e83/viz.json',
    {
      zoomControl: true,
      scrollWheel: true,
      center: [window.gw.map.centerLatitude, window.gw.map.centerLongitude],
      zoom: window.gw.map.zoom
    }
  ).done(function visCreated(vis) {
    config.map = vis.getNativeMap();
    createMap(vis);
  });
} else {
  config.map = L.map('map', {
    zoomControl: true,
    center: [window.gw.map.centerLatitude, window.gw.map.centerLongitude],
    zoom: window.gw.map.zoom
  });


  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    attribution: 'GovWiki'
  }).addTo(config.map);


  createMap(cartodb);
}

function createMap(base) {
  var options = {
    user_name: window.gw.map.username,
    type: 'cartodb',
    sublayers: []
  };

  function mapLoaded(baseLayer) {
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

    /*
     * Create new SQL request
     */
    sql = new cartodb.SQL({ user: window.gw.map.username });

    /*
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
  }

  if (base instanceof cartodb.vis.Vis) {
    // Map created for cmf environment.
    base.createLayer(options);
    mapLoaded(base.getLayers()[1]);
  } else {
    // Map created for normal environment.
    base.createLayer(config.map, options)
      .addTo(config.map)
      .done(mapLoaded);
  }
}

function cartodbError() {
  var $mapProcessing = $('.mapOnProcessing');
  $mapProcessing
    .find('h5').eq(0)
    .text('Something went wrong, please contact with us (contact@californiapolicycenter.org) ');
  $mapProcessing.css({ opacity: 1 });
  $mapProcessing.show();
}
/*
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

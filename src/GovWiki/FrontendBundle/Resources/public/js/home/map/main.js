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
var tileSql = [
  'SELECT',
  ' case',
  "   when area = 'Puerto Rico'",
  '   then ST_scale(',
  '     ST_Transform(',
  '       St_translate(the_geom, 0, -2.5),',
  '       4437',
  '     ),7, 7)',
  "   when area  = 'USA'",
  '   then ST_Transform(the_geom_webmercator, 42303)',
  "   when area = 'Alaska'",
  '   then ST_Rotate(ST_Scale(',
  '     ST_Transform(',
  '       ST_Translate(',
  '         the_geom,100,-56',
  '       )',
  '       ,3857',
  '     )',
  '     , 0.3',
  '     , 0.65',
  '   ),0.1)',
  "   when area = 'Hawaii'",
  '   then ST_Scale(',
  '     ST_Transform(',
  '       ST_Translate(',
  '         the_geom,62,1',
  '       )',
  '       ,42303',
  '     )',
  '     , 1.5',
  '     , 1.5',
  '   )',
  ' end as the_geom_webmercator, cartodb_id, name',
  'FROM cmf_tile'
].join(' ');
var tileMapConfig = {
  layers: [
    {
      type: 'cartodb',
      options: {
        cartocss_version: '2.1.1',
        cartocss: 'Map {background-color: white;} #layer { polygon-fill: #bfbfbf; polygon-opacity: 0.7; line-color: #FFF;' +
                  ' line-width: 0.5; line-opacity: 1; } ',
        sql: tileSql
      }
    }
  ]
};
/* eslint-enable */

// Create the leaflet map
if (window.gw.environment.indexOf('cmf') !== -1) {
  cartodb.createVis(
    'map',
    'https://joffemd.carto.com/api/v2/viz/dd446cb8-d7c6-11e6-b4db-0e233c30368f/viz.json',
    {
      zoomControl: true,
      center: [window.gw.map.centerLatitude, window.gw.map.centerLongitude],
      zoom: window.gw.map.zoom
    }
  ).done(function visCreated(vis) {
    config.map = vis.getNativeMap();
    createMap();
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


  createMap();
}


//// Hardcode for cmf environment.
//if (window.gw.environment.indexOf('cmf') !== -1) {
//  $.ajax({
//    crossOrigin: true,
//    type: 'POST',
//    dataType: 'json',
//    contentType: 'application/json',
//    url: 'https://' + window.gw.map.username + '.cartodb.com/api/v1/map',
//    data: JSON.stringify(tileMapConfig),
//    success: function(data) {
//      var templateUrl = 'https://' + window.gw.map.username + '.cartodb.com/api/v1/map/'
//        + data.layergroupid + '/{z}/{x}/{y}.png';
//
//      L.tileLayer(templateUrl, {
//        attribution: 'GovWiki'
//      }).addTo(config.map);
//
//      createMap();
//    }
//  });
//} else {
//  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
//    attribution: 'GovWiki'
//  }).addTo(config.map);
//
//  createMap();
//}

function createMap() {
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
        $map.css({opacity: 1});
      });

      config.baseLayer = baseLayer;

      /*
       * Create new SQL request
       */
      sql = new cartodb.SQL({user: window.gw.map.username});

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
    });
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

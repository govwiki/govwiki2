var sublayer = require('./map/sublayer.js');
require('typeahead');
require('./map/main.js');

$('#year-selector').change(function change() {
  $('#map').hide();
  gw.map.year = $(this).find('option:selected').text();  // eslint-disable-line
  sublayer.removeAllSubLayers();
  sublayer.reInit();
});

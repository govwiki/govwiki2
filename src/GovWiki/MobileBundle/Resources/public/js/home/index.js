var sublayer = require('./map/sublayer.js');
require('typeahead');
require('./map/main.js');

$('#year-selector').change(function change() {
  $('#map').hide();
  sublayer.removeAllSubLayers();
  sublayer.reInit();
});

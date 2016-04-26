var sublayer = require('./map/sublayer.js');
require('typeahead.js');
require('./map/main.js');

$('#year-selector').change(function change() {
    $('#map').hide();
    window.gw.map.year = $(this).find(':selected').val();
    sublayer.removeAllSubLayers();
    sublayer.reInit();
});
require('./map/main.js');


$('#year-selector').change(function () {
  $map.hide();
  window.gw.map.year = $(this).find(':selected').val();

  removeAllSubLayers();
  reInit();
});


$('#year-selector').change(function() {
  $loader.show();
  $map.hide();
  window.gw.map.year = $(this).find(':selected').val();

  removeAllSubLayers();
  reInit();
});

/**
 * Reload document page
 */
$('#year-selector').change(function change() {
  window.location.search = '?year=' + $(this).find(':selected').val();
});

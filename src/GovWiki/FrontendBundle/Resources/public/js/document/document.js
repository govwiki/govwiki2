$(function() {
    /*
        Reload document page
     */
  $('#year-selector').change(function() {
    window.location.search = '?year=' + $(this).find(':selected').val();
  });
});

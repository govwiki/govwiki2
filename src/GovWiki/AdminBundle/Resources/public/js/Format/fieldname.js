$(function() {
  var $nameFormInput = $('#format_name');
  var $fieldNameFormInput = $('#format_field');

  $nameFormInput.change(function() {
    if (! $fieldNameFormInput.val()) {
      /*
          Current field name input is empty, get value from name input,
          slugify and put in to field name input.
       */
      $fieldNameFormInput.val(slugify($nameFormInput.val()));
    }
  });

  $fieldNameFormInput.change(function() {
    if ($fieldNameFormInput.val()) {
      /*
           Current field name input is empty, get value from name input,
           slugify and put in to field name input.
       */
      $fieldNameFormInput.val(slugify($nameFormInput.val()));
    }
  });

  var rankType = $('#format_rankType');
  rankType.change(function() {
    var rankLetterRanges = $('#format_rankLetterRanges');

    if (this.value === 'range') {
      rankLetterRanges.hide();
    } else {
      rankLetterRanges.show();
    }
  });

  $('#format_showIn').change(function() {
    if (rankType.val() === 'letter') {
      var selected = $(this).find(':selected');
      var count = selected.length;
      $('#format_rankLetterRanges > div').hide();

      selected.each(function () {
        var slug = this.value.replace(' ', '_');
        $('#' + slug)
          .removeClass()
          .addClass('col-md-' + (12 / count))
          .show();
      });
    }
  });
});

/**
 * @param {string} str String to slugify.
 *
 * @returns {string}
 */
function slugify(str)
{
  str = str.replace(/\W/g, '_');
  return str.toLowerCase();
}
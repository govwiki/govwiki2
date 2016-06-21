$(function() {
  var $nameFormInput = $('#format_name');
  var $fieldNameFormInput = $('#format_field');

  var showIn = $('#format_showIn');
  var type = $('#format_type');
  var ranked = $('#format_ranked');
  var rankType = $('#format_rankType');
  var rankLetterRanges = $('#format_rankLetterRanges');

  $nameFormInput.change(function() {
    if (! $fieldNameFormInput.val()) {
      // Current field name input is empty, get value from name input,
      // slugify and put in to field name input.
      $fieldNameFormInput.val(slugify($nameFormInput.val()));
    }
  });

  $fieldNameFormInput.change(function() {
    if ($fieldNameFormInput.val()) {
      // Current field name input is empty, get value from name input,
      // slugify and put in to field name input.
      $fieldNameFormInput.val(slugify($nameFormInput.val()));
    }
  });

  // React on format type changed.
  type.change(function() {
    if (this.value === 'string') {
      ranked.parent().hide();
      rankType.parent().hide();
      rankLetterRanges.parent().hide();
    } else {
      ranked.parent().show();
      if (ranked[0].checked) {
        rankType.parent().show();
        if (rankType[0].value === 'range') {
          rankLetterRanges.parent().hide();
        } else {
          generateRanges();
          rankLetterRanges.parent().show();
        }
      }
    }
  });

  // React on ranked checkbox change.
  ranked.click(function() {
    if (this.checked) {
      rankType.parent().show();
      if (rankType[0].value === 'range') {
        rankLetterRanges.parent().hide();
      } else {
        generateRanges();
        rankLetterRanges.parent().show();
      }
    } else {
      rankType.parent().hide();
      rankLetterRanges.parent().hide();
    }
  });

  // React on rank type changed.
  rankType.change(function() {
    if (this.value === 'range') {
      rankLetterRanges.parent().hide();
    } else {
      rankLetterRanges.parent().show();
    }
  });

  /*
   * Add or remove ranges for selected alt type in showIn element.
   */
  showIn.change(function() {
    if (rankType.val() === 'letter') {
      generateRanges();
    }
  });

  function generateRanges()
  {
    var selected = showIn.find(':selected');

    var prototype = rankLetterRanges.data('prototype');
    var colClass = 'col-md-' + (12 / selected.length);
    var diff;
    var currentElements = [];
    var selectedElements = [];

    // Get all selected altTypesSlug.
    selected.each(function () {
      selectedElements.push(this.value.replace(' ', '_'));
    });

    // Get all current displayed altTypeSlug ranges.
    rankLetterRanges.find('> div').each(function () {
      currentElements.push(this.id);
    });

    // Remove all unselected elements.
    diff = _.difference(currentElements, selectedElements);
    diff.forEach(function(item) {
      var element = document.getElementById(item);
      element.parentNode.removeChild(element);
    });

    // Add new selected elements.
    diff = _.difference(selectedElements, currentElements);
    diff.forEach(function(item) {
      var element = prototype
        .replace(/__name__label__/g, item)
        .replace(/__name__/g, item);

      rankLetterRanges.append(element);
    });

    // Change width of remain elements.
    rankLetterRanges.find('> div').each(function() {
      $(this).removeClass()
        .addClass(colClass);
    });
  }
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
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
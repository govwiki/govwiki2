$(function() {
    var $legend = $('#legend-edit');
    var $modal = $('#shape');
    var $selectedRow;

    /*
        Init color pickers.
     */
    $('.color-picker').colorpicker({
        format: 'hex',
        align: 'left'
    });

    $legend.on('click', '.color-picker input', function () {
        $(this).closest('.color-picker').colorpicker('show');
    });

    /*
        Shape add button callback.
     */
    $legend.on('click', '.shape-add', function () {
        $modal.modal('show');
        $selectedRow = $(this).closest('.form-group');
    });

    /*
        Shape add.
     */
    $modal.find('#new-shape').click(function () {
        var $form = $modal.find('form');
        var formData = new FormData($form[0]);

        $.ajax({
            url: $form.attr('action'),
            method: 'POST',
            data: formData,
            processData: false,
            cache: false,
            contentType: false
        })
            .done(function(data) {
                var $selectors = $legend.find('.shape-selector');
                var $chosenRowSelect = $selectedRow.find('.shape-selector');

                /*
                    Iterate through each shape selectors and add new shape at
                    the end of option list.
                 */
                $selectors.each(function(idx, element) {
                    var $element = $(element);

                    if ($chosenRowSelect[0] !== $element[0]) {
                        $element.append('<option value="'+ data.id +'">'+ data.name +'</option>');
                    } else {
                        $chosenRowSelect.append('<option value="'+ data.id +'" selected>'+ data.name +'</option>');
                    }
                });

                $form[0].reset();
                $modal.modal('hide');
            });
    });
});

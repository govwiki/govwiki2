Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


$(function() {
    var $addBtn = $('#condition-add');
    var $conditionList = $('#conditions-list');

    /*
        Add exists conditions.
     */
    window.gw.county.conditions.forEach(function(data) {
        var $element = $('<div>', { 'class': 'col-md-12 condition-row' });

        if ('simple' === data.type) {
            $element.html(Handlebars.templates.simple({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    value: data.value,
                    operation: data.operation,
                    color: data.color,
                    type: 'simple'
                }
            }));
        } else if ('period' === data.type) {
            $element.html(Handlebars.templates.period({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    min: data.min,
                    max: data.max,
                    color: data.color,
                    type: 'period'
                }
            }));
        } else {
            $element.html(Handlebars.templates.null({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    color: data.color,
                    type: 'null'
                }
            }));
        }

        $('.color-picker').colorpicker({
            format: 'hex',
            align: 'left'
        });

        $conditionList.append($element);
    });

    /*
        Add new condition, by default use simple condition form.
     */
    $addBtn.click(function() {

        var $element = $('<div>', { 'class': 'col-md-12 condition-row' });

        $element.html(Handlebars.templates.simple({
            idx: $conditionList.find('.condition-row').length,
            condition: {
                value: 0,
                operation: '<=',
                type: 'simple'
            }
        }));

        $conditionList.append($element);

        $('.color-picker').colorpicker({
            format: 'hex',
            align: 'left'
        });

    });

    /*
        Set remove callback.
     */
    $conditionList.on('click', '.condition-remove', function () {
        $(this).closest('.condition-row').remove();
    });

    $conditionList.on('click', '.color-picker input', function () {
        $(this).closest('.color-picker').colorpicker('show');
    });

    /*
        Set type change callback.
     */
    $conditionList.on('change', '.condition-type', function() {
        var type = $(this).find(':selected').val();
        var data = '';

        if ('simple' === type) {
            data = Handlebars.templates.simple({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    value: 0,
                    operation: '<=',
                    color: '#000000',
                    type: 'simple'
                }
            });
        } else if ('period' === type) {
            data = Handlebars.templates.period({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    min: 0,
                    max: 1,
                    color: '#000000',
                    type: 'period'
                }
            });
        } else {
            data = Handlebars.templates.null({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    color: '#000000',
                    type: 'null'
                }
            });
        }

        var $row = $(this).closest('.condition-row');
        $row.html(data);

        $('.color-picker').colorpicker({
            format: 'hex',
            align: 'left'
        });

    });

    /*
     Initialize color pickers.
     */
    $('.color-picker').colorpicker({
        format: 'hex',
        align: 'left'
    });
});

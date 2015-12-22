
var styles = JSON.parse(window.gw.styles);

styles.forEach(function(style) {
    parseStyles(style);
});

/**
 * Parse and applying styles
 * Based on BemJSON object
 *
 * @param {BemJSON} element
 */
function parseStyles(element) {

    var block = element.block || element.elem;
    var $element = $('.' + block);
    var content = element.content;
    var mods = element.mods;

    /**
     * Apply styles or hover on current $element
     */
    if (mods != null) {

        var modKeys = Object.keys(mods);

        modKeys.forEach(function(key) {

            /**
             * Apply Hover
             */
            if (key.indexOf('hover') !== -1) {

                $element.hover(function(e) {
                    key = key.indexOf('bg') ? 'bg_hover_color' : 'hover_color';
                    var newKey = keyMap(key, false);
                    var bgOrColor = key.indexOf('bg') !== -1 ? 'bg_color' : 'color';
                    $(this).css(newKey, (e.type === "mouseenter") ? mods[key] : mods[bgOrColor]);
                });

            /**
             * Apply styles
             */
            } else {

                var style = {};
                var isHeader = $element.hasClass('header');
                var newKey = keyMap(key, isHeader);
                style[newKey] = mods[key];
                $element.css(style);

            }

        });

    }

    /**
     * Recursion
     */
    if (content instanceof Array) {

        for (var i = 0; i < content.length; i++) {
            parseStyles(content[i]);
        }

    } else if (typeof content == 'string') {
        $element.html(content);
    }

}

/**
 * TODO: Must be replaced after fix data on backend
 * Return value by alias
 *
 * @param {String} key
 * @param {Boolean} isHeader
 */
function keyMap(key, isHeader) {

    switch (true) {
        case (key == 'color' && isHeader):
            key = 'backgroundColor';
            break;
        case (key == 'hover_color'):
            key = 'color';
            break;
        case (key == 'bg_color'):
            key = 'backgroundColor';
            break;
        case (key == 'bg_hover_color'):
            key = 'backgroundColor';
            break;
    }

    return key;
}

// Login action
$('body').on('submit', '#ajax-login-form', function(event) {
    event.preventDefault();
    $form = $(this);
    $form.parent().find('.alert').remove();
    console.log($form.serialize());
    $.post('/login_check', $form.serialize(), function(data) {
        if (data.error) {
            $form.parent().prepend('<div class="alert alert-warning">' + data.error + '</div>');
        } else {
            location.reload();
        }
    });
});

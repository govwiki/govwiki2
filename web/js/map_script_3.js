
var styles = JSON.parse(window.gw.styles);

//styles.forEach(function(style) {
//    parseStyles(style);
//});

//$('.loader_wrap').css({"opacity":0}).hide();

/**
 * Parse and applying styles
 * Based on BemJSON object
 *
 * @param {BemJSON} element
 */
//function parseStyles(element) {
//
//    var block = element.block || element.elem;
//    var $element = $('.' + block);
//    var content = element.content;
//    var mods = element.mods;
//
//    /**
//     * Apply styles or hover on current $element
//     */
//    if (mods != null) {
//
//        modKeys.forEach(function(css) {
//
//            /**
//             * Apply Hover
//             */
//            if (css.pseudo && css.preudo == 'hover') {
//
//                delete css.pseudo;
//
//                var cssStyle = Object.keys(css)[0];
//                console.log(cssStyle);
//
//                $element.hover(function(e) {
//                    $(this).css(cssStyle, (e.type === "mouseenter") ? : );
//                });
//
//            /**
//             * Apply styles
//             */
//            } else {
//
//                var style = {};
//                style[newKey] = mods[key];
//                $element.css(style);
//
//            }
//
//        });
//
//    }
//
//    /**
//     * Recursion
//     */
//    if (content instanceof Array) {
//
//        for (var i = 0; i < content.length; i++) {
//            parseStyles(content[i]);
//        }
//
//    } else if (typeof content == 'string') {
//        $element.html(content);
//    }
//
//}

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

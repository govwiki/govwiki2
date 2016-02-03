var styles = JSON.parse(window.gw.styles);

if (styles) {
    styles.forEach(function (style) {
        parseStyles(style);
    });
}

$loaderWrap = $('.loader_wrap');
$loaderWrap.css({"opacity":0});
window.setTimeout(function() {
    $loaderWrap.css({"visibility":"hidden"});
}, 1000);


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
    var attrs = element.attrs;

    /**
     * Apply styles or hover on current $element
     */
    if (mods != null) {

        mods.forEach(function(css) {

            /**
             * Apply Hover
             */
            if (css.pseudo && css.pseudo == 'hover') {

                delete css.pseudo;

                for (var cssKey in css) {
                    if (css.hasOwnProperty(cssKey)) {

                        (function (cssKey) {
                            $element.mouseover(function () {
                                $(this).css(cssKey, css[cssKey]);
                            });
                        })(cssKey);

                    }
                }

            /**
             * Apply styles
             */
            } else {
                $element.css(css);
                $element.mouseout(function () {
                    $(this).css(css);
                });
            }

        });

    }

    /**
     * Set/Modify attrs on current $element
     */
    if (attrs != null) {

        attrs.forEach(function (attrCollection) {

            for (var attrName in attrCollection) {
                if (attrCollection.hasOwnProperty(attrName)) {

                    $element.attr(attrName, attrCollection[attrName]);

                }
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

//// Login action
//$('body').on('submit', '#ajax-login-form', function(event) {
//    event.preventDefault();
//    $form = $(this);
//    $form.parent().find('.alert').remove();
//    console.log($form.serialize());
//    $.post('/login_check', $form.serialize(), function(data) {
//        if (data.error) {
//            $form.parent().prepend('<div class="alert alert-warning">' + data.error + '</div>');
//        } else {
//            location.reload();
//        }
//    });
//});

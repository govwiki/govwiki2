gw.admin = {};

/**
 * Get instance of loader on page.
 *
 * @constructor
 */
gw.admin.Loader = function()
{
    /**
     * @type {gw.admin.Loader}
     */
    var self = this;

    /**
     * Loader instance.
     *
     * @type {*|jQuery|HTMLElement}
     * @private
     */
    var _loader = $('.loader_wrap');


    /**
     * Show loader. Also, if message parameter is provided, show it too.
     *
     * @param {string?} message
     *
     * @returns {gw.admin.Loader}
     */
    this.show = function(message)
    {
        _loader.css({ "opacity": 1 });

        if (message) {
            _loader.find('h5').text(message);
        }

        window.setTimeout(function() {
            _loader.css({ "visibility" : "visible" });
        }, 1000);

        return self;
    };

    /**
     * Hide loader.
     *
     * @returns {gw.admin.Loader}
     */
    this.hide = function()
    {
        _loader.css({ "opacity": 0 });
        window.setTimeout(function() {
            _loader.css({ "visibility" : "hidden" });
        }, 1000);

        return self;
    };
};

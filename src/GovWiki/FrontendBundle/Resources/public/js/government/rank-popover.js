var Handlebars = require('../vendor/handlebars.runtime.js');

/**
 * @param {Object} options
 * @param {String} [options.selector]
 * @param {Number} options.year
 * @constructor
 */
var RankPopover = function RankPopover(options) {
    var opt = options || {};

    this.$popover = null;
    this.$rankTable = null;
    this.$preloader = null;
    this.$rankTable = null;

    this.selector = opt.selector || '.rank';
    this.loading = false;
    this.rankFieldName = null;
    this.order = { altType: '', rank: '' };
    this.year = opt.year;

    this.init();
};


/**
 * Initialize popover
 */
RankPopover.prototype.init = function init() {
    var self = this;
    var $statistics = $('.statistics');
    var $governmentController = $('.governmentController');
    self.noMoreData = false;

    // Popover window (Rank over all altTypes)
    $statistics.popover({
        placement: 'bottom',
        selector: this.selector,
        animation: true,
        template: '<div class="popover rankPopover" role="tooltip"><div class="arrow"></div>' +
        '<div class="popover-title-custom"><h3 class="popover-title"></h3></div>' +
        '<div class="popover-content"></div></div>'
    });

    $governmentController.on('click', function click(e) {
        // Close other popovers
        if (!$(e.target).closest('.popover')[0]) {
            $('.rank').not(e.target).popover('destroy');
        }
    });

    $statistics.on('click', function click(e) {
        var $element = $(e.target);
        var $popover = $element.hasClass('rank') ? $element : $element.closest('.rank');

        e.preventDefault();
        e.stopPropagation();

        // Close other popovers
        if (!$(e.target).closest('.popover')[0]) {
            $('.rank').not(e.target).popover('destroy');
        }

        if ($popover.length === 0) {
            return true;
        }

        self.$popover = $element;

        self.$popoverContent = $popover.next().find('.popover-content');

        self.rankFieldName = $popover.attr('data-field');

        self.$popover.on('hide.bs.popover', function onHidePopover() {
            self.noMoreData = false;
        });

        if (self.rankFieldName) {
            self.loading = true;

            $.ajax({
                url: window.gw.urls.popover,
                dataType: 'json',
                data: {
                    field_name: self.rankFieldName,
                    year: self.year
                },
                success: function success(data) {
                    if (data.data.length !== 0) {
                        self.formatData.call(self, data);
                        // Render rankTable template
                        self.$popoverContent.html(Handlebars.templates.rankTable(data));
                        self.$rankTable = self.$popoverContent.find('table tbody');
                        self.$preloader = self.$popoverContent.find('.loader');
                        // Initialize scroll and sort handlers
                        self.scrollHandler.call(self);
                        self.sortHandler.call(self);
                        self.loading = false;
                    } else {
                        if (!self.noMoreData) {
                            self.$popoverContent[0].innerHTML = '<h3 style="text-align: center">No data</h3>';
                            self.noMoreData = true;
                            self.loading = false;
                        }
                    }
                }
            });
        }
        return true;
    });
};

/**
 * Add scroll handler on popoverContent
 */
RankPopover.prototype.scrollHandler = function scrollHandler() {
    var self = this;

    var $rankTable = self.$rankTable;

    var order = self.order;

    self.previousScrollTop = 0;
    self.currentPage = 0;

    self.$popoverContent.scroll(function scroll() {
        var currentScrollTop = self.$popoverContent.scrollTop();

        if (self.previousScrollTop < currentScrollTop &&
            currentScrollTop > 0.5 * self.$popoverContent[0].scrollHeight &&
            !self.noMoreData) {
            self.previousScrollTop = currentScrollTop;
            if (self.loading === false) {
                self.loading = true;
                self.$preloader.show();
                $.ajax({
                    url: window.gw.urls.popover,
                    dataType: 'json',
                    data: {
                        page: ++self.currentPage,
                        order: order.rank,
                        name_order: order.altType,
                        field_name: self.rankFieldName,
                        year: self.year
                    },
                    success: function success(data) {
                        var h3;
                        if (data.data.length !== 0) {
                            self.formatData(data);
                            self.loading = false;
                            self.$preloader.hide();
                            $rankTable[0].innerHTML += Handlebars.templates.rankTableAdditionalRows(data);
                        } else {
                            if (!self.noMoreData) {
                                self.noMoreData = true;
                                h3 = $('<h3 style="text-align: center">No more data</h3>');
                                self.$popoverContent.append(h3);
                                self.loading = false;
                                self.$preloader.hide();
                            }
                        }
                    }
                });
            }
        }
    });
};

/**
 * Add sort handler for rankTable header (th)
 */
RankPopover.prototype.sortHandler = function sortHandler() {
    var self = this;
    var order = self.order;

    self.$popoverContent.on('click', 'th', function click(e) {
        var $sortIcon;
        var $column;
        e.stopPropagation();

        self.$popoverContent.find('h3').remove();

        self.noMoreData = false;
        self.previousScrollTop = 0;
        self.currentPage = 0;

        $column = $(this).hasClass('sortable') ? $(this) : $(this).closest('th');
        $sortIcon = $column.find('i');

        /* eslint-disable */
        if ($column.hasClass('desc')) {
            $column.attr('data-sort-type') === 'name_order' ? order.altType = '' : order.rank = '';
            $column.removeClass('desc').removeClass('asc');
            $sortIcon.removeClass('icon__bottom').removeClass('icon__top');
        } else if ($column.hasClass('asc')) {
            $column.attr('data-sort-type') === 'name_order' ? order.altType = 'desc' : order.rank = 'desc';
            $column.removeClass('asc').addClass('desc');
            $sortIcon.removeClass('icon__top').addClass('icon__bottom');
        } else {
            $column.attr('data-sort-type') === 'name_order' ? order.altType = 'asc' : order.rank = 'asc';
            $column.addClass('asc');
            $sortIcon.addClass('icon__top');
        }
        /* eslint-enable */
        self.loadNewRows.call(self, order);
    });
};

/**
 * Lazy load additional rows
 * @param {Object} [order] Sort
 * @param {String} [order.altType] Available values: '', 'asc', 'desc'
 * @param {String} [order.rank] Available values: '', 'asc', 'desc'
 */
RankPopover.prototype.loadNewRows = function loadNewRows(order) {
    var self = this;

    var $rankTable = self.$rankTable || self.$popoverContent.find('table tbody');

    var _order = order || this.order;

    $rankTable.html('');

    self.$preloader.show();
    self.loading = true;

    $.ajax({
        url: window.gw.urls.popover,
        dataType: 'json',
        data: {
            page: self.currentPage,
            order: _order.rank,
            name_order: _order.altType,
            field_name: self.rankFieldName,
            year: self.year
        },
        success: function success(data) {
            if (data.data.length !== 0) {
                self.formatData.call(self, data);
                $rankTable.html(Handlebars.templates.rankTableAdditionalRows(data));
                self.loading = false;
                self.$preloader.hide();
            } else {
                self.$popoverContent[0].innerHTML = '<h3 style="text-align: center">No data</h3>';
                self.loading = false;
                self.$preloader.hide();
            }
        }
    });
};

/**
 * Apply mask with numeric.js library
 *
 * @param data
 * @returns {void|*}
 */
RankPopover.prototype.formatData = function formatData(data) {
    var self = this;

    var $popover = self.$popover;
    var mask = $popover.attr('data-mask');

    /*eslint-disable */
    if (mask) {
        return data.data.forEach(function loop(rank) {
            return rank.amount = numeral(rank.amount).format(mask);
        });
    }
    /*eslint-disable */
    return true;
};

/*eslint-disable */
// rankTable template
(function () {
    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
    templates['rankTable'] = template({ '1':function (container, depth0, helpers, partials, data) {
        var stack1, helper, alias1 = depth0 != null ? depth0 : {}, alias2 = helpers.helperMissing, alias3 = 'function', alias4 = container.escapeExpression;

        return ' <tr> <td>'
            + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, { 'name':'name', 'hash':{}, 'data':data }) : helper)))
            + '</td> <td> '
            + ((stack1 = helpers['if'].call(alias1, (depth0 != null ? depth0.value : depth0), { 'name':'if', 'hash':{}, 'fn':container.program(2, data, 0), 'inverse':container.program(4, data, 0), 'data':data })) != null ? stack1 : '')
            + '</td> <td> '
            + alias4(((helper = (helper = helpers.amount || (depth0 != null ? depth0.amount : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, { 'name':'amount', 'hash':{}, 'data':data }) : helper)))
            + '</td> </tr> ';
    }, '2':function (container, depth0, helpers, partials, data) {
        var helper;

        return ' '
            + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing), (typeof helper === 'function' ? helper.call(depth0 != null ? depth0 : {}, { 'name':'value', 'hash':{}, 'data':data }) : helper)))
            + ' ';
    }, '4':function (container, depth0, helpers, partials, data) {
        return ' No data ';
    }, 'compiler':[7, '>= 4.0.0'], 'main':function (container, depth0, helpers, partials, data) {
        var stack1, helper, options, alias1 = depth0 != null ? depth0 : {}, alias2 = helpers.helperMissing, alias3 = 'function', buffer =
            '<table class="table table-condensed table-hover"> <thead> <tr> <th data-sort-type="name_order" class="sortable"><nobr>'
            + container.escapeExpression(((helper = (helper = helpers.alt_type || (depth0 != null ? depth0.alt_type : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, { 'name':'alt_type', 'hash':{}, 'data':data }) : helper)))
            + '<i class="icon"></i></nobr></th> <th data-sort-type="order" class="sortable"><nobr>Rank<i class="icon"></i></nobr></th> <th>Amount</th> </tr> </thead> <tbody> ';
        stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : alias2), (options = { 'name':'data', 'hash':{}, 'fn':container.program(1, data, 0), 'inverse':container.noop, 'data':data }), (typeof helper === alias3 ? helper.call(alias1, options) : helper));
        if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0, stack1, options);}
        if (stack1 != null) { buffer += stack1; }
        return buffer + '\n    </tbody>\n</table>\n<div class="loader"></div>\n';
    }, 'useData':true });
})();

// rankTableAdditionalRows template
(function () {
    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
    templates['rankTableAdditionalRows'] = template({ '1':function (container, depth0, helpers, partials, data) {
        var stack1, helper, alias1 = depth0 != null ? depth0 : {}, alias2 = helpers.helperMissing, alias3 = 'function', alias4 = container.escapeExpression;

        return ' <tr> <td>'
            + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, { 'name':'name', 'hash':{}, 'data':data }) : helper)))
            + '</td> <td> '
            + ((stack1 = helpers['if'].call(alias1, (depth0 != null ? depth0.value : depth0), { 'name':'if', 'hash':{}, 'fn':container.program(2, data, 0), 'inverse':container.program(4, data, 0), 'data':data })) != null ? stack1 : '')
            + '\n        </td>\n        <td>\n            '
            + alias4(((helper = (helper = helpers.amount || (depth0 != null ? depth0.amount : depth0)) != null ? helper : alias2), (typeof helper === alias3 ? helper.call(alias1, { 'name':'amount', 'hash':{}, 'data':data }) : helper)))
            + '\n        </td>\n    </tr>\n';
    }, '2':function (container, depth0, helpers, partials, data) {
        var helper;

        return ' '
            + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing), (typeof helper === 'function' ? helper.call(depth0 != null ? depth0 : {}, { 'name':'value', 'hash':{}, 'data':data }) : helper)))
            + ' ';
    }, '4':function (container, depth0, helpers, partials, data) {
        return ' No data ';
    }, 'compiler':[7, '>= 4.0.0'], 'main':function (container, depth0, helpers, partials, data) {
        var stack1, helper, options, buffer = '';

        stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing), (options = { 'name':'data', 'hash':{}, 'fn':container.program(1, data, 0), 'inverse':container.noop, 'data':data }), (typeof helper === 'function' ? helper.call(depth0 != null ? depth0 : {}, options) : helper));
        if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0, stack1, options);}
        if (stack1 != null) { buffer += stack1; }
        return buffer;
    }, 'useData':true });
})();
/*eslint-enable */

module.exports = RankPopover;
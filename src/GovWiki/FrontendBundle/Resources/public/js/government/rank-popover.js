
/**
 * @param {Object} options
 * @param {String} options.selector
 * @constructor
 */
var RankPopover = function(options) {
    options = options | {};

    this.$popover = null;
    this.$rankTable = null;
    this.$preloader = null;
    this.$rankTable = null;

    this.selector = options.selector || '.rank';
    this.loading = false;
    this.rankFieldName = null;
    this.rankFieldNameInCamelCase = null;
    this.order = { altType: '', rank: ''};

    this.init();
};


/**
 * Initialize popover
 */
RankPopover.prototype.init = function init() {

    var self = this;

    var $statistics = $('.statistics');
    var $governmentController = $('.governmentController');

    // Popover window (Rank over all altTypes)
    $statistics.popover({
        placement: 'bottom',
        selector: this.selector,
        animation: true,
        template: '<div class="popover rankPopover" role="tooltip"><div class="arrow"></div><div class="popover-title-custom"><h3 class="popover-title"></h3></div><div class="popover-content"><div class="loader"></div></div></div>'
    });

    $governmentController.on('click', function(e) {

        self.$popover = $(e.target);
        $popover = self.$popover.hasClass('rank') ? self.$popover : self.$popover.closest('.rank');

        // Close other popovers
        if (!$(e.target).closest('.popover')[0]) {
            $('.rank').not(e.target).popover('destroy');
        }

        self.$popoverContent = $popover.next().find('.popover-content');
        self.$preloader = self.$popoverContent.find('.loader');
        self.rankFieldName = $popover.attr('data-field');

        var $popoverContent = self.$popoverContent;
        var $preloader = self.$preloader;
        var rankFieldName = self.rankFieldName;

        if (rankFieldName) {
            self.loading = true;
            $preloader.show();

            self.rankFieldNameInCamelCase = rankFieldName.replace(/_([a-z0-9])/g, function(g) {
                return g[1].toUpperCase();
            });

            $.ajax({
                url: '/api/v1/government' + window.location.pathname + '/get_ranks',
                dataType: 'json',
                data: {
                    field_name: self.rankFieldNameInCamelCase
                },
                success: function(data) {
                    self.formatData.call(self, data);
                    // Render rankTable template
                    $popoverContent.html(Handlebars.templates.rankTable(data));
                    self.$rankTable = $popoverContent.find('table tbody');
                    // Initialize scroll and sort handlers
                    self.scrollHandler.call(self);
                    self.sortHandler.call(self);
                    self.loading = false;
                    $preloader.hide();
                }
            });
        }


    });

};

/**
 * Add scroll handler on popoverContent
 */
RankPopover.prototype.scrollHandler = function scrollHandler () {

    var self = this;

    var $rankTable = self.$rankTable;
    var $popoverContent = self.$popoverContent;
    var $preloader = self.$preloader;

    var previousScrollTop = self.previousScrollTop;
    var currentPage = self.currentPage;
    var rankFieldNameInCamelCase = self.rankFieldNameInCamelCase;
    var order = self.order;

    previousScrollTop = 0;
    currentPage = 0;

    $popoverContent.scroll(function() {

        var currentScrollTop = $popoverContent.scrollTop();

        if (previousScrollTop < currentScrollTop && currentScrollTop > 0.5 * $popoverContent[0].scrollHeight) {
            previousScrollTop = currentScrollTop;
            if (self.loading === false) {
                self.loading = true;
                $preloader.show();
                $.ajax({
                    url: '/api/v1/government' + window.location.pathname + '/get_ranks',
                    dataType: 'json',
                    data: {
                        page: ++currentPage,
                        order: order.rank,
                        name_order: order.altType,
                        field_name: rankFieldNameInCamelCase
                    },
                    success: function(data) {
                        self.formatData(data);
                        self.loading = false;
                        $preloader.hide();
                        $rankTable[0].innerHTML += Handlebars.templates.rankTableAdditionalRows(data);
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
    var $popoverContent = self.$popoverContent;
    var order = self.order;

    $popoverContent.on('click', 'th', function(e) {

        var $column = $(this).hasClass('sortable') ? $(this) : $(this).closest('th');
        var $sortIcon = $column.find('i');

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

        self.loadNewRows.call(self, order);

    });

};

/**
 * Lazy load additional rows
 * @param {Object} [order] Sort
 * @param {String} [order.altType] Available values: '', 'asc', 'desc'
 * @param {String} [order.rank] Available values: '', 'asc', 'desc'
 */
RankPopover.prototype.loadNewRows = function loadNewRows (order) {
    order = order || this.order;

    var self = this;

    var $preloader = self.$preloader;
    var $rankTable = self.$rankTable || self.$popoverContent.find('table tbody');

    $rankTable.html('');

    $preloader.show();
    self.loading = true;
    self.currentPage = 0;
    self.previousScrollTop = 0;

    $.ajax({
        url: '/api/v1/government' + window.location.pathname + '/get_ranks',
        dataType: 'json',
        data: {
            page: self.currentPage,
            order: order.rank,
            name_order: order.altType,
            field_name: self.rankFieldNameInCamelCase
        },
        success: function(data) {
            self.formatData.call(self, data);
            $rankTable.html(Handlebars.templates.rankTableAdditionalRows(data));
            self.loading = false;
            self.$preloader.hide();
        }
    });

};

/**
 * Apply mask with numeric.js library
 *
 * @param data
 * @returns {void|*}
 */
RankPopover.prototype.formatData = function formatData (data) {

    var self = this;

    var $popover = self.$popover;
    var mask = $popover.attr('data-mask');

    if (mask) {
        return data.data.forEach(function(rank) {
            return rank.amount = numeral(rank.amount).format(mask);
        });
    }
};

// rankTable template
(function() {
    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
    templates['rankTable'] = template({"1":function(container,depth0,helpers,partials,data) {
        var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

        return " <tr> <td>"
            + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
            + "</td> <td> "
            + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
            + "</td> <td> "
            + alias4(((helper = (helper = helpers.amount || (depth0 != null ? depth0.amount : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"amount","hash":{},"data":data}) : helper)))
            + "</td> </tr> ";
    },"2":function(container,depth0,helpers,partials,data) {
        var helper;

        return " "
            + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
            + " ";
    },"4":function(container,depth0,helpers,partials,data) {
        return " No data ";
    },"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
        var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer =
            "<table class=\"table table-condensed table-hover\"> <thead> <tr> <th data-sort-type=\"name_order\" class=\"sortable\"><nobr>"
            + container.escapeExpression(((helper = (helper = helpers.alt_type || (depth0 != null ? depth0.alt_type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"alt_type","hash":{},"data":data}) : helper)))
            + "<i class=\"icon\"></i></nobr></th> <th data-sort-type=\"order\" class=\"sortable\"><nobr>Rank<i class=\"icon\"></i></nobr></th> <th>Amount</th> </tr> </thead> <tbody> ";
        stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : alias2),(options={"name":"data","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
        if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
        if (stack1 != null) { buffer += stack1; }
        return buffer + "\n    </tbody>\n</table>\n<div class=\"loader\"></div>\n";
    },"useData":true});
})();

// rankTableAdditionalRows template
(function() {
    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
    templates['rankTableAdditionalRows'] = template({"1":function(container,depth0,helpers,partials,data) {
        var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

        return " <tr> <td>"
            + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
            + "</td> <td> "
            + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
            + "\n        </td>\n        <td>\n            "
            + alias4(((helper = (helper = helpers.amount || (depth0 != null ? depth0.amount : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"amount","hash":{},"data":data}) : helper)))
            + "\n        </td>\n    </tr>\n";
    },"2":function(container,depth0,helpers,partials,data) {
        var helper;

        return " "
            + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
            + " ";
    },"4":function(container,depth0,helpers,partials,data) {
        return " No data ";
    },"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
        var stack1, helper, options, buffer = "";

        stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
        if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
        if (stack1 != null) { buffer += stack1; }
        return buffer;
    },"useData":true});
})();
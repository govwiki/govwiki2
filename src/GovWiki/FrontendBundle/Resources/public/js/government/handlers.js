$(function() {

    // Popover window (Rank over all altTypes)
    $('.statistics').popover({
        placement: 'bottom',
        selector: '.rank',
        animation: true,
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-title-custom"><h3 class="popover-title"></h3></div><div class="popover-content"></div></div>'
    });


    $('.governmentController').on('click', function(e) {
        var $element, additionalRowsTpl, currentPage, fieldName, fieldNameInCamelCase, formatData, loadNewRows, loading, mask, popoverContent, popoverNameOrder, popoverOrder, popoverTpl, preloader, previousScrollTop;
        $element = $(e.target);
        popoverContent = $element.parent().find('.popover-content');
        fieldName = $element.attr('data-field');
        mask = $element.attr('data-mask');
        popoverTpl = $('#rankPopover').html();
        additionalRowsTpl = $('#additionalRows').html();
        preloader = popoverContent.find('loader');
        previousScrollTop = 0;
        currentPage = 0;
        loading = false;
        popoverOrder = null;
        popoverNameOrder = null;
        if (!$element.closest('.popover')[0]) {
            $('.rank').not(e.target).popover('destroy');
        }
        formatData = function(data) {
            if (mask) {
                return data.data.forEach(function(rank) {
                    return rank.amount = numeral(rank.amount).format(mask);
                });
            }
        };
        loadNewRows = function() {
            var fieldNameInCamelCase, table;
            loading = true;
            preloader.show();
            table = popoverContent.find('table tbody');
            table.html('');
            currentPage = 0;
            previousScrollTop = 0;
            fieldNameInCamelCase = fieldName.replace(/_([a-z0-9])/g, function(g) {
                return g[1].toUpperCase();
            });
            return $.ajax({
                url: '/api/v1/government' + window.location.pathname + '/get_ranks',
                dataType: 'json',
                data: {
                    page: currentPage,
                    order: popoverOrder,
                    name_order: popoverNameOrder,
                    field_name: fieldNameInCamelCase
                },
                success: function(data) {
                    var compiledTemplate;
                    formatData(data);
                    compiledTemplate = Handlebars.compile(additionalRowsTpl);
                    table.html(compiledTemplate(data));
                    loading = false;
                    return preloader.hide();
                }
            });
        };
        popoverContent.on('click', 'th', function(e) {
            var $column;
            $column = $(e.target).hasClass('sortable') ? $(e.target) : $(e.target).closest('th');;
            if ($column.hasClass('sortable')) {
                if ($column.hasClass('desc')) {
                    if ($column.attr('data-sort-type') === 'name_order') {
                        popoverNameOrder = '';
                    } else {
                        popoverOrder = '';
                    }
                    loadNewRows();
                    $column.removeClass('desc').removeClass('asc');
                    return $column.find('i').removeClass('icon__bottom').removeClass('icon__top');
                } else if ($column.hasClass('asc')) {
                    if ($column.attr('data-sort-type') === 'name_order') {
                        popoverNameOrder = 'desc';
                    } else {
                        popoverOrder = 'desc';
                    }
                    loadNewRows();
                    $column.removeClass('asc').addClass('desc');
                    return $column.find('i').removeClass('icon__top').addClass('icon__bottom');
                } else {
                    if ($column.attr('data-sort-type') === 'name_order') {
                        popoverNameOrder = 'asc';
                    } else {
                        popoverOrder = 'asc';
                    }
                    loadNewRows();
                    $column.addClass('asc');
                    return $column.find('i').addClass('icon__top');
                }
            }
        });
        if (fieldName) {
            fieldNameInCamelCase = fieldName.replace(/_([a-z0-9])/g, function(g) {
                return g[1].toUpperCase();
            });
            $.ajax({
                url: '/api/v1/government' + window.location.pathname + '/get_ranks',
                dataType: 'json',
                data: {
                    field_name: fieldNameInCamelCase
                },
                success: function(data) {
                    var compiledTemplate;
                    formatData(data);
                    compiledTemplate = Handlebars.compile(popoverTpl);
                    return popoverContent.html(compiledTemplate(data));
                }
            });
        }
        return popoverContent.scroll(function() {
            var currentScrollTop;
            currentScrollTop = popoverContent.scrollTop();
            if (previousScrollTop < currentScrollTop && currentScrollTop > 0.5 * popoverContent[0].scrollHeight) {
                previousScrollTop = currentScrollTop;
                if (loading === false) {
                    loading = true;
                    preloader.show();
                    return $.ajax({
                        url: '/api/v1/government' + window.location.pathname + '/get_ranks',
                        dataType: 'json',
                        data: {
                            page: ++currentPage,
                            order: popoverOrder,
                            name_order: popoverNameOrder,
                            field_name: fieldNameInCamelCase
                        },
                        success: function(data) {
                            var compiledTemplate;
                            formatData(data);
                            loading = false;
                            preloader.hide();
                            compiledTemplate = Handlebars.compile(additionalRowsTpl);
                            popoverContent.find('table tbody')[0].innerHTML += compiledTemplate(data);
                            return console.log(data);
                        }
                    });
                }
            }
        });
    });






});
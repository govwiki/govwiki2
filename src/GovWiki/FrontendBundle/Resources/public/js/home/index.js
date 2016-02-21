/**
 * Extend CartoDB Tooltip
 * Get Layer position
 *
 * @returns {number} Layer Position
 */
cdb.geo.ui.Tooltip.prototype.getLayerIndex = function () {
    return this.options.layer._position;
};

$(function(){

    /**
     * window.gw.map = {
     *  centerLatitude: Number
     *  centerLongitude: Number
     *  zoom: Number
     *  username: String
     * }
     */
    window.gw.map = JSON.parse(window.gw.map);

    var color = '';

    // TODO: Hardcoded
    window.gw.map.county = window.gw.map.colorizedCountyConditions;

    window.gw.map.legend = window.gw.map.legend || [];
    window.gw.map.legendTypes = window.gw.map.legendTypes || [];
    var legend = window.gw.map.legend.sort(function (a, b) {
        return a.order > b.order;
    });
    var legendConfig = {
        fillColor: 'white'
    };

    //Create the leaflet map
    var map = L.map('map', {
        zoomControl: true,
        center: [window.gw.map.centerLatitude, window.gw.map.centerLongitude],
        zoom: window.gw.map.zoom
    });

    var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: 'GovWiki'
    }).addTo(map);

    // Empty layer
    cartodb.createLayer(map,{
        user_name: window.gw.map.username,
        type: 'cartodb',
        sublayers: []
    })
    .addTo(map)
    .done(function(layer){

        var subLayers = {};
        // todo remove if it's not need anymore
        var markerColors = ['#f00', '#800080', '#add8e6'];

        /**
         * Available layers
         */
        var countySubLayer;
        var tooltips = {};

        /**
         * Create new SQL request
         */
        var sql = new cartodb.SQL({ user: window.gw.map.username });

        /**
         * SubLayers & tooltips initialization
         * Get unique altTypes and render new subLayers by them
         */
        sql.execute("SELECT GeometryType(the_geom), alt_type_slug FROM " + window.gw.environment + " WHERE the_geom IS NOT NULL GROUP BY GeometryType(the_geom), alt_type_slug ORDER BY alt_type_slug")
            .done(function(data) {

                var altTypes = data.rows.filter(function (alt) {
                    return !!alt.alt_type_slug
                });

                initSubLayers(altTypes);

                var isAltTypeLegendUsed = false;
                if (findLegendType('altTypes')) {
                    initLegend(altTypes);
                    isAltTypeLegendUsed = true
                }

                if (findLegendType('range')) {
                    initRangeLegend(! isAltTypeLegendUsed);
                }

                initTooltips();

                initSublayerHandlers();

                fixCartodbConstrain();

                loadFinished();

            })
            .error(function(errors) {
                return cartodbError(errors);
            });

        function cartodbError(errors)
        {
            $('.loader').hide();
            var $mapProcessing = $('.mapOnProcessing');
            $mapProcessing.find('h5').eq(0).text('Something went wrong, please contact with us (contact@californiapolicycenter.org) ');
            $mapProcessing.css({"opacity":1});
            $mapProcessing.show();

            console.log(errors);
        }

        /**
         * Create additional subLayers by altType
         *
         * @param altTypes Unique altTypes from MySQL
         */
        function initSubLayers(altTypes) {

            var countySubLayers = altTypes.filter(function(altType) {
                return (altType.geometrytype === "MULTIPOLYGON" || altType.geometrytype === "POLYGON")
            });

            var markerSubLayers = altTypes.filter(function(altType) {
                return (altType.geometrytype !== "MULTIPOLYGON" && altType.geometrytype !== "POLYGON")
            });

            countySubLayers.forEach(function(altType) {
                initCountySubLayer(altType.alt_type_slug);
            });

            markerSubLayers.forEach(function(altType) {
                initMarkerSubLayer(altType.alt_type_slug);
            });

            initSublayerHandlers();
            loadFinished();

        }

        /**
         * Get condition filtered by conditionType
         * @param {Array} conditions
         * @param {String} conditionType - period, simple, null
         * @returns {*}
         */
        function getConditionsByType(conditions, conditionType) {
            return conditions.filter(function(condition) {
                return condition.type === conditionType;
            });
        }

        /**
         * CartoCSS !!!
         *
         * @param altType
         * @param {boolean?} useFill
         * @returns {*}
         */
        function getLegendItemAsCss (altType, useFill) {

            useFill = useFill || false;

            // Search current altType in legend (window.gw.map.legend = [Object, Object, ...])
            var foundLegend = legend.filter(function(item){
                return item.altType == altType
            })[0];

            if (!foundLegend) {
                return false;
            }

            var url = window.location.href.substr(0, window.location.href.length-1);

            // If url to marker exist, create new css rule (path to marker icon)
            var markerIconUrl = foundLegend ? foundLegend["shape"] : false;
            var markerFileCss = markerIconUrl ? "marker-file: url(" + url + markerIconUrl + ");" : '';

            var markerStrokeColor = foundLegend ? foundLegend['color'] : false;

            var markerLineColorColorCss = "marker-line-color: " + markerStrokeColor + "; ";
            if (useFill) {
                markerLineColorColorCss = "marker-fill: " + markerStrokeColor + "; ";
            }

            return {
                markerFileCss: markerFileCss,
                markerLineColorColorCss: markerLineColorColorCss
            };

        }

        function findLegendType (legendType) {
            return window.gw.map.legendTypes.filter(function(legend) {
                return legend === legendType;
            })[0];
        }

        /**
         * Get period conditions as css string
         *
         * @param conditions - window.gw.map.county.conditions
         * @param color
         * @param options
         * @returns {string} CSS String || ''
         */
        function getPeriodConditionsAsCss(conditions, color, options) {

            if (!conditions) {
                console.warn('You don\'t pass condition array into getPeriodConditionsAsCss() function');
                return '';
            }

            options = options || {};

            var cssConditions = '';

            var periodConditions = getConditionsByType(conditions, 'period');

            // If simple conditions found
            if (periodConditions.length !== 0) {

                periodConditions.forEach(function (condition) {

                    // Fill polygon or marker
                    var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
                    var fillColor = options.isMarkerLayer ? condition.color : condition.color;
                    var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
                    var fill = fillRule + ': ' + fillColor + ';' + markerTypeCss;

                    // Stroke polygon or marker
                    var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
                    var lineColor = options.isMarkerLayer ? color : '#FFFFFF';
                    var line = lineColorRule + ': ' + lineColor + ';';
                    if (options.markerLineColorColorCss) {
                        line = options.markerLineColorColorCss;
                    }
                    var stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';

                    var min = '[data >= ' + condition.min + ']';
                    var max = '[data <= ' + condition.max + ']';
                    var style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';

                    cssConditions += '#layer' + min + max + style;
                });

            }

            return cssConditions ? cssConditions : '';
        }

        /**
         * Get simple conditions as css string
         *
         * @param conditions - window.gw.map.county.conditions
         * @param color
         * @param options
         * @returns {string} CSS String || ''
         */
        function getSimpleConditionsAsCss(conditions, color, options) {

            if (!conditions) {
                console.warn('You don\'t pass condition array into getSimpleConditionsAssCss() function');
                return '';
            }

            options = options || {};

            var cssConditions = '';

            var simpleConditions = getConditionsByType(conditions, 'simple');

            // If simple conditions found
            if (simpleConditions.length !== 0) {

                // Sort by desc, because cartodb specifically processes css rules
                simpleConditions.sort(function(cur, next){
                    return cur.value < next.value;
                });

                simpleConditions.forEach(function(condition) {
                    // Fill polygon or marker
                    var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
                    var fillColor = options.isMarkerLayer ? condition.color : condition.color;
                    var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
                    var fill = fillRule + ': ' + fillColor + '; ' + markerTypeCss;

                    // Stroke polygon or marker
                    var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
                    var lineColor = options.isMarkerLayer ? color : '#FFFFFF';
                    var line = lineColorRule + ': ' + lineColor + ';';
                    if (options.markerLineColorColorCss) {
                        line = options.markerLineColorColorCss;
                    }
                    var stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';

                    var value = '[data ' + condition.operation + ' ' + condition.value + ']';
                    var style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
                    cssConditions += '#layer' + value + style;
                });

            }

            return cssConditions ? cssConditions : '';
        }

        /**
         * Get Null condition as css string
         *
         * @param conditions - window.gw.map.county.conditions
         * @param color
         * @param options
         * @returns {string} CSS String || ''
         */
        function getNullConditionAsCss(conditions, color, options) {

            if (!conditions) {
                console.warn('You don\'t pass condition array into getNullConditionAsCss() function');
                return '';
            }

            options = options || {};

            var cssConditions = '';

            var nullCondition = getConditionsByType(conditions, 'null');

            // If null condition found
            if (nullCondition.length !== 0) {
                // Fill polygon or marker
                var fillRule = options.isMarkerLayer ? 'marker-fill' : 'polygon-fill';
                var fillColor = options.isMarkerLayer ? nullCondition[0].color : nullCondition[0].color;
                var markerTypeCss = options.markerFileCss ? options.markerFileCss : '';
                var fill = fillRule + ': ' + fillColor + ';' + markerTypeCss;

                // Stroke polygon or marker
                var lineColorRule = options.isMarkerLayer ? 'marker-line-color' : 'line-color';
                var lineColor = options.isMarkerLayer ? color : '#FFFFFF';
                var line = lineColorRule + ': ' + lineColor + ';';
                if (options.markerLineColorColorCss) {
                    line = options.markerLineColorColorCss;
                }
                var stroke = options.isMarkerLayer ? 'marker-line-width: 1;' : 'line-width: 0.5;';

                var style = '{ ' + fill + line + stroke + ' line-opacity: 1; polygon-opacity: 0.3; } ';
                cssConditions += '#layer[data = null]' + style;
            }

            return cssConditions ? cssConditions : '';
        }

        /**
         * Initialization County SubLayer
         *
         * Tooltip window
         * Tooltip work with 3.11-13 version, 3.15 is buggy
         */
        function initCountySubLayer(altType) {

            var cartocss = '';
            var colorized = window.gw.map.county.colorized;

            if (colorized) {
                var conditions = window.gw.map.county.conditions;

                // Default county color
                cartocss += '#layer { polygon-fill: #DDDDDD; polygon-opacity: 0.7; line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';

                cartocss += getPeriodConditionsAsCss(conditions);

                cartocss += getSimpleConditionsAsCss(conditions);

                cartocss += getNullConditionAsCss(conditions);

                if (cartocss === '') {
                    console.warn('Can\'t find any condition, please verify your window.gw.map.county.conditions data');
                    console.warn('or check getPeriodConditionsAsCss, getSimpleConditionsAsCss, getNullConditionAsCss functions');
                }

            } else {
                // Default county color if colorized disabled (flag in admin panel)
                cartocss = '#layer { polygon-fill: #DDDDDD; polygon-opacity: 0.7; line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
            }

            var cLayer = {
                'cartocss': cartocss,
                'sql': 'SELECT *, ST_AsGeoJSON(the_geom) AS geometry FROM ' + window.gw.environment + ' WHERE  alt_type_slug = \''+ altType +'\'',
                'interactivity': ['cartodb_id', 'slug', 'alt_type_slug', 'geometry', 'data']
            };

            countySubLayer = layer.createSubLayer(cLayer);

            var _altType = altType.toLowerCase();

            subLayers[_altType] = countySubLayer;

            initTooltip(_altType);
        }

        /**
         * Initialization Marker SubLayer
         *
         * Tooltip window
         * Tooltip work with 3.11-13 version, 3.15 is buggy
         */
        function initMarkerSubLayer(altType) {

            var _altType = altType.toLowerCase();

            var cartocss = '';
            var colorized = window.gw.map.county.colorized;

            var color = markerColors.shift();
            var legendItemCss = {};

            if (colorized) {

                var conditions = window.gw.map.county.conditions,
                    options = {
                        isMarkerLayer: true
                    };

                legendItemCss = getLegendItemAsCss(altType);
                if (legendItemCss) {
                    options.markerFileCss = legendItemCss.markerFileCss;
                    options.markerLineColorColorCss = legendItemCss.markerLineColorColorCss;
                }

                // Default marker color
                cartocss += '#layer { marker-fill: #DDDDDD; line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';

                cartocss += getPeriodConditionsAsCss(conditions, color, options);

                cartocss += getSimpleConditionsAsCss(conditions, color, options);

                cartocss += getNullConditionAsCss(conditions, color, options);

                if (cartocss === '') {
                    console.warn('Can\'t find any condition, please verify your window.gw.map.county.conditions data');
                    console.warn('or check getPeriodConditionsAsCss, getSimpleConditionsAsCss, getNullConditionAsCss functions');
                }

            } else {

                legendItemCss = getLegendItemAsCss(altType);
                cartocss = '#layer { '+ legendItemCss.markerFileCss + legendItemCss.markerLineColorColorCss +' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
            }

            subLayers[_altType] = layer.createSubLayer({
                sql: "SELECT *, GeometryType(the_geom) AS geometrytype FROM " + window.gw.environment + " WHERE alt_type_slug = '" + altType +"'",
                cartocss: cartocss,
                interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometrytype']
            });

            initTooltip(_altType);

        }


            /**
         * Init tooltip
         * @param altType
         */
        function initTooltip(altType) {
            var tooltipTpl = '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"></p>';

            if (window.gw.map.debug) {
                tooltipTpl += '<p>{{data}}</p><p>{{slug}}</p>';
            } else {
                tooltipTpl += '<p>{{slug}}</p>';
            }

            tooltipTpl += '</div></div>';

            tooltips[altType] = new cdb.geo.ui.Tooltip({
                layer: subLayers[altType],
                template: tooltipTpl,
                width: 200,
                position: 'bottom|right'
            });
        }


        /**
         * Add tooltips on page
         * @type {*[]}
         */
        function initTooltips() {

            for (var key in tooltips){
                if(tooltips.hasOwnProperty(key)){

                    var tooltip = tooltips[key];
                    if (tooltip != null){
                        $('#map_wrap').append(tooltip.render().el);
                    }

                }
            }

        }

        /**
         * Move objectsPane above tilePane
         * It's necessary, otherwise county hover will not work
         */
        function fixCartodbConstrain() {

            var $objectsPane = $('.leaflet-objects-pane');
            var $tilePane = $('.leaflet-tile-pane');

            $objectsPane.appendTo($tilePane);
            $objectsPane.css({"z-index":"100"});
        }

        /**
         * Set handlers on SubLayers
         */
        function initSublayerHandlers() {

            var hovers = [];

            for (var key in subLayers) {

                if (subLayers.hasOwnProperty(key)) {

                    var layer = subLayers[key];

                    // Allow events on layer
                    layer.setInteraction(true);

                    /**
                     * Show tooltip on hover
                     * Or highlight current county
                     * It depends on the current Layer position
                     */
                    layer.bind('mouseover', function (e, latlon, pxPos, data, layerIndex) {

                        // TODO: Must be deleted, when data will be replaced, now it's hardcoded
                        data.slug = data.slug.replace(/_/g, ' ');

                        hovers[layerIndex] = 1;

                        /**
                         * If hover active
                         */
                        if (_.some(hovers)) {

                            $('#map').css('cursor', 'pointer');

                            /**
                             * If hover on county layer
                             */
                            if (layerIndex == countySubLayer._position) {
                                drawAppropriatePolygon(data);
                            } else {
                                removeAllHoverShapes();
                            }

                            /**
                             * Open current tooltip, close another
                             */
                            for (var key in tooltips){
                                if (tooltips.hasOwnProperty(key)) {

                                    var tooltip = tooltips[key];

                                    if (tooltip != null) {

                                        if (tooltip.getLayerIndex() == layerIndex) {
                                            tooltip.enable();
                                        } else {
                                            tooltip.disable();
                                        }

                                    }

                                }
                            }

                        }

                    });

                    /**
                     * Hide tooltip on hover
                     * Or remove highlight on current county
                     * It depends on the current Layer position
                     */
                    layer.bind('mouseout', function (layerIndex) {

                        hovers[layerIndex] = 0;

                        /**
                         * If hover not active
                         */
                        if (!_.some(hovers)) {
                            $('#map').css('cursor', 'auto');

                            removeAllHoverShapes();

                            /**
                             *  Close all tooltips, if cursor outside of layers
                             */
                            for (var key in tooltips){
                                if (tooltips.hasOwnProperty(key)) {

                                    var tooltip = tooltips[key];

                                    if (tooltip != null) {

                                        if (tooltip.getLayerIndex() == layerIndex) {
                                            tooltip.disable();
                                        }

                                    }

                                }
                            }

                        }
                    });

                    /**
                     * Change window location after click on marker or county
                     */
                    layer.on('featureClick', function (event, latlng, pos, data, layerIndex) {

                        if (!data.alt_type_slug || !data.slug) {
                            alert('Please verify your data, altTypeSlug or governmentSlug may can not defined, more info in console.log');
                            console.log(data);
                            return false;
                        }

                        /**
                         * TODO: Hardcoded, data must be in underscore style
                         */
                        data.slug = data.slug.replace(/ /g, '_');

                        var pathname = window.location.pathname;

                        if (pathname[pathname.length - 1] !== '/') {
                            pathname += '/';
                        }

                        window.location.pathname = pathname + data.alt_type_slug + '/' + data.slug;
                    });

                }

            }

        }

        function initRangeLegend(showOnTop) {

            if (!window.gw.map.county.colorized) { return false; }

            var legendItems = '';
            var fieldName = window.gw.map.county.fieldName.replace(/_/g, ' ');
            var conditions = window.gw.map.county.conditions;

            var periodConditions = getConditionsByType(conditions, 'period');

            var simpleConditions = getConditionsByType(conditions, 'simple');

            var nullCondition = getConditionsByType(conditions, 'null');

            // Build legend items for period conditions
            if (periodConditions.length !== 0) {

                periodConditions.forEach(function(condition) {
                    var conditionColor = 'background: ' + condition.color;
                    var conditionText = condition.min + ' - ' + condition.max;

                    legendItems += '<li><div class="bullet" style="' + conditionColor + '"></div>' +
                                        conditionText +
                                   '</li>';
                });

            }

            // Build legend items for simple conditions
            if (simpleConditions.length !== 0) {

                simpleConditions.forEach(function(condition) {
                    var conditionColor = 'background: ' + condition.color;
                    var conditionText = condition.operation + ' ' + condition.value;

                    legendItems += '<li><div class="bullet" style="' + conditionColor + '"></div>' +
                                        conditionText +
                                    '</li>';
                });

            }


            // Build legend items for null conditions
            if (nullCondition.length !== 0) {

                var conditionColor = 'background: ' + nullCondition[0].color;

                legendItems += '<li><div class="bullet" style="' + conditionColor + '"></div>null</li>';

            }

            var legendClass = 'cartodb-legend-stack';
            if (showOnTop) {
                legendClass += ' cartodb-legend-stack__top';
            }

            var legend = '<div class="'+ legendClass +'" style=""><div class="cartodb-legend custom" style="display: block;"><div class="legend-title">' +
                            fieldName +
                         '</div><ul>' +
                            legendItems +
                         '</ul></div></div>';

            $('#map').append(legend);

        }

        /**
         * Init legend
         */
        //function initLegend(altTypes) {
        //    // TODO generate legend on fly from given altTypes
        //
        //    var $legendContainer = $('#menu');
        //
        //    /*
        //     Add new elements.
        //     */
        //    var compiledLegendItems = '';
        //
        //    var markerIcons = {
        //        "stroke": ['red-stroke', 'purple-stroke', 'blue-stroke'],
        //        "fill": ['red-fill', 'purple-fill', 'blue-fill']
        //    };
        //
        //    altTypes.forEach(function(altType) {
        //
        //        var altTypeSlug = altType.alt_type_slug.replace(/_/g, ' ');
        //        var _altTypeSlug = altType.alt_type_slug.toLowerCase();
        //
        //        var iconClass = '';
        //        if (window.gw.map.county.colorized) {
        //            iconClass = (altType.geometrytype && (altType.geometrytype == "MULTIPOLYGON" || altType.geometrytype == "POLYGON"))
        //                ? 'grey-line'
        //                : 'marker-circle ' + markerIcons['stroke'].shift();
        //        } else {
        //            iconClass = (altType.geometrytype && (altType.geometrytype == "MULTIPOLYGON" || altType.geometrytype == "POLYGON"))
        //                ? 'grey-line'
        //                : 'marker-circle ' + markerIcons['fill'].shift();
        //        }
        //
        //        compiledLegendItems += '<li id=' + _altTypeSlug + ' class="' + _altTypeSlug + ' legend-item selected">' +
        //            '<span class="glyphicon glyphicon-ok"></span>' +
        //            '<i class="' + iconClass + '"></i>' +
        //            '<a href="javascript:void(0)">' + altTypeSlug + '</a>' +
        //            '</li>';
        //
        //    });
        //
        //    $legendContainer.append(compiledLegendItems);
        //
        //    $legendContainer.on('click', '.legend-item', function() {
        //        $(this).toggleClass('selected');
        //        var countyName = $(this).attr('id');
        //        subLayers[countyName].toggle();
        //    });
        //
        //}

        /**
         * TODO: Replace when legend will be ready
         * Init legend (NEW)
         */
        function initLegend(altTypes) {
            // TODO generate legend on fly from given altTypes

            //var markerIcons = {
            //    "stroke": ['red-stroke', 'purple-stroke', 'blue-stroke'],
            //    "fill": ['red-fill', 'purple-fill', 'blue-fill']
            //};

            var $legendContainer = $('#menu');

            /*
                Add new elements.
             */
            var compiledLegendItems = '';

            legend.forEach(function(menu_item) {

                var altType = altTypes.filter(function(altType) {
                    return (altType.alt_type_slug === menu_item.altType)
                })[0];

                var altTypeSlug = menu_item.altType.replace(/_/g, ' ');
                var _altTypeSlug = menu_item.altType.toLowerCase();

                var iconCounty = '',
                    iconMarker = '';

                var fillColor = '',
                    strokeColor = '';

                // Colorize markers & counties by range number
                if (window.gw.map.county.colorized) {

                    // If url to shape exist - show marker
                    if (menu_item.shape) {
                        fillColor = 'fillColor="' + legendConfig.fillColor + '" ';
                        strokeColor = 'strokeColor="' + menu_item['color'] + '" ';
                        iconMarker = '<img src="' + menu_item['shape'] + '" class="svg" ' + strokeColor + fillColor + '/>';

                    // Else - show county line
                    } else {
                        iconCounty = '<i class="grey-line"></i>';
                    }

                // Use default styles (hardcoded in this file)
                } else {

                    // If url to shape exist - show marker
                    if (menu_item.shape) {
                        fillColor = 'fillColor="' + menu_item['color'] + '" ';
                        strokeColor = 'strokeColor="' + menu_item['color'] + '" ';
                        iconMarker = '<img src="' + menu_item['shape'] + '" class="svg" ' + strokeColor + fillColor + '/>';

                        // Else - show county line
                    } else {
                        iconCounty = '<i class="grey-line"></i>';
                    }

                    //iconMarker = (altType.geometrytype && (altType.geometrytype == "MULTIPOLYGON" || altType.geometrytype == "POLYGON"))
                    //    ? '<i class="grey-line"></i>'
                    //    : '<i class="marker-circle ' + markerIcons['fill'].shift() + '"></i>';
                }

                compiledLegendItems += '<li id=' + _altTypeSlug + ' class="' + _altTypeSlug + ' legend-item selected">' +
                                         '<span class="glyphicon glyphicon-ok"></span>' +
                                          iconCounty + iconMarker +
                                         '<a href="javascript:void(0)">' + menu_item.title + '</a>' +
                                      '</li>';

            });

            $legendContainer.append(compiledLegendItems);

            /*
             * Replace all SVG images with inline SVG
             */
            jQuery('img.svg').each(function(){
                var $img = jQuery(this);
                var imgID = $img.attr('id');
                var imgClass = $img.attr('class');
                var imgURL = $img.attr('src');

                var fillColor = $img.attr('fillColor');
                var strokeColor = $img.attr('strokeColor');

                jQuery.get(imgURL, function(data) {
                    // Get the SVG tag, ignore the rest
                    var $svg = jQuery(data).find('svg');
                    var $rect = $svg.find('rect');
                    var $path = $svg.find('path');

                    $rect[0] == null || $rect.css({'fill': fillColor, 'stroke': strokeColor});
                    $path[0] == null || $path.css({'fill': fillColor, 'stroke': strokeColor});

                    // Add replaced image's ID to the new SVG
                    if(typeof imgID !== 'undefined') {
                        $svg = $svg.attr('id', imgID);
                    }
                    // Add replaced image's classes to the new SVG
                    if(typeof imgClass !== 'undefined') {
                        $svg = $svg.attr('class', imgClass+' replaced-svg');
                    }

                    // Remove any invalid XML tags as per http://validator.w3.org
                    $svg = $svg.removeAttr('xmlns:a');

                    // Replace image with new SVG
                    $img.replaceWith($svg);

                }, 'xml');

            });

            $legendContainer.on('click', '.legend-item', function() {
                $(this).toggleClass('selected');
                var countyName = $(this).attr('id');
                subLayers[countyName].toggle();
            });

        }

        /**
         * Show map, legend, hide loader
         */
        function loadFinished() {
            $('#map').css({"opacity": 1});
            $('#menu').css({"opacity": 1});
            $('.loader').hide();
        }

        // Polygon variables and functions
        var polygon = {};
        // What should our polygon hover style look like?
        var polygon_style = {
            color: "#808080",
            weight: 1,
            opacity: 1,
            fillOpacity: .6,
            fillColor: "#000000",
            clickable: false
        };

        function drawAppropriatePolygon(data){
            removeAllHoverShapes();
            polygon = new L.GeoJSON(JSON.parse(data.geometry), {
                style: polygon_style
            });
            map.addLayer(polygon);
            polygon.cartodb_id = data.cartodb_id;
        }
        function removeAllHoverShapes(){
            map.removeLayer(polygon);
            polygon.cartodb_id = null;
        }

    });

});
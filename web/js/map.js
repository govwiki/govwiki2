webpackJsonp([2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(9);
	
	__webpack_require__(10);
	__webpack_require__(23);
	
	/**
	 * Extend CartoDB Tooltip
	 * Get Layer position
	 *
	 * @returns {number} Layer Position
	 */
	cdb.geo.ui.Tooltip.prototype.getLayerIndex = function () {
	    return this.options.layer._position;
	};
	
	/**
	 * Extend CartoDB Tooltip
	 * Set data mask for formating 'data' field before displaying.
	 *
	 * @param {string} mask
	 *
	 * @returns {cdb.geo.ui.Tooltip}
	 */
	cdb.geo.ui.Tooltip.prototype.setMask = function (mask) {
	    this.options.gw = {
	        mask: mask
	    };
	
	    return this;
	};
	
	/**
	 * Override carto db tooltip render method in order to format data before
	 * displaying.
	 */
	cdb.geo.ui.Tooltip.prototype.render = function(data) {
	    // Add by Shemin Dmitry
	    var tmp = $.extend({}, data);
	
	    if (this.options.gw.mask && tmp && tmp.data ) {
	        tmp.data = numeral(tmp.data).format(this.options.gw.mask);
	    }
	    // END
	    var sanitizedOutput = cdb.core.sanitize.html(this.template(tmp));
	    this.$el.html( sanitizedOutput );
	    return this;
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
	                'interactivity': ['cartodb_id', 'slug', 'alt_type_slug', 'geometry', 'data', 'name']
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
	                //cartocss += '#layer { marker-fill: #DDDDDD; line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
	                cartocss += '#layer { '+ legendItemCss.markerFileCss + legendItemCss.markerLineColorColorCss +' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
	
	                cartocss += getPeriodConditionsAsCss(conditions, color, options);
	
	                cartocss += getSimpleConditionsAsCss(conditions, color, options);
	
	                cartocss += getNullConditionAsCss(conditions, color, options);
	
	                if (cartocss === '') {
	                    console.warn('Can\'t find any condition, please verify your window.gw.map.county.conditions data');
	                    console.warn('or check getPeriodConditionsAsCss, getSimpleConditionsAsCss, getNullConditionAsCss functions');
	                }
	
	            } else {
	
	                legendItemCss = getLegendItemAsCss(altType, true);
	                cartocss = '#layer { '+ legendItemCss.markerFileCss + legendItemCss.markerLineColorColorCss +' line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';
	            }
	
	            subLayers[_altType] = layer.createSubLayer({
	                sql: "SELECT *, GeometryType(the_geom) AS geometrytype FROM " + window.gw.environment + " WHERE alt_type_slug = '" + altType +"'",
	                cartocss: cartocss,
	                interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometrytype', 'name']
	            });
	
	            initTooltip(_altType);
	
	        }
	
	
	            /**
	         * Init tooltip
	         * @param altType
	         */
	        function initTooltip(altType) {
	            var tooltipTpl = '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"></p>';
	
	            tooltipTpl += '<p>{{name}} ({{data}})</p>';
	
	            tooltipTpl += '</div></div>';
	            tooltips[altType] = new cdb.geo.ui.Tooltip({
	                layer: subLayers[altType],
	                template: tooltipTpl,
	                width: 200,
	                position: 'bottom|right'
	            });
	            tooltips[altType].setMask(gw.map.county.field_mask);
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

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ function(module, exports) {

	/*!
	 * Bootstrap v3.3.6 (http://getbootstrap.com)
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under the MIT license
	 */
	if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";var b=a.fn.jquery.split(" ")[0].split(".");if(b[0]<2&&b[1]<9||1==b[0]&&9==b[1]&&b[2]<1||b[0]>2)throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 3")}(jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one("bsTransitionEnd",function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b(),a.support.transition&&(a.event.special.bsTransitionEnd={bindType:a.support.transition.end,delegateType:a.support.transition.end,handle:function(b){return a(b.target).is(this)?b.handleObj.handler.apply(this,arguments):void 0}})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var c=a(this),e=c.data("bs.alert");e||c.data("bs.alert",e=new d(this)),"string"==typeof b&&e[b].call(c)})}var c='[data-dismiss="alert"]',d=function(b){a(b).on("click",c,this.close)};d.VERSION="3.3.6",d.TRANSITION_DURATION=150,d.prototype.close=function(b){function c(){g.detach().trigger("closed.bs.alert").remove()}var e=a(this),f=e.attr("data-target");f||(f=e.attr("href"),f=f&&f.replace(/.*(?=#[^\s]*$)/,""));var g=a(f);b&&b.preventDefault(),g.length||(g=e.closest(".alert")),g.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(g.removeClass("in"),a.support.transition&&g.hasClass("fade")?g.one("bsTransitionEnd",c).emulateTransitionEnd(d.TRANSITION_DURATION):c())};var e=a.fn.alert;a.fn.alert=b,a.fn.alert.Constructor=d,a.fn.alert.noConflict=function(){return a.fn.alert=e,this},a(document).on("click.bs.alert.data-api",c,d.prototype.close)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof b&&b;e||d.data("bs.button",e=new c(this,f)),"toggle"==b?e.toggle():b&&e.setState(b)})}var c=function(b,d){this.$element=a(b),this.options=a.extend({},c.DEFAULTS,d),this.isLoading=!1};c.VERSION="3.3.6",c.DEFAULTS={loadingText:"loading..."},c.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",null==f.resetText&&d.data("resetText",d[e]()),setTimeout(a.proxy(function(){d[e](null==f[b]?this.options[b]:f[b]),"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},c.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")?(c.prop("checked")&&(a=!1),b.find(".active").removeClass("active"),this.$element.addClass("active")):"checkbox"==c.prop("type")&&(c.prop("checked")!==this.$element.hasClass("active")&&(a=!1),this.$element.toggleClass("active")),c.prop("checked",this.$element.hasClass("active")),a&&c.trigger("change")}else this.$element.attr("aria-pressed",!this.$element.hasClass("active")),this.$element.toggleClass("active")};var d=a.fn.button;a.fn.button=b,a.fn.button.Constructor=c,a.fn.button.noConflict=function(){return a.fn.button=d,this},a(document).on("click.bs.button.data-api",'[data-toggle^="button"]',function(c){var d=a(c.target);d.hasClass("btn")||(d=d.closest(".btn")),b.call(d,"toggle"),a(c.target).is('input[type="radio"]')||a(c.target).is('input[type="checkbox"]')||c.preventDefault()}).on("focus.bs.button.data-api blur.bs.button.data-api",'[data-toggle^="button"]',function(b){a(b.target).closest(".btn").toggleClass("focus",/^focus(in)?$/.test(b.type))})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},c.DEFAULTS,d.data(),"object"==typeof b&&b),g="string"==typeof b?b:f.slide;e||d.data("bs.carousel",e=new c(this,f)),"number"==typeof b?e.to(b):g?e[g]():f.interval&&e.pause().cycle()})}var c=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=null,this.sliding=null,this.interval=null,this.$active=null,this.$items=null,this.options.keyboard&&this.$element.on("keydown.bs.carousel",a.proxy(this.keydown,this)),"hover"==this.options.pause&&!("ontouchstart"in document.documentElement)&&this.$element.on("mouseenter.bs.carousel",a.proxy(this.pause,this)).on("mouseleave.bs.carousel",a.proxy(this.cycle,this))};c.VERSION="3.3.6",c.TRANSITION_DURATION=600,c.DEFAULTS={interval:5e3,pause:"hover",wrap:!0,keyboard:!0},c.prototype.keydown=function(a){if(!/input|textarea/i.test(a.target.tagName)){switch(a.which){case 37:this.prev();break;case 39:this.next();break;default:return}a.preventDefault()}},c.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},c.prototype.getItemIndex=function(a){return this.$items=a.parent().children(".item"),this.$items.index(a||this.$active)},c.prototype.getItemForDirection=function(a,b){var c=this.getItemIndex(b),d="prev"==a&&0===c||"next"==a&&c==this.$items.length-1;if(d&&!this.options.wrap)return b;var e="prev"==a?-1:1,f=(c+e)%this.$items.length;return this.$items.eq(f)},c.prototype.to=function(a){var b=this,c=this.getItemIndex(this.$active=this.$element.find(".item.active"));return a>this.$items.length-1||0>a?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){b.to(a)}):c==a?this.pause().cycle():this.slide(a>c?"next":"prev",this.$items.eq(a))},c.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},c.prototype.next=function(){return this.sliding?void 0:this.slide("next")},c.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},c.prototype.slide=function(b,d){var e=this.$element.find(".item.active"),f=d||this.getItemForDirection(b,e),g=this.interval,h="next"==b?"left":"right",i=this;if(f.hasClass("active"))return this.sliding=!1;var j=f[0],k=a.Event("slide.bs.carousel",{relatedTarget:j,direction:h});if(this.$element.trigger(k),!k.isDefaultPrevented()){if(this.sliding=!0,g&&this.pause(),this.$indicators.length){this.$indicators.find(".active").removeClass("active");var l=a(this.$indicators.children()[this.getItemIndex(f)]);l&&l.addClass("active")}var m=a.Event("slid.bs.carousel",{relatedTarget:j,direction:h});return a.support.transition&&this.$element.hasClass("slide")?(f.addClass(b),f[0].offsetWidth,e.addClass(h),f.addClass(h),e.one("bsTransitionEnd",function(){f.removeClass([b,h].join(" ")).addClass("active"),e.removeClass(["active",h].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger(m)},0)}).emulateTransitionEnd(c.TRANSITION_DURATION)):(e.removeClass("active"),f.addClass("active"),this.sliding=!1,this.$element.trigger(m)),g&&this.cycle(),this}};var d=a.fn.carousel;a.fn.carousel=b,a.fn.carousel.Constructor=c,a.fn.carousel.noConflict=function(){return a.fn.carousel=d,this};var e=function(c){var d,e=a(this),f=a(e.attr("data-target")||(d=e.attr("href"))&&d.replace(/.*(?=#[^\s]+$)/,""));if(f.hasClass("carousel")){var g=a.extend({},f.data(),e.data()),h=e.attr("data-slide-to");h&&(g.interval=!1),b.call(f,g),h&&f.data("bs.carousel").to(h),c.preventDefault()}};a(document).on("click.bs.carousel.data-api","[data-slide]",e).on("click.bs.carousel.data-api","[data-slide-to]",e),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var c=a(this);b.call(c,c.data())})})}(jQuery),+function(a){"use strict";function b(b){var c,d=b.attr("data-target")||(c=b.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"");return a(d)}function c(b){return this.each(function(){var c=a(this),e=c.data("bs.collapse"),f=a.extend({},d.DEFAULTS,c.data(),"object"==typeof b&&b);!e&&f.toggle&&/show|hide/.test(b)&&(f.toggle=!1),e||c.data("bs.collapse",e=new d(this,f)),"string"==typeof b&&e[b]()})}var d=function(b,c){this.$element=a(b),this.options=a.extend({},d.DEFAULTS,c),this.$trigger=a('[data-toggle="collapse"][href="#'+b.id+'"],[data-toggle="collapse"][data-target="#'+b.id+'"]'),this.transitioning=null,this.options.parent?this.$parent=this.getParent():this.addAriaAndCollapsedClass(this.$element,this.$trigger),this.options.toggle&&this.toggle()};d.VERSION="3.3.6",d.TRANSITION_DURATION=350,d.DEFAULTS={toggle:!0},d.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},d.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b,e=this.$parent&&this.$parent.children(".panel").children(".in, .collapsing");if(!(e&&e.length&&(b=e.data("bs.collapse"),b&&b.transitioning))){var f=a.Event("show.bs.collapse");if(this.$element.trigger(f),!f.isDefaultPrevented()){e&&e.length&&(c.call(e,"hide"),b||e.data("bs.collapse",null));var g=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[g](0).attr("aria-expanded",!0),this.$trigger.removeClass("collapsed").attr("aria-expanded",!0),this.transitioning=1;var h=function(){this.$element.removeClass("collapsing").addClass("collapse in")[g](""),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return h.call(this);var i=a.camelCase(["scroll",g].join("-"));this.$element.one("bsTransitionEnd",a.proxy(h,this)).emulateTransitionEnd(d.TRANSITION_DURATION)[g](this.$element[0][i])}}}},d.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse in").attr("aria-expanded",!1),this.$trigger.addClass("collapsed").attr("aria-expanded",!1),this.transitioning=1;var e=function(){this.transitioning=0,this.$element.removeClass("collapsing").addClass("collapse").trigger("hidden.bs.collapse")};return a.support.transition?void this.$element[c](0).one("bsTransitionEnd",a.proxy(e,this)).emulateTransitionEnd(d.TRANSITION_DURATION):e.call(this)}}},d.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()},d.prototype.getParent=function(){return a(this.options.parent).find('[data-toggle="collapse"][data-parent="'+this.options.parent+'"]').each(a.proxy(function(c,d){var e=a(d);this.addAriaAndCollapsedClass(b(e),e)},this)).end()},d.prototype.addAriaAndCollapsedClass=function(a,b){var c=a.hasClass("in");a.attr("aria-expanded",c),b.toggleClass("collapsed",!c).attr("aria-expanded",c)};var e=a.fn.collapse;a.fn.collapse=c,a.fn.collapse.Constructor=d,a.fn.collapse.noConflict=function(){return a.fn.collapse=e,this},a(document).on("click.bs.collapse.data-api",'[data-toggle="collapse"]',function(d){var e=a(this);e.attr("data-target")||d.preventDefault();var f=b(e),g=f.data("bs.collapse"),h=g?"toggle":e.data();c.call(f,h)})}(jQuery),+function(a){"use strict";function b(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}function c(c){c&&3===c.which||(a(e).remove(),a(f).each(function(){var d=a(this),e=b(d),f={relatedTarget:this};e.hasClass("open")&&(c&&"click"==c.type&&/input|textarea/i.test(c.target.tagName)&&a.contains(e[0],c.target)||(e.trigger(c=a.Event("hide.bs.dropdown",f)),c.isDefaultPrevented()||(d.attr("aria-expanded","false"),e.removeClass("open").trigger(a.Event("hidden.bs.dropdown",f)))))}))}function d(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new g(this)),"string"==typeof b&&d[b].call(c)})}var e=".dropdown-backdrop",f='[data-toggle="dropdown"]',g=function(b){a(b).on("click.bs.dropdown",this.toggle)};g.VERSION="3.3.6",g.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=b(e),g=f.hasClass("open");if(c(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a(document.createElement("div")).addClass("dropdown-backdrop").insertAfter(a(this)).on("click",c);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;e.trigger("focus").attr("aria-expanded","true"),f.toggleClass("open").trigger(a.Event("shown.bs.dropdown",h))}return!1}},g.prototype.keydown=function(c){if(/(38|40|27|32)/.test(c.which)&&!/input|textarea/i.test(c.target.tagName)){var d=a(this);if(c.preventDefault(),c.stopPropagation(),!d.is(".disabled, :disabled")){var e=b(d),g=e.hasClass("open");if(!g&&27!=c.which||g&&27==c.which)return 27==c.which&&e.find(f).trigger("focus"),d.trigger("click");var h=" li:not(.disabled):visible a",i=e.find(".dropdown-menu"+h);if(i.length){var j=i.index(c.target);38==c.which&&j>0&&j--,40==c.which&&j<i.length-1&&j++,~j||(j=0),i.eq(j).trigger("focus")}}}};var h=a.fn.dropdown;a.fn.dropdown=d,a.fn.dropdown.Constructor=g,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=h,this},a(document).on("click.bs.dropdown.data-api",c).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",f,g.prototype.toggle).on("keydown.bs.dropdown.data-api",f,g.prototype.keydown).on("keydown.bs.dropdown.data-api",".dropdown-menu",g.prototype.keydown)}(jQuery),+function(a){"use strict";function b(b,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},c.DEFAULTS,e.data(),"object"==typeof b&&b);f||e.data("bs.modal",f=new c(this,g)),"string"==typeof b?f[b](d):g.show&&f.show(d)})}var c=function(b,c){this.options=c,this.$body=a(document.body),this.$element=a(b),this.$dialog=this.$element.find(".modal-dialog"),this.$backdrop=null,this.isShown=null,this.originalBodyPad=null,this.scrollbarWidth=0,this.ignoreBackdropClick=!1,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};c.VERSION="3.3.6",c.TRANSITION_DURATION=300,c.BACKDROP_TRANSITION_DURATION=150,c.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},c.prototype.toggle=function(a){return this.isShown?this.hide():this.show(a)},c.prototype.show=function(b){var d=this,e=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(e),this.isShown||e.isDefaultPrevented()||(this.isShown=!0,this.checkScrollbar(),this.setScrollbar(),this.$body.addClass("modal-open"),this.escape(),this.resize(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.$dialog.on("mousedown.dismiss.bs.modal",function(){d.$element.one("mouseup.dismiss.bs.modal",function(b){a(b.target).is(d.$element)&&(d.ignoreBackdropClick=!0)})}),this.backdrop(function(){var e=a.support.transition&&d.$element.hasClass("fade");d.$element.parent().length||d.$element.appendTo(d.$body),d.$element.show().scrollTop(0),d.adjustDialog(),e&&d.$element[0].offsetWidth,d.$element.addClass("in"),d.enforceFocus();var f=a.Event("shown.bs.modal",{relatedTarget:b});e?d.$dialog.one("bsTransitionEnd",function(){d.$element.trigger("focus").trigger(f)}).emulateTransitionEnd(c.TRANSITION_DURATION):d.$element.trigger("focus").trigger(f)}))},c.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),this.resize(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"),this.$dialog.off("mousedown.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one("bsTransitionEnd",a.proxy(this.hideModal,this)).emulateTransitionEnd(c.TRANSITION_DURATION):this.hideModal())},c.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.trigger("focus")},this))},c.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keydown.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keydown.dismiss.bs.modal")},c.prototype.resize=function(){this.isShown?a(window).on("resize.bs.modal",a.proxy(this.handleUpdate,this)):a(window).off("resize.bs.modal")},c.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.$body.removeClass("modal-open"),a.resetAdjustments(),a.resetScrollbar(),a.$element.trigger("hidden.bs.modal")})},c.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},c.prototype.backdrop=function(b){var d=this,e=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var f=a.support.transition&&e;if(this.$backdrop=a(document.createElement("div")).addClass("modal-backdrop "+e).appendTo(this.$body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){return this.ignoreBackdropClick?void(this.ignoreBackdropClick=!1):void(a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus():this.hide()))},this)),f&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;f?this.$backdrop.one("bsTransitionEnd",b).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):b()}else if(!this.isShown&&this.$backdrop){this.$backdrop.removeClass("in");var g=function(){d.removeBackdrop(),b&&b()};a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one("bsTransitionEnd",g).emulateTransitionEnd(c.BACKDROP_TRANSITION_DURATION):g()}else b&&b()},c.prototype.handleUpdate=function(){this.adjustDialog()},c.prototype.adjustDialog=function(){var a=this.$element[0].scrollHeight>document.documentElement.clientHeight;this.$element.css({paddingLeft:!this.bodyIsOverflowing&&a?this.scrollbarWidth:"",paddingRight:this.bodyIsOverflowing&&!a?this.scrollbarWidth:""})},c.prototype.resetAdjustments=function(){this.$element.css({paddingLeft:"",paddingRight:""})},c.prototype.checkScrollbar=function(){var a=window.innerWidth;if(!a){var b=document.documentElement.getBoundingClientRect();a=b.right-Math.abs(b.left)}this.bodyIsOverflowing=document.body.clientWidth<a,this.scrollbarWidth=this.measureScrollbar()},c.prototype.setScrollbar=function(){var a=parseInt(this.$body.css("padding-right")||0,10);this.originalBodyPad=document.body.style.paddingRight||"",this.bodyIsOverflowing&&this.$body.css("padding-right",a+this.scrollbarWidth)},c.prototype.resetScrollbar=function(){this.$body.css("padding-right",this.originalBodyPad)},c.prototype.measureScrollbar=function(){var a=document.createElement("div");a.className="modal-scrollbar-measure",this.$body.append(a);var b=a.offsetWidth-a.clientWidth;return this.$body[0].removeChild(a),b};var d=a.fn.modal;a.fn.modal=b,a.fn.modal.Constructor=c,a.fn.modal.noConflict=function(){return a.fn.modal=d,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(c){var d=a(this),e=d.attr("href"),f=a(d.attr("data-target")||e&&e.replace(/.*(?=#[^\s]+$)/,"")),g=f.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(e)&&e},f.data(),d.data());d.is("a")&&c.preventDefault(),f.one("show.bs.modal",function(a){a.isDefaultPrevented()||f.one("hidden.bs.modal",function(){d.is(":visible")&&d.trigger("focus")})}),b.call(f,g,this)})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.tooltip",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.type=null,this.options=null,this.enabled=null,this.timeout=null,this.hoverState=null,this.$element=null,this.inState=null,this.init("tooltip",a,b)};c.VERSION="3.3.6",c.TRANSITION_DURATION=150,c.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1,viewport:{selector:"body",padding:0}},c.prototype.init=function(b,c,d){if(this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.$viewport=this.options.viewport&&a(a.isFunction(this.options.viewport)?this.options.viewport.call(this,this.$element):this.options.viewport.selector||this.options.viewport),this.inState={click:!1,hover:!1,focus:!1},this.$element[0]instanceof document.constructor&&!this.options.selector)throw new Error("`selector` option must be specified when initializing "+this.type+" on the window.document object!");for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},c.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},c.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusin"==b.type?"focus":"hover"]=!0),c.tip().hasClass("in")||"in"==c.hoverState?void(c.hoverState="in"):(clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show())},c.prototype.isInStateTrue=function(){for(var a in this.inState)if(this.inState[a])return!0;return!1},c.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget).data("bs."+this.type);return c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c)),b instanceof a.Event&&(c.inState["focusout"==b.type?"focus":"hover"]=!1),c.isInStateTrue()?void 0:(clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide())},c.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){this.$element.trigger(b);var d=a.contains(this.$element[0].ownerDocument.documentElement,this.$element[0]);if(b.isDefaultPrevented()||!d)return;var e=this,f=this.tip(),g=this.getUID(this.type);this.setContent(),f.attr("id",g),this.$element.attr("aria-describedby",g),this.options.animation&&f.addClass("fade");var h="function"==typeof this.options.placement?this.options.placement.call(this,f[0],this.$element[0]):this.options.placement,i=/\s?auto?\s?/i,j=i.test(h);j&&(h=h.replace(i,"")||"top"),f.detach().css({top:0,left:0,display:"block"}).addClass(h).data("bs."+this.type,this),this.options.container?f.appendTo(this.options.container):f.insertAfter(this.$element),this.$element.trigger("inserted.bs."+this.type);var k=this.getPosition(),l=f[0].offsetWidth,m=f[0].offsetHeight;if(j){var n=h,o=this.getPosition(this.$viewport);h="bottom"==h&&k.bottom+m>o.bottom?"top":"top"==h&&k.top-m<o.top?"bottom":"right"==h&&k.right+l>o.width?"left":"left"==h&&k.left-l<o.left?"right":h,f.removeClass(n).addClass(h)}var p=this.getCalculatedOffset(h,k,l,m);this.applyPlacement(p,h);var q=function(){var a=e.hoverState;e.$element.trigger("shown.bs."+e.type),e.hoverState=null,"out"==a&&e.leave(e)};a.support.transition&&this.$tip.hasClass("fade")?f.one("bsTransitionEnd",q).emulateTransitionEnd(c.TRANSITION_DURATION):q()}},c.prototype.applyPlacement=function(b,c){var d=this.tip(),e=d[0].offsetWidth,f=d[0].offsetHeight,g=parseInt(d.css("margin-top"),10),h=parseInt(d.css("margin-left"),10);isNaN(g)&&(g=0),isNaN(h)&&(h=0),b.top+=g,b.left+=h,a.offset.setOffset(d[0],a.extend({using:function(a){d.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),d.addClass("in");var i=d[0].offsetWidth,j=d[0].offsetHeight;"top"==c&&j!=f&&(b.top=b.top+f-j);var k=this.getViewportAdjustedDelta(c,b,i,j);k.left?b.left+=k.left:b.top+=k.top;var l=/top|bottom/.test(c),m=l?2*k.left-e+i:2*k.top-f+j,n=l?"offsetWidth":"offsetHeight";d.offset(b),this.replaceArrow(m,d[0][n],l)},c.prototype.replaceArrow=function(a,b,c){this.arrow().css(c?"left":"top",50*(1-a/b)+"%").css(c?"top":"left","")},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},c.prototype.hide=function(b){function d(){"in"!=e.hoverState&&f.detach(),e.$element.removeAttr("aria-describedby").trigger("hidden.bs."+e.type),b&&b()}var e=this,f=a(this.$tip),g=a.Event("hide.bs."+this.type);return this.$element.trigger(g),g.isDefaultPrevented()?void 0:(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one("bsTransitionEnd",d).emulateTransitionEnd(c.TRANSITION_DURATION):d(),this.hoverState=null,this)},c.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},c.prototype.hasContent=function(){return this.getTitle()},c.prototype.getPosition=function(b){b=b||this.$element;var c=b[0],d="BODY"==c.tagName,e=c.getBoundingClientRect();null==e.width&&(e=a.extend({},e,{width:e.right-e.left,height:e.bottom-e.top}));var f=d?{top:0,left:0}:b.offset(),g={scroll:d?document.documentElement.scrollTop||document.body.scrollTop:b.scrollTop()},h=d?{width:a(window).width(),height:a(window).height()}:null;return a.extend({},e,g,h,f)},c.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},c.prototype.getViewportAdjustedDelta=function(a,b,c,d){var e={top:0,left:0};if(!this.$viewport)return e;var f=this.options.viewport&&this.options.viewport.padding||0,g=this.getPosition(this.$viewport);if(/right|left/.test(a)){var h=b.top-f-g.scroll,i=b.top+f-g.scroll+d;h<g.top?e.top=g.top-h:i>g.top+g.height&&(e.top=g.top+g.height-i)}else{var j=b.left-f,k=b.left+f+c;j<g.left?e.left=g.left-j:k>g.right&&(e.left=g.left+g.width-k)}return e},c.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},c.prototype.getUID=function(a){do a+=~~(1e6*Math.random());while(document.getElementById(a));return a},c.prototype.tip=function(){if(!this.$tip&&(this.$tip=a(this.options.template),1!=this.$tip.length))throw new Error(this.type+" `template` option must consist of exactly 1 top-level element!");return this.$tip},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},c.prototype.enable=function(){this.enabled=!0},c.prototype.disable=function(){this.enabled=!1},c.prototype.toggleEnabled=function(){this.enabled=!this.enabled},c.prototype.toggle=function(b){var c=this;b&&(c=a(b.currentTarget).data("bs."+this.type),c||(c=new this.constructor(b.currentTarget,this.getDelegateOptions()),a(b.currentTarget).data("bs."+this.type,c))),b?(c.inState.click=!c.inState.click,c.isInStateTrue()?c.enter(c):c.leave(c)):c.tip().hasClass("in")?c.leave(c):c.enter(c)},c.prototype.destroy=function(){var a=this;clearTimeout(this.timeout),this.hide(function(){a.$element.off("."+a.type).removeData("bs."+a.type),a.$tip&&a.$tip.detach(),a.$tip=null,a.$arrow=null,a.$viewport=null})};var d=a.fn.tooltip;a.fn.tooltip=b,a.fn.tooltip.Constructor=c,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=d,this}}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof b&&b;(e||!/destroy|hide/.test(b))&&(e||d.data("bs.popover",e=new c(this,f)),"string"==typeof b&&e[b]())})}var c=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");c.VERSION="3.3.6",c.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),c.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),c.prototype.constructor=c,c.prototype.getDefaults=function(){return c.DEFAULTS},c.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content").children().detach().end()[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},c.prototype.hasContent=function(){return this.getTitle()||this.getContent()},c.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},c.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")};var d=a.fn.popover;a.fn.popover=b,a.fn.popover.Constructor=c,a.fn.popover.noConflict=function(){return a.fn.popover=d,this}}(jQuery),+function(a){"use strict";function b(c,d){this.$body=a(document.body),this.$scrollElement=a(a(c).is(document.body)?window:c),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||"")+" .nav li > a",this.offsets=[],this.targets=[],this.activeTarget=null,this.scrollHeight=0,this.$scrollElement.on("scroll.bs.scrollspy",a.proxy(this.process,this)),this.refresh(),this.process()}function c(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})}b.VERSION="3.3.6",b.DEFAULTS={offset:10},b.prototype.getScrollHeight=function(){return this.$scrollElement[0].scrollHeight||Math.max(this.$body[0].scrollHeight,document.documentElement.scrollHeight)},b.prototype.refresh=function(){var b=this,c="offset",d=0;this.offsets=[],this.targets=[],this.scrollHeight=this.getScrollHeight(),a.isWindow(this.$scrollElement[0])||(c="position",d=this.$scrollElement.scrollTop()),this.$body.find(this.selector).map(function(){var b=a(this),e=b.data("target")||b.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[c]().top+d,e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){b.offsets.push(this[0]),b.targets.push(this[1])})},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.getScrollHeight(),d=this.options.offset+c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(this.scrollHeight!=c&&this.refresh(),b>=d)return g!=(a=f[f.length-1])&&this.activate(a);if(g&&b<e[0])return this.activeTarget=null,this.clear();for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(void 0===e[a+1]||b<e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,this.clear();var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");
	    d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")},b.prototype.clear=function(){a(this.selector).parentsUntil(this.options.target,".active").removeClass("active")};var d=a.fn.scrollspy;a.fn.scrollspy=c,a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=d,this},a(window).on("load.bs.scrollspy.data-api",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);c.call(b,b.data())})})}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new c(this)),"string"==typeof b&&e[b]()})}var c=function(b){this.element=a(b)};c.VERSION="3.3.6",c.TRANSITION_DURATION=150,c.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a"),f=a.Event("hide.bs.tab",{relatedTarget:b[0]}),g=a.Event("show.bs.tab",{relatedTarget:e[0]});if(e.trigger(f),b.trigger(g),!g.isDefaultPrevented()&&!f.isDefaultPrevented()){var h=a(d);this.activate(b.closest("li"),c),this.activate(h,h.parent(),function(){e.trigger({type:"hidden.bs.tab",relatedTarget:b[0]}),b.trigger({type:"shown.bs.tab",relatedTarget:e[0]})})}}},c.prototype.activate=function(b,d,e){function f(){g.removeClass("active").find("> .dropdown-menu > .active").removeClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!1),b.addClass("active").find('[data-toggle="tab"]').attr("aria-expanded",!0),h?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu").length&&b.closest("li.dropdown").addClass("active").end().find('[data-toggle="tab"]').attr("aria-expanded",!0),e&&e()}var g=d.find("> .active"),h=e&&a.support.transition&&(g.length&&g.hasClass("fade")||!!d.find("> .fade").length);g.length&&h?g.one("bsTransitionEnd",f).emulateTransitionEnd(c.TRANSITION_DURATION):f(),g.removeClass("in")};var d=a.fn.tab;a.fn.tab=b,a.fn.tab.Constructor=c,a.fn.tab.noConflict=function(){return a.fn.tab=d,this};var e=function(c){c.preventDefault(),b.call(a(this),"show")};a(document).on("click.bs.tab.data-api",'[data-toggle="tab"]',e).on("click.bs.tab.data-api",'[data-toggle="pill"]',e)}(jQuery),+function(a){"use strict";function b(b){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof b&&b;e||d.data("bs.affix",e=new c(this,f)),"string"==typeof b&&e[b]()})}var c=function(b,d){this.options=a.extend({},c.DEFAULTS,d),this.$target=a(this.options.target).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(b),this.affixed=null,this.unpin=null,this.pinnedOffset=null,this.checkPosition()};c.VERSION="3.3.6",c.RESET="affix affix-top affix-bottom",c.DEFAULTS={offset:0,target:window},c.prototype.getState=function(a,b,c,d){var e=this.$target.scrollTop(),f=this.$element.offset(),g=this.$target.height();if(null!=c&&"top"==this.affixed)return c>e?"top":!1;if("bottom"==this.affixed)return null!=c?e+this.unpin<=f.top?!1:"bottom":a-d>=e+g?!1:"bottom";var h=null==this.affixed,i=h?e:f.top,j=h?g:b;return null!=c&&c>=e?"top":null!=d&&i+j>=a-d?"bottom":!1},c.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(c.RESET).addClass("affix");var a=this.$target.scrollTop(),b=this.$element.offset();return this.pinnedOffset=b.top-a},c.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},c.prototype.checkPosition=function(){if(this.$element.is(":visible")){var b=this.$element.height(),d=this.options.offset,e=d.top,f=d.bottom,g=Math.max(a(document).height(),a(document.body).height());"object"!=typeof d&&(f=e=d),"function"==typeof e&&(e=d.top(this.$element)),"function"==typeof f&&(f=d.bottom(this.$element));var h=this.getState(g,b,e,f);if(this.affixed!=h){null!=this.unpin&&this.$element.css("top","");var i="affix"+(h?"-"+h:""),j=a.Event(i+".bs.affix");if(this.$element.trigger(j),j.isDefaultPrevented())return;this.affixed=h,this.unpin="bottom"==h?this.getPinnedOffset():null,this.$element.removeClass(c.RESET).addClass(i).trigger(i.replace("affix","affixed")+".bs.affix")}"bottom"==h&&this.$element.offset({top:g-b-f})}};var d=a.fn.affix;a.fn.affix=b,a.fn.affix.Constructor=c,a.fn.affix.noConflict=function(){return a.fn.affix=d,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var c=a(this),d=c.data();d.offset=d.offset||{},null!=d.offsetBottom&&(d.offset.bottom=d.offsetBottom),null!=d.offsetTop&&(d.offset.top=d.offsetTop),b.call(c,d)})})}(jQuery);

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(11);
	
	/**
	 * Typeahead search
	 */
	
	$(function() {
	
	    var findMatches = function findMatches(query, syncCallback, asyncCallback) {
	        $.ajax({
	            method: 'GET',
	            url: window.gw.urls.search_elected +'?search='+ query
	        }).success(function(data) {
	            console.log(data);
	            asyncCallback(data);
	        });
	    };
	
	    var searchValue = '';
	
	    // Init typeahead
	    var $typeahead = $('.typeahead_elected').typeahead({
	        hint: true,
	        highlight: true,
	        minLength: 3
	    }, {
	        name: 'elected_officials',
	        source: findMatches,
	        templates: {
	            empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
	            suggestion: Handlebars.compile('<div class="sugg-box">'+
	                '<div class="sugg-name">{{fullName}}</div>' +
	                '<div class="sugg-govname">{{government.name}}</div>' +
	                '</div>')
	        },
	        updater: function (item) {
	            alert(item);
	        }
	    });
	
	    // Pressed mouse or enter button
	    $typeahead.bind("typeahead:selected", function(obj, selectedItemData) {
	        $typeahead.typeahead('val', selectedItemData.fullName);
	        window.location.pathname += [selectedItemData.government.altTypeSlug, selectedItemData.government.slug, selectedItemData.slug].join('/');
	    });
	
	    // Move cursor via arrows keys
	    $typeahead.bind("typeahead:cursorchange", function(obj) {
	        $typeahead.typeahead('val', searchValue);
	    });
	
	    // Store search value on typing
	    $typeahead.keyup(function(event) {
	        searchValue = $(event.target).val();
	    });
	
	    $typeahead.attr('placeholder', 'ELECTED OFFICIAL NAME');
	    $typeahead.attr('disabled', false);
	
	    //var substringMatcher = function(strs) {
	    //    return function findMatches(q, cb) {
	    //        var matches, substringRegex;
	    //
	    //        // an array that will be populated with substring matches
	    //        matches = [];
	    //
	    //        // regex used to determine if a string contains the substring `q`
	    //        substrRegex = new RegExp('('+q+')', 'gi');
	    //
	    //        // iterate through the pool of strings and for any string that
	    //        // contains the substring `q`, add it to the `matches` array
	    //        $.each(strs, function(i, str) {
	    //            if (substrRegex.test(str.gov_name)) {
	    //                matches.push(str);
	    //            }
	    //        });
	    //
	    //        cb(matches);
	    //    };
	    //};
	    //
	    //$.get('/data/search/california.json', function (data){
	    //
	    //    var searchValue = '';
	    //
	    //    // Init typeahead
	    //    var $typeahead = $('.typeahead').typeahead({
	    //        hint: true,
	    //        highlight: true,
	    //        minLength: 1
	    //    }, {
	    //        name: 'countries',
	    //        source: substringMatcher(data.record),
	    //        templates: {
	    //            empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
	    //            suggestion: Handlebars.compile('<div class="sugg-box">'+
	    //                '<div class="sugg-state">{{state}}</div>' +
	    //                '<div class="sugg-name">{{gov_name}}</div>' +
	    //                '<div class="sugg-type">{{gov_type}}</div>' +
	    //                '</div>')
	    //        },
	    //        updater: function (item) {
	    //            alert(item);
	    //        }
	    //    });
	    //
	    //    // Pressed mouse or enter button
	    //    $typeahead.bind("typeahead:selected", function(obj, selectedItemData) {
	    //        $typeahead.typeahead('val', selectedItemData.gov_name);
	    //        window.location.pathname += [selectedItemData.altTypeSlug, selectedItemData.slug].join('/');
	    //    });
	    //
	    //    // Move cursor via arrows keys
	    //    $typeahead.bind("typeahead:cursorchange", function(obj) {
	    //        $typeahead.typeahead('val', searchValue);
	    //    });
	    //
	    //    // Store search value on typing
	    //    $typeahead.keyup(function(event) {
	    //        searchValue = $(event.target).val();
	    //    });
	    //
	    //    $typeahead.attr('placeholder', 'GOVERNMENT NAME');
	    //    $typeahead.attr('disabled', false);
	    //
	    //});
	
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {/*!
	
	 handlebars v3.0.0
	
	Copyright (C) 2011-2014 by Yehuda Katz
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	
	@license
	*/
	/* exported Handlebars */
	(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    module.exports = factory();
	  } else {
	    root.Handlebars = factory();
	  }
	}(this, function () {
	// handlebars/utils.js
	var __module3__ = (function() {
	  "use strict";
	  var __exports__ = {};
	  /*jshint -W004 */
	  var escape = {
	    "&": "&amp;",
	    "<": "&lt;",
	    ">": "&gt;",
	    '"': "&quot;",
	    "'": "&#x27;",
	    "`": "&#x60;"
	  };
	
	  var badChars = /[&<>"'`]/g;
	  var possible = /[&<>"'`]/;
	
	  function escapeChar(chr) {
	    return escape[chr];
	  }
	
	  function extend(obj /* , ...source */) {
	    for (var i = 1; i < arguments.length; i++) {
	      for (var key in arguments[i]) {
	        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	          obj[key] = arguments[i][key];
	        }
	      }
	    }
	
	    return obj;
	  }
	
	  __exports__.extend = extend;var toString = Object.prototype.toString;
	  __exports__.toString = toString;
	  // Sourced from lodash
	  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	  var isFunction = function(value) {
	    return typeof value === 'function';
	  };
	  // fallback for older versions of Chrome and Safari
	  /* istanbul ignore next */
	  if (isFunction(/x/)) {
	    isFunction = function(value) {
	      return typeof value === 'function' && toString.call(value) === '[object Function]';
	    };
	  }
	  var isFunction;
	  __exports__.isFunction = isFunction;
	  /* istanbul ignore next */
	  var isArray = Array.isArray || function(value) {
	    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
	  };
	  __exports__.isArray = isArray;
	  // Older IE versions do not directly support indexOf so we must implement our own, sadly.
	  function indexOf(array, value) {
	    for (var i = 0, len = array.length; i < len; i++) {
	      if (array[i] === value) {
	        return i;
	      }
	    }
	    return -1;
	  }
	
	  __exports__.indexOf = indexOf;
	  function escapeExpression(string) {
	    // don't escape SafeStrings, since they're already safe
	    if (string && string.toHTML) {
	      return string.toHTML();
	    } else if (string == null) {
	      return "";
	    } else if (!string) {
	      return string + '';
	    }
	
	    // Force a string conversion as this will be done by the append regardless and
	    // the regex test will do this transparently behind the scenes, causing issues if
	    // an object's to string has escaped characters in it.
	    string = "" + string;
	
	    if(!possible.test(string)) { return string; }
	    return string.replace(badChars, escapeChar);
	  }
	
	  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
	    if (!value && value !== 0) {
	      return true;
	    } else if (isArray(value) && value.length === 0) {
	      return true;
	    } else {
	      return false;
	    }
	  }
	
	  __exports__.isEmpty = isEmpty;function blockParams(params, ids) {
	    params.path = ids;
	    return params;
	  }
	
	  __exports__.blockParams = blockParams;function appendContextPath(contextPath, id) {
	    return (contextPath ? contextPath + '.' : '') + id;
	  }
	
	  __exports__.appendContextPath = appendContextPath;
	  return __exports__;
	})();
	
	// handlebars/exception.js
	var __module4__ = (function() {
	  "use strict";
	  var __exports__;
	
	  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];
	
	  function Exception(message, node) {
	    var loc = node && node.loc,
	        line,
	        column;
	    if (loc) {
	      line = loc.start.line;
	      column = loc.start.column;
	
	      message += ' - ' + line + ':' + column;
	    }
	
	    var tmp = Error.prototype.constructor.call(this, message);
	
	    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	    for (var idx = 0; idx < errorProps.length; idx++) {
	      this[errorProps[idx]] = tmp[errorProps[idx]];
	    }
	
	    if (loc) {
	      this.lineNumber = line;
	      this.column = column;
	    }
	  }
	
	  Exception.prototype = new Error();
	
	  __exports__ = Exception;
	  return __exports__;
	})();
	
	// handlebars/base.js
	var __module2__ = (function(__dependency1__, __dependency2__) {
	  "use strict";
	  var __exports__ = {};
	  var Utils = __dependency1__;
	  var Exception = __dependency2__;
	
	  var VERSION = "3.0.0";
	  __exports__.VERSION = VERSION;var COMPILER_REVISION = 6;
	  __exports__.COMPILER_REVISION = COMPILER_REVISION;
	  var REVISION_CHANGES = {
	    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	    2: '== 1.0.0-rc.3',
	    3: '== 1.0.0-rc.4',
	    4: '== 1.x.x',
	    5: '== 2.0.0-alpha.x',
	    6: '>= 2.0.0-beta.1'
	  };
	  __exports__.REVISION_CHANGES = REVISION_CHANGES;
	  var isArray = Utils.isArray,
	      isFunction = Utils.isFunction,
	      toString = Utils.toString,
	      objectType = '[object Object]';
	
	  function HandlebarsEnvironment(helpers, partials) {
	    this.helpers = helpers || {};
	    this.partials = partials || {};
	
	    registerDefaultHelpers(this);
	  }
	
	  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
	    constructor: HandlebarsEnvironment,
	
	    logger: logger,
	    log: log,
	
	    registerHelper: function(name, fn) {
	      if (toString.call(name) === objectType) {
	        if (fn) { throw new Exception('Arg not supported with multiple helpers'); }
	        Utils.extend(this.helpers, name);
	      } else {
	        this.helpers[name] = fn;
	      }
	    },
	    unregisterHelper: function(name) {
	      delete this.helpers[name];
	    },
	
	    registerPartial: function(name, partial) {
	      if (toString.call(name) === objectType) {
	        Utils.extend(this.partials,  name);
	      } else {
	        if (typeof partial === 'undefined') {
	          throw new Exception('Attempting to register a partial as undefined');
	        }
	        this.partials[name] = partial;
	      }
	    },
	    unregisterPartial: function(name) {
	      delete this.partials[name];
	    }
	  };
	
	  function registerDefaultHelpers(instance) {
	    instance.registerHelper('helperMissing', function(/* [args, ]options */) {
	      if(arguments.length === 1) {
	        // A missing field in a {{foo}} constuct.
	        return undefined;
	      } else {
	        // Someone is actually trying to call something, blow up.
	        throw new Exception("Missing helper: '" + arguments[arguments.length-1].name + "'");
	      }
	    });
	
	    instance.registerHelper('blockHelperMissing', function(context, options) {
	      var inverse = options.inverse,
	          fn = options.fn;
	
	      if(context === true) {
	        return fn(this);
	      } else if(context === false || context == null) {
	        return inverse(this);
	      } else if (isArray(context)) {
	        if(context.length > 0) {
	          if (options.ids) {
	            options.ids = [options.name];
	          }
	
	          return instance.helpers.each(context, options);
	        } else {
	          return inverse(this);
	        }
	      } else {
	        if (options.data && options.ids) {
	          var data = createFrame(options.data);
	          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
	          options = {data: data};
	        }
	
	        return fn(context, options);
	      }
	    });
	
	    instance.registerHelper('each', function(context, options) {
	      if (!options) {
	        throw new Exception('Must pass iterator to #each');
	      }
	
	      var fn = options.fn, inverse = options.inverse;
	      var i = 0, ret = "", data;
	
	      var contextPath;
	      if (options.data && options.ids) {
	        contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	      }
	
	      if (isFunction(context)) { context = context.call(this); }
	
	      if (options.data) {
	        data = createFrame(options.data);
	      }
	
	      function execIteration(key, i, last) {
	        if (data) {
	          data.key = key;
	          data.index = i;
	          data.first = i === 0;
	          data.last  = !!last;
	
	          if (contextPath) {
	            data.contextPath = contextPath + key;
	          }
	        }
	
	        ret = ret + fn(context[key], {
	          data: data,
	          blockParams: Utils.blockParams([context[key], key], [contextPath + key, null])
	        });
	      }
	
	      if(context && typeof context === 'object') {
	        if (isArray(context)) {
	          for(var j = context.length; i<j; i++) {
	            execIteration(i, i, i === context.length-1);
	          }
	        } else {
	          var priorKey;
	
	          for(var key in context) {
	            if(context.hasOwnProperty(key)) {
	              // We're running the iterations one step out of sync so we can detect
	              // the last iteration without have to scan the object twice and create
	              // an itermediate keys array. 
	              if (priorKey) {
	                execIteration(priorKey, i-1);
	              }
	              priorKey = key;
	              i++;
	            }
	          }
	          if (priorKey) {
	            execIteration(priorKey, i-1, true);
	          }
	        }
	      }
	
	      if(i === 0){
	        ret = inverse(this);
	      }
	
	      return ret;
	    });
	
	    instance.registerHelper('if', function(conditional, options) {
	      if (isFunction(conditional)) { conditional = conditional.call(this); }
	
	      // Default behavior is to render the positive path if the value is truthy and not empty.
	      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
	        return options.inverse(this);
	      } else {
	        return options.fn(this);
	      }
	    });
	
	    instance.registerHelper('unless', function(conditional, options) {
	      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
	    });
	
	    instance.registerHelper('with', function(context, options) {
	      if (isFunction(context)) { context = context.call(this); }
	
	      var fn = options.fn;
	
	      if (!Utils.isEmpty(context)) {
	        if (options.data && options.ids) {
	          var data = createFrame(options.data);
	          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
	          options = {data:data};
	        }
	
	        return fn(context, options);
	      } else {
	        return options.inverse(this);
	      }
	    });
	
	    instance.registerHelper('log', function(message, options) {
	      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
	      instance.log(level, message);
	    });
	
	    instance.registerHelper('lookup', function(obj, field) {
	      return obj && obj[field];
	    });
	  }
	
	  var logger = {
	    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },
	
	    // State enum
	    DEBUG: 0,
	    INFO: 1,
	    WARN: 2,
	    ERROR: 3,
	    level: 1,
	
	    // Can be overridden in the host environment
	    log: function(level, message) {
	      if (typeof console !== 'undefined' && logger.level <= level) {
	        var method = logger.methodMap[level];
	        (console[method] || console.log).call(console, message);
	      }
	    }
	  };
	  __exports__.logger = logger;
	  var log = logger.log;
	  __exports__.log = log;
	  var createFrame = function(object) {
	    var frame = Utils.extend({}, object);
	    frame._parent = object;
	    return frame;
	  };
	  __exports__.createFrame = createFrame;
	  return __exports__;
	})(__module3__, __module4__);
	
	// handlebars/safe-string.js
	var __module5__ = (function() {
	  "use strict";
	  var __exports__;
	  // Build out our basic SafeString type
	  function SafeString(string) {
	    this.string = string;
	  }
	
	  SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
	    return "" + this.string;
	  };
	
	  __exports__ = SafeString;
	  return __exports__;
	})();
	
	// handlebars/runtime.js
	var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
	  "use strict";
	  var __exports__ = {};
	  var Utils = __dependency1__;
	  var Exception = __dependency2__;
	  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
	  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
	  var createFrame = __dependency3__.createFrame;
	
	  function checkRevision(compilerInfo) {
	    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	        currentRevision = COMPILER_REVISION;
	
	    if (compilerRevision !== currentRevision) {
	      if (compilerRevision < currentRevision) {
	        var runtimeVersions = REVISION_CHANGES[currentRevision],
	            compilerVersions = REVISION_CHANGES[compilerRevision];
	        throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
	              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
	      } else {
	        // Use the embedded version info since the runtime doesn't know about this revision yet
	        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
	              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
	      }
	    }
	  }
	
	  __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial
	
	  function template(templateSpec, env) {
	    /* istanbul ignore next */
	    if (!env) {
	      throw new Exception("No environment passed to template");
	    }
	    if (!templateSpec || !templateSpec.main) {
	      throw new Exception('Unknown template object: ' + typeof templateSpec);
	    }
	
	    // Note: Using env.VM references rather than local var references throughout this section to allow
	    // for external users to override these as psuedo-supported APIs.
	    env.VM.checkRevision(templateSpec.compiler);
	
	    var invokePartialWrapper = function(partial, context, options) {
	      if (options.hash) {
	        context = Utils.extend({}, context, options.hash);
	      }
	
	      partial = env.VM.resolvePartial.call(this, partial, context, options);
	      var result = env.VM.invokePartial.call(this, partial, context, options);
	
	      if (result == null && env.compile) {
	        options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
	        result = options.partials[options.name](context, options);
	      }
	      if (result != null) {
	        if (options.indent) {
	          var lines = result.split('\n');
	          for (var i = 0, l = lines.length; i < l; i++) {
	            if (!lines[i] && i + 1 === l) {
	              break;
	            }
	
	            lines[i] = options.indent + lines[i];
	          }
	          result = lines.join('\n');
	        }
	        return result;
	      } else {
	        throw new Exception("The partial " + options.name + " could not be compiled when running in runtime-only mode");
	      }
	    };
	
	    // Just add water
	    var container = {
	      strict: function(obj, name) {
	        if (!(name in obj)) {
	          throw new Exception('"' + name + '" not defined in ' + obj);
	        }
	        return obj[name];
	      },
	      lookup: function(depths, name) {
	        var len = depths.length;
	        for (var i = 0; i < len; i++) {
	          if (depths[i] && depths[i][name] != null) {
	            return depths[i][name];
	          }
	        }
	      },
	      lambda: function(current, context) {
	        return typeof current === 'function' ? current.call(context) : current;
	      },
	
	      escapeExpression: Utils.escapeExpression,
	      invokePartial: invokePartialWrapper,
	
	      fn: function(i) {
	        return templateSpec[i];
	      },
	
	      programs: [],
	      program: function(i, data, declaredBlockParams, blockParams, depths) {
	        var programWrapper = this.programs[i],
	            fn = this.fn(i);
	        if (data || depths || blockParams || declaredBlockParams) {
	          programWrapper = program(this, i, fn, data, declaredBlockParams, blockParams, depths);
	        } else if (!programWrapper) {
	          programWrapper = this.programs[i] = program(this, i, fn);
	        }
	        return programWrapper;
	      },
	
	      data: function(data, depth) {
	        while (data && depth--) {
	          data = data._parent;
	        }
	        return data;
	      },
	      merge: function(param, common) {
	        var ret = param || common;
	
	        if (param && common && (param !== common)) {
	          ret = Utils.extend({}, common, param);
	        }
	
	        return ret;
	      },
	
	      noop: env.VM.noop,
	      compilerInfo: templateSpec.compiler
	    };
	
	    var ret = function(context, options) {
	      options = options || {};
	      var data = options.data;
	
	      ret._setup(options);
	      if (!options.partial && templateSpec.useData) {
	        data = initData(context, data);
	      }
	      var depths,
	          blockParams = templateSpec.useBlockParams ? [] : undefined;
	      if (templateSpec.useDepths) {
	        depths = options.depths ? [context].concat(options.depths) : [context];
	      }
	
	      return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
	    };
	    ret.isTop = true;
	
	    ret._setup = function(options) {
	      if (!options.partial) {
	        container.helpers = container.merge(options.helpers, env.helpers);
	
	        if (templateSpec.usePartial) {
	          container.partials = container.merge(options.partials, env.partials);
	        }
	      } else {
	        container.helpers = options.helpers;
	        container.partials = options.partials;
	      }
	    };
	
	    ret._child = function(i, data, blockParams, depths) {
	      if (templateSpec.useBlockParams && !blockParams) {
	        throw new Exception('must pass block params');
	      }
	      if (templateSpec.useDepths && !depths) {
	        throw new Exception('must pass parent depths');
	      }
	
	      return program(container, i, templateSpec[i], data, 0, blockParams, depths);
	    };
	    return ret;
	  }
	
	  __exports__.template = template;function program(container, i, fn, data, declaredBlockParams, blockParams, depths) {
	    var prog = function(context, options) {
	      options = options || {};
	
	      return fn.call(container,
	          context,
	          container.helpers, container.partials,
	          options.data || data,
	          blockParams && [options.blockParams].concat(blockParams),
	          depths && [context].concat(depths));
	    };
	    prog.program = i;
	    prog.depth = depths ? depths.length : 0;
	    prog.blockParams = declaredBlockParams || 0;
	    return prog;
	  }
	
	  __exports__.program = program;function resolvePartial(partial, context, options) {
	    if (!partial) {
	      partial = options.partials[options.name];
	    } else if (!partial.call && !options.name) {
	      // This is a dynamic partial that returned a string
	      options.name = partial;
	      partial = options.partials[partial];
	    }
	    return partial;
	  }
	
	  __exports__.resolvePartial = resolvePartial;function invokePartial(partial, context, options) {
	    options.partial = true;
	
	    if(partial === undefined) {
	      throw new Exception("The partial " + options.name + " could not be found");
	    } else if(partial instanceof Function) {
	      return partial(context, options);
	    }
	  }
	
	  __exports__.invokePartial = invokePartial;function noop() { return ""; }
	
	  __exports__.noop = noop;function initData(context, data) {
	    if (!data || !('root' in data)) {
	      data = data ? createFrame(data) : {};
	      data.root = context;
	    }
	    return data;
	  }
	  return __exports__;
	})(__module3__, __module4__, __module2__);
	
	// handlebars.runtime.js
	var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
	  "use strict";
	  var __exports__;
	  /*globals Handlebars: true */
	  var base = __dependency1__;
	
	  // Each of these augment the Handlebars object. No need to setup here.
	  // (This is done to easily share code between commonjs and browse envs)
	  var SafeString = __dependency2__;
	  var Exception = __dependency3__;
	  var Utils = __dependency4__;
	  var runtime = __dependency5__;
	
	  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
	  var create = function() {
	    var hb = new base.HandlebarsEnvironment();
	
	    Utils.extend(hb, base);
	    hb.SafeString = SafeString;
	    hb.Exception = Exception;
	    hb.Utils = Utils;
	    hb.escapeExpression = Utils.escapeExpression;
	
	    hb.VM = runtime;
	    hb.template = function(spec) {
	      return runtime.template(spec, hb);
	    };
	
	    return hb;
	  };
	
	  var Handlebars = create();
	  Handlebars.create = create;
	
	  /*jshint -W040 */
	  /* istanbul ignore next */
	  var root = typeof global !== 'undefined' ? global : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function() {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	  };
	
	  Handlebars['default'] = Handlebars;
	
	  __exports__ = Handlebars;
	  return __exports__;
	})(__module2__, __module5__, __module4__, __module3__, __module6__);
	
	// handlebars/compiler/ast.js
	var __module7__ = (function() {
	  "use strict";
	  var __exports__;
	  var AST = {
	    Program: function(statements, blockParams, strip, locInfo) {
	      this.loc = locInfo;
	      this.type = 'Program';
	      this.body = statements;
	
	      this.blockParams = blockParams;
	      this.strip = strip;
	    },
	
	    MustacheStatement: function(path, params, hash, escaped, strip, locInfo) {
	      this.loc = locInfo;
	      this.type = 'MustacheStatement';
	
	      this.path = path;
	      this.params = params || [];
	      this.hash = hash;
	      this.escaped = escaped;
	
	      this.strip = strip;
	    },
	
	    BlockStatement: function(path, params, hash, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {
	      this.loc = locInfo;
	      this.type = 'BlockStatement';
	
	      this.path = path;
	      this.params = params || [];
	      this.hash = hash;
	      this.program  = program;
	      this.inverse  = inverse;
	
	      this.openStrip = openStrip;
	      this.inverseStrip = inverseStrip;
	      this.closeStrip = closeStrip;
	    },
	
	    PartialStatement: function(name, params, hash, strip, locInfo) {
	      this.loc = locInfo;
	      this.type = 'PartialStatement';
	
	      this.name = name;
	      this.params = params || [];
	      this.hash = hash;
	
	      this.indent = '';
	      this.strip = strip;
	    },
	
	    ContentStatement: function(string, locInfo) {
	      this.loc = locInfo;
	      this.type = 'ContentStatement';
	      this.original = this.value = string;
	    },
	
	    CommentStatement: function(comment, strip, locInfo) {
	      this.loc = locInfo;
	      this.type = 'CommentStatement';
	      this.value = comment;
	
	      this.strip = strip;
	    },
	
	    SubExpression: function(path, params, hash, locInfo) {
	      this.loc = locInfo;
	
	      this.type = 'SubExpression';
	      this.path = path;
	      this.params = params || [];
	      this.hash = hash;
	    },
	
	    PathExpression: function(data, depth, parts, original, locInfo) {
	      this.loc = locInfo;
	      this.type = 'PathExpression';
	
	      this.data = data;
	      this.original = original;
	      this.parts    = parts;
	      this.depth    = depth;
	    },
	
	    StringLiteral: function(string, locInfo) {
	      this.loc = locInfo;
	      this.type = 'StringLiteral';
	      this.original =
	        this.value = string;
	    },
	
	    NumberLiteral: function(number, locInfo) {
	      this.loc = locInfo;
	      this.type = 'NumberLiteral';
	      this.original =
	        this.value = Number(number);
	    },
	
	    BooleanLiteral: function(bool, locInfo) {
	      this.loc = locInfo;
	      this.type = 'BooleanLiteral';
	      this.original =
	        this.value = bool === 'true';
	    },
	
	    Hash: function(pairs, locInfo) {
	      this.loc = locInfo;
	      this.type = 'Hash';
	      this.pairs = pairs;
	    },
	    HashPair: function(key, value, locInfo) {
	      this.loc = locInfo;
	      this.type = 'HashPair';
	      this.key = key;
	      this.value = value;
	    },
	
	    // Public API used to evaluate derived attributes regarding AST nodes
	    helpers: {
	      // a mustache is definitely a helper if:
	      // * it is an eligible helper, and
	      // * it has at least one parameter or hash segment
	      // TODO: Make these public utility methods
	      helperExpression: function(node) {
	        return !!(node.type === 'SubExpression' || node.params.length || node.hash);
	      },
	
	      scopedId: function(path) {
	        return (/^\.|this\b/).test(path.original);
	      },
	
	      // an ID is simple if it only has one part, and that part is not
	      // `..` or `this`.
	      simpleId: function(path) {
	        return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
	      }
	    }
	  };
	
	
	  // Must be exported as an object rather than the root of the module as the jison lexer
	  // must modify the object to operate properly.
	  __exports__ = AST;
	  return __exports__;
	})();
	
	// handlebars/compiler/parser.js
	var __module9__ = (function() {
	  "use strict";
	  var __exports__;
	  /* jshint ignore:start */
	  /* istanbul ignore next */
	  /* Jison generated parser */
	  var handlebars = (function(){
	  var parser = {trace: function trace() { },
	  yy: {},
	  symbols_: {"error":2,"root":3,"program":4,"EOF":5,"program_repetition0":6,"statement":7,"mustache":8,"block":9,"rawBlock":10,"partial":11,"content":12,"COMMENT":13,"CONTENT":14,"openRawBlock":15,"END_RAW_BLOCK":16,"OPEN_RAW_BLOCK":17,"helperName":18,"openRawBlock_repetition0":19,"openRawBlock_option0":20,"CLOSE_RAW_BLOCK":21,"openBlock":22,"block_option0":23,"closeBlock":24,"openInverse":25,"block_option1":26,"OPEN_BLOCK":27,"openBlock_repetition0":28,"openBlock_option0":29,"openBlock_option1":30,"CLOSE":31,"OPEN_INVERSE":32,"openInverse_repetition0":33,"openInverse_option0":34,"openInverse_option1":35,"openInverseChain":36,"OPEN_INVERSE_CHAIN":37,"openInverseChain_repetition0":38,"openInverseChain_option0":39,"openInverseChain_option1":40,"inverseAndProgram":41,"INVERSE":42,"inverseChain":43,"inverseChain_option0":44,"OPEN_ENDBLOCK":45,"OPEN":46,"mustache_repetition0":47,"mustache_option0":48,"OPEN_UNESCAPED":49,"mustache_repetition1":50,"mustache_option1":51,"CLOSE_UNESCAPED":52,"OPEN_PARTIAL":53,"partialName":54,"partial_repetition0":55,"partial_option0":56,"param":57,"sexpr":58,"OPEN_SEXPR":59,"sexpr_repetition0":60,"sexpr_option0":61,"CLOSE_SEXPR":62,"hash":63,"hash_repetition_plus0":64,"hashSegment":65,"ID":66,"EQUALS":67,"blockParams":68,"OPEN_BLOCK_PARAMS":69,"blockParams_repetition_plus0":70,"CLOSE_BLOCK_PARAMS":71,"path":72,"dataName":73,"STRING":74,"NUMBER":75,"BOOLEAN":76,"DATA":77,"pathSegments":78,"SEP":79,"$accept":0,"$end":1},
	  terminals_: {2:"error",5:"EOF",13:"COMMENT",14:"CONTENT",16:"END_RAW_BLOCK",17:"OPEN_RAW_BLOCK",21:"CLOSE_RAW_BLOCK",27:"OPEN_BLOCK",31:"CLOSE",32:"OPEN_INVERSE",37:"OPEN_INVERSE_CHAIN",42:"INVERSE",45:"OPEN_ENDBLOCK",46:"OPEN",49:"OPEN_UNESCAPED",52:"CLOSE_UNESCAPED",53:"OPEN_PARTIAL",59:"OPEN_SEXPR",62:"CLOSE_SEXPR",66:"ID",67:"EQUALS",69:"OPEN_BLOCK_PARAMS",71:"CLOSE_BLOCK_PARAMS",74:"STRING",75:"NUMBER",76:"BOOLEAN",77:"DATA",79:"SEP"},
	  productions_: [0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[12,1],[10,3],[15,5],[9,4],[9,4],[22,6],[25,6],[36,6],[41,2],[43,3],[43,1],[24,3],[8,5],[8,5],[11,5],[57,1],[57,1],[58,5],[63,1],[65,3],[68,3],[18,1],[18,1],[18,1],[18,1],[18,1],[54,1],[54,1],[73,2],[72,1],[78,3],[78,1],[6,0],[6,2],[19,0],[19,2],[20,0],[20,1],[23,0],[23,1],[26,0],[26,1],[28,0],[28,2],[29,0],[29,1],[30,0],[30,1],[33,0],[33,2],[34,0],[34,1],[35,0],[35,1],[38,0],[38,2],[39,0],[39,1],[40,0],[40,1],[44,0],[44,1],[47,0],[47,2],[48,0],[48,1],[50,0],[50,2],[51,0],[51,1],[55,0],[55,2],[56,0],[56,1],[60,0],[60,2],[61,0],[61,1],[64,1],[64,2],[70,1],[70,2]],
	  performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {
	
	  var $0 = $$.length - 1;
	  switch (yystate) {
	  case 1: return $$[$0-1]; 
	  break;
	  case 2:this.$ = new yy.Program($$[$0], null, {}, yy.locInfo(this._$));
	  break;
	  case 3:this.$ = $$[$0];
	  break;
	  case 4:this.$ = $$[$0];
	  break;
	  case 5:this.$ = $$[$0];
	  break;
	  case 6:this.$ = $$[$0];
	  break;
	  case 7:this.$ = $$[$0];
	  break;
	  case 8:this.$ = new yy.CommentStatement(yy.stripComment($$[$0]), yy.stripFlags($$[$0], $$[$0]), yy.locInfo(this._$));
	  break;
	  case 9:this.$ = new yy.ContentStatement($$[$0], yy.locInfo(this._$));
	  break;
	  case 10:this.$ = yy.prepareRawBlock($$[$0-2], $$[$0-1], $$[$0], this._$);
	  break;
	  case 11:this.$ = { path: $$[$0-3], params: $$[$0-2], hash: $$[$0-1] };
	  break;
	  case 12:this.$ = yy.prepareBlock($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], false, this._$);
	  break;
	  case 13:this.$ = yy.prepareBlock($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], true, this._$);
	  break;
	  case 14:this.$ = { path: $$[$0-4], params: $$[$0-3], hash: $$[$0-2], blockParams: $$[$0-1], strip: yy.stripFlags($$[$0-5], $$[$0]) };
	  break;
	  case 15:this.$ = { path: $$[$0-4], params: $$[$0-3], hash: $$[$0-2], blockParams: $$[$0-1], strip: yy.stripFlags($$[$0-5], $$[$0]) };
	  break;
	  case 16:this.$ = { path: $$[$0-4], params: $$[$0-3], hash: $$[$0-2], blockParams: $$[$0-1], strip: yy.stripFlags($$[$0-5], $$[$0]) };
	  break;
	  case 17:this.$ = { strip: yy.stripFlags($$[$0-1], $$[$0-1]), program: $$[$0] };
	  break;
	  case 18:
	      var inverse = yy.prepareBlock($$[$0-2], $$[$0-1], $$[$0], $$[$0], false, this._$),
	          program = new yy.Program([inverse], null, {}, yy.locInfo(this._$));
	      program.chained = true;
	
	      this.$ = { strip: $$[$0-2].strip, program: program, chain: true };
	    
	  break;
	  case 19:this.$ = $$[$0];
	  break;
	  case 20:this.$ = {path: $$[$0-1], strip: yy.stripFlags($$[$0-2], $$[$0])};
	  break;
	  case 21:this.$ = yy.prepareMustache($$[$0-3], $$[$0-2], $$[$0-1], $$[$0-4], yy.stripFlags($$[$0-4], $$[$0]), this._$);
	  break;
	  case 22:this.$ = yy.prepareMustache($$[$0-3], $$[$0-2], $$[$0-1], $$[$0-4], yy.stripFlags($$[$0-4], $$[$0]), this._$);
	  break;
	  case 23:this.$ = new yy.PartialStatement($$[$0-3], $$[$0-2], $$[$0-1], yy.stripFlags($$[$0-4], $$[$0]), yy.locInfo(this._$));
	  break;
	  case 24:this.$ = $$[$0];
	  break;
	  case 25:this.$ = $$[$0];
	  break;
	  case 26:this.$ = new yy.SubExpression($$[$0-3], $$[$0-2], $$[$0-1], yy.locInfo(this._$));
	  break;
	  case 27:this.$ = new yy.Hash($$[$0], yy.locInfo(this._$));
	  break;
	  case 28:this.$ = new yy.HashPair($$[$0-2], $$[$0], yy.locInfo(this._$));
	  break;
	  case 29:this.$ = $$[$0-1];
	  break;
	  case 30:this.$ = $$[$0];
	  break;
	  case 31:this.$ = $$[$0];
	  break;
	  case 32:this.$ = new yy.StringLiteral($$[$0], yy.locInfo(this._$));
	  break;
	  case 33:this.$ = new yy.NumberLiteral($$[$0], yy.locInfo(this._$));
	  break;
	  case 34:this.$ = new yy.BooleanLiteral($$[$0], yy.locInfo(this._$));
	  break;
	  case 35:this.$ = $$[$0];
	  break;
	  case 36:this.$ = $$[$0];
	  break;
	  case 37:this.$ = yy.preparePath(true, $$[$0], this._$);
	  break;
	  case 38:this.$ = yy.preparePath(false, $$[$0], this._$);
	  break;
	  case 39: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2]; 
	  break;
	  case 40:this.$ = [{part: $$[$0]}];
	  break;
	  case 41:this.$ = [];
	  break;
	  case 42:$$[$0-1].push($$[$0]);
	  break;
	  case 43:this.$ = [];
	  break;
	  case 44:$$[$0-1].push($$[$0]);
	  break;
	  case 51:this.$ = [];
	  break;
	  case 52:$$[$0-1].push($$[$0]);
	  break;
	  case 57:this.$ = [];
	  break;
	  case 58:$$[$0-1].push($$[$0]);
	  break;
	  case 63:this.$ = [];
	  break;
	  case 64:$$[$0-1].push($$[$0]);
	  break;
	  case 71:this.$ = [];
	  break;
	  case 72:$$[$0-1].push($$[$0]);
	  break;
	  case 75:this.$ = [];
	  break;
	  case 76:$$[$0-1].push($$[$0]);
	  break;
	  case 79:this.$ = [];
	  break;
	  case 80:$$[$0-1].push($$[$0]);
	  break;
	  case 83:this.$ = [];
	  break;
	  case 84:$$[$0-1].push($$[$0]);
	  break;
	  case 87:this.$ = [$$[$0]];
	  break;
	  case 88:$$[$0-1].push($$[$0]);
	  break;
	  case 89:this.$ = [$$[$0]];
	  break;
	  case 90:$$[$0-1].push($$[$0]);
	  break;
	  }
	  },
	  table: [{3:1,4:2,5:[2,41],6:3,13:[2,41],14:[2,41],17:[2,41],27:[2,41],32:[2,41],46:[2,41],49:[2,41],53:[2,41]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:10,13:[1,11],14:[1,18],15:16,17:[1,21],22:14,25:15,27:[1,19],32:[1,20],37:[2,2],42:[2,2],45:[2,2],46:[1,12],49:[1,13],53:[1,17]},{1:[2,1]},{5:[2,42],13:[2,42],14:[2,42],17:[2,42],27:[2,42],32:[2,42],37:[2,42],42:[2,42],45:[2,42],46:[2,42],49:[2,42],53:[2,42]},{5:[2,3],13:[2,3],14:[2,3],17:[2,3],27:[2,3],32:[2,3],37:[2,3],42:[2,3],45:[2,3],46:[2,3],49:[2,3],53:[2,3]},{5:[2,4],13:[2,4],14:[2,4],17:[2,4],27:[2,4],32:[2,4],37:[2,4],42:[2,4],45:[2,4],46:[2,4],49:[2,4],53:[2,4]},{5:[2,5],13:[2,5],14:[2,5],17:[2,5],27:[2,5],32:[2,5],37:[2,5],42:[2,5],45:[2,5],46:[2,5],49:[2,5],53:[2,5]},{5:[2,6],13:[2,6],14:[2,6],17:[2,6],27:[2,6],32:[2,6],37:[2,6],42:[2,6],45:[2,6],46:[2,6],49:[2,6],53:[2,6]},{5:[2,7],13:[2,7],14:[2,7],17:[2,7],27:[2,7],32:[2,7],37:[2,7],42:[2,7],45:[2,7],46:[2,7],49:[2,7],53:[2,7]},{5:[2,8],13:[2,8],14:[2,8],17:[2,8],27:[2,8],32:[2,8],37:[2,8],42:[2,8],45:[2,8],46:[2,8],49:[2,8],53:[2,8]},{18:22,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{18:31,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{4:32,6:3,13:[2,41],14:[2,41],17:[2,41],27:[2,41],32:[2,41],37:[2,41],42:[2,41],45:[2,41],46:[2,41],49:[2,41],53:[2,41]},{4:33,6:3,13:[2,41],14:[2,41],17:[2,41],27:[2,41],32:[2,41],42:[2,41],45:[2,41],46:[2,41],49:[2,41],53:[2,41]},{12:34,14:[1,18]},{18:36,54:35,58:37,59:[1,38],66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{5:[2,9],13:[2,9],14:[2,9],16:[2,9],17:[2,9],27:[2,9],32:[2,9],37:[2,9],42:[2,9],45:[2,9],46:[2,9],49:[2,9],53:[2,9]},{18:39,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{18:40,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{18:41,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{31:[2,71],47:42,59:[2,71],66:[2,71],74:[2,71],75:[2,71],76:[2,71],77:[2,71]},{21:[2,30],31:[2,30],52:[2,30],59:[2,30],62:[2,30],66:[2,30],69:[2,30],74:[2,30],75:[2,30],76:[2,30],77:[2,30]},{21:[2,31],31:[2,31],52:[2,31],59:[2,31],62:[2,31],66:[2,31],69:[2,31],74:[2,31],75:[2,31],76:[2,31],77:[2,31]},{21:[2,32],31:[2,32],52:[2,32],59:[2,32],62:[2,32],66:[2,32],69:[2,32],74:[2,32],75:[2,32],76:[2,32],77:[2,32]},{21:[2,33],31:[2,33],52:[2,33],59:[2,33],62:[2,33],66:[2,33],69:[2,33],74:[2,33],75:[2,33],76:[2,33],77:[2,33]},{21:[2,34],31:[2,34],52:[2,34],59:[2,34],62:[2,34],66:[2,34],69:[2,34],74:[2,34],75:[2,34],76:[2,34],77:[2,34]},{21:[2,38],31:[2,38],52:[2,38],59:[2,38],62:[2,38],66:[2,38],69:[2,38],74:[2,38],75:[2,38],76:[2,38],77:[2,38],79:[1,43]},{66:[1,30],78:44},{21:[2,40],31:[2,40],52:[2,40],59:[2,40],62:[2,40],66:[2,40],69:[2,40],74:[2,40],75:[2,40],76:[2,40],77:[2,40],79:[2,40]},{50:45,52:[2,75],59:[2,75],66:[2,75],74:[2,75],75:[2,75],76:[2,75],77:[2,75]},{23:46,36:48,37:[1,50],41:49,42:[1,51],43:47,45:[2,47]},{26:52,41:53,42:[1,51],45:[2,49]},{16:[1,54]},{31:[2,79],55:55,59:[2,79],66:[2,79],74:[2,79],75:[2,79],76:[2,79],77:[2,79]},{31:[2,35],59:[2,35],66:[2,35],74:[2,35],75:[2,35],76:[2,35],77:[2,35]},{31:[2,36],59:[2,36],66:[2,36],74:[2,36],75:[2,36],76:[2,36],77:[2,36]},{18:56,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{28:57,31:[2,51],59:[2,51],66:[2,51],69:[2,51],74:[2,51],75:[2,51],76:[2,51],77:[2,51]},{31:[2,57],33:58,59:[2,57],66:[2,57],69:[2,57],74:[2,57],75:[2,57],76:[2,57],77:[2,57]},{19:59,21:[2,43],59:[2,43],66:[2,43],74:[2,43],75:[2,43],76:[2,43],77:[2,43]},{18:63,31:[2,73],48:60,57:61,58:64,59:[1,38],63:62,64:65,65:66,66:[1,67],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{66:[1,68]},{21:[2,37],31:[2,37],52:[2,37],59:[2,37],62:[2,37],66:[2,37],69:[2,37],74:[2,37],75:[2,37],76:[2,37],77:[2,37],79:[1,43]},{18:63,51:69,52:[2,77],57:70,58:64,59:[1,38],63:71,64:65,65:66,66:[1,67],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{24:72,45:[1,73]},{45:[2,48]},{4:74,6:3,13:[2,41],14:[2,41],17:[2,41],27:[2,41],32:[2,41],37:[2,41],42:[2,41],45:[2,41],46:[2,41],49:[2,41],53:[2,41]},{45:[2,19]},{18:75,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{4:76,6:3,13:[2,41],14:[2,41],17:[2,41],27:[2,41],32:[2,41],45:[2,41],46:[2,41],49:[2,41],53:[2,41]},{24:77,45:[1,73]},{45:[2,50]},{5:[2,10],13:[2,10],14:[2,10],17:[2,10],27:[2,10],32:[2,10],37:[2,10],42:[2,10],45:[2,10],46:[2,10],49:[2,10],53:[2,10]},{18:63,31:[2,81],56:78,57:79,58:64,59:[1,38],63:80,64:65,65:66,66:[1,67],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{59:[2,83],60:81,62:[2,83],66:[2,83],74:[2,83],75:[2,83],76:[2,83],77:[2,83]},{18:63,29:82,31:[2,53],57:83,58:64,59:[1,38],63:84,64:65,65:66,66:[1,67],69:[2,53],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{18:63,31:[2,59],34:85,57:86,58:64,59:[1,38],63:87,64:65,65:66,66:[1,67],69:[2,59],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{18:63,20:88,21:[2,45],57:89,58:64,59:[1,38],63:90,64:65,65:66,66:[1,67],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{31:[1,91]},{31:[2,72],59:[2,72],66:[2,72],74:[2,72],75:[2,72],76:[2,72],77:[2,72]},{31:[2,74]},{21:[2,24],31:[2,24],52:[2,24],59:[2,24],62:[2,24],66:[2,24],69:[2,24],74:[2,24],75:[2,24],76:[2,24],77:[2,24]},{21:[2,25],31:[2,25],52:[2,25],59:[2,25],62:[2,25],66:[2,25],69:[2,25],74:[2,25],75:[2,25],76:[2,25],77:[2,25]},{21:[2,27],31:[2,27],52:[2,27],62:[2,27],65:92,66:[1,93],69:[2,27]},{21:[2,87],31:[2,87],52:[2,87],62:[2,87],66:[2,87],69:[2,87]},{21:[2,40],31:[2,40],52:[2,40],59:[2,40],62:[2,40],66:[2,40],67:[1,94],69:[2,40],74:[2,40],75:[2,40],76:[2,40],77:[2,40],79:[2,40]},{21:[2,39],31:[2,39],52:[2,39],59:[2,39],62:[2,39],66:[2,39],69:[2,39],74:[2,39],75:[2,39],76:[2,39],77:[2,39],79:[2,39]},{52:[1,95]},{52:[2,76],59:[2,76],66:[2,76],74:[2,76],75:[2,76],76:[2,76],77:[2,76]},{52:[2,78]},{5:[2,12],13:[2,12],14:[2,12],17:[2,12],27:[2,12],32:[2,12],37:[2,12],42:[2,12],45:[2,12],46:[2,12],49:[2,12],53:[2,12]},{18:96,66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{36:48,37:[1,50],41:49,42:[1,51],43:98,44:97,45:[2,69]},{31:[2,63],38:99,59:[2,63],66:[2,63],69:[2,63],74:[2,63],75:[2,63],76:[2,63],77:[2,63]},{45:[2,17]},{5:[2,13],13:[2,13],14:[2,13],17:[2,13],27:[2,13],32:[2,13],37:[2,13],42:[2,13],45:[2,13],46:[2,13],49:[2,13],53:[2,13]},{31:[1,100]},{31:[2,80],59:[2,80],66:[2,80],74:[2,80],75:[2,80],76:[2,80],77:[2,80]},{31:[2,82]},{18:63,57:102,58:64,59:[1,38],61:101,62:[2,85],63:103,64:65,65:66,66:[1,67],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{30:104,31:[2,55],68:105,69:[1,106]},{31:[2,52],59:[2,52],66:[2,52],69:[2,52],74:[2,52],75:[2,52],76:[2,52],77:[2,52]},{31:[2,54],69:[2,54]},{31:[2,61],35:107,68:108,69:[1,106]},{31:[2,58],59:[2,58],66:[2,58],69:[2,58],74:[2,58],75:[2,58],76:[2,58],77:[2,58]},{31:[2,60],69:[2,60]},{21:[1,109]},{21:[2,44],59:[2,44],66:[2,44],74:[2,44],75:[2,44],76:[2,44],77:[2,44]},{21:[2,46]},{5:[2,21],13:[2,21],14:[2,21],17:[2,21],27:[2,21],32:[2,21],37:[2,21],42:[2,21],45:[2,21],46:[2,21],49:[2,21],53:[2,21]},{21:[2,88],31:[2,88],52:[2,88],62:[2,88],66:[2,88],69:[2,88]},{67:[1,94]},{18:63,57:110,58:64,59:[1,38],66:[1,30],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{5:[2,22],13:[2,22],14:[2,22],17:[2,22],27:[2,22],32:[2,22],37:[2,22],42:[2,22],45:[2,22],46:[2,22],49:[2,22],53:[2,22]},{31:[1,111]},{45:[2,18]},{45:[2,70]},{18:63,31:[2,65],39:112,57:113,58:64,59:[1,38],63:114,64:65,65:66,66:[1,67],69:[2,65],72:23,73:24,74:[1,25],75:[1,26],76:[1,27],77:[1,29],78:28},{5:[2,23],13:[2,23],14:[2,23],17:[2,23],27:[2,23],32:[2,23],37:[2,23],42:[2,23],45:[2,23],46:[2,23],49:[2,23],53:[2,23]},{62:[1,115]},{59:[2,84],62:[2,84],66:[2,84],74:[2,84],75:[2,84],76:[2,84],77:[2,84]},{62:[2,86]},{31:[1,116]},{31:[2,56]},{66:[1,118],70:117},{31:[1,119]},{31:[2,62]},{14:[2,11]},{21:[2,28],31:[2,28],52:[2,28],62:[2,28],66:[2,28],69:[2,28]},{5:[2,20],13:[2,20],14:[2,20],17:[2,20],27:[2,20],32:[2,20],37:[2,20],42:[2,20],45:[2,20],46:[2,20],49:[2,20],53:[2,20]},{31:[2,67],40:120,68:121,69:[1,106]},{31:[2,64],59:[2,64],66:[2,64],69:[2,64],74:[2,64],75:[2,64],76:[2,64],77:[2,64]},{31:[2,66],69:[2,66]},{21:[2,26],31:[2,26],52:[2,26],59:[2,26],62:[2,26],66:[2,26],69:[2,26],74:[2,26],75:[2,26],76:[2,26],77:[2,26]},{13:[2,14],14:[2,14],17:[2,14],27:[2,14],32:[2,14],37:[2,14],42:[2,14],45:[2,14],46:[2,14],49:[2,14],53:[2,14]},{66:[1,123],71:[1,122]},{66:[2,89],71:[2,89]},{13:[2,15],14:[2,15],17:[2,15],27:[2,15],32:[2,15],42:[2,15],45:[2,15],46:[2,15],49:[2,15],53:[2,15]},{31:[1,124]},{31:[2,68]},{31:[2,29]},{66:[2,90],71:[2,90]},{13:[2,16],14:[2,16],17:[2,16],27:[2,16],32:[2,16],37:[2,16],42:[2,16],45:[2,16],46:[2,16],49:[2,16],53:[2,16]}],
	  defaultActions: {4:[2,1],47:[2,48],49:[2,19],53:[2,50],62:[2,74],71:[2,78],76:[2,17],80:[2,82],90:[2,46],97:[2,18],98:[2,70],103:[2,86],105:[2,56],108:[2,62],109:[2,11],121:[2,68],122:[2,29]},
	  parseError: function parseError(str, hash) {
	      throw new Error(str);
	  },
	  parse: function parse(input) {
	      var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
	      this.lexer.setInput(input);
	      this.lexer.yy = this.yy;
	      this.yy.lexer = this.lexer;
	      this.yy.parser = this;
	      if (typeof this.lexer.yylloc == "undefined")
	          this.lexer.yylloc = {};
	      var yyloc = this.lexer.yylloc;
	      lstack.push(yyloc);
	      var ranges = this.lexer.options && this.lexer.options.ranges;
	      if (typeof this.yy.parseError === "function")
	          this.parseError = this.yy.parseError;
	      function popStack(n) {
	          stack.length = stack.length - 2 * n;
	          vstack.length = vstack.length - n;
	          lstack.length = lstack.length - n;
	      }
	      function lex() {
	          var token;
	          token = self.lexer.lex() || 1;
	          if (typeof token !== "number") {
	              token = self.symbols_[token] || token;
	          }
	          return token;
	      }
	      var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
	      while (true) {
	          state = stack[stack.length - 1];
	          if (this.defaultActions[state]) {
	              action = this.defaultActions[state];
	          } else {
	              if (symbol === null || typeof symbol == "undefined") {
	                  symbol = lex();
	              }
	              action = table[state] && table[state][symbol];
	          }
	          if (typeof action === "undefined" || !action.length || !action[0]) {
	              var errStr = "";
	              if (!recovering) {
	                  expected = [];
	                  for (p in table[state])
	                      if (this.terminals_[p] && p > 2) {
	                          expected.push("'" + this.terminals_[p] + "'");
	                      }
	                  if (this.lexer.showPosition) {
	                      errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
	                  } else {
	                      errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
	                  }
	                  this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
	              }
	          }
	          if (action[0] instanceof Array && action.length > 1) {
	              throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
	          }
	          switch (action[0]) {
	          case 1:
	              stack.push(symbol);
	              vstack.push(this.lexer.yytext);
	              lstack.push(this.lexer.yylloc);
	              stack.push(action[1]);
	              symbol = null;
	              if (!preErrorSymbol) {
	                  yyleng = this.lexer.yyleng;
	                  yytext = this.lexer.yytext;
	                  yylineno = this.lexer.yylineno;
	                  yyloc = this.lexer.yylloc;
	                  if (recovering > 0)
	                      recovering--;
	              } else {
	                  symbol = preErrorSymbol;
	                  preErrorSymbol = null;
	              }
	              break;
	          case 2:
	              len = this.productions_[action[1]][1];
	              yyval.$ = vstack[vstack.length - len];
	              yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
	              if (ranges) {
	                  yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
	              }
	              r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
	              if (typeof r !== "undefined") {
	                  return r;
	              }
	              if (len) {
	                  stack = stack.slice(0, -1 * len * 2);
	                  vstack = vstack.slice(0, -1 * len);
	                  lstack = lstack.slice(0, -1 * len);
	              }
	              stack.push(this.productions_[action[1]][0]);
	              vstack.push(yyval.$);
	              lstack.push(yyval._$);
	              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
	              stack.push(newState);
	              break;
	          case 3:
	              return true;
	          }
	      }
	      return true;
	  }
	  };
	  /* Jison generated lexer */
	  var lexer = (function(){
	  var lexer = ({EOF:1,
	  parseError:function parseError(str, hash) {
	          if (this.yy.parser) {
	              this.yy.parser.parseError(str, hash);
	          } else {
	              throw new Error(str);
	          }
	      },
	  setInput:function (input) {
	          this._input = input;
	          this._more = this._less = this.done = false;
	          this.yylineno = this.yyleng = 0;
	          this.yytext = this.matched = this.match = '';
	          this.conditionStack = ['INITIAL'];
	          this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
	          if (this.options.ranges) this.yylloc.range = [0,0];
	          this.offset = 0;
	          return this;
	      },
	  input:function () {
	          var ch = this._input[0];
	          this.yytext += ch;
	          this.yyleng++;
	          this.offset++;
	          this.match += ch;
	          this.matched += ch;
	          var lines = ch.match(/(?:\r\n?|\n).*/g);
	          if (lines) {
	              this.yylineno++;
	              this.yylloc.last_line++;
	          } else {
	              this.yylloc.last_column++;
	          }
	          if (this.options.ranges) this.yylloc.range[1]++;
	
	          this._input = this._input.slice(1);
	          return ch;
	      },
	  unput:function (ch) {
	          var len = ch.length;
	          var lines = ch.split(/(?:\r\n?|\n)/g);
	
	          this._input = ch + this._input;
	          this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
	          //this.yyleng -= len;
	          this.offset -= len;
	          var oldLines = this.match.split(/(?:\r\n?|\n)/g);
	          this.match = this.match.substr(0, this.match.length-1);
	          this.matched = this.matched.substr(0, this.matched.length-1);
	
	          if (lines.length-1) this.yylineno -= lines.length-1;
	          var r = this.yylloc.range;
	
	          this.yylloc = {first_line: this.yylloc.first_line,
	            last_line: this.yylineno+1,
	            first_column: this.yylloc.first_column,
	            last_column: lines ?
	                (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
	                this.yylloc.first_column - len
	            };
	
	          if (this.options.ranges) {
	              this.yylloc.range = [r[0], r[0] + this.yyleng - len];
	          }
	          return this;
	      },
	  more:function () {
	          this._more = true;
	          return this;
	      },
	  less:function (n) {
	          this.unput(this.match.slice(n));
	      },
	  pastInput:function () {
	          var past = this.matched.substr(0, this.matched.length - this.match.length);
	          return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
	      },
	  upcomingInput:function () {
	          var next = this.match;
	          if (next.length < 20) {
	              next += this._input.substr(0, 20-next.length);
	          }
	          return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
	      },
	  showPosition:function () {
	          var pre = this.pastInput();
	          var c = new Array(pre.length + 1).join("-");
	          return pre + this.upcomingInput() + "\n" + c+"^";
	      },
	  next:function () {
	          if (this.done) {
	              return this.EOF;
	          }
	          if (!this._input) this.done = true;
	
	          var token,
	              match,
	              tempMatch,
	              index,
	              col,
	              lines;
	          if (!this._more) {
	              this.yytext = '';
	              this.match = '';
	          }
	          var rules = this._currentRules();
	          for (var i=0;i < rules.length; i++) {
	              tempMatch = this._input.match(this.rules[rules[i]]);
	              if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
	                  match = tempMatch;
	                  index = i;
	                  if (!this.options.flex) break;
	              }
	          }
	          if (match) {
	              lines = match[0].match(/(?:\r\n?|\n).*/g);
	              if (lines) this.yylineno += lines.length;
	              this.yylloc = {first_line: this.yylloc.last_line,
	                             last_line: this.yylineno+1,
	                             first_column: this.yylloc.last_column,
	                             last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
	              this.yytext += match[0];
	              this.match += match[0];
	              this.matches = match;
	              this.yyleng = this.yytext.length;
	              if (this.options.ranges) {
	                  this.yylloc.range = [this.offset, this.offset += this.yyleng];
	              }
	              this._more = false;
	              this._input = this._input.slice(match[0].length);
	              this.matched += match[0];
	              token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
	              if (this.done && this._input) this.done = false;
	              if (token) return token;
	              else return;
	          }
	          if (this._input === "") {
	              return this.EOF;
	          } else {
	              return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
	                      {text: "", token: null, line: this.yylineno});
	          }
	      },
	  lex:function lex() {
	          var r = this.next();
	          if (typeof r !== 'undefined') {
	              return r;
	          } else {
	              return this.lex();
	          }
	      },
	  begin:function begin(condition) {
	          this.conditionStack.push(condition);
	      },
	  popState:function popState() {
	          return this.conditionStack.pop();
	      },
	  _currentRules:function _currentRules() {
	          return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
	      },
	  topState:function () {
	          return this.conditionStack[this.conditionStack.length-2];
	      },
	  pushState:function begin(condition) {
	          this.begin(condition);
	      }});
	  lexer.options = {};
	  lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
	
	
	  function strip(start, end) {
	    return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
	  }
	
	
	  var YYSTATE=YY_START
	  switch($avoiding_name_collisions) {
	  case 0:
	                                     if(yy_.yytext.slice(-2) === "\\\\") {
	                                       strip(0,1);
	                                       this.begin("mu");
	                                     } else if(yy_.yytext.slice(-1) === "\\") {
	                                       strip(0,1);
	                                       this.begin("emu");
	                                     } else {
	                                       this.begin("mu");
	                                     }
	                                     if(yy_.yytext) return 14;
	                                   
	  break;
	  case 1:return 14;
	  break;
	  case 2:
	                                     this.popState();
	                                     return 14;
	                                   
	  break;
	  case 3:
	                                    yy_.yytext = yy_.yytext.substr(5, yy_.yyleng-9);
	                                    this.popState();
	                                    return 16;
	                                   
	  break;
	  case 4: return 14; 
	  break;
	  case 5:
	    this.popState();
	    return 13;
	
	  break;
	  case 6:return 59;
	  break;
	  case 7:return 62;
	  break;
	  case 8: return 17; 
	  break;
	  case 9:
	                                    this.popState();
	                                    this.begin('raw');
	                                    return 21;
	                                   
	  break;
	  case 10:return 53;
	  break;
	  case 11:return 27;
	  break;
	  case 12:return 45;
	  break;
	  case 13:this.popState(); return 42;
	  break;
	  case 14:this.popState(); return 42;
	  break;
	  case 15:return 32;
	  break;
	  case 16:return 37;
	  break;
	  case 17:return 49;
	  break;
	  case 18:return 46;
	  break;
	  case 19:
	    this.unput(yy_.yytext);
	    this.popState();
	    this.begin('com');
	
	  break;
	  case 20:
	    this.popState();
	    return 13;
	
	  break;
	  case 21:return 46;
	  break;
	  case 22:return 67;
	  break;
	  case 23:return 66;
	  break;
	  case 24:return 66;
	  break;
	  case 25:return 79;
	  break;
	  case 26:// ignore whitespace
	  break;
	  case 27:this.popState(); return 52;
	  break;
	  case 28:this.popState(); return 31;
	  break;
	  case 29:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 74;
	  break;
	  case 30:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 74;
	  break;
	  case 31:return 77;
	  break;
	  case 32:return 76;
	  break;
	  case 33:return 76;
	  break;
	  case 34:return 75;
	  break;
	  case 35:return 69;
	  break;
	  case 36:return 71;
	  break;
	  case 37:return 66;
	  break;
	  case 38:yy_.yytext = strip(1,2); return 66;
	  break;
	  case 39:return 'INVALID';
	  break;
	  case 40:return 5;
	  break;
	  }
	  };
	  lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{\/)))/,/^(?:[\s\S]*?--(~)?\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{(~)?!--)/,/^(?:\{\{(~)?![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)|])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:as\s+\|)/,/^(?:\|)/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
	  lexer.conditions = {"mu":{"rules":[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[5],"inclusive":false},"raw":{"rules":[3,4],"inclusive":false},"INITIAL":{"rules":[0,1,40],"inclusive":true}};
	  return lexer;})()
	  parser.lexer = lexer;
	  function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
	  return new Parser;
	  })();__exports__ = handlebars;
	  /* jshint ignore:end */
	  return __exports__;
	})();
	
	// handlebars/compiler/visitor.js
	var __module11__ = (function(__dependency1__, __dependency2__) {
	  "use strict";
	  var __exports__;
	  var Exception = __dependency1__;
	  var AST = __dependency2__;
	
	  function Visitor() {
	    this.parents = [];
	  }
	
	  Visitor.prototype = {
	    constructor: Visitor,
	    mutating: false,
	
	    // Visits a given value. If mutating, will replace the value if necessary.
	    acceptKey: function(node, name) {
	      var value = this.accept(node[name]);
	      if (this.mutating) {
	        // Hacky sanity check:
	        if (value && (!value.type || !AST[value.type])) {
	          throw new Exception('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
	        }
	        node[name] = value;
	      }
	    },
	
	    // Performs an accept operation with added sanity check to ensure
	    // required keys are not removed.
	    acceptRequired: function(node, name) {
	      this.acceptKey(node, name);
	
	      if (!node[name]) {
	        throw new Exception(node.type + ' requires ' + name);
	      }
	    },
	
	    // Traverses a given array. If mutating, empty respnses will be removed
	    // for child elements.
	    acceptArray: function(array) {
	      for (var i = 0, l = array.length; i < l; i++) {
	        this.acceptKey(array, i);
	
	        if (!array[i]) {
	          array.splice(i, 1);
	          i--;
	          l--;
	        }
	      }
	    },
	
	    accept: function(object) {
	      if (!object) {
	        return;
	      }
	
	      if (this.current) {
	        this.parents.unshift(this.current);
	      }
	      this.current = object;
	
	      var ret = this[object.type](object);
	
	      this.current = this.parents.shift();
	
	      if (!this.mutating || ret) {
	        return ret;
	      } else if (ret !== false) {
	        return object;
	      }
	    },
	
	    Program: function(program) {
	      this.acceptArray(program.body);
	    },
	
	    MustacheStatement: function(mustache) {
	      this.acceptRequired(mustache, 'path');
	      this.acceptArray(mustache.params);
	      this.acceptKey(mustache, 'hash');
	    },
	
	    BlockStatement: function(block) {
	      this.acceptRequired(block, 'path');
	      this.acceptArray(block.params);
	      this.acceptKey(block, 'hash');
	
	      this.acceptKey(block, 'program');
	      this.acceptKey(block, 'inverse');
	    },
	
	    PartialStatement: function(partial) {
	      this.acceptRequired(partial, 'name');
	      this.acceptArray(partial.params);
	      this.acceptKey(partial, 'hash');
	    },
	
	    ContentStatement: function(/* content */) {},
	    CommentStatement: function(/* comment */) {},
	
	    SubExpression: function(sexpr) {
	      this.acceptRequired(sexpr, 'path');
	      this.acceptArray(sexpr.params);
	      this.acceptKey(sexpr, 'hash');
	    },
	    PartialExpression: function(partial) {
	      this.acceptRequired(partial, 'name');
	      this.acceptArray(partial.params);
	      this.acceptKey(partial, 'hash');
	    },
	
	    PathExpression: function(/* path */) {},
	
	    StringLiteral: function(/* string */) {},
	    NumberLiteral: function(/* number */) {},
	    BooleanLiteral: function(/* bool */) {},
	
	    Hash: function(hash) {
	      this.acceptArray(hash.pairs);
	    },
	    HashPair: function(pair) {
	      this.acceptRequired(pair, 'value');
	    }
	  };
	
	  __exports__ = Visitor;
	  return __exports__;
	})(__module4__, __module7__);
	
	// handlebars/compiler/whitespace-control.js
	var __module10__ = (function(__dependency1__) {
	  "use strict";
	  var __exports__;
	  var Visitor = __dependency1__;
	
	  function WhitespaceControl() {
	  }
	  WhitespaceControl.prototype = new Visitor();
	
	  WhitespaceControl.prototype.Program = function(program) {
	    var isRoot = !this.isRootSeen;
	    this.isRootSeen = true;
	
	    var body = program.body;
	    for (var i = 0, l = body.length; i < l; i++) {
	      var current = body[i],
	          strip = this.accept(current);
	
	      if (!strip) {
	        continue;
	      }
	
	      var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
	          _isNextWhitespace = isNextWhitespace(body, i, isRoot),
	
	          openStandalone = strip.openStandalone && _isPrevWhitespace,
	          closeStandalone = strip.closeStandalone && _isNextWhitespace,
	          inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;
	
	      if (strip.close) {
	        omitRight(body, i, true);
	      }
	      if (strip.open) {
	        omitLeft(body, i, true);
	      }
	
	      if (inlineStandalone) {
	        omitRight(body, i);
	
	        if (omitLeft(body, i)) {
	          // If we are on a standalone node, save the indent info for partials
	          if (current.type === 'PartialStatement') {
	            // Pull out the whitespace from the final line
	            current.indent = (/([ \t]+$)/).exec(body[i-1].original)[1];
	          }
	        }
	      }
	      if (openStandalone) {
	        omitRight((current.program || current.inverse).body);
	
	        // Strip out the previous content node if it's whitespace only
	        omitLeft(body, i);
	      }
	      if (closeStandalone) {
	        // Always strip the next node
	        omitRight(body, i);
	
	        omitLeft((current.inverse || current.program).body);
	      }
	    }
	
	    return program;
	  };
	  WhitespaceControl.prototype.BlockStatement = function(block) {
	    this.accept(block.program);
	    this.accept(block.inverse);
	
	    // Find the inverse program that is involed with whitespace stripping.
	    var program = block.program || block.inverse,
	        inverse = block.program && block.inverse,
	        firstInverse = inverse,
	        lastInverse = inverse;
	
	    if (inverse && inverse.chained) {
	      firstInverse = inverse.body[0].program;
	
	      // Walk the inverse chain to find the last inverse that is actually in the chain.
	      while (lastInverse.chained) {
	        lastInverse = lastInverse.body[lastInverse.body.length-1].program;
	      }
	    }
	
	    var strip = {
	      open: block.openStrip.open,
	      close: block.closeStrip.close,
	
	      // Determine the standalone candiacy. Basically flag our content as being possibly standalone
	      // so our parent can determine if we actually are standalone
	      openStandalone: isNextWhitespace(program.body),
	      closeStandalone: isPrevWhitespace((firstInverse || program).body)
	    };
	
	    if (block.openStrip.close) {
	      omitRight(program.body, null, true);
	    }
	
	    if (inverse) {
	      var inverseStrip = block.inverseStrip;
	
	      if (inverseStrip.open) {
	        omitLeft(program.body, null, true);
	      }
	
	      if (inverseStrip.close) {
	        omitRight(firstInverse.body, null, true);
	      }
	      if (block.closeStrip.open) {
	        omitLeft(lastInverse.body, null, true);
	      }
	
	      // Find standalone else statments
	      if (isPrevWhitespace(program.body)
	          && isNextWhitespace(firstInverse.body)) {
	
	        omitLeft(program.body);
	        omitRight(firstInverse.body);
	      }
	    } else {
	      if (block.closeStrip.open) {
	        omitLeft(program.body, null, true);
	      }
	    }
	
	    return strip;
	  };
	
	  WhitespaceControl.prototype.MustacheStatement = function(mustache) {
	    return mustache.strip;
	  };
	
	  WhitespaceControl.prototype.PartialStatement = 
	      WhitespaceControl.prototype.CommentStatement = function(node) {
	    /* istanbul ignore next */
	    var strip = node.strip || {};
	    return {
	      inlineStandalone: true,
	      open: strip.open,
	      close: strip.close
	    };
	  };
	
	
	  function isPrevWhitespace(body, i, isRoot) {
	    if (i === undefined) {
	      i = body.length;
	    }
	
	    // Nodes that end with newlines are considered whitespace (but are special
	    // cased for strip operations)
	    var prev = body[i-1],
	        sibling = body[i-2];
	    if (!prev) {
	      return isRoot;
	    }
	
	    if (prev.type === 'ContentStatement') {
	      return (sibling || !isRoot ? (/\r?\n\s*?$/) : (/(^|\r?\n)\s*?$/)).test(prev.original);
	    }
	  }
	  function isNextWhitespace(body, i, isRoot) {
	    if (i === undefined) {
	      i = -1;
	    }
	
	    var next = body[i+1],
	        sibling = body[i+2];
	    if (!next) {
	      return isRoot;
	    }
	
	    if (next.type === 'ContentStatement') {
	      return (sibling || !isRoot ? (/^\s*?\r?\n/) : (/^\s*?(\r?\n|$)/)).test(next.original);
	    }
	  }
	
	  // Marks the node to the right of the position as omitted.
	  // I.e. {{foo}}' ' will mark the ' ' node as omitted.
	  //
	  // If i is undefined, then the first child will be marked as such.
	  //
	  // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	  // content is met.
	  function omitRight(body, i, multiple) {
	    var current = body[i == null ? 0 : i + 1];
	    if (!current || current.type !== 'ContentStatement' || (!multiple && current.rightStripped)) {
	      return;
	    }
	
	    var original = current.value;
	    current.value = current.value.replace(multiple ? (/^\s+/) : (/^[ \t]*\r?\n?/), '');
	    current.rightStripped = current.value !== original;
	  }
	
	  // Marks the node to the left of the position as omitted.
	  // I.e. ' '{{foo}} will mark the ' ' node as omitted.
	  //
	  // If i is undefined then the last child will be marked as such.
	  //
	  // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
	  // content is met.
	  function omitLeft(body, i, multiple) {
	    var current = body[i == null ? body.length - 1 : i - 1];
	    if (!current || current.type !== 'ContentStatement' || (!multiple && current.leftStripped)) {
	      return;
	    }
	
	    // We omit the last node if it's whitespace only and not preceeded by a non-content node.
	    var original = current.value;
	    current.value = current.value.replace(multiple ? (/\s+$/) : (/[ \t]+$/), '');
	    current.leftStripped = current.value !== original;
	    return current.leftStripped;
	  }
	
	  __exports__ = WhitespaceControl;
	  return __exports__;
	})(__module11__);
	
	// handlebars/compiler/helpers.js
	var __module12__ = (function(__dependency1__) {
	  "use strict";
	  var __exports__ = {};
	  var Exception = __dependency1__;
	
	  function SourceLocation(source, locInfo) {
	    this.source = source;
	    this.start = {
	      line: locInfo.first_line,
	      column: locInfo.first_column
	    };
	    this.end = {
	      line: locInfo.last_line,
	      column: locInfo.last_column
	    };
	  }
	
	  __exports__.SourceLocation = SourceLocation;function stripFlags(open, close) {
	    return {
	      open: open.charAt(2) === '~',
	      close: close.charAt(close.length-3) === '~'
	    };
	  }
	
	  __exports__.stripFlags = stripFlags;function stripComment(comment) {
	    return comment.replace(/^\{\{~?\!-?-?/, '')
	                  .replace(/-?-?~?\}\}$/, '');
	  }
	
	  __exports__.stripComment = stripComment;function preparePath(data, parts, locInfo) {
	    /*jshint -W040 */
	    locInfo = this.locInfo(locInfo);
	
	    var original = data ? '@' : '',
	        dig = [],
	        depth = 0,
	        depthString = '';
	
	    for(var i=0,l=parts.length; i<l; i++) {
	      var part = parts[i].part;
	      original += (parts[i].separator || '') + part;
	
	      if (part === '..' || part === '.' || part === 'this') {
	        if (dig.length > 0) {
	          throw new Exception('Invalid path: ' + original, {loc: locInfo});
	        } else if (part === '..') {
	          depth++;
	          depthString += '../';
	        }
	      } else {
	        dig.push(part);
	      }
	    }
	
	    return new this.PathExpression(data, depth, dig, original, locInfo);
	  }
	
	  __exports__.preparePath = preparePath;function prepareMustache(path, params, hash, open, strip, locInfo) {
	    /*jshint -W040 */
	    // Must use charAt to support IE pre-10
	    var escapeFlag = open.charAt(3) || open.charAt(2),
	        escaped = escapeFlag !== '{' && escapeFlag !== '&';
	
	    return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));
	  }
	
	  __exports__.prepareMustache = prepareMustache;function prepareRawBlock(openRawBlock, content, close, locInfo) {
	    /*jshint -W040 */
	    if (openRawBlock.path.original !== close) {
	      var errorNode = {loc: openRawBlock.path.loc};
	
	      throw new Exception(openRawBlock.path.original + " doesn't match " + close, errorNode);
	    }
	
	    locInfo = this.locInfo(locInfo);
	    var program = new this.Program([content], null, {}, locInfo);
	
	    return new this.BlockStatement(
	        openRawBlock.path, openRawBlock.params, openRawBlock.hash,
	        program, undefined,
	        {}, {}, {},
	        locInfo);
	  }
	
	  __exports__.prepareRawBlock = prepareRawBlock;function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
	    /*jshint -W040 */
	    // When we are chaining inverse calls, we will not have a close path
	    if (close && close.path && openBlock.path.original !== close.path.original) {
	      var errorNode = {loc: openBlock.path.loc};
	
	      throw new Exception(openBlock.path.original + ' doesn\'t match ' + close.path.original, errorNode);
	    }
	
	    program.blockParams = openBlock.blockParams;
	
	    var inverse,
	        inverseStrip;
	
	    if (inverseAndProgram) {
	      if (inverseAndProgram.chain) {
	        inverseAndProgram.program.body[0].closeStrip = close.strip;
	      }
	
	      inverseStrip = inverseAndProgram.strip;
	      inverse = inverseAndProgram.program;
	    }
	
	    if (inverted) {
	      inverted = inverse;
	      inverse = program;
	      program = inverted;
	    }
	
	    return new this.BlockStatement(
	        openBlock.path, openBlock.params, openBlock.hash,
	        program, inverse,
	        openBlock.strip, inverseStrip, close && close.strip,
	        this.locInfo(locInfo));
	  }
	
	  __exports__.prepareBlock = prepareBlock;
	  return __exports__;
	})(__module4__);
	
	// handlebars/compiler/base.js
	var __module8__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
	  "use strict";
	  var __exports__ = {};
	  var parser = __dependency1__;
	  var AST = __dependency2__;
	  var WhitespaceControl = __dependency3__;
	  var Helpers = __dependency4__;
	  var extend = __dependency5__.extend;
	
	  __exports__.parser = parser;
	
	  var yy = {};
	  extend(yy, Helpers, AST);
	
	  function parse(input, options) {
	    // Just return if an already-compiled AST was passed in.
	    if (input.type === 'Program') { return input; }
	
	    parser.yy = yy;
	
	    // Altering the shared object here, but this is ok as parser is a sync operation
	    yy.locInfo = function(locInfo) {
	      return new yy.SourceLocation(options && options.srcName, locInfo);
	    };
	
	    var strip = new WhitespaceControl();
	    return strip.accept(parser.parse(input));
	  }
	
	  __exports__.parse = parse;
	  return __exports__;
	})(__module9__, __module7__, __module10__, __module12__, __module3__);
	
	// handlebars/compiler/compiler.js
	var __module13__ = (function(__dependency1__, __dependency2__, __dependency3__) {
	  "use strict";
	  var __exports__ = {};
	  var Exception = __dependency1__;
	  var isArray = __dependency2__.isArray;
	  var indexOf = __dependency2__.indexOf;
	  var AST = __dependency3__;
	
	  var slice = [].slice;
	
	
	  function Compiler() {}
	
	  __exports__.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
	  // function in a context. This is necessary for mustache compatibility, which
	  // requires that context functions in blocks are evaluated by blockHelperMissing,
	  // and then proceed as if the resulting value was provided to blockHelperMissing.
	
	  Compiler.prototype = {
	    compiler: Compiler,
	
	    equals: function(other) {
	      var len = this.opcodes.length;
	      if (other.opcodes.length !== len) {
	        return false;
	      }
	
	      for (var i = 0; i < len; i++) {
	        var opcode = this.opcodes[i],
	            otherOpcode = other.opcodes[i];
	        if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
	          return false;
	        }
	      }
	
	      // We know that length is the same between the two arrays because they are directly tied
	      // to the opcode behavior above.
	      len = this.children.length;
	      for (i = 0; i < len; i++) {
	        if (!this.children[i].equals(other.children[i])) {
	          return false;
	        }
	      }
	
	      return true;
	    },
	
	    guid: 0,
	
	    compile: function(program, options) {
	      this.sourceNode = [];
	      this.opcodes = [];
	      this.children = [];
	      this.options = options;
	      this.stringParams = options.stringParams;
	      this.trackIds = options.trackIds;
	
	      options.blockParams = options.blockParams || [];
	
	      // These changes will propagate to the other compiler components
	      var knownHelpers = options.knownHelpers;
	      options.knownHelpers = {
	        'helperMissing': true,
	        'blockHelperMissing': true,
	        'each': true,
	        'if': true,
	        'unless': true,
	        'with': true,
	        'log': true,
	        'lookup': true
	      };
	      if (knownHelpers) {
	        for (var name in knownHelpers) {
	          options.knownHelpers[name] = knownHelpers[name];
	        }
	      }
	
	      return this.accept(program);
	    },
	
	    compileProgram: function(program) {
	      var result = new this.compiler().compile(program, this.options);
	      var guid = this.guid++;
	
	      this.usePartial = this.usePartial || result.usePartial;
	
	      this.children[guid] = result;
	      this.useDepths = this.useDepths || result.useDepths;
	
	      return guid;
	    },
	
	    accept: function(node) {
	      this.sourceNode.unshift(node);
	      var ret = this[node.type](node);
	      this.sourceNode.shift();
	      return ret;
	    },
	
	    Program: function(program) {
	      this.options.blockParams.unshift(program.blockParams);
	
	      var body = program.body;
	      for(var i=0, l=body.length; i<l; i++) {
	        this.accept(body[i]);
	      }
	
	      this.options.blockParams.shift();
	
	      this.isSimple = l === 1;
	      this.blockParams = program.blockParams ? program.blockParams.length : 0;
	
	      return this;
	    },
	
	    BlockStatement: function(block) {
	      transformLiteralToPath(block);
	
	      var program = block.program,
	          inverse = block.inverse;
	
	      program = program && this.compileProgram(program);
	      inverse = inverse && this.compileProgram(inverse);
	
	      var type = this.classifySexpr(block);
	
	      if (type === 'helper') {
	        this.helperSexpr(block, program, inverse);
	      } else if (type === 'simple') {
	        this.simpleSexpr(block);
	
	        // now that the simple mustache is resolved, we need to
	        // evaluate it by executing `blockHelperMissing`
	        this.opcode('pushProgram', program);
	        this.opcode('pushProgram', inverse);
	        this.opcode('emptyHash');
	        this.opcode('blockValue', block.path.original);
	      } else {
	        this.ambiguousSexpr(block, program, inverse);
	
	        // now that the simple mustache is resolved, we need to
	        // evaluate it by executing `blockHelperMissing`
	        this.opcode('pushProgram', program);
	        this.opcode('pushProgram', inverse);
	        this.opcode('emptyHash');
	        this.opcode('ambiguousBlockValue');
	      }
	
	      this.opcode('append');
	    },
	
	    PartialStatement: function(partial) {
	      this.usePartial = true;
	
	      var params = partial.params;
	      if (params.length > 1) {
	        throw new Exception('Unsupported number of partial arguments: ' + params.length, partial);
	      } else if (!params.length) {
	        params.push({type: 'PathExpression', parts: [], depth: 0});
	      }
	
	      var partialName = partial.name.original,
	          isDynamic = partial.name.type === 'SubExpression';
	      if (isDynamic) {
	        this.accept(partial.name);
	      }
	
	      this.setupFullMustacheParams(partial, undefined, undefined, true);
	
	      var indent = partial.indent || '';
	      if (this.options.preventIndent && indent) {
	        this.opcode('appendContent', indent);
	        indent = '';
	      }
	
	      this.opcode('invokePartial', isDynamic, partialName, indent);
	      this.opcode('append');
	    },
	
	    MustacheStatement: function(mustache) {
	      this.SubExpression(mustache);
	
	      if(mustache.escaped && !this.options.noEscape) {
	        this.opcode('appendEscaped');
	      } else {
	        this.opcode('append');
	      }
	    },
	
	    ContentStatement: function(content) {
	      if (content.value) {
	        this.opcode('appendContent', content.value);
	      }
	    },
	
	    CommentStatement: function() {},
	
	    SubExpression: function(sexpr) {
	      transformLiteralToPath(sexpr);
	      var type = this.classifySexpr(sexpr);
	
	      if (type === 'simple') {
	        this.simpleSexpr(sexpr);
	      } else if (type === 'helper') {
	        this.helperSexpr(sexpr);
	      } else {
	        this.ambiguousSexpr(sexpr);
	      }
	    },
	    ambiguousSexpr: function(sexpr, program, inverse) {
	      var path = sexpr.path,
	          name = path.parts[0],
	          isBlock = program != null || inverse != null;
	
	      this.opcode('getContext', path.depth);
	
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	
	      this.accept(path);
	
	      this.opcode('invokeAmbiguous', name, isBlock);
	    },
	
	    simpleSexpr: function(sexpr) {
	      this.accept(sexpr.path);
	      this.opcode('resolvePossibleLambda');
	    },
	
	    helperSexpr: function(sexpr, program, inverse) {
	      var params = this.setupFullMustacheParams(sexpr, program, inverse),
	          path = sexpr.path,
	          name = path.parts[0];
	
	      if (this.options.knownHelpers[name]) {
	        this.opcode('invokeKnownHelper', params.length, name);
	      } else if (this.options.knownHelpersOnly) {
	        throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
	      } else {
	        path.falsy = true;
	
	        this.accept(path);
	        this.opcode('invokeHelper', params.length, path.original, AST.helpers.simpleId(path));
	      }
	    },
	
	    PathExpression: function(path) {
	      this.addDepth(path.depth);
	      this.opcode('getContext', path.depth);
	
	      var name = path.parts[0],
	          scoped = AST.helpers.scopedId(path),
	          blockParamId = !path.depth && !scoped && this.blockParamIndex(name);
	
	      if (blockParamId) {
	        this.opcode('lookupBlockParam', blockParamId, path.parts);
	      } else  if (!name) {
	        // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
	        this.opcode('pushContext');
	      } else if (path.data) {
	        this.options.data = true;
	        this.opcode('lookupData', path.depth, path.parts);
	      } else {
	        this.opcode('lookupOnContext', path.parts, path.falsy, scoped);
	      }
	    },
	
	    StringLiteral: function(string) {
	      this.opcode('pushString', string.value);
	    },
	
	    NumberLiteral: function(number) {
	      this.opcode('pushLiteral', number.value);
	    },
	
	    BooleanLiteral: function(bool) {
	      this.opcode('pushLiteral', bool.value);
	    },
	
	    Hash: function(hash) {
	      var pairs = hash.pairs, i, l;
	
	      this.opcode('pushHash');
	
	      for (i=0, l=pairs.length; i<l; i++) {
	        this.pushParam(pairs[i].value);
	      }
	      while (i--) {
	        this.opcode('assignToHash', pairs[i].key);
	      }
	      this.opcode('popHash');
	    },
	
	    // HELPERS
	    opcode: function(name) {
	      this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
	    },
	
	    addDepth: function(depth) {
	      if (!depth) {
	        return;
	      }
	
	      this.useDepths = true;
	    },
	
	    classifySexpr: function(sexpr) {
	      var isSimple = AST.helpers.simpleId(sexpr.path);
	
	      var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);
	
	      // a mustache is an eligible helper if:
	      // * its id is simple (a single part, not `this` or `..`)
	      var isHelper = !isBlockParam && AST.helpers.helperExpression(sexpr);
	
	      // if a mustache is an eligible helper but not a definite
	      // helper, it is ambiguous, and will be resolved in a later
	      // pass or at runtime.
	      var isEligible = !isBlockParam && (isHelper || isSimple);
	
	      var options = this.options;
	
	      // if ambiguous, we can possibly resolve the ambiguity now
	      // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
	      if (isEligible && !isHelper) {
	        var name = sexpr.path.parts[0];
	
	        if (options.knownHelpers[name]) {
	          isHelper = true;
	        } else if (options.knownHelpersOnly) {
	          isEligible = false;
	        }
	      }
	
	      if (isHelper) { return 'helper'; }
	      else if (isEligible) { return 'ambiguous'; }
	      else { return 'simple'; }
	    },
	
	    pushParams: function(params) {
	      for(var i=0, l=params.length; i<l; i++) {
	        this.pushParam(params[i]);
	      }
	    },
	
	    pushParam: function(val) {
	      var value = val.value != null ? val.value : val.original || '';
	
	      if (this.stringParams) {
	        if (value.replace) {
	          value = value
	              .replace(/^(\.?\.\/)*/g, '')
	              .replace(/\//g, '.');
	        }
	
	        if(val.depth) {
	          this.addDepth(val.depth);
	        }
	        this.opcode('getContext', val.depth || 0);
	        this.opcode('pushStringParam', value, val.type);
	
	        if (val.type === 'SubExpression') {
	          // SubExpressions get evaluated and passed in
	          // in string params mode.
	          this.accept(val);
	        }
	      } else {
	        if (this.trackIds) {
	          var blockParamIndex;
	          if (val.parts && !AST.helpers.scopedId(val) && !val.depth) {
	             blockParamIndex = this.blockParamIndex(val.parts[0]);
	          }
	          if (blockParamIndex) {
	            var blockParamChild = val.parts.slice(1).join('.');
	            this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
	          } else {
	            value = val.original || value;
	            if (value.replace) {
	              value = value
	                  .replace(/^\.\//g, '')
	                  .replace(/^\.$/g, '');
	            }
	
	            this.opcode('pushId', val.type, value);
	          }
	        }
	        this.accept(val);
	      }
	    },
	
	    setupFullMustacheParams: function(sexpr, program, inverse, omitEmpty) {
	      var params = sexpr.params;
	      this.pushParams(params);
	
	      this.opcode('pushProgram', program);
	      this.opcode('pushProgram', inverse);
	
	      if (sexpr.hash) {
	        this.accept(sexpr.hash);
	      } else {
	        this.opcode('emptyHash', omitEmpty);
	      }
	
	      return params;
	    },
	
	    blockParamIndex: function(name) {
	      for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
	        var blockParams = this.options.blockParams[depth],
	            param = blockParams && indexOf(blockParams, name);
	        if (blockParams && param >= 0) {
	          return [depth, param];
	        }
	      }
	    }
	  };
	
	  function precompile(input, options, env) {
	    if (input == null || (typeof input !== 'string' && input.type !== 'Program')) {
	      throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
	    }
	
	    options = options || {};
	    if (!('data' in options)) {
	      options.data = true;
	    }
	    if (options.compat) {
	      options.useDepths = true;
	    }
	
	    var ast = env.parse(input, options);
	    var environment = new env.Compiler().compile(ast, options);
	    return new env.JavaScriptCompiler().compile(environment, options);
	  }
	
	  __exports__.precompile = precompile;function compile(input, options, env) {
	    if (input == null || (typeof input !== 'string' && input.type !== 'Program')) {
	      throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
	    }
	
	    options = options || {};
	
	    if (!('data' in options)) {
	      options.data = true;
	    }
	    if (options.compat) {
	      options.useDepths = true;
	    }
	
	    var compiled;
	
	    function compileInput() {
	      var ast = env.parse(input, options);
	      var environment = new env.Compiler().compile(ast, options);
	      var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
	      return env.template(templateSpec);
	    }
	
	    // Template is only compiled on first use and cached after that point.
	    var ret = function(context, options) {
	      if (!compiled) {
	        compiled = compileInput();
	      }
	      return compiled.call(this, context, options);
	    };
	    ret._setup = function(options) {
	      if (!compiled) {
	        compiled = compileInput();
	      }
	      return compiled._setup(options);
	    };
	    ret._child = function(i, data, blockParams, depths) {
	      if (!compiled) {
	        compiled = compileInput();
	      }
	      return compiled._child(i, data, blockParams, depths);
	    };
	    return ret;
	  }
	
	  __exports__.compile = compile;function argEquals(a, b) {
	    if (a === b) {
	      return true;
	    }
	
	    if (isArray(a) && isArray(b) && a.length === b.length) {
	      for (var i = 0; i < a.length; i++) {
	        if (!argEquals(a[i], b[i])) {
	          return false;
	        }
	      }
	      return true;
	    }
	  }
	
	  function transformLiteralToPath(sexpr) {
	    if (!sexpr.path.parts) {
	      var literal = sexpr.path;
	      // Casting to string here to make false and 0 literal values play nicely with the rest
	      // of the system.
	      sexpr.path = new AST.PathExpression(false, 0, [literal.original+''], literal.original+'', literal.log);
	    }
	  }
	  return __exports__;
	})(__module4__, __module3__, __module7__);
	
	// handlebars/compiler/code-gen.js
	var __module15__ = (function(__dependency1__) {
	  "use strict";
	  var __exports__;
	  var isArray = __dependency1__.isArray;
	
	  try {
	    var SourceMap = __webpack_require__(12),
	          SourceNode = SourceMap.SourceNode;
	  } catch (err) {
	    /* istanbul ignore next: tested but not covered in istanbul due to dist build  */
	    SourceNode = function(line, column, srcFile, chunks) {
	      this.src = '';
	      if (chunks) {
	        this.add(chunks);
	      }
	    };
	    /* istanbul ignore next */
	    SourceNode.prototype = {
	      add: function(chunks) {
	        if (isArray(chunks)) {
	          chunks = chunks.join('');
	        }
	        this.src += chunks;
	      },
	      prepend: function(chunks) {
	        if (isArray(chunks)) {
	          chunks = chunks.join('');
	        }
	        this.src = chunks + this.src;
	      },
	      toStringWithSourceMap: function() {
	        return {code: this.toString()};
	      },
	      toString: function() {
	        return this.src;
	      }
	    };
	  }
	
	
	  function castChunk(chunk, codeGen, loc) {
	    if (isArray(chunk)) {
	      var ret = [];
	
	      for (var i = 0, len = chunk.length; i < len; i++) {
	        ret.push(codeGen.wrap(chunk[i], loc));
	      }
	      return ret;
	    } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
	      // Handle primitives that the SourceNode will throw up on
	      return chunk+'';
	    }
	    return chunk;
	  }
	
	
	  function CodeGen(srcFile) {
	    this.srcFile = srcFile;
	    this.source = [];
	  }
	
	  CodeGen.prototype = {
	    prepend: function(source, loc) {
	      this.source.unshift(this.wrap(source, loc));
	    },
	    push: function(source, loc) {
	      this.source.push(this.wrap(source, loc));
	    },
	
	    merge: function() {
	      var source = this.empty();
	      this.each(function(line) {
	        source.add(['  ', line, '\n']);
	      });
	      return source;
	    },
	
	    each: function(iter) {
	      for (var i = 0, len = this.source.length; i < len; i++) {
	        iter(this.source[i]);
	      }
	    },
	
	    empty: function(loc) {
	      loc = loc || this.currentLocation || {start:{}};
	      return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
	    },
	    wrap: function(chunk, loc) {
	      if (chunk instanceof SourceNode) {
	        return chunk;
	      }
	
	      loc = loc || this.currentLocation || {start:{}};
	      chunk = castChunk(chunk, this, loc);
	
	      return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
	    },
	
	    functionCall: function(fn, type, params) {
	      params = this.generateList(params);
	      return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
	    },
	
	    quotedString: function(str) {
	      return '"' + (str + '')
	        .replace(/\\/g, '\\\\')
	        .replace(/"/g, '\\"')
	        .replace(/\n/g, '\\n')
	        .replace(/\r/g, '\\r')
	        .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
	        .replace(/\u2029/g, '\\u2029') + '"';
	    },
	
	    objectLiteral: function(obj) {
	      var pairs = [];
	
	      for (var key in obj) {
	        if (obj.hasOwnProperty(key)) {
	          var value = castChunk(obj[key], this);
	          if (value !== 'undefined') {
	            pairs.push([this.quotedString(key), ':', value]);
	          }
	        }
	      }
	
	      var ret = this.generateList(pairs);
	      ret.prepend('{');
	      ret.add('}');
	      return ret;
	    },
	
	
	    generateList: function(entries, loc) {
	      var ret = this.empty(loc);
	
	      for (var i = 0, len = entries.length; i < len; i++) {
	        if (i) {
	          ret.add(',');
	        }
	
	        ret.add(castChunk(entries[i], this, loc));
	      }
	
	      return ret;
	    },
	
	    generateArray: function(entries, loc) {
	      var ret = this.generateList(entries, loc);
	      ret.prepend('[');
	      ret.add(']');
	
	      return ret;
	    }
	  };
	
	  __exports__ = CodeGen;
	  return __exports__;
	})(__module3__);
	
	// handlebars/compiler/javascript-compiler.js
	var __module14__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__) {
	  "use strict";
	  var __exports__;
	  var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
	  var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
	  var Exception = __dependency2__;
	  var isArray = __dependency3__.isArray;
	  var CodeGen = __dependency4__;
	
	  function Literal(value) {
	    this.value = value;
	  }
	
	  function JavaScriptCompiler() {}
	
	  JavaScriptCompiler.prototype = {
	    // PUBLIC API: You can override these methods in a subclass to provide
	    // alternative compiled forms for name lookup and buffering semantics
	    nameLookup: function(parent, name /* , type*/) {
	      if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
	        return [parent, ".", name];
	      } else {
	        return [parent, "['", name, "']"];
	      }
	    },
	    depthedLookup: function(name) {
	      return [this.aliasable('this.lookup'), '(depths, "', name, '")'];
	    },
	
	    compilerInfo: function() {
	      var revision = COMPILER_REVISION,
	          versions = REVISION_CHANGES[revision];
	      return [revision, versions];
	    },
	
	    appendToBuffer: function(source, location, explicit) {
	      // Force a source as this simplifies the merge logic.
	      if (!isArray(source)) {
	        source = [source];
	      }
	      source = this.source.wrap(source, location);
	
	      if (this.environment.isSimple) {
	        return ['return ', source, ';'];
	      } else if (explicit) {
	        // This is a case where the buffer operation occurs as a child of another
	        // construct, generally braces. We have to explicitly output these buffer
	        // operations to ensure that the emitted code goes in the correct location.
	        return ['buffer += ', source, ';'];
	      } else {
	        source.appendToBuffer = true;
	        return source;
	      }
	    },
	
	    initializeBuffer: function() {
	      return this.quotedString("");
	    },
	    // END PUBLIC API
	
	    compile: function(environment, options, context, asObject) {
	      this.environment = environment;
	      this.options = options;
	      this.stringParams = this.options.stringParams;
	      this.trackIds = this.options.trackIds;
	      this.precompile = !asObject;
	
	      this.name = this.environment.name;
	      this.isChild = !!context;
	      this.context = context || {
	        programs: [],
	        environments: []
	      };
	
	      this.preamble();
	
	      this.stackSlot = 0;
	      this.stackVars = [];
	      this.aliases = {};
	      this.registers = { list: [] };
	      this.hashes = [];
	      this.compileStack = [];
	      this.inlineStack = [];
	      this.blockParams = [];
	
	      this.compileChildren(environment, options);
	
	      this.useDepths = this.useDepths || environment.useDepths || this.options.compat;
	      this.useBlockParams = this.useBlockParams || environment.useBlockParams;
	
	      var opcodes = environment.opcodes,
	          opcode,
	          firstLoc,
	          i,
	          l;
	
	      for (i = 0, l = opcodes.length; i < l; i++) {
	        opcode = opcodes[i];
	
	        this.source.currentLocation = opcode.loc;
	        firstLoc = firstLoc || opcode.loc;
	        this[opcode.opcode].apply(this, opcode.args);
	      }
	
	      // Flush any trailing content that might be pending.
	      this.source.currentLocation = firstLoc;
	      this.pushSource('');
	
	      /* istanbul ignore next */
	      if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
	        throw new Exception('Compile completed with content left on stack');
	      }
	
	      var fn = this.createFunctionContext(asObject);
	      if (!this.isChild) {
	        var ret = {
	          compiler: this.compilerInfo(),
	          main: fn
	        };
	        var programs = this.context.programs;
	        for (i = 0, l = programs.length; i < l; i++) {
	          if (programs[i]) {
	            ret[i] = programs[i];
	          }
	        }
	
	        if (this.environment.usePartial) {
	          ret.usePartial = true;
	        }
	        if (this.options.data) {
	          ret.useData = true;
	        }
	        if (this.useDepths) {
	          ret.useDepths = true;
	        }
	        if (this.useBlockParams) {
	          ret.useBlockParams = true;
	        }
	        if (this.options.compat) {
	          ret.compat = true;
	        }
	
	        if (!asObject) {
	          ret.compiler = JSON.stringify(ret.compiler);
	
	          this.source.currentLocation = {start: {line: 1, column: 0}};
	          ret = this.objectLiteral(ret);
	
	          if (options.srcName) {
	            ret = ret.toStringWithSourceMap({file: options.destName});
	            ret.map = ret.map && ret.map.toString();
	          } else {
	            ret = ret.toString();
	          }
	        } else {
	          ret.compilerOptions = this.options;
	        }
	
	        return ret;
	      } else {
	        return fn;
	      }
	    },
	
	    preamble: function() {
	      // track the last context pushed into place to allow skipping the
	      // getContext opcode when it would be a noop
	      this.lastContext = 0;
	      this.source = new CodeGen(this.options.srcName);
	    },
	
	    createFunctionContext: function(asObject) {
	      var varDeclarations = '';
	
	      var locals = this.stackVars.concat(this.registers.list);
	      if(locals.length > 0) {
	        varDeclarations += ", " + locals.join(", ");
	      }
	
	      // Generate minimizer alias mappings
	      //
	      // When using true SourceNodes, this will update all references to the given alias
	      // as the source nodes are reused in situ. For the non-source node compilation mode,
	      // aliases will not be used, but this case is already being run on the client and
	      // we aren't concern about minimizing the template size.
	      var aliasCount = 0;
	      for (var alias in this.aliases) {
	        var node = this.aliases[alias];
	
	        if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
	          varDeclarations += ', alias' + (++aliasCount) + '=' + alias;
	          node.children[0] = 'alias' + aliasCount;
	        }
	      }
	
	      var params = ["depth0", "helpers", "partials", "data"];
	
	      if (this.useBlockParams || this.useDepths) {
	        params.push('blockParams');
	      }
	      if (this.useDepths) {
	        params.push('depths');
	      }
	
	      // Perform a second pass over the output to merge content when possible
	      var source = this.mergeSource(varDeclarations);
	
	      if (asObject) {
	        params.push(source);
	
	        return Function.apply(this, params);
	      } else {
	        return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
	      }
	    },
	    mergeSource: function(varDeclarations) {
	      var isSimple = this.environment.isSimple,
	          appendOnly = !this.forceBuffer,
	          appendFirst,
	
	          sourceSeen,
	          bufferStart,
	          bufferEnd;
	      this.source.each(function(line) {
	        if (line.appendToBuffer) {
	          if (bufferStart) {
	            line.prepend('  + ');
	          } else {
	            bufferStart = line;
	          }
	          bufferEnd = line;
	        } else {
	          if (bufferStart) {
	            if (!sourceSeen) {
	              appendFirst = true;
	            } else {
	              bufferStart.prepend('buffer += ');
	            }
	            bufferEnd.add(';');
	            bufferStart = bufferEnd = undefined;
	          }
	
	          sourceSeen = true;
	          if (!isSimple) {
	            appendOnly = false;
	          }
	        }
	      });
	
	
	      if (appendOnly) {
	        if (bufferStart) {
	          bufferStart.prepend('return ');
	          bufferEnd.add(';');
	        } else if (!sourceSeen) {
	          this.source.push('return "";');
	        }
	      } else {
	        varDeclarations += ", buffer = " + (appendFirst ? '' : this.initializeBuffer());
	
	        if (bufferStart) {
	          bufferStart.prepend('return buffer + ');
	          bufferEnd.add(';');
	        } else {
	          this.source.push('return buffer;');
	        }
	      }
	
	      if (varDeclarations) {
	        this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
	      }
	
	      return this.source.merge();
	    },
	
	    // [blockValue]
	    //
	    // On stack, before: hash, inverse, program, value
	    // On stack, after: return value of blockHelperMissing
	    //
	    // The purpose of this opcode is to take a block of the form
	    // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
	    // replace it on the stack with the result of properly
	    // invoking blockHelperMissing.
	    blockValue: function(name) {
	      var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	          params = [this.contextName(0)];
	      this.setupHelperArgs(name, 0, params);
	
	      var blockName = this.popStack();
	      params.splice(1, 0, blockName);
	
	      this.push(this.source.functionCall(blockHelperMissing, 'call', params));
	    },
	
	    // [ambiguousBlockValue]
	    //
	    // On stack, before: hash, inverse, program, value
	    // Compiler value, before: lastHelper=value of last found helper, if any
	    // On stack, after, if no lastHelper: same as [blockValue]
	    // On stack, after, if lastHelper: value
	    ambiguousBlockValue: function() {
	      // We're being a bit cheeky and reusing the options value from the prior exec
	      var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
	          params = [this.contextName(0)];
	      this.setupHelperArgs('', 0, params, true);
	
	      this.flushInline();
	
	      var current = this.topStack();
	      params.splice(1, 0, current);
	
	      this.pushSource([
	          'if (!', this.lastHelper, ') { ',
	            current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params),
	          '}']);
	    },
	
	    // [appendContent]
	    //
	    // On stack, before: ...
	    // On stack, after: ...
	    //
	    // Appends the string value of `content` to the current buffer
	    appendContent: function(content) {
	      if (this.pendingContent) {
	        content = this.pendingContent + content;
	      } else {
	        this.pendingLocation = this.source.currentLocation;
	      }
	
	      this.pendingContent = content;
	    },
	
	    // [append]
	    //
	    // On stack, before: value, ...
	    // On stack, after: ...
	    //
	    // Coerces `value` to a String and appends it to the current buffer.
	    //
	    // If `value` is truthy, or 0, it is coerced into a string and appended
	    // Otherwise, the empty string is appended
	    append: function() {
	      if (this.isInline()) {
	        this.replaceStack(function(current) {
	          return [' != null ? ', current, ' : ""'];
	        });
	
	        this.pushSource(this.appendToBuffer(this.popStack()));
	      } else {
	        var local = this.popStack();
	        this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
	        if (this.environment.isSimple) {
	          this.pushSource(['else { ', this.appendToBuffer("''", undefined, true), ' }']);
	        }
	      }
	    },
	
	    // [appendEscaped]
	    //
	    // On stack, before: value, ...
	    // On stack, after: ...
	    //
	    // Escape `value` and append it to the buffer
	    appendEscaped: function() {
	      this.pushSource(this.appendToBuffer(
	          [this.aliasable('this.escapeExpression'), '(', this.popStack(), ')']));
	    },
	
	    // [getContext]
	    //
	    // On stack, before: ...
	    // On stack, after: ...
	    // Compiler value, after: lastContext=depth
	    //
	    // Set the value of the `lastContext` compiler value to the depth
	    getContext: function(depth) {
	      this.lastContext = depth;
	    },
	
	    // [pushContext]
	    //
	    // On stack, before: ...
	    // On stack, after: currentContext, ...
	    //
	    // Pushes the value of the current context onto the stack.
	    pushContext: function() {
	      this.pushStackLiteral(this.contextName(this.lastContext));
	    },
	
	    // [lookupOnContext]
	    //
	    // On stack, before: ...
	    // On stack, after: currentContext[name], ...
	    //
	    // Looks up the value of `name` on the current context and pushes
	    // it onto the stack.
	    lookupOnContext: function(parts, falsy, scoped) {
	      var i = 0;
	
	      if (!scoped && this.options.compat && !this.lastContext) {
	        // The depthed query is expected to handle the undefined logic for the root level that
	        // is implemented below, so we evaluate that directly in compat mode
	        this.push(this.depthedLookup(parts[i++]));
	      } else {
	        this.pushContext();
	      }
	
	      this.resolvePath('context', parts, i, falsy);
	    },
	
	    // [lookupBlockParam]
	    //
	    // On stack, before: ...
	    // On stack, after: blockParam[name], ...
	    //
	    // Looks up the value of `parts` on the given block param and pushes
	    // it onto the stack.
	    lookupBlockParam: function(blockParamId, parts) {
	      this.useBlockParams = true;
	
	      this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
	      this.resolvePath('context', parts, 1);
	    },
	
	    // [lookupData]
	    //
	    // On stack, before: ...
	    // On stack, after: data, ...
	    //
	    // Push the data lookup operator
	    lookupData: function(depth, parts) {
	      /*jshint -W083 */
	      if (!depth) {
	        this.pushStackLiteral('data');
	      } else {
	        this.pushStackLiteral('this.data(data, ' + depth + ')');
	      }
	
	      this.resolvePath('data', parts, 0, true);
	    },
	
	    resolvePath: function(type, parts, i, falsy) {
	      /*jshint -W083 */
	      if (this.options.strict || this.options.assumeObjects) {
	        this.push(strictLookup(this.options.strict, this, parts, type));
	        return;
	      }
	
	      var len = parts.length;
	      for (; i < len; i++) {
	        this.replaceStack(function(current) {
	          var lookup = this.nameLookup(current, parts[i], type);
	          // We want to ensure that zero and false are handled properly if the context (falsy flag)
	          // needs to have the special handling for these values.
	          if (!falsy) {
	            return [' != null ? ', lookup, ' : ', current];
	          } else {
	            // Otherwise we can use generic falsy handling
	            return [' && ', lookup];
	          }
	        });
	      }
	    },
	
	    // [resolvePossibleLambda]
	    //
	    // On stack, before: value, ...
	    // On stack, after: resolved value, ...
	    //
	    // If the `value` is a lambda, replace it on the stack by
	    // the return value of the lambda
	    resolvePossibleLambda: function() {
	      this.push([this.aliasable('this.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
	    },
	
	    // [pushStringParam]
	    //
	    // On stack, before: ...
	    // On stack, after: string, currentContext, ...
	    //
	    // This opcode is designed for use in string mode, which
	    // provides the string value of a parameter along with its
	    // depth rather than resolving it immediately.
	    pushStringParam: function(string, type) {
	      this.pushContext();
	      this.pushString(type);
	
	      // If it's a subexpression, the string result
	      // will be pushed after this opcode.
	      if (type !== 'SubExpression') {
	        if (typeof string === 'string') {
	          this.pushString(string);
	        } else {
	          this.pushStackLiteral(string);
	        }
	      }
	    },
	
	    emptyHash: function(omitEmpty) {
	      if (this.trackIds) {
	        this.push('{}'); // hashIds
	      }
	      if (this.stringParams) {
	        this.push('{}'); // hashContexts
	        this.push('{}'); // hashTypes
	      }
	      this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
	    },
	    pushHash: function() {
	      if (this.hash) {
	        this.hashes.push(this.hash);
	      }
	      this.hash = {values: [], types: [], contexts: [], ids: []};
	    },
	    popHash: function() {
	      var hash = this.hash;
	      this.hash = this.hashes.pop();
	
	      if (this.trackIds) {
	        this.push(this.objectLiteral(hash.ids));
	      }
	      if (this.stringParams) {
	        this.push(this.objectLiteral(hash.contexts));
	        this.push(this.objectLiteral(hash.types));
	      }
	
	      this.push(this.objectLiteral(hash.values));
	    },
	
	    // [pushString]
	    //
	    // On stack, before: ...
	    // On stack, after: quotedString(string), ...
	    //
	    // Push a quoted version of `string` onto the stack
	    pushString: function(string) {
	      this.pushStackLiteral(this.quotedString(string));
	    },
	
	    // [pushLiteral]
	    //
	    // On stack, before: ...
	    // On stack, after: value, ...
	    //
	    // Pushes a value onto the stack. This operation prevents
	    // the compiler from creating a temporary variable to hold
	    // it.
	    pushLiteral: function(value) {
	      this.pushStackLiteral(value);
	    },
	
	    // [pushProgram]
	    //
	    // On stack, before: ...
	    // On stack, after: program(guid), ...
	    //
	    // Push a program expression onto the stack. This takes
	    // a compile-time guid and converts it into a runtime-accessible
	    // expression.
	    pushProgram: function(guid) {
	      if (guid != null) {
	        this.pushStackLiteral(this.programExpression(guid));
	      } else {
	        this.pushStackLiteral(null);
	      }
	    },
	
	    // [invokeHelper]
	    //
	    // On stack, before: hash, inverse, program, params..., ...
	    // On stack, after: result of helper invocation
	    //
	    // Pops off the helper's parameters, invokes the helper,
	    // and pushes the helper's return value onto the stack.
	    //
	    // If the helper is not found, `helperMissing` is called.
	    invokeHelper: function(paramSize, name, isSimple) {
	      var nonHelper = this.popStack();
	      var helper = this.setupHelper(paramSize, name);
	      var simple = isSimple ? [helper.name, ' || '] : '';
	
	      var lookup = ['('].concat(simple, nonHelper);
	      if (!this.options.strict) {
	        lookup.push(' || ', this.aliasable('helpers.helperMissing'));
	      }
	      lookup.push(')');
	
	      this.push(this.source.functionCall(lookup, 'call', helper.callParams));
	    },
	
	    // [invokeKnownHelper]
	    //
	    // On stack, before: hash, inverse, program, params..., ...
	    // On stack, after: result of helper invocation
	    //
	    // This operation is used when the helper is known to exist,
	    // so a `helperMissing` fallback is not required.
	    invokeKnownHelper: function(paramSize, name) {
	      var helper = this.setupHelper(paramSize, name);
	      this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
	    },
	
	    // [invokeAmbiguous]
	    //
	    // On stack, before: hash, inverse, program, params..., ...
	    // On stack, after: result of disambiguation
	    //
	    // This operation is used when an expression like `{{foo}}`
	    // is provided, but we don't know at compile-time whether it
	    // is a helper or a path.
	    //
	    // This operation emits more code than the other options,
	    // and can be avoided by passing the `knownHelpers` and
	    // `knownHelpersOnly` flags at compile-time.
	    invokeAmbiguous: function(name, helperCall) {
	      this.useRegister('helper');
	
	      var nonHelper = this.popStack();
	
	      this.emptyHash();
	      var helper = this.setupHelper(0, name, helperCall);
	
	      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');
	
	      var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
	      if (!this.options.strict) {
	        lookup[0] = '(helper = ';
	        lookup.push(
	          ' != null ? helper : ',
	          this.aliasable('helpers.helperMissing')
	        );
	      }
	
	      this.push([
	          '(', lookup,
	          (helper.paramsInit ? ['),(', helper.paramsInit] : []), '),',
	          '(typeof helper === ', this.aliasable('"function"'), ' ? ',
	          this.source.functionCall('helper','call', helper.callParams), ' : helper))'
	      ]);
	    },
	
	    // [invokePartial]
	    //
	    // On stack, before: context, ...
	    // On stack after: result of partial invocation
	    //
	    // This operation pops off a context, invokes a partial with that context,
	    // and pushes the result of the invocation back.
	    invokePartial: function(isDynamic, name, indent) {
	      var params = [],
	          options = this.setupParams(name, 1, params, false);
	
	      if (isDynamic) {
	        name = this.popStack();
	        delete options.name;
	      }
	
	      if (indent) {
	        options.indent = JSON.stringify(indent);
	      }
	      options.helpers = 'helpers';
	      options.partials = 'partials';
	
	      if (!isDynamic) {
	        params.unshift(this.nameLookup('partials', name, 'partial'));
	      } else {
	        params.unshift(name);
	      }
	
	      if (this.options.compat) {
	        options.depths = 'depths';
	      }
	      options = this.objectLiteral(options);
	      params.push(options);
	
	      this.push(this.source.functionCall('this.invokePartial', '', params));
	    },
	
	    // [assignToHash]
	    //
	    // On stack, before: value, ..., hash, ...
	    // On stack, after: ..., hash, ...
	    //
	    // Pops a value off the stack and assigns it to the current hash
	    assignToHash: function(key) {
	      var value = this.popStack(),
	          context,
	          type,
	          id;
	
	      if (this.trackIds) {
	        id = this.popStack();
	      }
	      if (this.stringParams) {
	        type = this.popStack();
	        context = this.popStack();
	      }
	
	      var hash = this.hash;
	      if (context) {
	        hash.contexts[key] = context;
	      }
	      if (type) {
	        hash.types[key] = type;
	      }
	      if (id) {
	        hash.ids[key] = id;
	      }
	      hash.values[key] = value;
	    },
	
	    pushId: function(type, name, child) {
	      if (type === 'BlockParam') {
	        this.pushStackLiteral(
	            'blockParams[' + name[0] + '].path[' + name[1] + ']'
	            + (child ? ' + ' + JSON.stringify('.' + child) : ''));
	      } else if (type === 'PathExpression') {
	        this.pushString(name);
	      } else if (type === 'SubExpression') {
	        this.pushStackLiteral('true');
	      } else {
	        this.pushStackLiteral('null');
	      }
	    },
	
	    // HELPERS
	
	    compiler: JavaScriptCompiler,
	
	    compileChildren: function(environment, options) {
	      var children = environment.children, child, compiler;
	
	      for(var i=0, l=children.length; i<l; i++) {
	        child = children[i];
	        compiler = new this.compiler();
	
	        var index = this.matchExistingProgram(child);
	
	        if (index == null) {
	          this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
	          index = this.context.programs.length;
	          child.index = index;
	          child.name = 'program' + index;
	          this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
	          this.context.environments[index] = child;
	
	          this.useDepths = this.useDepths || compiler.useDepths;
	          this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
	        } else {
	          child.index = index;
	          child.name = 'program' + index;
	
	          this.useDepths = this.useDepths || child.useDepths;
	          this.useBlockParams = this.useBlockParams || child.useBlockParams;
	        }
	      }
	    },
	    matchExistingProgram: function(child) {
	      for (var i = 0, len = this.context.environments.length; i < len; i++) {
	        var environment = this.context.environments[i];
	        if (environment && environment.equals(child)) {
	          return i;
	        }
	      }
	    },
	
	    programExpression: function(guid) {
	      var child = this.environment.children[guid],
	          programParams = [child.index, 'data', child.blockParams];
	
	      if (this.useBlockParams || this.useDepths) {
	        programParams.push('blockParams');
	      }
	      if (this.useDepths) {
	        programParams.push('depths');
	      }
	
	      return 'this.program(' + programParams.join(', ') + ')';
	    },
	
	    useRegister: function(name) {
	      if(!this.registers[name]) {
	        this.registers[name] = true;
	        this.registers.list.push(name);
	      }
	    },
	
	    push: function(expr) {
	      if (!(expr instanceof Literal)) {
	        expr = this.source.wrap(expr);
	      }
	
	      this.inlineStack.push(expr);
	      return expr;
	    },
	
	    pushStackLiteral: function(item) {
	      this.push(new Literal(item));
	    },
	
	    pushSource: function(source) {
	      if (this.pendingContent) {
	        this.source.push(
	            this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
	        this.pendingContent = undefined;
	      }
	
	      if (source) {
	        this.source.push(source);
	      }
	    },
	
	    replaceStack: function(callback) {
	      var prefix = ['('],
	          stack,
	          createdStack,
	          usedLiteral;
	
	      /* istanbul ignore next */
	      if (!this.isInline()) {
	        throw new Exception('replaceStack on non-inline');
	      }
	
	      // We want to merge the inline statement into the replacement statement via ','
	      var top = this.popStack(true);
	
	      if (top instanceof Literal) {
	        // Literals do not need to be inlined
	        stack = [top.value];
	        prefix = ['(', stack];
	        usedLiteral = true;
	      } else {
	        // Get or create the current stack name for use by the inline
	        createdStack = true;
	        var name = this.incrStack();
	
	        prefix = ['((', this.push(name), ' = ', top, ')'];
	        stack = this.topStack();
	      }
	
	      var item = callback.call(this, stack);
	
	      if (!usedLiteral) {
	        this.popStack();
	      }
	      if (createdStack) {
	        this.stackSlot--;
	      }
	      this.push(prefix.concat(item, ')'));
	    },
	
	    incrStack: function() {
	      this.stackSlot++;
	      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
	      return this.topStackName();
	    },
	    topStackName: function() {
	      return "stack" + this.stackSlot;
	    },
	    flushInline: function() {
	      var inlineStack = this.inlineStack;
	      this.inlineStack = [];
	      for (var i = 0, len = inlineStack.length; i < len; i++) {
	        var entry = inlineStack[i];
	        /* istanbul ignore if */
	        if (entry instanceof Literal) {
	          this.compileStack.push(entry);
	        } else {
	          var stack = this.incrStack();
	          this.pushSource([stack, ' = ', entry, ';']);
	          this.compileStack.push(stack);
	        }
	      }
	    },
	    isInline: function() {
	      return this.inlineStack.length;
	    },
	
	    popStack: function(wrapped) {
	      var inline = this.isInline(),
	          item = (inline ? this.inlineStack : this.compileStack).pop();
	
	      if (!wrapped && (item instanceof Literal)) {
	        return item.value;
	      } else {
	        if (!inline) {
	          /* istanbul ignore next */
	          if (!this.stackSlot) {
	            throw new Exception('Invalid stack pop');
	          }
	          this.stackSlot--;
	        }
	        return item;
	      }
	    },
	
	    topStack: function() {
	      var stack = (this.isInline() ? this.inlineStack : this.compileStack),
	          item = stack[stack.length - 1];
	
	      /* istanbul ignore if */
	      if (item instanceof Literal) {
	        return item.value;
	      } else {
	        return item;
	      }
	    },
	
	    contextName: function(context) {
	      if (this.useDepths && context) {
	        return 'depths[' + context + ']';
	      } else {
	        return 'depth' + context;
	      }
	    },
	
	    quotedString: function(str) {
	      return this.source.quotedString(str);
	    },
	
	    objectLiteral: function(obj) {
	      return this.source.objectLiteral(obj);
	    },
	
	    aliasable: function(name) {
	      var ret = this.aliases[name];
	      if (ret) {
	        ret.referenceCount++;
	        return ret;
	      }
	
	      ret = this.aliases[name] = this.source.wrap(name);
	      ret.aliasable = true;
	      ret.referenceCount = 1;
	
	      return ret;
	    },
	
	    setupHelper: function(paramSize, name, blockHelper) {
	      var params = [],
	          paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
	      var foundHelper = this.nameLookup('helpers', name, 'helper');
	
	      return {
	        params: params,
	        paramsInit: paramsInit,
	        name: foundHelper,
	        callParams: [this.contextName(0)].concat(params)
	      };
	    },
	
	    setupParams: function(helper, paramSize, params) {
	      var options = {}, contexts = [], types = [], ids = [], param;
	
	      options.name = this.quotedString(helper);
	      options.hash = this.popStack();
	
	      if (this.trackIds) {
	        options.hashIds = this.popStack();
	      }
	      if (this.stringParams) {
	        options.hashTypes = this.popStack();
	        options.hashContexts = this.popStack();
	      }
	
	      var inverse = this.popStack(),
	          program = this.popStack();
	
	      // Avoid setting fn and inverse if neither are set. This allows
	      // helpers to do a check for `if (options.fn)`
	      if (program || inverse) {
	        options.fn = program || 'this.noop';
	        options.inverse = inverse || 'this.noop';
	      }
	
	      // The parameters go on to the stack in order (making sure that they are evaluated in order)
	      // so we need to pop them off the stack in reverse order
	      var i = paramSize;
	      while (i--) {
	        param = this.popStack();
	        params[i] = param;
	
	        if (this.trackIds) {
	          ids[i] = this.popStack();
	        }
	        if (this.stringParams) {
	          types[i] = this.popStack();
	          contexts[i] = this.popStack();
	        }
	      }
	
	      if (this.trackIds) {
	        options.ids = this.source.generateArray(ids);
	      }
	      if (this.stringParams) {
	        options.types = this.source.generateArray(types);
	        options.contexts = this.source.generateArray(contexts);
	      }
	
	      if (this.options.data) {
	        options.data = 'data';
	      }
	      if (this.useBlockParams) {
	        options.blockParams = 'blockParams';
	      }
	      return options;
	    },
	
	    setupHelperArgs: function(helper, paramSize, params, useRegister) {
	      var options = this.setupParams(helper, paramSize, params, true);
	      options = this.objectLiteral(options);
	      if (useRegister) {
	        this.useRegister('options');
	        params.push('options');
	        return ['options=', options];
	      } else {
	        params.push(options);
	        return '';
	      }
	    }
	  };
	
	
	  var reservedWords = (
	    "break else new var" +
	    " case finally return void" +
	    " catch for switch while" +
	    " continue function this with" +
	    " default if throw" +
	    " delete in try" +
	    " do instanceof typeof" +
	    " abstract enum int short" +
	    " boolean export interface static" +
	    " byte extends long super" +
	    " char final native synchronized" +
	    " class float package throws" +
	    " const goto private transient" +
	    " debugger implements protected volatile" +
	    " double import public let yield await" +
	    " null true false"
	  ).split(" ");
	
	  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
	
	  for(var i=0, l=reservedWords.length; i<l; i++) {
	    compilerWords[reservedWords[i]] = true;
	  }
	
	  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
	    return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
	  };
	
	  function strictLookup(requireTerminal, compiler, parts, type) {
	    var stack = compiler.popStack();
	
	    var i = 0,
	        len = parts.length;
	    if (requireTerminal) {
	      len--;
	    }
	
	    for (; i < len; i++) {
	      stack = compiler.nameLookup(stack, parts[i], type);
	    }
	
	    if (requireTerminal) {
	      return [compiler.aliasable('this.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
	    } else {
	      return stack;
	    }
	  }
	
	  __exports__ = JavaScriptCompiler;
	  return __exports__;
	})(__module2__, __module4__, __module3__, __module15__);
	
	// handlebars.js
	var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
	  "use strict";
	  var __exports__;
	  /*globals Handlebars: true */
	  var Handlebars = __dependency1__;
	
	  // Compiler imports
	  var AST = __dependency2__;
	  var Parser = __dependency3__.parser;
	  var parse = __dependency3__.parse;
	  var Compiler = __dependency4__.Compiler;
	  var compile = __dependency4__.compile;
	  var precompile = __dependency4__.precompile;
	  var JavaScriptCompiler = __dependency5__;
	
	  var _create = Handlebars.create;
	  var create = function() {
	    var hb = _create();
	
	    hb.compile = function(input, options) {
	      return compile(input, options, hb);
	    };
	    hb.precompile = function (input, options) {
	      return precompile(input, options, hb);
	    };
	
	    hb.AST = AST;
	    hb.Compiler = Compiler;
	    hb.JavaScriptCompiler = JavaScriptCompiler;
	    hb.Parser = Parser;
	    hb.parse = parse;
	
	    return hb;
	  };
	
	  Handlebars = create();
	  Handlebars.create = create;
	
	  /*jshint -W040 */
	  /* istanbul ignore next */
	  var root = typeof global !== 'undefined' ? global : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function() {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	  };
	
	  Handlebars['default'] = Handlebars;
	
	  __exports__ = Handlebars;
	  return __exports__;
	})(__module1__, __module7__, __module8__, __module13__, __module14__);
	
	  return __module0__;
	}));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * Copyright 2009-2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE.txt or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	exports.SourceMapGenerator = __webpack_require__(13).SourceMapGenerator;
	exports.SourceMapConsumer = __webpack_require__(19).SourceMapConsumer;
	exports.SourceNode = __webpack_require__(22).SourceNode;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  var base64VLQ = __webpack_require__(14);
	  var util = __webpack_require__(16);
	  var ArraySet = __webpack_require__(17).ArraySet;
	  var MappingList = __webpack_require__(18).MappingList;
	
	  /**
	   * An instance of the SourceMapGenerator represents a source map which is
	   * being built incrementally. You may pass an object with the following
	   * properties:
	   *
	   *   - file: The filename of the generated source.
	   *   - sourceRoot: A root for all relative URLs in this source map.
	   */
	  function SourceMapGenerator(aArgs) {
	    if (!aArgs) {
	      aArgs = {};
	    }
	    this._file = util.getArg(aArgs, 'file', null);
	    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
	    this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
	    this._sources = new ArraySet();
	    this._names = new ArraySet();
	    this._mappings = new MappingList();
	    this._sourcesContents = null;
	  }
	
	  SourceMapGenerator.prototype._version = 3;
	
	  /**
	   * Creates a new SourceMapGenerator based on a SourceMapConsumer
	   *
	   * @param aSourceMapConsumer The SourceMap.
	   */
	  SourceMapGenerator.fromSourceMap =
	    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
	      var sourceRoot = aSourceMapConsumer.sourceRoot;
	      var generator = new SourceMapGenerator({
	        file: aSourceMapConsumer.file,
	        sourceRoot: sourceRoot
	      });
	      aSourceMapConsumer.eachMapping(function (mapping) {
	        var newMapping = {
	          generated: {
	            line: mapping.generatedLine,
	            column: mapping.generatedColumn
	          }
	        };
	
	        if (mapping.source != null) {
	          newMapping.source = mapping.source;
	          if (sourceRoot != null) {
	            newMapping.source = util.relative(sourceRoot, newMapping.source);
	          }
	
	          newMapping.original = {
	            line: mapping.originalLine,
	            column: mapping.originalColumn
	          };
	
	          if (mapping.name != null) {
	            newMapping.name = mapping.name;
	          }
	        }
	
	        generator.addMapping(newMapping);
	      });
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content != null) {
	          generator.setSourceContent(sourceFile, content);
	        }
	      });
	      return generator;
	    };
	
	  /**
	   * Add a single mapping from original source line and column to the generated
	   * source's line and column for this source map being created. The mapping
	   * object should have the following properties:
	   *
	   *   - generated: An object with the generated line and column positions.
	   *   - original: An object with the original line and column positions.
	   *   - source: The original source file (relative to the sourceRoot).
	   *   - name: An optional original token name for this mapping.
	   */
	  SourceMapGenerator.prototype.addMapping =
	    function SourceMapGenerator_addMapping(aArgs) {
	      var generated = util.getArg(aArgs, 'generated');
	      var original = util.getArg(aArgs, 'original', null);
	      var source = util.getArg(aArgs, 'source', null);
	      var name = util.getArg(aArgs, 'name', null);
	
	      if (!this._skipValidation) {
	        this._validateMapping(generated, original, source, name);
	      }
	
	      if (source != null && !this._sources.has(source)) {
	        this._sources.add(source);
	      }
	
	      if (name != null && !this._names.has(name)) {
	        this._names.add(name);
	      }
	
	      this._mappings.add({
	        generatedLine: generated.line,
	        generatedColumn: generated.column,
	        originalLine: original != null && original.line,
	        originalColumn: original != null && original.column,
	        source: source,
	        name: name
	      });
	    };
	
	  /**
	   * Set the source content for a source file.
	   */
	  SourceMapGenerator.prototype.setSourceContent =
	    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
	      var source = aSourceFile;
	      if (this._sourceRoot != null) {
	        source = util.relative(this._sourceRoot, source);
	      }
	
	      if (aSourceContent != null) {
	        // Add the source content to the _sourcesContents map.
	        // Create a new _sourcesContents map if the property is null.
	        if (!this._sourcesContents) {
	          this._sourcesContents = {};
	        }
	        this._sourcesContents[util.toSetString(source)] = aSourceContent;
	      } else if (this._sourcesContents) {
	        // Remove the source file from the _sourcesContents map.
	        // If the _sourcesContents map is empty, set the property to null.
	        delete this._sourcesContents[util.toSetString(source)];
	        if (Object.keys(this._sourcesContents).length === 0) {
	          this._sourcesContents = null;
	        }
	      }
	    };
	
	  /**
	   * Applies the mappings of a sub-source-map for a specific source file to the
	   * source map being generated. Each mapping to the supplied source file is
	   * rewritten using the supplied source map. Note: The resolution for the
	   * resulting mappings is the minimium of this map and the supplied map.
	   *
	   * @param aSourceMapConsumer The source map to be applied.
	   * @param aSourceFile Optional. The filename of the source file.
	   *        If omitted, SourceMapConsumer's file property will be used.
	   * @param aSourceMapPath Optional. The dirname of the path to the source map
	   *        to be applied. If relative, it is relative to the SourceMapConsumer.
	   *        This parameter is needed when the two source maps aren't in the same
	   *        directory, and the source map to be applied contains relative source
	   *        paths. If so, those relative source paths need to be rewritten
	   *        relative to the SourceMapGenerator.
	   */
	  SourceMapGenerator.prototype.applySourceMap =
	    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
	      var sourceFile = aSourceFile;
	      // If aSourceFile is omitted, we will use the file property of the SourceMap
	      if (aSourceFile == null) {
	        if (aSourceMapConsumer.file == null) {
	          throw new Error(
	            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
	            'or the source map\'s "file" property. Both were omitted.'
	          );
	        }
	        sourceFile = aSourceMapConsumer.file;
	      }
	      var sourceRoot = this._sourceRoot;
	      // Make "sourceFile" relative if an absolute Url is passed.
	      if (sourceRoot != null) {
	        sourceFile = util.relative(sourceRoot, sourceFile);
	      }
	      // Applying the SourceMap can add and remove items from the sources and
	      // the names array.
	      var newSources = new ArraySet();
	      var newNames = new ArraySet();
	
	      // Find mappings for the "sourceFile"
	      this._mappings.unsortedForEach(function (mapping) {
	        if (mapping.source === sourceFile && mapping.originalLine != null) {
	          // Check if it can be mapped by the source map, then update the mapping.
	          var original = aSourceMapConsumer.originalPositionFor({
	            line: mapping.originalLine,
	            column: mapping.originalColumn
	          });
	          if (original.source != null) {
	            // Copy mapping
	            mapping.source = original.source;
	            if (aSourceMapPath != null) {
	              mapping.source = util.join(aSourceMapPath, mapping.source)
	            }
	            if (sourceRoot != null) {
	              mapping.source = util.relative(sourceRoot, mapping.source);
	            }
	            mapping.originalLine = original.line;
	            mapping.originalColumn = original.column;
	            if (original.name != null) {
	              mapping.name = original.name;
	            }
	          }
	        }
	
	        var source = mapping.source;
	        if (source != null && !newSources.has(source)) {
	          newSources.add(source);
	        }
	
	        var name = mapping.name;
	        if (name != null && !newNames.has(name)) {
	          newNames.add(name);
	        }
	
	      }, this);
	      this._sources = newSources;
	      this._names = newNames;
	
	      // Copy sourcesContents of applied map.
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content != null) {
	          if (aSourceMapPath != null) {
	            sourceFile = util.join(aSourceMapPath, sourceFile);
	          }
	          if (sourceRoot != null) {
	            sourceFile = util.relative(sourceRoot, sourceFile);
	          }
	          this.setSourceContent(sourceFile, content);
	        }
	      }, this);
	    };
	
	  /**
	   * A mapping can have one of the three levels of data:
	   *
	   *   1. Just the generated position.
	   *   2. The Generated position, original position, and original source.
	   *   3. Generated and original position, original source, as well as a name
	   *      token.
	   *
	   * To maintain consistency, we validate that any new mapping being added falls
	   * in to one of these categories.
	   */
	  SourceMapGenerator.prototype._validateMapping =
	    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
	                                                aName) {
	      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	          && aGenerated.line > 0 && aGenerated.column >= 0
	          && !aOriginal && !aSource && !aName) {
	        // Case 1.
	        return;
	      }
	      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
	               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
	               && aGenerated.line > 0 && aGenerated.column >= 0
	               && aOriginal.line > 0 && aOriginal.column >= 0
	               && aSource) {
	        // Cases 2 and 3.
	        return;
	      }
	      else {
	        throw new Error('Invalid mapping: ' + JSON.stringify({
	          generated: aGenerated,
	          source: aSource,
	          original: aOriginal,
	          name: aName
	        }));
	      }
	    };
	
	  /**
	   * Serialize the accumulated mappings in to the stream of base 64 VLQs
	   * specified by the source map format.
	   */
	  SourceMapGenerator.prototype._serializeMappings =
	    function SourceMapGenerator_serializeMappings() {
	      var previousGeneratedColumn = 0;
	      var previousGeneratedLine = 1;
	      var previousOriginalColumn = 0;
	      var previousOriginalLine = 0;
	      var previousName = 0;
	      var previousSource = 0;
	      var result = '';
	      var mapping;
	      var nameIdx;
	      var sourceIdx;
	
	      var mappings = this._mappings.toArray();
	      for (var i = 0, len = mappings.length; i < len; i++) {
	        mapping = mappings[i];
	
	        if (mapping.generatedLine !== previousGeneratedLine) {
	          previousGeneratedColumn = 0;
	          while (mapping.generatedLine !== previousGeneratedLine) {
	            result += ';';
	            previousGeneratedLine++;
	          }
	        }
	        else {
	          if (i > 0) {
	            if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
	              continue;
	            }
	            result += ',';
	          }
	        }
	
	        result += base64VLQ.encode(mapping.generatedColumn
	                                   - previousGeneratedColumn);
	        previousGeneratedColumn = mapping.generatedColumn;
	
	        if (mapping.source != null) {
	          sourceIdx = this._sources.indexOf(mapping.source);
	          result += base64VLQ.encode(sourceIdx - previousSource);
	          previousSource = sourceIdx;
	
	          // lines are stored 0-based in SourceMap spec version 3
	          result += base64VLQ.encode(mapping.originalLine - 1
	                                     - previousOriginalLine);
	          previousOriginalLine = mapping.originalLine - 1;
	
	          result += base64VLQ.encode(mapping.originalColumn
	                                     - previousOriginalColumn);
	          previousOriginalColumn = mapping.originalColumn;
	
	          if (mapping.name != null) {
	            nameIdx = this._names.indexOf(mapping.name);
	            result += base64VLQ.encode(nameIdx - previousName);
	            previousName = nameIdx;
	          }
	        }
	      }
	
	      return result;
	    };
	
	  SourceMapGenerator.prototype._generateSourcesContent =
	    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
	      return aSources.map(function (source) {
	        if (!this._sourcesContents) {
	          return null;
	        }
	        if (aSourceRoot != null) {
	          source = util.relative(aSourceRoot, source);
	        }
	        var key = util.toSetString(source);
	        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
	                                                    key)
	          ? this._sourcesContents[key]
	          : null;
	      }, this);
	    };
	
	  /**
	   * Externalize the source map.
	   */
	  SourceMapGenerator.prototype.toJSON =
	    function SourceMapGenerator_toJSON() {
	      var map = {
	        version: this._version,
	        sources: this._sources.toArray(),
	        names: this._names.toArray(),
	        mappings: this._serializeMappings()
	      };
	      if (this._file != null) {
	        map.file = this._file;
	      }
	      if (this._sourceRoot != null) {
	        map.sourceRoot = this._sourceRoot;
	      }
	      if (this._sourcesContents) {
	        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
	      }
	
	      return map;
	    };
	
	  /**
	   * Render the source map being generated to a string.
	   */
	  SourceMapGenerator.prototype.toString =
	    function SourceMapGenerator_toString() {
	      return JSON.stringify(this.toJSON());
	    };
	
	  exports.SourceMapGenerator = SourceMapGenerator;
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 *
	 * Based on the Base 64 VLQ implementation in Closure Compiler:
	 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
	 *
	 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions are
	 * met:
	 *
	 *  * Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 *  * Redistributions in binary form must reproduce the above
	 *    copyright notice, this list of conditions and the following
	 *    disclaimer in the documentation and/or other materials provided
	 *    with the distribution.
	 *  * Neither the name of Google Inc. nor the names of its
	 *    contributors may be used to endorse or promote products derived
	 *    from this software without specific prior written permission.
	 *
	 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	{
	  var base64 = __webpack_require__(15);
	
	  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
	  // length quantities we use in the source map spec, the first bit is the sign,
	  // the next four bits are the actual value, and the 6th bit is the
	  // continuation bit. The continuation bit tells us whether there are more
	  // digits in this value following this digit.
	  //
	  //   Continuation
	  //   |    Sign
	  //   |    |
	  //   V    V
	  //   101011
	
	  var VLQ_BASE_SHIFT = 5;
	
	  // binary: 100000
	  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
	
	  // binary: 011111
	  var VLQ_BASE_MASK = VLQ_BASE - 1;
	
	  // binary: 100000
	  var VLQ_CONTINUATION_BIT = VLQ_BASE;
	
	  /**
	   * Converts from a two-complement value to a value where the sign bit is
	   * placed in the least significant bit.  For example, as decimals:
	   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
	   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
	   */
	  function toVLQSigned(aValue) {
	    return aValue < 0
	      ? ((-aValue) << 1) + 1
	      : (aValue << 1) + 0;
	  }
	
	  /**
	   * Converts to a two-complement value from a value where the sign bit is
	   * placed in the least significant bit.  For example, as decimals:
	   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
	   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
	   */
	  function fromVLQSigned(aValue) {
	    var isNegative = (aValue & 1) === 1;
	    var shifted = aValue >> 1;
	    return isNegative
	      ? -shifted
	      : shifted;
	  }
	
	  /**
	   * Returns the base 64 VLQ encoded value.
	   */
	  exports.encode = function base64VLQ_encode(aValue) {
	    var encoded = "";
	    var digit;
	
	    var vlq = toVLQSigned(aValue);
	
	    do {
	      digit = vlq & VLQ_BASE_MASK;
	      vlq >>>= VLQ_BASE_SHIFT;
	      if (vlq > 0) {
	        // There are still more digits in this value, so we must make sure the
	        // continuation bit is marked.
	        digit |= VLQ_CONTINUATION_BIT;
	      }
	      encoded += base64.encode(digit);
	    } while (vlq > 0);
	
	    return encoded;
	  };
	
	  /**
	   * Decodes the next base 64 VLQ value from the given string and returns the
	   * value and the rest of the string via the out parameter.
	   */
	  exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
	    var strLen = aStr.length;
	    var result = 0;
	    var shift = 0;
	    var continuation, digit;
	
	    do {
	      if (aIndex >= strLen) {
	        throw new Error("Expected more digits in base 64 VLQ value.");
	      }
	
	      digit = base64.decode(aStr.charCodeAt(aIndex++));
	      if (digit === -1) {
	        throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
	      }
	
	      continuation = !!(digit & VLQ_CONTINUATION_BIT);
	      digit &= VLQ_BASE_MASK;
	      result = result + (digit << shift);
	      shift += VLQ_BASE_SHIFT;
	    } while (continuation);
	
	    aOutParam.value = fromVLQSigned(result);
	    aOutParam.rest = aIndex;
	  };
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
	
	  /**
	   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
	   */
	  exports.encode = function (number) {
	    if (0 <= number && number < intToCharMap.length) {
	      return intToCharMap[number];
	    }
	    throw new TypeError("Must be between 0 and 63: " + number);
	  };
	
	  /**
	   * Decode a single base 64 character code digit to an integer. Returns -1 on
	   * failure.
	   */
	  exports.decode = function (charCode) {
	    var bigA = 65;     // 'A'
	    var bigZ = 90;     // 'Z'
	
	    var littleA = 97;  // 'a'
	    var littleZ = 122; // 'z'
	
	    var zero = 48;     // '0'
	    var nine = 57;     // '9'
	
	    var plus = 43;     // '+'
	    var slash = 47;    // '/'
	
	    var littleOffset = 26;
	    var numberOffset = 52;
	
	    // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
	    if (bigA <= charCode && charCode <= bigZ) {
	      return (charCode - bigA);
	    }
	
	    // 26 - 51: abcdefghijklmnopqrstuvwxyz
	    if (littleA <= charCode && charCode <= littleZ) {
	      return (charCode - littleA + littleOffset);
	    }
	
	    // 52 - 61: 0123456789
	    if (zero <= charCode && charCode <= nine) {
	      return (charCode - zero + numberOffset);
	    }
	
	    // 62: +
	    if (charCode == plus) {
	      return 62;
	    }
	
	    // 63: /
	    if (charCode == slash) {
	      return 63;
	    }
	
	    // Invalid base64 digit.
	    return -1;
	  };
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  /**
	   * This is a helper function for getting values from parameter/options
	   * objects.
	   *
	   * @param args The object we are extracting values from
	   * @param name The name of the property we are getting.
	   * @param defaultValue An optional value to return if the property is missing
	   * from the object. If this is not specified and the property is missing, an
	   * error will be thrown.
	   */
	  function getArg(aArgs, aName, aDefaultValue) {
	    if (aName in aArgs) {
	      return aArgs[aName];
	    } else if (arguments.length === 3) {
	      return aDefaultValue;
	    } else {
	      throw new Error('"' + aName + '" is a required argument.');
	    }
	  }
	  exports.getArg = getArg;
	
	  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
	  var dataUrlRegexp = /^data:.+\,.+$/;
	
	  function urlParse(aUrl) {
	    var match = aUrl.match(urlRegexp);
	    if (!match) {
	      return null;
	    }
	    return {
	      scheme: match[1],
	      auth: match[2],
	      host: match[3],
	      port: match[4],
	      path: match[5]
	    };
	  }
	  exports.urlParse = urlParse;
	
	  function urlGenerate(aParsedUrl) {
	    var url = '';
	    if (aParsedUrl.scheme) {
	      url += aParsedUrl.scheme + ':';
	    }
	    url += '//';
	    if (aParsedUrl.auth) {
	      url += aParsedUrl.auth + '@';
	    }
	    if (aParsedUrl.host) {
	      url += aParsedUrl.host;
	    }
	    if (aParsedUrl.port) {
	      url += ":" + aParsedUrl.port
	    }
	    if (aParsedUrl.path) {
	      url += aParsedUrl.path;
	    }
	    return url;
	  }
	  exports.urlGenerate = urlGenerate;
	
	  /**
	   * Normalizes a path, or the path portion of a URL:
	   *
	   * - Replaces consequtive slashes with one slash.
	   * - Removes unnecessary '.' parts.
	   * - Removes unnecessary '<dir>/..' parts.
	   *
	   * Based on code in the Node.js 'path' core module.
	   *
	   * @param aPath The path or url to normalize.
	   */
	  function normalize(aPath) {
	    var path = aPath;
	    var url = urlParse(aPath);
	    if (url) {
	      if (!url.path) {
	        return aPath;
	      }
	      path = url.path;
	    }
	    var isAbsolute = exports.isAbsolute(path);
	
	    var parts = path.split(/\/+/);
	    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
	      part = parts[i];
	      if (part === '.') {
	        parts.splice(i, 1);
	      } else if (part === '..') {
	        up++;
	      } else if (up > 0) {
	        if (part === '') {
	          // The first part is blank if the path is absolute. Trying to go
	          // above the root is a no-op. Therefore we can remove all '..' parts
	          // directly after the root.
	          parts.splice(i + 1, up);
	          up = 0;
	        } else {
	          parts.splice(i, 2);
	          up--;
	        }
	      }
	    }
	    path = parts.join('/');
	
	    if (path === '') {
	      path = isAbsolute ? '/' : '.';
	    }
	
	    if (url) {
	      url.path = path;
	      return urlGenerate(url);
	    }
	    return path;
	  }
	  exports.normalize = normalize;
	
	  /**
	   * Joins two paths/URLs.
	   *
	   * @param aRoot The root path or URL.
	   * @param aPath The path or URL to be joined with the root.
	   *
	   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
	   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
	   *   first.
	   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
	   *   is updated with the result and aRoot is returned. Otherwise the result
	   *   is returned.
	   *   - If aPath is absolute, the result is aPath.
	   *   - Otherwise the two paths are joined with a slash.
	   * - Joining for example 'http://' and 'www.example.com' is also supported.
	   */
	  function join(aRoot, aPath) {
	    if (aRoot === "") {
	      aRoot = ".";
	    }
	    if (aPath === "") {
	      aPath = ".";
	    }
	    var aPathUrl = urlParse(aPath);
	    var aRootUrl = urlParse(aRoot);
	    if (aRootUrl) {
	      aRoot = aRootUrl.path || '/';
	    }
	
	    // `join(foo, '//www.example.org')`
	    if (aPathUrl && !aPathUrl.scheme) {
	      if (aRootUrl) {
	        aPathUrl.scheme = aRootUrl.scheme;
	      }
	      return urlGenerate(aPathUrl);
	    }
	
	    if (aPathUrl || aPath.match(dataUrlRegexp)) {
	      return aPath;
	    }
	
	    // `join('http://', 'www.example.com')`
	    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
	      aRootUrl.host = aPath;
	      return urlGenerate(aRootUrl);
	    }
	
	    var joined = aPath.charAt(0) === '/'
	      ? aPath
	      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);
	
	    if (aRootUrl) {
	      aRootUrl.path = joined;
	      return urlGenerate(aRootUrl);
	    }
	    return joined;
	  }
	  exports.join = join;
	
	  exports.isAbsolute = function (aPath) {
	    return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
	  };
	
	  /**
	   * Make a path relative to a URL or another path.
	   *
	   * @param aRoot The root path or URL.
	   * @param aPath The path or URL to be made relative to aRoot.
	   */
	  function relative(aRoot, aPath) {
	    if (aRoot === "") {
	      aRoot = ".";
	    }
	
	    aRoot = aRoot.replace(/\/$/, '');
	
	    // It is possible for the path to be above the root. In this case, simply
	    // checking whether the root is a prefix of the path won't work. Instead, we
	    // need to remove components from the root one by one, until either we find
	    // a prefix that fits, or we run out of components to remove.
	    var level = 0;
	    while (aPath.indexOf(aRoot + '/') !== 0) {
	      var index = aRoot.lastIndexOf("/");
	      if (index < 0) {
	        return aPath;
	      }
	
	      // If the only part of the root that is left is the scheme (i.e. http://,
	      // file:///, etc.), one or more slashes (/), or simply nothing at all, we
	      // have exhausted all components, so the path is not relative to the root.
	      aRoot = aRoot.slice(0, index);
	      if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
	        return aPath;
	      }
	
	      ++level;
	    }
	
	    // Make sure we add a "../" for each component we removed from the root.
	    return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
	  }
	  exports.relative = relative;
	
	  /**
	   * Because behavior goes wacky when you set `__proto__` on objects, we
	   * have to prefix all the strings in our set with an arbitrary character.
	   *
	   * See https://github.com/mozilla/source-map/pull/31 and
	   * https://github.com/mozilla/source-map/issues/30
	   *
	   * @param String aStr
	   */
	  function toSetString(aStr) {
	    return '$' + aStr;
	  }
	  exports.toSetString = toSetString;
	
	  function fromSetString(aStr) {
	    return aStr.substr(1);
	  }
	  exports.fromSetString = fromSetString;
	
	  /**
	   * Comparator between two mappings where the original positions are compared.
	   *
	   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	   * mappings with the same original source/line/column, but different generated
	   * line and column the same. Useful when searching for a mapping with a
	   * stubbed out mapping.
	   */
	  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
	    var cmp = mappingA.source - mappingB.source;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp !== 0 || onlyCompareOriginal) {
	      return cmp;
	    }
	
	    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    return mappingA.name - mappingB.name;
	  }
	  exports.compareByOriginalPositions = compareByOriginalPositions;
	
	  /**
	   * Comparator between two mappings with deflated source and name indices where
	   * the generated positions are compared.
	   *
	   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
	   * mappings with the same generated line and column, but different
	   * source/name/original line and column the same. Useful when searching for a
	   * mapping with a stubbed out mapping.
	   */
	  function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
	    var cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	    if (cmp !== 0 || onlyCompareGenerated) {
	      return cmp;
	    }
	
	    cmp = mappingA.source - mappingB.source;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    return mappingA.name - mappingB.name;
	  }
	  exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
	
	  function strcmp(aStr1, aStr2) {
	    if (aStr1 === aStr2) {
	      return 0;
	    }
	
	    if (aStr1 > aStr2) {
	      return 1;
	    }
	
	    return -1;
	  }
	
	  /**
	   * Comparator between two mappings with inflated source and name strings where
	   * the generated positions are compared.
	   */
	  function compareByGeneratedPositionsInflated(mappingA, mappingB) {
	    var cmp = mappingA.generatedLine - mappingB.generatedLine;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = strcmp(mappingA.source, mappingB.source);
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalLine - mappingB.originalLine;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    cmp = mappingA.originalColumn - mappingB.originalColumn;
	    if (cmp !== 0) {
	      return cmp;
	    }
	
	    return strcmp(mappingA.name, mappingB.name);
	  }
	  exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  var util = __webpack_require__(16);
	
	  /**
	   * A data structure which is a combination of an array and a set. Adding a new
	   * member is O(1), testing for membership is O(1), and finding the index of an
	   * element is O(1). Removing elements from the set is not supported. Only
	   * strings are supported for membership.
	   */
	  function ArraySet() {
	    this._array = [];
	    this._set = {};
	  }
	
	  /**
	   * Static method for creating ArraySet instances from an existing array.
	   */
	  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
	    var set = new ArraySet();
	    for (var i = 0, len = aArray.length; i < len; i++) {
	      set.add(aArray[i], aAllowDuplicates);
	    }
	    return set;
	  };
	
	  /**
	   * Return how many unique items are in this ArraySet. If duplicates have been
	   * added, than those do not count towards the size.
	   *
	   * @returns Number
	   */
	  ArraySet.prototype.size = function ArraySet_size() {
	    return Object.getOwnPropertyNames(this._set).length;
	  };
	
	  /**
	   * Add the given string to this set.
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
	    var sStr = util.toSetString(aStr);
	    var isDuplicate = this._set.hasOwnProperty(sStr);
	    var idx = this._array.length;
	    if (!isDuplicate || aAllowDuplicates) {
	      this._array.push(aStr);
	    }
	    if (!isDuplicate) {
	      this._set[sStr] = idx;
	    }
	  };
	
	  /**
	   * Is the given string a member of this set?
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.has = function ArraySet_has(aStr) {
	    var sStr = util.toSetString(aStr);
	    return this._set.hasOwnProperty(sStr);
	  };
	
	  /**
	   * What is the index of the given string in the array?
	   *
	   * @param String aStr
	   */
	  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
	    var sStr = util.toSetString(aStr);
	    if (this._set.hasOwnProperty(sStr)) {
	      return this._set[sStr];
	    }
	    throw new Error('"' + aStr + '" is not in the set.');
	  };
	
	  /**
	   * What is the element at the given index?
	   *
	   * @param Number aIdx
	   */
	  ArraySet.prototype.at = function ArraySet_at(aIdx) {
	    if (aIdx >= 0 && aIdx < this._array.length) {
	      return this._array[aIdx];
	    }
	    throw new Error('No element indexed by ' + aIdx);
	  };
	
	  /**
	   * Returns the array representation of this set (which has the proper indices
	   * indicated by indexOf). Note that this is a copy of the internal array used
	   * for storing the members so that no one can mess with internal state.
	   */
	  ArraySet.prototype.toArray = function ArraySet_toArray() {
	    return this._array.slice();
	  };
	
	  exports.ArraySet = ArraySet;
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2014 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  var util = __webpack_require__(16);
	
	  /**
	   * Determine whether mappingB is after mappingA with respect to generated
	   * position.
	   */
	  function generatedPositionAfter(mappingA, mappingB) {
	    // Optimized for most common case
	    var lineA = mappingA.generatedLine;
	    var lineB = mappingB.generatedLine;
	    var columnA = mappingA.generatedColumn;
	    var columnB = mappingB.generatedColumn;
	    return lineB > lineA || lineB == lineA && columnB >= columnA ||
	           util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
	  }
	
	  /**
	   * A data structure to provide a sorted view of accumulated mappings in a
	   * performance conscious manner. It trades a neglibable overhead in general
	   * case for a large speedup in case of mappings being added in order.
	   */
	  function MappingList() {
	    this._array = [];
	    this._sorted = true;
	    // Serves as infimum
	    this._last = {generatedLine: -1, generatedColumn: 0};
	  }
	
	  /**
	   * Iterate through internal items. This method takes the same arguments that
	   * `Array.prototype.forEach` takes.
	   *
	   * NOTE: The order of the mappings is NOT guaranteed.
	   */
	  MappingList.prototype.unsortedForEach =
	    function MappingList_forEach(aCallback, aThisArg) {
	      this._array.forEach(aCallback, aThisArg);
	    };
	
	  /**
	   * Add the given source mapping.
	   *
	   * @param Object aMapping
	   */
	  MappingList.prototype.add = function MappingList_add(aMapping) {
	    if (generatedPositionAfter(this._last, aMapping)) {
	      this._last = aMapping;
	      this._array.push(aMapping);
	    } else {
	      this._sorted = false;
	      this._array.push(aMapping);
	    }
	  };
	
	  /**
	   * Returns the flat, sorted array of mappings. The mappings are sorted by
	   * generated position.
	   *
	   * WARNING: This method returns internal data without copying, for
	   * performance. The return value must NOT be mutated, and should be treated as
	   * an immutable borrow. If you want to take ownership, you must make your own
	   * copy.
	   */
	  MappingList.prototype.toArray = function MappingList_toArray() {
	    if (!this._sorted) {
	      this._array.sort(util.compareByGeneratedPositionsInflated);
	      this._sorted = true;
	    }
	    return this._array;
	  };
	
	  exports.MappingList = MappingList;
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  var util = __webpack_require__(16);
	  var binarySearch = __webpack_require__(20);
	  var ArraySet = __webpack_require__(17).ArraySet;
	  var base64VLQ = __webpack_require__(14);
	  var quickSort = __webpack_require__(21).quickSort;
	
	  function SourceMapConsumer(aSourceMap) {
	    var sourceMap = aSourceMap;
	    if (typeof aSourceMap === 'string') {
	      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
	    }
	
	    return sourceMap.sections != null
	      ? new IndexedSourceMapConsumer(sourceMap)
	      : new BasicSourceMapConsumer(sourceMap);
	  }
	
	  SourceMapConsumer.fromSourceMap = function(aSourceMap) {
	    return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
	  }
	
	  /**
	   * The version of the source mapping spec that we are consuming.
	   */
	  SourceMapConsumer.prototype._version = 3;
	
	  // `__generatedMappings` and `__originalMappings` are arrays that hold the
	  // parsed mapping coordinates from the source map's "mappings" attribute. They
	  // are lazily instantiated, accessed via the `_generatedMappings` and
	  // `_originalMappings` getters respectively, and we only parse the mappings
	  // and create these arrays once queried for a source location. We jump through
	  // these hoops because there can be many thousands of mappings, and parsing
	  // them is expensive, so we only want to do it if we must.
	  //
	  // Each object in the arrays is of the form:
	  //
	  //     {
	  //       generatedLine: The line number in the generated code,
	  //       generatedColumn: The column number in the generated code,
	  //       source: The path to the original source file that generated this
	  //               chunk of code,
	  //       originalLine: The line number in the original source that
	  //                     corresponds to this chunk of generated code,
	  //       originalColumn: The column number in the original source that
	  //                       corresponds to this chunk of generated code,
	  //       name: The name of the original symbol which generated this chunk of
	  //             code.
	  //     }
	  //
	  // All properties except for `generatedLine` and `generatedColumn` can be
	  // `null`.
	  //
	  // `_generatedMappings` is ordered by the generated positions.
	  //
	  // `_originalMappings` is ordered by the original positions.
	
	  SourceMapConsumer.prototype.__generatedMappings = null;
	  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
	    get: function () {
	      if (!this.__generatedMappings) {
	        this._parseMappings(this._mappings, this.sourceRoot);
	      }
	
	      return this.__generatedMappings;
	    }
	  });
	
	  SourceMapConsumer.prototype.__originalMappings = null;
	  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
	    get: function () {
	      if (!this.__originalMappings) {
	        this._parseMappings(this._mappings, this.sourceRoot);
	      }
	
	      return this.__originalMappings;
	    }
	  });
	
	  SourceMapConsumer.prototype._charIsMappingSeparator =
	    function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
	      var c = aStr.charAt(index);
	      return c === ";" || c === ",";
	    };
	
	  /**
	   * Parse the mappings in a string in to a data structure which we can easily
	   * query (the ordered arrays in the `this.__generatedMappings` and
	   * `this.__originalMappings` properties).
	   */
	  SourceMapConsumer.prototype._parseMappings =
	    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	      throw new Error("Subclasses must implement _parseMappings");
	    };
	
	  SourceMapConsumer.GENERATED_ORDER = 1;
	  SourceMapConsumer.ORIGINAL_ORDER = 2;
	
	  SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
	  SourceMapConsumer.LEAST_UPPER_BOUND = 2;
	
	  /**
	   * Iterate over each mapping between an original source/line/column and a
	   * generated line/column in this source map.
	   *
	   * @param Function aCallback
	   *        The function that is called with each mapping.
	   * @param Object aContext
	   *        Optional. If specified, this object will be the value of `this` every
	   *        time that `aCallback` is called.
	   * @param aOrder
	   *        Either `SourceMapConsumer.GENERATED_ORDER` or
	   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
	   *        iterate over the mappings sorted by the generated file's line/column
	   *        order or the original's source/line/column order, respectively. Defaults to
	   *        `SourceMapConsumer.GENERATED_ORDER`.
	   */
	  SourceMapConsumer.prototype.eachMapping =
	    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
	      var context = aContext || null;
	      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
	
	      var mappings;
	      switch (order) {
	      case SourceMapConsumer.GENERATED_ORDER:
	        mappings = this._generatedMappings;
	        break;
	      case SourceMapConsumer.ORIGINAL_ORDER:
	        mappings = this._originalMappings;
	        break;
	      default:
	        throw new Error("Unknown order of iteration.");
	      }
	
	      var sourceRoot = this.sourceRoot;
	      mappings.map(function (mapping) {
	        var source = mapping.source === null ? null : this._sources.at(mapping.source);
	        if (source != null && sourceRoot != null) {
	          source = util.join(sourceRoot, source);
	        }
	        return {
	          source: source,
	          generatedLine: mapping.generatedLine,
	          generatedColumn: mapping.generatedColumn,
	          originalLine: mapping.originalLine,
	          originalColumn: mapping.originalColumn,
	          name: mapping.name === null ? null : this._names.at(mapping.name)
	        };
	      }, this).forEach(aCallback, context);
	    };
	
	  /**
	   * Returns all generated line and column information for the original source,
	   * line, and column provided. If no column is provided, returns all mappings
	   * corresponding to a either the line we are searching for or the next
	   * closest line that has any mappings. Otherwise, returns all mappings
	   * corresponding to the given line and either the column we are searching for
	   * or the next closest column that has any offsets.
	   *
	   * The only argument is an object with the following properties:
	   *
	   *   - source: The filename of the original source.
	   *   - line: The line number in the original source.
	   *   - column: Optional. the column number in the original source.
	   *
	   * and an array of objects is returned, each with the following properties:
	   *
	   *   - line: The line number in the generated source, or null.
	   *   - column: The column number in the generated source, or null.
	   */
	  SourceMapConsumer.prototype.allGeneratedPositionsFor =
	    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
	      var line = util.getArg(aArgs, 'line');
	
	      // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
	      // returns the index of the closest mapping less than the needle. By
	      // setting needle.originalColumn to 0, we thus find the last mapping for
	      // the given line, provided such a mapping exists.
	      var needle = {
	        source: util.getArg(aArgs, 'source'),
	        originalLine: line,
	        originalColumn: util.getArg(aArgs, 'column', 0)
	      };
	
	      if (this.sourceRoot != null) {
	        needle.source = util.relative(this.sourceRoot, needle.source);
	      }
	      if (!this._sources.has(needle.source)) {
	        return [];
	      }
	      needle.source = this._sources.indexOf(needle.source);
	
	      var mappings = [];
	
	      var index = this._findMapping(needle,
	                                    this._originalMappings,
	                                    "originalLine",
	                                    "originalColumn",
	                                    util.compareByOriginalPositions,
	                                    binarySearch.LEAST_UPPER_BOUND);
	      if (index >= 0) {
	        var mapping = this._originalMappings[index];
	
	        if (aArgs.column === undefined) {
	          var originalLine = mapping.originalLine;
	
	          // Iterate until either we run out of mappings, or we run into
	          // a mapping for a different line than the one we found. Since
	          // mappings are sorted, this is guaranteed to find all mappings for
	          // the line we found.
	          while (mapping && mapping.originalLine === originalLine) {
	            mappings.push({
	              line: util.getArg(mapping, 'generatedLine', null),
	              column: util.getArg(mapping, 'generatedColumn', null),
	              lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
	            });
	
	            mapping = this._originalMappings[++index];
	          }
	        } else {
	          var originalColumn = mapping.originalColumn;
	
	          // Iterate until either we run out of mappings, or we run into
	          // a mapping for a different line than the one we were searching for.
	          // Since mappings are sorted, this is guaranteed to find all mappings for
	          // the line we are searching for.
	          while (mapping &&
	                 mapping.originalLine === line &&
	                 mapping.originalColumn == originalColumn) {
	            mappings.push({
	              line: util.getArg(mapping, 'generatedLine', null),
	              column: util.getArg(mapping, 'generatedColumn', null),
	              lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
	            });
	
	            mapping = this._originalMappings[++index];
	          }
	        }
	      }
	
	      return mappings;
	    };
	
	  exports.SourceMapConsumer = SourceMapConsumer;
	
	  /**
	   * A BasicSourceMapConsumer instance represents a parsed source map which we can
	   * query for information about the original file positions by giving it a file
	   * position in the generated source.
	   *
	   * The only parameter is the raw source map (either as a JSON string, or
	   * already parsed to an object). According to the spec, source maps have the
	   * following attributes:
	   *
	   *   - version: Which version of the source map spec this map is following.
	   *   - sources: An array of URLs to the original source files.
	   *   - names: An array of identifiers which can be referrenced by individual mappings.
	   *   - sourceRoot: Optional. The URL root from which all sources are relative.
	   *   - sourcesContent: Optional. An array of contents of the original source files.
	   *   - mappings: A string of base64 VLQs which contain the actual mappings.
	   *   - file: Optional. The generated file this source map is associated with.
	   *
	   * Here is an example source map, taken from the source map spec[0]:
	   *
	   *     {
	   *       version : 3,
	   *       file: "out.js",
	   *       sourceRoot : "",
	   *       sources: ["foo.js", "bar.js"],
	   *       names: ["src", "maps", "are", "fun"],
	   *       mappings: "AA,AB;;ABCDE;"
	   *     }
	   *
	   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
	   */
	  function BasicSourceMapConsumer(aSourceMap) {
	    var sourceMap = aSourceMap;
	    if (typeof aSourceMap === 'string') {
	      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
	    }
	
	    var version = util.getArg(sourceMap, 'version');
	    var sources = util.getArg(sourceMap, 'sources');
	    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
	    // requires the array) to play nice here.
	    var names = util.getArg(sourceMap, 'names', []);
	    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
	    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
	    var mappings = util.getArg(sourceMap, 'mappings');
	    var file = util.getArg(sourceMap, 'file', null);
	
	    // Once again, Sass deviates from the spec and supplies the version as a
	    // string rather than a number, so we use loose equality checking here.
	    if (version != this._version) {
	      throw new Error('Unsupported version: ' + version);
	    }
	
	    sources = sources
	      // Some source maps produce relative source paths like "./foo.js" instead of
	      // "foo.js".  Normalize these first so that future comparisons will succeed.
	      // See bugzil.la/1090768.
	      .map(util.normalize)
	      // Always ensure that absolute sources are internally stored relative to
	      // the source root, if the source root is absolute. Not doing this would
	      // be particularly problematic when the source root is a prefix of the
	      // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
	      .map(function (source) {
	        return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
	          ? util.relative(sourceRoot, source)
	          : source;
	      });
	
	    // Pass `true` below to allow duplicate names and sources. While source maps
	    // are intended to be compressed and deduplicated, the TypeScript compiler
	    // sometimes generates source maps with duplicates in them. See Github issue
	    // #72 and bugzil.la/889492.
	    this._names = ArraySet.fromArray(names, true);
	    this._sources = ArraySet.fromArray(sources, true);
	
	    this.sourceRoot = sourceRoot;
	    this.sourcesContent = sourcesContent;
	    this._mappings = mappings;
	    this.file = file;
	  }
	
	  BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	  BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
	
	  /**
	   * Create a BasicSourceMapConsumer from a SourceMapGenerator.
	   *
	   * @param SourceMapGenerator aSourceMap
	   *        The source map that will be consumed.
	   * @returns BasicSourceMapConsumer
	   */
	  BasicSourceMapConsumer.fromSourceMap =
	    function SourceMapConsumer_fromSourceMap(aSourceMap) {
	      var smc = Object.create(BasicSourceMapConsumer.prototype);
	
	      var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
	      var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
	      smc.sourceRoot = aSourceMap._sourceRoot;
	      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
	                                                              smc.sourceRoot);
	      smc.file = aSourceMap._file;
	
	      // Because we are modifying the entries (by converting string sources and
	      // names to indices into the sources and names ArraySets), we have to make
	      // a copy of the entry or else bad things happen. Shared mutable state
	      // strikes again! See github issue #191.
	
	      var generatedMappings = aSourceMap._mappings.toArray().slice();
	      var destGeneratedMappings = smc.__generatedMappings = [];
	      var destOriginalMappings = smc.__originalMappings = [];
	
	      for (var i = 0, length = generatedMappings.length; i < length; i++) {
	        var srcMapping = generatedMappings[i];
	        var destMapping = new Mapping;
	        destMapping.generatedLine = srcMapping.generatedLine;
	        destMapping.generatedColumn = srcMapping.generatedColumn;
	
	        if (srcMapping.source) {
	          destMapping.source = sources.indexOf(srcMapping.source);
	          destMapping.originalLine = srcMapping.originalLine;
	          destMapping.originalColumn = srcMapping.originalColumn;
	
	          if (srcMapping.name) {
	            destMapping.name = names.indexOf(srcMapping.name);
	          }
	
	          destOriginalMappings.push(destMapping);
	        }
	
	        destGeneratedMappings.push(destMapping);
	      }
	
	      quickSort(smc.__originalMappings, util.compareByOriginalPositions);
	
	      return smc;
	    };
	
	  /**
	   * The version of the source mapping spec that we are consuming.
	   */
	  BasicSourceMapConsumer.prototype._version = 3;
	
	  /**
	   * The list of original sources.
	   */
	  Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
	    get: function () {
	      return this._sources.toArray().map(function (s) {
	        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
	      }, this);
	    }
	  });
	
	  /**
	   * Provide the JIT with a nice shape / hidden class.
	   */
	  function Mapping() {
	    this.generatedLine = 0;
	    this.generatedColumn = 0;
	    this.source = null;
	    this.originalLine = null;
	    this.originalColumn = null;
	    this.name = null;
	  }
	
	  /**
	   * Parse the mappings in a string in to a data structure which we can easily
	   * query (the ordered arrays in the `this.__generatedMappings` and
	   * `this.__originalMappings` properties).
	   */
	  BasicSourceMapConsumer.prototype._parseMappings =
	    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	      var generatedLine = 1;
	      var previousGeneratedColumn = 0;
	      var previousOriginalLine = 0;
	      var previousOriginalColumn = 0;
	      var previousSource = 0;
	      var previousName = 0;
	      var length = aStr.length;
	      var index = 0;
	      var cachedSegments = {};
	      var temp = {};
	      var originalMappings = [];
	      var generatedMappings = [];
	      var mapping, str, segment, end, value;
	
	      while (index < length) {
	        if (aStr.charAt(index) === ';') {
	          generatedLine++;
	          index++;
	          previousGeneratedColumn = 0;
	        }
	        else if (aStr.charAt(index) === ',') {
	          index++;
	        }
	        else {
	          mapping = new Mapping();
	          mapping.generatedLine = generatedLine;
	
	          // Because each offset is encoded relative to the previous one,
	          // many segments often have the same encoding. We can exploit this
	          // fact by caching the parsed variable length fields of each segment,
	          // allowing us to avoid a second parse if we encounter the same
	          // segment again.
	          for (end = index; end < length; end++) {
	            if (this._charIsMappingSeparator(aStr, end)) {
	              break;
	            }
	          }
	          str = aStr.slice(index, end);
	
	          segment = cachedSegments[str];
	          if (segment) {
	            index += str.length;
	          } else {
	            segment = [];
	            while (index < end) {
	              base64VLQ.decode(aStr, index, temp);
	              value = temp.value;
	              index = temp.rest;
	              segment.push(value);
	            }
	
	            if (segment.length === 2) {
	              throw new Error('Found a source, but no line and column');
	            }
	
	            if (segment.length === 3) {
	              throw new Error('Found a source and line, but no column');
	            }
	
	            cachedSegments[str] = segment;
	          }
	
	          // Generated column.
	          mapping.generatedColumn = previousGeneratedColumn + segment[0];
	          previousGeneratedColumn = mapping.generatedColumn;
	
	          if (segment.length > 1) {
	            // Original source.
	            mapping.source = previousSource + segment[1];
	            previousSource += segment[1];
	
	            // Original line.
	            mapping.originalLine = previousOriginalLine + segment[2];
	            previousOriginalLine = mapping.originalLine;
	            // Lines are stored 0-based
	            mapping.originalLine += 1;
	
	            // Original column.
	            mapping.originalColumn = previousOriginalColumn + segment[3];
	            previousOriginalColumn = mapping.originalColumn;
	
	            if (segment.length > 4) {
	              // Original name.
	              mapping.name = previousName + segment[4];
	              previousName += segment[4];
	            }
	          }
	
	          generatedMappings.push(mapping);
	          if (typeof mapping.originalLine === 'number') {
	            originalMappings.push(mapping);
	          }
	        }
	      }
	
	      quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
	      this.__generatedMappings = generatedMappings;
	
	      quickSort(originalMappings, util.compareByOriginalPositions);
	      this.__originalMappings = originalMappings;
	    };
	
	  /**
	   * Find the mapping that best matches the hypothetical "needle" mapping that
	   * we are searching for in the given "haystack" of mappings.
	   */
	  BasicSourceMapConsumer.prototype._findMapping =
	    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
	                                           aColumnName, aComparator, aBias) {
	      // To return the position we are searching for, we must first find the
	      // mapping for the given position and then return the opposite position it
	      // points to. Because the mappings are sorted, we can use binary search to
	      // find the best mapping.
	
	      if (aNeedle[aLineName] <= 0) {
	        throw new TypeError('Line must be greater than or equal to 1, got '
	                            + aNeedle[aLineName]);
	      }
	      if (aNeedle[aColumnName] < 0) {
	        throw new TypeError('Column must be greater than or equal to 0, got '
	                            + aNeedle[aColumnName]);
	      }
	
	      return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
	    };
	
	  /**
	   * Compute the last column for each generated mapping. The last column is
	   * inclusive.
	   */
	  BasicSourceMapConsumer.prototype.computeColumnSpans =
	    function SourceMapConsumer_computeColumnSpans() {
	      for (var index = 0; index < this._generatedMappings.length; ++index) {
	        var mapping = this._generatedMappings[index];
	
	        // Mappings do not contain a field for the last generated columnt. We
	        // can come up with an optimistic estimate, however, by assuming that
	        // mappings are contiguous (i.e. given two consecutive mappings, the
	        // first mapping ends where the second one starts).
	        if (index + 1 < this._generatedMappings.length) {
	          var nextMapping = this._generatedMappings[index + 1];
	
	          if (mapping.generatedLine === nextMapping.generatedLine) {
	            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
	            continue;
	          }
	        }
	
	        // The last mapping for each line spans the entire line.
	        mapping.lastGeneratedColumn = Infinity;
	      }
	    };
	
	  /**
	   * Returns the original source, line, and column information for the generated
	   * source's line and column positions provided. The only argument is an object
	   * with the following properties:
	   *
	   *   - line: The line number in the generated source.
	   *   - column: The column number in the generated source.
	   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	   *     closest element that is smaller than or greater than the one we are
	   *     searching for, respectively, if the exact element cannot be found.
	   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - source: The original source file, or null.
	   *   - line: The line number in the original source, or null.
	   *   - column: The column number in the original source, or null.
	   *   - name: The original identifier, or null.
	   */
	  BasicSourceMapConsumer.prototype.originalPositionFor =
	    function SourceMapConsumer_originalPositionFor(aArgs) {
	      var needle = {
	        generatedLine: util.getArg(aArgs, 'line'),
	        generatedColumn: util.getArg(aArgs, 'column')
	      };
	
	      var index = this._findMapping(
	        needle,
	        this._generatedMappings,
	        "generatedLine",
	        "generatedColumn",
	        util.compareByGeneratedPositionsDeflated,
	        util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
	      );
	
	      if (index >= 0) {
	        var mapping = this._generatedMappings[index];
	
	        if (mapping.generatedLine === needle.generatedLine) {
	          var source = util.getArg(mapping, 'source', null);
	          if (source !== null) {
	            source = this._sources.at(source);
	            if (this.sourceRoot != null) {
	              source = util.join(this.sourceRoot, source);
	            }
	          }
	          var name = util.getArg(mapping, 'name', null);
	          if (name !== null) {
	            name = this._names.at(name);
	          }
	          return {
	            source: source,
	            line: util.getArg(mapping, 'originalLine', null),
	            column: util.getArg(mapping, 'originalColumn', null),
	            name: name
	          };
	        }
	      }
	
	      return {
	        source: null,
	        line: null,
	        column: null,
	        name: null
	      };
	    };
	
	  /**
	   * Return true if we have the source content for every source in the source
	   * map, false otherwise.
	   */
	  BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
	    function BasicSourceMapConsumer_hasContentsOfAllSources() {
	      if (!this.sourcesContent) {
	        return false;
	      }
	      return this.sourcesContent.length >= this._sources.size() &&
	        !this.sourcesContent.some(function (sc) { return sc == null; });
	    };
	
	  /**
	   * Returns the original source content. The only argument is the url of the
	   * original source file. Returns null if no original source content is
	   * available.
	   */
	  BasicSourceMapConsumer.prototype.sourceContentFor =
	    function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
	      if (!this.sourcesContent) {
	        return null;
	      }
	
	      if (this.sourceRoot != null) {
	        aSource = util.relative(this.sourceRoot, aSource);
	      }
	
	      if (this._sources.has(aSource)) {
	        return this.sourcesContent[this._sources.indexOf(aSource)];
	      }
	
	      var url;
	      if (this.sourceRoot != null
	          && (url = util.urlParse(this.sourceRoot))) {
	        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
	        // many users. We can help them out when they expect file:// URIs to
	        // behave like it would if they were running a local HTTP server. See
	        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
	        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
	        if (url.scheme == "file"
	            && this._sources.has(fileUriAbsPath)) {
	          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
	        }
	
	        if ((!url.path || url.path == "/")
	            && this._sources.has("/" + aSource)) {
	          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
	        }
	      }
	
	      // This function is used recursively from
	      // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
	      // don't want to throw if we can't find the source - we just want to
	      // return null, so we provide a flag to exit gracefully.
	      if (nullOnMissing) {
	        return null;
	      }
	      else {
	        throw new Error('"' + aSource + '" is not in the SourceMap.');
	      }
	    };
	
	  /**
	   * Returns the generated line and column information for the original source,
	   * line, and column positions provided. The only argument is an object with
	   * the following properties:
	   *
	   *   - source: The filename of the original source.
	   *   - line: The line number in the original source.
	   *   - column: The column number in the original source.
	   *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
	   *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
	   *     closest element that is smaller than or greater than the one we are
	   *     searching for, respectively, if the exact element cannot be found.
	   *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - line: The line number in the generated source, or null.
	   *   - column: The column number in the generated source, or null.
	   */
	  BasicSourceMapConsumer.prototype.generatedPositionFor =
	    function SourceMapConsumer_generatedPositionFor(aArgs) {
	      var source = util.getArg(aArgs, 'source');
	      if (this.sourceRoot != null) {
	        source = util.relative(this.sourceRoot, source);
	      }
	      if (!this._sources.has(source)) {
	        return {
	          line: null,
	          column: null,
	          lastColumn: null
	        };
	      }
	      source = this._sources.indexOf(source);
	
	      var needle = {
	        source: source,
	        originalLine: util.getArg(aArgs, 'line'),
	        originalColumn: util.getArg(aArgs, 'column')
	      };
	
	      var index = this._findMapping(
	        needle,
	        this._originalMappings,
	        "originalLine",
	        "originalColumn",
	        util.compareByOriginalPositions,
	        util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
	      );
	
	      if (index >= 0) {
	        var mapping = this._originalMappings[index];
	
	        if (mapping.source === needle.source) {
	          return {
	            line: util.getArg(mapping, 'generatedLine', null),
	            column: util.getArg(mapping, 'generatedColumn', null),
	            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
	          };
	        }
	      }
	
	      return {
	        line: null,
	        column: null,
	        lastColumn: null
	      };
	    };
	
	  exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
	
	  /**
	   * An IndexedSourceMapConsumer instance represents a parsed source map which
	   * we can query for information. It differs from BasicSourceMapConsumer in
	   * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
	   * input.
	   *
	   * The only parameter is a raw source map (either as a JSON string, or already
	   * parsed to an object). According to the spec for indexed source maps, they
	   * have the following attributes:
	   *
	   *   - version: Which version of the source map spec this map is following.
	   *   - file: Optional. The generated file this source map is associated with.
	   *   - sections: A list of section definitions.
	   *
	   * Each value under the "sections" field has two fields:
	   *   - offset: The offset into the original specified at which this section
	   *       begins to apply, defined as an object with a "line" and "column"
	   *       field.
	   *   - map: A source map definition. This source map could also be indexed,
	   *       but doesn't have to be.
	   *
	   * Instead of the "map" field, it's also possible to have a "url" field
	   * specifying a URL to retrieve a source map from, but that's currently
	   * unsupported.
	   *
	   * Here's an example source map, taken from the source map spec[0], but
	   * modified to omit a section which uses the "url" field.
	   *
	   *  {
	   *    version : 3,
	   *    file: "app.js",
	   *    sections: [{
	   *      offset: {line:100, column:10},
	   *      map: {
	   *        version : 3,
	   *        file: "section.js",
	   *        sources: ["foo.js", "bar.js"],
	   *        names: ["src", "maps", "are", "fun"],
	   *        mappings: "AAAA,E;;ABCDE;"
	   *      }
	   *    }],
	   *  }
	   *
	   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
	   */
	  function IndexedSourceMapConsumer(aSourceMap) {
	    var sourceMap = aSourceMap;
	    if (typeof aSourceMap === 'string') {
	      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
	    }
	
	    var version = util.getArg(sourceMap, 'version');
	    var sections = util.getArg(sourceMap, 'sections');
	
	    if (version != this._version) {
	      throw new Error('Unsupported version: ' + version);
	    }
	
	    this._sources = new ArraySet();
	    this._names = new ArraySet();
	
	    var lastOffset = {
	      line: -1,
	      column: 0
	    };
	    this._sections = sections.map(function (s) {
	      if (s.url) {
	        // The url field will require support for asynchronicity.
	        // See https://github.com/mozilla/source-map/issues/16
	        throw new Error('Support for url field in sections not implemented.');
	      }
	      var offset = util.getArg(s, 'offset');
	      var offsetLine = util.getArg(offset, 'line');
	      var offsetColumn = util.getArg(offset, 'column');
	
	      if (offsetLine < lastOffset.line ||
	          (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
	        throw new Error('Section offsets must be ordered and non-overlapping.');
	      }
	      lastOffset = offset;
	
	      return {
	        generatedOffset: {
	          // The offset fields are 0-based, but we use 1-based indices when
	          // encoding/decoding from VLQ.
	          generatedLine: offsetLine + 1,
	          generatedColumn: offsetColumn + 1
	        },
	        consumer: new SourceMapConsumer(util.getArg(s, 'map'))
	      }
	    });
	  }
	
	  IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
	  IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
	
	  /**
	   * The version of the source mapping spec that we are consuming.
	   */
	  IndexedSourceMapConsumer.prototype._version = 3;
	
	  /**
	   * The list of original sources.
	   */
	  Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
	    get: function () {
	      var sources = [];
	      for (var i = 0; i < this._sections.length; i++) {
	        for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
	          sources.push(this._sections[i].consumer.sources[j]);
	        }
	      }
	      return sources;
	    }
	  });
	
	  /**
	   * Returns the original source, line, and column information for the generated
	   * source's line and column positions provided. The only argument is an object
	   * with the following properties:
	   *
	   *   - line: The line number in the generated source.
	   *   - column: The column number in the generated source.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - source: The original source file, or null.
	   *   - line: The line number in the original source, or null.
	   *   - column: The column number in the original source, or null.
	   *   - name: The original identifier, or null.
	   */
	  IndexedSourceMapConsumer.prototype.originalPositionFor =
	    function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
	      var needle = {
	        generatedLine: util.getArg(aArgs, 'line'),
	        generatedColumn: util.getArg(aArgs, 'column')
	      };
	
	      // Find the section containing the generated position we're trying to map
	      // to an original position.
	      var sectionIndex = binarySearch.search(needle, this._sections,
	        function(needle, section) {
	          var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
	          if (cmp) {
	            return cmp;
	          }
	
	          return (needle.generatedColumn -
	                  section.generatedOffset.generatedColumn);
	        });
	      var section = this._sections[sectionIndex];
	
	      if (!section) {
	        return {
	          source: null,
	          line: null,
	          column: null,
	          name: null
	        };
	      }
	
	      return section.consumer.originalPositionFor({
	        line: needle.generatedLine -
	          (section.generatedOffset.generatedLine - 1),
	        column: needle.generatedColumn -
	          (section.generatedOffset.generatedLine === needle.generatedLine
	           ? section.generatedOffset.generatedColumn - 1
	           : 0),
	        bias: aArgs.bias
	      });
	    };
	
	  /**
	   * Return true if we have the source content for every source in the source
	   * map, false otherwise.
	   */
	  IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
	    function IndexedSourceMapConsumer_hasContentsOfAllSources() {
	      return this._sections.every(function (s) {
	        return s.consumer.hasContentsOfAllSources();
	      });
	    };
	
	  /**
	   * Returns the original source content. The only argument is the url of the
	   * original source file. Returns null if no original source content is
	   * available.
	   */
	  IndexedSourceMapConsumer.prototype.sourceContentFor =
	    function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
	      for (var i = 0; i < this._sections.length; i++) {
	        var section = this._sections[i];
	
	        var content = section.consumer.sourceContentFor(aSource, true);
	        if (content) {
	          return content;
	        }
	      }
	      if (nullOnMissing) {
	        return null;
	      }
	      else {
	        throw new Error('"' + aSource + '" is not in the SourceMap.');
	      }
	    };
	
	  /**
	   * Returns the generated line and column information for the original source,
	   * line, and column positions provided. The only argument is an object with
	   * the following properties:
	   *
	   *   - source: The filename of the original source.
	   *   - line: The line number in the original source.
	   *   - column: The column number in the original source.
	   *
	   * and an object is returned with the following properties:
	   *
	   *   - line: The line number in the generated source, or null.
	   *   - column: The column number in the generated source, or null.
	   */
	  IndexedSourceMapConsumer.prototype.generatedPositionFor =
	    function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
	      for (var i = 0; i < this._sections.length; i++) {
	        var section = this._sections[i];
	
	        // Only consider this section if the requested source is in the list of
	        // sources of the consumer.
	        if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
	          continue;
	        }
	        var generatedPosition = section.consumer.generatedPositionFor(aArgs);
	        if (generatedPosition) {
	          var ret = {
	            line: generatedPosition.line +
	              (section.generatedOffset.generatedLine - 1),
	            column: generatedPosition.column +
	              (section.generatedOffset.generatedLine === generatedPosition.line
	               ? section.generatedOffset.generatedColumn - 1
	               : 0)
	          };
	          return ret;
	        }
	      }
	
	      return {
	        line: null,
	        column: null
	      };
	    };
	
	  /**
	   * Parse the mappings in a string in to a data structure which we can easily
	   * query (the ordered arrays in the `this.__generatedMappings` and
	   * `this.__originalMappings` properties).
	   */
	  IndexedSourceMapConsumer.prototype._parseMappings =
	    function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
	      this.__generatedMappings = [];
	      this.__originalMappings = [];
	      for (var i = 0; i < this._sections.length; i++) {
	        var section = this._sections[i];
	        var sectionMappings = section.consumer._generatedMappings;
	        for (var j = 0; j < sectionMappings.length; j++) {
	          var mapping = sectionMappings[j];
	
	          var source = section.consumer._sources.at(mapping.source);
	          if (section.consumer.sourceRoot !== null) {
	            source = util.join(section.consumer.sourceRoot, source);
	          }
	          this._sources.add(source);
	          source = this._sources.indexOf(source);
	
	          var name = section.consumer._names.at(mapping.name);
	          this._names.add(name);
	          name = this._names.indexOf(name);
	
	          // The mappings coming from the consumer for the section have
	          // generated positions relative to the start of the section, so we
	          // need to offset them to be relative to the start of the concatenated
	          // generated file.
	          var adjustedMapping = {
	            source: source,
	            generatedLine: mapping.generatedLine +
	              (section.generatedOffset.generatedLine - 1),
	            generatedColumn: mapping.generatedColumn +
	              (section.generatedOffset.generatedLine === mapping.generatedLine
	              ? section.generatedOffset.generatedColumn - 1
	              : 0),
	            originalLine: mapping.originalLine,
	            originalColumn: mapping.originalColumn,
	            name: name
	          };
	
	          this.__generatedMappings.push(adjustedMapping);
	          if (typeof adjustedMapping.originalLine === 'number') {
	            this.__originalMappings.push(adjustedMapping);
	          }
	        }
	      }
	
	      quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
	      quickSort(this.__originalMappings, util.compareByOriginalPositions);
	    };
	
	  exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
	}


/***/ },
/* 20 */
/***/ function(module, exports) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  exports.GREATEST_LOWER_BOUND = 1;
	  exports.LEAST_UPPER_BOUND = 2;
	
	  /**
	   * Recursive implementation of binary search.
	   *
	   * @param aLow Indices here and lower do not contain the needle.
	   * @param aHigh Indices here and higher do not contain the needle.
	   * @param aNeedle The element being searched for.
	   * @param aHaystack The non-empty array being searched.
	   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
	   * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	   *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	   *     closest element that is smaller than or greater than the one we are
	   *     searching for, respectively, if the exact element cannot be found.
	   */
	  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
	    // This function terminates when one of the following is true:
	    //
	    //   1. We find the exact element we are looking for.
	    //
	    //   2. We did not find the exact element, but we can return the index of
	    //      the next-closest element.
	    //
	    //   3. We did not find the exact element, and there is no next-closest
	    //      element than the one we are searching for, so we return -1.
	    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
	    var cmp = aCompare(aNeedle, aHaystack[mid], true);
	    if (cmp === 0) {
	      // Found the element we are looking for.
	      return mid;
	    }
	    else if (cmp > 0) {
	      // Our needle is greater than aHaystack[mid].
	      if (aHigh - mid > 1) {
	        // The element is in the upper half.
	        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
	      }
	
	      // The exact needle element was not found in this haystack. Determine if
	      // we are in termination case (3) or (2) and return the appropriate thing.
	      if (aBias == exports.LEAST_UPPER_BOUND) {
	        return aHigh < aHaystack.length ? aHigh : -1;
	      } else {
	        return mid;
	      }
	    }
	    else {
	      // Our needle is less than aHaystack[mid].
	      if (mid - aLow > 1) {
	        // The element is in the lower half.
	        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
	      }
	
	      // we are in termination case (3) or (2) and return the appropriate thing.
	      if (aBias == exports.LEAST_UPPER_BOUND) {
	        return mid;
	      } else {
	        return aLow < 0 ? -1 : aLow;
	      }
	    }
	  }
	
	  /**
	   * This is an implementation of binary search which will always try and return
	   * the index of the closest element if there is no exact hit. This is because
	   * mappings between original and generated line/col pairs are single points,
	   * and there is an implicit region between each of them, so a miss just means
	   * that you aren't on the very start of a region.
	   *
	   * @param aNeedle The element you are looking for.
	   * @param aHaystack The array that is being searched.
	   * @param aCompare A function which takes the needle and an element in the
	   *     array and returns -1, 0, or 1 depending on whether the needle is less
	   *     than, equal to, or greater than the element, respectively.
	   * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
	   *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
	   *     closest element that is smaller than or greater than the one we are
	   *     searching for, respectively, if the exact element cannot be found.
	   *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
	   */
	  exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
	    if (aHaystack.length === 0) {
	      return -1;
	    }
	
	    var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
	                                aCompare, aBias || exports.GREATEST_LOWER_BOUND);
	    if (index < 0) {
	      return -1;
	    }
	
	    // We have found either the exact element, or the next-closest element than
	    // the one we are searching for. However, there may be more than one such
	    // element. Make sure we always return the smallest of these.
	    while (index - 1 >= 0) {
	      if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
	        break;
	      }
	      --index;
	    }
	
	    return index;
	  };
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  // It turns out that some (most?) JavaScript engines don't self-host
	  // `Array.prototype.sort`. This makes sense because C++ will likely remain
	  // faster than JS when doing raw CPU-intensive sorting. However, when using a
	  // custom comparator function, calling back and forth between the VM's C++ and
	  // JIT'd JS is rather slow *and* loses JIT type information, resulting in
	  // worse generated code for the comparator function than would be optimal. In
	  // fact, when sorting with a comparator, these costs outweigh the benefits of
	  // sorting in C++. By using our own JS-implemented Quick Sort (below), we get
	  // a ~3500ms mean speed-up in `bench/bench.html`.
	
	  /**
	   * Swap the elements indexed by `x` and `y` in the array `ary`.
	   *
	   * @param {Array} ary
	   *        The array.
	   * @param {Number} x
	   *        The index of the first item.
	   * @param {Number} y
	   *        The index of the second item.
	   */
	  function swap(ary, x, y) {
	    var temp = ary[x];
	    ary[x] = ary[y];
	    ary[y] = temp;
	  }
	
	  /**
	   * Returns a random integer within the range `low .. high` inclusive.
	   *
	   * @param {Number} low
	   *        The lower bound on the range.
	   * @param {Number} high
	   *        The upper bound on the range.
	   */
	  function randomIntInRange(low, high) {
	    return Math.round(low + (Math.random() * (high - low)));
	  }
	
	  /**
	   * The Quick Sort algorithm.
	   *
	   * @param {Array} ary
	   *        An array to sort.
	   * @param {function} comparator
	   *        Function to use to compare two items.
	   * @param {Number} p
	   *        Start index of the array
	   * @param {Number} r
	   *        End index of the array
	   */
	  function doQuickSort(ary, comparator, p, r) {
	    // If our lower bound is less than our upper bound, we (1) partition the
	    // array into two pieces and (2) recurse on each half. If it is not, this is
	    // the empty array and our base case.
	
	    if (p < r) {
	      // (1) Partitioning.
	      //
	      // The partitioning chooses a pivot between `p` and `r` and moves all
	      // elements that are less than or equal to the pivot to the before it, and
	      // all the elements that are greater than it after it. The effect is that
	      // once partition is done, the pivot is in the exact place it will be when
	      // the array is put in sorted order, and it will not need to be moved
	      // again. This runs in O(n) time.
	
	      // Always choose a random pivot so that an input array which is reverse
	      // sorted does not cause O(n^2) running time.
	      var pivotIndex = randomIntInRange(p, r);
	      var i = p - 1;
	
	      swap(ary, pivotIndex, r);
	      var pivot = ary[r];
	
	      // Immediately after `j` is incremented in this loop, the following hold
	      // true:
	      //
	      //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
	      //
	      //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
	      for (var j = p; j < r; j++) {
	        if (comparator(ary[j], pivot) <= 0) {
	          i += 1;
	          swap(ary, i, j);
	        }
	      }
	
	      swap(ary, i + 1, j);
	      var q = i + 1;
	
	      // (2) Recurse on each half.
	
	      doQuickSort(ary, comparator, p, q - 1);
	      doQuickSort(ary, comparator, q + 1, r);
	    }
	  }
	
	  /**
	   * Sort the given array in-place with the given comparator function.
	   *
	   * @param {Array} ary
	   *        An array to sort.
	   * @param {function} comparator
	   *        Function to use to compare two items.
	   */
	  exports.quickSort = function (ary, comparator) {
	    doQuickSort(ary, comparator, 0, ary.length - 1);
	  };
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* -*- Mode: js; js-indent-level: 2; -*- */
	/*
	 * Copyright 2011 Mozilla Foundation and contributors
	 * Licensed under the New BSD license. See LICENSE or:
	 * http://opensource.org/licenses/BSD-3-Clause
	 */
	{
	  var SourceMapGenerator = __webpack_require__(13).SourceMapGenerator;
	  var util = __webpack_require__(16);
	
	  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
	  // operating systems these days (capturing the result).
	  var REGEX_NEWLINE = /(\r?\n)/;
	
	  // Newline character code for charCodeAt() comparisons
	  var NEWLINE_CODE = 10;
	
	  // Private symbol for identifying `SourceNode`s when multiple versions of
	  // the source-map library are loaded. This MUST NOT CHANGE across
	  // versions!
	  var isSourceNode = "$$$isSourceNode$$$";
	
	  /**
	   * SourceNodes provide a way to abstract over interpolating/concatenating
	   * snippets of generated JavaScript source code while maintaining the line and
	   * column information associated with the original source code.
	   *
	   * @param aLine The original line number.
	   * @param aColumn The original column number.
	   * @param aSource The original source's filename.
	   * @param aChunks Optional. An array of strings which are snippets of
	   *        generated JS, or other SourceNodes.
	   * @param aName The original identifier.
	   */
	  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
	    this.children = [];
	    this.sourceContents = {};
	    this.line = aLine == null ? null : aLine;
	    this.column = aColumn == null ? null : aColumn;
	    this.source = aSource == null ? null : aSource;
	    this.name = aName == null ? null : aName;
	    this[isSourceNode] = true;
	    if (aChunks != null) this.add(aChunks);
	  }
	
	  /**
	   * Creates a SourceNode from generated code and a SourceMapConsumer.
	   *
	   * @param aGeneratedCode The generated code
	   * @param aSourceMapConsumer The SourceMap for the generated code
	   * @param aRelativePath Optional. The path that relative sources in the
	   *        SourceMapConsumer should be relative to.
	   */
	  SourceNode.fromStringWithSourceMap =
	    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
	      // The SourceNode we want to fill with the generated code
	      // and the SourceMap
	      var node = new SourceNode();
	
	      // All even indices of this array are one line of the generated code,
	      // while all odd indices are the newlines between two adjacent lines
	      // (since `REGEX_NEWLINE` captures its match).
	      // Processed fragments are removed from this array, by calling `shiftNextLine`.
	      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
	      var shiftNextLine = function() {
	        var lineContents = remainingLines.shift();
	        // The last line of a file might not have a newline.
	        var newLine = remainingLines.shift() || "";
	        return lineContents + newLine;
	      };
	
	      // We need to remember the position of "remainingLines"
	      var lastGeneratedLine = 1, lastGeneratedColumn = 0;
	
	      // The generate SourceNodes we need a code range.
	      // To extract it current and last mapping is used.
	      // Here we store the last mapping.
	      var lastMapping = null;
	
	      aSourceMapConsumer.eachMapping(function (mapping) {
	        if (lastMapping !== null) {
	          // We add the code from "lastMapping" to "mapping":
	          // First check if there is a new line in between.
	          if (lastGeneratedLine < mapping.generatedLine) {
	            // Associate first line with "lastMapping"
	            addMappingWithCode(lastMapping, shiftNextLine());
	            lastGeneratedLine++;
	            lastGeneratedColumn = 0;
	            // The remaining code is added without mapping
	          } else {
	            // There is no new line in between.
	            // Associate the code between "lastGeneratedColumn" and
	            // "mapping.generatedColumn" with "lastMapping"
	            var nextLine = remainingLines[0];
	            var code = nextLine.substr(0, mapping.generatedColumn -
	                                          lastGeneratedColumn);
	            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
	                                                lastGeneratedColumn);
	            lastGeneratedColumn = mapping.generatedColumn;
	            addMappingWithCode(lastMapping, code);
	            // No more remaining code, continue
	            lastMapping = mapping;
	            return;
	          }
	        }
	        // We add the generated code until the first mapping
	        // to the SourceNode without any mapping.
	        // Each line is added as separate string.
	        while (lastGeneratedLine < mapping.generatedLine) {
	          node.add(shiftNextLine());
	          lastGeneratedLine++;
	        }
	        if (lastGeneratedColumn < mapping.generatedColumn) {
	          var nextLine = remainingLines[0];
	          node.add(nextLine.substr(0, mapping.generatedColumn));
	          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
	          lastGeneratedColumn = mapping.generatedColumn;
	        }
	        lastMapping = mapping;
	      }, this);
	      // We have processed all mappings.
	      if (remainingLines.length > 0) {
	        if (lastMapping) {
	          // Associate the remaining code in the current line with "lastMapping"
	          addMappingWithCode(lastMapping, shiftNextLine());
	        }
	        // and add the remaining lines without any mapping
	        node.add(remainingLines.join(""));
	      }
	
	      // Copy sourcesContent into SourceNode
	      aSourceMapConsumer.sources.forEach(function (sourceFile) {
	        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
	        if (content != null) {
	          if (aRelativePath != null) {
	            sourceFile = util.join(aRelativePath, sourceFile);
	          }
	          node.setSourceContent(sourceFile, content);
	        }
	      });
	
	      return node;
	
	      function addMappingWithCode(mapping, code) {
	        if (mapping === null || mapping.source === undefined) {
	          node.add(code);
	        } else {
	          var source = aRelativePath
	            ? util.join(aRelativePath, mapping.source)
	            : mapping.source;
	          node.add(new SourceNode(mapping.originalLine,
	                                  mapping.originalColumn,
	                                  source,
	                                  code,
	                                  mapping.name));
	        }
	      }
	    };
	
	  /**
	   * Add a chunk of generated JS to this source node.
	   *
	   * @param aChunk A string snippet of generated JS code, another instance of
	   *        SourceNode, or an array where each member is one of those things.
	   */
	  SourceNode.prototype.add = function SourceNode_add(aChunk) {
	    if (Array.isArray(aChunk)) {
	      aChunk.forEach(function (chunk) {
	        this.add(chunk);
	      }, this);
	    }
	    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
	      if (aChunk) {
	        this.children.push(aChunk);
	      }
	    }
	    else {
	      throw new TypeError(
	        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	      );
	    }
	    return this;
	  };
	
	  /**
	   * Add a chunk of generated JS to the beginning of this source node.
	   *
	   * @param aChunk A string snippet of generated JS code, another instance of
	   *        SourceNode, or an array where each member is one of those things.
	   */
	  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
	    if (Array.isArray(aChunk)) {
	      for (var i = aChunk.length-1; i >= 0; i--) {
	        this.prepend(aChunk[i]);
	      }
	    }
	    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
	      this.children.unshift(aChunk);
	    }
	    else {
	      throw new TypeError(
	        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
	      );
	    }
	    return this;
	  };
	
	  /**
	   * Walk over the tree of JS snippets in this node and its children. The
	   * walking function is called once for each snippet of JS and is passed that
	   * snippet and the its original associated source's line/column location.
	   *
	   * @param aFn The traversal function.
	   */
	  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
	    var chunk;
	    for (var i = 0, len = this.children.length; i < len; i++) {
	      chunk = this.children[i];
	      if (chunk[isSourceNode]) {
	        chunk.walk(aFn);
	      }
	      else {
	        if (chunk !== '') {
	          aFn(chunk, { source: this.source,
	                       line: this.line,
	                       column: this.column,
	                       name: this.name });
	        }
	      }
	    }
	  };
	
	  /**
	   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
	   * each of `this.children`.
	   *
	   * @param aSep The separator.
	   */
	  SourceNode.prototype.join = function SourceNode_join(aSep) {
	    var newChildren;
	    var i;
	    var len = this.children.length;
	    if (len > 0) {
	      newChildren = [];
	      for (i = 0; i < len-1; i++) {
	        newChildren.push(this.children[i]);
	        newChildren.push(aSep);
	      }
	      newChildren.push(this.children[i]);
	      this.children = newChildren;
	    }
	    return this;
	  };
	
	  /**
	   * Call String.prototype.replace on the very right-most source snippet. Useful
	   * for trimming whitespace from the end of a source node, etc.
	   *
	   * @param aPattern The pattern to replace.
	   * @param aReplacement The thing to replace the pattern with.
	   */
	  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
	    var lastChild = this.children[this.children.length - 1];
	    if (lastChild[isSourceNode]) {
	      lastChild.replaceRight(aPattern, aReplacement);
	    }
	    else if (typeof lastChild === 'string') {
	      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
	    }
	    else {
	      this.children.push(''.replace(aPattern, aReplacement));
	    }
	    return this;
	  };
	
	  /**
	   * Set the source content for a source file. This will be added to the SourceMapGenerator
	   * in the sourcesContent field.
	   *
	   * @param aSourceFile The filename of the source file
	   * @param aSourceContent The content of the source file
	   */
	  SourceNode.prototype.setSourceContent =
	    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
	      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
	    };
	
	  /**
	   * Walk over the tree of SourceNodes. The walking function is called for each
	   * source file content and is passed the filename and source content.
	   *
	   * @param aFn The traversal function.
	   */
	  SourceNode.prototype.walkSourceContents =
	    function SourceNode_walkSourceContents(aFn) {
	      for (var i = 0, len = this.children.length; i < len; i++) {
	        if (this.children[i][isSourceNode]) {
	          this.children[i].walkSourceContents(aFn);
	        }
	      }
	
	      var sources = Object.keys(this.sourceContents);
	      for (var i = 0, len = sources.length; i < len; i++) {
	        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
	      }
	    };
	
	  /**
	   * Return the string representation of this source node. Walks over the tree
	   * and concatenates all the various snippets together to one string.
	   */
	  SourceNode.prototype.toString = function SourceNode_toString() {
	    var str = "";
	    this.walk(function (chunk) {
	      str += chunk;
	    });
	    return str;
	  };
	
	  /**
	   * Returns the string representation of this source node along with a source
	   * map.
	   */
	  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
	    var generated = {
	      code: "",
	      line: 1,
	      column: 0
	    };
	    var map = new SourceMapGenerator(aArgs);
	    var sourceMappingActive = false;
	    var lastOriginalSource = null;
	    var lastOriginalLine = null;
	    var lastOriginalColumn = null;
	    var lastOriginalName = null;
	    this.walk(function (chunk, original) {
	      generated.code += chunk;
	      if (original.source !== null
	          && original.line !== null
	          && original.column !== null) {
	        if(lastOriginalSource !== original.source
	           || lastOriginalLine !== original.line
	           || lastOriginalColumn !== original.column
	           || lastOriginalName !== original.name) {
	          map.addMapping({
	            source: original.source,
	            original: {
	              line: original.line,
	              column: original.column
	            },
	            generated: {
	              line: generated.line,
	              column: generated.column
	            },
	            name: original.name
	          });
	        }
	        lastOriginalSource = original.source;
	        lastOriginalLine = original.line;
	        lastOriginalColumn = original.column;
	        lastOriginalName = original.name;
	        sourceMappingActive = true;
	      } else if (sourceMappingActive) {
	        map.addMapping({
	          generated: {
	            line: generated.line,
	            column: generated.column
	          }
	        });
	        lastOriginalSource = null;
	        sourceMappingActive = false;
	      }
	      for (var idx = 0, length = chunk.length; idx < length; idx++) {
	        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
	          generated.line++;
	          generated.column = 0;
	          // Mappings end at eol
	          if (idx + 1 === length) {
	            lastOriginalSource = null;
	            sourceMappingActive = false;
	          } else if (sourceMappingActive) {
	            map.addMapping({
	              source: original.source,
	              original: {
	                line: original.line,
	                column: original.column
	              },
	              generated: {
	                line: generated.line,
	                column: generated.column
	              },
	              name: original.name
	            });
	          }
	        } else {
	          generated.column++;
	        }
	      }
	    });
	    this.walkSourceContents(function (sourceFile, sourceContent) {
	      map.setSourceContent(sourceFile, sourceContent);
	    });
	
	    return { code: generated.code, map: map };
	  };
	
	  exports.SourceNode = SourceNode;
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(11);
	
	/**
	 * Typeahead search
	 */
	
	$(function() {
	
	    var findMatches = function findMatches(query, syncCallback, asyncCallback) {
	        $.ajax({
	            method: 'GET',
	            url: window.gw.urls.search_government +'?search='+ query
	        }).success(function(data) {
	            asyncCallback(data);
	        });
	    };
	
	    var searchValue = '';
	
	    // Init typeahead
	    var $typeahead = $('.typeahead_government').typeahead({
	        hint: true,
	        highlight: true,
	        minLength: 3
	    }, {
	        name: 'countries',
	        source: findMatches,
	        templates: {
	            empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
	            suggestion: Handlebars.compile('<div class="sugg-box">'+
	                '<div class="sugg-state">{{state}}</div>' +
	                '<div class="sugg-name">{{name}}</div>' +
	                '<div class="sugg-type">{{type}}</div>' +
	                '</div>')
	        },
	        updater: function (item) {
	            alert(item);
	        }
	    });
	
	    // Pressed mouse or enter button
	    $typeahead.bind("typeahead:selected", function(obj, selectedItemData) {
	        $typeahead.typeahead('val', selectedItemData.name);
	        window.location.pathname += [selectedItemData.altTypeSlug, selectedItemData.slug].join('/');
	    });
	
	    // Move cursor via arrows keys
	    $typeahead.bind("typeahead:cursorchange", function(obj) {
	        $typeahead.typeahead('val', searchValue);
	    });
	
	    // Store search value on typing
	    $typeahead.keyup(function(event) {
	        searchValue = $(event.target).val();
	    });
	
	    //$typeahead.attr('placeholder', 'GOVERNMENT NAME');
	    $typeahead.attr('disabled', false);
	
	    //var substringMatcher = function(strs) {
	    //    return function findMatches(q, cb) {
	    //        var matches, substringRegex;
	    //
	    //        // an array that will be populated with substring matches
	    //        matches = [];
	    //
	    //        // regex used to determine if a string contains the substring `q`
	    //        substrRegex = new RegExp('('+q+')', 'gi');
	    //
	    //        // iterate through the pool of strings and for any string that
	    //        // contains the substring `q`, add it to the `matches` array
	    //        $.each(strs, function(i, str) {
	    //            if (substrRegex.test(str.gov_name)) {
	    //                matches.push(str);
	    //            }
	    //        });
	    //
	    //        cb(matches);
	    //    };
	    //};
	    //
	    //$.get('/data/search/california.json', function (data){
	    //
	    //    var searchValue = '';
	    //
	    //    // Init typeahead
	    //    var $typeahead = $('.typeahead').typeahead({
	    //        hint: true,
	    //        highlight: true,
	    //        minLength: 1
	    //    }, {
	    //        name: 'countries',
	    //        source: substringMatcher(data.record),
	    //        templates: {
	    //            empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
	    //            suggestion: Handlebars.compile('<div class="sugg-box">'+
	    //                '<div class="sugg-state">{{state}}</div>' +
	    //                '<div class="sugg-name">{{gov_name}}</div>' +
	    //                '<div class="sugg-type">{{gov_type}}</div>' +
	    //                '</div>')
	    //        },
	    //        updater: function (item) {
	    //            alert(item);
	    //        }
	    //    });
	    //
	    //    // Pressed mouse or enter button
	    //    $typeahead.bind("typeahead:selected", function(obj, selectedItemData) {
	    //        $typeahead.typeahead('val', selectedItemData.gov_name);
	    //        window.location.pathname += [selectedItemData.altTypeSlug, selectedItemData.slug].join('/');
	    //    });
	    //
	    //    // Move cursor via arrows keys
	    //    $typeahead.bind("typeahead:cursorchange", function(obj) {
	    //        $typeahead.typeahead('val', searchValue);
	    //    });
	    //
	    //    // Store search value on typing
	    //    $typeahead.keyup(function(event) {
	    //        searchValue = $(event.target).val();
	    //    });
	    //
	    //    $typeahead.attr('placeholder', 'GOVERNMENT NAME');
	    //    $typeahead.attr('disabled', false);
	    //
	    //});
	
	});

/***/ }
]);
//# sourceMappingURL=map.js.map
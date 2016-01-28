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

                console.log(altTypes);

                initSubLayers(altTypes);

                initLegend(altTypes);

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
         * Initialization County SubLayer
         *
         * Tooltip window
         * Tooltip work with 3.11-13 version, 3.15 is buggy
         */
        function initCountySubLayer(altType) {

            var colorized = window.gw.map.colorizedCountyConditions.colorized;

            if (colorized) {

                var conditions = window.gw.map.colorizedCountyConditions.conditions;
                var keys = Object.keys(conditions).reverse();
                var defaultColor = conditions[keys[0]];

                var cartocss = '#layer { polygon-fill: '+ defaultColor +
                    '; polygon-opacity: 0.7; line-color: #FFF; line-width: 0.5; line-opacity: 1; } ';

                keys.forEach(function(key){
                    if (conditions.hasOwnProperty(key)) {

                        cartocss += '#layer[data <= ' + key + '] { polygon-fill: ' + conditions[key] + '; } ';

                    }
                });

            } else {
                cartocss = '#layer { polygon-fill: #F15A29; polygon-opacity: 0.7; line-color: #FFF; line-width: 0.5; line-opacity: 1; } '
            }

            var cLayer = {
                'cartocss': cartocss,
                'sql': 'SELECT *, ST_AsGeoJSON(the_geom) AS geometry FROM ' + window.gw.environment + ' WHERE  alt_type_slug = \''+ altType +'\'',
                'interactivity': ['cartodb_id', 'slug', 'alt_type_slug', 'geometry']
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

            subLayers[_altType] = layer.createSubLayer({
                sql: "SELECT *, GeometryType(the_geom) AS geometrytype FROM " + window.gw.environment + " WHERE alt_type_slug = '" + altType +"'",
                cartocss: "#layer { marker-fill: " + markerColors.shift() + " }", // TODO: Hardcoded
                interactivity: ['cartodb_id', 'slug', 'alt_type_slug', 'geometrytype']
            });

            initTooltip(_altType);

        }

        /**
         * Init tooltip
         * @param altType
         */
        function initTooltip(altType) {
            tooltips[altType] = new cdb.geo.ui.Tooltip({
                layer: subLayers[altType],
                template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
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

                        window.location.pathname += data.alt_type_slug + '/' + data.slug;
                    });

                }

            }

        }

        /**
         * Toggle layers
         */
        function initLegend(altTypes) {
            // TODO generate legend on fly from given altTypes

            var $legendContainer = $('#menu');

            /*
                Add new elements.
             */
            var compiledLegendItems = '';

            var markerIcons = ['red-circle', 'purple-circle', 'blue-circle'];

            altTypes.forEach(function(altType) {

                var altTypeSlug = altType.alt_type_slug.replace(/_/g, ' ');
                var _altTypeSlug = altType.alt_type_slug.toLowerCase();

                var iconClass = (altType.geometrytype && (altType.geometrytype == "MULTIPOLYGON" || altType.geometrytype == "POLYGON"))
                                        ? 'grey-line'
                                        : 'marker-circle ' + markerIcons.shift();

                compiledLegendItems += '<li id=' + _altTypeSlug + ' class="' + _altTypeSlug + ' legend-item selected">' +
                                         '<span class="glyphicon glyphicon-ok"></span>' +
                                         '<i class="' + iconClass + '"></i>' +
                                         '<a href="javascript:void(0)">' + altTypeSlug + '</a>' +
                                      '</li>';

            });

            $legendContainer.append(compiledLegendItems);

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
            fillOpacity: .45,
            fillColor: "#00FF00",
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
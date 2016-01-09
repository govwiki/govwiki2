$(function() {

    /**
     * window.gw.map = {
     *  id: Number
     *  vizURL: String
     *  centerLatitude: Number
     *  centerLongitude: Number
     *  zoom: Number
     *  environment: {
     *      slug: String
     *  }
     * }
     */

    window.gw.map = JSON.parse(window.gw.map);
    window.gw.slug = window.gw.map.environment.slug;

    window.gw.map.username = 'joffemd';

    /**
     * Handle possible errors
     */
    if (window.gw.map == null) {
        return cartodbError();

    // Perhaps map was uploaded recently, show wait message for user
    } else if (window.gw.map.vizUrl == null) {
        return mapOnProcessingError();
    }


    /**
     * Extend CartoDB Tooltip
     * Get Layer position
     *
     * @returns {int} Layer Position
     */
    cdb.geo.ui.Tooltip.prototype.getLayerIndex = function () {
        return this.options.layer._position;
    };

    /**
     * Initialize Carto DB
     */
    cartodb.createVis('map', window.gw.map.vizUrl, {
            scrollwheel: true,
            shareable: false,
            title: false,
            description: false,
            search: false,
            tiles_loader: true,
            center_lat: window.gw.map.centerLatitude,
            center_lon: window.gw.map.centerLongitude,
            zoom: window.gw.map.zoom
        })
        .done(function(vis, layers) {

            var map = vis.getNativeMap();

            /**
             * Layer 0 is the base layer (OpenStreetMap), layer 1 is cartodb layer
             */
            var layer = layers[1];

            var subLayerCount = layer.getSubLayerCount();
            var i = 0, subLayers = [];

            // Collect all subLayers
            for (i; i< subLayerCount; i++) {
                subLayers.push(layer.getSubLayer(i));
            }

            /**
             * Available layers
             */
            var countySubLayer, citySubLayer, schoolSubLayer, specialSubLayer;
            var tooltips, countyTooltip, cityTooltip, schoolTooltip, specialTooltip;

            /**
             * Create new SQL request
             */
            var sql = new cartodb.SQL({ user: window.gw.map.username });

            /**
             * SubLayers & tooltips initialization
             * Get unique altTypes and render new subLayers by them
             */
            sql.execute("SELECT alttypeslug FROM " + window.gw.slug + " GROUP BY alttypeslug")
                .done(function(altTypes) {

                    initSubLayers(altTypes);

                    initLegendHandlers();

                    initTooltips();

                    initSublayerHandlers();

                    fixCartodbConstrain();

                    loadFinished();

                })
                .error(function() {
                    return cartodbError();
                });

            /**
             * Create additional subLayers by altType
             *
             * @param altTypes Unique altTypes from MySQL
             */
            function initSubLayers(altTypes) {

                altTypes.rows.forEach(function(altType){

                    switch (altType.alttypeslug) {

                        case 'County':
                            initCountySubLayer();
                            break;

                        case 'City':
                            initCitySubLayer(altType.alttypeslug);
                            break;

                        case 'School_District':
                            initSchoolSubLayer(altType.alttypeslug);
                            break;

                        case 'Special_District':
                            initSpecialSubLayer(altType.alttypeslug);
                            break;

                    }

                });

            }

            /**
             * Initialization County SubLayer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initCountySubLayer() {
                countySubLayer = subLayers[0];
                countySubLayer.set({ 'interactivity': ['cartodb_id', 'slug', 'geometry'] }); // alias to template
                countySubLayer.setSQL('SELECT *, ST_AsGeoJSON(ST_Simplify(the_geom,.01)) AS geometry FROM ' + window.gw.slug + '_county');

                countyTooltip = new cdb.geo.ui.Tooltip({
                    layer: countySubLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }

            /**
             * Initialization City SubLayer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initCitySubLayer(altType) {

                citySubLayer = layer.createSubLayer({
                    sql: "SELECT * FROM " + window.gw.environment + " WHERE alttypeslug = '" + altType +"'",
                    cartocss: "#layer { marker-fill: #f00000; }", // TODO: Hardcoded
                    interactivity: 'cartodb_id, slug'
                });

                subLayers.push(citySubLayer);

                cityTooltip = new cdb.geo.ui.Tooltip({
                    layer: citySubLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }

            /**
             * Initialization School SubLayer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initSchoolSubLayer(altType) {

                schoolSubLayer = layer.createSubLayer({
                    sql: "SELECT * FROM " + window.gw.environment + " WHERE alttypeslug = '" + altType +"'",
                    cartocss: "#layer { marker-fill: #add8e6; }", // TODO: Hardcoded
                    interactivity: 'cartodb_id, slug'
                });

                subLayers.push(schoolSubLayer);

                schoolTooltip = new cdb.geo.ui.Tooltip({
                    layer: schoolSubLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }

            /**
             * Initialization Special SubLayer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initSpecialSubLayer(altType) {

                specialSubLayer = layer.createSubLayer({
                    sql: "SELECT * FROM " + window.gw.environment + " WHERE alttypeslug = '" + altType +"'",
                    cartocss: "#layer { marker-fill: #800080; }", // TODO: Hardcoded
                    interactivity: 'cartodb_id, slug'
                });

                subLayers.push(specialSubLayer);

                specialTooltip = new cdb.geo.ui.Tooltip({
                    layer: specialSubLayer,
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
                tooltips = [countyTooltip, cityTooltip, schoolTooltip, specialTooltip];

                tooltips.forEach(function (tooltip) {
                    if (tooltip != null){
                        $('#map_wrap').append(tooltip.render().el);
                    }
                });
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

                subLayers.forEach(function (layer) {

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

                            $('.cartodb-map-wrapper').css('cursor', 'pointer');

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
                            tooltips.forEach(function (tooltip) {

                                if (tooltip != null) {

                                    if (tooltip.getLayerIndex() == layerIndex) {
                                        tooltip.enable();
                                    } else {
                                        tooltip.disable();
                                    }

                                }

                            })

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
                            $('.cartodb-map-wrapper').css('cursor', 'auto');

                            removeAllHoverShapes();

                            /**
                             *  Close all tooltips, if cursor outside of layers
                             */
                            tooltips.forEach(function (tooltip) {

                                if (tooltip != null) {

                                    if (tooltip.getLayerIndex() == layerIndex) {
                                        tooltip.disable();
                                    }

                                }

                            })

                        }
                    });

                    /**
                     * Change window location after click on marker or county
                     */
                    layer.on('featureClick', function (event, latlng, pos, data, layerIndex) {

                        /**
                         * TODO: hardcoded, must be replaced on multi envirenment
                         * @type {string}
                         */
                        var altTypeSlug = '';
                        switch (layerIndex) {
                            case 0:
                                altTypeSlug = 'County';
                                break;

                            case 1:
                                altTypeSlug = 'City';
                                break;

                            case 2:
                                altTypeSlug = 'School_District';
                                break;

                            case 3:
                                altTypeSlug = 'Special_District';
                                break;
                        }

                        var governmentSlug = '';
                        governmentSlug = data.slug.replace(/ /g, '_');

                        if (altTypeSlug === '' || governmentSlug === '') {
                            alert('Please verify your data, altTypeSlug or governmentSlug may can not defined, more info in console.log');
                            console.log(data);
                            return false;
                        }

                        window.location.pathname += altTypeSlug + '/' + governmentSlug;
                    });

                });

            }

            /**
             * Toggle layers
             */
            function initLegendHandlers() {

                $('.legend-item').click(function() {
                    $(this).toggleClass('selected');
                    LayerActions[$(this).attr('id')]();
                });

                var LayerActions = {
                    counties: function(){
                        countySubLayer.toggle();
                        return true;
                    },
                    cities: function(){
                        citySubLayer.toggle();
                        return true;
                    },
                    school: function(){
                        schoolSubLayer.toggle();
                        return true;
                    },
                    special: function(){
                        specialSubLayer.toggle();
                        return true;
                    }
                };

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

        })
        // Not work, cartodb internal error
        .on('error', function() {
            return cartodbError()
        });

    /**
     * Uncaught error
     * @returns {boolean}
     */
    function cartodbError() {
        $('.loader').hide();
        var $mapProcessing = $('.mapOnProcessing');
        $mapProcessing.find('h5').eq(0).text('Something went wrong, please contact with us (contact@californiapolicycenter.org) ');
        $mapProcessing.css({"opacity":1});
        $mapProcessing.show();
        return false;
    }

    /**
     * Show perhaps error or map may can recently created and now is processing
     * @returns {boolean}
     */
    function mapOnProcessingError() {
        $('.loader').hide();
        var $mapProcessing = $('.mapOnProcessing');
        $mapProcessing.css({"opacity":1});
        $mapProcessing.show();
        return false;
    }
});

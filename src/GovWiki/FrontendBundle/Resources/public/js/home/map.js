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
     * Initialize Carto DB
     */
    cartodb.createVis('map', window.gw.map.vizUrl, {
            scrollwheel: true,
            shareable: false,
            title: false,
            description: false,
            search: false,
            tiles_loader: true,
            center_lat: 37.3,
            center_lon: -119.3,
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

            // Collect all sublayers
            for (i; i< subLayerCount; i++) {
                subLayers.push(layer.getSubLayer(i));
            }

            /**
             * Available layers
             */
            var countyLayer, cityLayer, schoolLayer, specialLayer;
            var countyTooltip, cityTooltip, schoolTooltip, specialTooltip;

            /**
             * SubLayers initialization
             */
            subLayers.forEach(function (layer, index) {

                switch (index) {
                    case 0:
                        initCountyLayer();
                        break;
                    case 1:
                        initCityLayer();
                        break;
                    case 2:
                        initSchoolLayer();
                        break;
                    case 3:
                        initSpecialLayer();
                        break;
                }

            });

            // TODO: Hardcoded, must be replaced
            initCityLayer();
            initSchoolLayer();
            initSpecialLayer();

            /**
             * Show map, legend, hide loader
             */
            $('#map').css({"opacity": 1});
            $('#menu').css({"opacity": 1});
            $('.loader').hide();

            /**
             * Initialization County Layer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initCountyLayer() {
                countyLayer = subLayers[0];
                countyLayer.set({ 'interactivity': ['cartodb_id', 'slug', 'geometry'] }); // alias to template
                countyLayer.setSQL('SELECT  *, ST_AsGeoJSON(ST_Simplify(the_geom,.01)) AS geometry FROM ' + window.gw.slug + '_county');

                countyTooltip = new cdb.geo.ui.Tooltip({
                    layer: countyLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }

            /**
             * Initialization City Layer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initCityLayer() {

                cityLayer = layer.createSubLayer({
                    sql: "SELECT * FROM " + window.gw.environment + " WHERE alttypeslug = 'City'",
                    cartocss: "#layer { marker-fill: red; }", // TODO: Hardcoded
                    interactivity: 'cartodb_id, slug'
                });

                subLayers.push(cityLayer);

                cityTooltip = new cdb.geo.ui.Tooltip({
                    layer: cityLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }

            /**
             * Initialization School Layer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initSchoolLayer() {

                schoolLayer = layer.createSubLayer({
                    sql: "SELECT * FROM " + window.gw.environment + " WHERE alttypeslug = 'School_District'",
                    cartocss: "#layer { marker-fill: blue; }", // TODO: Hardcoded
                    interactivity: 'cartodb_id, slug'
                });

                subLayers.push(schoolLayer);

                schoolTooltip = new cdb.geo.ui.Tooltip({
                    layer: schoolLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }

            /**
             * Initialization Special Layer
             *
             * Tooltip window
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */
            function initSpecialLayer() {

                specialLayer = layer.createSubLayer({
                    sql: "SELECT * FROM " + window.gw.environment + " WHERE alttypeslug = 'Special_District'",
                    cartocss: "#layer { marker-fill: purple; }", // TODO: Hardcoded
                    interactivity: 'cartodb_id, slug'
                });

                subLayers.push(specialLayer);

                specialTooltip = new cdb.geo.ui.Tooltip({
                    layer: specialLayer,
                    template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                    width: 200,
                    position: 'bottom|right'
                });
            }


            /**
             * It's necessary, otherwise county hover will not work
             */
            var $objectsPane = $('.leaflet-objects-pane');
            var $tilePane = $('.leaflet-tile-pane');

            $objectsPane.appendTo($tilePane);
            $objectsPane.css({"z-index":"100"});


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
             * Add tooltips on page
             * @type {*[]}
             */
            var tooltips = [countyTooltip, cityTooltip, schoolTooltip, specialTooltip];

            tooltips.forEach(function (tooltip) {
                if (tooltip != null){
                    $('#map_wrap').append(tooltip.render().el);
                }
            });

            var hovers = [];

            /**
             * Set handlers on SubLayers
             */
            subLayers.forEach(function(layer) {

                // Allow events on layer
                layer.setInteraction(true);

                /**
                 * Show tooltip on hover
                 * Or highlight current county
                 * It depends on the current Layer position
                 */
                layer.bind('mouseover', function(e, latlon, pxPos, data, layerIndex) {

                    // TODO: Must be deleted, when data will be replaced, now it's hardcoded
                    data.slug = data.slug.replace(/_/g, ' ');

                    hovers[layerIndex] = 1;

                    /**
                     * If hover active
                     */
                    if(_.some(hovers)) {

                        $('.cartodb-map-wrapper').css('cursor', 'pointer');

                        /**
                         * If hover on county layer
                         */
                        if (layerIndex == countyLayer._position) {
                            drawAppropriatePolygon(data);
                        } else {
                            removeAllHoverShapes();
                        }

                        /**
                         * Open current tooltip, close another
                         */
                        tooltips.forEach(function(tooltip){

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
                layer.bind('mouseout', function(layerIndex) {

                    hovers[layerIndex] = 0;

                    /**
                     * If hover not active
                     */
                    if(!_.some(hovers)) {
                        $('.cartodb-map-wrapper').css('cursor', 'auto');

                        removeAllHoverShapes();

                        /**
                         *  Close all tooltips, if cursor outside of layers
                         */
                        tooltips.forEach(function(tooltip){

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

                    window.location.pathname = altTypeSlug + '/' + governmentSlug;
                });

            });

            /**
             * Toggle layers
             */
            $('.legend-item').click(function() {
                $(this).toggleClass('selected');
                LayerActions[$(this).attr('id')]();
            });

            var LayerActions = {
                counties: function(){
                    countyLayer.toggle();
                    return true;
                },
                cities: function(){
                    cityLayer.toggle();
                    return true;
                },
                school: function(){
                    schoolLayer.toggle();
                    return true;
                },
                special: function(){
                    specialLayer.toggle();
                    return true;
                }
            };

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
        .on('error', function() {
            console.log('yes');
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

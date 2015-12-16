$(function() {

    /**
     * window.gw.map = {
     *  id: Number
     *  vizURL: String
     *  centerLatitude: Number
     *  centerLongitude: Number
     *  zoom: Number
     * }
     */

    window.gw.map = JSON.parse(window.gw.map);

    cartodb.createVis('map', 'https://dam-robert.cartodb.com/api/v2/viz/935d0bdc-9d7a-11e5-a98e-0e787de82d45/viz.json', {
            scrollwheel: true,
            shareable: false,
            title: false,
            description: false,
            search: false,
            tiles_loader: true,
            center_lat: 37.3,
            center_lon: -119.3,
            zoom: 5
        })
        .done(function(vis, layers) {

            var map = vis.getNativeMap();
            // map.setZoom(3);
            // map.panTo([50.5, 30.5]);

            // layer 0 is the base layer, layer 1 is cartodb layer
            var layer = layers[1];

            var countyLayer = layer.getSubLayer(0),
                cityLayer = layer.getSubLayer(1),
                schoolLayer = layer.getSubLayer(2),
                specialLayer = layer.getSubLayer(3);

            var sublayers = [];
            sublayers.push(countyLayer);
            sublayers.push(cityLayer);
            sublayers.push(schoolLayer);
            sublayers.push(specialLayer);

            countyLayer.set({ 'interactivity': ['cartodb_id', 'slug', 'geometry'] }); // alias to template
            cityLayer.set({ 'interactivity': ['cartodb_id', 'slug'] }); // alias to template
            schoolLayer.set({ 'interactivity': ['cartodb_id', 'slug'] }); // alias to template
            specialLayer.set({ 'interactivity': ['cartodb_id', 'slug'] }); // alias to template

            /**
             * Passing data and render layers
             */
            //var prom = countyLayer.setSQL('SELECT  *, ST_AsGeoJSON(ST_Simplify(the_geom,.01)) AS geometry FROM ' + window.gw.environment + '_county');
            //cityLayer.setSQL("SELECT * FROM " + window.gw.environment + " WHERE ");
            //schoolLayer.setSQL("SELECT * FROM school_district_ca");
            //specialLayer.setSQL("SELECT * FROM special_discrict_ca");

            var prom = countyLayer.setSQL('SELECT  *, ST_AsGeoJSON(ST_Simplify(the_geom,.01)) AS geometry FROM county_ca');
            cityLayer.setSQL("SELECT * FROM city_ca");
            schoolLayer.setSQL("SELECT * FROM school_district_ca");
            specialLayer.setSQL("SELECT * FROM special_discrict_ca");

            var $objectsPane = $('.leaflet-objects-pane');
            var $tilePane = $('.leaflet-tile-pane');

            $objectsPane.appendTo($tilePane);
            $objectsPane.css({"z-index":"100"});

            /*
             * Tooltip vindow
             * Tooltip work with 3.11-13 version, 3.15 is buggy
             */

            cdb.geo.ui.Tooltip.prototype.getLayerIndex = function () {
                return this.options.layer._position;
            };

            var countyTooltip = new cdb.geo.ui.Tooltip({
                layer: countyLayer,
                template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                width: 200,
                position: 'bottom|right'
            });

            var cityTooltip = new cdb.geo.ui.Tooltip({
                layer: cityLayer,
                template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                width: 200,
                position: 'bottom|right'
            });
//
            var schoolTooltip = new cdb.geo.ui.Tooltip({
                layer: schoolLayer,
                template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                width: 200,
                position: 'bottom|right'
            });

            var specialTooltip = new cdb.geo.ui.Tooltip({
                layer: specialLayer,
                template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                width: 200,
                position: 'bottom|right'
            });

            var tooltips = [countyTooltip, cityTooltip, schoolTooltip, specialTooltip];

            tooltips.forEach(function (tooltip) {
                $('#map_wrap').append(tooltip.render().el);
            });

            var hovers = [];

            /**
             * Set handlers on sublayers
             */
            sublayers.forEach(function(layer) {

                layer.setInteraction(true);

                layer.bind('mouseover', function(e, latlon, pxPos, data, layerIndex) {

                    // TODO: Must be deleted, when data will be replaced, now it's hardcoded
                    data.slug = data.slug.replace(/_/g, ' ');

                    hovers[layerIndex] = 1;

                    if(_.any(hovers)) {

                        $('.cartodb-map-wrapper').css('cursor', 'pointer');

                        if (layerIndex == countyLayer._position) {
                            drawAppropriatePolygon(data);
                        } else {
                            removeAllHoverShapes();
                        }

                        // Open current tooltip, close another
                        tooltips.forEach(function(tooltip){
                            if (tooltip.getLayerIndex() == layerIndex) {
                                tooltip.enable();
                            } else {
                                tooltip.disable();
                            }
                        })

                    }

                });

                layer.bind('mouseout', function(layerIndex) {
                    hovers[layerIndex] = 0;
                    if(!_.any(hovers)) {
                        $('.cartodb-map-wrapper').css('cursor', 'auto');

                        removeAllHoverShapes();

                        // Close all tooltips, if cursor outside of layers
                        tooltips.forEach(function(tooltip){
                            if (tooltip.getLayerIndex() == layerIndex) {
                                tooltip.disable();
                            }
                        })

                    }
                });

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

                    var governmentSlug = data.slug.replace(/ /g, '_');

                    window.location.pathname = altTypeSlug + '/' + governmentSlug;
                });

            });

            // Toggle layers
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
        .error(function(err) {
            console.log(err);
        });

});

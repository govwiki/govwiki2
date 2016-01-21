window.map = {};

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
 * Map exception.
 *
 * @param {string} message Error message.
 * @param {object=} cause Previous exception.
 *
 * @constructor
 */
map.MapException = function (message, cause) {
    this.message = message;
    this.cause = cause;
    this.name = 'MapException';
    if (cause) {
        this.stack = cause.stack;
    }
};

/**
 * Create new CartoDB map from named template.
 *
 * @param {string} selector
 * @param {{
 *  latitude: number,
 *  longitude: number,
 *  zoom: number
 * }} config
 *
 * @constructor
 */
map.Map = function (selector, config)
{
    /**
     * @type {map.Map}
     */
    var self = this;

    /**
     * Array of sub layers tooltips.
     *
     * @type {Array<Object>}
     * @private
     */
    this._tooltips = [];

    /**
     * Array of CartoDB sub layers.
     *
     * @type {Array<Object>}
     * @private
     */
    this._subLayers = [];

    /**
     * Map layer.
     *
     * @type {Object}
     * @private
     */
    this._map = L.map(selector, {
        scrollWheelZoom: true,
        center: [config.latitude || 0, config.longitude || 0],
        zoom: config.zoom || 3
    });

    /**
     * Initialize base map layer.
     *
     * @param {string} base_map
     * @param {string} attribution
     *
     * @returns {map.Map}
     *
     * @throws {MapException}
     */
    this.initTileLayer = function(base_map, attribution) {
        if (! base_map || ! attribution) {
            throw new map.MapException(
                'Can\'t initialize base map layer, required parameters not provided'
            );
        }

        L.tileLayer(base_map, {
            attribution: attribution
        }).addTo(this._map);

        return this;
    };

    /**
     * Initialize CartoDB layers.
     *
     * @param {string}          username     CartoDB username.
     * @param {string}          map_name     CartoDB map template name.
     * @param {function(*)} doneCallback Run when layers initialization done.
     *
     * @returns {map.Map}
     *
     * @throws {MapException}
     */
    this.initCartoDBLayers = function(username, map_name, doneCallback) {
        if (! username || ! map_name || ! doneCallback) {
            throw new map.MapException(
                'Can\'t initialize CartoDB layers, required parameters not provided'
            );
        }

        cartodb.createLayer(this._map, {
            user_name: username,
            type: 'namedmap',
            named_map: {
                name: map_name,
                layers: [
                    // County layer.
                    {
                        layer_name: 'county',
                        interactive: 'cartodb_id, alt_type_slug, slug, geometry'
                    },
                    // City layer.
                    {
                        layer_name: 'city',
                        interactive: 'cartodb_id, alt_type_slug, slug'
                    },
                    // Special District layer.
                    {
                        layer_name: 'special_district',
                        interactive: 'cartodb_id, alt_type_slug, slug'
                    },
                    // School District layer.
                    {
                        layer_name: 'school_district',
                        interactive: 'cartodb_id, alt_type_slug, slug'
                    }
                ]
            }
        })
            .addTo(this._map)
            .done(function (layer) {
                //layer.setInteraction(true);
                self._subLayers = layer.getSubLayers();

                window.test = self._subLayers;

                _initSubLayerTooltip();
                _initSublayerHandlers();
                _initLegendHandlers();

                /*
                    Leaflet fixes
                 */
                var $objectsPane = $('.leaflet-objects-pane');
                var $tilePane = $('.leaflet-tile-pane');

                $objectsPane.appendTo($tilePane);
                $objectsPane.css({"z-index":"100"});

                doneCallback(layer)
            })
            .on('error', function() {
                throw new map.MapException('Some error in CartoDB')
            });

        return this;
    };

    /**
     * Init sublayer handlers.
     * @private
     */
    function _initSubLayerTooltip()
    {
        /*
            Create tooltips of sub layers.
         */
        self._subLayers.forEach(function(subLayer) {
            self._tooltips.push(new cdb.geo.ui.Tooltip({
                layer: subLayer,
                template: '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"><p>{{slug}}</p></div></div>',
                width: 200,
                position: 'bottom|right'
            }));
        });

        /*
            Append tooltips to map.
         */
        self._tooltips.forEach(function (tooltip) {
            if (tooltip != null){
                $('#map_wrap').append(tooltip.render().el);
            }
        });
    }

    /**
     * Init sublayer handlers.
     *
     * @private
     */
    function _initSublayerHandlers()
    {
        /**
         * @type {Array<boolean>}
         */
        var hovers = [];

        self._subLayers.forEach(function (layer) {
            // Allow events on layer
            layer.setInteraction(true);

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

            /**
             * @param {{cartodb_id: number, geometry: object}} data Interactive data.
             */
            function drawAppropriatePolygon(data){
                removeAllHoverShapes();
                polygon = new L.GeoJSON(JSON.parse(data.geometry), {
                    style: polygon_style
                });
                self._map.addLayer(polygon);
                polygon.cartodb_id = data.cartodb_id;
            }

            /**
             *
             */
            function removeAllHoverShapes(){
                self._map.removeLayer(polygon);
                polygon.cartodb_id = null;
            }

            /*
             * Show tooltip on hover
             * Or highlight current county
             * It depends on the current Layer position
             */
            layer.bind('mouseover', function (e, latlon, pxPos, data, layerIndex) {
                hovers[layerIndex] = true;

                /*
                 * If hover active
                 */
                if (_.some(hovers)) {

                    $('.cartodb-map-wrapper').css('cursor', 'pointer');

                    /*
                     * If hover on county layer
                     */
                    if (layerIndex == 0) {
                        drawAppropriatePolygon(data);
                    } else {
                        removeAllHoverShapes();
                    }

                    /*
                     * Open current tooltip, close another
                     */
                    self._tooltips.forEach(function (tooltip) {

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

            /*
             * Hide tooltip on hover
             * Or remove highlight on current county
             * It depends on the current Layer position
             */
            layer.bind('mouseout', function (layerIndex) {

                hovers[layerIndex] = false;

                /*
                 * If hover not active
                 */
                if (!_.some(hovers)) {
                    $('.cartodb-map-wrapper').css('cursor', 'auto');

                    removeAllHoverShapes();

                    /*
                     *  Close all tooltips, if cursor outside of layers
                     */
                    self._tooltips.forEach(function (tooltip) {

                        if (tooltip != null) {

                            if (tooltip.getLayerIndex() == layerIndex) {
                                tooltip.disable();
                            }

                        }

                    })

                }
            });

            /*
             * Change window location after click on marker or county
             */
            layer.on('featureClick', function (event, latlng, pos, data, layerIndex) {
                if (!data.alt_type_slug || !data.slug) {
                    alert('Please verify your data, altTypeSlug or governmentSlug may can not defined, more info in console.log');
                    console.log(data);
                    return false;
                }
                window.location.pathname += data.alt_type_slug + '/' + data.slug;
            });

        });
    }

    /**
     * Set callbacks for legend.
     *
     * @private
     */
    function _initLegendHandlers() {

        $('.legend-item').click(function() {
            $(this).toggleClass('selected');
            LayerActions[$(this).attr('id')]();
        });

        var LayerActions = {
            counties: function(){
                self._subLayers[0].toggle();
                //self._map.eachLayer(function (layer) {
                //    layer.redraw();
                //});
                return true;
            },
            cities: function(){
                self._subLayers[1].toggle();
                return true;
            },
            school: function(){
                self._subLayers[2].toggle();
                return true;
            },
            special: function(){
                self._subLayers[3].toggle();
                return true;
            }
        };

    }
};
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

    /*
        Prepare config for map.
     */
    var config = {
        latitude: window.gw.map.centerLatitude,
        longitude: window.gw.map.centerLongitude,
        zoom: window.gw.map.zoom
    };

    try {
        var map = new window.map.Map('map', config);

        map
            .initTileLayer(
                'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                'GovWiki'
            )
            .initCartoDBLayers(
                window.gw.map.username,
                window.gw.environment,
                function() {
                    $('#map').css({"opacity": 1});
                    $('#menu').css({"opacity": 1});
                    $('.loader').hide();
                }
            );

    } catch (e) {
        $('.loader').hide();
        var $mapProcessing = $('.mapOnProcessing');
        $mapProcessing.find('h5').eq(0).text('Something went wrong, please contact with us (contact@californiapolicycenter.org) ');
        $mapProcessing.css({"opacity":1});
        $mapProcessing.show();
        console.log(e.name +': '+ e.message);
    }
});
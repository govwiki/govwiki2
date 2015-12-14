
map = new GMaps({
    el: '#govmap',
    lat: 37.3,
    lng: -119.3,
    zoom: 6,
    minZoom: 6,
    scrollwheel: true,
    mapTypeControl: false,
    panControl: false,
    zoomControl: true,
    zoomControlOptions:{
        style: google.maps.ZoomControlStyle.SMALL
    },
    markerClusterer: function (map) {
        options = {
            textSize: 14,
            textColor: 'red',
            gridSize: 0,
            minimumClusterSize: 5,
            ignoreHidden: true,
            legend: {
                "City":"red",
                "School District" : "blue",
                "Special District" : "purple"
            }
        };

        return new MarkerClusterer(map, [], options);
    }

});

$.ajax({
    url:"/api/government/get-markers-data",
    data: { limit: 100 },
    dataType: 'json',
    cache: true,
    success: function (success) {

        success.forEach(function (rec) {

            marker = new google.maps.Marker({
                position: new google.maps.LatLng(rec.latitude, rec.longitude),
                title:  rec.name + ' ' + rec.type,
                type: rec.altType
            });

            marker.addListener('click', function (e) {
                window.location.pathname = '/app_dev.php/' + rec.altTypeSlug + '/' + rec.slug;
            });

            map.markerClusterer.addMarker(marker, true);

        });

    },
    error: function (err) {
        console.log(err);
    }
});



// Modal

function showModal(target) {
    $("#modal-window .modal-content").load(target, function() {
        $("#modal-window").modal("show");
    });
}

$('#modal-window').on('hidden.bs.modal', function() {
    $(this).find('.modal-content').html('<div class="modal-body">Loading...</div>');
});

// Login

$('body').on('submit', '#ajax-login-form', function(event) {
    event.preventDefault();
    $form = $(this);
    $form.parent().find('.alert').remove();
    $.post($form.attr('action'), $form.serialize(), function(data) {
        if (data.error) {
            $form.parent().prepend('<div class="alert alert-warning">' + data.error + '</div>');
        } else {
            location.reload();
        };
    });
});

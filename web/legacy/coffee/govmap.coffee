bounds_timeout=undefined


map = new GMaps
  el: '#govmap'
  lat: 37.3
  lng: -119.3
  zoom: 6
  minZoom: 6
  scrollwheel: true
  mapTypeControl: false
  panControl: false
  mapTypeControl: false
  zoomControl: true
  zoomControlOptions:
    style: google.maps.ZoomControlStyle.SMALL
  markerClusterer: (map) ->
    options = {
      gridSize: 0,
      minimumClusterSize: 5 # Allow minimum 5 marker in cluster.
      ignoreHidden: true # Don't show hidden markers.
      # In some reason don't work :(
    }
    return new MarkerClusterer(map, [], options);

map.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('legend'))

rerender_markers = ->
  add_marker(rec) for rec in GOVWIKI.markers

rebuild_filter = ->
  hard_params = ['City', 'School District', 'Special District', 'County']
  GOVWIKI.gov_type_filter_2 = []
  $('.type_filter').each (index, element) ->
    if $(element).attr('name') in hard_params and $(element).val() == '1'
      GOVWIKI.gov_type_filter_2.push $(element).attr('name')

# legendType = city, school district, special district, counties
get_records2 = (legendType, onsuccess) ->
  $.ajax
    url:"/api/government/get-markers-data"
#    url:"http://45.55.0.145/api/government/get-markers-data"
    data: { altTypes: legendType, limit: 5000 }
    dataType: 'json'
    cache: true
    success: onsuccess
    error:(e) ->
      console.log e

$ ->

  rebuild_filter()
  get_records2 GOVWIKI.gov_type_filter_2, (data) ->
    GOVWIKI.markers = data;
    rerender_markers()

  $('#legend li:not(.counties-trigger)').on 'click', ->
    $(this).toggleClass('active')
    hidden_field = $(this).find('input')
    value = hidden_field.val()
    hidden_field.val(if value == '1' then '0' else '1')
    #
    # Clicked legend alt type.
    altType = hidden_field.attr('name')

    rebuild_filter()

    #
    # Toggle marker visible with type equal to clicked legend.
    #
    for marker in map.markers
      if marker.type is altType
        # Remove|add markers from cluster because MarkerCluster ignore
        # his option 'ignoreHidden'.
        if (value is '1')
          map.markerClusterer.removeMarker(marker, true)
        else
          map.markerClusterer.addMarker(marker, true)
#        marker.setVisible(! marker.getVisible())

    map.markerClusterer.repaint();
    console.log(map.markerClusterer);

  $('#legend li.counties-trigger').on 'click', ->
    $(this).toggleClass('active')
    if $(this).hasClass('active')
      #
      # Show counties.
      #
      for polygon in map.polygons
        polygon.setVisible(true)
    else
      #
      # Hide counties.
      #
      for polygon in map.polygons
        polygon.setVisible(false)





get_icon =(alt_type) ->

  _circle =(color)->
    path: google.maps.SymbolPath.CIRCLE
    fillOpacity: 1
    fillColor: color
    strokeWeight: 1
    strokeColor: 'white'
    #strokePosition: google.maps.StrokePosition.OUTSIDE
    scale: 6

  switch alt_type
    when 'City' then return _circle 'red'
    when 'School District' then return _circle 'blue'
    when 'Special District' then return _circle 'purple'
    else return _circle 'white'

in_array = (my_item, my_array) ->
  for item in my_array
    return true if item == my_item
  false


add_marker = (rec)->
  #console.log "#{rec.rand} #{rec.inc_id} #{rec.zip} #{rec.latitude} #{rec.longitude} #{rec.gov_name}"
  exist = in_array rec.altType, GOVWIKI.gov_type_filter_2
  if exist is false then return false

  marker = new google.maps.Marker({
    position: new google.maps.LatLng(rec.latitude, rec.longitude),
    icon: get_icon(rec.altType),
    title:  "#{rec.name}, #{rec.type}",
    #
    # For legend click handler.
    type: rec.altType
  })
  #
  # On click redirect user to entity page.
  #
  marker.addListener 'click', () ->
    window.location = "#{rec.altTypeSlug}/#{rec.slug}"
  map.addMarker marker

#  map.addMarker
#    lat: rec.latitude
#    lng: rec.longitude
#    icon: get_icon(rec.altType)
#    title:  "#{rec.name}, #{rec.type}"
#    infoWindow:
#      content: "
#        <div><a href='javascript:void(0);' class='info-window-uri' data-uri='/#{rec.altTypeSlug}/#{rec.slug}'><strong>#{rec.name}</strong></a></div>
#        <div> #{rec.type}  #{rec.city} #{rec.zip} #{rec.state}</div>"



# GEOCODING ========================================

pinImage = new (google.maps.MarkerImage)(
  'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF' ,
  new (google.maps.Size)(21, 34),
  new (google.maps.Point)(0, 0),
  new (google.maps.Point)(10, 34)
  )


geocode_addr = (addr,data) ->
  GMaps.geocode
    address: addr
    callback: (results, status) ->
      if status == 'OK'
        latlng = results[0].geometry.location
        map.setCenter latlng.lat(), latlng.lng()
        map.addMarker
          lat: latlng.lat()
          lng: latlng.lng()
          size: 'small'
          title: results[0].formatted_address
          infoWindow:
            content: results[0].formatted_address

        if data
          map.addMarker
            lat: data.latitude
            lng: data.longitude
            size: 'small'
            color: 'blue'
            icon: pinImage
            title:  "#{data.latitude} #{data.longitude}"
            infoWindow:
              content: "#{data.latitude} #{data.longitude}"

        $('.govmap-found').html "<strong>FOUND: </strong>#{results[0].formatted_address}"
      return


module.exports =
  map: map

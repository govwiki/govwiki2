bounds_timeout=undefined


map = new GMaps
  el: '#govmap'
  lat: 37.3
  lng: -119.3
  zoom: 6
  minZoom: 6
  scrollwheel: true
  panControl: false
  zoomControl: true
  zoomControlOptions:
    style: google.maps.ZoomControlStyle.SMALL

map.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('legend'))

rerender_markers = ->
  add_marker(rec) for rec in GOVWIKI.markers

rebuild_filter = ->
  hard_params = ['City', 'School District', 'Special District']
  GOVWIKI.gov_type_filter_2 = []
  $('.type_filter').each (index, element) ->
    if $(element).attr('name') in hard_params and $(element).val() == '1'
      GOVWIKI.gov_type_filter_2.push $(element).attr('name')

# legendType = city, school district, special district, counties
get_records2 = (legendType, onsuccess) ->
  $.ajax
    url:"http://45.55.0.145/api/government/get-markers-data"
    data: { altTypes: legendType }
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
    rebuild_filter()
    map.removeMarkers()
    rerender_markers()

  $('#legend li.counties-trigger').on 'click', ->
    $(this).toggleClass('active')
    if $(this).hasClass('active') then GOVWIKI.get_counties GOVWIKI.draw_polygons else map.removePolygons()




get_icon =(alt_type) ->

  _circle =(color)->
    path: google.maps.SymbolPath.CIRCLE
    fillOpacity: 1
    fillColor:color
    strokeWeight: 1
    strokeColor:'white'
    #strokePosition: google.maps.StrokePosition.OUTSIDE
    scale:6

  switch alt_type
    when 'City' then return _circle 'red'
    when 'School District' then return _circle 'lightblue'
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
  map.addMarker
    lat: rec.latitude
    lng: rec.longitude
    icon: get_icon(rec.altType)
    title:  "#{rec.gov_name}, #{rec.type}"
    infoWindow:
      content: "
        <div><a href='javascript:void(0);' class='info-window-uri' data-uri='/#{rec.altTypeSlug}/#{rec.slug}'><strong>#{rec.name}</strong></a></div>
        <div> #{rec.type}  #{rec.city} #{rec.zip} #{rec.state}</div>"


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

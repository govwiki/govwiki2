###
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
###

GovSelector = require './govselector.coffee'
#_jqgs       = require './jquery.govselector.coffee'
Templates2 = require './templates2.coffee'
wikipedia = require './wikipedia.coffee'

govmap = null
gov_selector = null
templates = new Templates2
active_tab = ""
undef = null

Handlebars.registerHelper 'if_eq', (a, b, opts) ->
    if `a == b`
        return opts.fn this
    else
        return opts.inverse this

window.GOVWIKI =
    state_filter: ''
    gov_type_filter: ''
    gov_type_filter_2: ['City', 'School District', 'Special District']

    show_search_page: () ->
        $('#dataContainer').hide()
        $('#searchIcon').hide()
        $('#searchContainer').fadeIn(300)
        focus_search_field 500

    show_data_page: () ->
        $('#searchIcon').show()
        $('#dataContainer').fadeIn(300)
        $('#searchContainer').hide()

GOVWIKI.get_counties = get_counties = (callback) ->
    $.ajax
        url: 'data/county_geography_ca_2.json'
        dataType: 'json'
        cache: true
        success: (countiesJSON) ->
            callback countiesJSON

GOVWIKI.draw_polygons = draw_polygons = (countiesJSON) ->
    for county in countiesJSON.features
        do (county) =>
            govmap.map.drawPolygon({
                paths: county.geometry.coordinates
                useGeoJSON: true
                strokeColor: '#808080'
                strokeOpacity: 0.6
                strokeWeight: 1.5
                fillColor: '#FF0000'
                fillOpacity: 0.15
                countyId: county.properties._id
                altName: county.properties.alt_name
                marker: new MarkerWithLabel({
                    position: new google.maps.LatLng(0, 0),
                    draggable: false,
                    raiseOnDrag: false,
                    map: govmap.map.map,
                    labelContent: county.properties.name,
                    labelAnchor: new google.maps.Point(-15, 25),
                    labelClass: "label-tooltip",
                    labelStyle: {opacity: 1.0},
                    icon: "http://placehold.it/1x1",
                    visible: false
                })
                mouseover: ->
                    this.setOptions({fillColor: "#00FF00"})
                mousemove: (event) ->
                    this.marker.setPosition(event.latLng)
                    this.marker.setVisible(true)
                mouseout: ->
                    this.setOptions({fillColor: "#FF0000"})
                    this.marker.setVisible(false)
                click: ->
                    $('.loader').show()
                    $('#searchContainer').hide()
                    $('#dataContainer').show()
                    uri = "/#{county.alt_type_slug}/#{county.properties.slug}"
                    $.ajax
                        url: "http://45.55.0.145/api/government" + uri,
                        dataType: 'json'
                        cache: true
                        success: (govs) ->
                            compiled_gov_template = templates.get_html(0, govs)
                            $('#details').html compiled_gov_template
                            $('.loader').hide()
                            $('#details').show()
                            $('#searchIcon').show()
                            window.history.pushState {template: compiled_gov_template}, 'CPC Civic Profiles', uri
        })

window.remember_tab = (name)-> active_tab = name

$(document).on 'click', '#fieldTabs a', (e) ->
    active_tab = $(e.currentTarget).data('tabname')
    console.log active_tab
    $("#tabsContent .tab-pane").removeClass("active")
    $($(e.currentTarget).attr('href')).addClass("active")
    templates.activate 0, active_tab

    if active_tab == 'Financial Statements'
        finValWidthMax1 = 0
        finValWidthMax2 = 0
        finValWidthMax3 = 0

        $('.fin-values-block [data-col="1"]').find('.fin-val').each () ->
            thisFinValWidth = $(this).width()

            if thisFinValWidth > finValWidthMax1
                finValWidthMax1 = thisFinValWidth

        $('.fin-values-block [data-col="2"]').find('.fin-val').each () ->
            thisFinValWidth = $(this).width()

            if thisFinValWidth > finValWidthMax2
                finValWidthMax2 = thisFinValWidth

        $('.fin-values-block [data-col="3"]').find('.fin-val').each () ->
            thisFinValWidth = $(this).width()

            if thisFinValWidth > finValWidthMax3
                finValWidthMax3 = thisFinValWidth

        $('.fin-values-block [data-col="1"] .currency-sign').css('right', finValWidthMax1 + 27)
        $('.fin-values-block [data-col="2"] .currency-sign').css('right', finValWidthMax2 + 27)
        $('.fin-values-block [data-col="3"] .currency-sign').css('right', finValWidthMax3 + 27)


$(document).tooltip({selector: "[class='media-tooltip']", trigger: 'click'})

activate_tab = () ->
    $("#fieldTabs a[href='#tab#{active_tab}']").tab('show')


get_record2 = (recid) ->
# clear wikipedia place
    $("#wikipediaContainer").html("")
    $.ajax
        url: "http://46.101.3.79:80/rest/db/govs/#{recid}"
        dataType: 'json'
        headers: {"X-DreamFactory-Application-Name": "govwiki"}
        cache: true
        success: (data) ->
            if data
                get_financial_statements data._id, (data2, textStatus, jqXHR) ->
                    data.financial_statements = data2
                    get_elected_officials data._id, 25, (data3, textStatus2, jqXHR2) ->
                        data.elected_officials = data3
                        get_max_ranks (max_ranks_response) ->
                            data.max_ranks = max_ranks_response.record[0]
                            #TODO: Enable after realize max_ranks api
                            #$('#details').html templates.get_html(0, data)
                            #console.log templates.get_html(0, data)
                            activate_tab()

            # fill wikipedia place
            #wpn = data.wikipedia_page_name
            #$("#wikipediaContainer").html(if wpn then wpn else "No Wikipedia article")

            return
        error: (e) ->
            console.log e


get_elected_officials = (alt_type, gov_name, onsuccess) ->
    $.ajax
        url: "http://46.101.3.79/api/government/" + alt_type + '/' + gov_name
        dataType: 'json'
        cache: true
        success: onsuccess
        error: (e) ->
            console.log e

get_financial_statements = (gov_id, onsuccess) ->
    $.ajax
        url: "http://46.101.3.79:80/rest/db/_proc/get_financial_statements"
        data:
            app_name: "govwiki"
            order: "caption_category,display_order"
            params: [
                name: "govs_id"
                param_type: "IN"
                value: gov_id
            ]

        dataType: 'json'
        cache: true
        success: onsuccess
        error: (e) ->
            console.log e


get_max_ranks = (onsuccess) ->
    $.ajax
        url: 'http://46.101.3.79:80/rest/db/max_ranks'
        data:
            app_name: 'govwiki'
        dataType: 'json'
        cache: true
        success: onsuccess

window.GOVWIKI.show_record = (rec)=>
    $('#details').html templates.get_html(0, rec)
    activate_tab()
    GOVWIKI.show_data_page()
    router.navigate(rec._id)


window.GOVWIKI.show_record2 = (rec)=>
    get_elected_officials rec.altTypeSlug, rec.slug, (data, textStatus, jqXHR) ->
        rec.elected_officials = data
        $('#details').html templates.get_html(0, rec)
        #get_record2 rec.id
        activate_tab()
        GOVWIKI.show_data_page()
        url = rec.altTypeSlug + '/' + rec.slug
        document.location.pathname = url


build_selector = (container, text, command, where_to_store_value) ->
    $.ajax
        url: 'https://api.mongolab.com/api/1/databases/govwiki/runCommand?apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y'
        type: 'POST'
        contentType: "application/json"
        dataType: 'json'
        data: command #JSON.stringify(command)
        cache: true
        success: (data) =>
            values = data.values
            build_select_element container, text, values.sort(), where_to_store_value
            return
        error: (e) ->
            console.log e


build_select_element = (container, text, arr, where_to_store_value) ->
    s = "<select class='form-control' style='maxwidth:160px;'><option value=''>#{text}</option>"
    s += "<option value='#{v}'>#{v}</option>" for v in arr when v
    s += "</select>"
    select = $(s)
    $(container).append(select)

    # set default 'CA'
    if text is 'State..'
        select.val 'CA'
        window.GOVWIKI.state_filter = 'CA'

    select.change (e) ->
        el = $(e.target)
        window.GOVWIKI[where_to_store_value] = el.val()
        $('.gov-counter').text gov_selector.count_govs()

adjust_typeahead_width = () ->
    inp = $('#myinput')
    par = $('#typeahed-container')
    inp.width par.width()


start_adjusting_typeahead_width = () ->
    $(window).resize ->
        adjust_typeahead_width()

focus_search_field = (msec) ->
    setTimeout (-> $('#myinput').focus()), msec


# quick and dirty fix for back button in browser
window.onhashchange = (e) ->
    h = window.location.hash
    if not h
        GOVWIKI.show_search_page()

# =====================================================================

GOVWIKI.history = (index) ->
    if index == 0
        searchContainer = $('#searchContainer').text();
        if(searchContainer != '')
            window.history.pushState {}, 'CPC Civic Profiles', '/'
            $('#searchIcon').hide()
        else
            document.location.pathname = '/'
        $('#details').hide()
        $('#searchContainer').show()
        return false
    window.history.go(index)


window.addEventListener 'popstate', (event) ->
    if window.history.state isnt null
        $('#details').html event.state.template
        route = document.location.pathname.split('/').length-1;
        if route is 2 then $('#stantonIcon').hide()
        if route is 1 then $('#searchContainer').show()
    else
        document.location.reload()


$('#dataContainer').on 'click', '.elected_link', (e) ->
    e.preventDefault();
    url = e.target.pathname
    $('#details').hide()
    $('#searchContainer').hide()
    $('#dataContainer').show()
    $('#wikipediaContainer').hide()
    $('.loader').show()
    $('#stantonIcon').show()
    $('#searchIcon').show()
    jQuery.get url, {}, (data) ->
        if data
            $.ajax
                url: "http://45.55.0.145/api/elected-official" + url,
                dataType: 'json'
                cache: true
                success: (data) ->

                    person = data[0]

                    format = {year: 'numeric', month: 'numeric', day: 'numeric'};
                    person.votes.forEach (item, itemList) ->
                        date = new Date item.legislation.date_considered;
                        item.legislation.date_considered = date.toLocaleString 'en-US', format

                    tpl = $('#person-info-template').html()
                    compiledTemplate = Handlebars.compile(tpl)
                    $('.loader').hide()
                    $('#details').show()
                    html = compiledTemplate(person)
                    window.history.pushState {template: html}, 'CPC Politician Profiles', url
                    $('#details').html html
                    $('#dataContainer').css('display': 'block');

                    $('.vote').on 'click', (e) ->
                        id = e.currentTarget.id
                        # If legislationName is undefined use person name
                        name = e.currentTarget.dataset.legislationName
                        if name is undefined then name = person.full_name
                        $('#myModalLabel').text(name + ' (' + person.gov_alt_name + ')');
                        $('#conversation').modal 'show'
                        refresh_disqus id, 'http://govwiki.us' + '/' + id, name
                    $('#stantonIcon a').text 'Return to ' + person.gov_alt_name
                    window.DISQUSWIDGETS.getCount()

                error: (e) ->
                    console.log e


route = document.location.pathname.split('/').filter((itm)-> if itm isnt "" then itm else false).length;
console.log route
# Route /
if route is 0
    $('#stantonIcon').hide()
    gov_selector = new GovSelector '.typeahead', '/data/h_types_ca_2.json', 7
    gov_selector.on_selected = (evt, data, name) ->
        $('#details').hide()
        $('#searchContainer').hide()
        $('#dataContainer').show()
        $('.loader').show()
        $('#wikipediaContainer').hide()
        $('#stantonIcon').hide()
        url = '/' + data.altTypeSlug + '/' + data.slug
        jQuery.get url, {}, (data) ->
            if data
                $.ajax
                    url: "http://45.55.0.145/api/government" + url,
                    dataType: 'json'
                    cache: true
                    success: (elected_officials_data) ->
                        govs = elected_officials_data
                        $('.loader').hide()
                        $('#details').show()
                        compiled_gov_template = templates.get_html(0, govs)
                        window.history.pushState {template: compiled_gov_template}, 'CPC Civic Profiles', url
                        $('#details').html compiled_gov_template
                        activate_tab()
                        GOVWIKI.show_data_page()
                    error: (e) ->
                        console.log e
    if !undef
        $('#searchContainer').html $('#search-container-template').html()
        # Load introductory text from texts/intro-text.html to #intro-text container.
        $.get "texts/intro-text.html", (data) -> $("#intro-text").html data
        govmap = require './govmap.coffee'
        get_counties GOVWIKI.draw_polygons
        undef = true
        $('.loader').hide()
    adjust_typeahead_width()
    start_adjusting_typeahead_width()

    $('#btnBackToSearch').click (e)->
        e.preventDefault()
        GOVWIKI.show_search_page()

    templates.load_fusion_template "tabs", "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201z2oXQEYQ3p2OoMI8V5gKgHWB5Tz990BrQ1xc1tVo&key=AIzaSyCXDQyMDpGA2g3Qjuv4CDv7zRj-ix4IQJA"
    $('#govmap').on 'click', '.info-window-uri', (e) ->
        uri = e.target.parentNode.dataset.uri
        $('.loader').show()
        $('#searchContainer').hide()
        $('#dataContainer').show()
        $.ajax
            url: "http://45.55.0.145/api/government" + uri,
            dataType: 'json'
            cache: true
            success: (govs) ->
                compiled_gov_template = templates.get_html(0, govs)
                $('#details').html compiled_gov_template
                $('.loader').hide()
                $('#details').show()
                $('#searchIcon').show()
                window.history.pushState {template: compiled_gov_template}, 'CPC Civic Profiles', uri

# Route /:alt_name/:city_name
if route is 2
    document.title = 'CPC Civic Profiles'
    $('#details').hide()
    $('#dataContainer').show()
    $('.loader').show()
    $('#wikipediaContainer').hide()
    $('#stantonIcon').hide()
    templates.load_fusion_template "tabs", "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201z2oXQEYQ3p2OoMI8V5gKgHWB5Tz990BrQ1xc1tVo&key=AIzaSyCXDQyMDpGA2g3Qjuv4CDv7zRj-ix4IQJA"
    $.ajax
        url: "http://45.55.0.145/api/government" + window.path,
        dataType: 'json'
        cache: true
        success: (elected_officials_data) ->
            govs = elected_officials_data
            $('.loader').hide()
            $('#details').show()
            $('#details').html templates.get_html(0, govs)
            #get_record2 data.id
            activate_tab()
            GOVWIKI.show_data_page()
        error: (e) ->
            console.log e

    $('#btnBackToSearch').click (e)->
        e.preventDefault()
        GOVWIKI.show_search_page()

# Route /:alt_name/:city_name/:elected_name
if route is 3
    document.title = 'CPC Politician Profiles'
    $('#details').hide()
    $('#searchContainer').hide()
    $('#dataContainer').show()
    $('#wikipediaContainer').hide()
    $('.loader').show()
    $('#stantonIcon').show()
    $('#searchIcon').show()
    $.ajax
        url: "http://45.55.0.145/api/elected-official" + window.path,
        dataType: 'json'
        success: (data) ->

            person = data[0]

            format = {year: 'numeric', month: 'numeric', day: 'numeric'};
            person.votes.forEach (item, itemList) ->
                date = new Date item.legislation.date_considered;
                item.legislation.date_considered = date.toLocaleString 'en-US', format

            tpl = $('#person-info-template').html()
            compiledTemplate = Handlebars.compile(tpl)
            $('.loader').hide()
            $('#details').show()
            html = compiledTemplate(person)

            $('#details').html html
            $('#dataContainer').css('display': 'block');

            $('.vote').on 'click', (e) ->
                id = e.currentTarget.id
                # If legislationName is undefined use person name
                name = e.currentTarget.dataset.legislationName
                if name is undefined then name = person.full_name
                $('#myModalLabel').text(name + ' (' + person.gov_alt_name + ')');
                $('#conversation').modal 'show'
                refresh_disqus id, 'http://govwiki.us' + '/' + id, name
            $('#stantonIcon a').text 'Return to ' + person.gov_alt_name
            window.DISQUSWIDGETS.getCount()

        error: (e) ->
            console.log e

        # Refresh Disqus thread
        refresh_disqus = (newIdentifier, newUrl, newTitle) ->
            DISQUS.reset
                reload: true,
                config: () ->
                    this.page.identifier = newIdentifier
                    this.page.url = newUrl
                    this.page.title = newTitle

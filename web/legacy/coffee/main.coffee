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
authorized = false

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
        url: '/legacy/data/county_geography_ca_2.json'
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

route = document.location.pathname.split('/').filter((itm)-> if itm isnt "" then itm else false);
routeType = route.length;

GOVWIKI.history = (index) ->
    if index == 0
        searchContainer = $('#searchContainer').text();
        if(searchContainer != '')
            window.history.pushState {}, 'CPC Civic Profiles', '/'
            $('#searchIcon').hide()
            $('#stantonIcon').hide()
        else
            document.location.pathname = '/'
        $('#details').hide()
        $('#searchContainer').show()
        return false
    if (history.state != null && history.state.template != undefined)
        window.history.go(index);
    else
        route.pop()
        document.location.pathname = '/' + route.join('/')

window.addEventListener 'popstate', (event) ->
    console.log(window.history.state)
    if window.history.state isnt null
        $('#details').html event.state.template
        route = document.location.pathname.split('/').length-1;
        if route is 2 then $('#stantonIcon').hide()
        if route is 1 then $('#searchContainer').show()
        GOVWIKI.show_data_page()
    else
        GOVWIKI.show_search_page()
#    else
#        document.location.reload()

# Refresh Disqus thread
refresh_disqus = (newIdentifier, newUrl, newTitle) ->
    DISQUS.reset
        reload: true,
        config: () ->
            this.page.identifier = newIdentifier
            this.page.url = newUrl
            this.page.title = newTitle

#
# Sort table by column.
# @param string table  JQuery selector.
# @param number colNum Column number.
#
sortTable = (table, colNum) ->
    #
    # Data rows to sort
    #
    rows = $(table + ' tbody  [data-id]').get()
    #
    # Last row which contains "Add new ..."
    #
    lastRow = $(table + ' tbody  tr:last').get();
    #
    # Clicked column.
    #
    column = $(table + ' tbody tr:first').children('th').eq(colNum)
    makeSort = true

    if column.hasClass('desc')
      #
      # Table currently sorted in descending order.
      # Restore row order.
      #
      column.removeClass('desc').addClass('origin')
      rows = column.data('origin')
      makeSort = false;
    else if column.hasClass('asc')
      #
      # Table currently sorted in ascending order.
      # Sort in desc order.
      #
      column.removeClass('asc').addClass('desc')
      sortFunction = (a, b) ->
        A = $(a).children('td').eq(colNum).text().toUpperCase()
        B = $(b).children('td').eq(colNum).text().toUpperCase()
        if A < B then return 1
        if A > B then return -1
        return 0

    else if column.hasClass('origin')
      #
      # Original table data order.
      # Sort in asc order.
      #
      column.addClass('asc')
      sortFunction = (a, b) ->
        A = $(a).children('td').eq(colNum).text().toUpperCase()
        B = $(b).children('td').eq(colNum).text().toUpperCase()
        if A < B then return -1
        if A > B then return 1
        return 0
    else
      #
      # Table not ordered yet.
      # Store original data position and sort in asc order.
      #

      column.addClass('asc')
      column.data('origin', rows.slice(0))

      sortFunction = (a, b) ->
        A = $(a).children('td').eq(colNum).text().toUpperCase()
        B = $(b).children('td').eq(colNum).text().toUpperCase()
        if A < B then return -1
        if A > B then return 1
        return 0

    if (makeSort) then rows.sort sortFunction
    $.each rows, (index, row) ->
        $(table).children('tbody').append(row)
    $(table).children('tbody').append(lastRow)

initTableHandlers = (person) ->
    $('[data-toggle="tooltip"]').tooltip()

    $('.editable').editable({stylesheets: false,type: 'textarea', showbuttons: 'bottom', display: true, emptytext: ' '})
    $('.editable').off('click');

    $('table').on 'click', '.glyphicon-pencil', (e) ->
        e.preventDefault();
        e.stopPropagation();
        if e.currentTarget.dataset.noEditable isnt undefined then return
        if (!authorized)
            $.ajax '/editrequest/new', {
                method: 'POST',
                complete: (response) ->
                    if response.status is 401
                        showModal('/login')
                    else if response.status is 200
                        authorized = true
                        $(e.currentTarget).closest('td').find('.editable').editable('toggle');
                error: (error) ->
                    if error.status is 401 then showModal('/login')
            }
        else
            $(e.currentTarget).closest('td').find('.editable').editable('toggle');

    #
    # Add sort handlers.
    #
    $('.sort').on 'click', (e) ->
      e.preventDefault()
      e.stopPropagation()
      type = $(this).attr('data-sort-type')

      if type is 'year'
        #
        # Sort by year.
        #
        sortTable('[data-entity-type="Contribution"]', 0)
      else if type is 'name'
        #
        # Sort by name.
        #
        sortTable('[data-entity-type="Contribution"]', 1)
      else if type is 'amount'
        #
        # Sort by amount.
        #
        sortTable('[data-entity-type="Contribution"]', 3)

    $('a').on 'save', (e, params) ->
        entityType = $(e.currentTarget).closest('table')[0].dataset.entityType
        id = $(e.currentTarget).closest('tr')[0].dataset.id
        field = Object.keys($(e.currentTarget).closest('td')[0].dataset)[0]
        sendObject = {
            editRequest: {
                entityName: entityType,
                entityId: id,
                changes: {}
            }
        }
        sendObject.editRequest.changes[field] = params.newValue
        sendObject.editRequest = JSON.stringify(sendObject.editRequest);
        console.log sendObject
        $.ajax '/editrequest/create', {
            method: 'POST',
            data: sendObject,
            dataType: 'text/json',
            success: (response) ->
                text = JSON.parse(response.responseText)
            error: (error) ->
                if error.status is 401 then showModal('/login')
        }

    $('table').on 'click', '.add', (e) ->
        tabPane = $(e.target).closest('.tab-pane')
        tableType = tabPane[0].id
        if (!authorized)
          $.ajax '/editrequest/new', {
            method: 'POST',
            complete: (response) ->
              if response.status is 401
                showModal('/login')
              else if response.status is 200
                authorized = true
            error: (error) ->
              if error.status is 401 then showModal('/login')
          }
          return false;

#        if (!authorized) then return false;

#        if (!authorized)
#            $.ajax '/editrequest/new', {
#                method: 'POST',
#                complete: (response) ->
#                    if response.status is 401
#                        showModal('/login')
#                    else if response.status is 200
#                        authorized = true
#                error: (error) ->
#                    if error.status is 401 then showModal('/login')
#            }
#
#        if (!authorized) then return false;

        currentEntity = null
        console.log(tableType)
        if tableType is 'Votes'
            currentEntity = 'Legislation'
            $('#addVotes').modal('toggle').find('form')[0].reset()
        else if tableType is 'Contributions'
            currentEntity = 'Contribution'
            $('#addContributions').modal('toggle').find('form')[0].reset()
        else if tableType is 'Endorsements'
            currentEntity = 'Endorsement'
            $('#addEndorsements').modal('toggle').find('form')[0].reset()
        else if tableType is 'Statements'
            currentEntity = 'PublicStatement'
            $('#addStatements').modal('toggle').find('form')[0].reset()

        if tabPane.hasClass('loaded') then return false
        tabPane[0].classList.add('loaded')

        personMeta = {"createRequest":{"entityName":currentEntity,"knownFields":{"electedOfficial":person.id}}}
        $.ajax(
            method: 'POST',
            url: '/api/createrequest/new',
            data: personMeta,
            success: (data) ->
                console.log(data);

                endObj = {}
                data.choices[0].choices.forEach (item, index) ->
                  ids = Object.keys item
                  ids.forEach (id) ->
                      endObj[id] = item[id]

                insertCategories = () ->
                    select.setAttribute('name', data.choices[0].name)
                    for key of endObj
                        option = document.createElement('option')
                        option.setAttribute('value', key)
                        option.textContent = endObj[key]
                        select.innerHTML += option.outerHTML;

                select = null

                if currentEntity is 'Endorsement'

                else if currentEntity is 'Contribution'

                else if currentEntity is 'Legislation'
                    select = $('#addVotes select')[0]
                    insertCategories()
                    #
                    # Fill elected officials votes table.
                    #
                    compiledTemplate = Handlebars.compile($('#legislation-vote').html())
                    $('#electedVotes').html compiledTemplate(data);

                else if currentEntity is 'PublicStatement'
                    select = $('#addStatements select')[0]
                    insertCategories()



            error: (error) ->
                if(error.status == 401) then showModal('/login')
        );


    window.addItem = (e) ->
        newRecord = {}
        modal = $(e.target).closest('.modal')
        modalType = modal[0].id
        entityType = modal[0].dataset.entityType
        console.log(entityType);

        ###
          Get value from input fields.
        ###
        modal.find('input[type="text"]').each (index, element) ->
            fieldName = Object.keys(element.dataset)[0]
            newRecord[fieldName] = element.value

        ###
          Get value from texarea.
        ###
        modal.find('textarea').each (index, element) ->
            fieldName = Object.keys(element.dataset)[0]
            newRecord[fieldName] = element.value

        associations = {}
        if modalType != 'addVotes'
            associations["electedOfficial"] = person.id
        #
        # Array of sub entities.
        #
        childs = []

        if modalType is 'addVotes'
            ###
                Add information about votes.
            ###
            modal.find('#electedVotes').find('tr[data-elected]'). each (idx, element) ->
                element = $(element)

                #
                # Get all sub entity fields.
                #
                data = Object.create null, {}

                element.find('select').each (index, element) ->
                    if element.value
                        fieldName = Object.keys(element.dataset)[0]
                        data[fieldName] = element.value

                ###
                  Add only if all fields is set.
                ###
                if Object.keys(data).length == 2
                    fields = Object.create null, {}
                    fields['fields'] = data
                    fields['associations'] = Object.create null, {}
                    fields['associations'][element.attr('data-entity-type')] = element.attr('data-elected')
                    childEntityName = element.parent().parent().attr 'data-entity-type'
                    childs.push({
                        # Child type.
                        entityName: childEntityName
                        # Child fields.
                        fields: fields
                    });
            select = modal.find('select')[0]
            selectName = select.name
            selectedValue = select.options[select.selectedIndex].value
            selectedText = $(select).find(':selected').text();
            associations[selectName] = selectedValue
        else if modalType is 'addContributions'

        else if modalType is 'addEndorsements'

        else if modalType is 'addStatements'
            select = modal.find('select')[0]
            selectName = select.name
            selectedValue = select.options[select.selectedIndex].value
            selectedText = $(select).find(':selected').text();
            associations[selectName] = selectedValue

        sendObject = {
            createRequest: {
                entityName: entityType,
                fields: { fields: newRecord, associations: associations, childs: childs},
            }
        }

        tr = document.createElement 'tr'
        for key, value of sendObject.createRequest.fields.fields
            tr.innerHTML += "<td><a href='javascript:void(0);'
            class='editable editable-pre-wrapped editable-click'>#{value}</a></td>"

        if modalType is 'addVotes'
            ###
              Check if user specified how current elected official voted.
            ###
            add = false;
            data = Object.create null, {}
            console.log sendObject.createRequest.fields.childs
            for obj in sendObject.createRequest.fields.childs
              if Number(obj.fields.associations.electedOfficial) == Number(person.id)
                add = true
                data = obj.fields
                break

            #
            # If we found, show.
            #
            if (add)
              for key, value of data.fields
                tr.innerHTML += "<td><a href='javascript:void(0);'
            class='editable editable-pre-wrapped editable-click'>#{value}</a></td>"
              tr.innerHTML += "<td><a href='javascript:void(0);'
            class='editable editable-pre-wrapped editable-click'>#{selectedText}</a></td>"
              $('#Votes tr:last-child').before(tr);
        else if modalType is 'addContributions'
            $('#Contributions tr:last-child').before(tr);
        else if modalType is 'addEndorsements'
            $('#Endorsements tr:last-child').before(tr);

        console.log sendObject
        $.ajax({
            url: '/api/createrequest/create',
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: sendObject,
            success: (data) ->
                console.log(data);
        });


$('#dataContainer').on 'click', '.elected_link', (e) ->
    e.preventDefault();
    url = e.currentTarget.pathname
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

                    if $.isEmptyObject(person)
                        $('.loader').hide()
                        $('#details').html '<h2>Sorry. Page not found</h2>'
                        $('#details').css({"textAlign":"center"})
                        $('#details').show()
                        $('#dataContainer').show()
                        return false;

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

                    initTableHandlers(person);

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


# Route /
if routeType is 0
    $('#stantonIcon').hide()
    gov_selector = new GovSelector '.typeahead', '/legacy/data/h_types_ca_2.json', 7
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
        $.get "/legacy/texts/intro-text.html", (data) -> $("#intro-text").html data
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
if routeType is 2
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
            activate_tab()
            GOVWIKI.show_data_page()
        error: (e) ->
            console.log e

    $('#btnBackToSearch').click (e)->
        e.preventDefault()
        GOVWIKI.show_search_page()

# Route /:alt_name/:city_name/:elected_name
if routeType is 3
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

            if $.isEmptyObject(person)
                $('.loader').hide()
                $('#details').html '<h2>Sorry. Page not found</h2>'
                $('#details').css({"textAlign":"center"})
                $('#details').show()
                $('#dataContainer').show()
                return false;

            format = {year: 'numeric', month: 'numeric', day: 'numeric'};
            if person.votes != undefined
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

            initTableHandlers(person);

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

$ ->
  $.ajax '/editrequest/new', {
    method: 'POST',
    complete: (response) ->
      if response.status is 401
        authorized = false
      else if response.status is 200
        authorized = true
    error: (error) ->
      if error.status is 401 then authorized = false
  }
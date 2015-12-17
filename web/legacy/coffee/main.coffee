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
#
# Now init in FrontendBundle main template.
#authorized = false
#user = Object.create null, {}
#
# Issues category, fill in elected official page.
#
categories = Object.create null, {}

Handlebars.registerPartial 'table-city', $('#table-city').html()
Handlebars.registerPartial 'table-county', $('#table-county').html()
Handlebars.registerPartial 'table-school-district', $('#table-school-district').html()
Handlebars.registerPartial 'table-special-district', $('#table-special-district').html()


Handlebars.registerHelper 'getName', (name, obj) ->
    return obj[name+'Rank'];

Handlebars.registerHelper 'if_eq', (a, b, opts) ->
    if `a == b`
        return opts.fn this
    else
        return opts.inverse this

Handlebars.registerHelper 'some', (arr, target, opts) ->
    return !!arr[target+'Rank'];

Handlebars.registerHelper 'debug', (emberObject) ->
  if emberObject and emberObject.contexts
    out = '';

    for context in emberObject.contexts
      for prop in context
        out += prop + ": " + context[prop] + "\n"

    if (console && console.log)
        console.log("Debug\n----------------\n" + out)


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

GOVWIKI.templates = templates;
GOVWIKI.tplLoaded = false

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
#                        url: "http://45.55.0.145/api/government" + uri,
                        url: "/api/government" + uri,
                        dataType: 'json'
                        cache: true
                        success: (govs) ->
                            compiled_gov_template = templates.get_html(0, govs)
                            $('#details').html compiled_gov_template
                            $('.loader').hide()
                            $('#details').show()
                            $('#searchIcon').show()
                            GOVWIKI.tplLoaded = true
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
    console.log('!!@#@');
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
#            window.history.pushState {}, 'CPC Civic Profiles', '/'
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
        route = document.location.pathname.split('/').filter((itm)-> if itm isnt "" then itm else false);
        route = route.length;

        console.log(route)
        if route is 0
          GOVWIKI.show_search_page()

        if route is 2
          $('#stantonIcon').hide();
        if route isnt 0
          $('#details').html event.state.template
          GOVWIKI.show_data_page()
    else
        GOVWIKI.show_search_page()
        if GOVWIKI.tplLoaded is false then document.location.reload()

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
      column.find('i').removeClass('icon__bottom').removeClass('icon__top')
      rows = column.data('origin')
      makeSort = false;
    else if column.hasClass('asc')
      #
      # Table currently sorted in ascending order.
      # Sort in desc order.
      #
      column.removeClass('asc').addClass('desc')
      column.find('i').removeClass('icon__bottom').addClass('icon__top')
      sortFunction = (a, b) ->
        A = $(a).children('td').eq(colNum).text().toUpperCase().trim()
        B = $(b).children('td').eq(colNum).text().toUpperCase().trim()
        if A < B then return 1
        if A > B then return -1
        return 0

    else if column.hasClass('origin')
      #
      # Original table data order.
      # Sort in asc order.
      #
      column.removeClass('origin').addClass('asc')
      column.find('i').addClass('icon__bottom')
      sortFunction = (a, b) ->
        A = $(a).children('td').eq(colNum).text().toUpperCase().trim()
        B = $(b).children('td').eq(colNum).text().toUpperCase().trim()
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
      column.find('i').addClass('icon__bottom')
      sortFunction = (a, b) ->
        A = $(a).children('td').eq(colNum).text().toUpperCase().trim()
        B = $(b).children('td').eq(colNum).text().toUpperCase().trim()
        if A < B then return -1
        if A > B then return 1
        return 0

    if (makeSort) then rows.sort sortFunction
    $.each rows, (index, row) ->
        $(table).children('tbody').append(row)
    $(table).children('tbody').append(lastRow)

initTableHandlers = (person, categories, electedOfficials) ->
    $('[data-toggle="tooltip"]').tooltip()

    $('.editable').editable({stylesheets: false,type: 'textarea', showbuttons: 'bottom', display: true, emptytext: ' '})
    $('.editable').off('click');

    $('table').on 'click', '.glyphicon-pencil', (e) ->
        e.preventDefault();
        e.stopPropagation();
        if e.currentTarget.dataset.noEditable isnt undefined then return
        if (!authorized)
          showModal('/login')
          window.sessionStorage.setItem('tableType', $(e.target).closest('.tab-pane')[0].id)
          window.sessionStorage.setItem('dataId', $(e.currentTarget).closest('tr').attr('data-id'))
          window.sessionStorage.setItem('field', Number(($(e.currentTarget).closest('td'))[0].cellIndex) + 1)
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
      else if type is 'contributor-type'
        #
        # Sort by contributor type.
        #
        sortTable('[data-entity-type="Contribution"]', 4)

    $('a').on 'save', (e, params) ->
        entityType = $(e.currentTarget).closest('table')[0].dataset.entityType
        id = $(e.currentTarget).closest('tr')[0].dataset.id
        field = Object.keys($(e.currentTarget).closest('td')[0].dataset)[0]

        if field is 'vote' or field is 'didElectedOfficialProposeThis'
          ###
            Current field owned by ElectedOfficialVote
          ###
          entityType = 'ElectedOfficialVote'
          id = $(e.currentTarget).parent().find('span')[0].dataset.id

        sendObject = {
            editRequest: {
                entityName: entityType,
                entityId: id,
                changes: {}
            }
        }
        console.log sendObject
        sendObject.editRequest.changes[field] = params.newValue
        sendObject.editRequest = JSON.stringify(sendObject.editRequest);
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
          showModal('/login')
          window.sessionStorage.setItem 'tableType', tableType
          return false;

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
            ###
              Set get url callback.
            ###
            $('.url-input').on 'keyup', () ->
              match_url = /\b(https?):\/\/([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/i
              if (match_url.test($(this).val()))
                $.ajax '/api/url/extract', {
                  method: 'GET',
                  data: {
                    url: $(this).val().match(match_url)[0]
                  }
                  success: (response) ->
                    console.log response
                    urlContent = $('#url-statement')

                    #
                    # Clear.
                    #
                    urlContent.find('.url-content-title').text('')
                    urlContent.find('.url-content-body').text('')
                    urlContent.find('.url-content-img').attr('src', '')

                    #
                    # Set title.
                    urlContent.find('.url-content-title').text(response.data.title)

                    if (response.type is 'html')
                      #
                      # If url point to html, hide img and set body.
                      urlContent.find('.url-content-img').hide()
                      urlContent.find('.url-content-body').text(response.data.body)
                    if (response.type is 'youtube')
                      #
                      # If url point to youtube, show youtube preview image.
                      urlContent.find('.url-content-img').attr('src', response.data.preview)
                    if (response.type is 'image')
                      urlContent.find('.url-content-img').attr('src', response.data.preview)
                    urlContent.slideDown()
                  error: (error) ->
                    console.log error
                    urlContent = $('#url-statement')

                    #
                    # Clear.
                    #
                    urlContent.find('.url-content-title').text('')
                    urlContent.find('.url-content-body').text('')
                    urlContent.find('.url-content-img').attr('src', '')

                    urlContent.find('.url-content-body').text(error.responseText)
                    urlContent.slideDown();
                }

        insertCategories = (select) ->
          endObj = {}
          categories.forEach (item) ->
            endObj[item.id] = item.name
          select.setAttribute('name', 'issueCategory')
          # Add first blank option.
          option = document.createElement('option')
          option.setAttribute('value', '')
          option.textContent = ''
          select.innerHTML += option.outerHTML
          for key of endObj
              option = document.createElement('option')
              option.setAttribute('value', key)
              option.textContent = endObj[key]
              select.innerHTML += option.outerHTML

        if tabPane.hasClass('loaded') then return false
        tabPane[0].classList.add('loaded')

        if currentEntity is 'Endorsement'

        else if currentEntity is 'Contribution'

        else if currentEntity is 'Legislation'
            insertCategories($('#addVotes select')[0])
            $('#addVotes').find('[data-provide="datepicker"]').on(
              'changeDate',
              () ->
                $(this).datepicker 'hide'
            )
            #
            # Fill elected officials votes table.
            #
            compiledTemplate = Handlebars.compile($('#legislation-vote').html())
            $('#electedVotes').html compiledTemplate(electedOfficials);

        else if currentEntity is 'PublicStatement'
            insertCategories($('#addStatements select')[0])
            $('#addStatements').find('[data-provide="datepicker"]').on(
              'changeDate',
              () ->
                $(this).datepicker 'hide'
            )

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
          Get value from texarea's.
        ###
        modal.find('textarea').each (index, element) ->
            fieldName = Object.keys(element.dataset)[0]
            newRecord[fieldName] = element.value

        associations = {}
        if modalType != 'addVotes'
            associations["electedOfficial"] = person.id
        else
            associations["government"] = person.government.id
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

            if (selectedValue is '')
              # User don't select any value.
              window.alert('Please select category.')
              select.focus();
              return false;

            selectedText = $(select).find(':selected').text();
            associations[selectName] = selectedValue
        else if modalType is 'addContributions'
            select = modal.find('select')[0]
            selectName = select.name
            selectedValue = select.options[select.selectedIndex].value

            if (selectedValue is '')
              # User don't select any value.
              window.alert('Please select type.')
              select.focus();
              return false;

            selectedText = $(select).find(':selected').text()
            newRecord[selectName] = selectedValue

        else if modalType is 'addEndorsements'
            select = modal.find('select')[0]
            selectName = select.name
            selectedValue = select.options[select.selectedIndex].value

            if (selectedValue is '')
              # User don't select any value.
              window.alert('Please select type.')
              select.focus();
              return false;

            selectedText = $(select).find(':selected').text()
            newRecord[selectName] = selectedValue

        else if modalType is 'addStatements'
            select = modal.find('select')[0]
            selectName = select.name
            selectedValue = select.options[select.selectedIndex].value

            if (selectedValue is '')
              # User don't select any value.
              window.alert('Please select category.')
              select.focus();
              return false;

            selectedText = $(select).find(':selected').text();
            associations[selectName] = selectedValue

        sendObject = {
            createRequest: {
                entityName: entityType,
                fields: { fields: newRecord, associations: associations, childs: childs},
            }
        }

        ###
          Append new entity to table.
        ###
        rowTemplate = Handlebars.compile($("#row-#{modalType}").html());

        #
        # Collect data.
        #
        data = Object.create null, {}
        for key, value of sendObject.createRequest.fields.fields
          data[key] = value
        data['user'] = user.username

        console.log person

        if modalType is 'addVotes'
            ###
              Check if user specified how current elected official voted.
            ###
            add = false;
            for obj in sendObject.createRequest.fields.childs
              if Number(obj.fields.associations.electedOfficial) == Number(person.id)
                add = true
                for key, value of obj.fields.fields
                  data[key] = value
                break

            #
            # If we found, show.
            #
            if (add)
              data['category'] = selectedText
              $('#Votes tr:last-child').before rowTemplate(data)
        else if modalType is 'addContributions'
            ###
              Format contribution amount.
            ###
            data.contributorType = selectedText
            data.contributionAmount = numeral(data.contributionAmount).format('0,000')
            $('#Contributions tr:last-child').before rowTemplate(data);
        else if modalType is 'addEndorsements'
            data.endorserType = selectedText
            $('#Endorsements tr:last-child').before rowTemplate(data);
        else if modalType is 'addStatements'
            data['category'] = selectedText
            $('#Statements tr:last-child').before rowTemplate(data);

        ###
          Send create request to api.
        ###
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

        # Close modal window
        modal.modal 'hide'

    ###
        If user try to add or update some data without logged in, we
        show him login/sign up window. After authorizing user redirect back
        to page, where he pres add/edit button. In that case we show him appropriate
        modal window.
    ###
    if (!authorized)
      return

    type = window.sessionStorage.getItem('tableType')
    dataId = window.sessionStorage.getItem('dataId')
    field = window.sessionStorage.getItem('field')

    if (dataId && field)
      $('a[aria-controls="' + type + '"]').click()
      $('tr[data-id='+dataId+']').find('td:nth-child('+field+')').find('.editable').editable('toggle');
      window.sessionStorage.setItem('tableType', '')
      window.sessionStorage.setItem('dataId', '')
      window.sessionStorage.setItem('field', '')

    else if (type)
      $('div#' + type).find('.add').click()
      $('a[aria-controls="' + type + '"]').click()
      window.sessionStorage.setItem('tableType', '')


###
  Append create requests to all current electedOfficial page.
###
showCreateRequests = (person, createRequests) ->
    # Don't show not approved create request to anon.
    if (!authorized) then return

    legislationRow = Handlebars.compile($('#row-addVotes').html())
    contributionRow = Handlebars.compile($('#row-addContributions').html())
    endorsementRow = Handlebars.compile($('#row-addEndorsements').html())
    statementRow = Handlebars.compile($('#row-addStatements').html())

    for request in createRequests
        #
        # Prepare create request data for template.
        #
        data = request.fields.fields
        data['user'] = request.user.username

        #
        # Find out template for current request and additional values.
        #
        if request.entity_name is "Legislation"
            name = 'Votes'
            template = legislationRow
            for key, value of request.fields.childs[0].fields.fields
                data[key] = value
            data['category'] = categories[request.fields.associations.issueCategory - 1].name

        else if request.entity_name is "Contribution"
            name = 'Contributions'
            template = contributionRow

            data['contributionAmount'] = numeral(data['contributionAmount']).format('0,000')
        else if request.entity_name is "Endorsement"
            name = 'Endorsements'
            template = endorsementRow
        else if request.entity_name is "PublicStatement"
            name = 'Statements'
            template = statementRow

            data['category'] = categories[request.fields.associations.issueCategory - 1].name

        $("\##{name} tr:last-child").before(template(data))


$('.statistics').popover({
    placement: 'bottom',
    selector: '.rank',
    animation: true,
    template: '<div class="popover" role="tooltip"><div class="arrow"></div>
                    <div class="popover-title-custom">
                        <h3 class="popover-title"></h3>
                    </div>
                    <div class="popover-content"></div>
                </div>'
});

Handlebars.registerHelper 'if_eq', (a, b, opts) ->
    if(a == b)
        return opts.fn this
    else
        return opts.inverse this

Handlebars.registerHelper 'concat', (param1, param2) ->
    temp = [param1, param2]
    return temp.join('')

$('#dataContainer').on 'click', (e) ->
    $element = $(e.target);
    popoverContent = $element.parent().find('.popover-content')
    fieldName = $element.attr('data-field')
    mask = $element.attr('data-mask')
    popoverTpl = $('#rankPopover').html()
    additionalRowsTpl = $('#additionalRows').html()
    preloader = popoverContent.find('loader')

    previousScrollTop = 0;
    currentPage = 0;
    loading = false;
    popoverOrder = null;
    popoverNameOrder = null;

    # Close all other popovers
    if !$element.closest('.popover')[0]
        $('.rank').not(e.target).popover('destroy')

    formatData = (data) ->
        if mask
            data.data.forEach (rank) ->
                rank.amount = numeral(rank.amount).format(mask)

    loadNewRows = () ->
        loading = true;
        preloader.show()
        table = popoverContent.find('table tbody')
        table.html ''
        currentPage = 0
        previousScrollTop = 0
        fieldNameInCamelCase = fieldName.replace /_([a-z0-9])/g, (g) -> return g[1].toUpperCase()
        $.ajax
            url: '/api/government'+window.location.pathname+'/get_ranks'
            dataType: 'json',
            data:
                page: currentPage
                order: popoverOrder
                name_order: popoverNameOrder
                field_name: fieldNameInCamelCase # Transform to camelCase
            success: (data) ->
                formatData(data)
                compiledTemplate = Handlebars.compile(additionalRowsTpl)
                table.html compiledTemplate(data)
                loading = false;
                preloader.hide()

    # Sort table in popover
    popoverContent.on 'click', 'th', (e) ->
        $column = `$(e.target).hasClass('sortable') ? $(e.target) : $(e.target).closest('th');`
        if $column.hasClass('sortable')
            if $column.hasClass('desc')
                if $column.attr('data-sort-type') is 'name_order'
                    popoverNameOrder = ''
                else
                    popoverOrder = ''
                loadNewRows()
                $column.removeClass('desc').removeClass('asc')
                $column.find('i').removeClass('icon__bottom').removeClass('icon__top')
            else if $column.hasClass('asc')
                if $column.attr('data-sort-type') is 'name_order'
                    popoverNameOrder = 'desc'
                else
                    popoverOrder = 'desc'
                loadNewRows()
                $column.removeClass('asc').addClass('desc')
                $column.find('i').removeClass('icon__top').addClass('icon__bottom')
            else
                if $column.attr('data-sort-type') is 'name_order'
                    popoverNameOrder = 'asc'
                else
                    popoverOrder = 'asc'
                loadNewRows()
                $column.addClass('asc')
                $column.find('i').addClass('icon__top')

    # Render table and insert into popover-content
    if fieldName
        fieldNameInCamelCase = fieldName.replace /_([a-z0-9])/g, (g) -> return g[1].toUpperCase()
        $.ajax
            url: '/api/government'+window.location.pathname+'/get_ranks'
            dataType: 'json',
            data:
                field_name: fieldNameInCamelCase # Transform to camelCase
            success: (data) ->
                formatData(data)
                compiledTemplate = Handlebars.compile(popoverTpl)
                popoverContent.html compiledTemplate(data)

    # Lazy load for popover
    popoverContent.scroll () ->
      currentScrollTop = popoverContent.scrollTop()
      if  previousScrollTop < currentScrollTop && currentScrollTop > 0.5 * popoverContent[0].scrollHeight
        console.log('asdasd');
        previousScrollTop = currentScrollTop
        if loading is false
          loading = true
          preloader.show();
          $.ajax
              url: '/api/government' + window.location.pathname + '/get_ranks'
              dataType: 'json',
              data:
                  page: ++currentPage
                  order: popoverOrder
                  name_order: popoverNameOrder
                  field_name: fieldNameInCamelCase # Transform to camelCase
              success: (data) ->
                  formatData(data)
                  loading = false
                  preloader.hide()
                  compiledTemplate = Handlebars.compile(additionalRowsTpl)
                  popoverContent.find('table tbody')[0].innerHTML += compiledTemplate(data)
                  console.log data

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
                url: "/api/elected-official" + url,
                dataType: 'json'
                cache: true
                success: (data) ->

                    person = data.person
                    createRequests = data.createRequests
                    categories = data.categories
                    person.categories = data.categories
                    person.gov_alt_name = person.government.slug.replace(/_/g, ' ')

                    ###
                      Format contribution amount.
                    ###
                    for contribution in person.contributions
                        contribution.contribution_amount = numeral(contribution.contribution_amount).format('0,000')

                    console.log data

                    if $.isEmptyObject(person)
                        $('.loader').hide()
                        $('#details').html '<h2>Sorry. Page not found</h2>'
                        $('#details').css({"textAlign":"center"})
                        $('#details').show()
                        $('#dataContainer').show()
                        return false;

                    person.votes.forEach (item, itemList) ->
                        date = moment(item.legislation.date_considered, 'YYYY-MM-DD');
                        item.legislation.date_considered = date.format 'L'

                    tpl = $('#person-info-template').html()
                    compiledTemplate = Handlebars.compile(tpl)
                    $('.loader').hide()
                    $('#details').show()
                    html = compiledTemplate(person)
                    GOVWIKI.tplLoaded = true
                    window.history.pushState {template: html}, 'CPC Politician Profiles', url
                    $('#details').html html
                    $('#dataContainer').css('display': 'block');

                    initTableHandlers(person, categories, data.electedOfficials);
                    showCreateRequests(person, createRequests);

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
#                    url: "http://45.55.0.145/api/government" + url,
                    url: "/api/government" + url,
                    dataType: 'json'
                    cache: true
                    success: (elected_officials_data) ->
                        govs = elected_officials_data
                        $('.loader').hide()
                        $('#details').show()
                        compiled_gov_template = templates.get_html(0, govs)
                        GOVWIKI.tplLoaded = true
                        window.history.pushState {template: compiled_gov_template}, 'CPC Civic Profiles', url
                        $('#details').html compiled_gov_template
                        activate_tab()
                        GOVWIKI.show_data_page()
                    error: (e) ->
                        console.log e
    if !undef
        $('#searchContainer').html $('#search-container-template').html()
        # Load introductory text from texts/intro-text.html to #intro-text container.
        #$.get "/legacy/texts/intro-text.html", (data) -> $("#intro-text").html data
        #$("#intro-text").html $("#intro")
        govmap = require './govmap.coffee'
        get_counties GOVWIKI.draw_polygons
        GOVWIKI.tplLoaded = true
        window.history.pushState {template: $('#searchContainer').html()}, 'CPC Civic Profiles', '/'
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
#            url: "http://45.55.0.145/api/government" + uri,
            url: "/api/government" + uri,
            dataType: 'json'
            cache: true
            success: (govs) ->
                compiled_gov_template = templates.get_html(0, govs)
                $('#details').html compiled_gov_template
                $('.loader').hide()
                $('#details').show()
                $('#searchIcon').show()
                GOVWIKI.tplLoaded = true
                window.history.pushState {template: compiled_gov_template}, 'CPC Civic Profiles', uri

# Route /rank_order
if routeType is 1
    document.title = 'CPC Civic Profiles'
    $('#details').hide()
    $('#dataContainer').show()
    $('.loader').show()
    $('#wikipediaContainer').hide()
    $('#stantonIcon').hide()

    orderedFields = []

    #
    # Set sort callback.
    #
    $(document).on 'click', '.rank_sort', (e) ->
      $('#details').hide()
      $('#dataContainer').show()
      $('.loader').show()
      $('#wikipediaContainer').hide()
      $('#stantonIcon').hide()

      column = $(e.currentTarget)
      tabPanel = column.closest('.tab-pane')
      fieldName = column.attr('data-sort-type')
      icon = column.find('i')

      if icon.hasClass('icon__top')
        #
        # Sort in descending order.
        #
        icon.addClass('icon__bottom').removeClass('icon__top')
        orderedFields[fieldName] = 'desc'
      else if icon.hasClass('icon__bottom')
        #
        # Remove sort by this field.
        #
        icon.removeClass('icon__bottom')
        delete orderedFields[fieldName]
      else
        #
        # Sort in ascending order.
        #
        icon.addClass('icon__top')
        orderedFields[fieldName] = 'asc'

      $.ajax
        url: "/api/rank_order"
        dataType: 'json'
        data:
          alt_type: tabPanel.attr('id')
          fields_order: $.extend({}, orderedFields)
        cache: true
        success: (data) ->
          console.log data

          #
          # Update table
          #
          table = tabPanel.find('table')
          head = table.find('tr:first')

          $('.loader').hide()
          $('#details').show()
          GOVWIKI.show_data_page();

          #
          # Push template.
          #
          GOVWIKI.tplLoaded = true
          window.history.pushState {template: $('#details').html()}, 'CPC Civic Profiles', '/rank_order'

    altTypesData = {}
    GOVWIKI.currentAltType = 'City'
    GOVWIKI.currentAltTypeLowerCase = 'city'
    GOVWIKI.itemsPerPage = 10;
    GOVWIKI.currentPage = 0;

    setEvents = () ->
        $('a[data-toggle="tab"]').on 'shown.bs.tab', (e) ->
            GOVWIKI.currentAltType = $(e.target).attr("href").replace('#', '')
            GOVWIKI.currentAltTypeLowerCase = GOVWIKI.currentAltType.toLowerCase()
            GOVWIKI.currentPage = 0;
            renderPagination()

        $('.pagination').on 'click', 'a', (e) ->
            page = $(e.target).attr('data-page')
            if page isnt undefined
                GOVWIKI.currentPage = parseInt(page)-1
                renderTemplate(GOVWIKI.currentPage)

    renderPagination = () ->
        $paginationContainer = $('#'+GOVWIKI.currentAltType+' .pagination')
        $paginationContainer.html('')
        paginationControls = ''
        if GOVWIKI.currentPage > 0
            paginationControls += '<li><a href="javascript:void(0)" aria-label="Previous" onclick="GOVWIKI.prevPage(event)"><span aria-hidden="true">&laquo;</span></a></li>'
            paginationControls += '<li><a href="javascript:void(0)" data-page="'+GOVWIKI.currentPage+'">' + (GOVWIKI.currentPage) + '</a></li>'
        else
            paginationControls += '<li class="disabled"><a href="javascript:void(0)" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>'

        paginationControls += '<li class="active"><a href="javascript:void(0)" data-page="'+(GOVWIKI.currentPage+1)+'">' + (GOVWIKI.currentPage+1) + '</a></li>'

        if GOVWIKI.currentPage is GOVWIKI.lastPage()
            paginationControls += '<li class="disabled"><a href="javascript:void(0)" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>'
        else
            paginationControls += '<li><a href="javascript:void(0)" data-page="'+(GOVWIKI.currentPage+2)+'">' + (GOVWIKI.currentPage+2) + '</a></li>'
            paginationControls += '<li><a href="javascript:void(0)" aria-label="Next" onclick="GOVWIKI.nextPage(event)"><span aria-hidden="true">&raquo;</span></a></li>'
        $paginationContainer.append(paginationControls);

    $.ajax
        url: "/api/rank_order"
        dataType: 'json'
        cache: true
        success: (data) ->
            altTypesData = data;
            #
            # Render rank order template.
            #
            tpl = Handlebars.compile($('#rank-order-page').html())
            $('#details').html tpl(altTypesData)
            $('.loader').hide()
            $('#details').show()
            GOVWIKI.show_data_page();

            setEvents()
            renderPagination()

            #
            # Push template.
            #
            GOVWIKI.tplLoaded = true
#            window.history.pushState {template: tpl}, 'CPC Civic Profiles', '/rank_order'

    renderTemplate = (page) ->
        $.ajax
            url: "/api/rank_order"
            dataType: 'json'
            cache: true
            data:
                alt_type: GOVWIKI.currentAltType
                page: page || GOVWIKI.currentPage
                limit: GOVWIKI.itemsPerPage
            success: (data) ->
                altTypesData[GOVWIKI.currentAltTypeLowerCase] = data

                tpl = Handlebars.compile($('#table-'+GOVWIKI.currentAltTypeLowerCase.replace(/_/, '-')).html())
                $('#'+GOVWIKI.currentAltType).html tpl(altTypesData)
                setEvents()
                renderPagination()

    GOVWIKI.nextPage = (e) ->
        ++GOVWIKI.currentPage
        renderTemplate()


    GOVWIKI.prevPage = (e) ->
        --GOVWIKI.currentPage
        renderTemplate()


    GOVWIKI.firstPage =  () ->
        return `GOVWIKI.currentPage == 0`

    GOVWIKI.lastPage =  () ->
        lastPage = Math.ceil(altTypesData.count / GOVWIKI.itemsPerPage - 1)
        return GOVWIKI.currentPage == lastPage

    GOVWIKI.numberOfPages = () ->
        return Math.ceil(altTypesData.count / GOVWIKI.itemsPerPage)
    


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
#        url: "http://45.55.0.145/api/government" + window.path,
        url: backend + "/api/government" + window.path,
        dataType: 'json'
        cache: true
        success: (govs) ->

            $('.loader').hide()
            $('#details').show()
            run = templates.get_html(0, govs)
            $('#details').html run
            activate_tab()
            GOVWIKI.show_data_page()
            GOVWIKI.tplLoaded = true
            window.history.pushState {template: run}, 'CPC Civic Profiles', window.path
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
        url: "/api/elected-official" + window.path,
        dataType: 'json'
        success: (data) ->

            person = data.person
            createRequests = data.createRequests
            categories = data.categories
            person.category_select = []
            person.gov_alt_name = person.government.slug.replace(/_/g, ' ')
            console.log data

            ###
              Prepare options for select in IssuesCategory edit.
            ###
            for category in categories
              person.category_select.push {
                value: category.id
                text: category.name
              }
            person.category_select = JSON.stringify(person.category_select);

            ###
              Format contribution amount.
            ###
            for contribution in person.contributions
                contribution.contribution_amount = numeral(contribution.contribution_amount).format('0,000')

            console.log person

            if $.isEmptyObject(person)
                $('.loader').hide()
                $('#details').html '<h2>Sorry. Page not found</h2>'
                $('#details').css({"textAlign":"center"})
                $('#details').show()
                $('#dataContainer').show()
                return false;

            if person.votes != undefined
                person.votes.forEach (item, itemList) ->
                    date = moment(item.legislation.date_considered, 'YYYY-MM-DD');
                    item.legislation.date_considered = date.format 'L'

            tpl = $('#person-info-template').html()
            compiledTemplate = Handlebars.compile(tpl)
            $('.loader').hide()
            $('#details').show()

            html = compiledTemplate(person)

            $('#details').html html

            $('#dataContainer').css('display': 'block');

            initTableHandlers(person, categories, data.electedOfficials);
            showCreateRequests(person, createRequests);

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
    ###
      Get current user.
    ###
    $userBtn = $('#user')
    $userBtnLink = $userBtn.find('a');
    console.log authorized
    console.log user
    console.log user.username

    if (authorized)
      $userText = $('#user-text').find('a');
      $userText.html("Logged in as #{user.username}" + $userText.html())
      $userBtnLink.html("Sign Out" + $userBtnLink.html()).click () ->
          window.location = '/logout'
    else
      $userBtnLink.html("Login / Sign Up" + $userBtnLink.html()).click () ->
        showModal('/login')

#    $.ajax '/api/user', {
#          method: 'GET',
#          async: false,
#          success: (response) ->
#              user.username = response.username;
#              authorized = true;
#
#              $userText = $('#user-text').find('a');
#              $userText.html("Logged in as #{user.username}" + $userText.html())
#              $userBtnLink.html("Sign Out" + $userBtnLink.html()).click () ->
#                  window.location = '/logout'
#
#          error: (error) ->
#              if error.status is 401 then authorized = false
#              $userBtnLink.html("Login / Sign Up" + $userBtnLink.html()).click () ->
#                  showModal('/login')
#      }
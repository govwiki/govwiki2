(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var add_marker, bounds_timeout, geocode_addr, get_icon, get_records2, in_array, map, pinImage, rebuild_filter, rerender_markers,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

bounds_timeout = void 0;

map = new GMaps({
  el: '#govmap',
  lat: 37.3,
  lng: -119.3,
  zoom: 6,
  minZoom: 6,
  scrollwheel: true,
  mapTypeControl: false,
  panControl: false,
  mapTypeControl: false,
  zoomControl: true,
  zoomControlOptions: {
    style: google.maps.ZoomControlStyle.SMALL
  }
});

map.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('legend'));

rerender_markers = function() {
  var i, len, rec, ref, results1;
  ref = GOVWIKI.markers;
  results1 = [];
  for (i = 0, len = ref.length; i < len; i++) {
    rec = ref[i];
    results1.push(add_marker(rec));
  }
  return results1;
};

rebuild_filter = function() {
  var hard_params;
  hard_params = ['City', 'School District', 'Special District'];
  GOVWIKI.gov_type_filter_2 = [];
  return $('.type_filter').each(function(index, element) {
    var ref;
    if ((ref = $(element).attr('name'), indexOf.call(hard_params, ref) >= 0) && $(element).val() === '1') {
      return GOVWIKI.gov_type_filter_2.push($(element).attr('name'));
    }
  });
};

get_records2 = function(legendType, onsuccess) {
  return $.ajax({
    url: "http://45.55.0.145/api/government/get-markers-data",
    data: {
      altTypes: legendType
    },
    dataType: 'json',
    cache: true,
    success: onsuccess,
    error: function(e) {
      return console.log(e);
    }
  });
};

$(function() {
  rebuild_filter();
  get_records2(GOVWIKI.gov_type_filter_2, function(data) {
    GOVWIKI.markers = data;
    return rerender_markers();
  });
  $('#legend li:not(.counties-trigger)').on('click', function() {
    var hidden_field, value;
    $(this).toggleClass('active');
    hidden_field = $(this).find('input');
    value = hidden_field.val();
    hidden_field.val(value === '1' ? '0' : '1');
    rebuild_filter();
    map.removeMarkers();
    return rerender_markers();
  });
  return $('#legend li.counties-trigger').on('click', function() {
    $(this).toggleClass('active');
    if ($(this).hasClass('active')) {
      return GOVWIKI.get_counties(GOVWIKI.draw_polygons);
    } else {
      return map.removePolygons();
    }
  });
});

get_icon = function(alt_type) {
  var _circle;
  _circle = function(color) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 1,
      fillColor: color,
      strokeWeight: 1,
      strokeColor: 'white',
      scale: 6
    };
  };
  switch (alt_type) {
    case 'City':
      return _circle('red');
    case 'School District':
      return _circle('lightblue');
    case 'Special District':
      return _circle('purple');
    default:
      return _circle('white');
  }
};

in_array = function(my_item, my_array) {
  var i, item, len;
  for (i = 0, len = my_array.length; i < len; i++) {
    item = my_array[i];
    if (item === my_item) {
      return true;
    }
  }
  return false;
};

add_marker = function(rec) {
  var exist;
  exist = in_array(rec.altType, GOVWIKI.gov_type_filter_2);
  if (exist === false) {
    return false;
  }
  return map.addMarker({
    lat: rec.latitude,
    lng: rec.longitude,
    icon: get_icon(rec.altType),
    title: rec.name + ", " + rec.type,
    infoWindow: {
      content: "<div><a href='javascript:void(0);' class='info-window-uri' data-uri='/" + rec.altTypeSlug + "/" + rec.slug + "'><strong>" + rec.name + "</strong></a></div> <div> " + rec.type + "  " + rec.city + " " + rec.zip + " " + rec.state + "</div>"
    }
  });
};

pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));

geocode_addr = function(addr, data) {
  return GMaps.geocode({
    address: addr,
    callback: function(results, status) {
      var latlng;
      if (status === 'OK') {
        latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        map.addMarker({
          lat: latlng.lat(),
          lng: latlng.lng(),
          size: 'small',
          title: results[0].formatted_address,
          infoWindow: {
            content: results[0].formatted_address
          }
        });
        if (data) {
          map.addMarker({
            lat: data.latitude,
            lng: data.longitude,
            size: 'small',
            color: 'blue',
            icon: pinImage,
            title: data.latitude + " " + data.longitude,
            infoWindow: {
              content: data.latitude + " " + data.longitude
            }
          });
        }
        $('.govmap-found').html("<strong>FOUND: </strong>" + results[0].formatted_address);
      }
    }
  });
};

module.exports = {
  map: map
};



},{}],2:[function(require,module,exports){
var GovSelector, query_matcher,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

query_matcher = require('./querymatcher.coffee');

GovSelector = (function() {
  var entered_value, govs_array;

  GovSelector.prototype.on_selected = function(evt, data, name) {};

  function GovSelector(html_selector, docs_url, num_items) {
    this.html_selector = html_selector;
    this.num_items = num_items;
    this.startSuggestion = bind(this.startSuggestion, this);
    $.ajax({
      url: docs_url,
      dataType: 'json',
      cache: true,
      success: this.startSuggestion
    });
  }

  GovSelector.prototype.suggestionTemplate = Handlebars.compile("<div class=\"sugg-box\">\n  <div class=\"sugg-state\">{{{state}}}</div>\n  <div class=\"sugg-name\">{{{gov_name}}}</div>\n  <div class=\"sugg-type\">{{{gov_type}}}</div>\n</div>");

  entered_value = "";

  govs_array = [];

  GovSelector.prototype.count_govs = function() {
    var count, d, i, len, ref;
    count = 0;
    ref = this.govs_array;
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      count++;
    }
    return count;
  };

  GovSelector.prototype.startSuggestion = function(govs) {
    this.govs_array = govs.record;
    $('.typeahead').keyup((function(_this) {
      return function(event) {
        return _this.entered_value = $(event.target).val();
      };
    })(this));
    setTimeout((function(_this) {
      return function() {
        return $(_this.html_selector).attr('placeholder', 'GOVERNMENT NAME');
      };
    })(this), 1000);
    $(this.html_selector).typeahead({
      hint: false,
      highlight: false,
      minLength: 1,
      classNames: {
        menu: 'tt-dropdown-menu'
      }
    }, {
      name: 'gov_name',
      displayKey: 'gov_name',
      source: query_matcher(this.govs_array, this.num_items),
      templates: {
        suggestion: this.suggestionTemplate
      }
    }).on('typeahead:selected', (function(_this) {
      return function(evt, data, name) {
        $('.typeahead').typeahead('val', _this.entered_value);
        return _this.on_selected(evt, data, name);
      };
    })(this)).on('typeahead:cursorchanged', (function(_this) {
      return function(evt, data, name) {
        return $('.typeahead').val(_this.entered_value);
      };
    })(this));
  };

  return GovSelector;

})();

module.exports = GovSelector;



},{"./querymatcher.coffee":4}],3:[function(require,module,exports){

/*
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
 */
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, authorized, build_select_element, build_selector, draw_polygons, focus_search_field, get_counties, get_elected_officials, get_financial_statements, get_max_ranks, get_record2, gov_selector, govmap, initTableHandlers, refresh_disqus, route, routeType, start_adjusting_typeahead_width, templates, undef, wikipedia;

GovSelector = require('./govselector.coffee');

Templates2 = require('./templates2.coffee');

wikipedia = require('./wikipedia.coffee');

govmap = null;

gov_selector = null;

templates = new Templates2;

active_tab = "";

undef = null;

authorized = false;

Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

window.GOVWIKI = {
  state_filter: '',
  gov_type_filter: '',
  gov_type_filter_2: ['City', 'School District', 'Special District'],
  show_search_page: function() {
    $('#dataContainer').hide();
    $('#searchIcon').hide();
    $('#searchContainer').fadeIn(300);
    return focus_search_field(500);
  },
  show_data_page: function() {
    $('#searchIcon').show();
    $('#dataContainer').fadeIn(300);
    return $('#searchContainer').hide();
  }
};

GOVWIKI.get_counties = get_counties = function(callback) {
  return $.ajax({
    url: '/legacy/data/county_geography_ca_2.json',
    dataType: 'json',
    cache: true,
    success: function(countiesJSON) {
      return callback(countiesJSON);
    }
  });
};

GOVWIKI.draw_polygons = draw_polygons = function(countiesJSON) {
  var county, i, len, ref, results;
  ref = countiesJSON.features;
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    county = ref[i];
    results.push((function(_this) {
      return function(county) {
        return govmap.map.drawPolygon({
          paths: county.geometry.coordinates,
          useGeoJSON: true,
          strokeColor: '#808080',
          strokeOpacity: 0.6,
          strokeWeight: 1.5,
          fillColor: '#FF0000',
          fillOpacity: 0.15,
          countyId: county.properties._id,
          altName: county.properties.alt_name,
          marker: new MarkerWithLabel({
            position: new google.maps.LatLng(0, 0),
            draggable: false,
            raiseOnDrag: false,
            map: govmap.map.map,
            labelContent: county.properties.name,
            labelAnchor: new google.maps.Point(-15, 25),
            labelClass: "label-tooltip",
            labelStyle: {
              opacity: 1.0
            },
            icon: "http://placehold.it/1x1",
            visible: false
          }),
          mouseover: function() {
            return this.setOptions({
              fillColor: "#00FF00"
            });
          },
          mousemove: function(event) {
            this.marker.setPosition(event.latLng);
            return this.marker.setVisible(true);
          },
          mouseout: function() {
            this.setOptions({
              fillColor: "#FF0000"
            });
            return this.marker.setVisible(false);
          },
          click: function() {
            var uri;
            $('.loader').show();
            $('#searchContainer').hide();
            $('#dataContainer').show();
            uri = "/" + county.alt_type_slug + "/" + county.properties.slug;
            return $.ajax({
              url: "http://45.55.0.145/api/government" + uri,
              dataType: 'json',
              cache: true,
              success: function(govs) {
                var compiled_gov_template;
                compiled_gov_template = templates.get_html(0, govs);
                $('#details').html(compiled_gov_template);
                $('.loader').hide();
                $('#details').show();
                $('#searchIcon').show();
                return window.history.pushState({
                  template: compiled_gov_template
                }, 'CPC Civic Profiles', uri);
              }
            });
          }
        });
      };
    })(this)(county));
  }
  return results;
};

window.remember_tab = function(name) {
  return active_tab = name;
};

$(document).on('click', '#fieldTabs a', function(e) {
  var finValWidthMax1, finValWidthMax2, finValWidthMax3;
  active_tab = $(e.currentTarget).data('tabname');
  console.log(active_tab);
  $("#tabsContent .tab-pane").removeClass("active");
  $($(e.currentTarget).attr('href')).addClass("active");
  templates.activate(0, active_tab);
  if (active_tab === 'Financial Statements') {
    finValWidthMax1 = 0;
    finValWidthMax2 = 0;
    finValWidthMax3 = 0;
    $('.fin-values-block [data-col="1"]').find('.fin-val').each(function() {
      var thisFinValWidth;
      thisFinValWidth = $(this).width();
      if (thisFinValWidth > finValWidthMax1) {
        return finValWidthMax1 = thisFinValWidth;
      }
    });
    $('.fin-values-block [data-col="2"]').find('.fin-val').each(function() {
      var thisFinValWidth;
      thisFinValWidth = $(this).width();
      if (thisFinValWidth > finValWidthMax2) {
        return finValWidthMax2 = thisFinValWidth;
      }
    });
    $('.fin-values-block [data-col="3"]').find('.fin-val').each(function() {
      var thisFinValWidth;
      thisFinValWidth = $(this).width();
      if (thisFinValWidth > finValWidthMax3) {
        return finValWidthMax3 = thisFinValWidth;
      }
    });
    $('.fin-values-block [data-col="1"] .currency-sign').css('right', finValWidthMax1 + 27);
    $('.fin-values-block [data-col="2"] .currency-sign').css('right', finValWidthMax2 + 27);
    return $('.fin-values-block [data-col="3"] .currency-sign').css('right', finValWidthMax3 + 27);
  }
});

$(document).tooltip({
  selector: "[class='media-tooltip']",
  trigger: 'click'
});

activate_tab = function() {
  return $("#fieldTabs a[href='#tab" + active_tab + "']").tab('show');
};

get_record2 = function(recid) {
  $("#wikipediaContainer").html("");
  return $.ajax({
    url: "http://46.101.3.79:80/rest/db/govs/" + recid,
    dataType: 'json',
    headers: {
      "X-DreamFactory-Application-Name": "govwiki"
    },
    cache: true,
    success: function(data) {
      if (data) {
        get_financial_statements(data._id, function(data2, textStatus, jqXHR) {
          data.financial_statements = data2;
          return get_elected_officials(data._id, 25, function(data3, textStatus2, jqXHR2) {
            data.elected_officials = data3;
            return get_max_ranks(function(max_ranks_response) {
              data.max_ranks = max_ranks_response.record[0];
              return activate_tab();
            });
          });
        });
      }
    },
    error: function(e) {
      return console.log(e);
    }
  });
};

get_elected_officials = function(alt_type, gov_name, onsuccess) {
  return $.ajax({
    url: "http://46.101.3.79/api/government/" + alt_type + '/' + gov_name,
    dataType: 'json',
    cache: true,
    success: onsuccess,
    error: function(e) {
      return console.log(e);
    }
  });
};

get_financial_statements = function(gov_id, onsuccess) {
  return $.ajax({
    url: "http://46.101.3.79:80/rest/db/_proc/get_financial_statements",
    data: {
      app_name: "govwiki",
      order: "caption_category,display_order",
      params: [
        {
          name: "govs_id",
          param_type: "IN",
          value: gov_id
        }
      ]
    },
    dataType: 'json',
    cache: true,
    success: onsuccess,
    error: function(e) {
      return console.log(e);
    }
  });
};

get_max_ranks = function(onsuccess) {
  return $.ajax({
    url: 'http://46.101.3.79:80/rest/db/max_ranks',
    data: {
      app_name: 'govwiki'
    },
    dataType: 'json',
    cache: true,
    success: onsuccess
  });
};

window.GOVWIKI.show_record = (function(_this) {
  return function(rec) {
    $('#details').html(templates.get_html(0, rec));
    activate_tab();
    GOVWIKI.show_data_page();
    return router.navigate(rec._id);
  };
})(this);

window.GOVWIKI.show_record2 = (function(_this) {
  return function(rec) {
    return get_elected_officials(rec.altTypeSlug, rec.slug, function(data, textStatus, jqXHR) {
      var url;
      rec.elected_officials = data;
      $('#details').html(templates.get_html(0, rec));
      activate_tab();
      GOVWIKI.show_data_page();
      url = rec.altTypeSlug + '/' + rec.slug;
      return document.location.pathname = url;
    });
  };
})(this);

build_selector = function(container, text, command, where_to_store_value) {
  return $.ajax({
    url: 'https://api.mongolab.com/api/1/databases/govwiki/runCommand?apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y',
    type: 'POST',
    contentType: "application/json",
    dataType: 'json',
    data: command,
    cache: true,
    success: (function(_this) {
      return function(data) {
        var values;
        values = data.values;
        build_select_element(container, text, values.sort(), where_to_store_value);
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

build_select_element = function(container, text, arr, where_to_store_value) {
  var i, len, s, select, v;
  s = "<select class='form-control' style='maxwidth:160px;'><option value=''>" + text + "</option>";
  for (i = 0, len = arr.length; i < len; i++) {
    v = arr[i];
    if (v) {
      s += "<option value='" + v + "'>" + v + "</option>";
    }
  }
  s += "</select>";
  select = $(s);
  $(container).append(select);
  if (text === 'State..') {
    select.val('CA');
    window.GOVWIKI.state_filter = 'CA';
  }
  return select.change(function(e) {
    var el;
    el = $(e.target);
    window.GOVWIKI[where_to_store_value] = el.val();
    return $('.gov-counter').text(gov_selector.count_govs());
  });
};

adjust_typeahead_width = function() {
  var inp, par;
  inp = $('#myinput');
  par = $('#typeahed-container');
  return inp.width(par.width());
};

start_adjusting_typeahead_width = function() {
  return $(window).resize(function() {
    return adjust_typeahead_width();
  });
};

focus_search_field = function(msec) {
  return setTimeout((function() {
    return $('#myinput').focus();
  }), msec);
};

window.onhashchange = function(e) {
  var h;
  h = window.location.hash;
  if (!h) {
    return GOVWIKI.show_search_page();
  }
};

route = document.location.pathname.split('/').filter(function(itm) {
  if (itm !== "") {
    return itm;
  } else {
    return false;
  }
});

routeType = route.length;

GOVWIKI.history = function(index) {
  var searchContainer;
  if (index === 0) {
    searchContainer = $('#searchContainer').text();
    if (searchContainer !== '') {
      window.history.pushState({}, 'CPC Civic Profiles', '/');
      $('#searchIcon').hide();
      $('#stantonIcon').hide();
    } else {
      document.location.pathname = '/';
    }
    $('#details').hide();
    $('#searchContainer').show();
    return false;
  }
  if (history.state !== null && history.state.template !== void 0) {
    return window.history.go(index);
  } else {
    route.pop();
    return document.location.pathname = '/' + route.join('/');
  }
};

window.addEventListener('popstate', function(event) {
  if (window.history.state !== null) {
    $('#details').html(event.state.template);
    route = document.location.pathname.split('/').length - 1;
    if (route === 2) {
      $('#stantonIcon').hide();
    }
    if (route === 1) {
      return $('#searchContainer').show();
    }
  } else {
    return document.location.reload();
  }
});

refresh_disqus = function(newIdentifier, newUrl, newTitle) {
  return DISQUS.reset({
    reload: true,
    config: function() {
      this.page.identifier = newIdentifier;
      this.page.url = newUrl;
      return this.page.title = newTitle;
    }
  });
};

initTableHandlers = function(person) {
  $('[data-toggle="tooltip"]').tooltip();
  $('.editable').editable({
    stylesheets: false,
    type: 'textarea',
    showbuttons: 'bottom',
    display: true,
    emptytext: ' '
  });
  $('.editable').off('click');
  $('table').on('click', '.glyphicon-pencil', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.dataset.noEditable !== void 0) {
      return;
    }
    if (!authorized) {
      return $.ajax('/editrequest/new', {
        method: 'POST',
        complete: function(response) {
          if (response.status === 401) {
            return showModal('/login');
          } else if (response.status === 200) {
            authorized = true;
            return $(e.currentTarget).closest('td').find('.editable').editable('toggle');
          }
        },
        error: function(error) {
          if (error.status === 401) {
            return showModal('/login');
          }
        }
      });
    } else {
      return $(e.currentTarget).closest('td').find('.editable').editable('toggle');
    }
  });
  $('a').on('save', function(e, params) {
    var entityType, field, id, sendObject;
    entityType = $(e.currentTarget).closest('table')[0].dataset.entityType;
    id = $(e.currentTarget).closest('tr')[0].dataset.id;
    field = Object.keys($(e.currentTarget).closest('td')[0].dataset)[0];
    sendObject = {
      editRequest: {
        entityName: entityType,
        entityId: id,
        changes: {}
      }
    };
    sendObject.editRequest.changes[field] = params.newValue;
    sendObject.editRequest = JSON.stringify(sendObject.editRequest);
    console.log(sendObject);
    return $.ajax('/editrequest/create', {
      method: 'POST',
      data: sendObject,
      dataType: 'text/json',
      success: function(response) {
        var text;
        return text = JSON.parse(response.responseText);
      },
      error: function(error) {
        if (error.status === 401) {
          return showModal('/login');
        }
      }
    });
  });
  $('table').on('click', '.add', function(e) {
    var currentEntity, personMeta, tabPane, tableType;
    tabPane = $(e.target).closest('.tab-pane');
    tableType = tabPane[0].id;
    currentEntity = null;
    if (tableType === 'Votes') {
      currentEntity = 'ElectedOfficialVote';
      $('#addVotes').modal('toggle');
    } else if (tableType === 'Contributions') {
      currentEntity = 'Contribution';
      $('#addContributions').modal('toggle');
    } else if (tableType === 'Endorsements') {
      currentEntity = 'Endorsement';
      $('#addEndorsements').modal('toggle');
    } else if (tableType === 'Statements') {
      currentEntity = 'PublicStatement';
      $('#addStatements').modal('toggle');
    }
    if (tabPane.hasClass('loaded')) {
      return false;
    }
    tabPane[0].classList.add('loaded');
    personMeta = {
      "createRequest": {
        "entityName": currentEntity,
        "knownFields": {
          "electedOfficial": person.id
        }
      }
    };
    return $.ajax({
      method: 'POST',
      url: '/api/createrequest/new',
      data: personMeta,
      success: function(data) {
        var endObj, insertCategories, select;
        console.log(data);
        endObj = {};
        data.choices[0].choices.forEach(function(item, index) {
          var ids;
          ids = Object.keys(item);
          return ids.forEach(function(id) {
            return endObj[id] = item[id];
          });
        });
        insertCategories = function() {
          var key, option, results;
          select.setAttribute('name', data.choices[0].name);
          results = [];
          for (key in endObj) {
            option = document.createElement('option');
            option.setAttribute('value', key);
            option.textContent = endObj[key];
            results.push(select.innerHTML += option.outerHTML);
          }
          return results;
        };
        select = null;
        if (currentEntity === 'Endorsement') {
          select = $('#addEndorsements select')[0];
          return insertCategories();
        } else if (currentEntity === 'Contribution') {

        } else if (currentEntity === 'ElectedOfficialVote') {
          select = $('#addVotes select')[0];
          return insertCategories();
        } else if (currentEntity === 'PublicStatement') {
          select = $('#addStatements select')[0];
          return insertCategories();
        }
      },
      error: function(error) {
        if (error.status === 401) {
          return showModal('/login');
        }
      }
    });
  });
  return window.addItem = function(e) {
    var associations, entityType, key, modal, modalType, newRecord, ref, select, selectName, selectedValue, sendObject, tr, value;
    newRecord = {};
    modal = $(e.target).closest('.modal');
    modalType = modal[0].id;
    entityType = modal[0].dataset.entityType;
    console.log(entityType);
    modal.find('input[type="text"]').each(function(index, element) {
      var fieldName;
      fieldName = Object.keys(element.dataset)[0];
      return newRecord[fieldName] = element.value;
    });
    associations = {};
    associations["electedOfficial"] = person.id;
    if (modalType === 'addVotes') {

    } else if (modalType === 'addContributions') {

    } else if (modalType === 'addEndorsements') {
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      associations[selectName] = selectedValue;
    } else if (modalType === 'addStatements') {
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      associations[selectName] = selectedValue;
    }
    sendObject = {
      createRequest: {
        entityName: entityType,
        fields: {
          fields: newRecord,
          associations: associations
        }
      }
    };
    tr = document.createElement('tr');
    ref = sendObject.createRequest.fields.fields;
    for (key in ref) {
      value = ref[key];
      tr.innerHTML += "<td><a href='javascript:void(0);' class='editable editable-pre-wrapped editable-click'>" + value + "</a></td>";
    }
    if (modalType === 'addVotes') {
      $('#Votes tr:last-child').before(tr);
    } else if (modalType === 'addContributions') {
      $('#Contributions tr:last-child').before(tr);
    } else if (modalType === 'addEndorsements') {
      $('#Endorsements tr:last-child').before(tr);
    } else if (modalType === 'addStatements') {
      $('#Statements tr:last-child').before(tr);
    }
    console.log(sendObject);
    return $.ajax({
      url: '/api/createrequest/create',
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: sendObject,
      success: function(data) {
        return console.log(data);
      }
    });
  };
};

$('#dataContainer').on('click', '.elected_link', function(e) {
  var url;
  e.preventDefault();
  url = e.currentTarget.pathname;
  $('#details').hide();
  $('#searchContainer').hide();
  $('#dataContainer').show();
  $('#wikipediaContainer').hide();
  $('.loader').show();
  $('#stantonIcon').show();
  $('#searchIcon').show();
  return jQuery.get(url, {}, function(data) {
    if (data) {
      return $.ajax({
        url: "http://45.55.0.145/api/elected-official" + url,
        dataType: 'json',
        cache: true,
        success: function(data) {
          var compiledTemplate, format, html, person, tpl;
          person = data[0];
          if ($.isEmptyObject(person)) {
            $('.loader').hide();
            $('#details').html('<h2>Sorry. Page not found</h2>');
            $('#details').css({
              "textAlign": "center"
            });
            $('#details').show();
            $('#dataContainer').show();
            return false;
          }
          format = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          };
          person.votes.forEach(function(item, itemList) {
            var date;
            date = new Date(item.legislation.date_considered);
            return item.legislation.date_considered = date.toLocaleString('en-US', format);
          });
          tpl = $('#person-info-template').html();
          compiledTemplate = Handlebars.compile(tpl);
          $('.loader').hide();
          $('#details').show();
          html = compiledTemplate(person);
          window.history.pushState({
            template: html
          }, 'CPC Politician Profiles', url);
          $('#details').html(html);
          $('#dataContainer').css({
            'display': 'block'
          });
          initTableHandlers(person);
          $('.vote').on('click', function(e) {
            var id, name;
            id = e.currentTarget.id;
            name = e.currentTarget.dataset.legislationName;
            if (name === void 0) {
              name = person.full_name;
            }
            $('#myModalLabel').text(name + ' (' + person.gov_alt_name + ')');
            $('#conversation').modal('show');
            return refresh_disqus(id, 'http://govwiki.us' + '/' + id, name);
          });
          $('#stantonIcon a').text('Return to ' + person.gov_alt_name);
          return window.DISQUSWIDGETS.getCount();
        },
        error: function(e) {
          return console.log(e);
        }
      });
    }
  });
});

if (routeType === 0) {
  $('#stantonIcon').hide();
  gov_selector = new GovSelector('.typeahead', '/legacy/data/h_types_ca_2.json', 7);
  gov_selector.on_selected = function(evt, data, name) {
    var url;
    $('#details').hide();
    $('#searchContainer').hide();
    $('#dataContainer').show();
    $('.loader').show();
    $('#wikipediaContainer').hide();
    $('#stantonIcon').hide();
    url = '/' + data.altTypeSlug + '/' + data.slug;
    return jQuery.get(url, {}, function(data) {
      if (data) {
        return $.ajax({
          url: "http://45.55.0.145/api/government" + url,
          dataType: 'json',
          cache: true,
          success: function(elected_officials_data) {
            var compiled_gov_template, govs;
            govs = elected_officials_data;
            $('.loader').hide();
            $('#details').show();
            compiled_gov_template = templates.get_html(0, govs);
            window.history.pushState({
              template: compiled_gov_template
            }, 'CPC Civic Profiles', url);
            $('#details').html(compiled_gov_template);
            activate_tab();
            return GOVWIKI.show_data_page();
          },
          error: function(e) {
            return console.log(e);
          }
        });
      }
    });
  };
  if (!undef) {
    $('#searchContainer').html($('#search-container-template').html());
    $.get("/legacy/texts/intro-text.html", function(data) {
      return $("#intro-text").html(data);
    });
    govmap = require('./govmap.coffee');
    get_counties(GOVWIKI.draw_polygons);
    undef = true;
    $('.loader').hide();
  }
  adjust_typeahead_width();
  start_adjusting_typeahead_width();
  $('#btnBackToSearch').click(function(e) {
    e.preventDefault();
    return GOVWIKI.show_search_page();
  });
  templates.load_fusion_template("tabs", "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201z2oXQEYQ3p2OoMI8V5gKgHWB5Tz990BrQ1xc1tVo&key=AIzaSyCXDQyMDpGA2g3Qjuv4CDv7zRj-ix4IQJA");
  $('#govmap').on('click', '.info-window-uri', function(e) {
    var uri;
    uri = e.target.parentNode.dataset.uri;
    $('.loader').show();
    $('#searchContainer').hide();
    $('#dataContainer').show();
    return $.ajax({
      url: "http://45.55.0.145/api/government" + uri,
      dataType: 'json',
      cache: true,
      success: function(govs) {
        var compiled_gov_template;
        compiled_gov_template = templates.get_html(0, govs);
        $('#details').html(compiled_gov_template);
        $('.loader').hide();
        $('#details').show();
        $('#searchIcon').show();
        return window.history.pushState({
          template: compiled_gov_template
        }, 'CPC Civic Profiles', uri);
      }
    });
  });
}

if (routeType === 2) {
  document.title = 'CPC Civic Profiles';
  $('#details').hide();
  $('#dataContainer').show();
  $('.loader').show();
  $('#wikipediaContainer').hide();
  $('#stantonIcon').hide();
  templates.load_fusion_template("tabs", "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201z2oXQEYQ3p2OoMI8V5gKgHWB5Tz990BrQ1xc1tVo&key=AIzaSyCXDQyMDpGA2g3Qjuv4CDv7zRj-ix4IQJA");
  $.ajax({
    url: "http://45.55.0.145/api/government" + window.path,
    dataType: 'json',
    cache: true,
    success: function(elected_officials_data) {
      var govs;
      govs = elected_officials_data;
      $('.loader').hide();
      $('#details').show();
      $('#details').html(templates.get_html(0, govs));
      activate_tab();
      return GOVWIKI.show_data_page();
    },
    error: function(e) {
      return console.log(e);
    }
  });
  $('#btnBackToSearch').click(function(e) {
    e.preventDefault();
    return GOVWIKI.show_search_page();
  });
}

if (routeType === 3) {
  document.title = 'CPC Politician Profiles';
  $('#details').hide();
  $('#searchContainer').hide();
  $('#dataContainer').show();
  $('#wikipediaContainer').hide();
  $('.loader').show();
  $('#stantonIcon').show();
  $('#searchIcon').show();
  $.ajax({
    url: "http://45.55.0.145/api/elected-official" + window.path,
    dataType: 'json',
    success: function(data) {
      var compiledTemplate, format, html, person, tpl;
      person = data[0];
      if ($.isEmptyObject(person)) {
        $('.loader').hide();
        $('#details').html('<h2>Sorry. Page not found</h2>');
        $('#details').css({
          "textAlign": "center"
        });
        $('#details').show();
        $('#dataContainer').show();
        return false;
      }
      format = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      };
      if (person.votes !== void 0) {
        person.votes.forEach(function(item, itemList) {
          var date;
          date = new Date(item.legislation.date_considered);
          return item.legislation.date_considered = date.toLocaleString('en-US', format);
        });
      }
      tpl = $('#person-info-template').html();
      compiledTemplate = Handlebars.compile(tpl);
      $('.loader').hide();
      $('#details').show();
      html = compiledTemplate(person);
      $('#details').html(html);
      $('#dataContainer').css({
        'display': 'block'
      });
      initTableHandlers(person);
      $('.vote').on('click', function(e) {
        var id, name;
        id = e.currentTarget.id;
        name = e.currentTarget.dataset.legislationName;
        if (name === void 0) {
          name = person.full_name;
        }
        $('#myModalLabel').text(name + ' (' + person.gov_alt_name + ')');
        $('#conversation').modal('show');
        return refresh_disqus(id, 'http://govwiki.us' + '/' + id, name);
      });
      $('#stantonIcon a').text('Return to ' + person.gov_alt_name);
      return window.DISQUSWIDGETS.getCount();
    },
    error: function(e) {
      return console.log(e);
    }
  });
}



},{"./govmap.coffee":1,"./govselector.coffee":2,"./templates2.coffee":5,"./wikipedia.coffee":6}],4:[function(require,module,exports){
var QueryMather, full_trim, get_words, get_words_regs, select_text, strip, strongify;

QueryMather = function(docs, num_items) {
  if (num_items == null) {
    num_items = 5;
  }
  return function(q, cb) {
    var d, j, len, matches, ref, regs, test_string, words;
    test_string = function(s, regs) {
      var j, len, r;
      for (j = 0, len = regs.length; j < len; j++) {
        r = regs[j];
        if (!r.test(s)) {
          return false;
        }
      }
      return true;
    };
    ref = get_words_regs(q), words = ref[0], regs = ref[1];
    matches = [];
    for (j = 0, len = docs.length; j < len; j++) {
      d = docs[j];
      if (matches.length >= num_items) {
        break;
      }
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      if (test_string(d.gov_name, regs)) {
        matches.push($.extend({}, d));
      }
    }
    select_text(matches, words, regs);
    cb(matches);
  };
};

select_text = function(clones, words, regs) {
  var d, j, len;
  for (j = 0, len = clones.length; j < len; j++) {
    d = clones[j];
    d.gov_name = strongify(d.gov_name, words, regs);
  }
  return clones;
};

strongify = function(s, words, regs) {
  regs.forEach(function(r, i) {
    return s = s.replace(r, "<b>" + words[i] + "</b>");
  });
  return s;
};

strip = function(s) {
  return s.replace(/<[^<>]*>/g, '');
};

full_trim = function(s) {
  var ss;
  ss = s.trim('' + s);
  return ss = ss.replace(/ +/g, ' ');
};

get_words = function(str) {
  return full_trim(str).split(' ');
};

get_words_regs = function(str) {
  var regs, words;
  words = get_words(str);
  regs = words.map(function(w) {
    return new RegExp("" + w, 'i');
  });
  return [words, regs];
};

module.exports = QueryMather;



},{}],5:[function(require,module,exports){

/*
 * file: templates2.coffee ----------------------------------------------------------------------
 *
 * Class to manage templates and render data on html page.
 *
 * The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
 */
var Templates2, add_other_tab_to_layout, convert_fusion_template, currency, fieldNames, fieldNamesHelp, get_layout_fields, get_record_fields, get_unmentioned_fields, render_field, render_field_name, render_field_name_help, render_field_value, render_fields, render_financial_fields, render_subheading, render_tabs, toTitleCase, under;

fieldNames = {};

fieldNamesHelp = {};

render_field_value = function(n, mask, data) {
  var v;
  v = data[n];
  if (!data[n]) {
    return '';
  }
  if (n === "web_site") {
    return "<a target='_blank' href='" + v + "'>" + v + "</a>";
  } else {
    if ('' !== mask) {
      if (data[n + '_rank'] && data.max_ranks && data.max_ranks[n + '_max_rank']) {
        v = numeral(v).format(mask);
        return v + " <span class='rank'>(" + data[n + '_rank'] + " of " + data.max_ranks[n + '_max_rank'] + ")</span>";
      }
      if (n === "number_of_full_time_employees") {
        return numeral(v).format('0,0');
      }
      return numeral(v).format(mask);
    } else {
      if (v.length > 20 && n === "open_enrollment_schools") {
        v = v.substring(0, 19) + ("<div style='display:inline;color:#074d71'  title='" + v + "'>&hellip;</div>");
      }
      if (v.length > 20 && n === "parent_trigger_eligible_schools") {
        return v = v.substring(0, 19) + ("<div style='display:inline;color:#074d71'  title='" + v + "'>&hellip;</div>");
      } else {
        if (v.length > 21) {
          v = v.substring(0, 21);
        } else {

        }
        return v;
      }
    }
  }
};

render_field_name_help = function(fName) {
  return fieldNamesHelp[fName];
};

render_field_name = function(fName) {
  var s;
  if (fieldNames[fName] != null) {
    return fieldNames[fName];
  }
  s = fName.replace(/_/g, " ");
  s = s.charAt(0).toUpperCase() + s.substring(1);
  return s;
};

render_field = function(fName, data) {
  var fValue;
  if ("_" === substr(fName, 0, 1)) {
    return "<div>\n    <span class='f-nam' >" + (render_field_name(fName)) + "</span>\n    <span class='f-val'>&nbsp;</span>\n</div>";
  } else {
    if (!(fValue = data[fName])) {
      return '';
    }
    return "<div>\n    <span class='f-nam'  >" + (render_field_name(fName)) + "<div></span>\n    <span class='f-val'>" + (render_field_value(fName, data)) + "</span>\n</div>";
  }
};

render_subheading = function(fName, mask, notFirst) {
  var s;
  s = '';
  fName = render_field_name(fName);
  if (mask === "heading") {
    if (notFirst !== 0) {
      s += "<br/>";
    }
    s += "<div><span class='f-nam'>" + fName + "</span><span class='f-val'> </span></div>";
  }
  return s;
};

render_fields = function(fields, data, template) {
  var fName, fNameHelp, fValue, field, h, i, j, len;
  h = '';
  for (i = j = 0, len = fields.length; j < len; i = ++j) {
    field = fields[i];
    if (typeof field === "object") {
      if (field.mask === "heading") {
        h += render_subheading(field.name, field.mask, i);
        fValue = '';
      } else {
        fValue = render_field_value(field.name, field.mask, data);
        if ('' !== fValue && fValue !== '0') {
          fName = render_field_name(field.name);
          fNameHelp = render_field_name_help(field.name);
        } else {
          fValue = '';
        }
      }
    } else {
      fValue = render_field_value(field, '', data);
      if ('' !== fValue) {
        fName = render_field_name(field);
        fNameHelp = render_field_name_help(fName);
      }
    }
    if ('' !== fValue) {
      h += template({
        name: fName,
        value: fValue,
        help: fNameHelp
      });
    }
  }
  return h;
};

render_financial_fields = function(data, template) {
  var category, field, h, is_first_row, j, len, mask, ref;
  h = '';
  mask = '0,0';
  category = '';
  is_first_row = false;
  for (j = 0, len = data.length; j < len; j++) {
    field = data[j];
    if (category !== field.category_name) {
      category = field.category_name;
      if (category === 'Overview') {
        h += template({
          name: "<b>" + category + "</b>",
          genfund: '',
          otherfunds: '',
          totalfunds: ''
        });
      } else if (category === 'Revenues') {
        h += '</br>';
        h += "<b>" + template({
          name: category,
          genfund: "General Fund",
          otherfunds: "Other Funds",
          totalfunds: "Total Gov. Funds"
        }) + "</b>";
        is_first_row = true;
      } else {
        h += '</br>';
        h += template({
          name: "<b>" + category + "</b>",
          genfund: '',
          otherfunds: '',
          totalfunds: ''
        });
        is_first_row = true;
      }
    }
    if (field.caption === 'General Fund Balance' || field.caption === 'Long Term Debt') {
      h += template({
        name: field.caption,
        genfund: currency(field.genfund, mask, '<span class="currency-sign">$</span>')
      });
    } else if (((ref = field.caption) === 'Total Revenues' || ref === 'Total Expenditures' || ref === 'Surplus / (Deficit)') || is_first_row) {
      h += template({
        name: field.caption,
        genfund: currency(field.genfund, mask, '<span class="currency-sign">$</span>'),
        otherfunds: currency(field.otherfunds, mask, '<span class="currency-sign">$</span>'),
        totalfunds: currency(field.totalfunds, mask, '<span class="currency-sign">$</span>')
      });
      is_first_row = false;
    } else {
      h += template({
        name: field.caption,
        genfund: currency(field.genfund, mask),
        otherfunds: currency(field.otherfunds, mask),
        totalfunds: currency(field.totalfunds, mask)
      });
    }
  }
  return h;
};

under = function(s) {
  return s.replace(/[\s\+\-]/g, '_');
};

toTitleCase = function(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

currency = function(n, mask, sign) {
  var s;
  if (sign == null) {
    sign = '';
  }
  n = numeral(n);
  if (n < 0) {
    s = n.format(mask).toString();
    s = s.replace(/-/g, '');
    return "(" + sign + ('<span class="fin-val">' + s + '</span>') + ")";
  }
  n = n.format(mask);
  return "" + sign + ('<span class="fin-val">' + n + '</span>');
};

render_tabs = function(initial_layout, data, tabset, parent) {
  var bigChartWidth, detail_data, drawChart, graph, h, i, j, layout, layout_data, len, len1, len2, m, o, official, official_data, plot_handles, ref, smallChartWidth, tab, templates;
  layout = initial_layout;
  templates = parent.templates;
  plot_handles = {};
  layout_data = {
    title: data.name,
    wikipedia_page_exists: data.wikipedia_page_exists,
    wikipedia_page_name: data.wikipedia_page_name,
    transparent_california_page_name: data.transparent_california_page_name,
    latest_audit_url: data.latest_audit_url,
    tabs: [],
    tabcontent: ''
  };
  for (i = j = 0, len = layout.length; j < len; i = ++j) {
    tab = layout[i];
    layout_data.tabs.push({
      tabid: under(tab.name),
      tabname: tab.name,
      active: (i > 0 ? '' : 'active')
    });
  }
  for (i = m = 0, len1 = layout.length; m < len1; i = ++m) {
    tab = layout[i];
    detail_data = {
      tabid: under(tab.name),
      tabname: tab.name,
      active: (i > 0 ? '' : 'active'),
      tabcontent: ''
    };
    switch (tab.name) {
      case 'Overview + Elected Officials':
        detail_data.tabcontent += render_fields(tab.fields, data, templates['tabdetail-namevalue-template']);
        console.log(data);
        ref = data.elected_officials;
        for (i = o = 0, len2 = ref.length; o < len2; i = ++o) {
          official = ref[i];
          official_data = {
            title: '' !== official.title ? "Title: " + official.title : void 0,
            name: '' !== official.full_name ? "Name: " + official.full_name : void 0,
            email: official.email_address ? "Email: " + official.email_address : void 0,
            telephonenumber: null !== official.telephone_number && void 0 !== official.telephone_number ? "Telephone Number: " + official.telephone_number : void 0,
            termexpires: official.term_expires ? "Term Expires: " + official.term_expires : "Term Expires: ",
            altTypeSlug: data.alt_type_slug,
            nameSlug: data.slug,
            slug: official.slug
          };
          if ('' !== official.photo_url && official.photo_url !== void 0) {
            official_data.image = '<img src="' + official.photo_url + '" class="portrait" alt="" />';
          } else {
            official_data.image = '';
          }
          detail_data.tabcontent += templates['tabdetail-official-template'](official_data);
        }
        break;
      case 'Employee Compensation':
        h = '';
        h += render_fields(tab.fields, data, templates['tabdetail-namevalue-template']);
        detail_data.tabcontent += templates['tabdetail-employee-comp-template']({
          content: h
        });
        if (!plot_handles['median-comp-graph']) {
          graph = true;
          if (data['median_salary_per_full_time_emp'] === 0) {
            graph = false;
          }
          if (data['median_benefits_per_ft_emp'] === 0) {
            graph = false;
          }
          if (data['median_wages_general_public'] === 0) {
            graph = false;
          }
          if (data['median_benefits_general_public'] === 0) {
            graph = false;
          }
          smallChartWidth = 340;
          bigChartWidth = 470;
          if ($(window).width() < 490) {
            smallChartWidth = 300;
            bigChartWidth = 300;
          }
          drawChart = function() {
            return setTimeout((function() {
              var chart, formatter, options, vis_data;
              vis_data = new google.visualization.DataTable();
              vis_data.addColumn('string', 'Median Compensation');
              vis_data.addColumn('number', 'Wages');
              vis_data.addColumn('number', 'Bens.');
              vis_data.addRows([[toTitleCase(data.name + '\n Employees'), data['median_salary_per_full_time_emp'], data['median_benefits_per_ft_emp']], ['All \n' + toTitleCase(data.name + ' \n Residents'), data['median_wages_general_public'], data['median_benefits_general_public']]]);
              formatter = new google.visualization.NumberFormat({
                groupingSymbol: ',',
                fractionDigits: '0'
              });
              formatter.format(vis_data, 1);
              formatter.format(vis_data, 2);
              options = {
                'title': 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
                'titleTextStyle': {
                  'fontSize': 12
                },
                'tooltip': {
                  'textStyle': {
                    'fontSize': 12
                  }
                },
                'width': smallChartWidth,
                'height': 300,
                'isStacked': 'true',
                'colors': ['#005ce6', '#009933']
              };
              chart = new google.visualization.ColumnChart(document.getElementById('median-comp-graph'));
              chart.draw(vis_data, options);
            }), 1000);
          };
          if (graph) {
            google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          }
          plot_handles['median-comp-graph'] = 'median-comp-graph';
        }
        if (!plot_handles['median-pension-graph']) {
          graph = true;
          if (data['median_pension_30_year_retiree'] === 0) {
            graph = false;
          }
          drawChart = function() {
            return setTimeout((function() {
              var chart, formatter, options, vis_data;
              vis_data = new google.visualization.DataTable();
              vis_data.addColumn('string', 'Median Pension');
              vis_data.addColumn('number', 'Wages');
              vis_data.addRows([['Pension for \n Retiree w/ 30 Years', data['median_pension30_year_retiree']]]);
              formatter = new google.visualization.NumberFormat({
                groupingSymbol: ',',
                fractionDigits: '0'
              });
              formatter.format(vis_data, 1);
              options = {
                'title': 'Median Total Pension',
                'titleTextStyle': {
                  'fontSize': 12
                },
                'tooltip': {
                  'textStyle': {
                    'fontSize': 12
                  }
                },
                'width': smallChartWidth,
                'height': 300,
                'bar': {
                  'groupWidth': '30%'
                },
                'isStacked': 'true',
                'colors': ['#005ce6', '#009933']
              };
              if (graph) {
                chart = new google.visualization.ColumnChart(document.getElementById('median-pension-graph'));
                chart.draw(vis_data, options);
              }
            }), 1000);
          };
          google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          plot_handles['median-pension-graph'] = 'median-pension-graph';
        }
        break;
      case 'Financial Health':
        h = '';
        h += render_fields(tab.fields, data, templates['tabdetail-namevalue-template']);
        detail_data.tabcontent += templates['tabdetail-financial-health-template']({
          content: h
        });
        if (!plot_handles['public-safety-pie'] && data['alt_type'] !== 'School District') {
          graph = true;
          if (data['public_safety_exp_over_tot_gov_fund_revenue'] === 0) {
            graph = false;
          }
          drawChart = function() {
            return setTimeout((function() {
              var chart, options, vis_data;
              vis_data = new google.visualization.DataTable();
              vis_data.addColumn('string', 'Public Safety Expense');
              vis_data.addColumn('number', 'Total');
              vis_data.addRows([['Public Safety Exp', 1 - data['public_safety_exp_over_tot_gov_fund_revenue']], ['Other', data['public_safety_exp_over_tot_gov_fund_revenue']]]);
              options = {
                'title': 'Public safety expense',
                'titleTextStyle': {
                  'fontSize': 12
                },
                'tooltip': {
                  'textStyle': {
                    'fontSize': 12
                  }
                },
                'width': smallChartWidth,
                'height': 300,
                'is3D': 'true',
                'colors': ['#005ce6', '#009933'],
                'slices': {
                  1: {
                    offset: 0.2
                  }
                },
                'pieStartAngle': 45
              };
              chart = new google.visualization.PieChart(document.getElementById('public-safety-pie'));
              chart.draw(vis_data, options);
            }), 1000);
          };
          if (graph) {
            google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          }
          plot_handles['public-safety-pie'] = 'public-safety-pie';
        }
        if (!plot_handles['fin-health-revenue-graph'] && data['alt_type'] !== 'School District') {
          graph = true;
          if (data['total_revenue_per_capita'] === 0) {
            graph = false;
          }
          drawChart = function() {
            return setTimeout((function() {
              var chart, options, vis_data;
              vis_data = new google.visualization.DataTable();
              vis_data.addColumn('string', 'Per Capita');
              vis_data.addColumn('number', 'Rev.');
              vis_data.addRows([['Total Revenue \n Per Capita', data['total_revenue_per_capita']], ['Median Total \n Revenue Per \n Capita For All Cities', 420]]);
              options = {
                'title': 'Total Revenue',
                'titleTextStyle': {
                  'fontSize': 12
                },
                'tooltip': {
                  'textStyle': {
                    'fontSize': 12
                  }
                },
                'width': smallChartWidth,
                'height': 300,
                'isStacked': 'true',
                'colors': ['#005ce6', '#009933'],
                'chartArea.width': '100%'
              };
              chart = new google.visualization.ColumnChart(document.getElementById('fin-health-revenue-graph'));
              chart.draw(vis_data, options);
            }), 1000);
          };
          if (graph) {
            google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          }
          plot_handles['fin-health-revenue-graph'] = 'fin-health-revenue-graph';
        }
        if (!plot_handles['fin-health-expenditures-graph'] && data['alt_type'] !== 'School District') {
          graph = true;
          if (data['total_expenditures_per_capita'] === 0) {
            graph = false;
          }
          drawChart = function() {
            return setTimeout((function() {
              var chart, options, vis_data;
              vis_data = new google.visualization.DataTable();
              vis_data.addColumn('string', 'Per Capita');
              vis_data.addColumn('number', 'Exp.');
              vis_data.addRows([['Total Expenditures \n Per Capita', data['total_expenditures_per_capita']], ['Median Total \n Expenditures \n Per Capita \n For All Cities', 420]]);
              options = {
                'title': 'Total Expenditures',
                'titleTextStyle': {
                  'fontSize': 12
                },
                'tooltip': {
                  'textStyle': {
                    'fontSize': 12
                  }
                },
                'width': smallChartWidth,
                'height': 300,
                'isStacked': 'true',
                'colors': ['#005ce6', '#009933'],
                'chartArea.width': '100%'
              };
              if (graph) {
                chart = new google.visualization.ColumnChart(document.getElementById('fin-health-expenditures-graph'));
                chart.draw(vis_data, options);
              }
            }), 1000);
          };
          google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          plot_handles['fin-health-expenditures-graph'] = 'fin-health-expenditures-graph';
        }
        break;
      case 'Financial Statements':
        if (data.financial_statements) {
          h = '';
          h += render_financial_fields(data.financial_statements, templates['tabdetail-finstatement-template']);
          detail_data.tabcontent += templates['tabdetail-financial-statements-template']({
            content: h
          });
          if (!plot_handles['total-revenue-pie']) {
            graph = true;
            if (data.financial_statements.length === 0) {
              graph = false;
            }
            drawChart = function() {
              return setTimeout((function() {
                var chart, item, len3, options, p, r, ref1, rows, vis_data;
                vis_data = new google.visualization.DataTable();
                vis_data.addColumn('string', 'Total Gov. Expenditures');
                vis_data.addColumn('number', 'Total');
                rows = [];
                ref1 = data.financial_statements;
                for (p = 0, len3 = ref1.length; p < len3; p++) {
                  item = ref1[p];
                  if ((item.category_name === "Revenues") && (item.caption !== "Total Revenues")) {
                    r = [item.caption, parseInt(item.totalfunds)];
                    rows.push(r);
                  }
                }
                vis_data.addRows(rows);
                options = {
                  'title': 'Total Revenues',
                  'titleTextStyle': {
                    'fontSize': 16
                  },
                  'tooltip': {
                    'textStyle': {
                      'fontSize': 12
                    }
                  },
                  'width': bigChartWidth,
                  'height': 350,
                  'pieStartAngle': 60,
                  'sliceVisibilityThreshold': .05,
                  'forceIFrame': true,
                  'chartArea': {
                    width: '90%',
                    height: '75%'
                  }
                };
                if (graph) {
                  chart = new google.visualization.PieChart(document.getElementById('total-revenue-pie'));
                  chart.draw(vis_data, options);
                }
              }), 1000);
            };
          }
          if (graph) {
            google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          }
          plot_handles['total-revenue-pie'] = 'total-revenue-pie';
          if (!plot_handles['total-expenditures-pie']) {
            graph = true;
            if (data.financial_statements.length === 0) {
              graph = false;
            }
            drawChart = function() {
              return setTimeout((function() {
                var chart, item, len3, options, p, r, ref1, rows, vis_data;
                vis_data = new google.visualization.DataTable();
                vis_data.addColumn('string', 'Total Gov. Expenditures');
                vis_data.addColumn('number', 'Total');
                rows = [];
                ref1 = data.financial_statements;
                for (p = 0, len3 = ref1.length; p < len3; p++) {
                  item = ref1[p];
                  if ((item.category_name === "Expenditures") && (item.caption !== "Total Expenditures")) {
                    r = [item.caption, parseInt(item.totalfunds)];
                    rows.push(r);
                  }
                }
                vis_data.addRows(rows);
                options = {
                  'title': 'Total Expenditures',
                  'titleTextStyle': {
                    'fontSize': 16
                  },
                  'tooltip': {
                    'textStyle': {
                      'fontSize': 12
                    }
                  },
                  'width': bigChartWidth,
                  'height': 350,
                  'pieStartAngle': 60,
                  'sliceVisibilityThreshold': .05,
                  'forceIFrame': true,
                  'chartArea': {
                    width: '90%',
                    height: '75%'
                  }
                };
                if (graph) {
                  chart = new google.visualization.PieChart(document.getElementById('total-expenditures-pie'));
                  chart.draw(vis_data, options);
                }
              }), 1000);
            };
          }
          if (graph) {
            google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          }
          plot_handles['total-expenditures-pie'] = 'total-expenditures-pie';
        }
        break;
      default:
        detail_data.tabcontent += render_fields(tab.fields, data, templates['tabdetail-namevalue-template']);
    }
    layout_data.tabcontent += templates['tabdetail-template'](detail_data);
  }
  return templates['tabpanel-template'](layout_data);
};

get_layout_fields = function(la) {
  var f, field, j, len, len1, m, ref, t;
  f = {};
  for (j = 0, len = la.length; j < len; j++) {
    t = la[j];
    ref = t.fields;
    for (m = 0, len1 = ref.length; m < len1; m++) {
      field = ref[m];
      f[field] = 1;
    }
  }
  return f;
};

get_record_fields = function(r) {
  var f, field_name;
  f = {};
  for (field_name in r) {
    f[field_name] = 1;
  }
  return f;
};

get_unmentioned_fields = function(la, r) {
  var f, layout_fields, record_fields, unmentioned_fields;
  layout_fields = get_layout_fields(la);
  record_fields = get_record_fields(r);
  unmentioned_fields = [];
  for (f in record_fields) {
    if (!layout_fields[f]) {
      unmentioned_fields.push(f);
    }
  }
  return unmentioned_fields;
};

add_other_tab_to_layout = function(layout, data) {
  var l, t;
  if (layout == null) {
    layout = [];
  }
  l = $.extend(true, [], layout);
  t = {
    name: "Other",
    fields: get_unmentioned_fields(l, data)
  };
  l.push(t);
  return l;
};

convert_fusion_template = function(templ) {
  var categories, categories_array, categories_sort, category, col_hash, fieldname, fields, get_col_hash, hash_to_array, i, j, len, len1, len2, len3, m, n, o, obj, p, placeholder_count, ref, ref1, row, tab_hash, tab_newhash, tabs, val;
  tab_hash = {};
  tabs = [];
  get_col_hash = function(columns) {
    var col_hash, col_name, i, j, len, ref;
    col_hash = {};
    ref = templ.columns;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      col_name = ref[i];
      col_hash[col_name] = i;
    }
    return col_hash;
  };
  val = function(field_name, fields, col_hash) {
    return fields[col_hash[field_name]];
  };
  hash_to_array = function(hash) {
    var a, k, tab;
    a = [];
    for (k in hash) {
      tab = {};
      tab.name = k;
      tab.fields = hash[k];
      a.push(tab);
    }
    return a;
  };
  col_hash = get_col_hash(templ.col_hash);
  placeholder_count = 0;
  ref = templ.rows;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    row = ref[i];
    category = val('general_category', row, col_hash);
    fieldname = val('field_name', row, col_hash);
    if (!fieldname) {
      fieldname = "_" + String(++placeholder_count);
    }
    fieldNames[val('field_name', row, col_hash)] = val('description', row, col_hash);
    fieldNamesHelp[fieldname] = val('help_text', row, col_hash);
    if (category) {
      if (tab_hash[category] == null) {
        tab_hash[category] = [];
      }
      tab_hash[category].push({
        n: val('n', row, col_hash),
        name: fieldname,
        mask: val('mask', row, col_hash)
      });
    }
  }
  categories = Object.keys(tab_hash);
  categories_sort = {};
  for (m = 0, len1 = categories.length; m < len1; m++) {
    category = categories[m];
    if (!categories_sort[category]) {
      categories_sort[category] = tab_hash[category][0].n;
    }
    fields = [];
    ref1 = tab_hash[category];
    for (o = 0, len2 = ref1.length; o < len2; o++) {
      obj = ref1[o];
      fields.push(obj);
    }
    fields.sort(function(a, b) {
      return a.n - b.n;
    });
    tab_hash[category] = fields;
  }
  categories_array = [];
  for (category in categories_sort) {
    n = categories_sort[category];
    categories_array.push({
      category: category,
      n: n
    });
  }
  categories_array.sort(function(a, b) {
    return a.n - b.n;
  });
  tab_newhash = {};
  for (p = 0, len3 = categories_array.length; p < len3; p++) {
    category = categories_array[p];
    tab_newhash[category.category] = tab_hash[category.category];
  }
  tabs = hash_to_array(tab_newhash);
  return tabs;
};

Templates2 = (function() {
  Templates2.list = void 0;

  Templates2.templates = void 0;

  Templates2.data = void 0;

  Templates2.events = void 0;

  function Templates2() {
    var i, j, len, len1, m, template, templateList, templatePartials;
    this.list = [];
    this.events = {};
    templateList = ['tabpanel-template', 'tabdetail-template', 'tabdetail-namevalue-template', 'tabdetail-finstatement-template', 'tabdetail-official-template', 'tabdetail-employee-comp-template', 'tabdetail-financial-health-template', 'tabdetail-financial-statements-template', 'person-info-template'];
    templatePartials = ['tab-template'];
    this.templates = {};
    for (i = j = 0, len = templateList.length; j < len; i = ++j) {
      template = templateList[i];
      this.templates[template] = Handlebars.compile($('#' + template).html());
    }
    for (i = m = 0, len1 = templatePartials.length; m < len1; i = ++m) {
      template = templatePartials[i];
      Handlebars.registerPartial(template, $('#' + template).html());
    }
  }

  Templates2.prototype.add_template = function(layout_name, layout_json) {
    return this.list.push({
      parent: this,
      name: layout_name,
      render: function(dat) {
        this.parent.data = dat;
        return render_tabs(layout_json, dat, this, this.parent);
      },
      bind: function(tpl_name, callback) {
        if (!this.parent.events[tpl_name]) {
          return this.parent.events[tpl_name] = [callback];
        } else {
          return this.parent.events[tpl_name].push(callback);
        }
      },
      activate: function(tpl_name) {
        var e, i, j, len, ref, results;
        if (this.parent.events[tpl_name]) {
          ref = this.parent.events[tpl_name];
          results = [];
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            e = ref[i];
            results.push(e(tpl_name, this.parent.data));
          }
          return results;
        }
      }
    });
  };

  Templates2.prototype.load_template = function(template_name, url) {
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: (function(_this) {
        return function(template_json) {
          return _this.add_template(template_name, template_json);
        };
      })(this)
    });
  };

  Templates2.prototype.load_fusion_template = function(template_name, url) {
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: (function(_this) {
        return function(template_json) {
          var t;
          t = convert_fusion_template(template_json);
          return _this.add_template(template_name, t);
        };
      })(this)
    });
  };

  Templates2.prototype.get_names = function() {
    var j, len, ref, results, t;
    ref = this.list;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      results.push(t.name);
    }
    return results;
  };

  Templates2.prototype.get_index_by_name = function(name) {
    var i, j, len, ref, t;
    ref = this.list;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      t = ref[i];
      if (t.name === name) {
        i;
      }
    }
    return -1;
  };

  Templates2.prototype.get_html = function(ind, data) {
    if (ind === -1) {
      return "";
    }
    if (this.list[ind]) {
      return this.list[ind].render(data);
    } else {
      return "";
    }
  };

  Templates2.prototype.activate = function(ind, tpl_name) {
    if (this.list[ind]) {
      return this.list[ind].activate(tpl_name);
    }
  };

  return Templates2;

})();

module.exports = Templates2;



},{}],6:[function(require,module,exports){
var create_wikipedia_article, get_wikipedia_article;

$(function() {
  window.get_wikipedia_article = get_wikipedia_article;
  return window.create_wikipedia_article = create_wikipedia_article;
});

get_wikipedia_article = function(s) {
  var article_name;
  article_name = s.replace(/.*\/([^\/]*)$/, "$1");
  return $.getJSON("http://en.wikipedia.org/w/api.php?action=parse&page=" + article_name + "&prop=text&format=json&callback=?", function(json) {
    $('#wikipediaTitle').html(json.parse.title);
    $('#wikipediaArticle').html(json.parse.text["*"]);
    $("#wikipediaArticle").find("a:not(.references a)").attr("href", function() {
      return "http://www.wikipedia.org" + $(this).attr("href");
    });
    return $("#wikipediaArticle").find("a").attr("target", "_blank");
  });
};

create_wikipedia_article = function() {
  return alert("Not implemented");
};

module.exports = {
  get_wikipedia_article: get_wikipedia_article
};



},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOlxcVXNlcnNcXFJvYmVydFxcRG9jdW1lbnRzXFxnb3Z3aWtpXFx3ZWJcXGxlZ2FjeVxcY29mZmVlXFxnb3ZtYXAuY29mZmVlIiwiQzpcXFVzZXJzXFxSb2JlcnRcXERvY3VtZW50c1xcZ292d2lraVxcd2ViXFxsZWdhY3lcXGNvZmZlZVxcZ292c2VsZWN0b3IuY29mZmVlIiwiQzpcXFVzZXJzXFxSb2JlcnRcXERvY3VtZW50c1xcZ292d2lraVxcd2ViXFxsZWdhY3lcXGNvZmZlZVxcbWFpbi5jb2ZmZWUiLCJDOlxcVXNlcnNcXFJvYmVydFxcRG9jdW1lbnRzXFxnb3Z3aWtpXFx3ZWJcXGxlZ2FjeVxcY29mZmVlXFxxdWVyeW1hdGNoZXIuY29mZmVlIiwiQzpcXFVzZXJzXFxSb2JlcnRcXERvY3VtZW50c1xcZ292d2lraVxcd2ViXFxsZWdhY3lcXGNvZmZlZVxcdGVtcGxhdGVzMi5jb2ZmZWUiLCJDOlxcVXNlcnNcXFJvYmVydFxcRG9jdW1lbnRzXFxnb3Z3aWtpXFx3ZWJcXGxlZ2FjeVxcY29mZmVlXFx3aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFHZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLGNBQUEsRUFBZ0IsS0FOaEI7RUFPQSxVQUFBLEVBQVksS0FQWjtFQVFBLGNBQUEsRUFBZ0IsS0FSaEI7RUFTQSxXQUFBLEVBQWEsSUFUYjtFQVVBLGtCQUFBLEVBQ0U7SUFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFwQztHQVhGO0NBRFE7O0FBY1YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFTLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBNUIsQ0FBc0MsQ0FBQyxJQUF4RCxDQUE2RCxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUE3RDs7QUFFQSxnQkFBQSxHQUFtQixTQUFBO0FBQ2pCLE1BQUE7QUFBQTtBQUFBO09BQUEscUNBQUE7O2tCQUFBLFVBQUEsQ0FBVyxHQUFYO0FBQUE7O0FBRGlCOztBQUduQixjQUFBLEdBQWlCLFNBQUE7QUFDZixNQUFBO0VBQUEsV0FBQSxHQUFjLENBQUMsTUFBRCxFQUFTLGlCQUFULEVBQTRCLGtCQUE1QjtFQUNkLE9BQU8sQ0FBQyxpQkFBUixHQUE0QjtTQUM1QixDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDckIsUUFBQTtJQUFBLElBQUcsT0FBQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixDQUFBLEVBQUEsYUFBMkIsV0FBM0IsRUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUEyQyxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsR0FBWCxDQUFBLENBQUEsS0FBb0IsR0FBbEU7YUFDRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEIsQ0FBL0IsRUFERjs7RUFEcUIsQ0FBdkI7QUFIZTs7QUFRakIsWUFBQSxHQUFlLFNBQUMsVUFBRCxFQUFhLFNBQWI7U0FDYixDQUFDLENBQUMsSUFBRixDQUNFO0lBQUEsR0FBQSxFQUFJLG9EQUFKO0lBQ0EsSUFBQSxFQUFNO01BQUUsUUFBQSxFQUFVLFVBQVo7S0FETjtJQUVBLFFBQUEsRUFBVSxNQUZWO0lBR0EsS0FBQSxFQUFPLElBSFA7SUFJQSxPQUFBLEVBQVMsU0FKVDtJQUtBLEtBQUEsRUFBTSxTQUFDLENBQUQ7YUFDSixPQUFPLENBQUMsR0FBUixDQUFZLENBQVo7SUFESSxDQUxOO0dBREY7QUFEYTs7QUFVZixDQUFBLENBQUUsU0FBQTtFQUVBLGNBQUEsQ0FBQTtFQUNBLFlBQUEsQ0FBYSxPQUFPLENBQUMsaUJBQXJCLEVBQXdDLFNBQUMsSUFBRDtJQUN0QyxPQUFPLENBQUMsT0FBUixHQUFrQjtXQUNsQixnQkFBQSxDQUFBO0VBRnNDLENBQXhDO0VBSUEsQ0FBQSxDQUFFLG1DQUFGLENBQXNDLENBQUMsRUFBdkMsQ0FBMEMsT0FBMUMsRUFBbUQsU0FBQTtBQUNqRCxRQUFBO0lBQUEsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLFdBQVIsQ0FBb0IsUUFBcEI7SUFDQSxZQUFBLEdBQWUsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFiO0lBQ2YsS0FBQSxHQUFRLFlBQVksQ0FBQyxHQUFiLENBQUE7SUFDUixZQUFZLENBQUMsR0FBYixDQUFvQixLQUFBLEtBQVMsR0FBWixHQUFxQixHQUFyQixHQUE4QixHQUEvQztJQUNBLGNBQUEsQ0FBQTtJQUNBLEdBQUcsQ0FBQyxhQUFKLENBQUE7V0FDQSxnQkFBQSxDQUFBO0VBUGlELENBQW5EO1NBU0EsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsRUFBakMsQ0FBb0MsT0FBcEMsRUFBNkMsU0FBQTtJQUMzQyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsV0FBUixDQUFvQixRQUFwQjtJQUNBLElBQUcsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLFFBQVIsQ0FBaUIsUUFBakIsQ0FBSDthQUFtQyxPQUFPLENBQUMsWUFBUixDQUFxQixPQUFPLENBQUMsYUFBN0IsRUFBbkM7S0FBQSxNQUFBO2FBQW1GLEdBQUcsQ0FBQyxjQUFKLENBQUEsRUFBbkY7O0VBRjJDLENBQTdDO0FBaEJBLENBQUY7O0FBdUJBLFFBQUEsR0FBVSxTQUFDLFFBQUQ7QUFFUixNQUFBO0VBQUEsT0FBQSxHQUFTLFNBQUMsS0FBRDtXQUNQO01BQUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQTdCO01BQ0EsV0FBQSxFQUFhLENBRGI7TUFFQSxTQUFBLEVBQVUsS0FGVjtNQUdBLFlBQUEsRUFBYyxDQUhkO01BSUEsV0FBQSxFQUFZLE9BSlo7TUFNQSxLQUFBLEVBQU0sQ0FOTjs7RUFETztBQVNULFVBQU8sUUFBUDtBQUFBLFNBQ08sTUFEUDtBQUNtQixhQUFPLE9BQUEsQ0FBUSxLQUFSO0FBRDFCLFNBRU8saUJBRlA7QUFFOEIsYUFBTyxPQUFBLENBQVEsV0FBUjtBQUZyQyxTQUdPLGtCQUhQO0FBRytCLGFBQU8sT0FBQSxDQUFRLFFBQVI7QUFIdEM7QUFJTyxhQUFPLE9BQUEsQ0FBUSxPQUFSO0FBSmQ7QUFYUTs7QUFpQlYsUUFBQSxHQUFXLFNBQUMsT0FBRCxFQUFVLFFBQVY7QUFDVCxNQUFBO0FBQUEsT0FBQSwwQ0FBQTs7SUFDRSxJQUFlLElBQUEsS0FBUSxPQUF2QjtBQUFBLGFBQU8sS0FBUDs7QUFERjtTQUVBO0FBSFM7O0FBTVgsVUFBQSxHQUFhLFNBQUMsR0FBRDtBQUVYLE1BQUE7RUFBQSxLQUFBLEdBQVEsUUFBQSxDQUFTLEdBQUcsQ0FBQyxPQUFiLEVBQXNCLE9BQU8sQ0FBQyxpQkFBOUI7RUFDUixJQUFHLEtBQUEsS0FBUyxLQUFaO0FBQXVCLFdBQU8sTUFBOUI7O1NBQ0EsR0FBRyxDQUFDLFNBQUosQ0FDRTtJQUFBLEdBQUEsRUFBSyxHQUFHLENBQUMsUUFBVDtJQUNBLEdBQUEsRUFBSyxHQUFHLENBQUMsU0FEVDtJQUVBLElBQUEsRUFBTSxRQUFBLENBQVMsR0FBRyxDQUFDLE9BQWIsQ0FGTjtJQUdBLEtBQUEsRUFBVyxHQUFHLENBQUMsSUFBTCxHQUFVLElBQVYsR0FBYyxHQUFHLENBQUMsSUFINUI7SUFJQSxVQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQVMsd0VBQUEsR0FDaUUsR0FBRyxDQUFDLFdBRHJFLEdBQ2lGLEdBRGpGLEdBQ29GLEdBQUcsQ0FBQyxJQUR4RixHQUM2RixZQUQ3RixHQUN5RyxHQUFHLENBQUMsSUFEN0csR0FDa0gsNEJBRGxILEdBRUMsR0FBRyxDQUFDLElBRkwsR0FFVSxJQUZWLEdBRWMsR0FBRyxDQUFDLElBRmxCLEdBRXVCLEdBRnZCLEdBRTBCLEdBQUcsQ0FBQyxHQUY5QixHQUVrQyxHQUZsQyxHQUVxQyxHQUFHLENBQUMsS0FGekMsR0FFK0MsUUFGeEQ7S0FMRjtHQURGO0FBSlc7O0FBaUJiLFFBQUEsR0FBZSxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBYixDQUNiLCtFQURhLEVBRVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWIsQ0FBbUIsRUFBbkIsRUFBdUIsRUFBdkIsQ0FGUyxFQUdULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLENBSFMsRUFJVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixFQUFwQixFQUF3QixFQUF4QixDQUpTOztBQVFmLFlBQUEsR0FBZSxTQUFDLElBQUQsRUFBTSxJQUFOO1NBQ2IsS0FBSyxDQUFDLE9BQU4sQ0FDRTtJQUFBLE9BQUEsRUFBUyxJQUFUO0lBQ0EsUUFBQSxFQUFVLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDUixVQUFBO01BQUEsSUFBRyxNQUFBLEtBQVUsSUFBYjtRQUNFLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxTQUFKLENBQWMsTUFBTSxDQUFDLEdBQVAsQ0FBQSxDQUFkLEVBQTRCLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FBNUI7UUFDQSxHQUFHLENBQUMsU0FBSixDQUNFO1VBQUEsR0FBQSxFQUFLLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FBTDtVQUNBLEdBQUEsRUFBSyxNQUFNLENBQUMsR0FBUCxDQUFBLENBREw7VUFFQSxJQUFBLEVBQU0sT0FGTjtVQUdBLEtBQUEsRUFBTyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBSGxCO1VBSUEsVUFBQSxFQUNFO1lBQUEsT0FBQSxFQUFTLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxpQkFBcEI7V0FMRjtTQURGO1FBUUEsSUFBRyxJQUFIO1VBQ0UsR0FBRyxDQUFDLFNBQUosQ0FDRTtZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsUUFBVjtZQUNBLEdBQUEsRUFBSyxJQUFJLENBQUMsU0FEVjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsS0FBQSxFQUFPLE1BSFA7WUFJQSxJQUFBLEVBQU0sUUFKTjtZQUtBLEtBQUEsRUFBVyxJQUFJLENBQUMsUUFBTixHQUFlLEdBQWYsR0FBa0IsSUFBSSxDQUFDLFNBTGpDO1lBTUEsVUFBQSxFQUNFO2NBQUEsT0FBQSxFQUFZLElBQUksQ0FBQyxRQUFOLEdBQWUsR0FBZixHQUFrQixJQUFJLENBQUMsU0FBbEM7YUFQRjtXQURGLEVBREY7O1FBV0EsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QiwwQkFBQSxHQUEyQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBQTlELEVBdEJGOztJQURRLENBRFY7R0FERjtBQURhOztBQThCZixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsR0FBQSxFQUFLLEdBQUw7Ozs7OztBQzdJRixJQUFBLDBCQUFBO0VBQUE7O0FBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVI7O0FBRVY7QUFHSixNQUFBOzt3QkFBQSxXQUFBLEdBQWEsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVosR0FBQTs7RUFHQSxxQkFBQyxhQUFELEVBQWlCLFFBQWpCLEVBQTJCLFNBQTNCO0lBQUMsSUFBQyxDQUFBLGdCQUFEO0lBQTBCLElBQUMsQ0FBQSxZQUFEOztJQUN0QyxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFFBQUw7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLEtBQUEsRUFBTyxJQUZQO01BR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxlQUhWO0tBREY7RUFEVzs7d0JBVWIsa0JBQUEsR0FBcUIsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsbUxBQW5COztFQVNyQixhQUFBLEdBQWdCOztFQUVoQixVQUFBLEdBQWE7O3dCQUViLFVBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLEtBQUEsR0FBTztBQUNQO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFHLE9BQU8sQ0FBQyxZQUFSLElBQXlCLENBQUMsQ0FBQyxLQUFGLEtBQWEsT0FBTyxDQUFDLFlBQWpEO0FBQW1FLGlCQUFuRTs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxlQUFSLElBQTRCLENBQUMsQ0FBQyxRQUFGLEtBQWdCLE9BQU8sQ0FBQyxlQUF2RDtBQUE0RSxpQkFBNUU7O01BQ0EsS0FBQTtBQUhGO0FBSUEsV0FBTztFQU5JOzt3QkFTYixlQUFBLEdBQWtCLFNBQUMsSUFBRDtJQUVoQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQztJQUNuQixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7ZUFDcEIsS0FBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxHQUFoQixDQUFBO01BREc7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBR0EsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUNULENBQUEsQ0FBRSxLQUFDLENBQUEsYUFBSCxDQUFpQixDQUFDLElBQWxCLENBQXVCLGFBQXZCLEVBQXNDLGlCQUF0QztNQURTO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRUUsSUFGRjtJQUlBLENBQUEsQ0FBRSxJQUFDLENBQUEsYUFBSCxDQUFpQixDQUFDLFNBQWxCLENBQ0k7TUFBQSxJQUFBLEVBQU0sS0FBTjtNQUNBLFNBQUEsRUFBVyxLQURYO01BRUEsU0FBQSxFQUFXLENBRlg7TUFHQSxVQUFBLEVBQ0M7UUFBQSxJQUFBLEVBQU0sa0JBQU47T0FKRDtLQURKLEVBT0k7TUFBQSxJQUFBLEVBQU0sVUFBTjtNQUNBLFVBQUEsRUFBWSxVQURaO01BRUEsTUFBQSxFQUFRLGFBQUEsQ0FBYyxJQUFDLENBQUEsVUFBZixFQUEyQixJQUFDLENBQUEsU0FBNUIsQ0FGUjtNQUlBLFNBQUEsRUFBVztRQUFBLFVBQUEsRUFBWSxJQUFDLENBQUEsa0JBQWI7T0FKWDtLQVBKLENBYUEsQ0FBQyxFQWJELENBYUksb0JBYkosRUFhMkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksSUFBWjtRQUN2QixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsU0FBaEIsQ0FBMEIsS0FBMUIsRUFBaUMsS0FBQyxDQUFBLGFBQWxDO2VBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBYSxHQUFiLEVBQWtCLElBQWxCLEVBQXdCLElBQXhCO01BRnVCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWIzQixDQWlCQSxDQUFDLEVBakJELENBaUJJLHlCQWpCSixFQWlCK0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksSUFBWjtlQUMzQixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsR0FBaEIsQ0FBb0IsS0FBQyxDQUFBLGFBQXJCO01BRDJCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWpCL0I7RUFWZ0I7Ozs7OztBQXNDcEIsTUFBTSxDQUFDLE9BQVAsR0FBZTs7Ozs7O0FDL0VmOzs7Ozs7OztBQUFBLElBQUE7O0FBU0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxzQkFBUjs7QUFFZCxVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSOztBQUNiLFNBQUEsR0FBWSxPQUFBLENBQVEsb0JBQVI7O0FBRVosTUFBQSxHQUFTOztBQUNULFlBQUEsR0FBZTs7QUFDZixTQUFBLEdBQVksSUFBSTs7QUFDaEIsVUFBQSxHQUFhOztBQUNiLEtBQUEsR0FBUTs7QUFDUixVQUFBLEdBQWE7O0FBRWIsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsT0FBMUIsRUFBbUMsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLElBQVA7RUFDL0IsSUFBRyxNQUFIO0FBQ0ksV0FBTyxJQUFJLENBQUMsRUFBTCxDQUFRLElBQVIsRUFEWDtHQUFBLE1BQUE7QUFHSSxXQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUhYOztBQUQrQixDQUFuQzs7QUFNQSxNQUFNLENBQUMsT0FBUCxHQUNJO0VBQUEsWUFBQSxFQUFjLEVBQWQ7RUFDQSxlQUFBLEVBQWlCLEVBRGpCO0VBRUEsaUJBQUEsRUFBbUIsQ0FBQyxNQUFELEVBQVMsaUJBQVQsRUFBNEIsa0JBQTVCLENBRm5CO0VBSUEsZ0JBQUEsRUFBa0IsU0FBQTtJQUNkLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7SUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxNQUF0QixDQUE2QixHQUE3QjtXQUNBLGtCQUFBLENBQW1CLEdBQW5CO0VBSmMsQ0FKbEI7RUFVQSxjQUFBLEVBQWdCLFNBQUE7SUFDWixDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7SUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxNQUFwQixDQUEyQixHQUEzQjtXQUNBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLElBQXRCLENBQUE7RUFIWSxDQVZoQjs7O0FBZUosT0FBTyxDQUFDLFlBQVIsR0FBdUIsWUFBQSxHQUFlLFNBQUMsUUFBRDtTQUNsQyxDQUFDLENBQUMsSUFBRixDQUNJO0lBQUEsR0FBQSxFQUFLLHlDQUFMO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxLQUFBLEVBQU8sSUFGUDtJQUdBLE9BQUEsRUFBUyxTQUFDLFlBQUQ7YUFDTCxRQUFBLENBQVMsWUFBVDtJQURLLENBSFQ7R0FESjtBQURrQzs7QUFRdEMsT0FBTyxDQUFDLGFBQVIsR0FBd0IsYUFBQSxHQUFnQixTQUFDLFlBQUQ7QUFDcEMsTUFBQTtBQUFBO0FBQUE7T0FBQSxxQ0FBQTs7aUJBQ08sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE1BQUQ7ZUFDQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVgsQ0FBdUI7VUFDbkIsS0FBQSxFQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FESjtVQUVuQixVQUFBLEVBQVksSUFGTztVQUduQixXQUFBLEVBQWEsU0FITTtVQUluQixhQUFBLEVBQWUsR0FKSTtVQUtuQixZQUFBLEVBQWMsR0FMSztVQU1uQixTQUFBLEVBQVcsU0FOUTtVQU9uQixXQUFBLEVBQWEsSUFQTTtVQVFuQixRQUFBLEVBQVUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQVJUO1VBU25CLE9BQUEsRUFBUyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBVFI7VUFVbkIsTUFBQSxFQUFZLElBQUEsZUFBQSxDQUFnQjtZQUN4QixRQUFBLEVBQWMsSUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQVosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FEVTtZQUV4QixTQUFBLEVBQVcsS0FGYTtZQUd4QixXQUFBLEVBQWEsS0FIVztZQUl4QixHQUFBLEVBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUpRO1lBS3hCLFlBQUEsRUFBYyxNQUFNLENBQUMsVUFBVSxDQUFDLElBTFI7WUFNeEIsV0FBQSxFQUFpQixJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBWixDQUFrQixDQUFDLEVBQW5CLEVBQXVCLEVBQXZCLENBTk87WUFPeEIsVUFBQSxFQUFZLGVBUFk7WUFReEIsVUFBQSxFQUFZO2NBQUMsT0FBQSxFQUFTLEdBQVY7YUFSWTtZQVN4QixJQUFBLEVBQU0seUJBVGtCO1lBVXhCLE9BQUEsRUFBUyxLQVZlO1dBQWhCLENBVk87VUFzQm5CLFNBQUEsRUFBVyxTQUFBO21CQUNQLElBQUksQ0FBQyxVQUFMLENBQWdCO2NBQUMsU0FBQSxFQUFXLFNBQVo7YUFBaEI7VUFETyxDQXRCUTtVQXdCbkIsU0FBQSxFQUFXLFNBQUMsS0FBRDtZQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixLQUFLLENBQUMsTUFBOUI7bUJBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFaLENBQXVCLElBQXZCO1VBRk8sQ0F4QlE7VUEyQm5CLFFBQUEsRUFBVSxTQUFBO1lBQ04sSUFBSSxDQUFDLFVBQUwsQ0FBZ0I7Y0FBQyxTQUFBLEVBQVcsU0FBWjthQUFoQjttQkFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVosQ0FBdUIsS0FBdkI7VUFGTSxDQTNCUztVQThCbkIsS0FBQSxFQUFPLFNBQUE7QUFDSCxnQkFBQTtZQUFBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7WUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO1lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtZQUNBLEdBQUEsR0FBTSxHQUFBLEdBQUksTUFBTSxDQUFDLGFBQVgsR0FBeUIsR0FBekIsR0FBNEIsTUFBTSxDQUFDLFVBQVUsQ0FBQzttQkFDcEQsQ0FBQyxDQUFDLElBQUYsQ0FDSTtjQUFBLEdBQUEsRUFBSyxtQ0FBQSxHQUFzQyxHQUEzQztjQUNBLFFBQUEsRUFBVSxNQURWO2NBRUEsS0FBQSxFQUFPLElBRlA7Y0FHQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBQ0wsb0JBQUE7Z0JBQUEscUJBQUEsR0FBd0IsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEI7Z0JBQ3hCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLHFCQUFuQjtnQkFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO2dCQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7Z0JBQ0EsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBO3VCQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtrQkFBQyxRQUFBLEVBQVUscUJBQVg7aUJBQXpCLEVBQTRELG9CQUE1RCxFQUFrRixHQUFsRjtjQU5LLENBSFQ7YUFESjtVQUxHLENBOUJZO1NBQXZCO01BREQ7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUgsQ0FBSSxNQUFKO0FBREo7O0FBRG9DOztBQW1EeEMsTUFBTSxDQUFDLFlBQVAsR0FBc0IsU0FBQyxJQUFEO1NBQVMsVUFBQSxHQUFhO0FBQXRCOztBQUV0QixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLE9BQWYsRUFBd0IsY0FBeEIsRUFBd0MsU0FBQyxDQUFEO0FBQ3BDLE1BQUE7RUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxhQUFKLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBeEI7RUFDYixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7RUFDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxRQUF4QztFQUNBLENBQUEsQ0FBRSxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixNQUF4QixDQUFGLENBQWtDLENBQUMsUUFBbkMsQ0FBNEMsUUFBNUM7RUFDQSxTQUFTLENBQUMsUUFBVixDQUFtQixDQUFuQixFQUFzQixVQUF0QjtFQUVBLElBQUcsVUFBQSxLQUFjLHNCQUFqQjtJQUNJLGVBQUEsR0FBa0I7SUFDbEIsZUFBQSxHQUFrQjtJQUNsQixlQUFBLEdBQWtCO0lBRWxCLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxpREFBRixDQUFvRCxDQUFDLEdBQXJELENBQXlELE9BQXpELEVBQWtFLGVBQUEsR0FBa0IsRUFBcEY7SUFDQSxDQUFBLENBQUUsaURBQUYsQ0FBb0QsQ0FBQyxHQUFyRCxDQUF5RCxPQUF6RCxFQUFrRSxlQUFBLEdBQWtCLEVBQXBGO1dBQ0EsQ0FBQSxDQUFFLGlEQUFGLENBQW9ELENBQUMsR0FBckQsQ0FBeUQsT0FBekQsRUFBa0UsZUFBQSxHQUFrQixFQUFwRixFQXpCSjs7QUFQb0MsQ0FBeEM7O0FBbUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxPQUFaLENBQW9CO0VBQUMsUUFBQSxFQUFVLHlCQUFYO0VBQXNDLE9BQUEsRUFBUyxPQUEvQztDQUFwQjs7QUFFQSxZQUFBLEdBQWUsU0FBQTtTQUNYLENBQUEsQ0FBRSx5QkFBQSxHQUEwQixVQUExQixHQUFxQyxJQUF2QyxDQUEyQyxDQUFDLEdBQTVDLENBQWdELE1BQWhEO0FBRFc7O0FBSWYsV0FBQSxHQUFjLFNBQUMsS0FBRDtFQUVWLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQThCLEVBQTlCO1NBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyxxQ0FBQSxHQUFzQyxLQUEzQztJQUNBLFFBQUEsRUFBVSxNQURWO0lBRUEsT0FBQSxFQUFTO01BQUMsaUNBQUEsRUFBbUMsU0FBcEM7S0FGVDtJQUdBLEtBQUEsRUFBTyxJQUhQO0lBSUEsT0FBQSxFQUFTLFNBQUMsSUFBRDtNQUNMLElBQUcsSUFBSDtRQUNJLHdCQUFBLENBQXlCLElBQUksQ0FBQyxHQUE5QixFQUFtQyxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLEtBQXBCO1VBQy9CLElBQUksQ0FBQyxvQkFBTCxHQUE0QjtpQkFDNUIscUJBQUEsQ0FBc0IsSUFBSSxDQUFDLEdBQTNCLEVBQWdDLEVBQWhDLEVBQW9DLFNBQUMsS0FBRCxFQUFRLFdBQVIsRUFBcUIsTUFBckI7WUFDaEMsSUFBSSxDQUFDLGlCQUFMLEdBQXlCO21CQUN6QixhQUFBLENBQWMsU0FBQyxrQkFBRDtjQUNWLElBQUksQ0FBQyxTQUFMLEdBQWlCLGtCQUFrQixDQUFDLE1BQU8sQ0FBQSxDQUFBO3FCQUkzQyxZQUFBLENBQUE7WUFMVSxDQUFkO1VBRmdDLENBQXBDO1FBRitCLENBQW5DLEVBREo7O0lBREssQ0FKVDtJQXNCQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0F0QlA7R0FESjtBQUhVOztBQThCZCxxQkFBQSxHQUF3QixTQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFNBQXJCO1NBQ3BCLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssb0NBQUEsR0FBdUMsUUFBdkMsR0FBa0QsR0FBbEQsR0FBd0QsUUFBN0Q7SUFDQSxRQUFBLEVBQVUsTUFEVjtJQUVBLEtBQUEsRUFBTyxJQUZQO0lBR0EsT0FBQSxFQUFTLFNBSFQ7SUFJQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0FKUDtHQURKO0FBRG9COztBQVN4Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxTQUFUO1NBQ3ZCLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssOERBQUw7SUFDQSxJQUFBLEVBQ0k7TUFBQSxRQUFBLEVBQVUsU0FBVjtNQUNBLEtBQUEsRUFBTyxnQ0FEUDtNQUVBLE1BQUEsRUFBUTtRQUNKO1VBQUEsSUFBQSxFQUFNLFNBQU47VUFDQSxVQUFBLEVBQVksSUFEWjtVQUVBLEtBQUEsRUFBTyxNQUZQO1NBREk7T0FGUjtLQUZKO0lBVUEsUUFBQSxFQUFVLE1BVlY7SUFXQSxLQUFBLEVBQU8sSUFYUDtJQVlBLE9BQUEsRUFBUyxTQVpUO0lBYUEsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBYlA7R0FESjtBQUR1Qjs7QUFtQjNCLGFBQUEsR0FBZ0IsU0FBQyxTQUFEO1NBQ1osQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyx5Q0FBTDtJQUNBLElBQUEsRUFDSTtNQUFBLFFBQUEsRUFBVSxTQUFWO0tBRko7SUFHQSxRQUFBLEVBQVUsTUFIVjtJQUlBLEtBQUEsRUFBTyxJQUpQO0lBS0EsT0FBQSxFQUFTLFNBTFQ7R0FESjtBQURZOztBQVNoQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWYsR0FBNkIsQ0FBQSxTQUFBLEtBQUE7U0FBQSxTQUFDLEdBQUQ7SUFDekIsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsR0FBdEIsQ0FBbkI7SUFDQSxZQUFBLENBQUE7SUFDQSxPQUFPLENBQUMsY0FBUixDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsR0FBRyxDQUFDLEdBQXBCO0VBSnlCO0FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTs7QUFPN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFmLEdBQThCLENBQUEsU0FBQSxLQUFBO1NBQUEsU0FBQyxHQUFEO1dBQzFCLHFCQUFBLENBQXNCLEdBQUcsQ0FBQyxXQUExQixFQUF1QyxHQUFHLENBQUMsSUFBM0MsRUFBaUQsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixLQUFuQjtBQUM3QyxVQUFBO01BQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCO01BQ3hCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQW5CLEVBQXNCLEdBQXRCLENBQW5CO01BRUEsWUFBQSxDQUFBO01BQ0EsT0FBTyxDQUFDLGNBQVIsQ0FBQTtNQUNBLEdBQUEsR0FBTSxHQUFHLENBQUMsV0FBSixHQUFrQixHQUFsQixHQUF3QixHQUFHLENBQUM7YUFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFsQixHQUE2QjtJQVBnQixDQUFqRDtFQUQwQjtBQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7O0FBVzlCLGNBQUEsR0FBaUIsU0FBQyxTQUFELEVBQVksSUFBWixFQUFrQixPQUFsQixFQUEyQixvQkFBM0I7U0FDYixDQUFDLENBQUMsSUFBRixDQUNJO0lBQUEsR0FBQSxFQUFLLHFHQUFMO0lBQ0EsSUFBQSxFQUFNLE1BRE47SUFFQSxXQUFBLEVBQWEsa0JBRmI7SUFHQSxRQUFBLEVBQVUsTUFIVjtJQUlBLElBQUEsRUFBTSxPQUpOO0lBS0EsS0FBQSxFQUFPLElBTFA7SUFNQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQ7QUFDTCxZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQztRQUNkLG9CQUFBLENBQXFCLFNBQXJCLEVBQWdDLElBQWhDLEVBQXNDLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBdEMsRUFBcUQsb0JBQXJEO01BRks7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlQ7SUFVQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0FWUDtHQURKO0FBRGE7O0FBZ0JqQixvQkFBQSxHQUF1QixTQUFDLFNBQUQsRUFBWSxJQUFaLEVBQWtCLEdBQWxCLEVBQXVCLG9CQUF2QjtBQUNuQixNQUFBO0VBQUEsQ0FBQSxHQUFJLHdFQUFBLEdBQXlFLElBQXpFLEdBQThFO0FBQ2xGLE9BQUEscUNBQUE7O1FBQTREO01BQTVELENBQUEsSUFBSyxpQkFBQSxHQUFrQixDQUFsQixHQUFvQixJQUFwQixHQUF3QixDQUF4QixHQUEwQjs7QUFBL0I7RUFDQSxDQUFBLElBQUs7RUFDTCxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUY7RUFDVCxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsTUFBYixDQUFvQixNQUFwQjtFQUdBLElBQUcsSUFBQSxLQUFRLFNBQVg7SUFDSSxNQUFNLENBQUMsR0FBUCxDQUFXLElBQVg7SUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQWYsR0FBOEIsS0FGbEM7O1NBSUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQ7QUFDVixRQUFBO0lBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSjtJQUNMLE1BQU0sQ0FBQyxPQUFRLENBQUEsb0JBQUEsQ0FBZixHQUF1QyxFQUFFLENBQUMsR0FBSCxDQUFBO1dBQ3ZDLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsWUFBWSxDQUFDLFVBQWIsQ0FBQSxDQUF2QjtFQUhVLENBQWQ7QUFabUI7O0FBaUJ2QixzQkFBQSxHQUF5QixTQUFBO0FBQ3JCLE1BQUE7RUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLFVBQUY7RUFDTixHQUFBLEdBQU0sQ0FBQSxDQUFFLHFCQUFGO1NBQ04sR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFHLENBQUMsS0FBSixDQUFBLENBQVY7QUFIcUI7O0FBTXpCLCtCQUFBLEdBQWtDLFNBQUE7U0FDOUIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQTtXQUNiLHNCQUFBLENBQUE7RUFEYSxDQUFqQjtBQUQ4Qjs7QUFJbEMsa0JBQUEsR0FBcUIsU0FBQyxJQUFEO1NBQ2pCLFVBQUEsQ0FBVyxDQUFDLFNBQUE7V0FBRyxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsS0FBZCxDQUFBO0VBQUgsQ0FBRCxDQUFYLEVBQXVDLElBQXZDO0FBRGlCOztBQUtyQixNQUFNLENBQUMsWUFBUCxHQUFzQixTQUFDLENBQUQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSSxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3BCLElBQUcsQ0FBSSxDQUFQO1dBQ0ksT0FBTyxDQUFDLGdCQUFSLENBQUEsRUFESjs7QUFGa0I7O0FBT3RCLEtBQUEsR0FBUSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUEzQixDQUFpQyxHQUFqQyxDQUFxQyxDQUFDLE1BQXRDLENBQTZDLFNBQUMsR0FBRDtFQUFRLElBQUcsR0FBQSxLQUFTLEVBQVo7V0FBb0IsSUFBcEI7R0FBQSxNQUFBO1dBQTZCLE1BQTdCOztBQUFSLENBQTdDOztBQUNSLFNBQUEsR0FBWSxLQUFLLENBQUM7O0FBRWxCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUMsS0FBRDtBQUNkLE1BQUE7RUFBQSxJQUFHLEtBQUEsS0FBUyxDQUFaO0lBQ0ksZUFBQSxHQUFrQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0lBQ2xCLElBQUcsZUFBQSxLQUFtQixFQUF0QjtNQUNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QixFQUF6QixFQUE2QixvQkFBN0IsRUFBbUQsR0FBbkQ7TUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7TUFDQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUEsRUFISjtLQUFBLE1BQUE7TUFLSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQWxCLEdBQTZCLElBTGpDOztJQU1BLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0FBQ0EsV0FBTyxNQVZYOztFQVdBLElBQUksT0FBTyxDQUFDLEtBQVIsS0FBaUIsSUFBakIsSUFBeUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFkLEtBQTBCLE1BQXZEO1dBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFmLENBQWtCLEtBQWxCLEVBREo7R0FBQSxNQUFBO0lBR0ksS0FBSyxDQUFDLEdBQU4sQ0FBQTtXQUNBLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBbEIsR0FBNkIsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUp2Qzs7QUFaYzs7QUFrQmxCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxTQUFDLEtBQUQ7RUFDaEMsSUFBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWYsS0FBMEIsSUFBN0I7SUFDSSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQS9CO0lBQ0EsS0FBQSxHQUFRLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQTNCLENBQWlDLEdBQWpDLENBQXFDLENBQUMsTUFBdEMsR0FBNkM7SUFDckQsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUFtQixDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUEsRUFBbkI7O0lBQ0EsSUFBRyxLQUFBLEtBQVMsQ0FBWjthQUFtQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLEVBQW5CO0tBSko7R0FBQSxNQUFBO1dBTUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixDQUFBLEVBTko7O0FBRGdDLENBQXBDOztBQVVBLGNBQUEsR0FBaUIsU0FBQyxhQUFELEVBQWdCLE1BQWhCLEVBQXdCLFFBQXhCO1NBQ2IsTUFBTSxDQUFDLEtBQVAsQ0FDSTtJQUFBLE1BQUEsRUFBUSxJQUFSO0lBQ0EsTUFBQSxFQUFRLFNBQUE7TUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVYsR0FBdUI7TUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFWLEdBQWdCO2FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixHQUFrQjtJQUhkLENBRFI7R0FESjtBQURhOztBQVNqQixpQkFBQSxHQUFvQixTQUFDLE1BQUQ7RUFDaEIsQ0FBQSxDQUFFLHlCQUFGLENBQTRCLENBQUMsT0FBN0IsQ0FBQTtFQUVBLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxRQUFmLENBQXdCO0lBQUMsV0FBQSxFQUFhLEtBQWQ7SUFBb0IsSUFBQSxFQUFNLFVBQTFCO0lBQXNDLFdBQUEsRUFBYSxRQUFuRDtJQUE2RCxPQUFBLEVBQVMsSUFBdEU7SUFBNEUsU0FBQSxFQUFXLEdBQXZGO0dBQXhCO0VBQ0EsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEdBQWYsQ0FBbUIsT0FBbkI7RUFFQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsbUJBQXZCLEVBQTRDLFNBQUMsQ0FBRDtJQUN4QyxDQUFDLENBQUMsY0FBRixDQUFBO0lBQ0EsQ0FBQyxDQUFDLGVBQUYsQ0FBQTtJQUNBLElBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBeEIsS0FBd0MsTUFBM0M7QUFBMEQsYUFBMUQ7O0lBQ0EsSUFBSSxDQUFDLFVBQUw7YUFDSSxDQUFDLENBQUMsSUFBRixDQUFPLGtCQUFQLEVBQTJCO1FBQ3ZCLE1BQUEsRUFBUSxNQURlO1FBRXZCLFFBQUEsRUFBVSxTQUFDLFFBQUQ7VUFDTixJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLEdBQXRCO21CQUNJLFNBQUEsQ0FBVSxRQUFWLEVBREo7V0FBQSxNQUVLLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsR0FBdEI7WUFDRCxVQUFBLEdBQWE7bUJBQ2IsQ0FBQSxDQUFFLENBQUMsQ0FBQyxhQUFKLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsSUFBM0IsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxXQUF0QyxDQUFrRCxDQUFDLFFBQW5ELENBQTRELFFBQTVELEVBRkM7O1FBSEMsQ0FGYTtRQVF2QixLQUFBLEVBQU8sU0FBQyxLQUFEO1VBQ0gsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFuQjttQkFBNEIsU0FBQSxDQUFVLFFBQVYsRUFBNUI7O1FBREcsQ0FSZ0I7T0FBM0IsRUFESjtLQUFBLE1BQUE7YUFhSSxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixJQUEzQixDQUFnQyxDQUFDLElBQWpDLENBQXNDLFdBQXRDLENBQWtELENBQUMsUUFBbkQsQ0FBNEQsUUFBNUQsRUFiSjs7RUFKd0MsQ0FBNUM7RUFvQkEsQ0FBQSxDQUFFLEdBQUYsQ0FBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFNBQUMsQ0FBRCxFQUFJLE1BQUo7QUFDZCxRQUFBO0lBQUEsVUFBQSxHQUFhLENBQUEsQ0FBRSxDQUFDLENBQUMsYUFBSixDQUFrQixDQUFDLE9BQW5CLENBQTJCLE9BQTNCLENBQW9DLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDO0lBQzVELEVBQUEsR0FBSyxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixJQUEzQixDQUFpQyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQztJQUNqRCxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixJQUEzQixDQUFpQyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWhELENBQXlELENBQUEsQ0FBQTtJQUNqRSxVQUFBLEdBQWE7TUFDVCxXQUFBLEVBQWE7UUFDVCxVQUFBLEVBQVksVUFESDtRQUVULFFBQUEsRUFBVSxFQUZEO1FBR1QsT0FBQSxFQUFTLEVBSEE7T0FESjs7SUFPYixVQUFVLENBQUMsV0FBVyxDQUFDLE9BQVEsQ0FBQSxLQUFBLENBQS9CLEdBQXdDLE1BQU0sQ0FBQztJQUMvQyxVQUFVLENBQUMsV0FBWCxHQUF5QixJQUFJLENBQUMsU0FBTCxDQUFlLFVBQVUsQ0FBQyxXQUExQjtJQUN6QixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7V0FDQSxDQUFDLENBQUMsSUFBRixDQUFPLHFCQUFQLEVBQThCO01BQzFCLE1BQUEsRUFBUSxNQURrQjtNQUUxQixJQUFBLEVBQU0sVUFGb0I7TUFHMUIsUUFBQSxFQUFVLFdBSGdCO01BSTFCLE9BQUEsRUFBUyxTQUFDLFFBQUQ7QUFDTCxZQUFBO2VBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsUUFBUSxDQUFDLFlBQXBCO01BREYsQ0FKaUI7TUFNMUIsS0FBQSxFQUFPLFNBQUMsS0FBRDtRQUNILElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7aUJBQTRCLFNBQUEsQ0FBVSxRQUFWLEVBQTVCOztNQURHLENBTm1CO0tBQTlCO0VBZGMsQ0FBbEI7RUF3QkEsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLEVBQStCLFNBQUMsQ0FBRDtBQUMzQixRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixXQUFwQjtJQUNWLFNBQUEsR0FBWSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUM7SUFFdkIsYUFBQSxHQUFnQjtJQUNoQixJQUFHLFNBQUEsS0FBYSxPQUFoQjtNQUNJLGFBQUEsR0FBZ0I7TUFDaEIsQ0FBQSxDQUFFLFdBQUYsQ0FBYyxDQUFDLEtBQWYsQ0FBcUIsUUFBckIsRUFGSjtLQUFBLE1BR0ssSUFBRyxTQUFBLEtBQWEsZUFBaEI7TUFDRCxhQUFBLEdBQWdCO01BQ2hCLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLEtBQXZCLENBQTZCLFFBQTdCLEVBRkM7S0FBQSxNQUdBLElBQUcsU0FBQSxLQUFhLGNBQWhCO01BQ0QsYUFBQSxHQUFnQjtNQUNoQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxLQUF0QixDQUE0QixRQUE1QixFQUZDO0tBQUEsTUFHQSxJQUFHLFNBQUEsS0FBYSxZQUFoQjtNQUNELGFBQUEsR0FBZ0I7TUFDaEIsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsS0FBcEIsQ0FBMEIsUUFBMUIsRUFGQzs7SUFJTCxJQUFHLE9BQU8sQ0FBQyxRQUFSLENBQWlCLFFBQWpCLENBQUg7QUFBbUMsYUFBTyxNQUExQzs7SUFDQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBUyxDQUFDLEdBQXJCLENBQXlCLFFBQXpCO0lBRUEsVUFBQSxHQUFhO01BQUMsZUFBQSxFQUFnQjtRQUFDLFlBQUEsRUFBYSxhQUFkO1FBQTRCLGFBQUEsRUFBYztVQUFDLGlCQUFBLEVBQWtCLE1BQU0sQ0FBQyxFQUExQjtTQUExQztPQUFqQjs7V0FDYixDQUFDLENBQUMsSUFBRixDQUNJO01BQUEsTUFBQSxFQUFRLE1BQVI7TUFDQSxHQUFBLEVBQUssd0JBREw7TUFFQSxJQUFBLEVBQU0sVUFGTjtNQUdBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDTCxZQUFBO1FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaO1FBRUEsTUFBQSxHQUFTO1FBQ1QsSUFBSSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFPLENBQUMsT0FBeEIsQ0FBZ0MsU0FBQyxJQUFELEVBQU8sS0FBUDtBQUM5QixjQUFBO1VBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtpQkFDTixHQUFHLENBQUMsT0FBSixDQUFZLFNBQUMsRUFBRDttQkFDUixNQUFPLENBQUEsRUFBQSxDQUFQLEdBQWEsSUFBSyxDQUFBLEVBQUE7VUFEVixDQUFaO1FBRjhCLENBQWhDO1FBS0EsZ0JBQUEsR0FBbUIsU0FBQTtBQUNmLGNBQUE7VUFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixNQUFwQixFQUE0QixJQUFJLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQTVDO0FBQ0E7ZUFBQSxhQUFBO1lBQ0ksTUFBQSxHQUFTLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO1lBQ1QsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsT0FBcEIsRUFBNkIsR0FBN0I7WUFDQSxNQUFNLENBQUMsV0FBUCxHQUFxQixNQUFPLENBQUEsR0FBQTt5QkFDNUIsTUFBTSxDQUFDLFNBQVAsSUFBb0IsTUFBTSxDQUFDO0FBSi9COztRQUZlO1FBUW5CLE1BQUEsR0FBUztRQUVULElBQUcsYUFBQSxLQUFpQixhQUFwQjtVQUNJLE1BQUEsR0FBUyxDQUFBLENBQUUseUJBQUYsQ0FBNkIsQ0FBQSxDQUFBO2lCQUN0QyxnQkFBQSxDQUFBLEVBRko7U0FBQSxNQUdLLElBQUcsYUFBQSxLQUFpQixjQUFwQjtBQUFBO1NBQUEsTUFFQSxJQUFHLGFBQUEsS0FBaUIscUJBQXBCO1VBQ0QsTUFBQSxHQUFTLENBQUEsQ0FBRSxrQkFBRixDQUFzQixDQUFBLENBQUE7aUJBQy9CLGdCQUFBLENBQUEsRUFGQztTQUFBLE1BR0EsSUFBRyxhQUFBLEtBQWlCLGlCQUFwQjtVQUNELE1BQUEsR0FBUyxDQUFBLENBQUUsdUJBQUYsQ0FBMkIsQ0FBQSxDQUFBO2lCQUNwQyxnQkFBQSxDQUFBLEVBRkM7O01BM0JBLENBSFQ7TUFvQ0EsS0FBQSxFQUFPLFNBQUMsS0FBRDtRQUNILElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7aUJBQTZCLFNBQUEsQ0FBVSxRQUFWLEVBQTdCOztNQURHLENBcENQO0tBREo7RUF0QjJCLENBQS9CO1NBZ0VBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsQ0FBRDtBQUNiLFFBQUE7SUFBQSxTQUFBLEdBQVk7SUFDWixLQUFBLEdBQVEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLFFBQXBCO0lBQ1IsU0FBQSxHQUFZLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQztJQUNyQixVQUFBLEdBQWEsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQztJQUM5QixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7SUFFQSxLQUFLLENBQUMsSUFBTixDQUFXLG9CQUFYLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsU0FBQyxLQUFELEVBQVEsT0FBUjtBQUNsQyxVQUFBO01BQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLE9BQXBCLENBQTZCLENBQUEsQ0FBQTthQUN6QyxTQUFVLENBQUEsU0FBQSxDQUFWLEdBQXVCLE9BQU8sQ0FBQztJQUZHLENBQXRDO0lBSUEsWUFBQSxHQUFlO0lBQ2YsWUFBYSxDQUFBLGlCQUFBLENBQWIsR0FBa0MsTUFBTSxDQUFDO0lBRXpDLElBQUcsU0FBQSxLQUFhLFVBQWhCO0FBQUE7S0FBQSxNQUVLLElBQUcsU0FBQSxLQUFhLGtCQUFoQjtBQUFBO0tBQUEsTUFFQSxJQUFHLFNBQUEsS0FBYSxpQkFBaEI7TUFDRCxNQUFBLEdBQVMsS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLENBQXFCLENBQUEsQ0FBQTtNQUM5QixVQUFBLEdBQWEsTUFBTSxDQUFDO01BQ3BCLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLE9BQVEsQ0FBQSxNQUFNLENBQUMsYUFBUCxDQUFxQixDQUFDO01BQ3JELFlBQWEsQ0FBQSxVQUFBLENBQWIsR0FBMkIsY0FKMUI7S0FBQSxNQUtBLElBQUcsU0FBQSxLQUFhLGVBQWhCO01BQ0QsTUFBQSxHQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUFxQixDQUFBLENBQUE7TUFDOUIsVUFBQSxHQUFhLE1BQU0sQ0FBQztNQUNwQixhQUFBLEdBQWdCLE1BQU0sQ0FBQyxPQUFRLENBQUEsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsQ0FBQztNQUNyRCxZQUFhLENBQUEsVUFBQSxDQUFiLEdBQTJCLGNBSjFCOztJQU9MLFVBQUEsR0FBYTtNQUNULGFBQUEsRUFBZTtRQUNYLFVBQUEsRUFBWSxVQUREO1FBRVgsTUFBQSxFQUFRO1VBQUUsTUFBQSxFQUFRLFNBQVY7VUFBcUIsWUFBQSxFQUFjLFlBQW5DO1NBRkc7T0FETjs7SUFRYixFQUFBLEdBQUssUUFBUSxDQUFDLGFBQVQsQ0FBdUIsSUFBdkI7QUFDTDtBQUFBLFNBQUEsVUFBQTs7TUFDSSxFQUFFLENBQUMsU0FBSCxJQUFnQix5RkFBQSxHQUN1QyxLQUR2QyxHQUM2QztBQUZqRTtJQUlBLElBQUcsU0FBQSxLQUFhLFVBQWhCO01BQ0ksQ0FBQSxDQUFFLHNCQUFGLENBQXlCLENBQUMsTUFBMUIsQ0FBaUMsRUFBakMsRUFESjtLQUFBLE1BRUssSUFBRyxTQUFBLEtBQWEsa0JBQWhCO01BQ0QsQ0FBQSxDQUFFLDhCQUFGLENBQWlDLENBQUMsTUFBbEMsQ0FBeUMsRUFBekMsRUFEQztLQUFBLE1BRUEsSUFBRyxTQUFBLEtBQWEsaUJBQWhCO01BQ0QsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsTUFBakMsQ0FBd0MsRUFBeEMsRUFEQztLQUFBLE1BRUEsSUFBRyxTQUFBLEtBQWEsZUFBaEI7TUFDRCxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxNQUEvQixDQUFzQyxFQUF0QyxFQURDOztJQUdMLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWjtXQUNBLENBQUMsQ0FBQyxJQUFGLENBQU87TUFDSCxHQUFBLEVBQUssMkJBREY7TUFFSCxNQUFBLEVBQVEsTUFGTDtNQUdILE9BQUEsRUFBUztRQUNMLGNBQUEsRUFBZ0IsbUNBRFg7T0FITjtNQU1ILElBQUEsRUFBTSxVQU5IO01BT0gsT0FBQSxFQUFTLFNBQUMsSUFBRDtlQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtNQURLLENBUE47S0FBUDtFQXJEYTtBQWxIRDs7QUFtTHBCLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLEVBQXBCLENBQXVCLE9BQXZCLEVBQWdDLGVBQWhDLEVBQWlELFNBQUMsQ0FBRDtBQUM3QyxNQUFBO0VBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtFQUNBLEdBQUEsR0FBTSxDQUFDLENBQUMsYUFBYSxDQUFDO0VBQ3RCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7RUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQUE7RUFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBO1NBQ0EsTUFBTSxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEVBQWhCLEVBQW9CLFNBQUMsSUFBRDtJQUNoQixJQUFHLElBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUNJO1FBQUEsR0FBQSxFQUFLLHlDQUFBLEdBQTRDLEdBQWpEO1FBQ0EsUUFBQSxFQUFVLE1BRFY7UUFFQSxLQUFBLEVBQU8sSUFGUDtRQUdBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFFTCxjQUFBO1VBQUEsTUFBQSxHQUFTLElBQUssQ0FBQSxDQUFBO1VBRWQsSUFBRyxDQUFDLENBQUMsYUFBRixDQUFnQixNQUFoQixDQUFIO1lBQ0ksQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtZQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLGdDQUFuQjtZQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxHQUFkLENBQWtCO2NBQUMsV0FBQSxFQUFZLFFBQWI7YUFBbEI7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO1lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtBQUNBLG1CQUFPLE1BTlg7O1VBUUEsTUFBQSxHQUFTO1lBQUMsSUFBQSxFQUFNLFNBQVA7WUFBa0IsS0FBQSxFQUFPLFNBQXpCO1lBQW9DLEdBQUEsRUFBSyxTQUF6Qzs7VUFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWIsQ0FBcUIsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNqQixnQkFBQTtZQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQXRCO21CQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBakIsR0FBbUMsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsT0FBcEIsRUFBNkIsTUFBN0I7VUFGbEIsQ0FBckI7VUFJQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLHVCQUFGLENBQTBCLENBQUMsSUFBM0IsQ0FBQTtVQUNOLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEdBQW5CO1VBQ25CLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7VUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO1VBQ0EsSUFBQSxHQUFPLGdCQUFBLENBQWlCLE1BQWpCO1VBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFmLENBQXlCO1lBQUMsUUFBQSxFQUFVLElBQVg7V0FBekIsRUFBMkMseUJBQTNDLEVBQXNFLEdBQXRFO1VBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkI7VUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxHQUFwQixDQUF3QjtZQUFBLFNBQUEsRUFBVyxPQUFYO1dBQXhCO1VBRUEsaUJBQUEsQ0FBa0IsTUFBbEI7VUFFQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsU0FBQyxDQUFEO0FBQ25CLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQyxhQUFhLENBQUM7WUFFckIsSUFBQSxHQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQy9CLElBQUcsSUFBQSxLQUFRLE1BQVg7Y0FBMEIsSUFBQSxHQUFPLE1BQU0sQ0FBQyxVQUF4Qzs7WUFDQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUEsR0FBTyxJQUFQLEdBQWMsTUFBTSxDQUFDLFlBQXJCLEdBQW9DLEdBQTVEO1lBQ0EsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxLQUFuQixDQUF5QixNQUF6QjttQkFDQSxjQUFBLENBQWUsRUFBZixFQUFtQixtQkFBQSxHQUFzQixHQUF0QixHQUE0QixFQUEvQyxFQUFtRCxJQUFuRDtVQVBtQixDQUF2QjtVQVFBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQXlCLFlBQUEsR0FBZSxNQUFNLENBQUMsWUFBL0M7aUJBQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUFBO1FBckNLLENBSFQ7UUEwQ0EsS0FBQSxFQUFPLFNBQUMsQ0FBRDtpQkFDSCxPQUFPLENBQUMsR0FBUixDQUFZLENBQVo7UUFERyxDQTFDUDtPQURKLEVBREo7O0VBRGdCLENBQXBCO0FBVjZDLENBQWpEOztBQTREQSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtFQUNJLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBQTtFQUNBLFlBQUEsR0FBbUIsSUFBQSxXQUFBLENBQVksWUFBWixFQUEwQixnQ0FBMUIsRUFBNEQsQ0FBNUQ7RUFDbkIsWUFBWSxDQUFDLFdBQWIsR0FBMkIsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVo7QUFDdkIsUUFBQTtJQUFBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtJQUNBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0lBQ0EsR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsV0FBWCxHQUF5QixHQUF6QixHQUErQixJQUFJLENBQUM7V0FDMUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEVBQWhCLEVBQW9CLFNBQUMsSUFBRDtNQUNoQixJQUFHLElBQUg7ZUFDSSxDQUFDLENBQUMsSUFBRixDQUNJO1VBQUEsR0FBQSxFQUFLLG1DQUFBLEdBQXNDLEdBQTNDO1VBQ0EsUUFBQSxFQUFVLE1BRFY7VUFFQSxLQUFBLEVBQU8sSUFGUDtVQUdBLE9BQUEsRUFBUyxTQUFDLHNCQUFEO0FBQ0wsZ0JBQUE7WUFBQSxJQUFBLEdBQU87WUFDUCxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO1lBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtZQUNBLHFCQUFBLEdBQXdCLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQW5CLEVBQXNCLElBQXRCO1lBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtjQUFDLFFBQUEsRUFBVSxxQkFBWDthQUF6QixFQUE0RCxvQkFBNUQsRUFBa0YsR0FBbEY7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixxQkFBbkI7WUFDQSxZQUFBLENBQUE7bUJBQ0EsT0FBTyxDQUFDLGNBQVIsQ0FBQTtVQVJLLENBSFQ7VUFZQSxLQUFBLEVBQU8sU0FBQyxDQUFEO21CQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtVQURHLENBWlA7U0FESixFQURKOztJQURnQixDQUFwQjtFQVJ1QjtFQXlCM0IsSUFBRyxDQUFDLEtBQUo7SUFDSSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixDQUFBLENBQUUsNEJBQUYsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFBLENBQTNCO0lBRUEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSwrQkFBTixFQUF1QyxTQUFDLElBQUQ7YUFBVSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQXNCLElBQXRCO0lBQVYsQ0FBdkM7SUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSO0lBQ1QsWUFBQSxDQUFhLE9BQU8sQ0FBQyxhQUFyQjtJQUNBLEtBQUEsR0FBUTtJQUNSLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUEsRUFQSjs7RUFRQSxzQkFBQSxDQUFBO0VBQ0EsK0JBQUEsQ0FBQTtFQUVBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLEtBQXRCLENBQTRCLFNBQUMsQ0FBRDtJQUN4QixDQUFDLENBQUMsY0FBRixDQUFBO1dBQ0EsT0FBTyxDQUFDLGdCQUFSLENBQUE7RUFGd0IsQ0FBNUI7RUFJQSxTQUFTLENBQUMsb0JBQVYsQ0FBK0IsTUFBL0IsRUFBdUMsZ0tBQXZDO0VBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUIsa0JBQXpCLEVBQTZDLFNBQUMsQ0FBRDtBQUN6QyxRQUFBO0lBQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUNsQyxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsSUFBdEIsQ0FBQTtJQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNJO01BQUEsR0FBQSxFQUFLLG1DQUFBLEdBQXNDLEdBQTNDO01BQ0EsUUFBQSxFQUFVLE1BRFY7TUFFQSxLQUFBLEVBQU8sSUFGUDtNQUdBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDTCxZQUFBO1FBQUEscUJBQUEsR0FBd0IsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEI7UUFDeEIsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIscUJBQW5CO1FBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtRQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7UUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7ZUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQWYsQ0FBeUI7VUFBQyxRQUFBLEVBQVUscUJBQVg7U0FBekIsRUFBNEQsb0JBQTVELEVBQWtGLEdBQWxGO01BTkssQ0FIVDtLQURKO0VBTHlDLENBQTdDLEVBNUNKOzs7QUE4REEsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7RUFDSSxRQUFRLENBQUMsS0FBVCxHQUFpQjtFQUNqQixDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO0VBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7RUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0VBQ0EsU0FBUyxDQUFDLG9CQUFWLENBQStCLE1BQS9CLEVBQXVDLGdLQUF2QztFQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssbUNBQUEsR0FBc0MsTUFBTSxDQUFDLElBQWxEO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxLQUFBLEVBQU8sSUFGUDtJQUdBLE9BQUEsRUFBUyxTQUFDLHNCQUFEO0FBQ0wsVUFBQTtNQUFBLElBQUEsR0FBTztNQUNQLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7TUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO01BQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEIsQ0FBbkI7TUFDQSxZQUFBLENBQUE7YUFDQSxPQUFPLENBQUMsY0FBUixDQUFBO0lBTkssQ0FIVDtJQVVBLEtBQUEsRUFBTyxTQUFDLENBQUQ7YUFDSCxPQUFPLENBQUMsR0FBUixDQUFZLENBQVo7SUFERyxDQVZQO0dBREo7RUFjQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxLQUF0QixDQUE0QixTQUFDLENBQUQ7SUFDeEIsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtXQUNBLE9BQU8sQ0FBQyxnQkFBUixDQUFBO0VBRndCLENBQTVCLEVBdEJKOzs7QUEyQkEsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7RUFDSSxRQUFRLENBQUMsS0FBVCxHQUFpQjtFQUNqQixDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO0VBQ0EsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsSUFBdEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7RUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBQTtFQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUsseUNBQUEsR0FBNEMsTUFBTSxDQUFDLElBQXhEO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBRUwsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFLLENBQUEsQ0FBQTtNQUVkLElBQUcsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsTUFBaEIsQ0FBSDtRQUNJLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7UUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixnQ0FBbkI7UUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsR0FBZCxDQUFrQjtVQUFDLFdBQUEsRUFBWSxRQUFiO1NBQWxCO1FBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtRQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7QUFDQSxlQUFPLE1BTlg7O01BUUEsTUFBQSxHQUFTO1FBQUMsSUFBQSxFQUFNLFNBQVA7UUFBa0IsS0FBQSxFQUFPLFNBQXpCO1FBQW9DLEdBQUEsRUFBSyxTQUF6Qzs7TUFDVCxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLE1BQW5CO1FBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFiLENBQXFCLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDakIsY0FBQTtVQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQXRCO2lCQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBakIsR0FBbUMsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsT0FBcEIsRUFBNkIsTUFBN0I7UUFGbEIsQ0FBckIsRUFESjs7TUFLQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLHVCQUFGLENBQTBCLENBQUMsSUFBM0IsQ0FBQTtNQUNOLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEdBQW5CO01BQ25CLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7TUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO01BQ0EsSUFBQSxHQUFPLGdCQUFBLENBQWlCLE1BQWpCO01BRVAsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkI7TUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxHQUFwQixDQUF3QjtRQUFBLFNBQUEsRUFBVyxPQUFYO09BQXhCO01BRUEsaUJBQUEsQ0FBa0IsTUFBbEI7TUFFQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsU0FBQyxDQUFEO0FBQ25CLFlBQUE7UUFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUVyQixJQUFBLEdBQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBRyxJQUFBLEtBQVEsTUFBWDtVQUEwQixJQUFBLEdBQU8sTUFBTSxDQUFDLFVBQXhDOztRQUNBLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBQSxHQUFPLElBQVAsR0FBYyxNQUFNLENBQUMsWUFBckIsR0FBb0MsR0FBNUQ7UUFDQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLEtBQW5CLENBQXlCLE1BQXpCO2VBQ0EsY0FBQSxDQUFlLEVBQWYsRUFBbUIsbUJBQUEsR0FBc0IsR0FBdEIsR0FBNEIsRUFBL0MsRUFBbUQsSUFBbkQ7TUFQbUIsQ0FBdkI7TUFTQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixZQUFBLEdBQWUsTUFBTSxDQUFDLFlBQS9DO2FBQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUFBO0lBdkNLLENBRlQ7SUEyQ0EsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBM0NQO0dBREosRUFUSjs7Ozs7O0FDcG9CQSxJQUFBOztBQUFBLFdBQUEsR0FBYyxTQUFDLElBQUQsRUFBTyxTQUFQOztJQUFPLFlBQVU7O1NBQzdCLFNBQUMsQ0FBRCxFQUFJLEVBQUo7QUFDRSxRQUFBO0lBQUEsV0FBQSxHQUFhLFNBQUMsQ0FBRCxFQUFJLElBQUo7QUFDWCxVQUFBO0FBQUEsV0FBQSxzQ0FBQTs7UUFBQyxJQUFHLENBQUksQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFQLENBQVA7QUFBc0IsaUJBQU8sTUFBN0I7O0FBQUQ7QUFDQSxhQUFPO0lBRkk7SUFJYixNQUFlLGNBQUEsQ0FBZSxDQUFmLENBQWYsRUFBQyxjQUFELEVBQU87SUFDUCxPQUFBLEdBQVU7QUFJVixTQUFBLHNDQUFBOztNQUNFLElBQUcsT0FBTyxDQUFDLE1BQVIsSUFBa0IsU0FBckI7QUFBb0MsY0FBcEM7O01BQ0EsSUFBRyxPQUFPLENBQUMsWUFBUixJQUF5QixDQUFDLENBQUMsS0FBRixLQUFhLE9BQU8sQ0FBQyxZQUFqRDtBQUFtRSxpQkFBbkU7O01BQ0EsSUFBRyxPQUFPLENBQUMsZUFBUixJQUE0QixDQUFDLENBQUMsUUFBRixLQUFnQixPQUFPLENBQUMsZUFBdkQ7QUFBNEUsaUJBQTVFOztNQUVBLElBQUcsV0FBQSxDQUFZLENBQUMsQ0FBQyxRQUFkLEVBQXdCLElBQXhCLENBQUg7UUFDRSxPQUFPLENBQUMsSUFBUixDQUFhLENBQUMsQ0FBQyxNQUFGLENBQVMsRUFBVCxFQUFhLENBQWIsQ0FBYixFQURGOztBQUxGO0lBU0EsV0FBQSxDQUFZLE9BQVosRUFBcUIsS0FBckIsRUFBNEIsSUFBNUI7SUFDQSxFQUFBLENBQUcsT0FBSDtFQXBCRjtBQURZOztBQTBCZCxXQUFBLEdBQWMsU0FBQyxNQUFELEVBQVEsS0FBUixFQUFjLElBQWQ7QUFDWixNQUFBO0FBQUEsT0FBQSx3Q0FBQTs7SUFDRSxDQUFDLENBQUMsUUFBRixHQUFXLFNBQUEsQ0FBVSxDQUFDLENBQUMsUUFBWixFQUFzQixLQUF0QixFQUE2QixJQUE3QjtBQURiO0FBS0EsU0FBTztBQU5LOztBQVdkLFNBQUEsR0FBWSxTQUFDLENBQUQsRUFBSSxLQUFKLEVBQVcsSUFBWDtFQUNWLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBQyxDQUFELEVBQUcsQ0FBSDtXQUNYLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLENBQVYsRUFBYSxLQUFBLEdBQU0sS0FBTSxDQUFBLENBQUEsQ0FBWixHQUFlLE1BQTVCO0VBRE8sQ0FBYjtBQUVBLFNBQU87QUFIRzs7QUFNWixLQUFBLEdBQVEsU0FBQyxDQUFEO1NBQ04sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxXQUFWLEVBQXNCLEVBQXRCO0FBRE07O0FBS1IsU0FBQSxHQUFZLFNBQUMsQ0FBRDtBQUNWLE1BQUE7RUFBQSxFQUFBLEdBQUcsQ0FBQyxDQUFDLElBQUYsQ0FBTyxFQUFBLEdBQUcsQ0FBVjtTQUNILEVBQUEsR0FBRyxFQUFFLENBQUMsT0FBSCxDQUFXLEtBQVgsRUFBaUIsR0FBakI7QUFGTzs7QUFLWixTQUFBLEdBQVksU0FBQyxHQUFEO1NBQ1YsU0FBQSxDQUFVLEdBQVYsQ0FBYyxDQUFDLEtBQWYsQ0FBcUIsR0FBckI7QUFEVTs7QUFJWixjQUFBLEdBQWlCLFNBQUMsR0FBRDtBQUNmLE1BQUE7RUFBQSxLQUFBLEdBQVEsU0FBQSxDQUFVLEdBQVY7RUFDUixJQUFBLEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7V0FBVSxJQUFBLE1BQUEsQ0FBTyxFQUFBLEdBQUcsQ0FBVixFQUFjLEdBQWQ7RUFBVixDQUFWO1NBQ1AsQ0FBQyxLQUFELEVBQU8sSUFBUDtBQUhlOztBQU1qQixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7O0FDdkVqQjs7Ozs7Ozs7QUFBQSxJQUFBOztBQVlBLFVBQUEsR0FBYTs7QUFDYixjQUFBLEdBQWlCOztBQUdqQixrQkFBQSxHQUFxQixTQUFDLENBQUQsRUFBRyxJQUFILEVBQVEsSUFBUjtBQUNuQixNQUFBO0VBQUEsQ0FBQSxHQUFFLElBQUssQ0FBQSxDQUFBO0VBQ1AsSUFBRyxDQUFJLElBQUssQ0FBQSxDQUFBLENBQVo7QUFDRSxXQUFPLEdBRFQ7O0VBR0EsSUFBRyxDQUFBLEtBQUssVUFBUjtBQUNFLFdBQU8sMkJBQUEsR0FBNEIsQ0FBNUIsR0FBOEIsSUFBOUIsR0FBa0MsQ0FBbEMsR0FBb0MsT0FEN0M7R0FBQSxNQUFBO0lBR0UsSUFBRyxFQUFBLEtBQU0sSUFBVDtNQUNFLElBQUcsSUFBSyxDQUFBLENBQUEsR0FBRSxPQUFGLENBQUwsSUFBb0IsSUFBSSxDQUFDLFNBQXpCLElBQXVDLElBQUksQ0FBQyxTQUFVLENBQUEsQ0FBQSxHQUFFLFdBQUYsQ0FBekQ7UUFDRSxDQUFBLEdBQUksT0FBQSxDQUFRLENBQVIsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEI7QUFDSixlQUFVLENBQUQsR0FBRyx1QkFBSCxHQUEwQixJQUFLLENBQUEsQ0FBQSxHQUFFLE9BQUYsQ0FBL0IsR0FBMEMsTUFBMUMsR0FBZ0QsSUFBSSxDQUFDLFNBQVUsQ0FBQSxDQUFBLEdBQUUsV0FBRixDQUEvRCxHQUE4RSxXQUZ6Rjs7TUFHQSxJQUFHLENBQUEsS0FBSywrQkFBUjtBQUNFLGVBQU8sT0FBQSxDQUFRLENBQVIsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBbEIsRUFEVDs7QUFFQSxhQUFPLE9BQUEsQ0FBUSxDQUFSLENBQVUsQ0FBQyxNQUFYLENBQWtCLElBQWxCLEVBTlQ7S0FBQSxNQUFBO01BUUUsSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLEVBQVgsSUFDSCxDQUFBLEtBQUsseUJBREw7UUFFSyxDQUFBLEdBQUksQ0FBQyxDQUFDLFNBQUYsQ0FBWSxDQUFaLEVBQWUsRUFBZixDQUFBLEdBQXFCLENBQUEsb0RBQUEsR0FBcUQsQ0FBckQsR0FBdUQsa0JBQXZELEVBRjlCOztNQUdBLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxFQUFYLElBQ0gsQ0FBQSxLQUFLLGlDQURMO2VBRUssQ0FBQSxHQUFJLENBQUMsQ0FBQyxTQUFGLENBQVksQ0FBWixFQUFlLEVBQWYsQ0FBQSxHQUFxQixDQUFBLG9EQUFBLEdBQXFELENBQXJELEdBQXVELGtCQUF2RCxFQUY5QjtPQUFBLE1BQUE7UUFJRSxJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBZDtVQUNLLENBQUEsR0FBSSxDQUFDLENBQUMsU0FBRixDQUFZLENBQVosRUFBZSxFQUFmLEVBRFQ7U0FBQSxNQUFBO0FBQUE7O0FBR0EsZUFBTyxFQVBUO09BWEY7S0FIRjs7QUFMbUI7O0FBNkJyQixzQkFBQSxHQUF5QixTQUFDLEtBQUQ7QUFFckIsU0FBTyxjQUFlLENBQUEsS0FBQTtBQUZEOztBQUl6QixpQkFBQSxHQUFvQixTQUFDLEtBQUQ7QUFDbEIsTUFBQTtFQUFBLElBQUcseUJBQUg7QUFDRSxXQUFPLFVBQVcsQ0FBQSxLQUFBLEVBRHBCOztFQUdBLENBQUEsR0FBSSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsRUFBbUIsR0FBbkI7RUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE1BQUYsQ0FBUyxDQUFULENBQVcsQ0FBQyxXQUFaLENBQUEsQ0FBQSxHQUE0QixDQUFDLENBQUMsU0FBRixDQUFZLENBQVo7QUFDaEMsU0FBTztBQU5XOztBQVNwQixZQUFBLEdBQWUsU0FBQyxLQUFELEVBQU8sSUFBUDtBQUNiLE1BQUE7RUFBQSxJQUFHLEdBQUEsS0FBTyxNQUFBLENBQU8sS0FBUCxFQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBVjtXQUNFLGtDQUFBLEdBRTBCLENBQUMsaUJBQUEsQ0FBa0IsS0FBbEIsQ0FBRCxDQUYxQixHQUVtRCx5REFIckQ7R0FBQSxNQUFBO0lBUUUsSUFBQSxDQUFpQixDQUFBLE1BQUEsR0FBUyxJQUFLLENBQUEsS0FBQSxDQUFkLENBQWpCO0FBQUEsYUFBTyxHQUFQOztXQUNBLG1DQUFBLEdBRTJCLENBQUMsaUJBQUEsQ0FBa0IsS0FBbEIsQ0FBRCxDQUYzQixHQUVvRCx3Q0FGcEQsR0FHeUIsQ0FBQyxrQkFBQSxDQUFtQixLQUFuQixFQUF5QixJQUF6QixDQUFELENBSHpCLEdBR3lELGtCQVozRDs7QUFEYTs7QUFpQmYsaUJBQUEsR0FBb0IsU0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLFFBQWQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSTtFQUNKLEtBQUEsR0FBUSxpQkFBQSxDQUFrQixLQUFsQjtFQUNSLElBQUcsSUFBQSxLQUFRLFNBQVg7SUFDRSxJQUFHLFFBQUEsS0FBWSxDQUFmO01BQ0UsQ0FBQSxJQUFLLFFBRFA7O0lBRUEsQ0FBQSxJQUFLLDJCQUFBLEdBQTRCLEtBQTVCLEdBQWtDLDRDQUh6Qzs7QUFJQSxTQUFPO0FBUFc7O0FBU3BCLGFBQUEsR0FBZ0IsU0FBQyxNQUFELEVBQVEsSUFBUixFQUFhLFFBQWI7QUFDZCxNQUFBO0VBQUEsQ0FBQSxHQUFJO0FBQ0osT0FBQSxnREFBQTs7SUFDRSxJQUFJLE9BQU8sS0FBUCxLQUFnQixRQUFwQjtNQUNFLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxTQUFqQjtRQUNFLENBQUEsSUFBSyxpQkFBQSxDQUFrQixLQUFLLENBQUMsSUFBeEIsRUFBOEIsS0FBSyxDQUFDLElBQXBDLEVBQTBDLENBQTFDO1FBQ0wsTUFBQSxHQUFTLEdBRlg7T0FBQSxNQUFBO1FBSUUsTUFBQSxHQUFTLGtCQUFBLENBQW1CLEtBQUssQ0FBQyxJQUF6QixFQUErQixLQUFLLENBQUMsSUFBckMsRUFBMkMsSUFBM0M7UUFDVCxJQUFJLEVBQUEsS0FBTSxNQUFOLElBQWlCLE1BQUEsS0FBVSxHQUEvQjtVQUNFLEtBQUEsR0FBUSxpQkFBQSxDQUFrQixLQUFLLENBQUMsSUFBeEI7VUFDUixTQUFBLEdBQVksc0JBQUEsQ0FBdUIsS0FBSyxDQUFDLElBQTdCLEVBRmQ7U0FBQSxNQUFBO1VBSUUsTUFBQSxHQUFTLEdBSlg7U0FMRjtPQURGO0tBQUEsTUFBQTtNQWFFLE1BQUEsR0FBUyxrQkFBQSxDQUFtQixLQUFuQixFQUEwQixFQUExQixFQUE4QixJQUE5QjtNQUNULElBQUksRUFBQSxLQUFNLE1BQVY7UUFDRSxLQUFBLEdBQVEsaUJBQUEsQ0FBa0IsS0FBbEI7UUFDUixTQUFBLEdBQVksc0JBQUEsQ0FBdUIsS0FBdkIsRUFGZDtPQWRGOztJQWlCQSxJQUFJLEVBQUEsS0FBTSxNQUFWO01BQ0UsQ0FBQSxJQUFLLFFBQUEsQ0FBUztRQUFBLElBQUEsRUFBTSxLQUFOO1FBQWEsS0FBQSxFQUFPLE1BQXBCO1FBQTRCLElBQUEsRUFBTSxTQUFsQztPQUFULEVBRFA7O0FBbEJGO0FBb0JBLFNBQU87QUF0Qk87O0FBd0JoQix1QkFBQSxHQUEwQixTQUFDLElBQUQsRUFBTSxRQUFOO0FBQ3hCLE1BQUE7RUFBQSxDQUFBLEdBQUk7RUFDSixJQUFBLEdBQU87RUFDUCxRQUFBLEdBQVc7RUFDWCxZQUFBLEdBQWU7QUFDZixPQUFBLHNDQUFBOztJQUNFLElBQUcsUUFBQSxLQUFZLEtBQUssQ0FBQyxhQUFyQjtNQUNFLFFBQUEsR0FBVyxLQUFLLENBQUM7TUFDakIsSUFBRyxRQUFBLEtBQVksVUFBZjtRQUNFLENBQUEsSUFBSyxRQUFBLENBQVM7VUFBQSxJQUFBLEVBQU0sS0FBQSxHQUFRLFFBQVIsR0FBbUIsTUFBekI7VUFBaUMsT0FBQSxFQUFTLEVBQTFDO1VBQThDLFVBQUEsRUFBWSxFQUExRDtVQUE4RCxVQUFBLEVBQVksRUFBMUU7U0FBVCxFQURQO09BQUEsTUFFSyxJQUFHLFFBQUEsS0FBWSxVQUFmO1FBQ0gsQ0FBQSxJQUFLO1FBQ0wsQ0FBQSxJQUFLLEtBQUEsR0FBUSxRQUFBLENBQVM7VUFBQSxJQUFBLEVBQU0sUUFBTjtVQUFnQixPQUFBLEVBQVMsY0FBekI7VUFBeUMsVUFBQSxFQUFZLGFBQXJEO1VBQW9FLFVBQUEsRUFBWSxrQkFBaEY7U0FBVCxDQUFSLEdBQXVIO1FBQzVILFlBQUEsR0FBZSxLQUhaO09BQUEsTUFBQTtRQUtILENBQUEsSUFBSztRQUNMLENBQUEsSUFBSyxRQUFBLENBQVM7VUFBQSxJQUFBLEVBQU0sS0FBQSxHQUFRLFFBQVIsR0FBbUIsTUFBekI7VUFBaUMsT0FBQSxFQUFTLEVBQTFDO1VBQThDLFVBQUEsRUFBWSxFQUExRDtVQUE4RCxVQUFBLEVBQVksRUFBMUU7U0FBVDtRQUNMLFlBQUEsR0FBZSxLQVBaO09BSlA7O0lBYUEsSUFBRyxLQUFLLENBQUMsT0FBTixLQUFpQixzQkFBakIsSUFBMkMsS0FBSyxDQUFDLE9BQU4sS0FBaUIsZ0JBQS9EO01BQ0UsQ0FBQSxJQUFLLFFBQUEsQ0FBUztRQUFBLElBQUEsRUFBTSxLQUFLLENBQUMsT0FBWjtRQUFxQixPQUFBLEVBQVMsUUFBQSxDQUFTLEtBQUssQ0FBQyxPQUFmLEVBQXdCLElBQXhCLEVBQThCLHNDQUE5QixDQUE5QjtPQUFULEVBRFA7S0FBQSxNQUVLLElBQUcsUUFBQSxLQUFLLENBQUMsUUFBTixLQUFrQixnQkFBbEIsSUFBQSxHQUFBLEtBQW9DLG9CQUFwQyxJQUFBLEdBQUEsS0FBMEQscUJBQTFELENBQUEsSUFBb0YsWUFBdkY7TUFDSCxDQUFBLElBQUssUUFBQSxDQUFTO1FBQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxPQUFaO1FBQXFCLE9BQUEsRUFBUyxRQUFBLENBQVMsS0FBSyxDQUFDLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsc0NBQTlCLENBQTlCO1FBQXFHLFVBQUEsRUFBWSxRQUFBLENBQVMsS0FBSyxDQUFDLFVBQWYsRUFBMkIsSUFBM0IsRUFBaUMsc0NBQWpDLENBQWpIO1FBQTJMLFVBQUEsRUFBWSxRQUFBLENBQVMsS0FBSyxDQUFDLFVBQWYsRUFBMkIsSUFBM0IsRUFBaUMsc0NBQWpDLENBQXZNO09BQVQ7TUFDTCxZQUFBLEdBQWUsTUFGWjtLQUFBLE1BQUE7TUFJSCxDQUFBLElBQUssUUFBQSxDQUFTO1FBQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxPQUFaO1FBQXFCLE9BQUEsRUFBUyxRQUFBLENBQVMsS0FBSyxDQUFDLE9BQWYsRUFBd0IsSUFBeEIsQ0FBOUI7UUFBNkQsVUFBQSxFQUFZLFFBQUEsQ0FBUyxLQUFLLENBQUMsVUFBZixFQUEyQixJQUEzQixDQUF6RTtRQUEyRyxVQUFBLEVBQVksUUFBQSxDQUFTLEtBQUssQ0FBQyxVQUFmLEVBQTJCLElBQTNCLENBQXZIO09BQVQsRUFKRjs7QUFoQlA7QUFxQkEsU0FBTztBQTFCaUI7O0FBNEIxQixLQUFBLEdBQVEsU0FBQyxDQUFEO1NBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxXQUFWLEVBQXVCLEdBQXZCO0FBQVA7O0FBRVIsV0FBQSxHQUFjLFNBQUMsR0FBRDtTQUNaLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixFQUFzQixTQUFDLEdBQUQ7V0FDcEIsR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFYLENBQWEsQ0FBQyxXQUFkLENBQUEsQ0FBQSxHQUE4QixHQUFHLENBQUMsTUFBSixDQUFXLENBQVgsQ0FBYSxDQUFDLFdBQWQsQ0FBQTtFQURWLENBQXRCO0FBRFk7O0FBSWQsUUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLElBQUosRUFBVSxJQUFWO0FBQ1AsTUFBQTs7SUFEaUIsT0FBTzs7RUFDeEIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxDQUFSO0VBQ0osSUFBRyxDQUFBLEdBQUksQ0FBUDtJQUNJLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsQ0FBYyxDQUFDLFFBQWYsQ0FBQTtJQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsT0FBRixDQUFVLElBQVYsRUFBZ0IsRUFBaEI7QUFDSixXQUFPLEdBQUEsR0FBSSxJQUFKLEdBQVUsQ0FBQyx3QkFBQSxHQUF5QixDQUF6QixHQUEyQixTQUE1QixDQUFWLEdBQWdELElBSDNEOztFQUtBLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQ7QUFDSixTQUFPLEVBQUEsR0FBRyxJQUFILEdBQVMsQ0FBQyx3QkFBQSxHQUF5QixDQUF6QixHQUEyQixTQUE1QjtBQVJUOztBQVVYLFdBQUEsR0FBYyxTQUFDLGNBQUQsRUFBaUIsSUFBakIsRUFBdUIsTUFBdkIsRUFBK0IsTUFBL0I7QUFFWixNQUFBO0VBQUEsTUFBQSxHQUFTO0VBQ1QsU0FBQSxHQUFZLE1BQU0sQ0FBQztFQUNuQixZQUFBLEdBQWU7RUFFZixXQUFBLEdBQ0U7SUFBQSxLQUFBLEVBQU8sSUFBSSxDQUFDLElBQVo7SUFDQSxxQkFBQSxFQUF1QixJQUFJLENBQUMscUJBRDVCO0lBRUEsbUJBQUEsRUFBc0IsSUFBSSxDQUFDLG1CQUYzQjtJQUdBLGdDQUFBLEVBQWtDLElBQUksQ0FBQyxnQ0FIdkM7SUFJQSxnQkFBQSxFQUFrQixJQUFJLENBQUMsZ0JBSnZCO0lBS0EsSUFBQSxFQUFNLEVBTE47SUFNQSxVQUFBLEVBQVksRUFOWjs7QUFRRixPQUFBLGdEQUFBOztJQUNFLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBakIsQ0FDRTtNQUFBLEtBQUEsRUFBTyxLQUFBLENBQU0sR0FBRyxDQUFDLElBQVYsQ0FBUDtNQUNBLE9BQUEsRUFBUyxHQUFHLENBQUMsSUFEYjtNQUVBLE1BQUEsRUFBUSxDQUFJLENBQUEsR0FBRSxDQUFMLEdBQVksRUFBWixHQUFvQixRQUFyQixDQUZSO0tBREY7QUFERjtBQU1BLE9BQUEsa0RBQUE7O0lBQ0UsV0FBQSxHQUNFO01BQUEsS0FBQSxFQUFPLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFQO01BQ0EsT0FBQSxFQUFTLEdBQUcsQ0FBQyxJQURiO01BRUEsTUFBQSxFQUFRLENBQUksQ0FBQSxHQUFFLENBQUwsR0FBWSxFQUFaLEdBQW9CLFFBQXJCLENBRlI7TUFHQSxVQUFBLEVBQVksRUFIWjs7QUFJRixZQUFPLEdBQUcsQ0FBQyxJQUFYO0FBQUEsV0FDTyw4QkFEUDtRQUVJLFdBQVcsQ0FBQyxVQUFaLElBQTBCLGFBQUEsQ0FBYyxHQUFHLENBQUMsTUFBbEIsRUFBMEIsSUFBMUIsRUFBZ0MsU0FBVSxDQUFBLDhCQUFBLENBQTFDO1FBQzFCLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtBQUNBO0FBQUEsYUFBQSwrQ0FBQTs7VUFDRSxhQUFBLEdBQ0U7WUFBQSxLQUFBLEVBQVUsRUFBQSxLQUFNLFFBQVEsQ0FBQyxLQUFsQixHQUE2QixTQUFBLEdBQVksUUFBUSxDQUFDLEtBQWxELEdBQUEsTUFBUDtZQUNBLElBQUEsRUFBUyxFQUFBLEtBQU0sUUFBUSxDQUFDLFNBQWxCLEdBQWlDLFFBQUEsR0FBVyxRQUFRLENBQUMsU0FBckQsR0FBQSxNQUROO1lBRUEsS0FBQSxFQUFVLFFBQVEsQ0FBQyxhQUFaLEdBQStCLFNBQUEsR0FBWSxRQUFRLENBQUMsYUFBcEQsR0FBQSxNQUZQO1lBR0EsZUFBQSxFQUFvQixJQUFBLEtBQVEsUUFBUSxDQUFDLGdCQUFqQixJQUFzQyxNQUFBLEtBQWEsUUFBUSxDQUFDLGdCQUEvRCxHQUFxRixvQkFBQSxHQUF1QixRQUFRLENBQUMsZ0JBQXJILEdBQUEsTUFIakI7WUFJQSxXQUFBLEVBQWdCLFFBQVEsQ0FBQyxZQUFaLEdBQThCLGdCQUFBLEdBQW1CLFFBQVEsQ0FBQyxZQUExRCxHQUE0RSxnQkFKekY7WUFLQSxXQUFBLEVBQWEsSUFBSSxDQUFDLGFBTGxCO1lBTUEsUUFBQSxFQUFVLElBQUksQ0FBQyxJQU5mO1lBT0EsSUFBQSxFQUFNLFFBQVEsQ0FBQyxJQVBmOztVQVNGLElBQUcsRUFBQSxLQUFNLFFBQVEsQ0FBQyxTQUFmLElBQTZCLFFBQVEsQ0FBQyxTQUFULEtBQXNCLE1BQXREO1lBQ0UsYUFBYSxDQUFDLEtBQWQsR0FBdUIsWUFBQSxHQUFhLFFBQVEsQ0FBQyxTQUF0QixHQUFnQywrQkFEekQ7V0FBQSxNQUFBO1lBR0UsYUFBYSxDQUFDLEtBQWQsR0FBdUIsR0FIekI7O1VBS0EsV0FBVyxDQUFDLFVBQVosSUFBMEIsU0FBVSxDQUFBLDZCQUFBLENBQVYsQ0FBeUMsYUFBekM7QUFoQjVCO0FBSEc7QUFEUCxXQXFCTyx1QkFyQlA7UUFzQkksQ0FBQSxHQUFJO1FBQ0osQ0FBQSxJQUFLLGFBQUEsQ0FBYyxHQUFHLENBQUMsTUFBbEIsRUFBMEIsSUFBMUIsRUFBZ0MsU0FBVSxDQUFBLDhCQUFBLENBQTFDO1FBQ0wsV0FBVyxDQUFDLFVBQVosSUFBMEIsU0FBVSxDQUFBLGtDQUFBLENBQVYsQ0FBOEM7VUFBQSxPQUFBLEVBQVMsQ0FBVDtTQUE5QztRQUMxQixJQUFHLENBQUksWUFBYSxDQUFBLG1CQUFBLENBQXBCO1VBQ0UsS0FBQSxHQUFRO1VBQ1IsSUFBRyxJQUFLLENBQUEsaUNBQUEsQ0FBTCxLQUEyQyxDQUE5QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLElBQUcsSUFBSyxDQUFBLDRCQUFBLENBQUwsS0FBc0MsQ0FBekM7WUFDRSxLQUFBLEdBQVEsTUFEVjs7VUFFQSxJQUFHLElBQUssQ0FBQSw2QkFBQSxDQUFMLEtBQXVDLENBQTFDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsSUFBRyxJQUFLLENBQUEsZ0NBQUEsQ0FBTCxLQUEwQyxDQUE3QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLGVBQUEsR0FBa0I7VUFDbEIsYUFBQSxHQUFnQjtVQUVoQixJQUFHLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxLQUFWLENBQUEsQ0FBQSxHQUFvQixHQUF2QjtZQUNFLGVBQUEsR0FBa0I7WUFDbEIsYUFBQSxHQUFnQixJQUZsQjs7VUFHQSxTQUFBLEdBQVksU0FBQTttQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsa0JBQUE7Y0FBQSxRQUFBLEdBQWUsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXJCLENBQUE7Y0FDZixRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixxQkFBN0I7Y0FDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixPQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxHQUFZLGNBQXhCLENBREYsRUFFRSxJQUFLLENBQUEsaUNBQUEsQ0FGUCxFQUdFLElBQUssQ0FBQSw0QkFBQSxDQUhQLENBRGUsRUFNZixDQUNFLFFBQUEsR0FBVyxXQUFBLENBQVksSUFBSSxDQUFDLElBQUwsR0FBWSxlQUF4QixDQURiLEVBRUUsSUFBSyxDQUFBLDZCQUFBLENBRlAsRUFHRSxJQUFLLENBQUEsZ0NBQUEsQ0FIUCxDQU5lLENBQWpCO2NBWUEsU0FBQSxHQUFnQixJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBckIsQ0FBa0M7Z0JBQUEsY0FBQSxFQUFnQixHQUFoQjtnQkFBc0IsY0FBQSxFQUFnQixHQUF0QztlQUFsQztjQUNoQixTQUFTLENBQUMsTUFBVixDQUFpQixRQUFqQixFQUEyQixDQUEzQjtjQUNBLFNBQVMsQ0FBQyxNQUFWLENBQWlCLFFBQWpCLEVBQTJCLENBQTNCO2NBQ0EsT0FBQSxHQUNFO2dCQUFBLE9BQUEsRUFBUSxpRkFBUjtnQkFDQSxnQkFBQSxFQUNDO2tCQUFBLFVBQUEsRUFBWSxFQUFaO2lCQUZEO2dCQUdBLFNBQUEsRUFDQztrQkFBQSxXQUFBLEVBQ0M7b0JBQUEsVUFBQSxFQUFZLEVBQVo7bUJBREQ7aUJBSkQ7Z0JBTUEsT0FBQSxFQUFTLGVBTlQ7Z0JBT0EsUUFBQSxFQUFVLEdBUFY7Z0JBUUEsV0FBQSxFQUFhLE1BUmI7Z0JBU0EsUUFBQSxFQUFVLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FUVjs7Y0FVRixLQUFBLEdBQVksSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQXJCLENBQWlDLFFBQVEsQ0FBQyxjQUFULENBQXdCLG1CQUF4QixDQUFqQztjQUNaLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixPQUFyQjtZQWhDVyxDQUFGLENBQVgsRUFrQ0csSUFsQ0g7VUFEVTtVQW9DWixJQUFHLEtBQUg7WUFDRSx3RkFERjs7VUFFQSxZQUFhLENBQUEsbUJBQUEsQ0FBYixHQUFtQyxvQkF0RHJDOztRQXVEQSxJQUFHLENBQUksWUFBYSxDQUFBLHNCQUFBLENBQXBCO1VBQ0UsS0FBQSxHQUFRO1VBQ1IsSUFBRyxJQUFLLENBQUEsZ0NBQUEsQ0FBTCxLQUEwQyxDQUE3QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLGdCQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLG9DQURGLEVBRUUsSUFBSyxDQUFBLCtCQUFBLENBRlAsQ0FEZSxDQUFqQjtjQU1BLFNBQUEsR0FBZ0IsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQXJCLENBQWtDO2dCQUFBLGNBQUEsRUFBZ0IsR0FBaEI7Z0JBQXNCLGNBQUEsRUFBZ0IsR0FBdEM7ZUFBbEM7Y0FDaEIsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsQ0FBM0I7Y0FDQSxPQUFBLEdBQ0U7Z0JBQUEsT0FBQSxFQUFRLHNCQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxLQUFBLEVBQU87a0JBQ04sWUFBQSxFQUFjLEtBRFI7aUJBUlA7Z0JBV0EsV0FBQSxFQUFhLE1BWGI7Z0JBWUEsUUFBQSxFQUFVLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FaVjs7Y0FhRixJQUFHLEtBQUg7Z0JBQ0UsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxRQUFRLENBQUMsY0FBVCxDQUF3QixzQkFBeEIsQ0FBakM7Z0JBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCLEVBRkY7O1lBMUJXLENBQUYsQ0FBWCxFQThCRyxJQTlCSDtVQURVO1VBZ0NaO1VBQ0EsWUFBYSxDQUFBLHNCQUFBLENBQWIsR0FBc0MsdUJBckN4Qzs7QUEzREc7QUFyQlAsV0FzSE8sa0JBdEhQO1FBdUhJLENBQUEsR0FBSTtRQUNKLENBQUEsSUFBSyxhQUFBLENBQWMsR0FBRyxDQUFDLE1BQWxCLEVBQTBCLElBQTFCLEVBQWdDLFNBQVUsQ0FBQSw4QkFBQSxDQUExQztRQUNMLFdBQVcsQ0FBQyxVQUFaLElBQTBCLFNBQVUsQ0FBQSxxQ0FBQSxDQUFWLENBQWlEO1VBQUEsT0FBQSxFQUFTLENBQVQ7U0FBakQ7UUFFMUIsSUFBRyxDQUFJLFlBQWEsQ0FBQSxtQkFBQSxDQUFqQixJQUEwQyxJQUFLLENBQUEsVUFBQSxDQUFMLEtBQW9CLGlCQUFqRTtVQUNFLEtBQUEsR0FBUTtVQUNSLElBQUcsSUFBSyxDQUFBLDZDQUFBLENBQUwsS0FBdUQsQ0FBMUQ7WUFDRSxLQUFBLEdBQVEsTUFEVjs7VUFFQSxTQUFBLEdBQVksU0FBQTttQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsa0JBQUE7Y0FBQSxRQUFBLEdBQWUsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXJCLENBQUE7Y0FDZixRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2Qix1QkFBN0I7Y0FDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixPQUE3QjtjQUNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLENBQ2YsQ0FDRSxtQkFERixFQUVFLENBQUEsR0FBSSxJQUFLLENBQUEsNkNBQUEsQ0FGWCxDQURlLEVBS2YsQ0FDRSxPQURGLEVBRUUsSUFBSyxDQUFBLDZDQUFBLENBRlAsQ0FMZSxDQUFqQjtjQVVBLE9BQUEsR0FDRTtnQkFBQSxPQUFBLEVBQVEsdUJBQVI7Z0JBQ0EsZ0JBQUEsRUFDQztrQkFBQSxVQUFBLEVBQVksRUFBWjtpQkFGRDtnQkFHQSxTQUFBLEVBQ0M7a0JBQUEsV0FBQSxFQUNDO29CQUFBLFVBQUEsRUFBWSxFQUFaO21CQUREO2lCQUpEO2dCQU1BLE9BQUEsRUFBUyxlQU5UO2dCQU9BLFFBQUEsRUFBVSxHQVBWO2dCQVFBLE1BQUEsRUFBUyxNQVJUO2dCQVNBLFFBQUEsRUFBVSxDQUFDLFNBQUQsRUFBWSxTQUFaLENBVFY7Z0JBVUEsUUFBQSxFQUFVO2tCQUFFLENBQUEsRUFBRztvQkFBQyxNQUFBLEVBQVEsR0FBVDttQkFBTDtpQkFWVjtnQkFXQSxlQUFBLEVBQWlCLEVBWGpCOztjQVlGLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBckIsQ0FBOEIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsbUJBQXhCLENBQTlCO2NBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCO1lBNUJXLENBQUYsQ0FBWCxFQThCRyxJQTlCSDtVQURVO1VBZ0NaLElBQUcsS0FBSDtZQUNFLHdGQURGOztVQUVBLFlBQWEsQ0FBQSxtQkFBQSxDQUFiLEdBQW1DLG9CQXRDckM7O1FBd0NBLElBQUcsQ0FBSSxZQUFhLENBQUEsMEJBQUEsQ0FBakIsSUFBaUQsSUFBSyxDQUFBLFVBQUEsQ0FBTCxLQUFvQixpQkFBeEU7VUFDRSxLQUFBLEdBQVE7VUFFUixJQUFHLElBQUssQ0FBQSwwQkFBQSxDQUFMLEtBQW9DLENBQXZDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsU0FBQSxHQUFZLFNBQUE7bUJBQ1YsVUFBQSxDQUFXLENBQUUsU0FBQTtBQUNYLGtCQUFBO2NBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2NBQ2YsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsWUFBN0I7Y0FDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixNQUE3QjtjQUNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLENBQ2YsQ0FDRSw2QkFERixFQUVFLElBQUssQ0FBQSwwQkFBQSxDQUZQLENBRGUsRUFLZixDQUNFLHNEQURGLEVBRUUsR0FGRixDQUxlLENBQWpCO2NBVUEsT0FBQSxHQUNFO2dCQUFBLE9BQUEsRUFBUSxlQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxXQUFBLEVBQWEsTUFSYjtnQkFTQSxRQUFBLEVBQVUsQ0FBQyxTQUFELEVBQVksU0FBWixDQVRWO2dCQVVBLGlCQUFBLEVBQW1CLE1BVm5COztjQVdGLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsMEJBQXhCLENBQWpDO2NBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCO1lBM0JXLENBQUYsQ0FBWCxFQTZCRyxJQTdCSDtVQURVO1VBK0JaLElBQUcsS0FBSDtZQUNFLHdGQURGOztVQUdBLFlBQWEsQ0FBQSwwQkFBQSxDQUFiLEdBQTBDLDJCQXZDNUM7O1FBeUNBLElBQUcsQ0FBSSxZQUFhLENBQUEsK0JBQUEsQ0FBakIsSUFBc0QsSUFBSyxDQUFBLFVBQUEsQ0FBTCxLQUFvQixpQkFBN0U7VUFDRSxLQUFBLEdBQVE7VUFDUixJQUFHLElBQUssQ0FBQSwrQkFBQSxDQUFMLEtBQXlDLENBQTVDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsU0FBQSxHQUFZLFNBQUE7bUJBQ1YsVUFBQSxDQUFXLENBQUUsU0FBQTtBQUNYLGtCQUFBO2NBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2NBQ2YsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsWUFBN0I7Y0FDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixNQUE3QjtjQUNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLENBQ2YsQ0FDRSxrQ0FERixFQUVFLElBQUssQ0FBQSwrQkFBQSxDQUZQLENBRGUsRUFLZixDQUNFLDhEQURGLEVBRUUsR0FGRixDQUxlLENBQWpCO2NBVUEsT0FBQSxHQUNFO2dCQUFBLE9BQUEsRUFBUSxvQkFBUjtnQkFDQSxnQkFBQSxFQUNDO2tCQUFBLFVBQUEsRUFBWSxFQUFaO2lCQUZEO2dCQUdBLFNBQUEsRUFDQztrQkFBQSxXQUFBLEVBQ0M7b0JBQUEsVUFBQSxFQUFZLEVBQVo7bUJBREQ7aUJBSkQ7Z0JBTUEsT0FBQSxFQUFTLGVBTlQ7Z0JBT0EsUUFBQSxFQUFVLEdBUFY7Z0JBUUEsV0FBQSxFQUFhLE1BUmI7Z0JBU0EsUUFBQSxFQUFVLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FUVjtnQkFVQSxpQkFBQSxFQUFtQixNQVZuQjs7Y0FXRixJQUFHLEtBQUg7Z0JBQ0UsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxRQUFRLENBQUMsY0FBVCxDQUF3QiwrQkFBeEIsQ0FBakM7Z0JBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCLEVBRkY7O1lBMUJXLENBQUYsQ0FBWCxFQThCRyxJQTlCSDtVQURVO1VBZ0NaO1VBQ0EsWUFBYSxDQUFBLCtCQUFBLENBQWIsR0FBK0MsZ0NBckNqRDs7QUF0Rkc7QUF0SFAsV0FrUE8sc0JBbFBQO1FBbVBJLElBQUcsSUFBSSxDQUFDLG9CQUFSO1VBQ0UsQ0FBQSxHQUFJO1VBRUosQ0FBQSxJQUFLLHVCQUFBLENBQXdCLElBQUksQ0FBQyxvQkFBN0IsRUFBbUQsU0FBVSxDQUFBLGlDQUFBLENBQTdEO1VBQ0wsV0FBVyxDQUFDLFVBQVosSUFBMEIsU0FBVSxDQUFBLHlDQUFBLENBQVYsQ0FBcUQ7WUFBQSxPQUFBLEVBQVMsQ0FBVDtXQUFyRDtVQUUxQixJQUFHLENBQUksWUFBYSxDQUFBLG1CQUFBLENBQXBCO1lBQ0UsS0FBQSxHQUFRO1lBQ1IsSUFBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBMUIsS0FBb0MsQ0FBdkM7Y0FDRSxLQUFBLEdBQVEsTUFEVjs7WUFFQSxTQUFBLEdBQVksU0FBQTtxQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsb0JBQUE7Z0JBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2dCQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHlCQUE3QjtnQkFDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixPQUE3QjtnQkFFQSxJQUFBLEdBQU87QUFDUDtBQUFBLHFCQUFBLHdDQUFBOztrQkFDRSxJQUFHLENBQUMsSUFBSSxDQUFDLGFBQUwsS0FBc0IsVUFBdkIsQ0FBQSxJQUF1QyxDQUFDLElBQUksQ0FBQyxPQUFMLEtBQWtCLGdCQUFuQixDQUExQztvQkFFRSxDQUFBLEdBQUksQ0FDRixJQUFJLENBQUMsT0FESCxFQUVGLFFBQUEsQ0FBUyxJQUFJLENBQUMsVUFBZCxDQUZFO29CQUlKLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVixFQU5GOztBQURGO2dCQVNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO2dCQUNBLE9BQUEsR0FDRTtrQkFBQSxPQUFBLEVBQVEsZ0JBQVI7a0JBQ0EsZ0JBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFGRDtrQkFHQSxTQUFBLEVBQ0M7b0JBQUEsV0FBQSxFQUNDO3NCQUFBLFVBQUEsRUFBWSxFQUFaO3FCQUREO21CQUpEO2tCQU1BLE9BQUEsRUFBUyxhQU5UO2tCQU9BLFFBQUEsRUFBVSxHQVBWO2tCQVFBLGVBQUEsRUFBaUIsRUFSakI7a0JBU0EsMEJBQUEsRUFBNEIsR0FUNUI7a0JBVUEsYUFBQSxFQUFlLElBVmY7a0JBV0EsV0FBQSxFQUFZO29CQUNULEtBQUEsRUFBTSxLQURHO29CQUVULE1BQUEsRUFBTyxLQUZFO21CQVhaOztnQkFnQkYsSUFBRyxLQUFIO2tCQUNFLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBckIsQ0FBOEIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsbUJBQXhCLENBQTlCO2tCQUNaLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixPQUFyQixFQUZGOztjQWpDVyxDQUFGLENBQVgsRUFxQ0csSUFyQ0g7WUFEVSxFQUpkOztVQTJDQSxJQUFHLEtBQUg7WUFDRSx3RkFERjs7VUFFQSxZQUFhLENBQUEsbUJBQUEsQ0FBYixHQUFtQztVQUNuQyxJQUFHLENBQUksWUFBYSxDQUFBLHdCQUFBLENBQXBCO1lBQ0UsS0FBQSxHQUFRO1lBQ1IsSUFBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBMUIsS0FBb0MsQ0FBdkM7Y0FDRSxLQUFBLEdBQVEsTUFEVjs7WUFFQSxTQUFBLEdBQVksU0FBQTtxQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsb0JBQUE7Z0JBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2dCQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHlCQUE3QjtnQkFDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixPQUE3QjtnQkFFQSxJQUFBLEdBQU87QUFDUDtBQUFBLHFCQUFBLHdDQUFBOztrQkFDRSxJQUFHLENBQUMsSUFBSSxDQUFDLGFBQUwsS0FBc0IsY0FBdkIsQ0FBQSxJQUEyQyxDQUFDLElBQUksQ0FBQyxPQUFMLEtBQWtCLG9CQUFuQixDQUE5QztvQkFFRSxDQUFBLEdBQUksQ0FDRixJQUFJLENBQUMsT0FESCxFQUVGLFFBQUEsQ0FBUyxJQUFJLENBQUMsVUFBZCxDQUZFO29CQUlKLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVixFQU5GOztBQURGO2dCQVNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO2dCQUNBLE9BQUEsR0FDRTtrQkFBQSxPQUFBLEVBQVEsb0JBQVI7a0JBQ0EsZ0JBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFGRDtrQkFHQSxTQUFBLEVBQ0M7b0JBQUEsV0FBQSxFQUNDO3NCQUFBLFVBQUEsRUFBWSxFQUFaO3FCQUREO21CQUpEO2tCQU1BLE9BQUEsRUFBUyxhQU5UO2tCQU9BLFFBQUEsRUFBVSxHQVBWO2tCQVFBLGVBQUEsRUFBaUIsRUFSakI7a0JBU0EsMEJBQUEsRUFBNEIsR0FUNUI7a0JBVUEsYUFBQSxFQUFlLElBVmY7a0JBV0EsV0FBQSxFQUFZO29CQUNULEtBQUEsRUFBTSxLQURHO29CQUVULE1BQUEsRUFBTyxLQUZFO21CQVhaOztnQkFnQkYsSUFBRyxLQUFIO2tCQUNFLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBckIsQ0FBOEIsUUFBUSxDQUFDLGNBQVQsQ0FBd0Isd0JBQXhCLENBQTlCO2tCQUNaLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixPQUFyQixFQUZGOztjQWpDVyxDQUFGLENBQVgsRUFxQ0csSUFyQ0g7WUFEVSxFQUpkOztVQTJDQSxJQUFHLEtBQUg7WUFDRSx3RkFERjs7VUFFQSxZQUFhLENBQUEsd0JBQUEsQ0FBYixHQUF3Qyx5QkFqRzFDOztBQURHO0FBbFBQO1FBc1ZJLFdBQVcsQ0FBQyxVQUFaLElBQTBCLGFBQUEsQ0FBYyxHQUFHLENBQUMsTUFBbEIsRUFBMEIsSUFBMUIsRUFBZ0MsU0FBVSxDQUFBLDhCQUFBLENBQTFDO0FBdFY5QjtJQXdWQSxXQUFXLENBQUMsVUFBWixJQUEwQixTQUFVLENBQUEsb0JBQUEsQ0FBVixDQUFnQyxXQUFoQztBQTlWNUI7QUErVkEsU0FBTyxTQUFVLENBQUEsbUJBQUEsQ0FBVixDQUErQixXQUEvQjtBQXBYSzs7QUF1WGQsaUJBQUEsR0FBb0IsU0FBQyxFQUFEO0FBQ2xCLE1BQUE7RUFBQSxDQUFBLEdBQUk7QUFDSixPQUFBLG9DQUFBOztBQUNFO0FBQUEsU0FBQSx1Q0FBQTs7TUFDRSxDQUFFLENBQUEsS0FBQSxDQUFGLEdBQVc7QUFEYjtBQURGO0FBR0EsU0FBTztBQUxXOztBQU9wQixpQkFBQSxHQUFvQixTQUFDLENBQUQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSTtBQUNKLE9BQUEsZUFBQTtJQUNFLENBQUUsQ0FBQSxVQUFBLENBQUYsR0FBZ0I7QUFEbEI7QUFFQSxTQUFPO0FBSlc7O0FBTXBCLHNCQUFBLEdBQXlCLFNBQUMsRUFBRCxFQUFLLENBQUw7QUFDdkIsTUFBQTtFQUFBLGFBQUEsR0FBZ0IsaUJBQUEsQ0FBa0IsRUFBbEI7RUFDaEIsYUFBQSxHQUFnQixpQkFBQSxDQUFrQixDQUFsQjtFQUNoQixrQkFBQSxHQUFxQjtBQUNyQixPQUFBLGtCQUFBO1FBQXVELENBQUksYUFBYyxDQUFBLENBQUE7TUFBekUsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsQ0FBeEI7O0FBQUE7QUFDQSxTQUFPO0FBTGdCOztBQVF6Qix1QkFBQSxHQUEwQixTQUFDLE1BQUQsRUFBWSxJQUFaO0FBRXhCLE1BQUE7O0lBRnlCLFNBQU87O0VBRWhDLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxFQUFmLEVBQW1CLE1BQW5CO0VBQ0osQ0FBQSxHQUNFO0lBQUEsSUFBQSxFQUFNLE9BQU47SUFDQSxNQUFBLEVBQVEsc0JBQUEsQ0FBdUIsQ0FBdkIsRUFBMEIsSUFBMUIsQ0FEUjs7RUFHRixDQUFDLENBQUMsSUFBRixDQUFPLENBQVA7QUFDQSxTQUFPO0FBUmlCOztBQWExQix1QkFBQSxHQUF3QixTQUFDLEtBQUQ7QUFDdEIsTUFBQTtFQUFBLFFBQUEsR0FBUztFQUNULElBQUEsR0FBSztFQUVMLFlBQUEsR0FBZSxTQUFDLE9BQUQ7QUFDYixRQUFBO0lBQUEsUUFBQSxHQUFVO0FBQ1Y7QUFBQSxTQUFBLDZDQUFBOztNQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVQsR0FBbUI7QUFBbkI7QUFDQSxXQUFPO0VBSE07RUFNZixHQUFBLEdBQU0sU0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixRQUFyQjtXQUNKLE1BQU8sQ0FBQSxRQUFTLENBQUEsVUFBQSxDQUFUO0VBREg7RUFJTixhQUFBLEdBQWUsU0FBQyxJQUFEO0FBQ2IsUUFBQTtJQUFBLENBQUEsR0FBSTtBQUNKLFNBQUEsU0FBQTtNQUNFLEdBQUEsR0FBTTtNQUNOLEdBQUcsQ0FBQyxJQUFKLEdBQVM7TUFDVCxHQUFHLENBQUMsTUFBSixHQUFXLElBQUssQ0FBQSxDQUFBO01BQ2hCLENBQUMsQ0FBQyxJQUFGLENBQU8sR0FBUDtBQUpGO0FBS0EsV0FBTztFQVBNO0VBVWYsUUFBQSxHQUFXLFlBQUEsQ0FBYSxLQUFLLENBQUMsUUFBbkI7RUFDWCxpQkFBQSxHQUFvQjtBQUVwQjtBQUFBLE9BQUEsNkNBQUE7O0lBQ0UsUUFBQSxHQUFXLEdBQUEsQ0FBSSxrQkFBSixFQUF3QixHQUF4QixFQUE2QixRQUE3QjtJQUVYLFNBQUEsR0FBWSxHQUFBLENBQUksWUFBSixFQUFrQixHQUFsQixFQUF1QixRQUF2QjtJQUNaLElBQUcsQ0FBSSxTQUFQO01BQXNCLFNBQUEsR0FBWSxHQUFBLEdBQU0sTUFBQSxDQUFPLEVBQUUsaUJBQVQsRUFBeEM7O0lBQ0EsVUFBVyxDQUFBLEdBQUEsQ0FBSSxZQUFKLEVBQWtCLEdBQWxCLEVBQXVCLFFBQXZCLENBQUEsQ0FBWCxHQUE0QyxHQUFBLENBQUksYUFBSixFQUFtQixHQUFuQixFQUF3QixRQUF4QjtJQUM1QyxjQUFlLENBQUEsU0FBQSxDQUFmLEdBQTRCLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLEdBQWpCLEVBQXNCLFFBQXRCO0lBQzVCLElBQUcsUUFBSDs7UUFDRSxRQUFTLENBQUEsUUFBQSxJQUFXOztNQUNwQixRQUFTLENBQUEsUUFBQSxDQUFTLENBQUMsSUFBbkIsQ0FBd0I7UUFBQSxDQUFBLEVBQUcsR0FBQSxDQUFJLEdBQUosRUFBUyxHQUFULEVBQWMsUUFBZCxDQUFIO1FBQTRCLElBQUEsRUFBTSxTQUFsQztRQUE2QyxJQUFBLEVBQU0sR0FBQSxDQUFJLE1BQUosRUFBWSxHQUFaLEVBQWlCLFFBQWpCLENBQW5EO09BQXhCLEVBRkY7O0FBUEY7RUFXQSxVQUFBLEdBQWEsTUFBTSxDQUFDLElBQVAsQ0FBWSxRQUFaO0VBQ2IsZUFBQSxHQUFrQjtBQUNsQixPQUFBLDhDQUFBOztJQUNFLElBQUcsQ0FBSSxlQUFnQixDQUFBLFFBQUEsQ0FBdkI7TUFDRSxlQUFnQixDQUFBLFFBQUEsQ0FBaEIsR0FBNEIsUUFBUyxDQUFBLFFBQUEsQ0FBVSxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBRHBEOztJQUVBLE1BQUEsR0FBUztBQUNUO0FBQUEsU0FBQSx3Q0FBQTs7TUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVo7QUFERjtJQUVBLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNWLGFBQU8sQ0FBQyxDQUFDLENBQUYsR0FBTSxDQUFDLENBQUM7SUFETCxDQUFaO0lBRUEsUUFBUyxDQUFBLFFBQUEsQ0FBVCxHQUFxQjtBQVJ2QjtFQVVBLGdCQUFBLEdBQW1CO0FBQ25CLE9BQUEsMkJBQUE7O0lBQ0UsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0I7TUFBQSxRQUFBLEVBQVUsUUFBVjtNQUFvQixDQUFBLEVBQUcsQ0FBdkI7S0FBdEI7QUFERjtFQUVBLGdCQUFnQixDQUFDLElBQWpCLENBQXNCLFNBQUMsQ0FBRCxFQUFHLENBQUg7QUFDcEIsV0FBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztFQURLLENBQXRCO0VBR0EsV0FBQSxHQUFjO0FBQ2QsT0FBQSxvREFBQTs7SUFDRSxXQUFZLENBQUEsUUFBUSxDQUFDLFFBQVQsQ0FBWixHQUFpQyxRQUFTLENBQUEsUUFBUSxDQUFDLFFBQVQ7QUFENUM7RUFHQSxJQUFBLEdBQU8sYUFBQSxDQUFjLFdBQWQ7QUFDUCxTQUFPO0FBN0RlOztBQWdFbEI7RUFFSixVQUFDLENBQUEsSUFBRCxHQUFROztFQUNSLFVBQUMsQ0FBQSxTQUFELEdBQWE7O0VBQ2IsVUFBQyxDQUFBLElBQUQsR0FBUTs7RUFDUixVQUFDLENBQUEsTUFBRCxHQUFVOztFQUVFLG9CQUFBO0FBQ1YsUUFBQTtJQUFBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFDUixJQUFDLENBQUEsTUFBRCxHQUFVO0lBQ1YsWUFBQSxHQUFlLENBQUMsbUJBQUQsRUFBc0Isb0JBQXRCLEVBQTRDLDhCQUE1QyxFQUE0RSxpQ0FBNUUsRUFBK0csNkJBQS9HLEVBQThJLGtDQUE5SSxFQUFrTCxxQ0FBbEwsRUFBeU4seUNBQXpOLEVBQW9RLHNCQUFwUTtJQUNmLGdCQUFBLEdBQW1CLENBQUMsY0FBRDtJQUNuQixJQUFDLENBQUEsU0FBRCxHQUFhO0FBQ2IsU0FBQSxzREFBQTs7TUFDRSxJQUFDLENBQUEsU0FBVSxDQUFBLFFBQUEsQ0FBWCxHQUF1QixVQUFVLENBQUMsT0FBWCxDQUFtQixDQUFBLENBQUUsR0FBQSxHQUFNLFFBQVIsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBLENBQW5CO0FBRHpCO0FBRUEsU0FBQSw0REFBQTs7TUFDRSxVQUFVLENBQUMsZUFBWCxDQUEyQixRQUEzQixFQUFxQyxDQUFBLENBQUUsR0FBQSxHQUFNLFFBQVIsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBLENBQXJDO0FBREY7RUFSVTs7dUJBV1osWUFBQSxHQUFjLFNBQUMsV0FBRCxFQUFjLFdBQWQ7V0FDWixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FDRTtNQUFBLE1BQUEsRUFBTyxJQUFQO01BQ0EsSUFBQSxFQUFLLFdBREw7TUFFQSxNQUFBLEVBQU8sU0FBQyxHQUFEO1FBQ0wsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLEdBQWU7ZUFDZixXQUFBLENBQVksV0FBWixFQUF5QixHQUF6QixFQUE4QixJQUE5QixFQUFvQyxJQUFDLENBQUEsTUFBckM7TUFGSyxDQUZQO01BS0EsSUFBQSxFQUFNLFNBQUMsUUFBRCxFQUFXLFFBQVg7UUFDSixJQUFHLENBQUksSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsUUFBQSxDQUF0QjtpQkFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxRQUFBLENBQWYsR0FBMkIsQ0FBQyxRQUFELEVBRDdCO1NBQUEsTUFBQTtpQkFHRSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxRQUFBLENBQVMsQ0FBQyxJQUF6QixDQUE4QixRQUE5QixFQUhGOztNQURJLENBTE47TUFVQSxRQUFBLEVBQVUsU0FBQyxRQUFEO0FBQ1IsWUFBQTtRQUFBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFPLENBQUEsUUFBQSxDQUFsQjtBQUNFO0FBQUE7ZUFBQSw2Q0FBQTs7eUJBQ0UsQ0FBQSxDQUFFLFFBQUYsRUFBWSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQXBCO0FBREY7eUJBREY7O01BRFEsQ0FWVjtLQURGO0VBRFk7O3VCQWlCZCxhQUFBLEdBQWMsU0FBQyxhQUFELEVBQWdCLEdBQWhCO1dBQ1osQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxHQUFMO01BQ0EsUUFBQSxFQUFVLE1BRFY7TUFFQSxLQUFBLEVBQU8sSUFGUDtNQUdBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsYUFBRDtpQkFDUCxLQUFDLENBQUEsWUFBRCxDQUFjLGFBQWQsRUFBNkIsYUFBN0I7UUFETztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIVDtLQURGO0VBRFk7O3VCQVFkLG9CQUFBLEdBQXFCLFNBQUMsYUFBRCxFQUFnQixHQUFoQjtXQUNuQixDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLEdBQUw7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLEtBQUEsRUFBTyxJQUZQO01BR0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxhQUFEO0FBQ1AsY0FBQTtVQUFBLENBQUEsR0FBSSx1QkFBQSxDQUF3QixhQUF4QjtpQkFDSixLQUFDLENBQUEsWUFBRCxDQUFjLGFBQWQsRUFBNkIsQ0FBN0I7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIVDtLQURGO0VBRG1COzt1QkFVckIsU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0FBQUM7QUFBQTtTQUFBLHFDQUFBOzttQkFBQSxDQUFDLENBQUM7QUFBRjs7RUFEUTs7dUJBR1gsaUJBQUEsR0FBbUIsU0FBQyxJQUFEO0FBQ2pCLFFBQUE7QUFBQTtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLElBQWI7UUFBdUIsRUFBdkI7O0FBREY7QUFFQSxXQUFPLENBQUM7RUFIUzs7dUJBS25CLFFBQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxJQUFOO0lBQ1IsSUFBSSxHQUFBLEtBQU8sQ0FBQyxDQUFaO0FBQW9CLGFBQVEsR0FBNUI7O0lBRUEsSUFBRyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBVDtBQUNFLGFBQU8sSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUFYLENBQWtCLElBQWxCLEVBRFQ7S0FBQSxNQUFBO0FBR0UsYUFBTyxHQUhUOztFQUhROzt1QkFRVixRQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sUUFBTjtJQUNSLElBQUcsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQVQ7YUFDRSxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLFFBQVgsQ0FBb0IsUUFBcEIsRUFERjs7RUFEUTs7Ozs7O0FBSVosTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDM3JCakIsSUFBQTs7QUFBQSxDQUFBLENBQUUsU0FBQTtFQU1BLE1BQU0sQ0FBQyxxQkFBUCxHQUErQjtTQUMvQixNQUFNLENBQUMsd0JBQVAsR0FBa0M7QUFQbEMsQ0FBRjs7QUFTQSxxQkFBQSxHQUFzQixTQUFDLENBQUQ7QUFDcEIsTUFBQTtFQUFBLFlBQUEsR0FBZSxDQUFDLENBQUMsT0FBRixDQUFVLGVBQVYsRUFBMEIsSUFBMUI7U0FDZixDQUFDLENBQUMsT0FBRixDQUFVLHNEQUFBLEdBQXVELFlBQXZELEdBQW9FLG1DQUE5RSxFQUFrSCxTQUFDLElBQUQ7SUFDaEgsQ0FBQSxDQUFFLGlCQUFGLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFyQztJQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBNUM7SUFDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixzQkFBNUIsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxNQUF6RCxFQUFpRSxTQUFBO2FBQUksMEJBQUEsR0FBNkIsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiO0lBQWpDLENBQWpFO1dBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxRQUF0QyxFQUFnRCxRQUFoRDtFQUpnSCxDQUFsSDtBQUZvQjs7QUFRdEIsd0JBQUEsR0FBMEIsU0FBQTtTQUN4QixLQUFBLENBQU0saUJBQU47QUFEd0I7O0FBRzFCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxxQkFBQSxFQUFzQixxQkFBdEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYm91bmRzX3RpbWVvdXQ9dW5kZWZpbmVkXHJcblxyXG5cclxubWFwID0gbmV3IEdNYXBzXHJcbiAgZWw6ICcjZ292bWFwJ1xyXG4gIGxhdDogMzcuM1xyXG4gIGxuZzogLTExOS4zXHJcbiAgem9vbTogNlxyXG4gIG1pblpvb206IDZcclxuICBzY3JvbGx3aGVlbDogdHJ1ZVxyXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxyXG4gIHBhbkNvbnRyb2w6IGZhbHNlXHJcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXHJcbiAgem9vbUNvbnRyb2w6IHRydWVcclxuICB6b29tQ29udHJvbE9wdGlvbnM6XHJcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxyXG5cclxubWFwLm1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uUklHSFRfVE9QXS5wdXNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdlbmQnKSlcclxuXHJcbnJlcmVuZGVyX21hcmtlcnMgPSAtPlxyXG4gIGFkZF9tYXJrZXIocmVjKSBmb3IgcmVjIGluIEdPVldJS0kubWFya2Vyc1xyXG5cclxucmVidWlsZF9maWx0ZXIgPSAtPlxyXG4gIGhhcmRfcGFyYW1zID0gWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0J11cclxuICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yID0gW11cclxuICAkKCcudHlwZV9maWx0ZXInKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cclxuICAgIGlmICQoZWxlbWVudCkuYXR0cignbmFtZScpIGluIGhhcmRfcGFyYW1zIGFuZCAkKGVsZW1lbnQpLnZhbCgpID09ICcxJ1xyXG4gICAgICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLnB1c2ggJChlbGVtZW50KS5hdHRyKCduYW1lJylcclxuXHJcbiMgbGVnZW5kVHlwZSA9IGNpdHksIHNjaG9vbCBkaXN0cmljdCwgc3BlY2lhbCBkaXN0cmljdCwgY291bnRpZXNcclxuZ2V0X3JlY29yZHMyID0gKGxlZ2VuZFR5cGUsIG9uc3VjY2VzcykgLT5cclxuICAkLmFqYXhcclxuICAgIHVybDpcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcclxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUgfVxyXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xyXG4gICAgY2FjaGU6IHRydWVcclxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xyXG4gICAgZXJyb3I6KGUpIC0+XHJcbiAgICAgIGNvbnNvbGUubG9nIGVcclxuXHJcbiQgLT5cclxuXHJcbiAgcmVidWlsZF9maWx0ZXIoKVxyXG4gIGdldF9yZWNvcmRzMiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLCAoZGF0YSkgLT5cclxuICAgIEdPVldJS0kubWFya2VycyA9IGRhdGE7XHJcbiAgICByZXJlbmRlcl9tYXJrZXJzKClcclxuXHJcbiAgJCgnI2xlZ2VuZCBsaTpub3QoLmNvdW50aWVzLXRyaWdnZXIpJykub24gJ2NsaWNrJywgLT5cclxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICBoaWRkZW5fZmllbGQgPSAkKHRoaXMpLmZpbmQoJ2lucHV0JylcclxuICAgIHZhbHVlID0gaGlkZGVuX2ZpZWxkLnZhbCgpXHJcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcclxuICAgIHJlYnVpbGRfZmlsdGVyKClcclxuICAgIG1hcC5yZW1vdmVNYXJrZXJzKClcclxuICAgIHJlcmVuZGVyX21hcmtlcnMoKVxyXG5cclxuICAkKCcjbGVnZW5kIGxpLmNvdW50aWVzLXRyaWdnZXInKS5vbiAnY2xpY2snLCAtPlxyXG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcclxuICAgIGlmICQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpIHRoZW4gR09WV0lLSS5nZXRfY291bnRpZXMgR09WV0lLSS5kcmF3X3BvbHlnb25zIGVsc2UgbWFwLnJlbW92ZVBvbHlnb25zKClcclxuXHJcblxyXG5cclxuXHJcbmdldF9pY29uID0oYWx0X3R5cGUpIC0+XHJcblxyXG4gIF9jaXJjbGUgPShjb2xvciktPlxyXG4gICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEVcclxuICAgIGZpbGxPcGFjaXR5OiAxXHJcbiAgICBmaWxsQ29sb3I6Y29sb3JcclxuICAgIHN0cm9rZVdlaWdodDogMVxyXG4gICAgc3Ryb2tlQ29sb3I6J3doaXRlJ1xyXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXHJcbiAgICBzY2FsZTo2XHJcblxyXG4gIHN3aXRjaCBhbHRfdHlwZVxyXG4gICAgd2hlbiAnQ2l0eScgdGhlbiByZXR1cm4gX2NpcmNsZSAncmVkJ1xyXG4gICAgd2hlbiAnU2Nob29sIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdsaWdodGJsdWUnXHJcbiAgICB3aGVuICdTcGVjaWFsIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdwdXJwbGUnXHJcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcclxuXHJcbmluX2FycmF5ID0gKG15X2l0ZW0sIG15X2FycmF5KSAtPlxyXG4gIGZvciBpdGVtIGluIG15X2FycmF5XHJcbiAgICByZXR1cm4gdHJ1ZSBpZiBpdGVtID09IG15X2l0ZW1cclxuICBmYWxzZVxyXG5cclxuXHJcbmFkZF9tYXJrZXIgPSAocmVjKS0+XHJcbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXHJcbiAgZXhpc3QgPSBpbl9hcnJheSByZWMuYWx0VHlwZSwgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMlxyXG4gIGlmIGV4aXN0IGlzIGZhbHNlIHRoZW4gcmV0dXJuIGZhbHNlXHJcbiAgbWFwLmFkZE1hcmtlclxyXG4gICAgbGF0OiByZWMubGF0aXR1ZGVcclxuICAgIGxuZzogcmVjLmxvbmdpdHVkZVxyXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXHJcbiAgICB0aXRsZTogIFwiI3tyZWMubmFtZX0sICN7cmVjLnR5cGV9XCJcclxuICAgIGluZm9XaW5kb3c6XHJcbiAgICAgIGNvbnRlbnQ6IFwiXHJcbiAgICAgICAgPGRpdj48YSBocmVmPSdqYXZhc2NyaXB0OnZvaWQoMCk7JyBjbGFzcz0naW5mby13aW5kb3ctdXJpJyBkYXRhLXVyaT0nLyN7cmVjLmFsdFR5cGVTbHVnfS8je3JlYy5zbHVnfSc+PHN0cm9uZz4je3JlYy5uYW1lfTwvc3Ryb25nPjwvYT48L2Rpdj5cclxuICAgICAgICA8ZGl2PiAje3JlYy50eXBlfSAgI3tyZWMuY2l0eX0gI3tyZWMuemlwfSAje3JlYy5zdGF0ZX08L2Rpdj5cIlxyXG5cclxuXHJcbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbnBpbkltYWdlID0gbmV3IChnb29nbGUubWFwcy5NYXJrZXJJbWFnZSkoXHJcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXHJcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxyXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDAsIDApLFxyXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcclxuICApXHJcblxyXG5cclxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cclxuICBHTWFwcy5nZW9jb2RlXHJcbiAgICBhZGRyZXNzOiBhZGRyXHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cclxuICAgICAgaWYgc3RhdHVzID09ICdPSydcclxuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXHJcbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxyXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXHJcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxyXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xyXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcclxuICAgICAgICAgIGluZm9XaW5kb3c6XHJcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcclxuXHJcbiAgICAgICAgaWYgZGF0YVxyXG4gICAgICAgICAgbWFwLmFkZE1hcmtlclxyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcclxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICBzaXplOiAnc21hbGwnXHJcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcclxuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcclxuICAgICAgICAgICAgdGl0bGU6ICBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxyXG4gICAgICAgICAgICBpbmZvV2luZG93OlxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXHJcblxyXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXHJcbiAgICAgIHJldHVyblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICBtYXA6IG1hcFxyXG4iLCJcclxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXHJcblxyXG5jbGFzcyBHb3ZTZWxlY3RvclxyXG4gIFxyXG4gICMgc3R1YiBvZiBhIGNhbGxiYWNrIHRvIGVudm9rZSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZXRoaW5nXHJcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XHJcblxyXG5cclxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cclxuICAgICQuYWpheFxyXG4gICAgICB1cmw6IGRvY3NfdXJsXHJcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgc3VjY2VzczogQHN0YXJ0U3VnZ2VzdGlvblxyXG4gICAgICBcclxuXHJcblxyXG5cclxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXHJcbiAgICA8ZGl2IGNsYXNzPVwic3VnZy1ib3hcIj5cclxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxyXG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctdHlwZVwiPnt7e2dvdl90eXBlfX19PC9kaXY+XHJcbiAgICA8L2Rpdj5cIlwiXCIpXHJcblxyXG5cclxuXHJcbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcclxuXHJcbiAgZ292c19hcnJheSA9IFtdXHJcblxyXG4gIGNvdW50X2dvdnMgOiAoKSAtPlxyXG4gICAgY291bnQgPTBcclxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XHJcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxyXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcclxuICAgICAgY291bnQrK1xyXG4gICAgcmV0dXJuIGNvdW50XHJcblxyXG5cclxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cclxuICAgICNAZ292c19hcnJheSA9IGdvdnNcclxuICAgIEBnb3ZzX2FycmF5ID0gZ292cy5yZWNvcmRcclxuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XHJcbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXHJcblxyXG4gICAgc2V0VGltZW91dCA9PlxyXG4gICAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXHJcbiAgICAsIDEwMDBcclxuXHJcbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXHJcbiAgICAgICAgaGludDogZmFsc2VcclxuICAgICAgICBoaWdobGlnaHQ6IGZhbHNlXHJcbiAgICAgICAgbWluTGVuZ3RoOiAxXHJcbiAgICAgICAgY2xhc3NOYW1lczpcclxuICAgICAgICBcdG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xyXG4gICAgICAsXHJcbiAgICAgICAgbmFtZTogJ2dvdl9uYW1lJ1xyXG4gICAgICAgIGRpc3BsYXlLZXk6ICdnb3ZfbmFtZSdcclxuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXHJcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxyXG4gICAgICAgIHRlbXBsYXRlczogc3VnZ2VzdGlvbjogQHN1Z2dlc3Rpb25UZW1wbGF0ZVxyXG4gICAgKVxyXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cclxuICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBAZW50ZXJlZF92YWx1ZVxyXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXHJcbiAgIFxyXG4gICAgLm9uICd0eXBlYWhlYWQ6Y3Vyc29yY2hhbmdlZCcsIChldnQsIGRhdGEsIG5hbWUpID0+XHJcbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxyXG4gICAgXHJcblxyXG4gICAjICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxyXG4gICAgcmV0dXJuXHJcblxyXG5cclxuXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcclxuXHJcblxyXG5cclxuIiwiIyMjXHJcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgOlxyXG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXHJcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIyNcclxuXHJcbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXHJcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcclxuVGVtcGxhdGVzMiA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXHJcbndpa2lwZWRpYSA9IHJlcXVpcmUgJy4vd2lraXBlZGlhLmNvZmZlZSdcclxuXHJcbmdvdm1hcCA9IG51bGxcclxuZ292X3NlbGVjdG9yID0gbnVsbFxyXG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxyXG5hY3RpdmVfdGFiID0gXCJcIlxyXG51bmRlZiA9IG51bGxcclxuYXV0aG9yaXplZCA9IGZhbHNlXHJcblxyXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpZl9lcScsIChhLCBiLCBvcHRzKSAtPlxyXG4gICAgaWYgYGEgPT0gYmBcclxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXHJcbiAgICBlbHNlXHJcbiAgICAgICAgcmV0dXJuIG9wdHMuaW52ZXJzZSB0aGlzXHJcblxyXG53aW5kb3cuR09WV0lLSSA9XHJcbiAgICBzdGF0ZV9maWx0ZXI6ICcnXHJcbiAgICBnb3ZfdHlwZV9maWx0ZXI6ICcnXHJcbiAgICBnb3ZfdHlwZV9maWx0ZXJfMjogWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0J11cclxuXHJcbiAgICBzaG93X3NlYXJjaF9wYWdlOiAoKSAtPlxyXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuaGlkZSgpXHJcbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcclxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuZmFkZUluKDMwMClcclxuICAgICAgICBmb2N1c19zZWFyY2hfZmllbGQgNTAwXHJcblxyXG4gICAgc2hvd19kYXRhX3BhZ2U6ICgpIC0+XHJcbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcclxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmZhZGVJbigzMDApXHJcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxyXG5cclxuR09WV0lLSS5nZXRfY291bnRpZXMgPSBnZXRfY291bnRpZXMgPSAoY2FsbGJhY2spIC0+XHJcbiAgICAkLmFqYXhcclxuICAgICAgICB1cmw6ICcvbGVnYWN5L2RhdGEvY291bnR5X2dlb2dyYXBoeV9jYV8yLmpzb24nXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xyXG4gICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgc3VjY2VzczogKGNvdW50aWVzSlNPTikgLT5cclxuICAgICAgICAgICAgY2FsbGJhY2sgY291bnRpZXNKU09OXHJcblxyXG5HT1ZXSUtJLmRyYXdfcG9seWdvbnMgPSBkcmF3X3BvbHlnb25zID0gKGNvdW50aWVzSlNPTikgLT5cclxuICAgIGZvciBjb3VudHkgaW4gY291bnRpZXNKU09OLmZlYXR1cmVzXHJcbiAgICAgICAgZG8gKGNvdW50eSkgPT5cclxuICAgICAgICAgICAgZ292bWFwLm1hcC5kcmF3UG9seWdvbih7XHJcbiAgICAgICAgICAgICAgICBwYXRoczogY291bnR5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXHJcbiAgICAgICAgICAgICAgICB1c2VHZW9KU09OOiB0cnVlXHJcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyM4MDgwODAnXHJcbiAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAwLjZcclxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMS41XHJcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjRkYwMDAwJ1xyXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuMTVcclxuICAgICAgICAgICAgICAgIGNvdW50eUlkOiBjb3VudHkucHJvcGVydGllcy5faWRcclxuICAgICAgICAgICAgICAgIGFsdE5hbWU6IGNvdW50eS5wcm9wZXJ0aWVzLmFsdF9uYW1lXHJcbiAgICAgICAgICAgICAgICBtYXJrZXI6IG5ldyBNYXJrZXJXaXRoTGFiZWwoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFpc2VPbkRyYWc6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogZ292bWFwLm1hcC5tYXAsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDb250ZW50OiBjb3VudHkucHJvcGVydGllcy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoLTE1LCAyNSksXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDbGFzczogXCJsYWJlbC10b29sdGlwXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHlsZToge29wYWNpdHk6IDEuMH0sXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzF4MVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgbW91c2VvdmVyOiAtPlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiMwMEZGMDBcIn0pXHJcbiAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IChldmVudCkgLT5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbihldmVudC5sYXRMbmcpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZSh0cnVlKVxyXG4gICAgICAgICAgICAgICAgbW91c2VvdXQ6IC0+XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiI0ZGMDAwMFwifSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgY2xpY2s6IC0+XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxyXG4gICAgICAgICAgICAgICAgICAgIHVyaSA9IFwiLyN7Y291bnR5LmFsdF90eXBlX3NsdWd9LyN7Y291bnR5LnByb3BlcnRpZXMuc2x1Z31cIlxyXG4gICAgICAgICAgICAgICAgICAgICQuYWpheFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxyXG4gICAgICAgICAgICB9KVxyXG5cclxud2luZG93LnJlbWVtYmVyX3RhYiA9IChuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXHJcblxyXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XHJcbiAgICBhY3RpdmVfdGFiID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3RhYm5hbWUnKVxyXG4gICAgY29uc29sZS5sb2cgYWN0aXZlX3RhYlxyXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcclxuICAgICQoJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSkuYWRkQ2xhc3MoXCJhY3RpdmVcIilcclxuICAgIHRlbXBsYXRlcy5hY3RpdmF0ZSAwLCBhY3RpdmVfdGFiXHJcblxyXG4gICAgaWYgYWN0aXZlX3RhYiA9PSAnRmluYW5jaWFsIFN0YXRlbWVudHMnXHJcbiAgICAgICAgZmluVmFsV2lkdGhNYXgxID0gMFxyXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcclxuICAgICAgICBmaW5WYWxXaWR0aE1heDMgPSAwXHJcblxyXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cclxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXHJcblxyXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcclxuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IHRoaXNGaW5WYWxXaWR0aFxyXG5cclxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XHJcbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxyXG5cclxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXHJcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDIgPSB0aGlzRmluVmFsV2lkdGhcclxuXHJcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxyXG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcclxuXHJcbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gdGhpc0ZpblZhbFdpZHRoXHJcblxyXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXHJcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMlwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDIgKyAyNylcclxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIzXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MyArIDI3KVxyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxyXG5cclxuYWN0aXZhdGVfdGFiID0gKCkgLT5cclxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxyXG5cclxuXHJcbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxyXG4jIGNsZWFyIHdpa2lwZWRpYSBwbGFjZVxyXG4gICAgJChcIiN3aWtpcGVkaWFDb250YWluZXJcIikuaHRtbChcIlwiKVxyXG4gICAgJC5hamF4XHJcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL2dvdnMvI3tyZWNpZH1cIlxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxyXG4gICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XHJcbiAgICAgICAgICAgIGlmIGRhdGFcclxuICAgICAgICAgICAgICAgIGdldF9maW5hbmNpYWxfc3RhdGVtZW50cyBkYXRhLl9pZCwgKGRhdGEyLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cclxuICAgICAgICAgICAgICAgICAgICBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gZGF0YTJcclxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhM1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRfbWF4X3JhbmtzIChtYXhfcmFua3NfcmVzcG9uc2UpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNUT0RPOiBFbmFibGUgYWZ0ZXIgcmVhbGl6ZSBtYXhfcmFua3MgYXBpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcclxuXHJcbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcclxuICAgICAgICAgICAgI3dwbiA9IGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxyXG4gICAgICAgICAgICAjJChcIiN3aWtpcGVkaWFDb250YWluZXJcIikuaHRtbChpZiB3cG4gdGhlbiB3cG4gZWxzZSBcIk5vIFdpa2lwZWRpYSBhcnRpY2xlXCIpXHJcblxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICBlcnJvcjogKGUpIC0+XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcclxuXHJcblxyXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XHJcbiAgICAkLmFqYXhcclxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5L2FwaS9nb3Zlcm5tZW50L1wiICsgYWx0X3R5cGUgKyAnLycgKyBnb3ZfbmFtZVxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xyXG4gICAgICAgIGVycm9yOiAoZSkgLT5cclxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxyXG5cclxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxyXG4gICAgJC5hamF4XHJcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL19wcm9jL2dldF9maW5hbmNpYWxfc3RhdGVtZW50c1wiXHJcbiAgICAgICAgZGF0YTpcclxuICAgICAgICAgICAgYXBwX25hbWU6IFwiZ292d2lraVwiXHJcbiAgICAgICAgICAgIG9yZGVyOiBcImNhcHRpb25fY2F0ZWdvcnksZGlzcGxheV9vcmRlclwiXHJcbiAgICAgICAgICAgIHBhcmFtczogW1xyXG4gICAgICAgICAgICAgICAgbmFtZTogXCJnb3ZzX2lkXCJcclxuICAgICAgICAgICAgICAgIHBhcmFtX3R5cGU6IFwiSU5cIlxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxyXG4gICAgICAgICAgICBdXHJcblxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xyXG4gICAgICAgIGVycm9yOiAoZSkgLT5cclxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxyXG5cclxuXHJcbmdldF9tYXhfcmFua3MgPSAob25zdWNjZXNzKSAtPlxyXG4gICAgJC5hamF4XHJcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xyXG4gICAgICAgIGRhdGE6XHJcbiAgICAgICAgICAgIGFwcF9uYW1lOiAnZ292d2lraSdcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXHJcbiAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcclxuXHJcbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0gKHJlYyk9PlxyXG4gICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCByZWMpXHJcbiAgICBhY3RpdmF0ZV90YWIoKVxyXG4gICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXHJcbiAgICByb3V0ZXIubmF2aWdhdGUocmVjLl9pZClcclxuXHJcblxyXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZDIgPSAocmVjKT0+XHJcbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxyXG4gICAgICAgIHJlYy5lbGVjdGVkX29mZmljaWFscyA9IGRhdGFcclxuICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcclxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXHJcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcclxuICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcclxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xyXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gdXJsXHJcblxyXG5cclxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCBjb21tYW5kLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cclxuICAgICQuYWpheFxyXG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcclxuICAgICAgICB0eXBlOiAnUE9TVCdcclxuICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXHJcbiAgICAgICAgZGF0YTogY29tbWFuZCAjSlNPTi5zdHJpbmdpZnkoY29tbWFuZClcclxuICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxyXG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlc1xyXG4gICAgICAgICAgICBidWlsZF9zZWxlY3RfZWxlbWVudCBjb250YWluZXIsIHRleHQsIHZhbHVlcy5zb3J0KCksIHdoZXJlX3RvX3N0b3JlX3ZhbHVlXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIGVycm9yOiAoZSkgLT5cclxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxyXG5cclxuXHJcbmJ1aWxkX3NlbGVjdF9lbGVtZW50ID0gKGNvbnRhaW5lciwgdGV4dCwgYXJyLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cclxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcclxuICAgIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyIHdoZW4gdlxyXG4gICAgcyArPSBcIjwvc2VsZWN0PlwiXHJcbiAgICBzZWxlY3QgPSAkKHMpXHJcbiAgICAkKGNvbnRhaW5lcikuYXBwZW5kKHNlbGVjdClcclxuXHJcbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcclxuICAgIGlmIHRleHQgaXMgJ1N0YXRlLi4nXHJcbiAgICAgICAgc2VsZWN0LnZhbCAnQ0EnXHJcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xyXG5cclxuICAgIHNlbGVjdC5jaGFuZ2UgKGUpIC0+XHJcbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxyXG4gICAgICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXHJcbiAgICAgICAgJCgnLmdvdi1jb3VudGVyJykudGV4dCBnb3Zfc2VsZWN0b3IuY291bnRfZ292cygpXHJcblxyXG5hZGp1c3RfdHlwZWFoZWFkX3dpZHRoID0gKCkgLT5cclxuICAgIGlucCA9ICQoJyNteWlucHV0JylcclxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxyXG4gICAgaW5wLndpZHRoIHBhci53aWR0aCgpXHJcblxyXG5cclxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XHJcbiAgICAkKHdpbmRvdykucmVzaXplIC0+XHJcbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXHJcblxyXG5mb2N1c19zZWFyY2hfZmllbGQgPSAobXNlYykgLT5cclxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcclxuXHJcblxyXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcclxud2luZG93Lm9uaGFzaGNoYW5nZSA9IChlKSAtPlxyXG4gICAgaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXHJcbiAgICBpZiBub3QgaFxyXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXHJcblxyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxucm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcigoaXRtKS0+IGlmIGl0bSBpc250IFwiXCIgdGhlbiBpdG0gZWxzZSBmYWxzZSk7XHJcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcclxuXHJcbkdPVldJS0kuaGlzdG9yeSA9IChpbmRleCkgLT5cclxuICAgIGlmIGluZGV4ID09IDBcclxuICAgICAgICBzZWFyY2hDb250YWluZXIgPSAkKCcjc2VhcmNoQ29udGFpbmVyJykudGV4dCgpO1xyXG4gICAgICAgIGlmKHNlYXJjaENvbnRhaW5lciAhPSAnJylcclxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXHJcbiAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXHJcbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLydcclxuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxyXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIGlmIChoaXN0b3J5LnN0YXRlICE9IG51bGwgJiYgaGlzdG9yeS5zdGF0ZS50ZW1wbGF0ZSAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgd2luZG93Lmhpc3RvcnkuZ28oaW5kZXgpO1xyXG4gICAgZWxzZVxyXG4gICAgICAgIHJvdXRlLnBvcCgpXHJcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLycgKyByb3V0ZS5qb2luKCcvJylcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb3BzdGF0ZScsIChldmVudCkgLT5cclxuICAgIGlmIHdpbmRvdy5oaXN0b3J5LnN0YXRlIGlzbnQgbnVsbFxyXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBldmVudC5zdGF0ZS50ZW1wbGF0ZVxyXG4gICAgICAgIHJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5sZW5ndGgtMTtcclxuICAgICAgICBpZiByb3V0ZSBpcyAyIHRoZW4gJCgnI3N0YW50b25JY29uJykuaGlkZSgpXHJcbiAgICAgICAgaWYgcm91dGUgaXMgMSB0aGVuICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcclxuICAgIGVsc2VcclxuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxyXG5cclxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcclxucmVmcmVzaF9kaXNxdXMgPSAobmV3SWRlbnRpZmllciwgbmV3VXJsLCBuZXdUaXRsZSkgLT5cclxuICAgIERJU1FVUy5yZXNldFxyXG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcclxuICAgICAgICBjb25maWc6ICgpIC0+XHJcbiAgICAgICAgICAgIHRoaXMucGFnZS5pZGVudGlmaWVyID0gbmV3SWRlbnRpZmllclxyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXHJcbiAgICAgICAgICAgIHRoaXMucGFnZS50aXRsZSA9IG5ld1RpdGxlXHJcblxyXG5cclxuaW5pdFRhYmxlSGFuZGxlcnMgPSAocGVyc29uKSAtPlxyXG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKVxyXG5cclxuICAgICQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKHtzdHlsZXNoZWV0czogZmFsc2UsdHlwZTogJ3RleHRhcmVhJywgc2hvd2J1dHRvbnM6ICdib3R0b20nLCBkaXNwbGF5OiB0cnVlLCBlbXB0eXRleHQ6ICcgJ30pXHJcbiAgICAkKCcuZWRpdGFibGUnKS5vZmYoJ2NsaWNrJyk7XHJcblxyXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmdseXBoaWNvbi1wZW5jaWwnLCAoZSkgLT5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBpZiBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5ub0VkaXRhYmxlIGlzbnQgdW5kZWZpbmVkIHRoZW4gcmV0dXJuXHJcbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxyXG4gICAgICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9uZXcnLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAocmVzcG9uc2UpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDQwMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiByZXNwb25zZS5zdGF0dXMgaXMgMjAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpLmZpbmQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcclxuICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xyXG5cclxuXHJcbiAgICAkKCdhJykub24gJ3NhdmUnLCAoZSwgcGFyYW1zKSAtPlxyXG4gICAgICAgIGVudGl0eVR5cGUgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGFibGUnKVswXS5kYXRhc2V0LmVudGl0eVR5cGVcclxuICAgICAgICBpZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpWzBdLmRhdGFzZXQuaWRcclxuICAgICAgICBmaWVsZCA9IE9iamVjdC5rZXlzKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpWzBdLmRhdGFzZXQpWzBdXHJcbiAgICAgICAgc2VuZE9iamVjdCA9IHtcclxuICAgICAgICAgICAgZWRpdFJlcXVlc3Q6IHtcclxuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogaWQsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiB7fVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QuY2hhbmdlc1tmaWVsZF0gPSBwYXJhbXMubmV3VmFsdWVcclxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0ID0gSlNPTi5zdHJpbmdpZnkoc2VuZE9iamVjdC5lZGl0UmVxdWVzdCk7XHJcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxyXG4gICAgICAgICQuYWpheCAnL2VkaXRyZXF1ZXN0L2NyZWF0ZScsIHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dC9qc29uJyxcclxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxyXG4gICAgICAgICAgICAgICAgdGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxyXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxyXG4gICAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcclxuICAgICAgICB9XHJcblxyXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmFkZCcsIChlKSAtPlxyXG4gICAgICAgIHRhYlBhbmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVxyXG4gICAgICAgIHRhYmxlVHlwZSA9IHRhYlBhbmVbMF0uaWRcclxuXHJcbiAgICAgICAgY3VycmVudEVudGl0eSA9IG51bGxcclxuICAgICAgICBpZiB0YWJsZVR5cGUgaXMgJ1ZvdGVzJ1xyXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0VsZWN0ZWRPZmZpY2lhbFZvdGUnXHJcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLm1vZGFsKCd0b2dnbGUnKVxyXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdDb250cmlidXRpb25zJ1xyXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0NvbnRyaWJ1dGlvbidcclxuICAgICAgICAgICAgJCgnI2FkZENvbnRyaWJ1dGlvbnMnKS5tb2RhbCgndG9nZ2xlJylcclxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnRW5kb3JzZW1lbnRzJ1xyXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0VuZG9yc2VtZW50J1xyXG4gICAgICAgICAgICAkKCcjYWRkRW5kb3JzZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpXHJcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ1N0YXRlbWVudHMnXHJcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnUHVibGljU3RhdGVtZW50J1xyXG4gICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLm1vZGFsKCd0b2dnbGUnKVxyXG5cclxuICAgICAgICBpZiB0YWJQYW5lLmhhc0NsYXNzKCdsb2FkZWQnKSB0aGVuIHJldHVybiBmYWxzZVxyXG4gICAgICAgIHRhYlBhbmVbMF0uY2xhc3NMaXN0LmFkZCgnbG9hZGVkJylcclxuXHJcbiAgICAgICAgcGVyc29uTWV0YSA9IHtcImNyZWF0ZVJlcXVlc3RcIjp7XCJlbnRpdHlOYW1lXCI6Y3VycmVudEVudGl0eSxcImtub3duRmllbGRzXCI6e1wiZWxlY3RlZE9mZmljaWFsXCI6cGVyc29uLmlkfX19XHJcbiAgICAgICAgJC5hamF4KFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L25ldycsXHJcbiAgICAgICAgICAgIGRhdGE6IHBlcnNvbk1ldGEsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgZW5kT2JqID0ge31cclxuICAgICAgICAgICAgICAgIGRhdGEuY2hvaWNlc1swXS5jaG9pY2VzLmZvckVhY2ggKGl0ZW0sIGluZGV4KSAtPlxyXG4gICAgICAgICAgICAgICAgICBpZHMgPSBPYmplY3Qua2V5cyBpdGVtXHJcbiAgICAgICAgICAgICAgICAgIGlkcy5mb3JFYWNoIChpZCkgLT5cclxuICAgICAgICAgICAgICAgICAgICAgIGVuZE9ialtpZF0gPSBpdGVtW2lkXVxyXG5cclxuICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMgPSAoKSAtPlxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBkYXRhLmNob2ljZXNbMF0ubmFtZSlcclxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIGVuZE9ialxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gZW5kT2JqW2tleV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGVjdCA9IG51bGxcclxuXHJcbiAgICAgICAgICAgICAgICBpZiBjdXJyZW50RW50aXR5IGlzICdFbmRvcnNlbWVudCdcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkRW5kb3JzZW1lbnRzIHNlbGVjdCcpWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdDb250cmlidXRpb24nXHJcblxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdFbGVjdGVkT2ZmaWNpYWxWb3RlJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdCA9ICQoJyNhZGRWb3RlcyBzZWxlY3QnKVswXVxyXG4gICAgICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMoKVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdQdWJsaWNTdGF0ZW1lbnQnXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ID0gJCgnI2FkZFN0YXRlbWVudHMgc2VsZWN0JylbMF1cclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKClcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cclxuICAgICAgICAgICAgICAgIGlmKGVycm9yLnN0YXR1cyA9PSA0MDEpIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxyXG4gICAgICAgICk7XHJcblxyXG5cclxuICAgIHdpbmRvdy5hZGRJdGVtID0gKGUpIC0+XHJcbiAgICAgICAgbmV3UmVjb3JkID0ge31cclxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXHJcbiAgICAgICAgbW9kYWxUeXBlID0gbW9kYWxbMF0uaWRcclxuICAgICAgICBlbnRpdHlUeXBlID0gbW9kYWxbMF0uZGF0YXNldC5lbnRpdHlUeXBlXHJcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XHJcblxyXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XHJcbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cclxuICAgICAgICAgICAgbmV3UmVjb3JkW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXHJcblxyXG4gICAgICAgIGFzc29jaWF0aW9ucyA9IHt9XHJcbiAgICAgICAgYXNzb2NpYXRpb25zW1wiZWxlY3RlZE9mZmljaWFsXCJdID0gcGVyc29uLmlkXHJcblxyXG4gICAgICAgIGlmIG1vZGFsVHlwZSBpcyAnYWRkVm90ZXMnXHJcblxyXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xyXG5cclxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xyXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxyXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcclxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxyXG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXHJcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXHJcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXHJcbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxyXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXHJcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcclxuXHJcblxyXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XHJcbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3Q6IHtcclxuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IHsgZmllbGRzOiBuZXdSZWNvcmQsIGFzc29jaWF0aW9uczogYXNzb2NpYXRpb25zfSxcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAndHInXHJcbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc2VuZE9iamVjdC5jcmVhdGVSZXF1ZXN0LmZpZWxkcy5maWVsZHNcclxuICAgICAgICAgICAgdHIuaW5uZXJIVE1MICs9IFwiPHRkPjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnXHJcbiAgICAgICAgICAgIGNsYXNzPSdlZGl0YWJsZSBlZGl0YWJsZS1wcmUtd3JhcHBlZCBlZGl0YWJsZS1jbGljayc+I3t2YWx1ZX08L2E+PC90ZD5cIlxyXG5cclxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xyXG4gICAgICAgICAgICAkKCcjVm90ZXMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSh0cik7XHJcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZENvbnRyaWJ1dGlvbnMnXHJcbiAgICAgICAgICAgICQoJyNDb250cmlidXRpb25zIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUodHIpO1xyXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXHJcbiAgICAgICAgICAgICQoJyNFbmRvcnNlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSh0cik7XHJcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXHJcbiAgICAgICAgICAgICQoJyNTdGF0ZW1lbnRzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUodHIpO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L2NyZWF0ZScsXHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAnLmVsZWN0ZWRfbGluaycsIChlKSAtPlxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdXJsID0gZS5jdXJyZW50VGFyZ2V0LnBhdGhuYW1lXHJcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxyXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxyXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcclxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcclxuICAgICQoJy5sb2FkZXInKS5zaG93KClcclxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxyXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcclxuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XHJcbiAgICAgICAgaWYgZGF0YVxyXG4gICAgICAgICAgICAkLmFqYXhcclxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHVybCxcclxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uID0gZGF0YVswXVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJ307XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS50b0xvY2FsZVN0cmluZyAnZW4tVVMnLCBmb3JtYXRcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGh0bWx9LCAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnLCB1cmxcclxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluaXRUYWJsZUhhbmRsZXJzKHBlcnNvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxyXG5cclxuICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXHJcblxyXG5cclxuIyBSb3V0ZSAvXHJcbmlmIHJvdXRlVHlwZSBpcyAwXHJcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcclxuICAgIGdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICcvbGVnYWN5L2RhdGEvaF90eXBlc19jYV8yLmpzb24nLCA3XHJcbiAgICBnb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxyXG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXHJcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxyXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXHJcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxyXG4gICAgICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcclxuICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcclxuICAgICAgICB1cmwgPSAnLycgKyBkYXRhLmFsdFR5cGVTbHVnICsgJy8nICsgZGF0YS5zbHVnXHJcbiAgICAgICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cclxuICAgICAgICAgICAgaWYgZGF0YVxyXG4gICAgICAgICAgICAgICAgJC5hamF4XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXHJcbiAgICBpZiAhdW5kZWZcclxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaHRtbCAkKCcjc2VhcmNoLWNvbnRhaW5lci10ZW1wbGF0ZScpLmh0bWwoKVxyXG4gICAgICAgICMgTG9hZCBpbnRyb2R1Y3RvcnkgdGV4dCBmcm9tIHRleHRzL2ludHJvLXRleHQuaHRtbCB0byAjaW50cm8tdGV4dCBjb250YWluZXIuXHJcbiAgICAgICAgJC5nZXQgXCIvbGVnYWN5L3RleHRzL2ludHJvLXRleHQuaHRtbFwiLCAoZGF0YSkgLT4gJChcIiNpbnRyby10ZXh0XCIpLmh0bWwgZGF0YVxyXG4gICAgICAgIGdvdm1hcCA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcclxuICAgICAgICBnZXRfY291bnRpZXMgR09WV0lLSS5kcmF3X3BvbHlnb25zXHJcbiAgICAgICAgdW5kZWYgPSB0cnVlXHJcbiAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxyXG4gICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXHJcbiAgICBzdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcclxuXHJcbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxyXG5cclxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXHJcbiAgICAkKCcjZ292bWFwJykub24gJ2NsaWNrJywgJy5pbmZvLXdpbmRvdy11cmknLCAoZSkgLT5cclxuICAgICAgICB1cmkgPSBlLnRhcmdldC5wYXJlbnROb2RlLmRhdGFzZXQudXJpXHJcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxyXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcclxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxyXG4gICAgICAgICQuYWpheFxyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICAgICAgY2FjaGU6IHRydWVcclxuICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XHJcbiAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcclxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcclxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcclxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXHJcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxyXG4gICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxyXG5cclxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWVcclxuaWYgcm91dGVUeXBlIGlzIDJcclxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBDaXZpYyBQcm9maWxlcydcclxuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXHJcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxyXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxyXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxyXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXHJcbiAgICB0ZW1wbGF0ZXMubG9hZF9mdXNpb25fdGVtcGxhdGUgXCJ0YWJzXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZnVzaW9udGFibGVzL3YyL3F1ZXJ5P3NxbD1TRUxFQ1QlMjAqJTIwRlJPTSUyMDF6Mm9YUUVZUTNwMk9vTUk4VjVnS2dIV0I1VHo5OTBCclExeGMxdFZvJmtleT1BSXphU3lDWERReU1EcEdBMmczUWp1djRDRHY3elJqLWl4NElRSkFcIlxyXG4gICAgJC5hamF4XHJcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xyXG4gICAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XHJcbiAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXHJcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcclxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcclxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxyXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxyXG4gICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcclxuICAgICAgICBlcnJvcjogKGUpIC0+XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcclxuXHJcbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxyXG5cclxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxyXG5pZiByb3V0ZVR5cGUgaXMgM1xyXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnXHJcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxyXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxyXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcclxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcclxuICAgICQoJy5sb2FkZXInKS5zaG93KClcclxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxyXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcclxuICAgICQuYWpheFxyXG4gICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHdpbmRvdy5wYXRoLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcclxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cclxuXHJcbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGFbMF1cclxuXHJcbiAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXHJcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXHJcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcclxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxyXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcclxuICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBmb3JtYXQgPSB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJ307XHJcbiAgICAgICAgICAgIGlmIHBlcnNvbi52b3RlcyAhPSB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cclxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLnRvTG9jYWxlU3RyaW5nICdlbi1VUycsIGZvcm1hdFxyXG5cclxuICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXHJcbiAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxyXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXHJcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXHJcbiAgICAgICAgICAgIGh0bWwgPSBjb21waWxlZFRlbXBsYXRlKHBlcnNvbilcclxuXHJcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXHJcbiAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XHJcblxyXG4gICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xyXG5cclxuICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cclxuICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXHJcbiAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXHJcbiAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXHJcbiAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXHJcbiAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xyXG4gICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xyXG4gICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxyXG5cclxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcclxuICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxyXG5cclxuICAgICAgICBlcnJvcjogKGUpIC0+XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGUiLCJcclxuXHJcblxyXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxyXG4jIFJldHVybnMgYSBmdW5jdGlvbnMgdGhhdCB0YWtlcyAyIHBhcmFtcyBcclxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcclxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXHJcbiMgY2IgcmV0dXJucyBhbiBhcnJheSBvZiBtYXRjaGluZyBkb2N1bWVudHMuXHJcbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XHJcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxyXG4gIChxLCBjYikgLT5cclxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cclxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXHJcbiAgICAgIHJldHVybiB0cnVlXHJcblxyXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxyXG4gICAgbWF0Y2hlcyA9IFtdXHJcbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XHJcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxyXG5cclxuICAgIGZvciBkIGluIGRvY3NcclxuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcclxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXHJcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxyXG5cclxuICAgICAgaWYgdGVzdF9zdHJpbmcoZC5nb3ZfbmFtZSwgcmVncykgXHJcbiAgICAgICAgbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxyXG4gICAgICAjaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcclxuICAgIFxyXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcclxuICAgIGNiIG1hdGNoZXNcclxuICAgIHJldHVyblxyXG4gXHJcblxyXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XHJcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxyXG4gIGZvciBkIGluIGNsb25lc1xyXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXHJcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXHJcbiAgICAjZC5nb3ZfdHlwZT1zdHJvbmdpZnkoZC5nb3ZfdHlwZSwgd29yZHMsIHJlZ3MpXHJcbiAgXHJcbiAgcmV0dXJuIGNsb25lc1xyXG5cclxuXHJcblxyXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXHJcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cclxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cclxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxyXG4gIHJldHVybiBzXHJcblxyXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXHJcbnN0cmlwID0gKHMpIC0+XHJcbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxyXG5cclxuXHJcbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxyXG5mdWxsX3RyaW0gPSAocykgLT5cclxuICBzcz1zLnRyaW0oJycrcylcclxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcclxuXHJcbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xyXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxyXG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcclxuXHJcblxyXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XHJcbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpJylcclxuICBbd29yZHMscmVnc11cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXHJcblxyXG4iLCJcclxuIyMjXHJcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jXHJcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxyXG4jXHJcbiMgVGhlIG1haW4gbWV0aG9kIDogcmVuZGVyKGRhdGEpLCBnZXRfaHRtbChkYXRhKVxyXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIyNcclxuXHJcblxyXG5cclxuIyBMT0FEIEZJRUxEIE5BTUVTXHJcbmZpZWxkTmFtZXMgPSB7fVxyXG5maWVsZE5hbWVzSGVscCA9IHt9XHJcblxyXG5cclxucmVuZGVyX2ZpZWxkX3ZhbHVlID0gKG4sbWFzayxkYXRhKSAtPlxyXG4gIHY9ZGF0YVtuXVxyXG4gIGlmIG5vdCBkYXRhW25dXHJcbiAgICByZXR1cm4gJydcclxuXHJcbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcclxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXHJcbiAgZWxzZVxyXG4gICAgaWYgJycgIT0gbWFza1xyXG4gICAgICBpZiBkYXRhW24rJ19yYW5rJ10gYW5kIGRhdGEubWF4X3JhbmtzIGFuZCBkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXVxyXG4gICAgICAgIHYgPSBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxyXG4gICAgICAgIHJldHVybiBcIiN7dn0gPHNwYW4gY2xhc3M9J3JhbmsnPigje2RhdGFbbisnX3JhbmsnXX0gb2YgI3tkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXX0pPC9zcGFuPlwiXHJcbiAgICAgIGlmIG4gPT0gXCJudW1iZXJfb2ZfZnVsbF90aW1lX2VtcGxveWVlc1wiXHJcbiAgICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KCcwLDAnKVxyXG4gICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcclxuICAgIGVsc2VcclxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmRcclxuICAgICAgbiA9PSBcIm9wZW5fZW5yb2xsbWVudF9zY2hvb2xzXCJcclxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcclxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmRcclxuICAgICAgbiA9PSBcInBhcmVudF90cmlnZ2VyX2VsaWdpYmxlX3NjaG9vbHNcIlxyXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgdi5sZW5ndGggPiAyMVxyXG4gICAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDIxKVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICByZXR1cm4gdlxyXG5cclxuXHJcbnJlbmRlcl9maWVsZF9uYW1lX2hlbHAgPSAoZk5hbWUpIC0+XHJcbiAgI2lmIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxyXG4gICAgcmV0dXJuIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxyXG5cclxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XHJcbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XHJcbiAgICByZXR1cm4gZmllbGROYW1lc1tmTmFtZV1cclxuXHJcbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcclxuICBzID0gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpXHJcbiAgcmV0dXJuIHNcclxuXHJcblxyXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxyXG4gIGlmIFwiX1wiID09IHN1YnN0ciBmTmFtZSwgMCwgMVxyXG4gICAgXCJcIlwiXHJcbiAgICA8ZGl2PlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PC9zcGFuPlxyXG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+Jm5ic3A7PC9zcGFuPlxyXG4gICAgPC9kaXY+XHJcbiAgICBcIlwiXCJcclxuICBlbHNlXHJcbiAgICByZXR1cm4gJycgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXHJcbiAgICBcIlwiXCJcclxuICAgIDxkaXY+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyAgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PGRpdj48L3NwYW4+XHJcbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4je3JlbmRlcl9maWVsZF92YWx1ZShmTmFtZSxkYXRhKX08L3NwYW4+XHJcbiAgICA8L2Rpdj5cclxuICAgIFwiXCJcIlxyXG5cclxucmVuZGVyX3N1YmhlYWRpbmcgPSAoZk5hbWUsIG1hc2ssIG5vdEZpcnN0KS0+XHJcbiAgcyA9ICcnXHJcbiAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmTmFtZVxyXG4gIGlmIG1hc2sgPT0gXCJoZWFkaW5nXCJcclxuICAgIGlmIG5vdEZpcnN0ICE9IDBcclxuICAgICAgcyArPSBcIjxici8+XCJcclxuICAgIHMgKz0gXCI8ZGl2PjxzcGFuIGNsYXNzPSdmLW5hbSc+I3tmTmFtZX08L3NwYW4+PHNwYW4gY2xhc3M9J2YtdmFsJz4gPC9zcGFuPjwvZGl2PlwiXHJcbiAgcmV0dXJuIHNcclxuXHJcbnJlbmRlcl9maWVsZHMgPSAoZmllbGRzLGRhdGEsdGVtcGxhdGUpLT5cclxuICBoID0gJydcclxuICBmb3IgZmllbGQsaSBpbiBmaWVsZHNcclxuICAgIGlmICh0eXBlb2YgZmllbGQgaXMgXCJvYmplY3RcIilcclxuICAgICAgaWYgZmllbGQubWFzayA9PSBcImhlYWRpbmdcIlxyXG4gICAgICAgIGggKz0gcmVuZGVyX3N1YmhlYWRpbmcoZmllbGQubmFtZSwgZmllbGQubWFzaywgaSlcclxuICAgICAgICBmVmFsdWUgPSAnJ1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGRhdGFcclxuICAgICAgICBpZiAoJycgIT0gZlZhbHVlIGFuZCBmVmFsdWUgIT0gJzAnKVxyXG4gICAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZC5uYW1lXHJcbiAgICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZpZWxkLm5hbWVcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBmVmFsdWUgPSAnJ1xyXG5cclxuICAgIGVsc2VcclxuICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLCAnJywgZGF0YVxyXG4gICAgICBpZiAoJycgIT0gZlZhbHVlKVxyXG4gICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGRcclxuICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZOYW1lXHJcbiAgICBpZiAoJycgIT0gZlZhbHVlKVxyXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZOYW1lLCB2YWx1ZTogZlZhbHVlLCBoZWxwOiBmTmFtZUhlbHApXHJcbiAgcmV0dXJuIGhcclxuXHJcbnJlbmRlcl9maW5hbmNpYWxfZmllbGRzID0gKGRhdGEsdGVtcGxhdGUpLT5cclxuICBoID0gJydcclxuICBtYXNrID0gJzAsMCdcclxuICBjYXRlZ29yeSA9ICcnXHJcbiAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcclxuICBmb3IgZmllbGQgaW4gZGF0YVxyXG4gICAgaWYgY2F0ZWdvcnkgIT0gZmllbGQuY2F0ZWdvcnlfbmFtZVxyXG4gICAgICBjYXRlZ29yeSA9IGZpZWxkLmNhdGVnb3J5X25hbWVcclxuICAgICAgaWYgY2F0ZWdvcnkgPT0gJ092ZXJ2aWV3J1xyXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXHJcbiAgICAgIGVsc2UgaWYgY2F0ZWdvcnkgPT0gJ1JldmVudWVzJ1xyXG4gICAgICAgIGggKz0gJzwvYnI+J1xyXG4gICAgICAgIGggKz0gXCI8Yj5cIiArIHRlbXBsYXRlKG5hbWU6IGNhdGVnb3J5LCBnZW5mdW5kOiBcIkdlbmVyYWwgRnVuZFwiLCBvdGhlcmZ1bmRzOiBcIk90aGVyIEZ1bmRzXCIsIHRvdGFsZnVuZHM6IFwiVG90YWwgR292LiBGdW5kc1wiKSArIFwiPC9iPlwiXHJcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaCArPSAnPC9icj4nXHJcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcclxuICAgICAgICBpc19maXJzdF9yb3cgPSB0cnVlXHJcblxyXG4gICAgaWYgZmllbGQuY2FwdGlvbiA9PSAnR2VuZXJhbCBGdW5kIEJhbGFuY2UnIG9yIGZpZWxkLmNhcHRpb24gPT0gJ0xvbmcgVGVybSBEZWJ0J1xyXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxyXG4gICAgZWxzZSBpZiBmaWVsZC5jYXB0aW9uIGluIFsnVG90YWwgUmV2ZW51ZXMnLCAnVG90YWwgRXhwZW5kaXR1cmVzJywgJ1N1cnBsdXMgLyAoRGVmaWNpdCknXSBvciBpc19maXJzdF9yb3dcclxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxyXG4gICAgICBpc19maXJzdF9yb3cgPSBmYWxzZVxyXG4gICAgZWxzZVxyXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2spLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaykpXHJcbiAgcmV0dXJuIGhcclxuXHJcbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvW1xcc1xcK1xcLV0vZywgJ18nKVxyXG5cclxudG9UaXRsZUNhc2UgPSAoc3RyKSAtPlxyXG4gIHN0ci5yZXBsYWNlIC9cXHdcXFMqL2csICh0eHQpIC0+XHJcbiAgICB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKClcclxuXHJcbmN1cnJlbmN5ID0gKG4sIG1hc2ssIHNpZ24gPSAnJykgLT5cclxuICAgIG4gPSBudW1lcmFsKG4pXHJcbiAgICBpZiBuIDwgMFxyXG4gICAgICAgIHMgPSBuLmZvcm1hdChtYXNrKS50b1N0cmluZygpXHJcbiAgICAgICAgcyA9IHMucmVwbGFjZSgvLS9nLCAnJylcclxuICAgICAgICByZXR1cm4gXCIoI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrcysnPC9zcGFuPid9KVwiXHJcblxyXG4gICAgbiA9IG4uZm9ybWF0KG1hc2spXHJcbiAgICByZXR1cm4gXCIje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytuKyc8L3NwYW4+J31cIlxyXG5cclxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEsIHRhYnNldCwgcGFyZW50KSAtPlxyXG4gICNsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxyXG4gIGxheW91dCA9IGluaXRpYWxfbGF5b3V0XHJcbiAgdGVtcGxhdGVzID0gcGFyZW50LnRlbXBsYXRlc1xyXG4gIHBsb3RfaGFuZGxlcyA9IHt9XHJcblxyXG4gIGxheW91dF9kYXRhID1cclxuICAgIHRpdGxlOiBkYXRhLm5hbWVcclxuICAgIHdpa2lwZWRpYV9wYWdlX2V4aXN0czogZGF0YS53aWtpcGVkaWFfcGFnZV9leGlzdHNcclxuICAgIHdpa2lwZWRpYV9wYWdlX25hbWU6ICBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcclxuICAgIHRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lOiBkYXRhLnRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lXHJcbiAgICBsYXRlc3RfYXVkaXRfdXJsOiBkYXRhLmxhdGVzdF9hdWRpdF91cmxcclxuICAgIHRhYnM6IFtdXHJcbiAgICB0YWJjb250ZW50OiAnJ1xyXG5cclxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XHJcbiAgICBsYXlvdXRfZGF0YS50YWJzLnB1c2hcclxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcclxuICAgICAgdGFibmFtZTogdGFiLm5hbWUsXHJcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXHJcblxyXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcclxuICAgIGRldGFpbF9kYXRhID1cclxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcclxuICAgICAgdGFibmFtZTogdGFiLm5hbWUsXHJcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXHJcbiAgICAgIHRhYmNvbnRlbnQ6ICcnXHJcbiAgICBzd2l0Y2ggdGFiLm5hbWVcclxuICAgICAgd2hlbiAnT3ZlcnZpZXcgKyBFbGVjdGVkIE9mZmljaWFscydcclxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cclxuICAgICAgICBjb25zb2xlLmxvZyBkYXRhXHJcbiAgICAgICAgZm9yIG9mZmljaWFsLGkgaW4gZGF0YS5lbGVjdGVkX29mZmljaWFsc1xyXG4gICAgICAgICAgb2ZmaWNpYWxfZGF0YSA9XHJcbiAgICAgICAgICAgIHRpdGxlOiBpZiAnJyAhPSBvZmZpY2lhbC50aXRsZSB0aGVuIFwiVGl0bGU6IFwiICsgb2ZmaWNpYWwudGl0bGVcclxuICAgICAgICAgICAgbmFtZTogaWYgJycgIT0gb2ZmaWNpYWwuZnVsbF9uYW1lIHRoZW4gXCJOYW1lOiBcIiArIG9mZmljaWFsLmZ1bGxfbmFtZVxyXG4gICAgICAgICAgICBlbWFpbDogaWYgb2ZmaWNpYWwuZW1haWxfYWRkcmVzcyB0aGVuIFwiRW1haWw6IFwiICsgb2ZmaWNpYWwuZW1haWxfYWRkcmVzc1xyXG4gICAgICAgICAgICB0ZWxlcGhvbmVudW1iZXI6IGlmIG51bGwgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciBhbmQgdW5kZWZpbmVkICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgdGhlbiBcIlRlbGVwaG9uZSBOdW1iZXI6IFwiICsgb2ZmaWNpYWwudGVsZXBob25lX251bWJlclxyXG4gICAgICAgICAgICB0ZXJtZXhwaXJlczogaWYgb2ZmaWNpYWwudGVybV9leHBpcmVzIHRoZW4gXCJUZXJtIEV4cGlyZXM6IFwiICsgb2ZmaWNpYWwudGVybV9leHBpcmVzIGVsc2UgXCJUZXJtIEV4cGlyZXM6IFwiXHJcbiAgICAgICAgICAgIGFsdFR5cGVTbHVnOiBkYXRhLmFsdF90eXBlX3NsdWdcclxuICAgICAgICAgICAgbmFtZVNsdWc6IGRhdGEuc2x1Z1xyXG4gICAgICAgICAgICBzbHVnOiBvZmZpY2lhbC5zbHVnXHJcblxyXG4gICAgICAgICAgaWYgJycgIT0gb2ZmaWNpYWwucGhvdG9fdXJsIGFuZCBvZmZpY2lhbC5waG90b191cmwgIT0gdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJzxpbWcgc3JjPVwiJytvZmZpY2lhbC5waG90b191cmwrJ1wiIGNsYXNzPVwicG9ydHJhaXRcIiBhbHQ9XCJcIiAvPidcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnJ1xyXG5cclxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnXShvZmZpY2lhbF9kYXRhKVxyXG4gICAgICB3aGVuICdFbXBsb3llZSBDb21wZW5zYXRpb24nXHJcbiAgICAgICAgaCA9ICcnXHJcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXHJcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1lbXBsb3llZS1jb21wLXRlbXBsYXRlJ10oY29udGVudDogaClcclxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddXHJcbiAgICAgICAgICBncmFwaCA9IHRydWVcclxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXSA9PSAwXHJcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcclxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ10gPT0gMFxyXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXHJcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXHJcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcclxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddID09IDBcclxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxyXG4gICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzQwXHJcbiAgICAgICAgICBiaWdDaGFydFdpZHRoID0gNDcwXHJcblxyXG4gICAgICAgICAgaWYgJCh3aW5kb3cpLndpZHRoKCkgPCA0OTBcclxuICAgICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzAwXHJcbiAgICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSAzMDBcclxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXHJcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIENvbXBlbnNhdGlvbidcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdCZW5zLidcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJ1xcbiBFbXBsb3llZXMnXHJcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXVxyXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICdBbGwgXFxuJyArIHRvVGl0bGVDYXNlIGRhdGEubmFtZSArICcgXFxuIFJlc2lkZW50cydcclxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ11cclxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ11cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcclxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcclxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAyKTtcclxuICAgICAgICAgICAgICBvcHRpb25zID1cclxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBDb21wZW5zYXRpb24gLSBGdWxsIFRpbWUgV29ya2VyczogXFxuIEdvdmVybm1lbnQgdnMuIFByaXZhdGUgU2VjdG9yJ1xyXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcclxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxyXG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxyXG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXHJcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXHJcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXHJcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxyXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tY29tcC1ncmFwaCdcclxuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXHJcbiAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICksIDEwMDBcclxuICAgICAgICAgIGlmIGdyYXBoXHJcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXHJcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ10gPSdtZWRpYW4tY29tcC1ncmFwaCdcclxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddXHJcbiAgICAgICAgICBncmFwaCA9IHRydWVcclxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZSddID09IDBcclxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxyXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cclxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XHJcbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gUGVuc2lvbidcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgJ1BlbnNpb24gZm9yIFxcbiBSZXRpcmVlIHcvIDMwIFllYXJzJ1xyXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fcGVuc2lvbjMwX3llYXJfcmV0aXJlZSddXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXHJcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XHJcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XHJcbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgUGVuc2lvbidcclxuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XHJcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcclxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcclxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxyXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxyXG4gICAgICAgICAgICAgICAgJ2Jhcic6IHtcclxuICAgICAgICAgICAgICAgICAnZ3JvdXBXaWR0aCc6ICczMCUnXHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xyXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cclxuICAgICAgICAgICAgICBpZiBncmFwaFxyXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xyXG4gICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICApLCAxMDAwXHJcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxyXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddID0nbWVkaWFuLXBlbnNpb24tZ3JhcGgnXHJcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBIZWFsdGgnXHJcbiAgICAgICAgaCA9ICcnXHJcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXHJcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJ10oY29udGVudDogaClcclxuICAgICAgICAjcHVibGljIHNhZmV0eSBwaWVcclxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXHJcbiAgICAgICAgICBncmFwaCA9IHRydWVcclxuICAgICAgICAgIGlmIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXSA9PSAwXHJcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcclxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXHJcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUHVibGljIFNhZmV0eSBFeHBlbnNlJ1xyXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xyXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAnUHVibGljIFNhZmV0eSBFeHAnXHJcbiAgICAgICAgICAgICAgICAgIDEgLSBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgJ090aGVyJ1xyXG4gICAgICAgICAgICAgICAgICBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XHJcbiAgICAgICAgICAgICAgICAndGl0bGUnOidQdWJsaWMgc2FmZXR5IGV4cGVuc2UnXHJcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxyXG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXHJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XHJcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XHJcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXHJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcclxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcclxuICAgICAgICAgICAgICAgICdpczNEJyA6ICd0cnVlJ1xyXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cclxuICAgICAgICAgICAgICAgICdzbGljZXMnOiB7IDE6IHtvZmZzZXQ6IDAuMn19XHJcbiAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDQ1XHJcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3B1YmxpYy1zYWZldHktcGllJ1xyXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcclxuICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgKSwgMTAwMFxyXG4gICAgICAgICAgaWYgZ3JhcGhcclxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcclxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSA9J3B1YmxpYy1zYWZldHktcGllJ1xyXG4gICAgICAgICNmaW4taGVhbHRoLXJldmVudWUgZ3JhcGhcclxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xyXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXHJcbiAgICAgICAgICAjY29uc29sZS5sb2cgJyMjI2FsJytKU09OLnN0cmluZ2lmeSBkYXRhXHJcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXSA9PSAwXHJcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcclxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXHJcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdSZXYuJ1xyXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAnVG90YWwgUmV2ZW51ZSBcXG4gUGVyIENhcGl0YSdcclxuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ11cclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gUmV2ZW51ZSBQZXIgXFxuIENhcGl0YSBGb3IgQWxsIENpdGllcydcclxuICAgICAgICAgICAgICAgICAgNDIwXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxyXG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZSdcclxuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XHJcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcclxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcclxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxyXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxyXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xyXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cclxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcclxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xyXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcclxuICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgKSwgMTAwMFxyXG4gICAgICAgICAgaWYgZ3JhcGhcclxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddID0nZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xyXG4gICAgICAgICNmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaFxyXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcclxuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxyXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXSA9PSAwXHJcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcclxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXHJcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcclxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdFeHAuJ1xyXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAnVG90YWwgRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhJ1xyXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSBcXG4gRm9yIEFsbCBDaXRpZXMnXHJcbiAgICAgICAgICAgICAgICAgIDQyMFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICBvcHRpb25zID1cclxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcclxuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XHJcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcclxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcclxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxyXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxyXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xyXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cclxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcclxuICAgICAgICAgICAgICBpZiBncmFwaFxyXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xyXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xyXG4gICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICApLCAxMDAwXHJcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxyXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddID0nZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXHJcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xyXG4gICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcclxuICAgICAgICAgIGggPSAnJ1xyXG4gICAgICAgICAgI2ggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxyXG4gICAgICAgICAgaCArPSByZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnXVxyXG4gICAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXHJcbiAgICAgICAgICAjdGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlXHJcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddXHJcbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxyXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxyXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcclxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xyXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXHJcblxyXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJSZXZlbnVlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgUmV2ZW51ZXNcIilcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgciA9IFtcclxuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxyXG5cclxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XHJcbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWVzJ1xyXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxyXG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcclxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxyXG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXHJcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcclxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxyXG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcclxuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcclxuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXHJcbiAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcclxuICAgICAgICAgICAgICAgIGlmIGdyYXBoXHJcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1yZXZlbnVlLXBpZSdcclxuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgKSwgMTAwMFxyXG4gICAgICAgICAgaWYgZ3JhcGhcclxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcclxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXSA9J3RvdGFsLXJldmVudWUtcGllJ1xyXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddXHJcbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxyXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXHJcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxyXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxyXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcclxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xyXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXHJcblxyXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXHJcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJFeHBlbmRpdHVyZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIEV4cGVuZGl0dXJlc1wiKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICByID0gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXHJcblxyXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cclxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xyXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxyXG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcclxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxyXG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcclxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXHJcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcclxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxyXG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcclxuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcclxuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXHJcbiAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcclxuICAgICAgICAgICAgICAgIGlmIGdyYXBoXHJcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xyXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICApLCAxMDAwXHJcbiAgICAgICAgICBpZiBncmFwaFxyXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxyXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ10gPSd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXHJcblxyXG4gICAgbGF5b3V0X2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC10ZW1wbGF0ZSddKGRldGFpbF9kYXRhKVxyXG4gIHJldHVybiB0ZW1wbGF0ZXNbJ3RhYnBhbmVsLXRlbXBsYXRlJ10obGF5b3V0X2RhdGEpXHJcblxyXG5cclxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XHJcbiAgZiA9IHt9XHJcbiAgZm9yIHQgaW4gbGFcclxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xyXG4gICAgICBmW2ZpZWxkXSA9IDFcclxuICByZXR1cm4gZlxyXG5cclxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cclxuICBmID0ge31cclxuICBmb3IgZmllbGRfbmFtZSBvZiByXHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxyXG4gIHJldHVybiBmXHJcblxyXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxyXG4gIGxheW91dF9maWVsZHMgPSBnZXRfbGF5b3V0X2ZpZWxkcyBsYVxyXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cclxuICB1bm1lbnRpb25lZF9maWVsZHMucHVzaChmKSBmb3IgZiBvZiByZWNvcmRfZmllbGRzIHdoZW4gbm90IGxheW91dF9maWVsZHNbZl1cclxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXHJcblxyXG5cclxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxyXG4gICNjbG9uZSB0aGUgbGF5b3V0XHJcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcclxuICB0ID1cclxuICAgIG5hbWU6IFwiT3RoZXJcIlxyXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcclxuXHJcbiAgbC5wdXNoIHRcclxuICByZXR1cm4gbFxyXG5cclxuXHJcbiMgY29udmVydHMgdGFiIHRlbXBsYXRlIGRlc2NyaWJlZCBpbiBnb29nbGUgZnVzaW9uIHRhYmxlIHRvXHJcbiMgdGFiIHRlbXBsYXRlXHJcbmNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlPSh0ZW1wbCkgLT5cclxuICB0YWJfaGFzaD17fVxyXG4gIHRhYnM9W11cclxuICAjIHJldHVybnMgaGFzaCBvZiBmaWVsZCBuYW1lcyBhbmQgdGhlaXIgcG9zaXRpb25zIGluIGFycmF5IG9mIGZpZWxkIG5hbWVzXHJcbiAgZ2V0X2NvbF9oYXNoID0gKGNvbHVtbnMpIC0+XHJcbiAgICBjb2xfaGFzaCA9e31cclxuICAgIGNvbF9oYXNoW2NvbF9uYW1lXT1pIGZvciBjb2xfbmFtZSxpIGluIHRlbXBsLmNvbHVtbnNcclxuICAgIHJldHVybiBjb2xfaGFzaFxyXG5cclxuICAjIHJldHVybnMgZmllbGQgdmFsdWUgYnkgaXRzIG5hbWUsIGFycmF5IG9mIGZpZWxkcywgYW5kIGhhc2ggb2YgZmllbGRzXHJcbiAgdmFsID0gKGZpZWxkX25hbWUsIGZpZWxkcywgY29sX2hhc2gpIC0+XHJcbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXHJcblxyXG4gICMgY29udmVydHMgaGFzaCB0byBhbiBhcnJheSB0ZW1wbGF0ZVxyXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxyXG4gICAgYSA9IFtdXHJcbiAgICBmb3IgayBvZiBoYXNoXHJcbiAgICAgIHRhYiA9IHt9XHJcbiAgICAgIHRhYi5uYW1lPWtcclxuICAgICAgdGFiLmZpZWxkcz1oYXNoW2tdXHJcbiAgICAgIGEucHVzaCB0YWJcclxuICAgIHJldHVybiBhXHJcblxyXG5cclxuICBjb2xfaGFzaCA9IGdldF9jb2xfaGFzaCh0ZW1wbC5jb2xfaGFzaClcclxuICBwbGFjZWhvbGRlcl9jb3VudCA9IDBcclxuXHJcbiAgZm9yIHJvdyxpIGluIHRlbXBsLnJvd3NcclxuICAgIGNhdGVnb3J5ID0gdmFsICdnZW5lcmFsX2NhdGVnb3J5Jywgcm93LCBjb2xfaGFzaFxyXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXHJcbiAgICBmaWVsZG5hbWUgPSB2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXHJcbiAgICBpZiBub3QgZmllbGRuYW1lIHRoZW4gZmllbGRuYW1lID0gXCJfXCIgKyBTdHJpbmcgKytwbGFjZWhvbGRlcl9jb3VudFxyXG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxyXG4gICAgZmllbGROYW1lc0hlbHBbZmllbGRuYW1lXSA9IHZhbCAnaGVscF90ZXh0Jywgcm93LCBjb2xfaGFzaFxyXG4gICAgaWYgY2F0ZWdvcnlcclxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxyXG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0ucHVzaCBuOiB2YWwoJ24nLCByb3csIGNvbF9oYXNoKSwgbmFtZTogZmllbGRuYW1lLCBtYXNrOiB2YWwoJ21hc2snLCByb3csIGNvbF9oYXNoKVxyXG5cclxuICBjYXRlZ29yaWVzID0gT2JqZWN0LmtleXModGFiX2hhc2gpXHJcbiAgY2F0ZWdvcmllc19zb3J0ID0ge31cclxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc1xyXG4gICAgaWYgbm90IGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV1cclxuICAgICAgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5XVswXS5uXHJcbiAgICBmaWVsZHMgPSBbXVxyXG4gICAgZm9yIG9iaiBpbiB0YWJfaGFzaFtjYXRlZ29yeV1cclxuICAgICAgZmllbGRzLnB1c2ggb2JqXHJcbiAgICBmaWVsZHMuc29ydCAoYSxiKSAtPlxyXG4gICAgICByZXR1cm4gYS5uIC0gYi5uXHJcbiAgICB0YWJfaGFzaFtjYXRlZ29yeV0gPSBmaWVsZHNcclxuXHJcbiAgY2F0ZWdvcmllc19hcnJheSA9IFtdXHJcbiAgZm9yIGNhdGVnb3J5LCBuIG9mIGNhdGVnb3JpZXNfc29ydFxyXG4gICAgY2F0ZWdvcmllc19hcnJheS5wdXNoIGNhdGVnb3J5OiBjYXRlZ29yeSwgbjogblxyXG4gIGNhdGVnb3JpZXNfYXJyYXkuc29ydCAoYSxiKSAtPlxyXG4gICAgcmV0dXJuIGEubiAtIGIublxyXG5cclxuICB0YWJfbmV3aGFzaCA9IHt9XHJcbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNfYXJyYXlcclxuICAgIHRhYl9uZXdoYXNoW2NhdGVnb3J5LmNhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5LmNhdGVnb3J5XVxyXG5cclxuICB0YWJzID0gaGFzaF90b19hcnJheSh0YWJfbmV3aGFzaClcclxuICByZXR1cm4gdGFic1xyXG5cclxuXHJcbmNsYXNzIFRlbXBsYXRlczJcclxuXHJcbiAgQGxpc3QgPSB1bmRlZmluZWRcclxuICBAdGVtcGxhdGVzID0gdW5kZWZpbmVkXHJcbiAgQGRhdGEgPSB1bmRlZmluZWRcclxuICBAZXZlbnRzID0gdW5kZWZpbmVkXHJcblxyXG4gIGNvbnN0cnVjdG9yOigpIC0+XHJcbiAgICBAbGlzdCA9IFtdXHJcbiAgICBAZXZlbnRzID0ge31cclxuICAgIHRlbXBsYXRlTGlzdCA9IFsndGFicGFuZWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJywgJ3BlcnNvbi1pbmZvLXRlbXBsYXRlJ11cclxuICAgIHRlbXBsYXRlUGFydGlhbHMgPSBbJ3RhYi10ZW1wbGF0ZSddXHJcbiAgICBAdGVtcGxhdGVzID0ge31cclxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlTGlzdFxyXG4gICAgICBAdGVtcGxhdGVzW3RlbXBsYXRlXSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXHJcbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZVBhcnRpYWxzXHJcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHRlbXBsYXRlLCAkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXHJcblxyXG4gIGFkZF90ZW1wbGF0ZTogKGxheW91dF9uYW1lLCBsYXlvdXRfanNvbikgLT5cclxuICAgIEBsaXN0LnB1c2hcclxuICAgICAgcGFyZW50OnRoaXNcclxuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxyXG4gICAgICByZW5kZXI6KGRhdCkgLT5cclxuICAgICAgICBAcGFyZW50LmRhdGEgPSBkYXRcclxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0LCB0aGlzLCBAcGFyZW50KVxyXG4gICAgICBiaW5kOiAodHBsX25hbWUsIGNhbGxiYWNrKSAtPlxyXG4gICAgICAgIGlmIG5vdCBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cclxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXSA9IFtjYWxsYmFja11cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0ucHVzaCBjYWxsYmFja1xyXG4gICAgICBhY3RpdmF0ZTogKHRwbF9uYW1lKSAtPlxyXG4gICAgICAgIGlmIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxyXG4gICAgICAgICAgZm9yIGUsaSBpbiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cclxuICAgICAgICAgICAgZSB0cGxfbmFtZSwgQHBhcmVudC5kYXRhXHJcblxyXG4gIGxvYWRfdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cclxuICAgICQuYWpheFxyXG4gICAgICB1cmw6IHVybFxyXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXHJcbiAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxyXG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcclxuXHJcbiAgbG9hZF9mdXNpb25fdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cclxuICAgICQuYWpheFxyXG4gICAgICB1cmw6IHVybFxyXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXHJcbiAgICAgIGNhY2hlOiB0cnVlXHJcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxyXG4gICAgICAgIHQgPSBjb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZSB0ZW1wbGF0ZV9qc29uXHJcbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxyXG5cclxuXHJcbiAgZ2V0X25hbWVzOiAtPlxyXG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcclxuXHJcbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxyXG4gICAgZm9yIHQsaSBpbiBAbGlzdFxyXG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZSB0aGVuIGlcclxuICAgIHJldHVybiAtMVxyXG5cclxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cclxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXHJcblxyXG4gICAgaWYgQGxpc3RbaW5kXVxyXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIFwiXCJcclxuXHJcbiAgYWN0aXZhdGU6IChpbmQsIHRwbF9uYW1lKSAtPlxyXG4gICAgaWYgQGxpc3RbaW5kXVxyXG4gICAgICBAbGlzdFtpbmRdLmFjdGl2YXRlIHRwbF9uYW1lXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcclxuIiwiJCAtPlxyXG4gICMkKCcjZ2V0V2lraXBlZGlhQXJ0aWNsZUJ1dHRvbicpLm9uICdjbGljaycsIC0+XHJcbiAgIyAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcclxuICAjYWxlcnRhbGVydCBcImhpXCJcclxuICAjYWxlcnQgJChcIiN3aWtpcGVkaWFQYWdlTmFtZVwiKS50ZXh0KClcclxuICAjZ2V0X3dpa2lwZWRpYV9hcnRpY2xlKClcclxuICB3aW5kb3cuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlID0gZ2V0X3dpa2lwZWRpYV9hcnRpY2xlXHJcbiAgd2luZG93LmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZSA9IGNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZVxyXG5cclxuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlPShzKS0+XHJcbiAgYXJ0aWNsZV9uYW1lID0gcy5yZXBsYWNlIC8uKlxcLyhbXi9dKikkLywgXCIkMVwiXHJcbiAgJC5nZXRKU09OIFwiaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1wYXJzZSZwYWdlPSN7YXJ0aWNsZV9uYW1lfSZwcm9wPXRleHQmZm9ybWF0PWpzb24mY2FsbGJhY2s9P1wiLCAoanNvbikgLT4gXHJcbiAgICAkKCcjd2lraXBlZGlhVGl0bGUnKS5odG1sIGpzb24ucGFyc2UudGl0bGVcclxuICAgICQoJyN3aWtpcGVkaWFBcnRpY2xlJykuaHRtbCBqc29uLnBhcnNlLnRleHRbXCIqXCJdXHJcbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImE6bm90KC5yZWZlcmVuY2VzIGEpXCIpLmF0dHIgXCJocmVmXCIsIC0+ICBcImh0dHA6Ly93d3cud2lraXBlZGlhLm9yZ1wiICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKVxyXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhXCIpLmF0dHIgXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIlxyXG4gIFxyXG5jcmVhdGVfd2lraXBlZGlhX2FydGljbGU9IC0+XHJcbiAgYWxlcnQgXCJOb3QgaW1wbGVtZW50ZWRcIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGdldF93aWtpcGVkaWFfYXJ0aWNsZTpnZXRfd2lraXBlZGlhX2FydGljbGVcclxuIl19

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
  },
  markerClusterer: function(map) {
    var options;
    options = {
      gridSize: 0
    };
    return new MarkerClusterer(map, [], options);
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
  hard_params = ['City', 'School District', 'Special District', 'County'];
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
    url: "/api/government/get-markers-data",
    data: {
      altTypes: legendType,
      limit: 5000
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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, authorized, build_select_element, build_selector, categories, draw_polygons, focus_search_field, get_counties, get_elected_officials, get_financial_statements, get_max_ranks, get_record2, gov_selector, govmap, initTableHandlers, refresh_disqus, route, routeType, showCreateRequests, sortTable, start_adjusting_typeahead_width, templates, undef, user, wikipedia;

GovSelector = require('./govselector.coffee');

Templates2 = require('./templates2.coffee');

wikipedia = require('./wikipedia.coffee');

govmap = null;

gov_selector = null;

templates = new Templates2;

active_tab = "";

undef = null;

authorized = false;

user = Object.create(null, {});

categories = Object.create(null, {});

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
  console.log(window.history.state);
  if (window.history.state !== null) {
    $('#details').html(event.state.template);
    route = document.location.pathname.split('/').length - 1;
    if (route === 2) {
      $('#stantonIcon').hide();
    }
    if (route === 1) {
      $('#searchContainer').show();
    }
    return GOVWIKI.show_data_page();
  } else {
    return GOVWIKI.show_search_page();
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

sortTable = function(table, colNum) {
  var column, lastRow, makeSort, rows, sortFunction;
  rows = $(table + ' tbody  [data-id]').get();
  lastRow = $(table + ' tbody  tr:last').get();
  column = $(table + ' tbody tr:first').children('th').eq(colNum);
  makeSort = true;
  if (column.hasClass('desc')) {
    column.removeClass('desc').addClass('origin');
    column.find('i').removeClass('icon__bottom').removeClass('icon__top');
    rows = column.data('origin');
    makeSort = false;
  } else if (column.hasClass('asc')) {
    column.removeClass('asc').addClass('desc');
    column.find('i').removeClass('icon__bottom').addClass('icon__top');
    sortFunction = function(a, b) {
      var A, B;
      A = $(a).children('td').eq(colNum).text().toUpperCase().trim();
      B = $(b).children('td').eq(colNum).text().toUpperCase().trim();
      if (A < B) {
        return 1;
      }
      if (A > B) {
        return -1;
      }
      return 0;
    };
  } else if (column.hasClass('origin')) {
    column.removeClass('origin').addClass('asc');
    column.find('i').addClass('icon__bottom');
    sortFunction = function(a, b) {
      var A, B;
      A = $(a).children('td').eq(colNum).text().toUpperCase().trim();
      B = $(b).children('td').eq(colNum).text().toUpperCase().trim();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }
      return 0;
    };
  } else {
    column.addClass('asc');
    column.data('origin', rows.slice(0));
    column.find('i').addClass('icon__bottom');
    sortFunction = function(a, b) {
      var A, B;
      A = $(a).children('td').eq(colNum).text().toUpperCase().trim();
      B = $(b).children('td').eq(colNum).text().toUpperCase().trim();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }
      return 0;
    };
  }
  if (makeSort) {
    rows.sort(sortFunction);
  }
  $.each(rows, function(index, row) {
    return $(table).children('tbody').append(row);
  });
  return $(table).children('tbody').append(lastRow);
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
      showModal('/login');
      window.sessionStorage.setItem('tableType', $(e.target).closest('.tab-pane')[0].id);
      window.sessionStorage.setItem('dataId', $(e.currentTarget).closest('tr').attr('data-id'));
      return window.sessionStorage.setItem('field', Number(($(e.currentTarget).closest('td'))[0].cellIndex) + 1);
    } else {
      return $(e.currentTarget).closest('td').find('.editable').editable('toggle');
    }
  });
  $('.sort').on('click', function(e) {
    var type;
    e.preventDefault();
    e.stopPropagation();
    type = $(this).attr('data-sort-type');
    if (type === 'year') {
      return sortTable('[data-entity-type="Contribution"]', 0);
    } else if (type === 'name') {
      return sortTable('[data-entity-type="Contribution"]', 1);
    } else if (type === 'amount') {
      return sortTable('[data-entity-type="Contribution"]', 3);
    } else if (type === 'contributor-type') {
      return sortTable('[data-entity-type="Contribution"]', 4);
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
    if (!authorized) {
      showModal('/login');
      window.sessionStorage.setItem('tableType', tableType);
      return false;
    }
    currentEntity = null;
    console.log(tableType);
    if (tableType === 'Votes') {
      currentEntity = 'Legislation';
      $('#addVotes').modal('toggle').find('form')[0].reset();
    } else if (tableType === 'Contributions') {
      currentEntity = 'Contribution';
      $('#addContributions').modal('toggle').find('form')[0].reset();
    } else if (tableType === 'Endorsements') {
      currentEntity = 'Endorsement';
      $('#addEndorsements').modal('toggle').find('form')[0].reset();
    } else if (tableType === 'Statements') {
      currentEntity = 'PublicStatement';
      $('#addStatements').modal('toggle').find('form')[0].reset();

      /*
        Set get url callback.
       */
      $('.url-input').on('keyup', function() {
        var match_url;
        match_url = /\b(https?):\/\/([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/i;
        if (match_url.test($(this).val())) {
          return $.ajax('/api/url/extract', {
            method: 'GET',
            data: {
              url: $(this).val().match(match_url)[0]
            },
            success: function(response) {
              var urlContent;
              console.log(response);
              urlContent = $('#url-statement');
              urlContent.find('.url-content-title').text('');
              urlContent.find('.url-content-body').text('');
              urlContent.find('.url-content-img').attr('src', '');
              urlContent.find('.url-content-title').text(response.data.title);
              if (response.type === 'html') {
                urlContent.find('.url-content-body').text(response.data.body);
              }
              if (response.type === 'youtube') {
                urlContent.find('.url-content-img').attr('src', response.data.preview);
              }
              if (response.type === 'image') {
                urlContent.find('.url-content-img').attr('src', response.data.preview);
              }
              return urlContent.slideDown();
            },
            error: function(error) {
              var urlContent;
              console.log(error);
              urlContent = $('#url-statement');
              urlContent.find('.url-content-title').text('');
              urlContent.find('.url-content-body').text('');
              urlContent.find('.url-content-img').attr('src', '');
              urlContent.find('.url-content-body').text(error.responseText);
              return urlContent.slideDown();
            }
          });
        }
      });
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
        var compiledTemplate, endObj, insertCategories, select;
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
          option = document.createElement('option');
          option.setAttribute('value', '');
          option.textContent = '';
          select.innerHTML += option.outerHTML;
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

        } else if (currentEntity === 'Contribution') {

        } else if (currentEntity === 'Legislation') {
          select = $('#addVotes select')[0];
          insertCategories();
          $('#addVotes').find('[data-provide="datepicker"]').on('changeDate', function() {
            return $(this).datepicker('hide');
          });
          compiledTemplate = Handlebars.compile($('#legislation-vote').html());
          return $('#electedVotes').html(compiledTemplate(data));
        } else if (currentEntity === 'PublicStatement') {
          select = $('#addStatements select')[0];
          insertCategories();
          return $('#addStatements').find('[data-provide="datepicker"]').on('changeDate', function() {
            return $(this).datepicker('hide');
          });
        }
      },
      error: function(error) {
        if (error.status === 401) {
          return showModal('/login');
        }
      }
    });
  });
  window.addItem = function(e) {
    var add, associations, childs, data, entityType, i, key, len, modal, modalType, newRecord, obj, ref, ref1, ref2, rowTemplate, select, selectName, selectedText, selectedValue, sendObject, value;
    newRecord = {};
    modal = $(e.target).closest('.modal');
    modalType = modal[0].id;
    entityType = modal[0].dataset.entityType;
    console.log(entityType);

    /*
      Get value from input fields.
     */
    modal.find('input[type="text"]').each(function(index, element) {
      var fieldName;
      fieldName = Object.keys(element.dataset)[0];
      return newRecord[fieldName] = element.value;
    });

    /*
      Get value from texarea's.
     */
    modal.find('textarea').each(function(index, element) {
      var fieldName;
      fieldName = Object.keys(element.dataset)[0];
      return newRecord[fieldName] = element.value;
    });
    associations = {};
    if (modalType !== 'addVotes') {
      associations["electedOfficial"] = person.id;
    }
    childs = [];
    if (modalType === 'addVotes') {

      /*
          Add information about votes.
       */
      modal.find('#electedVotes').find('tr[data-elected]').each(function(idx, element) {
        var childEntityName, data, fields;
        element = $(element);
        data = Object.create(null, {});
        element.find('select').each(function(index, element) {
          var fieldName;
          if (element.value) {
            fieldName = Object.keys(element.dataset)[0];
            return data[fieldName] = element.value;
          }
        });

        /*
          Add only if all fields is set.
         */
        if (Object.keys(data).length === 2) {
          fields = Object.create(null, {});
          fields['fields'] = data;
          fields['associations'] = Object.create(null, {});
          fields['associations'][element.attr('data-entity-type')] = element.attr('data-elected');
          childEntityName = element.parent().parent().attr('data-entity-type');
          return childs.push({
            entityName: childEntityName,
            fields: fields
          });
        }
      });
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      if (selectedValue === '') {
        window.alert('Please select category.');
        select.focus();
        return false;
      }
      selectedText = $(select).find(':selected').text();
      associations[selectName] = selectedValue;
    } else if (modalType === 'addContributions') {
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      if (selectedValue === '') {
        window.alert('Please select type.');
        select.focus();
        return false;
      }
      selectedText = $(select).find(':selected').text();
      newRecord[selectName] = selectedValue;
    } else if (modalType === 'addEndorsements') {
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      if (selectedValue === '') {
        window.alert('Please select type.');
        select.focus();
        return false;
      }
      selectedText = $(select).find(':selected').text();
      newRecord[selectName] = selectedValue;
    } else if (modalType === 'addStatements') {
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      if (selectedValue === '') {
        window.alert('Please select category.');
        select.focus();
        return false;
      }
      selectedText = $(select).find(':selected').text();
      associations[selectName] = selectedValue;
    }
    sendObject = {
      createRequest: {
        entityName: entityType,
        fields: {
          fields: newRecord,
          associations: associations,
          childs: childs
        }
      }
    };

    /*
      Append new entity to table.
     */
    rowTemplate = Handlebars.compile($("#row-" + modalType).html());
    data = Object.create(null, {});
    ref = sendObject.createRequest.fields.fields;
    for (key in ref) {
      value = ref[key];
      data[key] = value;
    }
    data['user'] = user.username;
    if (modalType === 'addVotes') {

      /*
        Check if user specified how current elected official voted.
       */
      add = false;
      ref1 = sendObject.createRequest.fields.childs;
      for (i = 0, len = ref1.length; i < len; i++) {
        obj = ref1[i];
        if (Number(obj.fields.associations.electedOfficial) === Number(person.id)) {
          add = true;
          ref2 = obj.fields.fields;
          for (key in ref2) {
            value = ref2[key];
            data[key] = value;
          }
          break;
        }
      }
      if (add) {
        data['category'] = selectedText;
        $('#Votes tr:last-child').before(rowTemplate(data));
      }
    } else if (modalType === 'addContributions') {

      /*
        Format contribution amount.
       */
      data.contributorType = selectedText;
      data.contributionAmount = numeral(data.contributionAmount).format('0,000');
      $('#Contributions tr:last-child').before(rowTemplate(data));
    } else if (modalType === 'addEndorsements') {
      data.endorserType = selectedText;
      $('#Endorsements tr:last-child').before(rowTemplate(data));
    } else if (modalType === 'addStatements') {
      data['category'] = selectedText;
      $('#Statements tr:last-child').before(rowTemplate(data));
    }

    /*
      Send create request to api.
     */
    console.log(sendObject);
    $.ajax({
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
    return modal.modal('hide');
  };

  /*
      If user try to add or update some data without logged in, we
      show him login/sign up window. After authorizing user redirect back
      to page, where he pres add/edit button. In that case we show him appropriate
      modal window.
  
      Timeout need because we don't know when we get user information and elected official information.
   */
  return window.setTimeout(function() {
    var dataId, field, type;
    if (!authorized) {
      return;
    }
    type = window.sessionStorage.getItem('tableType');
    dataId = window.sessionStorage.getItem('dataId');
    field = window.sessionStorage.getItem('field');
    if (dataId && field) {
      $('a[aria-controls="' + type + '"]').click();
      $('tr[data-id=' + dataId + ']').find('td:nth-child(' + field + ')').find('.editable').editable('toggle');
      window.sessionStorage.setItem('tableType', '');
      window.sessionStorage.setItem('dataId', '');
      return window.sessionStorage.setItem('field', '');
    } else if (type) {
      $('div#' + type).find('.add').click();
      $('a[aria-controls="' + type + '"]').click();
      return window.sessionStorage.setItem('tableType', '');
    }
  }, 2000);
};


/*
  Append create requests to all current electedOfficial page.
 */

showCreateRequests = function(person, createRequests) {
  var contributionRow, data, endorsementRow, i, key, legislationRow, len, name, ref, request, results, statementRow, template, value;
  if (!authorized) {
    return;
  }
  legislationRow = Handlebars.compile($('#row-addVotes').html());
  contributionRow = Handlebars.compile($('#row-addContributions').html());
  endorsementRow = Handlebars.compile($('#row-addEndorsements').html());
  statementRow = Handlebars.compile($('#row-addStatements').html());
  results = [];
  for (i = 0, len = createRequests.length; i < len; i++) {
    request = createRequests[i];
    data = request.fields.fields;
    data['user'] = request.user.username;
    if (request.entity_name === "Legislation") {
      name = 'Votes';
      template = legislationRow;
      ref = request.fields.childs[0].fields.fields;
      for (key in ref) {
        value = ref[key];
        data[key] = value;
      }
      data['category'] = categories[request.fields.associations.issueCategory - 1].name;
    } else if (request.entity_name === "Contribution") {
      name = 'Contributions';
      template = contributionRow;
      data['contributionAmount'] = numeral(data['contributionAmount']).format('0,000');
    } else if (request.entity_name === "Endorsement") {
      name = 'Endorsements';
      template = endorsementRow;
    } else if (request.entity_name === "PublicStatement") {
      name = 'Statements';
      template = statementRow;
      data['category'] = categories[request.fields.associations.issueCategory - 1].name;
    }
    results.push($("\#" + name + " tr:last-child").before(template(data)));
  }
  return results;
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
        url: "/api/elected-official" + url,
        dataType: 'json',
        cache: true,
        success: function(data) {
          var compiledTemplate, contribution, createRequests, format, html, i, len, person, ref, tpl;
          person = data.person;
          createRequests = data.createRequests;
          categories = data.categories;

          /*
            Format contribution amount.
           */
          ref = person.contributions;
          for (i = 0, len = ref.length; i < len; i++) {
            contribution = ref[i];
            contribution.contribution_amount = numeral(contribution.contribution_amount).format('0,000');
          }
          console.log(data);
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
          showCreateRequests(person, createRequests);
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
    url: "/api/elected-official" + window.path,
    dataType: 'json',
    success: function(data) {
      var compiledTemplate, contribution, createRequests, format, html, i, len, person, ref, tpl;
      person = data.person;
      createRequests = data.createRequests;
      categories = data.categories;

      /*
        Format contribution amount.
       */
      ref = person.contributions;
      for (i = 0, len = ref.length; i < len; i++) {
        contribution = ref[i];
        contribution.contribution_amount = numeral(contribution.contribution_amount).format('0,000');
      }
      console.log(data);
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
      showCreateRequests(person, createRequests);
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

$(function() {

  /*
    Get current user.
   */
  var $userBtn, $userBtnLink;
  $userBtn = $('#user');
  $userBtnLink = $userBtn.find('a');
  return $.ajax('/api/user', {
    method: 'GET',
    async: false,
    success: function(response) {
      var $userText;
      user.username = response.username;
      authorized = true;
      $userText = $('#user-text').find('a');
      $userText.html(("Logged in as " + user.username) + $userText.html());
      return $userBtnLink.html("Sign Out" + $userBtnLink.html()).click(function() {
        return window.location = '/logout';
      });
    },
    error: function(error) {
      if (error.status === 401) {
        authorized = false;
      }
      return $userBtnLink.html("Login / Sign Up" + $userBtnLink.html()).click(function() {
        return showModal('/login');
      });
    }
  });
});



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
      async: false,
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
      async: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFHZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLGNBQUEsRUFBZ0IsS0FOaEI7RUFPQSxVQUFBLEVBQVksS0FQWjtFQVFBLGNBQUEsRUFBZ0IsS0FSaEI7RUFTQSxXQUFBLEVBQWEsSUFUYjtFQVVBLGtCQUFBLEVBQ0U7SUFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFwQztHQVhGO0VBWUEsZUFBQSxFQUFpQixTQUFDLEdBQUQ7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LFNBQUE7YUFBSSwwQkFBQSxHQUE2QixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLE1BQWI7SUFBakMsQ0FBakU7V0FDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixHQUE1QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLFFBQXRDLEVBQWdELFFBQWhEO0VBSmdILENBQWxIO0FBRm9COztBQVF0Qix3QkFBQSxHQUEwQixTQUFBO1NBQ3hCLEtBQUEsQ0FBTSxpQkFBTjtBQUR3Qjs7QUFHMUIsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLHFCQUFBLEVBQXNCLHFCQUF0QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJib3VuZHNfdGltZW91dD11bmRlZmluZWRcblxuXG5tYXAgPSBuZXcgR01hcHNcbiAgZWw6ICcjZ292bWFwJ1xuICBsYXQ6IDM3LjNcbiAgbG5nOiAtMTE5LjNcbiAgem9vbTogNlxuICBtaW5ab29tOiA2XG4gIHNjcm9sbHdoZWVsOiB0cnVlXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxuICBwYW5Db250cm9sOiBmYWxzZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgem9vbUNvbnRyb2w6IHRydWVcbiAgem9vbUNvbnRyb2xPcHRpb25zOlxuICAgIHN0eWxlOiBnb29nbGUubWFwcy5ab29tQ29udHJvbFN0eWxlLlNNQUxMXG4gIG1hcmtlckNsdXN0ZXJlcjogKG1hcCkgLT5cbiAgICBvcHRpb25zID0ge2dyaWRTaXplOiAwfVxuICAgIHJldHVybiBuZXcgTWFya2VyQ2x1c3RlcmVyKG1hcCwgW10sIG9wdGlvbnMpO1xuXG5tYXAubWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5SSUdIVF9UT1BdLnB1c2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2VuZCcpKVxuXG5yZXJlbmRlcl9tYXJrZXJzID0gLT5cbiAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gR09WV0lLSS5tYXJrZXJzXG5cbnJlYnVpbGRfZmlsdGVyID0gLT5cbiAgaGFyZF9wYXJhbXMgPSBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnLCAnQ291bnR5J11cbiAgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiA9IFtdXG4gICQoJy50eXBlX2ZpbHRlcicpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgIGlmICQoZWxlbWVudCkuYXR0cignbmFtZScpIGluIGhhcmRfcGFyYW1zIGFuZCAkKGVsZW1lbnQpLnZhbCgpID09ICcxJ1xuICAgICAgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMi5wdXNoICQoZWxlbWVudCkuYXR0cignbmFtZScpXG5cbiMgbGVnZW5kVHlwZSA9IGNpdHksIHNjaG9vbCBkaXN0cmljdCwgc3BlY2lhbCBkaXN0cmljdCwgY291bnRpZXNcbmdldF9yZWNvcmRzMiA9IChsZWdlbmRUeXBlLCBvbnN1Y2Nlc3MpIC0+XG4gICQuYWpheFxuICAgIHVybDpcIi9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcbiMgICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUsIGxpbWl0OiA1MDAwIH1cbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuXG4gIHJlYnVpbGRfZmlsdGVyKClcbiAgZ2V0X3JlY29yZHMyIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIsIChkYXRhKSAtPlxuICAgIEdPVldJS0kubWFya2VycyA9IGRhdGE7XG4gICAgcmVyZW5kZXJfbWFya2VycygpXG5cbiAgJCgnI2xlZ2VuZCBsaTpub3QoLmNvdW50aWVzLXRyaWdnZXIpJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGhpZGRlbl9maWVsZCA9ICQodGhpcykuZmluZCgnaW5wdXQnKVxuICAgIHZhbHVlID0gaGlkZGVuX2ZpZWxkLnZhbCgpXG4gICAgaGlkZGVuX2ZpZWxkLnZhbChpZiB2YWx1ZSA9PSAnMScgdGhlbiAnMCcgZWxzZSAnMScpXG4gICAgcmVidWlsZF9maWx0ZXIoKVxuICAgIG1hcC5yZW1vdmVNYXJrZXJzKClcbiAgICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpLmNvdW50aWVzLXRyaWdnZXInKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaWYgJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykgdGhlbiBHT1ZXSUtJLmdldF9jb3VudGllcyBHT1ZXSUtJLmRyYXdfcG9seWdvbnMgZWxzZSBtYXAucmVtb3ZlUG9seWdvbnMoKVxuXG5cblxuXG5nZXRfaWNvbiA9KGFsdF90eXBlKSAtPlxuXG4gIF9jaXJjbGUgPShjb2xvciktPlxuICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFXG4gICAgZmlsbE9wYWNpdHk6IDFcbiAgICBmaWxsQ29sb3I6Y29sb3JcbiAgICBzdHJva2VXZWlnaHQ6IDFcbiAgICBzdHJva2VDb2xvcjond2hpdGUnXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXG4gICAgc2NhbGU6NlxuXG4gIHN3aXRjaCBhbHRfdHlwZVxuICAgIHdoZW4gJ0NpdHknIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3JlZCdcbiAgICB3aGVuICdTY2hvb2wgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ2xpZ2h0Ymx1ZSdcbiAgICB3aGVuICdTcGVjaWFsIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdwdXJwbGUnXG4gICAgZWxzZSByZXR1cm4gX2NpcmNsZSAnd2hpdGUnXG5cbmluX2FycmF5ID0gKG15X2l0ZW0sIG15X2FycmF5KSAtPlxuICBmb3IgaXRlbSBpbiBteV9hcnJheVxuICAgIHJldHVybiB0cnVlIGlmIGl0ZW0gPT0gbXlfaXRlbVxuICBmYWxzZVxuXG5cbmFkZF9tYXJrZXIgPSAocmVjKS0+XG4gICNjb25zb2xlLmxvZyBcIiN7cmVjLnJhbmR9ICN7cmVjLmluY19pZH0gI3tyZWMuemlwfSAje3JlYy5sYXRpdHVkZX0gI3tyZWMubG9uZ2l0dWRlfSAje3JlYy5nb3ZfbmFtZX1cIlxuICBleGlzdCA9IGluX2FycmF5IHJlYy5hbHRUeXBlLCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yXG4gIGlmIGV4aXN0IGlzIGZhbHNlIHRoZW4gcmV0dXJuIGZhbHNlXG4gIG1hcC5hZGRNYXJrZXJcbiAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuICAgIGxuZzogcmVjLmxvbmdpdHVkZVxuICAgIGljb246IGdldF9pY29uKHJlYy5hbHRUeXBlKVxuICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIlxuICAgIGluZm9XaW5kb3c6XG4gICAgICBjb250ZW50OiBcIlxuICAgICAgICA8ZGl2PjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnIGNsYXNzPSdpbmZvLXdpbmRvdy11cmknIGRhdGEtdXJpPScvI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9Jz48c3Ryb25nPiN7cmVjLm5hbWV9PC9zdHJvbmc+PC9hPjwvZGl2PlxuICAgICAgICA8ZGl2PiAje3JlYy50eXBlfSAgI3tyZWMuY2l0eX0gI3tyZWMuemlwfSAje3JlYy5zdGF0ZX08L2Rpdj5cIlxuXG5cbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIG1hcDogbWFwXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgICNAZ292c19hcnJheSA9IGdvdnNcbiAgICBAZ292c19hcnJheSA9IGdvdnMucmVjb3JkXG4gICAgJCgnLnR5cGVhaGVhZCcpLmtleXVwIChldmVudCkgPT5cbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgLCAxMDAwXG5cbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAgIGNsYXNzTmFtZXM6XG4gICAgICAgIFx0bWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAjICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxuICAgIHJldHVyblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzPUdvdlNlbGVjdG9yXG5cblxuXG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xud2lraXBlZGlhID0gcmVxdWlyZSAnLi93aWtpcGVkaWEuY29mZmVlJ1xuXG5nb3ZtYXAgPSBudWxsXG5nb3Zfc2VsZWN0b3IgPSBudWxsXG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYiA9IFwiXCJcbnVuZGVmID0gbnVsbFxuYXV0aG9yaXplZCA9IGZhbHNlXG4jXG4jIEluZm9ybWF0aW9uIGFib3V0IGN1cnJlbnQgdXNlci5cbiNcbnVzZXIgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4jXG4jIElzc3VlcyBjYXRlZ29yeSwgZmlsbCBpbiBlbGVjdGVkIG9mZmljaWFsIHBhZ2UuXG4jXG5jYXRlZ29yaWVzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpZl9lcScsIChhLCBiLCBvcHRzKSAtPlxuICAgIGlmIGBhID09IGJgXG4gICAgICAgIHJldHVybiBvcHRzLmZuIHRoaXNcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBvcHRzLmludmVyc2UgdGhpc1xuXG53aW5kb3cuR09WV0lLSSA9XG4gICAgc3RhdGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXJfMjogWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0J11cblxuICAgIHNob3dfc2VhcmNoX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICAgICBmb2N1c19zZWFyY2hfZmllbGQgNTAwXG5cbiAgICBzaG93X2RhdGFfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG5cbkdPVldJS0kuZ2V0X2NvdW50aWVzID0gZ2V0X2NvdW50aWVzID0gKGNhbGxiYWNrKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICcvbGVnYWN5L2RhdGEvY291bnR5X2dlb2dyYXBoeV9jYV8yLmpzb24nXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGNvdW50aWVzSlNPTikgLT5cbiAgICAgICAgICAgIGNhbGxiYWNrIGNvdW50aWVzSlNPTlxuXG5HT1ZXSUtJLmRyYXdfcG9seWdvbnMgPSBkcmF3X3BvbHlnb25zID0gKGNvdW50aWVzSlNPTikgLT5cbiAgICBmb3IgY291bnR5IGluIGNvdW50aWVzSlNPTi5mZWF0dXJlc1xuICAgICAgICBkbyAoY291bnR5KSA9PlxuICAgICAgICAgICAgZ292bWFwLm1hcC5kcmF3UG9seWdvbih7XG4gICAgICAgICAgICAgICAgcGF0aHM6IGNvdW50eS5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgICAgICAgICAgICAgIHVzZUdlb0pTT046IHRydWVcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyM4MDgwODAnXG4gICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC42XG4gICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAxLjVcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjE1XG4gICAgICAgICAgICAgICAgY291bnR5SWQ6IGNvdW50eS5wcm9wZXJ0aWVzLl9pZFxuICAgICAgICAgICAgICAgIGFsdE5hbWU6IGNvdW50eS5wcm9wZXJ0aWVzLmFsdF9uYW1lXG4gICAgICAgICAgICAgICAgbWFya2VyOiBuZXcgTWFya2VyV2l0aExhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMCwgMCksXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlT25EcmFnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBnb3ZtYXAubWFwLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDb250ZW50OiBjb3VudHkucHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KC0xNSwgMjUpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENsYXNzOiBcImxhYmVsLXRvb2x0aXBcIixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHlsZToge29wYWNpdHk6IDEuMH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xeDFcIixcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIG1vdXNlb3ZlcjogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiIzAwRkYwMFwifSlcbiAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IChldmVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0UG9zaXRpb24oZXZlbnQubGF0TG5nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKHRydWUpXG4gICAgICAgICAgICAgICAgbW91c2VvdXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiNGRjAwMDBcIn0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoZmFsc2UpXG4gICAgICAgICAgICAgICAgY2xpY2s6IC0+XG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB1cmkgPSBcIi8je2NvdW50eS5hbHRfdHlwZV9zbHVnfS8je2NvdW50eS5wcm9wZXJ0aWVzLnNsdWd9XCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuICAgICAgICAgICAgfSlcblxud2luZG93LnJlbWVtYmVyX3RhYiA9IChuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbiQoZG9jdW1lbnQpLm9uICdjbGljaycsICcjZmllbGRUYWJzIGEnLCAoZSkgLT5cbiAgICBhY3RpdmVfdGFiID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3RhYm5hbWUnKVxuICAgIGNvbnNvbGUubG9nIGFjdGl2ZV90YWJcbiAgICAkKFwiI3RhYnNDb250ZW50IC50YWItcGFuZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKVxuICAgICQoJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSkuYWRkQ2xhc3MoXCJhY3RpdmVcIilcbiAgICB0ZW1wbGF0ZXMuYWN0aXZhdGUgMCwgYWN0aXZlX3RhYlxuXG4gICAgaWYgYWN0aXZlX3RhYiA9PSAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gMFxuICAgICAgICBmaW5WYWxXaWR0aE1heDMgPSAwXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMVwiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4MVxuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDJcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDIgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIzXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgzXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMVwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDEgKyAyNylcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMlwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDIgKyAyNylcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDMgKyAyNylcblxuJChkb2N1bWVudCkudG9vbHRpcCh7c2VsZWN0b3I6IFwiW2NsYXNzPSdtZWRpYS10b29sdGlwJ11cIiwgdHJpZ2dlcjogJ2NsaWNrJ30pXG5cbmFjdGl2YXRlX3RhYiA9ICgpIC0+XG4gICAgJChcIiNmaWVsZFRhYnMgYVtocmVmPScjdGFiI3thY3RpdmVfdGFifSddXCIpLnRhYignc2hvdycpXG5cblxuZ2V0X3JlY29yZDIgPSAocmVjaWQpIC0+XG4jIGNsZWFyIHdpa2lwZWRpYSBwbGFjZVxuICAgICQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoXCJcIilcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL2dvdnMvI3tyZWNpZH1cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGhlYWRlcnM6IHtcIlgtRHJlYW1GYWN0b3J5LUFwcGxpY2F0aW9uLU5hbWVcIjogXCJnb3Z3aWtpXCJ9XG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgIGdldF9maW5hbmNpYWxfc3RhdGVtZW50cyBkYXRhLl9pZCwgKGRhdGEyLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cyA9IGRhdGEyXG4gICAgICAgICAgICAgICAgICAgIGdldF9lbGVjdGVkX29mZmljaWFscyBkYXRhLl9pZCwgMjUsIChkYXRhMywgdGV4dFN0YXR1czIsIGpxWEhSMikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhM1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0X21heF9yYW5rcyAobWF4X3JhbmtzX3Jlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWF4X3JhbmtzID0gbWF4X3JhbmtzX3Jlc3BvbnNlLnJlY29yZFswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNUT0RPOiBFbmFibGUgYWZ0ZXIgcmVhbGl6ZSBtYXhfcmFua3MgYXBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcblxuICAgICAgICAgICAgIyBmaWxsIHdpa2lwZWRpYSBwbGFjZVxuICAgICAgICAgICAgI3dwbiA9IGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgICAgICAgICAgIyQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoaWYgd3BuIHRoZW4gd3BuIGVsc2UgXCJObyBXaWtpcGVkaWEgYXJ0aWNsZVwiKVxuXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9lbGVjdGVkX29mZmljaWFscyA9IChhbHRfdHlwZSwgZ292X25hbWUsIG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OS9hcGkvZ292ZXJubWVudC9cIiArIGFsdF90eXBlICsgJy8nICsgZ292X25hbWVcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5nZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgPSAoZ292X2lkLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9fcHJvYy9nZXRfZmluYW5jaWFsX3N0YXRlbWVudHNcIlxuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6IFwiZ292d2lraVwiXG4gICAgICAgICAgICBvcmRlcjogXCJjYXB0aW9uX2NhdGVnb3J5LGRpc3BsYXlfb3JkZXJcIlxuICAgICAgICAgICAgcGFyYW1zOiBbXG4gICAgICAgICAgICAgICAgbmFtZTogXCJnb3ZzX2lkXCJcbiAgICAgICAgICAgICAgICBwYXJhbV90eXBlOiBcIklOXCJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZ292X2lkXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9tYXhfcmFua3MgPSAob25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICdodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9tYXhfcmFua3MnXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgICBhcHBfbmFtZTogJ2dvdndpa2knXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0gKHJlYyk9PlxuICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgIGFjdGl2YXRlX3RhYigpXG4gICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgcm91dGVyLm5hdmlnYXRlKHJlYy5faWQpXG5cblxud2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQyID0gKHJlYyk9PlxuICAgIGdldF9lbGVjdGVkX29mZmljaWFscyByZWMuYWx0VHlwZVNsdWcsIHJlYy5zbHVnLCAoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgIHJlYy5lbGVjdGVkX29mZmljaWFscyA9IGRhdGFcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCByZWMpXG4gICAgICAgICNnZXRfcmVjb3JkMiByZWMuaWRcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIHVybCA9IHJlYy5hbHRUeXBlU2x1ZyArICcvJyArIHJlYy5zbHVnXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gdXJsXG5cblxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCBjb21tYW5kLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9hcGkubW9uZ29sYWIuY29tL2FwaS8xL2RhdGFiYXNlcy9nb3Z3aWtpL3J1bkNvbW1hbmQ/YXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5J1xuICAgICAgICB0eXBlOiAnUE9TVCdcbiAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgZGF0YTogY29tbWFuZCAjSlNPTi5zdHJpbmdpZnkoY29tbWFuZClcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlc1xuICAgICAgICAgICAgYnVpbGRfc2VsZWN0X2VsZW1lbnQgY29udGFpbmVyLCB0ZXh0LCB2YWx1ZXMuc29ydCgpLCB3aGVyZV90b19zdG9yZV92YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgcyA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICAgIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyIHdoZW4gdlxuICAgIHMgKz0gXCI8L3NlbGVjdD5cIlxuICAgIHNlbGVjdCA9ICQocylcbiAgICAkKGNvbnRhaW5lcikuYXBwZW5kKHNlbGVjdClcblxuICAgICMgc2V0IGRlZmF1bHQgJ0NBJ1xuICAgIGlmIHRleHQgaXMgJ1N0YXRlLi4nXG4gICAgICAgIHNlbGVjdC52YWwgJ0NBJ1xuICAgICAgICB3aW5kb3cuR09WV0lLSS5zdGF0ZV9maWx0ZXIgPSAnQ0EnXG5cbiAgICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgICAgICBlbCA9ICQoZS50YXJnZXQpXG4gICAgICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXG4gICAgICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgZ292X3NlbGVjdG9yLmNvdW50X2dvdnMoKVxuXG5hZGp1c3RfdHlwZWFoZWFkX3dpZHRoID0gKCkgLT5cbiAgICBpbnAgPSAkKCcjbXlpbnB1dCcpXG4gICAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gICAgaW5wLndpZHRoIHBhci53aWR0aCgpXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgICAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcblxuZm9jdXNfc2VhcmNoX2ZpZWxkID0gKG1zZWMpIC0+XG4gICAgc2V0VGltZW91dCAoLT4gJCgnI215aW5wdXQnKS5mb2N1cygpKSwgbXNlY1xuXG5cbiMgcXVpY2sgYW5kIGRpcnR5IGZpeCBmb3IgYmFjayBidXR0b24gaW4gYnJvd3Nlclxud2luZG93Lm9uaGFzaGNoYW5nZSA9IChlKSAtPlxuICAgIGggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxuICAgIGlmIG5vdCBoXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoKGl0bSktPiBpZiBpdG0gaXNudCBcIlwiIHRoZW4gaXRtIGVsc2UgZmFsc2UpO1xucm91dGVUeXBlID0gcm91dGUubGVuZ3RoO1xuXG5HT1ZXSUtJLmhpc3RvcnkgPSAoaW5kZXgpIC0+XG4gICAgaWYgaW5kZXggPT0gMFxuICAgICAgICBzZWFyY2hDb250YWluZXIgPSAkKCcjc2VhcmNoQ29udGFpbmVyJykudGV4dCgpO1xuICAgICAgICBpZihzZWFyY2hDb250YWluZXIgIT0gJycpXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge30sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnLydcbiAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLydcbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLnNob3coKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiAoaGlzdG9yeS5zdGF0ZSAhPSBudWxsICYmIGhpc3Rvcnkuc3RhdGUudGVtcGxhdGUgIT0gdW5kZWZpbmVkKVxuICAgICAgICB3aW5kb3cuaGlzdG9yeS5nbyhpbmRleCk7XG4gICAgZWxzZVxuICAgICAgICByb3V0ZS5wb3AoKVxuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJyArIHJvdXRlLmpvaW4oJy8nKVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9wc3RhdGUnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cod2luZG93Lmhpc3Rvcnkuc3RhdGUpXG4gICAgaWYgd2luZG93Lmhpc3Rvcnkuc3RhdGUgaXNudCBudWxsXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBldmVudC5zdGF0ZS50ZW1wbGF0ZVxuICAgICAgICByb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykubGVuZ3RoLTE7XG4gICAgICAgIGlmIHJvdXRlIGlzIDIgdGhlbiAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgaWYgcm91dGUgaXMgMSB0aGVuICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcbiAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgZWxzZVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuIyAgICBlbHNlXG4jICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuXG4jIFJlZnJlc2ggRGlzcXVzIHRocmVhZFxucmVmcmVzaF9kaXNxdXMgPSAobmV3SWRlbnRpZmllciwgbmV3VXJsLCBuZXdUaXRsZSkgLT5cbiAgICBESVNRVVMucmVzZXRcbiAgICAgICAgcmVsb2FkOiB0cnVlLFxuICAgICAgICBjb25maWc6ICgpIC0+XG4gICAgICAgICAgICB0aGlzLnBhZ2UuaWRlbnRpZmllciA9IG5ld0lkZW50aWZpZXJcbiAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBuZXdVcmxcbiAgICAgICAgICAgIHRoaXMucGFnZS50aXRsZSA9IG5ld1RpdGxlXG5cbiNcbiMgU29ydCB0YWJsZSBieSBjb2x1bW4uXG4jIEBwYXJhbSBzdHJpbmcgdGFibGUgIEpRdWVyeSBzZWxlY3Rvci5cbiMgQHBhcmFtIG51bWJlciBjb2xOdW0gQ29sdW1uIG51bWJlci5cbiNcbnNvcnRUYWJsZSA9ICh0YWJsZSwgY29sTnVtKSAtPlxuICAgICNcbiAgICAjIERhdGEgcm93cyB0byBzb3J0XG4gICAgI1xuICAgIHJvd3MgPSAkKHRhYmxlICsgJyB0Ym9keSAgW2RhdGEtaWRdJykuZ2V0KClcbiAgICAjXG4gICAgIyBMYXN0IHJvdyB3aGljaCBjb250YWlucyBcIkFkZCBuZXcgLi4uXCJcbiAgICAjXG4gICAgbGFzdFJvdyA9ICQodGFibGUgKyAnIHRib2R5ICB0cjpsYXN0JykuZ2V0KCk7XG4gICAgI1xuICAgICMgQ2xpY2tlZCBjb2x1bW4uXG4gICAgI1xuICAgIGNvbHVtbiA9ICQodGFibGUgKyAnIHRib2R5IHRyOmZpcnN0JykuY2hpbGRyZW4oJ3RoJykuZXEoY29sTnVtKVxuICAgIG1ha2VTb3J0ID0gdHJ1ZVxuXG4gICAgaWYgY29sdW1uLmhhc0NsYXNzKCdkZXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICAgICAgIyBSZXN0b3JlIHJvdyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnZGVzYycpLmFkZENsYXNzKCdvcmlnaW4nKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICByb3dzID0gY29sdW1uLmRhdGEoJ29yaWdpbicpXG4gICAgICBtYWtlU29ydCA9IGZhbHNlO1xuICAgIGVsc2UgaWYgY29sdW1uLmhhc0NsYXNzKCdhc2MnKVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBjdXJyZW50bHkgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlci5cbiAgICAgICMgU29ydCBpbiBkZXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdhc2MnKS5hZGRDbGFzcygnZGVzYycpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKS5hZGRDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAxXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIHJldHVybiAwXG5cbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnb3JpZ2luJylcbiAgICAgICNcbiAgICAgICMgT3JpZ2luYWwgdGFibGUgZGF0YSBvcmRlci5cbiAgICAgICMgU29ydCBpbiBhc2Mgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ29yaWdpbicpLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5hZGRDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAtMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBub3Qgb3JkZXJlZCB5ZXQuXG4gICAgICAjIFN0b3JlIG9yaWdpbmFsIGRhdGEgcG9zaXRpb24gYW5kIHNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuXG4gICAgICBjb2x1bW4uYWRkQ2xhc3MoJ2FzYycpXG4gICAgICBjb2x1bW4uZGF0YSgnb3JpZ2luJywgcm93cy5zbGljZSgwKSlcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgaWYgKG1ha2VTb3J0KSB0aGVuIHJvd3Muc29ydCBzb3J0RnVuY3Rpb25cbiAgICAkLmVhY2ggcm93cywgKGluZGV4LCByb3cpIC0+XG4gICAgICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChyb3cpXG4gICAgJCh0YWJsZSkuY2hpbGRyZW4oJ3Rib2R5JykuYXBwZW5kKGxhc3RSb3cpXG5cbmluaXRUYWJsZUhhbmRsZXJzID0gKHBlcnNvbikgLT5cbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpXG5cbiAgICAkKCcuZWRpdGFibGUnKS5lZGl0YWJsZSh7c3R5bGVzaGVldHM6IGZhbHNlLHR5cGU6ICd0ZXh0YXJlYScsIHNob3didXR0b25zOiAnYm90dG9tJywgZGlzcGxheTogdHJ1ZSwgZW1wdHl0ZXh0OiAnICd9KVxuICAgICQoJy5lZGl0YWJsZScpLm9mZignY2xpY2snKTtcblxuICAgICQoJ3RhYmxlJykub24gJ2NsaWNrJywgJy5nbHlwaGljb24tcGVuY2lsJywgKGUpIC0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubm9FZGl0YWJsZSBpc250IHVuZGVmaW5lZCB0aGVuIHJldHVyblxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVswXS5pZClcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZGF0YUlkJywgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJykuYXR0cignZGF0YS1pZCcpKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdmaWVsZCcsIE51bWJlcigoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykpWzBdLmNlbGxJbmRleCkgKyAxKVxuIyAgICAgICAgICAgICQuYWpheCAnL2VkaXRyZXF1ZXN0L25ldycsIHtcbiMgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4jICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAocmVzcG9uc2UpIC0+XG4jICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5zdGF0dXMgaXMgNDAxXG4jXG4jICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHJlc3BvbnNlLnN0YXR1cyBpcyAyMDBcbiMgICAgICAgICAgICAgICAgICAgICAgICBhdXRob3JpemVkID0gdHJ1ZVxuIyAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpLmZpbmQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcbiMgICAgICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiMgICAgICAgICAgICAgICAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDFcbiMgICAgICAgICAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4jICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3RhcmdldCcsIGUudGFyZ2V0KVxuIyAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVswXS5pZClcbiMgICAgICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpLmZpbmQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcblxuICAgICNcbiAgICAjIEFkZCBzb3J0IGhhbmRsZXJzLlxuICAgICNcbiAgICAkKCcuc29ydCcpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB0eXBlID0gJCh0aGlzKS5hdHRyKCdkYXRhLXNvcnQtdHlwZScpXG5cbiAgICAgIGlmIHR5cGUgaXMgJ3llYXInXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IHllYXIuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDApXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ25hbWUnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IG5hbWUuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDEpXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ2Ftb3VudCdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgYW1vdW50LlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAzKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdjb250cmlidXRvci10eXBlJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBjb250cmlidXRvciB0eXBlLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCA0KVxuXG4gICAgJCgnYScpLm9uICdzYXZlJywgKGUsIHBhcmFtcykgLT5cbiAgICAgICAgZW50aXR5VHlwZSA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0YWJsZScpWzBdLmRhdGFzZXQuZW50aXR5VHlwZVxuICAgICAgICBpZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpWzBdLmRhdGFzZXQuaWRcbiAgICAgICAgZmllbGQgPSBPYmplY3Qua2V5cygkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKVswXS5kYXRhc2V0KVswXVxuICAgICAgICBzZW5kT2JqZWN0ID0ge1xuICAgICAgICAgICAgZWRpdFJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGVudGl0eUlkOiBpZCxcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QuY2hhbmdlc1tmaWVsZF0gPSBwYXJhbXMubmV3VmFsdWVcbiAgICAgICAgc2VuZE9iamVjdC5lZGl0UmVxdWVzdCA9IEpTT04uc3RyaW5naWZ5KHNlbmRPYmplY3QuZWRpdFJlcXVlc3QpO1xuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XG4gICAgICAgICQuYWpheCAnL2VkaXRyZXF1ZXN0L2NyZWF0ZScsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dC9qc29uJyxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICB0ZXh0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDEgdGhlbiBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgIH1cblxuICAgICQoJ3RhYmxlJykub24gJ2NsaWNrJywgJy5hZGQnLCAoZSkgLT5cbiAgICAgICAgdGFiUGFuZSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50YWItcGFuZScpXG4gICAgICAgIHRhYmxlVHlwZSA9IHRhYlBhbmVbMF0uaWRcbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSAndGFibGVUeXBlJywgdGFibGVUeXBlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGN1cnJlbnRFbnRpdHkgPSBudWxsXG4gICAgICAgIGNvbnNvbGUubG9nKHRhYmxlVHlwZSlcbiAgICAgICAgaWYgdGFibGVUeXBlIGlzICdWb3RlcydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnTGVnaXNsYXRpb24nXG4gICAgICAgICAgICAkKCcjYWRkVm90ZXMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0NvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0NvbnRyaWJ1dGlvbidcbiAgICAgICAgICAgICQoJyNhZGRDb250cmlidXRpb25zJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0VuZG9yc2VtZW50J1xuICAgICAgICAgICAgJCgnI2FkZEVuZG9yc2VtZW50cycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnU3RhdGVtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnUHVibGljU3RhdGVtZW50J1xuICAgICAgICAgICAgJCgnI2FkZFN0YXRlbWVudHMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBTZXQgZ2V0IHVybCBjYWxsYmFjay5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgJCgnLnVybC1pbnB1dCcpLm9uICdrZXl1cCcsICgpIC0+XG4gICAgICAgICAgICAgIG1hdGNoX3VybCA9IC9cXGIoaHR0cHM/KTpcXC9cXC8oW1xcLUEtWjAtOS5dKykoXFwvW1xcLUEtWjAtOSsmQCNcXC8lPX5ffCE6LC47XSopPyhcXD9bQS1aMC05KyZAI1xcLyU9fl98ITosLjtdKik/L2lcbiAgICAgICAgICAgICAgaWYgKG1hdGNoX3VybC50ZXN0KCQodGhpcykudmFsKCkpKVxuICAgICAgICAgICAgICAgICQuYWpheCAnL2FwaS91cmwvZXh0cmFjdCcsIHtcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJCh0aGlzKS52YWwoKS5tYXRjaChtYXRjaF91cmwpWzBdXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQgPSAkKCcjdXJsLXN0YXRlbWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIENsZWFyLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsICcnKVxuXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlIGlzICdodG1sJylcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dChyZXNwb25zZS5kYXRhLmJvZHkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAneW91dHViZScpXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YS5wcmV2aWV3KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhLnByZXZpZXcpO1xuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LnNsaWRlRG93bigpXG4gICAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50ID0gJCgnI3VybC1zdGF0ZW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBDbGVhci5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCAnJylcblxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dChlcnJvci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuc2xpZGVEb3duKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgIGlmIHRhYlBhbmUuaGFzQ2xhc3MoJ2xvYWRlZCcpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgIHRhYlBhbmVbMF0uY2xhc3NMaXN0LmFkZCgnbG9hZGVkJylcblxuICAgICAgICBwZXJzb25NZXRhID0ge1wiY3JlYXRlUmVxdWVzdFwiOntcImVudGl0eU5hbWVcIjpjdXJyZW50RW50aXR5LFwia25vd25GaWVsZHNcIjp7XCJlbGVjdGVkT2ZmaWNpYWxcIjpwZXJzb24uaWR9fX1cbiAgICAgICAgJC5hamF4KFxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvYXBpL2NyZWF0ZXJlcXVlc3QvbmV3JyxcbiAgICAgICAgICAgIGRhdGE6IHBlcnNvbk1ldGEsXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICAgICAgICAgICAgICAgIGVuZE9iaiA9IHt9XG4gICAgICAgICAgICAgICAgZGF0YS5jaG9pY2VzWzBdLmNob2ljZXMuZm9yRWFjaCAoaXRlbSwgaW5kZXgpIC0+XG4gICAgICAgICAgICAgICAgICBpZHMgPSBPYmplY3Qua2V5cyBpdGVtXG4gICAgICAgICAgICAgICAgICBpZHMuZm9yRWFjaCAoaWQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgZW5kT2JqW2lkXSA9IGl0ZW1baWRdXG5cbiAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzID0gKCkgLT5cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LnNldEF0dHJpYnV0ZSgnbmFtZScsIGRhdGEuY2hvaWNlc1swXS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAjIEFkZCBmaXJzdCBibGFuayBvcHRpb24uXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJycpXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9ICcnXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgKz0gb3B0aW9uLm91dGVySFRNTFxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIGVuZE9ialxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywga2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gZW5kT2JqW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgKz0gb3B0aW9uLm91dGVySFRNTFxuXG4gICAgICAgICAgICAgICAgc2VsZWN0ID0gbnVsbFxuXG4gICAgICAgICAgICAgICAgaWYgY3VycmVudEVudGl0eSBpcyAnRW5kb3JzZW1lbnQnXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0NvbnRyaWJ1dGlvbidcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnTGVnaXNsYXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdCA9ICQoJyNhZGRWb3RlcyBzZWxlY3QnKVswXVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FkZFZvdGVzJykuZmluZCgnW2RhdGEtcHJvdmlkZT1cImRhdGVwaWNrZXJcIl0nKS5vbihcbiAgICAgICAgICAgICAgICAgICAgICAnY2hhbmdlRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgKCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlciAnaGlkZSdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgRmlsbCBlbGVjdGVkIG9mZmljaWFscyB2b3RlcyB0YWJsZS5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNsZWdpc2xhdGlvbi12b3RlJykuaHRtbCgpKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZWxlY3RlZFZvdGVzJykuaHRtbCBjb21waWxlZFRlbXBsYXRlKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdQdWJsaWNTdGF0ZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdCA9ICQoJyNhZGRTdGF0ZW1lbnRzIHNlbGVjdCcpWzBdXG4gICAgICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLmZpbmQoJ1tkYXRhLXByb3ZpZGU9XCJkYXRlcGlja2VyXCJdJykub24oXG4gICAgICAgICAgICAgICAgICAgICAgJ2NoYW5nZURhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICgpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIgJ2hpZGUnXG4gICAgICAgICAgICAgICAgICAgIClcblxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICBpZihlcnJvci5zdGF0dXMgPT0gNDAxKSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgKTtcblxuICAgIHdpbmRvdy5hZGRJdGVtID0gKGUpIC0+XG4gICAgICAgIG5ld1JlY29yZCA9IHt9XG4gICAgICAgIG1vZGFsID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLm1vZGFsJylcbiAgICAgICAgbW9kYWxUeXBlID0gbW9kYWxbMF0uaWRcbiAgICAgICAgZW50aXR5VHlwZSA9IG1vZGFsWzBdLmRhdGFzZXQuZW50aXR5VHlwZVxuICAgICAgICBjb25zb2xlLmxvZyhlbnRpdHlUeXBlKTtcblxuICAgICAgICAjIyNcbiAgICAgICAgICBHZXQgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZHMuXG4gICAgICAgICMjI1xuICAgICAgICBtb2RhbC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgbmV3UmVjb3JkW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgR2V0IHZhbHVlIGZyb20gdGV4YXJlYSdzLlxuICAgICAgICAjIyNcbiAgICAgICAgbW9kYWwuZmluZCgndGV4dGFyZWEnKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgIGFzc29jaWF0aW9ucyA9IHt9XG4gICAgICAgIGlmIG1vZGFsVHlwZSAhPSAnYWRkVm90ZXMnXG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbXCJlbGVjdGVkT2ZmaWNpYWxcIl0gPSBwZXJzb24uaWRcbiAgICAgICAgI1xuICAgICAgICAjIEFycmF5IG9mIHN1YiBlbnRpdGllcy5cbiAgICAgICAgI1xuICAgICAgICBjaGlsZHMgPSBbXVxuXG4gICAgICAgIGlmIG1vZGFsVHlwZSBpcyAnYWRkVm90ZXMnXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBBZGQgaW5mb3JtYXRpb24gYWJvdXQgdm90ZXMuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIG1vZGFsLmZpbmQoJyNlbGVjdGVkVm90ZXMnKS5maW5kKCd0cltkYXRhLWVsZWN0ZWRdJykuIGVhY2ggKGlkeCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChlbGVtZW50KVxuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICMgR2V0IGFsbCBzdWIgZW50aXR5IGZpZWxkcy5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnc2VsZWN0JykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVsZW1lbnQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgQWRkIG9ubHkgaWYgYWxsIGZpZWxkcyBpcyBzZXQuXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgaWYgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09IDJcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNbJ2ZpZWxkcyddID0gZGF0YVxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNbJ2Fzc29jaWF0aW9ucyddID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNbJ2Fzc29jaWF0aW9ucyddW2VsZW1lbnQuYXR0cignZGF0YS1lbnRpdHktdHlwZScpXSA9IGVsZW1lbnQuYXR0cignZGF0YS1lbGVjdGVkJylcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRFbnRpdHlOYW1lID0gZWxlbWVudC5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyICdkYXRhLWVudGl0eS10eXBlJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoaWxkIHR5cGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBjaGlsZEVudGl0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hpbGQgZmllbGRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRzOiBmaWVsZHNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGNhdGVnb3J5LicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCB0eXBlLicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KClcbiAgICAgICAgICAgIG5ld1JlY29yZFtzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcblxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCB0eXBlLicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KClcbiAgICAgICAgICAgIG5ld1JlY29yZFtzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcblxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkU3RhdGVtZW50cydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgY2F0ZWdvcnkuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKTtcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcblxuICAgICAgICBzZW5kT2JqZWN0ID0ge1xuICAgICAgICAgICAgY3JlYXRlUmVxdWVzdDoge1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiB7IGZpZWxkczogbmV3UmVjb3JkLCBhc3NvY2lhdGlvbnM6IGFzc29jaWF0aW9ucywgY2hpbGRzOiBjaGlsZHN9LFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgQXBwZW5kIG5ldyBlbnRpdHkgdG8gdGFibGUuXG4gICAgICAgICMjI1xuICAgICAgICByb3dUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKFwiI3Jvdy0je21vZGFsVHlwZX1cIikuaHRtbCgpKTtcblxuICAgICAgICAjXG4gICAgICAgICMgQ29sbGVjdCBkYXRhLlxuICAgICAgICAjXG4gICAgICAgIGRhdGEgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHNlbmRPYmplY3QuY3JlYXRlUmVxdWVzdC5maWVsZHMuZmllbGRzXG4gICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgZGF0YVsndXNlciddID0gdXNlci51c2VybmFtZVxuXG4gICAgICAgIGlmIG1vZGFsVHlwZSBpcyAnYWRkVm90ZXMnXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgQ2hlY2sgaWYgdXNlciBzcGVjaWZpZWQgaG93IGN1cnJlbnQgZWxlY3RlZCBvZmZpY2lhbCB2b3RlZC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgYWRkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3Igb2JqIGluIHNlbmRPYmplY3QuY3JlYXRlUmVxdWVzdC5maWVsZHMuY2hpbGRzXG4gICAgICAgICAgICAgIGlmIE51bWJlcihvYmouZmllbGRzLmFzc29jaWF0aW9ucy5lbGVjdGVkT2ZmaWNpYWwpID09IE51bWJlcihwZXJzb24uaWQpXG4gICAgICAgICAgICAgICAgYWRkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIG9iai5maWVsZHMuZmllbGRzXG4gICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgSWYgd2UgZm91bmQsIHNob3cuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBpZiAoYWRkKVxuICAgICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAgICQoJyNWb3RlcyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBkYXRhLmNvbnRyaWJ1dG9yVHlwZSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgZGF0YS5jb250cmlidXRpb25BbW91bnQgPSBudW1lcmFsKGRhdGEuY29udHJpYnV0aW9uQW1vdW50KS5mb3JtYXQoJzAsMDAwJylcbiAgICAgICAgICAgICQoJyNDb250cmlidXRpb25zIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSk7XG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBkYXRhLmVuZG9yc2VyVHlwZSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgJCgnI0VuZG9yc2VtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkU3RhdGVtZW50cydcbiAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICQoJyNTdGF0ZW1lbnRzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgU2VuZCBjcmVhdGUgcmVxdWVzdCB0byBhcGkuXG4gICAgICAgICMjI1xuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2NyZWF0ZXJlcXVlc3QvY3JlYXRlJyxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqZWN0LFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICMgQ2xvc2UgbW9kYWwgd2luZG93XG4gICAgICAgIG1vZGFsLm1vZGFsICdoaWRlJ1xuXG4gICAgIyMjXG4gICAgICAgIElmIHVzZXIgdHJ5IHRvIGFkZCBvciB1cGRhdGUgc29tZSBkYXRhIHdpdGhvdXQgbG9nZ2VkIGluLCB3ZVxuICAgICAgICBzaG93IGhpbSBsb2dpbi9zaWduIHVwIHdpbmRvdy4gQWZ0ZXIgYXV0aG9yaXppbmcgdXNlciByZWRpcmVjdCBiYWNrXG4gICAgICAgIHRvIHBhZ2UsIHdoZXJlIGhlIHByZXMgYWRkL2VkaXQgYnV0dG9uLiBJbiB0aGF0IGNhc2Ugd2Ugc2hvdyBoaW0gYXBwcm9wcmlhdGVcbiAgICAgICAgbW9kYWwgd2luZG93LlxuXG4gICAgICAgIFRpbWVvdXQgbmVlZCBiZWNhdXNlIHdlIGRvbid0IGtub3cgd2hlbiB3ZSBnZXQgdXNlciBpbmZvcm1hdGlvbiBhbmQgZWxlY3RlZCBvZmZpY2lhbCBpbmZvcm1hdGlvbi5cbiAgICAjIyNcbiAgICB3aW5kb3cuc2V0VGltZW91dCggKCkgLT5cbiAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHR5cGUgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndGFibGVUeXBlJylcbiAgICAgIGRhdGFJZCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdkYXRhSWQnKVxuICAgICAgZmllbGQgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnZmllbGQnKVxuXG4gICAgICBpZiAoZGF0YUlkICYmIGZpZWxkKVxuICAgICAgICAkKCdhW2FyaWEtY29udHJvbHM9XCInICsgdHlwZSArICdcIl0nKS5jbGljaygpXG4gICAgICAgICQoJ3RyW2RhdGEtaWQ9JytkYXRhSWQrJ10nKS5maW5kKCd0ZDpudGgtY2hpbGQoJytmaWVsZCsnKScpLmZpbmQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3RhYmxlVHlwZScsICcnKVxuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZGF0YUlkJywgJycpXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdmaWVsZCcsICcnKVxuXG4gICAgICBlbHNlIGlmICh0eXBlKVxuICAgICAgICAkKCdkaXYjJyArIHR5cGUpLmZpbmQoJy5hZGQnKS5jbGljaygpXG4gICAgICAgICQoJ2FbYXJpYS1jb250cm9scz1cIicgKyB0eXBlICsgJ1wiXScpLmNsaWNrKClcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3RhYmxlVHlwZScsICcnKVxuICAgICxcbiAgICAyMDAwXG4gICAgKVxuXG5cbiMjI1xuICBBcHBlbmQgY3JlYXRlIHJlcXVlc3RzIHRvIGFsbCBjdXJyZW50IGVsZWN0ZWRPZmZpY2lhbCBwYWdlLlxuIyMjXG5zaG93Q3JlYXRlUmVxdWVzdHMgPSAocGVyc29uLCBjcmVhdGVSZXF1ZXN0cykgLT5cbiAgICAjIERvbid0IHNob3cgbm90IGFwcHJvdmVkIGNyZWF0ZSByZXF1ZXN0IHRvIGFub24uXG4gICAgaWYgKCFhdXRob3JpemVkKSB0aGVuIHJldHVyblxuXG4gICAgbGVnaXNsYXRpb25Sb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRWb3RlcycpLmh0bWwoKSlcbiAgICBjb250cmlidXRpb25Sb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRDb250cmlidXRpb25zJykuaHRtbCgpKVxuICAgIGVuZG9yc2VtZW50Um93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkRW5kb3JzZW1lbnRzJykuaHRtbCgpKVxuICAgIHN0YXRlbWVudFJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZFN0YXRlbWVudHMnKS5odG1sKCkpXG5cbiAgICBmb3IgcmVxdWVzdCBpbiBjcmVhdGVSZXF1ZXN0c1xuICAgICAgICAjXG4gICAgICAgICMgUHJlcGFyZSBjcmVhdGUgcmVxdWVzdCBkYXRhIGZvciB0ZW1wbGF0ZS5cbiAgICAgICAgI1xuICAgICAgICBkYXRhID0gcmVxdWVzdC5maWVsZHMuZmllbGRzXG4gICAgICAgIGRhdGFbJ3VzZXInXSA9IHJlcXVlc3QudXNlci51c2VybmFtZVxuXG4gICAgICAgICNcbiAgICAgICAgIyBGaW5kIG91dCB0ZW1wbGF0ZSBmb3IgY3VycmVudCByZXF1ZXN0IGFuZCBhZGRpdGlvbmFsIHZhbHVlcy5cbiAgICAgICAgI1xuICAgICAgICBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiTGVnaXNsYXRpb25cIlxuICAgICAgICAgICAgbmFtZSA9ICdWb3RlcydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gbGVnaXNsYXRpb25Sb3dcbiAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHJlcXVlc3QuZmllbGRzLmNoaWxkc1swXS5maWVsZHMuZmllbGRzXG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBjYXRlZ29yaWVzW3JlcXVlc3QuZmllbGRzLmFzc29jaWF0aW9ucy5pc3N1ZUNhdGVnb3J5IC0gMV0ubmFtZVxuXG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkNvbnRyaWJ1dGlvblwiXG4gICAgICAgICAgICBuYW1lID0gJ0NvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGNvbnRyaWJ1dGlvblJvd1xuXG4gICAgICAgICAgICBkYXRhWydjb250cmlidXRpb25BbW91bnQnXSA9IG51bWVyYWwoZGF0YVsnY29udHJpYnV0aW9uQW1vdW50J10pLmZvcm1hdCgnMCwwMDAnKVxuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJFbmRvcnNlbWVudFwiXG4gICAgICAgICAgICBuYW1lID0gJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gZW5kb3JzZW1lbnRSb3dcbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiUHVibGljU3RhdGVtZW50XCJcbiAgICAgICAgICAgIG5hbWUgPSAnU3RhdGVtZW50cydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gc3RhdGVtZW50Um93XG5cbiAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBjYXRlZ29yaWVzW3JlcXVlc3QuZmllbGRzLmFzc29jaWF0aW9ucy5pc3N1ZUNhdGVnb3J5IC0gMV0ubmFtZVxuXG4gICAgICAgICQoXCJcXCMje25hbWV9IHRyOmxhc3QtY2hpbGRcIikuYmVmb3JlKHRlbXBsYXRlKGRhdGEpKVxuXG4kKCcjZGF0YUNvbnRhaW5lcicpLm9uICdjbGljaycsICcuZWxlY3RlZF9saW5rJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVybCA9IGUuY3VycmVudFRhcmdldC5wYXRobmFtZVxuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHVybCxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cblxuICAgICAgICAgICAgICAgICAgICBwZXJzb24gPSBkYXRhLnBlcnNvblxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVSZXF1ZXN0cyA9IGRhdGEuY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllc1xuXG4gICAgICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNvbnRyaWJ1dGlvbiBpbiBwZXJzb24uY29udHJpYnV0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQgPSBudW1lcmFsKGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50KS5mb3JtYXQoJzAsMDAwJylcblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJ307XG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS50b0xvY2FsZVN0cmluZyAnZW4tVVMnLCBmb3JtYXRcblxuICAgICAgICAgICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBodG1sfSwgJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uKTtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuIyBSb3V0ZSAvXG5pZiByb3V0ZVR5cGUgaXMgMFxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIGdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICcvbGVnYWN5L2RhdGEvaF90eXBlc19jYV8yLmpzb24nLCA3XG4gICAgZ292X3NlbGVjdG9yLm9uX3NlbGVjdGVkID0gKGV2dCwgZGF0YSwgbmFtZSkgLT5cbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIHVybCA9ICcvJyArIGRhdGEuYWx0VHlwZVNsdWcgKyAnLycgKyBkYXRhLnNsdWdcbiAgICAgICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuICAgIGlmICF1bmRlZlxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaHRtbCAkKCcjc2VhcmNoLWNvbnRhaW5lci10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAjIExvYWQgaW50cm9kdWN0b3J5IHRleHQgZnJvbSB0ZXh0cy9pbnRyby10ZXh0Lmh0bWwgdG8gI2ludHJvLXRleHQgY29udGFpbmVyLlxuICAgICAgICAkLmdldCBcIi9sZWdhY3kvdGV4dHMvaW50cm8tdGV4dC5odG1sXCIsIChkYXRhKSAtPiAkKFwiI2ludHJvLXRleHRcIikuaHRtbCBkYXRhXG4gICAgICAgIGdvdm1hcCA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcbiAgICAgICAgZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29uc1xuICAgICAgICB1bmRlZiA9IHRydWVcbiAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuICAgIHN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGgoKVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkKCcjZ292bWFwJykub24gJ2NsaWNrJywgJy5pbmZvLXdpbmRvdy11cmknLCAoZSkgLT5cbiAgICAgICAgdXJpID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnVyaVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDJcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZS86ZWxlY3RlZF9uYW1lXG5pZiByb3V0ZVR5cGUgaXMgM1xuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiL2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cblxuICAgICAgICAgICAgcGVyc29uID0gZGF0YS5wZXJzb25cbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3RzID0gZGF0YS5jcmVhdGVSZXF1ZXN0c1xuICAgICAgICAgICAgY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllc1xuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgRm9ybWF0IGNvbnRyaWJ1dGlvbiBhbW91bnQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGZvciBjb250cmlidXRpb24gaW4gcGVyc29uLmNvbnRyaWJ1dGlvbnNcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCA9IG51bWVyYWwoY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQpLmZvcm1hdCgnMCwwMDAnKVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXG4gICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvcm1hdCA9IHt5ZWFyOiAnbnVtZXJpYycsIG1vbnRoOiAnbnVtZXJpYycsIGRheTogJ251bWVyaWMnfTtcbiAgICAgICAgICAgIGlmIHBlcnNvbi52b3RlcyAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBwZXJzb24udm90ZXMuZm9yRWFjaCAoaXRlbSwgaXRlbUxpc3QpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZDtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLnRvTG9jYWxlU3RyaW5nICdlbi1VUycsIGZvcm1hdFxuXG4gICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcblxuICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuXG4gICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuICAjIyNcbiAgICBHZXQgY3VycmVudCB1c2VyLlxuICAjIyNcbiAgJHVzZXJCdG4gPSAkKCcjdXNlcicpXG4gICR1c2VyQnRuTGluayA9ICR1c2VyQnRuLmZpbmQoJ2EnKTtcbiAgJC5hamF4ICcvYXBpL3VzZXInLCB7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBhc3luYzogZmFsc2UsXG4gICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgdXNlci51c2VybmFtZSA9IHJlc3BvbnNlLnVzZXJuYW1lO1xuICAgICAgYXV0aG9yaXplZCA9IHRydWU7XG5cbiAgICAgICR1c2VyVGV4dCA9ICQoJyN1c2VyLXRleHQnKS5maW5kKCdhJyk7XG4gICAgICAkdXNlclRleHQuaHRtbChcIkxvZ2dlZCBpbiBhcyAje3VzZXIudXNlcm5hbWV9XCIgKyAkdXNlclRleHQuaHRtbCgpKVxuICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJTaWduIE91dFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gJy9sb2dvdXQnXG5cbiAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIGF1dGhvcml6ZWQgPSBmYWxzZVxuICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJMb2dpbiAvIFNpZ24gVXBcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgfVxuIiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSBcbiAgICAgICAgbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLmdvdl9uYW1lLCB3b3JkcywgcmVncylcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXG4gICAgI2QuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpJylcbiAgW3dvcmRzLHJlZ3NdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWVyeU1hdGhlclxuXG4iLCJcbiMjI1xuIyBmaWxlOiB0ZW1wbGF0ZXMyLmNvZmZlZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jXG4jIENsYXNzIHRvIG1hbmFnZSB0ZW1wbGF0ZXMgYW5kIHJlbmRlciBkYXRhIG9uIGh0bWwgcGFnZS5cbiNcbiMgVGhlIG1haW4gbWV0aG9kIDogcmVuZGVyKGRhdGEpLCBnZXRfaHRtbChkYXRhKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5cblxuIyBMT0FEIEZJRUxEIE5BTUVTXG5maWVsZE5hbWVzID0ge31cbmZpZWxkTmFtZXNIZWxwID0ge31cblxuXG5yZW5kZXJfZmllbGRfdmFsdWUgPSAobixtYXNrLGRhdGEpIC0+XG4gIHY9ZGF0YVtuXVxuICBpZiBub3QgZGF0YVtuXVxuICAgIHJldHVybiAnJ1xuXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIGlmICcnICE9IG1hc2tcbiAgICAgIGlmIGRhdGFbbisnX3JhbmsnXSBhbmQgZGF0YS5tYXhfcmFua3MgYW5kIGRhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddXG4gICAgICAgIHYgPSBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgICAgICByZXR1cm4gXCIje3Z9IDxzcGFuIGNsYXNzPSdyYW5rJz4oI3tkYXRhW24rJ19yYW5rJ119IG9mICN7ZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ119KTwvc3Bhbj5cIlxuICAgICAgaWYgbiA9PSBcIm51bWJlcl9vZl9mdWxsX3RpbWVfZW1wbG95ZWVzXCJcbiAgICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KCcwLDAnKVxuICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KG1hc2spXG4gICAgZWxzZVxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmRcbiAgICAgIG4gPT0gXCJvcGVuX2Vucm9sbG1lbnRfc2Nob29sc1wiXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmRcbiAgICAgIG4gPT0gXCJwYXJlbnRfdHJpZ2dlcl9lbGlnaWJsZV9zY2hvb2xzXCJcbiAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMjFcbiAgICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMjEpXG4gICAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHZcblxuXG5yZW5kZXJfZmllbGRfbmFtZV9oZWxwID0gKGZOYW1lKSAtPlxuICAjaWYgZmllbGROYW1lc0hlbHBbZk5hbWVdXG4gICAgcmV0dXJuIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuXG5yZW5kZXJfZmllbGRfbmFtZSA9IChmTmFtZSkgLT5cbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XG4gICAgcmV0dXJuIGZpZWxkTmFtZXNbZk5hbWVdXG5cbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcbiAgcyA9IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKVxuICByZXR1cm4gc1xuXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gIGlmIFwiX1wiID09IHN1YnN0ciBmTmFtZSwgMCwgMVxuICAgIFwiXCJcIlxuICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiZuYnNwOzwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgZWxzZVxuICAgIHJldHVybiAnJyB1bmxlc3MgZlZhbHVlID0gZGF0YVtmTmFtZV1cbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nICA+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08ZGl2Pjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4je3JlbmRlcl9maWVsZF92YWx1ZShmTmFtZSxkYXRhKX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG5cbnJlbmRlcl9zdWJoZWFkaW5nID0gKGZOYW1lLCBtYXNrLCBub3RGaXJzdCktPlxuICBzID0gJydcbiAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmTmFtZVxuICBpZiBtYXNrID09IFwiaGVhZGluZ1wiXG4gICAgaWYgbm90Rmlyc3QgIT0gMFxuICAgICAgcyArPSBcIjxici8+XCJcbiAgICBzICs9IFwiPGRpdj48c3BhbiBjbGFzcz0nZi1uYW0nPiN7Zk5hbWV9PC9zcGFuPjxzcGFuIGNsYXNzPSdmLXZhbCc+IDwvc3Bhbj48L2Rpdj5cIlxuICByZXR1cm4gc1xuXG5yZW5kZXJfZmllbGRzID0gKGZpZWxkcyxkYXRhLHRlbXBsYXRlKS0+XG4gIGggPSAnJ1xuICBmb3IgZmllbGQsaSBpbiBmaWVsZHNcbiAgICBpZiAodHlwZW9mIGZpZWxkIGlzIFwib2JqZWN0XCIpXG4gICAgICBpZiBmaWVsZC5tYXNrID09IFwiaGVhZGluZ1wiXG4gICAgICAgIGggKz0gcmVuZGVyX3N1YmhlYWRpbmcoZmllbGQubmFtZSwgZmllbGQubWFzaywgaSlcbiAgICAgICAgZlZhbHVlID0gJydcbiAgICAgIGVsc2VcbiAgICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGRhdGFcbiAgICAgICAgaWYgKCcnICE9IGZWYWx1ZSBhbmQgZlZhbHVlICE9ICcwJylcbiAgICAgICAgICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZpZWxkLm5hbWVcbiAgICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZpZWxkLm5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZWYWx1ZSA9ICcnXG5cbiAgICBlbHNlXG4gICAgICBmVmFsdWUgPSByZW5kZXJfZmllbGRfdmFsdWUgZmllbGQsICcnLCBkYXRhXG4gICAgICBpZiAoJycgIT0gZlZhbHVlKVxuICAgICAgICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZpZWxkXG4gICAgICAgIGZOYW1lSGVscCA9IHJlbmRlcl9maWVsZF9uYW1lX2hlbHAgZk5hbWVcbiAgICBpZiAoJycgIT0gZlZhbHVlKVxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmTmFtZSwgdmFsdWU6IGZWYWx1ZSwgaGVscDogZk5hbWVIZWxwKVxuICByZXR1cm4gaFxuXG5yZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyA9IChkYXRhLHRlbXBsYXRlKS0+XG4gIGggPSAnJ1xuICBtYXNrID0gJzAsMCdcbiAgY2F0ZWdvcnkgPSAnJ1xuICBpc19maXJzdF9yb3cgPSBmYWxzZVxuICBmb3IgZmllbGQgaW4gZGF0YVxuICAgIGlmIGNhdGVnb3J5ICE9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGNhdGVnb3J5ID0gZmllbGQuY2F0ZWdvcnlfbmFtZVxuICAgICAgaWYgY2F0ZWdvcnkgPT0gJ092ZXJ2aWV3J1xuICAgICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IFwiPGI+XCIgKyBjYXRlZ29yeSArIFwiPC9iPlwiLCBnZW5mdW5kOiAnJywgb3RoZXJmdW5kczogJycsIHRvdGFsZnVuZHM6ICcnKVxuICAgICAgZWxzZSBpZiBjYXRlZ29yeSA9PSAnUmV2ZW51ZXMnXG4gICAgICAgIGggKz0gJzwvYnI+J1xuICAgICAgICBoICs9IFwiPGI+XCIgKyB0ZW1wbGF0ZShuYW1lOiBjYXRlZ29yeSwgZ2VuZnVuZDogXCJHZW5lcmFsIEZ1bmRcIiwgb3RoZXJmdW5kczogXCJPdGhlciBGdW5kc1wiLCB0b3RhbGZ1bmRzOiBcIlRvdGFsIEdvdi4gRnVuZHNcIikgKyBcIjwvYj5cIlxuICAgICAgICBpc19maXJzdF9yb3cgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGggKz0gJzwvYnI+J1xuICAgICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IFwiPGI+XCIgKyBjYXRlZ29yeSArIFwiPC9iPlwiLCBnZW5mdW5kOiAnJywgb3RoZXJmdW5kczogJycsIHRvdGFsZnVuZHM6ICcnKVxuICAgICAgICBpc19maXJzdF9yb3cgPSB0cnVlXG5cbiAgICBpZiBmaWVsZC5jYXB0aW9uID09ICdHZW5lcmFsIEZ1bmQgQmFsYW5jZScgb3IgZmllbGQuY2FwdGlvbiA9PSAnTG9uZyBUZXJtIERlYnQnXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgIGVsc2UgaWYgZmllbGQuY2FwdGlvbiBpbiBbJ1RvdGFsIFJldmVudWVzJywgJ1RvdGFsIEV4cGVuZGl0dXJlcycsICdTdXJwbHVzIC8gKERlZmljaXQpJ10gb3IgaXNfZmlyc3Rfcm93XG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JykpXG4gICAgICBpc19maXJzdF9yb3cgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzayksIG90aGVyZnVuZHM6IGN1cnJlbmN5KGZpZWxkLm90aGVyZnVuZHMsIG1hc2spLCB0b3RhbGZ1bmRzOiBjdXJyZW5jeShmaWVsZC50b3RhbGZ1bmRzLCBtYXNrKSlcbiAgcmV0dXJuIGhcblxudW5kZXIgPSAocykgLT4gcy5yZXBsYWNlKC9bXFxzXFwrXFwtXS9nLCAnXycpXG5cbnRvVGl0bGVDYXNlID0gKHN0cikgLT5cbiAgc3RyLnJlcGxhY2UgL1xcd1xcUyovZywgKHR4dCkgLT5cbiAgICB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKClcblxuY3VycmVuY3kgPSAobiwgbWFzaywgc2lnbiA9ICcnKSAtPlxuICAgIG4gPSBudW1lcmFsKG4pXG4gICAgaWYgbiA8IDBcbiAgICAgICAgcyA9IG4uZm9ybWF0KG1hc2spLnRvU3RyaW5nKClcbiAgICAgICAgcyA9IHMucmVwbGFjZSgvLS9nLCAnJylcbiAgICAgICAgcmV0dXJuIFwiKCN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK3MrJzwvc3Bhbj4nfSlcIlxuXG4gICAgbiA9IG4uZm9ybWF0KG1hc2spXG4gICAgcmV0dXJuIFwiI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrbisnPC9zcGFuPid9XCJcblxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEsIHRhYnNldCwgcGFyZW50KSAtPlxuICAjbGF5b3V0ID0gYWRkX290aGVyX3RhYl90b19sYXlvdXQgaW5pdGlhbF9sYXlvdXQsIGRhdGFcbiAgbGF5b3V0ID0gaW5pdGlhbF9sYXlvdXRcbiAgdGVtcGxhdGVzID0gcGFyZW50LnRlbXBsYXRlc1xuICBwbG90X2hhbmRsZXMgPSB7fVxuXG4gIGxheW91dF9kYXRhID1cbiAgICB0aXRsZTogZGF0YS5uYW1lXG4gICAgd2lraXBlZGlhX3BhZ2VfZXhpc3RzOiBkYXRhLndpa2lwZWRpYV9wYWdlX2V4aXN0c1xuICAgIHdpa2lwZWRpYV9wYWdlX25hbWU6ICBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICB0cmFuc3BhcmVudF9jYWxpZm9ybmlhX3BhZ2VfbmFtZTogZGF0YS50cmFuc3BhcmVudF9jYWxpZm9ybmlhX3BhZ2VfbmFtZVxuICAgIGxhdGVzdF9hdWRpdF91cmw6IGRhdGEubGF0ZXN0X2F1ZGl0X3VybFxuICAgIHRhYnM6IFtdXG4gICAgdGFiY29udGVudDogJydcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgbGF5b3V0X2RhdGEudGFicy5wdXNoXG4gICAgICB0YWJpZDogdW5kZXIodGFiLm5hbWUpLFxuICAgICAgdGFibmFtZTogdGFiLm5hbWUsXG4gICAgICBhY3RpdmU6IChpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnKVxuXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBkZXRhaWxfZGF0YSA9XG4gICAgICB0YWJpZDogdW5kZXIodGFiLm5hbWUpLFxuICAgICAgdGFibmFtZTogdGFiLm5hbWUsXG4gICAgICBhY3RpdmU6IChpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnKVxuICAgICAgdGFiY29udGVudDogJydcbiAgICBzd2l0Y2ggdGFiLm5hbWVcbiAgICAgIHdoZW4gJ092ZXJ2aWV3ICsgRWxlY3RlZCBPZmZpY2lhbHMnXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG4gICAgICAgIGZvciBvZmZpY2lhbCxpIGluIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHNcbiAgICAgICAgICBvZmZpY2lhbF9kYXRhID1cbiAgICAgICAgICAgIHRpdGxlOiBpZiAnJyAhPSBvZmZpY2lhbC50aXRsZSB0aGVuIFwiVGl0bGU6IFwiICsgb2ZmaWNpYWwudGl0bGVcbiAgICAgICAgICAgIG5hbWU6IGlmICcnICE9IG9mZmljaWFsLmZ1bGxfbmFtZSB0aGVuIFwiTmFtZTogXCIgKyBvZmZpY2lhbC5mdWxsX25hbWVcbiAgICAgICAgICAgIGVtYWlsOiBpZiBvZmZpY2lhbC5lbWFpbF9hZGRyZXNzIHRoZW4gXCJFbWFpbDogXCIgKyBvZmZpY2lhbC5lbWFpbF9hZGRyZXNzXG4gICAgICAgICAgICB0ZWxlcGhvbmVudW1iZXI6IGlmIG51bGwgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciBhbmQgdW5kZWZpbmVkICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgdGhlbiBcIlRlbGVwaG9uZSBOdW1iZXI6IFwiICsgb2ZmaWNpYWwudGVsZXBob25lX251bWJlclxuICAgICAgICAgICAgdGVybWV4cGlyZXM6IGlmIG9mZmljaWFsLnRlcm1fZXhwaXJlcyB0aGVuIFwiVGVybSBFeHBpcmVzOiBcIiArIG9mZmljaWFsLnRlcm1fZXhwaXJlcyBlbHNlIFwiVGVybSBFeHBpcmVzOiBcIlxuICAgICAgICAgICAgYWx0VHlwZVNsdWc6IGRhdGEuYWx0X3R5cGVfc2x1Z1xuICAgICAgICAgICAgbmFtZVNsdWc6IGRhdGEuc2x1Z1xuICAgICAgICAgICAgc2x1Zzogb2ZmaWNpYWwuc2x1Z1xuXG4gICAgICAgICAgaWYgJycgIT0gb2ZmaWNpYWwucGhvdG9fdXJsIGFuZCBvZmZpY2lhbC5waG90b191cmwgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICBvZmZpY2lhbF9kYXRhLmltYWdlID0gICc8aW1nIHNyYz1cIicrb2ZmaWNpYWwucGhvdG9fdXJsKydcIiBjbGFzcz1cInBvcnRyYWl0XCIgYWx0PVwiXCIgLz4nXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnJ1xuXG4gICAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1vZmZpY2lhbC10ZW1wbGF0ZSddKG9mZmljaWFsX2RhdGEpXG4gICAgICB3aGVuICdFbXBsb3llZSBDb21wZW5zYXRpb24nXG4gICAgICAgIGggPSAnJ1xuICAgICAgICBoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1lbXBsb3llZS1jb21wLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snbWVkaWFuLWNvbXAtZ3JhcGgnXVxuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBzbWFsbENoYXJ0V2lkdGggPSAzNDBcbiAgICAgICAgICBiaWdDaGFydFdpZHRoID0gNDcwXG5cbiAgICAgICAgICBpZiAkKHdpbmRvdykud2lkdGgoKSA8IDQ5MFxuICAgICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzAwXG4gICAgICAgICAgICBiaWdDaGFydFdpZHRoID0gMzAwXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gQ29tcGVuc2F0aW9uJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnQmVucy4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHRvVGl0bGVDYXNlIGRhdGEubmFtZSArICdcXG4gRW1wbG95ZWVzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3NhbGFyeV9wZXJfZnVsbF90aW1lX2VtcCddXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdBbGwgXFxuJyArIHRvVGl0bGVDYXNlIGRhdGEubmFtZSArICcgXFxuIFJlc2lkZW50cydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGdyb3VwaW5nU3ltYm9sOiAnLCcgLCBmcmFjdGlvbkRpZ2l0czogJzAnKVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMik7XG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBDb21wZW5zYXRpb24gLSBGdWxsIFRpbWUgV29ya2VyczogXFxuIEdvdmVybm1lbnQgdnMuIFByaXZhdGUgU2VjdG9yJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLWNvbXAtZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddID0nbWVkaWFuLWNvbXAtZ3JhcGgnXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fcGVuc2lvbl8zMF95ZWFyX3JldGlyZWUnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gUGVuc2lvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQZW5zaW9uIGZvciBcXG4gUmV0aXJlZSB3LyAzMCBZZWFycydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9wZW5zaW9uMzBfeWVhcl9yZXRpcmVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBQZW5zaW9uJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdiYXInOiB7XG4gICAgICAgICAgICAgICAgICdncm91cFdpZHRoJzogJzMwJSdcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tcGVuc2lvbi1ncmFwaCdcbiAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddID0nbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgSGVhbHRoJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICNwdWJsaWMgc2FmZXR5IHBpZVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1B1YmxpYyBTYWZldHkgRXhwZW5zZSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQdWJsaWMgU2FmZXR5IEV4cCdcbiAgICAgICAgICAgICAgICAgIDEgLSBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ090aGVyJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1B1YmxpYyBzYWZldHkgZXhwZW5zZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdzbGljZXMnOiB7IDE6IHtvZmZzZXQ6IDAuMn19XG4gICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA0NVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddID0ncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICNmaW4taGVhbHRoLXJldmVudWUgZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAjY29uc29sZS5sb2cgJyMjI2FsJytKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnUmV2LidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIFJldmVudWUgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBSZXZlbnVlIFBlciBcXG4gQ2FwaXRhIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWUnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgICAgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgI2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0V4cC4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSBcXG4gRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICBoID0gJydcbiAgICAgICAgICAjaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgICAgaCArPSByZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnXVxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAgICN0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGVcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJSZXZlbnVlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgUmV2ZW51ZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXSA9J3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiRXhwZW5kaXR1cmVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBFeHBlbmRpdHVyZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddID0ndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgIGVsc2VcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG5cbiAgICBsYXlvdXRfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLXRlbXBsYXRlJ10oZGV0YWlsX2RhdGEpXG4gIHJldHVybiB0ZW1wbGF0ZXNbJ3RhYnBhbmVsLXRlbXBsYXRlJ10obGF5b3V0X2RhdGEpXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXG5cblxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxuICAjY2xvbmUgdGhlIGxheW91dFxuICBsID0gJC5leHRlbmQgdHJ1ZSwgW10sIGxheW91dFxuICB0ID1cbiAgICBuYW1lOiBcIk90aGVyXCJcbiAgICBmaWVsZHM6IGdldF91bm1lbnRpb25lZF9maWVsZHMgbCwgZGF0YVxuXG4gIGwucHVzaCB0XG4gIHJldHVybiBsXG5cblxuIyBjb252ZXJ0cyB0YWIgdGVtcGxhdGUgZGVzY3JpYmVkIGluIGdvb2dsZSBmdXNpb24gdGFibGUgdG9cbiMgdGFiIHRlbXBsYXRlXG5jb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZT0odGVtcGwpIC0+XG4gIHRhYl9oYXNoPXt9XG4gIHRhYnM9W11cbiAgIyByZXR1cm5zIGhhc2ggb2YgZmllbGQgbmFtZXMgYW5kIHRoZWlyIHBvc2l0aW9ucyBpbiBhcnJheSBvZiBmaWVsZCBuYW1lc1xuICBnZXRfY29sX2hhc2ggPSAoY29sdW1ucykgLT5cbiAgICBjb2xfaGFzaCA9e31cbiAgICBjb2xfaGFzaFtjb2xfbmFtZV09aSBmb3IgY29sX25hbWUsaSBpbiB0ZW1wbC5jb2x1bW5zXG4gICAgcmV0dXJuIGNvbF9oYXNoXG5cbiAgIyByZXR1cm5zIGZpZWxkIHZhbHVlIGJ5IGl0cyBuYW1lLCBhcnJheSBvZiBmaWVsZHMsIGFuZCBoYXNoIG9mIGZpZWxkc1xuICB2YWwgPSAoZmllbGRfbmFtZSwgZmllbGRzLCBjb2xfaGFzaCkgLT5cbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXG5cbiAgIyBjb252ZXJ0cyBoYXNoIHRvIGFuIGFycmF5IHRlbXBsYXRlXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxuICAgIGEgPSBbXVxuICAgIGZvciBrIG9mIGhhc2hcbiAgICAgIHRhYiA9IHt9XG4gICAgICB0YWIubmFtZT1rXG4gICAgICB0YWIuZmllbGRzPWhhc2hba11cbiAgICAgIGEucHVzaCB0YWJcbiAgICByZXR1cm4gYVxuXG5cbiAgY29sX2hhc2ggPSBnZXRfY29sX2hhc2godGVtcGwuY29sX2hhc2gpXG4gIHBsYWNlaG9sZGVyX2NvdW50ID0gMFxuXG4gIGZvciByb3csaSBpbiB0ZW1wbC5yb3dzXG4gICAgY2F0ZWdvcnkgPSB2YWwgJ2dlbmVyYWxfY2F0ZWdvcnknLCByb3csIGNvbF9oYXNoXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgZmllbGRuYW1lID0gdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaFxuICAgIGlmIG5vdCBmaWVsZG5hbWUgdGhlbiBmaWVsZG5hbWUgPSBcIl9cIiArIFN0cmluZyArK3BsYWNlaG9sZGVyX2NvdW50XG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxuICAgIGZpZWxkTmFtZXNIZWxwW2ZpZWxkbmFtZV0gPSB2YWwgJ2hlbHBfdGV4dCcsIHJvdywgY29sX2hhc2hcbiAgICBpZiBjYXRlZ29yeVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldLnB1c2ggbjogdmFsKCduJywgcm93LCBjb2xfaGFzaCksIG5hbWU6IGZpZWxkbmFtZSwgbWFzazogdmFsKCdtYXNrJywgcm93LCBjb2xfaGFzaClcblxuICBjYXRlZ29yaWVzID0gT2JqZWN0LmtleXModGFiX2hhc2gpXG4gIGNhdGVnb3JpZXNfc29ydCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgaWYgbm90IGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV1cbiAgICAgIGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeV1bMF0ublxuICAgIGZpZWxkcyA9IFtdXG4gICAgZm9yIG9iaiBpbiB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICAgIGZpZWxkcy5wdXNoIG9ialxuICAgIGZpZWxkcy5zb3J0IChhLGIpIC0+XG4gICAgICByZXR1cm4gYS5uIC0gYi5uXG4gICAgdGFiX2hhc2hbY2F0ZWdvcnldID0gZmllbGRzXG5cbiAgY2F0ZWdvcmllc19hcnJheSA9IFtdXG4gIGZvciBjYXRlZ29yeSwgbiBvZiBjYXRlZ29yaWVzX3NvcnRcbiAgICBjYXRlZ29yaWVzX2FycmF5LnB1c2ggY2F0ZWdvcnk6IGNhdGVnb3J5LCBuOiBuXG4gIGNhdGVnb3JpZXNfYXJyYXkuc29ydCAoYSxiKSAtPlxuICAgIHJldHVybiBhLm4gLSBiLm5cblxuICB0YWJfbmV3aGFzaCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzX2FycmF5XG4gICAgdGFiX25ld2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldXG5cbiAgdGFicyA9IGhhc2hfdG9fYXJyYXkodGFiX25ld2hhc2gpXG4gIHJldHVybiB0YWJzXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG4gIEB0ZW1wbGF0ZXMgPSB1bmRlZmluZWRcbiAgQGRhdGEgPSB1bmRlZmluZWRcbiAgQGV2ZW50cyA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOigpIC0+XG4gICAgQGxpc3QgPSBbXVxuICAgIEBldmVudHMgPSB7fVxuICAgIHRlbXBsYXRlTGlzdCA9IFsndGFicGFuZWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJywgJ3BlcnNvbi1pbmZvLXRlbXBsYXRlJ11cbiAgICB0ZW1wbGF0ZVBhcnRpYWxzID0gWyd0YWItdGVtcGxhdGUnXVxuICAgIEB0ZW1wbGF0ZXMgPSB7fVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlTGlzdFxuICAgICAgQHRlbXBsYXRlc1t0ZW1wbGF0ZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlUGFydGlhbHNcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHRlbXBsYXRlLCAkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIHBhcmVudDp0aGlzXG4gICAgICBuYW1lOmxheW91dF9uYW1lXG4gICAgICByZW5kZXI6KGRhdCkgLT5cbiAgICAgICAgQHBhcmVudC5kYXRhID0gZGF0XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQsIHRoaXMsIEBwYXJlbnQpXG4gICAgICBiaW5kOiAodHBsX25hbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBpZiBub3QgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdID0gW2NhbGxiYWNrXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgIGFjdGl2YXRlOiAodHBsX25hbWUpIC0+XG4gICAgICAgIGlmIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIGZvciBlLGkgaW4gQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgICBlIHRwbF9uYW1lLCBAcGFyZW50LmRhdGFcblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcblxuICBsb2FkX2Z1c2lvbl90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICB0ID0gY29udmVydF9mdXNpb25fdGVtcGxhdGUgdGVtcGxhdGVfanNvblxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHQpXG5cblxuICBnZXRfbmFtZXM6IC0+XG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcblxuICBnZXRfaW5kZXhfYnlfbmFtZTogKG5hbWUpIC0+XG4gICAgZm9yIHQsaSBpbiBAbGlzdFxuICAgICAgaWYgdC5uYW1lIGlzIG5hbWUgdGhlbiBpXG4gICAgcmV0dXJuIC0xXG5cbiAgZ2V0X2h0bWw6IChpbmQsIGRhdGEpIC0+XG4gICAgaWYgKGluZCBpcyAtMSkgdGhlbiByZXR1cm4gIFwiXCJcblxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cbiAgYWN0aXZhdGU6IChpbmQsIHRwbF9uYW1lKSAtPlxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIEBsaXN0W2luZF0uYWN0aXZhdGUgdHBsX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZXMyXG4iLCIkIC0+XG4gICMkKCcjZ2V0V2lraXBlZGlhQXJ0aWNsZUJ1dHRvbicpLm9uICdjbGljaycsIC0+XG4gICMgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICNhbGVydGFsZXJ0IFwiaGlcIlxuICAjYWxlcnQgJChcIiN3aWtpcGVkaWFQYWdlTmFtZVwiKS50ZXh0KClcbiAgI2dldF93aWtpcGVkaWFfYXJ0aWNsZSgpXG4gIHdpbmRvdy5nZXRfd2lraXBlZGlhX2FydGljbGUgPSBnZXRfd2lraXBlZGlhX2FydGljbGVcbiAgd2luZG93LmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZSA9IGNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZVxuXG5nZXRfd2lraXBlZGlhX2FydGljbGU9KHMpLT5cbiAgYXJ0aWNsZV9uYW1lID0gcy5yZXBsYWNlIC8uKlxcLyhbXi9dKikkLywgXCIkMVwiXG4gICQuZ2V0SlNPTiBcImh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249cGFyc2UmcGFnZT0je2FydGljbGVfbmFtZX0mcHJvcD10ZXh0JmZvcm1hdD1qc29uJmNhbGxiYWNrPT9cIiwgKGpzb24pIC0+IFxuICAgICQoJyN3aWtpcGVkaWFUaXRsZScpLmh0bWwganNvbi5wYXJzZS50aXRsZVxuICAgICQoJyN3aWtpcGVkaWFBcnRpY2xlJykuaHRtbCBqc29uLnBhcnNlLnRleHRbXCIqXCJdXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhOm5vdCgucmVmZXJlbmNlcyBhKVwiKS5hdHRyIFwiaHJlZlwiLCAtPiAgXCJodHRwOi8vd3d3Lndpa2lwZWRpYS5vcmdcIiArICQodGhpcykuYXR0cihcImhyZWZcIilcbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImFcIikuYXR0ciBcInRhcmdldFwiLCBcIl9ibGFua1wiXG4gIFxuY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlPSAtPlxuICBhbGVydCBcIk5vdCBpbXBsZW1lbnRlZFwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2V0X3dpa2lwZWRpYV9hcnRpY2xlOmdldF93aWtpcGVkaWFfYXJ0aWNsZVxuIl19

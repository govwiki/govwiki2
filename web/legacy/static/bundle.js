(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var add_marker, bounds_timeout, geocode_addr, get_icon, get_records2, in_array, map, pinImage, pointsCacheLifetime, rebuild_filter, rerender_markers,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

bounds_timeout = void 0;

pointsCacheLifetime = 24 * 60 * 60 * 1000;

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
      textSize: 14,
      textColor: 'red',
      gridSize: 0,
      minimumClusterSize: 5,
      ignoreHidden: true,
      legend: {
        "City": "red",
        "School District": "blue",
        "Special District": "purple"
      }
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
  var data;
  data = window.localStorage.getItem('points');
  if (data) {
    return onsuccess(JSON.parse(data));
  } else {
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
  }
};

$(function() {
  var data, date;
  rebuild_filter();
  data = window.localStorage.getItem('points');
  date = new Date();
  if (data && ((Number(window.localStorage.getItem('points_last_update')) + pointsCacheLifetime) >= date.getTime())) {
    console.log('From cache');
    console.log(JSON.parse(data));
    GOVWIKI.markers = JSON.parse(data);
  } else {
    get_records2(GOVWIKI.gov_type_filter_2, function(data) {
      console.log('From server');
      window.localStorage.setItem('points', JSON.stringify(data));
      date = new Date();
      window.localStorage.setItem('points_last_update', date.getTime());
      return GOVWIKI.markers = data;
    });
  }
  rerender_markers();
  $('#legend li:not(.counties-trigger)').on('click', function() {
    var altType, hidden_field, i, len, marker, ref, value;
    $(this).toggleClass('active');
    hidden_field = $(this).find('input');
    value = hidden_field.val();
    hidden_field.val(value === '1' ? '0' : '1');
    altType = hidden_field.attr('name');
    rebuild_filter();
    ref = map.markers;
    for (i = 0, len = ref.length; i < len; i++) {
      marker = ref[i];
      if (marker.type === altType) {
        marker.setVisible(!marker.getVisible());
      }
    }
    return map.markerClusterer.repaint();
  });
  return $('#legend li.counties-trigger').on('click', function() {
    var i, j, len, len1, polygon, ref, ref1, results1, results2;
    $(this).toggleClass('active');
    if ($(this).hasClass('active')) {
      ref = map.polygons;
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        polygon = ref[i];
        results1.push(polygon.setVisible(true));
      }
      return results1;
    } else {
      ref1 = map.polygons;
      results2 = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        polygon = ref1[j];
        results2.push(polygon.setVisible(false));
      }
      return results2;
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
      return _circle('blue');
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
  var exist, marker;
  exist = in_array(rec.altType, GOVWIKI.gov_type_filter_2);
  if (exist === false) {
    return false;
  }
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(rec.latitude, rec.longitude),
    icon: get_icon(rec.altType),
    title: rec.name + ", " + rec.type,
    type: rec.altType
  });
  marker.addListener('click', function() {
    var url;
    $('#details').hide();
    $('#searchContainer').hide();
    $('#dataContainer').show();
    $('#wikipediaContainer').hide();
    $('.loader').show();
    $('#stantonIcon').show();
    $('#searchIcon').show();
    console.log('Click on marker');
    url = rec.altTypeSlug + "/" + rec.slug;
    console.log(url);
    return jQuery.get(url, {}, function(data) {
      if (data) {
        return $.ajax({
          url: "/api/government/" + url,
          dataType: 'json',
          cache: true,
          success: function(elected_officials_data) {
            var compiled_gov_template, govs;
            govs = elected_officials_data;
            $('.loader').hide();
            $('#details').show();
            compiled_gov_template = GOVWIKI.templates.get_html(0, govs);
            GOVWIKI.tplLoaded = true;
            window.history.pushState({
              template: compiled_gov_template
            }, 'CPC Civic Profiles', url);
            $('#details').html(compiled_gov_template);
            return GOVWIKI.show_data_page();
          },
          error: function(e) {
            return console.log(e);
          }
        });
      }
    });
  });
  return map.addMarker(marker);
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

Handlebars.registerHelper('debug', function(emberObject) {
  var context, i, j, len, len1, out, prop, ref;
  if (emberObject && emberObject.contexts) {
    out = '';
    ref = emberObject.contexts;
    for (i = 0, len = ref.length; i < len; i++) {
      context = ref[i];
      for (j = 0, len1 = context.length; j < len1; j++) {
        prop = context[j];
        out += prop + ": " + context[prop] + "\n";
      }
    }
    if (console && console.log) {
      return console.log("Debug\n----------------\n" + out);
    }
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

GOVWIKI.templates = templates;

GOVWIKI.tplLoaded = false;

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
              url: "/api/government" + uri,
              dataType: 'json',
              cache: true,
              success: function(govs) {
                var compiled_gov_template;
                compiled_gov_template = templates.get_html(0, govs);
                $('#details').html(compiled_gov_template);
                $('.loader').hide();
                $('#details').show();
                $('#searchIcon').show();
                GOVWIKI.tplLoaded = true;
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
  console.log('!!@#@');
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
    route = document.location.pathname.split('/').filter(function(itm) {
      if (itm !== "") {
        return itm;
      } else {
        return false;
      }
    });
    route = route.length;
    console.log(route);
    if (route === 0) {
      GOVWIKI.show_search_page();
    }
    if (route === 2) {
      $('#stantonIcon').hide();
    }
    if (route !== 0) {
      $('#details').html(event.state.template);
      return GOVWIKI.show_data_page();
    }
  } else {
    GOVWIKI.show_search_page();
    if (GOVWIKI.tplLoaded === false) {
      return document.location.reload();
    }
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
    if (field === 'vote' || field === 'didElectedOfficialProposeThis') {

      /*
        Current field owned by ElectedOfficialVote
       */
      entityType = 'ElectedOfficialVote';
      id = $(e.currentTarget).parent().find('span')[0].dataset.id;
    }
    sendObject = {
      editRequest: {
        entityName: entityType,
        entityId: id,
        changes: {}
      }
    };
    console.log(sendObject);
    sendObject.editRequest.changes[field] = params.newValue;
    sendObject.editRequest = JSON.stringify(sendObject.editRequest);
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
                urlContent.find('.url-content-img').hide();
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

$('#dataContainer').popover({
  placement: 'bottom',
  selector: '.rank',
  animation: true,
  template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <div class="popover-title-custom"> <h3 class="popover-title"></h3> <div class="popover-btn"> <a href="/rank_order">All ranks</button></a> </div> </div> <div class="popover-content"></div> </div>'
});

$('#dataContainer').on('click', function(e) {
  var $element, additionalRowsTpl, currentPage, fieldName, fieldNameInCamelCase, loadNewRows, loading, popoverContent, popoverOrder, popoverTpl, preloader, previousScrollTop;
  $element = $(e.target);
  popoverContent = $element.parent().find('.popover-content');
  fieldName = $element.attr('data-field');
  popoverTpl = $('#rankPopover').html();
  additionalRowsTpl = $('#additionalRows').html();
  preloader = popoverContent.find('loader');
  previousScrollTop = 0;
  currentPage = 0;
  loading = false;
  popoverOrder = null;
  if (!$element.closest('.popover')[0]) {
    $('.rank').not(e.target).popover('destroy');
  }
  loadNewRows = function(order) {
    var table;
    loading = true;
    popoverOrder = order;
    preloader.show();
    table = popoverContent.find('table tbody');
    table.html('');
    currentPage = 0;
    previousScrollTop = 0;
    return $.ajax({
      url: '/api/government' + window.location.pathname + '/get_ranks',
      dataType: 'json',
      data: {
        page: currentPage,
        order: order,
        field_name: fieldNameInCamelCase
      },
      success: function(data) {
        var compiledTemplate;
        compiledTemplate = Handlebars.compile(additionalRowsTpl);
        table.html(compiledTemplate(data));
        loading = false;
        return preloader.hide();
      }
    });
  };
  popoverContent.on('click', 'th', function(e) {
    var $column;
    $column = $(e.target).hasClass('sortable') ? $(e.target) : $(e.target).closest('th');;
    if ($column.hasClass('sortable')) {
      if ($column.hasClass('desc')) {
        loadNewRows('asc');
        $column.removeClass('desc').addClass('asc');
        return $column.find('i').removeClass('icon__bottom').addClass('icon__top');
      } else if ($column.hasClass('asc')) {
        loadNewRows('desc');
        $column.removeClass('asc').addClass('desc');
        return $column.find('i').removeClass('icon__top').addClass('icon__bottom');
      } else {
        loadNewRows('asc');
        $column.addClass('asc');
        return $column.find('i').addClass('icon__top');
      }
    }
  });
  if (fieldName) {
    fieldNameInCamelCase = fieldName.replace(/_([a-z0-9])/g, function(g) {
      return g[1].toUpperCase();
    });
    $.ajax({
      url: '/api/government' + window.location.pathname + '/get_ranks',
      dataType: 'json',
      data: {
        field_name: fieldNameInCamelCase
      },
      success: function(data) {
        var compiledTemplate;
        compiledTemplate = Handlebars.compile(popoverTpl);
        return popoverContent.html(compiledTemplate(data));
      }
    });
  }
  return popoverContent.scroll(function() {
    var currentScrollTop;
    currentScrollTop = popoverContent.scrollTop();
    if (previousScrollTop < currentScrollTop && currentScrollTop > 0.5 * popoverContent[0].scrollHeight) {
      console.log('asdasd');
      previousScrollTop = currentScrollTop;
      if (loading === false) {
        loading = true;
        preloader.show();
        return $.ajax({
          url: '/api/government' + window.location.pathname + '/get_ranks',
          dataType: 'json',
          data: {
            page: ++currentPage,
            order: popoverOrder,
            field_name: fieldNameInCamelCase
          },
          success: function(data) {
            var compiledTemplate;
            loading = false;
            preloader.hide();
            compiledTemplate = Handlebars.compile(additionalRowsTpl);
            popoverContent.find('table tbody')[0].innerHTML += compiledTemplate(data);
            return console.log(data);
          }
        });
      }
    }
  });
});

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
          var compiledTemplate, contribution, createRequests, html, i, len, person, ref, tpl;
          person = data.person;
          createRequests = data.createRequests;
          categories = data.categories;
          person.categories = data.categories;

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
          person.votes.forEach(function(item, itemList) {
            var date;
            date = moment(item.legislation.date_considered, 'YYYY-MM-DD');
            return item.legislation.date_considered = date.format('L');
          });
          tpl = $('#person-info-template').html();
          compiledTemplate = Handlebars.compile(tpl);
          $('.loader').hide();
          $('#details').show();
          html = compiledTemplate(person);
          GOVWIKI.tplLoaded = true;
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
          url: "/api/government" + url,
          dataType: 'json',
          cache: true,
          success: function(elected_officials_data) {
            var compiled_gov_template, govs;
            govs = elected_officials_data;
            $('.loader').hide();
            $('#details').show();
            compiled_gov_template = templates.get_html(0, govs);
            GOVWIKI.tplLoaded = true;
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
    GOVWIKI.tplLoaded = true;
    window.history.pushState({
      template: $('#searchContainer').html()
    }, 'CPC Civic Profiles', '/');
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
      url: "/api/government" + uri,
      dataType: 'json',
      cache: true,
      success: function(govs) {
        var compiled_gov_template;
        compiled_gov_template = templates.get_html(0, govs);
        $('#details').html(compiled_gov_template);
        $('.loader').hide();
        $('#details').show();
        $('#searchIcon').show();
        GOVWIKI.tplLoaded = true;
        return window.history.pushState({
          template: compiled_gov_template
        }, 'CPC Civic Profiles', uri);
      }
    });
  });
}

if (routeType === 1) {
  document.title = 'CPC Civic Profiles';
  $('#details').hide();
  $('#dataContainer').show();
  $('.loader').show();
  $('#wikipediaContainer').hide();
  $('#stantonIcon').hide();
  $.ajax({
    url: "/api/rank_order",
    dataType: 'json',
    cache: true,
    success: function(data) {
      var tpl;
      tpl = Handlebars.compile($('#rank-order-page').html());
      console.log(data);
      $('#details').html(tpl(data));
      $('.loader').hide();
      $('#details').show();
      GOVWIKI.show_data_page();
      return GOVWIKI.tplLoaded = true;
    }
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
    url: "/api/government" + window.path,
    dataType: 'json',
    cache: true,
    success: function(elected_officials_data) {
      var govs, run;
      govs = elected_officials_data;
      console.log('GOV:');
      console.log(govs);
      $('.loader').hide();
      $('#details').show();
      run = templates.get_html(0, govs);
      $('#details').html(run);
      activate_tab();
      GOVWIKI.show_data_page();
      GOVWIKI.tplLoaded = true;
      return window.history.pushState({
        template: run
      }, 'CPC Civic Profiles', window.path);
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
      var category, compiledTemplate, contribution, createRequests, html, i, j, len, len1, person, ref, tpl;
      person = data.person;
      createRequests = data.createRequests;
      categories = data.categories;
      person.category_select = [];

      /*
        Prepare options for select in IssuesCategory edit.
       */
      for (i = 0, len = categories.length; i < len; i++) {
        category = categories[i];
        person.category_select.push({
          value: category.id,
          text: category.name
        });
      }
      person.category_select = JSON.stringify(person.category_select);

      /*
        Format contribution amount.
       */
      ref = person.contributions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        contribution = ref[j];
        contribution.contribution_amount = numeral(contribution.contribution_amount).format('0,000');
      }
      console.log(person);
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
      if (person.votes !== void 0) {
        person.votes.forEach(function(item, itemList) {
          var date;
          date = moment(item.legislation.date_considered, 'YYYY-MM-DD');
          return item.legislation.date_considered = date.format('L');
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
  var title, v;
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
        title = n.toString();
        title = title.charAt(0).toUpperCase() + title.slice(1);
        title = title.replace(/_([a-z])/g, function(g) {
          return ' ' + g[1].toUpperCase();
        });
        return v + " <a class='rank' data-field='" + n + "_rank' title='" + title + " ranks'> (" + data[n + '_rank'] + " of " + data.max_ranks[n + '_max_rank'] + ")</a>";
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
          if (!data.hasOwnProperty('median_pension_30_year_retiree') || (data['median_pension_30_year_retiree'] === 0)) {
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
              chart = new google.visualization.ColumnChart(document.getElementById('median-pension-graph'));
              chart.draw(vis_data, options);
            }), 1000);
          };
          if (graph) {
            google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
          }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxnSkFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixtQkFBQSxHQUFzQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTs7QUFFckMsR0FBQSxHQUFVLElBQUEsS0FBQSxDQUNSO0VBQUEsRUFBQSxFQUFJLFNBQUo7RUFDQSxHQUFBLEVBQUssSUFETDtFQUVBLEdBQUEsRUFBSyxDQUFDLEtBRk47RUFHQSxJQUFBLEVBQU0sQ0FITjtFQUlBLE9BQUEsRUFBUyxDQUpUO0VBS0EsV0FBQSxFQUFhLElBTGI7RUFNQSxjQUFBLEVBQWdCLEtBTmhCO0VBT0EsVUFBQSxFQUFZLEtBUFo7RUFRQSxjQUFBLEVBQWdCLEtBUmhCO0VBU0EsV0FBQSxFQUFhLElBVGI7RUFVQSxrQkFBQSxFQUNFO0lBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMs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LE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxxQkFBQSxFQUFzQixxQkFBdEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYm91bmRzX3RpbWVvdXQ9dW5kZWZpbmVkXG4jIFNldCBsaWZldGltZSBvbiAxIGRheXMsIGZvcm1hdDogZGF5cyAqIGhvdXJzICogbWludXRlcyAqIHNlY29uZHMgKiBtaWxsaXNlY29uZHMuXG5wb2ludHNDYWNoZUxpZmV0aW1lID0gMjQgKiA2MCAqIDYwICogMTAwMDtcblxubWFwID0gbmV3IEdNYXBzXG4gIGVsOiAnI2dvdm1hcCdcbiAgbGF0OiAzNy4zXG4gIGxuZzogLTExOS4zXG4gIHpvb206IDZcbiAgbWluWm9vbTogNlxuICBzY3JvbGx3aGVlbDogdHJ1ZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgcGFuQ29udHJvbDogZmFsc2VcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHpvb21Db250cm9sOiB0cnVlXG4gIHpvb21Db250cm9sT3B0aW9uczpcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxuICBtYXJrZXJDbHVzdGVyZXI6IChtYXApIC0+XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIHRleHRTaXplOiAxNFxuICAgICAgdGV4dENvbG9yOiAncmVkJ1xuICAgICAgZ3JpZFNpemU6IDBcbiAgICAgIG1pbmltdW1DbHVzdGVyU2l6ZTogNSAjIEFsbG93IG1pbmltdW0gNSBtYXJrZXIgaW4gY2x1c3Rlci5cbiAgICAgIGlnbm9yZUhpZGRlbjogdHJ1ZSAjIERvbid0IHNob3cgaGlkZGVuIG1hcmtlcnMuIEluIHNvbWUgcmVhc29uIGRvbid0IHdvcmsgOihcbiAgICAgICMgRm9yIGRyYXcgY2hhcnQuXG4gICAgICBsZWdlbmQ6XG4gICAgICAgIFwiQ2l0eVwiIDogXCJyZWRcIlxuICAgICAgICBcIlNjaG9vbCBEaXN0cmljdFwiIDogXCJibHVlXCJcbiAgICAgICAgXCJTcGVjaWFsIERpc3RyaWN0XCIgOiBcInB1cnBsZVwiXG4gICAgfVxuICAgIHJldHVybiBuZXcgTWFya2VyQ2x1c3RlcmVyKG1hcCwgW10sIG9wdGlvbnMpO1xuXG5tYXAubWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5SSUdIVF9UT1BdLnB1c2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2VuZCcpKVxuXG5yZXJlbmRlcl9tYXJrZXJzID0gLT5cbiAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gR09WV0lLSS5tYXJrZXJzXG5cbnJlYnVpbGRfZmlsdGVyID0gLT5cbiAgaGFyZF9wYXJhbXMgPSBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnLCAnQ291bnR5J11cbiAgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiA9IFtdXG4gICQoJy50eXBlX2ZpbHRlcicpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgIGlmICQoZWxlbWVudCkuYXR0cignbmFtZScpIGluIGhhcmRfcGFyYW1zIGFuZCAkKGVsZW1lbnQpLnZhbCgpID09ICcxJ1xuICAgICAgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMi5wdXNoICQoZWxlbWVudCkuYXR0cignbmFtZScpXG5cbiMgbGVnZW5kVHlwZSA9IGNpdHksIHNjaG9vbCBkaXN0cmljdCwgc3BlY2lhbCBkaXN0cmljdCwgY291bnRpZXNcbmdldF9yZWNvcmRzMiA9IChsZWdlbmRUeXBlLCBvbnN1Y2Nlc3MpIC0+XG4gIGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BvaW50cycpO1xuICBpZiAoZGF0YSlcbiAgICAjXG4gICAgIyBSZXN0b3JlIG1hcmtlcnMgZGF0YSBmcm9tIGxvY2FsIHN0b3JhZ2UuXG4gICAgb25zdWNjZXNzIEpTT04ucGFyc2UoZGF0YSlcbiAgZWxzZVxuICAgICNcbiAgICAjIFJldHJpZXZlIG5ldyBtYXJrZXJzIGRhdGEgZnJvbSBzZXJ2ZXIuXG4gICAgJC5hamF4XG4gICAgICB1cmw6XCIvYXBpL2dvdmVybm1lbnQvZ2V0LW1hcmtlcnMtZGF0YVwiXG4gICMgICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgICAgZGF0YTogeyBhbHRUeXBlczogbGVnZW5kVHlwZSwgbGltaXQ6IDUwMDAgfVxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgICAgZXJyb3I6KGUpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuICByZWJ1aWxkX2ZpbHRlcigpXG4gIGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BvaW50cycpXG5cbiAgI1xuICAjIExvYWQgbWFya2VycyBkYXRhXG4gICNcbiAgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgaWYgZGF0YSBhbmQgKChOdW1iZXIod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwb2ludHNfbGFzdF91cGRhdGUnKSkgKyBwb2ludHNDYWNoZUxpZmV0aW1lKSA+PSBkYXRlLmdldFRpbWUoKSlcbiAgICAjXG4gICAgIyBJZiBwb2ludHMgZGF0YSBjYWNoZWQgaW4gbG9jYWwgc3RvcmFnZSBhbmQgaW4gYWN0dWFsIHN0YXRlLCBsb2FkIGZyb20gY2FjaGUuXG4gICAgI1xuICAgIGNvbnNvbGUubG9nKCdGcm9tIGNhY2hlJylcbiAgICBjb25zb2xlLmxvZyhKU09OLnBhcnNlKGRhdGEpKTtcbiAgICBHT1ZXSUtJLm1hcmtlcnMgPSBKU09OLnBhcnNlKGRhdGEpXG4gIGVsc2VcbiAgICAjXG4gICAgIyBHZXQgbmV3IGRhdGEgZnJvbSBzZXJ2ZXIuXG4gICAgI1xuICAgIGdldF9yZWNvcmRzMiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLCAoZGF0YSkgLT5cbiAgICAgICNcbiAgICAgICMgU3RvcmUgbWFya2VycyBkYXRhLlxuICAgICAgI1xuICAgICAgY29uc29sZS5sb2coJ0Zyb20gc2VydmVyJylcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncG9pbnRzJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncG9pbnRzX2xhc3RfdXBkYXRlJywgZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBHT1ZXSUtJLm1hcmtlcnMgPSBkYXRhXG5cbiAgI1xuICAjIFJlbmRlciBwb2ludHMgc3RvcmVkIGluIEdPVldJS0kubWFya2Vyc1xuICAjXG4gIHJlcmVuZGVyX21hcmtlcnMoKVxuXG4gICQoJyNsZWdlbmQgbGk6bm90KC5jb3VudGllcy10cmlnZ2VyKScpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBoaWRkZW5fZmllbGQgPSAkKHRoaXMpLmZpbmQoJ2lucHV0JylcbiAgICB2YWx1ZSA9IGhpZGRlbl9maWVsZC52YWwoKVxuICAgIGhpZGRlbl9maWVsZC52YWwoaWYgdmFsdWUgPT0gJzEnIHRoZW4gJzAnIGVsc2UgJzEnKVxuICAgICNcbiAgICAjIENsaWNrZWQgbGVnZW5kIGFsdCB0eXBlLlxuICAgIGFsdFR5cGUgPSBoaWRkZW5fZmllbGQuYXR0cignbmFtZScpXG5cbiAgICByZWJ1aWxkX2ZpbHRlcigpXG5cbiAgICAjXG4gICAgIyBUb2dnbGUgbWFya2VyIHZpc2libGUgd2l0aCB0eXBlIGVxdWFsIHRvIGNsaWNrZWQgbGVnZW5kLlxuICAgICNcbiAgICBmb3IgbWFya2VyIGluIG1hcC5tYXJrZXJzXG4gICAgICBpZiBtYXJrZXIudHlwZSBpcyBhbHRUeXBlXG4gICAgICAgICMgUmVtb3ZlfGFkZCBtYXJrZXJzIGZyb20gY2x1c3RlciBiZWNhdXNlIE1hcmtlckNsdXN0ZXIgaWdub3JlXG4gICAgICAgICMgaGlzIG9wdGlvbiAnaWdub3JlSGlkZGVuJy5cbiMgICAgICAgIGlmICh2YWx1ZSBpcyAnMScpXG4jICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVtb3ZlTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiMgICAgICAgIGVsc2VcbiMgICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5hZGRNYXJrZXIobWFya2VyLCB0cnVlKVxuICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZSghIG1hcmtlci5nZXRWaXNpYmxlKCkpXG5cbiAgICBtYXAubWFya2VyQ2x1c3RlcmVyLnJlcGFpbnQoKTtcblxuICAkKCcjbGVnZW5kIGxpLmNvdW50aWVzLXRyaWdnZXInKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaWYgJCh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJylcbiAgICAgICNcbiAgICAgICMgU2hvdyBjb3VudGllcy5cbiAgICAgICNcbiAgICAgIGZvciBwb2x5Z29uIGluIG1hcC5wb2x5Z29uc1xuICAgICAgICBwb2x5Z29uLnNldFZpc2libGUodHJ1ZSlcbiAgICBlbHNlXG4gICAgICAjXG4gICAgICAjIEhpZGUgY291bnRpZXMuXG4gICAgICAjXG4gICAgICBmb3IgcG9seWdvbiBpbiBtYXAucG9seWdvbnNcbiAgICAgICAgcG9seWdvbi5zZXRWaXNpYmxlKGZhbHNlKVxuXG5cblxuXG5cbmdldF9pY29uID0oYWx0X3R5cGUpIC0+XG5cbiAgX2NpcmNsZSA9KGNvbG9yKS0+XG4gICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEVcbiAgICBmaWxsT3BhY2l0eTogMVxuICAgIGZpbGxDb2xvcjogY29sb3JcbiAgICBzdHJva2VXZWlnaHQ6IDFcbiAgICBzdHJva2VDb2xvcjogJ3doaXRlJ1xuICAgICNzdHJva2VQb3NpdGlvbjogZ29vZ2xlLm1hcHMuU3Ryb2tlUG9zaXRpb24uT1VUU0lERVxuICAgIHNjYWxlOiA2XG5cbiAgc3dpdGNoIGFsdF90eXBlXG4gICAgd2hlbiAnQ2l0eScgdGhlbiByZXR1cm4gX2NpcmNsZSAncmVkJ1xuICAgIHdoZW4gJ1NjaG9vbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAnYmx1ZSdcbiAgICB3aGVuICdTcGVjaWFsIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdwdXJwbGUnXG4gICAgZWxzZSByZXR1cm4gX2NpcmNsZSAnd2hpdGUnXG5cbmluX2FycmF5ID0gKG15X2l0ZW0sIG15X2FycmF5KSAtPlxuICBmb3IgaXRlbSBpbiBteV9hcnJheVxuICAgIHJldHVybiB0cnVlIGlmIGl0ZW0gPT0gbXlfaXRlbVxuICBmYWxzZVxuXG5cbmFkZF9tYXJrZXIgPSAocmVjKS0+XG4gICNjb25zb2xlLmxvZyBcIiN7cmVjLnJhbmR9ICN7cmVjLmluY19pZH0gI3tyZWMuemlwfSAje3JlYy5sYXRpdHVkZX0gI3tyZWMubG9uZ2l0dWRlfSAje3JlYy5nb3ZfbmFtZX1cIlxuICBleGlzdCA9IGluX2FycmF5IHJlYy5hbHRUeXBlLCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yXG4gIGlmIGV4aXN0IGlzIGZhbHNlIHRoZW4gcmV0dXJuIGZhbHNlXG5cbiAgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcocmVjLmxhdGl0dWRlLCByZWMubG9uZ2l0dWRlKVxuICAgIGljb246IGdldF9pY29uKHJlYy5hbHRUeXBlKVxuICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIixcbiMgICAgdGl0bGU6IFwiI3tyZWMuYWx0VHlwZX1cIlxuICAgICNcbiAgICAjIEZvciBsZWdlbmQgY2xpY2sgaGFuZGxlci5cbiAgICB0eXBlOiByZWMuYWx0VHlwZVxuICB9KVxuICAjXG4gICMgT24gY2xpY2sgcmVkaXJlY3QgdXNlciB0byBlbnRpdHkgcGFnZS5cbiAgI1xuICBtYXJrZXIuYWRkTGlzdGVuZXIgJ2NsaWNrJywgKCkgLT5cbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICBjb25zb2xlLmxvZygnQ2xpY2sgb24gbWFya2VyJyk7XG4gICAgdXJsID0gXCIje3JlYy5hbHRUeXBlU2x1Z30vI3tyZWMuc2x1Z31cIlxuICAgIGNvbnNvbGUubG9nKHVybCk7XG4gICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGFcbiAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmwsXG4gICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudC9cIiArIHVybCxcbiAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gR09WV0lLSS50ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVybFxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuICBtYXAuYWRkTWFya2VyIG1hcmtlclxuXG4jICBtYXAuYWRkTWFya2VyXG4jICAgIGxhdDogcmVjLmxhdGl0dWRlXG4jICAgIGxuZzogcmVjLmxvbmdpdHVkZVxuIyAgICBpY29uOiBnZXRfaWNvbihyZWMuYWx0VHlwZSlcbiMgICAgdGl0bGU6ICBcIiN7cmVjLm5hbWV9LCAje3JlYy50eXBlfVwiXG4jICAgIGluZm9XaW5kb3c6XG4jICAgICAgY29udGVudDogXCJcbiMgICAgICAgIDxkaXY+PGEgaHJlZj0namF2YXNjcmlwdDp2b2lkKDApOycgY2xhc3M9J2luZm8td2luZG93LXVyaScgZGF0YS11cmk9Jy8je3JlYy5hbHRUeXBlU2x1Z30vI3tyZWMuc2x1Z30nPjxzdHJvbmc+I3tyZWMubmFtZX08L3N0cm9uZz48L2E+PC9kaXY+XG4jICAgICAgICA8ZGl2PiAje3JlYy50eXBlfSAgI3tyZWMuY2l0eX0gI3tyZWMuemlwfSAje3JlYy5zdGF0ZX08L2Rpdj5cIlxuXG5cblxuIyBHRU9DT0RJTkcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5waW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cbiAgR01hcHMuZ2VvY29kZVxuICAgIGFkZHJlc3M6IGFkZHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cbiAgICAgIGlmIHN0YXR1cyA9PSAnT0snXG4gICAgICAgIGxhdGxuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxuICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgbGF0OiBsYXRsbmcubGF0KClcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxuICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICB0aXRsZTogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICBjb250ZW50OiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG5cbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgbWFwOiBtYXBcbiIsIlxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXR5cGVcIj57e3tnb3ZfdHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBnb3ZzX2FycmF5ID0gW11cblxuICBjb3VudF9nb3ZzIDogKCkgLT5cbiAgICBjb3VudCA9MFxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgY291bnQrK1xuICAgIHJldHVybiBjb3VudFxuXG5cbiAgc3RhcnRTdWdnZXN0aW9uIDogKGdvdnMpID0+XG4gICAgI0Bnb3ZzX2FycmF5ID0gZ292c1xuICAgIEBnb3ZzX2FycmF5ID0gZ292cy5yZWNvcmRcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAsIDEwMDBcblxuICAgICQoQGh0bWxfc2VsZWN0b3IpLnR5cGVhaGVhZChcbiAgICAgICAgaGludDogZmFsc2VcbiAgICAgICAgaGlnaGxpZ2h0OiBmYWxzZVxuICAgICAgICBtaW5MZW5ndGg6IDFcbiAgICAgICAgY2xhc3NOYW1lczpcbiAgICAgICAgXHRtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2dvdl9uYW1lJ1xuICAgICAgICBkaXNwbGF5S2V5OiAnZ292X25hbWUnXG4gICAgICAgIHNvdXJjZTogcXVlcnlfbWF0Y2hlcihAZ292c19hcnJheSwgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICMgJCgnLmdvdi1jb3VudGVyJykudGV4dCBAY291bnRfZ292cygpXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIiMjI1xuZmlsZTogbWFpbi5jb2ZmZSAtLSBUaGUgZW50cnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgOlxuZ292X2ZpbmRlciA9IG5ldyBHb3ZGaW5kZXJcbmdvdl9kZXRhaWxzID0gbmV3IEdvdkRldGFpbHNcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5Hb3ZTZWxlY3RvciA9IHJlcXVpcmUgJy4vZ292c2VsZWN0b3IuY29mZmVlJ1xuI19qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG53aWtpcGVkaWEgPSByZXF1aXJlICcuL3dpa2lwZWRpYS5jb2ZmZWUnXG5cbmdvdm1hcCA9IG51bGxcbmdvdl9zZWxlY3RvciA9IG51bGxcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5hY3RpdmVfdGFiID0gXCJcIlxudW5kZWYgPSBudWxsXG5hdXRob3JpemVkID0gZmFsc2VcbiNcbiMgSW5mb3JtYXRpb24gYWJvdXQgY3VycmVudCB1c2VyLlxuI1xudXNlciA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiNcbiMgSXNzdWVzIGNhdGVnb3J5LCBmaWxsIGluIGVsZWN0ZWQgb2ZmaWNpYWwgcGFnZS5cbiNcbmNhdGVnb3JpZXMgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2lmX2VxJywgKGEsIGIsIG9wdHMpIC0+XG4gICAgaWYgYGEgPT0gYmBcbiAgICAgICAgcmV0dXJuIG9wdHMuZm4gdGhpc1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG9wdHMuaW52ZXJzZSB0aGlzXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2RlYnVnJywgKGVtYmVyT2JqZWN0KSAtPlxuICBpZiBlbWJlck9iamVjdCBhbmQgZW1iZXJPYmplY3QuY29udGV4dHNcbiAgICBvdXQgPSAnJztcblxuICAgIGZvciBjb250ZXh0IGluIGVtYmVyT2JqZWN0LmNvbnRleHRzXG4gICAgICBmb3IgcHJvcCBpbiBjb250ZXh0XG4gICAgICAgIG91dCArPSBwcm9wICsgXCI6IFwiICsgY29udGV4dFtwcm9wXSArIFwiXFxuXCJcblxuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKVxuICAgICAgICBjb25zb2xlLmxvZyhcIkRlYnVnXFxuLS0tLS0tLS0tLS0tLS0tLVxcblwiICsgb3V0KVxuXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgICBzdGF0ZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcl8yOiBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuXG4gICAgc2hvd19zZWFyY2hfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgIGZvY3VzX3NlYXJjaF9maWVsZCA1MDBcblxuICAgIHNob3dfZGF0YV9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcblxuR09WV0lLSS50ZW1wbGF0ZXMgPSB0ZW1wbGF0ZXM7XG5HT1ZXSUtJLnRwbExvYWRlZCA9IGZhbHNlXG5cbkdPVldJS0kuZ2V0X2NvdW50aWVzID0gZ2V0X2NvdW50aWVzID0gKGNhbGxiYWNrKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICcvbGVnYWN5L2RhdGEvY291bnR5X2dlb2dyYXBoeV9jYV8yLmpzb24nXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGNvdW50aWVzSlNPTikgLT5cbiAgICAgICAgICAgIGNhbGxiYWNrIGNvdW50aWVzSlNPTlxuXG5HT1ZXSUtJLmRyYXdfcG9seWdvbnMgPSBkcmF3X3BvbHlnb25zID0gKGNvdW50aWVzSlNPTikgLT5cbiAgICBmb3IgY291bnR5IGluIGNvdW50aWVzSlNPTi5mZWF0dXJlc1xuICAgICAgICBkbyAoY291bnR5KSA9PlxuICAgICAgICAgICAgZ292bWFwLm1hcC5kcmF3UG9seWdvbih7XG4gICAgICAgICAgICAgICAgcGF0aHM6IGNvdW50eS5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgICAgICAgICAgICAgIHVzZUdlb0pTT046IHRydWVcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyM4MDgwODAnXG4gICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC42XG4gICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAxLjVcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjE1XG4gICAgICAgICAgICAgICAgY291bnR5SWQ6IGNvdW50eS5wcm9wZXJ0aWVzLl9pZFxuICAgICAgICAgICAgICAgIGFsdE5hbWU6IGNvdW50eS5wcm9wZXJ0aWVzLmFsdF9uYW1lXG4gICAgICAgICAgICAgICAgbWFya2VyOiBuZXcgTWFya2VyV2l0aExhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMCwgMCksXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlT25EcmFnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBnb3ZtYXAubWFwLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDb250ZW50OiBjb3VudHkucHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KC0xNSwgMjUpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENsYXNzOiBcImxhYmVsLXRvb2x0aXBcIixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHlsZToge29wYWNpdHk6IDEuMH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xeDFcIixcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIG1vdXNlb3ZlcjogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiIzAwRkYwMFwifSlcbiAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IChldmVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0UG9zaXRpb24oZXZlbnQubGF0TG5nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKHRydWUpXG4gICAgICAgICAgICAgICAgbW91c2VvdXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiNGRjAwMDBcIn0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoZmFsc2UpXG4gICAgICAgICAgICAgICAgY2xpY2s6IC0+XG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB1cmkgPSBcIi8je2NvdW50eS5hbHRfdHlwZV9zbHVnfS8je2NvdW50eS5wcm9wZXJ0aWVzLnNsdWd9XCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcbiAgICAgICAgICAgIH0pXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPSAobmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XG4gICAgYWN0aXZlX3RhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd0YWJuYW1lJylcbiAgICBjb25zb2xlLmxvZyBhY3RpdmVfdGFiXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAkKCQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgdGVtcGxhdGVzLmFjdGl2YXRlIDAsIGFjdGl2ZV90YWJcblxuICAgIGlmIGFjdGl2ZV90YWIgPT0gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gMFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgyICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgzICsgMjcpXG5cbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxuXG5hY3RpdmF0ZV90YWIgPSAoKSAtPlxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxuICAgIGNvbnNvbGUubG9nKCchIUAjQCcpO1xuIyBjbGVhciB3aWtpcGVkaWEgcGxhY2VcbiAgICAkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKFwiXCIpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICBnZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgZGF0YS5faWQsIChkYXRhMiwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMgPSBkYXRhMlxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YTNcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldF9tYXhfcmFua3MgKG1heF9yYW5rc19yZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjVE9ETzogRW5hYmxlIGFmdGVyIHJlYWxpemUgbWF4X3JhbmtzIGFwaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG5cbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcbiAgICAgICAgICAgICN3cG4gPSBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICAgICAgICAgICMkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKGlmIHdwbiB0aGVuIHdwbiBlbHNlIFwiTm8gV2lraXBlZGlhIGFydGljbGVcIilcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzkvYXBpL2dvdmVybm1lbnQvXCIgKyBhbHRfdHlwZSArICcvJyArIGdvdl9uYW1lXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvX3Byb2MvZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzXCJcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiBcImdvdndpa2lcIlxuICAgICAgICAgICAgb3JkZXI6IFwiY2FwdGlvbl9jYXRlZ29yeSxkaXNwbGF5X29yZGVyXCJcbiAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ292c19pZFwiXG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZTogXCJJTlwiXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxuICAgICAgICAgICAgXVxuXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfbWF4X3JhbmtzID0gKG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6ICdnb3Z3aWtpJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCA9IChyZWMpPT5cbiAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICBhY3RpdmF0ZV90YWIoKVxuICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIHJvdXRlci5uYXZpZ2F0ZShyZWMuX2lkKVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkMiA9IChyZWMpPT5cbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICByZWMuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9IHVybFxuXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcbiAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXNcbiAgICAgICAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgdmFsdWVzLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgICBzICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBzZWxlY3QgPSAkKHMpXG4gICAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG5cbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgICBpZiB0ZXh0IGlzICdTdGF0ZS4uJ1xuICAgICAgICBzZWxlY3QudmFsICdDQSdcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xuXG4gICAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgaW5wID0gJCgnI215aW5wdXQnKVxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxuICAgIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cbnN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgICQod2luZG93KS5yZXNpemUgLT5cbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcblxuXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoZSkgLT5cbiAgICBoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBpZiBub3QgaFxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5yb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcblxuR09WV0lLSS5oaXN0b3J5ID0gKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID09IDBcbiAgICAgICAgc2VhcmNoQ29udGFpbmVyID0gJCgnI3NlYXJjaENvbnRhaW5lcicpLnRleHQoKTtcbiAgICAgICAgaWYoc2VhcmNoQ29udGFpbmVyICE9ICcnKVxuIyAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7fSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvJ1xuICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJ1xuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIChoaXN0b3J5LnN0YXRlICE9IG51bGwgJiYgaGlzdG9yeS5zdGF0ZS50ZW1wbGF0ZSAhPSB1bmRlZmluZWQpXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LmdvKGluZGV4KTtcbiAgICBlbHNlXG4gICAgICAgIHJvdXRlLnBvcCgpXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nICsgcm91dGUuam9pbignLycpXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb3BzdGF0ZScsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyh3aW5kb3cuaGlzdG9yeS5zdGF0ZSlcbiAgICBpZiB3aW5kb3cuaGlzdG9yeS5zdGF0ZSBpc250IG51bGxcbiAgICAgICAgcm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcigoaXRtKS0+IGlmIGl0bSBpc250IFwiXCIgdGhlbiBpdG0gZWxzZSBmYWxzZSk7XG4gICAgICAgIHJvdXRlID0gcm91dGUubGVuZ3RoO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJvdXRlKVxuICAgICAgICBpZiByb3V0ZSBpcyAwXG4gICAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgICAgICBpZiByb3V0ZSBpcyAyXG4gICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpO1xuICAgICAgICBpZiByb3V0ZSBpc250IDBcbiAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgZXZlbnQuc3RhdGUudGVtcGxhdGVcbiAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICBlbHNlXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG4gICAgICAgIGlmIEdPVldJS0kudHBsTG9hZGVkIGlzIGZhbHNlIHRoZW4gZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcbnJlZnJlc2hfZGlzcXVzID0gKG5ld0lkZW50aWZpZXIsIG5ld1VybCwgbmV3VGl0bGUpIC0+XG4gICAgRElTUVVTLnJlc2V0XG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiAoKSAtPlxuICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXG4gICAgICAgICAgICB0aGlzLnBhZ2UudGl0bGUgPSBuZXdUaXRsZVxuXG4jXG4jIFNvcnQgdGFibGUgYnkgY29sdW1uLlxuIyBAcGFyYW0gc3RyaW5nIHRhYmxlICBKUXVlcnkgc2VsZWN0b3IuXG4jIEBwYXJhbSBudW1iZXIgY29sTnVtIENvbHVtbiBudW1iZXIuXG4jXG5zb3J0VGFibGUgPSAodGFibGUsIGNvbE51bSkgLT5cbiAgICAjXG4gICAgIyBEYXRhIHJvd3MgdG8gc29ydFxuICAgICNcbiAgICByb3dzID0gJCh0YWJsZSArICcgdGJvZHkgIFtkYXRhLWlkXScpLmdldCgpXG4gICAgI1xuICAgICMgTGFzdCByb3cgd2hpY2ggY29udGFpbnMgXCJBZGQgbmV3IC4uLlwiXG4gICAgI1xuICAgIGxhc3RSb3cgPSAkKHRhYmxlICsgJyB0Ym9keSAgdHI6bGFzdCcpLmdldCgpO1xuICAgICNcbiAgICAjIENsaWNrZWQgY29sdW1uLlxuICAgICNcbiAgICBjb2x1bW4gPSAkKHRhYmxlICsgJyB0Ym9keSB0cjpmaXJzdCcpLmNoaWxkcmVuKCd0aCcpLmVxKGNvbE51bSlcbiAgICBtYWtlU29ydCA9IHRydWVcblxuICAgIGlmIGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgICAgICMgUmVzdG9yZSByb3cgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5hZGRDbGFzcygnb3JpZ2luJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX2JvdHRvbScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKVxuICAgICAgcm93cyA9IGNvbHVtbi5kYXRhKCdvcmlnaW4nKVxuICAgICAgbWFrZVNvcnQgPSBmYWxzZTtcbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnYXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gZGVzYyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnYXNjJykuYWRkQ2xhc3MoJ2Rlc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykuYWRkQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAtMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ29yaWdpbicpXG4gICAgICAjXG4gICAgICAjIE9yaWdpbmFsIHRhYmxlIGRhdGEgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdvcmlnaW4nKS5hZGRDbGFzcygnYXNjJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgVGFibGUgbm90IG9yZGVyZWQgeWV0LlxuICAgICAgIyBTdG9yZSBvcmlnaW5hbCBkYXRhIHBvc2l0aW9uIGFuZCBzb3J0IGluIGFzYyBvcmRlci5cbiAgICAgICNcblxuICAgICAgY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmRhdGEoJ29yaWdpbicsIHJvd3Muc2xpY2UoMCkpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIGlmIEEgPCBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcblxuICAgIGlmIChtYWtlU29ydCkgdGhlbiByb3dzLnNvcnQgc29ydEZ1bmN0aW9uXG4gICAgJC5lYWNoIHJvd3MsIChpbmRleCwgcm93KSAtPlxuICAgICAgICAkKHRhYmxlKS5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQocm93KVxuICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChsYXN0Um93KVxuXG5pbml0VGFibGVIYW5kbGVycyA9IChwZXJzb24pIC0+XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKVxuXG4gICAgJCgnLmVkaXRhYmxlJykuZWRpdGFibGUoe3N0eWxlc2hlZXRzOiBmYWxzZSx0eXBlOiAndGV4dGFyZWEnLCBzaG93YnV0dG9uczogJ2JvdHRvbScsIGRpc3BsYXk6IHRydWUsIGVtcHR5dGV4dDogJyAnfSlcbiAgICAkKCcuZWRpdGFibGUnKS5vZmYoJ2NsaWNrJyk7XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuZ2x5cGhpY29uLXBlbmNpbCcsIChlKSAtPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIGUuY3VycmVudFRhcmdldC5kYXRhc2V0Lm5vRWRpdGFibGUgaXNudCB1bmRlZmluZWQgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylbMF0uaWQpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpLmF0dHIoJ2RhdGEtaWQnKSlcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCBOdW1iZXIoKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpKVswXS5jZWxsSW5kZXgpICsgMSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuXG4gICAgI1xuICAgICMgQWRkIHNvcnQgaGFuZGxlcnMuXG4gICAgI1xuICAgICQoJy5zb3J0Jykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIHR5cGUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtc29ydC10eXBlJylcblxuICAgICAgaWYgdHlwZSBpcyAneWVhcidcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgeWVhci5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMClcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnbmFtZSdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgbmFtZS5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMSlcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnYW1vdW50J1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBhbW91bnQuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDMpXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ2NvbnRyaWJ1dG9yLXR5cGUnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGNvbnRyaWJ1dG9yIHR5cGUuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDQpXG5cbiAgICAkKCdhJykub24gJ3NhdmUnLCAoZSwgcGFyYW1zKSAtPlxuICAgICAgICBlbnRpdHlUeXBlID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RhYmxlJylbMF0uZGF0YXNldC5lbnRpdHlUeXBlXG4gICAgICAgIGlkID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJylbMF0uZGF0YXNldC5pZFxuICAgICAgICBmaWVsZCA9IE9iamVjdC5rZXlzKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpWzBdLmRhdGFzZXQpWzBdXG5cbiAgICAgICAgaWYgZmllbGQgaXMgJ3ZvdGUnIG9yIGZpZWxkIGlzICdkaWRFbGVjdGVkT2ZmaWNpYWxQcm9wb3NlVGhpcydcbiAgICAgICAgICAjIyNcbiAgICAgICAgICAgIEN1cnJlbnQgZmllbGQgb3duZWQgYnkgRWxlY3RlZE9mZmljaWFsVm90ZVxuICAgICAgICAgICMjI1xuICAgICAgICAgIGVudGl0eVR5cGUgPSAnRWxlY3RlZE9mZmljaWFsVm90ZSdcbiAgICAgICAgICBpZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5maW5kKCdzcGFuJylbMF0uZGF0YXNldC5pZFxuXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XG4gICAgICAgICAgICBlZGl0UmVxdWVzdDoge1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXG4gICAgICAgICAgICAgICAgZW50aXR5SWQ6IGlkLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0LmNoYW5nZXNbZmllbGRdID0gcGFyYW1zLm5ld1ZhbHVlXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0KTtcbiAgICAgICAgJC5hamF4ICcvZWRpdHJlcXVlc3QvY3JlYXRlJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqZWN0LFxuICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0L2pzb24nLFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIHRleHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgfVxuXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmFkZCcsIChlKSAtPlxuICAgICAgICB0YWJQYW5lID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylcbiAgICAgICAgdGFibGVUeXBlID0gdGFiUGFuZVswXS5pZFxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtICd0YWJsZVR5cGUnLCB0YWJsZVR5cGVcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY3VycmVudEVudGl0eSA9IG51bGxcbiAgICAgICAgY29uc29sZS5sb2codGFibGVUeXBlKVxuICAgICAgICBpZiB0YWJsZVR5cGUgaXMgJ1ZvdGVzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdMZWdpc2xhdGlvbidcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnQ29udHJpYnV0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZENvbnRyaWJ1dGlvbnMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnRW5kb3JzZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkRW5kb3JzZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdQdWJsaWNTdGF0ZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIFNldCBnZXQgdXJsIGNhbGxiYWNrLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAkKCcudXJsLWlucHV0Jykub24gJ2tleXVwJywgKCkgLT5cbiAgICAgICAgICAgICAgbWF0Y2hfdXJsID0gL1xcYihodHRwcz8pOlxcL1xcLyhbXFwtQS1aMC05Ll0rKShcXC9bXFwtQS1aMC05KyZAI1xcLyU9fl98ITosLjtdKik/KFxcP1tBLVowLTkrJkAjXFwvJT1+X3whOiwuO10qKT8vaVxuICAgICAgICAgICAgICBpZiAobWF0Y2hfdXJsLnRlc3QoJCh0aGlzKS52YWwoKSkpXG4gICAgICAgICAgICAgICAgJC5hamF4ICcvYXBpL3VybC9leHRyYWN0Jywge1xuICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAkKHRoaXMpLnZhbCgpLm1hdGNoKG1hdGNoX3VybClbMF1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudCA9ICQoJyN1cmwtc3RhdGVtZW50JylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgQ2xlYXIuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgJycpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIFNldCB0aXRsZS5cbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2h0bWwnKVxuICAgICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgICAjIElmIHVybCBwb2ludCB0byBodG1sLCBoaWRlIGltZyBhbmQgc2V0IGJvZHkuXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQocmVzcG9uc2UuZGF0YS5ib2R5KVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAneW91dHViZScpXG4gICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICMgSWYgdXJsIHBvaW50IHRvIHlvdXR1YmUsIHNob3cgeW91dHViZSBwcmV2aWV3IGltYWdlLlxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEucHJldmlldylcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhLnByZXZpZXcpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuc2xpZGVEb3duKClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQgPSAkKCcjdXJsLXN0YXRlbWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIENsZWFyLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsICcnKVxuXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KGVycm9yLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgaWYgdGFiUGFuZS5oYXNDbGFzcygnbG9hZGVkJykgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdGFiUGFuZVswXS5jbGFzc0xpc3QuYWRkKCdsb2FkZWQnKVxuXG4gICAgICAgIHBlcnNvbk1ldGEgPSB7XCJjcmVhdGVSZXF1ZXN0XCI6e1wiZW50aXR5TmFtZVwiOmN1cnJlbnRFbnRpdHksXCJrbm93bkZpZWxkc1wiOntcImVsZWN0ZWRPZmZpY2lhbFwiOnBlcnNvbi5pZH19fVxuICAgICAgICAkLmFqYXgoXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9hcGkvY3JlYXRlcmVxdWVzdC9uZXcnLFxuICAgICAgICAgICAgZGF0YTogcGVyc29uTWV0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgZW5kT2JqID0ge31cbiAgICAgICAgICAgICAgICBkYXRhLmNob2ljZXNbMF0uY2hvaWNlcy5mb3JFYWNoIChpdGVtLCBpbmRleCkgLT5cbiAgICAgICAgICAgICAgICAgIGlkcyA9IE9iamVjdC5rZXlzIGl0ZW1cbiAgICAgICAgICAgICAgICAgIGlkcy5mb3JFYWNoIChpZCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICBlbmRPYmpbaWRdID0gaXRlbVtpZF1cblxuICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMgPSAoKSAtPlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgZGF0YS5jaG9pY2VzWzBdLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICMgQWRkIGZpcnN0IGJsYW5rIG9wdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gJydcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MXG4gICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgZW5kT2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBlbmRPYmpba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MXG5cbiAgICAgICAgICAgICAgICBzZWxlY3QgPSBudWxsXG5cbiAgICAgICAgICAgICAgICBpZiBjdXJyZW50RW50aXR5IGlzICdFbmRvcnNlbWVudCdcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnQ29udHJpYnV0aW9uJ1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdMZWdpc2xhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ID0gJCgnI2FkZFZvdGVzIHNlbGVjdCcpWzBdXG4gICAgICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjYWRkVm90ZXMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAoKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBGaWxsIGVsZWN0ZWQgb2ZmaWNpYWxzIHZvdGVzIHRhYmxlLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2xlZ2lzbGF0aW9uLXZvdGUnKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgICAgICQoJyNlbGVjdGVkVm90ZXMnKS5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ID0gJCgnI2FkZFN0YXRlbWVudHMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNhZGRTdGF0ZW1lbnRzJykuZmluZCgnW2RhdGEtcHJvdmlkZT1cImRhdGVwaWNrZXJcIl0nKS5vbihcbiAgICAgICAgICAgICAgICAgICAgICAnY2hhbmdlRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgKCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlciAnaGlkZSdcbiAgICAgICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGlmKGVycm9yLnN0YXR1cyA9PSA0MDEpIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICApO1xuXG4gICAgd2luZG93LmFkZEl0ZW0gPSAoZSkgLT5cbiAgICAgICAgbmV3UmVjb3JkID0ge31cbiAgICAgICAgbW9kYWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKVxuICAgICAgICBtb2RhbFR5cGUgPSBtb2RhbFswXS5pZFxuICAgICAgICBlbnRpdHlUeXBlID0gbW9kYWxbMF0uZGF0YXNldC5lbnRpdHlUeXBlXG4gICAgICAgIGNvbnNvbGUubG9nKGVudGl0eVR5cGUpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkcy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICAjIyNcbiAgICAgICAgICBHZXQgdmFsdWUgZnJvbSB0ZXhhcmVhJ3MuXG4gICAgICAgICMjI1xuICAgICAgICBtb2RhbC5maW5kKCd0ZXh0YXJlYScpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgbmV3UmVjb3JkW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgYXNzb2NpYXRpb25zID0ge31cbiAgICAgICAgaWYgbW9kYWxUeXBlICE9ICdhZGRWb3RlcydcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tcImVsZWN0ZWRPZmZpY2lhbFwiXSA9IHBlcnNvbi5pZFxuICAgICAgICAjXG4gICAgICAgICMgQXJyYXkgb2Ygc3ViIGVudGl0aWVzLlxuICAgICAgICAjXG4gICAgICAgIGNoaWxkcyA9IFtdXG5cbiAgICAgICAgaWYgbW9kYWxUeXBlIGlzICdhZGRWb3RlcydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIEFkZCBpbmZvcm1hdGlvbiBhYm91dCB2b3Rlcy5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgbW9kYWwuZmluZCgnI2VsZWN0ZWRWb3RlcycpLmZpbmQoJ3RyW2RhdGEtZWxlY3RlZF0nKS4gZWFjaCAoaWR4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKGVsZW1lbnQpXG5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgIyBHZXQgYWxsIHN1YiBlbnRpdHkgZmllbGRzLlxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCdzZWxlY3QnKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZWxlbWVudC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICBBZGQgb25seSBpZiBhbGwgZmllbGRzIGlzIHNldC5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBpZiBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT0gMlxuICAgICAgICAgICAgICAgICAgICBmaWVsZHMgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snZmllbGRzJ10gPSBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snYXNzb2NpYXRpb25zJ10gPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snYXNzb2NpYXRpb25zJ11bZWxlbWVudC5hdHRyKCdkYXRhLWVudGl0eS10eXBlJyldID0gZWxlbWVudC5hdHRyKCdkYXRhLWVsZWN0ZWQnKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZEVudGl0eU5hbWUgPSBlbGVtZW50LnBhcmVudCgpLnBhcmVudCgpLmF0dHIgJ2RhdGEtZW50aXR5LXR5cGUnXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hpbGQgdHlwZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGNoaWxkRW50aXR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCBmaWVsZHMuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IGZpZWxkc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgY2F0ZWdvcnkuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKTtcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZENvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IHR5cGUuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKVxuICAgICAgICAgICAgbmV3UmVjb3JkW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IHR5cGUuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKVxuICAgICAgICAgICAgbmV3UmVjb3JkW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCBjYXRlZ29yeS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBmaWVsZHM6IHsgZmllbGRzOiBuZXdSZWNvcmQsIGFzc29jaWF0aW9uczogYXNzb2NpYXRpb25zLCBjaGlsZHM6IGNoaWxkc30sXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAjIyNcbiAgICAgICAgICBBcHBlbmQgbmV3IGVudGl0eSB0byB0YWJsZS5cbiAgICAgICAgIyMjXG4gICAgICAgIHJvd1RlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKCQoXCIjcm93LSN7bW9kYWxUeXBlfVwiKS5odG1sKCkpO1xuXG4gICAgICAgICNcbiAgICAgICAgIyBDb2xsZWN0IGRhdGEuXG4gICAgICAgICNcbiAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc2VuZE9iamVjdC5jcmVhdGVSZXF1ZXN0LmZpZWxkcy5maWVsZHNcbiAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICBkYXRhWyd1c2VyJ10gPSB1c2VyLnVzZXJuYW1lXG5cbiAgICAgICAgaWYgbW9kYWxUeXBlIGlzICdhZGRWb3RlcydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBDaGVjayBpZiB1c2VyIHNwZWNpZmllZCBob3cgY3VycmVudCBlbGVjdGVkIG9mZmljaWFsIHZvdGVkLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBhZGQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciBvYmogaW4gc2VuZE9iamVjdC5jcmVhdGVSZXF1ZXN0LmZpZWxkcy5jaGlsZHNcbiAgICAgICAgICAgICAgaWYgTnVtYmVyKG9iai5maWVsZHMuYXNzb2NpYXRpb25zLmVsZWN0ZWRPZmZpY2lhbCkgPT0gTnVtYmVyKHBlcnNvbi5pZClcbiAgICAgICAgICAgICAgICBhZGQgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygb2JqLmZpZWxkcy5maWVsZHNcbiAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBJZiB3ZSBmb3VuZCwgc2hvdy5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICAgJCgnI1ZvdGVzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZENvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgRm9ybWF0IGNvbnRyaWJ1dGlvbiBhbW91bnQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGRhdGEuY29udHJpYnV0b3JUeXBlID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICBkYXRhLmNvbnRyaWJ1dGlvbkFtb3VudCA9IG51bWVyYWwoZGF0YS5jb250cmlidXRpb25BbW91bnQpLmZvcm1hdCgnMCwwMDAnKVxuICAgICAgICAgICAgJCgnI0NvbnRyaWJ1dGlvbnMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGRhdGEuZW5kb3JzZXJUeXBlID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAkKCcjRW5kb3JzZW1lbnRzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSk7XG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgJCgnI1N0YXRlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcblxuICAgICAgICAjIyNcbiAgICAgICAgICBTZW5kIGNyZWF0ZSByZXF1ZXN0IHRvIGFwaS5cbiAgICAgICAgIyMjXG4gICAgICAgIGNvbnNvbGUubG9nIHNlbmRPYmplY3RcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogJy9hcGkvY3JlYXRlcmVxdWVzdC9jcmVhdGUnLFxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgIyBDbG9zZSBtb2RhbCB3aW5kb3dcbiAgICAgICAgbW9kYWwubW9kYWwgJ2hpZGUnXG5cbiAgICAjIyNcbiAgICAgICAgSWYgdXNlciB0cnkgdG8gYWRkIG9yIHVwZGF0ZSBzb21lIGRhdGEgd2l0aG91dCBsb2dnZWQgaW4sIHdlXG4gICAgICAgIHNob3cgaGltIGxvZ2luL3NpZ24gdXAgd2luZG93LiBBZnRlciBhdXRob3JpemluZyB1c2VyIHJlZGlyZWN0IGJhY2tcbiAgICAgICAgdG8gcGFnZSwgd2hlcmUgaGUgcHJlcyBhZGQvZWRpdCBidXR0b24uIEluIHRoYXQgY2FzZSB3ZSBzaG93IGhpbSBhcHByb3ByaWF0ZVxuICAgICAgICBtb2RhbCB3aW5kb3cuXG5cbiAgICAgICAgVGltZW91dCBuZWVkIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyB3aGVuIHdlIGdldCB1c2VyIGluZm9ybWF0aW9uIGFuZCBlbGVjdGVkIG9mZmljaWFsIGluZm9ybWF0aW9uLlxuICAgICMjI1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCAoKSAtPlxuICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICByZXR1cm5cblxuICAgICAgdHlwZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd0YWJsZVR5cGUnKVxuICAgICAgZGF0YUlkID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2RhdGFJZCcpXG4gICAgICBmaWVsZCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdmaWVsZCcpXG5cbiAgICAgIGlmIChkYXRhSWQgJiYgZmllbGQpXG4gICAgICAgICQoJ2FbYXJpYS1jb250cm9scz1cIicgKyB0eXBlICsgJ1wiXScpLmNsaWNrKClcbiAgICAgICAgJCgndHJbZGF0YS1pZD0nK2RhdGFJZCsnXScpLmZpbmQoJ3RkOm50aC1jaGlsZCgnK2ZpZWxkKycpJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJycpXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdkYXRhSWQnLCAnJylcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2ZpZWxkJywgJycpXG5cbiAgICAgIGVsc2UgaWYgKHR5cGUpXG4gICAgICAgICQoJ2RpdiMnICsgdHlwZSkuZmluZCgnLmFkZCcpLmNsaWNrKClcbiAgICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJycpXG4gICAgLFxuICAgIDIwMDBcbiAgICApXG5cblxuIyMjXG4gIEFwcGVuZCBjcmVhdGUgcmVxdWVzdHMgdG8gYWxsIGN1cnJlbnQgZWxlY3RlZE9mZmljaWFsIHBhZ2UuXG4jIyNcbnNob3dDcmVhdGVSZXF1ZXN0cyA9IChwZXJzb24sIGNyZWF0ZVJlcXVlc3RzKSAtPlxuICAgICMgRG9uJ3Qgc2hvdyBub3QgYXBwcm92ZWQgY3JlYXRlIHJlcXVlc3QgdG8gYW5vbi5cbiAgICBpZiAoIWF1dGhvcml6ZWQpIHRoZW4gcmV0dXJuXG5cbiAgICBsZWdpc2xhdGlvblJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZFZvdGVzJykuaHRtbCgpKVxuICAgIGNvbnRyaWJ1dGlvblJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZENvbnRyaWJ1dGlvbnMnKS5odG1sKCkpXG4gICAgZW5kb3JzZW1lbnRSb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRFbmRvcnNlbWVudHMnKS5odG1sKCkpXG4gICAgc3RhdGVtZW50Um93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkU3RhdGVtZW50cycpLmh0bWwoKSlcblxuICAgIGZvciByZXF1ZXN0IGluIGNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICNcbiAgICAgICAgIyBQcmVwYXJlIGNyZWF0ZSByZXF1ZXN0IGRhdGEgZm9yIHRlbXBsYXRlLlxuICAgICAgICAjXG4gICAgICAgIGRhdGEgPSByZXF1ZXN0LmZpZWxkcy5maWVsZHNcbiAgICAgICAgZGF0YVsndXNlciddID0gcmVxdWVzdC51c2VyLnVzZXJuYW1lXG5cbiAgICAgICAgI1xuICAgICAgICAjIEZpbmQgb3V0IHRlbXBsYXRlIGZvciBjdXJyZW50IHJlcXVlc3QgYW5kIGFkZGl0aW9uYWwgdmFsdWVzLlxuICAgICAgICAjXG4gICAgICAgIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJMZWdpc2xhdGlvblwiXG4gICAgICAgICAgICBuYW1lID0gJ1ZvdGVzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdpc2xhdGlvblJvd1xuICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmVxdWVzdC5maWVsZHMuY2hpbGRzWzBdLmZpZWxkcy5maWVsZHNcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IGNhdGVnb3JpZXNbcmVxdWVzdC5maWVsZHMuYXNzb2NpYXRpb25zLmlzc3VlQ2F0ZWdvcnkgLSAxXS5uYW1lXG5cbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiQ29udHJpYnV0aW9uXCJcbiAgICAgICAgICAgIG5hbWUgPSAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gY29udHJpYnV0aW9uUm93XG5cbiAgICAgICAgICAgIGRhdGFbJ2NvbnRyaWJ1dGlvbkFtb3VudCddID0gbnVtZXJhbChkYXRhWydjb250cmlidXRpb25BbW91bnQnXSkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkVuZG9yc2VtZW50XCJcbiAgICAgICAgICAgIG5hbWUgPSAnRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBlbmRvcnNlbWVudFJvd1xuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJQdWJsaWNTdGF0ZW1lbnRcIlxuICAgICAgICAgICAgbmFtZSA9ICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBzdGF0ZW1lbnRSb3dcblxuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IGNhdGVnb3JpZXNbcmVxdWVzdC5maWVsZHMuYXNzb2NpYXRpb25zLmlzc3VlQ2F0ZWdvcnkgLSAxXS5uYW1lXG5cbiAgICAgICAgJChcIlxcIyN7bmFtZX0gdHI6bGFzdC1jaGlsZFwiKS5iZWZvcmUodGVtcGxhdGUoZGF0YSkpXG5cblxuJCgnI2RhdGFDb250YWluZXInKS5wb3BvdmVyKHtcbiAgICBwbGFjZW1lbnQ6ICdib3R0b20nXG4gICAgc2VsZWN0b3I6ICcucmFuaydcbiAgICBhbmltYXRpb246IHRydWVcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCIgcm9sZT1cInRvb2x0aXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3BvdmVyLXRpdGxlLWN1c3RvbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicG9wb3Zlci1idG5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiL3Jhbmtfb3JkZXJcIj5BbGwgcmFua3M8L2J1dHRvbj48L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4nXG59KTtcblxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAkZWxlbWVudCA9ICQoZS50YXJnZXQpO1xuICAgIHBvcG92ZXJDb250ZW50ID0gJGVsZW1lbnQucGFyZW50KCkuZmluZCgnLnBvcG92ZXItY29udGVudCcpXG4gICAgZmllbGROYW1lID0gJGVsZW1lbnQuYXR0cignZGF0YS1maWVsZCcpXG4gICAgcG9wb3ZlclRwbCA9ICQoJyNyYW5rUG9wb3ZlcicpLmh0bWwoKVxuICAgIGFkZGl0aW9uYWxSb3dzVHBsID0gJCgnI2FkZGl0aW9uYWxSb3dzJykuaHRtbCgpXG4gICAgcHJlbG9hZGVyID0gcG9wb3ZlckNvbnRlbnQuZmluZCgnbG9hZGVyJylcblxuICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gMDtcbiAgICBjdXJyZW50UGFnZSA9IDA7XG4gICAgbG9hZGluZyA9IGZhbHNlO1xuICAgIHBvcG92ZXJPcmRlciA9IG51bGw7XG5cbiAgICAjIENsb3NlIGFsbCBvdGhlciBwb3BvdmVyc1xuICAgIGlmICEkZWxlbWVudC5jbG9zZXN0KCcucG9wb3ZlcicpWzBdXG4gICAgICAgICQoJy5yYW5rJykubm90KGUudGFyZ2V0KS5wb3BvdmVyKCdkZXN0cm95JylcblxuICAgICMgb3JkZXIgW2Rlc2MsIGFzY11cbiAgICBsb2FkTmV3Um93cyA9IChvcmRlcikgLT5cbiAgICAgICAgbG9hZGluZyA9IHRydWU7XG4gICAgICAgIHBvcG92ZXJPcmRlciA9IG9yZGVyXG4gICAgICAgIHByZWxvYWRlci5zaG93KClcbiAgICAgICAgdGFibGUgPSBwb3BvdmVyQ29udGVudC5maW5kKCd0YWJsZSB0Ym9keScpXG4gICAgICAgIHRhYmxlLmh0bWwgJydcbiAgICAgICAgY3VycmVudFBhZ2UgPSAwO1xuICAgICAgICBwcmV2aW91c1Njcm9sbFRvcCA9IDBcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2dvdmVybm1lbnQnK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSsnL2dldF9yYW5rcydcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgIHBhZ2U6IGN1cnJlbnRQYWdlXG4gICAgICAgICAgICAgICAgb3JkZXI6IG9yZGVyXG4gICAgICAgICAgICAgICAgZmllbGRfbmFtZTogZmllbGROYW1lSW5DYW1lbENhc2UgIyBUcmFuc2Zvcm0gdG8gY2FtZWxDYXNlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKGFkZGl0aW9uYWxSb3dzVHBsKVxuICAgICAgICAgICAgICAgIHRhYmxlLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKVxuICAgICAgICAgICAgICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBwcmVsb2FkZXIuaGlkZSgpXG5cbiAgICBwb3BvdmVyQ29udGVudC5vbiAnY2xpY2snLCAndGgnLCAoZSkgLT5cbiAgICAgICAgJGNvbHVtbiA9IGAkKGUudGFyZ2V0KS5oYXNDbGFzcygnc29ydGFibGUnKSA/ICQoZS50YXJnZXQpIDogJChlLnRhcmdldCkuY2xvc2VzdCgndGgnKTtgXG4gICAgICAgIGlmICRjb2x1bW4uaGFzQ2xhc3MoJ3NvcnRhYmxlJylcbiAgICAgICAgICAgIGlmICRjb2x1bW4uaGFzQ2xhc3MoJ2Rlc2MnKVxuICAgICAgICAgICAgICAgIGxvYWROZXdSb3dzKCdhc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5hZGRDbGFzcygnYXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykuYWRkQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICAgICAgICBlbHNlIGlmICRjb2x1bW4uaGFzQ2xhc3MoJ2FzYycpXG4gICAgICAgICAgICAgICAgbG9hZE5ld1Jvd3MoJ2Rlc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2FzYycpLmFkZENsYXNzKCdkZXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fdG9wJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9hZE5ld1Jvd3MoJ2FzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5hZGRDbGFzcygnYXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLmZpbmQoJ2knKS5hZGRDbGFzcygnaWNvbl9fdG9wJylcblxuICAgIGlmIGZpZWxkTmFtZVxuICAgICAgICBmaWVsZE5hbWVJbkNhbWVsQ2FzZSA9IGZpZWxkTmFtZS5yZXBsYWNlIC9fKFthLXowLTldKS9nLCAoZykgLT4gcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKycvZ2V0X3JhbmtzJ1xuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgZmllbGRfbmFtZTogZmllbGROYW1lSW5DYW1lbENhc2UgIyBUcmFuc2Zvcm0gdG8gY2FtZWxDYXNlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHBvcG92ZXJUcGwpXG4gICAgICAgICAgICAgICAgcG9wb3ZlckNvbnRlbnQuaHRtbCBjb21waWxlZFRlbXBsYXRlKGRhdGEpXG5cbiAgICAjIExhenkgbG9hZCBmb3IgcG9wb3ZlclxuICAgIHBvcG92ZXJDb250ZW50LnNjcm9sbCAoKSAtPlxuICAgICAgY3VycmVudFNjcm9sbFRvcCA9IHBvcG92ZXJDb250ZW50LnNjcm9sbFRvcCgpXG4gICAgICBpZiAgcHJldmlvdXNTY3JvbGxUb3AgPCBjdXJyZW50U2Nyb2xsVG9wICYmIGN1cnJlbnRTY3JvbGxUb3AgPiAwLjUgKiBwb3BvdmVyQ29udGVudFswXS5zY3JvbGxIZWlnaHRcbiAgICAgICAgY29uc29sZS5sb2coJ2FzZGFzZCcpO1xuICAgICAgICBwcmV2aW91c1Njcm9sbFRvcCA9IGN1cnJlbnRTY3JvbGxUb3BcbiAgICAgICAgaWYgbG9hZGluZyBpcyBmYWxzZVxuICAgICAgICAgIGxvYWRpbmcgPSB0cnVlXG4gICAgICAgICAgcHJlbG9hZGVyLnNob3coKTtcbiAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgdXJsOiAnL2FwaS9nb3Zlcm5tZW50JyArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICcvZ2V0X3JhbmtzJ1xuICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgICAgcGFnZTogKytjdXJyZW50UGFnZVxuICAgICAgICAgICAgICAgICAgb3JkZXI6IHBvcG92ZXJPcmRlclxuICAgICAgICAgICAgICAgICAgZmllbGRfbmFtZTogZmllbGROYW1lSW5DYW1lbENhc2UgIyBUcmFuc2Zvcm0gdG8gY2FtZWxDYXNlXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgbG9hZGluZyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICBwcmVsb2FkZXIuaGlkZSgpXG4gICAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKGFkZGl0aW9uYWxSb3dzVHBsKVxuICAgICAgICAgICAgICAgICAgcG9wb3ZlckNvbnRlbnQuZmluZCgndGFibGUgdGJvZHknKVswXS5pbm5lckhUTUwgKz0gY29tcGlsZWRUZW1wbGF0ZShkYXRhKVxuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuXG4kKCcjZGF0YUNvbnRhaW5lcicpLm9uICdjbGljaycsICcuZWxlY3RlZF9saW5rJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVybCA9IGUuY3VycmVudFRhcmdldC5wYXRobmFtZVxuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHVybCxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cblxuICAgICAgICAgICAgICAgICAgICBwZXJzb24gPSBkYXRhLnBlcnNvblxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVSZXF1ZXN0cyA9IGRhdGEuY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllc1xuICAgICAgICAgICAgICAgICAgICBwZXJzb24uY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllc1xuXG4gICAgICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNvbnRyaWJ1dGlvbiBpbiBwZXJzb24uY29udHJpYnV0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQgPSBudW1lcmFsKGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50KS5mb3JtYXQoJzAsMDAwJylcblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBwZXJzb24udm90ZXMuZm9yRWFjaCAoaXRlbSwgaXRlbUxpc3QpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkLCAnWVlZWS1NTS1ERCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLmZvcm1hdCAnTCdcblxuICAgICAgICAgICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogaHRtbH0sICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcycsIHVybFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGluaXRUYWJsZUhhbmRsZXJzKHBlcnNvbik7XG4gICAgICAgICAgICAgICAgICAgIHNob3dDcmVhdGVSZXF1ZXN0cyhwZXJzb24sIGNyZWF0ZVJlcXVlc3RzKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbiMgUm91dGUgL1xuaWYgcm91dGVUeXBlIGlzIDBcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICBnb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnL2xlZ2FjeS9kYXRhL2hfdHlwZXNfY2FfMi5qc29uJywgN1xuICAgIGdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICB1cmwgPSAnLycgKyBkYXRhLmFsdFR5cGVTbHVnICsgJy8nICsgZGF0YS5zbHVnXG4gICAgICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuICAgIGlmICF1bmRlZlxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaHRtbCAkKCcjc2VhcmNoLWNvbnRhaW5lci10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAjIExvYWQgaW50cm9kdWN0b3J5IHRleHQgZnJvbSB0ZXh0cy9pbnRyby10ZXh0Lmh0bWwgdG8gI2ludHJvLXRleHQgY29udGFpbmVyLlxuICAgICAgICAkLmdldCBcIi9sZWdhY3kvdGV4dHMvaW50cm8tdGV4dC5odG1sXCIsIChkYXRhKSAtPiAkKFwiI2ludHJvLXRleHRcIikuaHRtbCBkYXRhXG4gICAgICAgIGdvdm1hcCA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcbiAgICAgICAgZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29uc1xuICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwoKX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnLydcbiAgICAgICAgdW5kZWYgPSB0cnVlXG4gICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcbiAgICBzdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJCgnI2dvdm1hcCcpLm9uICdjbGljaycsICcuaW5mby13aW5kb3ctdXJpJywgKGUpIC0+XG4gICAgICAgIHVyaSA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC51cmlcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQuYWpheFxuIyAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZ292cykgLT5cbiAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJpXG5cbiMgUm91dGUgL3Jhbmtfb3JkZXJcbmlmIHJvdXRlVHlwZSBpcyAxXG4gIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBDaXZpYyBQcm9maWxlcydcbiAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgJCgnLmxvYWRlcicpLnNob3coKVxuICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuXG4gICQuYWpheFxuICAgIHVybDogXCIvYXBpL3Jhbmtfb3JkZXJcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgI1xuICAgICAgIyBSZW5kZXIgcmFuayBvcmRlciB0ZW1wbGF0ZS5cbiAgICAgICNcbiAgICAgIHRwbCA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcmFuay1vcmRlci1wYWdlJykuaHRtbCgpKVxuICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRwbChkYXRhKVxuICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKTtcblxuICAgICAgI1xuICAgICAgIyBQdXNoIHRlbXBsYXRlLlxuICAgICAgI1xuICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4jICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogdHBsfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvcmFua19vcmRlcidcblxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDJcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkLmFqYXhcbiMgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdHT1Y6J1xuICAgICAgICAgICAgY29uc29sZS5sb2cgZ292c1xuXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgcnVuID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgcnVuXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IHJ1bn0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB3aW5kb3cucGF0aFxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDNcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGEucGVyc29uXG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0cyA9IGRhdGEuY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QgPSBbXVxuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgUHJlcGFyZSBvcHRpb25zIGZvciBzZWxlY3QgaW4gSXNzdWVzQ2F0ZWdvcnkgZWRpdC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgcGVyc29uLmNhdGVnb3J5X3NlbGVjdC5wdXNoIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2F0ZWdvcnkuaWRcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXRlZ29yeS5uYW1lXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QgPSBKU09OLnN0cmluZ2lmeShwZXJzb24uY2F0ZWdvcnlfc2VsZWN0KTtcblxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBmb3IgY29udHJpYnV0aW9uIGluIHBlcnNvbi5jb250cmlidXRpb25zXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQgPSBudW1lcmFsKGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50KS5mb3JtYXQoJzAsMDAwJylcblxuICAgICAgICAgICAgY29uc29sZS5sb2cgcGVyc29uXG5cbiAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXG4gICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIHBlcnNvbi52b3RlcyAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBwZXJzb24udm90ZXMuZm9yRWFjaCAoaXRlbSwgaXRlbUxpc3QpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQsICdZWVlZLU1NLUREJyk7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS5mb3JtYXQgJ0wnXG5cbiAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuXG4gICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG5cbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG5cbiAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgIGluaXRUYWJsZUhhbmRsZXJzKHBlcnNvbik7XG4gICAgICAgICAgICBzaG93Q3JlYXRlUmVxdWVzdHMocGVyc29uLCBjcmVhdGVSZXF1ZXN0cyk7XG5cbiAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXG4gICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xuICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG5cbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICB3aW5kb3cuRElTUVVTV0lER0VUUy5nZXRDb3VudCgpXG5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG4gICMjI1xuICAgIEdldCBjdXJyZW50IHVzZXIuXG4gICMjI1xuICAkdXNlckJ0biA9ICQoJyN1c2VyJylcbiAgJHVzZXJCdG5MaW5rID0gJHVzZXJCdG4uZmluZCgnYScpO1xuICAkLmFqYXggJy9hcGkvdXNlcicsIHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIGFzeW5jOiBmYWxzZSxcbiAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICB1c2VyLnVzZXJuYW1lID0gcmVzcG9uc2UudXNlcm5hbWU7XG4gICAgICBhdXRob3JpemVkID0gdHJ1ZTtcblxuICAgICAgJHVzZXJUZXh0ID0gJCgnI3VzZXItdGV4dCcpLmZpbmQoJ2EnKTtcbiAgICAgICR1c2VyVGV4dC5odG1sKFwiTG9nZ2VkIGluIGFzICN7dXNlci51c2VybmFtZX1cIiArICR1c2VyVGV4dC5odG1sKCkpXG4gICAgICAkdXNlckJ0bkxpbmsuaHRtbChcIlNpZ24gT3V0XCIgKyAkdXNlckJ0bkxpbmsuaHRtbCgpKS5jbGljayAoKSAtPlxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSAnL2xvZ291dCdcblxuICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gYXV0aG9yaXplZCA9IGZhbHNlXG4gICAgICAkdXNlckJ0bkxpbmsuaHRtbChcIkxvZ2luIC8gU2lnbiBVcFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICB9XG4iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIFxuICAgICAgICBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgICAjaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQuZ292X25hbWUsIHdvcmRzLCByZWdzKVxuICAgICNkLnN0YXRlPXN0cm9uZ2lmeShkLnN0YXRlLCB3b3JkcywgcmVncylcbiAgICAjZC5nb3ZfdHlwZT1zdHJvbmdpZnkoZC5nb3ZfdHlwZSwgd29yZHMsIHJlZ3MpXG4gIFxuICByZXR1cm4gY2xvbmVzXG5cblxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXG5zdHJvbmdpZnkgPSAocywgd29yZHMsIHJlZ3MpIC0+XG4gIHJlZ3MuZm9yRWFjaCAocixpKSAtPlxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxuICByZXR1cm4gc1xuXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXG5zdHJpcCA9IChzKSAtPlxuICBzLnJlcGxhY2UoLzxbXjw+XSo+L2csJycpXG5cblxuIyBhbGwgdGlybXMgc3BhY2VzIGZyb20gYm90aCBzaWRlcyBhbmQgbWFrZSBjb250cmFjdHMgc2VxdWVuY2VzIG9mIHNwYWNlcyB0byAxXG5mdWxsX3RyaW0gPSAocykgLT5cbiAgc3M9cy50cmltKCcnK3MpXG4gIHNzPXNzLnJlcGxhY2UoLyArL2csJyAnKVxuXG4jIHJldHVybnMgYW4gYXJyYXkgb2Ygd29yZHMgaW4gYSBzdHJpbmdcbmdldF93b3JkcyA9IChzdHIpIC0+XG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcblxuXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XG4gIHdvcmRzID0gZ2V0X3dvcmRzIHN0clxuICByZWdzID0gd29yZHMubWFwICh3KS0+IG5ldyBSZWdFeHAoXCIje3d9XCIsJ2knKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVNcbmZpZWxkTmFtZXMgPSB7fVxuZmllbGROYW1lc0hlbHAgPSB7fVxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9IChuLG1hc2ssZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG5vdCBkYXRhW25dXG4gICAgcmV0dXJuICcnXG5cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgaWYgJycgIT0gbWFza1xuICAgICAgaWYgZGF0YVtuKydfcmFuayddIGFuZCBkYXRhLm1heF9yYW5rcyBhbmQgZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ11cbiAgICAgICAgdiA9IG51bWVyYWwodikuZm9ybWF0KG1hc2spXG4gICAgICAgICMgVHJhbnNmb3JtIGZyb20gdW5kZXJzY29yZSAoc29tZV9maWVsZE5hbWUpIHRvIHJlYWRhYmxlIGZvcm1hdFxuICAgICAgICB0aXRsZSA9IG4udG9TdHJpbmcoKVxuICAgICAgICB0aXRsZSA9IHRpdGxlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGl0bGUuc2xpY2UoMSlcbiAgICAgICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlIC9fKFthLXpdKS9nLCAoZykgLT4gcmV0dXJuICcgJyArIGdbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICByZXR1cm4gXCIje3Z9IDxhIGNsYXNzPSdyYW5rJ1xuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZmllbGQ9JyN7bn1fcmFuaydcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT0nI3t0aXRsZX0gcmFua3MnPlxuICAgICAgICAgICAgICAgICAgICAgICgje2RhdGFbbisnX3JhbmsnXX0gb2YgI3tkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXX0pPC9hPlwiXG4gICAgICBpZiBuID09IFwibnVtYmVyX29mX2Z1bGxfdGltZV9lbXBsb3llZXNcIlxuICAgICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQoJzAsMCcpXG4gICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICBlbHNlXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZFxuICAgICAgbiA9PSBcIm9wZW5fZW5yb2xsbWVudF9zY2hvb2xzXCJcbiAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZFxuICAgICAgbiA9PSBcInBhcmVudF90cmlnZ2VyX2VsaWdpYmxlX3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgdi5sZW5ndGggPiAyMVxuICAgICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAyMSlcbiAgICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdlxuXG5cbnJlbmRlcl9maWVsZF9uYW1lX2hlbHAgPSAoZk5hbWUpIC0+XG4gICNpZiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cbiAgICByZXR1cm4gZmllbGROYW1lc0hlbHBbZk5hbWVdXG5cbnJlbmRlcl9maWVsZF9uYW1lID0gKGZOYW1lKSAtPlxuICBpZiBmaWVsZE5hbWVzW2ZOYW1lXT9cbiAgICByZXR1cm4gZmllbGROYW1lc1tmTmFtZV1cblxuICBzID0gZk5hbWUucmVwbGFjZSgvXy9nLFwiIFwiKVxuICBzID0gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpXG4gIHJldHVybiBzXG5cblxucmVuZGVyX2ZpZWxkID0gKGZOYW1lLGRhdGEpLT5cbiAgaWYgXCJfXCIgPT0gc3Vic3RyIGZOYW1lLCAwLCAxXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyA+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+Jm5ic3A7PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBlbHNlXG4gICAgcmV0dXJuICcnIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICAgIFwiXCJcIlxuICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTxkaXY+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxucmVuZGVyX3N1YmhlYWRpbmcgPSAoZk5hbWUsIG1hc2ssIG5vdEZpcnN0KS0+XG4gIHMgPSAnJ1xuICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZOYW1lXG4gIGlmIG1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICBpZiBub3RGaXJzdCAhPSAwXG4gICAgICBzICs9IFwiPGJyLz5cIlxuICAgIHMgKz0gXCI8ZGl2PjxzcGFuIGNsYXNzPSdmLW5hbSc+I3tmTmFtZX08L3NwYW4+PHNwYW4gY2xhc3M9J2YtdmFsJz4gPC9zcGFuPjwvZGl2PlwiXG4gIHJldHVybiBzXG5cbnJlbmRlcl9maWVsZHMgPSAoZmllbGRzLGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIGZvciBmaWVsZCxpIGluIGZpZWxkc1xuICAgIGlmICh0eXBlb2YgZmllbGQgaXMgXCJvYmplY3RcIilcbiAgICAgIGlmIGZpZWxkLm1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICAgICAgaCArPSByZW5kZXJfc3ViaGVhZGluZyhmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBpKVxuICAgICAgICBmVmFsdWUgPSAnJ1xuICAgICAgZWxzZVxuICAgICAgICBmVmFsdWUgPSByZW5kZXJfZmllbGRfdmFsdWUgZmllbGQubmFtZSwgZmllbGQubWFzaywgZGF0YVxuICAgICAgICBpZiAoJycgIT0gZlZhbHVlIGFuZCBmVmFsdWUgIT0gJzAnKVxuICAgICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGQubmFtZVxuICAgICAgICAgIGZOYW1lSGVscCA9IHJlbmRlcl9maWVsZF9uYW1lX2hlbHAgZmllbGQubmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZlZhbHVlID0gJydcblxuICAgIGVsc2VcbiAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZCwgJycsIGRhdGFcbiAgICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGRcbiAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmTmFtZVxuICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZOYW1lLCB2YWx1ZTogZlZhbHVlLCBoZWxwOiBmTmFtZUhlbHApXG4gIHJldHVybiBoXG5cbnJlbmRlcl9maW5hbmNpYWxfZmllbGRzID0gKGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIG1hc2sgPSAnMCwwJ1xuICBjYXRlZ29yeSA9ICcnXG4gIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gIGZvciBmaWVsZCBpbiBkYXRhXG4gICAgaWYgY2F0ZWdvcnkgIT0gZmllbGQuY2F0ZWdvcnlfbmFtZVxuICAgICAgY2F0ZWdvcnkgPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBpZiBjYXRlZ29yeSA9PSAnT3ZlcnZpZXcnXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICBlbHNlIGlmIGNhdGVnb3J5ID09ICdSZXZlbnVlcydcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gXCI8Yj5cIiArIHRlbXBsYXRlKG5hbWU6IGNhdGVnb3J5LCBnZW5mdW5kOiBcIkdlbmVyYWwgRnVuZFwiLCBvdGhlcmZ1bmRzOiBcIk90aGVyIEZ1bmRzXCIsIHRvdGFsZnVuZHM6IFwiVG90YWwgR292LiBGdW5kc1wiKSArIFwiPC9iPlwiXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcblxuICAgIGlmIGZpZWxkLmNhcHRpb24gPT0gJ0dlbmVyYWwgRnVuZCBCYWxhbmNlJyBvciBmaWVsZC5jYXB0aW9uID09ICdMb25nIFRlcm0gRGVidCdcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JykpXG4gICAgZWxzZSBpZiBmaWVsZC5jYXB0aW9uIGluIFsnVG90YWwgUmV2ZW51ZXMnLCAnVG90YWwgRXhwZW5kaXR1cmVzJywgJ1N1cnBsdXMgLyAoRGVmaWNpdCknXSBvciBpc19maXJzdF9yb3dcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIG90aGVyZnVuZHM6IGN1cnJlbmN5KGZpZWxkLm90aGVyZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpLCB0b3RhbGZ1bmRzOiBjdXJyZW5jeShmaWVsZC50b3RhbGZ1bmRzLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICAgIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzayksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2spKVxuICByZXR1cm4gaFxuXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoL1tcXHNcXCtcXC1dL2csICdfJylcblxudG9UaXRsZUNhc2UgPSAoc3RyKSAtPlxuICBzdHIucmVwbGFjZSAvXFx3XFxTKi9nLCAodHh0KSAtPlxuICAgIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKVxuXG5jdXJyZW5jeSA9IChuLCBtYXNrLCBzaWduID0gJycpIC0+XG4gICAgbiA9IG51bWVyYWwobilcbiAgICBpZiBuIDwgMFxuICAgICAgICBzID0gbi5mb3JtYXQobWFzaykudG9TdHJpbmcoKVxuICAgICAgICBzID0gcy5yZXBsYWNlKC8tL2csICcnKVxuICAgICAgICByZXR1cm4gXCIoI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrcysnPC9zcGFuPid9KVwiXG5cbiAgICBuID0gbi5mb3JtYXQobWFzaylcbiAgICByZXR1cm4gXCIje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytuKyc8L3NwYW4+J31cIlxuXG5yZW5kZXJfdGFicyA9IChpbml0aWFsX2xheW91dCwgZGF0YSwgdGFic2V0LCBwYXJlbnQpIC0+XG4gICNsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICBsYXlvdXQgPSBpbml0aWFsX2xheW91dFxuICB0ZW1wbGF0ZXMgPSBwYXJlbnQudGVtcGxhdGVzXG4gIHBsb3RfaGFuZGxlcyA9IHt9XG5cbiAgbGF5b3V0X2RhdGEgPVxuICAgIHRpdGxlOiBkYXRhLm5hbWVcbiAgICB3aWtpcGVkaWFfcGFnZV9leGlzdHM6IGRhdGEud2lraXBlZGlhX3BhZ2VfZXhpc3RzXG4gICAgd2lraXBlZGlhX3BhZ2VfbmFtZTogIGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgIHRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lOiBkYXRhLnRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lXG4gICAgbGF0ZXN0X2F1ZGl0X3VybDogZGF0YS5sYXRlc3RfYXVkaXRfdXJsXG4gICAgdGFiczogW11cbiAgICB0YWJjb250ZW50OiAnJ1xuXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBsYXlvdXRfZGF0YS50YWJzLnB1c2hcbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGRldGFpbF9kYXRhID1cbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG4gICAgICB0YWJjb250ZW50OiAnJ1xuICAgIHN3aXRjaCB0YWIubmFtZVxuICAgICAgd2hlbiAnT3ZlcnZpZXcgKyBFbGVjdGVkIE9mZmljaWFscydcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGNvbnNvbGUubG9nIGRhdGFcbiAgICAgICAgZm9yIG9mZmljaWFsLGkgaW4gZGF0YS5lbGVjdGVkX29mZmljaWFsc1xuICAgICAgICAgIG9mZmljaWFsX2RhdGEgPVxuICAgICAgICAgICAgdGl0bGU6IGlmICcnICE9IG9mZmljaWFsLnRpdGxlIHRoZW4gXCJUaXRsZTogXCIgKyBvZmZpY2lhbC50aXRsZVxuICAgICAgICAgICAgbmFtZTogaWYgJycgIT0gb2ZmaWNpYWwuZnVsbF9uYW1lIHRoZW4gXCJOYW1lOiBcIiArIG9mZmljaWFsLmZ1bGxfbmFtZVxuICAgICAgICAgICAgZW1haWw6IGlmIG9mZmljaWFsLmVtYWlsX2FkZHJlc3MgdGhlbiBcIkVtYWlsOiBcIiArIG9mZmljaWFsLmVtYWlsX2FkZHJlc3NcbiAgICAgICAgICAgIHRlbGVwaG9uZW51bWJlcjogaWYgbnVsbCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIGFuZCB1bmRlZmluZWQgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciB0aGVuIFwiVGVsZXBob25lIE51bWJlcjogXCIgKyBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyXG4gICAgICAgICAgICB0ZXJtZXhwaXJlczogaWYgb2ZmaWNpYWwudGVybV9leHBpcmVzIHRoZW4gXCJUZXJtIEV4cGlyZXM6IFwiICsgb2ZmaWNpYWwudGVybV9leHBpcmVzIGVsc2UgXCJUZXJtIEV4cGlyZXM6IFwiXG4gICAgICAgICAgICBhbHRUeXBlU2x1ZzogZGF0YS5hbHRfdHlwZV9zbHVnXG4gICAgICAgICAgICBuYW1lU2x1ZzogZGF0YS5zbHVnXG4gICAgICAgICAgICBzbHVnOiBvZmZpY2lhbC5zbHVnXG5cbiAgICAgICAgICBpZiAnJyAhPSBvZmZpY2lhbC5waG90b191cmwgYW5kIG9mZmljaWFsLnBob3RvX3VybCAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJzxpbWcgc3JjPVwiJytvZmZpY2lhbC5waG90b191cmwrJ1wiIGNsYXNzPVwicG9ydHJhaXRcIiBhbHQ9XCJcIiAvPidcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvZmZpY2lhbF9kYXRhLmltYWdlID0gICcnXG5cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJ10ob2ZmaWNpYWxfZGF0YSlcbiAgICAgIHdoZW4gJ0VtcGxveWVlIENvbXBlbnNhdGlvbidcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3NhbGFyeV9wZXJfZnVsbF90aW1lX2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDM0MFxuICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSA0NzBcblxuICAgICAgICAgIGlmICQod2luZG93KS53aWR0aCgpIDwgNDkwXG4gICAgICAgICAgICBzbWFsbENoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBDb21wZW5zYXRpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdCZW5zLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJ1xcbiBFbXBsb3llZXMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ0FsbCBcXG4nICsgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJyBcXG4gUmVzaWRlbnRzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAyKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIENvbXBlbnNhdGlvbiAtIEZ1bGwgVGltZSBXb3JrZXJzOiBcXG4gR292ZXJubWVudCB2cy4gUHJpdmF0ZSBTZWN0b3InXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tY29tcC1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ10gPSdtZWRpYW4tY29tcC1ncmFwaCdcblxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgISBkYXRhLmhhc093blByb3BlcnR5KCdtZWRpYW5fcGVuc2lvbl8zMF95ZWFyX3JldGlyZWUnKSB8fCAoIGRhdGFbJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZSddID09IDApXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gUGVuc2lvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQZW5zaW9uIGZvciBcXG4gUmV0aXJlZSB3LyAzMCBZZWFycydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9wZW5zaW9uMzBfeWVhcl9yZXRpcmVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBQZW5zaW9uJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdiYXInOiB7XG4gICAgICAgICAgICAgICAgICdncm91cFdpZHRoJzogJzMwJSdcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddID0nbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgSGVhbHRoJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICNwdWJsaWMgc2FmZXR5IHBpZVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1B1YmxpYyBTYWZldHkgRXhwZW5zZSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQdWJsaWMgU2FmZXR5IEV4cCdcbiAgICAgICAgICAgICAgICAgIDEgLSBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ090aGVyJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1B1YmxpYyBzYWZldHkgZXhwZW5zZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdzbGljZXMnOiB7IDE6IHtvZmZzZXQ6IDAuMn19XG4gICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA0NVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddID0ncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICNmaW4taGVhbHRoLXJldmVudWUgZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAjY29uc29sZS5sb2cgJyMjI2FsJytKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnUmV2LidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIFJldmVudWUgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBSZXZlbnVlIFBlciBcXG4gQ2FwaXRhIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWUnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgICAgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgI2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0V4cC4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSBcXG4gRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICBoID0gJydcbiAgICAgICAgICAjaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgICAgaCArPSByZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnXVxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAgICN0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGVcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJSZXZlbnVlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgUmV2ZW51ZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXSA9J3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiRXhwZW5kaXR1cmVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBFeHBlbmRpdHVyZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddID0ndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgIGVsc2VcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG5cbiAgICBsYXlvdXRfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLXRlbXBsYXRlJ10oZGV0YWlsX2RhdGEpXG4gIHJldHVybiB0ZW1wbGF0ZXNbJ3RhYnBhbmVsLXRlbXBsYXRlJ10obGF5b3V0X2RhdGEpXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXG5cblxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxuICAjY2xvbmUgdGhlIGxheW91dFxuICBsID0gJC5leHRlbmQgdHJ1ZSwgW10sIGxheW91dFxuICB0ID1cbiAgICBuYW1lOiBcIk90aGVyXCJcbiAgICBmaWVsZHM6IGdldF91bm1lbnRpb25lZF9maWVsZHMgbCwgZGF0YVxuXG4gIGwucHVzaCB0XG4gIHJldHVybiBsXG5cblxuIyBjb252ZXJ0cyB0YWIgdGVtcGxhdGUgZGVzY3JpYmVkIGluIGdvb2dsZSBmdXNpb24gdGFibGUgdG9cbiMgdGFiIHRlbXBsYXRlXG5jb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZT0odGVtcGwpIC0+XG4gIHRhYl9oYXNoPXt9XG4gIHRhYnM9W11cbiAgIyByZXR1cm5zIGhhc2ggb2YgZmllbGQgbmFtZXMgYW5kIHRoZWlyIHBvc2l0aW9ucyBpbiBhcnJheSBvZiBmaWVsZCBuYW1lc1xuICBnZXRfY29sX2hhc2ggPSAoY29sdW1ucykgLT5cbiAgICBjb2xfaGFzaCA9e31cbiAgICBjb2xfaGFzaFtjb2xfbmFtZV09aSBmb3IgY29sX25hbWUsaSBpbiB0ZW1wbC5jb2x1bW5zXG4gICAgcmV0dXJuIGNvbF9oYXNoXG5cbiAgIyByZXR1cm5zIGZpZWxkIHZhbHVlIGJ5IGl0cyBuYW1lLCBhcnJheSBvZiBmaWVsZHMsIGFuZCBoYXNoIG9mIGZpZWxkc1xuICB2YWwgPSAoZmllbGRfbmFtZSwgZmllbGRzLCBjb2xfaGFzaCkgLT5cbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXG5cbiAgIyBjb252ZXJ0cyBoYXNoIHRvIGFuIGFycmF5IHRlbXBsYXRlXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxuICAgIGEgPSBbXVxuICAgIGZvciBrIG9mIGhhc2hcbiAgICAgIHRhYiA9IHt9XG4gICAgICB0YWIubmFtZT1rXG4gICAgICB0YWIuZmllbGRzPWhhc2hba11cbiAgICAgIGEucHVzaCB0YWJcbiAgICByZXR1cm4gYVxuXG5cbiAgY29sX2hhc2ggPSBnZXRfY29sX2hhc2godGVtcGwuY29sX2hhc2gpXG4gIHBsYWNlaG9sZGVyX2NvdW50ID0gMFxuXG4gIGZvciByb3csaSBpbiB0ZW1wbC5yb3dzXG4gICAgY2F0ZWdvcnkgPSB2YWwgJ2dlbmVyYWxfY2F0ZWdvcnknLCByb3csIGNvbF9oYXNoXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgZmllbGRuYW1lID0gdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaFxuICAgIGlmIG5vdCBmaWVsZG5hbWUgdGhlbiBmaWVsZG5hbWUgPSBcIl9cIiArIFN0cmluZyArK3BsYWNlaG9sZGVyX2NvdW50XG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxuICAgIGZpZWxkTmFtZXNIZWxwW2ZpZWxkbmFtZV0gPSB2YWwgJ2hlbHBfdGV4dCcsIHJvdywgY29sX2hhc2hcbiAgICBpZiBjYXRlZ29yeVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldLnB1c2ggbjogdmFsKCduJywgcm93LCBjb2xfaGFzaCksIG5hbWU6IGZpZWxkbmFtZSwgbWFzazogdmFsKCdtYXNrJywgcm93LCBjb2xfaGFzaClcblxuICBjYXRlZ29yaWVzID0gT2JqZWN0LmtleXModGFiX2hhc2gpXG4gIGNhdGVnb3JpZXNfc29ydCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgaWYgbm90IGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV1cbiAgICAgIGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeV1bMF0ublxuICAgIGZpZWxkcyA9IFtdXG4gICAgZm9yIG9iaiBpbiB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICAgIGZpZWxkcy5wdXNoIG9ialxuICAgIGZpZWxkcy5zb3J0IChhLGIpIC0+XG4gICAgICByZXR1cm4gYS5uIC0gYi5uXG4gICAgdGFiX2hhc2hbY2F0ZWdvcnldID0gZmllbGRzXG5cbiAgY2F0ZWdvcmllc19hcnJheSA9IFtdXG4gIGZvciBjYXRlZ29yeSwgbiBvZiBjYXRlZ29yaWVzX3NvcnRcbiAgICBjYXRlZ29yaWVzX2FycmF5LnB1c2ggY2F0ZWdvcnk6IGNhdGVnb3J5LCBuOiBuXG4gIGNhdGVnb3JpZXNfYXJyYXkuc29ydCAoYSxiKSAtPlxuICAgIHJldHVybiBhLm4gLSBiLm5cblxuICB0YWJfbmV3aGFzaCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzX2FycmF5XG4gICAgdGFiX25ld2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldXG5cbiAgdGFicyA9IGhhc2hfdG9fYXJyYXkodGFiX25ld2hhc2gpXG4gIHJldHVybiB0YWJzXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG4gIEB0ZW1wbGF0ZXMgPSB1bmRlZmluZWRcbiAgQGRhdGEgPSB1bmRlZmluZWRcbiAgQGV2ZW50cyA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOigpIC0+XG4gICAgQGxpc3QgPSBbXVxuICAgIEBldmVudHMgPSB7fVxuICAgIHRlbXBsYXRlTGlzdCA9IFsndGFicGFuZWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJywgJ3BlcnNvbi1pbmZvLXRlbXBsYXRlJ11cbiAgICB0ZW1wbGF0ZVBhcnRpYWxzID0gWyd0YWItdGVtcGxhdGUnXVxuICAgIEB0ZW1wbGF0ZXMgPSB7fVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlTGlzdFxuICAgICAgQHRlbXBsYXRlc1t0ZW1wbGF0ZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlUGFydGlhbHNcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHRlbXBsYXRlLCAkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIHBhcmVudDp0aGlzXG4gICAgICBuYW1lOmxheW91dF9uYW1lXG4gICAgICByZW5kZXI6KGRhdCkgLT5cbiAgICAgICAgQHBhcmVudC5kYXRhID0gZGF0XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQsIHRoaXMsIEBwYXJlbnQpXG4gICAgICBiaW5kOiAodHBsX25hbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBpZiBub3QgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdID0gW2NhbGxiYWNrXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgIGFjdGl2YXRlOiAodHBsX25hbWUpIC0+XG4gICAgICAgIGlmIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIGZvciBlLGkgaW4gQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgICBlIHRwbF9uYW1lLCBAcGFyZW50LmRhdGFcblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcblxuICBsb2FkX2Z1c2lvbl90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICB0ID0gY29udmVydF9mdXNpb25fdGVtcGxhdGUgdGVtcGxhdGVfanNvblxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHQpXG5cblxuICBnZXRfbmFtZXM6IC0+XG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcblxuICBnZXRfaW5kZXhfYnlfbmFtZTogKG5hbWUpIC0+XG4gICAgZm9yIHQsaSBpbiBAbGlzdFxuICAgICAgaWYgdC5uYW1lIGlzIG5hbWUgdGhlbiBpXG4gICAgcmV0dXJuIC0xXG5cbiAgZ2V0X2h0bWw6IChpbmQsIGRhdGEpIC0+XG4gICAgaWYgKGluZCBpcyAtMSkgdGhlbiByZXR1cm4gIFwiXCJcblxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cbiAgYWN0aXZhdGU6IChpbmQsIHRwbF9uYW1lKSAtPlxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIEBsaXN0W2luZF0uYWN0aXZhdGUgdHBsX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZXMyXG4iLCIkIC0+XG4gICMkKCcjZ2V0V2lraXBlZGlhQXJ0aWNsZUJ1dHRvbicpLm9uICdjbGljaycsIC0+XG4gICMgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICNhbGVydGFsZXJ0IFwiaGlcIlxuICAjYWxlcnQgJChcIiN3aWtpcGVkaWFQYWdlTmFtZVwiKS50ZXh0KClcbiAgI2dldF93aWtpcGVkaWFfYXJ0aWNsZSgpXG4gIHdpbmRvdy5nZXRfd2lraXBlZGlhX2FydGljbGUgPSBnZXRfd2lraXBlZGlhX2FydGljbGVcbiAgd2luZG93LmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZSA9IGNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZVxuXG5nZXRfd2lraXBlZGlhX2FydGljbGU9KHMpLT5cbiAgYXJ0aWNsZV9uYW1lID0gcy5yZXBsYWNlIC8uKlxcLyhbXi9dKikkLywgXCIkMVwiXG4gICQuZ2V0SlNPTiBcImh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249cGFyc2UmcGFnZT0je2FydGljbGVfbmFtZX0mcHJvcD10ZXh0JmZvcm1hdD1qc29uJmNhbGxiYWNrPT9cIiwgKGpzb24pIC0+IFxuICAgICQoJyN3aWtpcGVkaWFUaXRsZScpLmh0bWwganNvbi5wYXJzZS50aXRsZVxuICAgICQoJyN3aWtpcGVkaWFBcnRpY2xlJykuaHRtbCBqc29uLnBhcnNlLnRleHRbXCIqXCJdXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhOm5vdCgucmVmZXJlbmNlcyBhKVwiKS5hdHRyIFwiaHJlZlwiLCAtPiAgXCJodHRwOi8vd3d3Lndpa2lwZWRpYS5vcmdcIiArICQodGhpcykuYXR0cihcImhyZWZcIilcbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImFcIikuYXR0ciBcInRhcmdldFwiLCBcIl9ibGFua1wiXG4gIFxuY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlPSAtPlxuICBhbGVydCBcIk5vdCBpbXBsZW1lbnRlZFwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2V0X3dpa2lwZWRpYV9hcnRpY2xlOmdldF93aWtpcGVkaWFfYXJ0aWNsZVxuIl19

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
        if (value === '1') {
          map.markerClusterer.removeMarker(marker, true);
        } else {
          map.markerClusterer.addMarker(marker, true);
        }
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

Handlebars.registerHelper('getName', function(name, obj) {
  return obj[name + 'Rank'];
});

Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

Handlebars.registerHelper('some', function(arr, target, opts) {
  console.log(arr[target + 'Rank']);
  return !!arr[target + 'Rank'];
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

Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if (a === b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

Handlebars.registerHelper('concat', function(param1, param2) {
  var temp;
  temp = [param1, param2];
  return temp.join('');
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
    success: function(altTypesData) {
      var tpl;
      tpl = Handlebars.compile($('#rank-order-page').html());
      $('#details').html(tpl(altTypesData));
      $('.loader').hide();
      $('#details').show();
      GOVWIKI.show_data_page();
      console.log(altTypesData);
      GOVWIKI.tplLoaded = true;
      return window.history.pushState({
        template: tpl
      }, 'CPC Civic Profiles', '/rank_order');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxnSkFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixtQkFBQSxHQUFzQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTs7QUFFckMsR0FBQSxHQUFVLElBQUEsS0FBQSxDQUNSO0VBQUEsRUFBQSxFQUFJLFNBQUo7RUFDQSxHQUFBLEVBQUssSUFETDtFQUVBLEdBQUEsRUFBSyxDQUFDLEtBRk47RUFHQSxJQUFBLEVBQU0sQ0FITjtFQUlBLE9BQUEsRUFBUyxDQUpUO0VBS0EsV0FBQSxFQUFhLElBTGI7RUFNQSxjQUFBLEVBQWdCLEtBTmhCO0VBT0EsVUFBQSxFQUFZLEtBUFo7RUFRQSxjQUFBLEVBQWdCLEtBUmhCO0VBU0EsV0FBQSxFQUFhLElBVGI7RUFVQSxrQkFBQSxFQUNFO0lBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMs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b3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuIyBTZXQgbGlmZXRpbWUgb24gMSBkYXlzLCBmb3JtYXQ6IGRheXMgKiBob3VycyAqIG1pbnV0ZXMgKiBzZWNvbmRzICogbWlsbGlzZWNvbmRzLlxucG9pbnRzQ2FjaGVMaWZldGltZSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogMzcuM1xuICBsbmc6IC0xMTkuM1xuICB6b29tOiA2XG4gIG1pblpvb206IDZcbiAgc2Nyb2xsd2hlZWw6IHRydWVcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHBhbkNvbnRyb2w6IGZhbHNlXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxuICB6b29tQ29udHJvbDogdHJ1ZVxuICB6b29tQ29udHJvbE9wdGlvbnM6XG4gICAgc3R5bGU6IGdvb2dsZS5tYXBzLlpvb21Db250cm9sU3R5bGUuU01BTExcbiAgbWFya2VyQ2x1c3RlcmVyOiAobWFwKSAtPlxuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0ZXh0U2l6ZTogMTRcbiAgICAgIHRleHRDb2xvcjogJ3JlZCdcbiAgICAgIGdyaWRTaXplOiAwXG4gICAgICBtaW5pbXVtQ2x1c3RlclNpemU6IDUgIyBBbGxvdyBtaW5pbXVtIDUgbWFya2VyIGluIGNsdXN0ZXIuXG4gICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBEb24ndCBzaG93IGhpZGRlbiBtYXJrZXJzLiBJbiBzb21lIHJlYXNvbiBkb24ndCB3b3JrIDooXG4gICAgICAjIEZvciBkcmF3IGNoYXJ0LlxuICAgICAgbGVnZW5kOlxuICAgICAgICBcIkNpdHlcIiA6IFwicmVkXCJcbiAgICAgICAgXCJTY2hvb2wgRGlzdHJpY3RcIiA6IFwiYmx1ZVwiXG4gICAgICAgIFwiU3BlY2lhbCBEaXN0cmljdFwiIDogXCJwdXJwbGVcIlxuICAgIH1cbiAgICByZXR1cm4gbmV3IE1hcmtlckNsdXN0ZXJlcihtYXAsIFtdLCBvcHRpb25zKTtcblxubWFwLm1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uUklHSFRfVE9QXS5wdXNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdlbmQnKSlcblxucmVyZW5kZXJfbWFya2VycyA9IC0+XG4gIGFkZF9tYXJrZXIocmVjKSBmb3IgcmVjIGluIEdPVldJS0kubWFya2Vyc1xuXG5yZWJ1aWxkX2ZpbHRlciA9IC0+XG4gIGhhcmRfcGFyYW1zID0gWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0JywgJ0NvdW50eSddXG4gIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIgPSBbXVxuICAkKCcudHlwZV9maWx0ZXInKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICBpZiAkKGVsZW1lbnQpLmF0dHIoJ25hbWUnKSBpbiBoYXJkX3BhcmFtcyBhbmQgJChlbGVtZW50KS52YWwoKSA9PSAnMSdcbiAgICAgIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIucHVzaCAkKGVsZW1lbnQpLmF0dHIoJ25hbWUnKVxuXG4jIGxlZ2VuZFR5cGUgPSBjaXR5LCBzY2hvb2wgZGlzdHJpY3QsIHNwZWNpYWwgZGlzdHJpY3QsIGNvdW50aWVzXG5nZXRfcmVjb3JkczIgPSAobGVnZW5kVHlwZSwgb25zdWNjZXNzKSAtPlxuICBkYXRhID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwb2ludHMnKTtcbiAgaWYgKGRhdGEpXG4gICAgI1xuICAgICMgUmVzdG9yZSBtYXJrZXJzIGRhdGEgZnJvbSBsb2NhbCBzdG9yYWdlLlxuICAgIG9uc3VjY2VzcyBKU09OLnBhcnNlKGRhdGEpXG4gIGVsc2VcbiAgICAjXG4gICAgIyBSZXRyaWV2ZSBuZXcgbWFya2VycyBkYXRhIGZyb20gc2VydmVyLlxuICAgICQuYWpheFxuICAgICAgdXJsOlwiL2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAjICAgIHVybDpcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcbiAgICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUsIGxpbWl0OiA1MDAwIH1cbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgIGVycm9yOihlKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiQgLT5cbiAgcmVidWlsZF9maWx0ZXIoKVxuICBkYXRhID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwb2ludHMnKVxuXG4gICNcbiAgIyBMb2FkIG1hcmtlcnMgZGF0YVxuICAjXG4gIGRhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gIGlmIGRhdGEgYW5kICgoTnVtYmVyKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncG9pbnRzX2xhc3RfdXBkYXRlJykpICsgcG9pbnRzQ2FjaGVMaWZldGltZSkgPj0gZGF0ZS5nZXRUaW1lKCkpXG4gICAgI1xuICAgICMgSWYgcG9pbnRzIGRhdGEgY2FjaGVkIGluIGxvY2FsIHN0b3JhZ2UgYW5kIGluIGFjdHVhbCBzdGF0ZSwgbG9hZCBmcm9tIGNhY2hlLlxuICAgICNcbiAgICBjb25zb2xlLmxvZygnRnJvbSBjYWNoZScpXG4gICAgY29uc29sZS5sb2coSlNPTi5wYXJzZShkYXRhKSk7XG4gICAgR09WV0lLSS5tYXJrZXJzID0gSlNPTi5wYXJzZShkYXRhKVxuICBlbHNlXG4gICAgI1xuICAgICMgR2V0IG5ldyBkYXRhIGZyb20gc2VydmVyLlxuICAgICNcbiAgICBnZXRfcmVjb3JkczIgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiwgKGRhdGEpIC0+XG4gICAgICAjXG4gICAgICAjIFN0b3JlIG1hcmtlcnMgZGF0YS5cbiAgICAgICNcbiAgICAgIGNvbnNvbGUubG9nKCdGcm9tIHNlcnZlcicpXG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50cycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50c19sYXN0X3VwZGF0ZScsIGRhdGUuZ2V0VGltZSgpKVxuICAgICAgR09WV0lLSS5tYXJrZXJzID0gZGF0YVxuXG4gICNcbiAgIyBSZW5kZXIgcG9pbnRzIHN0b3JlZCBpbiBHT1ZXSUtJLm1hcmtlcnNcbiAgI1xuICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpOm5vdCguY291bnRpZXMtdHJpZ2dlciknKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaGlkZGVuX2ZpZWxkID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpXG4gICAgdmFsdWUgPSBoaWRkZW5fZmllbGQudmFsKClcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcbiAgICAjXG4gICAgIyBDbGlja2VkIGxlZ2VuZCBhbHQgdHlwZS5cbiAgICBhbHRUeXBlID0gaGlkZGVuX2ZpZWxkLmF0dHIoJ25hbWUnKVxuXG4gICAgcmVidWlsZF9maWx0ZXIoKVxuXG4gICAgI1xuICAgICMgVG9nZ2xlIG1hcmtlciB2aXNpYmxlIHdpdGggdHlwZSBlcXVhbCB0byBjbGlja2VkIGxlZ2VuZC5cbiAgICAjXG4gICAgZm9yIG1hcmtlciBpbiBtYXAubWFya2Vyc1xuICAgICAgaWYgbWFya2VyLnR5cGUgaXMgYWx0VHlwZVxuICAgICAgICAjIFJlbW92ZXxhZGQgbWFya2VycyBmcm9tIGNsdXN0ZXIgYmVjYXVzZSBNYXJrZXJDbHVzdGVyIGlnbm9yZVxuICAgICAgICAjIGhpcyBvcHRpb24gJ2lnbm9yZUhpZGRlbicuXG4gICAgICAgIGlmICh2YWx1ZSBpcyAnMScpXG4gICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5yZW1vdmVNYXJrZXIobWFya2VyLCB0cnVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5hZGRNYXJrZXIobWFya2VyLCB0cnVlKVxuIyAgICAgICAgbWFya2VyLnNldFZpc2libGUoISBtYXJrZXIuZ2V0VmlzaWJsZSgpKVxuXG4gICAgbWFwLm1hcmtlckNsdXN0ZXJlci5yZXBhaW50KCk7XG5cbiAgJCgnI2xlZ2VuZCBsaS5jb3VudGllcy10cmlnZ2VyJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGlmICQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAjXG4gICAgICAjIFNob3cgY291bnRpZXMuXG4gICAgICAjXG4gICAgICBmb3IgcG9seWdvbiBpbiBtYXAucG9seWdvbnNcbiAgICAgICAgcG9seWdvbi5zZXRWaXNpYmxlKHRydWUpXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBIaWRlIGNvdW50aWVzLlxuICAgICAgI1xuICAgICAgZm9yIHBvbHlnb24gaW4gbWFwLnBvbHlnb25zXG4gICAgICAgIHBvbHlnb24uc2V0VmlzaWJsZShmYWxzZSlcblxuXG5cblxuXG5nZXRfaWNvbiA9KGFsdF90eXBlKSAtPlxuXG4gIF9jaXJjbGUgPShjb2xvciktPlxuICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFXG4gICAgZmlsbE9wYWNpdHk6IDFcbiAgICBmaWxsQ29sb3I6IGNvbG9yXG4gICAgc3Ryb2tlV2VpZ2h0OiAxXG4gICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTogNlxuXG4gIHN3aXRjaCBhbHRfdHlwZVxuICAgIHdoZW4gJ0NpdHknIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3JlZCdcbiAgICB3aGVuICdTY2hvb2wgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ2JsdWUnXG4gICAgd2hlbiAnU3BlY2lhbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAncHVycGxlJ1xuICAgIGVsc2UgcmV0dXJuIF9jaXJjbGUgJ3doaXRlJ1xuXG5pbl9hcnJheSA9IChteV9pdGVtLCBteV9hcnJheSkgLT5cbiAgZm9yIGl0ZW0gaW4gbXlfYXJyYXlcbiAgICByZXR1cm4gdHJ1ZSBpZiBpdGVtID09IG15X2l0ZW1cbiAgZmFsc2VcblxuXG5hZGRfbWFya2VyID0gKHJlYyktPlxuICAjY29uc29sZS5sb2cgXCIje3JlYy5yYW5kfSAje3JlYy5pbmNfaWR9ICN7cmVjLnppcH0gI3tyZWMubGF0aXR1ZGV9ICN7cmVjLmxvbmdpdHVkZX0gI3tyZWMuZ292X25hbWV9XCJcbiAgZXhpc3QgPSBpbl9hcnJheSByZWMuYWx0VHlwZSwgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMlxuICBpZiBleGlzdCBpcyBmYWxzZSB0aGVuIHJldHVybiBmYWxzZVxuXG4gIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHJlYy5sYXRpdHVkZSwgcmVjLmxvbmdpdHVkZSlcbiAgICBpY29uOiBnZXRfaWNvbihyZWMuYWx0VHlwZSlcbiAgICB0aXRsZTogIFwiI3tyZWMubmFtZX0sICN7cmVjLnR5cGV9XCIsXG4jICAgIHRpdGxlOiBcIiN7cmVjLmFsdFR5cGV9XCJcbiAgICAjXG4gICAgIyBGb3IgbGVnZW5kIGNsaWNrIGhhbmRsZXIuXG4gICAgdHlwZTogcmVjLmFsdFR5cGVcbiAgfSlcbiAgI1xuICAjIE9uIGNsaWNrIHJlZGlyZWN0IHVzZXIgdG8gZW50aXR5IHBhZ2UuXG4gICNcbiAgbWFya2VyLmFkZExpc3RlbmVyICdjbGljaycsICgpIC0+XG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgY29uc29sZS5sb2coJ0NsaWNrIG9uIG1hcmtlcicpO1xuICAgIHVybCA9IFwiI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9XCJcbiAgICBjb25zb2xlLmxvZyh1cmwpO1xuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhXG4gICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnQvXCIgKyB1cmwsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IEdPVldJS0kudGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgbWFwLmFkZE1hcmtlciBtYXJrZXJcblxuIyAgbWFwLmFkZE1hcmtlclxuIyAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuIyAgICBsbmc6IHJlYy5sb25naXR1ZGVcbiMgICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4jICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIlxuIyAgICBpbmZvV2luZG93OlxuIyAgICAgIGNvbnRlbnQ6IFwiXG4jICAgICAgICA8ZGl2PjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnIGNsYXNzPSdpbmZvLXdpbmRvdy11cmknIGRhdGEtdXJpPScvI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9Jz48c3Ryb25nPiN7cmVjLm5hbWV9PC9zdHJvbmc+PC9hPjwvZGl2PlxuIyAgICAgICAgPGRpdj4gI3tyZWMudHlwZX0gICN7cmVjLmNpdHl9ICN7cmVjLnppcH0gI3tyZWMuc3RhdGV9PC9kaXY+XCJcblxuXG5cbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIG1hcDogbWFwXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgICNAZ292c19hcnJheSA9IGdvdnNcbiAgICBAZ292c19hcnJheSA9IGdvdnMucmVjb3JkXG4gICAgJCgnLnR5cGVhaGVhZCcpLmtleXVwIChldmVudCkgPT5cbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgLCAxMDAwXG5cbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAgIGNsYXNzTmFtZXM6XG4gICAgICAgIFx0bWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAjICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxuICAgIHJldHVyblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzPUdvdlNlbGVjdG9yXG5cblxuXG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xud2lraXBlZGlhID0gcmVxdWlyZSAnLi93aWtpcGVkaWEuY29mZmVlJ1xuXG5nb3ZtYXAgPSBudWxsXG5nb3Zfc2VsZWN0b3IgPSBudWxsXG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYiA9IFwiXCJcbnVuZGVmID0gbnVsbFxuYXV0aG9yaXplZCA9IGZhbHNlXG4jXG4jIEluZm9ybWF0aW9uIGFib3V0IGN1cnJlbnQgdXNlci5cbiNcbnVzZXIgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4jXG4jIElzc3VlcyBjYXRlZ29yeSwgZmlsbCBpbiBlbGVjdGVkIG9mZmljaWFsIHBhZ2UuXG4jXG5jYXRlZ29yaWVzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdnZXROYW1lJywgKG5hbWUsIG9iaikgLT5cbiAgICByZXR1cm4gb2JqW25hbWUrJ1JhbmsnXTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZiBgYSA9PSBiYFxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnc29tZScsIChhcnIsIHRhcmdldCwgb3B0cykgLT5cbiAgICBjb25zb2xlLmxvZyhhcnJbdGFyZ2V0KydSYW5rJ10pO1xuICAgIHJldHVybiAhIWFyclt0YXJnZXQrJ1JhbmsnXTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnZGVidWcnLCAoZW1iZXJPYmplY3QpIC0+XG4gIGlmIGVtYmVyT2JqZWN0IGFuZCBlbWJlck9iamVjdC5jb250ZXh0c1xuICAgIG91dCA9ICcnO1xuXG4gICAgZm9yIGNvbnRleHQgaW4gZW1iZXJPYmplY3QuY29udGV4dHNcbiAgICAgIGZvciBwcm9wIGluIGNvbnRleHRcbiAgICAgICAgb3V0ICs9IHByb3AgKyBcIjogXCIgKyBjb250ZXh0W3Byb3BdICsgXCJcXG5cIlxuXG4gICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdcXG4tLS0tLS0tLS0tLS0tLS0tXFxuXCIgKyBvdXQpXG5cblxud2luZG93LkdPVldJS0kgPVxuICAgIHN0YXRlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyXzI6IFsnQ2l0eScsICdTY2hvb2wgRGlzdHJpY3QnLCAnU3BlY2lhbCBEaXN0cmljdCddXG5cbiAgICBzaG93X3NlYXJjaF9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgZm9jdXNfc2VhcmNoX2ZpZWxkIDUwMFxuXG4gICAgc2hvd19kYXRhX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuXG5HT1ZXSUtJLnRlbXBsYXRlcyA9IHRlbXBsYXRlcztcbkdPVldJS0kudHBsTG9hZGVkID0gZmFsc2VcblxuR09WV0lLSS5nZXRfY291bnRpZXMgPSBnZXRfY291bnRpZXMgPSAoY2FsbGJhY2spIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJy9sZWdhY3kvZGF0YS9jb3VudHlfZ2VvZ3JhcGh5X2NhXzIuanNvbidcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoY291bnRpZXNKU09OKSAtPlxuICAgICAgICAgICAgY2FsbGJhY2sgY291bnRpZXNKU09OXG5cbkdPVldJS0kuZHJhd19wb2x5Z29ucyA9IGRyYXdfcG9seWdvbnMgPSAoY291bnRpZXNKU09OKSAtPlxuICAgIGZvciBjb3VudHkgaW4gY291bnRpZXNKU09OLmZlYXR1cmVzXG4gICAgICAgIGRvIChjb3VudHkpID0+XG4gICAgICAgICAgICBnb3ZtYXAubWFwLmRyYXdQb2x5Z29uKHtcbiAgICAgICAgICAgICAgICBwYXRoczogY291bnR5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXG4gICAgICAgICAgICAgICAgdXNlR2VvSlNPTjogdHJ1ZVxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnIzgwODA4MCdcbiAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAwLjZcbiAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDEuNVxuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyNGRjAwMDAnXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuMTVcbiAgICAgICAgICAgICAgICBjb3VudHlJZDogY291bnR5LnByb3BlcnRpZXMuX2lkXG4gICAgICAgICAgICAgICAgYWx0TmFtZTogY291bnR5LnByb3BlcnRpZXMuYWx0X25hbWVcbiAgICAgICAgICAgICAgICBtYXJrZXI6IG5ldyBNYXJrZXJXaXRoTGFiZWwoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcmFpc2VPbkRyYWc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IGdvdm1hcC5tYXAubWFwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENvbnRlbnQ6IGNvdW50eS5wcm9wZXJ0aWVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoLTE1LCAyNSksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQ2xhc3M6IFwibGFiZWwtdG9vbHRpcFwiLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7b3BhY2l0eTogMS4wfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzF4MVwiLFxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgbW91c2VvdmVyOiAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE9wdGlvbnMoe2ZpbGxDb2xvcjogXCIjMDBGRjAwXCJ9KVxuICAgICAgICAgICAgICAgIG1vdXNlbW92ZTogKGV2ZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbihldmVudC5sYXRMbmcpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUodHJ1ZSlcbiAgICAgICAgICAgICAgICBtb3VzZW91dDogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiI0ZGMDAwMFwifSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZShmYWxzZSlcbiAgICAgICAgICAgICAgICBjbGljazogLT5cbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHVyaSA9IFwiLyN7Y291bnR5LmFsdF90eXBlX3NsdWd9LyN7Y291bnR5LnByb3BlcnRpZXMuc2x1Z31cIlxuICAgICAgICAgICAgICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuICAgICAgICAgICAgfSlcblxud2luZG93LnJlbWVtYmVyX3RhYiA9IChuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbiQoZG9jdW1lbnQpLm9uICdjbGljaycsICcjZmllbGRUYWJzIGEnLCAoZSkgLT5cbiAgICBhY3RpdmVfdGFiID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3RhYm5hbWUnKVxuICAgIGNvbnNvbGUubG9nIGFjdGl2ZV90YWJcbiAgICAkKFwiI3RhYnNDb250ZW50IC50YWItcGFuZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKVxuICAgICQoJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSkuYWRkQ2xhc3MoXCJhY3RpdmVcIilcbiAgICB0ZW1wbGF0ZXMuYWN0aXZhdGUgMCwgYWN0aXZlX3RhYlxuXG4gICAgaWYgYWN0aXZlX3RhYiA9PSAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gMFxuICAgICAgICBmaW5WYWxXaWR0aE1heDMgPSAwXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMVwiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4MVxuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDJcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDIgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIzXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgzXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMVwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDEgKyAyNylcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMlwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDIgKyAyNylcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDMgKyAyNylcblxuJChkb2N1bWVudCkudG9vbHRpcCh7c2VsZWN0b3I6IFwiW2NsYXNzPSdtZWRpYS10b29sdGlwJ11cIiwgdHJpZ2dlcjogJ2NsaWNrJ30pXG5cbmFjdGl2YXRlX3RhYiA9ICgpIC0+XG4gICAgJChcIiNmaWVsZFRhYnMgYVtocmVmPScjdGFiI3thY3RpdmVfdGFifSddXCIpLnRhYignc2hvdycpXG5cblxuZ2V0X3JlY29yZDIgPSAocmVjaWQpIC0+XG4gICAgY29uc29sZS5sb2coJyEhQCNAJyk7XG4jIGNsZWFyIHdpa2lwZWRpYSBwbGFjZVxuICAgICQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoXCJcIilcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL2dvdnMvI3tyZWNpZH1cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGhlYWRlcnM6IHtcIlgtRHJlYW1GYWN0b3J5LUFwcGxpY2F0aW9uLU5hbWVcIjogXCJnb3Z3aWtpXCJ9XG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgIGdldF9maW5hbmNpYWxfc3RhdGVtZW50cyBkYXRhLl9pZCwgKGRhdGEyLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cyA9IGRhdGEyXG4gICAgICAgICAgICAgICAgICAgIGdldF9lbGVjdGVkX29mZmljaWFscyBkYXRhLl9pZCwgMjUsIChkYXRhMywgdGV4dFN0YXR1czIsIGpxWEhSMikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhM1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0X21heF9yYW5rcyAobWF4X3JhbmtzX3Jlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWF4X3JhbmtzID0gbWF4X3JhbmtzX3Jlc3BvbnNlLnJlY29yZFswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNUT0RPOiBFbmFibGUgYWZ0ZXIgcmVhbGl6ZSBtYXhfcmFua3MgYXBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcblxuICAgICAgICAgICAgIyBmaWxsIHdpa2lwZWRpYSBwbGFjZVxuICAgICAgICAgICAgI3dwbiA9IGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgICAgICAgICAgIyQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoaWYgd3BuIHRoZW4gd3BuIGVsc2UgXCJObyBXaWtpcGVkaWEgYXJ0aWNsZVwiKVxuXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9lbGVjdGVkX29mZmljaWFscyA9IChhbHRfdHlwZSwgZ292X25hbWUsIG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OS9hcGkvZ292ZXJubWVudC9cIiArIGFsdF90eXBlICsgJy8nICsgZ292X25hbWVcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5nZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgPSAoZ292X2lkLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9fcHJvYy9nZXRfZmluYW5jaWFsX3N0YXRlbWVudHNcIlxuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6IFwiZ292d2lraVwiXG4gICAgICAgICAgICBvcmRlcjogXCJjYXB0aW9uX2NhdGVnb3J5LGRpc3BsYXlfb3JkZXJcIlxuICAgICAgICAgICAgcGFyYW1zOiBbXG4gICAgICAgICAgICAgICAgbmFtZTogXCJnb3ZzX2lkXCJcbiAgICAgICAgICAgICAgICBwYXJhbV90eXBlOiBcIklOXCJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZ292X2lkXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9tYXhfcmFua3MgPSAob25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICdodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9tYXhfcmFua3MnXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgICBhcHBfbmFtZTogJ2dvdndpa2knXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0gKHJlYyk9PlxuICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgIGFjdGl2YXRlX3RhYigpXG4gICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgcm91dGVyLm5hdmlnYXRlKHJlYy5faWQpXG5cblxud2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQyID0gKHJlYyk9PlxuICAgIGdldF9lbGVjdGVkX29mZmljaWFscyByZWMuYWx0VHlwZVNsdWcsIHJlYy5zbHVnLCAoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgIHJlYy5lbGVjdGVkX29mZmljaWFscyA9IGRhdGFcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCByZWMpXG4gICAgICAgICNnZXRfcmVjb3JkMiByZWMuaWRcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIHVybCA9IHJlYy5hbHRUeXBlU2x1ZyArICcvJyArIHJlYy5zbHVnXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gdXJsXG5cblxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCBjb21tYW5kLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9hcGkubW9uZ29sYWIuY29tL2FwaS8xL2RhdGFiYXNlcy9nb3Z3aWtpL3J1bkNvbW1hbmQ/YXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5J1xuICAgICAgICB0eXBlOiAnUE9TVCdcbiAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgZGF0YTogY29tbWFuZCAjSlNPTi5zdHJpbmdpZnkoY29tbWFuZClcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlc1xuICAgICAgICAgICAgYnVpbGRfc2VsZWN0X2VsZW1lbnQgY29udGFpbmVyLCB0ZXh0LCB2YWx1ZXMuc29ydCgpLCB3aGVyZV90b19zdG9yZV92YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgcyA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICAgIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyIHdoZW4gdlxuICAgIHMgKz0gXCI8L3NlbGVjdD5cIlxuICAgIHNlbGVjdCA9ICQocylcbiAgICAkKGNvbnRhaW5lcikuYXBwZW5kKHNlbGVjdClcblxuICAgICMgc2V0IGRlZmF1bHQgJ0NBJ1xuICAgIGlmIHRleHQgaXMgJ1N0YXRlLi4nXG4gICAgICAgIHNlbGVjdC52YWwgJ0NBJ1xuICAgICAgICB3aW5kb3cuR09WV0lLSS5zdGF0ZV9maWx0ZXIgPSAnQ0EnXG5cbiAgICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgICAgICBlbCA9ICQoZS50YXJnZXQpXG4gICAgICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXG4gICAgICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgZ292X3NlbGVjdG9yLmNvdW50X2dvdnMoKVxuXG5hZGp1c3RfdHlwZWFoZWFkX3dpZHRoID0gKCkgLT5cbiAgICBpbnAgPSAkKCcjbXlpbnB1dCcpXG4gICAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gICAgaW5wLndpZHRoIHBhci53aWR0aCgpXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgICAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcblxuZm9jdXNfc2VhcmNoX2ZpZWxkID0gKG1zZWMpIC0+XG4gICAgc2V0VGltZW91dCAoLT4gJCgnI215aW5wdXQnKS5mb2N1cygpKSwgbXNlY1xuXG5cbiMgcXVpY2sgYW5kIGRpcnR5IGZpeCBmb3IgYmFjayBidXR0b24gaW4gYnJvd3Nlclxud2luZG93Lm9uaGFzaGNoYW5nZSA9IChlKSAtPlxuICAgIGggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxuICAgIGlmIG5vdCBoXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoKGl0bSktPiBpZiBpdG0gaXNudCBcIlwiIHRoZW4gaXRtIGVsc2UgZmFsc2UpO1xucm91dGVUeXBlID0gcm91dGUubGVuZ3RoO1xuXG5HT1ZXSUtJLmhpc3RvcnkgPSAoaW5kZXgpIC0+XG4gICAgaWYgaW5kZXggPT0gMFxuICAgICAgICBzZWFyY2hDb250YWluZXIgPSAkKCcjc2VhcmNoQ29udGFpbmVyJykudGV4dCgpO1xuICAgICAgICBpZihzZWFyY2hDb250YWluZXIgIT0gJycpXG4jICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4gICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nXG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGhpc3Rvcnkuc3RhdGUgIT0gbnVsbCAmJiBoaXN0b3J5LnN0YXRlLnRlbXBsYXRlICE9IHVuZGVmaW5lZClcbiAgICAgICAgd2luZG93Lmhpc3RvcnkuZ28oaW5kZXgpO1xuICAgIGVsc2VcbiAgICAgICAgcm91dGUucG9wKClcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLycgKyByb3V0ZS5qb2luKCcvJylcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3BvcHN0YXRlJywgKGV2ZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKHdpbmRvdy5oaXN0b3J5LnN0YXRlKVxuICAgIGlmIHdpbmRvdy5oaXN0b3J5LnN0YXRlIGlzbnQgbnVsbFxuICAgICAgICByb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbiAgICAgICAgcm91dGUgPSByb3V0ZS5sZW5ndGg7XG5cbiAgICAgICAgY29uc29sZS5sb2cocm91dGUpXG4gICAgICAgIGlmIHJvdXRlIGlzIDBcbiAgICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4gICAgICAgIGlmIHJvdXRlIGlzIDJcbiAgICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKCk7XG4gICAgICAgIGlmIHJvdXRlIGlzbnQgMFxuICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBldmVudC5zdGF0ZS50ZW1wbGF0ZVxuICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIGVsc2VcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcbiAgICAgICAgaWYgR09WV0lLSS50cGxMb2FkZWQgaXMgZmFsc2UgdGhlbiBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuXG4jIFJlZnJlc2ggRGlzcXVzIHRocmVhZFxucmVmcmVzaF9kaXNxdXMgPSAobmV3SWRlbnRpZmllciwgbmV3VXJsLCBuZXdUaXRsZSkgLT5cbiAgICBESVNRVVMucmVzZXRcbiAgICAgICAgcmVsb2FkOiB0cnVlLFxuICAgICAgICBjb25maWc6ICgpIC0+XG4gICAgICAgICAgICB0aGlzLnBhZ2UuaWRlbnRpZmllciA9IG5ld0lkZW50aWZpZXJcbiAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBuZXdVcmxcbiAgICAgICAgICAgIHRoaXMucGFnZS50aXRsZSA9IG5ld1RpdGxlXG5cbiNcbiMgU29ydCB0YWJsZSBieSBjb2x1bW4uXG4jIEBwYXJhbSBzdHJpbmcgdGFibGUgIEpRdWVyeSBzZWxlY3Rvci5cbiMgQHBhcmFtIG51bWJlciBjb2xOdW0gQ29sdW1uIG51bWJlci5cbiNcbnNvcnRUYWJsZSA9ICh0YWJsZSwgY29sTnVtKSAtPlxuICAgICNcbiAgICAjIERhdGEgcm93cyB0byBzb3J0XG4gICAgI1xuICAgIHJvd3MgPSAkKHRhYmxlICsgJyB0Ym9keSAgW2RhdGEtaWRdJykuZ2V0KClcbiAgICAjXG4gICAgIyBMYXN0IHJvdyB3aGljaCBjb250YWlucyBcIkFkZCBuZXcgLi4uXCJcbiAgICAjXG4gICAgbGFzdFJvdyA9ICQodGFibGUgKyAnIHRib2R5ICB0cjpsYXN0JykuZ2V0KCk7XG4gICAgI1xuICAgICMgQ2xpY2tlZCBjb2x1bW4uXG4gICAgI1xuICAgIGNvbHVtbiA9ICQodGFibGUgKyAnIHRib2R5IHRyOmZpcnN0JykuY2hpbGRyZW4oJ3RoJykuZXEoY29sTnVtKVxuICAgIG1ha2VTb3J0ID0gdHJ1ZVxuXG4gICAgaWYgY29sdW1uLmhhc0NsYXNzKCdkZXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICAgICAgIyBSZXN0b3JlIHJvdyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnZGVzYycpLmFkZENsYXNzKCdvcmlnaW4nKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICByb3dzID0gY29sdW1uLmRhdGEoJ29yaWdpbicpXG4gICAgICBtYWtlU29ydCA9IGZhbHNlO1xuICAgIGVsc2UgaWYgY29sdW1uLmhhc0NsYXNzKCdhc2MnKVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBjdXJyZW50bHkgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlci5cbiAgICAgICMgU29ydCBpbiBkZXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdhc2MnKS5hZGRDbGFzcygnZGVzYycpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKS5hZGRDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAxXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIHJldHVybiAwXG5cbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnb3JpZ2luJylcbiAgICAgICNcbiAgICAgICMgT3JpZ2luYWwgdGFibGUgZGF0YSBvcmRlci5cbiAgICAgICMgU29ydCBpbiBhc2Mgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ29yaWdpbicpLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5hZGRDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAtMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBub3Qgb3JkZXJlZCB5ZXQuXG4gICAgICAjIFN0b3JlIG9yaWdpbmFsIGRhdGEgcG9zaXRpb24gYW5kIHNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuXG4gICAgICBjb2x1bW4uYWRkQ2xhc3MoJ2FzYycpXG4gICAgICBjb2x1bW4uZGF0YSgnb3JpZ2luJywgcm93cy5zbGljZSgwKSlcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgaWYgKG1ha2VTb3J0KSB0aGVuIHJvd3Muc29ydCBzb3J0RnVuY3Rpb25cbiAgICAkLmVhY2ggcm93cywgKGluZGV4LCByb3cpIC0+XG4gICAgICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChyb3cpXG4gICAgJCh0YWJsZSkuY2hpbGRyZW4oJ3Rib2R5JykuYXBwZW5kKGxhc3RSb3cpXG5cbmluaXRUYWJsZUhhbmRsZXJzID0gKHBlcnNvbikgLT5cbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpXG5cbiAgICAkKCcuZWRpdGFibGUnKS5lZGl0YWJsZSh7c3R5bGVzaGVldHM6IGZhbHNlLHR5cGU6ICd0ZXh0YXJlYScsIHNob3didXR0b25zOiAnYm90dG9tJywgZGlzcGxheTogdHJ1ZSwgZW1wdHl0ZXh0OiAnICd9KVxuICAgICQoJy5lZGl0YWJsZScpLm9mZignY2xpY2snKTtcblxuICAgICQoJ3RhYmxlJykub24gJ2NsaWNrJywgJy5nbHlwaGljb24tcGVuY2lsJywgKGUpIC0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubm9FZGl0YWJsZSBpc250IHVuZGVmaW5lZCB0aGVuIHJldHVyblxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVswXS5pZClcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZGF0YUlkJywgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJykuYXR0cignZGF0YS1pZCcpKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdmaWVsZCcsIE51bWJlcigoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykpWzBdLmNlbGxJbmRleCkgKyAxKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG5cbiAgICAjXG4gICAgIyBBZGQgc29ydCBoYW5kbGVycy5cbiAgICAjXG4gICAgJCgnLnNvcnQnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdHlwZSA9ICQodGhpcykuYXR0cignZGF0YS1zb3J0LXR5cGUnKVxuXG4gICAgICBpZiB0eXBlIGlzICd5ZWFyJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSB5ZWFyLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAwKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICduYW1lJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBuYW1lLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAxKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdhbW91bnQnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGFtb3VudC5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMylcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnY29udHJpYnV0b3ItdHlwZSdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgY29udHJpYnV0b3IgdHlwZS5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgNClcblxuICAgICQoJ2EnKS5vbiAnc2F2ZScsIChlLCBwYXJhbXMpIC0+XG4gICAgICAgIGVudGl0eVR5cGUgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGFibGUnKVswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgaWQgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKVswXS5kYXRhc2V0LmlkXG4gICAgICAgIGZpZWxkID0gT2JqZWN0LmtleXMoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJylbMF0uZGF0YXNldClbMF1cblxuICAgICAgICBpZiBmaWVsZCBpcyAndm90ZScgb3IgZmllbGQgaXMgJ2RpZEVsZWN0ZWRPZmZpY2lhbFByb3Bvc2VUaGlzJ1xuICAgICAgICAgICMjI1xuICAgICAgICAgICAgQ3VycmVudCBmaWVsZCBvd25lZCBieSBFbGVjdGVkT2ZmaWNpYWxWb3RlXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgZW50aXR5VHlwZSA9ICdFbGVjdGVkT2ZmaWNpYWxWb3RlJ1xuICAgICAgICAgIGlkID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLmZpbmQoJ3NwYW4nKVswXS5kYXRhc2V0LmlkXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGVkaXRSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogaWQsXG4gICAgICAgICAgICAgICAgY2hhbmdlczoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QuY2hhbmdlc1tmaWVsZF0gPSBwYXJhbXMubmV3VmFsdWVcbiAgICAgICAgc2VuZE9iamVjdC5lZGl0UmVxdWVzdCA9IEpTT04uc3RyaW5naWZ5KHNlbmRPYmplY3QuZWRpdFJlcXVlc3QpO1xuICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9jcmVhdGUnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQvanNvbicsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgdGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICB9XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuYWRkJywgKGUpIC0+XG4gICAgICAgIHRhYlBhbmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgICB0YWJsZVR5cGUgPSB0YWJQYW5lWzBdLmlkXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0gJ3RhYmxlVHlwZScsIHRhYmxlVHlwZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICBjdXJyZW50RW50aXR5ID0gbnVsbFxuICAgICAgICBjb25zb2xlLmxvZyh0YWJsZVR5cGUpXG4gICAgICAgIGlmIHRhYmxlVHlwZSBpcyAnVm90ZXMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZFZvdGVzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdDb250cmlidXRpb24nXG4gICAgICAgICAgICAkKCcjYWRkQ29udHJpYnV0aW9ucycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdFbmRvcnNlbWVudCdcbiAgICAgICAgICAgICQoJyNhZGRFbmRvcnNlbWVudHMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ1N0YXRlbWVudHMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgICQoJyNhZGRTdGF0ZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgU2V0IGdldCB1cmwgY2FsbGJhY2suXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICQoJy51cmwtaW5wdXQnKS5vbiAna2V5dXAnLCAoKSAtPlxuICAgICAgICAgICAgICBtYXRjaF91cmwgPSAvXFxiKGh0dHBzPyk6XFwvXFwvKFtcXC1BLVowLTkuXSspKFxcL1tcXC1BLVowLTkrJkAjXFwvJT1+X3whOiwuO10qKT8oXFw/W0EtWjAtOSsmQCNcXC8lPX5ffCE6LC47XSopPy9pXG4gICAgICAgICAgICAgIGlmIChtYXRjaF91cmwudGVzdCgkKHRoaXMpLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAkLmFqYXggJy9hcGkvdXJsL2V4dHJhY3QnLCB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICQodGhpcykudmFsKCkubWF0Y2gobWF0Y2hfdXJsKVswXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50ID0gJCgnI3VybC1zdGF0ZW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBDbGVhci5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCAnJylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgU2V0IHRpdGxlLlxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQocmVzcG9uc2UuZGF0YS50aXRsZSlcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAnaHRtbCcpXG4gICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICMgSWYgdXJsIHBvaW50IHRvIGh0bWwsIGhpZGUgaW1nIGFuZCBzZXQgYm9keS5cbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dChyZXNwb25zZS5kYXRhLmJvZHkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlIGlzICd5b3V0dWJlJylcbiAgICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICAgIyBJZiB1cmwgcG9pbnQgdG8geW91dHViZSwgc2hvdyB5b3V0dWJlIHByZXZpZXcgaW1hZ2UuXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YS5wcmV2aWV3KVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAnaW1hZ2UnKVxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEucHJldmlldylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5zbGlkZURvd24oKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudCA9ICQoJyN1cmwtc3RhdGVtZW50JylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgQ2xlYXIuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgJycpXG5cbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoZXJyb3IucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LnNsaWRlRG93bigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICBpZiB0YWJQYW5lLmhhc0NsYXNzKCdsb2FkZWQnKSB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0YWJQYW5lWzBdLmNsYXNzTGlzdC5hZGQoJ2xvYWRlZCcpXG5cbiAgICAgICAgcGVyc29uTWV0YSA9IHtcImNyZWF0ZVJlcXVlc3RcIjp7XCJlbnRpdHlOYW1lXCI6Y3VycmVudEVudGl0eSxcImtub3duRmllbGRzXCI6e1wiZWxlY3RlZE9mZmljaWFsXCI6cGVyc29uLmlkfX19XG4gICAgICAgICQuYWpheChcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L25ldycsXG4gICAgICAgICAgICBkYXRhOiBwZXJzb25NZXRhLFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBlbmRPYmogPSB7fVxuICAgICAgICAgICAgICAgIGRhdGEuY2hvaWNlc1swXS5jaG9pY2VzLmZvckVhY2ggKGl0ZW0sIGluZGV4KSAtPlxuICAgICAgICAgICAgICAgICAgaWRzID0gT2JqZWN0LmtleXMgaXRlbVxuICAgICAgICAgICAgICAgICAgaWRzLmZvckVhY2ggKGlkKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIGVuZE9ialtpZF0gPSBpdGVtW2lkXVxuXG4gICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcyA9ICgpIC0+XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBkYXRhLmNob2ljZXNbMF0ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgZmlyc3QgYmxhbmsgb3B0aW9uLlxuICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKVxuICAgICAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcbiAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiBlbmRPYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGVuZE9ialtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcblxuICAgICAgICAgICAgICAgIHNlbGVjdCA9IG51bGxcblxuICAgICAgICAgICAgICAgIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0VuZG9yc2VtZW50J1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdDb250cmlidXRpb24nXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkVm90ZXMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLmZpbmQoJ1tkYXRhLXByb3ZpZGU9XCJkYXRlcGlja2VyXCJdJykub24oXG4gICAgICAgICAgICAgICAgICAgICAgJ2NoYW5nZURhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICgpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIgJ2hpZGUnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIEZpbGwgZWxlY3RlZCBvZmZpY2lhbHMgdm90ZXMgdGFibGUuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjbGVnaXNsYXRpb24tdm90ZScpLmh0bWwoKSlcbiAgICAgICAgICAgICAgICAgICAgJCgnI2VsZWN0ZWRWb3RlcycpLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKTtcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnUHVibGljU3RhdGVtZW50J1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkU3RhdGVtZW50cyBzZWxlY3QnKVswXVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FkZFN0YXRlbWVudHMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAoKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgaWYoZXJyb3Iuc3RhdHVzID09IDQwMSkgdGhlbiBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICk7XG5cbiAgICB3aW5kb3cuYWRkSXRlbSA9IChlKSAtPlxuICAgICAgICBuZXdSZWNvcmQgPSB7fVxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXG4gICAgICAgIG1vZGFsVHlwZSA9IG1vZGFsWzBdLmlkXG4gICAgICAgIGVudGl0eVR5cGUgPSBtb2RhbFswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgR2V0IHZhbHVlIGZyb20gaW5wdXQgZmllbGRzLlxuICAgICAgICAjIyNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIHRleGFyZWEncy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ3RleHRhcmVhJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICBhc3NvY2lhdGlvbnMgPSB7fVxuICAgICAgICBpZiBtb2RhbFR5cGUgIT0gJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW1wiZWxlY3RlZE9mZmljaWFsXCJdID0gcGVyc29uLmlkXG4gICAgICAgICNcbiAgICAgICAgIyBBcnJheSBvZiBzdWIgZW50aXRpZXMuXG4gICAgICAgICNcbiAgICAgICAgY2hpbGRzID0gW11cblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgQWRkIGluZm9ybWF0aW9uIGFib3V0IHZvdGVzLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBtb2RhbC5maW5kKCcjZWxlY3RlZFZvdGVzJykuZmluZCgndHJbZGF0YS1lbGVjdGVkXScpLiBlYWNoIChpZHgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoZWxlbWVudClcblxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAjIEdldCBhbGwgc3ViIGVudGl0eSBmaWVsZHMuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGRhdGEgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3NlbGVjdCcpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgIEFkZCBvbmx5IGlmIGFsbCBmaWVsZHMgaXMgc2V0LlxuICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIGlmIE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkcyA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydmaWVsZHMnXSA9IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXVtlbGVtZW50LmF0dHIoJ2RhdGEtZW50aXR5LXR5cGUnKV0gPSBlbGVtZW50LmF0dHIoJ2RhdGEtZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5TmFtZSA9IGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkuYXR0ciAnZGF0YS1lbnRpdHktdHlwZSdcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5TmFtZTogY2hpbGRFbnRpdHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoaWxkIGZpZWxkcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkczogZmllbGRzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCBjYXRlZ29yeS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGNhdGVnb3J5LicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGZpZWxkczogeyBmaWVsZHM6IG5ld1JlY29yZCwgYXNzb2NpYXRpb25zOiBhc3NvY2lhdGlvbnMsIGNoaWxkczogY2hpbGRzfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEFwcGVuZCBuZXcgZW50aXR5IHRvIHRhYmxlLlxuICAgICAgICAjIyNcbiAgICAgICAgcm93VGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJChcIiNyb3ctI3ttb2RhbFR5cGV9XCIpLmh0bWwoKSk7XG5cbiAgICAgICAgI1xuICAgICAgICAjIENvbGxlY3QgZGF0YS5cbiAgICAgICAgI1xuICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgIGRhdGFbJ3VzZXInXSA9IHVzZXIudXNlcm5hbWVcblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIENoZWNrIGlmIHVzZXIgc3BlY2lmaWVkIGhvdyBjdXJyZW50IGVsZWN0ZWQgb2ZmaWNpYWwgdm90ZWQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIG9iaiBpbiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmNoaWxkc1xuICAgICAgICAgICAgICBpZiBOdW1iZXIob2JqLmZpZWxkcy5hc3NvY2lhdGlvbnMuZWxlY3RlZE9mZmljaWFsKSA9PSBOdW1iZXIocGVyc29uLmlkKVxuICAgICAgICAgICAgICAgIGFkZCA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmouZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIElmIHdlIGZvdW5kLCBzaG93LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgICAkKCcjVm90ZXMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZGF0YS5jb250cmlidXRvclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgIGRhdGEuY29udHJpYnV0aW9uQW1vdW50ID0gbnVtZXJhbChkYXRhLmNvbnRyaWJ1dGlvbkFtb3VudCkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgICAgICAkKCcjQ29udHJpYnV0aW9ucyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgZGF0YS5lbmRvcnNlclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICQoJyNFbmRvcnNlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAkKCcjU3RhdGVtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIFNlbmQgY3JlYXRlIHJlcXVlc3QgdG8gYXBpLlxuICAgICAgICAjIyNcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L2NyZWF0ZScsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAjIENsb3NlIG1vZGFsIHdpbmRvd1xuICAgICAgICBtb2RhbC5tb2RhbCAnaGlkZSdcblxuICAgICMjI1xuICAgICAgICBJZiB1c2VyIHRyeSB0byBhZGQgb3IgdXBkYXRlIHNvbWUgZGF0YSB3aXRob3V0IGxvZ2dlZCBpbiwgd2VcbiAgICAgICAgc2hvdyBoaW0gbG9naW4vc2lnbiB1cCB3aW5kb3cuIEFmdGVyIGF1dGhvcml6aW5nIHVzZXIgcmVkaXJlY3QgYmFja1xuICAgICAgICB0byBwYWdlLCB3aGVyZSBoZSBwcmVzIGFkZC9lZGl0IGJ1dHRvbi4gSW4gdGhhdCBjYXNlIHdlIHNob3cgaGltIGFwcHJvcHJpYXRlXG4gICAgICAgIG1vZGFsIHdpbmRvdy5cblxuICAgICAgICBUaW1lb3V0IG5lZWQgYmVjYXVzZSB3ZSBkb24ndCBrbm93IHdoZW4gd2UgZ2V0IHVzZXIgaW5mb3JtYXRpb24gYW5kIGVsZWN0ZWQgb2ZmaWNpYWwgaW5mb3JtYXRpb24uXG4gICAgIyMjXG4gICAgd2luZG93LnNldFRpbWVvdXQoICgpIC0+XG4gICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgIHJldHVyblxuXG4gICAgICB0eXBlID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3RhYmxlVHlwZScpXG4gICAgICBkYXRhSWQgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnZGF0YUlkJylcbiAgICAgIGZpZWxkID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2ZpZWxkJylcblxuICAgICAgaWYgKGRhdGFJZCAmJiBmaWVsZClcbiAgICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgICAkKCd0cltkYXRhLWlkPScrZGF0YUlkKyddJykuZmluZCgndGQ6bnRoLWNoaWxkKCcrZmllbGQrJyknKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAnJylcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICcnKVxuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCAnJylcblxuICAgICAgZWxzZSBpZiAodHlwZSlcbiAgICAgICAgJCgnZGl2IycgKyB0eXBlKS5maW5kKCcuYWRkJykuY2xpY2soKVxuICAgICAgICAkKCdhW2FyaWEtY29udHJvbHM9XCInICsgdHlwZSArICdcIl0nKS5jbGljaygpXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAnJylcbiAgICAsXG4gICAgMjAwMFxuICAgIClcblxuXG4jIyNcbiAgQXBwZW5kIGNyZWF0ZSByZXF1ZXN0cyB0byBhbGwgY3VycmVudCBlbGVjdGVkT2ZmaWNpYWwgcGFnZS5cbiMjI1xuc2hvd0NyZWF0ZVJlcXVlc3RzID0gKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpIC0+XG4gICAgIyBEb24ndCBzaG93IG5vdCBhcHByb3ZlZCBjcmVhdGUgcmVxdWVzdCB0byBhbm9uLlxuICAgIGlmICghYXV0aG9yaXplZCkgdGhlbiByZXR1cm5cblxuICAgIGxlZ2lzbGF0aW9uUm93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkVm90ZXMnKS5odG1sKCkpXG4gICAgY29udHJpYnV0aW9uUm93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkQ29udHJpYnV0aW9ucycpLmh0bWwoKSlcbiAgICBlbmRvcnNlbWVudFJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZEVuZG9yc2VtZW50cycpLmh0bWwoKSlcbiAgICBzdGF0ZW1lbnRSb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRTdGF0ZW1lbnRzJykuaHRtbCgpKVxuXG4gICAgZm9yIHJlcXVlc3QgaW4gY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgI1xuICAgICAgICAjIFByZXBhcmUgY3JlYXRlIHJlcXVlc3QgZGF0YSBmb3IgdGVtcGxhdGUuXG4gICAgICAgICNcbiAgICAgICAgZGF0YSA9IHJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICBkYXRhWyd1c2VyJ10gPSByZXF1ZXN0LnVzZXIudXNlcm5hbWVcblxuICAgICAgICAjXG4gICAgICAgICMgRmluZCBvdXQgdGVtcGxhdGUgZm9yIGN1cnJlbnQgcmVxdWVzdCBhbmQgYWRkaXRpb25hbCB2YWx1ZXMuXG4gICAgICAgICNcbiAgICAgICAgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkxlZ2lzbGF0aW9uXCJcbiAgICAgICAgICAgIG5hbWUgPSAnVm90ZXMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGxlZ2lzbGF0aW9uUm93XG4gICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiByZXF1ZXN0LmZpZWxkcy5jaGlsZHNbMF0uZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gY2F0ZWdvcmllc1tyZXF1ZXN0LmZpZWxkcy5hc3NvY2lhdGlvbnMuaXNzdWVDYXRlZ29yeSAtIDFdLm5hbWVcblxuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJDb250cmlidXRpb25cIlxuICAgICAgICAgICAgbmFtZSA9ICdDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBjb250cmlidXRpb25Sb3dcblxuICAgICAgICAgICAgZGF0YVsnY29udHJpYnV0aW9uQW1vdW50J10gPSBudW1lcmFsKGRhdGFbJ2NvbnRyaWJ1dGlvbkFtb3VudCddKS5mb3JtYXQoJzAsMDAwJylcbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiRW5kb3JzZW1lbnRcIlxuICAgICAgICAgICAgbmFtZSA9ICdFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGVuZG9yc2VtZW50Um93XG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIlB1YmxpY1N0YXRlbWVudFwiXG4gICAgICAgICAgICBuYW1lID0gJ1N0YXRlbWVudHMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHN0YXRlbWVudFJvd1xuXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gY2F0ZWdvcmllc1tyZXF1ZXN0LmZpZWxkcy5hc3NvY2lhdGlvbnMuaXNzdWVDYXRlZ29yeSAtIDFdLm5hbWVcblxuICAgICAgICAkKFwiXFwjI3tuYW1lfSB0cjpsYXN0LWNoaWxkXCIpLmJlZm9yZSh0ZW1wbGF0ZShkYXRhKSlcblxuXG4kKCcjZGF0YUNvbnRhaW5lcicpLnBvcG92ZXIoe1xuICAgIHBsYWNlbWVudDogJ2JvdHRvbSdcbiAgICBzZWxlY3RvcjogJy5yYW5rJ1xuICAgIGFuaW1hdGlvbjogdHJ1ZVxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBvcG92ZXItdGl0bGUtY3VzdG9tXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3M9XCJwb3BvdmVyLXRpdGxlXCI+PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3BvdmVyLWJ0blwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIvcmFua19vcmRlclwiPkFsbCByYW5rczwvYnV0dG9uPjwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2Pidcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpZl9lcScsIChhLCBiLCBvcHRzKSAtPlxuICAgIGlmKGEgPT0gYilcbiAgICAgICAgcmV0dXJuIG9wdHMuZm4gdGhpc1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG9wdHMuaW52ZXJzZSB0aGlzXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2NvbmNhdCcsIChwYXJhbTEsIHBhcmFtMikgLT5cbiAgICB0ZW1wID0gW3BhcmFtMSwgcGFyYW0yXVxuICAgIHJldHVybiB0ZW1wLmpvaW4oJycpXG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KTtcbiAgICBwb3BvdmVyQ29udGVudCA9ICRlbGVtZW50LnBhcmVudCgpLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKVxuICAgIGZpZWxkTmFtZSA9ICRlbGVtZW50LmF0dHIoJ2RhdGEtZmllbGQnKVxuICAgIHBvcG92ZXJUcGwgPSAkKCcjcmFua1BvcG92ZXInKS5odG1sKClcbiAgICBhZGRpdGlvbmFsUm93c1RwbCA9ICQoJyNhZGRpdGlvbmFsUm93cycpLmh0bWwoKVxuICAgIHByZWxvYWRlciA9IHBvcG92ZXJDb250ZW50LmZpbmQoJ2xvYWRlcicpXG5cbiAgICBwcmV2aW91c1Njcm9sbFRvcCA9IDA7XG4gICAgY3VycmVudFBhZ2UgPSAwO1xuICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICBwb3BvdmVyT3JkZXIgPSBudWxsO1xuXG4gICAgIyBDbG9zZSBhbGwgb3RoZXIgcG9wb3ZlcnNcbiAgICBpZiAhJGVsZW1lbnQuY2xvc2VzdCgnLnBvcG92ZXInKVswXVxuICAgICAgICAkKCcucmFuaycpLm5vdChlLnRhcmdldCkucG9wb3ZlcignZGVzdHJveScpXG5cbiAgICAjIG9yZGVyIFtkZXNjLCBhc2NdXG4gICAgbG9hZE5ld1Jvd3MgPSAob3JkZXIpIC0+XG4gICAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgICBwb3BvdmVyT3JkZXIgPSBvcmRlclxuICAgICAgICBwcmVsb2FkZXIuc2hvdygpXG4gICAgICAgIHRhYmxlID0gcG9wb3ZlckNvbnRlbnQuZmluZCgndGFibGUgdGJvZHknKVxuICAgICAgICB0YWJsZS5odG1sICcnXG4gICAgICAgIGN1cnJlbnRQYWdlID0gMDtcbiAgICAgICAgcHJldmlvdXNTY3JvbGxUb3AgPSAwXG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiAnL2FwaS9nb3Zlcm5tZW50Jyt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUrJy9nZXRfcmFua3MnXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGF0YTpcbiAgICAgICAgICAgICAgICBwYWdlOiBjdXJyZW50UGFnZVxuICAgICAgICAgICAgICAgIG9yZGVyOiBvcmRlclxuICAgICAgICAgICAgICAgIGZpZWxkX25hbWU6IGZpZWxkTmFtZUluQ2FtZWxDYXNlICMgVHJhbnNmb3JtIHRvIGNhbWVsQ2FzZVxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZShhZGRpdGlvbmFsUm93c1RwbClcbiAgICAgICAgICAgICAgICB0YWJsZS5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgICAgICBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcHJlbG9hZGVyLmhpZGUoKVxuXG4gICAgcG9wb3ZlckNvbnRlbnQub24gJ2NsaWNrJywgJ3RoJywgKGUpIC0+XG4gICAgICAgICRjb2x1bW4gPSBgJChlLnRhcmdldCkuaGFzQ2xhc3MoJ3NvcnRhYmxlJykgPyAkKGUudGFyZ2V0KSA6ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RoJyk7YFxuICAgICAgICBpZiAkY29sdW1uLmhhc0NsYXNzKCdzb3J0YWJsZScpXG4gICAgICAgICAgICBpZiAkY29sdW1uLmhhc0NsYXNzKCdkZXNjJylcbiAgICAgICAgICAgICAgICBsb2FkTmV3Um93cygnYXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdkZXNjJykuYWRkQ2xhc3MoJ2FzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX2JvdHRvbScpLmFkZENsYXNzKCdpY29uX190b3AnKVxuICAgICAgICAgICAgZWxzZSBpZiAkY29sdW1uLmhhc0NsYXNzKCdhc2MnKVxuICAgICAgICAgICAgICAgIGxvYWROZXdSb3dzKCdkZXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdhc2MnKS5hZGRDbGFzcygnZGVzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxvYWROZXdSb3dzKCdhc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uYWRkQ2xhc3MoJ2FzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX3RvcCcpXG5cbiAgICBpZiBmaWVsZE5hbWVcbiAgICAgICAgZmllbGROYW1lSW5DYW1lbENhc2UgPSBmaWVsZE5hbWUucmVwbGFjZSAvXyhbYS16MC05XSkvZywgKGcpIC0+IHJldHVybiBnWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2dvdmVybm1lbnQnK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSsnL2dldF9yYW5rcydcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgIGZpZWxkX25hbWU6IGZpZWxkTmFtZUluQ2FtZWxDYXNlICMgVHJhbnNmb3JtIHRvIGNhbWVsQ2FzZVxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZShwb3BvdmVyVHBsKVxuICAgICAgICAgICAgICAgIHBvcG92ZXJDb250ZW50Lmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKVxuXG4gICAgIyBMYXp5IGxvYWQgZm9yIHBvcG92ZXJcbiAgICBwb3BvdmVyQ29udGVudC5zY3JvbGwgKCkgLT5cbiAgICAgIGN1cnJlbnRTY3JvbGxUb3AgPSBwb3BvdmVyQ29udGVudC5zY3JvbGxUb3AoKVxuICAgICAgaWYgIHByZXZpb3VzU2Nyb2xsVG9wIDwgY3VycmVudFNjcm9sbFRvcCAmJiBjdXJyZW50U2Nyb2xsVG9wID4gMC41ICogcG9wb3ZlckNvbnRlbnRbMF0uc2Nyb2xsSGVpZ2h0XG4gICAgICAgIGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcbiAgICAgICAgcHJldmlvdXNTY3JvbGxUb3AgPSBjdXJyZW50U2Nyb2xsVG9wXG4gICAgICAgIGlmIGxvYWRpbmcgaXMgZmFsc2VcbiAgICAgICAgICBsb2FkaW5nID0gdHJ1ZVxuICAgICAgICAgIHByZWxvYWRlci5zaG93KCk7XG4gICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyAnL2dldF9yYW5rcydcbiAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgZGF0YTpcbiAgICAgICAgICAgICAgICAgIHBhZ2U6ICsrY3VycmVudFBhZ2VcbiAgICAgICAgICAgICAgICAgIG9yZGVyOiBwb3BvdmVyT3JkZXJcbiAgICAgICAgICAgICAgICAgIGZpZWxkX25hbWU6IGZpZWxkTmFtZUluQ2FtZWxDYXNlICMgVHJhbnNmb3JtIHRvIGNhbWVsQ2FzZVxuICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgIGxvYWRpbmcgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgcHJlbG9hZGVyLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZShhZGRpdGlvbmFsUm93c1RwbClcbiAgICAgICAgICAgICAgICAgIHBvcG92ZXJDb250ZW50LmZpbmQoJ3RhYmxlIHRib2R5JylbMF0uaW5uZXJIVE1MICs9IGNvbXBpbGVkVGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAnLmVsZWN0ZWRfbGluaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB1cmwgPSBlLmN1cnJlbnRUYXJnZXQucGF0aG5hbWVcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgICAgICAgICAgcGVyc29uID0gZGF0YS5wZXJzb25cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUmVxdWVzdHMgPSBkYXRhLmNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLmNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcblxuICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICAgIGZvciBjb250cmlidXRpb24gaW4gcGVyc29uLmNvbnRyaWJ1dGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50ID0gbnVtZXJhbChjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCkuZm9ybWF0KCcwLDAwMCcpXG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG1vbWVudChpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCwgJ1lZWVktTU0tREQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS5mb3JtYXQgJ0wnXG5cbiAgICAgICAgICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBjb21waWxlZFRlbXBsYXRlKHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGh0bWx9LCAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGh0bWxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuICAgICAgICAgICAgICAgICAgICBzaG93Q3JlYXRlUmVxdWVzdHMocGVyc29uLCBjcmVhdGVSZXF1ZXN0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuICAgICAgICAgICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuRElTUVVTV0lER0VUUy5nZXRDb3VudCgpXG5cbiAgICAgICAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG4jIFJvdXRlIC9cbmlmIHJvdXRlVHlwZSBpcyAwXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJy9sZWdhY3kvZGF0YS9oX3R5cGVzX2NhXzIuanNvbicsIDdcbiAgICBnb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgdXJsID0gJy8nICsgZGF0YS5hbHRUeXBlU2x1ZyArICcvJyArIGRhdGEuc2x1Z1xuICAgICAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgICBpZiAhdW5kZWZcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwgJCgnI3NlYXJjaC1jb250YWluZXItdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgIyBMb2FkIGludHJvZHVjdG9yeSB0ZXh0IGZyb20gdGV4dHMvaW50cm8tdGV4dC5odG1sIHRvICNpbnRyby10ZXh0IGNvbnRhaW5lci5cbiAgICAgICAgJC5nZXQgXCIvbGVnYWN5L3RleHRzL2ludHJvLXRleHQuaHRtbFwiLCAoZGF0YSkgLT4gJChcIiNpbnRyby10ZXh0XCIpLmh0bWwgZGF0YVxuICAgICAgICBnb3ZtYXAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4gICAgICAgIGdldF9jb3VudGllcyBHT1ZXSUtJLmRyYXdfcG9seWdvbnNcbiAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6ICQoJyNzZWFyY2hDb250YWluZXInKS5odG1sKCl9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4gICAgICAgIHVuZGVmID0gdHJ1ZVxuICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG4gICAgc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCgpXG5cbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiAgICB0ZW1wbGF0ZXMubG9hZF9mdXNpb25fdGVtcGxhdGUgXCJ0YWJzXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZnVzaW9udGFibGVzL3YyL3F1ZXJ5P3NxbD1TRUxFQ1QlMjAqJTIwRlJPTSUyMDF6Mm9YUUVZUTNwMk9vTUk4VjVnS2dIV0I1VHo5OTBCclExeGMxdFZvJmtleT1BSXphU3lDWERReU1EcEdBMmczUWp1djRDRHY3elJqLWl4NElRSkFcIlxuICAgICQoJyNnb3ZtYXAnKS5vbiAnY2xpY2snLCAnLmluZm8td2luZG93LXVyaScsIChlKSAtPlxuICAgICAgICB1cmkgPSBlLnRhcmdldC5wYXJlbnROb2RlLmRhdGFzZXQudXJpXG4gICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuXG4jIFJvdXRlIC9yYW5rX29yZGVyXG5pZiByb3V0ZVR5cGUgaXMgMVxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBDaXZpYyBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcblxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiL2FwaS9yYW5rX29yZGVyXCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoYWx0VHlwZXNEYXRhKSAtPlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBSZW5kZXIgcmFuayBvcmRlciB0ZW1wbGF0ZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHRwbCA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcmFuay1vcmRlci1wYWdlJykuaHRtbCgpKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRwbChhbHRUeXBlc0RhdGEpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhbHRUeXBlc0RhdGEpXG5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgUHVzaCB0ZW1wbGF0ZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogdHBsfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvcmFua19vcmRlcidcblxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDJcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkLmFqYXhcbiMgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nICdHT1Y6J1xuICAgICAgICAgICAgY29uc29sZS5sb2cgZ292c1xuXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgcnVuID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgcnVuXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IHJ1bn0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB3aW5kb3cucGF0aFxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDNcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGEucGVyc29uXG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0cyA9IGRhdGEuY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QgPSBbXVxuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgUHJlcGFyZSBvcHRpb25zIGZvciBzZWxlY3QgaW4gSXNzdWVzQ2F0ZWdvcnkgZWRpdC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgcGVyc29uLmNhdGVnb3J5X3NlbGVjdC5wdXNoIHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2F0ZWdvcnkuaWRcbiAgICAgICAgICAgICAgICB0ZXh0OiBjYXRlZ29yeS5uYW1lXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QgPSBKU09OLnN0cmluZ2lmeShwZXJzb24uY2F0ZWdvcnlfc2VsZWN0KTtcblxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBmb3IgY29udHJpYnV0aW9uIGluIHBlcnNvbi5jb250cmlidXRpb25zXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQgPSBudW1lcmFsKGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50KS5mb3JtYXQoJzAsMDAwJylcblxuICAgICAgICAgICAgY29uc29sZS5sb2cgcGVyc29uXG5cbiAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXG4gICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIHBlcnNvbi52b3RlcyAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICBwZXJzb24udm90ZXMuZm9yRWFjaCAoaXRlbSwgaXRlbUxpc3QpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQsICdZWVlZLU1NLUREJyk7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS5mb3JtYXQgJ0wnXG5cbiAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuXG4gICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG5cbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG5cbiAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgIGluaXRUYWJsZUhhbmRsZXJzKHBlcnNvbik7XG4gICAgICAgICAgICBzaG93Q3JlYXRlUmVxdWVzdHMocGVyc29uLCBjcmVhdGVSZXF1ZXN0cyk7XG5cbiAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXG4gICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xuICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG5cbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICB3aW5kb3cuRElTUVVTV0lER0VUUy5nZXRDb3VudCgpXG5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG4gICAgIyMjXG4gICAgICBHZXQgY3VycmVudCB1c2VyLlxuICAgICMjI1xuICAgICR1c2VyQnRuID0gJCgnI3VzZXInKVxuICAgICR1c2VyQnRuTGluayA9ICR1c2VyQnRuLmZpbmQoJ2EnKTtcbiAgICAkLmFqYXggJy9hcGkvdXNlcicsIHtcbiAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgIHVzZXIudXNlcm5hbWUgPSByZXNwb25zZS51c2VybmFtZTtcbiAgICAgICAgICAgICAgYXV0aG9yaXplZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgJHVzZXJUZXh0ID0gJCgnI3VzZXItdGV4dCcpLmZpbmQoJ2EnKTtcbiAgICAgICAgICAgICAgJHVzZXJUZXh0Lmh0bWwoXCJMb2dnZWQgaW4gYXMgI3t1c2VyLnVzZXJuYW1lfVwiICsgJHVzZXJUZXh0Lmh0bWwoKSlcbiAgICAgICAgICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJTaWduIE91dFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvbG9nb3V0J1xuXG4gICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIGF1dGhvcml6ZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAkdXNlckJ0bkxpbmsuaHRtbChcIkxvZ2luIC8gU2lnbiBVcFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgIH0iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIFxuICAgICAgICBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgICAjaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQuZ292X25hbWUsIHdvcmRzLCByZWdzKVxuICAgICNkLnN0YXRlPXN0cm9uZ2lmeShkLnN0YXRlLCB3b3JkcywgcmVncylcbiAgICAjZC5nb3ZfdHlwZT1zdHJvbmdpZnkoZC5nb3ZfdHlwZSwgd29yZHMsIHJlZ3MpXG4gIFxuICByZXR1cm4gY2xvbmVzXG5cblxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXG5zdHJvbmdpZnkgPSAocywgd29yZHMsIHJlZ3MpIC0+XG4gIHJlZ3MuZm9yRWFjaCAocixpKSAtPlxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxuICByZXR1cm4gc1xuXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXG5zdHJpcCA9IChzKSAtPlxuICBzLnJlcGxhY2UoLzxbXjw+XSo+L2csJycpXG5cblxuIyBhbGwgdGlybXMgc3BhY2VzIGZyb20gYm90aCBzaWRlcyBhbmQgbWFrZSBjb250cmFjdHMgc2VxdWVuY2VzIG9mIHNwYWNlcyB0byAxXG5mdWxsX3RyaW0gPSAocykgLT5cbiAgc3M9cy50cmltKCcnK3MpXG4gIHNzPXNzLnJlcGxhY2UoLyArL2csJyAnKVxuXG4jIHJldHVybnMgYW4gYXJyYXkgb2Ygd29yZHMgaW4gYSBzdHJpbmdcbmdldF93b3JkcyA9IChzdHIpIC0+XG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcblxuXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XG4gIHdvcmRzID0gZ2V0X3dvcmRzIHN0clxuICByZWdzID0gd29yZHMubWFwICh3KS0+IG5ldyBSZWdFeHAoXCIje3d9XCIsJ2knKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVNcbmZpZWxkTmFtZXMgPSB7fVxuZmllbGROYW1lc0hlbHAgPSB7fVxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9IChuLG1hc2ssZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG5vdCBkYXRhW25dXG4gICAgcmV0dXJuICcnXG5cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgaWYgJycgIT0gbWFza1xuICAgICAgaWYgZGF0YVtuKydfcmFuayddIGFuZCBkYXRhLm1heF9yYW5rcyBhbmQgZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ11cbiAgICAgICAgdiA9IG51bWVyYWwodikuZm9ybWF0KG1hc2spXG4gICAgICAgICMgVHJhbnNmb3JtIGZyb20gdW5kZXJzY29yZSAoc29tZV9maWVsZE5hbWUpIHRvIHJlYWRhYmxlIGZvcm1hdFxuICAgICAgICB0aXRsZSA9IG4udG9TdHJpbmcoKVxuICAgICAgICB0aXRsZSA9IHRpdGxlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGl0bGUuc2xpY2UoMSlcbiAgICAgICAgdGl0bGUgPSB0aXRsZS5yZXBsYWNlIC9fKFthLXpdKS9nLCAoZykgLT4gcmV0dXJuICcgJyArIGdbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICByZXR1cm4gXCIje3Z9IDxhIGNsYXNzPSdyYW5rJ1xuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZmllbGQ9JyN7bn1fcmFuaydcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT0nI3t0aXRsZX0gcmFua3MnPlxuICAgICAgICAgICAgICAgICAgICAgICgje2RhdGFbbisnX3JhbmsnXX0gb2YgI3tkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXX0pPC9hPlwiXG4gICAgICBpZiBuID09IFwibnVtYmVyX29mX2Z1bGxfdGltZV9lbXBsb3llZXNcIlxuICAgICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQoJzAsMCcpXG4gICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICBlbHNlXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZFxuICAgICAgbiA9PSBcIm9wZW5fZW5yb2xsbWVudF9zY2hvb2xzXCJcbiAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZFxuICAgICAgbiA9PSBcInBhcmVudF90cmlnZ2VyX2VsaWdpYmxlX3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgdi5sZW5ndGggPiAyMVxuICAgICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAyMSlcbiAgICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdlxuXG5cbnJlbmRlcl9maWVsZF9uYW1lX2hlbHAgPSAoZk5hbWUpIC0+XG4gICNpZiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cbiAgICByZXR1cm4gZmllbGROYW1lc0hlbHBbZk5hbWVdXG5cbnJlbmRlcl9maWVsZF9uYW1lID0gKGZOYW1lKSAtPlxuICBpZiBmaWVsZE5hbWVzW2ZOYW1lXT9cbiAgICByZXR1cm4gZmllbGROYW1lc1tmTmFtZV1cblxuICBzID0gZk5hbWUucmVwbGFjZSgvXy9nLFwiIFwiKVxuICBzID0gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpXG4gIHJldHVybiBzXG5cblxucmVuZGVyX2ZpZWxkID0gKGZOYW1lLGRhdGEpLT5cbiAgaWYgXCJfXCIgPT0gc3Vic3RyIGZOYW1lLCAwLCAxXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyA+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+Jm5ic3A7PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBlbHNlXG4gICAgcmV0dXJuICcnIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICAgIFwiXCJcIlxuICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTxkaXY+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxucmVuZGVyX3N1YmhlYWRpbmcgPSAoZk5hbWUsIG1hc2ssIG5vdEZpcnN0KS0+XG4gIHMgPSAnJ1xuICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZOYW1lXG4gIGlmIG1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICBpZiBub3RGaXJzdCAhPSAwXG4gICAgICBzICs9IFwiPGJyLz5cIlxuICAgIHMgKz0gXCI8ZGl2PjxzcGFuIGNsYXNzPSdmLW5hbSc+I3tmTmFtZX08L3NwYW4+PHNwYW4gY2xhc3M9J2YtdmFsJz4gPC9zcGFuPjwvZGl2PlwiXG4gIHJldHVybiBzXG5cbnJlbmRlcl9maWVsZHMgPSAoZmllbGRzLGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIGZvciBmaWVsZCxpIGluIGZpZWxkc1xuICAgIGlmICh0eXBlb2YgZmllbGQgaXMgXCJvYmplY3RcIilcbiAgICAgIGlmIGZpZWxkLm1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICAgICAgaCArPSByZW5kZXJfc3ViaGVhZGluZyhmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBpKVxuICAgICAgICBmVmFsdWUgPSAnJ1xuICAgICAgZWxzZVxuICAgICAgICBmVmFsdWUgPSByZW5kZXJfZmllbGRfdmFsdWUgZmllbGQubmFtZSwgZmllbGQubWFzaywgZGF0YVxuICAgICAgICBpZiAoJycgIT0gZlZhbHVlIGFuZCBmVmFsdWUgIT0gJzAnKVxuICAgICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGQubmFtZVxuICAgICAgICAgIGZOYW1lSGVscCA9IHJlbmRlcl9maWVsZF9uYW1lX2hlbHAgZmllbGQubmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZlZhbHVlID0gJydcblxuICAgIGVsc2VcbiAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZCwgJycsIGRhdGFcbiAgICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGRcbiAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmTmFtZVxuICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZOYW1lLCB2YWx1ZTogZlZhbHVlLCBoZWxwOiBmTmFtZUhlbHApXG4gIHJldHVybiBoXG5cbnJlbmRlcl9maW5hbmNpYWxfZmllbGRzID0gKGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIG1hc2sgPSAnMCwwJ1xuICBjYXRlZ29yeSA9ICcnXG4gIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gIGZvciBmaWVsZCBpbiBkYXRhXG4gICAgaWYgY2F0ZWdvcnkgIT0gZmllbGQuY2F0ZWdvcnlfbmFtZVxuICAgICAgY2F0ZWdvcnkgPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBpZiBjYXRlZ29yeSA9PSAnT3ZlcnZpZXcnXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICBlbHNlIGlmIGNhdGVnb3J5ID09ICdSZXZlbnVlcydcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gXCI8Yj5cIiArIHRlbXBsYXRlKG5hbWU6IGNhdGVnb3J5LCBnZW5mdW5kOiBcIkdlbmVyYWwgRnVuZFwiLCBvdGhlcmZ1bmRzOiBcIk90aGVyIEZ1bmRzXCIsIHRvdGFsZnVuZHM6IFwiVG90YWwgR292LiBGdW5kc1wiKSArIFwiPC9iPlwiXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcblxuICAgIGlmIGZpZWxkLmNhcHRpb24gPT0gJ0dlbmVyYWwgRnVuZCBCYWxhbmNlJyBvciBmaWVsZC5jYXB0aW9uID09ICdMb25nIFRlcm0gRGVidCdcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JykpXG4gICAgZWxzZSBpZiBmaWVsZC5jYXB0aW9uIGluIFsnVG90YWwgUmV2ZW51ZXMnLCAnVG90YWwgRXhwZW5kaXR1cmVzJywgJ1N1cnBsdXMgLyAoRGVmaWNpdCknXSBvciBpc19maXJzdF9yb3dcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIG90aGVyZnVuZHM6IGN1cnJlbmN5KGZpZWxkLm90aGVyZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpLCB0b3RhbGZ1bmRzOiBjdXJyZW5jeShmaWVsZC50b3RhbGZ1bmRzLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICAgIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzayksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2spKVxuICByZXR1cm4gaFxuXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoL1tcXHNcXCtcXC1dL2csICdfJylcblxudG9UaXRsZUNhc2UgPSAoc3RyKSAtPlxuICBzdHIucmVwbGFjZSAvXFx3XFxTKi9nLCAodHh0KSAtPlxuICAgIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKVxuXG5jdXJyZW5jeSA9IChuLCBtYXNrLCBzaWduID0gJycpIC0+XG4gICAgbiA9IG51bWVyYWwobilcbiAgICBpZiBuIDwgMFxuICAgICAgICBzID0gbi5mb3JtYXQobWFzaykudG9TdHJpbmcoKVxuICAgICAgICBzID0gcy5yZXBsYWNlKC8tL2csICcnKVxuICAgICAgICByZXR1cm4gXCIoI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrcysnPC9zcGFuPid9KVwiXG5cbiAgICBuID0gbi5mb3JtYXQobWFzaylcbiAgICByZXR1cm4gXCIje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytuKyc8L3NwYW4+J31cIlxuXG5yZW5kZXJfdGFicyA9IChpbml0aWFsX2xheW91dCwgZGF0YSwgdGFic2V0LCBwYXJlbnQpIC0+XG4gICNsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICBsYXlvdXQgPSBpbml0aWFsX2xheW91dFxuICB0ZW1wbGF0ZXMgPSBwYXJlbnQudGVtcGxhdGVzXG4gIHBsb3RfaGFuZGxlcyA9IHt9XG5cbiAgbGF5b3V0X2RhdGEgPVxuICAgIHRpdGxlOiBkYXRhLm5hbWVcbiAgICB3aWtpcGVkaWFfcGFnZV9leGlzdHM6IGRhdGEud2lraXBlZGlhX3BhZ2VfZXhpc3RzXG4gICAgd2lraXBlZGlhX3BhZ2VfbmFtZTogIGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgIHRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lOiBkYXRhLnRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lXG4gICAgbGF0ZXN0X2F1ZGl0X3VybDogZGF0YS5sYXRlc3RfYXVkaXRfdXJsXG4gICAgdGFiczogW11cbiAgICB0YWJjb250ZW50OiAnJ1xuXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBsYXlvdXRfZGF0YS50YWJzLnB1c2hcbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGRldGFpbF9kYXRhID1cbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG4gICAgICB0YWJjb250ZW50OiAnJ1xuICAgIHN3aXRjaCB0YWIubmFtZVxuICAgICAgd2hlbiAnT3ZlcnZpZXcgKyBFbGVjdGVkIE9mZmljaWFscydcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGNvbnNvbGUubG9nIGRhdGFcbiAgICAgICAgZm9yIG9mZmljaWFsLGkgaW4gZGF0YS5lbGVjdGVkX29mZmljaWFsc1xuICAgICAgICAgIG9mZmljaWFsX2RhdGEgPVxuICAgICAgICAgICAgdGl0bGU6IGlmICcnICE9IG9mZmljaWFsLnRpdGxlIHRoZW4gXCJUaXRsZTogXCIgKyBvZmZpY2lhbC50aXRsZVxuICAgICAgICAgICAgbmFtZTogaWYgJycgIT0gb2ZmaWNpYWwuZnVsbF9uYW1lIHRoZW4gXCJOYW1lOiBcIiArIG9mZmljaWFsLmZ1bGxfbmFtZVxuICAgICAgICAgICAgZW1haWw6IGlmIG9mZmljaWFsLmVtYWlsX2FkZHJlc3MgdGhlbiBcIkVtYWlsOiBcIiArIG9mZmljaWFsLmVtYWlsX2FkZHJlc3NcbiAgICAgICAgICAgIHRlbGVwaG9uZW51bWJlcjogaWYgbnVsbCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIGFuZCB1bmRlZmluZWQgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciB0aGVuIFwiVGVsZXBob25lIE51bWJlcjogXCIgKyBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyXG4gICAgICAgICAgICB0ZXJtZXhwaXJlczogaWYgb2ZmaWNpYWwudGVybV9leHBpcmVzIHRoZW4gXCJUZXJtIEV4cGlyZXM6IFwiICsgb2ZmaWNpYWwudGVybV9leHBpcmVzIGVsc2UgXCJUZXJtIEV4cGlyZXM6IFwiXG4gICAgICAgICAgICBhbHRUeXBlU2x1ZzogZGF0YS5hbHRfdHlwZV9zbHVnXG4gICAgICAgICAgICBuYW1lU2x1ZzogZGF0YS5zbHVnXG4gICAgICAgICAgICBzbHVnOiBvZmZpY2lhbC5zbHVnXG5cbiAgICAgICAgICBpZiAnJyAhPSBvZmZpY2lhbC5waG90b191cmwgYW5kIG9mZmljaWFsLnBob3RvX3VybCAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJzxpbWcgc3JjPVwiJytvZmZpY2lhbC5waG90b191cmwrJ1wiIGNsYXNzPVwicG9ydHJhaXRcIiBhbHQ9XCJcIiAvPidcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvZmZpY2lhbF9kYXRhLmltYWdlID0gICcnXG5cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJ10ob2ZmaWNpYWxfZGF0YSlcbiAgICAgIHdoZW4gJ0VtcGxveWVlIENvbXBlbnNhdGlvbidcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3NhbGFyeV9wZXJfZnVsbF90aW1lX2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDM0MFxuICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSA0NzBcblxuICAgICAgICAgIGlmICQod2luZG93KS53aWR0aCgpIDwgNDkwXG4gICAgICAgICAgICBzbWFsbENoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBDb21wZW5zYXRpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdCZW5zLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJ1xcbiBFbXBsb3llZXMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ0FsbCBcXG4nICsgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJyBcXG4gUmVzaWRlbnRzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAyKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIENvbXBlbnNhdGlvbiAtIEZ1bGwgVGltZSBXb3JrZXJzOiBcXG4gR292ZXJubWVudCB2cy4gUHJpdmF0ZSBTZWN0b3InXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tY29tcC1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ10gPSdtZWRpYW4tY29tcC1ncmFwaCdcblxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgISBkYXRhLmhhc093blByb3BlcnR5KCdtZWRpYW5fcGVuc2lvbl8zMF95ZWFyX3JldGlyZWUnKSB8fCAoIGRhdGFbJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZSddID09IDApXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gUGVuc2lvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQZW5zaW9uIGZvciBcXG4gUmV0aXJlZSB3LyAzMCBZZWFycydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9wZW5zaW9uMzBfeWVhcl9yZXRpcmVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBQZW5zaW9uJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdiYXInOiB7XG4gICAgICAgICAgICAgICAgICdncm91cFdpZHRoJzogJzMwJSdcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddID0nbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgSGVhbHRoJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICNwdWJsaWMgc2FmZXR5IHBpZVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1B1YmxpYyBTYWZldHkgRXhwZW5zZSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQdWJsaWMgU2FmZXR5IEV4cCdcbiAgICAgICAgICAgICAgICAgIDEgLSBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ090aGVyJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1B1YmxpYyBzYWZldHkgZXhwZW5zZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdzbGljZXMnOiB7IDE6IHtvZmZzZXQ6IDAuMn19XG4gICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA0NVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddID0ncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICNmaW4taGVhbHRoLXJldmVudWUgZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAjY29uc29sZS5sb2cgJyMjI2FsJytKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnUmV2LidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIFJldmVudWUgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBSZXZlbnVlIFBlciBcXG4gQ2FwaXRhIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWUnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgICAgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgI2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0V4cC4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSBcXG4gRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICBoID0gJydcbiAgICAgICAgICAjaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgICAgaCArPSByZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnXVxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAgICN0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGVcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJSZXZlbnVlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgUmV2ZW51ZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXSA9J3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiRXhwZW5kaXR1cmVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBFeHBlbmRpdHVyZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddID0ndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgIGVsc2VcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG5cbiAgICBsYXlvdXRfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLXRlbXBsYXRlJ10oZGV0YWlsX2RhdGEpXG4gIHJldHVybiB0ZW1wbGF0ZXNbJ3RhYnBhbmVsLXRlbXBsYXRlJ10obGF5b3V0X2RhdGEpXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXG5cblxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxuICAjY2xvbmUgdGhlIGxheW91dFxuICBsID0gJC5leHRlbmQgdHJ1ZSwgW10sIGxheW91dFxuICB0ID1cbiAgICBuYW1lOiBcIk90aGVyXCJcbiAgICBmaWVsZHM6IGdldF91bm1lbnRpb25lZF9maWVsZHMgbCwgZGF0YVxuXG4gIGwucHVzaCB0XG4gIHJldHVybiBsXG5cblxuIyBjb252ZXJ0cyB0YWIgdGVtcGxhdGUgZGVzY3JpYmVkIGluIGdvb2dsZSBmdXNpb24gdGFibGUgdG9cbiMgdGFiIHRlbXBsYXRlXG5jb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZT0odGVtcGwpIC0+XG4gIHRhYl9oYXNoPXt9XG4gIHRhYnM9W11cbiAgIyByZXR1cm5zIGhhc2ggb2YgZmllbGQgbmFtZXMgYW5kIHRoZWlyIHBvc2l0aW9ucyBpbiBhcnJheSBvZiBmaWVsZCBuYW1lc1xuICBnZXRfY29sX2hhc2ggPSAoY29sdW1ucykgLT5cbiAgICBjb2xfaGFzaCA9e31cbiAgICBjb2xfaGFzaFtjb2xfbmFtZV09aSBmb3IgY29sX25hbWUsaSBpbiB0ZW1wbC5jb2x1bW5zXG4gICAgcmV0dXJuIGNvbF9oYXNoXG5cbiAgIyByZXR1cm5zIGZpZWxkIHZhbHVlIGJ5IGl0cyBuYW1lLCBhcnJheSBvZiBmaWVsZHMsIGFuZCBoYXNoIG9mIGZpZWxkc1xuICB2YWwgPSAoZmllbGRfbmFtZSwgZmllbGRzLCBjb2xfaGFzaCkgLT5cbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXG5cbiAgIyBjb252ZXJ0cyBoYXNoIHRvIGFuIGFycmF5IHRlbXBsYXRlXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxuICAgIGEgPSBbXVxuICAgIGZvciBrIG9mIGhhc2hcbiAgICAgIHRhYiA9IHt9XG4gICAgICB0YWIubmFtZT1rXG4gICAgICB0YWIuZmllbGRzPWhhc2hba11cbiAgICAgIGEucHVzaCB0YWJcbiAgICByZXR1cm4gYVxuXG5cbiAgY29sX2hhc2ggPSBnZXRfY29sX2hhc2godGVtcGwuY29sX2hhc2gpXG4gIHBsYWNlaG9sZGVyX2NvdW50ID0gMFxuXG4gIGZvciByb3csaSBpbiB0ZW1wbC5yb3dzXG4gICAgY2F0ZWdvcnkgPSB2YWwgJ2dlbmVyYWxfY2F0ZWdvcnknLCByb3csIGNvbF9oYXNoXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgZmllbGRuYW1lID0gdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaFxuICAgIGlmIG5vdCBmaWVsZG5hbWUgdGhlbiBmaWVsZG5hbWUgPSBcIl9cIiArIFN0cmluZyArK3BsYWNlaG9sZGVyX2NvdW50XG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxuICAgIGZpZWxkTmFtZXNIZWxwW2ZpZWxkbmFtZV0gPSB2YWwgJ2hlbHBfdGV4dCcsIHJvdywgY29sX2hhc2hcbiAgICBpZiBjYXRlZ29yeVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldLnB1c2ggbjogdmFsKCduJywgcm93LCBjb2xfaGFzaCksIG5hbWU6IGZpZWxkbmFtZSwgbWFzazogdmFsKCdtYXNrJywgcm93LCBjb2xfaGFzaClcblxuICBjYXRlZ29yaWVzID0gT2JqZWN0LmtleXModGFiX2hhc2gpXG4gIGNhdGVnb3JpZXNfc29ydCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgaWYgbm90IGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV1cbiAgICAgIGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeV1bMF0ublxuICAgIGZpZWxkcyA9IFtdXG4gICAgZm9yIG9iaiBpbiB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICAgIGZpZWxkcy5wdXNoIG9ialxuICAgIGZpZWxkcy5zb3J0IChhLGIpIC0+XG4gICAgICByZXR1cm4gYS5uIC0gYi5uXG4gICAgdGFiX2hhc2hbY2F0ZWdvcnldID0gZmllbGRzXG5cbiAgY2F0ZWdvcmllc19hcnJheSA9IFtdXG4gIGZvciBjYXRlZ29yeSwgbiBvZiBjYXRlZ29yaWVzX3NvcnRcbiAgICBjYXRlZ29yaWVzX2FycmF5LnB1c2ggY2F0ZWdvcnk6IGNhdGVnb3J5LCBuOiBuXG4gIGNhdGVnb3JpZXNfYXJyYXkuc29ydCAoYSxiKSAtPlxuICAgIHJldHVybiBhLm4gLSBiLm5cblxuICB0YWJfbmV3aGFzaCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzX2FycmF5XG4gICAgdGFiX25ld2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldXG5cbiAgdGFicyA9IGhhc2hfdG9fYXJyYXkodGFiX25ld2hhc2gpXG4gIHJldHVybiB0YWJzXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG4gIEB0ZW1wbGF0ZXMgPSB1bmRlZmluZWRcbiAgQGRhdGEgPSB1bmRlZmluZWRcbiAgQGV2ZW50cyA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOigpIC0+XG4gICAgQGxpc3QgPSBbXVxuICAgIEBldmVudHMgPSB7fVxuICAgIHRlbXBsYXRlTGlzdCA9IFsndGFicGFuZWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJywgJ3BlcnNvbi1pbmZvLXRlbXBsYXRlJ11cbiAgICB0ZW1wbGF0ZVBhcnRpYWxzID0gWyd0YWItdGVtcGxhdGUnXVxuICAgIEB0ZW1wbGF0ZXMgPSB7fVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlTGlzdFxuICAgICAgQHRlbXBsYXRlc1t0ZW1wbGF0ZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlUGFydGlhbHNcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHRlbXBsYXRlLCAkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIHBhcmVudDp0aGlzXG4gICAgICBuYW1lOmxheW91dF9uYW1lXG4gICAgICByZW5kZXI6KGRhdCkgLT5cbiAgICAgICAgQHBhcmVudC5kYXRhID0gZGF0XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQsIHRoaXMsIEBwYXJlbnQpXG4gICAgICBiaW5kOiAodHBsX25hbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBpZiBub3QgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdID0gW2NhbGxiYWNrXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgIGFjdGl2YXRlOiAodHBsX25hbWUpIC0+XG4gICAgICAgIGlmIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIGZvciBlLGkgaW4gQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgICBlIHRwbF9uYW1lLCBAcGFyZW50LmRhdGFcblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcblxuICBsb2FkX2Z1c2lvbl90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICB0ID0gY29udmVydF9mdXNpb25fdGVtcGxhdGUgdGVtcGxhdGVfanNvblxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHQpXG5cblxuICBnZXRfbmFtZXM6IC0+XG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcblxuICBnZXRfaW5kZXhfYnlfbmFtZTogKG5hbWUpIC0+XG4gICAgZm9yIHQsaSBpbiBAbGlzdFxuICAgICAgaWYgdC5uYW1lIGlzIG5hbWUgdGhlbiBpXG4gICAgcmV0dXJuIC0xXG5cbiAgZ2V0X2h0bWw6IChpbmQsIGRhdGEpIC0+XG4gICAgaWYgKGluZCBpcyAtMSkgdGhlbiByZXR1cm4gIFwiXCJcblxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cbiAgYWN0aXZhdGU6IChpbmQsIHRwbF9uYW1lKSAtPlxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIEBsaXN0W2luZF0uYWN0aXZhdGUgdHBsX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZXMyXG4iLCIkIC0+XG4gICMkKCcjZ2V0V2lraXBlZGlhQXJ0aWNsZUJ1dHRvbicpLm9uICdjbGljaycsIC0+XG4gICMgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICNhbGVydGFsZXJ0IFwiaGlcIlxuICAjYWxlcnQgJChcIiN3aWtpcGVkaWFQYWdlTmFtZVwiKS50ZXh0KClcbiAgI2dldF93aWtpcGVkaWFfYXJ0aWNsZSgpXG4gIHdpbmRvdy5nZXRfd2lraXBlZGlhX2FydGljbGUgPSBnZXRfd2lraXBlZGlhX2FydGljbGVcbiAgd2luZG93LmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZSA9IGNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZVxuXG5nZXRfd2lraXBlZGlhX2FydGljbGU9KHMpLT5cbiAgYXJ0aWNsZV9uYW1lID0gcy5yZXBsYWNlIC8uKlxcLyhbXi9dKikkLywgXCIkMVwiXG4gICQuZ2V0SlNPTiBcImh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249cGFyc2UmcGFnZT0je2FydGljbGVfbmFtZX0mcHJvcD10ZXh0JmZvcm1hdD1qc29uJmNhbGxiYWNrPT9cIiwgKGpzb24pIC0+IFxuICAgICQoJyN3aWtpcGVkaWFUaXRsZScpLmh0bWwganNvbi5wYXJzZS50aXRsZVxuICAgICQoJyN3aWtpcGVkaWFBcnRpY2xlJykuaHRtbCBqc29uLnBhcnNlLnRleHRbXCIqXCJdXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhOm5vdCgucmVmZXJlbmNlcyBhKVwiKS5hdHRyIFwiaHJlZlwiLCAtPiAgXCJodHRwOi8vd3d3Lndpa2lwZWRpYS5vcmdcIiArICQodGhpcykuYXR0cihcImhyZWZcIilcbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImFcIikuYXR0ciBcInRhcmdldFwiLCBcIl9ibGFua1wiXG4gIFxuY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlPSAtPlxuICBhbGVydCBcIk5vdCBpbXBsZW1lbnRlZFwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2V0X3dpa2lwZWRpYV9hcnRpY2xlOmdldF93aWtpcGVkaWFfYXJ0aWNsZVxuIl19

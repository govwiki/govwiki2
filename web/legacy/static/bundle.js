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
  var data, date;
  rebuild_filter();
  data = window.localStorage.getItem('points');
  date = new Date();
  if (data && ((Number(window.localStorage.getItem('points_last_update')) + pointsCacheLifetime) >= date.getTime())) {
    console.log('From cache');
    GOVWIKI.markers = JSON.parse(data);
    $(document).trigger('markersLoaded');
    rerender_markers();
  } else {
    get_records2(GOVWIKI.gov_type_filter_2, function(data) {
      console.log('From server');
      window.localStorage.setItem('points', JSON.stringify(data));
      date = new Date();
      window.localStorage.setItem('points_last_update', date.getTime());
      GOVWIKI.markers = data;
      $(document).trigger('markersLoaded');
      return rerender_markers();
    });
  }
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
    $(document).on('markersLoaded', (function(_this) {
      return function() {
        console.log('Markers loaded');
        console.log(GOVWIKI.markers);
        return _this.startSuggestion(GOVWIKI.markers);
      };
    })(this));
  }

  GovSelector.prototype.suggestionTemplate = Handlebars.compile("<div class=\"sugg-box\">\n  <div class=\"sugg-state\">{{{state}}}</div>\n  <div class=\"sugg-name\">{{{name}}}</div>\n  <div class=\"sugg-type\">{{{type}}}</div>\n</div>");

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
      if (GOVWIKI.gov_type_filter && d.type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      count++;
    }
    return count;
  };

  GovSelector.prototype.startSuggestion = function(govs) {
    this.govs_array = govs;
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
      highlight: true,
      minLength: 1,
      classNames: {
        menu: 'tt-dropdown-menu'
      }
    }, {
      name: 'name',
      displayKey: 'name',
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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, altTypesData, build_select_element, build_selector, categories, draw_polygons, focus_search_field, get_counties, get_elected_officials, get_financial_statements, get_max_ranks, get_record2, gov_selector, govmap, initTableHandlers, orderedFields, refresh_disqus, renderPagination, renderTemplate, route, routeType, setEvents, showCreateRequests, sortTable, start_adjusting_typeahead_width, templates, undef, wikipedia;

GovSelector = require('./govselector.coffee');

Templates2 = require('./templates2.coffee');

wikipedia = require('./wikipedia.coffee');

govmap = null;

gov_selector = null;

templates = new Templates2;

active_tab = "";

undef = null;

categories = Object.create(null, {});

Handlebars.registerPartial('table-city', $('#table-city').html());

Handlebars.registerPartial('table-county', $('#table-county').html());

Handlebars.registerPartial('table-school-district', $('#table-school-district').html());

Handlebars.registerPartial('table-special-district', $('#table-special-district').html());

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

initTableHandlers = function(person, categories, electedOfficials) {
  var dataId, field, type;
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
    var compiledTemplate, currentEntity, insertCategories, tabPane, tableType;
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
    insertCategories = function(select) {
      var endObj, key, option, results;
      endObj = {};
      categories.forEach(function(item) {
        return endObj[item.id] = item.name;
      });
      select.setAttribute('name', 'issueCategory');
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
    if (tabPane.hasClass('loaded')) {
      return false;
    }
    tabPane[0].classList.add('loaded');
    if (currentEntity === 'Endorsement') {

    } else if (currentEntity === 'Contribution') {

    } else if (currentEntity === 'Legislation') {
      insertCategories($('#addVotes select')[0]);
      $('#addVotes').find('[data-provide="datepicker"]').on('changeDate', function() {
        return $(this).datepicker('hide');
      });
      compiledTemplate = Handlebars.compile($('#legislation-vote').html());
      return $('#electedVotes').html(compiledTemplate(electedOfficials));
    } else if (currentEntity === 'PublicStatement') {
      insertCategories($('#addStatements select')[0]);
      return $('#addStatements').find('[data-provide="datepicker"]').on('changeDate', function() {
        return $(this).datepicker('hide');
      });
    }
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
    } else {
      associations["government"] = person.government.id;
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
    console.log(person);
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
   */
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
  template: '<div class="popover" role="tooltip"> <div class="arrow"></div> <div class="popover-title-custom"> <h3 class="popover-title"></h3> </div> <div class="popover-content"></div> </div>'
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
  var $element, additionalRowsTpl, currentPage, fieldName, fieldNameInCamelCase, formatData, loadNewRows, loading, mask, popoverContent, popoverNameOrder, popoverOrder, popoverTpl, preloader, previousScrollTop;
  $element = $(e.target);
  popoverContent = $element.parent().find('.popover-content');
  fieldName = $element.attr('data-field');
  mask = $element.attr('data-mask');
  popoverTpl = $('#rankPopover').html();
  additionalRowsTpl = $('#additionalRows').html();
  preloader = popoverContent.find('loader');
  previousScrollTop = 0;
  currentPage = 0;
  loading = false;
  popoverOrder = null;
  popoverNameOrder = null;
  if (!$element.closest('.popover')[0]) {
    $('.rank').not(e.target).popover('destroy');
  }
  formatData = function(data) {
    if (mask) {
      return data.data.forEach(function(rank) {
        return rank.amount = numeral(rank.amount).format(mask);
      });
    }
  };
  loadNewRows = function() {
    var fieldNameInCamelCase, table;
    loading = true;
    preloader.show();
    table = popoverContent.find('table tbody');
    table.html('');
    currentPage = 0;
    previousScrollTop = 0;
    fieldNameInCamelCase = fieldName.replace(/_([a-z0-9])/g, function(g) {
      return g[1].toUpperCase();
    });
    return $.ajax({
      url: '/api/government' + window.location.pathname + '/get_ranks',
      dataType: 'json',
      data: {
        page: currentPage,
        order: popoverOrder,
        name_order: popoverNameOrder,
        field_name: fieldNameInCamelCase
      },
      success: function(data) {
        var compiledTemplate;
        formatData(data);
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
        if ($column.attr('data-sort-type') === 'name_order') {
          popoverNameOrder = '';
        } else {
          popoverOrder = '';
        }
        loadNewRows();
        $column.removeClass('desc').removeClass('asc');
        return $column.find('i').removeClass('icon__bottom').removeClass('icon__top');
      } else if ($column.hasClass('asc')) {
        if ($column.attr('data-sort-type') === 'name_order') {
          popoverNameOrder = 'desc';
        } else {
          popoverOrder = 'desc';
        }
        loadNewRows();
        $column.removeClass('asc').addClass('desc');
        return $column.find('i').removeClass('icon__top').addClass('icon__bottom');
      } else {
        if ($column.attr('data-sort-type') === 'name_order') {
          popoverNameOrder = 'asc';
        } else {
          popoverOrder = 'asc';
        }
        loadNewRows();
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
        formatData(data);
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
            name_order: popoverNameOrder,
            field_name: fieldNameInCamelCase
          },
          success: function(data) {
            var compiledTemplate;
            formatData(data);
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
          person.gov_alt_name = person.government.slug.replace(/_/g, ' ');

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
          initTableHandlers(person, categories, data.electedOfficials);
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
  orderedFields = [];
  $(document).on('click', '.rank_sort', function(e) {
    var column, fieldName, icon, tabPanel;
    $('#details').hide();
    $('#dataContainer').show();
    $('.loader').show();
    $('#wikipediaContainer').hide();
    $('#stantonIcon').hide();
    column = $(e.currentTarget);
    tabPanel = column.closest('.tab-pane');
    fieldName = column.attr('data-sort-type');
    icon = column.find('i');
    if (icon.hasClass('icon__top')) {
      icon.addClass('icon__bottom').removeClass('icon__top');
      orderedFields[fieldName] = 'desc';
    } else if (icon.hasClass('icon__bottom')) {
      icon.removeClass('icon__bottom');
      delete orderedFields[fieldName];
    } else {
      icon.addClass('icon__top');
      orderedFields[fieldName] = 'asc';
    }
    return $.ajax({
      url: "/api/rank_order",
      dataType: 'json',
      data: {
        alt_type: tabPanel.attr('id'),
        fields_order: $.extend({}, orderedFields)
      },
      cache: true,
      success: function(data) {
        var head, table;
        console.log(data);
        table = tabPanel.find('table');
        head = table.find('tr:first');
        $('.loader').hide();
        $('#details').show();
        GOVWIKI.show_data_page();
        GOVWIKI.tplLoaded = true;
        return window.history.pushState({
          template: $('#details').html()
        }, 'CPC Civic Profiles', '/rank_order');
      }
    });
  });
  altTypesData = {};
  GOVWIKI.currentAltType = 'City';
  GOVWIKI.currentAltTypeLowerCase = 'city';
  GOVWIKI.itemsPerPage = 10;
  GOVWIKI.currentPage = 0;
  setEvents = function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
      GOVWIKI.currentAltType = $(e.target).attr("href").replace('#', '');
      GOVWIKI.currentAltTypeLowerCase = GOVWIKI.currentAltType.toLowerCase();
      GOVWIKI.currentPage = 0;
      return renderPagination();
    });
    return $('.pagination').on('click', 'a', function(e) {
      var page;
      page = $(e.target).attr('data-page');
      if (page !== void 0) {
        GOVWIKI.currentPage = parseInt(page) - 1;
        return renderTemplate(GOVWIKI.currentPage);
      }
    });
  };
  renderPagination = function() {
    var $paginationContainer, paginationControls;
    $paginationContainer = $('#' + GOVWIKI.currentAltType + ' .pagination');
    $paginationContainer.html('');
    paginationControls = '';
    if (GOVWIKI.currentPage > 0) {
      paginationControls += '<li><a href="javascript:void(0)" aria-label="Previous" onclick="GOVWIKI.prevPage(event)"><span aria-hidden="true">&laquo;</span></a></li>';
      paginationControls += '<li><a href="javascript:void(0)" data-page="' + GOVWIKI.currentPage + '">' + GOVWIKI.currentPage + '</a></li>';
    } else {
      paginationControls += '<li class="disabled"><a href="javascript:void(0)" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
    }
    paginationControls += '<li class="active"><a href="javascript:void(0)" data-page="' + (GOVWIKI.currentPage + 1) + '">' + (GOVWIKI.currentPage + 1) + '</a></li>';
    if (GOVWIKI.currentPage === GOVWIKI.lastPage()) {
      paginationControls += '<li class="disabled"><a href="javascript:void(0)" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
    } else {
      paginationControls += '<li><a href="javascript:void(0)" data-page="' + (GOVWIKI.currentPage + 2) + '">' + (GOVWIKI.currentPage + 2) + '</a></li>';
      paginationControls += '<li><a href="javascript:void(0)" aria-label="Next" onclick="GOVWIKI.nextPage(event)"><span aria-hidden="true">&raquo;</span></a></li>';
    }
    return $paginationContainer.append(paginationControls);
  };
  $.ajax({
    url: "/api/rank_order",
    dataType: 'json',
    cache: true,
    success: function(data) {
      var tpl;
      altTypesData = data;
      tpl = Handlebars.compile($('#rank-order-page').html());
      $('#details').html(tpl(altTypesData));
      $('.loader').hide();
      $('#details').show();
      GOVWIKI.show_data_page();
      setEvents();
      renderPagination();
      return GOVWIKI.tplLoaded = true;
    }
  });
  renderTemplate = function(page) {
    return $.ajax({
      url: "/api/rank_order",
      dataType: 'json',
      cache: true,
      data: {
        alt_type: GOVWIKI.currentAltType,
        page: page || GOVWIKI.currentPage,
        limit: GOVWIKI.itemsPerPage
      },
      success: function(data) {
        var tpl;
        altTypesData[GOVWIKI.currentAltTypeLowerCase] = data;
        tpl = Handlebars.compile($('#table-' + GOVWIKI.currentAltTypeLowerCase.replace(/_/, '-')).html());
        $('#' + GOVWIKI.currentAltType).html(tpl(altTypesData));
        setEvents();
        return renderPagination();
      }
    });
  };
  GOVWIKI.nextPage = function(e) {
    ++GOVWIKI.currentPage;
    return renderTemplate();
  };
  GOVWIKI.prevPage = function(e) {
    --GOVWIKI.currentPage;
    return renderTemplate();
  };
  GOVWIKI.firstPage = function() {
    return GOVWIKI.currentPage == 0;
  };
  GOVWIKI.lastPage = function() {
    var lastPage;
    lastPage = Math.ceil(altTypesData.count / GOVWIKI.itemsPerPage - 1);
    return GOVWIKI.currentPage === lastPage;
  };
  GOVWIKI.numberOfPages = function() {
    return Math.ceil(altTypesData.count / GOVWIKI.itemsPerPage);
  };
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
    success: function(govs) {
      var run;
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
      person.gov_alt_name = person.government.slug.replace(/_/g, ' ');
      console.log(data);

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
      initTableHandlers(person, categories, data.electedOfficials);
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
  var $userBtn, $userBtnLink, $userText;
  $userBtn = $('#user');
  $userBtnLink = $userBtn.find('a');
  console.log(authorized);
  console.log(user);
  console.log(user.username);
  if (authorized) {
    $userText = $('#user-text').find('a');
    $userText.html(("Logged in as " + user.username) + $userText.html());
    return $userBtnLink.html("Sign Out" + $userBtnLink.html()).click(function() {
      return window.location = '/logout';
    });
  } else {
    return $userBtnLink.html("Login / Sign Up" + $userBtnLink.html()).click(function() {
      return showModal('/login');
    });
  }
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
      if (GOVWIKI.gov_type_filter && d.type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      if (test_string(d.name, regs)) {
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
    d.gov_name = strongify(d.name, words, regs);
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
        title = 'No title';
        GOVWIKI.fusion.rows.forEach(function(row) {
          if (row[2] === n) {
            return title = row[3];
          }
        });
        return v + " <a class='rank' data-field='" + n + "_rank' title='" + title + " ranks' data-mask='" + mask + "''> (" + data[n + '_rank'] + " of " + data.max_ranks[n + '_max_rank'] + ")</a>";
      }
      if (n === "number_of_full_time_employees") {
        return numeral(v).format('0,0');
      }
      return numeral(v).format(mask);
    } else {
      if (v.length > 20 && n === "open_enrollment_schools") {
        return v = v.substring(0, 19) + ("<div style='display:inline;color:#074d71'  title='" + v + "'>&hellip;</div>");
      } else if (v.length > 20 && n === "parent_trigger_eligible_schools") {
        return v = v.substring(0, 19) + ("<div style='display:inline;color:#074d71'  title='" + v + "'>&hellip;</div>");
      } else {
        if (v.length > 21) {
          return v = v.substring(0, 21);
        } else {
          return v;
        }
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
          GOVWIKI.fusion = template_json;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxnSkFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixtQkFBQSxHQUFzQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTs7QUFFckMsR0FBQSxHQUFVLElBQUEsS0FBQSxDQUNSO0VBQUEsRUFBQSxFQUFJLFNBQUo7RUFDQSxHQUFBLEVBQUssSUFETDtFQUVBLEdBQUEsRUFBSyxDQUFDLEtBRk47RUFHQSxJQUFBLEVBQU0sQ0FITjtFQUlBLE9BQUEsRUFBUyxDQUpUO0VBS0EsV0FBQSxFQUFhLElBTGI7RUFNQSxjQUFBLEVBQWdCLEtBTmhCO0VBT0EsVUFBQSxFQUFZLEtBUFo7RUFRQSxjQUFBLEVBQWdCLEtBUmhCO0VBU0EsV0FBQSxFQUFhLElBVGI7RUFVQSxrQkFBQSxFQUNFO0lBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMs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QyxPQUFGLENBQVUsZUFBVixFQUEwQixJQUExQjtTQUNmLENBQUMsQ0FBQyxPQUFGLENBQVUsc0RBQUEsR0FBdUQsWUFBdkQsR0FBb0UsbUNBQTlFLEVBQWtILFNBQUMsSUFBRDtJQUNoSCxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQXJDO0lBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUE1QztJQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLHNCQUE1QixDQUFtRCxDQUFDLElBQXBELENBQXlELE1BQXpELEVBQWlFLFNBQUE7YUFBSSwwQkFBQSxHQUE2QixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLE1BQWI7SUFBakMsQ0FBakU7V0FDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixHQUE1QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLFFBQXRDLEVBQWdELFFBQWhEO0VBSmdILENBQWxIO0FBRm9COztBQVF0Qix3QkFBQSxHQUEwQixTQUFBO1NBQ3hCLEtBQUEsQ0FBTSxpQkFBTjtBQUR3Qjs7QUFHMUIsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLHFCQUFBLEVBQXNCLHFCQUF0QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJib3VuZHNfdGltZW91dD11bmRlZmluZWRcbiMgU2V0IGxpZmV0aW1lIG9uIDEgZGF5cywgZm9ybWF0OiBkYXlzICogaG91cnMgKiBtaW51dGVzICogc2Vjb25kcyAqIG1pbGxpc2Vjb25kcy5cbnBvaW50c0NhY2hlTGlmZXRpbWUgPSAyNCAqIDYwICogNjAgKiAxMDAwO1xuXG5tYXAgPSBuZXcgR01hcHNcbiAgZWw6ICcjZ292bWFwJ1xuICBsYXQ6IDM3LjNcbiAgbG5nOiAtMTE5LjNcbiAgem9vbTogNlxuICBtaW5ab29tOiA2XG4gIHNjcm9sbHdoZWVsOiB0cnVlXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxuICBwYW5Db250cm9sOiBmYWxzZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgem9vbUNvbnRyb2w6IHRydWVcbiAgem9vbUNvbnRyb2xPcHRpb25zOlxuICAgIHN0eWxlOiBnb29nbGUubWFwcy5ab29tQ29udHJvbFN0eWxlLlNNQUxMXG4gIG1hcmtlckNsdXN0ZXJlcjogKG1hcCkgLT5cbiAgICBvcHRpb25zID0ge1xuICAgICAgdGV4dFNpemU6IDE0XG4gICAgICB0ZXh0Q29sb3I6ICdyZWQnXG4gICAgICBncmlkU2l6ZTogMFxuICAgICAgbWluaW11bUNsdXN0ZXJTaXplOiA1ICMgQWxsb3cgbWluaW11bSA1IG1hcmtlciBpbiBjbHVzdGVyLlxuICAgICAgaWdub3JlSGlkZGVuOiB0cnVlICMgRG9uJ3Qgc2hvdyBoaWRkZW4gbWFya2Vycy4gSW4gc29tZSByZWFzb24gZG9uJ3Qgd29yayA6KFxuICAgICAgIyBGb3IgZHJhdyBjaGFydC5cbiAgICAgIGxlZ2VuZDpcbiAgICAgICAgXCJDaXR5XCIgOiBcInJlZFwiXG4gICAgICAgIFwiU2Nob29sIERpc3RyaWN0XCIgOiBcImJsdWVcIlxuICAgICAgICBcIlNwZWNpYWwgRGlzdHJpY3RcIiA6IFwicHVycGxlXCJcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNYXJrZXJDbHVzdGVyZXIobWFwLCBbXSwgb3B0aW9ucyk7XG5cbm1hcC5tYXAuY29udHJvbHNbZ29vZ2xlLm1hcHMuQ29udHJvbFBvc2l0aW9uLlJJR0hUX1RPUF0ucHVzaChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGVnZW5kJykpXG5cbnJlcmVuZGVyX21hcmtlcnMgPSAtPlxuICBhZGRfbWFya2VyKHJlYykgZm9yIHJlYyBpbiBHT1ZXSUtJLm1hcmtlcnNcblxucmVidWlsZF9maWx0ZXIgPSAtPlxuICBoYXJkX3BhcmFtcyA9IFsnQ2l0eScsICdTY2hvb2wgRGlzdHJpY3QnLCAnU3BlY2lhbCBEaXN0cmljdCcsICdDb3VudHknXVxuICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yID0gW11cbiAgJCgnLnR5cGVfZmlsdGVyJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgaWYgJChlbGVtZW50KS5hdHRyKCduYW1lJykgaW4gaGFyZF9wYXJhbXMgYW5kICQoZWxlbWVudCkudmFsKCkgPT0gJzEnXG4gICAgICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLnB1c2ggJChlbGVtZW50KS5hdHRyKCduYW1lJylcblxuIyBsZWdlbmRUeXBlID0gY2l0eSwgc2Nob29sIGRpc3RyaWN0LCBzcGVjaWFsIGRpc3RyaWN0LCBjb3VudGllc1xuZ2V0X3JlY29yZHMyID0gKGxlZ2VuZFR5cGUsIG9uc3VjY2VzcykgLT5cbiAgI1xuICAjIFJldHJpZXZlIG5ldyBtYXJrZXJzIGRhdGEgZnJvbSBzZXJ2ZXIuXG4gICQuYWpheFxuICAgIHVybDpcIi9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcbiMgICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUsIGxpbWl0OiA1MDAwIH1cbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuICByZWJ1aWxkX2ZpbHRlcigpXG4gIGRhdGEgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BvaW50cycpXG5cbiAgI1xuICAjIExvYWQgbWFya2VycyBkYXRhXG4gICNcbiAgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cbiAgaWYgZGF0YSBhbmQgKChOdW1iZXIod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwb2ludHNfbGFzdF91cGRhdGUnKSkgKyBwb2ludHNDYWNoZUxpZmV0aW1lKSA+PSBkYXRlLmdldFRpbWUoKSlcbiAgICAjXG4gICAgIyBJZiBwb2ludHMgZGF0YSBjYWNoZWQgaW4gbG9jYWwgc3RvcmFnZSBhbmQgaW4gYWN0dWFsIHN0YXRlLCBsb2FkIGZyb20gY2FjaGUuXG4gICAgI1xuICAgIGNvbnNvbGUubG9nKCdGcm9tIGNhY2hlJylcbiAgICBHT1ZXSUtJLm1hcmtlcnMgPSBKU09OLnBhcnNlKGRhdGEpXG4gICAgJChkb2N1bWVudCkudHJpZ2dlcignbWFya2Vyc0xvYWRlZCcpXG4gICAgI1xuICAgICMgUmVuZGVyIHBvaW50cyBzdG9yZWQgaW4gR09WV0lLSS5tYXJrZXJzXG4gICAgI1xuICAgIHJlcmVuZGVyX21hcmtlcnMoKVxuICBlbHNlXG4gICAgI1xuICAgICMgR2V0IG5ldyBkYXRhIGZyb20gc2VydmVyLlxuICAgICNcbiAgICBnZXRfcmVjb3JkczIgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiwgKGRhdGEpIC0+XG4gICAgICAjXG4gICAgICAjIFN0b3JlIG1hcmtlcnMgZGF0YS5cbiAgICAgICNcbiAgICAgIGNvbnNvbGUubG9nKCdGcm9tIHNlcnZlcicpXG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50cycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50c19sYXN0X3VwZGF0ZScsIGRhdGUuZ2V0VGltZSgpKVxuICAgICAgR09WV0lLSS5tYXJrZXJzID0gZGF0YVxuICAgICAgJChkb2N1bWVudCkudHJpZ2dlcignbWFya2Vyc0xvYWRlZCcpXG4gICAgICAjXG4gICAgICAjIFJlbmRlciBwb2ludHMgc3RvcmVkIGluIEdPVldJS0kubWFya2Vyc1xuICAgICAgI1xuICAgICAgcmVyZW5kZXJfbWFya2VycygpXG5cbiAgJCgnI2xlZ2VuZCBsaTpub3QoLmNvdW50aWVzLXRyaWdnZXIpJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGhpZGRlbl9maWVsZCA9ICQodGhpcykuZmluZCgnaW5wdXQnKVxuICAgIHZhbHVlID0gaGlkZGVuX2ZpZWxkLnZhbCgpXG4gICAgaGlkZGVuX2ZpZWxkLnZhbChpZiB2YWx1ZSA9PSAnMScgdGhlbiAnMCcgZWxzZSAnMScpXG4gICAgI1xuICAgICMgQ2xpY2tlZCBsZWdlbmQgYWx0IHR5cGUuXG4gICAgYWx0VHlwZSA9IGhpZGRlbl9maWVsZC5hdHRyKCduYW1lJylcblxuICAgIHJlYnVpbGRfZmlsdGVyKClcblxuICAgICNcbiAgICAjIFRvZ2dsZSBtYXJrZXIgdmlzaWJsZSB3aXRoIHR5cGUgZXF1YWwgdG8gY2xpY2tlZCBsZWdlbmQuXG4gICAgI1xuICAgIGZvciBtYXJrZXIgaW4gbWFwLm1hcmtlcnNcbiAgICAgIGlmIG1hcmtlci50eXBlIGlzIGFsdFR5cGVcbiAgICAgICAgIyBSZW1vdmV8YWRkIG1hcmtlcnMgZnJvbSBjbHVzdGVyIGJlY2F1c2UgTWFya2VyQ2x1c3RlciBpZ25vcmVcbiAgICAgICAgIyBoaXMgb3B0aW9uICdpZ25vcmVIaWRkZW4nLlxuICAgICAgICBpZiAodmFsdWUgaXMgJzEnKVxuICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVtb3ZlTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIuYWRkTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiMgICAgICAgIG1hcmtlci5zZXRWaXNpYmxlKCEgbWFya2VyLmdldFZpc2libGUoKSlcblxuICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVwYWludCgpO1xuXG4gICQoJyNsZWdlbmQgbGkuY291bnRpZXMtdHJpZ2dlcicpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdhY3RpdmUnKVxuICAgICAgI1xuICAgICAgIyBTaG93IGNvdW50aWVzLlxuICAgICAgI1xuICAgICAgZm9yIHBvbHlnb24gaW4gbWFwLnBvbHlnb25zXG4gICAgICAgIHBvbHlnb24uc2V0VmlzaWJsZSh0cnVlKVxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgSGlkZSBjb3VudGllcy5cbiAgICAgICNcbiAgICAgIGZvciBwb2x5Z29uIGluIG1hcC5wb2x5Z29uc1xuICAgICAgICBwb2x5Z29uLnNldFZpc2libGUoZmFsc2UpXG5cblxuXG5cblxuZ2V0X2ljb24gPShhbHRfdHlwZSkgLT5cblxuICBfY2lyY2xlID0oY29sb3IpLT5cbiAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRVxuICAgIGZpbGxPcGFjaXR5OiAxXG4gICAgZmlsbENvbG9yOiBjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXG4gICAgc2NhbGU6IDZcblxuICBzd2l0Y2ggYWx0X3R5cGVcbiAgICB3aGVuICdDaXR5JyB0aGVuIHJldHVybiBfY2lyY2xlICdyZWQnXG4gICAgd2hlbiAnU2Nob29sIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdibHVlJ1xuICAgIHdoZW4gJ1NwZWNpYWwgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3B1cnBsZSdcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcblxuaW5fYXJyYXkgPSAobXlfaXRlbSwgbXlfYXJyYXkpIC0+XG4gIGZvciBpdGVtIGluIG15X2FycmF5XG4gICAgcmV0dXJuIHRydWUgaWYgaXRlbSA9PSBteV9pdGVtXG4gIGZhbHNlXG5cblxuYWRkX21hcmtlciA9IChyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIGV4aXN0ID0gaW5fYXJyYXkgcmVjLmFsdFR5cGUsIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzJcbiAgaWYgZXhpc3QgaXMgZmFsc2UgdGhlbiByZXR1cm4gZmFsc2VcblxuICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhyZWMubGF0aXR1ZGUsIHJlYy5sb25naXR1ZGUpXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4gICAgdGl0bGU6ICBcIiN7cmVjLm5hbWV9LCAje3JlYy50eXBlfVwiLFxuIyAgICB0aXRsZTogXCIje3JlYy5hbHRUeXBlfVwiXG4gICAgI1xuICAgICMgRm9yIGxlZ2VuZCBjbGljayBoYW5kbGVyLlxuICAgIHR5cGU6IHJlYy5hbHRUeXBlXG4gIH0pXG4gICNcbiAgIyBPbiBjbGljayByZWRpcmVjdCB1c2VyIHRvIGVudGl0eSBwYWdlLlxuICAjXG4gIG1hcmtlci5hZGRMaXN0ZW5lciAnY2xpY2snLCAoKSAtPlxuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgIGNvbnNvbGUubG9nKCdDbGljayBvbiBtYXJrZXInKTtcbiAgICB1cmwgPSBcIiN7cmVjLmFsdFR5cGVTbHVnfS8je3JlYy5zbHVnfVwiXG4gICAgY29uc29sZS5sb2codXJsKTtcbiAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YVxuICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50L1wiICsgdXJsLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSBHT1ZXSUtJLnRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG4gIG1hcC5hZGRNYXJrZXIgbWFya2VyXG5cbiMgIG1hcC5hZGRNYXJrZXJcbiMgICAgbGF0OiByZWMubGF0aXR1ZGVcbiMgICAgbG5nOiByZWMubG9uZ2l0dWRlXG4jICAgIGljb246IGdldF9pY29uKHJlYy5hbHRUeXBlKVxuIyAgICB0aXRsZTogIFwiI3tyZWMubmFtZX0sICN7cmVjLnR5cGV9XCJcbiMgICAgaW5mb1dpbmRvdzpcbiMgICAgICBjb250ZW50OiBcIlxuIyAgICAgICAgPGRpdj48YSBocmVmPSdqYXZhc2NyaXB0OnZvaWQoMCk7JyBjbGFzcz0naW5mby13aW5kb3ctdXJpJyBkYXRhLXVyaT0nLyN7cmVjLmFsdFR5cGVTbHVnfS8je3JlYy5zbHVnfSc+PHN0cm9uZz4je3JlYy5uYW1lfTwvc3Ryb25nPjwvYT48L2Rpdj5cbiMgICAgICAgIDxkaXY+ICN7cmVjLnR5cGV9ICAje3JlYy5jaXR5fSAje3JlYy56aXB9ICN7cmVjLnN0YXRlfTwvZGl2PlwiXG5cblxuXG4jIEdFT0NPRElORyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnBpbkltYWdlID0gbmV3IChnb29nbGUubWFwcy5NYXJrZXJJbWFnZSkoXG4gICdodHRwOi8vY2hhcnQuYXBpcy5nb29nbGUuY29tL2NoYXJ0P2Noc3Q9ZF9tYXBfcGluX2xldHRlciZjaGxkPVp8Nzc3N0JCfEZGRkZGRicgLFxuICBuZXcgKGdvb2dsZS5tYXBzLlNpemUpKDIxLCAzNCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDAsIDApLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgxMCwgMzQpXG4gIClcblxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcblxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgICAgbGF0OiBkYXRhLmxhdGl0dWRlXG4gICAgICAgICAgICBsbmc6IGRhdGEubG9uZ2l0dWRlXG4gICAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgICBjb2xvcjogJ2JsdWUnXG4gICAgICAgICAgICBpY29uOiBwaW5JbWFnZVxuICAgICAgICAgICAgdGl0bGU6ICBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgICAgY29udGVudDogXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcblxuICAgICAgICAkKCcuZ292bWFwLWZvdW5kJykuaHRtbCBcIjxzdHJvbmc+Rk9VTkQ6IDwvc3Ryb25nPiN7cmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc31cIlxuICAgICAgcmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuICBtYXA6IG1hcFxuIiwiXG5xdWVyeV9tYXRjaGVyID0gcmVxdWlyZSgnLi9xdWVyeW1hdGNoZXIuY29mZmVlJylcblxuY2xhc3MgR292U2VsZWN0b3JcbiAgXG4gICMgc3R1YiBvZiBhIGNhbGxiYWNrIHRvIGVudm9rZSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZXRoaW5nXG4gIG9uX3NlbGVjdGVkOiAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuXG5cbiAgY29uc3RydWN0b3I6IChAaHRtbF9zZWxlY3RvciwgZG9jc191cmwsIEBudW1faXRlbXMpIC0+XG4jICAgICQuYWpheFxuIyAgICAgIHVybDogZG9jc191cmxcbiMgICAgICBkYXRhVHlwZTogJ2pzb24nXG4jICAgICAgY2FjaGU6IHRydWVcbiMgICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgJChkb2N1bWVudCkub24gJ21hcmtlcnNMb2FkZWQnLCAoKSA9PlxuICAgICAgY29uc29sZS5sb2cgJ01hcmtlcnMgbG9hZGVkJ1xuICAgICAgY29uc29sZS5sb2cgR09WV0lLSS5tYXJrZXJzXG4gICAgICBAc3RhcnRTdWdnZXN0aW9uKEdPVldJS0kubWFya2VycylcblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7bmFtZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctdHlwZVwiPnt7e3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBnb3ZzX2FycmF5ID0gW11cblxuICBjb3VudF9nb3ZzIDogKCkgLT5cbiAgICBjb3VudCA9MFxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLnR5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBjb3VudCsrXG4gICAgcmV0dXJuIGNvdW50XG5cblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICBAZ292c19hcnJheSA9IGdvdnNcbiAgICAjQGdvdnNfYXJyYXkgPSBnb3ZzLnJlY29yZFxuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuXG4gICAgc2V0VGltZW91dCA9PlxuICAgICAgJChAaHRtbF9zZWxlY3RvcikuYXR0ciAncGxhY2Vob2xkZXInLCAnR09WRVJOTUVOVCBOQU1FJ1xuICAgICwgMTAwMFxuXG4gICAgJChAaHRtbF9zZWxlY3RvcikudHlwZWFoZWFkKFxuICAgICAgICBoaW50OiBmYWxzZVxuICAgICAgICBoaWdobGlnaHQ6IHRydWVcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAgIGNsYXNzTmFtZXM6XG4gICAgICAgIFx0bWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICduYW1lJ1xuICAgICAgICBkaXNwbGF5S2V5OiAnbmFtZSdcbiAgICAgICAgc291cmNlOiBxdWVyeV9tYXRjaGVyKEBnb3ZzX2FycmF5LCBAbnVtX2l0ZW1zKVxuICAgICAgICAjc291cmNlOiBibG9vZGhvdW5kLnR0QWRhcHRlcigpXG4gICAgICAgIHRlbXBsYXRlczogc3VnZ2VzdGlvbjogQHN1Z2dlc3Rpb25UZW1wbGF0ZVxuICAgIClcbiAgICAub24gJ3R5cGVhaGVhZDpzZWxlY3RlZCcsICAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBAZW50ZXJlZF92YWx1ZVxuICAgICAgICBAb25fc2VsZWN0ZWQoZXZ0LCBkYXRhLCBuYW1lKVxuICAgXG4gICAgLm9uICd0eXBlYWhlYWQ6Y3Vyc29yY2hhbmdlZCcsIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS52YWwgQGVudGVyZWRfdmFsdWVcbiAgICBcblxuICAgIyAkKCcuZ292LWNvdW50ZXInKS50ZXh0IEBjb3VudF9nb3ZzKClcbiAgICByZXR1cm5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cz1Hb3ZTZWxlY3RvclxuXG5cblxuIiwiIyMjXG5maWxlOiBtYWluLmNvZmZlIC0tIFRoZSBlbnRyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICA6XG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxuZ292X2RldGFpbHMgPSBuZXcgR292RGV0YWlsc1xuZ292X2ZpbmRlci5vbl9zZWxlY3QgPSBnb3ZfZGV0YWlscy5zaG93XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXG4jX2pxZ3MgICAgICAgPSByZXF1aXJlICcuL2pxdWVyeS5nb3ZzZWxlY3Rvci5jb2ZmZWUnXG5UZW1wbGF0ZXMyID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMyLmNvZmZlZSdcbndpa2lwZWRpYSA9IHJlcXVpcmUgJy4vd2lraXBlZGlhLmNvZmZlZSdcblxuZ292bWFwID0gbnVsbFxuZ292X3NlbGVjdG9yID0gbnVsbFxudGVtcGxhdGVzID0gbmV3IFRlbXBsYXRlczJcbmFjdGl2ZV90YWIgPSBcIlwiXG51bmRlZiA9IG51bGxcbiNcbiMgTm93IGluaXQgaW4gRnJvbnRlbmRCdW5kbGUgbWFpbiB0ZW1wbGF0ZS5cbiNhdXRob3JpemVkID0gZmFsc2VcbiN1c2VyID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuI1xuIyBJc3N1ZXMgY2F0ZWdvcnksIGZpbGwgaW4gZWxlY3RlZCBvZmZpY2lhbCBwYWdlLlxuI1xuY2F0ZWdvcmllcyA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgJ3RhYmxlLWNpdHknLCAkKCcjdGFibGUtY2l0eScpLmh0bWwoKVxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgJ3RhYmxlLWNvdW50eScsICQoJyN0YWJsZS1jb3VudHknKS5odG1sKClcbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsICd0YWJsZS1zY2hvb2wtZGlzdHJpY3QnLCAkKCcjdGFibGUtc2Nob29sLWRpc3RyaWN0JykuaHRtbCgpXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCAndGFibGUtc3BlY2lhbC1kaXN0cmljdCcsICQoJyN0YWJsZS1zcGVjaWFsLWRpc3RyaWN0JykuaHRtbCgpXG5cblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnZ2V0TmFtZScsIChuYW1lLCBvYmopIC0+XG4gICAgcmV0dXJuIG9ialtuYW1lKydSYW5rJ107XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2lmX2VxJywgKGEsIGIsIG9wdHMpIC0+XG4gICAgaWYgYGEgPT0gYmBcbiAgICAgICAgcmV0dXJuIG9wdHMuZm4gdGhpc1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG9wdHMuaW52ZXJzZSB0aGlzXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ3NvbWUnLCAoYXJyLCB0YXJnZXQsIG9wdHMpIC0+XG4gICAgcmV0dXJuICEhYXJyW3RhcmdldCsnUmFuayddO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdkZWJ1ZycsIChlbWJlck9iamVjdCkgLT5cbiAgaWYgZW1iZXJPYmplY3QgYW5kIGVtYmVyT2JqZWN0LmNvbnRleHRzXG4gICAgb3V0ID0gJyc7XG5cbiAgICBmb3IgY29udGV4dCBpbiBlbWJlck9iamVjdC5jb250ZXh0c1xuICAgICAgZm9yIHByb3AgaW4gY29udGV4dFxuICAgICAgICBvdXQgKz0gcHJvcCArIFwiOiBcIiArIGNvbnRleHRbcHJvcF0gKyBcIlxcblwiXG5cbiAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLmxvZylcbiAgICAgICAgY29uc29sZS5sb2coXCJEZWJ1Z1xcbi0tLS0tLS0tLS0tLS0tLS1cXG5cIiArIG91dClcblxuXG53aW5kb3cuR09WV0lLSSA9XG4gICAgc3RhdGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXJfMjogWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0J11cblxuICAgIHNob3dfc2VhcmNoX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICAgICBmb2N1c19zZWFyY2hfZmllbGQgNTAwXG5cbiAgICBzaG93X2RhdGFfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG5cbkdPVldJS0kudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xuR09WV0lLSS50cGxMb2FkZWQgPSBmYWxzZVxuXG5HT1ZXSUtJLmdldF9jb3VudGllcyA9IGdldF9jb3VudGllcyA9IChjYWxsYmFjaykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnL2xlZ2FjeS9kYXRhL2NvdW50eV9nZW9ncmFwaHlfY2FfMi5qc29uJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChjb3VudGllc0pTT04pIC0+XG4gICAgICAgICAgICBjYWxsYmFjayBjb3VudGllc0pTT05cblxuR09WV0lLSS5kcmF3X3BvbHlnb25zID0gZHJhd19wb2x5Z29ucyA9IChjb3VudGllc0pTT04pIC0+XG4gICAgZm9yIGNvdW50eSBpbiBjb3VudGllc0pTT04uZmVhdHVyZXNcbiAgICAgICAgZG8gKGNvdW50eSkgPT5cbiAgICAgICAgICAgIGdvdm1hcC5tYXAuZHJhd1BvbHlnb24oe1xuICAgICAgICAgICAgICAgIHBhdGhzOiBjb3VudHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAgICB1c2VHZW9KU09OOiB0cnVlXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICcjODA4MDgwJ1xuICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAuNlxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMS41XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnI0ZGMDAwMCdcbiAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4xNVxuICAgICAgICAgICAgICAgIGNvdW50eUlkOiBjb3VudHkucHJvcGVydGllcy5faWRcbiAgICAgICAgICAgICAgICBhbHROYW1lOiBjb3VudHkucHJvcGVydGllcy5hbHRfbmFtZVxuICAgICAgICAgICAgICAgIG1hcmtlcjogbmV3IE1hcmtlcldpdGhMYWJlbCh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICByYWlzZU9uRHJhZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1hcDogZ292bWFwLm1hcC5tYXAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQ29udGVudDogY291bnR5LnByb3BlcnRpZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxBbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCgtMTUsIDI1KSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDbGFzczogXCJsYWJlbC10b29sdGlwXCIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsU3R5bGU6IHtvcGFjaXR5OiAxLjB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMXgxXCIsXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiMwMEZGMDBcIn0pXG4gICAgICAgICAgICAgICAgbW91c2Vtb3ZlOiAoZXZlbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFBvc2l0aW9uKGV2ZW50LmxhdExuZylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZSh0cnVlKVxuICAgICAgICAgICAgICAgIG1vdXNlb3V0OiAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE9wdGlvbnMoe2ZpbGxDb2xvcjogXCIjRkYwMDAwXCJ9KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKVxuICAgICAgICAgICAgICAgIGNsaWNrOiAtPlxuICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgdXJpID0gXCIvI3tjb3VudHkuYWx0X3R5cGVfc2x1Z30vI3tjb3VudHkucHJvcGVydGllcy5zbHVnfVwiXG4gICAgICAgICAgICAgICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZ292cykgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJpXG4gICAgICAgICAgICB9KVxuXG53aW5kb3cucmVtZW1iZXJfdGFiID0gKG5hbWUpLT4gYWN0aXZlX3RhYiA9IG5hbWVcblxuJChkb2N1bWVudCkub24gJ2NsaWNrJywgJyNmaWVsZFRhYnMgYScsIChlKSAtPlxuICAgIGFjdGl2ZV90YWIgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgndGFibmFtZScpXG4gICAgY29uc29sZS5sb2cgYWN0aXZlX3RhYlxuICAgICQoXCIjdGFic0NvbnRlbnQgLnRhYi1wYW5lXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpXG4gICAgJCgkKGUuY3VycmVudFRhcmdldCkuYXR0cignaHJlZicpKS5hZGRDbGFzcyhcImFjdGl2ZVwiKVxuICAgIHRlbXBsYXRlcy5hY3RpdmF0ZSAwLCBhY3RpdmVfdGFiXG5cbiAgICBpZiBhY3RpdmVfdGFiID09ICdGaW5hbmNpYWwgU3RhdGVtZW50cydcbiAgICAgICAgZmluVmFsV2lkdGhNYXgxID0gMFxuICAgICAgICBmaW5WYWxXaWR0aE1heDIgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IDBcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIxXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgxXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgxID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMlwiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4MlxuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDNcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDMgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIxXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MSArIDI3KVxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MiArIDI3KVxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIzXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MyArIDI3KVxuXG4kKGRvY3VtZW50KS50b29sdGlwKHtzZWxlY3RvcjogXCJbY2xhc3M9J21lZGlhLXRvb2x0aXAnXVwiLCB0cmlnZ2VyOiAnY2xpY2snfSlcblxuYWN0aXZhdGVfdGFiID0gKCkgLT5cbiAgICAkKFwiI2ZpZWxkVGFicyBhW2hyZWY9JyN0YWIje2FjdGl2ZV90YWJ9J11cIikudGFiKCdzaG93JylcblxuXG5nZXRfcmVjb3JkMiA9IChyZWNpZCkgLT5cbiAgICBjb25zb2xlLmxvZygnISFAI0AnKTtcbiMgY2xlYXIgd2lraXBlZGlhIHBsYWNlXG4gICAgJChcIiN3aWtpcGVkaWFDb250YWluZXJcIikuaHRtbChcIlwiKVxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvZ292cy8je3JlY2lkfVwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgaGVhZGVyczoge1wiWC1EcmVhbUZhY3RvcnktQXBwbGljYXRpb24tTmFtZVwiOiBcImdvdndpa2lcIn1cbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAgICAgZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzIGRhdGEuX2lkLCAoZGF0YTIsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICAgICAgICAgICAgICBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gZGF0YTJcbiAgICAgICAgICAgICAgICAgICAgZ2V0X2VsZWN0ZWRfb2ZmaWNpYWxzIGRhdGEuX2lkLCAyNSwgKGRhdGEzLCB0ZXh0U3RhdHVzMiwganFYSFIyKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5lbGVjdGVkX29mZmljaWFscyA9IGRhdGEzXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRfbWF4X3JhbmtzIChtYXhfcmFua3NfcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5tYXhfcmFua3MgPSBtYXhfcmFua3NfcmVzcG9uc2UucmVjb3JkWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI1RPRE86IEVuYWJsZSBhZnRlciByZWFsaXplIG1heF9yYW5rcyBhcGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNjb25zb2xlLmxvZyB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuXG4gICAgICAgICAgICAjIGZpbGwgd2lraXBlZGlhIHBsYWNlXG4gICAgICAgICAgICAjd3BuID0gZGF0YS53aWtpcGVkaWFfcGFnZV9uYW1lXG4gICAgICAgICAgICAjJChcIiN3aWtpcGVkaWFDb250YWluZXJcIikuaHRtbChpZiB3cG4gdGhlbiB3cG4gZWxzZSBcIk5vIFdpa2lwZWRpYSBhcnRpY2xlXCIpXG5cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuZ2V0X2VsZWN0ZWRfb2ZmaWNpYWxzID0gKGFsdF90eXBlLCBnb3ZfbmFtZSwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5L2FwaS9nb3Zlcm5tZW50L1wiICsgYWx0X3R5cGUgKyAnLycgKyBnb3ZfbmFtZVxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbmdldF9maW5hbmNpYWxfc3RhdGVtZW50cyA9IChnb3ZfaWQsIG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL19wcm9jL2dldF9maW5hbmNpYWxfc3RhdGVtZW50c1wiXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgICBhcHBfbmFtZTogXCJnb3Z3aWtpXCJcbiAgICAgICAgICAgIG9yZGVyOiBcImNhcHRpb25fY2F0ZWdvcnksZGlzcGxheV9vcmRlclwiXG4gICAgICAgICAgICBwYXJhbXM6IFtcbiAgICAgICAgICAgICAgICBuYW1lOiBcImdvdnNfaWRcIlxuICAgICAgICAgICAgICAgIHBhcmFtX3R5cGU6IFwiSU5cIlxuICAgICAgICAgICAgICAgIHZhbHVlOiBnb3ZfaWRcbiAgICAgICAgICAgIF1cblxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuZ2V0X21heF9yYW5rcyA9IChvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL21heF9yYW5rcydcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiAnZ292d2lraSdcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3Ncblxud2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQgPSAocmVjKT0+XG4gICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCByZWMpXG4gICAgYWN0aXZhdGVfdGFiKClcbiAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICByb3V0ZXIubmF2aWdhdGUocmVjLl9pZClcblxuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZDIgPSAocmVjKT0+XG4gICAgZ2V0X2VsZWN0ZWRfb2ZmaWNpYWxzIHJlYy5hbHRUeXBlU2x1ZywgcmVjLnNsdWcsIChkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cbiAgICAgICAgcmVjLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YVxuICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICAgICAgI2dldF9yZWNvcmQyIHJlYy5pZFxuICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgdXJsID0gcmVjLmFsdFR5cGVTbHVnICsgJy8nICsgcmVjLnNsdWdcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSB1cmxcblxuXG5idWlsZF9zZWxlY3RvciA9IChjb250YWluZXIsIHRleHQsIGNvbW1hbmQsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICdodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvcnVuQ29tbWFuZD9hcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnknXG4gICAgICAgIHR5cGU6ICdQT1NUJ1xuICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBkYXRhOiBjb21tYW5kICNKU09OLnN0cmluZ2lmeShjb21tYW5kKVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIHZhbHVlcyA9IGRhdGEudmFsdWVzXG4gICAgICAgICAgICBidWlsZF9zZWxlY3RfZWxlbWVudCBjb250YWluZXIsIHRleHQsIHZhbHVlcy5zb3J0KCksIHdoZXJlX3RvX3N0b3JlX3ZhbHVlXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmJ1aWxkX3NlbGVjdF9lbGVtZW50ID0gKGNvbnRhaW5lciwgdGV4dCwgYXJyLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cbiAgICBzID0gXCI8c2VsZWN0IGNsYXNzPSdmb3JtLWNvbnRyb2wnIHN0eWxlPSdtYXh3aWR0aDoxNjBweDsnPjxvcHRpb24gdmFsdWU9Jyc+I3t0ZXh0fTwvb3B0aW9uPlwiXG4gICAgcyArPSBcIjxvcHRpb24gdmFsdWU9JyN7dn0nPiN7dn08L29wdGlvbj5cIiBmb3IgdiBpbiBhcnIgd2hlbiB2XG4gICAgcyArPSBcIjwvc2VsZWN0PlwiXG4gICAgc2VsZWN0ID0gJChzKVxuICAgICQoY29udGFpbmVyKS5hcHBlbmQoc2VsZWN0KVxuXG4gICAgIyBzZXQgZGVmYXVsdCAnQ0EnXG4gICAgaWYgdGV4dCBpcyAnU3RhdGUuLidcbiAgICAgICAgc2VsZWN0LnZhbCAnQ0EnXG4gICAgICAgIHdpbmRvdy5HT1ZXSUtJLnN0YXRlX2ZpbHRlciA9ICdDQSdcblxuICAgIHNlbGVjdC5jaGFuZ2UgKGUpIC0+XG4gICAgICAgIGVsID0gJChlLnRhcmdldClcbiAgICAgICAgd2luZG93LkdPVldJS0lbd2hlcmVfdG9fc3RvcmVfdmFsdWVdID0gZWwudmFsKClcbiAgICAgICAgJCgnLmdvdi1jb3VudGVyJykudGV4dCBnb3Zfc2VsZWN0b3IuY291bnRfZ292cygpXG5cbmFkanVzdF90eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgIGlucCA9ICQoJyNteWlucHV0JylcbiAgICBwYXIgPSAkKCcjdHlwZWFoZWQtY29udGFpbmVyJylcbiAgICBpbnAud2lkdGggcGFyLndpZHRoKClcblxuXG5zdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoID0gKCkgLT5cbiAgICAkKHdpbmRvdykucmVzaXplIC0+XG4gICAgICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuXG5mb2N1c19zZWFyY2hfZmllbGQgPSAobXNlYykgLT5cbiAgICBzZXRUaW1lb3V0ICgtPiAkKCcjbXlpbnB1dCcpLmZvY3VzKCkpLCBtc2VjXG5cblxuIyBxdWljayBhbmQgZGlydHkgZml4IGZvciBiYWNrIGJ1dHRvbiBpbiBicm93c2VyXG53aW5kb3cub25oYXNoY2hhbmdlID0gKGUpIC0+XG4gICAgaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoXG4gICAgaWYgbm90IGhcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcigoaXRtKS0+IGlmIGl0bSBpc250IFwiXCIgdGhlbiBpdG0gZWxzZSBmYWxzZSk7XG5yb3V0ZVR5cGUgPSByb3V0ZS5sZW5ndGg7XG5cbkdPVldJS0kuaGlzdG9yeSA9IChpbmRleCkgLT5cbiAgICBpZiBpbmRleCA9PSAwXG4gICAgICAgIHNlYXJjaENvbnRhaW5lciA9ICQoJyNzZWFyY2hDb250YWluZXInKS50ZXh0KCk7XG4gICAgICAgIGlmKHNlYXJjaENvbnRhaW5lciAhPSAnJylcbiMgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge30sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnLydcbiAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLydcbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLnNob3coKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiAoaGlzdG9yeS5zdGF0ZSAhPSBudWxsICYmIGhpc3Rvcnkuc3RhdGUudGVtcGxhdGUgIT0gdW5kZWZpbmVkKVxuICAgICAgICB3aW5kb3cuaGlzdG9yeS5nbyhpbmRleCk7XG4gICAgZWxzZVxuICAgICAgICByb3V0ZS5wb3AoKVxuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJyArIHJvdXRlLmpvaW4oJy8nKVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9wc3RhdGUnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cod2luZG93Lmhpc3Rvcnkuc3RhdGUpXG4gICAgaWYgd2luZG93Lmhpc3Rvcnkuc3RhdGUgaXNudCBudWxsXG4gICAgICAgIHJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoKGl0bSktPiBpZiBpdG0gaXNudCBcIlwiIHRoZW4gaXRtIGVsc2UgZmFsc2UpO1xuICAgICAgICByb3V0ZSA9IHJvdXRlLmxlbmd0aDtcblxuICAgICAgICBjb25zb2xlLmxvZyhyb3V0ZSlcbiAgICAgICAgaWYgcm91dGUgaXMgMFxuICAgICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiAgICAgICAgaWYgcm91dGUgaXMgMlxuICAgICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKTtcbiAgICAgICAgaWYgcm91dGUgaXNudCAwXG4gICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGV2ZW50LnN0YXRlLnRlbXBsYXRlXG4gICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgZWxzZVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuICAgICAgICBpZiBHT1ZXSUtJLnRwbExvYWRlZCBpcyBmYWxzZSB0aGVuIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpXG5cbiMgUmVmcmVzaCBEaXNxdXMgdGhyZWFkXG5yZWZyZXNoX2Rpc3F1cyA9IChuZXdJZGVudGlmaWVyLCBuZXdVcmwsIG5ld1RpdGxlKSAtPlxuICAgIERJU1FVUy5yZXNldFxuICAgICAgICByZWxvYWQ6IHRydWUsXG4gICAgICAgIGNvbmZpZzogKCkgLT5cbiAgICAgICAgICAgIHRoaXMucGFnZS5pZGVudGlmaWVyID0gbmV3SWRlbnRpZmllclxuICAgICAgICAgICAgdGhpcy5wYWdlLnVybCA9IG5ld1VybFxuICAgICAgICAgICAgdGhpcy5wYWdlLnRpdGxlID0gbmV3VGl0bGVcblxuI1xuIyBTb3J0IHRhYmxlIGJ5IGNvbHVtbi5cbiMgQHBhcmFtIHN0cmluZyB0YWJsZSAgSlF1ZXJ5IHNlbGVjdG9yLlxuIyBAcGFyYW0gbnVtYmVyIGNvbE51bSBDb2x1bW4gbnVtYmVyLlxuI1xuc29ydFRhYmxlID0gKHRhYmxlLCBjb2xOdW0pIC0+XG4gICAgI1xuICAgICMgRGF0YSByb3dzIHRvIHNvcnRcbiAgICAjXG4gICAgcm93cyA9ICQodGFibGUgKyAnIHRib2R5ICBbZGF0YS1pZF0nKS5nZXQoKVxuICAgICNcbiAgICAjIExhc3Qgcm93IHdoaWNoIGNvbnRhaW5zIFwiQWRkIG5ldyAuLi5cIlxuICAgICNcbiAgICBsYXN0Um93ID0gJCh0YWJsZSArICcgdGJvZHkgIHRyOmxhc3QnKS5nZXQoKTtcbiAgICAjXG4gICAgIyBDbGlja2VkIGNvbHVtbi5cbiAgICAjXG4gICAgY29sdW1uID0gJCh0YWJsZSArICcgdGJvZHkgdHI6Zmlyc3QnKS5jaGlsZHJlbigndGgnKS5lcShjb2xOdW0pXG4gICAgbWFrZVNvcnQgPSB0cnVlXG5cbiAgICBpZiBjb2x1bW4uaGFzQ2xhc3MoJ2Rlc2MnKVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBjdXJyZW50bHkgc29ydGVkIGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gICAgICAjIFJlc3RvcmUgcm93IG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdkZXNjJykuYWRkQ2xhc3MoJ29yaWdpbicpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKS5yZW1vdmVDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgIHJvd3MgPSBjb2x1bW4uZGF0YSgnb3JpZ2luJylcbiAgICAgIG1ha2VTb3J0ID0gZmFsc2U7XG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ2FzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gYXNjZW5kaW5nIG9yZGVyLlxuICAgICAgIyBTb3J0IGluIGRlc2Mgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2FzYycpLmFkZENsYXNzKCdkZXNjJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX2JvdHRvbScpLmFkZENsYXNzKCdpY29uX190b3AnKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIGlmIEEgPCBCIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgcmV0dXJuIDBcblxuICAgIGVsc2UgaWYgY29sdW1uLmhhc0NsYXNzKCdvcmlnaW4nKVxuICAgICAgI1xuICAgICAgIyBPcmlnaW5hbCB0YWJsZSBkYXRhIG9yZGVyLlxuICAgICAgIyBTb3J0IGluIGFzYyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnb3JpZ2luJykuYWRkQ2xhc3MoJ2FzYycpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIGlmIEEgPCBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcbiAgICBlbHNlXG4gICAgICAjXG4gICAgICAjIFRhYmxlIG5vdCBvcmRlcmVkIHlldC5cbiAgICAgICMgU3RvcmUgb3JpZ2luYWwgZGF0YSBwb3NpdGlvbiBhbmQgc29ydCBpbiBhc2Mgb3JkZXIuXG4gICAgICAjXG5cbiAgICAgIGNvbHVtbi5hZGRDbGFzcygnYXNjJylcbiAgICAgIGNvbHVtbi5kYXRhKCdvcmlnaW4nLCByb3dzLnNsaWNlKDApKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5hZGRDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAtMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG5cbiAgICBpZiAobWFrZVNvcnQpIHRoZW4gcm93cy5zb3J0IHNvcnRGdW5jdGlvblxuICAgICQuZWFjaCByb3dzLCAoaW5kZXgsIHJvdykgLT5cbiAgICAgICAgJCh0YWJsZSkuY2hpbGRyZW4oJ3Rib2R5JykuYXBwZW5kKHJvdylcbiAgICAkKHRhYmxlKS5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQobGFzdFJvdylcblxuaW5pdFRhYmxlSGFuZGxlcnMgPSAocGVyc29uLCBjYXRlZ29yaWVzLCBlbGVjdGVkT2ZmaWNpYWxzKSAtPlxuICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKClcblxuICAgICQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKHtzdHlsZXNoZWV0czogZmFsc2UsdHlwZTogJ3RleHRhcmVhJywgc2hvd2J1dHRvbnM6ICdib3R0b20nLCBkaXNwbGF5OiB0cnVlLCBlbXB0eXRleHQ6ICcgJ30pXG4gICAgJCgnLmVkaXRhYmxlJykub2ZmKCdjbGljaycpO1xuXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmdseXBoaWNvbi1wZW5jaWwnLCAoZSkgLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5ub0VkaXRhYmxlIGlzbnQgdW5kZWZpbmVkIHRoZW4gcmV0dXJuXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3RhYmxlVHlwZScsICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50YWItcGFuZScpWzBdLmlkKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdkYXRhSWQnLCAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKS5hdHRyKCdkYXRhLWlkJykpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2ZpZWxkJywgTnVtYmVyKCgkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKSlbMF0uY2VsbEluZGV4KSArIDEpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpLmZpbmQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcblxuICAgICNcbiAgICAjIEFkZCBzb3J0IGhhbmRsZXJzLlxuICAgICNcbiAgICAkKCcuc29ydCcpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICB0eXBlID0gJCh0aGlzKS5hdHRyKCdkYXRhLXNvcnQtdHlwZScpXG5cbiAgICAgIGlmIHR5cGUgaXMgJ3llYXInXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IHllYXIuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDApXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ25hbWUnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IG5hbWUuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDEpXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ2Ftb3VudCdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgYW1vdW50LlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAzKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdjb250cmlidXRvci10eXBlJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBjb250cmlidXRvciB0eXBlLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCA0KVxuXG4gICAgJCgnYScpLm9uICdzYXZlJywgKGUsIHBhcmFtcykgLT5cbiAgICAgICAgZW50aXR5VHlwZSA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0YWJsZScpWzBdLmRhdGFzZXQuZW50aXR5VHlwZVxuICAgICAgICBpZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpWzBdLmRhdGFzZXQuaWRcbiAgICAgICAgZmllbGQgPSBPYmplY3Qua2V5cygkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKVswXS5kYXRhc2V0KVswXVxuXG4gICAgICAgIGlmIGZpZWxkIGlzICd2b3RlJyBvciBmaWVsZCBpcyAnZGlkRWxlY3RlZE9mZmljaWFsUHJvcG9zZVRoaXMnXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgICBDdXJyZW50IGZpZWxkIG93bmVkIGJ5IEVsZWN0ZWRPZmZpY2lhbFZvdGVcbiAgICAgICAgICAjIyNcbiAgICAgICAgICBlbnRpdHlUeXBlID0gJ0VsZWN0ZWRPZmZpY2lhbFZvdGUnXG4gICAgICAgICAgaWQgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50KCkuZmluZCgnc3BhbicpWzBdLmRhdGFzZXQuaWRcblxuICAgICAgICBzZW5kT2JqZWN0ID0ge1xuICAgICAgICAgICAgZWRpdFJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGVudGl0eUlkOiBpZCxcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nIHNlbmRPYmplY3RcbiAgICAgICAgc2VuZE9iamVjdC5lZGl0UmVxdWVzdC5jaGFuZ2VzW2ZpZWxkXSA9IHBhcmFtcy5uZXdWYWx1ZVxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0ID0gSlNPTi5zdHJpbmdpZnkoc2VuZE9iamVjdC5lZGl0UmVxdWVzdCk7XG4gICAgICAgICQuYWpheCAnL2VkaXRyZXF1ZXN0L2NyZWF0ZScsIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAndGV4dC9qc29uJyxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICB0ZXh0ID0gSlNPTi5wYXJzZShyZXNwb25zZS5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDEgdGhlbiBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgIH1cblxuICAgICQoJ3RhYmxlJykub24gJ2NsaWNrJywgJy5hZGQnLCAoZSkgLT5cbiAgICAgICAgdGFiUGFuZSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy50YWItcGFuZScpXG4gICAgICAgIHRhYmxlVHlwZSA9IHRhYlBhbmVbMF0uaWRcbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSAndGFibGVUeXBlJywgdGFibGVUeXBlXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGN1cnJlbnRFbnRpdHkgPSBudWxsXG4gICAgICAgIGNvbnNvbGUubG9nKHRhYmxlVHlwZSlcbiAgICAgICAgaWYgdGFibGVUeXBlIGlzICdWb3RlcydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnTGVnaXNsYXRpb24nXG4gICAgICAgICAgICAkKCcjYWRkVm90ZXMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0NvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0NvbnRyaWJ1dGlvbidcbiAgICAgICAgICAgICQoJyNhZGRDb250cmlidXRpb25zJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0VuZG9yc2VtZW50J1xuICAgICAgICAgICAgJCgnI2FkZEVuZG9yc2VtZW50cycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnU3RhdGVtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnUHVibGljU3RhdGVtZW50J1xuICAgICAgICAgICAgJCgnI2FkZFN0YXRlbWVudHMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBTZXQgZ2V0IHVybCBjYWxsYmFjay5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgJCgnLnVybC1pbnB1dCcpLm9uICdrZXl1cCcsICgpIC0+XG4gICAgICAgICAgICAgIG1hdGNoX3VybCA9IC9cXGIoaHR0cHM/KTpcXC9cXC8oW1xcLUEtWjAtOS5dKykoXFwvW1xcLUEtWjAtOSsmQCNcXC8lPX5ffCE6LC47XSopPyhcXD9bQS1aMC05KyZAI1xcLyU9fl98ITosLjtdKik/L2lcbiAgICAgICAgICAgICAgaWYgKG1hdGNoX3VybC50ZXN0KCQodGhpcykudmFsKCkpKVxuICAgICAgICAgICAgICAgICQuYWpheCAnL2FwaS91cmwvZXh0cmFjdCcsIHtcbiAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogJCh0aGlzKS52YWwoKS5tYXRjaChtYXRjaF91cmwpWzBdXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQgPSAkKCcjdXJsLXN0YXRlbWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIENsZWFyLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsICcnKVxuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBTZXQgdGl0bGUuXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dChyZXNwb25zZS5kYXRhLnRpdGxlKVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlIGlzICdodG1sJylcbiAgICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICAgIyBJZiB1cmwgcG9pbnQgdG8gaHRtbCwgaGlkZSBpbWcgYW5kIHNldCBib2R5LlxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KHJlc3BvbnNlLmRhdGEuYm9keSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ3lvdXR1YmUnKVxuICAgICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgICAjIElmIHVybCBwb2ludCB0byB5b3V0dWJlLCBzaG93IHlvdXR1YmUgcHJldmlldyBpbWFnZS5cbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhLnByZXZpZXcpXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlIGlzICdpbWFnZScpXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YS5wcmV2aWV3KVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LnNsaWRlRG93bigpXG4gICAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50ID0gJCgnI3VybC1zdGF0ZW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBDbGVhci5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCAnJylcblxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dChlcnJvci5yZXNwb25zZVRleHQpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuc2xpZGVEb3duKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgIGluc2VydENhdGVnb3JpZXMgPSAoc2VsZWN0KSAtPlxuICAgICAgICAgIGVuZE9iaiA9IHt9XG4gICAgICAgICAgY2F0ZWdvcmllcy5mb3JFYWNoIChpdGVtKSAtPlxuICAgICAgICAgICAgZW5kT2JqW2l0ZW0uaWRdID0gaXRlbS5uYW1lXG4gICAgICAgICAgc2VsZWN0LnNldEF0dHJpYnV0ZSgnbmFtZScsICdpc3N1ZUNhdGVnb3J5JylcbiAgICAgICAgICAjIEFkZCBmaXJzdCBibGFuayBvcHRpb24uXG4gICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKVxuICAgICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9ICcnXG4gICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MXG4gICAgICAgICAgZm9yIGtleSBvZiBlbmRPYmpcbiAgICAgICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBrZXkpXG4gICAgICAgICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGVuZE9ialtrZXldXG4gICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgKz0gb3B0aW9uLm91dGVySFRNTFxuXG4gICAgICAgIGlmIHRhYlBhbmUuaGFzQ2xhc3MoJ2xvYWRlZCcpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgIHRhYlBhbmVbMF0uY2xhc3NMaXN0LmFkZCgnbG9hZGVkJylcblxuICAgICAgICBpZiBjdXJyZW50RW50aXR5IGlzICdFbmRvcnNlbWVudCdcblxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0NvbnRyaWJ1dGlvbidcblxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygkKCcjYWRkVm90ZXMgc2VsZWN0JylbMF0pXG4gICAgICAgICAgICAkKCcjYWRkVm90ZXMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAnY2hhbmdlRGF0ZScsXG4gICAgICAgICAgICAgICgpIC0+XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBGaWxsIGVsZWN0ZWQgb2ZmaWNpYWxzIHZvdGVzIHRhYmxlLlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjbGVnaXNsYXRpb24tdm90ZScpLmh0bWwoKSlcbiAgICAgICAgICAgICQoJyNlbGVjdGVkVm90ZXMnKS5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZWxlY3RlZE9mZmljaWFscyk7XG5cbiAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdQdWJsaWNTdGF0ZW1lbnQnXG4gICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKCQoJyNhZGRTdGF0ZW1lbnRzIHNlbGVjdCcpWzBdKVxuICAgICAgICAgICAgJCgnI2FkZFN0YXRlbWVudHMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAnY2hhbmdlRGF0ZScsXG4gICAgICAgICAgICAgICgpIC0+XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgKVxuXG4gICAgd2luZG93LmFkZEl0ZW0gPSAoZSkgLT5cbiAgICAgICAgbmV3UmVjb3JkID0ge31cbiAgICAgICAgbW9kYWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKVxuICAgICAgICBtb2RhbFR5cGUgPSBtb2RhbFswXS5pZFxuICAgICAgICBlbnRpdHlUeXBlID0gbW9kYWxbMF0uZGF0YXNldC5lbnRpdHlUeXBlXG4gICAgICAgIGNvbnNvbGUubG9nKGVudGl0eVR5cGUpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkcy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICAjIyNcbiAgICAgICAgICBHZXQgdmFsdWUgZnJvbSB0ZXhhcmVhJ3MuXG4gICAgICAgICMjI1xuICAgICAgICBtb2RhbC5maW5kKCd0ZXh0YXJlYScpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgbmV3UmVjb3JkW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgYXNzb2NpYXRpb25zID0ge31cbiAgICAgICAgaWYgbW9kYWxUeXBlICE9ICdhZGRWb3RlcydcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tcImVsZWN0ZWRPZmZpY2lhbFwiXSA9IHBlcnNvbi5pZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbXCJnb3Zlcm5tZW50XCJdID0gcGVyc29uLmdvdmVybm1lbnQuaWRcbiAgICAgICAgI1xuICAgICAgICAjIEFycmF5IG9mIHN1YiBlbnRpdGllcy5cbiAgICAgICAgI1xuICAgICAgICBjaGlsZHMgPSBbXVxuXG4gICAgICAgIGlmIG1vZGFsVHlwZSBpcyAnYWRkVm90ZXMnXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBBZGQgaW5mb3JtYXRpb24gYWJvdXQgdm90ZXMuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIG1vZGFsLmZpbmQoJyNlbGVjdGVkVm90ZXMnKS5maW5kKCd0cltkYXRhLWVsZWN0ZWRdJykuIGVhY2ggKGlkeCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChlbGVtZW50KVxuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICMgR2V0IGFsbCBzdWIgZW50aXR5IGZpZWxkcy5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cblxuICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnc2VsZWN0JykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVsZW1lbnQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgQWRkIG9ubHkgaWYgYWxsIGZpZWxkcyBpcyBzZXQuXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgaWYgT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID09IDJcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNbJ2ZpZWxkcyddID0gZGF0YVxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNbJ2Fzc29jaWF0aW9ucyddID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNbJ2Fzc29jaWF0aW9ucyddW2VsZW1lbnQuYXR0cignZGF0YS1lbnRpdHktdHlwZScpXSA9IGVsZW1lbnQuYXR0cignZGF0YS1lbGVjdGVkJylcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRFbnRpdHlOYW1lID0gZWxlbWVudC5wYXJlbnQoKS5wYXJlbnQoKS5hdHRyICdkYXRhLWVudGl0eS10eXBlJ1xuICAgICAgICAgICAgICAgICAgICBjaGlsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoaWxkIHR5cGUuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBjaGlsZEVudGl0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hpbGQgZmllbGRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRzOiBmaWVsZHNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGNhdGVnb3J5LicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCB0eXBlLicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KClcbiAgICAgICAgICAgIG5ld1JlY29yZFtzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcblxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCB0eXBlLicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KClcbiAgICAgICAgICAgIG5ld1JlY29yZFtzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcblxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkU3RhdGVtZW50cydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgY2F0ZWdvcnkuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKTtcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcblxuICAgICAgICBzZW5kT2JqZWN0ID0ge1xuICAgICAgICAgICAgY3JlYXRlUmVxdWVzdDoge1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXG4gICAgICAgICAgICAgICAgZmllbGRzOiB7IGZpZWxkczogbmV3UmVjb3JkLCBhc3NvY2lhdGlvbnM6IGFzc29jaWF0aW9ucywgY2hpbGRzOiBjaGlsZHN9LFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgQXBwZW5kIG5ldyBlbnRpdHkgdG8gdGFibGUuXG4gICAgICAgICMjI1xuICAgICAgICByb3dUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKFwiI3Jvdy0je21vZGFsVHlwZX1cIikuaHRtbCgpKTtcblxuICAgICAgICAjXG4gICAgICAgICMgQ29sbGVjdCBkYXRhLlxuICAgICAgICAjXG4gICAgICAgIGRhdGEgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHNlbmRPYmplY3QuY3JlYXRlUmVxdWVzdC5maWVsZHMuZmllbGRzXG4gICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgZGF0YVsndXNlciddID0gdXNlci51c2VybmFtZVxuXG4gICAgICAgIGNvbnNvbGUubG9nIHBlcnNvblxuXG4gICAgICAgIGlmIG1vZGFsVHlwZSBpcyAnYWRkVm90ZXMnXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgQ2hlY2sgaWYgdXNlciBzcGVjaWZpZWQgaG93IGN1cnJlbnQgZWxlY3RlZCBvZmZpY2lhbCB2b3RlZC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgYWRkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3Igb2JqIGluIHNlbmRPYmplY3QuY3JlYXRlUmVxdWVzdC5maWVsZHMuY2hpbGRzXG4gICAgICAgICAgICAgIGlmIE51bWJlcihvYmouZmllbGRzLmFzc29jaWF0aW9ucy5lbGVjdGVkT2ZmaWNpYWwpID09IE51bWJlcihwZXJzb24uaWQpXG4gICAgICAgICAgICAgICAgYWRkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIG9iai5maWVsZHMuZmllbGRzXG4gICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgSWYgd2UgZm91bmQsIHNob3cuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBpZiAoYWRkKVxuICAgICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAgICQoJyNWb3RlcyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBkYXRhLmNvbnRyaWJ1dG9yVHlwZSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgZGF0YS5jb250cmlidXRpb25BbW91bnQgPSBudW1lcmFsKGRhdGEuY29udHJpYnV0aW9uQW1vdW50KS5mb3JtYXQoJzAsMDAwJylcbiAgICAgICAgICAgICQoJyNDb250cmlidXRpb25zIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSk7XG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBkYXRhLmVuZG9yc2VyVHlwZSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgJCgnI0VuZG9yc2VtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkU3RhdGVtZW50cydcbiAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICQoJyNTdGF0ZW1lbnRzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgU2VuZCBjcmVhdGUgcmVxdWVzdCB0byBhcGkuXG4gICAgICAgICMjI1xuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2NyZWF0ZXJlcXVlc3QvY3JlYXRlJyxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqZWN0LFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICMgQ2xvc2UgbW9kYWwgd2luZG93XG4gICAgICAgIG1vZGFsLm1vZGFsICdoaWRlJ1xuXG4gICAgIyMjXG4gICAgICAgIElmIHVzZXIgdHJ5IHRvIGFkZCBvciB1cGRhdGUgc29tZSBkYXRhIHdpdGhvdXQgbG9nZ2VkIGluLCB3ZVxuICAgICAgICBzaG93IGhpbSBsb2dpbi9zaWduIHVwIHdpbmRvdy4gQWZ0ZXIgYXV0aG9yaXppbmcgdXNlciByZWRpcmVjdCBiYWNrXG4gICAgICAgIHRvIHBhZ2UsIHdoZXJlIGhlIHByZXMgYWRkL2VkaXQgYnV0dG9uLiBJbiB0aGF0IGNhc2Ugd2Ugc2hvdyBoaW0gYXBwcm9wcmlhdGVcbiAgICAgICAgbW9kYWwgd2luZG93LlxuICAgICMjI1xuICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgIHJldHVyblxuXG4gICAgdHlwZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd0YWJsZVR5cGUnKVxuICAgIGRhdGFJZCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdkYXRhSWQnKVxuICAgIGZpZWxkID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2ZpZWxkJylcblxuICAgIGlmIChkYXRhSWQgJiYgZmllbGQpXG4gICAgICAkKCdhW2FyaWEtY29udHJvbHM9XCInICsgdHlwZSArICdcIl0nKS5jbGljaygpXG4gICAgICAkKCd0cltkYXRhLWlkPScrZGF0YUlkKyddJykuZmluZCgndGQ6bnRoLWNoaWxkKCcrZmllbGQrJyknKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJycpXG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZGF0YUlkJywgJycpXG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCAnJylcblxuICAgIGVsc2UgaWYgKHR5cGUpXG4gICAgICAkKCdkaXYjJyArIHR5cGUpLmZpbmQoJy5hZGQnKS5jbGljaygpXG4gICAgICAkKCdhW2FyaWEtY29udHJvbHM9XCInICsgdHlwZSArICdcIl0nKS5jbGljaygpXG4gICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJycpXG5cblxuIyMjXG4gIEFwcGVuZCBjcmVhdGUgcmVxdWVzdHMgdG8gYWxsIGN1cnJlbnQgZWxlY3RlZE9mZmljaWFsIHBhZ2UuXG4jIyNcbnNob3dDcmVhdGVSZXF1ZXN0cyA9IChwZXJzb24sIGNyZWF0ZVJlcXVlc3RzKSAtPlxuICAgICMgRG9uJ3Qgc2hvdyBub3QgYXBwcm92ZWQgY3JlYXRlIHJlcXVlc3QgdG8gYW5vbi5cbiAgICBpZiAoIWF1dGhvcml6ZWQpIHRoZW4gcmV0dXJuXG5cbiAgICBsZWdpc2xhdGlvblJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZFZvdGVzJykuaHRtbCgpKVxuICAgIGNvbnRyaWJ1dGlvblJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZENvbnRyaWJ1dGlvbnMnKS5odG1sKCkpXG4gICAgZW5kb3JzZW1lbnRSb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRFbmRvcnNlbWVudHMnKS5odG1sKCkpXG4gICAgc3RhdGVtZW50Um93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkU3RhdGVtZW50cycpLmh0bWwoKSlcblxuICAgIGZvciByZXF1ZXN0IGluIGNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICNcbiAgICAgICAgIyBQcmVwYXJlIGNyZWF0ZSByZXF1ZXN0IGRhdGEgZm9yIHRlbXBsYXRlLlxuICAgICAgICAjXG4gICAgICAgIGRhdGEgPSByZXF1ZXN0LmZpZWxkcy5maWVsZHNcbiAgICAgICAgZGF0YVsndXNlciddID0gcmVxdWVzdC51c2VyLnVzZXJuYW1lXG5cbiAgICAgICAgI1xuICAgICAgICAjIEZpbmQgb3V0IHRlbXBsYXRlIGZvciBjdXJyZW50IHJlcXVlc3QgYW5kIGFkZGl0aW9uYWwgdmFsdWVzLlxuICAgICAgICAjXG4gICAgICAgIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJMZWdpc2xhdGlvblwiXG4gICAgICAgICAgICBuYW1lID0gJ1ZvdGVzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdpc2xhdGlvblJvd1xuICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmVxdWVzdC5maWVsZHMuY2hpbGRzWzBdLmZpZWxkcy5maWVsZHNcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IGNhdGVnb3JpZXNbcmVxdWVzdC5maWVsZHMuYXNzb2NpYXRpb25zLmlzc3VlQ2F0ZWdvcnkgLSAxXS5uYW1lXG5cbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiQ29udHJpYnV0aW9uXCJcbiAgICAgICAgICAgIG5hbWUgPSAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gY29udHJpYnV0aW9uUm93XG5cbiAgICAgICAgICAgIGRhdGFbJ2NvbnRyaWJ1dGlvbkFtb3VudCddID0gbnVtZXJhbChkYXRhWydjb250cmlidXRpb25BbW91bnQnXSkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkVuZG9yc2VtZW50XCJcbiAgICAgICAgICAgIG5hbWUgPSAnRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBlbmRvcnNlbWVudFJvd1xuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJQdWJsaWNTdGF0ZW1lbnRcIlxuICAgICAgICAgICAgbmFtZSA9ICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBzdGF0ZW1lbnRSb3dcblxuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IGNhdGVnb3JpZXNbcmVxdWVzdC5maWVsZHMuYXNzb2NpYXRpb25zLmlzc3VlQ2F0ZWdvcnkgLSAxXS5uYW1lXG5cbiAgICAgICAgJChcIlxcIyN7bmFtZX0gdHI6bGFzdC1jaGlsZFwiKS5iZWZvcmUodGVtcGxhdGUoZGF0YSkpXG5cblxuJCgnI2RhdGFDb250YWluZXInKS5wb3BvdmVyKHtcbiAgICBwbGFjZW1lbnQ6ICdib3R0b20nXG4gICAgc2VsZWN0b3I6ICcucmFuaydcbiAgICBhbmltYXRpb246IHRydWVcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCIgcm9sZT1cInRvb2x0aXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3BvdmVyLXRpdGxlLWN1c3RvbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicG9wb3Zlci1jb250ZW50XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+J1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2lmX2VxJywgKGEsIGIsIG9wdHMpIC0+XG4gICAgaWYoYSA9PSBiKVxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnY29uY2F0JywgKHBhcmFtMSwgcGFyYW0yKSAtPlxuICAgIHRlbXAgPSBbcGFyYW0xLCBwYXJhbTJdXG4gICAgcmV0dXJuIHRlbXAuam9pbignJylcblxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAkZWxlbWVudCA9ICQoZS50YXJnZXQpO1xuICAgIHBvcG92ZXJDb250ZW50ID0gJGVsZW1lbnQucGFyZW50KCkuZmluZCgnLnBvcG92ZXItY29udGVudCcpXG4gICAgZmllbGROYW1lID0gJGVsZW1lbnQuYXR0cignZGF0YS1maWVsZCcpXG4gICAgbWFzayA9ICRlbGVtZW50LmF0dHIoJ2RhdGEtbWFzaycpXG4gICAgcG9wb3ZlclRwbCA9ICQoJyNyYW5rUG9wb3ZlcicpLmh0bWwoKVxuICAgIGFkZGl0aW9uYWxSb3dzVHBsID0gJCgnI2FkZGl0aW9uYWxSb3dzJykuaHRtbCgpXG4gICAgcHJlbG9hZGVyID0gcG9wb3ZlckNvbnRlbnQuZmluZCgnbG9hZGVyJylcblxuICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gMDtcbiAgICBjdXJyZW50UGFnZSA9IDA7XG4gICAgbG9hZGluZyA9IGZhbHNlO1xuICAgIHBvcG92ZXJPcmRlciA9IG51bGw7XG4gICAgcG9wb3Zlck5hbWVPcmRlciA9IG51bGw7XG5cbiAgICAjIENsb3NlIGFsbCBvdGhlciBwb3BvdmVyc1xuICAgIGlmICEkZWxlbWVudC5jbG9zZXN0KCcucG9wb3ZlcicpWzBdXG4gICAgICAgICQoJy5yYW5rJykubm90KGUudGFyZ2V0KS5wb3BvdmVyKCdkZXN0cm95JylcblxuICAgIGZvcm1hdERhdGEgPSAoZGF0YSkgLT5cbiAgICAgICAgaWYgbWFza1xuICAgICAgICAgICAgZGF0YS5kYXRhLmZvckVhY2ggKHJhbmspIC0+XG4gICAgICAgICAgICAgICAgcmFuay5hbW91bnQgPSBudW1lcmFsKHJhbmsuYW1vdW50KS5mb3JtYXQobWFzaylcblxuICAgIGxvYWROZXdSb3dzID0gKCkgLT5cbiAgICAgICAgbG9hZGluZyA9IHRydWU7XG4gICAgICAgIHByZWxvYWRlci5zaG93KClcbiAgICAgICAgdGFibGUgPSBwb3BvdmVyQ29udGVudC5maW5kKCd0YWJsZSB0Ym9keScpXG4gICAgICAgIHRhYmxlLmh0bWwgJydcbiAgICAgICAgY3VycmVudFBhZ2UgPSAwXG4gICAgICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gMFxuICAgICAgICBmaWVsZE5hbWVJbkNhbWVsQ2FzZSA9IGZpZWxkTmFtZS5yZXBsYWNlIC9fKFthLXowLTldKS9nLCAoZykgLT4gcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKycvZ2V0X3JhbmtzJ1xuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgcGFnZTogY3VycmVudFBhZ2VcbiAgICAgICAgICAgICAgICBvcmRlcjogcG9wb3Zlck9yZGVyXG4gICAgICAgICAgICAgICAgbmFtZV9vcmRlcjogcG9wb3Zlck5hbWVPcmRlclxuICAgICAgICAgICAgICAgIGZpZWxkX25hbWU6IGZpZWxkTmFtZUluQ2FtZWxDYXNlICMgVHJhbnNmb3JtIHRvIGNhbWVsQ2FzZVxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgZm9ybWF0RGF0YShkYXRhKVxuICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoYWRkaXRpb25hbFJvd3NUcGwpXG4gICAgICAgICAgICAgICAgdGFibGUuaHRtbCBjb21waWxlZFRlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHByZWxvYWRlci5oaWRlKClcblxuICAgICMgU29ydCB0YWJsZSBpbiBwb3BvdmVyXG4gICAgcG9wb3ZlckNvbnRlbnQub24gJ2NsaWNrJywgJ3RoJywgKGUpIC0+XG4gICAgICAgICRjb2x1bW4gPSBgJChlLnRhcmdldCkuaGFzQ2xhc3MoJ3NvcnRhYmxlJykgPyAkKGUudGFyZ2V0KSA6ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ3RoJyk7YFxuICAgICAgICBpZiAkY29sdW1uLmhhc0NsYXNzKCdzb3J0YWJsZScpXG4gICAgICAgICAgICBpZiAkY29sdW1uLmhhc0NsYXNzKCdkZXNjJylcbiAgICAgICAgICAgICAgICBpZiAkY29sdW1uLmF0dHIoJ2RhdGEtc29ydC10eXBlJykgaXMgJ25hbWVfb3JkZXInXG4gICAgICAgICAgICAgICAgICAgIHBvcG92ZXJOYW1lT3JkZXIgPSAnJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcG9wb3Zlck9yZGVyID0gJydcbiAgICAgICAgICAgICAgICBsb2FkTmV3Um93cygpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5yZW1vdmVDbGFzcygnZGVzYycpLnJlbW92ZUNsYXNzKCdhc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKS5yZW1vdmVDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgICAgICAgIGVsc2UgaWYgJGNvbHVtbi5oYXNDbGFzcygnYXNjJylcbiAgICAgICAgICAgICAgICBpZiAkY29sdW1uLmF0dHIoJ2RhdGEtc29ydC10eXBlJykgaXMgJ25hbWVfb3JkZXInXG4gICAgICAgICAgICAgICAgICAgIHBvcG92ZXJOYW1lT3JkZXIgPSAnZGVzYydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHBvcG92ZXJPcmRlciA9ICdkZXNjJ1xuICAgICAgICAgICAgICAgIGxvYWROZXdSb3dzKClcbiAgICAgICAgICAgICAgICAkY29sdW1uLnJlbW92ZUNsYXNzKCdhc2MnKS5hZGRDbGFzcygnZGVzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmICRjb2x1bW4uYXR0cignZGF0YS1zb3J0LXR5cGUnKSBpcyAnbmFtZV9vcmRlcidcbiAgICAgICAgICAgICAgICAgICAgcG9wb3Zlck5hbWVPcmRlciA9ICdhc2MnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwb3BvdmVyT3JkZXIgPSAnYXNjJ1xuICAgICAgICAgICAgICAgIGxvYWROZXdSb3dzKClcbiAgICAgICAgICAgICAgICAkY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX190b3AnKVxuXG4gICAgIyBSZW5kZXIgdGFibGUgYW5kIGluc2VydCBpbnRvIHBvcG92ZXItY29udGVudFxuICAgIGlmIGZpZWxkTmFtZVxuICAgICAgICBmaWVsZE5hbWVJbkNhbWVsQ2FzZSA9IGZpZWxkTmFtZS5yZXBsYWNlIC9fKFthLXowLTldKS9nLCAoZykgLT4gcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKycvZ2V0X3JhbmtzJ1xuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgZmllbGRfbmFtZTogZmllbGROYW1lSW5DYW1lbENhc2UgIyBUcmFuc2Zvcm0gdG8gY2FtZWxDYXNlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBmb3JtYXREYXRhKGRhdGEpXG4gICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZShwb3BvdmVyVHBsKVxuICAgICAgICAgICAgICAgIHBvcG92ZXJDb250ZW50Lmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKVxuXG4gICAgIyBMYXp5IGxvYWQgZm9yIHBvcG92ZXJcbiAgICBwb3BvdmVyQ29udGVudC5zY3JvbGwgKCkgLT5cbiAgICAgIGN1cnJlbnRTY3JvbGxUb3AgPSBwb3BvdmVyQ29udGVudC5zY3JvbGxUb3AoKVxuICAgICAgaWYgIHByZXZpb3VzU2Nyb2xsVG9wIDwgY3VycmVudFNjcm9sbFRvcCAmJiBjdXJyZW50U2Nyb2xsVG9wID4gMC41ICogcG9wb3ZlckNvbnRlbnRbMF0uc2Nyb2xsSGVpZ2h0XG4gICAgICAgIGNvbnNvbGUubG9nKCdhc2Rhc2QnKTtcbiAgICAgICAgcHJldmlvdXNTY3JvbGxUb3AgPSBjdXJyZW50U2Nyb2xsVG9wXG4gICAgICAgIGlmIGxvYWRpbmcgaXMgZmFsc2VcbiAgICAgICAgICBsb2FkaW5nID0gdHJ1ZVxuICAgICAgICAgIHByZWxvYWRlci5zaG93KCk7XG4gICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyAnL2dldF9yYW5rcydcbiAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgZGF0YTpcbiAgICAgICAgICAgICAgICAgIHBhZ2U6ICsrY3VycmVudFBhZ2VcbiAgICAgICAgICAgICAgICAgIG9yZGVyOiBwb3BvdmVyT3JkZXJcbiAgICAgICAgICAgICAgICAgIG5hbWVfb3JkZXI6IHBvcG92ZXJOYW1lT3JkZXJcbiAgICAgICAgICAgICAgICAgIGZpZWxkX25hbWU6IGZpZWxkTmFtZUluQ2FtZWxDYXNlICMgVHJhbnNmb3JtIHRvIGNhbWVsQ2FzZVxuICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgIGZvcm1hdERhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICAgIGxvYWRpbmcgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgcHJlbG9hZGVyLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZShhZGRpdGlvbmFsUm93c1RwbClcbiAgICAgICAgICAgICAgICAgIHBvcG92ZXJDb250ZW50LmZpbmQoJ3RhYmxlIHRib2R5JylbMF0uaW5uZXJIVE1MICs9IGNvbXBpbGVkVGVtcGxhdGUoZGF0YSlcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAnLmVsZWN0ZWRfbGluaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB1cmwgPSBlLmN1cnJlbnRUYXJnZXQucGF0aG5hbWVcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgICAgICAgICAgcGVyc29uID0gZGF0YS5wZXJzb25cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUmVxdWVzdHMgPSBkYXRhLmNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLmNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLmdvdl9hbHRfbmFtZSA9IHBlcnNvbi5nb3Zlcm5tZW50LnNsdWcucmVwbGFjZSgvXy9nLCAnICcpXG5cbiAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICAgICAgRm9ybWF0IGNvbnRyaWJ1dGlvbiBhbW91bnQuXG4gICAgICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgICBmb3IgY29udHJpYnV0aW9uIGluIHBlcnNvbi5jb250cmlidXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCA9IG51bWVyYWwoY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQpLmZvcm1hdCgnMCwwMDAnKVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuICAgICAgICAgICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQsICdZWVlZLU1NLUREJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUuZm9ybWF0ICdMJ1xuXG4gICAgICAgICAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBodG1sfSwgJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uLCBjYXRlZ29yaWVzLCBkYXRhLmVsZWN0ZWRPZmZpY2lhbHMpO1xuICAgICAgICAgICAgICAgICAgICBzaG93Q3JlYXRlUmVxdWVzdHMocGVyc29uLCBjcmVhdGVSZXF1ZXN0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuICAgICAgICAgICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuRElTUVVTV0lER0VUUy5nZXRDb3VudCgpXG5cbiAgICAgICAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG4jIFJvdXRlIC9cbmlmIHJvdXRlVHlwZSBpcyAwXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJy9sZWdhY3kvZGF0YS9oX3R5cGVzX2NhXzIuanNvbicsIDdcbiAgICBnb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgdXJsID0gJy8nICsgZGF0YS5hbHRUeXBlU2x1ZyArICcvJyArIGRhdGEuc2x1Z1xuICAgICAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgICBpZiAhdW5kZWZcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwgJCgnI3NlYXJjaC1jb250YWluZXItdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgIyBMb2FkIGludHJvZHVjdG9yeSB0ZXh0IGZyb20gdGV4dHMvaW50cm8tdGV4dC5odG1sIHRvICNpbnRyby10ZXh0IGNvbnRhaW5lci5cbiAgICAgICAgIyQuZ2V0IFwiL2xlZ2FjeS90ZXh0cy9pbnRyby10ZXh0Lmh0bWxcIiwgKGRhdGEpIC0+ICQoXCIjaW50cm8tdGV4dFwiKS5odG1sIGRhdGFcbiAgICAgICAgIyQoXCIjaW50cm8tdGV4dFwiKS5odG1sICQoXCIjaW50cm9cIilcbiAgICAgICAgZ292bWFwID0gcmVxdWlyZSAnLi9nb3ZtYXAuY29mZmVlJ1xuICAgICAgICBnZXRfY291bnRpZXMgR09WV0lLSS5kcmF3X3BvbHlnb25zXG4gICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiAkKCcjc2VhcmNoQ29udGFpbmVyJykuaHRtbCgpfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvJ1xuICAgICAgICB1bmRlZiA9IHRydWVcbiAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuICAgIHN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGgoKVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkKCcjZ292bWFwJykub24gJ2NsaWNrJywgJy5pbmZvLXdpbmRvdy11cmknLCAoZSkgLT5cbiAgICAgICAgdXJpID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnVyaVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcblxuIyBSb3V0ZSAvcmFua19vcmRlclxuaWYgcm91dGVUeXBlIGlzIDFcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG5cbiAgICBvcmRlcmVkRmllbGRzID0gW11cblxuICAgICNcbiAgICAjIFNldCBzb3J0IGNhbGxiYWNrLlxuICAgICNcbiAgICAkKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnLnJhbmtfc29ydCcsIChlKSAtPlxuICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcblxuICAgICAgY29sdW1uID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICB0YWJQYW5lbCA9IGNvbHVtbi5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgZmllbGROYW1lID0gY29sdW1uLmF0dHIoJ2RhdGEtc29ydC10eXBlJylcbiAgICAgIGljb24gPSBjb2x1bW4uZmluZCgnaScpXG5cbiAgICAgIGlmIGljb24uaGFzQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gICAgICAgICNcbiAgICAgICAgaWNvbi5hZGRDbGFzcygnaWNvbl9fYm90dG9tJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICAgIG9yZGVyZWRGaWVsZHNbZmllbGROYW1lXSA9ICdkZXNjJ1xuICAgICAgZWxzZSBpZiBpY29uLmhhc0NsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgICAjXG4gICAgICAgICMgUmVtb3ZlIHNvcnQgYnkgdGhpcyBmaWVsZC5cbiAgICAgICAgI1xuICAgICAgICBpY29uLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgICBkZWxldGUgb3JkZXJlZEZpZWxkc1tmaWVsZE5hbWVdXG4gICAgICBlbHNlXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGluIGFzY2VuZGluZyBvcmRlci5cbiAgICAgICAgI1xuICAgICAgICBpY29uLmFkZENsYXNzKCdpY29uX190b3AnKVxuICAgICAgICBvcmRlcmVkRmllbGRzW2ZpZWxkTmFtZV0gPSAnYXNjJ1xuXG4gICAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvcmFua19vcmRlclwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICBhbHRfdHlwZTogdGFiUGFuZWwuYXR0cignaWQnKVxuICAgICAgICAgIGZpZWxkc19vcmRlcjogJC5leHRlbmQoe30sIG9yZGVyZWRGaWVsZHMpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuICAgICAgICAgICNcbiAgICAgICAgICAjIFVwZGF0ZSB0YWJsZVxuICAgICAgICAgICNcbiAgICAgICAgICB0YWJsZSA9IHRhYlBhbmVsLmZpbmQoJ3RhYmxlJylcbiAgICAgICAgICBoZWFkID0gdGFibGUuZmluZCgndHI6Zmlyc3QnKVxuXG4gICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpO1xuXG4gICAgICAgICAgI1xuICAgICAgICAgICMgUHVzaCB0ZW1wbGF0ZS5cbiAgICAgICAgICAjXG4gICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogJCgnI2RldGFpbHMnKS5odG1sKCl9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy9yYW5rX29yZGVyJ1xuXG4gICAgYWx0VHlwZXNEYXRhID0ge31cbiAgICBHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlID0gJ0NpdHknXG4gICAgR09WV0lLSS5jdXJyZW50QWx0VHlwZUxvd2VyQ2FzZSA9ICdjaXR5J1xuICAgIEdPVldJS0kuaXRlbXNQZXJQYWdlID0gMTA7XG4gICAgR09WV0lLSS5jdXJyZW50UGFnZSA9IDA7XG5cbiAgICBzZXRFdmVudHMgPSAoKSAtPlxuICAgICAgICAkKCdhW2RhdGEtdG9nZ2xlPVwidGFiXCJdJykub24gJ3Nob3duLmJzLnRhYicsIChlKSAtPlxuICAgICAgICAgICAgR09WV0lLSS5jdXJyZW50QWx0VHlwZSA9ICQoZS50YXJnZXQpLmF0dHIoXCJocmVmXCIpLnJlcGxhY2UoJyMnLCAnJylcbiAgICAgICAgICAgIEdPVldJS0kuY3VycmVudEFsdFR5cGVMb3dlckNhc2UgPSBHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIEdPVldJS0kuY3VycmVudFBhZ2UgPSAwO1xuICAgICAgICAgICAgcmVuZGVyUGFnaW5hdGlvbigpXG5cbiAgICAgICAgJCgnLnBhZ2luYXRpb24nKS5vbiAnY2xpY2snLCAnYScsIChlKSAtPlxuICAgICAgICAgICAgcGFnZSA9ICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtcGFnZScpXG4gICAgICAgICAgICBpZiBwYWdlIGlzbnQgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgR09WV0lLSS5jdXJyZW50UGFnZSA9IHBhcnNlSW50KHBhZ2UpLTFcbiAgICAgICAgICAgICAgICByZW5kZXJUZW1wbGF0ZShHT1ZXSUtJLmN1cnJlbnRQYWdlKVxuXG4gICAgcmVuZGVyUGFnaW5hdGlvbiA9ICgpIC0+XG4gICAgICAgICRwYWdpbmF0aW9uQ29udGFpbmVyID0gJCgnIycrR09WV0lLSS5jdXJyZW50QWx0VHlwZSsnIC5wYWdpbmF0aW9uJylcbiAgICAgICAgJHBhZ2luYXRpb25Db250YWluZXIuaHRtbCgnJylcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xzID0gJydcbiAgICAgICAgaWYgR09WV0lLSS5jdXJyZW50UGFnZSA+IDBcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXNcIiBvbmNsaWNrPVwiR09WV0lLSS5wcmV2UGFnZShldmVudClcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mbGFxdW87PC9zcGFuPjwvYT48L2xpPidcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBkYXRhLXBhZ2U9XCInK0dPVldJS0kuY3VycmVudFBhZ2UrJ1wiPicgKyAoR09WV0lLSS5jdXJyZW50UGFnZSkgKyAnPC9hPjwvbGk+J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaSBjbGFzcz1cImRpc2FibGVkXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZsYXF1bzs8L3NwYW4+PC9hPjwvbGk+J1xuXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpIGNsYXNzPVwiYWN0aXZlXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtcGFnZT1cIicrKEdPVldJS0kuY3VycmVudFBhZ2UrMSkrJ1wiPicgKyAoR09WV0lLSS5jdXJyZW50UGFnZSsxKSArICc8L2E+PC9saT4nXG5cbiAgICAgICAgaWYgR09WV0lLSS5jdXJyZW50UGFnZSBpcyBHT1ZXSUtJLmxhc3RQYWdlKClcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpIGNsYXNzPVwiZGlzYWJsZWRcIj48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgYXJpYS1sYWJlbD1cIk5leHRcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mcmFxdW87PC9zcGFuPjwvYT48L2xpPidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xzICs9ICc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtcGFnZT1cIicrKEdPVldJS0kuY3VycmVudFBhZ2UrMikrJ1wiPicgKyAoR09WV0lLSS5jdXJyZW50UGFnZSsyKSArICc8L2E+PC9saT4nXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgYXJpYS1sYWJlbD1cIk5leHRcIiBvbmNsaWNrPVwiR09WV0lLSS5uZXh0UGFnZShldmVudClcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mcmFxdW87PC9zcGFuPjwvYT48L2xpPidcbiAgICAgICAgJHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kKHBhZ2luYXRpb25Db250cm9scyk7XG5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvcmFua19vcmRlclwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICBhbHRUeXBlc0RhdGEgPSBkYXRhO1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBSZW5kZXIgcmFuayBvcmRlciB0ZW1wbGF0ZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHRwbCA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcmFuay1vcmRlci1wYWdlJykuaHRtbCgpKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRwbChhbHRUeXBlc0RhdGEpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpO1xuXG4gICAgICAgICAgICBzZXRFdmVudHMoKVxuICAgICAgICAgICAgcmVuZGVyUGFnaW5hdGlvbigpXG5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgUHVzaCB0ZW1wbGF0ZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuIyAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IHRwbH0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnL3Jhbmtfb3JkZXInXG5cbiAgICByZW5kZXJUZW1wbGF0ZSA9IChwYWdlKSAtPlxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogXCIvYXBpL3Jhbmtfb3JkZXJcIlxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgYWx0X3R5cGU6IEdPVldJS0kuY3VycmVudEFsdFR5cGVcbiAgICAgICAgICAgICAgICBwYWdlOiBwYWdlIHx8IEdPVldJS0kuY3VycmVudFBhZ2VcbiAgICAgICAgICAgICAgICBsaW1pdDogR09WV0lLSS5pdGVtc1BlclBhZ2VcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGFsdFR5cGVzRGF0YVtHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlTG93ZXJDYXNlXSA9IGRhdGFcblxuICAgICAgICAgICAgICAgIHRwbCA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjdGFibGUtJytHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlTG93ZXJDYXNlLnJlcGxhY2UoL18vLCAnLScpKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgJCgnIycrR09WV0lLSS5jdXJyZW50QWx0VHlwZSkuaHRtbCB0cGwoYWx0VHlwZXNEYXRhKVxuICAgICAgICAgICAgICAgIHNldEV2ZW50cygpXG4gICAgICAgICAgICAgICAgcmVuZGVyUGFnaW5hdGlvbigpXG5cbiAgICBHT1ZXSUtJLm5leHRQYWdlID0gKGUpIC0+XG4gICAgICAgICsrR09WV0lLSS5jdXJyZW50UGFnZVxuICAgICAgICByZW5kZXJUZW1wbGF0ZSgpXG5cblxuICAgIEdPVldJS0kucHJldlBhZ2UgPSAoZSkgLT5cbiAgICAgICAgLS1HT1ZXSUtJLmN1cnJlbnRQYWdlXG4gICAgICAgIHJlbmRlclRlbXBsYXRlKClcblxuXG4gICAgR09WV0lLSS5maXJzdFBhZ2UgPSAgKCkgLT5cbiAgICAgICAgcmV0dXJuIGBHT1ZXSUtJLmN1cnJlbnRQYWdlID09IDBgXG5cbiAgICBHT1ZXSUtJLmxhc3RQYWdlID0gICgpIC0+XG4gICAgICAgIGxhc3RQYWdlID0gTWF0aC5jZWlsKGFsdFR5cGVzRGF0YS5jb3VudCAvIEdPVldJS0kuaXRlbXNQZXJQYWdlIC0gMSlcbiAgICAgICAgcmV0dXJuIEdPVldJS0kuY3VycmVudFBhZ2UgPT0gbGFzdFBhZ2VcblxuICAgIEdPVldJS0kubnVtYmVyT2ZQYWdlcyA9ICgpIC0+XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwoYWx0VHlwZXNEYXRhLmNvdW50IC8gR09WV0lLSS5pdGVtc1BlclBhZ2UpXG4gICAgXG5cblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWVcbmlmIHJvdXRlVHlwZSBpcyAyXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIENpdmljIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJC5hamF4XG4jICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG5cbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICBydW4gPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBydW5cbiAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogcnVufSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHdpbmRvdy5wYXRoXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZS86ZWxlY3RlZF9uYW1lXG5pZiByb3V0ZVR5cGUgaXMgM1xuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiL2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cblxuICAgICAgICAgICAgcGVyc29uID0gZGF0YS5wZXJzb25cbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3RzID0gZGF0YS5jcmVhdGVSZXF1ZXN0c1xuICAgICAgICAgICAgY2F0ZWdvcmllcyA9IGRhdGEuY2F0ZWdvcmllc1xuICAgICAgICAgICAgcGVyc29uLmNhdGVnb3J5X3NlbGVjdCA9IFtdXG4gICAgICAgICAgICBwZXJzb24uZ292X2FsdF9uYW1lID0gcGVyc29uLmdvdmVybm1lbnQuc2x1Zy5yZXBsYWNlKC9fL2csICcgJylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIFByZXBhcmUgb3B0aW9ucyBmb3Igc2VsZWN0IGluIElzc3Vlc0NhdGVnb3J5IGVkaXQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QucHVzaCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGNhdGVnb3J5LmlkXG4gICAgICAgICAgICAgICAgdGV4dDogY2F0ZWdvcnkubmFtZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBwZXJzb24uY2F0ZWdvcnlfc2VsZWN0ID0gSlNPTi5zdHJpbmdpZnkocGVyc29uLmNhdGVnb3J5X3NlbGVjdCk7XG5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZm9yIGNvbnRyaWJ1dGlvbiBpbiBwZXJzb24uY29udHJpYnV0aW9uc1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50ID0gbnVtZXJhbChjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCkuZm9ybWF0KCcwLDAwMCcpXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHBlcnNvblxuXG4gICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiBwZXJzb24udm90ZXMgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkLCAnWVlZWS1NTS1ERCcpO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUuZm9ybWF0ICdMJ1xuXG4gICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcblxuICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuXG4gICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24sIGNhdGVnb3JpZXMsIGRhdGEuZWxlY3RlZE9mZmljaWFscyk7XG4gICAgICAgICAgICBzaG93Q3JlYXRlUmVxdWVzdHMocGVyc29uLCBjcmVhdGVSZXF1ZXN0cyk7XG5cbiAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXG4gICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xuICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuICAgICMjI1xuICAgICAgR2V0IGN1cnJlbnQgdXNlci5cbiAgICAjIyNcbiAgICAkdXNlckJ0biA9ICQoJyN1c2VyJylcbiAgICAkdXNlckJ0bkxpbmsgPSAkdXNlckJ0bi5maW5kKCdhJyk7XG4gICAgY29uc29sZS5sb2cgYXV0aG9yaXplZFxuICAgIGNvbnNvbGUubG9nIHVzZXJcbiAgICBjb25zb2xlLmxvZyB1c2VyLnVzZXJuYW1lXG5cbiAgICBpZiAoYXV0aG9yaXplZClcbiAgICAgICR1c2VyVGV4dCA9ICQoJyN1c2VyLXRleHQnKS5maW5kKCdhJyk7XG4gICAgICAkdXNlclRleHQuaHRtbChcIkxvZ2dlZCBpbiBhcyAje3VzZXIudXNlcm5hbWV9XCIgKyAkdXNlclRleHQuaHRtbCgpKVxuICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJTaWduIE91dFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSAnL2xvZ291dCdcbiAgICBlbHNlXG4gICAgICAkdXNlckJ0bkxpbmsuaHRtbChcIkxvZ2luIC8gU2lnbiBVcFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuXG4jICAgICQuYWpheCAnL2FwaS91c2VyJywge1xuIyAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuIyAgICAgICAgICBhc3luYzogZmFsc2UsXG4jICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiMgICAgICAgICAgICAgIHVzZXIudXNlcm5hbWUgPSByZXNwb25zZS51c2VybmFtZTtcbiMgICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlO1xuI1xuIyAgICAgICAgICAgICAgJHVzZXJUZXh0ID0gJCgnI3VzZXItdGV4dCcpLmZpbmQoJ2EnKTtcbiMgICAgICAgICAgICAgICR1c2VyVGV4dC5odG1sKFwiTG9nZ2VkIGluIGFzICN7dXNlci51c2VybmFtZX1cIiArICR1c2VyVGV4dC5odG1sKCkpXG4jICAgICAgICAgICAgICAkdXNlckJ0bkxpbmsuaHRtbChcIlNpZ24gT3V0XCIgKyAkdXNlckJ0bkxpbmsuaHRtbCgpKS5jbGljayAoKSAtPlxuIyAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvbG9nb3V0J1xuI1xuIyAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuIyAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIGF1dGhvcml6ZWQgPSBmYWxzZVxuIyAgICAgICAgICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJMb2dpbiAvIFNpZ24gVXBcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4jICAgICAgICAgICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuIyAgICAgIH0iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQudHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcblxuICAgICAgaWYgdGVzdF9zdHJpbmcoZC5uYW1lLCByZWdzKVxuICAgICAgICBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgICAjaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQubmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaScpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FU1xuZmllbGROYW1lcyA9IHt9XG5maWVsZE5hbWVzSGVscCA9IHt9XG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0gKG4sbWFzayxkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbm90IGRhdGFbbl1cbiAgICByZXR1cm4gJydcblxuICBpZiBuID09IFwid2ViX3NpdGVcIlxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXG4gIGVsc2VcbiAgICBpZiAnJyAhPSBtYXNrXG4gICAgICBpZiBkYXRhW24rJ19yYW5rJ10gYW5kIGRhdGEubWF4X3JhbmtzIGFuZCBkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXVxuICAgICAgICB2ID0gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcblxuICAgICAgICAjIEZpbmQgZGVzY3JpcHRpb24gZnJvbSBmdXNpb24gdGFibGVzLCBzZXQgaWYgZXhpc3RcbiAgICAgICAgdGl0bGUgPSAnTm8gdGl0bGUnXG4gICAgICAgIEdPVldJS0kuZnVzaW9uLnJvd3MuZm9yRWFjaCAocm93KSAtPiBpZiByb3dbMl0gaXMgbiB0aGVuIHRpdGxlID0gcm93WzNdXG5cbiAgICAgICAgcmV0dXJuIFwiI3t2fSA8YSBjbGFzcz0ncmFuaydcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWZpZWxkPScje259X3JhbmsnXG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU9JyN7dGl0bGV9IHJhbmtzJ1xuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtbWFzaz0nI3ttYXNrfScnPlxuICAgICAgICAgICAgICAgICAgICAgICgje2RhdGFbbisnX3JhbmsnXX0gb2YgI3tkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXX0pPC9hPlwiXG4gICAgICBpZiBuID09IFwibnVtYmVyX29mX2Z1bGxfdGltZV9lbXBsb3llZXNcIlxuICAgICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQoJzAsMCcpXG4gICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICBlbHNlXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZCBuID09IFwib3Blbl9lbnJvbGxtZW50X3NjaG9vbHNcIlxuICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGVsc2UgaWYgdi5sZW5ndGggPiAyMCBhbmQgbiA9PSBcInBhcmVudF90cmlnZ2VyX2VsaWdpYmxlX3NjaG9vbHNcIlxuICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgdi5sZW5ndGggPiAyMVxuICAgICAgICAgIHYgPSB2LnN1YnN0cmluZygwLCAyMSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJldHVybiB2XG5cblxucmVuZGVyX2ZpZWxkX25hbWVfaGVscCA9IChmTmFtZSkgLT5cbiAgI2lmIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuICAgIHJldHVybiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICBpZiBcIl9cIiA9PSBzdWJzdHIgZk5hbWUsIDAsIDFcbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4mbmJzcDs8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICByZXR1cm4gJycgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyAgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PGRpdj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG5yZW5kZXJfc3ViaGVhZGluZyA9IChmTmFtZSwgbWFzaywgbm90Rmlyc3QpLT5cbiAgcyA9ICcnXG4gIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZk5hbWVcbiAgaWYgbWFzayA9PSBcImhlYWRpbmdcIlxuICAgIGlmIG5vdEZpcnN0ICE9IDBcbiAgICAgIHMgKz0gXCI8YnIvPlwiXG4gICAgcyArPSBcIjxkaXY+PHNwYW4gY2xhc3M9J2YtbmFtJz4je2ZOYW1lfTwvc3Bhbj48c3BhbiBjbGFzcz0nZi12YWwnPiA8L3NwYW4+PC9kaXY+XCJcbiAgcmV0dXJuIHNcblxucmVuZGVyX2ZpZWxkcyA9IChmaWVsZHMsZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgZm9yIGZpZWxkLGkgaW4gZmllbGRzXG4gICAgaWYgKHR5cGVvZiBmaWVsZCBpcyBcIm9iamVjdFwiKVxuICAgICAgaWYgZmllbGQubWFzayA9PSBcImhlYWRpbmdcIlxuICAgICAgICBoICs9IHJlbmRlcl9zdWJoZWFkaW5nKGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGkpXG4gICAgICAgIGZWYWx1ZSA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBkYXRhXG4gICAgICAgIGlmICgnJyAhPSBmVmFsdWUgYW5kIGZWYWx1ZSAhPSAnMCcpXG4gICAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZC5uYW1lXG4gICAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmaWVsZC5uYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmVmFsdWUgPSAnJ1xuXG4gICAgZWxzZVxuICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLCAnJywgZGF0YVxuICAgICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZFxuICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZOYW1lXG4gICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZk5hbWUsIHZhbHVlOiBmVmFsdWUsIGhlbHA6IGZOYW1lSGVscClcbiAgcmV0dXJuIGhcblxucmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgPSAoZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgbWFzayA9ICcwLDAnXG4gIGNhdGVnb3J5ID0gJydcbiAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgZm9yIGZpZWxkIGluIGRhdGFcbiAgICBpZiBjYXRlZ29yeSAhPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBjYXRlZ29yeSA9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGlmIGNhdGVnb3J5ID09ICdPdmVydmlldydcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgIGVsc2UgaWYgY2F0ZWdvcnkgPT0gJ1JldmVudWVzJ1xuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSBcIjxiPlwiICsgdGVtcGxhdGUobmFtZTogY2F0ZWdvcnksIGdlbmZ1bmQ6IFwiR2VuZXJhbCBGdW5kXCIsIG90aGVyZnVuZHM6IFwiT3RoZXIgRnVuZHNcIiwgdG90YWxmdW5kczogXCJUb3RhbCBHb3YuIEZ1bmRzXCIpICsgXCI8L2I+XCJcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuXG4gICAgaWYgZmllbGQuY2FwdGlvbiA9PSAnR2VuZXJhbCBGdW5kIEJhbGFuY2UnIG9yIGZpZWxkLmNhcHRpb24gPT0gJ0xvbmcgVGVybSBEZWJ0J1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICBlbHNlIGlmIGZpZWxkLmNhcHRpb24gaW4gWydUb3RhbCBSZXZlbnVlcycsICdUb3RhbCBFeHBlbmRpdHVyZXMnLCAnU3VycGx1cyAvIChEZWZpY2l0KSddIG9yIGlzX2ZpcnN0X3Jvd1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgICAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2spLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaykpXG4gIHJldHVybiBoXG5cbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvW1xcc1xcK1xcLV0vZywgJ18nKVxuXG50b1RpdGxlQ2FzZSA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlIC9cXHdcXFMqL2csICh0eHQpIC0+XG4gICAgdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG5cbmN1cnJlbmN5ID0gKG4sIG1hc2ssIHNpZ24gPSAnJykgLT5cbiAgICBuID0gbnVtZXJhbChuKVxuICAgIGlmIG4gPCAwXG4gICAgICAgIHMgPSBuLmZvcm1hdChtYXNrKS50b1N0cmluZygpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoLy0vZywgJycpXG4gICAgICAgIHJldHVybiBcIigje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytzKyc8L3NwYW4+J30pXCJcblxuICAgIG4gPSBuLmZvcm1hdChtYXNrKVxuICAgIHJldHVybiBcIiN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK24rJzwvc3Bhbj4nfVwiXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhLCB0YWJzZXQsIHBhcmVudCkgLT5cbiAgI2xheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gIGxheW91dCA9IGluaXRpYWxfbGF5b3V0XG4gIHRlbXBsYXRlcyA9IHBhcmVudC50ZW1wbGF0ZXNcbiAgcGxvdF9oYW5kbGVzID0ge31cblxuICBsYXlvdXRfZGF0YSA9XG4gICAgdGl0bGU6IGRhdGEubmFtZVxuICAgIHdpa2lwZWRpYV9wYWdlX2V4aXN0czogZGF0YS53aWtpcGVkaWFfcGFnZV9leGlzdHNcbiAgICB3aWtpcGVkaWFfcGFnZV9uYW1lOiAgZGF0YS53aWtpcGVkaWFfcGFnZV9uYW1lXG4gICAgdHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWU6IGRhdGEudHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWVcbiAgICBsYXRlc3RfYXVkaXRfdXJsOiBkYXRhLmxhdGVzdF9hdWRpdF91cmxcbiAgICB0YWJzOiBbXVxuICAgIHRhYmNvbnRlbnQ6ICcnXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGxheW91dF9kYXRhLnRhYnMucHVzaFxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgZGV0YWlsX2RhdGEgPVxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcbiAgICAgIHRhYmNvbnRlbnQ6ICcnXG4gICAgc3dpdGNoIHRhYi5uYW1lXG4gICAgICB3aGVuICdPdmVydmlldyArIEVsZWN0ZWQgT2ZmaWNpYWxzJ1xuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgICBmb3Igb2ZmaWNpYWwsaSBpbiBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzXG4gICAgICAgICAgb2ZmaWNpYWxfZGF0YSA9XG4gICAgICAgICAgICB0aXRsZTogaWYgJycgIT0gb2ZmaWNpYWwudGl0bGUgdGhlbiBcIlRpdGxlOiBcIiArIG9mZmljaWFsLnRpdGxlXG4gICAgICAgICAgICBuYW1lOiBpZiAnJyAhPSBvZmZpY2lhbC5mdWxsX25hbWUgdGhlbiBcIk5hbWU6IFwiICsgb2ZmaWNpYWwuZnVsbF9uYW1lXG4gICAgICAgICAgICBlbWFpbDogaWYgb2ZmaWNpYWwuZW1haWxfYWRkcmVzcyB0aGVuIFwiRW1haWw6IFwiICsgb2ZmaWNpYWwuZW1haWxfYWRkcmVzc1xuICAgICAgICAgICAgdGVsZXBob25lbnVtYmVyOiBpZiBudWxsICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgYW5kIHVuZGVmaW5lZCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIHRoZW4gXCJUZWxlcGhvbmUgTnVtYmVyOiBcIiArIG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXJcbiAgICAgICAgICAgIHRlcm1leHBpcmVzOiBpZiBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgdGhlbiBcIlRlcm0gRXhwaXJlczogXCIgKyBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgZWxzZSBcIlRlcm0gRXhwaXJlczogXCJcbiAgICAgICAgICAgIGFsdFR5cGVTbHVnOiBkYXRhLmFsdF90eXBlX3NsdWdcbiAgICAgICAgICAgIG5hbWVTbHVnOiBkYXRhLnNsdWdcbiAgICAgICAgICAgIHNsdWc6IG9mZmljaWFsLnNsdWdcblxuICAgICAgICAgIGlmICcnICE9IG9mZmljaWFsLnBob3RvX3VybCBhbmQgb2ZmaWNpYWwucGhvdG9fdXJsICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnPGltZyBzcmM9XCInK29mZmljaWFsLnBob3RvX3VybCsnXCIgY2xhc3M9XCJwb3J0cmFpdFwiIGFsdD1cIlwiIC8+J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJydcblxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnXShvZmZpY2lhbF9kYXRhKVxuICAgICAgd2hlbiAnRW1wbG95ZWUgQ29tcGVuc2F0aW9uJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzQwXG4gICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDQ3MFxuXG4gICAgICAgICAgaWYgJCh3aW5kb3cpLndpZHRoKCkgPCA0OTBcbiAgICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIENvbXBlbnNhdGlvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0JlbnMuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnXFxuIEVtcGxveWVlcydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnQWxsIFxcbicgKyB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnIFxcbiBSZXNpZGVudHMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDIpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgQ29tcGVuc2F0aW9uIC0gRnVsbCBUaW1lIFdvcmtlcnM6IFxcbiBHb3Zlcm5tZW50IHZzLiBQcml2YXRlIFNlY3RvcidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLWNvbXAtZ3JhcGgnXSA9J21lZGlhbi1jb21wLWdyYXBoJ1xuXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiAhIGRhdGEuaGFzT3duUHJvcGVydHkoJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZScpIHx8ICggZGF0YVsnbWVkaWFuX3BlbnNpb25fMzBfeWVhcl9yZXRpcmVlJ10gPT0gMClcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBQZW5zaW9uJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1BlbnNpb24gZm9yIFxcbiBSZXRpcmVlIHcvIDMwIFllYXJzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3BlbnNpb24zMF95ZWFyX3JldGlyZWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGdyb3VwaW5nU3ltYm9sOiAnLCcgLCBmcmFjdGlvbkRpZ2l0czogJzAnKVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIFBlbnNpb24nXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2Jhcic6IHtcbiAgICAgICAgICAgICAgICAgJ2dyb3VwV2lkdGgnOiAnMzAlJ1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tcGVuc2lvbi1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ10gPSdtZWRpYW4tcGVuc2lvbi1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBIZWFsdGgnXG4gICAgICAgIGggPSAnJ1xuICAgICAgICBoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgI3B1YmxpYyBzYWZldHkgcGllXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3B1YmxpYy1zYWZldHktcGllJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUHVibGljIFNhZmV0eSBFeHBlbnNlJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1B1YmxpYyBTYWZldHkgRXhwJ1xuICAgICAgICAgICAgICAgICAgMSAtIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnT3RoZXInXG4gICAgICAgICAgICAgICAgICBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonUHVibGljIHNhZmV0eSBleHBlbnNlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ3NsaWNlcyc6IHsgMToge29mZnNldDogMC4yfX1cbiAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDQ1XG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdwdWJsaWMtc2FmZXR5LXBpZSdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3B1YmxpYy1zYWZldHktcGllJ10gPSdwdWJsaWMtc2FmZXR5LXBpZSdcbiAgICAgICAgI2Zpbi1oZWFsdGgtcmV2ZW51ZSBncmFwaFxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICNjb25zb2xlLmxvZyAnIyMjYWwnK0pTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdSZXYuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVG90YWwgUmV2ZW51ZSBcXG4gUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIFJldmVudWUgUGVyIFxcbiBDYXBpdGEgRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnY2hhcnRBcmVhLndpZHRoJzogJzEwMCUnXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgICBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddID0nZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAjZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX2V4cGVuZGl0dXJlc19wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnRXhwLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3RvdGFsX2V4cGVuZGl0dXJlc19wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhIFxcbiBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddID0nZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgU3RhdGVtZW50cydcbiAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgIGggPSAnJ1xuICAgICAgICAgICNoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgICBoICs9IHJlbmRlcl9maW5hbmNpYWxfZmllbGRzIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMsIHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZSddXG4gICAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICAgI3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZVxuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLXJldmVudWUtcGllJ11cbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2F0ZWdvcnlfbmFtZSBpcyBcIlJldmVudWVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBSZXZlbnVlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWVzJ1xuICAgICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxNlxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6IDM1MFxuICAgICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA2MFxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxuICAgICAgICAgICAgICAgICAgJ2ZvcmNlSUZyYW1lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYSc6e1xuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodDonNzUlJ1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddID0ndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJFeHBlbmRpdHVyZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIEV4cGVuZGl0dXJlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ10gPSd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgZWxzZVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cblxuICAgIGxheW91dF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtdGVtcGxhdGUnXShkZXRhaWxfZGF0YSlcbiAgcmV0dXJuIHRlbXBsYXRlc1sndGFicGFuZWwtdGVtcGxhdGUnXShsYXlvdXRfZGF0YSlcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG4jIGNvbnZlcnRzIHRhYiB0ZW1wbGF0ZSBkZXNjcmliZWQgaW4gZ29vZ2xlIGZ1c2lvbiB0YWJsZSB0b1xuIyB0YWIgdGVtcGxhdGVcbmNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlPSh0ZW1wbCkgLT5cbiAgdGFiX2hhc2g9e31cbiAgdGFicz1bXVxuICAjIHJldHVybnMgaGFzaCBvZiBmaWVsZCBuYW1lcyBhbmQgdGhlaXIgcG9zaXRpb25zIGluIGFycmF5IG9mIGZpZWxkIG5hbWVzXG4gIGdldF9jb2xfaGFzaCA9IChjb2x1bW5zKSAtPlxuICAgIGNvbF9oYXNoID17fVxuICAgIGNvbF9oYXNoW2NvbF9uYW1lXT1pIGZvciBjb2xfbmFtZSxpIGluIHRlbXBsLmNvbHVtbnNcbiAgICByZXR1cm4gY29sX2hhc2hcblxuICAjIHJldHVybnMgZmllbGQgdmFsdWUgYnkgaXRzIG5hbWUsIGFycmF5IG9mIGZpZWxkcywgYW5kIGhhc2ggb2YgZmllbGRzXG4gIHZhbCA9IChmaWVsZF9uYW1lLCBmaWVsZHMsIGNvbF9oYXNoKSAtPlxuICAgIGZpZWxkc1tjb2xfaGFzaFtmaWVsZF9uYW1lXV1cblxuICAjIGNvbnZlcnRzIGhhc2ggdG8gYW4gYXJyYXkgdGVtcGxhdGVcbiAgaGFzaF90b19hcnJheSA9KGhhc2gpIC0+XG4gICAgYSA9IFtdXG4gICAgZm9yIGsgb2YgaGFzaFxuICAgICAgdGFiID0ge31cbiAgICAgIHRhYi5uYW1lPWtcbiAgICAgIHRhYi5maWVsZHM9aGFzaFtrXVxuICAgICAgYS5wdXNoIHRhYlxuICAgIHJldHVybiBhXG5cblxuICBjb2xfaGFzaCA9IGdldF9jb2xfaGFzaCh0ZW1wbC5jb2xfaGFzaClcbiAgcGxhY2Vob2xkZXJfY291bnQgPSAwXG5cbiAgZm9yIHJvdyxpIGluIHRlbXBsLnJvd3NcbiAgICBjYXRlZ29yeSA9IHZhbCAnZ2VuZXJhbF9jYXRlZ29yeScsIHJvdywgY29sX2hhc2hcbiAgICAjdGFiX2hhc2hbY2F0ZWdvcnldPVtdIHVubGVzcyB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICBmaWVsZG5hbWUgPSB2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXG4gICAgaWYgbm90IGZpZWxkbmFtZSB0aGVuIGZpZWxkbmFtZSA9IFwiX1wiICsgU3RyaW5nICsrcGxhY2Vob2xkZXJfY291bnRcbiAgICBmaWVsZE5hbWVzW3ZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hdPXZhbCAnZGVzY3JpcHRpb24nLCByb3csIGNvbF9oYXNoXG4gICAgZmllbGROYW1lc0hlbHBbZmllbGRuYW1lXSA9IHZhbCAnaGVscF90ZXh0Jywgcm93LCBjb2xfaGFzaFxuICAgIGlmIGNhdGVnb3J5XG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0/PVtdXG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0ucHVzaCBuOiB2YWwoJ24nLCByb3csIGNvbF9oYXNoKSwgbmFtZTogZmllbGRuYW1lLCBtYXNrOiB2YWwoJ21hc2snLCByb3csIGNvbF9oYXNoKVxuXG4gIGNhdGVnb3JpZXMgPSBPYmplY3Qua2V5cyh0YWJfaGFzaClcbiAgY2F0ZWdvcmllc19zb3J0ID0ge31cbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNcbiAgICBpZiBub3QgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XVxuICAgICAgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5XVswXS5uXG4gICAgZmllbGRzID0gW11cbiAgICBmb3Igb2JqIGluIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgICAgZmllbGRzLnB1c2ggb2JqXG4gICAgZmllbGRzLnNvcnQgKGEsYikgLT5cbiAgICAgIHJldHVybiBhLm4gLSBiLm5cbiAgICB0YWJfaGFzaFtjYXRlZ29yeV0gPSBmaWVsZHNcblxuICBjYXRlZ29yaWVzX2FycmF5ID0gW11cbiAgZm9yIGNhdGVnb3J5LCBuIG9mIGNhdGVnb3JpZXNfc29ydFxuICAgIGNhdGVnb3JpZXNfYXJyYXkucHVzaCBjYXRlZ29yeTogY2F0ZWdvcnksIG46IG5cbiAgY2F0ZWdvcmllc19hcnJheS5zb3J0IChhLGIpIC0+XG4gICAgcmV0dXJuIGEubiAtIGIublxuXG4gIHRhYl9uZXdoYXNoID0ge31cbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNfYXJyYXlcbiAgICB0YWJfbmV3aGFzaFtjYXRlZ29yeS5jYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeS5jYXRlZ29yeV1cblxuICB0YWJzID0gaGFzaF90b19hcnJheSh0YWJfbmV3aGFzaClcbiAgcmV0dXJuIHRhYnNcblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcbiAgQHRlbXBsYXRlcyA9IHVuZGVmaW5lZFxuICBAZGF0YSA9IHVuZGVmaW5lZFxuICBAZXZlbnRzID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG4gICAgQGV2ZW50cyA9IHt9XG4gICAgdGVtcGxhdGVMaXN0ID0gWyd0YWJwYW5lbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJywgJ3RhYmRldGFpbC1vZmZpY2lhbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnLCAncGVyc29uLWluZm8tdGVtcGxhdGUnXVxuICAgIHRlbXBsYXRlUGFydGlhbHMgPSBbJ3RhYi10ZW1wbGF0ZSddXG4gICAgQHRlbXBsYXRlcyA9IHt9XG4gICAgZm9yIHRlbXBsYXRlLGkgaW4gdGVtcGxhdGVMaXN0XG4gICAgICBAdGVtcGxhdGVzW3RlbXBsYXRlXSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG4gICAgZm9yIHRlbXBsYXRlLGkgaW4gdGVtcGxhdGVQYXJ0aWFsc1xuICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwodGVtcGxhdGUsICQoJyMnICsgdGVtcGxhdGUpLmh0bWwoKSlcblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgcGFyZW50OnRoaXNcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICBAcGFyZW50LmRhdGEgPSBkYXRcbiAgICAgICAgcmVuZGVyX3RhYnMobGF5b3V0X2pzb24sIGRhdCwgdGhpcywgQHBhcmVudClcbiAgICAgIGJpbmQ6ICh0cGxfbmFtZSwgY2FsbGJhY2spIC0+XG4gICAgICAgIGlmIG5vdCBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0gPSBbY2FsbGJhY2tdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0ucHVzaCBjYWxsYmFja1xuICAgICAgYWN0aXZhdGU6ICh0cGxfbmFtZSkgLT5cbiAgICAgICAgaWYgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgZm9yIGUsaSBpbiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICAgIGUgdHBsX25hbWUsIEBwYXJlbnQuZGF0YVxuXG4gIGxvYWRfdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0ZW1wbGF0ZV9qc29uKVxuXG4gIGxvYWRfZnVzaW9uX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEdPVldJS0kuZnVzaW9uID0gdGVtcGxhdGVfanNvblxuICAgICAgICB0ID0gY29udmVydF9mdXNpb25fdGVtcGxhdGUgdGVtcGxhdGVfanNvblxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHQpXG5cblxuICBnZXRfbmFtZXM6IC0+XG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcblxuICBnZXRfaW5kZXhfYnlfbmFtZTogKG5hbWUpIC0+XG4gICAgZm9yIHQsaSBpbiBAbGlzdFxuICAgICAgaWYgdC5uYW1lIGlzIG5hbWUgdGhlbiBpXG4gICAgcmV0dXJuIC0xXG5cbiAgZ2V0X2h0bWw6IChpbmQsIGRhdGEpIC0+XG4gICAgaWYgKGluZCBpcyAtMSkgdGhlbiByZXR1cm4gIFwiXCJcblxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cbiAgYWN0aXZhdGU6IChpbmQsIHRwbF9uYW1lKSAtPlxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIEBsaXN0W2luZF0uYWN0aXZhdGUgdHBsX25hbWVcblxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZXMyXG4iLCIkIC0+XG4gICMkKCcjZ2V0V2lraXBlZGlhQXJ0aWNsZUJ1dHRvbicpLm9uICdjbGljaycsIC0+XG4gICMgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICNhbGVydGFsZXJ0IFwiaGlcIlxuICAjYWxlcnQgJChcIiN3aWtpcGVkaWFQYWdlTmFtZVwiKS50ZXh0KClcbiAgI2dldF93aWtpcGVkaWFfYXJ0aWNsZSgpXG4gIHdpbmRvdy5nZXRfd2lraXBlZGlhX2FydGljbGUgPSBnZXRfd2lraXBlZGlhX2FydGljbGVcbiAgd2luZG93LmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZSA9IGNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZVxuXG5nZXRfd2lraXBlZGlhX2FydGljbGU9KHMpLT5cbiAgYXJ0aWNsZV9uYW1lID0gcy5yZXBsYWNlIC8uKlxcLyhbXi9dKikkLywgXCIkMVwiXG4gICQuZ2V0SlNPTiBcImh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3cvYXBpLnBocD9hY3Rpb249cGFyc2UmcGFnZT0je2FydGljbGVfbmFtZX0mcHJvcD10ZXh0JmZvcm1hdD1qc29uJmNhbGxiYWNrPT9cIiwgKGpzb24pIC0+IFxuICAgICQoJyN3aWtpcGVkaWFUaXRsZScpLmh0bWwganNvbi5wYXJzZS50aXRsZVxuICAgICQoJyN3aWtpcGVkaWFBcnRpY2xlJykuaHRtbCBqc29uLnBhcnNlLnRleHRbXCIqXCJdXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhOm5vdCgucmVmZXJlbmNlcyBhKVwiKS5hdHRyIFwiaHJlZlwiLCAtPiAgXCJodHRwOi8vd3d3Lndpa2lwZWRpYS5vcmdcIiArICQodGhpcykuYXR0cihcImhyZWZcIilcbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImFcIikuYXR0ciBcInRhcmdldFwiLCBcIl9ibGFua1wiXG4gIFxuY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlPSAtPlxuICBhbGVydCBcIk5vdCBpbXBsZW1lbnRlZFwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2V0X3dpa2lwZWRpYV9hcnRpY2xlOmdldF93aWtpcGVkaWFfYXJ0aWNsZVxuIl19

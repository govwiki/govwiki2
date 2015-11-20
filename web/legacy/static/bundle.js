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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxnSkFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixtQkFBQSxHQUFzQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTs7QUFFckMsR0FBQSxHQUFVLElBQUEsS0FBQSxDQUNSO0VBQUEsRUFBQSxFQUFJLFNBQUo7RUFDQSxHQUFBLEVBQUssSUFETDtFQUVBLEdBQUEsRUFBSyxDQUFDLEtBRk47RUFHQSxJQUFBLEVBQU0sQ0FITjtFQUlBLE9BQUEsRUFBUyxDQUpUO0VBS0EsV0FBQSxFQUFhLElBTGI7RUFNQSxjQUFBLEVBQWdCLEtBTmhCO0VBT0EsVUFBQSxFQUFZLEtBUFo7RUFRQSxjQUFBLEVBQWdCLEtBUmhCO0VBU0EsV0FBQSxFQUFhLElBVGI7RUFVQSxrQkFBQSxFQUNFO0lBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMs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QUF2RCxHQUFvRSxtQ0FBOUUsRUFBa0gsU0FBQyxJQUFEO0lBQ2hILENBQUEsQ0FBRSxpQkFBRixDQUFvQixDQUFDLElBQXJCLENBQTBCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBckM7SUFDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQSxHQUFBLENBQTVDO0lBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsc0JBQTVCLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsTUFBekQsRUFBaUUsU0FBQTthQUFJLDBCQUFBLEdBQTZCLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsTUFBYjtJQUFqQyxDQUFqRTtXQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLEdBQTVCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsUUFBdEMsRUFBZ0QsUUFBaEQ7RUFKZ0gsQ0FBbEg7QUFGb0I7O0FBUXRCLHdCQUFBLEdBQTBCLFNBQUE7U0FDeEIsS0FBQSxDQUFNLGlCQUFOO0FBRHdCOztBQUcxQixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEscUJBQUEsRUFBc0IscUJBQXRCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuIyBTZXQgbGlmZXRpbWUgb24gMSBkYXlzLCBmb3JtYXQ6IGRheXMgKiBob3VycyAqIG1pbnV0ZXMgKiBzZWNvbmRzICogbWlsbGlzZWNvbmRzLlxucG9pbnRzQ2FjaGVMaWZldGltZSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogMzcuM1xuICBsbmc6IC0xMTkuM1xuICB6b29tOiA2XG4gIG1pblpvb206IDZcbiAgc2Nyb2xsd2hlZWw6IHRydWVcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHBhbkNvbnRyb2w6IGZhbHNlXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxuICB6b29tQ29udHJvbDogdHJ1ZVxuICB6b29tQ29udHJvbE9wdGlvbnM6XG4gICAgc3R5bGU6IGdvb2dsZS5tYXBzLlpvb21Db250cm9sU3R5bGUuU01BTExcbiAgbWFya2VyQ2x1c3RlcmVyOiAobWFwKSAtPlxuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0ZXh0U2l6ZTogMTRcbiAgICAgIHRleHRDb2xvcjogJ3JlZCdcbiAgICAgIGdyaWRTaXplOiAwXG4gICAgICBtaW5pbXVtQ2x1c3RlclNpemU6IDUgIyBBbGxvdyBtaW5pbXVtIDUgbWFya2VyIGluIGNsdXN0ZXIuXG4gICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBEb24ndCBzaG93IGhpZGRlbiBtYXJrZXJzLiBJbiBzb21lIHJlYXNvbiBkb24ndCB3b3JrIDooXG4gICAgICAjIEZvciBkcmF3IGNoYXJ0LlxuICAgICAgbGVnZW5kOlxuICAgICAgICBcIkNpdHlcIiA6IFwicmVkXCJcbiAgICAgICAgXCJTY2hvb2wgRGlzdHJpY3RcIiA6IFwiYmx1ZVwiXG4gICAgICAgIFwiU3BlY2lhbCBEaXN0cmljdFwiIDogXCJwdXJwbGVcIlxuICAgIH1cbiAgICByZXR1cm4gbmV3IE1hcmtlckNsdXN0ZXJlcihtYXAsIFtdLCBvcHRpb25zKTtcblxubWFwLm1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uUklHSFRfVE9QXS5wdXNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdlbmQnKSlcblxucmVyZW5kZXJfbWFya2VycyA9IC0+XG4gIGFkZF9tYXJrZXIocmVjKSBmb3IgcmVjIGluIEdPVldJS0kubWFya2Vyc1xuXG5yZWJ1aWxkX2ZpbHRlciA9IC0+XG4gIGhhcmRfcGFyYW1zID0gWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0JywgJ0NvdW50eSddXG4gIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIgPSBbXVxuICAkKCcudHlwZV9maWx0ZXInKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICBpZiAkKGVsZW1lbnQpLmF0dHIoJ25hbWUnKSBpbiBoYXJkX3BhcmFtcyBhbmQgJChlbGVtZW50KS52YWwoKSA9PSAnMSdcbiAgICAgIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIucHVzaCAkKGVsZW1lbnQpLmF0dHIoJ25hbWUnKVxuXG4jIGxlZ2VuZFR5cGUgPSBjaXR5LCBzY2hvb2wgZGlzdHJpY3QsIHNwZWNpYWwgZGlzdHJpY3QsIGNvdW50aWVzXG5nZXRfcmVjb3JkczIgPSAobGVnZW5kVHlwZSwgb25zdWNjZXNzKSAtPlxuICAjXG4gICMgUmV0cmlldmUgbmV3IG1hcmtlcnMgZGF0YSBmcm9tIHNlcnZlci5cbiAgJC5hamF4XG4gICAgdXJsOlwiL2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuIyAgICB1cmw6XCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnQvZ2V0LW1hcmtlcnMtZGF0YVwiXG4gICAgZGF0YTogeyBhbHRUeXBlczogbGVnZW5kVHlwZSwgbGltaXQ6IDUwMDAgfVxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG4gIHJlYnVpbGRfZmlsdGVyKClcbiAgZGF0YSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncG9pbnRzJylcblxuICAjXG4gICMgTG9hZCBtYXJrZXJzIGRhdGFcbiAgI1xuICBkYXRlID0gbmV3IERhdGUoKTtcblxuICBpZiBkYXRhIGFuZCAoKE51bWJlcih3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BvaW50c19sYXN0X3VwZGF0ZScpKSArIHBvaW50c0NhY2hlTGlmZXRpbWUpID49IGRhdGUuZ2V0VGltZSgpKVxuICAgICNcbiAgICAjIElmIHBvaW50cyBkYXRhIGNhY2hlZCBpbiBsb2NhbCBzdG9yYWdlIGFuZCBpbiBhY3R1YWwgc3RhdGUsIGxvYWQgZnJvbSBjYWNoZS5cbiAgICAjXG4gICAgY29uc29sZS5sb2coJ0Zyb20gY2FjaGUnKVxuICAgIEdPVldJS0kubWFya2VycyA9IEpTT04ucGFyc2UoZGF0YSlcbiAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdtYXJrZXJzTG9hZGVkJylcbiAgICAjXG4gICAgIyBSZW5kZXIgcG9pbnRzIHN0b3JlZCBpbiBHT1ZXSUtJLm1hcmtlcnNcbiAgICAjXG4gICAgcmVyZW5kZXJfbWFya2VycygpXG4gIGVsc2VcbiAgICAjXG4gICAgIyBHZXQgbmV3IGRhdGEgZnJvbSBzZXJ2ZXIuXG4gICAgI1xuICAgIGdldF9yZWNvcmRzMiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLCAoZGF0YSkgLT5cbiAgICAgICNcbiAgICAgICMgU3RvcmUgbWFya2VycyBkYXRhLlxuICAgICAgI1xuICAgICAgY29uc29sZS5sb2coJ0Zyb20gc2VydmVyJylcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncG9pbnRzJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncG9pbnRzX2xhc3RfdXBkYXRlJywgZGF0ZS5nZXRUaW1lKCkpXG4gICAgICBHT1ZXSUtJLm1hcmtlcnMgPSBkYXRhXG4gICAgICAkKGRvY3VtZW50KS50cmlnZ2VyKCdtYXJrZXJzTG9hZGVkJylcbiAgICAgICNcbiAgICAgICMgUmVuZGVyIHBvaW50cyBzdG9yZWQgaW4gR09WV0lLSS5tYXJrZXJzXG4gICAgICAjXG4gICAgICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpOm5vdCguY291bnRpZXMtdHJpZ2dlciknKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaGlkZGVuX2ZpZWxkID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpXG4gICAgdmFsdWUgPSBoaWRkZW5fZmllbGQudmFsKClcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcbiAgICAjXG4gICAgIyBDbGlja2VkIGxlZ2VuZCBhbHQgdHlwZS5cbiAgICBhbHRUeXBlID0gaGlkZGVuX2ZpZWxkLmF0dHIoJ25hbWUnKVxuXG4gICAgcmVidWlsZF9maWx0ZXIoKVxuXG4gICAgI1xuICAgICMgVG9nZ2xlIG1hcmtlciB2aXNpYmxlIHdpdGggdHlwZSBlcXVhbCB0byBjbGlja2VkIGxlZ2VuZC5cbiAgICAjXG4gICAgZm9yIG1hcmtlciBpbiBtYXAubWFya2Vyc1xuICAgICAgaWYgbWFya2VyLnR5cGUgaXMgYWx0VHlwZVxuICAgICAgICAjIFJlbW92ZXxhZGQgbWFya2VycyBmcm9tIGNsdXN0ZXIgYmVjYXVzZSBNYXJrZXJDbHVzdGVyIGlnbm9yZVxuICAgICAgICAjIGhpcyBvcHRpb24gJ2lnbm9yZUhpZGRlbicuXG4gICAgICAgIGlmICh2YWx1ZSBpcyAnMScpXG4gICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5yZW1vdmVNYXJrZXIobWFya2VyLCB0cnVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5hZGRNYXJrZXIobWFya2VyLCB0cnVlKVxuIyAgICAgICAgbWFya2VyLnNldFZpc2libGUoISBtYXJrZXIuZ2V0VmlzaWJsZSgpKVxuXG4gICAgbWFwLm1hcmtlckNsdXN0ZXJlci5yZXBhaW50KCk7XG5cbiAgJCgnI2xlZ2VuZCBsaS5jb3VudGllcy10cmlnZ2VyJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGlmICQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAjXG4gICAgICAjIFNob3cgY291bnRpZXMuXG4gICAgICAjXG4gICAgICBmb3IgcG9seWdvbiBpbiBtYXAucG9seWdvbnNcbiAgICAgICAgcG9seWdvbi5zZXRWaXNpYmxlKHRydWUpXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBIaWRlIGNvdW50aWVzLlxuICAgICAgI1xuICAgICAgZm9yIHBvbHlnb24gaW4gbWFwLnBvbHlnb25zXG4gICAgICAgIHBvbHlnb24uc2V0VmlzaWJsZShmYWxzZSlcblxuXG5cblxuXG5nZXRfaWNvbiA9KGFsdF90eXBlKSAtPlxuXG4gIF9jaXJjbGUgPShjb2xvciktPlxuICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFXG4gICAgZmlsbE9wYWNpdHk6IDFcbiAgICBmaWxsQ29sb3I6IGNvbG9yXG4gICAgc3Ryb2tlV2VpZ2h0OiAxXG4gICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTogNlxuXG4gIHN3aXRjaCBhbHRfdHlwZVxuICAgIHdoZW4gJ0NpdHknIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3JlZCdcbiAgICB3aGVuICdTY2hvb2wgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ2JsdWUnXG4gICAgd2hlbiAnU3BlY2lhbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAncHVycGxlJ1xuICAgIGVsc2UgcmV0dXJuIF9jaXJjbGUgJ3doaXRlJ1xuXG5pbl9hcnJheSA9IChteV9pdGVtLCBteV9hcnJheSkgLT5cbiAgZm9yIGl0ZW0gaW4gbXlfYXJyYXlcbiAgICByZXR1cm4gdHJ1ZSBpZiBpdGVtID09IG15X2l0ZW1cbiAgZmFsc2VcblxuXG5hZGRfbWFya2VyID0gKHJlYyktPlxuICAjY29uc29sZS5sb2cgXCIje3JlYy5yYW5kfSAje3JlYy5pbmNfaWR9ICN7cmVjLnppcH0gI3tyZWMubGF0aXR1ZGV9ICN7cmVjLmxvbmdpdHVkZX0gI3tyZWMuZ292X25hbWV9XCJcbiAgZXhpc3QgPSBpbl9hcnJheSByZWMuYWx0VHlwZSwgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMlxuICBpZiBleGlzdCBpcyBmYWxzZSB0aGVuIHJldHVybiBmYWxzZVxuXG4gIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHJlYy5sYXRpdHVkZSwgcmVjLmxvbmdpdHVkZSlcbiAgICBpY29uOiBnZXRfaWNvbihyZWMuYWx0VHlwZSlcbiAgICB0aXRsZTogIFwiI3tyZWMubmFtZX0sICN7cmVjLnR5cGV9XCIsXG4jICAgIHRpdGxlOiBcIiN7cmVjLmFsdFR5cGV9XCJcbiAgICAjXG4gICAgIyBGb3IgbGVnZW5kIGNsaWNrIGhhbmRsZXIuXG4gICAgdHlwZTogcmVjLmFsdFR5cGVcbiAgfSlcbiAgI1xuICAjIE9uIGNsaWNrIHJlZGlyZWN0IHVzZXIgdG8gZW50aXR5IHBhZ2UuXG4gICNcbiAgbWFya2VyLmFkZExpc3RlbmVyICdjbGljaycsICgpIC0+XG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgY29uc29sZS5sb2coJ0NsaWNrIG9uIG1hcmtlcicpO1xuICAgIHVybCA9IFwiI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9XCJcbiAgICBjb25zb2xlLmxvZyh1cmwpO1xuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhXG4gICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnQvXCIgKyB1cmwsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IEdPVldJS0kudGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgbWFwLmFkZE1hcmtlciBtYXJrZXJcblxuIyAgbWFwLmFkZE1hcmtlclxuIyAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuIyAgICBsbmc6IHJlYy5sb25naXR1ZGVcbiMgICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4jICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIlxuIyAgICBpbmZvV2luZG93OlxuIyAgICAgIGNvbnRlbnQ6IFwiXG4jICAgICAgICA8ZGl2PjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnIGNsYXNzPSdpbmZvLXdpbmRvdy11cmknIGRhdGEtdXJpPScvI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9Jz48c3Ryb25nPiN7cmVjLm5hbWV9PC9zdHJvbmc+PC9hPjwvZGl2PlxuIyAgICAgICAgPGRpdj4gI3tyZWMudHlwZX0gICN7cmVjLmNpdHl9ICN7cmVjLnppcH0gI3tyZWMuc3RhdGV9PC9kaXY+XCJcblxuXG5cbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIG1hcDogbWFwXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiMgICAgJC5hamF4XG4jICAgICAgdXJsOiBkb2NzX3VybFxuIyAgICAgIGRhdGFUeXBlOiAnanNvbidcbiMgICAgICBjYWNoZTogdHJ1ZVxuIyAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAkKGRvY3VtZW50KS5vbiAnbWFya2Vyc0xvYWRlZCcsICgpID0+XG4gICAgICBjb25zb2xlLmxvZyAnTWFya2VycyBsb2FkZWQnXG4gICAgICBjb25zb2xlLmxvZyBHT1ZXSUtJLm1hcmtlcnNcbiAgICAgIEBzdGFydFN1Z2dlc3Rpb24oR09WV0lLSS5tYXJrZXJzKVxuXG4gIHN1Z2dlc3Rpb25UZW1wbGF0ZSA6IEhhbmRsZWJhcnMuY29tcGlsZShcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwic3VnZy1ib3hcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXN0YXRlXCI+e3t7c3RhdGV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLW5hbWVcIj57e3tuYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7dHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuICBlbnRlcmVkX3ZhbHVlID0gXCJcIlxuXG4gIGdvdnNfYXJyYXkgPSBbXVxuXG4gIGNvdW50X2dvdnMgOiAoKSAtPlxuICAgIGNvdW50ID0wXG4gICAgZm9yIGQgaW4gQGdvdnNfYXJyYXlcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQudHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgIEBnb3ZzX2FycmF5ID0gZ292c1xuICAgICNAZ292c19hcnJheSA9IGdvdnMucmVjb3JkXG4gICAgJCgnLnR5cGVhaGVhZCcpLmtleXVwIChldmVudCkgPT5cbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgLCAxMDAwXG5cbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogdHJ1ZVxuICAgICAgICBtaW5MZW5ndGg6IDFcbiAgICAgICAgY2xhc3NOYW1lczpcbiAgICAgICAgXHRtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ25hbWUnXG4gICAgICAgIGRpc3BsYXlLZXk6ICduYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAjICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxuICAgIHJldHVyblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzPUdvdlNlbGVjdG9yXG5cblxuXG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xud2lraXBlZGlhID0gcmVxdWlyZSAnLi93aWtpcGVkaWEuY29mZmVlJ1xuXG5nb3ZtYXAgPSBudWxsXG5nb3Zfc2VsZWN0b3IgPSBudWxsXG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYiA9IFwiXCJcbnVuZGVmID0gbnVsbFxuI1xuIyBOb3cgaW5pdCBpbiBGcm9udGVuZEJ1bmRsZSBtYWluIHRlbXBsYXRlLlxuI2F1dGhvcml6ZWQgPSBmYWxzZVxuI3VzZXIgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4jXG4jIElzc3VlcyBjYXRlZ29yeSwgZmlsbCBpbiBlbGVjdGVkIG9mZmljaWFsIHBhZ2UuXG4jXG5jYXRlZ29yaWVzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCAndGFibGUtY2l0eScsICQoJyN0YWJsZS1jaXR5JykuaHRtbCgpXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCAndGFibGUtY291bnR5JywgJCgnI3RhYmxlLWNvdW50eScpLmh0bWwoKVxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgJ3RhYmxlLXNjaG9vbC1kaXN0cmljdCcsICQoJyN0YWJsZS1zY2hvb2wtZGlzdHJpY3QnKS5odG1sKClcbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsICd0YWJsZS1zcGVjaWFsLWRpc3RyaWN0JywgJCgnI3RhYmxlLXNwZWNpYWwtZGlzdHJpY3QnKS5odG1sKClcblxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdnZXROYW1lJywgKG5hbWUsIG9iaikgLT5cbiAgICByZXR1cm4gb2JqW25hbWUrJ1JhbmsnXTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZiBgYSA9PSBiYFxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnc29tZScsIChhcnIsIHRhcmdldCwgb3B0cykgLT5cbiAgICByZXR1cm4gISFhcnJbdGFyZ2V0KydSYW5rJ107XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2RlYnVnJywgKGVtYmVyT2JqZWN0KSAtPlxuICBpZiBlbWJlck9iamVjdCBhbmQgZW1iZXJPYmplY3QuY29udGV4dHNcbiAgICBvdXQgPSAnJztcblxuICAgIGZvciBjb250ZXh0IGluIGVtYmVyT2JqZWN0LmNvbnRleHRzXG4gICAgICBmb3IgcHJvcCBpbiBjb250ZXh0XG4gICAgICAgIG91dCArPSBwcm9wICsgXCI6IFwiICsgY29udGV4dFtwcm9wXSArIFwiXFxuXCJcblxuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKVxuICAgICAgICBjb25zb2xlLmxvZyhcIkRlYnVnXFxuLS0tLS0tLS0tLS0tLS0tLVxcblwiICsgb3V0KVxuXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgICBzdGF0ZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcl8yOiBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuXG4gICAgc2hvd19zZWFyY2hfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgIGZvY3VzX3NlYXJjaF9maWVsZCA1MDBcblxuICAgIHNob3dfZGF0YV9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcblxuR09WV0lLSS50ZW1wbGF0ZXMgPSB0ZW1wbGF0ZXM7XG5HT1ZXSUtJLnRwbExvYWRlZCA9IGZhbHNlXG5cbkdPVldJS0kuZ2V0X2NvdW50aWVzID0gZ2V0X2NvdW50aWVzID0gKGNhbGxiYWNrKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICcvbGVnYWN5L2RhdGEvY291bnR5X2dlb2dyYXBoeV9jYV8yLmpzb24nXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGNvdW50aWVzSlNPTikgLT5cbiAgICAgICAgICAgIGNhbGxiYWNrIGNvdW50aWVzSlNPTlxuXG5HT1ZXSUtJLmRyYXdfcG9seWdvbnMgPSBkcmF3X3BvbHlnb25zID0gKGNvdW50aWVzSlNPTikgLT5cbiAgICBmb3IgY291bnR5IGluIGNvdW50aWVzSlNPTi5mZWF0dXJlc1xuICAgICAgICBkbyAoY291bnR5KSA9PlxuICAgICAgICAgICAgZ292bWFwLm1hcC5kcmF3UG9seWdvbih7XG4gICAgICAgICAgICAgICAgcGF0aHM6IGNvdW50eS5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgICAgICAgICAgICAgIHVzZUdlb0pTT046IHRydWVcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyM4MDgwODAnXG4gICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC42XG4gICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAxLjVcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjE1XG4gICAgICAgICAgICAgICAgY291bnR5SWQ6IGNvdW50eS5wcm9wZXJ0aWVzLl9pZFxuICAgICAgICAgICAgICAgIGFsdE5hbWU6IGNvdW50eS5wcm9wZXJ0aWVzLmFsdF9uYW1lXG4gICAgICAgICAgICAgICAgbWFya2VyOiBuZXcgTWFya2VyV2l0aExhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMCwgMCksXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlT25EcmFnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBnb3ZtYXAubWFwLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDb250ZW50OiBjb3VudHkucHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KC0xNSwgMjUpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENsYXNzOiBcImxhYmVsLXRvb2x0aXBcIixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHlsZToge29wYWNpdHk6IDEuMH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xeDFcIixcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIG1vdXNlb3ZlcjogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiIzAwRkYwMFwifSlcbiAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IChldmVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0UG9zaXRpb24oZXZlbnQubGF0TG5nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKHRydWUpXG4gICAgICAgICAgICAgICAgbW91c2VvdXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiNGRjAwMDBcIn0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoZmFsc2UpXG4gICAgICAgICAgICAgICAgY2xpY2s6IC0+XG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB1cmkgPSBcIi8je2NvdW50eS5hbHRfdHlwZV9zbHVnfS8je2NvdW50eS5wcm9wZXJ0aWVzLnNsdWd9XCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcbiAgICAgICAgICAgIH0pXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPSAobmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XG4gICAgYWN0aXZlX3RhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd0YWJuYW1lJylcbiAgICBjb25zb2xlLmxvZyBhY3RpdmVfdGFiXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAkKCQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgdGVtcGxhdGVzLmFjdGl2YXRlIDAsIGFjdGl2ZV90YWJcblxuICAgIGlmIGFjdGl2ZV90YWIgPT0gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gMFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgyICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgzICsgMjcpXG5cbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxuXG5hY3RpdmF0ZV90YWIgPSAoKSAtPlxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxuICAgIGNvbnNvbGUubG9nKCchIUAjQCcpO1xuIyBjbGVhciB3aWtpcGVkaWEgcGxhY2VcbiAgICAkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKFwiXCIpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICBnZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgZGF0YS5faWQsIChkYXRhMiwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMgPSBkYXRhMlxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YTNcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldF9tYXhfcmFua3MgKG1heF9yYW5rc19yZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjVE9ETzogRW5hYmxlIGFmdGVyIHJlYWxpemUgbWF4X3JhbmtzIGFwaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG5cbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcbiAgICAgICAgICAgICN3cG4gPSBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICAgICAgICAgICMkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKGlmIHdwbiB0aGVuIHdwbiBlbHNlIFwiTm8gV2lraXBlZGlhIGFydGljbGVcIilcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzkvYXBpL2dvdmVybm1lbnQvXCIgKyBhbHRfdHlwZSArICcvJyArIGdvdl9uYW1lXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvX3Byb2MvZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzXCJcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiBcImdvdndpa2lcIlxuICAgICAgICAgICAgb3JkZXI6IFwiY2FwdGlvbl9jYXRlZ29yeSxkaXNwbGF5X29yZGVyXCJcbiAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ292c19pZFwiXG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZTogXCJJTlwiXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxuICAgICAgICAgICAgXVxuXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfbWF4X3JhbmtzID0gKG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6ICdnb3Z3aWtpJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCA9IChyZWMpPT5cbiAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICBhY3RpdmF0ZV90YWIoKVxuICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIHJvdXRlci5uYXZpZ2F0ZShyZWMuX2lkKVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkMiA9IChyZWMpPT5cbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICByZWMuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9IHVybFxuXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcbiAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXNcbiAgICAgICAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgdmFsdWVzLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgICBzICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBzZWxlY3QgPSAkKHMpXG4gICAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG5cbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgICBpZiB0ZXh0IGlzICdTdGF0ZS4uJ1xuICAgICAgICBzZWxlY3QudmFsICdDQSdcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xuXG4gICAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgaW5wID0gJCgnI215aW5wdXQnKVxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxuICAgIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cbnN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgICQod2luZG93KS5yZXNpemUgLT5cbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcblxuXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoZSkgLT5cbiAgICBoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBpZiBub3QgaFxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5yb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcblxuR09WV0lLSS5oaXN0b3J5ID0gKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID09IDBcbiAgICAgICAgc2VhcmNoQ29udGFpbmVyID0gJCgnI3NlYXJjaENvbnRhaW5lcicpLnRleHQoKTtcbiAgICAgICAgaWYoc2VhcmNoQ29udGFpbmVyICE9ICcnKVxuIyAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7fSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvJ1xuICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJ1xuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIChoaXN0b3J5LnN0YXRlICE9IG51bGwgJiYgaGlzdG9yeS5zdGF0ZS50ZW1wbGF0ZSAhPSB1bmRlZmluZWQpXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LmdvKGluZGV4KTtcbiAgICBlbHNlXG4gICAgICAgIHJvdXRlLnBvcCgpXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nICsgcm91dGUuam9pbignLycpXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb3BzdGF0ZScsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyh3aW5kb3cuaGlzdG9yeS5zdGF0ZSlcbiAgICBpZiB3aW5kb3cuaGlzdG9yeS5zdGF0ZSBpc250IG51bGxcbiAgICAgICAgcm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcigoaXRtKS0+IGlmIGl0bSBpc250IFwiXCIgdGhlbiBpdG0gZWxzZSBmYWxzZSk7XG4gICAgICAgIHJvdXRlID0gcm91dGUubGVuZ3RoO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJvdXRlKVxuICAgICAgICBpZiByb3V0ZSBpcyAwXG4gICAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgICAgICBpZiByb3V0ZSBpcyAyXG4gICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpO1xuICAgICAgICBpZiByb3V0ZSBpc250IDBcbiAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgZXZlbnQuc3RhdGUudGVtcGxhdGVcbiAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICBlbHNlXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG4gICAgICAgIGlmIEdPVldJS0kudHBsTG9hZGVkIGlzIGZhbHNlIHRoZW4gZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcbnJlZnJlc2hfZGlzcXVzID0gKG5ld0lkZW50aWZpZXIsIG5ld1VybCwgbmV3VGl0bGUpIC0+XG4gICAgRElTUVVTLnJlc2V0XG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiAoKSAtPlxuICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXG4gICAgICAgICAgICB0aGlzLnBhZ2UudGl0bGUgPSBuZXdUaXRsZVxuXG4jXG4jIFNvcnQgdGFibGUgYnkgY29sdW1uLlxuIyBAcGFyYW0gc3RyaW5nIHRhYmxlICBKUXVlcnkgc2VsZWN0b3IuXG4jIEBwYXJhbSBudW1iZXIgY29sTnVtIENvbHVtbiBudW1iZXIuXG4jXG5zb3J0VGFibGUgPSAodGFibGUsIGNvbE51bSkgLT5cbiAgICAjXG4gICAgIyBEYXRhIHJvd3MgdG8gc29ydFxuICAgICNcbiAgICByb3dzID0gJCh0YWJsZSArICcgdGJvZHkgIFtkYXRhLWlkXScpLmdldCgpXG4gICAgI1xuICAgICMgTGFzdCByb3cgd2hpY2ggY29udGFpbnMgXCJBZGQgbmV3IC4uLlwiXG4gICAgI1xuICAgIGxhc3RSb3cgPSAkKHRhYmxlICsgJyB0Ym9keSAgdHI6bGFzdCcpLmdldCgpO1xuICAgICNcbiAgICAjIENsaWNrZWQgY29sdW1uLlxuICAgICNcbiAgICBjb2x1bW4gPSAkKHRhYmxlICsgJyB0Ym9keSB0cjpmaXJzdCcpLmNoaWxkcmVuKCd0aCcpLmVxKGNvbE51bSlcbiAgICBtYWtlU29ydCA9IHRydWVcblxuICAgIGlmIGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgICAgICMgUmVzdG9yZSByb3cgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5hZGRDbGFzcygnb3JpZ2luJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX2JvdHRvbScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKVxuICAgICAgcm93cyA9IGNvbHVtbi5kYXRhKCdvcmlnaW4nKVxuICAgICAgbWFrZVNvcnQgPSBmYWxzZTtcbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnYXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gZGVzYyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnYXNjJykuYWRkQ2xhc3MoJ2Rlc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykuYWRkQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAtMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ29yaWdpbicpXG4gICAgICAjXG4gICAgICAjIE9yaWdpbmFsIHRhYmxlIGRhdGEgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdvcmlnaW4nKS5hZGRDbGFzcygnYXNjJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgVGFibGUgbm90IG9yZGVyZWQgeWV0LlxuICAgICAgIyBTdG9yZSBvcmlnaW5hbCBkYXRhIHBvc2l0aW9uIGFuZCBzb3J0IGluIGFzYyBvcmRlci5cbiAgICAgICNcblxuICAgICAgY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmRhdGEoJ29yaWdpbicsIHJvd3Muc2xpY2UoMCkpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIGlmIEEgPCBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcblxuICAgIGlmIChtYWtlU29ydCkgdGhlbiByb3dzLnNvcnQgc29ydEZ1bmN0aW9uXG4gICAgJC5lYWNoIHJvd3MsIChpbmRleCwgcm93KSAtPlxuICAgICAgICAkKHRhYmxlKS5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQocm93KVxuICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChsYXN0Um93KVxuXG5pbml0VGFibGVIYW5kbGVycyA9IChwZXJzb24sIGNhdGVnb3JpZXMsIGVsZWN0ZWRPZmZpY2lhbHMpIC0+XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKVxuXG4gICAgJCgnLmVkaXRhYmxlJykuZWRpdGFibGUoe3N0eWxlc2hlZXRzOiBmYWxzZSx0eXBlOiAndGV4dGFyZWEnLCBzaG93YnV0dG9uczogJ2JvdHRvbScsIGRpc3BsYXk6IHRydWUsIGVtcHR5dGV4dDogJyAnfSlcbiAgICAkKCcuZWRpdGFibGUnKS5vZmYoJ2NsaWNrJyk7XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuZ2x5cGhpY29uLXBlbmNpbCcsIChlKSAtPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIGUuY3VycmVudFRhcmdldC5kYXRhc2V0Lm5vRWRpdGFibGUgaXNudCB1bmRlZmluZWQgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylbMF0uaWQpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpLmF0dHIoJ2RhdGEtaWQnKSlcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCBOdW1iZXIoKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpKVswXS5jZWxsSW5kZXgpICsgMSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuXG4gICAgI1xuICAgICMgQWRkIHNvcnQgaGFuZGxlcnMuXG4gICAgI1xuICAgICQoJy5zb3J0Jykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIHR5cGUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtc29ydC10eXBlJylcblxuICAgICAgaWYgdHlwZSBpcyAneWVhcidcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgeWVhci5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMClcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnbmFtZSdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgbmFtZS5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMSlcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnYW1vdW50J1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBhbW91bnQuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDMpXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ2NvbnRyaWJ1dG9yLXR5cGUnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGNvbnRyaWJ1dG9yIHR5cGUuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDQpXG5cbiAgICAkKCdhJykub24gJ3NhdmUnLCAoZSwgcGFyYW1zKSAtPlxuICAgICAgICBlbnRpdHlUeXBlID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RhYmxlJylbMF0uZGF0YXNldC5lbnRpdHlUeXBlXG4gICAgICAgIGlkID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJylbMF0uZGF0YXNldC5pZFxuICAgICAgICBmaWVsZCA9IE9iamVjdC5rZXlzKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpWzBdLmRhdGFzZXQpWzBdXG5cbiAgICAgICAgaWYgZmllbGQgaXMgJ3ZvdGUnIG9yIGZpZWxkIGlzICdkaWRFbGVjdGVkT2ZmaWNpYWxQcm9wb3NlVGhpcydcbiAgICAgICAgICAjIyNcbiAgICAgICAgICAgIEN1cnJlbnQgZmllbGQgb3duZWQgYnkgRWxlY3RlZE9mZmljaWFsVm90ZVxuICAgICAgICAgICMjI1xuICAgICAgICAgIGVudGl0eVR5cGUgPSAnRWxlY3RlZE9mZmljaWFsVm90ZSdcbiAgICAgICAgICBpZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5maW5kKCdzcGFuJylbMF0uZGF0YXNldC5pZFxuXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XG4gICAgICAgICAgICBlZGl0UmVxdWVzdDoge1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXG4gICAgICAgICAgICAgICAgZW50aXR5SWQ6IGlkLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0LmNoYW5nZXNbZmllbGRdID0gcGFyYW1zLm5ld1ZhbHVlXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0KTtcbiAgICAgICAgJC5hamF4ICcvZWRpdHJlcXVlc3QvY3JlYXRlJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqZWN0LFxuICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0L2pzb24nLFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIHRleHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgfVxuXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmFkZCcsIChlKSAtPlxuICAgICAgICB0YWJQYW5lID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylcbiAgICAgICAgdGFibGVUeXBlID0gdGFiUGFuZVswXS5pZFxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtICd0YWJsZVR5cGUnLCB0YWJsZVR5cGVcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY3VycmVudEVudGl0eSA9IG51bGxcbiAgICAgICAgY29uc29sZS5sb2codGFibGVUeXBlKVxuICAgICAgICBpZiB0YWJsZVR5cGUgaXMgJ1ZvdGVzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdMZWdpc2xhdGlvbidcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnQ29udHJpYnV0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZENvbnRyaWJ1dGlvbnMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnRW5kb3JzZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkRW5kb3JzZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdQdWJsaWNTdGF0ZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIFNldCBnZXQgdXJsIGNhbGxiYWNrLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAkKCcudXJsLWlucHV0Jykub24gJ2tleXVwJywgKCkgLT5cbiAgICAgICAgICAgICAgbWF0Y2hfdXJsID0gL1xcYihodHRwcz8pOlxcL1xcLyhbXFwtQS1aMC05Ll0rKShcXC9bXFwtQS1aMC05KyZAI1xcLyU9fl98ITosLjtdKik/KFxcP1tBLVowLTkrJkAjXFwvJT1+X3whOiwuO10qKT8vaVxuICAgICAgICAgICAgICBpZiAobWF0Y2hfdXJsLnRlc3QoJCh0aGlzKS52YWwoKSkpXG4gICAgICAgICAgICAgICAgJC5hamF4ICcvYXBpL3VybC9leHRyYWN0Jywge1xuICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAkKHRoaXMpLnZhbCgpLm1hdGNoKG1hdGNoX3VybClbMF1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudCA9ICQoJyN1cmwtc3RhdGVtZW50JylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgQ2xlYXIuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgJycpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIFNldCB0aXRsZS5cbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2h0bWwnKVxuICAgICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgICAjIElmIHVybCBwb2ludCB0byBodG1sLCBoaWRlIGltZyBhbmQgc2V0IGJvZHkuXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQocmVzcG9uc2UuZGF0YS5ib2R5KVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAneW91dHViZScpXG4gICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICMgSWYgdXJsIHBvaW50IHRvIHlvdXR1YmUsIHNob3cgeW91dHViZSBwcmV2aWV3IGltYWdlLlxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEucHJldmlldylcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhLnByZXZpZXcpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuc2xpZGVEb3duKClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQgPSAkKCcjdXJsLXN0YXRlbWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIENsZWFyLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsICcnKVxuXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KGVycm9yLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcyA9IChzZWxlY3QpIC0+XG4gICAgICAgICAgZW5kT2JqID0ge31cbiAgICAgICAgICBjYXRlZ29yaWVzLmZvckVhY2ggKGl0ZW0pIC0+XG4gICAgICAgICAgICBlbmRPYmpbaXRlbS5pZF0gPSBpdGVtLm5hbWVcbiAgICAgICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgJ2lzc3VlQ2F0ZWdvcnknKVxuICAgICAgICAgICMgQWRkIGZpcnN0IGJsYW5rIG9wdGlvbi5cbiAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJycpXG4gICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gJydcbiAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcbiAgICAgICAgICBmb3Iga2V5IG9mIGVuZE9ialxuICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSlcbiAgICAgICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gZW5kT2JqW2tleV1cbiAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MXG5cbiAgICAgICAgaWYgdGFiUGFuZS5oYXNDbGFzcygnbG9hZGVkJykgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdGFiUGFuZVswXS5jbGFzc0xpc3QuYWRkKCdsb2FkZWQnKVxuXG4gICAgICAgIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0VuZG9yc2VtZW50J1xuXG4gICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnQ29udHJpYnV0aW9uJ1xuXG4gICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnTGVnaXNsYXRpb24nXG4gICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKCQoJyNhZGRWb3RlcyBzZWxlY3QnKVswXSlcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLmZpbmQoJ1tkYXRhLXByb3ZpZGU9XCJkYXRlcGlja2VyXCJdJykub24oXG4gICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgKCkgLT5cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIgJ2hpZGUnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIEZpbGwgZWxlY3RlZCBvZmZpY2lhbHMgdm90ZXMgdGFibGUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNsZWdpc2xhdGlvbi12b3RlJykuaHRtbCgpKVxuICAgICAgICAgICAgJCgnI2VsZWN0ZWRWb3RlcycpLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShlbGVjdGVkT2ZmaWNpYWxzKTtcblxuICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMoJCgnI2FkZFN0YXRlbWVudHMgc2VsZWN0JylbMF0pXG4gICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLmZpbmQoJ1tkYXRhLXByb3ZpZGU9XCJkYXRlcGlja2VyXCJdJykub24oXG4gICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgKCkgLT5cbiAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIgJ2hpZGUnXG4gICAgICAgICAgICApXG5cbiAgICB3aW5kb3cuYWRkSXRlbSA9IChlKSAtPlxuICAgICAgICBuZXdSZWNvcmQgPSB7fVxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXG4gICAgICAgIG1vZGFsVHlwZSA9IG1vZGFsWzBdLmlkXG4gICAgICAgIGVudGl0eVR5cGUgPSBtb2RhbFswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgR2V0IHZhbHVlIGZyb20gaW5wdXQgZmllbGRzLlxuICAgICAgICAjIyNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIHRleGFyZWEncy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ3RleHRhcmVhJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICBhc3NvY2lhdGlvbnMgPSB7fVxuICAgICAgICBpZiBtb2RhbFR5cGUgIT0gJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW1wiZWxlY3RlZE9mZmljaWFsXCJdID0gcGVyc29uLmlkXG4gICAgICAgICNcbiAgICAgICAgIyBBcnJheSBvZiBzdWIgZW50aXRpZXMuXG4gICAgICAgICNcbiAgICAgICAgY2hpbGRzID0gW11cblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgQWRkIGluZm9ybWF0aW9uIGFib3V0IHZvdGVzLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBtb2RhbC5maW5kKCcjZWxlY3RlZFZvdGVzJykuZmluZCgndHJbZGF0YS1lbGVjdGVkXScpLiBlYWNoIChpZHgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoZWxlbWVudClcblxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAjIEdldCBhbGwgc3ViIGVudGl0eSBmaWVsZHMuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGRhdGEgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3NlbGVjdCcpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgIEFkZCBvbmx5IGlmIGFsbCBmaWVsZHMgaXMgc2V0LlxuICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIGlmIE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkcyA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydmaWVsZHMnXSA9IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXVtlbGVtZW50LmF0dHIoJ2RhdGEtZW50aXR5LXR5cGUnKV0gPSBlbGVtZW50LmF0dHIoJ2RhdGEtZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5TmFtZSA9IGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkuYXR0ciAnZGF0YS1lbnRpdHktdHlwZSdcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5TmFtZTogY2hpbGRFbnRpdHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoaWxkIGZpZWxkcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkczogZmllbGRzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCBjYXRlZ29yeS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGNhdGVnb3J5LicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGZpZWxkczogeyBmaWVsZHM6IG5ld1JlY29yZCwgYXNzb2NpYXRpb25zOiBhc3NvY2lhdGlvbnMsIGNoaWxkczogY2hpbGRzfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEFwcGVuZCBuZXcgZW50aXR5IHRvIHRhYmxlLlxuICAgICAgICAjIyNcbiAgICAgICAgcm93VGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJChcIiNyb3ctI3ttb2RhbFR5cGV9XCIpLmh0bWwoKSk7XG5cbiAgICAgICAgI1xuICAgICAgICAjIENvbGxlY3QgZGF0YS5cbiAgICAgICAgI1xuICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgIGRhdGFbJ3VzZXInXSA9IHVzZXIudXNlcm5hbWVcblxuICAgICAgICBjb25zb2xlLmxvZyBwZXJzb25cblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIENoZWNrIGlmIHVzZXIgc3BlY2lmaWVkIGhvdyBjdXJyZW50IGVsZWN0ZWQgb2ZmaWNpYWwgdm90ZWQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIG9iaiBpbiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmNoaWxkc1xuICAgICAgICAgICAgICBpZiBOdW1iZXIob2JqLmZpZWxkcy5hc3NvY2lhdGlvbnMuZWxlY3RlZE9mZmljaWFsKSA9PSBOdW1iZXIocGVyc29uLmlkKVxuICAgICAgICAgICAgICAgIGFkZCA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmouZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIElmIHdlIGZvdW5kLCBzaG93LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgICAkKCcjVm90ZXMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZGF0YS5jb250cmlidXRvclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgIGRhdGEuY29udHJpYnV0aW9uQW1vdW50ID0gbnVtZXJhbChkYXRhLmNvbnRyaWJ1dGlvbkFtb3VudCkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgICAgICAkKCcjQ29udHJpYnV0aW9ucyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgZGF0YS5lbmRvcnNlclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICQoJyNFbmRvcnNlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAkKCcjU3RhdGVtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIFNlbmQgY3JlYXRlIHJlcXVlc3QgdG8gYXBpLlxuICAgICAgICAjIyNcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L2NyZWF0ZScsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAjIENsb3NlIG1vZGFsIHdpbmRvd1xuICAgICAgICBtb2RhbC5tb2RhbCAnaGlkZSdcblxuICAgICMjI1xuICAgICAgICBJZiB1c2VyIHRyeSB0byBhZGQgb3IgdXBkYXRlIHNvbWUgZGF0YSB3aXRob3V0IGxvZ2dlZCBpbiwgd2VcbiAgICAgICAgc2hvdyBoaW0gbG9naW4vc2lnbiB1cCB3aW5kb3cuIEFmdGVyIGF1dGhvcml6aW5nIHVzZXIgcmVkaXJlY3QgYmFja1xuICAgICAgICB0byBwYWdlLCB3aGVyZSBoZSBwcmVzIGFkZC9lZGl0IGJ1dHRvbi4gSW4gdGhhdCBjYXNlIHdlIHNob3cgaGltIGFwcHJvcHJpYXRlXG4gICAgICAgIG1vZGFsIHdpbmRvdy5cbiAgICAjIyNcbiAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICByZXR1cm5cblxuICAgIHR5cGUgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndGFibGVUeXBlJylcbiAgICBkYXRhSWQgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnZGF0YUlkJylcbiAgICBmaWVsZCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdmaWVsZCcpXG5cbiAgICBpZiAoZGF0YUlkICYmIGZpZWxkKVxuICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgJCgndHJbZGF0YS1pZD0nK2RhdGFJZCsnXScpLmZpbmQoJ3RkOm50aC1jaGlsZCgnK2ZpZWxkKycpJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3RhYmxlVHlwZScsICcnKVxuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICcnKVxuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2ZpZWxkJywgJycpXG5cbiAgICBlbHNlIGlmICh0eXBlKVxuICAgICAgJCgnZGl2IycgKyB0eXBlKS5maW5kKCcuYWRkJykuY2xpY2soKVxuICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3RhYmxlVHlwZScsICcnKVxuXG5cbiMjI1xuICBBcHBlbmQgY3JlYXRlIHJlcXVlc3RzIHRvIGFsbCBjdXJyZW50IGVsZWN0ZWRPZmZpY2lhbCBwYWdlLlxuIyMjXG5zaG93Q3JlYXRlUmVxdWVzdHMgPSAocGVyc29uLCBjcmVhdGVSZXF1ZXN0cykgLT5cbiAgICAjIERvbid0IHNob3cgbm90IGFwcHJvdmVkIGNyZWF0ZSByZXF1ZXN0IHRvIGFub24uXG4gICAgaWYgKCFhdXRob3JpemVkKSB0aGVuIHJldHVyblxuXG4gICAgbGVnaXNsYXRpb25Sb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRWb3RlcycpLmh0bWwoKSlcbiAgICBjb250cmlidXRpb25Sb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRDb250cmlidXRpb25zJykuaHRtbCgpKVxuICAgIGVuZG9yc2VtZW50Um93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkRW5kb3JzZW1lbnRzJykuaHRtbCgpKVxuICAgIHN0YXRlbWVudFJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZFN0YXRlbWVudHMnKS5odG1sKCkpXG5cbiAgICBmb3IgcmVxdWVzdCBpbiBjcmVhdGVSZXF1ZXN0c1xuICAgICAgICAjXG4gICAgICAgICMgUHJlcGFyZSBjcmVhdGUgcmVxdWVzdCBkYXRhIGZvciB0ZW1wbGF0ZS5cbiAgICAgICAgI1xuICAgICAgICBkYXRhID0gcmVxdWVzdC5maWVsZHMuZmllbGRzXG4gICAgICAgIGRhdGFbJ3VzZXInXSA9IHJlcXVlc3QudXNlci51c2VybmFtZVxuXG4gICAgICAgICNcbiAgICAgICAgIyBGaW5kIG91dCB0ZW1wbGF0ZSBmb3IgY3VycmVudCByZXF1ZXN0IGFuZCBhZGRpdGlvbmFsIHZhbHVlcy5cbiAgICAgICAgI1xuICAgICAgICBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiTGVnaXNsYXRpb25cIlxuICAgICAgICAgICAgbmFtZSA9ICdWb3RlcydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gbGVnaXNsYXRpb25Sb3dcbiAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHJlcXVlc3QuZmllbGRzLmNoaWxkc1swXS5maWVsZHMuZmllbGRzXG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBjYXRlZ29yaWVzW3JlcXVlc3QuZmllbGRzLmFzc29jaWF0aW9ucy5pc3N1ZUNhdGVnb3J5IC0gMV0ubmFtZVxuXG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkNvbnRyaWJ1dGlvblwiXG4gICAgICAgICAgICBuYW1lID0gJ0NvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGNvbnRyaWJ1dGlvblJvd1xuXG4gICAgICAgICAgICBkYXRhWydjb250cmlidXRpb25BbW91bnQnXSA9IG51bWVyYWwoZGF0YVsnY29udHJpYnV0aW9uQW1vdW50J10pLmZvcm1hdCgnMCwwMDAnKVxuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJFbmRvcnNlbWVudFwiXG4gICAgICAgICAgICBuYW1lID0gJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gZW5kb3JzZW1lbnRSb3dcbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiUHVibGljU3RhdGVtZW50XCJcbiAgICAgICAgICAgIG5hbWUgPSAnU3RhdGVtZW50cydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gc3RhdGVtZW50Um93XG5cbiAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBjYXRlZ29yaWVzW3JlcXVlc3QuZmllbGRzLmFzc29jaWF0aW9ucy5pc3N1ZUNhdGVnb3J5IC0gMV0ubmFtZVxuXG4gICAgICAgICQoXCJcXCMje25hbWV9IHRyOmxhc3QtY2hpbGRcIikuYmVmb3JlKHRlbXBsYXRlKGRhdGEpKVxuXG5cbiQoJyNkYXRhQ29udGFpbmVyJykucG9wb3Zlcih7XG4gICAgcGxhY2VtZW50OiAnYm90dG9tJ1xuICAgIHNlbGVjdG9yOiAnLnJhbmsnXG4gICAgYW5pbWF0aW9uOiB0cnVlXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiIHJvbGU9XCJ0b29sdGlwXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicG9wb3Zlci10aXRsZS1jdXN0b21cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2Pidcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpZl9lcScsIChhLCBiLCBvcHRzKSAtPlxuICAgIGlmKGEgPT0gYilcbiAgICAgICAgcmV0dXJuIG9wdHMuZm4gdGhpc1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG9wdHMuaW52ZXJzZSB0aGlzXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2NvbmNhdCcsIChwYXJhbTEsIHBhcmFtMikgLT5cbiAgICB0ZW1wID0gW3BhcmFtMSwgcGFyYW0yXVxuICAgIHJldHVybiB0ZW1wLmpvaW4oJycpXG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KTtcbiAgICBwb3BvdmVyQ29udGVudCA9ICRlbGVtZW50LnBhcmVudCgpLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKVxuICAgIGZpZWxkTmFtZSA9ICRlbGVtZW50LmF0dHIoJ2RhdGEtZmllbGQnKVxuICAgIG1hc2sgPSAkZWxlbWVudC5hdHRyKCdkYXRhLW1hc2snKVxuICAgIHBvcG92ZXJUcGwgPSAkKCcjcmFua1BvcG92ZXInKS5odG1sKClcbiAgICBhZGRpdGlvbmFsUm93c1RwbCA9ICQoJyNhZGRpdGlvbmFsUm93cycpLmh0bWwoKVxuICAgIHByZWxvYWRlciA9IHBvcG92ZXJDb250ZW50LmZpbmQoJ2xvYWRlcicpXG5cbiAgICBwcmV2aW91c1Njcm9sbFRvcCA9IDA7XG4gICAgY3VycmVudFBhZ2UgPSAwO1xuICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICBwb3BvdmVyT3JkZXIgPSBudWxsO1xuICAgIHBvcG92ZXJOYW1lT3JkZXIgPSBudWxsO1xuXG4gICAgIyBDbG9zZSBhbGwgb3RoZXIgcG9wb3ZlcnNcbiAgICBpZiAhJGVsZW1lbnQuY2xvc2VzdCgnLnBvcG92ZXInKVswXVxuICAgICAgICAkKCcucmFuaycpLm5vdChlLnRhcmdldCkucG9wb3ZlcignZGVzdHJveScpXG5cbiAgICBmb3JtYXREYXRhID0gKGRhdGEpIC0+XG4gICAgICAgIGlmIG1hc2tcbiAgICAgICAgICAgIGRhdGEuZGF0YS5mb3JFYWNoIChyYW5rKSAtPlxuICAgICAgICAgICAgICAgIHJhbmsuYW1vdW50ID0gbnVtZXJhbChyYW5rLmFtb3VudCkuZm9ybWF0KG1hc2spXG5cbiAgICBsb2FkTmV3Um93cyA9ICgpIC0+XG4gICAgICAgIGxvYWRpbmcgPSB0cnVlO1xuICAgICAgICBwcmVsb2FkZXIuc2hvdygpXG4gICAgICAgIHRhYmxlID0gcG9wb3ZlckNvbnRlbnQuZmluZCgndGFibGUgdGJvZHknKVxuICAgICAgICB0YWJsZS5odG1sICcnXG4gICAgICAgIGN1cnJlbnRQYWdlID0gMFxuICAgICAgICBwcmV2aW91c1Njcm9sbFRvcCA9IDBcbiAgICAgICAgZmllbGROYW1lSW5DYW1lbENhc2UgPSBmaWVsZE5hbWUucmVwbGFjZSAvXyhbYS16MC05XSkvZywgKGcpIC0+IHJldHVybiBnWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2dvdmVybm1lbnQnK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSsnL2dldF9yYW5rcydcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgIHBhZ2U6IGN1cnJlbnRQYWdlXG4gICAgICAgICAgICAgICAgb3JkZXI6IHBvcG92ZXJPcmRlclxuICAgICAgICAgICAgICAgIG5hbWVfb3JkZXI6IHBvcG92ZXJOYW1lT3JkZXJcbiAgICAgICAgICAgICAgICBmaWVsZF9uYW1lOiBmaWVsZE5hbWVJbkNhbWVsQ2FzZSAjIFRyYW5zZm9ybSB0byBjYW1lbENhc2VcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGZvcm1hdERhdGEoZGF0YSlcbiAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKGFkZGl0aW9uYWxSb3dzVHBsKVxuICAgICAgICAgICAgICAgIHRhYmxlLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKVxuICAgICAgICAgICAgICAgIGxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBwcmVsb2FkZXIuaGlkZSgpXG5cbiAgICAjIFNvcnQgdGFibGUgaW4gcG9wb3ZlclxuICAgIHBvcG92ZXJDb250ZW50Lm9uICdjbGljaycsICd0aCcsIChlKSAtPlxuICAgICAgICAkY29sdW1uID0gYCQoZS50YXJnZXQpLmhhc0NsYXNzKCdzb3J0YWJsZScpID8gJChlLnRhcmdldCkgOiAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0aCcpO2BcbiAgICAgICAgaWYgJGNvbHVtbi5oYXNDbGFzcygnc29ydGFibGUnKVxuICAgICAgICAgICAgaWYgJGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAgICAgICAgICAgaWYgJGNvbHVtbi5hdHRyKCdkYXRhLXNvcnQtdHlwZScpIGlzICduYW1lX29yZGVyJ1xuICAgICAgICAgICAgICAgICAgICBwb3BvdmVyTmFtZU9yZGVyID0gJydcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHBvcG92ZXJPcmRlciA9ICcnXG4gICAgICAgICAgICAgICAgbG9hZE5ld1Jvd3MoKVxuICAgICAgICAgICAgICAgICRjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5yZW1vdmVDbGFzcygnYXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICAgICAgICBlbHNlIGlmICRjb2x1bW4uaGFzQ2xhc3MoJ2FzYycpXG4gICAgICAgICAgICAgICAgaWYgJGNvbHVtbi5hdHRyKCdkYXRhLXNvcnQtdHlwZScpIGlzICduYW1lX29yZGVyJ1xuICAgICAgICAgICAgICAgICAgICBwb3BvdmVyTmFtZU9yZGVyID0gJ2Rlc2MnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwb3BvdmVyT3JkZXIgPSAnZGVzYydcbiAgICAgICAgICAgICAgICBsb2FkTmV3Um93cygpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5yZW1vdmVDbGFzcygnYXNjJykuYWRkQ2xhc3MoJ2Rlc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKS5hZGRDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiAkY29sdW1uLmF0dHIoJ2RhdGEtc29ydC10eXBlJykgaXMgJ25hbWVfb3JkZXInXG4gICAgICAgICAgICAgICAgICAgIHBvcG92ZXJOYW1lT3JkZXIgPSAnYXNjJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcG9wb3Zlck9yZGVyID0gJ2FzYydcbiAgICAgICAgICAgICAgICBsb2FkTmV3Um93cygpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5hZGRDbGFzcygnYXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLmZpbmQoJ2knKS5hZGRDbGFzcygnaWNvbl9fdG9wJylcblxuICAgICMgUmVuZGVyIHRhYmxlIGFuZCBpbnNlcnQgaW50byBwb3BvdmVyLWNvbnRlbnRcbiAgICBpZiBmaWVsZE5hbWVcbiAgICAgICAgZmllbGROYW1lSW5DYW1lbENhc2UgPSBmaWVsZE5hbWUucmVwbGFjZSAvXyhbYS16MC05XSkvZywgKGcpIC0+IHJldHVybiBnWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2dvdmVybm1lbnQnK3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSsnL2dldF9yYW5rcydcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgIGZpZWxkX25hbWU6IGZpZWxkTmFtZUluQ2FtZWxDYXNlICMgVHJhbnNmb3JtIHRvIGNhbWVsQ2FzZVxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgZm9ybWF0RGF0YShkYXRhKVxuICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUocG9wb3ZlclRwbClcbiAgICAgICAgICAgICAgICBwb3BvdmVyQ29udGVudC5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZGF0YSlcblxuICAgICMgTGF6eSBsb2FkIGZvciBwb3BvdmVyXG4gICAgcG9wb3ZlckNvbnRlbnQuc2Nyb2xsICgpIC0+XG4gICAgICBjdXJyZW50U2Nyb2xsVG9wID0gcG9wb3ZlckNvbnRlbnQuc2Nyb2xsVG9wKClcbiAgICAgIGlmICBwcmV2aW91c1Njcm9sbFRvcCA8IGN1cnJlbnRTY3JvbGxUb3AgJiYgY3VycmVudFNjcm9sbFRvcCA+IDAuNSAqIHBvcG92ZXJDb250ZW50WzBdLnNjcm9sbEhlaWdodFxuICAgICAgICBjb25zb2xlLmxvZygnYXNkYXNkJyk7XG4gICAgICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gY3VycmVudFNjcm9sbFRvcFxuICAgICAgICBpZiBsb2FkaW5nIGlzIGZhbHNlXG4gICAgICAgICAgbG9hZGluZyA9IHRydWVcbiAgICAgICAgICBwcmVsb2FkZXIuc2hvdygpO1xuICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICB1cmw6ICcvYXBpL2dvdmVybm1lbnQnICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJy9nZXRfcmFua3MnXG4gICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgICBwYWdlOiArK2N1cnJlbnRQYWdlXG4gICAgICAgICAgICAgICAgICBvcmRlcjogcG9wb3Zlck9yZGVyXG4gICAgICAgICAgICAgICAgICBuYW1lX29yZGVyOiBwb3BvdmVyTmFtZU9yZGVyXG4gICAgICAgICAgICAgICAgICBmaWVsZF9uYW1lOiBmaWVsZE5hbWVJbkNhbWVsQ2FzZSAjIFRyYW5zZm9ybSB0byBjYW1lbENhc2VcbiAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICBmb3JtYXREYXRhKGRhdGEpXG4gICAgICAgICAgICAgICAgICBsb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgIHByZWxvYWRlci5oaWRlKClcbiAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoYWRkaXRpb25hbFJvd3NUcGwpXG4gICAgICAgICAgICAgICAgICBwb3BvdmVyQ29udGVudC5maW5kKCd0YWJsZSB0Ym9keScpWzBdLmlubmVySFRNTCArPSBjb21waWxlZFRlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgJy5lbGVjdGVkX2xpbmsnLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXJsID0gZS5jdXJyZW50VGFyZ2V0LnBhdGhuYW1lXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgdXJsLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbiA9IGRhdGEucGVyc29uXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3RzID0gZGF0YS5jcmVhdGVSZXF1ZXN0c1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi5nb3ZfYWx0X25hbWUgPSBwZXJzb24uZ292ZXJubWVudC5zbHVnLnJlcGxhY2UoL18vZywgJyAnKVxuXG4gICAgICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNvbnRyaWJ1dGlvbiBpbiBwZXJzb24uY29udHJpYnV0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQgPSBudW1lcmFsKGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50KS5mb3JtYXQoJzAsMDAwJylcblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBwZXJzb24udm90ZXMuZm9yRWFjaCAoaXRlbSwgaXRlbUxpc3QpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkLCAnWVlZWS1NTS1ERCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLmZvcm1hdCAnTCdcblxuICAgICAgICAgICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogaHRtbH0sICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcycsIHVybFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGluaXRUYWJsZUhhbmRsZXJzKHBlcnNvbiwgY2F0ZWdvcmllcywgZGF0YS5lbGVjdGVkT2ZmaWNpYWxzKTtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuIyBSb3V0ZSAvXG5pZiByb3V0ZVR5cGUgaXMgMFxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIGdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICcvbGVnYWN5L2RhdGEvaF90eXBlc19jYV8yLmpzb24nLCA3XG4gICAgZ292X3NlbGVjdG9yLm9uX3NlbGVjdGVkID0gKGV2dCwgZGF0YSwgbmFtZSkgLT5cbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIHVybCA9ICcvJyArIGRhdGEuYWx0VHlwZVNsdWcgKyAnLycgKyBkYXRhLnNsdWdcbiAgICAgICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXG4gICAgaWYgIXVuZGVmXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5odG1sICQoJyNzZWFyY2gtY29udGFpbmVyLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICMgTG9hZCBpbnRyb2R1Y3RvcnkgdGV4dCBmcm9tIHRleHRzL2ludHJvLXRleHQuaHRtbCB0byAjaW50cm8tdGV4dCBjb250YWluZXIuXG4gICAgICAgICMkLmdldCBcIi9sZWdhY3kvdGV4dHMvaW50cm8tdGV4dC5odG1sXCIsIChkYXRhKSAtPiAkKFwiI2ludHJvLXRleHRcIikuaHRtbCBkYXRhXG4gICAgICAgICMkKFwiI2ludHJvLXRleHRcIikuaHRtbCAkKFwiI2ludHJvXCIpXG4gICAgICAgIGdvdm1hcCA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcbiAgICAgICAgZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29uc1xuICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwoKX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnLydcbiAgICAgICAgdW5kZWYgPSB0cnVlXG4gICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcbiAgICBzdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJCgnI2dvdm1hcCcpLm9uICdjbGljaycsICcuaW5mby13aW5kb3ctdXJpJywgKGUpIC0+XG4gICAgICAgIHVyaSA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC51cmlcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQuYWpheFxuIyAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZ292cykgLT5cbiAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJpXG5cbiMgUm91dGUgL3Jhbmtfb3JkZXJcbmlmIHJvdXRlVHlwZSBpcyAxXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIENpdmljIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuXG4gICAgb3JkZXJlZEZpZWxkcyA9IFtdXG5cbiAgICAjXG4gICAgIyBTZXQgc29ydCBjYWxsYmFjay5cbiAgICAjXG4gICAgJChkb2N1bWVudCkub24gJ2NsaWNrJywgJy5yYW5rX3NvcnQnLCAoZSkgLT5cbiAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG5cbiAgICAgIGNvbHVtbiA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuICAgICAgdGFiUGFuZWwgPSBjb2x1bW4uY2xvc2VzdCgnLnRhYi1wYW5lJylcbiAgICAgIGZpZWxkTmFtZSA9IGNvbHVtbi5hdHRyKCdkYXRhLXNvcnQtdHlwZScpXG4gICAgICBpY29uID0gY29sdW1uLmZpbmQoJ2knKVxuXG4gICAgICBpZiBpY29uLmhhc0NsYXNzKCdpY29uX190b3AnKVxuICAgICAgICAjXG4gICAgICAgICMgU29ydCBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICAgICAgICAjXG4gICAgICAgIGljb24uYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKVxuICAgICAgICBvcmRlcmVkRmllbGRzW2ZpZWxkTmFtZV0gPSAnZGVzYydcbiAgICAgIGVsc2UgaWYgaWNvbi5oYXNDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgICAgI1xuICAgICAgICAjIFJlbW92ZSBzb3J0IGJ5IHRoaXMgZmllbGQuXG4gICAgICAgICNcbiAgICAgICAgaWNvbi5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgICAgZGVsZXRlIG9yZGVyZWRGaWVsZHNbZmllbGROYW1lXVxuICAgICAgZWxzZVxuICAgICAgICAjXG4gICAgICAgICMgU29ydCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgICAgICNcbiAgICAgICAgaWNvbi5hZGRDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgICAgb3JkZXJlZEZpZWxkc1tmaWVsZE5hbWVdID0gJ2FzYydcblxuICAgICAgJC5hamF4XG4gICAgICAgIHVybDogXCIvYXBpL3Jhbmtfb3JkZXJcIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgYWx0X3R5cGU6IHRhYlBhbmVsLmF0dHIoJ2lkJylcbiAgICAgICAgICBmaWVsZHNfb3JkZXI6ICQuZXh0ZW5kKHt9LCBvcmRlcmVkRmllbGRzKVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiAgICAgICAgICAjXG4gICAgICAgICAgIyBVcGRhdGUgdGFibGVcbiAgICAgICAgICAjXG4gICAgICAgICAgdGFibGUgPSB0YWJQYW5lbC5maW5kKCd0YWJsZScpXG4gICAgICAgICAgaGVhZCA9IHRhYmxlLmZpbmQoJ3RyOmZpcnN0JylcblxuICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKTtcblxuICAgICAgICAgICNcbiAgICAgICAgICAjIFB1c2ggdGVtcGxhdGUuXG4gICAgICAgICAgI1xuICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6ICQoJyNkZXRhaWxzJykuaHRtbCgpfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvcmFua19vcmRlcidcblxuICAgIGFsdFR5cGVzRGF0YSA9IHt9XG4gICAgR09WV0lLSS5jdXJyZW50QWx0VHlwZSA9ICdDaXR5J1xuICAgIEdPVldJS0kuY3VycmVudEFsdFR5cGVMb3dlckNhc2UgPSAnY2l0eSdcbiAgICBHT1ZXSUtJLml0ZW1zUGVyUGFnZSA9IDEwO1xuICAgIEdPVldJS0kuY3VycmVudFBhZ2UgPSAwO1xuXG4gICAgc2V0RXZlbnRzID0gKCkgLT5cbiAgICAgICAgJCgnYVtkYXRhLXRvZ2dsZT1cInRhYlwiXScpLm9uICdzaG93bi5icy50YWInLCAoZSkgLT5cbiAgICAgICAgICAgIEdPVldJS0kuY3VycmVudEFsdFR5cGUgPSAkKGUudGFyZ2V0KS5hdHRyKFwiaHJlZlwiKS5yZXBsYWNlKCcjJywgJycpXG4gICAgICAgICAgICBHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlTG93ZXJDYXNlID0gR09WV0lLSS5jdXJyZW50QWx0VHlwZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBHT1ZXSUtJLmN1cnJlbnRQYWdlID0gMDtcbiAgICAgICAgICAgIHJlbmRlclBhZ2luYXRpb24oKVxuXG4gICAgICAgICQoJy5wYWdpbmF0aW9uJykub24gJ2NsaWNrJywgJ2EnLCAoZSkgLT5cbiAgICAgICAgICAgIHBhZ2UgPSAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLXBhZ2UnKVxuICAgICAgICAgICAgaWYgcGFnZSBpc250IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIEdPVldJS0kuY3VycmVudFBhZ2UgPSBwYXJzZUludChwYWdlKS0xXG4gICAgICAgICAgICAgICAgcmVuZGVyVGVtcGxhdGUoR09WV0lLSS5jdXJyZW50UGFnZSlcblxuICAgIHJlbmRlclBhZ2luYXRpb24gPSAoKSAtPlxuICAgICAgICAkcGFnaW5hdGlvbkNvbnRhaW5lciA9ICQoJyMnK0dPVldJS0kuY3VycmVudEFsdFR5cGUrJyAucGFnaW5hdGlvbicpXG4gICAgICAgICRwYWdpbmF0aW9uQ29udGFpbmVyLmh0bWwoJycpXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9scyA9ICcnXG4gICAgICAgIGlmIEdPVldJS0kuY3VycmVudFBhZ2UgPiAwXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgYXJpYS1sYWJlbD1cIlByZXZpb3VzXCIgb25jbGljaz1cIkdPVldJS0kucHJldlBhZ2UoZXZlbnQpXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JmxhcXVvOzwvc3Bhbj48L2E+PC9saT4nXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgZGF0YS1wYWdlPVwiJytHT1ZXSUtJLmN1cnJlbnRQYWdlKydcIj4nICsgKEdPVldJS0kuY3VycmVudFBhZ2UpICsgJzwvYT48L2xpPidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xzICs9ICc8bGkgY2xhc3M9XCJkaXNhYmxlZFwiPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXNcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mbGFxdW87PC9zcGFuPjwvYT48L2xpPidcblxuICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaSBjbGFzcz1cImFjdGl2ZVwiPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBkYXRhLXBhZ2U9XCInKyhHT1ZXSUtJLmN1cnJlbnRQYWdlKzEpKydcIj4nICsgKEdPVldJS0kuY3VycmVudFBhZ2UrMSkgKyAnPC9hPjwvbGk+J1xuXG4gICAgICAgIGlmIEdPVldJS0kuY3VycmVudFBhZ2UgaXMgR09WV0lLSS5sYXN0UGFnZSgpXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaSBjbGFzcz1cImRpc2FibGVkXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGFyaWEtbGFiZWw9XCJOZXh0XCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnJhcXVvOzwvc3Bhbj48L2E+PC9saT4nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBkYXRhLXBhZ2U9XCInKyhHT1ZXSUtJLmN1cnJlbnRQYWdlKzIpKydcIj4nICsgKEdPVldJS0kuY3VycmVudFBhZ2UrMikgKyAnPC9hPjwvbGk+J1xuICAgICAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xzICs9ICc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGFyaWEtbGFiZWw9XCJOZXh0XCIgb25jbGljaz1cIkdPVldJS0kubmV4dFBhZ2UoZXZlbnQpXCI+PHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnJhcXVvOzwvc3Bhbj48L2E+PC9saT4nXG4gICAgICAgICRwYWdpbmF0aW9uQ29udGFpbmVyLmFwcGVuZChwYWdpbmF0aW9uQ29udHJvbHMpO1xuXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCIvYXBpL3Jhbmtfb3JkZXJcIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgYWx0VHlwZXNEYXRhID0gZGF0YTtcbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgUmVuZGVyIHJhbmsgb3JkZXIgdGVtcGxhdGUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICB0cGwgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jhbmstb3JkZXItcGFnZScpLmh0bWwoKSlcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0cGwoYWx0VHlwZXNEYXRhKVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKTtcblxuICAgICAgICAgICAgc2V0RXZlbnRzKClcbiAgICAgICAgICAgIHJlbmRlclBhZ2luYXRpb24oKVxuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIFB1c2ggdGVtcGxhdGUuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiMgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiB0cGx9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy9yYW5rX29yZGVyJ1xuXG4gICAgcmVuZGVyVGVtcGxhdGUgPSAocGFnZSkgLT5cbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6IFwiL2FwaS9yYW5rX29yZGVyXCJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICBkYXRhOlxuICAgICAgICAgICAgICAgIGFsdF90eXBlOiBHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlXG4gICAgICAgICAgICAgICAgcGFnZTogcGFnZSB8fCBHT1ZXSUtJLmN1cnJlbnRQYWdlXG4gICAgICAgICAgICAgICAgbGltaXQ6IEdPVldJS0kuaXRlbXNQZXJQYWdlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBhbHRUeXBlc0RhdGFbR09WV0lLSS5jdXJyZW50QWx0VHlwZUxvd2VyQ2FzZV0gPSBkYXRhXG5cbiAgICAgICAgICAgICAgICB0cGwgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3RhYmxlLScrR09WV0lLSS5jdXJyZW50QWx0VHlwZUxvd2VyQ2FzZS5yZXBsYWNlKC9fLywgJy0nKSkuaHRtbCgpKVxuICAgICAgICAgICAgICAgICQoJyMnK0dPVldJS0kuY3VycmVudEFsdFR5cGUpLmh0bWwgdHBsKGFsdFR5cGVzRGF0YSlcbiAgICAgICAgICAgICAgICBzZXRFdmVudHMoKVxuICAgICAgICAgICAgICAgIHJlbmRlclBhZ2luYXRpb24oKVxuXG4gICAgR09WV0lLSS5uZXh0UGFnZSA9IChlKSAtPlxuICAgICAgICArK0dPVldJS0kuY3VycmVudFBhZ2VcbiAgICAgICAgcmVuZGVyVGVtcGxhdGUoKVxuXG5cbiAgICBHT1ZXSUtJLnByZXZQYWdlID0gKGUpIC0+XG4gICAgICAgIC0tR09WV0lLSS5jdXJyZW50UGFnZVxuICAgICAgICByZW5kZXJUZW1wbGF0ZSgpXG5cblxuICAgIEdPVldJS0kuZmlyc3RQYWdlID0gICgpIC0+XG4gICAgICAgIHJldHVybiBgR09WV0lLSS5jdXJyZW50UGFnZSA9PSAwYFxuXG4gICAgR09WV0lLSS5sYXN0UGFnZSA9ICAoKSAtPlxuICAgICAgICBsYXN0UGFnZSA9IE1hdGguY2VpbChhbHRUeXBlc0RhdGEuY291bnQgLyBHT1ZXSUtJLml0ZW1zUGVyUGFnZSAtIDEpXG4gICAgICAgIHJldHVybiBHT1ZXSUtJLmN1cnJlbnRQYWdlID09IGxhc3RQYWdlXG5cbiAgICBHT1ZXSUtJLm51bWJlck9mUGFnZXMgPSAoKSAtPlxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKGFsdFR5cGVzRGF0YS5jb3VudCAvIEdPVldJS0kuaXRlbXNQZXJQYWdlKVxuICAgIFxuXG5cbiMgUm91dGUgLzphbHRfbmFtZS86Y2l0eV9uYW1lXG5pZiByb3V0ZVR5cGUgaXMgMlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBDaXZpYyBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICB0ZW1wbGF0ZXMubG9hZF9mdXNpb25fdGVtcGxhdGUgXCJ0YWJzXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZnVzaW9udGFibGVzL3YyL3F1ZXJ5P3NxbD1TRUxFQ1QlMjAqJTIwRlJPTSUyMDF6Mm9YUUVZUTNwMk9vTUk4VjVnS2dIV0I1VHo5OTBCclExeGMxdFZvJmtleT1BSXphU3lDWERReU1EcEdBMmczUWp1djRDRHY3elJqLWl4NElRSkFcIlxuICAgICQuYWpheFxuIyAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgcnVuID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgcnVuXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IHJ1bn0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB3aW5kb3cucGF0aFxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDNcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGEucGVyc29uXG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0cyA9IGRhdGEuY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QgPSBbXVxuICAgICAgICAgICAgcGVyc29uLmdvdl9hbHRfbmFtZSA9IHBlcnNvbi5nb3Zlcm5tZW50LnNsdWcucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBQcmVwYXJlIG9wdGlvbnMgZm9yIHNlbGVjdCBpbiBJc3N1ZXNDYXRlZ29yeSBlZGl0LlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc1xuICAgICAgICAgICAgICBwZXJzb24uY2F0ZWdvcnlfc2VsZWN0LnB1c2gge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBjYXRlZ29yeS5pZFxuICAgICAgICAgICAgICAgIHRleHQ6IGNhdGVnb3J5Lm5hbWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGVyc29uLmNhdGVnb3J5X3NlbGVjdCA9IEpTT04uc3RyaW5naWZ5KHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QpO1xuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgRm9ybWF0IGNvbnRyaWJ1dGlvbiBhbW91bnQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGZvciBjb250cmlidXRpb24gaW4gcGVyc29uLmNvbnRyaWJ1dGlvbnNcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCA9IG51bWVyYWwoY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQpLmZvcm1hdCgnMCwwMDAnKVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBwZXJzb25cblxuICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgcGVyc29uLnZvdGVzICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG1vbWVudChpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCwgJ1lZWVktTU0tREQnKTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLmZvcm1hdCAnTCdcblxuICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG5cbiAgICAgICAgICAgIGh0bWwgPSBjb21waWxlZFRlbXBsYXRlKHBlcnNvbilcblxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGh0bWxcblxuICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uLCBjYXRlZ29yaWVzLCBkYXRhLmVsZWN0ZWRPZmZpY2lhbHMpO1xuICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiQgLT5cbiAgICAjIyNcbiAgICAgIEdldCBjdXJyZW50IHVzZXIuXG4gICAgIyMjXG4gICAgJHVzZXJCdG4gPSAkKCcjdXNlcicpXG4gICAgJHVzZXJCdG5MaW5rID0gJHVzZXJCdG4uZmluZCgnYScpO1xuICAgIGNvbnNvbGUubG9nIGF1dGhvcml6ZWRcbiAgICBjb25zb2xlLmxvZyB1c2VyXG4gICAgY29uc29sZS5sb2cgdXNlci51c2VybmFtZVxuXG4gICAgaWYgKGF1dGhvcml6ZWQpXG4gICAgICAkdXNlclRleHQgPSAkKCcjdXNlci10ZXh0JykuZmluZCgnYScpO1xuICAgICAgJHVzZXJUZXh0Lmh0bWwoXCJMb2dnZWQgaW4gYXMgI3t1c2VyLnVzZXJuYW1lfVwiICsgJHVzZXJUZXh0Lmh0bWwoKSlcbiAgICAgICR1c2VyQnRuTGluay5odG1sKFwiU2lnbiBPdXRcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gJy9sb2dvdXQnXG4gICAgZWxzZVxuICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJMb2dpbiAvIFNpZ24gVXBcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcblxuIyAgICAkLmFqYXggJy9hcGkvdXNlcicsIHtcbiMgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiMgICAgICAgICAgYXN5bmM6IGZhbHNlLFxuIyAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4jICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcmVzcG9uc2UudXNlcm5hbWU7XG4jICAgICAgICAgICAgICBhdXRob3JpemVkID0gdHJ1ZTtcbiNcbiMgICAgICAgICAgICAgICR1c2VyVGV4dCA9ICQoJyN1c2VyLXRleHQnKS5maW5kKCdhJyk7XG4jICAgICAgICAgICAgICAkdXNlclRleHQuaHRtbChcIkxvZ2dlZCBpbiBhcyAje3VzZXIudXNlcm5hbWV9XCIgKyAkdXNlclRleHQuaHRtbCgpKVxuIyAgICAgICAgICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJTaWduIE91dFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiMgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSAnL2xvZ291dCdcbiNcbiMgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiMgICAgICAgICAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDEgdGhlbiBhdXRob3JpemVkID0gZmFsc2VcbiMgICAgICAgICAgICAgICR1c2VyQnRuTGluay5odG1sKFwiTG9naW4gLyBTaWduIFVwXCIgKyAkdXNlckJ0bkxpbmsuaHRtbCgpKS5jbGljayAoKSAtPlxuIyAgICAgICAgICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiMgICAgICB9IiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLnR5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQubmFtZSwgcmVncylcbiAgICAgICAgbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLm5hbWUsIHdvcmRzLCByZWdzKVxuICAgICNkLnN0YXRlPXN0cm9uZ2lmeShkLnN0YXRlLCB3b3JkcywgcmVncylcbiAgICAjZC5nb3ZfdHlwZT1zdHJvbmdpZnkoZC5nb3ZfdHlwZSwgd29yZHMsIHJlZ3MpXG4gIFxuICByZXR1cm4gY2xvbmVzXG5cblxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXG5zdHJvbmdpZnkgPSAocywgd29yZHMsIHJlZ3MpIC0+XG4gIHJlZ3MuZm9yRWFjaCAocixpKSAtPlxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxuICByZXR1cm4gc1xuXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXG5zdHJpcCA9IChzKSAtPlxuICBzLnJlcGxhY2UoLzxbXjw+XSo+L2csJycpXG5cblxuIyBhbGwgdGlybXMgc3BhY2VzIGZyb20gYm90aCBzaWRlcyBhbmQgbWFrZSBjb250cmFjdHMgc2VxdWVuY2VzIG9mIHNwYWNlcyB0byAxXG5mdWxsX3RyaW0gPSAocykgLT5cbiAgc3M9cy50cmltKCcnK3MpXG4gIHNzPXNzLnJlcGxhY2UoLyArL2csJyAnKVxuXG4jIHJldHVybnMgYW4gYXJyYXkgb2Ygd29yZHMgaW4gYSBzdHJpbmdcbmdldF93b3JkcyA9IChzdHIpIC0+XG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcblxuXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XG4gIHdvcmRzID0gZ2V0X3dvcmRzIHN0clxuICByZWdzID0gd29yZHMubWFwICh3KS0+IG5ldyBSZWdFeHAoXCIje3d9XCIsJ2knKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVNcbmZpZWxkTmFtZXMgPSB7fVxuZmllbGROYW1lc0hlbHAgPSB7fVxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9IChuLG1hc2ssZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG5vdCBkYXRhW25dXG4gICAgcmV0dXJuICcnXG5cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgaWYgJycgIT0gbWFza1xuICAgICAgaWYgZGF0YVtuKydfcmFuayddIGFuZCBkYXRhLm1heF9yYW5rcyBhbmQgZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ11cbiAgICAgICAgdiA9IG51bWVyYWwodikuZm9ybWF0KG1hc2spXG5cbiAgICAgICAgIyBGaW5kIGRlc2NyaXB0aW9uIGZyb20gZnVzaW9uIHRhYmxlcywgc2V0IGlmIGV4aXN0XG4gICAgICAgIHRpdGxlID0gJ05vIHRpdGxlJ1xuICAgICAgICBHT1ZXSUtJLmZ1c2lvbi5yb3dzLmZvckVhY2ggKHJvdykgLT4gaWYgcm93WzJdIGlzIG4gdGhlbiB0aXRsZSA9IHJvd1szXVxuXG4gICAgICAgIHJldHVybiBcIiN7dn0gPGEgY2xhc3M9J3JhbmsnXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YS1maWVsZD0nI3tufV9yYW5rJ1xuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPScje3RpdGxlfSByYW5rcydcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLW1hc2s9JyN7bWFza30nJz5cbiAgICAgICAgICAgICAgICAgICAgICAoI3tkYXRhW24rJ19yYW5rJ119IG9mICN7ZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ119KTwvYT5cIlxuICAgICAgaWYgbiA9PSBcIm51bWJlcl9vZl9mdWxsX3RpbWVfZW1wbG95ZWVzXCJcbiAgICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KCcwLDAnKVxuICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KG1hc2spXG4gICAgZWxzZVxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmQgbiA9PSBcIm9wZW5fZW5yb2xsbWVudF9zY2hvb2xzXCJcbiAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBlbHNlIGlmIHYubGVuZ3RoID4gMjAgYW5kIG4gPT0gXCJwYXJlbnRfdHJpZ2dlcl9lbGlnaWJsZV9zY2hvb2xzXCJcbiAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMjFcbiAgICAgICAgICB2ID0gdi5zdWJzdHJpbmcoMCwgMjEpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gdlxuXG5cbnJlbmRlcl9maWVsZF9uYW1lX2hlbHAgPSAoZk5hbWUpIC0+XG4gICNpZiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cbiAgICByZXR1cm4gZmllbGROYW1lc0hlbHBbZk5hbWVdXG5cbnJlbmRlcl9maWVsZF9uYW1lID0gKGZOYW1lKSAtPlxuICBpZiBmaWVsZE5hbWVzW2ZOYW1lXT9cbiAgICByZXR1cm4gZmllbGROYW1lc1tmTmFtZV1cblxuICBzID0gZk5hbWUucmVwbGFjZSgvXy9nLFwiIFwiKVxuICBzID0gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpXG4gIHJldHVybiBzXG5cblxucmVuZGVyX2ZpZWxkID0gKGZOYW1lLGRhdGEpLT5cbiAgaWYgXCJfXCIgPT0gc3Vic3RyIGZOYW1lLCAwLCAxXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyA+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+Jm5ic3A7PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBlbHNlXG4gICAgcmV0dXJuICcnIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICAgIFwiXCJcIlxuICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTxkaXY+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxucmVuZGVyX3N1YmhlYWRpbmcgPSAoZk5hbWUsIG1hc2ssIG5vdEZpcnN0KS0+XG4gIHMgPSAnJ1xuICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZOYW1lXG4gIGlmIG1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICBpZiBub3RGaXJzdCAhPSAwXG4gICAgICBzICs9IFwiPGJyLz5cIlxuICAgIHMgKz0gXCI8ZGl2PjxzcGFuIGNsYXNzPSdmLW5hbSc+I3tmTmFtZX08L3NwYW4+PHNwYW4gY2xhc3M9J2YtdmFsJz4gPC9zcGFuPjwvZGl2PlwiXG4gIHJldHVybiBzXG5cbnJlbmRlcl9maWVsZHMgPSAoZmllbGRzLGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIGZvciBmaWVsZCxpIGluIGZpZWxkc1xuICAgIGlmICh0eXBlb2YgZmllbGQgaXMgXCJvYmplY3RcIilcbiAgICAgIGlmIGZpZWxkLm1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICAgICAgaCArPSByZW5kZXJfc3ViaGVhZGluZyhmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBpKVxuICAgICAgICBmVmFsdWUgPSAnJ1xuICAgICAgZWxzZVxuICAgICAgICBmVmFsdWUgPSByZW5kZXJfZmllbGRfdmFsdWUgZmllbGQubmFtZSwgZmllbGQubWFzaywgZGF0YVxuICAgICAgICBpZiAoJycgIT0gZlZhbHVlIGFuZCBmVmFsdWUgIT0gJzAnKVxuICAgICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGQubmFtZVxuICAgICAgICAgIGZOYW1lSGVscCA9IHJlbmRlcl9maWVsZF9uYW1lX2hlbHAgZmllbGQubmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZlZhbHVlID0gJydcblxuICAgIGVsc2VcbiAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZCwgJycsIGRhdGFcbiAgICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGRcbiAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmTmFtZVxuICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZOYW1lLCB2YWx1ZTogZlZhbHVlLCBoZWxwOiBmTmFtZUhlbHApXG4gIHJldHVybiBoXG5cbnJlbmRlcl9maW5hbmNpYWxfZmllbGRzID0gKGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIG1hc2sgPSAnMCwwJ1xuICBjYXRlZ29yeSA9ICcnXG4gIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gIGZvciBmaWVsZCBpbiBkYXRhXG4gICAgaWYgY2F0ZWdvcnkgIT0gZmllbGQuY2F0ZWdvcnlfbmFtZVxuICAgICAgY2F0ZWdvcnkgPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBpZiBjYXRlZ29yeSA9PSAnT3ZlcnZpZXcnXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICBlbHNlIGlmIGNhdGVnb3J5ID09ICdSZXZlbnVlcydcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gXCI8Yj5cIiArIHRlbXBsYXRlKG5hbWU6IGNhdGVnb3J5LCBnZW5mdW5kOiBcIkdlbmVyYWwgRnVuZFwiLCBvdGhlcmZ1bmRzOiBcIk90aGVyIEZ1bmRzXCIsIHRvdGFsZnVuZHM6IFwiVG90YWwgR292LiBGdW5kc1wiKSArIFwiPC9iPlwiXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcblxuICAgIGlmIGZpZWxkLmNhcHRpb24gPT0gJ0dlbmVyYWwgRnVuZCBCYWxhbmNlJyBvciBmaWVsZC5jYXB0aW9uID09ICdMb25nIFRlcm0gRGVidCdcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JykpXG4gICAgZWxzZSBpZiBmaWVsZC5jYXB0aW9uIGluIFsnVG90YWwgUmV2ZW51ZXMnLCAnVG90YWwgRXhwZW5kaXR1cmVzJywgJ1N1cnBsdXMgLyAoRGVmaWNpdCknXSBvciBpc19maXJzdF9yb3dcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIG90aGVyZnVuZHM6IGN1cnJlbmN5KGZpZWxkLm90aGVyZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpLCB0b3RhbGZ1bmRzOiBjdXJyZW5jeShmaWVsZC50b3RhbGZ1bmRzLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICAgIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzayksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2spKVxuICByZXR1cm4gaFxuXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoL1tcXHNcXCtcXC1dL2csICdfJylcblxudG9UaXRsZUNhc2UgPSAoc3RyKSAtPlxuICBzdHIucmVwbGFjZSAvXFx3XFxTKi9nLCAodHh0KSAtPlxuICAgIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKVxuXG5jdXJyZW5jeSA9IChuLCBtYXNrLCBzaWduID0gJycpIC0+XG4gICAgbiA9IG51bWVyYWwobilcbiAgICBpZiBuIDwgMFxuICAgICAgICBzID0gbi5mb3JtYXQobWFzaykudG9TdHJpbmcoKVxuICAgICAgICBzID0gcy5yZXBsYWNlKC8tL2csICcnKVxuICAgICAgICByZXR1cm4gXCIoI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrcysnPC9zcGFuPid9KVwiXG5cbiAgICBuID0gbi5mb3JtYXQobWFzaylcbiAgICByZXR1cm4gXCIje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytuKyc8L3NwYW4+J31cIlxuXG5yZW5kZXJfdGFicyA9IChpbml0aWFsX2xheW91dCwgZGF0YSwgdGFic2V0LCBwYXJlbnQpIC0+XG4gICNsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICBsYXlvdXQgPSBpbml0aWFsX2xheW91dFxuICB0ZW1wbGF0ZXMgPSBwYXJlbnQudGVtcGxhdGVzXG4gIHBsb3RfaGFuZGxlcyA9IHt9XG5cbiAgbGF5b3V0X2RhdGEgPVxuICAgIHRpdGxlOiBkYXRhLm5hbWVcbiAgICB3aWtpcGVkaWFfcGFnZV9leGlzdHM6IGRhdGEud2lraXBlZGlhX3BhZ2VfZXhpc3RzXG4gICAgd2lraXBlZGlhX3BhZ2VfbmFtZTogIGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgIHRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lOiBkYXRhLnRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lXG4gICAgbGF0ZXN0X2F1ZGl0X3VybDogZGF0YS5sYXRlc3RfYXVkaXRfdXJsXG4gICAgdGFiczogW11cbiAgICB0YWJjb250ZW50OiAnJ1xuXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBsYXlvdXRfZGF0YS50YWJzLnB1c2hcbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGRldGFpbF9kYXRhID1cbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG4gICAgICB0YWJjb250ZW50OiAnJ1xuICAgIHN3aXRjaCB0YWIubmFtZVxuICAgICAgd2hlbiAnT3ZlcnZpZXcgKyBFbGVjdGVkIE9mZmljaWFscydcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGNvbnNvbGUubG9nIGRhdGFcbiAgICAgICAgZm9yIG9mZmljaWFsLGkgaW4gZGF0YS5lbGVjdGVkX29mZmljaWFsc1xuICAgICAgICAgIG9mZmljaWFsX2RhdGEgPVxuICAgICAgICAgICAgdGl0bGU6IGlmICcnICE9IG9mZmljaWFsLnRpdGxlIHRoZW4gXCJUaXRsZTogXCIgKyBvZmZpY2lhbC50aXRsZVxuICAgICAgICAgICAgbmFtZTogaWYgJycgIT0gb2ZmaWNpYWwuZnVsbF9uYW1lIHRoZW4gXCJOYW1lOiBcIiArIG9mZmljaWFsLmZ1bGxfbmFtZVxuICAgICAgICAgICAgZW1haWw6IGlmIG9mZmljaWFsLmVtYWlsX2FkZHJlc3MgdGhlbiBcIkVtYWlsOiBcIiArIG9mZmljaWFsLmVtYWlsX2FkZHJlc3NcbiAgICAgICAgICAgIHRlbGVwaG9uZW51bWJlcjogaWYgbnVsbCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIGFuZCB1bmRlZmluZWQgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciB0aGVuIFwiVGVsZXBob25lIE51bWJlcjogXCIgKyBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyXG4gICAgICAgICAgICB0ZXJtZXhwaXJlczogaWYgb2ZmaWNpYWwudGVybV9leHBpcmVzIHRoZW4gXCJUZXJtIEV4cGlyZXM6IFwiICsgb2ZmaWNpYWwudGVybV9leHBpcmVzIGVsc2UgXCJUZXJtIEV4cGlyZXM6IFwiXG4gICAgICAgICAgICBhbHRUeXBlU2x1ZzogZGF0YS5hbHRfdHlwZV9zbHVnXG4gICAgICAgICAgICBuYW1lU2x1ZzogZGF0YS5zbHVnXG4gICAgICAgICAgICBzbHVnOiBvZmZpY2lhbC5zbHVnXG5cbiAgICAgICAgICBpZiAnJyAhPSBvZmZpY2lhbC5waG90b191cmwgYW5kIG9mZmljaWFsLnBob3RvX3VybCAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJzxpbWcgc3JjPVwiJytvZmZpY2lhbC5waG90b191cmwrJ1wiIGNsYXNzPVwicG9ydHJhaXRcIiBhbHQ9XCJcIiAvPidcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvZmZpY2lhbF9kYXRhLmltYWdlID0gICcnXG5cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJ10ob2ZmaWNpYWxfZGF0YSlcbiAgICAgIHdoZW4gJ0VtcGxveWVlIENvbXBlbnNhdGlvbidcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3NhbGFyeV9wZXJfZnVsbF90aW1lX2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDM0MFxuICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSA0NzBcblxuICAgICAgICAgIGlmICQod2luZG93KS53aWR0aCgpIDwgNDkwXG4gICAgICAgICAgICBzbWFsbENoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBDb21wZW5zYXRpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdCZW5zLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJ1xcbiBFbXBsb3llZXMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ0FsbCBcXG4nICsgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJyBcXG4gUmVzaWRlbnRzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAyKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIENvbXBlbnNhdGlvbiAtIEZ1bGwgVGltZSBXb3JrZXJzOiBcXG4gR292ZXJubWVudCB2cy4gUHJpdmF0ZSBTZWN0b3InXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tY29tcC1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ10gPSdtZWRpYW4tY29tcC1ncmFwaCdcblxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgISBkYXRhLmhhc093blByb3BlcnR5KCdtZWRpYW5fcGVuc2lvbl8zMF95ZWFyX3JldGlyZWUnKSB8fCAoIGRhdGFbJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZSddID09IDApXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gUGVuc2lvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQZW5zaW9uIGZvciBcXG4gUmV0aXJlZSB3LyAzMCBZZWFycydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9wZW5zaW9uMzBfeWVhcl9yZXRpcmVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBQZW5zaW9uJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdiYXInOiB7XG4gICAgICAgICAgICAgICAgICdncm91cFdpZHRoJzogJzMwJSdcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddID0nbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgSGVhbHRoJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICNwdWJsaWMgc2FmZXR5IHBpZVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1B1YmxpYyBTYWZldHkgRXhwZW5zZSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQdWJsaWMgU2FmZXR5IEV4cCdcbiAgICAgICAgICAgICAgICAgIDEgLSBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ090aGVyJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1B1YmxpYyBzYWZldHkgZXhwZW5zZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdzbGljZXMnOiB7IDE6IHtvZmZzZXQ6IDAuMn19XG4gICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA0NVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddID0ncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICNmaW4taGVhbHRoLXJldmVudWUgZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAjY29uc29sZS5sb2cgJyMjI2FsJytKU09OLnN0cmluZ2lmeSBkYXRhXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnUmV2LidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIFJldmVudWUgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBSZXZlbnVlIFBlciBcXG4gQ2FwaXRhIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWUnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgICAgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgI2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0V4cC4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSBcXG4gRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICBoID0gJydcbiAgICAgICAgICAjaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgICAgaCArPSByZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnXVxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAgICN0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGVcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJSZXZlbnVlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgUmV2ZW51ZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXSA9J3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiRXhwZW5kaXR1cmVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBFeHBlbmRpdHVyZXNcIilcblxuICAgICAgICAgICAgICAgICAgICByID0gW1xuICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50IGl0ZW0udG90YWxmdW5kc1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIHJvd3MucHVzaChyKVxuXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyByb3dzXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddID0ndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgIGVsc2VcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG5cbiAgICBsYXlvdXRfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLXRlbXBsYXRlJ10oZGV0YWlsX2RhdGEpXG4gIHJldHVybiB0ZW1wbGF0ZXNbJ3RhYnBhbmVsLXRlbXBsYXRlJ10obGF5b3V0X2RhdGEpXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXG5cblxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxuICAjY2xvbmUgdGhlIGxheW91dFxuICBsID0gJC5leHRlbmQgdHJ1ZSwgW10sIGxheW91dFxuICB0ID1cbiAgICBuYW1lOiBcIk90aGVyXCJcbiAgICBmaWVsZHM6IGdldF91bm1lbnRpb25lZF9maWVsZHMgbCwgZGF0YVxuXG4gIGwucHVzaCB0XG4gIHJldHVybiBsXG5cblxuIyBjb252ZXJ0cyB0YWIgdGVtcGxhdGUgZGVzY3JpYmVkIGluIGdvb2dsZSBmdXNpb24gdGFibGUgdG9cbiMgdGFiIHRlbXBsYXRlXG5jb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZT0odGVtcGwpIC0+XG4gIHRhYl9oYXNoPXt9XG4gIHRhYnM9W11cbiAgIyByZXR1cm5zIGhhc2ggb2YgZmllbGQgbmFtZXMgYW5kIHRoZWlyIHBvc2l0aW9ucyBpbiBhcnJheSBvZiBmaWVsZCBuYW1lc1xuICBnZXRfY29sX2hhc2ggPSAoY29sdW1ucykgLT5cbiAgICBjb2xfaGFzaCA9e31cbiAgICBjb2xfaGFzaFtjb2xfbmFtZV09aSBmb3IgY29sX25hbWUsaSBpbiB0ZW1wbC5jb2x1bW5zXG4gICAgcmV0dXJuIGNvbF9oYXNoXG5cbiAgIyByZXR1cm5zIGZpZWxkIHZhbHVlIGJ5IGl0cyBuYW1lLCBhcnJheSBvZiBmaWVsZHMsIGFuZCBoYXNoIG9mIGZpZWxkc1xuICB2YWwgPSAoZmllbGRfbmFtZSwgZmllbGRzLCBjb2xfaGFzaCkgLT5cbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXG5cbiAgIyBjb252ZXJ0cyBoYXNoIHRvIGFuIGFycmF5IHRlbXBsYXRlXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxuICAgIGEgPSBbXVxuICAgIGZvciBrIG9mIGhhc2hcbiAgICAgIHRhYiA9IHt9XG4gICAgICB0YWIubmFtZT1rXG4gICAgICB0YWIuZmllbGRzPWhhc2hba11cbiAgICAgIGEucHVzaCB0YWJcbiAgICByZXR1cm4gYVxuXG5cbiAgY29sX2hhc2ggPSBnZXRfY29sX2hhc2godGVtcGwuY29sX2hhc2gpXG4gIHBsYWNlaG9sZGVyX2NvdW50ID0gMFxuXG4gIGZvciByb3csaSBpbiB0ZW1wbC5yb3dzXG4gICAgY2F0ZWdvcnkgPSB2YWwgJ2dlbmVyYWxfY2F0ZWdvcnknLCByb3csIGNvbF9oYXNoXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgZmllbGRuYW1lID0gdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaFxuICAgIGlmIG5vdCBmaWVsZG5hbWUgdGhlbiBmaWVsZG5hbWUgPSBcIl9cIiArIFN0cmluZyArK3BsYWNlaG9sZGVyX2NvdW50XG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxuICAgIGZpZWxkTmFtZXNIZWxwW2ZpZWxkbmFtZV0gPSB2YWwgJ2hlbHBfdGV4dCcsIHJvdywgY29sX2hhc2hcbiAgICBpZiBjYXRlZ29yeVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldLnB1c2ggbjogdmFsKCduJywgcm93LCBjb2xfaGFzaCksIG5hbWU6IGZpZWxkbmFtZSwgbWFzazogdmFsKCdtYXNrJywgcm93LCBjb2xfaGFzaClcblxuICBjYXRlZ29yaWVzID0gT2JqZWN0LmtleXModGFiX2hhc2gpXG4gIGNhdGVnb3JpZXNfc29ydCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgaWYgbm90IGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV1cbiAgICAgIGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeV1bMF0ublxuICAgIGZpZWxkcyA9IFtdXG4gICAgZm9yIG9iaiBpbiB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICAgIGZpZWxkcy5wdXNoIG9ialxuICAgIGZpZWxkcy5zb3J0IChhLGIpIC0+XG4gICAgICByZXR1cm4gYS5uIC0gYi5uXG4gICAgdGFiX2hhc2hbY2F0ZWdvcnldID0gZmllbGRzXG5cbiAgY2F0ZWdvcmllc19hcnJheSA9IFtdXG4gIGZvciBjYXRlZ29yeSwgbiBvZiBjYXRlZ29yaWVzX3NvcnRcbiAgICBjYXRlZ29yaWVzX2FycmF5LnB1c2ggY2F0ZWdvcnk6IGNhdGVnb3J5LCBuOiBuXG4gIGNhdGVnb3JpZXNfYXJyYXkuc29ydCAoYSxiKSAtPlxuICAgIHJldHVybiBhLm4gLSBiLm5cblxuICB0YWJfbmV3aGFzaCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzX2FycmF5XG4gICAgdGFiX25ld2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldXG5cbiAgdGFicyA9IGhhc2hfdG9fYXJyYXkodGFiX25ld2hhc2gpXG4gIHJldHVybiB0YWJzXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG4gIEB0ZW1wbGF0ZXMgPSB1bmRlZmluZWRcbiAgQGRhdGEgPSB1bmRlZmluZWRcbiAgQGV2ZW50cyA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOigpIC0+XG4gICAgQGxpc3QgPSBbXVxuICAgIEBldmVudHMgPSB7fVxuICAgIHRlbXBsYXRlTGlzdCA9IFsndGFicGFuZWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJywgJ3BlcnNvbi1pbmZvLXRlbXBsYXRlJ11cbiAgICB0ZW1wbGF0ZVBhcnRpYWxzID0gWyd0YWItdGVtcGxhdGUnXVxuICAgIEB0ZW1wbGF0ZXMgPSB7fVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlTGlzdFxuICAgICAgQHRlbXBsYXRlc1t0ZW1wbGF0ZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlUGFydGlhbHNcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHRlbXBsYXRlLCAkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIHBhcmVudDp0aGlzXG4gICAgICBuYW1lOmxheW91dF9uYW1lXG4gICAgICByZW5kZXI6KGRhdCkgLT5cbiAgICAgICAgQHBhcmVudC5kYXRhID0gZGF0XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQsIHRoaXMsIEBwYXJlbnQpXG4gICAgICBiaW5kOiAodHBsX25hbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBpZiBub3QgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdID0gW2NhbGxiYWNrXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgIGFjdGl2YXRlOiAodHBsX25hbWUpIC0+XG4gICAgICAgIGlmIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIGZvciBlLGkgaW4gQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgICBlIHRwbF9uYW1lLCBAcGFyZW50LmRhdGFcblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcblxuICBsb2FkX2Z1c2lvbl90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBHT1ZXSUtJLmZ1c2lvbiA9IHRlbXBsYXRlX2pzb25cbiAgICAgICAgdCA9IGNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlIHRlbXBsYXRlX2pzb25cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lIHRoZW4gaVxuICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcIlxuXG4gIGFjdGl2YXRlOiAoaW5kLCB0cGxfbmFtZSkgLT5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICBAbGlzdFtpbmRdLmFjdGl2YXRlIHRwbF9uYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIiwiJCAtPlxuICAjJCgnI2dldFdpa2lwZWRpYUFydGljbGVCdXR0b24nKS5vbiAnY2xpY2snLCAtPlxuICAjICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAjYWxlcnRhbGVydCBcImhpXCJcbiAgI2FsZXJ0ICQoXCIjd2lraXBlZGlhUGFnZU5hbWVcIikudGV4dCgpXG4gICNnZXRfd2lraXBlZGlhX2FydGljbGUoKVxuICB3aW5kb3cuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlID0gZ2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4gIHdpbmRvdy5jcmVhdGVfd2lraXBlZGlhX2FydGljbGUgPSBjcmVhdGVfd2lraXBlZGlhX2FydGljbGVcblxuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlPShzKS0+XG4gIGFydGljbGVfbmFtZSA9IHMucmVwbGFjZSAvLipcXC8oW14vXSopJC8sIFwiJDFcIlxuICAkLmdldEpTT04gXCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXBhcnNlJnBhZ2U9I3thcnRpY2xlX25hbWV9JnByb3A9dGV4dCZmb3JtYXQ9anNvbiZjYWxsYmFjaz0/XCIsIChqc29uKSAtPiBcbiAgICAkKCcjd2lraXBlZGlhVGl0bGUnKS5odG1sIGpzb24ucGFyc2UudGl0bGVcbiAgICAkKCcjd2lraXBlZGlhQXJ0aWNsZScpLmh0bWwganNvbi5wYXJzZS50ZXh0W1wiKlwiXVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYTpub3QoLnJlZmVyZW5jZXMgYSlcIikuYXR0ciBcImhyZWZcIiwgLT4gIFwiaHR0cDovL3d3dy53aWtpcGVkaWEub3JnXCIgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhXCIpLmF0dHIgXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIlxuICBcbmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZT0gLT5cbiAgYWxlcnQgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldF93aWtpcGVkaWFfYXJ0aWNsZTpnZXRfd2lraXBlZGlhX2FydGljbGVcbiJdfQ==

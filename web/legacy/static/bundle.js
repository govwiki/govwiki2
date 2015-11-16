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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, altTypesData, authorized, build_select_element, build_selector, categories, draw_polygons, focus_search_field, get_counties, get_elected_officials, get_financial_statements, get_max_ranks, get_record2, gov_selector, govmap, initTableHandlers, orderedFields, refresh_disqus, renderPagination, renderTemplate, route, routeType, setEvents, showCreateRequests, sortTable, start_adjusting_typeahead_width, templates, undef, user, wikipedia;

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
        tpl = Handlebars.compile($('#table-city').html());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL2dvdm1hcC5jb2ZmZWUiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL2dvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy9yZC9XZWJzdG9ybVByb2plY3RzL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIiwiL1VzZXJzL3JkL1dlYnN0b3JtUHJvamVjdHMvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSxnSkFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixtQkFBQSxHQUFzQixFQUFBLEdBQUssRUFBTCxHQUFVLEVBQVYsR0FBZTs7QUFFckMsR0FBQSxHQUFVLElBQUEsS0FBQSxDQUNSO0VBQUEsRUFBQSxFQUFJLFNBQUo7RUFDQSxHQUFBLEVBQUssSUFETDtFQUVBLEdBQUEsRUFBSyxDQUFDLEtBRk47RUFHQSxJQUFBLEVBQU0sQ0FITjtFQUlBLE9BQUEsRUFBUyxDQUpUO0VBS0EsV0FBQSxFQUFhLElBTGI7RUFNQSxjQUFBLEVBQWdCLEtBTmhCO0VBT0EsVUFBQSxFQUFZLEtBUFo7RUFRQSxjQUFBLEVBQWdCLEtBUmhCO0VBU0EsV0FBQSxFQUFhLElBVGI7RUFVQSxrQkFBQSxFQUNFO0lBQUEsS0FBQSxF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QUFvQixDQUFDLElBQXJCLENBQTBCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBckM7SUFDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUssQ0FBQSxHQUFBLENBQTVDO0lBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsc0JBQTVCLENBQW1ELENBQUMsSUFBcEQsQ0FBeUQsTUFBekQsRUFBaUUsU0FBQTthQUFJLDBCQUFBLEdBQTZCLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsTUFBYjtJQUFqQyxDQUFqRTtXQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLEdBQTVCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsUUFBdEMsRUFBZ0QsUUFBaEQ7RUFKZ0gsQ0FBbEg7QUFGb0I7O0FBUXRCLHdCQUFBLEdBQTBCLFNBQUE7U0FDeEIsS0FBQSxDQUFNLGlCQUFOO0FBRHdCOztBQUcxQixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEscUJBQUEsRUFBc0IscUJBQXRCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuIyBTZXQgbGlmZXRpbWUgb24gMSBkYXlzLCBmb3JtYXQ6IGRheXMgKiBob3VycyAqIG1pbnV0ZXMgKiBzZWNvbmRzICogbWlsbGlzZWNvbmRzLlxucG9pbnRzQ2FjaGVMaWZldGltZSA9IDI0ICogNjAgKiA2MCAqIDEwMDA7XG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogMzcuM1xuICBsbmc6IC0xMTkuM1xuICB6b29tOiA2XG4gIG1pblpvb206IDZcbiAgc2Nyb2xsd2hlZWw6IHRydWVcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHBhbkNvbnRyb2w6IGZhbHNlXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxuICB6b29tQ29udHJvbDogdHJ1ZVxuICB6b29tQ29udHJvbE9wdGlvbnM6XG4gICAgc3R5bGU6IGdvb2dsZS5tYXBzLlpvb21Db250cm9sU3R5bGUuU01BTExcbiAgbWFya2VyQ2x1c3RlcmVyOiAobWFwKSAtPlxuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0ZXh0U2l6ZTogMTRcbiAgICAgIHRleHRDb2xvcjogJ3JlZCdcbiAgICAgIGdyaWRTaXplOiAwXG4gICAgICBtaW5pbXVtQ2x1c3RlclNpemU6IDUgIyBBbGxvdyBtaW5pbXVtIDUgbWFya2VyIGluIGNsdXN0ZXIuXG4gICAgICBpZ25vcmVIaWRkZW46IHRydWUgIyBEb24ndCBzaG93IGhpZGRlbiBtYXJrZXJzLiBJbiBzb21lIHJlYXNvbiBkb24ndCB3b3JrIDooXG4gICAgICAjIEZvciBkcmF3IGNoYXJ0LlxuICAgICAgbGVnZW5kOlxuICAgICAgICBcIkNpdHlcIiA6IFwicmVkXCJcbiAgICAgICAgXCJTY2hvb2wgRGlzdHJpY3RcIiA6IFwiYmx1ZVwiXG4gICAgICAgIFwiU3BlY2lhbCBEaXN0cmljdFwiIDogXCJwdXJwbGVcIlxuICAgIH1cbiAgICByZXR1cm4gbmV3IE1hcmtlckNsdXN0ZXJlcihtYXAsIFtdLCBvcHRpb25zKTtcblxubWFwLm1hcC5jb250cm9sc1tnb29nbGUubWFwcy5Db250cm9sUG9zaXRpb24uUklHSFRfVE9QXS5wdXNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsZWdlbmQnKSlcblxucmVyZW5kZXJfbWFya2VycyA9IC0+XG4gIGFkZF9tYXJrZXIocmVjKSBmb3IgcmVjIGluIEdPVldJS0kubWFya2Vyc1xuXG5yZWJ1aWxkX2ZpbHRlciA9IC0+XG4gIGhhcmRfcGFyYW1zID0gWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0JywgJ0NvdW50eSddXG4gIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIgPSBbXVxuICAkKCcudHlwZV9maWx0ZXInKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICBpZiAkKGVsZW1lbnQpLmF0dHIoJ25hbWUnKSBpbiBoYXJkX3BhcmFtcyBhbmQgJChlbGVtZW50KS52YWwoKSA9PSAnMSdcbiAgICAgIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIucHVzaCAkKGVsZW1lbnQpLmF0dHIoJ25hbWUnKVxuXG4jIGxlZ2VuZFR5cGUgPSBjaXR5LCBzY2hvb2wgZGlzdHJpY3QsIHNwZWNpYWwgZGlzdHJpY3QsIGNvdW50aWVzXG5nZXRfcmVjb3JkczIgPSAobGVnZW5kVHlwZSwgb25zdWNjZXNzKSAtPlxuICBkYXRhID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwb2ludHMnKTtcbiAgaWYgKGRhdGEpXG4gICAgI1xuICAgICMgUmVzdG9yZSBtYXJrZXJzIGRhdGEgZnJvbSBsb2NhbCBzdG9yYWdlLlxuICAgIG9uc3VjY2VzcyBKU09OLnBhcnNlKGRhdGEpXG4gIGVsc2VcbiAgICAjXG4gICAgIyBSZXRyaWV2ZSBuZXcgbWFya2VycyBkYXRhIGZyb20gc2VydmVyLlxuICAgICQuYWpheFxuICAgICAgdXJsOlwiL2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAjICAgIHVybDpcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcbiAgICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUsIGxpbWl0OiA1MDAwIH1cbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgIGVycm9yOihlKSAtPlxuICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiQgLT5cbiAgcmVidWlsZF9maWx0ZXIoKVxuICBkYXRhID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwb2ludHMnKVxuXG4gICNcbiAgIyBMb2FkIG1hcmtlcnMgZGF0YVxuICAjXG4gIGRhdGUgPSBuZXcgRGF0ZSgpO1xuXG4gIGlmIGRhdGEgYW5kICgoTnVtYmVyKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncG9pbnRzX2xhc3RfdXBkYXRlJykpICsgcG9pbnRzQ2FjaGVMaWZldGltZSkgPj0gZGF0ZS5nZXRUaW1lKCkpXG4gICAgI1xuICAgICMgSWYgcG9pbnRzIGRhdGEgY2FjaGVkIGluIGxvY2FsIHN0b3JhZ2UgYW5kIGluIGFjdHVhbCBzdGF0ZSwgbG9hZCBmcm9tIGNhY2hlLlxuICAgICNcbiAgICBjb25zb2xlLmxvZygnRnJvbSBjYWNoZScpXG4gICAgY29uc29sZS5sb2coSlNPTi5wYXJzZShkYXRhKSk7XG4gICAgR09WV0lLSS5tYXJrZXJzID0gSlNPTi5wYXJzZShkYXRhKVxuICBlbHNlXG4gICAgI1xuICAgICMgR2V0IG5ldyBkYXRhIGZyb20gc2VydmVyLlxuICAgICNcbiAgICBnZXRfcmVjb3JkczIgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiwgKGRhdGEpIC0+XG4gICAgICAjXG4gICAgICAjIFN0b3JlIG1hcmtlcnMgZGF0YS5cbiAgICAgICNcbiAgICAgIGNvbnNvbGUubG9nKCdGcm9tIHNlcnZlcicpXG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50cycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50c19sYXN0X3VwZGF0ZScsIGRhdGUuZ2V0VGltZSgpKVxuICAgICAgR09WV0lLSS5tYXJrZXJzID0gZGF0YVxuXG4gICNcbiAgIyBSZW5kZXIgcG9pbnRzIHN0b3JlZCBpbiBHT1ZXSUtJLm1hcmtlcnNcbiAgI1xuICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpOm5vdCguY291bnRpZXMtdHJpZ2dlciknKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaGlkZGVuX2ZpZWxkID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpXG4gICAgdmFsdWUgPSBoaWRkZW5fZmllbGQudmFsKClcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcbiAgICAjXG4gICAgIyBDbGlja2VkIGxlZ2VuZCBhbHQgdHlwZS5cbiAgICBhbHRUeXBlID0gaGlkZGVuX2ZpZWxkLmF0dHIoJ25hbWUnKVxuXG4gICAgcmVidWlsZF9maWx0ZXIoKVxuXG4gICAgI1xuICAgICMgVG9nZ2xlIG1hcmtlciB2aXNpYmxlIHdpdGggdHlwZSBlcXVhbCB0byBjbGlja2VkIGxlZ2VuZC5cbiAgICAjXG4gICAgZm9yIG1hcmtlciBpbiBtYXAubWFya2Vyc1xuICAgICAgaWYgbWFya2VyLnR5cGUgaXMgYWx0VHlwZVxuICAgICAgICAjIFJlbW92ZXxhZGQgbWFya2VycyBmcm9tIGNsdXN0ZXIgYmVjYXVzZSBNYXJrZXJDbHVzdGVyIGlnbm9yZVxuICAgICAgICAjIGhpcyBvcHRpb24gJ2lnbm9yZUhpZGRlbicuXG4gICAgICAgIGlmICh2YWx1ZSBpcyAnMScpXG4gICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5yZW1vdmVNYXJrZXIobWFya2VyLCB0cnVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbWFwLm1hcmtlckNsdXN0ZXJlci5hZGRNYXJrZXIobWFya2VyLCB0cnVlKVxuIyAgICAgICAgbWFya2VyLnNldFZpc2libGUoISBtYXJrZXIuZ2V0VmlzaWJsZSgpKVxuXG4gICAgbWFwLm1hcmtlckNsdXN0ZXJlci5yZXBhaW50KCk7XG5cbiAgJCgnI2xlZ2VuZCBsaS5jb3VudGllcy10cmlnZ2VyJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGlmICQodGhpcykuaGFzQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAjXG4gICAgICAjIFNob3cgY291bnRpZXMuXG4gICAgICAjXG4gICAgICBmb3IgcG9seWdvbiBpbiBtYXAucG9seWdvbnNcbiAgICAgICAgcG9seWdvbi5zZXRWaXNpYmxlKHRydWUpXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBIaWRlIGNvdW50aWVzLlxuICAgICAgI1xuICAgICAgZm9yIHBvbHlnb24gaW4gbWFwLnBvbHlnb25zXG4gICAgICAgIHBvbHlnb24uc2V0VmlzaWJsZShmYWxzZSlcblxuXG5cblxuXG5nZXRfaWNvbiA9KGFsdF90eXBlKSAtPlxuXG4gIF9jaXJjbGUgPShjb2xvciktPlxuICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFXG4gICAgZmlsbE9wYWNpdHk6IDFcbiAgICBmaWxsQ29sb3I6IGNvbG9yXG4gICAgc3Ryb2tlV2VpZ2h0OiAxXG4gICAgc3Ryb2tlQ29sb3I6ICd3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTogNlxuXG4gIHN3aXRjaCBhbHRfdHlwZVxuICAgIHdoZW4gJ0NpdHknIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3JlZCdcbiAgICB3aGVuICdTY2hvb2wgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ2JsdWUnXG4gICAgd2hlbiAnU3BlY2lhbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAncHVycGxlJ1xuICAgIGVsc2UgcmV0dXJuIF9jaXJjbGUgJ3doaXRlJ1xuXG5pbl9hcnJheSA9IChteV9pdGVtLCBteV9hcnJheSkgLT5cbiAgZm9yIGl0ZW0gaW4gbXlfYXJyYXlcbiAgICByZXR1cm4gdHJ1ZSBpZiBpdGVtID09IG15X2l0ZW1cbiAgZmFsc2VcblxuXG5hZGRfbWFya2VyID0gKHJlYyktPlxuICAjY29uc29sZS5sb2cgXCIje3JlYy5yYW5kfSAje3JlYy5pbmNfaWR9ICN7cmVjLnppcH0gI3tyZWMubGF0aXR1ZGV9ICN7cmVjLmxvbmdpdHVkZX0gI3tyZWMuZ292X25hbWV9XCJcbiAgZXhpc3QgPSBpbl9hcnJheSByZWMuYWx0VHlwZSwgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMlxuICBpZiBleGlzdCBpcyBmYWxzZSB0aGVuIHJldHVybiBmYWxzZVxuXG4gIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHJlYy5sYXRpdHVkZSwgcmVjLmxvbmdpdHVkZSlcbiAgICBpY29uOiBnZXRfaWNvbihyZWMuYWx0VHlwZSlcbiAgICB0aXRsZTogIFwiI3tyZWMubmFtZX0sICN7cmVjLnR5cGV9XCIsXG4jICAgIHRpdGxlOiBcIiN7cmVjLmFsdFR5cGV9XCJcbiAgICAjXG4gICAgIyBGb3IgbGVnZW5kIGNsaWNrIGhhbmRsZXIuXG4gICAgdHlwZTogcmVjLmFsdFR5cGVcbiAgfSlcbiAgI1xuICAjIE9uIGNsaWNrIHJlZGlyZWN0IHVzZXIgdG8gZW50aXR5IHBhZ2UuXG4gICNcbiAgbWFya2VyLmFkZExpc3RlbmVyICdjbGljaycsICgpIC0+XG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgY29uc29sZS5sb2coJ0NsaWNrIG9uIG1hcmtlcicpO1xuICAgIHVybCA9IFwiI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9XCJcbiAgICBjb25zb2xlLmxvZyh1cmwpO1xuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhXG4gICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnQvXCIgKyB1cmwsXG4gICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IEdPVldJS0kudGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICBHT1ZXSUtJLnRwbExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgbWFwLmFkZE1hcmtlciBtYXJrZXJcblxuIyAgbWFwLmFkZE1hcmtlclxuIyAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuIyAgICBsbmc6IHJlYy5sb25naXR1ZGVcbiMgICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4jICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIlxuIyAgICBpbmZvV2luZG93OlxuIyAgICAgIGNvbnRlbnQ6IFwiXG4jICAgICAgICA8ZGl2PjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnIGNsYXNzPSdpbmZvLXdpbmRvdy11cmknIGRhdGEtdXJpPScvI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9Jz48c3Ryb25nPiN7cmVjLm5hbWV9PC9zdHJvbmc+PC9hPjwvZGl2PlxuIyAgICAgICAgPGRpdj4gI3tyZWMudHlwZX0gICN7cmVjLmNpdHl9ICN7cmVjLnppcH0gI3tyZWMuc3RhdGV9PC9kaXY+XCJcblxuXG5cbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIG1hcDogbWFwXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgICNAZ292c19hcnJheSA9IGdvdnNcbiAgICBAZ292c19hcnJheSA9IGdvdnMucmVjb3JkXG4gICAgJCgnLnR5cGVhaGVhZCcpLmtleXVwIChldmVudCkgPT5cbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgLCAxMDAwXG5cbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAgIGNsYXNzTmFtZXM6XG4gICAgICAgIFx0bWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAjICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxuICAgIHJldHVyblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzPUdvdlNlbGVjdG9yXG5cblxuXG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xud2lraXBlZGlhID0gcmVxdWlyZSAnLi93aWtpcGVkaWEuY29mZmVlJ1xuXG5nb3ZtYXAgPSBudWxsXG5nb3Zfc2VsZWN0b3IgPSBudWxsXG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYiA9IFwiXCJcbnVuZGVmID0gbnVsbFxuYXV0aG9yaXplZCA9IGZhbHNlXG4jXG4jIEluZm9ybWF0aW9uIGFib3V0IGN1cnJlbnQgdXNlci5cbiNcbnVzZXIgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4jXG4jIElzc3VlcyBjYXRlZ29yeSwgZmlsbCBpbiBlbGVjdGVkIG9mZmljaWFsIHBhZ2UuXG4jXG5jYXRlZ29yaWVzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCAndGFibGUtY2l0eScsICQoJyN0YWJsZS1jaXR5JykuaHRtbCgpXG5IYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCAndGFibGUtY291bnR5JywgJCgnI3RhYmxlLWNvdW50eScpLmh0bWwoKVxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgJ3RhYmxlLXNjaG9vbC1kaXN0cmljdCcsICQoJyN0YWJsZS1zY2hvb2wtZGlzdHJpY3QnKS5odG1sKClcbkhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsICd0YWJsZS1zcGVjaWFsLWRpc3RyaWN0JywgJCgnI3RhYmxlLXNwZWNpYWwtZGlzdHJpY3QnKS5odG1sKClcblxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdnZXROYW1lJywgKG5hbWUsIG9iaikgLT5cbiAgICByZXR1cm4gb2JqW25hbWUrJ1JhbmsnXTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZiBgYSA9PSBiYFxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnc29tZScsIChhcnIsIHRhcmdldCwgb3B0cykgLT5cbiAgICByZXR1cm4gISFhcnJbdGFyZ2V0KydSYW5rJ107XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2RlYnVnJywgKGVtYmVyT2JqZWN0KSAtPlxuICBpZiBlbWJlck9iamVjdCBhbmQgZW1iZXJPYmplY3QuY29udGV4dHNcbiAgICBvdXQgPSAnJztcblxuICAgIGZvciBjb250ZXh0IGluIGVtYmVyT2JqZWN0LmNvbnRleHRzXG4gICAgICBmb3IgcHJvcCBpbiBjb250ZXh0XG4gICAgICAgIG91dCArPSBwcm9wICsgXCI6IFwiICsgY29udGV4dFtwcm9wXSArIFwiXFxuXCJcblxuICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUubG9nKVxuICAgICAgICBjb25zb2xlLmxvZyhcIkRlYnVnXFxuLS0tLS0tLS0tLS0tLS0tLVxcblwiICsgb3V0KVxuXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgICBzdGF0ZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcl8yOiBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuXG4gICAgc2hvd19zZWFyY2hfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgIGZvY3VzX3NlYXJjaF9maWVsZCA1MDBcblxuICAgIHNob3dfZGF0YV9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcblxuR09WV0lLSS50ZW1wbGF0ZXMgPSB0ZW1wbGF0ZXM7XG5HT1ZXSUtJLnRwbExvYWRlZCA9IGZhbHNlXG5cbkdPVldJS0kuZ2V0X2NvdW50aWVzID0gZ2V0X2NvdW50aWVzID0gKGNhbGxiYWNrKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICcvbGVnYWN5L2RhdGEvY291bnR5X2dlb2dyYXBoeV9jYV8yLmpzb24nXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGNvdW50aWVzSlNPTikgLT5cbiAgICAgICAgICAgIGNhbGxiYWNrIGNvdW50aWVzSlNPTlxuXG5HT1ZXSUtJLmRyYXdfcG9seWdvbnMgPSBkcmF3X3BvbHlnb25zID0gKGNvdW50aWVzSlNPTikgLT5cbiAgICBmb3IgY291bnR5IGluIGNvdW50aWVzSlNPTi5mZWF0dXJlc1xuICAgICAgICBkbyAoY291bnR5KSA9PlxuICAgICAgICAgICAgZ292bWFwLm1hcC5kcmF3UG9seWdvbih7XG4gICAgICAgICAgICAgICAgcGF0aHM6IGNvdW50eS5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgICAgICAgICAgICAgIHVzZUdlb0pTT046IHRydWVcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyM4MDgwODAnXG4gICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC42XG4gICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAxLjVcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjE1XG4gICAgICAgICAgICAgICAgY291bnR5SWQ6IGNvdW50eS5wcm9wZXJ0aWVzLl9pZFxuICAgICAgICAgICAgICAgIGFsdE5hbWU6IGNvdW50eS5wcm9wZXJ0aWVzLmFsdF9uYW1lXG4gICAgICAgICAgICAgICAgbWFya2VyOiBuZXcgTWFya2VyV2l0aExhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMCwgMCksXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlT25EcmFnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBnb3ZtYXAubWFwLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDb250ZW50OiBjb3VudHkucHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KC0xNSwgMjUpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENsYXNzOiBcImxhYmVsLXRvb2x0aXBcIixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHlsZToge29wYWNpdHk6IDEuMH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xeDFcIixcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIG1vdXNlb3ZlcjogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiIzAwRkYwMFwifSlcbiAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IChldmVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0UG9zaXRpb24oZXZlbnQubGF0TG5nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKHRydWUpXG4gICAgICAgICAgICAgICAgbW91c2VvdXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiNGRjAwMDBcIn0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoZmFsc2UpXG4gICAgICAgICAgICAgICAgY2xpY2s6IC0+XG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB1cmkgPSBcIi8je2NvdW50eS5hbHRfdHlwZV9zbHVnfS8je2NvdW50eS5wcm9wZXJ0aWVzLnNsdWd9XCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcbiAgICAgICAgICAgIH0pXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPSAobmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XG4gICAgYWN0aXZlX3RhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd0YWJuYW1lJylcbiAgICBjb25zb2xlLmxvZyBhY3RpdmVfdGFiXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAkKCQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgdGVtcGxhdGVzLmFjdGl2YXRlIDAsIGFjdGl2ZV90YWJcblxuICAgIGlmIGFjdGl2ZV90YWIgPT0gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gMFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgyICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgzICsgMjcpXG5cbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxuXG5hY3RpdmF0ZV90YWIgPSAoKSAtPlxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxuICAgIGNvbnNvbGUubG9nKCchIUAjQCcpO1xuIyBjbGVhciB3aWtpcGVkaWEgcGxhY2VcbiAgICAkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKFwiXCIpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICBnZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgZGF0YS5faWQsIChkYXRhMiwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMgPSBkYXRhMlxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YTNcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldF9tYXhfcmFua3MgKG1heF9yYW5rc19yZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjVE9ETzogRW5hYmxlIGFmdGVyIHJlYWxpemUgbWF4X3JhbmtzIGFwaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG5cbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcbiAgICAgICAgICAgICN3cG4gPSBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICAgICAgICAgICMkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKGlmIHdwbiB0aGVuIHdwbiBlbHNlIFwiTm8gV2lraXBlZGlhIGFydGljbGVcIilcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzkvYXBpL2dvdmVybm1lbnQvXCIgKyBhbHRfdHlwZSArICcvJyArIGdvdl9uYW1lXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvX3Byb2MvZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzXCJcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiBcImdvdndpa2lcIlxuICAgICAgICAgICAgb3JkZXI6IFwiY2FwdGlvbl9jYXRlZ29yeSxkaXNwbGF5X29yZGVyXCJcbiAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ292c19pZFwiXG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZTogXCJJTlwiXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxuICAgICAgICAgICAgXVxuXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfbWF4X3JhbmtzID0gKG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6ICdnb3Z3aWtpJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCA9IChyZWMpPT5cbiAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICBhY3RpdmF0ZV90YWIoKVxuICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIHJvdXRlci5uYXZpZ2F0ZShyZWMuX2lkKVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkMiA9IChyZWMpPT5cbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICByZWMuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9IHVybFxuXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcbiAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXNcbiAgICAgICAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgdmFsdWVzLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgICBzICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBzZWxlY3QgPSAkKHMpXG4gICAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG5cbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgICBpZiB0ZXh0IGlzICdTdGF0ZS4uJ1xuICAgICAgICBzZWxlY3QudmFsICdDQSdcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xuXG4gICAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgaW5wID0gJCgnI215aW5wdXQnKVxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxuICAgIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cbnN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgICQod2luZG93KS5yZXNpemUgLT5cbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcblxuXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoZSkgLT5cbiAgICBoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBpZiBub3QgaFxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5yb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcblxuR09WV0lLSS5oaXN0b3J5ID0gKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID09IDBcbiAgICAgICAgc2VhcmNoQ29udGFpbmVyID0gJCgnI3NlYXJjaENvbnRhaW5lcicpLnRleHQoKTtcbiAgICAgICAgaWYoc2VhcmNoQ29udGFpbmVyICE9ICcnKVxuIyAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7fSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvJ1xuICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJ1xuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIChoaXN0b3J5LnN0YXRlICE9IG51bGwgJiYgaGlzdG9yeS5zdGF0ZS50ZW1wbGF0ZSAhPSB1bmRlZmluZWQpXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LmdvKGluZGV4KTtcbiAgICBlbHNlXG4gICAgICAgIHJvdXRlLnBvcCgpXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nICsgcm91dGUuam9pbignLycpXG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb3BzdGF0ZScsIChldmVudCkgLT5cbiAgICBjb25zb2xlLmxvZyh3aW5kb3cuaGlzdG9yeS5zdGF0ZSlcbiAgICBpZiB3aW5kb3cuaGlzdG9yeS5zdGF0ZSBpc250IG51bGxcbiAgICAgICAgcm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcigoaXRtKS0+IGlmIGl0bSBpc250IFwiXCIgdGhlbiBpdG0gZWxzZSBmYWxzZSk7XG4gICAgICAgIHJvdXRlID0gcm91dGUubGVuZ3RoO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJvdXRlKVxuICAgICAgICBpZiByb3V0ZSBpcyAwXG4gICAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgICAgICBpZiByb3V0ZSBpcyAyXG4gICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpO1xuICAgICAgICBpZiByb3V0ZSBpc250IDBcbiAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgZXZlbnQuc3RhdGUudGVtcGxhdGVcbiAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICBlbHNlXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG4gICAgICAgIGlmIEdPVldJS0kudHBsTG9hZGVkIGlzIGZhbHNlIHRoZW4gZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcbnJlZnJlc2hfZGlzcXVzID0gKG5ld0lkZW50aWZpZXIsIG5ld1VybCwgbmV3VGl0bGUpIC0+XG4gICAgRElTUVVTLnJlc2V0XG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiAoKSAtPlxuICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXG4gICAgICAgICAgICB0aGlzLnBhZ2UudGl0bGUgPSBuZXdUaXRsZVxuXG4jXG4jIFNvcnQgdGFibGUgYnkgY29sdW1uLlxuIyBAcGFyYW0gc3RyaW5nIHRhYmxlICBKUXVlcnkgc2VsZWN0b3IuXG4jIEBwYXJhbSBudW1iZXIgY29sTnVtIENvbHVtbiBudW1iZXIuXG4jXG5zb3J0VGFibGUgPSAodGFibGUsIGNvbE51bSkgLT5cbiAgICAjXG4gICAgIyBEYXRhIHJvd3MgdG8gc29ydFxuICAgICNcbiAgICByb3dzID0gJCh0YWJsZSArICcgdGJvZHkgIFtkYXRhLWlkXScpLmdldCgpXG4gICAgI1xuICAgICMgTGFzdCByb3cgd2hpY2ggY29udGFpbnMgXCJBZGQgbmV3IC4uLlwiXG4gICAgI1xuICAgIGxhc3RSb3cgPSAkKHRhYmxlICsgJyB0Ym9keSAgdHI6bGFzdCcpLmdldCgpO1xuICAgICNcbiAgICAjIENsaWNrZWQgY29sdW1uLlxuICAgICNcbiAgICBjb2x1bW4gPSAkKHRhYmxlICsgJyB0Ym9keSB0cjpmaXJzdCcpLmNoaWxkcmVuKCd0aCcpLmVxKGNvbE51bSlcbiAgICBtYWtlU29ydCA9IHRydWVcblxuICAgIGlmIGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgICAgICMgUmVzdG9yZSByb3cgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5hZGRDbGFzcygnb3JpZ2luJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX2JvdHRvbScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKVxuICAgICAgcm93cyA9IGNvbHVtbi5kYXRhKCdvcmlnaW4nKVxuICAgICAgbWFrZVNvcnQgPSBmYWxzZTtcbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnYXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gZGVzYyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnYXNjJykuYWRkQ2xhc3MoJ2Rlc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykuYWRkQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAtMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ29yaWdpbicpXG4gICAgICAjXG4gICAgICAjIE9yaWdpbmFsIHRhYmxlIGRhdGEgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdvcmlnaW4nKS5hZGRDbGFzcygnYXNjJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgVGFibGUgbm90IG9yZGVyZWQgeWV0LlxuICAgICAgIyBTdG9yZSBvcmlnaW5hbCBkYXRhIHBvc2l0aW9uIGFuZCBzb3J0IGluIGFzYyBvcmRlci5cbiAgICAgICNcblxuICAgICAgY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmRhdGEoJ29yaWdpbicsIHJvd3Muc2xpY2UoMCkpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIGlmIEEgPCBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcblxuICAgIGlmIChtYWtlU29ydCkgdGhlbiByb3dzLnNvcnQgc29ydEZ1bmN0aW9uXG4gICAgJC5lYWNoIHJvd3MsIChpbmRleCwgcm93KSAtPlxuICAgICAgICAkKHRhYmxlKS5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQocm93KVxuICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChsYXN0Um93KVxuXG5pbml0VGFibGVIYW5kbGVycyA9IChwZXJzb24pIC0+XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKVxuXG4gICAgJCgnLmVkaXRhYmxlJykuZWRpdGFibGUoe3N0eWxlc2hlZXRzOiBmYWxzZSx0eXBlOiAndGV4dGFyZWEnLCBzaG93YnV0dG9uczogJ2JvdHRvbScsIGRpc3BsYXk6IHRydWUsIGVtcHR5dGV4dDogJyAnfSlcbiAgICAkKCcuZWRpdGFibGUnKS5vZmYoJ2NsaWNrJyk7XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuZ2x5cGhpY29uLXBlbmNpbCcsIChlKSAtPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIGUuY3VycmVudFRhcmdldC5kYXRhc2V0Lm5vRWRpdGFibGUgaXNudCB1bmRlZmluZWQgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylbMF0uaWQpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpLmF0dHIoJ2RhdGEtaWQnKSlcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCBOdW1iZXIoKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpKVswXS5jZWxsSW5kZXgpICsgMSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuXG4gICAgI1xuICAgICMgQWRkIHNvcnQgaGFuZGxlcnMuXG4gICAgI1xuICAgICQoJy5zb3J0Jykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgIHR5cGUgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtc29ydC10eXBlJylcblxuICAgICAgaWYgdHlwZSBpcyAneWVhcidcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgeWVhci5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMClcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnbmFtZSdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgbmFtZS5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMSlcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnYW1vdW50J1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBhbW91bnQuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDMpXG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ2NvbnRyaWJ1dG9yLXR5cGUnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGNvbnRyaWJ1dG9yIHR5cGUuXG4gICAgICAgICNcbiAgICAgICAgc29ydFRhYmxlKCdbZGF0YS1lbnRpdHktdHlwZT1cIkNvbnRyaWJ1dGlvblwiXScsIDQpXG5cbiAgICAkKCdhJykub24gJ3NhdmUnLCAoZSwgcGFyYW1zKSAtPlxuICAgICAgICBlbnRpdHlUeXBlID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RhYmxlJylbMF0uZGF0YXNldC5lbnRpdHlUeXBlXG4gICAgICAgIGlkID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJylbMF0uZGF0YXNldC5pZFxuICAgICAgICBmaWVsZCA9IE9iamVjdC5rZXlzKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpWzBdLmRhdGFzZXQpWzBdXG5cbiAgICAgICAgaWYgZmllbGQgaXMgJ3ZvdGUnIG9yIGZpZWxkIGlzICdkaWRFbGVjdGVkT2ZmaWNpYWxQcm9wb3NlVGhpcydcbiAgICAgICAgICAjIyNcbiAgICAgICAgICAgIEN1cnJlbnQgZmllbGQgb3duZWQgYnkgRWxlY3RlZE9mZmljaWFsVm90ZVxuICAgICAgICAgICMjI1xuICAgICAgICAgIGVudGl0eVR5cGUgPSAnRWxlY3RlZE9mZmljaWFsVm90ZSdcbiAgICAgICAgICBpZCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnQoKS5maW5kKCdzcGFuJylbMF0uZGF0YXNldC5pZFxuXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XG4gICAgICAgICAgICBlZGl0UmVxdWVzdDoge1xuICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGVudGl0eVR5cGUsXG4gICAgICAgICAgICAgICAgZW50aXR5SWQ6IGlkLFxuICAgICAgICAgICAgICAgIGNoYW5nZXM6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0LmNoYW5nZXNbZmllbGRdID0gcGFyYW1zLm5ld1ZhbHVlXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0KTtcbiAgICAgICAgJC5hamF4ICcvZWRpdHJlcXVlc3QvY3JlYXRlJywge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqZWN0LFxuICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0L2pzb24nLFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIHRleHQgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgfVxuXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmFkZCcsIChlKSAtPlxuICAgICAgICB0YWJQYW5lID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylcbiAgICAgICAgdGFibGVUeXBlID0gdGFiUGFuZVswXS5pZFxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtICd0YWJsZVR5cGUnLCB0YWJsZVR5cGVcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY3VycmVudEVudGl0eSA9IG51bGxcbiAgICAgICAgY29uc29sZS5sb2codGFibGVUeXBlKVxuICAgICAgICBpZiB0YWJsZVR5cGUgaXMgJ1ZvdGVzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdMZWdpc2xhdGlvbidcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnQ29udHJpYnV0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZENvbnRyaWJ1dGlvbnMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnRW5kb3JzZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkRW5kb3JzZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdQdWJsaWNTdGF0ZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIFNldCBnZXQgdXJsIGNhbGxiYWNrLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAkKCcudXJsLWlucHV0Jykub24gJ2tleXVwJywgKCkgLT5cbiAgICAgICAgICAgICAgbWF0Y2hfdXJsID0gL1xcYihodHRwcz8pOlxcL1xcLyhbXFwtQS1aMC05Ll0rKShcXC9bXFwtQS1aMC05KyZAI1xcLyU9fl98ITosLjtdKik/KFxcP1tBLVowLTkrJkAjXFwvJT1+X3whOiwuO10qKT8vaVxuICAgICAgICAgICAgICBpZiAobWF0Y2hfdXJsLnRlc3QoJCh0aGlzKS52YWwoKSkpXG4gICAgICAgICAgICAgICAgJC5hamF4ICcvYXBpL3VybC9leHRyYWN0Jywge1xuICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAkKHRoaXMpLnZhbCgpLm1hdGNoKG1hdGNoX3VybClbMF1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudCA9ICQoJyN1cmwtc3RhdGVtZW50JylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgQ2xlYXIuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgJycpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIFNldCB0aXRsZS5cbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KHJlc3BvbnNlLmRhdGEudGl0bGUpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2h0bWwnKVxuICAgICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgICAjIElmIHVybCBwb2ludCB0byBodG1sLCBoaWRlIGltZyBhbmQgc2V0IGJvZHkuXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQocmVzcG9uc2UuZGF0YS5ib2R5KVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAneW91dHViZScpXG4gICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICMgSWYgdXJsIHBvaW50IHRvIHlvdXR1YmUsIHNob3cgeW91dHViZSBwcmV2aWV3IGltYWdlLlxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEucHJldmlldylcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgaXMgJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCByZXNwb25zZS5kYXRhLnByZXZpZXcpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuc2xpZGVEb3duKClcbiAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQgPSAkKCcjdXJsLXN0YXRlbWVudCcpXG5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIENsZWFyLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LXRpdGxlJykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsICcnKVxuXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KGVycm9yLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgaWYgdGFiUGFuZS5oYXNDbGFzcygnbG9hZGVkJykgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdGFiUGFuZVswXS5jbGFzc0xpc3QuYWRkKCdsb2FkZWQnKVxuXG4gICAgICAgIHBlcnNvbk1ldGEgPSB7XCJjcmVhdGVSZXF1ZXN0XCI6e1wiZW50aXR5TmFtZVwiOmN1cnJlbnRFbnRpdHksXCJrbm93bkZpZWxkc1wiOntcImVsZWN0ZWRPZmZpY2lhbFwiOnBlcnNvbi5pZH19fVxuICAgICAgICAkLmFqYXgoXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9hcGkvY3JlYXRlcmVxdWVzdC9uZXcnLFxuICAgICAgICAgICAgZGF0YTogcGVyc29uTWV0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgZW5kT2JqID0ge31cbiAgICAgICAgICAgICAgICBkYXRhLmNob2ljZXNbMF0uY2hvaWNlcy5mb3JFYWNoIChpdGVtLCBpbmRleCkgLT5cbiAgICAgICAgICAgICAgICAgIGlkcyA9IE9iamVjdC5rZXlzIGl0ZW1cbiAgICAgICAgICAgICAgICAgIGlkcy5mb3JFYWNoIChpZCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICBlbmRPYmpbaWRdID0gaXRlbVtpZF1cblxuICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMgPSAoKSAtPlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgZGF0YS5jaG9pY2VzWzBdLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICMgQWRkIGZpcnN0IGJsYW5rIG9wdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCAnJylcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gJydcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MXG4gICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgZW5kT2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBlbmRPYmpba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MXG5cbiAgICAgICAgICAgICAgICBzZWxlY3QgPSBudWxsXG5cbiAgICAgICAgICAgICAgICBpZiBjdXJyZW50RW50aXR5IGlzICdFbmRvcnNlbWVudCdcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnQ29udHJpYnV0aW9uJ1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdMZWdpc2xhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ID0gJCgnI2FkZFZvdGVzIHNlbGVjdCcpWzBdXG4gICAgICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjYWRkVm90ZXMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAoKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBGaWxsIGVsZWN0ZWQgb2ZmaWNpYWxzIHZvdGVzIHRhYmxlLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2xlZ2lzbGF0aW9uLXZvdGUnKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgICAgICQoJyNlbGVjdGVkVm90ZXMnKS5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ID0gJCgnI2FkZFN0YXRlbWVudHMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNhZGRTdGF0ZW1lbnRzJykuZmluZCgnW2RhdGEtcHJvdmlkZT1cImRhdGVwaWNrZXJcIl0nKS5vbihcbiAgICAgICAgICAgICAgICAgICAgICAnY2hhbmdlRGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgKCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0ZXBpY2tlciAnaGlkZSdcbiAgICAgICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGlmKGVycm9yLnN0YXR1cyA9PSA0MDEpIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICApO1xuXG4gICAgd2luZG93LmFkZEl0ZW0gPSAoZSkgLT5cbiAgICAgICAgbmV3UmVjb3JkID0ge31cbiAgICAgICAgbW9kYWwgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcubW9kYWwnKVxuICAgICAgICBtb2RhbFR5cGUgPSBtb2RhbFswXS5pZFxuICAgICAgICBlbnRpdHlUeXBlID0gbW9kYWxbMF0uZGF0YXNldC5lbnRpdHlUeXBlXG4gICAgICAgIGNvbnNvbGUubG9nKGVudGl0eVR5cGUpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkcy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICAjIyNcbiAgICAgICAgICBHZXQgdmFsdWUgZnJvbSB0ZXhhcmVhJ3MuXG4gICAgICAgICMjI1xuICAgICAgICBtb2RhbC5maW5kKCd0ZXh0YXJlYScpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgbmV3UmVjb3JkW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgYXNzb2NpYXRpb25zID0ge31cbiAgICAgICAgaWYgbW9kYWxUeXBlICE9ICdhZGRWb3RlcydcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tcImVsZWN0ZWRPZmZpY2lhbFwiXSA9IHBlcnNvbi5pZFxuICAgICAgICAjXG4gICAgICAgICMgQXJyYXkgb2Ygc3ViIGVudGl0aWVzLlxuICAgICAgICAjXG4gICAgICAgIGNoaWxkcyA9IFtdXG5cbiAgICAgICAgaWYgbW9kYWxUeXBlIGlzICdhZGRWb3RlcydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIEFkZCBpbmZvcm1hdGlvbiBhYm91dCB2b3Rlcy5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgbW9kYWwuZmluZCgnI2VsZWN0ZWRWb3RlcycpLmZpbmQoJ3RyW2RhdGEtZWxlY3RlZF0nKS4gZWFjaCAoaWR4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKGVsZW1lbnQpXG5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgIyBHZXQgYWxsIHN1YiBlbnRpdHkgZmllbGRzLlxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCdzZWxlY3QnKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZWxlbWVudC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICBBZGQgb25seSBpZiBhbGwgZmllbGRzIGlzIHNldC5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBpZiBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT0gMlxuICAgICAgICAgICAgICAgICAgICBmaWVsZHMgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snZmllbGRzJ10gPSBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snYXNzb2NpYXRpb25zJ10gPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snYXNzb2NpYXRpb25zJ11bZWxlbWVudC5hdHRyKCdkYXRhLWVudGl0eS10eXBlJyldID0gZWxlbWVudC5hdHRyKCdkYXRhLWVsZWN0ZWQnKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZEVudGl0eU5hbWUgPSBlbGVtZW50LnBhcmVudCgpLnBhcmVudCgpLmF0dHIgJ2RhdGEtZW50aXR5LXR5cGUnXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hpbGQgdHlwZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGNoaWxkRW50aXR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCBmaWVsZHMuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IGZpZWxkc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgY2F0ZWdvcnkuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKTtcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tzZWxlY3ROYW1lXSA9IHNlbGVjdGVkVmFsdWVcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZENvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IHR5cGUuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKVxuICAgICAgICAgICAgbmV3UmVjb3JkW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IHR5cGUuJylcbiAgICAgICAgICAgICAgc2VsZWN0LmZvY3VzKCk7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0ID0gJChzZWxlY3QpLmZpbmQoJzpzZWxlY3RlZCcpLnRleHQoKVxuICAgICAgICAgICAgbmV3UmVjb3JkW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCBjYXRlZ29yeS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBmaWVsZHM6IHsgZmllbGRzOiBuZXdSZWNvcmQsIGFzc29jaWF0aW9uczogYXNzb2NpYXRpb25zLCBjaGlsZHM6IGNoaWxkc30sXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAjIyNcbiAgICAgICAgICBBcHBlbmQgbmV3IGVudGl0eSB0byB0YWJsZS5cbiAgICAgICAgIyMjXG4gICAgICAgIHJvd1RlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKCQoXCIjcm93LSN7bW9kYWxUeXBlfVwiKS5odG1sKCkpO1xuXG4gICAgICAgICNcbiAgICAgICAgIyBDb2xsZWN0IGRhdGEuXG4gICAgICAgICNcbiAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc2VuZE9iamVjdC5jcmVhdGVSZXF1ZXN0LmZpZWxkcy5maWVsZHNcbiAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICBkYXRhWyd1c2VyJ10gPSB1c2VyLnVzZXJuYW1lXG5cbiAgICAgICAgaWYgbW9kYWxUeXBlIGlzICdhZGRWb3RlcydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBDaGVjayBpZiB1c2VyIHNwZWNpZmllZCBob3cgY3VycmVudCBlbGVjdGVkIG9mZmljaWFsIHZvdGVkLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBhZGQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciBvYmogaW4gc2VuZE9iamVjdC5jcmVhdGVSZXF1ZXN0LmZpZWxkcy5jaGlsZHNcbiAgICAgICAgICAgICAgaWYgTnVtYmVyKG9iai5maWVsZHMuYXNzb2NpYXRpb25zLmVsZWN0ZWRPZmZpY2lhbCkgPT0gTnVtYmVyKHBlcnNvbi5pZClcbiAgICAgICAgICAgICAgICBhZGQgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygb2JqLmZpZWxkcy5maWVsZHNcbiAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBJZiB3ZSBmb3VuZCwgc2hvdy5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgIGRhdGFbJ2NhdGVnb3J5J10gPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICAgJCgnI1ZvdGVzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSlcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZENvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgRm9ybWF0IGNvbnRyaWJ1dGlvbiBhbW91bnQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGRhdGEuY29udHJpYnV0b3JUeXBlID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICBkYXRhLmNvbnRyaWJ1dGlvbkFtb3VudCA9IG51bWVyYWwoZGF0YS5jb250cmlidXRpb25BbW91bnQpLmZvcm1hdCgnMCwwMDAnKVxuICAgICAgICAgICAgJCgnI0NvbnRyaWJ1dGlvbnMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGRhdGEuZW5kb3JzZXJUeXBlID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAkKCcjRW5kb3JzZW1lbnRzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUgcm93VGVtcGxhdGUoZGF0YSk7XG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgJCgnI1N0YXRlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcblxuICAgICAgICAjIyNcbiAgICAgICAgICBTZW5kIGNyZWF0ZSByZXF1ZXN0IHRvIGFwaS5cbiAgICAgICAgIyMjXG4gICAgICAgIGNvbnNvbGUubG9nIHNlbmRPYmplY3RcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogJy9hcGkvY3JlYXRlcmVxdWVzdC9jcmVhdGUnLFxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgIyBDbG9zZSBtb2RhbCB3aW5kb3dcbiAgICAgICAgbW9kYWwubW9kYWwgJ2hpZGUnXG5cbiAgICAjIyNcbiAgICAgICAgSWYgdXNlciB0cnkgdG8gYWRkIG9yIHVwZGF0ZSBzb21lIGRhdGEgd2l0aG91dCBsb2dnZWQgaW4sIHdlXG4gICAgICAgIHNob3cgaGltIGxvZ2luL3NpZ24gdXAgd2luZG93LiBBZnRlciBhdXRob3JpemluZyB1c2VyIHJlZGlyZWN0IGJhY2tcbiAgICAgICAgdG8gcGFnZSwgd2hlcmUgaGUgcHJlcyBhZGQvZWRpdCBidXR0b24uIEluIHRoYXQgY2FzZSB3ZSBzaG93IGhpbSBhcHByb3ByaWF0ZVxuICAgICAgICBtb2RhbCB3aW5kb3cuXG5cbiAgICAgICAgVGltZW91dCBuZWVkIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyB3aGVuIHdlIGdldCB1c2VyIGluZm9ybWF0aW9uIGFuZCBlbGVjdGVkIG9mZmljaWFsIGluZm9ybWF0aW9uLlxuICAgICMjI1xuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCAoKSAtPlxuICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICByZXR1cm5cblxuICAgICAgdHlwZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd0YWJsZVR5cGUnKVxuICAgICAgZGF0YUlkID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2RhdGFJZCcpXG4gICAgICBmaWVsZCA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdmaWVsZCcpXG5cbiAgICAgIGlmIChkYXRhSWQgJiYgZmllbGQpXG4gICAgICAgICQoJ2FbYXJpYS1jb250cm9scz1cIicgKyB0eXBlICsgJ1wiXScpLmNsaWNrKClcbiAgICAgICAgJCgndHJbZGF0YS1pZD0nK2RhdGFJZCsnXScpLmZpbmQoJ3RkOm50aC1jaGlsZCgnK2ZpZWxkKycpJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJycpXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdkYXRhSWQnLCAnJylcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2ZpZWxkJywgJycpXG5cbiAgICAgIGVsc2UgaWYgKHR5cGUpXG4gICAgICAgICQoJ2RpdiMnICsgdHlwZSkuZmluZCgnLmFkZCcpLmNsaWNrKClcbiAgICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJycpXG4gICAgLFxuICAgIDIwMDBcbiAgICApXG5cblxuIyMjXG4gIEFwcGVuZCBjcmVhdGUgcmVxdWVzdHMgdG8gYWxsIGN1cnJlbnQgZWxlY3RlZE9mZmljaWFsIHBhZ2UuXG4jIyNcbnNob3dDcmVhdGVSZXF1ZXN0cyA9IChwZXJzb24sIGNyZWF0ZVJlcXVlc3RzKSAtPlxuICAgICMgRG9uJ3Qgc2hvdyBub3QgYXBwcm92ZWQgY3JlYXRlIHJlcXVlc3QgdG8gYW5vbi5cbiAgICBpZiAoIWF1dGhvcml6ZWQpIHRoZW4gcmV0dXJuXG5cbiAgICBsZWdpc2xhdGlvblJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZFZvdGVzJykuaHRtbCgpKVxuICAgIGNvbnRyaWJ1dGlvblJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZENvbnRyaWJ1dGlvbnMnKS5odG1sKCkpXG4gICAgZW5kb3JzZW1lbnRSb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRFbmRvcnNlbWVudHMnKS5odG1sKCkpXG4gICAgc3RhdGVtZW50Um93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkU3RhdGVtZW50cycpLmh0bWwoKSlcblxuICAgIGZvciByZXF1ZXN0IGluIGNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICNcbiAgICAgICAgIyBQcmVwYXJlIGNyZWF0ZSByZXF1ZXN0IGRhdGEgZm9yIHRlbXBsYXRlLlxuICAgICAgICAjXG4gICAgICAgIGRhdGEgPSByZXF1ZXN0LmZpZWxkcy5maWVsZHNcbiAgICAgICAgZGF0YVsndXNlciddID0gcmVxdWVzdC51c2VyLnVzZXJuYW1lXG5cbiAgICAgICAgI1xuICAgICAgICAjIEZpbmQgb3V0IHRlbXBsYXRlIGZvciBjdXJyZW50IHJlcXVlc3QgYW5kIGFkZGl0aW9uYWwgdmFsdWVzLlxuICAgICAgICAjXG4gICAgICAgIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJMZWdpc2xhdGlvblwiXG4gICAgICAgICAgICBuYW1lID0gJ1ZvdGVzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBsZWdpc2xhdGlvblJvd1xuICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcmVxdWVzdC5maWVsZHMuY2hpbGRzWzBdLmZpZWxkcy5maWVsZHNcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IGNhdGVnb3JpZXNbcmVxdWVzdC5maWVsZHMuYXNzb2NpYXRpb25zLmlzc3VlQ2F0ZWdvcnkgLSAxXS5uYW1lXG5cbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiQ29udHJpYnV0aW9uXCJcbiAgICAgICAgICAgIG5hbWUgPSAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHRlbXBsYXRlID0gY29udHJpYnV0aW9uUm93XG5cbiAgICAgICAgICAgIGRhdGFbJ2NvbnRyaWJ1dGlvbkFtb3VudCddID0gbnVtZXJhbChkYXRhWydjb250cmlidXRpb25BbW91bnQnXSkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkVuZG9yc2VtZW50XCJcbiAgICAgICAgICAgIG5hbWUgPSAnRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBlbmRvcnNlbWVudFJvd1xuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJQdWJsaWNTdGF0ZW1lbnRcIlxuICAgICAgICAgICAgbmFtZSA9ICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBzdGF0ZW1lbnRSb3dcblxuICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IGNhdGVnb3JpZXNbcmVxdWVzdC5maWVsZHMuYXNzb2NpYXRpb25zLmlzc3VlQ2F0ZWdvcnkgLSAxXS5uYW1lXG5cbiAgICAgICAgJChcIlxcIyN7bmFtZX0gdHI6bGFzdC1jaGlsZFwiKS5iZWZvcmUodGVtcGxhdGUoZGF0YSkpXG5cblxuJCgnI2RhdGFDb250YWluZXInKS5wb3BvdmVyKHtcbiAgICBwbGFjZW1lbnQ6ICdib3R0b20nXG4gICAgc2VsZWN0b3I6ICcucmFuaydcbiAgICBhbmltYXRpb246IHRydWVcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCIgcm9sZT1cInRvb2x0aXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3BvdmVyLXRpdGxlLWN1c3RvbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicG9wb3Zlci1idG5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiL3Jhbmtfb3JkZXJcIj5BbGwgcmFua3M8L2J1dHRvbj48L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4nXG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZihhID09IGIpXG4gICAgICAgIHJldHVybiBvcHRzLmZuIHRoaXNcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBvcHRzLmludmVyc2UgdGhpc1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdjb25jYXQnLCAocGFyYW0xLCBwYXJhbTIpIC0+XG4gICAgdGVtcCA9IFtwYXJhbTEsIHBhcmFtMl1cbiAgICByZXR1cm4gdGVtcC5qb2luKCcnKVxuXG4kKCcjZGF0YUNvbnRhaW5lcicpLm9uICdjbGljaycsIChlKSAtPlxuICAgICRlbGVtZW50ID0gJChlLnRhcmdldCk7XG4gICAgcG9wb3ZlckNvbnRlbnQgPSAkZWxlbWVudC5wYXJlbnQoKS5maW5kKCcucG9wb3Zlci1jb250ZW50JylcbiAgICBmaWVsZE5hbWUgPSAkZWxlbWVudC5hdHRyKCdkYXRhLWZpZWxkJylcbiAgICBwb3BvdmVyVHBsID0gJCgnI3JhbmtQb3BvdmVyJykuaHRtbCgpXG4gICAgYWRkaXRpb25hbFJvd3NUcGwgPSAkKCcjYWRkaXRpb25hbFJvd3MnKS5odG1sKClcbiAgICBwcmVsb2FkZXIgPSBwb3BvdmVyQ29udGVudC5maW5kKCdsb2FkZXInKVxuXG4gICAgcHJldmlvdXNTY3JvbGxUb3AgPSAwO1xuICAgIGN1cnJlbnRQYWdlID0gMDtcbiAgICBsb2FkaW5nID0gZmFsc2U7XG4gICAgcG9wb3Zlck9yZGVyID0gbnVsbDtcblxuICAgICMgQ2xvc2UgYWxsIG90aGVyIHBvcG92ZXJzXG4gICAgaWYgISRlbGVtZW50LmNsb3Nlc3QoJy5wb3BvdmVyJylbMF1cbiAgICAgICAgJCgnLnJhbmsnKS5ub3QoZS50YXJnZXQpLnBvcG92ZXIoJ2Rlc3Ryb3knKVxuXG4gICAgIyBvcmRlciBbZGVzYywgYXNjXVxuICAgIGxvYWROZXdSb3dzID0gKG9yZGVyKSAtPlxuICAgICAgICBsb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgcG9wb3Zlck9yZGVyID0gb3JkZXJcbiAgICAgICAgcHJlbG9hZGVyLnNob3coKVxuICAgICAgICB0YWJsZSA9IHBvcG92ZXJDb250ZW50LmZpbmQoJ3RhYmxlIHRib2R5JylcbiAgICAgICAgdGFibGUuaHRtbCAnJ1xuICAgICAgICBjdXJyZW50UGFnZSA9IDA7XG4gICAgICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gMFxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKycvZ2V0X3JhbmtzJ1xuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgcGFnZTogY3VycmVudFBhZ2VcbiAgICAgICAgICAgICAgICBvcmRlcjogb3JkZXJcbiAgICAgICAgICAgICAgICBmaWVsZF9uYW1lOiBmaWVsZE5hbWVJbkNhbWVsQ2FzZSAjIFRyYW5zZm9ybSB0byBjYW1lbENhc2VcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoYWRkaXRpb25hbFJvd3NUcGwpXG4gICAgICAgICAgICAgICAgdGFibGUuaHRtbCBjb21waWxlZFRlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHByZWxvYWRlci5oaWRlKClcblxuICAgIHBvcG92ZXJDb250ZW50Lm9uICdjbGljaycsICd0aCcsIChlKSAtPlxuICAgICAgICAkY29sdW1uID0gYCQoZS50YXJnZXQpLmhhc0NsYXNzKCdzb3J0YWJsZScpID8gJChlLnRhcmdldCkgOiAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0aCcpO2BcbiAgICAgICAgaWYgJGNvbHVtbi5oYXNDbGFzcygnc29ydGFibGUnKVxuICAgICAgICAgICAgaWYgJGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAgICAgICAgICAgbG9hZE5ld1Jvd3MoJ2FzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5yZW1vdmVDbGFzcygnZGVzYycpLmFkZENsYXNzKCdhc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKS5hZGRDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgICAgICAgIGVsc2UgaWYgJGNvbHVtbi5oYXNDbGFzcygnYXNjJylcbiAgICAgICAgICAgICAgICBsb2FkTmV3Um93cygnZGVzYycpXG4gICAgICAgICAgICAgICAgJGNvbHVtbi5yZW1vdmVDbGFzcygnYXNjJykuYWRkQ2xhc3MoJ2Rlc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKS5hZGRDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2FkTmV3Um93cygnYXNjJylcbiAgICAgICAgICAgICAgICAkY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgICAgICAgICAgICRjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX190b3AnKVxuXG4gICAgaWYgZmllbGROYW1lXG4gICAgICAgIGZpZWxkTmFtZUluQ2FtZWxDYXNlID0gZmllbGROYW1lLnJlcGxhY2UgL18oW2EtejAtOV0pL2csIChnKSAtPiByZXR1cm4gZ1sxXS50b1VwcGVyQ2FzZSgpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiAnL2FwaS9nb3Zlcm5tZW50Jyt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUrJy9nZXRfcmFua3MnXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgZGF0YTpcbiAgICAgICAgICAgICAgICBmaWVsZF9uYW1lOiBmaWVsZE5hbWVJbkNhbWVsQ2FzZSAjIFRyYW5zZm9ybSB0byBjYW1lbENhc2VcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUocG9wb3ZlclRwbClcbiAgICAgICAgICAgICAgICBwb3BvdmVyQ29udGVudC5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZGF0YSlcblxuICAgICMgTGF6eSBsb2FkIGZvciBwb3BvdmVyXG4gICAgcG9wb3ZlckNvbnRlbnQuc2Nyb2xsICgpIC0+XG4gICAgICBjdXJyZW50U2Nyb2xsVG9wID0gcG9wb3ZlckNvbnRlbnQuc2Nyb2xsVG9wKClcbiAgICAgIGlmICBwcmV2aW91c1Njcm9sbFRvcCA8IGN1cnJlbnRTY3JvbGxUb3AgJiYgY3VycmVudFNjcm9sbFRvcCA+IDAuNSAqIHBvcG92ZXJDb250ZW50WzBdLnNjcm9sbEhlaWdodFxuICAgICAgICBjb25zb2xlLmxvZygnYXNkYXNkJyk7XG4gICAgICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gY3VycmVudFNjcm9sbFRvcFxuICAgICAgICBpZiBsb2FkaW5nIGlzIGZhbHNlXG4gICAgICAgICAgbG9hZGluZyA9IHRydWVcbiAgICAgICAgICBwcmVsb2FkZXIuc2hvdygpO1xuICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICB1cmw6ICcvYXBpL2dvdmVybm1lbnQnICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgJy9nZXRfcmFua3MnXG4gICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgICBwYWdlOiArK2N1cnJlbnRQYWdlXG4gICAgICAgICAgICAgICAgICBvcmRlcjogcG9wb3Zlck9yZGVyXG4gICAgICAgICAgICAgICAgICBmaWVsZF9uYW1lOiBmaWVsZE5hbWVJbkNhbWVsQ2FzZSAjIFRyYW5zZm9ybSB0byBjYW1lbENhc2VcbiAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICBsb2FkaW5nID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgIHByZWxvYWRlci5oaWRlKClcbiAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoYWRkaXRpb25hbFJvd3NUcGwpXG4gICAgICAgICAgICAgICAgICBwb3BvdmVyQ29udGVudC5maW5kKCd0YWJsZSB0Ym9keScpWzBdLmlubmVySFRNTCArPSBjb21waWxlZFRlbXBsYXRlKGRhdGEpXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgJy5lbGVjdGVkX2xpbmsnLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXJsID0gZS5jdXJyZW50VGFyZ2V0LnBhdGhuYW1lXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgdXJsLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbiA9IGRhdGEucGVyc29uXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3RzID0gZGF0YS5jcmVhdGVSZXF1ZXN0c1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzXG5cbiAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICAgICAgRm9ybWF0IGNvbnRyaWJ1dGlvbiBhbW91bnQuXG4gICAgICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgICAgICBmb3IgY29udHJpYnV0aW9uIGluIHBlcnNvbi5jb250cmlidXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCA9IG51bWVyYWwoY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQpLmZvcm1hdCgnMCwwMDAnKVxuXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuICAgICAgICAgICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGUgPSBtb21lbnQoaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQsICdZWVlZLU1NLUREJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUuZm9ybWF0ICdMJ1xuXG4gICAgICAgICAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBodG1sfSwgJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uKTtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuIyBSb3V0ZSAvXG5pZiByb3V0ZVR5cGUgaXMgMFxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIGdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICcvbGVnYWN5L2RhdGEvaF90eXBlc19jYV8yLmpzb24nLCA3XG4gICAgZ292X3NlbGVjdG9yLm9uX3NlbGVjdGVkID0gKGV2dCwgZGF0YSwgbmFtZSkgLT5cbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIHVybCA9ICcvJyArIGRhdGEuYWx0VHlwZVNsdWcgKyAnLycgKyBkYXRhLnNsdWdcbiAgICAgICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgICAgICAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXG4gICAgaWYgIXVuZGVmXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5odG1sICQoJyNzZWFyY2gtY29udGFpbmVyLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICMgTG9hZCBpbnRyb2R1Y3RvcnkgdGV4dCBmcm9tIHRleHRzL2ludHJvLXRleHQuaHRtbCB0byAjaW50cm8tdGV4dCBjb250YWluZXIuXG4gICAgICAgICQuZ2V0IFwiL2xlZ2FjeS90ZXh0cy9pbnRyby10ZXh0Lmh0bWxcIiwgKGRhdGEpIC0+ICQoXCIjaW50cm8tdGV4dFwiKS5odG1sIGRhdGFcbiAgICAgICAgZ292bWFwID0gcmVxdWlyZSAnLi9nb3ZtYXAuY29mZmVlJ1xuICAgICAgICBnZXRfY291bnRpZXMgR09WV0lLSS5kcmF3X3BvbHlnb25zXG4gICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiAkKCcjc2VhcmNoQ29udGFpbmVyJykuaHRtbCgpfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsICcvJ1xuICAgICAgICB1bmRlZiA9IHRydWVcbiAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuICAgIHN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGgoKVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkKCcjZ292bWFwJykub24gJ2NsaWNrJywgJy5pbmZvLXdpbmRvdy11cmknLCAoZSkgLT5cbiAgICAgICAgdXJpID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnVyaVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcblxuIyBSb3V0ZSAvcmFua19vcmRlclxuaWYgcm91dGVUeXBlIGlzIDFcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG5cbiAgICBvcmRlcmVkRmllbGRzID0gW11cblxuICAgICNcbiAgICAjIFNldCBzb3J0IGNhbGxiYWNrLlxuICAgICNcbiAgICAkKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnLnJhbmtfc29ydCcsIChlKSAtPlxuICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcblxuICAgICAgY29sdW1uID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgICB0YWJQYW5lbCA9IGNvbHVtbi5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgZmllbGROYW1lID0gY29sdW1uLmF0dHIoJ2RhdGEtc29ydC10eXBlJylcbiAgICAgIGljb24gPSBjb2x1bW4uZmluZCgnaScpXG5cbiAgICAgIGlmIGljb24uaGFzQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gICAgICAgICNcbiAgICAgICAgaWNvbi5hZGRDbGFzcygnaWNvbl9fYm90dG9tJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICAgIG9yZGVyZWRGaWVsZHNbZmllbGROYW1lXSA9ICdkZXNjJ1xuICAgICAgZWxzZSBpZiBpY29uLmhhc0NsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgICAjXG4gICAgICAgICMgUmVtb3ZlIHNvcnQgYnkgdGhpcyBmaWVsZC5cbiAgICAgICAgI1xuICAgICAgICBpY29uLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgICBkZWxldGUgb3JkZXJlZEZpZWxkc1tmaWVsZE5hbWVdXG4gICAgICBlbHNlXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGluIGFzY2VuZGluZyBvcmRlci5cbiAgICAgICAgI1xuICAgICAgICBpY29uLmFkZENsYXNzKCdpY29uX190b3AnKVxuICAgICAgICBvcmRlcmVkRmllbGRzW2ZpZWxkTmFtZV0gPSAnYXNjJ1xuXG4gICAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvcmFua19vcmRlclwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICBhbHRfdHlwZTogdGFiUGFuZWwuYXR0cignaWQnKVxuICAgICAgICAgIGZpZWxkc19vcmRlcjogJC5leHRlbmQoe30sIG9yZGVyZWRGaWVsZHMpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgIGNvbnNvbGUubG9nIGRhdGFcblxuICAgICAgICAgICNcbiAgICAgICAgICAjIFVwZGF0ZSB0YWJsZVxuICAgICAgICAgICNcbiAgICAgICAgICB0YWJsZSA9IHRhYlBhbmVsLmZpbmQoJ3RhYmxlJylcbiAgICAgICAgICBoZWFkID0gdGFibGUuZmluZCgndHI6Zmlyc3QnKVxuXG4gICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpO1xuXG4gICAgICAgICAgI1xuICAgICAgICAgICMgUHVzaCB0ZW1wbGF0ZS5cbiAgICAgICAgICAjXG4gICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogJCgnI2RldGFpbHMnKS5odG1sKCl9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy9yYW5rX29yZGVyJ1xuXG4gICAgYWx0VHlwZXNEYXRhID0ge31cbiAgICBHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlID0gJ0NpdHknXG4gICAgR09WV0lLSS5jdXJyZW50QWx0VHlwZUxvd2VyQ2FzZSA9ICdjaXR5J1xuICAgIEdPVldJS0kuaXRlbXNQZXJQYWdlID0gMTA7XG4gICAgR09WV0lLSS5jdXJyZW50UGFnZSA9IDA7XG5cbiAgICBzZXRFdmVudHMgPSAoKSAtPlxuICAgICAgICAkKCdhW2RhdGEtdG9nZ2xlPVwidGFiXCJdJykub24gJ3Nob3duLmJzLnRhYicsIChlKSAtPlxuICAgICAgICAgICAgR09WV0lLSS5jdXJyZW50QWx0VHlwZSA9ICQoZS50YXJnZXQpLmF0dHIoXCJocmVmXCIpLnJlcGxhY2UoJyMnLCAnJylcbiAgICAgICAgICAgIEdPVldJS0kuY3VycmVudEFsdFR5cGVMb3dlckNhc2UgPSBHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIEdPVldJS0kuY3VycmVudFBhZ2UgPSAwO1xuICAgICAgICAgICAgcmVuZGVyUGFnaW5hdGlvbigpXG5cbiAgICAgICAgJCgnLnBhZ2luYXRpb24nKS5vbiAnY2xpY2snLCAnYScsIChlKSAtPlxuICAgICAgICAgICAgcGFnZSA9ICQoZS50YXJnZXQpLmF0dHIoJ2RhdGEtcGFnZScpXG4gICAgICAgICAgICBpZiBwYWdlIGlzbnQgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgR09WV0lLSS5jdXJyZW50UGFnZSA9IHBhcnNlSW50KHBhZ2UpLTFcbiAgICAgICAgICAgICAgICByZW5kZXJUZW1wbGF0ZShHT1ZXSUtJLmN1cnJlbnRQYWdlKVxuXG4gICAgcmVuZGVyUGFnaW5hdGlvbiA9ICgpIC0+XG4gICAgICAgICRwYWdpbmF0aW9uQ29udGFpbmVyID0gJCgnIycrR09WV0lLSS5jdXJyZW50QWx0VHlwZSsnIC5wYWdpbmF0aW9uJylcbiAgICAgICAgJHBhZ2luYXRpb25Db250YWluZXIuaHRtbCgnJylcbiAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xzID0gJydcbiAgICAgICAgaWYgR09WV0lLSS5jdXJyZW50UGFnZSA+IDBcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBhcmlhLWxhYmVsPVwiUHJldmlvdXNcIiBvbmNsaWNrPVwiR09WV0lLSS5wcmV2UGFnZShldmVudClcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mbGFxdW87PC9zcGFuPjwvYT48L2xpPidcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpPjxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBkYXRhLXBhZ2U9XCInK0dPVldJS0kuY3VycmVudFBhZ2UrJ1wiPicgKyAoR09WV0lLSS5jdXJyZW50UGFnZSkgKyAnPC9hPjwvbGk+J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaSBjbGFzcz1cImRpc2FibGVkXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGFyaWEtbGFiZWw9XCJQcmV2aW91c1wiPjxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZsYXF1bzs8L3NwYW4+PC9hPjwvbGk+J1xuXG4gICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpIGNsYXNzPVwiYWN0aXZlXCI+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtcGFnZT1cIicrKEdPVldJS0kuY3VycmVudFBhZ2UrMSkrJ1wiPicgKyAoR09WV0lLSS5jdXJyZW50UGFnZSsxKSArICc8L2E+PC9saT4nXG5cbiAgICAgICAgaWYgR09WV0lLSS5jdXJyZW50UGFnZSBpcyBHT1ZXSUtJLmxhc3RQYWdlKClcbiAgICAgICAgICAgIHBhZ2luYXRpb25Db250cm9scyArPSAnPGxpIGNsYXNzPVwiZGlzYWJsZWRcIj48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgYXJpYS1sYWJlbD1cIk5leHRcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mcmFxdW87PC9zcGFuPjwvYT48L2xpPidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGFnaW5hdGlvbkNvbnRyb2xzICs9ICc8bGk+PGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtcGFnZT1cIicrKEdPVldJS0kuY3VycmVudFBhZ2UrMikrJ1wiPicgKyAoR09WV0lLSS5jdXJyZW50UGFnZSsyKSArICc8L2E+PC9saT4nXG4gICAgICAgICAgICBwYWdpbmF0aW9uQ29udHJvbHMgKz0gJzxsaT48YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgYXJpYS1sYWJlbD1cIk5leHRcIiBvbmNsaWNrPVwiR09WV0lLSS5uZXh0UGFnZShldmVudClcIj48c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mcmFxdW87PC9zcGFuPjwvYT48L2xpPidcbiAgICAgICAgJHBhZ2luYXRpb25Db250YWluZXIuYXBwZW5kKHBhZ2luYXRpb25Db250cm9scyk7XG5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvcmFua19vcmRlclwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICBhbHRUeXBlc0RhdGEgPSBkYXRhO1xuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBSZW5kZXIgcmFuayBvcmRlciB0ZW1wbGF0ZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIHRwbCA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcmFuay1vcmRlci1wYWdlJykuaHRtbCgpKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRwbChhbHRUeXBlc0RhdGEpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpO1xuXG4gICAgICAgICAgICBzZXRFdmVudHMoKVxuICAgICAgICAgICAgcmVuZGVyUGFnaW5hdGlvbigpXG5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgICMgUHVzaCB0ZW1wbGF0ZS5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuIyAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IHRwbH0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnL3Jhbmtfb3JkZXInXG5cbiAgICByZW5kZXJUZW1wbGF0ZSA9IChwYWdlKSAtPlxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogXCIvYXBpL3Jhbmtfb3JkZXJcIlxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgYWx0X3R5cGU6IEdPVldJS0kuY3VycmVudEFsdFR5cGVcbiAgICAgICAgICAgICAgICBwYWdlOiBwYWdlIHx8IEdPVldJS0kuY3VycmVudFBhZ2VcbiAgICAgICAgICAgICAgICBsaW1pdDogR09WV0lLSS5pdGVtc1BlclBhZ2VcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGFsdFR5cGVzRGF0YVtHT1ZXSUtJLmN1cnJlbnRBbHRUeXBlTG93ZXJDYXNlXSA9IGRhdGFcbiAgICAgICAgICAgICAgICB0cGwgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3RhYmxlLWNpdHknKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgJCgnIycrR09WV0lLSS5jdXJyZW50QWx0VHlwZSkuaHRtbCB0cGwoYWx0VHlwZXNEYXRhKVxuICAgICAgICAgICAgICAgIHNldEV2ZW50cygpXG4gICAgICAgICAgICAgICAgcmVuZGVyUGFnaW5hdGlvbigpXG5cbiAgICBHT1ZXSUtJLm5leHRQYWdlID0gKGUpIC0+XG4gICAgICAgICsrR09WV0lLSS5jdXJyZW50UGFnZVxuICAgICAgICByZW5kZXJUZW1wbGF0ZSgpXG5cblxuICAgIEdPVldJS0kucHJldlBhZ2UgPSAoZSkgLT5cbiAgICAgICAgLS1HT1ZXSUtJLmN1cnJlbnRQYWdlXG4gICAgICAgIHJlbmRlclRlbXBsYXRlKClcblxuXG4gICAgR09WV0lLSS5maXJzdFBhZ2UgPSAgKCkgLT5cbiAgICAgICAgcmV0dXJuIGBHT1ZXSUtJLmN1cnJlbnRQYWdlID09IDBgXG5cbiAgICBHT1ZXSUtJLmxhc3RQYWdlID0gICgpIC0+XG4gICAgICAgIGxhc3RQYWdlID0gTWF0aC5jZWlsKGFsdFR5cGVzRGF0YS5jb3VudCAvIEdPVldJS0kuaXRlbXNQZXJQYWdlIC0gMSlcbiAgICAgICAgcmV0dXJuIEdPVldJS0kuY3VycmVudFBhZ2UgPT0gbGFzdFBhZ2VcblxuICAgIEdPVldJS0kubnVtYmVyT2ZQYWdlcyA9ICgpIC0+XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwoYWx0VHlwZXNEYXRhLmNvdW50IC8gR09WV0lLSS5pdGVtc1BlclBhZ2UpXG4gICAgXG5cblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWVcbmlmIHJvdXRlVHlwZSBpcyAyXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIENpdmljIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJC5hamF4XG4jICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyAnR09WOidcbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGdvdnNcblxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgIHJ1biA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHJ1blxuICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBydW59LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgd2luZG93LnBhdGhcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG5cbiMgUm91dGUgLzphbHRfbmFtZS86Y2l0eV9uYW1lLzplbGVjdGVkX25hbWVcbmlmIHJvdXRlVHlwZSBpcyAzXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCIvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuXG4gICAgICAgICAgICBwZXJzb24gPSBkYXRhLnBlcnNvblxuICAgICAgICAgICAgY3JlYXRlUmVxdWVzdHMgPSBkYXRhLmNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICAgICBjYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzXG4gICAgICAgICAgICBwZXJzb24uY2F0ZWdvcnlfc2VsZWN0ID0gW11cblxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIFByZXBhcmUgb3B0aW9ucyBmb3Igc2VsZWN0IGluIElzc3Vlc0NhdGVnb3J5IGVkaXQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QucHVzaCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGNhdGVnb3J5LmlkXG4gICAgICAgICAgICAgICAgdGV4dDogY2F0ZWdvcnkubmFtZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBwZXJzb24uY2F0ZWdvcnlfc2VsZWN0ID0gSlNPTi5zdHJpbmdpZnkocGVyc29uLmNhdGVnb3J5X3NlbGVjdCk7XG5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZm9yIGNvbnRyaWJ1dGlvbiBpbiBwZXJzb24uY29udHJpYnV0aW9uc1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50ID0gbnVtZXJhbChjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCkuZm9ybWF0KCcwLDAwMCcpXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHBlcnNvblxuXG4gICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiBwZXJzb24udm90ZXMgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkLCAnWVlZWS1NTS1ERCcpO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUuZm9ybWF0ICdMJ1xuXG4gICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcblxuICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuXG4gICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuICAgICMjI1xuICAgICAgR2V0IGN1cnJlbnQgdXNlci5cbiAgICAjIyNcbiAgICAkdXNlckJ0biA9ICQoJyN1c2VyJylcbiAgICAkdXNlckJ0bkxpbmsgPSAkdXNlckJ0bi5maW5kKCdhJyk7XG4gICAgJC5hamF4ICcvYXBpL3VzZXInLCB7XG4gICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICB1c2VyLnVzZXJuYW1lID0gcmVzcG9uc2UudXNlcm5hbWU7XG4gICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICR1c2VyVGV4dCA9ICQoJyN1c2VyLXRleHQnKS5maW5kKCdhJyk7XG4gICAgICAgICAgICAgICR1c2VyVGV4dC5odG1sKFwiTG9nZ2VkIGluIGFzICN7dXNlci51c2VybmFtZX1cIiArICR1c2VyVGV4dC5odG1sKCkpXG4gICAgICAgICAgICAgICR1c2VyQnRuTGluay5odG1sKFwiU2lnbiBPdXRcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSAnL2xvZ291dCdcblxuICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDEgdGhlbiBhdXRob3JpemVkID0gZmFsc2VcbiAgICAgICAgICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJMb2dpbiAvIFNpZ24gVXBcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICB9IiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSBcbiAgICAgICAgbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLmdvdl9uYW1lLCB3b3JkcywgcmVncylcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXG4gICAgI2QuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpJylcbiAgW3dvcmRzLHJlZ3NdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWVyeU1hdGhlclxuXG4iLCJcbiMjI1xuIyBmaWxlOiB0ZW1wbGF0ZXMyLmNvZmZlZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jXG4jIENsYXNzIHRvIG1hbmFnZSB0ZW1wbGF0ZXMgYW5kIHJlbmRlciBkYXRhIG9uIGh0bWwgcGFnZS5cbiNcbiMgVGhlIG1haW4gbWV0aG9kIDogcmVuZGVyKGRhdGEpLCBnZXRfaHRtbChkYXRhKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5cblxuIyBMT0FEIEZJRUxEIE5BTUVTXG5maWVsZE5hbWVzID0ge31cbmZpZWxkTmFtZXNIZWxwID0ge31cblxuXG5yZW5kZXJfZmllbGRfdmFsdWUgPSAobixtYXNrLGRhdGEpIC0+XG4gIHY9ZGF0YVtuXVxuICBpZiBub3QgZGF0YVtuXVxuICAgIHJldHVybiAnJ1xuXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIGlmICcnICE9IG1hc2tcbiAgICAgIGlmIGRhdGFbbisnX3JhbmsnXSBhbmQgZGF0YS5tYXhfcmFua3MgYW5kIGRhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddXG4gICAgICAgIHYgPSBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgICAgICAjIFRyYW5zZm9ybSBmcm9tIHVuZGVyc2NvcmUgKHNvbWVfZmllbGROYW1lKSB0byByZWFkYWJsZSBmb3JtYXRcbiAgICAgICAgdGl0bGUgPSBuLnRvU3RyaW5nKClcbiAgICAgICAgdGl0bGUgPSB0aXRsZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRpdGxlLnNsaWNlKDEpXG4gICAgICAgIHRpdGxlID0gdGl0bGUucmVwbGFjZSAvXyhbYS16XSkvZywgKGcpIC0+IHJldHVybiAnICcgKyBnWzFdLnRvVXBwZXJDYXNlKClcbiAgICAgICAgcmV0dXJuIFwiI3t2fSA8YSBjbGFzcz0ncmFuaydcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhLWZpZWxkPScje259X3JhbmsnXG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU9JyN7dGl0bGV9IHJhbmtzJz5cbiAgICAgICAgICAgICAgICAgICAgICAoI3tkYXRhW24rJ19yYW5rJ119IG9mICN7ZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ119KTwvYT5cIlxuICAgICAgaWYgbiA9PSBcIm51bWJlcl9vZl9mdWxsX3RpbWVfZW1wbG95ZWVzXCJcbiAgICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KCcwLDAnKVxuICAgICAgcmV0dXJuIG51bWVyYWwodikuZm9ybWF0KG1hc2spXG4gICAgZWxzZVxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmRcbiAgICAgIG4gPT0gXCJvcGVuX2Vucm9sbG1lbnRfc2Nob29sc1wiXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxuICAgICAgaWYgdi5sZW5ndGggPiAyMCBhbmRcbiAgICAgIG4gPT0gXCJwYXJlbnRfdHJpZ2dlcl9lbGlnaWJsZV9zY2hvb2xzXCJcbiAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHYubGVuZ3RoID4gMjFcbiAgICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMjEpXG4gICAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIHZcblxuXG5yZW5kZXJfZmllbGRfbmFtZV9oZWxwID0gKGZOYW1lKSAtPlxuICAjaWYgZmllbGROYW1lc0hlbHBbZk5hbWVdXG4gICAgcmV0dXJuIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuXG5yZW5kZXJfZmllbGRfbmFtZSA9IChmTmFtZSkgLT5cbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XG4gICAgcmV0dXJuIGZpZWxkTmFtZXNbZk5hbWVdXG5cbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcbiAgcyA9IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKVxuICByZXR1cm4gc1xuXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gIGlmIFwiX1wiID09IHN1YnN0ciBmTmFtZSwgMCwgMVxuICAgIFwiXCJcIlxuICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiZuYnNwOzwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgZWxzZVxuICAgIHJldHVybiAnJyB1bmxlc3MgZlZhbHVlID0gZGF0YVtmTmFtZV1cbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nICA+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08ZGl2Pjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4je3JlbmRlcl9maWVsZF92YWx1ZShmTmFtZSxkYXRhKX08L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG5cbnJlbmRlcl9zdWJoZWFkaW5nID0gKGZOYW1lLCBtYXNrLCBub3RGaXJzdCktPlxuICBzID0gJydcbiAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmTmFtZVxuICBpZiBtYXNrID09IFwiaGVhZGluZ1wiXG4gICAgaWYgbm90Rmlyc3QgIT0gMFxuICAgICAgcyArPSBcIjxici8+XCJcbiAgICBzICs9IFwiPGRpdj48c3BhbiBjbGFzcz0nZi1uYW0nPiN7Zk5hbWV9PC9zcGFuPjxzcGFuIGNsYXNzPSdmLXZhbCc+IDwvc3Bhbj48L2Rpdj5cIlxuICByZXR1cm4gc1xuXG5yZW5kZXJfZmllbGRzID0gKGZpZWxkcyxkYXRhLHRlbXBsYXRlKS0+XG4gIGggPSAnJ1xuICBmb3IgZmllbGQsaSBpbiBmaWVsZHNcbiAgICBpZiAodHlwZW9mIGZpZWxkIGlzIFwib2JqZWN0XCIpXG4gICAgICBpZiBmaWVsZC5tYXNrID09IFwiaGVhZGluZ1wiXG4gICAgICAgIGggKz0gcmVuZGVyX3N1YmhlYWRpbmcoZmllbGQubmFtZSwgZmllbGQubWFzaywgaSlcbiAgICAgICAgZlZhbHVlID0gJydcbiAgICAgIGVsc2VcbiAgICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGRhdGFcbiAgICAgICAgaWYgKCcnICE9IGZWYWx1ZSBhbmQgZlZhbHVlICE9ICcwJylcbiAgICAgICAgICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZpZWxkLm5hbWVcbiAgICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZpZWxkLm5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZWYWx1ZSA9ICcnXG5cbiAgICBlbHNlXG4gICAgICBmVmFsdWUgPSByZW5kZXJfZmllbGRfdmFsdWUgZmllbGQsICcnLCBkYXRhXG4gICAgICBpZiAoJycgIT0gZlZhbHVlKVxuICAgICAgICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZpZWxkXG4gICAgICAgIGZOYW1lSGVscCA9IHJlbmRlcl9maWVsZF9uYW1lX2hlbHAgZk5hbWVcbiAgICBpZiAoJycgIT0gZlZhbHVlKVxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmTmFtZSwgdmFsdWU6IGZWYWx1ZSwgaGVscDogZk5hbWVIZWxwKVxuICByZXR1cm4gaFxuXG5yZW5kZXJfZmluYW5jaWFsX2ZpZWxkcyA9IChkYXRhLHRlbXBsYXRlKS0+XG4gIGggPSAnJ1xuICBtYXNrID0gJzAsMCdcbiAgY2F0ZWdvcnkgPSAnJ1xuICBpc19maXJzdF9yb3cgPSBmYWxzZVxuICBmb3IgZmllbGQgaW4gZGF0YVxuICAgIGlmIGNhdGVnb3J5ICE9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGNhdGVnb3J5ID0gZmllbGQuY2F0ZWdvcnlfbmFtZVxuICAgICAgaWYgY2F0ZWdvcnkgPT0gJ092ZXJ2aWV3J1xuICAgICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IFwiPGI+XCIgKyBjYXRlZ29yeSArIFwiPC9iPlwiLCBnZW5mdW5kOiAnJywgb3RoZXJmdW5kczogJycsIHRvdGFsZnVuZHM6ICcnKVxuICAgICAgZWxzZSBpZiBjYXRlZ29yeSA9PSAnUmV2ZW51ZXMnXG4gICAgICAgIGggKz0gJzwvYnI+J1xuICAgICAgICBoICs9IFwiPGI+XCIgKyB0ZW1wbGF0ZShuYW1lOiBjYXRlZ29yeSwgZ2VuZnVuZDogXCJHZW5lcmFsIEZ1bmRcIiwgb3RoZXJmdW5kczogXCJPdGhlciBGdW5kc1wiLCB0b3RhbGZ1bmRzOiBcIlRvdGFsIEdvdi4gRnVuZHNcIikgKyBcIjwvYj5cIlxuICAgICAgICBpc19maXJzdF9yb3cgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIGggKz0gJzwvYnI+J1xuICAgICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IFwiPGI+XCIgKyBjYXRlZ29yeSArIFwiPC9iPlwiLCBnZW5mdW5kOiAnJywgb3RoZXJmdW5kczogJycsIHRvdGFsZnVuZHM6ICcnKVxuICAgICAgICBpc19maXJzdF9yb3cgPSB0cnVlXG5cbiAgICBpZiBmaWVsZC5jYXB0aW9uID09ICdHZW5lcmFsIEZ1bmQgQmFsYW5jZScgb3IgZmllbGQuY2FwdGlvbiA9PSAnTG9uZyBUZXJtIERlYnQnXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgIGVsc2UgaWYgZmllbGQuY2FwdGlvbiBpbiBbJ1RvdGFsIFJldmVudWVzJywgJ1RvdGFsIEV4cGVuZGl0dXJlcycsICdTdXJwbHVzIC8gKERlZmljaXQpJ10gb3IgaXNfZmlyc3Rfcm93XG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JykpXG4gICAgICBpc19maXJzdF9yb3cgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzayksIG90aGVyZnVuZHM6IGN1cnJlbmN5KGZpZWxkLm90aGVyZnVuZHMsIG1hc2spLCB0b3RhbGZ1bmRzOiBjdXJyZW5jeShmaWVsZC50b3RhbGZ1bmRzLCBtYXNrKSlcbiAgcmV0dXJuIGhcblxudW5kZXIgPSAocykgLT4gcy5yZXBsYWNlKC9bXFxzXFwrXFwtXS9nLCAnXycpXG5cbnRvVGl0bGVDYXNlID0gKHN0cikgLT5cbiAgc3RyLnJlcGxhY2UgL1xcd1xcUyovZywgKHR4dCkgLT5cbiAgICB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKClcblxuY3VycmVuY3kgPSAobiwgbWFzaywgc2lnbiA9ICcnKSAtPlxuICAgIG4gPSBudW1lcmFsKG4pXG4gICAgaWYgbiA8IDBcbiAgICAgICAgcyA9IG4uZm9ybWF0KG1hc2spLnRvU3RyaW5nKClcbiAgICAgICAgcyA9IHMucmVwbGFjZSgvLS9nLCAnJylcbiAgICAgICAgcmV0dXJuIFwiKCN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK3MrJzwvc3Bhbj4nfSlcIlxuXG4gICAgbiA9IG4uZm9ybWF0KG1hc2spXG4gICAgcmV0dXJuIFwiI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrbisnPC9zcGFuPid9XCJcblxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEsIHRhYnNldCwgcGFyZW50KSAtPlxuICAjbGF5b3V0ID0gYWRkX290aGVyX3RhYl90b19sYXlvdXQgaW5pdGlhbF9sYXlvdXQsIGRhdGFcbiAgbGF5b3V0ID0gaW5pdGlhbF9sYXlvdXRcbiAgdGVtcGxhdGVzID0gcGFyZW50LnRlbXBsYXRlc1xuICBwbG90X2hhbmRsZXMgPSB7fVxuXG4gIGxheW91dF9kYXRhID1cbiAgICB0aXRsZTogZGF0YS5uYW1lXG4gICAgd2lraXBlZGlhX3BhZ2VfZXhpc3RzOiBkYXRhLndpa2lwZWRpYV9wYWdlX2V4aXN0c1xuICAgIHdpa2lwZWRpYV9wYWdlX25hbWU6ICBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICB0cmFuc3BhcmVudF9jYWxpZm9ybmlhX3BhZ2VfbmFtZTogZGF0YS50cmFuc3BhcmVudF9jYWxpZm9ybmlhX3BhZ2VfbmFtZVxuICAgIGxhdGVzdF9hdWRpdF91cmw6IGRhdGEubGF0ZXN0X2F1ZGl0X3VybFxuICAgIHRhYnM6IFtdXG4gICAgdGFiY29udGVudDogJydcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgbGF5b3V0X2RhdGEudGFicy5wdXNoXG4gICAgICB0YWJpZDogdW5kZXIodGFiLm5hbWUpLFxuICAgICAgdGFibmFtZTogdGFiLm5hbWUsXG4gICAgICBhY3RpdmU6IChpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnKVxuXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBkZXRhaWxfZGF0YSA9XG4gICAgICB0YWJpZDogdW5kZXIodGFiLm5hbWUpLFxuICAgICAgdGFibmFtZTogdGFiLm5hbWUsXG4gICAgICBhY3RpdmU6IChpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnKVxuICAgICAgdGFiY29udGVudDogJydcbiAgICBzd2l0Y2ggdGFiLm5hbWVcbiAgICAgIHdoZW4gJ092ZXJ2aWV3ICsgRWxlY3RlZCBPZmZpY2lhbHMnXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBjb25zb2xlLmxvZyBkYXRhXG4gICAgICAgIGZvciBvZmZpY2lhbCxpIGluIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHNcbiAgICAgICAgICBvZmZpY2lhbF9kYXRhID1cbiAgICAgICAgICAgIHRpdGxlOiBpZiAnJyAhPSBvZmZpY2lhbC50aXRsZSB0aGVuIFwiVGl0bGU6IFwiICsgb2ZmaWNpYWwudGl0bGVcbiAgICAgICAgICAgIG5hbWU6IGlmICcnICE9IG9mZmljaWFsLmZ1bGxfbmFtZSB0aGVuIFwiTmFtZTogXCIgKyBvZmZpY2lhbC5mdWxsX25hbWVcbiAgICAgICAgICAgIGVtYWlsOiBpZiBvZmZpY2lhbC5lbWFpbF9hZGRyZXNzIHRoZW4gXCJFbWFpbDogXCIgKyBvZmZpY2lhbC5lbWFpbF9hZGRyZXNzXG4gICAgICAgICAgICB0ZWxlcGhvbmVudW1iZXI6IGlmIG51bGwgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciBhbmQgdW5kZWZpbmVkICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgdGhlbiBcIlRlbGVwaG9uZSBOdW1iZXI6IFwiICsgb2ZmaWNpYWwudGVsZXBob25lX251bWJlclxuICAgICAgICAgICAgdGVybWV4cGlyZXM6IGlmIG9mZmljaWFsLnRlcm1fZXhwaXJlcyB0aGVuIFwiVGVybSBFeHBpcmVzOiBcIiArIG9mZmljaWFsLnRlcm1fZXhwaXJlcyBlbHNlIFwiVGVybSBFeHBpcmVzOiBcIlxuICAgICAgICAgICAgYWx0VHlwZVNsdWc6IGRhdGEuYWx0X3R5cGVfc2x1Z1xuICAgICAgICAgICAgbmFtZVNsdWc6IGRhdGEuc2x1Z1xuICAgICAgICAgICAgc2x1Zzogb2ZmaWNpYWwuc2x1Z1xuXG4gICAgICAgICAgaWYgJycgIT0gb2ZmaWNpYWwucGhvdG9fdXJsIGFuZCBvZmZpY2lhbC5waG90b191cmwgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICBvZmZpY2lhbF9kYXRhLmltYWdlID0gICc8aW1nIHNyYz1cIicrb2ZmaWNpYWwucGhvdG9fdXJsKydcIiBjbGFzcz1cInBvcnRyYWl0XCIgYWx0PVwiXCIgLz4nXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnJ1xuXG4gICAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1vZmZpY2lhbC10ZW1wbGF0ZSddKG9mZmljaWFsX2RhdGEpXG4gICAgICB3aGVuICdFbXBsb3llZSBDb21wZW5zYXRpb24nXG4gICAgICAgIGggPSAnJ1xuICAgICAgICBoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1lbXBsb3llZS1jb21wLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snbWVkaWFuLWNvbXAtZ3JhcGgnXVxuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBzbWFsbENoYXJ0V2lkdGggPSAzNDBcbiAgICAgICAgICBiaWdDaGFydFdpZHRoID0gNDcwXG5cbiAgICAgICAgICBpZiAkKHdpbmRvdykud2lkdGgoKSA8IDQ5MFxuICAgICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzAwXG4gICAgICAgICAgICBiaWdDaGFydFdpZHRoID0gMzAwXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdNZWRpYW4gQ29tcGVuc2F0aW9uJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnQmVucy4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIHRvVGl0bGVDYXNlIGRhdGEubmFtZSArICdcXG4gRW1wbG95ZWVzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3NhbGFyeV9wZXJfZnVsbF90aW1lX2VtcCddXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdBbGwgXFxuJyArIHRvVGl0bGVDYXNlIGRhdGEubmFtZSArICcgXFxuIFJlc2lkZW50cydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGdyb3VwaW5nU3ltYm9sOiAnLCcgLCBmcmFjdGlvbkRpZ2l0czogJzAnKVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMik7XG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J01lZGlhbiBUb3RhbCBDb21wZW5zYXRpb24gLSBGdWxsIFRpbWUgV29ya2VyczogXFxuIEdvdmVybm1lbnQgdnMuIFByaXZhdGUgU2VjdG9yJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLWNvbXAtZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddID0nbWVkaWFuLWNvbXAtZ3JhcGgnXG5cbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snbWVkaWFuLXBlbnNpb24tZ3JhcGgnXVxuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmICEgZGF0YS5oYXNPd25Qcm9wZXJ0eSgnbWVkaWFuX3BlbnNpb25fMzBfeWVhcl9yZXRpcmVlJykgfHwgKCBkYXRhWydtZWRpYW5fcGVuc2lvbl8zMF95ZWFyX3JldGlyZWUnXSA9PSAwKVxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIFBlbnNpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnUGVuc2lvbiBmb3IgXFxuIFJldGlyZWUgdy8gMzAgWWVhcnMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fcGVuc2lvbjMwX3llYXJfcmV0aXJlZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgUGVuc2lvbidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnYmFyJzoge1xuICAgICAgICAgICAgICAgICAnZ3JvdXBXaWR0aCc6ICczMCUnXG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLXBlbnNpb24tZ3JhcGgnXSA9J21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIEhlYWx0aCdcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAjcHVibGljIHNhZmV0eSBwaWVcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQdWJsaWMgU2FmZXR5IEV4cGVuc2UnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnUHVibGljIFNhZmV0eSBFeHAnXG4gICAgICAgICAgICAgICAgICAxIC0gZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdPdGhlcidcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidQdWJsaWMgc2FmZXR5IGV4cGVuc2UnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnc2xpY2VzJzogeyAxOiB7b2Zmc2V0OiAwLjJ9fVxuICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNDVcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSA9J3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAjZmluLWhlYWx0aC1yZXZlbnVlIGdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgI2NvbnNvbGUubG9nICcjIyNhbCcrSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1Jldi4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBSZXZlbnVlIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gUmV2ZW51ZSBQZXIgXFxuIENhcGl0YSBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICAgIFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gPSdmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXG4gICAgICAgICNmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaFxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdFeHAuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVG90YWwgRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEgXFxuIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnY2hhcnRBcmVhLndpZHRoJzogJzEwMCUnXG4gICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gPSdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgaCA9ICcnXG4gICAgICAgICAgI2ggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICAgIGggKz0gcmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cywgdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJ11cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgICAjdGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiUmV2ZW51ZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIFJldmVudWVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3RvdGFsLXJldmVudWUtcGllJ10gPSd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ11cbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2F0ZWdvcnlfbmFtZSBpcyBcIkV4cGVuZGl0dXJlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgRXhwZW5kaXR1cmVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxNlxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6IDM1MFxuICAgICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA2MFxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxuICAgICAgICAgICAgICAgICAgJ2ZvcmNlSUZyYW1lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYSc6e1xuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodDonNzUlJ1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXSA9J3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXG4gICAgICBlbHNlXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuXG4gICAgbGF5b3V0X2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC10ZW1wbGF0ZSddKGRldGFpbF9kYXRhKVxuICByZXR1cm4gdGVtcGxhdGVzWyd0YWJwYW5lbC10ZW1wbGF0ZSddKGxheW91dF9kYXRhKVxuXG5cbmdldF9sYXlvdXRfZmllbGRzID0gKGxhKSAtPlxuICBmID0ge31cbiAgZm9yIHQgaW4gbGFcbiAgICBmb3IgZmllbGQgaW4gdC5maWVsZHNcbiAgICAgIGZbZmllbGRdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfcmVjb3JkX2ZpZWxkcyA9IChyKSAtPlxuICBmID0ge31cbiAgZm9yIGZpZWxkX25hbWUgb2YgclxuICAgIGZbZmllbGRfbmFtZV0gPSAxXG4gIHJldHVybiBmXG5cbmdldF91bm1lbnRpb25lZF9maWVsZHMgPSAobGEsIHIpIC0+XG4gIGxheW91dF9maWVsZHMgPSBnZXRfbGF5b3V0X2ZpZWxkcyBsYVxuICByZWNvcmRfZmllbGRzID0gZ2V0X3JlY29yZF9maWVsZHMgclxuICB1bm1lbnRpb25lZF9maWVsZHMgPSBbXVxuICB1bm1lbnRpb25lZF9maWVsZHMucHVzaChmKSBmb3IgZiBvZiByZWNvcmRfZmllbGRzIHdoZW4gbm90IGxheW91dF9maWVsZHNbZl1cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cbiMgY29udmVydHMgdGFiIHRlbXBsYXRlIGRlc2NyaWJlZCBpbiBnb29nbGUgZnVzaW9uIHRhYmxlIHRvXG4jIHRhYiB0ZW1wbGF0ZVxuY29udmVydF9mdXNpb25fdGVtcGxhdGU9KHRlbXBsKSAtPlxuICB0YWJfaGFzaD17fVxuICB0YWJzPVtdXG4gICMgcmV0dXJucyBoYXNoIG9mIGZpZWxkIG5hbWVzIGFuZCB0aGVpciBwb3NpdGlvbnMgaW4gYXJyYXkgb2YgZmllbGQgbmFtZXNcbiAgZ2V0X2NvbF9oYXNoID0gKGNvbHVtbnMpIC0+XG4gICAgY29sX2hhc2ggPXt9XG4gICAgY29sX2hhc2hbY29sX25hbWVdPWkgZm9yIGNvbF9uYW1lLGkgaW4gdGVtcGwuY29sdW1uc1xuICAgIHJldHVybiBjb2xfaGFzaFxuXG4gICMgcmV0dXJucyBmaWVsZCB2YWx1ZSBieSBpdHMgbmFtZSwgYXJyYXkgb2YgZmllbGRzLCBhbmQgaGFzaCBvZiBmaWVsZHNcbiAgdmFsID0gKGZpZWxkX25hbWUsIGZpZWxkcywgY29sX2hhc2gpIC0+XG4gICAgZmllbGRzW2NvbF9oYXNoW2ZpZWxkX25hbWVdXVxuXG4gICMgY29udmVydHMgaGFzaCB0byBhbiBhcnJheSB0ZW1wbGF0ZVxuICBoYXNoX3RvX2FycmF5ID0oaGFzaCkgLT5cbiAgICBhID0gW11cbiAgICBmb3IgayBvZiBoYXNoXG4gICAgICB0YWIgPSB7fVxuICAgICAgdGFiLm5hbWU9a1xuICAgICAgdGFiLmZpZWxkcz1oYXNoW2tdXG4gICAgICBhLnB1c2ggdGFiXG4gICAgcmV0dXJuIGFcblxuXG4gIGNvbF9oYXNoID0gZ2V0X2NvbF9oYXNoKHRlbXBsLmNvbF9oYXNoKVxuICBwbGFjZWhvbGRlcl9jb3VudCA9IDBcblxuICBmb3Igcm93LGkgaW4gdGVtcGwucm93c1xuICAgIGNhdGVnb3J5ID0gdmFsICdnZW5lcmFsX2NhdGVnb3J5Jywgcm93LCBjb2xfaGFzaFxuICAgICN0YWJfaGFzaFtjYXRlZ29yeV09W10gdW5sZXNzIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgIGZpZWxkbmFtZSA9IHZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hcbiAgICBpZiBub3QgZmllbGRuYW1lIHRoZW4gZmllbGRuYW1lID0gXCJfXCIgKyBTdHJpbmcgKytwbGFjZWhvbGRlcl9jb3VudFxuICAgIGZpZWxkTmFtZXNbdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaF09dmFsICdkZXNjcmlwdGlvbicsIHJvdywgY29sX2hhc2hcbiAgICBmaWVsZE5hbWVzSGVscFtmaWVsZG5hbWVdID0gdmFsICdoZWxwX3RleHQnLCByb3csIGNvbF9oYXNoXG4gICAgaWYgY2F0ZWdvcnlcbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XT89W11cbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XS5wdXNoIG46IHZhbCgnbicsIHJvdywgY29sX2hhc2gpLCBuYW1lOiBmaWVsZG5hbWUsIG1hc2s6IHZhbCgnbWFzaycsIHJvdywgY29sX2hhc2gpXG5cbiAgY2F0ZWdvcmllcyA9IE9iamVjdC5rZXlzKHRhYl9oYXNoKVxuICBjYXRlZ29yaWVzX3NvcnQgPSB7fVxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc1xuICAgIGlmIG5vdCBjYXRlZ29yaWVzX3NvcnRbY2F0ZWdvcnldXG4gICAgICBjYXRlZ29yaWVzX3NvcnRbY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnldWzBdLm5cbiAgICBmaWVsZHMgPSBbXVxuICAgIGZvciBvYmogaW4gdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgICBmaWVsZHMucHVzaCBvYmpcbiAgICBmaWVsZHMuc29ydCAoYSxiKSAtPlxuICAgICAgcmV0dXJuIGEubiAtIGIublxuICAgIHRhYl9oYXNoW2NhdGVnb3J5XSA9IGZpZWxkc1xuXG4gIGNhdGVnb3JpZXNfYXJyYXkgPSBbXVxuICBmb3IgY2F0ZWdvcnksIG4gb2YgY2F0ZWdvcmllc19zb3J0XG4gICAgY2F0ZWdvcmllc19hcnJheS5wdXNoIGNhdGVnb3J5OiBjYXRlZ29yeSwgbjogblxuICBjYXRlZ29yaWVzX2FycmF5LnNvcnQgKGEsYikgLT5cbiAgICByZXR1cm4gYS5uIC0gYi5uXG5cbiAgdGFiX25ld2hhc2ggPSB7fVxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc19hcnJheVxuICAgIHRhYl9uZXdoYXNoW2NhdGVnb3J5LmNhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5LmNhdGVnb3J5XVxuXG4gIHRhYnMgPSBoYXNoX3RvX2FycmF5KHRhYl9uZXdoYXNoKVxuICByZXR1cm4gdGFic1xuXG5cbmNsYXNzIFRlbXBsYXRlczJcblxuICBAbGlzdCA9IHVuZGVmaW5lZFxuICBAdGVtcGxhdGVzID0gdW5kZWZpbmVkXG4gIEBkYXRhID0gdW5kZWZpbmVkXG4gIEBldmVudHMgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cbiAgICBAZXZlbnRzID0ge31cbiAgICB0ZW1wbGF0ZUxpc3QgPSBbJ3RhYnBhbmVsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnLCAndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1lbXBsb3llZS1jb21wLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZScsICdwZXJzb24taW5mby10ZW1wbGF0ZSddXG4gICAgdGVtcGxhdGVQYXJ0aWFscyA9IFsndGFiLXRlbXBsYXRlJ11cbiAgICBAdGVtcGxhdGVzID0ge31cbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZUxpc3RcbiAgICAgIEB0ZW1wbGF0ZXNbdGVtcGxhdGVdID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyMnICsgdGVtcGxhdGUpLmh0bWwoKSlcbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZVBhcnRpYWxzXG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCh0ZW1wbGF0ZSwgJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuXG4gIGFkZF90ZW1wbGF0ZTogKGxheW91dF9uYW1lLCBsYXlvdXRfanNvbikgLT5cbiAgICBAbGlzdC5wdXNoXG4gICAgICBwYXJlbnQ6dGhpc1xuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIEBwYXJlbnQuZGF0YSA9IGRhdFxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0LCB0aGlzLCBAcGFyZW50KVxuICAgICAgYmluZDogKHRwbF9uYW1lLCBjYWxsYmFjaykgLT5cbiAgICAgICAgaWYgbm90IEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXSA9IFtjYWxsYmFja11cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXS5wdXNoIGNhbGxiYWNrXG4gICAgICBhY3RpdmF0ZTogKHRwbF9uYW1lKSAtPlxuICAgICAgICBpZiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICBmb3IgZSxpIGluIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgICAgZSB0cGxfbmFtZSwgQHBhcmVudC5kYXRhXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG5cbiAgbG9hZF9mdXNpb25fdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgdCA9IGNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlIHRlbXBsYXRlX2pzb25cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lIHRoZW4gaVxuICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcIlxuXG4gIGFjdGl2YXRlOiAoaW5kLCB0cGxfbmFtZSkgLT5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICBAbGlzdFtpbmRdLmFjdGl2YXRlIHRwbF9uYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIiwiJCAtPlxuICAjJCgnI2dldFdpa2lwZWRpYUFydGljbGVCdXR0b24nKS5vbiAnY2xpY2snLCAtPlxuICAjICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAjYWxlcnRhbGVydCBcImhpXCJcbiAgI2FsZXJ0ICQoXCIjd2lraXBlZGlhUGFnZU5hbWVcIikudGV4dCgpXG4gICNnZXRfd2lraXBlZGlhX2FydGljbGUoKVxuICB3aW5kb3cuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlID0gZ2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4gIHdpbmRvdy5jcmVhdGVfd2lraXBlZGlhX2FydGljbGUgPSBjcmVhdGVfd2lraXBlZGlhX2FydGljbGVcblxuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlPShzKS0+XG4gIGFydGljbGVfbmFtZSA9IHMucmVwbGFjZSAvLipcXC8oW14vXSopJC8sIFwiJDFcIlxuICAkLmdldEpTT04gXCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXBhcnNlJnBhZ2U9I3thcnRpY2xlX25hbWV9JnByb3A9dGV4dCZmb3JtYXQ9anNvbiZjYWxsYmFjaz0/XCIsIChqc29uKSAtPiBcbiAgICAkKCcjd2lraXBlZGlhVGl0bGUnKS5odG1sIGpzb24ucGFyc2UudGl0bGVcbiAgICAkKCcjd2lraXBlZGlhQXJ0aWNsZScpLmh0bWwganNvbi5wYXJzZS50ZXh0W1wiKlwiXVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYTpub3QoLnJlZmVyZW5jZXMgYSlcIikuYXR0ciBcImhyZWZcIiwgLT4gIFwiaHR0cDovL3d3dy53aWtpcGVkaWEub3JnXCIgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhXCIpLmF0dHIgXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIlxuICBcbmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZT0gLT5cbiAgYWxlcnQgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldF93aWtpcGVkaWFfYXJ0aWNsZTpnZXRfd2lraXBlZGlhX2FydGljbGVcbiJdfQ==

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
  rebuild_filter();
  get_records2(GOVWIKI.gov_type_filter_2, function(data) {
    window.localStorage.setItem('points', JSON.stringify(data));
    GOVWIKI.markers = data;
    return rerender_markers();
  });
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
    if (route === 0) {
      GOVWIKI.show_search_page();
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
  animation: true
});

$('#dataContainer').on('click', function(e) {
  var $element, fieldName, fieldNameInCamelCase;
  $element = $(e.target);
  $('.rank').not(e.target).popover('destroy');
  fieldName = $element.attr('data-field');
  if (fieldName) {
    fieldNameInCamelCase = fieldName.replace(/_([a-z])/g, function(g) {
      return g[1].toUpperCase();
    });
    return $.ajax({
      url: '/api/government' + window.location.pathname + '/get_ranks',
      dataType: 'json',
      data: {
        field_name: fieldNameInCamelCase
      },
      success: function(data) {
        var compiledTemplate;
        console.log(data);
        compiledTemplate = Handlebars.compile($('#rankPopover').html());
        return $element.parent().find('.popover-content').html(compiledTemplate(data));
      }
    });
  }
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
        return v + " <a class='rank' data-field='" + n + "_rank' title='" + n + " ranks'> (" + data[n + '_rank'] + " of " + data.max_ranks[n + '_max_rank'] + ")</a>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9mcmVlZGVtc3Rlci93b3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZtYXAuY29mZmVlIiwiL2hvbWUvZnJlZWRlbXN0ZXIvd29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292c2VsZWN0b3IuY29mZmVlIiwiL2hvbWUvZnJlZWRlbXN0ZXIvd29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9mcmVlZGVtc3Rlci93b3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL2hvbWUvZnJlZWRlbXN0ZXIvd29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvdGVtcGxhdGVzMi5jb2ZmZWUiLCIvaG9tZS9mcmVlZGVtc3Rlci93b3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLGNBQUEsRUFBZ0IsS0FOaEI7RUFPQSxVQUFBLEVBQVksS0FQWjtFQVFBLGNBQUEsRUFBZ0IsS0FSaEI7RUFTQSxXQUFBLEVBQWEsSUFUYjtFQVVBLGtCQUFBLEVBQ0U7SUFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFwQztHQVhGO0VBWUEsZUFBQSxFQUFpQixTQUFD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QSxDQUFNLGlCQUFOO0FBRHdCOztBQUcxQixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEscUJBQUEsRUFBc0IscUJBQXRCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuXG5tYXAgPSBuZXcgR01hcHNcbiAgZWw6ICcjZ292bWFwJ1xuICBsYXQ6IDM3LjNcbiAgbG5nOiAtMTE5LjNcbiAgem9vbTogNlxuICBtaW5ab29tOiA2XG4gIHNjcm9sbHdoZWVsOiB0cnVlXG4gIG1hcFR5cGVDb250cm9sOiBmYWxzZVxuICBwYW5Db250cm9sOiBmYWxzZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgem9vbUNvbnRyb2w6IHRydWVcbiAgem9vbUNvbnRyb2xPcHRpb25zOlxuICAgIHN0eWxlOiBnb29nbGUubWFwcy5ab29tQ29udHJvbFN0eWxlLlNNQUxMXG4gIG1hcmtlckNsdXN0ZXJlcjogKG1hcCkgLT5cbiAgICBvcHRpb25zID0ge1xuICAgICAgdGV4dFNpemU6IDE0XG4gICAgICB0ZXh0Q29sb3I6ICdyZWQnXG4gICAgICBncmlkU2l6ZTogMFxuICAgICAgbWluaW11bUNsdXN0ZXJTaXplOiA1ICMgQWxsb3cgbWluaW11bSA1IG1hcmtlciBpbiBjbHVzdGVyLlxuICAgICAgaWdub3JlSGlkZGVuOiB0cnVlICMgRG9uJ3Qgc2hvdyBoaWRkZW4gbWFya2Vycy4gSW4gc29tZSByZWFzb24gZG9uJ3Qgd29yayA6KFxuICAgICAgIyBGb3IgZHJhdyBjaGFydC5cbiAgICAgIGxlZ2VuZDpcbiAgICAgICAgXCJDaXR5XCIgOiBcInJlZFwiXG4gICAgICAgIFwiU2Nob29sIERpc3RyaWN0XCIgOiBcImJsdWVcIlxuICAgICAgICBcIlNwZWNpYWwgRGlzdHJpY3RcIiA6IFwicHVycGxlXCJcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBNYXJrZXJDbHVzdGVyZXIobWFwLCBbXSwgb3B0aW9ucyk7XG5cbm1hcC5tYXAuY29udHJvbHNbZ29vZ2xlLm1hcHMuQ29udHJvbFBvc2l0aW9uLlJJR0hUX1RPUF0ucHVzaChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGVnZW5kJykpXG5cbnJlcmVuZGVyX21hcmtlcnMgPSAtPlxuICBhZGRfbWFya2VyKHJlYykgZm9yIHJlYyBpbiBHT1ZXSUtJLm1hcmtlcnNcblxucmVidWlsZF9maWx0ZXIgPSAtPlxuICBoYXJkX3BhcmFtcyA9IFsnQ2l0eScsICdTY2hvb2wgRGlzdHJpY3QnLCAnU3BlY2lhbCBEaXN0cmljdCcsICdDb3VudHknXVxuICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yID0gW11cbiAgJCgnLnR5cGVfZmlsdGVyJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgaWYgJChlbGVtZW50KS5hdHRyKCduYW1lJykgaW4gaGFyZF9wYXJhbXMgYW5kICQoZWxlbWVudCkudmFsKCkgPT0gJzEnXG4gICAgICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLnB1c2ggJChlbGVtZW50KS5hdHRyKCduYW1lJylcblxuIyBsZWdlbmRUeXBlID0gY2l0eSwgc2Nob29sIGRpc3RyaWN0LCBzcGVjaWFsIGRpc3RyaWN0LCBjb3VudGllc1xuZ2V0X3JlY29yZHMyID0gKGxlZ2VuZFR5cGUsIG9uc3VjY2VzcykgLT5cbiAgZGF0YSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncG9pbnRzJyk7XG4gIGlmIChkYXRhKVxuICAgICNcbiAgICAjIFJlc3RvcmUgbWFya2VycyBkYXRhIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAgICBvbnN1Y2Nlc3MgSlNPTi5wYXJzZShkYXRhKVxuICBlbHNlXG4gICAgI1xuICAgICMgUmV0cmlldmUgbmV3IG1hcmtlcnMgZGF0YSBmcm9tIHNlcnZlci5cbiAgICAkLmFqYXhcbiAgICAgIHVybDpcIi9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcbiAgIyAgICB1cmw6XCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnQvZ2V0LW1hcmtlcnMtZGF0YVwiXG4gICAgICBkYXRhOiB7IGFsdFR5cGVzOiBsZWdlbmRUeXBlLCBsaW1pdDogNTAwMCB9XG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICBlcnJvcjooZSkgLT5cbiAgICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG4gIHJlYnVpbGRfZmlsdGVyKClcbiAgZ2V0X3JlY29yZHMyIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIsIChkYXRhKSAtPlxuICAgICNcbiAgICAjIFN0b3JlIG1hcmtlcnMgZGF0YS5cbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BvaW50cycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgIEdPVldJS0kubWFya2VycyA9IGRhdGE7XG4gICAgcmVyZW5kZXJfbWFya2VycygpXG5cbiAgJCgnI2xlZ2VuZCBsaTpub3QoLmNvdW50aWVzLXRyaWdnZXIpJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGhpZGRlbl9maWVsZCA9ICQodGhpcykuZmluZCgnaW5wdXQnKVxuICAgIHZhbHVlID0gaGlkZGVuX2ZpZWxkLnZhbCgpXG4gICAgaGlkZGVuX2ZpZWxkLnZhbChpZiB2YWx1ZSA9PSAnMScgdGhlbiAnMCcgZWxzZSAnMScpXG4gICAgI1xuICAgICMgQ2xpY2tlZCBsZWdlbmQgYWx0IHR5cGUuXG4gICAgYWx0VHlwZSA9IGhpZGRlbl9maWVsZC5hdHRyKCduYW1lJylcblxuICAgIHJlYnVpbGRfZmlsdGVyKClcblxuICAgICNcbiAgICAjIFRvZ2dsZSBtYXJrZXIgdmlzaWJsZSB3aXRoIHR5cGUgZXF1YWwgdG8gY2xpY2tlZCBsZWdlbmQuXG4gICAgI1xuICAgIGZvciBtYXJrZXIgaW4gbWFwLm1hcmtlcnNcbiAgICAgIGlmIG1hcmtlci50eXBlIGlzIGFsdFR5cGVcbiAgICAgICAgIyBSZW1vdmV8YWRkIG1hcmtlcnMgZnJvbSBjbHVzdGVyIGJlY2F1c2UgTWFya2VyQ2x1c3RlciBpZ25vcmVcbiAgICAgICAgIyBoaXMgb3B0aW9uICdpZ25vcmVIaWRkZW4nLlxuICAgICAgICBpZiAodmFsdWUgaXMgJzEnKVxuICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVtb3ZlTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIuYWRkTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiMgICAgICAgIG1hcmtlci5zZXRWaXNpYmxlKCEgbWFya2VyLmdldFZpc2libGUoKSlcblxuICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVwYWludCgpO1xuXG4gICQoJyNsZWdlbmQgbGkuY291bnRpZXMtdHJpZ2dlcicpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdhY3RpdmUnKVxuICAgICAgI1xuICAgICAgIyBTaG93IGNvdW50aWVzLlxuICAgICAgI1xuICAgICAgZm9yIHBvbHlnb24gaW4gbWFwLnBvbHlnb25zXG4gICAgICAgIHBvbHlnb24uc2V0VmlzaWJsZSh0cnVlKVxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgSGlkZSBjb3VudGllcy5cbiAgICAgICNcbiAgICAgIGZvciBwb2x5Z29uIGluIG1hcC5wb2x5Z29uc1xuICAgICAgICBwb2x5Z29uLnNldFZpc2libGUoZmFsc2UpXG5cblxuXG5cblxuZ2V0X2ljb24gPShhbHRfdHlwZSkgLT5cblxuICBfY2lyY2xlID0oY29sb3IpLT5cbiAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRVxuICAgIGZpbGxPcGFjaXR5OiAxXG4gICAgZmlsbENvbG9yOiBjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXG4gICAgc2NhbGU6IDZcblxuICBzd2l0Y2ggYWx0X3R5cGVcbiAgICB3aGVuICdDaXR5JyB0aGVuIHJldHVybiBfY2lyY2xlICdyZWQnXG4gICAgd2hlbiAnU2Nob29sIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdibHVlJ1xuICAgIHdoZW4gJ1NwZWNpYWwgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3B1cnBsZSdcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcblxuaW5fYXJyYXkgPSAobXlfaXRlbSwgbXlfYXJyYXkpIC0+XG4gIGZvciBpdGVtIGluIG15X2FycmF5XG4gICAgcmV0dXJuIHRydWUgaWYgaXRlbSA9PSBteV9pdGVtXG4gIGZhbHNlXG5cblxuYWRkX21hcmtlciA9IChyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIGV4aXN0ID0gaW5fYXJyYXkgcmVjLmFsdFR5cGUsIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzJcbiAgaWYgZXhpc3QgaXMgZmFsc2UgdGhlbiByZXR1cm4gZmFsc2VcblxuICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhyZWMubGF0aXR1ZGUsIHJlYy5sb25naXR1ZGUpXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4gICAgdGl0bGU6ICBcIiN7cmVjLm5hbWV9LCAje3JlYy50eXBlfVwiLFxuIyAgICB0aXRsZTogXCIje3JlYy5hbHRUeXBlfVwiXG4gICAgI1xuICAgICMgRm9yIGxlZ2VuZCBjbGljayBoYW5kbGVyLlxuICAgIHR5cGU6IHJlYy5hbHRUeXBlXG4gIH0pXG4gICNcbiAgIyBPbiBjbGljayByZWRpcmVjdCB1c2VyIHRvIGVudGl0eSBwYWdlLlxuICAjXG4gIG1hcmtlci5hZGRMaXN0ZW5lciAnY2xpY2snLCAoKSAtPlxuICAgIGNvbnNvbGUubG9nKCdDbGljayBvbiBtYXJrZXInKTtcbiAgICB1cmwgPSBcIiN7cmVjLmFsdFR5cGVTbHVnfS8je3JlYy5zbHVnfVwiXG4gICAgY29uc29sZS5sb2codXJsKTtcbiAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YVxuICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50L1wiICsgdXJsLFxuICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSBHT1ZXSUtJLnRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG4gIG1hcC5hZGRNYXJrZXIgbWFya2VyXG5cbiMgIG1hcC5hZGRNYXJrZXJcbiMgICAgbGF0OiByZWMubGF0aXR1ZGVcbiMgICAgbG5nOiByZWMubG9uZ2l0dWRlXG4jICAgIGljb246IGdldF9pY29uKHJlYy5hbHRUeXBlKVxuIyAgICB0aXRsZTogIFwiI3tyZWMubmFtZX0sICN7cmVjLnR5cGV9XCJcbiMgICAgaW5mb1dpbmRvdzpcbiMgICAgICBjb250ZW50OiBcIlxuIyAgICAgICAgPGRpdj48YSBocmVmPSdqYXZhc2NyaXB0OnZvaWQoMCk7JyBjbGFzcz0naW5mby13aW5kb3ctdXJpJyBkYXRhLXVyaT0nLyN7cmVjLmFsdFR5cGVTbHVnfS8je3JlYy5zbHVnfSc+PHN0cm9uZz4je3JlYy5uYW1lfTwvc3Ryb25nPjwvYT48L2Rpdj5cbiMgICAgICAgIDxkaXY+ICN7cmVjLnR5cGV9ICAje3JlYy5jaXR5fSAje3JlYy56aXB9ICN7cmVjLnN0YXRlfTwvZGl2PlwiXG5cblxuXG4jIEdFT0NPRElORyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnBpbkltYWdlID0gbmV3IChnb29nbGUubWFwcy5NYXJrZXJJbWFnZSkoXG4gICdodHRwOi8vY2hhcnQuYXBpcy5nb29nbGUuY29tL2NoYXJ0P2Noc3Q9ZF9tYXBfcGluX2xldHRlciZjaGxkPVp8Nzc3N0JCfEZGRkZGRicgLFxuICBuZXcgKGdvb2dsZS5tYXBzLlNpemUpKDIxLCAzNCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDAsIDApLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgxMCwgMzQpXG4gIClcblxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcblxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgICAgbGF0OiBkYXRhLmxhdGl0dWRlXG4gICAgICAgICAgICBsbmc6IGRhdGEubG9uZ2l0dWRlXG4gICAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgICBjb2xvcjogJ2JsdWUnXG4gICAgICAgICAgICBpY29uOiBwaW5JbWFnZVxuICAgICAgICAgICAgdGl0bGU6ICBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgICAgY29udGVudDogXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcblxuICAgICAgICAkKCcuZ292bWFwLWZvdW5kJykuaHRtbCBcIjxzdHJvbmc+Rk9VTkQ6IDwvc3Ryb25nPiN7cmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc31cIlxuICAgICAgcmV0dXJuXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuICBtYXA6IG1hcFxuIiwiXG5xdWVyeV9tYXRjaGVyID0gcmVxdWlyZSgnLi9xdWVyeW1hdGNoZXIuY29mZmVlJylcblxuY2xhc3MgR292U2VsZWN0b3JcbiAgXG4gICMgc3R1YiBvZiBhIGNhbGxiYWNrIHRvIGVudm9rZSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZXRoaW5nXG4gIG9uX3NlbGVjdGVkOiAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuXG5cbiAgY29uc3RydWN0b3I6IChAaHRtbF9zZWxlY3RvciwgZG9jc191cmwsIEBudW1faXRlbXMpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IGRvY3NfdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogQHN0YXJ0U3VnZ2VzdGlvblxuICAgICAgXG5cblxuXG4gIHN1Z2dlc3Rpb25UZW1wbGF0ZSA6IEhhbmRsZWJhcnMuY29tcGlsZShcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwic3VnZy1ib3hcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXN0YXRlXCI+e3t7c3RhdGV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLW5hbWVcIj57e3tnb3ZfbmFtZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctdHlwZVwiPnt7e2dvdl90eXBlfX19PC9kaXY+XG4gICAgPC9kaXY+XCJcIlwiKVxuXG5cblxuICBlbnRlcmVkX3ZhbHVlID0gXCJcIlxuXG4gIGdvdnNfYXJyYXkgPSBbXVxuXG4gIGNvdW50X2dvdnMgOiAoKSAtPlxuICAgIGNvdW50ID0wXG4gICAgZm9yIGQgaW4gQGdvdnNfYXJyYXlcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBjb3VudCsrXG4gICAgcmV0dXJuIGNvdW50XG5cblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICAjQGdvdnNfYXJyYXkgPSBnb3ZzXG4gICAgQGdvdnNfYXJyYXkgPSBnb3ZzLnJlY29yZFxuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuXG4gICAgc2V0VGltZW91dCA9PlxuICAgICAgJChAaHRtbF9zZWxlY3RvcikuYXR0ciAncGxhY2Vob2xkZXInLCAnR09WRVJOTUVOVCBOQU1FJ1xuICAgICwgMTAwMFxuXG4gICAgJChAaHRtbF9zZWxlY3RvcikudHlwZWFoZWFkKFxuICAgICAgICBoaW50OiBmYWxzZVxuICAgICAgICBoaWdobGlnaHQ6IGZhbHNlXG4gICAgICAgIG1pbkxlbmd0aDogMVxuICAgICAgICBjbGFzc05hbWVzOlxuICAgICAgICBcdG1lbnU6ICd0dC1kcm9wZG93bi1tZW51J1xuICAgICAgLFxuICAgICAgICBuYW1lOiAnZ292X25hbWUnXG4gICAgICAgIGRpc3BsYXlLZXk6ICdnb3ZfbmFtZSdcbiAgICAgICAgc291cmNlOiBxdWVyeV9tYXRjaGVyKEBnb3ZzX2FycmF5LCBAbnVtX2l0ZW1zKVxuICAgICAgICAjc291cmNlOiBibG9vZGhvdW5kLnR0QWRhcHRlcigpXG4gICAgICAgIHRlbXBsYXRlczogc3VnZ2VzdGlvbjogQHN1Z2dlc3Rpb25UZW1wbGF0ZVxuICAgIClcbiAgICAub24gJ3R5cGVhaGVhZDpzZWxlY3RlZCcsICAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBAZW50ZXJlZF92YWx1ZVxuICAgICAgICBAb25fc2VsZWN0ZWQoZXZ0LCBkYXRhLCBuYW1lKVxuICAgXG4gICAgLm9uICd0eXBlYWhlYWQ6Y3Vyc29yY2hhbmdlZCcsIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS52YWwgQGVudGVyZWRfdmFsdWVcbiAgICBcblxuICAgIyAkKCcuZ292LWNvdW50ZXInKS50ZXh0IEBjb3VudF9nb3ZzKClcbiAgICByZXR1cm5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cz1Hb3ZTZWxlY3RvclxuXG5cblxuIiwiIyMjXG5maWxlOiBtYWluLmNvZmZlIC0tIFRoZSBlbnRyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICA6XG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxuZ292X2RldGFpbHMgPSBuZXcgR292RGV0YWlsc1xuZ292X2ZpbmRlci5vbl9zZWxlY3QgPSBnb3ZfZGV0YWlscy5zaG93XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXG4jX2pxZ3MgICAgICAgPSByZXF1aXJlICcuL2pxdWVyeS5nb3ZzZWxlY3Rvci5jb2ZmZWUnXG5UZW1wbGF0ZXMyID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMyLmNvZmZlZSdcbndpa2lwZWRpYSA9IHJlcXVpcmUgJy4vd2lraXBlZGlhLmNvZmZlZSdcblxuZ292bWFwID0gbnVsbFxuZ292X3NlbGVjdG9yID0gbnVsbFxudGVtcGxhdGVzID0gbmV3IFRlbXBsYXRlczJcbmFjdGl2ZV90YWIgPSBcIlwiXG51bmRlZiA9IG51bGxcbmF1dGhvcml6ZWQgPSBmYWxzZVxuI1xuIyBJbmZvcm1hdGlvbiBhYm91dCBjdXJyZW50IHVzZXIuXG4jXG51c2VyID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuI1xuIyBJc3N1ZXMgY2F0ZWdvcnksIGZpbGwgaW4gZWxlY3RlZCBvZmZpY2lhbCBwYWdlLlxuI1xuY2F0ZWdvcmllcyA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZiBgYSA9PSBiYFxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnZGVidWcnLCAoZW1iZXJPYmplY3QpIC0+XG4gIGlmIGVtYmVyT2JqZWN0IGFuZCBlbWJlck9iamVjdC5jb250ZXh0c1xuICAgIG91dCA9ICcnO1xuXG4gICAgZm9yIGNvbnRleHQgaW4gZW1iZXJPYmplY3QuY29udGV4dHNcbiAgICAgIGZvciBwcm9wIGluIGNvbnRleHRcbiAgICAgICAgb3V0ICs9IHByb3AgKyBcIjogXCIgKyBjb250ZXh0W3Byb3BdICsgXCJcXG5cIlxuXG4gICAgaWYgKGNvbnNvbGUgJiYgY29uc29sZS5sb2cpXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRGVidWdcXG4tLS0tLS0tLS0tLS0tLS0tXFxuXCIgKyBvdXQpXG5cblxud2luZG93LkdPVldJS0kgPVxuICAgIHN0YXRlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyXzI6IFsnQ2l0eScsICdTY2hvb2wgRGlzdHJpY3QnLCAnU3BlY2lhbCBEaXN0cmljdCddXG5cbiAgICBzaG93X3NlYXJjaF9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgZm9jdXNfc2VhcmNoX2ZpZWxkIDUwMFxuXG4gICAgc2hvd19kYXRhX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuXG5HT1ZXSUtJLnRlbXBsYXRlcyA9IHRlbXBsYXRlcztcbkdPVldJS0kudHBsTG9hZGVkID0gZmFsc2VcblxuR09WV0lLSS5nZXRfY291bnRpZXMgPSBnZXRfY291bnRpZXMgPSAoY2FsbGJhY2spIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJy9sZWdhY3kvZGF0YS9jb3VudHlfZ2VvZ3JhcGh5X2NhXzIuanNvbidcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoY291bnRpZXNKU09OKSAtPlxuICAgICAgICAgICAgY2FsbGJhY2sgY291bnRpZXNKU09OXG5cbkdPVldJS0kuZHJhd19wb2x5Z29ucyA9IGRyYXdfcG9seWdvbnMgPSAoY291bnRpZXNKU09OKSAtPlxuICAgIGZvciBjb3VudHkgaW4gY291bnRpZXNKU09OLmZlYXR1cmVzXG4gICAgICAgIGRvIChjb3VudHkpID0+XG4gICAgICAgICAgICBnb3ZtYXAubWFwLmRyYXdQb2x5Z29uKHtcbiAgICAgICAgICAgICAgICBwYXRoczogY291bnR5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXG4gICAgICAgICAgICAgICAgdXNlR2VvSlNPTjogdHJ1ZVxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnIzgwODA4MCdcbiAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAwLjZcbiAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDEuNVxuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyNGRjAwMDAnXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuMTVcbiAgICAgICAgICAgICAgICBjb3VudHlJZDogY291bnR5LnByb3BlcnRpZXMuX2lkXG4gICAgICAgICAgICAgICAgYWx0TmFtZTogY291bnR5LnByb3BlcnRpZXMuYWx0X25hbWVcbiAgICAgICAgICAgICAgICBtYXJrZXI6IG5ldyBNYXJrZXJXaXRoTGFiZWwoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcmFpc2VPbkRyYWc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IGdvdm1hcC5tYXAubWFwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENvbnRlbnQ6IGNvdW50eS5wcm9wZXJ0aWVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoLTE1LCAyNSksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQ2xhc3M6IFwibGFiZWwtdG9vbHRpcFwiLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7b3BhY2l0eTogMS4wfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzF4MVwiLFxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgbW91c2VvdmVyOiAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE9wdGlvbnMoe2ZpbGxDb2xvcjogXCIjMDBGRjAwXCJ9KVxuICAgICAgICAgICAgICAgIG1vdXNlbW92ZTogKGV2ZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbihldmVudC5sYXRMbmcpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUodHJ1ZSlcbiAgICAgICAgICAgICAgICBtb3VzZW91dDogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiI0ZGMDAwMFwifSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZShmYWxzZSlcbiAgICAgICAgICAgICAgICBjbGljazogLT5cbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHVyaSA9IFwiLyN7Y291bnR5LmFsdF90eXBlX3NsdWd9LyN7Y291bnR5LnByb3BlcnRpZXMuc2x1Z31cIlxuICAgICAgICAgICAgICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuICAgICAgICAgICAgfSlcblxud2luZG93LnJlbWVtYmVyX3RhYiA9IChuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbiQoZG9jdW1lbnQpLm9uICdjbGljaycsICcjZmllbGRUYWJzIGEnLCAoZSkgLT5cbiAgICBhY3RpdmVfdGFiID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3RhYm5hbWUnKVxuICAgIGNvbnNvbGUubG9nIGFjdGl2ZV90YWJcbiAgICAkKFwiI3RhYnNDb250ZW50IC50YWItcGFuZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKVxuICAgICQoJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoJ2hyZWYnKSkuYWRkQ2xhc3MoXCJhY3RpdmVcIilcbiAgICB0ZW1wbGF0ZXMuYWN0aXZhdGUgMCwgYWN0aXZlX3RhYlxuXG4gICAgaWYgYWN0aXZlX3RhYiA9PSAnRmluYW5jaWFsIFN0YXRlbWVudHMnXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gMFxuICAgICAgICBmaW5WYWxXaWR0aE1heDMgPSAwXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMVwiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4MVxuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MSA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDJcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDIgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIzXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgzXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMVwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDEgKyAyNylcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMlwiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDIgKyAyNylcbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXSAuY3VycmVuY3ktc2lnbicpLmNzcygncmlnaHQnLCBmaW5WYWxXaWR0aE1heDMgKyAyNylcblxuJChkb2N1bWVudCkudG9vbHRpcCh7c2VsZWN0b3I6IFwiW2NsYXNzPSdtZWRpYS10b29sdGlwJ11cIiwgdHJpZ2dlcjogJ2NsaWNrJ30pXG5cbmFjdGl2YXRlX3RhYiA9ICgpIC0+XG4gICAgJChcIiNmaWVsZFRhYnMgYVtocmVmPScjdGFiI3thY3RpdmVfdGFifSddXCIpLnRhYignc2hvdycpXG5cblxuZ2V0X3JlY29yZDIgPSAocmVjaWQpIC0+XG4gICAgY29uc29sZS5sb2coJyEhQCNAJyk7XG4jIGNsZWFyIHdpa2lwZWRpYSBwbGFjZVxuICAgICQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoXCJcIilcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL2dvdnMvI3tyZWNpZH1cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGhlYWRlcnM6IHtcIlgtRHJlYW1GYWN0b3J5LUFwcGxpY2F0aW9uLU5hbWVcIjogXCJnb3Z3aWtpXCJ9XG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgIGdldF9maW5hbmNpYWxfc3RhdGVtZW50cyBkYXRhLl9pZCwgKGRhdGEyLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cyA9IGRhdGEyXG4gICAgICAgICAgICAgICAgICAgIGdldF9lbGVjdGVkX29mZmljaWFscyBkYXRhLl9pZCwgMjUsIChkYXRhMywgdGV4dFN0YXR1czIsIGpxWEhSMikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhM1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0X21heF9yYW5rcyAobWF4X3JhbmtzX3Jlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWF4X3JhbmtzID0gbWF4X3JhbmtzX3Jlc3BvbnNlLnJlY29yZFswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNUT0RPOiBFbmFibGUgYWZ0ZXIgcmVhbGl6ZSBtYXhfcmFua3MgYXBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcblxuICAgICAgICAgICAgIyBmaWxsIHdpa2lwZWRpYSBwbGFjZVxuICAgICAgICAgICAgI3dwbiA9IGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgICAgICAgICAgIyQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoaWYgd3BuIHRoZW4gd3BuIGVsc2UgXCJObyBXaWtpcGVkaWEgYXJ0aWNsZVwiKVxuXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9lbGVjdGVkX29mZmljaWFscyA9IChhbHRfdHlwZSwgZ292X25hbWUsIG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OS9hcGkvZ292ZXJubWVudC9cIiArIGFsdF90eXBlICsgJy8nICsgZ292X25hbWVcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5nZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgPSAoZ292X2lkLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9fcHJvYy9nZXRfZmluYW5jaWFsX3N0YXRlbWVudHNcIlxuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6IFwiZ292d2lraVwiXG4gICAgICAgICAgICBvcmRlcjogXCJjYXB0aW9uX2NhdGVnb3J5LGRpc3BsYXlfb3JkZXJcIlxuICAgICAgICAgICAgcGFyYW1zOiBbXG4gICAgICAgICAgICAgICAgbmFtZTogXCJnb3ZzX2lkXCJcbiAgICAgICAgICAgICAgICBwYXJhbV90eXBlOiBcIklOXCJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZ292X2lkXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9tYXhfcmFua3MgPSAob25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICdodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9tYXhfcmFua3MnXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgICBhcHBfbmFtZTogJ2dvdndpa2knXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0gKHJlYyk9PlxuICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgIGFjdGl2YXRlX3RhYigpXG4gICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgcm91dGVyLm5hdmlnYXRlKHJlYy5faWQpXG5cblxud2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQyID0gKHJlYyk9PlxuICAgIGdldF9lbGVjdGVkX29mZmljaWFscyByZWMuYWx0VHlwZVNsdWcsIHJlYy5zbHVnLCAoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgIHJlYy5lbGVjdGVkX29mZmljaWFscyA9IGRhdGFcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCByZWMpXG4gICAgICAgICNnZXRfcmVjb3JkMiByZWMuaWRcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIHVybCA9IHJlYy5hbHRUeXBlU2x1ZyArICcvJyArIHJlYy5zbHVnXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gdXJsXG5cblxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCBjb21tYW5kLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9hcGkubW9uZ29sYWIuY29tL2FwaS8xL2RhdGFiYXNlcy9nb3Z3aWtpL3J1bkNvbW1hbmQ/YXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5J1xuICAgICAgICB0eXBlOiAnUE9TVCdcbiAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgZGF0YTogY29tbWFuZCAjSlNPTi5zdHJpbmdpZnkoY29tbWFuZClcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlc1xuICAgICAgICAgICAgYnVpbGRfc2VsZWN0X2VsZW1lbnQgY29udGFpbmVyLCB0ZXh0LCB2YWx1ZXMuc29ydCgpLCB3aGVyZV90b19zdG9yZV92YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgcyA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICAgIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyIHdoZW4gdlxuICAgIHMgKz0gXCI8L3NlbGVjdD5cIlxuICAgIHNlbGVjdCA9ICQocylcbiAgICAkKGNvbnRhaW5lcikuYXBwZW5kKHNlbGVjdClcblxuICAgICMgc2V0IGRlZmF1bHQgJ0NBJ1xuICAgIGlmIHRleHQgaXMgJ1N0YXRlLi4nXG4gICAgICAgIHNlbGVjdC52YWwgJ0NBJ1xuICAgICAgICB3aW5kb3cuR09WV0lLSS5zdGF0ZV9maWx0ZXIgPSAnQ0EnXG5cbiAgICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgICAgICBlbCA9ICQoZS50YXJnZXQpXG4gICAgICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXG4gICAgICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgZ292X3NlbGVjdG9yLmNvdW50X2dvdnMoKVxuXG5hZGp1c3RfdHlwZWFoZWFkX3dpZHRoID0gKCkgLT5cbiAgICBpbnAgPSAkKCcjbXlpbnB1dCcpXG4gICAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gICAgaW5wLndpZHRoIHBhci53aWR0aCgpXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgICAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcblxuZm9jdXNfc2VhcmNoX2ZpZWxkID0gKG1zZWMpIC0+XG4gICAgc2V0VGltZW91dCAoLT4gJCgnI215aW5wdXQnKS5mb2N1cygpKSwgbXNlY1xuXG5cbiMgcXVpY2sgYW5kIGRpcnR5IGZpeCBmb3IgYmFjayBidXR0b24gaW4gYnJvd3Nlclxud2luZG93Lm9uaGFzaGNoYW5nZSA9IChlKSAtPlxuICAgIGggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxuICAgIGlmIG5vdCBoXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoKGl0bSktPiBpZiBpdG0gaXNudCBcIlwiIHRoZW4gaXRtIGVsc2UgZmFsc2UpO1xucm91dGVUeXBlID0gcm91dGUubGVuZ3RoO1xuXG5HT1ZXSUtJLmhpc3RvcnkgPSAoaW5kZXgpIC0+XG4gICAgaWYgaW5kZXggPT0gMFxuICAgICAgICBzZWFyY2hDb250YWluZXIgPSAkKCcjc2VhcmNoQ29udGFpbmVyJykudGV4dCgpO1xuICAgICAgICBpZihzZWFyY2hDb250YWluZXIgIT0gJycpXG4jICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4jICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiMgICAgICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLydcbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLnNob3coKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiAoaGlzdG9yeS5zdGF0ZSAhPSBudWxsICYmIGhpc3Rvcnkuc3RhdGUudGVtcGxhdGUgIT0gdW5kZWZpbmVkKVxuICAgICAgICB3aW5kb3cuaGlzdG9yeS5nbyhpbmRleCk7XG4gICAgZWxzZVxuICAgICAgICByb3V0ZS5wb3AoKVxuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJyArIHJvdXRlLmpvaW4oJy8nKVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9wc3RhdGUnLCAoZXZlbnQpIC0+XG4gICAgY29uc29sZS5sb2cod2luZG93Lmhpc3Rvcnkuc3RhdGUpXG4gICAgaWYgd2luZG93Lmhpc3Rvcnkuc3RhdGUgaXNudCBudWxsXG4gICAgICAgIHJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoKGl0bSktPiBpZiBpdG0gaXNudCBcIlwiIHRoZW4gaXRtIGVsc2UgZmFsc2UpO1xuICAgICAgICByb3V0ZSA9IHJvdXRlLmxlbmd0aDtcbiAgICAgICAgaWYgcm91dGUgaXMgMFxuICAgICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG4gICAgICAgIGlmIHJvdXRlIGlzbnQgMFxuICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBldmVudC5zdGF0ZS50ZW1wbGF0ZVxuICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIGVsc2VcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcbiAgICAgICAgaWYgR09WV0lLSS50cGxMb2FkZWQgaXMgZmFsc2UgdGhlbiBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuXG4jIFJlZnJlc2ggRGlzcXVzIHRocmVhZFxucmVmcmVzaF9kaXNxdXMgPSAobmV3SWRlbnRpZmllciwgbmV3VXJsLCBuZXdUaXRsZSkgLT5cbiAgICBESVNRVVMucmVzZXRcbiAgICAgICAgcmVsb2FkOiB0cnVlLFxuICAgICAgICBjb25maWc6ICgpIC0+XG4gICAgICAgICAgICB0aGlzLnBhZ2UuaWRlbnRpZmllciA9IG5ld0lkZW50aWZpZXJcbiAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBuZXdVcmxcbiAgICAgICAgICAgIHRoaXMucGFnZS50aXRsZSA9IG5ld1RpdGxlXG5cbiNcbiMgU29ydCB0YWJsZSBieSBjb2x1bW4uXG4jIEBwYXJhbSBzdHJpbmcgdGFibGUgIEpRdWVyeSBzZWxlY3Rvci5cbiMgQHBhcmFtIG51bWJlciBjb2xOdW0gQ29sdW1uIG51bWJlci5cbiNcbnNvcnRUYWJsZSA9ICh0YWJsZSwgY29sTnVtKSAtPlxuICAgICNcbiAgICAjIERhdGEgcm93cyB0byBzb3J0XG4gICAgI1xuICAgIHJvd3MgPSAkKHRhYmxlICsgJyB0Ym9keSAgW2RhdGEtaWRdJykuZ2V0KClcbiAgICAjXG4gICAgIyBMYXN0IHJvdyB3aGljaCBjb250YWlucyBcIkFkZCBuZXcgLi4uXCJcbiAgICAjXG4gICAgbGFzdFJvdyA9ICQodGFibGUgKyAnIHRib2R5ICB0cjpsYXN0JykuZ2V0KCk7XG4gICAgI1xuICAgICMgQ2xpY2tlZCBjb2x1bW4uXG4gICAgI1xuICAgIGNvbHVtbiA9ICQodGFibGUgKyAnIHRib2R5IHRyOmZpcnN0JykuY2hpbGRyZW4oJ3RoJykuZXEoY29sTnVtKVxuICAgIG1ha2VTb3J0ID0gdHJ1ZVxuXG4gICAgaWYgY29sdW1uLmhhc0NsYXNzKCdkZXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICAgICAgIyBSZXN0b3JlIHJvdyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnZGVzYycpLmFkZENsYXNzKCdvcmlnaW4nKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykucmVtb3ZlQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICByb3dzID0gY29sdW1uLmRhdGEoJ29yaWdpbicpXG4gICAgICBtYWtlU29ydCA9IGZhbHNlO1xuICAgIGVsc2UgaWYgY29sdW1uLmhhc0NsYXNzKCdhc2MnKVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBjdXJyZW50bHkgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlci5cbiAgICAgICMgU29ydCBpbiBkZXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdhc2MnKS5hZGRDbGFzcygnZGVzYycpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLnJlbW92ZUNsYXNzKCdpY29uX19ib3R0b20nKS5hZGRDbGFzcygnaWNvbl9fdG9wJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAxXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIHJldHVybiAwXG5cbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnb3JpZ2luJylcbiAgICAgICNcbiAgICAgICMgT3JpZ2luYWwgdGFibGUgZGF0YSBvcmRlci5cbiAgICAgICMgU29ydCBpbiBhc2Mgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ29yaWdpbicpLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5hZGRDbGFzcygnaWNvbl9fYm90dG9tJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBCID0gJChiKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAtMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBub3Qgb3JkZXJlZCB5ZXQuXG4gICAgICAjIFN0b3JlIG9yaWdpbmFsIGRhdGEgcG9zaXRpb24gYW5kIHNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuXG4gICAgICBjb2x1bW4uYWRkQ2xhc3MoJ2FzYycpXG4gICAgICBjb2x1bW4uZGF0YSgnb3JpZ2luJywgcm93cy5zbGljZSgwKSlcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgaWYgKG1ha2VTb3J0KSB0aGVuIHJvd3Muc29ydCBzb3J0RnVuY3Rpb25cbiAgICAkLmVhY2ggcm93cywgKGluZGV4LCByb3cpIC0+XG4gICAgICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChyb3cpXG4gICAgJCh0YWJsZSkuY2hpbGRyZW4oJ3Rib2R5JykuYXBwZW5kKGxhc3RSb3cpXG5cbmluaXRUYWJsZUhhbmRsZXJzID0gKHBlcnNvbikgLT5cbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpXG5cbiAgICAkKCcuZWRpdGFibGUnKS5lZGl0YWJsZSh7c3R5bGVzaGVldHM6IGZhbHNlLHR5cGU6ICd0ZXh0YXJlYScsIHNob3didXR0b25zOiAnYm90dG9tJywgZGlzcGxheTogdHJ1ZSwgZW1wdHl0ZXh0OiAnICd9KVxuICAgICQoJy5lZGl0YWJsZScpLm9mZignY2xpY2snKTtcblxuICAgICQoJ3RhYmxlJykub24gJ2NsaWNrJywgJy5nbHlwaGljb24tcGVuY2lsJywgKGUpIC0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubm9FZGl0YWJsZSBpc250IHVuZGVmaW5lZCB0aGVuIHJldHVyblxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVswXS5pZClcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZGF0YUlkJywgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJykuYXR0cignZGF0YS1pZCcpKVxuICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdmaWVsZCcsIE51bWJlcigoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykpWzBdLmNlbGxJbmRleCkgKyAxKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG5cbiAgICAjXG4gICAgIyBBZGQgc29ydCBoYW5kbGVycy5cbiAgICAjXG4gICAgJCgnLnNvcnQnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdHlwZSA9ICQodGhpcykuYXR0cignZGF0YS1zb3J0LXR5cGUnKVxuXG4gICAgICBpZiB0eXBlIGlzICd5ZWFyJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSB5ZWFyLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAwKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICduYW1lJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBuYW1lLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAxKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdhbW91bnQnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGFtb3VudC5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMylcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnY29udHJpYnV0b3ItdHlwZSdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgY29udHJpYnV0b3IgdHlwZS5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgNClcblxuICAgICQoJ2EnKS5vbiAnc2F2ZScsIChlLCBwYXJhbXMpIC0+XG4gICAgICAgIGVudGl0eVR5cGUgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGFibGUnKVswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgaWQgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKVswXS5kYXRhc2V0LmlkXG4gICAgICAgIGZpZWxkID0gT2JqZWN0LmtleXMoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJylbMF0uZGF0YXNldClbMF1cblxuICAgICAgICBpZiBmaWVsZCBpcyAndm90ZScgb3IgZmllbGQgaXMgJ2RpZEVsZWN0ZWRPZmZpY2lhbFByb3Bvc2VUaGlzJ1xuICAgICAgICAgICMjI1xuICAgICAgICAgICAgQ3VycmVudCBmaWVsZCBvd25lZCBieSBFbGVjdGVkT2ZmaWNpYWxWb3RlXG4gICAgICAgICAgIyMjXG4gICAgICAgICAgZW50aXR5VHlwZSA9ICdFbGVjdGVkT2ZmaWNpYWxWb3RlJ1xuICAgICAgICAgIGlkID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudCgpLmZpbmQoJ3NwYW4nKVswXS5kYXRhc2V0LmlkXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGVkaXRSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogaWQsXG4gICAgICAgICAgICAgICAgY2hhbmdlczoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QuY2hhbmdlc1tmaWVsZF0gPSBwYXJhbXMubmV3VmFsdWVcbiAgICAgICAgc2VuZE9iamVjdC5lZGl0UmVxdWVzdCA9IEpTT04uc3RyaW5naWZ5KHNlbmRPYmplY3QuZWRpdFJlcXVlc3QpO1xuICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9jcmVhdGUnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQvanNvbicsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgdGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICB9XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuYWRkJywgKGUpIC0+XG4gICAgICAgIHRhYlBhbmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgICB0YWJsZVR5cGUgPSB0YWJQYW5lWzBdLmlkXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0gJ3RhYmxlVHlwZScsIHRhYmxlVHlwZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICBjdXJyZW50RW50aXR5ID0gbnVsbFxuICAgICAgICBjb25zb2xlLmxvZyh0YWJsZVR5cGUpXG4gICAgICAgIGlmIHRhYmxlVHlwZSBpcyAnVm90ZXMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZFZvdGVzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdDb250cmlidXRpb24nXG4gICAgICAgICAgICAkKCcjYWRkQ29udHJpYnV0aW9ucycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdFbmRvcnNlbWVudCdcbiAgICAgICAgICAgICQoJyNhZGRFbmRvcnNlbWVudHMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ1N0YXRlbWVudHMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgICQoJyNhZGRTdGF0ZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgU2V0IGdldCB1cmwgY2FsbGJhY2suXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICQoJy51cmwtaW5wdXQnKS5vbiAna2V5dXAnLCAoKSAtPlxuICAgICAgICAgICAgICBtYXRjaF91cmwgPSAvXFxiKGh0dHBzPyk6XFwvXFwvKFtcXC1BLVowLTkuXSspKFxcL1tcXC1BLVowLTkrJkAjXFwvJT1+X3whOiwuO10qKT8oXFw/W0EtWjAtOSsmQCNcXC8lPX5ffCE6LC47XSopPy9pXG4gICAgICAgICAgICAgIGlmIChtYXRjaF91cmwudGVzdCgkKHRoaXMpLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAkLmFqYXggJy9hcGkvdXJsL2V4dHJhY3QnLCB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICQodGhpcykudmFsKCkubWF0Y2gobWF0Y2hfdXJsKVswXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50ID0gJCgnI3VybC1zdGF0ZW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBDbGVhci5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCAnJylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgU2V0IHRpdGxlLlxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQocmVzcG9uc2UuZGF0YS50aXRsZSlcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAnaHRtbCcpXG4gICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICMgSWYgdXJsIHBvaW50IHRvIGh0bWwsIGhpZGUgaW1nIGFuZCBzZXQgYm9keS5cbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dChyZXNwb25zZS5kYXRhLmJvZHkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlIGlzICd5b3V0dWJlJylcbiAgICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICAgIyBJZiB1cmwgcG9pbnQgdG8geW91dHViZSwgc2hvdyB5b3V0dWJlIHByZXZpZXcgaW1hZ2UuXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YS5wcmV2aWV3KVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAnaW1hZ2UnKVxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEucHJldmlldylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5zbGlkZURvd24oKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudCA9ICQoJyN1cmwtc3RhdGVtZW50JylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgQ2xlYXIuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgJycpXG5cbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoZXJyb3IucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LnNsaWRlRG93bigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICBpZiB0YWJQYW5lLmhhc0NsYXNzKCdsb2FkZWQnKSB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0YWJQYW5lWzBdLmNsYXNzTGlzdC5hZGQoJ2xvYWRlZCcpXG5cbiAgICAgICAgcGVyc29uTWV0YSA9IHtcImNyZWF0ZVJlcXVlc3RcIjp7XCJlbnRpdHlOYW1lXCI6Y3VycmVudEVudGl0eSxcImtub3duRmllbGRzXCI6e1wiZWxlY3RlZE9mZmljaWFsXCI6cGVyc29uLmlkfX19XG4gICAgICAgICQuYWpheChcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L25ldycsXG4gICAgICAgICAgICBkYXRhOiBwZXJzb25NZXRhLFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBlbmRPYmogPSB7fVxuICAgICAgICAgICAgICAgIGRhdGEuY2hvaWNlc1swXS5jaG9pY2VzLmZvckVhY2ggKGl0ZW0sIGluZGV4KSAtPlxuICAgICAgICAgICAgICAgICAgaWRzID0gT2JqZWN0LmtleXMgaXRlbVxuICAgICAgICAgICAgICAgICAgaWRzLmZvckVhY2ggKGlkKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIGVuZE9ialtpZF0gPSBpdGVtW2lkXVxuXG4gICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcyA9ICgpIC0+XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBkYXRhLmNob2ljZXNbMF0ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgZmlyc3QgYmxhbmsgb3B0aW9uLlxuICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKVxuICAgICAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcbiAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiBlbmRPYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGVuZE9ialtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcblxuICAgICAgICAgICAgICAgIHNlbGVjdCA9IG51bGxcblxuICAgICAgICAgICAgICAgIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0VuZG9yc2VtZW50J1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdDb250cmlidXRpb24nXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkVm90ZXMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLmZpbmQoJ1tkYXRhLXByb3ZpZGU9XCJkYXRlcGlja2VyXCJdJykub24oXG4gICAgICAgICAgICAgICAgICAgICAgJ2NoYW5nZURhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICgpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIgJ2hpZGUnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIEZpbGwgZWxlY3RlZCBvZmZpY2lhbHMgdm90ZXMgdGFibGUuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjbGVnaXNsYXRpb24tdm90ZScpLmh0bWwoKSlcbiAgICAgICAgICAgICAgICAgICAgJCgnI2VsZWN0ZWRWb3RlcycpLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKTtcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnUHVibGljU3RhdGVtZW50J1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkU3RhdGVtZW50cyBzZWxlY3QnKVswXVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FkZFN0YXRlbWVudHMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAoKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgaWYoZXJyb3Iuc3RhdHVzID09IDQwMSkgdGhlbiBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICk7XG5cbiAgICB3aW5kb3cuYWRkSXRlbSA9IChlKSAtPlxuICAgICAgICBuZXdSZWNvcmQgPSB7fVxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXG4gICAgICAgIG1vZGFsVHlwZSA9IG1vZGFsWzBdLmlkXG4gICAgICAgIGVudGl0eVR5cGUgPSBtb2RhbFswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgR2V0IHZhbHVlIGZyb20gaW5wdXQgZmllbGRzLlxuICAgICAgICAjIyNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIHRleGFyZWEncy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ3RleHRhcmVhJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICBhc3NvY2lhdGlvbnMgPSB7fVxuICAgICAgICBpZiBtb2RhbFR5cGUgIT0gJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW1wiZWxlY3RlZE9mZmljaWFsXCJdID0gcGVyc29uLmlkXG4gICAgICAgICNcbiAgICAgICAgIyBBcnJheSBvZiBzdWIgZW50aXRpZXMuXG4gICAgICAgICNcbiAgICAgICAgY2hpbGRzID0gW11cblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgQWRkIGluZm9ybWF0aW9uIGFib3V0IHZvdGVzLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBtb2RhbC5maW5kKCcjZWxlY3RlZFZvdGVzJykuZmluZCgndHJbZGF0YS1lbGVjdGVkXScpLiBlYWNoIChpZHgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoZWxlbWVudClcblxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAjIEdldCBhbGwgc3ViIGVudGl0eSBmaWVsZHMuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGRhdGEgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3NlbGVjdCcpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgIEFkZCBvbmx5IGlmIGFsbCBmaWVsZHMgaXMgc2V0LlxuICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIGlmIE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkcyA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydmaWVsZHMnXSA9IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXVtlbGVtZW50LmF0dHIoJ2RhdGEtZW50aXR5LXR5cGUnKV0gPSBlbGVtZW50LmF0dHIoJ2RhdGEtZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5TmFtZSA9IGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkuYXR0ciAnZGF0YS1lbnRpdHktdHlwZSdcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5TmFtZTogY2hpbGRFbnRpdHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoaWxkIGZpZWxkcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkczogZmllbGRzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCBjYXRlZ29yeS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGNhdGVnb3J5LicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGZpZWxkczogeyBmaWVsZHM6IG5ld1JlY29yZCwgYXNzb2NpYXRpb25zOiBhc3NvY2lhdGlvbnMsIGNoaWxkczogY2hpbGRzfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEFwcGVuZCBuZXcgZW50aXR5IHRvIHRhYmxlLlxuICAgICAgICAjIyNcbiAgICAgICAgcm93VGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJChcIiNyb3ctI3ttb2RhbFR5cGV9XCIpLmh0bWwoKSk7XG5cbiAgICAgICAgI1xuICAgICAgICAjIENvbGxlY3QgZGF0YS5cbiAgICAgICAgI1xuICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgIGRhdGFbJ3VzZXInXSA9IHVzZXIudXNlcm5hbWVcblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIENoZWNrIGlmIHVzZXIgc3BlY2lmaWVkIGhvdyBjdXJyZW50IGVsZWN0ZWQgb2ZmaWNpYWwgdm90ZWQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIG9iaiBpbiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmNoaWxkc1xuICAgICAgICAgICAgICBpZiBOdW1iZXIob2JqLmZpZWxkcy5hc3NvY2lhdGlvbnMuZWxlY3RlZE9mZmljaWFsKSA9PSBOdW1iZXIocGVyc29uLmlkKVxuICAgICAgICAgICAgICAgIGFkZCA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmouZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIElmIHdlIGZvdW5kLCBzaG93LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgICAkKCcjVm90ZXMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZGF0YS5jb250cmlidXRvclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgIGRhdGEuY29udHJpYnV0aW9uQW1vdW50ID0gbnVtZXJhbChkYXRhLmNvbnRyaWJ1dGlvbkFtb3VudCkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgICAgICAkKCcjQ29udHJpYnV0aW9ucyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgZGF0YS5lbmRvcnNlclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICQoJyNFbmRvcnNlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAkKCcjU3RhdGVtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIFNlbmQgY3JlYXRlIHJlcXVlc3QgdG8gYXBpLlxuICAgICAgICAjIyNcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L2NyZWF0ZScsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAjIENsb3NlIG1vZGFsIHdpbmRvd1xuICAgICAgICBtb2RhbC5tb2RhbCAnaGlkZSdcblxuICAgICMjI1xuICAgICAgICBJZiB1c2VyIHRyeSB0byBhZGQgb3IgdXBkYXRlIHNvbWUgZGF0YSB3aXRob3V0IGxvZ2dlZCBpbiwgd2VcbiAgICAgICAgc2hvdyBoaW0gbG9naW4vc2lnbiB1cCB3aW5kb3cuIEFmdGVyIGF1dGhvcml6aW5nIHVzZXIgcmVkaXJlY3QgYmFja1xuICAgICAgICB0byBwYWdlLCB3aGVyZSBoZSBwcmVzIGFkZC9lZGl0IGJ1dHRvbi4gSW4gdGhhdCBjYXNlIHdlIHNob3cgaGltIGFwcHJvcHJpYXRlXG4gICAgICAgIG1vZGFsIHdpbmRvdy5cblxuICAgICAgICBUaW1lb3V0IG5lZWQgYmVjYXVzZSB3ZSBkb24ndCBrbm93IHdoZW4gd2UgZ2V0IHVzZXIgaW5mb3JtYXRpb24gYW5kIGVsZWN0ZWQgb2ZmaWNpYWwgaW5mb3JtYXRpb24uXG4gICAgIyMjXG4gICAgd2luZG93LnNldFRpbWVvdXQoICgpIC0+XG4gICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgIHJldHVyblxuXG4gICAgICB0eXBlID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3RhYmxlVHlwZScpXG4gICAgICBkYXRhSWQgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnZGF0YUlkJylcbiAgICAgIGZpZWxkID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2ZpZWxkJylcblxuICAgICAgaWYgKGRhdGFJZCAmJiBmaWVsZClcbiAgICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgICAkKCd0cltkYXRhLWlkPScrZGF0YUlkKyddJykuZmluZCgndGQ6bnRoLWNoaWxkKCcrZmllbGQrJyknKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAnJylcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICcnKVxuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCAnJylcblxuICAgICAgZWxzZSBpZiAodHlwZSlcbiAgICAgICAgJCgnZGl2IycgKyB0eXBlKS5maW5kKCcuYWRkJykuY2xpY2soKVxuICAgICAgICAkKCdhW2FyaWEtY29udHJvbHM9XCInICsgdHlwZSArICdcIl0nKS5jbGljaygpXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAnJylcbiAgICAsXG4gICAgMjAwMFxuICAgIClcblxuXG4jIyNcbiAgQXBwZW5kIGNyZWF0ZSByZXF1ZXN0cyB0byBhbGwgY3VycmVudCBlbGVjdGVkT2ZmaWNpYWwgcGFnZS5cbiMjI1xuc2hvd0NyZWF0ZVJlcXVlc3RzID0gKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpIC0+XG4gICAgIyBEb24ndCBzaG93IG5vdCBhcHByb3ZlZCBjcmVhdGUgcmVxdWVzdCB0byBhbm9uLlxuICAgIGlmICghYXV0aG9yaXplZCkgdGhlbiByZXR1cm5cblxuICAgIGxlZ2lzbGF0aW9uUm93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkVm90ZXMnKS5odG1sKCkpXG4gICAgY29udHJpYnV0aW9uUm93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkQ29udHJpYnV0aW9ucycpLmh0bWwoKSlcbiAgICBlbmRvcnNlbWVudFJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZEVuZG9yc2VtZW50cycpLmh0bWwoKSlcbiAgICBzdGF0ZW1lbnRSb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRTdGF0ZW1lbnRzJykuaHRtbCgpKVxuXG4gICAgZm9yIHJlcXVlc3QgaW4gY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgI1xuICAgICAgICAjIFByZXBhcmUgY3JlYXRlIHJlcXVlc3QgZGF0YSBmb3IgdGVtcGxhdGUuXG4gICAgICAgICNcbiAgICAgICAgZGF0YSA9IHJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICBkYXRhWyd1c2VyJ10gPSByZXF1ZXN0LnVzZXIudXNlcm5hbWVcblxuICAgICAgICAjXG4gICAgICAgICMgRmluZCBvdXQgdGVtcGxhdGUgZm9yIGN1cnJlbnQgcmVxdWVzdCBhbmQgYWRkaXRpb25hbCB2YWx1ZXMuXG4gICAgICAgICNcbiAgICAgICAgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkxlZ2lzbGF0aW9uXCJcbiAgICAgICAgICAgIG5hbWUgPSAnVm90ZXMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGxlZ2lzbGF0aW9uUm93XG4gICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiByZXF1ZXN0LmZpZWxkcy5jaGlsZHNbMF0uZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gY2F0ZWdvcmllc1tyZXF1ZXN0LmZpZWxkcy5hc3NvY2lhdGlvbnMuaXNzdWVDYXRlZ29yeSAtIDFdLm5hbWVcblxuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJDb250cmlidXRpb25cIlxuICAgICAgICAgICAgbmFtZSA9ICdDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBjb250cmlidXRpb25Sb3dcblxuICAgICAgICAgICAgZGF0YVsnY29udHJpYnV0aW9uQW1vdW50J10gPSBudW1lcmFsKGRhdGFbJ2NvbnRyaWJ1dGlvbkFtb3VudCddKS5mb3JtYXQoJzAsMDAwJylcbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiRW5kb3JzZW1lbnRcIlxuICAgICAgICAgICAgbmFtZSA9ICdFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGVuZG9yc2VtZW50Um93XG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIlB1YmxpY1N0YXRlbWVudFwiXG4gICAgICAgICAgICBuYW1lID0gJ1N0YXRlbWVudHMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHN0YXRlbWVudFJvd1xuXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gY2F0ZWdvcmllc1tyZXF1ZXN0LmZpZWxkcy5hc3NvY2lhdGlvbnMuaXNzdWVDYXRlZ29yeSAtIDFdLm5hbWVcblxuICAgICAgICAkKFwiXFwjI3tuYW1lfSB0cjpsYXN0LWNoaWxkXCIpLmJlZm9yZSh0ZW1wbGF0ZShkYXRhKSlcblxuXG4kKCcjZGF0YUNvbnRhaW5lcicpLnBvcG92ZXIoe1xuICAgIHBsYWNlbWVudDogJ2JvdHRvbSdcbiAgICBzZWxlY3RvcjogJy5yYW5rJ1xuICAgIGFuaW1hdGlvbjogdHJ1ZVxufSk7XG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KTtcbiAgICAkKCcucmFuaycpLm5vdChlLnRhcmdldCkucG9wb3ZlcignZGVzdHJveScpXG4gICAgZmllbGROYW1lID0gJGVsZW1lbnQuYXR0cignZGF0YS1maWVsZCcpO1xuICAgIGlmIGZpZWxkTmFtZVxuICAgICAgICBmaWVsZE5hbWVJbkNhbWVsQ2FzZSA9IGZpZWxkTmFtZS5yZXBsYWNlIC9fKFthLXpdKS9nLCAoZykgLT4gcmV0dXJuIGdbMV0udG9VcHBlckNhc2UoKVxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgIHVybDogJy9hcGkvZ292ZXJubWVudCcrd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKycvZ2V0X3JhbmtzJ1xuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgIGRhdGE6XG4gICAgICAgICAgICAgICAgIyBUcmFuc2Zvcm0gdG8gY2FtZWxDYXNlXG4gICAgICAgICAgICAgICAgZmllbGRfbmFtZTogZmllbGROYW1lSW5DYW1lbENhc2VcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcmFua1BvcG92ZXInKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCkuZmluZCgnLnBvcG92ZXItY29udGVudCcpLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKVxuXG5cblxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAnLmVsZWN0ZWRfbGluaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB1cmwgPSBlLmN1cnJlbnRUYXJnZXQucGF0aG5hbWVcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgICAgICAgICAgcGVyc29uID0gZGF0YS5wZXJzb25cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUmVxdWVzdHMgPSBkYXRhLmNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLmNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcblxuICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICAgIGZvciBjb250cmlidXRpb24gaW4gcGVyc29uLmNvbnRyaWJ1dGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50ID0gbnVtZXJhbChjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCkuZm9ybWF0KCcwLDAwMCcpXG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG1vbWVudChpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCwgJ1lZWVktTU0tREQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS5mb3JtYXQgJ0wnXG5cbiAgICAgICAgICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBjb21waWxlZFRlbXBsYXRlKHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGh0bWx9LCAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGh0bWxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuICAgICAgICAgICAgICAgICAgICBzaG93Q3JlYXRlUmVxdWVzdHMocGVyc29uLCBjcmVhdGVSZXF1ZXN0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgICAgICAgICAjIElmIGxlZ2lzbGF0aW9uTmFtZSBpcyB1bmRlZmluZWQgdXNlIHBlcnNvbiBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjbXlNb2RhbExhYmVsJykudGV4dChuYW1lICsgJyAoJyArIHBlcnNvbi5nb3ZfYWx0X25hbWUgKyAnKScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuICAgICAgICAgICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuRElTUVVTV0lER0VUUy5nZXRDb3VudCgpXG5cbiAgICAgICAgICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG4jIFJvdXRlIC9cbmlmIHJvdXRlVHlwZSBpcyAwXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJy9sZWdhY3kvZGF0YS9oX3R5cGVzX2NhXzIuanNvbicsIDdcbiAgICBnb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAgICAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgdXJsID0gJy8nICsgZGF0YS5hbHRUeXBlU2x1ZyArICcvJyArIGRhdGEuc2x1Z1xuICAgICAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgICQuYWpheFxuIyAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgICBpZiAhdW5kZWZcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwgJCgnI3NlYXJjaC1jb250YWluZXItdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgIyBMb2FkIGludHJvZHVjdG9yeSB0ZXh0IGZyb20gdGV4dHMvaW50cm8tdGV4dC5odG1sIHRvICNpbnRyby10ZXh0IGNvbnRhaW5lci5cbiAgICAgICAgJC5nZXQgXCIvbGVnYWN5L3RleHRzL2ludHJvLXRleHQuaHRtbFwiLCAoZGF0YSkgLT4gJChcIiNpbnRyby10ZXh0XCIpLmh0bWwgZGF0YVxuICAgICAgICBnb3ZtYXAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4gICAgICAgIGdldF9jb3VudGllcyBHT1ZXSUtJLmRyYXdfcG9seWdvbnNcbiAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6ICQoJyNzZWFyY2hDb250YWluZXInKS5odG1sKCl9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4gICAgICAgIHVuZGVmID0gdHJ1ZVxuICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG4gICAgc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCgpXG5cbiAgICAkKCcjYnRuQmFja1RvU2VhcmNoJykuY2xpY2sgKGUpLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiAgICB0ZW1wbGF0ZXMubG9hZF9mdXNpb25fdGVtcGxhdGUgXCJ0YWJzXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZnVzaW9udGFibGVzL3YyL3F1ZXJ5P3NxbD1TRUxFQ1QlMjAqJTIwRlJPTSUyMDF6Mm9YUUVZUTNwMk9vTUk4VjVnS2dIV0I1VHo5OTBCclExeGMxdFZvJmtleT1BSXphU3lDWERReU1EcEdBMmczUWp1djRDRHY3elJqLWl4NElRSkFcIlxuICAgICQoJyNnb3ZtYXAnKS5vbiAnY2xpY2snLCAnLmluZm8td2luZG93LXVyaScsIChlKSAtPlxuICAgICAgICB1cmkgPSBlLnRhcmdldC5wYXJlbnROb2RlLmRhdGFzZXQudXJpXG4gICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAkLmFqYXhcbiMgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICB1cmw6IFwiL2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuXG4jIFJvdXRlIC9yYW5rX29yZGVyXG5pZiByb3V0ZVR5cGUgaXMgMVxuICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICQoJy5sb2FkZXInKS5zaG93KClcbiAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcblxuICAkLmFqYXhcbiAgICB1cmw6IFwiL2FwaS9yYW5rX29yZGVyXCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICNcbiAgICAgICMgUmVuZGVyIHJhbmsgb3JkZXIgdGVtcGxhdGUuXG4gICAgICAjXG4gICAgICB0cGwgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jhbmstb3JkZXItcGFnZScpLmh0bWwoKSlcbiAgICAgIGNvbnNvbGUubG9nIGRhdGFcbiAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0cGwoZGF0YSlcbiAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKCk7XG5cbiAgICAgICNcbiAgICAgICMgUHVzaCB0ZW1wbGF0ZS5cbiAgICAgICNcbiAgICAgIEdPVldJS0kudHBsTG9hZGVkID0gdHJ1ZVxuIyAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IHRwbH0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnL3Jhbmtfb3JkZXInXG5cblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWVcbmlmIHJvdXRlVHlwZSBpcyAyXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIENpdmljIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJC5hamF4XG4jICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgIHJ1biA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHJ1blxuICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICAgICAgR09WV0lLSS50cGxMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBydW59LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgd2luZG93LnBhdGhcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG5cbiMgUm91dGUgLzphbHRfbmFtZS86Y2l0eV9uYW1lLzplbGVjdGVkX25hbWVcbmlmIHJvdXRlVHlwZSBpcyAzXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCIvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuXG4gICAgICAgICAgICBwZXJzb24gPSBkYXRhLnBlcnNvblxuICAgICAgICAgICAgY3JlYXRlUmVxdWVzdHMgPSBkYXRhLmNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICAgICBjYXRlZ29yaWVzID0gZGF0YS5jYXRlZ29yaWVzXG4gICAgICAgICAgICBwZXJzb24uY2F0ZWdvcnlfc2VsZWN0ID0gW11cblxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIFByZXBhcmUgb3B0aW9ucyBmb3Igc2VsZWN0IGluIElzc3Vlc0NhdGVnb3J5IGVkaXQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgICAgICAgICAgIHBlcnNvbi5jYXRlZ29yeV9zZWxlY3QucHVzaCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGNhdGVnb3J5LmlkXG4gICAgICAgICAgICAgICAgdGV4dDogY2F0ZWdvcnkubmFtZVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBwZXJzb24uY2F0ZWdvcnlfc2VsZWN0ID0gSlNPTi5zdHJpbmdpZnkocGVyc29uLmNhdGVnb3J5X3NlbGVjdCk7XG5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZm9yIGNvbnRyaWJ1dGlvbiBpbiBwZXJzb24uY29udHJpYnV0aW9uc1xuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50ID0gbnVtZXJhbChjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCkuZm9ybWF0KCcwLDAwMCcpXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHBlcnNvblxuXG4gICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiBwZXJzb24udm90ZXMgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbW9tZW50KGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkLCAnWVlZWS1NTS1ERCcpO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUuZm9ybWF0ICdMJ1xuXG4gICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcblxuICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuXG4gICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuICAgICAgICAgICAgc2hvd0NyZWF0ZVJlcXVlc3RzKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpO1xuXG4gICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuICAjIyNcbiAgICBHZXQgY3VycmVudCB1c2VyLlxuICAjIyNcbiAgJHVzZXJCdG4gPSAkKCcjdXNlcicpXG4gICR1c2VyQnRuTGluayA9ICR1c2VyQnRuLmZpbmQoJ2EnKTtcbiAgJC5hamF4ICcvYXBpL3VzZXInLCB7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBhc3luYzogZmFsc2UsXG4gICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgdXNlci51c2VybmFtZSA9IHJlc3BvbnNlLnVzZXJuYW1lO1xuICAgICAgYXV0aG9yaXplZCA9IHRydWU7XG5cbiAgICAgICR1c2VyVGV4dCA9ICQoJyN1c2VyLXRleHQnKS5maW5kKCdhJyk7XG4gICAgICAkdXNlclRleHQuaHRtbChcIkxvZ2dlZCBpbiBhcyAje3VzZXIudXNlcm5hbWV9XCIgKyAkdXNlclRleHQuaHRtbCgpKVxuICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJTaWduIE91dFwiICsgJHVzZXJCdG5MaW5rLmh0bWwoKSkuY2xpY2sgKCkgLT5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gJy9sb2dvdXQnXG5cbiAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIGF1dGhvcml6ZWQgPSBmYWxzZVxuICAgICAgJHVzZXJCdG5MaW5rLmh0bWwoXCJMb2dpbiAvIFNpZ24gVXBcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgfVxuIiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSBcbiAgICAgICAgbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLmdvdl9uYW1lLCB3b3JkcywgcmVncylcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXG4gICAgI2QuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpJylcbiAgW3dvcmRzLHJlZ3NdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWVyeU1hdGhlclxuXG4iLCJcbiMjI1xuIyBmaWxlOiB0ZW1wbGF0ZXMyLmNvZmZlZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jXG4jIENsYXNzIHRvIG1hbmFnZSB0ZW1wbGF0ZXMgYW5kIHJlbmRlciBkYXRhIG9uIGh0bWwgcGFnZS5cbiNcbiMgVGhlIG1haW4gbWV0aG9kIDogcmVuZGVyKGRhdGEpLCBnZXRfaHRtbChkYXRhKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5cblxuIyBMT0FEIEZJRUxEIE5BTUVTXG5maWVsZE5hbWVzID0ge31cbmZpZWxkTmFtZXNIZWxwID0ge31cblxuXG5yZW5kZXJfZmllbGRfdmFsdWUgPSAobixtYXNrLGRhdGEpIC0+XG4gIHY9ZGF0YVtuXVxuICBpZiBub3QgZGF0YVtuXVxuICAgIHJldHVybiAnJ1xuXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIGlmICcnICE9IG1hc2tcbiAgICAgIGlmIGRhdGFbbisnX3JhbmsnXSBhbmQgZGF0YS5tYXhfcmFua3MgYW5kIGRhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddXG4gICAgICAgIHYgPSBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgICAgICByZXR1cm4gXCIje3Z9IDxhIGNsYXNzPSdyYW5rJ1xuICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZmllbGQ9JyN7bn1fcmFuaydcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT0nI3tufSByYW5rcyc+XG4gICAgICAgICAgICAgICAgICAgICAgKCN7ZGF0YVtuKydfcmFuayddfSBvZiAje2RhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddfSk8L2E+XCJcbiAgICAgIGlmIG4gPT0gXCJudW1iZXJfb2ZfZnVsbF90aW1lX2VtcGxveWVlc1wiXG4gICAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdCgnMCwwJylcbiAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgIGVsc2VcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwib3Blbl9lbnJvbGxtZW50X3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwicGFyZW50X3RyaWdnZXJfZWxpZ2libGVfc2Nob29sc1wiXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxuICAgICAgZWxzZVxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDIxXG4gICAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDIxKVxuICAgICAgICBlbHNlXG4gICAgICAgIHJldHVybiB2XG5cblxucmVuZGVyX2ZpZWxkX25hbWVfaGVscCA9IChmTmFtZSkgLT5cbiAgI2lmIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuICAgIHJldHVybiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICBpZiBcIl9cIiA9PSBzdWJzdHIgZk5hbWUsIDAsIDFcbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4mbmJzcDs8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICByZXR1cm4gJycgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyAgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PGRpdj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG5yZW5kZXJfc3ViaGVhZGluZyA9IChmTmFtZSwgbWFzaywgbm90Rmlyc3QpLT5cbiAgcyA9ICcnXG4gIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZk5hbWVcbiAgaWYgbWFzayA9PSBcImhlYWRpbmdcIlxuICAgIGlmIG5vdEZpcnN0ICE9IDBcbiAgICAgIHMgKz0gXCI8YnIvPlwiXG4gICAgcyArPSBcIjxkaXY+PHNwYW4gY2xhc3M9J2YtbmFtJz4je2ZOYW1lfTwvc3Bhbj48c3BhbiBjbGFzcz0nZi12YWwnPiA8L3NwYW4+PC9kaXY+XCJcbiAgcmV0dXJuIHNcblxucmVuZGVyX2ZpZWxkcyA9IChmaWVsZHMsZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgZm9yIGZpZWxkLGkgaW4gZmllbGRzXG4gICAgaWYgKHR5cGVvZiBmaWVsZCBpcyBcIm9iamVjdFwiKVxuICAgICAgaWYgZmllbGQubWFzayA9PSBcImhlYWRpbmdcIlxuICAgICAgICBoICs9IHJlbmRlcl9zdWJoZWFkaW5nKGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGkpXG4gICAgICAgIGZWYWx1ZSA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBkYXRhXG4gICAgICAgIGlmICgnJyAhPSBmVmFsdWUgYW5kIGZWYWx1ZSAhPSAnMCcpXG4gICAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZC5uYW1lXG4gICAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmaWVsZC5uYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmVmFsdWUgPSAnJ1xuXG4gICAgZWxzZVxuICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLCAnJywgZGF0YVxuICAgICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZFxuICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZOYW1lXG4gICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZk5hbWUsIHZhbHVlOiBmVmFsdWUsIGhlbHA6IGZOYW1lSGVscClcbiAgcmV0dXJuIGhcblxucmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgPSAoZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgbWFzayA9ICcwLDAnXG4gIGNhdGVnb3J5ID0gJydcbiAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgZm9yIGZpZWxkIGluIGRhdGFcbiAgICBpZiBjYXRlZ29yeSAhPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBjYXRlZ29yeSA9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGlmIGNhdGVnb3J5ID09ICdPdmVydmlldydcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgIGVsc2UgaWYgY2F0ZWdvcnkgPT0gJ1JldmVudWVzJ1xuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSBcIjxiPlwiICsgdGVtcGxhdGUobmFtZTogY2F0ZWdvcnksIGdlbmZ1bmQ6IFwiR2VuZXJhbCBGdW5kXCIsIG90aGVyZnVuZHM6IFwiT3RoZXIgRnVuZHNcIiwgdG90YWxmdW5kczogXCJUb3RhbCBHb3YuIEZ1bmRzXCIpICsgXCI8L2I+XCJcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuXG4gICAgaWYgZmllbGQuY2FwdGlvbiA9PSAnR2VuZXJhbCBGdW5kIEJhbGFuY2UnIG9yIGZpZWxkLmNhcHRpb24gPT0gJ0xvbmcgVGVybSBEZWJ0J1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICBlbHNlIGlmIGZpZWxkLmNhcHRpb24gaW4gWydUb3RhbCBSZXZlbnVlcycsICdUb3RhbCBFeHBlbmRpdHVyZXMnLCAnU3VycGx1cyAvIChEZWZpY2l0KSddIG9yIGlzX2ZpcnN0X3Jvd1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgICAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2spLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaykpXG4gIHJldHVybiBoXG5cbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvW1xcc1xcK1xcLV0vZywgJ18nKVxuXG50b1RpdGxlQ2FzZSA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlIC9cXHdcXFMqL2csICh0eHQpIC0+XG4gICAgdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG5cbmN1cnJlbmN5ID0gKG4sIG1hc2ssIHNpZ24gPSAnJykgLT5cbiAgICBuID0gbnVtZXJhbChuKVxuICAgIGlmIG4gPCAwXG4gICAgICAgIHMgPSBuLmZvcm1hdChtYXNrKS50b1N0cmluZygpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoLy0vZywgJycpXG4gICAgICAgIHJldHVybiBcIigje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytzKyc8L3NwYW4+J30pXCJcblxuICAgIG4gPSBuLmZvcm1hdChtYXNrKVxuICAgIHJldHVybiBcIiN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK24rJzwvc3Bhbj4nfVwiXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhLCB0YWJzZXQsIHBhcmVudCkgLT5cbiAgI2xheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gIGxheW91dCA9IGluaXRpYWxfbGF5b3V0XG4gIHRlbXBsYXRlcyA9IHBhcmVudC50ZW1wbGF0ZXNcbiAgcGxvdF9oYW5kbGVzID0ge31cblxuICBsYXlvdXRfZGF0YSA9XG4gICAgdGl0bGU6IGRhdGEubmFtZVxuICAgIHdpa2lwZWRpYV9wYWdlX2V4aXN0czogZGF0YS53aWtpcGVkaWFfcGFnZV9leGlzdHNcbiAgICB3aWtpcGVkaWFfcGFnZV9uYW1lOiAgZGF0YS53aWtpcGVkaWFfcGFnZV9uYW1lXG4gICAgdHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWU6IGRhdGEudHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWVcbiAgICBsYXRlc3RfYXVkaXRfdXJsOiBkYXRhLmxhdGVzdF9hdWRpdF91cmxcbiAgICB0YWJzOiBbXVxuICAgIHRhYmNvbnRlbnQ6ICcnXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGxheW91dF9kYXRhLnRhYnMucHVzaFxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgZGV0YWlsX2RhdGEgPVxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcbiAgICAgIHRhYmNvbnRlbnQ6ICcnXG4gICAgc3dpdGNoIHRhYi5uYW1lXG4gICAgICB3aGVuICdPdmVydmlldyArIEVsZWN0ZWQgT2ZmaWNpYWxzJ1xuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgICBmb3Igb2ZmaWNpYWwsaSBpbiBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzXG4gICAgICAgICAgb2ZmaWNpYWxfZGF0YSA9XG4gICAgICAgICAgICB0aXRsZTogaWYgJycgIT0gb2ZmaWNpYWwudGl0bGUgdGhlbiBcIlRpdGxlOiBcIiArIG9mZmljaWFsLnRpdGxlXG4gICAgICAgICAgICBuYW1lOiBpZiAnJyAhPSBvZmZpY2lhbC5mdWxsX25hbWUgdGhlbiBcIk5hbWU6IFwiICsgb2ZmaWNpYWwuZnVsbF9uYW1lXG4gICAgICAgICAgICBlbWFpbDogaWYgb2ZmaWNpYWwuZW1haWxfYWRkcmVzcyB0aGVuIFwiRW1haWw6IFwiICsgb2ZmaWNpYWwuZW1haWxfYWRkcmVzc1xuICAgICAgICAgICAgdGVsZXBob25lbnVtYmVyOiBpZiBudWxsICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgYW5kIHVuZGVmaW5lZCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIHRoZW4gXCJUZWxlcGhvbmUgTnVtYmVyOiBcIiArIG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXJcbiAgICAgICAgICAgIHRlcm1leHBpcmVzOiBpZiBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgdGhlbiBcIlRlcm0gRXhwaXJlczogXCIgKyBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgZWxzZSBcIlRlcm0gRXhwaXJlczogXCJcbiAgICAgICAgICAgIGFsdFR5cGVTbHVnOiBkYXRhLmFsdF90eXBlX3NsdWdcbiAgICAgICAgICAgIG5hbWVTbHVnOiBkYXRhLnNsdWdcbiAgICAgICAgICAgIHNsdWc6IG9mZmljaWFsLnNsdWdcblxuICAgICAgICAgIGlmICcnICE9IG9mZmljaWFsLnBob3RvX3VybCBhbmQgb2ZmaWNpYWwucGhvdG9fdXJsICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnPGltZyBzcmM9XCInK29mZmljaWFsLnBob3RvX3VybCsnXCIgY2xhc3M9XCJwb3J0cmFpdFwiIGFsdD1cIlwiIC8+J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJydcblxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnXShvZmZpY2lhbF9kYXRhKVxuICAgICAgd2hlbiAnRW1wbG95ZWUgQ29tcGVuc2F0aW9uJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzQwXG4gICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDQ3MFxuXG4gICAgICAgICAgaWYgJCh3aW5kb3cpLndpZHRoKCkgPCA0OTBcbiAgICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIENvbXBlbnNhdGlvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0JlbnMuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnXFxuIEVtcGxveWVlcydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnQWxsIFxcbicgKyB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnIFxcbiBSZXNpZGVudHMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDIpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgQ29tcGVuc2F0aW9uIC0gRnVsbCBUaW1lIFdvcmtlcnM6IFxcbiBHb3Zlcm5tZW50IHZzLiBQcml2YXRlIFNlY3RvcidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLWNvbXAtZ3JhcGgnXSA9J21lZGlhbi1jb21wLWdyYXBoJ1xuXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiAhIGRhdGEuaGFzT3duUHJvcGVydHkoJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZScpIHx8ICggZGF0YVsnbWVkaWFuX3BlbnNpb25fMzBfeWVhcl9yZXRpcmVlJ10gPT0gMClcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBQZW5zaW9uJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1BlbnNpb24gZm9yIFxcbiBSZXRpcmVlIHcvIDMwIFllYXJzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3BlbnNpb24zMF95ZWFyX3JldGlyZWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGdyb3VwaW5nU3ltYm9sOiAnLCcgLCBmcmFjdGlvbkRpZ2l0czogJzAnKVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIFBlbnNpb24nXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2Jhcic6IHtcbiAgICAgICAgICAgICAgICAgJ2dyb3VwV2lkdGgnOiAnMzAlJ1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tcGVuc2lvbi1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ10gPSdtZWRpYW4tcGVuc2lvbi1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBIZWFsdGgnXG4gICAgICAgIGggPSAnJ1xuICAgICAgICBoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgI3B1YmxpYyBzYWZldHkgcGllXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3B1YmxpYy1zYWZldHktcGllJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUHVibGljIFNhZmV0eSBFeHBlbnNlJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1B1YmxpYyBTYWZldHkgRXhwJ1xuICAgICAgICAgICAgICAgICAgMSAtIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnT3RoZXInXG4gICAgICAgICAgICAgICAgICBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonUHVibGljIHNhZmV0eSBleHBlbnNlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ3NsaWNlcyc6IHsgMToge29mZnNldDogMC4yfX1cbiAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDQ1XG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdwdWJsaWMtc2FmZXR5LXBpZSdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3B1YmxpYy1zYWZldHktcGllJ10gPSdwdWJsaWMtc2FmZXR5LXBpZSdcbiAgICAgICAgI2Zpbi1oZWFsdGgtcmV2ZW51ZSBncmFwaFxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICNjb25zb2xlLmxvZyAnIyMjYWwnK0pTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdSZXYuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVG90YWwgUmV2ZW51ZSBcXG4gUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIFJldmVudWUgUGVyIFxcbiBDYXBpdGEgRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnY2hhcnRBcmVhLndpZHRoJzogJzEwMCUnXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgICBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddID0nZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAjZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX2V4cGVuZGl0dXJlc19wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnRXhwLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3RvdGFsX2V4cGVuZGl0dXJlc19wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhIFxcbiBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddID0nZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgU3RhdGVtZW50cydcbiAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgIGggPSAnJ1xuICAgICAgICAgICNoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgICBoICs9IHJlbmRlcl9maW5hbmNpYWxfZmllbGRzIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMsIHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZSddXG4gICAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICAgI3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZVxuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLXJldmVudWUtcGllJ11cbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2F0ZWdvcnlfbmFtZSBpcyBcIlJldmVudWVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBSZXZlbnVlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWVzJ1xuICAgICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxNlxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6IDM1MFxuICAgICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA2MFxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxuICAgICAgICAgICAgICAgICAgJ2ZvcmNlSUZyYW1lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYSc6e1xuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodDonNzUlJ1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddID0ndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJFeHBlbmRpdHVyZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIEV4cGVuZGl0dXJlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ10gPSd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgZWxzZVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cblxuICAgIGxheW91dF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtdGVtcGxhdGUnXShkZXRhaWxfZGF0YSlcbiAgcmV0dXJuIHRlbXBsYXRlc1sndGFicGFuZWwtdGVtcGxhdGUnXShsYXlvdXRfZGF0YSlcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG4jIGNvbnZlcnRzIHRhYiB0ZW1wbGF0ZSBkZXNjcmliZWQgaW4gZ29vZ2xlIGZ1c2lvbiB0YWJsZSB0b1xuIyB0YWIgdGVtcGxhdGVcbmNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlPSh0ZW1wbCkgLT5cbiAgdGFiX2hhc2g9e31cbiAgdGFicz1bXVxuICAjIHJldHVybnMgaGFzaCBvZiBmaWVsZCBuYW1lcyBhbmQgdGhlaXIgcG9zaXRpb25zIGluIGFycmF5IG9mIGZpZWxkIG5hbWVzXG4gIGdldF9jb2xfaGFzaCA9IChjb2x1bW5zKSAtPlxuICAgIGNvbF9oYXNoID17fVxuICAgIGNvbF9oYXNoW2NvbF9uYW1lXT1pIGZvciBjb2xfbmFtZSxpIGluIHRlbXBsLmNvbHVtbnNcbiAgICByZXR1cm4gY29sX2hhc2hcblxuICAjIHJldHVybnMgZmllbGQgdmFsdWUgYnkgaXRzIG5hbWUsIGFycmF5IG9mIGZpZWxkcywgYW5kIGhhc2ggb2YgZmllbGRzXG4gIHZhbCA9IChmaWVsZF9uYW1lLCBmaWVsZHMsIGNvbF9oYXNoKSAtPlxuICAgIGZpZWxkc1tjb2xfaGFzaFtmaWVsZF9uYW1lXV1cblxuICAjIGNvbnZlcnRzIGhhc2ggdG8gYW4gYXJyYXkgdGVtcGxhdGVcbiAgaGFzaF90b19hcnJheSA9KGhhc2gpIC0+XG4gICAgYSA9IFtdXG4gICAgZm9yIGsgb2YgaGFzaFxuICAgICAgdGFiID0ge31cbiAgICAgIHRhYi5uYW1lPWtcbiAgICAgIHRhYi5maWVsZHM9aGFzaFtrXVxuICAgICAgYS5wdXNoIHRhYlxuICAgIHJldHVybiBhXG5cblxuICBjb2xfaGFzaCA9IGdldF9jb2xfaGFzaCh0ZW1wbC5jb2xfaGFzaClcbiAgcGxhY2Vob2xkZXJfY291bnQgPSAwXG5cbiAgZm9yIHJvdyxpIGluIHRlbXBsLnJvd3NcbiAgICBjYXRlZ29yeSA9IHZhbCAnZ2VuZXJhbF9jYXRlZ29yeScsIHJvdywgY29sX2hhc2hcbiAgICAjdGFiX2hhc2hbY2F0ZWdvcnldPVtdIHVubGVzcyB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICBmaWVsZG5hbWUgPSB2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXG4gICAgaWYgbm90IGZpZWxkbmFtZSB0aGVuIGZpZWxkbmFtZSA9IFwiX1wiICsgU3RyaW5nICsrcGxhY2Vob2xkZXJfY291bnRcbiAgICBmaWVsZE5hbWVzW3ZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hdPXZhbCAnZGVzY3JpcHRpb24nLCByb3csIGNvbF9oYXNoXG4gICAgZmllbGROYW1lc0hlbHBbZmllbGRuYW1lXSA9IHZhbCAnaGVscF90ZXh0Jywgcm93LCBjb2xfaGFzaFxuICAgIGlmIGNhdGVnb3J5XG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0/PVtdXG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0ucHVzaCBuOiB2YWwoJ24nLCByb3csIGNvbF9oYXNoKSwgbmFtZTogZmllbGRuYW1lLCBtYXNrOiB2YWwoJ21hc2snLCByb3csIGNvbF9oYXNoKVxuXG4gIGNhdGVnb3JpZXMgPSBPYmplY3Qua2V5cyh0YWJfaGFzaClcbiAgY2F0ZWdvcmllc19zb3J0ID0ge31cbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNcbiAgICBpZiBub3QgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XVxuICAgICAgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5XVswXS5uXG4gICAgZmllbGRzID0gW11cbiAgICBmb3Igb2JqIGluIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgICAgZmllbGRzLnB1c2ggb2JqXG4gICAgZmllbGRzLnNvcnQgKGEsYikgLT5cbiAgICAgIHJldHVybiBhLm4gLSBiLm5cbiAgICB0YWJfaGFzaFtjYXRlZ29yeV0gPSBmaWVsZHNcblxuICBjYXRlZ29yaWVzX2FycmF5ID0gW11cbiAgZm9yIGNhdGVnb3J5LCBuIG9mIGNhdGVnb3JpZXNfc29ydFxuICAgIGNhdGVnb3JpZXNfYXJyYXkucHVzaCBjYXRlZ29yeTogY2F0ZWdvcnksIG46IG5cbiAgY2F0ZWdvcmllc19hcnJheS5zb3J0IChhLGIpIC0+XG4gICAgcmV0dXJuIGEubiAtIGIublxuXG4gIHRhYl9uZXdoYXNoID0ge31cbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNfYXJyYXlcbiAgICB0YWJfbmV3aGFzaFtjYXRlZ29yeS5jYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeS5jYXRlZ29yeV1cblxuICB0YWJzID0gaGFzaF90b19hcnJheSh0YWJfbmV3aGFzaClcbiAgcmV0dXJuIHRhYnNcblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcbiAgQHRlbXBsYXRlcyA9IHVuZGVmaW5lZFxuICBAZGF0YSA9IHVuZGVmaW5lZFxuICBAZXZlbnRzID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG4gICAgQGV2ZW50cyA9IHt9XG4gICAgdGVtcGxhdGVMaXN0ID0gWyd0YWJwYW5lbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJywgJ3RhYmRldGFpbC1vZmZpY2lhbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnLCAncGVyc29uLWluZm8tdGVtcGxhdGUnXVxuICAgIHRlbXBsYXRlUGFydGlhbHMgPSBbJ3RhYi10ZW1wbGF0ZSddXG4gICAgQHRlbXBsYXRlcyA9IHt9XG4gICAgZm9yIHRlbXBsYXRlLGkgaW4gdGVtcGxhdGVMaXN0XG4gICAgICBAdGVtcGxhdGVzW3RlbXBsYXRlXSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG4gICAgZm9yIHRlbXBsYXRlLGkgaW4gdGVtcGxhdGVQYXJ0aWFsc1xuICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwodGVtcGxhdGUsICQoJyMnICsgdGVtcGxhdGUpLmh0bWwoKSlcblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgcGFyZW50OnRoaXNcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICBAcGFyZW50LmRhdGEgPSBkYXRcbiAgICAgICAgcmVuZGVyX3RhYnMobGF5b3V0X2pzb24sIGRhdCwgdGhpcywgQHBhcmVudClcbiAgICAgIGJpbmQ6ICh0cGxfbmFtZSwgY2FsbGJhY2spIC0+XG4gICAgICAgIGlmIG5vdCBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0gPSBbY2FsbGJhY2tdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0ucHVzaCBjYWxsYmFja1xuICAgICAgYWN0aXZhdGU6ICh0cGxfbmFtZSkgLT5cbiAgICAgICAgaWYgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgZm9yIGUsaSBpbiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICAgIGUgdHBsX25hbWUsIEBwYXJlbnQuZGF0YVxuXG4gIGxvYWRfdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0ZW1wbGF0ZV9qc29uKVxuXG4gIGxvYWRfZnVzaW9uX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIGFzeW5jOiBmYWxzZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIHQgPSBjb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZSB0ZW1wbGF0ZV9qc29uXG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdClcblxuXG4gIGdldF9uYW1lczogLT5cbiAgICAodC5uYW1lIGZvciB0IGluIEBsaXN0KVxuXG4gIGdldF9pbmRleF9ieV9uYW1lOiAobmFtZSkgLT5cbiAgICBmb3IgdCxpIGluIEBsaXN0XG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZSB0aGVuIGlcbiAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICBpZiAoaW5kIGlzIC0xKSB0aGVuIHJldHVybiAgXCJcIlxuXG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgcmV0dXJuIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiXCJcblxuICBhY3RpdmF0ZTogKGluZCwgdHBsX25hbWUpIC0+XG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgQGxpc3RbaW5kXS5hY3RpdmF0ZSB0cGxfbmFtZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiIsIiQgLT5cbiAgIyQoJyNnZXRXaWtpcGVkaWFBcnRpY2xlQnV0dG9uJykub24gJ2NsaWNrJywgLT5cbiAgIyAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgI2FsZXJ0YWxlcnQgXCJoaVwiXG4gICNhbGVydCAkKFwiI3dpa2lwZWRpYVBhZ2VOYW1lXCIpLnRleHQoKVxuICAjZ2V0X3dpa2lwZWRpYV9hcnRpY2xlKClcbiAgd2luZG93LmdldF93aWtpcGVkaWFfYXJ0aWNsZSA9IGdldF93aWtpcGVkaWFfYXJ0aWNsZVxuICB3aW5kb3cuY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlID0gY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlXG5cbmdldF93aWtpcGVkaWFfYXJ0aWNsZT0ocyktPlxuICBhcnRpY2xlX25hbWUgPSBzLnJlcGxhY2UgLy4qXFwvKFteL10qKSQvLCBcIiQxXCJcbiAgJC5nZXRKU09OIFwiaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1wYXJzZSZwYWdlPSN7YXJ0aWNsZV9uYW1lfSZwcm9wPXRleHQmZm9ybWF0PWpzb24mY2FsbGJhY2s9P1wiLCAoanNvbikgLT4gXG4gICAgJCgnI3dpa2lwZWRpYVRpdGxlJykuaHRtbCBqc29uLnBhcnNlLnRpdGxlXG4gICAgJCgnI3dpa2lwZWRpYUFydGljbGUnKS5odG1sIGpzb24ucGFyc2UudGV4dFtcIipcIl1cbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImE6bm90KC5yZWZlcmVuY2VzIGEpXCIpLmF0dHIgXCJocmVmXCIsIC0+ICBcImh0dHA6Ly93d3cud2lraXBlZGlhLm9yZ1wiICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYVwiKS5hdHRyIFwidGFyZ2V0XCIsIFwiX2JsYW5rXCJcbiAgXG5jcmVhdGVfd2lraXBlZGlhX2FydGljbGU9IC0+XG4gIGFsZXJ0IFwiTm90IGltcGxlbWVudGVkXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXRfd2lraXBlZGlhX2FydGljbGU6Z2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4iXX0=

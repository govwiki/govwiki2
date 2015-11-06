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
    var cluster, options;
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
    cluster = new MarkerClusterer(map, [], options);

    /*
      Set custom calculator function
     */
    return cluster;
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
    map.markerClusterer.repaint();
    return console.log(map.markerClusterer);
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
    title: "" + rec.altType,
    type: rec.altType
  });
  marker.addListener('click', function() {
    return window.location = rec.altTypeSlug + "/" + rec.slug;
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
          url: "/api/government" + url,
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
    url: "/api/government" + window.path,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFFZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLGNBQUEsRUFBZ0IsS0FOaEI7RUFPQSxVQUFBLEVBQVksS0FQWjtFQVFBLGNBQUEsRUFBZ0IsS0FSaEI7RUFTQSxXQUFBLEVBQWEsSUFUYjtFQVVBLGtCQUFBLEVBQ0U7SUFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFwQztHQVhGO0VBWUEsZUFBQSxFQUFpQixTQUFDLEdBQUQ7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c291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJib3VuZHNfdGltZW91dD11bmRlZmluZWRcblxubWFwID0gbmV3IEdNYXBzXG4gIGVsOiAnI2dvdm1hcCdcbiAgbGF0OiAzNy4zXG4gIGxuZzogLTExOS4zXG4gIHpvb206IDZcbiAgbWluWm9vbTogNlxuICBzY3JvbGx3aGVlbDogdHJ1ZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgcGFuQ29udHJvbDogZmFsc2VcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHpvb21Db250cm9sOiB0cnVlXG4gIHpvb21Db250cm9sT3B0aW9uczpcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxuICBtYXJrZXJDbHVzdGVyZXI6IChtYXApIC0+XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIHRleHRTaXplOiAxNFxuICAgICAgdGV4dENvbG9yOiAncmVkJ1xuICAgICAgZ3JpZFNpemU6IDBcbiAgICAgIG1pbmltdW1DbHVzdGVyU2l6ZTogNSAjIEFsbG93IG1pbmltdW0gNSBtYXJrZXIgaW4gY2x1c3Rlci5cbiAgICAgIGlnbm9yZUhpZGRlbjogdHJ1ZSAjIERvbid0IHNob3cgaGlkZGVuIG1hcmtlcnMuIEluIHNvbWUgcmVhc29uIGRvbid0IHdvcmsgOihcbiAgICAgIGxlZ2VuZDpcbiAgICAgICAgXCJDaXR5XCIgOiBcInJlZFwiXG4gICAgICAgIFwiU2Nob29sIERpc3RyaWN0XCIgOiBcImJsdWVcIlxuICAgICAgICBcIlNwZWNpYWwgRGlzdHJpY3RcIiA6IFwicHVycGxlXCJcbiAgICB9XG4gICAgY2x1c3RlciA9IG5ldyBNYXJrZXJDbHVzdGVyZXIobWFwLCBbXSwgb3B0aW9ucyk7XG4gICAgIyMjXG4gICAgICBTZXQgY3VzdG9tIGNhbGN1bGF0b3IgZnVuY3Rpb25cbiAgICAjIyNcbiMgICAgY2x1c3Rlci5zZXRDYWxjdWxhdG9yIChtYXJrZXJzLCBudW1TdHlsZXMpIC0+XG4jICAgICAgI1xuIyAgICAgICMgQ291bnQgYWxsIG1hcmtlcnMgYWx0VHlwZXMuXG4jICAgICAgI1xuIyAgICAgIGFsdFR5cGVzQ291bnQgPSBbXTtcbiMgICAgICBmb3IgbWFya2VyIGluIG1hcmtlcnNcbiMgICAgICAgIGlmICEgYWx0VHlwZXNDb3VudFttYXJrZXIudHlwZV0gdGhlbiBhbHRUeXBlc0NvdW50W21hcmtlci50eXBlXSA9IDBcbiMgICAgICAgIGFsdFR5cGVzQ291bnRbbWFya2VyLnR5cGVdKytcbiNcbiMgICAgICBpbmRleCA9IDA7XG4jICAgICAgY291bnQgPSBtYXJrZXJzLmxlbmd0aDtcbiMgICAgICBkdiA9IGNvdW50O1xuIyAgICAgIHdoaWxlIChkdiAhPSAwKVxuIyAgICAgICAgZHYgPSBwYXJzZUludChkdiAvIDEwLCAxMClcbiMgICAgICAgIGluZGV4KytcbiNcbiMgICAgICBpbmRleCA9IE1hdGgubWluKGluZGV4LCBudW1TdHlsZXMpO1xuI1xuIyAgICAgICNcbiMgICAgICAjIFByZXBhcmUgY2x1c3RlciB0b29sdGlwLlxuIyAgICAgICNcbiMgICAgICB0b29sdGlwID0gJydcbiMgICAgICBmb3IgdHlwZSx2YWx1ZSBvZiBhbHRUeXBlc0NvdW50XG4jICAgICAgICB0b29sdGlwICs9IFwiI3t0eXBlfTogI3t2YWx1ZX1cXG5cIlxuI1xuIyAgICAgIGNvbnNvbGUubG9nIHRvb2x0aXBcbiNcbiMgICAgICByZXR1cm4ge1xuIyAgICAgICAgdGV4dDogY291bnRcbiMgICAgICAgIGluZGV4OiBpbmRleCArIDFcbiMgICAgICAgIHRpdGxlOiB0b29sdGlwXG4jICAgICAgfTtcblxuICAgIHJldHVybiBjbHVzdGVyO1xuXG5tYXAubWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5SSUdIVF9UT1BdLnB1c2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2VuZCcpKVxuXG5yZXJlbmRlcl9tYXJrZXJzID0gLT5cbiAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gR09WV0lLSS5tYXJrZXJzXG5cbnJlYnVpbGRfZmlsdGVyID0gLT5cbiAgaGFyZF9wYXJhbXMgPSBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnLCAnQ291bnR5J11cbiAgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiA9IFtdXG4gICQoJy50eXBlX2ZpbHRlcicpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgIGlmICQoZWxlbWVudCkuYXR0cignbmFtZScpIGluIGhhcmRfcGFyYW1zIGFuZCAkKGVsZW1lbnQpLnZhbCgpID09ICcxJ1xuICAgICAgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMi5wdXNoICQoZWxlbWVudCkuYXR0cignbmFtZScpXG5cbiMgbGVnZW5kVHlwZSA9IGNpdHksIHNjaG9vbCBkaXN0cmljdCwgc3BlY2lhbCBkaXN0cmljdCwgY291bnRpZXNcbmdldF9yZWNvcmRzMiA9IChsZWdlbmRUeXBlLCBvbnN1Y2Nlc3MpIC0+XG4gICQuYWpheFxuICAgIHVybDpcIi9hcGkvZ292ZXJubWVudC9nZXQtbWFya2Vycy1kYXRhXCJcbiMgICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUsIGxpbWl0OiA1MDAwIH1cbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuJCAtPlxuXG4gIHJlYnVpbGRfZmlsdGVyKClcbiAgZ2V0X3JlY29yZHMyIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzIsIChkYXRhKSAtPlxuICAgIEdPVldJS0kubWFya2VycyA9IGRhdGE7XG4gICAgcmVyZW5kZXJfbWFya2VycygpXG5cbiAgJCgnI2xlZ2VuZCBsaTpub3QoLmNvdW50aWVzLXRyaWdnZXIpJykub24gJ2NsaWNrJywgLT5cbiAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAgIGhpZGRlbl9maWVsZCA9ICQodGhpcykuZmluZCgnaW5wdXQnKVxuICAgIHZhbHVlID0gaGlkZGVuX2ZpZWxkLnZhbCgpXG4gICAgaGlkZGVuX2ZpZWxkLnZhbChpZiB2YWx1ZSA9PSAnMScgdGhlbiAnMCcgZWxzZSAnMScpXG4gICAgI1xuICAgICMgQ2xpY2tlZCBsZWdlbmQgYWx0IHR5cGUuXG4gICAgYWx0VHlwZSA9IGhpZGRlbl9maWVsZC5hdHRyKCduYW1lJylcblxuICAgIHJlYnVpbGRfZmlsdGVyKClcblxuICAgICNcbiAgICAjIFRvZ2dsZSBtYXJrZXIgdmlzaWJsZSB3aXRoIHR5cGUgZXF1YWwgdG8gY2xpY2tlZCBsZWdlbmQuXG4gICAgI1xuICAgIGZvciBtYXJrZXIgaW4gbWFwLm1hcmtlcnNcbiAgICAgIGlmIG1hcmtlci50eXBlIGlzIGFsdFR5cGVcbiAgICAgICAgIyBSZW1vdmV8YWRkIG1hcmtlcnMgZnJvbSBjbHVzdGVyIGJlY2F1c2UgTWFya2VyQ2x1c3RlciBpZ25vcmVcbiAgICAgICAgIyBoaXMgb3B0aW9uICdpZ25vcmVIaWRkZW4nLlxuICAgICAgICBpZiAodmFsdWUgaXMgJzEnKVxuICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVtb3ZlTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIuYWRkTWFya2VyKG1hcmtlciwgdHJ1ZSlcbiMgICAgICAgIG1hcmtlci5zZXRWaXNpYmxlKCEgbWFya2VyLmdldFZpc2libGUoKSlcblxuICAgIG1hcC5tYXJrZXJDbHVzdGVyZXIucmVwYWludCgpO1xuICAgIGNvbnNvbGUubG9nKG1hcC5tYXJrZXJDbHVzdGVyZXIpO1xuXG4gICQoJyNsZWdlbmQgbGkuY291bnRpZXMtdHJpZ2dlcicpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdhY3RpdmUnKVxuICAgICAgI1xuICAgICAgIyBTaG93IGNvdW50aWVzLlxuICAgICAgI1xuICAgICAgZm9yIHBvbHlnb24gaW4gbWFwLnBvbHlnb25zXG4gICAgICAgIHBvbHlnb24uc2V0VmlzaWJsZSh0cnVlKVxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgSGlkZSBjb3VudGllcy5cbiAgICAgICNcbiAgICAgIGZvciBwb2x5Z29uIGluIG1hcC5wb2x5Z29uc1xuICAgICAgICBwb2x5Z29uLnNldFZpc2libGUoZmFsc2UpXG5cblxuXG5cblxuZ2V0X2ljb24gPShhbHRfdHlwZSkgLT5cblxuICBfY2lyY2xlID0oY29sb3IpLT5cbiAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRVxuICAgIGZpbGxPcGFjaXR5OiAxXG4gICAgZmlsbENvbG9yOiBjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOiAnd2hpdGUnXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXG4gICAgc2NhbGU6IDZcblxuICBzd2l0Y2ggYWx0X3R5cGVcbiAgICB3aGVuICdDaXR5JyB0aGVuIHJldHVybiBfY2lyY2xlICdyZWQnXG4gICAgd2hlbiAnU2Nob29sIERpc3RyaWN0JyB0aGVuIHJldHVybiBfY2lyY2xlICdibHVlJ1xuICAgIHdoZW4gJ1NwZWNpYWwgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3B1cnBsZSdcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcblxuaW5fYXJyYXkgPSAobXlfaXRlbSwgbXlfYXJyYXkpIC0+XG4gIGZvciBpdGVtIGluIG15X2FycmF5XG4gICAgcmV0dXJuIHRydWUgaWYgaXRlbSA9PSBteV9pdGVtXG4gIGZhbHNlXG5cblxuYWRkX21hcmtlciA9IChyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIGV4aXN0ID0gaW5fYXJyYXkgcmVjLmFsdFR5cGUsIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzJcbiAgaWYgZXhpc3QgaXMgZmFsc2UgdGhlbiByZXR1cm4gZmFsc2VcblxuICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhyZWMubGF0aXR1ZGUsIHJlYy5sb25naXR1ZGUpXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4jICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIixcbiAgICB0aXRsZTogXCIje3JlYy5hbHRUeXBlfVwiXG4gICAgI1xuICAgICMgRm9yIGxlZ2VuZCBjbGljayBoYW5kbGVyLlxuICAgIHR5cGU6IHJlYy5hbHRUeXBlXG4gIH0pXG4gICNcbiAgIyBPbiBjbGljayByZWRpcmVjdCB1c2VyIHRvIGVudGl0eSBwYWdlLlxuICAjXG4gIG1hcmtlci5hZGRMaXN0ZW5lciAnY2xpY2snLCAoKSAtPlxuICAgIHdpbmRvdy5sb2NhdGlvbiA9IFwiI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9XCJcbiAgbWFwLmFkZE1hcmtlciBtYXJrZXJcblxuIyAgbWFwLmFkZE1hcmtlclxuIyAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuIyAgICBsbmc6IHJlYy5sb25naXR1ZGVcbiMgICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4jICAgIHRpdGxlOiAgXCIje3JlYy5uYW1lfSwgI3tyZWMudHlwZX1cIlxuIyAgICBpbmZvV2luZG93OlxuIyAgICAgIGNvbnRlbnQ6IFwiXG4jICAgICAgICA8ZGl2PjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnIGNsYXNzPSdpbmZvLXdpbmRvdy11cmknIGRhdGEtdXJpPScvI3tyZWMuYWx0VHlwZVNsdWd9LyN7cmVjLnNsdWd9Jz48c3Ryb25nPiN7cmVjLm5hbWV9PC9zdHJvbmc+PC9hPjwvZGl2PlxuIyAgICAgICAgPGRpdj4gI3tyZWMudHlwZX0gICN7cmVjLmNpdHl9ICN7cmVjLnppcH0gI3tyZWMuc3RhdGV9PC9kaXY+XCJcblxuXG5cbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIG1hcDogbWFwXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgICNAZ292c19hcnJheSA9IGdvdnNcbiAgICBAZ292c19hcnJheSA9IGdvdnMucmVjb3JkXG4gICAgJCgnLnR5cGVhaGVhZCcpLmtleXVwIChldmVudCkgPT5cbiAgICAgIEBlbnRlcmVkX3ZhbHVlID0gJChldmVudC50YXJnZXQpLnZhbCgpXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgLCAxMDAwXG5cbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAgIGNsYXNzTmFtZXM6XG4gICAgICAgIFx0bWVudTogJ3R0LWRyb3Bkb3duLW1lbnUnXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAjICQoJy5nb3YtY291bnRlcicpLnRleHQgQGNvdW50X2dvdnMoKVxuICAgIHJldHVyblxuXG5cblxuXG5cbm1vZHVsZS5leHBvcnRzPUdvdlNlbGVjdG9yXG5cblxuXG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbiNfanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xud2lraXBlZGlhID0gcmVxdWlyZSAnLi93aWtpcGVkaWEuY29mZmVlJ1xuXG5nb3ZtYXAgPSBudWxsXG5nb3Zfc2VsZWN0b3IgPSBudWxsXG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYiA9IFwiXCJcbnVuZGVmID0gbnVsbFxuYXV0aG9yaXplZCA9IGZhbHNlXG4jXG4jIEluZm9ybWF0aW9uIGFib3V0IGN1cnJlbnQgdXNlci5cbiNcbnVzZXIgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4jXG4jIElzc3VlcyBjYXRlZ29yeSwgZmlsbCBpbiBlbGVjdGVkIG9mZmljaWFsIHBhZ2UuXG4jXG5jYXRlZ29yaWVzID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyICdpZl9lcScsIChhLCBiLCBvcHRzKSAtPlxuICAgIGlmIGBhID09IGJgXG4gICAgICAgIHJldHVybiBvcHRzLmZuIHRoaXNcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBvcHRzLmludmVyc2UgdGhpc1xuXG53aW5kb3cuR09WV0lLSSA9XG4gICAgc3RhdGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXJfMjogWydDaXR5JywgJ1NjaG9vbCBEaXN0cmljdCcsICdTcGVjaWFsIERpc3RyaWN0J11cblxuICAgIHNob3dfc2VhcmNoX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICAgICBmb2N1c19zZWFyY2hfZmllbGQgNTAwXG5cbiAgICBzaG93X2RhdGFfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG5cbkdPVldJS0kuZ2V0X2NvdW50aWVzID0gZ2V0X2NvdW50aWVzID0gKGNhbGxiYWNrKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICcvbGVnYWN5L2RhdGEvY291bnR5X2dlb2dyYXBoeV9jYV8yLmpzb24nXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGNvdW50aWVzSlNPTikgLT5cbiAgICAgICAgICAgIGNhbGxiYWNrIGNvdW50aWVzSlNPTlxuXG5HT1ZXSUtJLmRyYXdfcG9seWdvbnMgPSBkcmF3X3BvbHlnb25zID0gKGNvdW50aWVzSlNPTikgLT5cbiAgICBmb3IgY291bnR5IGluIGNvdW50aWVzSlNPTi5mZWF0dXJlc1xuICAgICAgICBkbyAoY291bnR5KSA9PlxuICAgICAgICAgICAgZ292bWFwLm1hcC5kcmF3UG9seWdvbih7XG4gICAgICAgICAgICAgICAgcGF0aHM6IGNvdW50eS5nZW9tZXRyeS5jb29yZGluYXRlc1xuICAgICAgICAgICAgICAgIHVzZUdlb0pTT046IHRydWVcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyM4MDgwODAnXG4gICAgICAgICAgICAgICAgc3Ryb2tlT3BhY2l0eTogMC42XG4gICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAxLjVcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICcjRkYwMDAwJ1xuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjE1XG4gICAgICAgICAgICAgICAgY291bnR5SWQ6IGNvdW50eS5wcm9wZXJ0aWVzLl9pZFxuICAgICAgICAgICAgICAgIGFsdE5hbWU6IGNvdW50eS5wcm9wZXJ0aWVzLmFsdF9uYW1lXG4gICAgICAgICAgICAgICAgbWFya2VyOiBuZXcgTWFya2VyV2l0aExhYmVsKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMCwgMCksXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlT25EcmFnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBnb3ZtYXAubWFwLm1hcCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDb250ZW50OiBjb3VudHkucHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbEFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KC0xNSwgMjUpLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENsYXNzOiBcImxhYmVsLXRvb2x0aXBcIixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHlsZToge29wYWNpdHk6IDEuMH0sXG4gICAgICAgICAgICAgICAgICAgIGljb246IFwiaHR0cDovL3BsYWNlaG9sZC5pdC8xeDFcIixcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIG1vdXNlb3ZlcjogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiIzAwRkYwMFwifSlcbiAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IChldmVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0UG9zaXRpb24oZXZlbnQubGF0TG5nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKHRydWUpXG4gICAgICAgICAgICAgICAgbW91c2VvdXQ6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiNGRjAwMDBcIn0pXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUoZmFsc2UpXG4gICAgICAgICAgICAgICAgY2xpY2s6IC0+XG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICB1cmkgPSBcIi8je2NvdW50eS5hbHRfdHlwZV9zbHVnfS8je2NvdW50eS5wcm9wZXJ0aWVzLnNsdWd9XCJcbiAgICAgICAgICAgICAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcbiAgICAgICAgICAgIH0pXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPSAobmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XG4gICAgYWN0aXZlX3RhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd0YWJuYW1lJylcbiAgICBjb25zb2xlLmxvZyBhY3RpdmVfdGFiXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAkKCQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgdGVtcGxhdGVzLmFjdGl2YXRlIDAsIGFjdGl2ZV90YWJcblxuICAgIGlmIGFjdGl2ZV90YWIgPT0gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gMFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgyICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgzICsgMjcpXG5cbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxuXG5hY3RpdmF0ZV90YWIgPSAoKSAtPlxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxuIyBjbGVhciB3aWtpcGVkaWEgcGxhY2VcbiAgICAkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKFwiXCIpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICBnZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgZGF0YS5faWQsIChkYXRhMiwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMgPSBkYXRhMlxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YTNcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldF9tYXhfcmFua3MgKG1heF9yYW5rc19yZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjVE9ETzogRW5hYmxlIGFmdGVyIHJlYWxpemUgbWF4X3JhbmtzIGFwaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG5cbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcbiAgICAgICAgICAgICN3cG4gPSBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICAgICAgICAgICMkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKGlmIHdwbiB0aGVuIHdwbiBlbHNlIFwiTm8gV2lraXBlZGlhIGFydGljbGVcIilcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzkvYXBpL2dvdmVybm1lbnQvXCIgKyBhbHRfdHlwZSArICcvJyArIGdvdl9uYW1lXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvX3Byb2MvZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzXCJcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiBcImdvdndpa2lcIlxuICAgICAgICAgICAgb3JkZXI6IFwiY2FwdGlvbl9jYXRlZ29yeSxkaXNwbGF5X29yZGVyXCJcbiAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ292c19pZFwiXG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZTogXCJJTlwiXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxuICAgICAgICAgICAgXVxuXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfbWF4X3JhbmtzID0gKG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6ICdnb3Z3aWtpJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCA9IChyZWMpPT5cbiAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICBhY3RpdmF0ZV90YWIoKVxuICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIHJvdXRlci5uYXZpZ2F0ZShyZWMuX2lkKVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkMiA9IChyZWMpPT5cbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICByZWMuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9IHVybFxuXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcbiAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXNcbiAgICAgICAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgdmFsdWVzLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgICBzICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBzZWxlY3QgPSAkKHMpXG4gICAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG5cbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgICBpZiB0ZXh0IGlzICdTdGF0ZS4uJ1xuICAgICAgICBzZWxlY3QudmFsICdDQSdcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xuXG4gICAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgaW5wID0gJCgnI215aW5wdXQnKVxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxuICAgIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cbnN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgICQod2luZG93KS5yZXNpemUgLT5cbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcblxuXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoZSkgLT5cbiAgICBoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBpZiBub3QgaFxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5yb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcblxuR09WV0lLSS5oaXN0b3J5ID0gKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID09IDBcbiAgICAgICAgc2VhcmNoQ29udGFpbmVyID0gJCgnI3NlYXJjaENvbnRhaW5lcicpLnRleHQoKTtcbiAgICAgICAgaWYoc2VhcmNoQ29udGFpbmVyICE9ICcnKVxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4gICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nXG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGhpc3Rvcnkuc3RhdGUgIT0gbnVsbCAmJiBoaXN0b3J5LnN0YXRlLnRlbXBsYXRlICE9IHVuZGVmaW5lZClcbiAgICAgICAgd2luZG93Lmhpc3RvcnkuZ28oaW5kZXgpO1xuICAgIGVsc2VcbiAgICAgICAgcm91dGUucG9wKClcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLycgKyByb3V0ZS5qb2luKCcvJylcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3BvcHN0YXRlJywgKGV2ZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKHdpbmRvdy5oaXN0b3J5LnN0YXRlKVxuICAgIGlmIHdpbmRvdy5oaXN0b3J5LnN0YXRlIGlzbnQgbnVsbFxuICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgZXZlbnQuc3RhdGUudGVtcGxhdGVcbiAgICAgICAgcm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmxlbmd0aC0xO1xuICAgICAgICBpZiByb3V0ZSBpcyAyIHRoZW4gJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGlmIHJvdXRlIGlzIDEgdGhlbiAkKCcjc2VhcmNoQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIGVsc2VcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcbiMgICAgZWxzZVxuIyAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcbnJlZnJlc2hfZGlzcXVzID0gKG5ld0lkZW50aWZpZXIsIG5ld1VybCwgbmV3VGl0bGUpIC0+XG4gICAgRElTUVVTLnJlc2V0XG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiAoKSAtPlxuICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXG4gICAgICAgICAgICB0aGlzLnBhZ2UudGl0bGUgPSBuZXdUaXRsZVxuXG4jXG4jIFNvcnQgdGFibGUgYnkgY29sdW1uLlxuIyBAcGFyYW0gc3RyaW5nIHRhYmxlICBKUXVlcnkgc2VsZWN0b3IuXG4jIEBwYXJhbSBudW1iZXIgY29sTnVtIENvbHVtbiBudW1iZXIuXG4jXG5zb3J0VGFibGUgPSAodGFibGUsIGNvbE51bSkgLT5cbiAgICAjXG4gICAgIyBEYXRhIHJvd3MgdG8gc29ydFxuICAgICNcbiAgICByb3dzID0gJCh0YWJsZSArICcgdGJvZHkgIFtkYXRhLWlkXScpLmdldCgpXG4gICAgI1xuICAgICMgTGFzdCByb3cgd2hpY2ggY29udGFpbnMgXCJBZGQgbmV3IC4uLlwiXG4gICAgI1xuICAgIGxhc3RSb3cgPSAkKHRhYmxlICsgJyB0Ym9keSAgdHI6bGFzdCcpLmdldCgpO1xuICAgICNcbiAgICAjIENsaWNrZWQgY29sdW1uLlxuICAgICNcbiAgICBjb2x1bW4gPSAkKHRhYmxlICsgJyB0Ym9keSB0cjpmaXJzdCcpLmNoaWxkcmVuKCd0aCcpLmVxKGNvbE51bSlcbiAgICBtYWtlU29ydCA9IHRydWVcblxuICAgIGlmIGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgICAgICMgUmVzdG9yZSByb3cgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5hZGRDbGFzcygnb3JpZ2luJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykucmVtb3ZlQ2xhc3MoJ2ljb25fX2JvdHRvbScpLnJlbW92ZUNsYXNzKCdpY29uX190b3AnKVxuICAgICAgcm93cyA9IGNvbHVtbi5kYXRhKCdvcmlnaW4nKVxuICAgICAgbWFrZVNvcnQgPSBmYWxzZTtcbiAgICBlbHNlIGlmIGNvbHVtbi5oYXNDbGFzcygnYXNjJylcbiAgICAgICNcbiAgICAgICMgVGFibGUgY3VycmVudGx5IHNvcnRlZCBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gZGVzYyBvcmRlci5cbiAgICAgICNcbiAgICAgIGNvbHVtbi5yZW1vdmVDbGFzcygnYXNjJykuYWRkQ2xhc3MoJ2Rlc2MnKVxuICAgICAgY29sdW1uLmZpbmQoJ2knKS5yZW1vdmVDbGFzcygnaWNvbl9fYm90dG9tJykuYWRkQ2xhc3MoJ2ljb25fX3RvcCcpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAtMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ29yaWdpbicpXG4gICAgICAjXG4gICAgICAjIE9yaWdpbmFsIHRhYmxlIGRhdGEgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLnJlbW92ZUNsYXNzKCdvcmlnaW4nKS5hZGRDbGFzcygnYXNjJylcbiAgICAgIGNvbHVtbi5maW5kKCdpJykuYWRkQ2xhc3MoJ2ljb25fX2JvdHRvbScpXG4gICAgICBzb3J0RnVuY3Rpb24gPSAoYSwgYikgLT5cbiAgICAgICAgQSA9ICQoYSkuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKS50cmltKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gLTFcbiAgICAgICAgaWYgQSA+IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICByZXR1cm4gMFxuICAgIGVsc2VcbiAgICAgICNcbiAgICAgICMgVGFibGUgbm90IG9yZGVyZWQgeWV0LlxuICAgICAgIyBTdG9yZSBvcmlnaW5hbCBkYXRhIHBvc2l0aW9uIGFuZCBzb3J0IGluIGFzYyBvcmRlci5cbiAgICAgICNcblxuICAgICAgY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgY29sdW1uLmRhdGEoJ29yaWdpbicsIHJvd3Muc2xpY2UoMCkpXG4gICAgICBjb2x1bW4uZmluZCgnaScpLmFkZENsYXNzKCdpY29uX19ib3R0b20nKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKCkudHJpbSgpXG4gICAgICAgIGlmIEEgPCBCIHRoZW4gcmV0dXJuIC0xXG4gICAgICAgIGlmIEEgPiBCIHRoZW4gcmV0dXJuIDFcbiAgICAgICAgcmV0dXJuIDBcblxuICAgIGlmIChtYWtlU29ydCkgdGhlbiByb3dzLnNvcnQgc29ydEZ1bmN0aW9uXG4gICAgJC5lYWNoIHJvd3MsIChpbmRleCwgcm93KSAtPlxuICAgICAgICAkKHRhYmxlKS5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQocm93KVxuICAgICQodGFibGUpLmNoaWxkcmVuKCd0Ym9keScpLmFwcGVuZChsYXN0Um93KVxuXG5pbml0VGFibGVIYW5kbGVycyA9IChwZXJzb24pIC0+XG4gICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoKVxuXG4gICAgJCgnLmVkaXRhYmxlJykuZWRpdGFibGUoe3N0eWxlc2hlZXRzOiBmYWxzZSx0eXBlOiAndGV4dGFyZWEnLCBzaG93YnV0dG9uczogJ2JvdHRvbScsIGRpc3BsYXk6IHRydWUsIGVtcHR5dGV4dDogJyAnfSlcbiAgICAkKCcuZWRpdGFibGUnKS5vZmYoJ2NsaWNrJyk7XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuZ2x5cGhpY29uLXBlbmNpbCcsIChlKSAtPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmIGUuY3VycmVudFRhcmdldC5kYXRhc2V0Lm5vRWRpdGFibGUgaXNudCB1bmRlZmluZWQgdGhlbiByZXR1cm5cbiAgICAgICAgaWYgKCFhdXRob3JpemVkKVxuICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylbMF0uaWQpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpLmF0dHIoJ2RhdGEtaWQnKSlcbiAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCBOdW1iZXIoKCQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpKVswXS5jZWxsSW5kZXgpICsgMSlcbiMgICAgICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9uZXcnLCB7XG4jICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuIyAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlc3BvbnNlKSAtPlxuIyAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDQwMVxuI1xuIyAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiByZXNwb25zZS5zdGF0dXMgaXMgMjAwXG4jICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXplZCA9IHRydWVcbiMgICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG4jICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4jICAgICAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxXG4jICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuIyAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YXJnZXQnLCBlLnRhcmdldClcbiMgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndGFibGVUeXBlJywgJChlLnRhcmdldCkuY2xvc2VzdCgnLnRhYi1wYW5lJylbMF0uaWQpXG4jICAgICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG5cbiAgICAjXG4gICAgIyBBZGQgc29ydCBoYW5kbGVycy5cbiAgICAjXG4gICAgJCgnLnNvcnQnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdHlwZSA9ICQodGhpcykuYXR0cignZGF0YS1zb3J0LXR5cGUnKVxuXG4gICAgICBpZiB0eXBlIGlzICd5ZWFyJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSB5ZWFyLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAwKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICduYW1lJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBuYW1lLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAxKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdhbW91bnQnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGFtb3VudC5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMylcbiAgICAgIGVsc2UgaWYgdHlwZSBpcyAnY29udHJpYnV0b3ItdHlwZSdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgY29udHJpYnV0b3IgdHlwZS5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgNClcblxuICAgICQoJ2EnKS5vbiAnc2F2ZScsIChlLCBwYXJhbXMpIC0+XG4gICAgICAgIGVudGl0eVR5cGUgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGFibGUnKVswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgaWQgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKVswXS5kYXRhc2V0LmlkXG4gICAgICAgIGZpZWxkID0gT2JqZWN0LmtleXMoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJylbMF0uZGF0YXNldClbMF1cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGVkaXRSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogaWQsXG4gICAgICAgICAgICAgICAgY2hhbmdlczoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0LmNoYW5nZXNbZmllbGRdID0gcGFyYW1zLm5ld1ZhbHVlXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0KTtcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9jcmVhdGUnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQvanNvbicsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgdGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICB9XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuYWRkJywgKGUpIC0+XG4gICAgICAgIHRhYlBhbmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgICB0YWJsZVR5cGUgPSB0YWJQYW5lWzBdLmlkXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0gJ3RhYmxlVHlwZScsIHRhYmxlVHlwZVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICBjdXJyZW50RW50aXR5ID0gbnVsbFxuICAgICAgICBjb25zb2xlLmxvZyh0YWJsZVR5cGUpXG4gICAgICAgIGlmIHRhYmxlVHlwZSBpcyAnVm90ZXMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZFZvdGVzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdDb250cmlidXRpb24nXG4gICAgICAgICAgICAkKCcjYWRkQ29udHJpYnV0aW9ucycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdFbmRvcnNlbWVudCdcbiAgICAgICAgICAgICQoJyNhZGRFbmRvcnNlbWVudHMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ1N0YXRlbWVudHMnXG4gICAgICAgICAgICBjdXJyZW50RW50aXR5ID0gJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgICQoJyNhZGRTdGF0ZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgU2V0IGdldCB1cmwgY2FsbGJhY2suXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICQoJy51cmwtaW5wdXQnKS5vbiAna2V5dXAnLCAoKSAtPlxuICAgICAgICAgICAgICBtYXRjaF91cmwgPSAvXFxiKGh0dHBzPyk6XFwvXFwvKFtcXC1BLVowLTkuXSspKFxcL1tcXC1BLVowLTkrJkAjXFwvJT1+X3whOiwuO10qKT8oXFw/W0EtWjAtOSsmQCNcXC8lPX5ffCE6LC47XSopPy9pXG4gICAgICAgICAgICAgIGlmIChtYXRjaF91cmwudGVzdCgkKHRoaXMpLnZhbCgpKSlcbiAgICAgICAgICAgICAgICAkLmFqYXggJy9hcGkvdXJsL2V4dHJhY3QnLCB7XG4gICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICB1cmw6ICQodGhpcykudmFsKCkubWF0Y2gobWF0Y2hfdXJsKVswXVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50ID0gJCgnI3VybC1zdGF0ZW1lbnQnKVxuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBDbGVhci5cbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWJvZHknKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5hdHRyKCdzcmMnLCAnJylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgU2V0IHRpdGxlLlxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC10aXRsZScpLnRleHQocmVzcG9uc2UuZGF0YS50aXRsZSlcblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAnaHRtbCcpXG4gICAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAgICMgSWYgdXJsIHBvaW50IHRvIGh0bWwsIGhpZGUgaW1nIGFuZCBzZXQgYm9keS5cbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1pbWcnKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dChyZXNwb25zZS5kYXRhLmJvZHkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlIGlzICd5b3V0dWJlJylcbiAgICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICAgIyBJZiB1cmwgcG9pbnQgdG8geW91dHViZSwgc2hvdyB5b3V0dWJlIHByZXZpZXcgaW1hZ2UuXG4gICAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgcmVzcG9uc2UuZGF0YS5wcmV2aWV3KVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSBpcyAnaW1hZ2UnKVxuICAgICAgICAgICAgICAgICAgICAgIHVybENvbnRlbnQuZmluZCgnLnVybC1jb250ZW50LWltZycpLmF0dHIoJ3NyYycsIHJlc3BvbnNlLmRhdGEucHJldmlldylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5zbGlkZURvd24oKVxuICAgICAgICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudCA9ICQoJyN1cmwtc3RhdGVtZW50JylcblxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgICMgQ2xlYXIuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtdGl0bGUnKS50ZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LmZpbmQoJy51cmwtY29udGVudC1ib2R5JykudGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtaW1nJykuYXR0cignc3JjJywgJycpXG5cbiAgICAgICAgICAgICAgICAgICAgdXJsQ29udGVudC5maW5kKCcudXJsLWNvbnRlbnQtYm9keScpLnRleHQoZXJyb3IucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgICAgICAgICB1cmxDb250ZW50LnNsaWRlRG93bigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICBpZiB0YWJQYW5lLmhhc0NsYXNzKCdsb2FkZWQnKSB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICB0YWJQYW5lWzBdLmNsYXNzTGlzdC5hZGQoJ2xvYWRlZCcpXG5cbiAgICAgICAgcGVyc29uTWV0YSA9IHtcImNyZWF0ZVJlcXVlc3RcIjp7XCJlbnRpdHlOYW1lXCI6Y3VycmVudEVudGl0eSxcImtub3duRmllbGRzXCI6e1wiZWxlY3RlZE9mZmljaWFsXCI6cGVyc29uLmlkfX19XG4gICAgICAgICQuYWpheChcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L25ldycsXG4gICAgICAgICAgICBkYXRhOiBwZXJzb25NZXRhLFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBlbmRPYmogPSB7fVxuICAgICAgICAgICAgICAgIGRhdGEuY2hvaWNlc1swXS5jaG9pY2VzLmZvckVhY2ggKGl0ZW0sIGluZGV4KSAtPlxuICAgICAgICAgICAgICAgICAgaWRzID0gT2JqZWN0LmtleXMgaXRlbVxuICAgICAgICAgICAgICAgICAgaWRzLmZvckVhY2ggKGlkKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIGVuZE9ialtpZF0gPSBpdGVtW2lkXVxuXG4gICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcyA9ICgpIC0+XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBkYXRhLmNob2ljZXNbMF0ubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgIyBBZGQgZmlyc3QgYmxhbmsgb3B0aW9uLlxuICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsICcnKVxuICAgICAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcbiAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiBlbmRPYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2V0QXR0cmlidXRlKCd2YWx1ZScsIGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGVuZE9ialtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3QuaW5uZXJIVE1MICs9IG9wdGlvbi5vdXRlckhUTUxcblxuICAgICAgICAgICAgICAgIHNlbGVjdCA9IG51bGxcblxuICAgICAgICAgICAgICAgIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0VuZG9yc2VtZW50J1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdDb250cmlidXRpb24nXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkVm90ZXMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLmZpbmQoJ1tkYXRhLXByb3ZpZGU9XCJkYXRlcGlja2VyXCJdJykub24oXG4gICAgICAgICAgICAgICAgICAgICAgJ2NoYW5nZURhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICgpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGVwaWNrZXIgJ2hpZGUnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgICAgICAjIEZpbGwgZWxlY3RlZCBvZmZpY2lhbHMgdm90ZXMgdGFibGUuXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjbGVnaXNsYXRpb24tdm90ZScpLmh0bWwoKSlcbiAgICAgICAgICAgICAgICAgICAgJCgnI2VsZWN0ZWRWb3RlcycpLmh0bWwgY29tcGlsZWRUZW1wbGF0ZShkYXRhKTtcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnUHVibGljU3RhdGVtZW50J1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkU3RhdGVtZW50cyBzZWxlY3QnKVswXVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2FkZFN0YXRlbWVudHMnKS5maW5kKCdbZGF0YS1wcm92aWRlPVwiZGF0ZXBpY2tlclwiXScpLm9uKFxuICAgICAgICAgICAgICAgICAgICAgICdjaGFuZ2VEYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAoKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5kYXRlcGlja2VyICdoaWRlJ1xuICAgICAgICAgICAgICAgICAgICApXG5cbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgaWYoZXJyb3Iuc3RhdHVzID09IDQwMSkgdGhlbiBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICk7XG5cbiAgICB3aW5kb3cuYWRkSXRlbSA9IChlKSAtPlxuICAgICAgICBuZXdSZWNvcmQgPSB7fVxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXG4gICAgICAgIG1vZGFsVHlwZSA9IG1vZGFsWzBdLmlkXG4gICAgICAgIGVudGl0eVR5cGUgPSBtb2RhbFswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgR2V0IHZhbHVlIGZyb20gaW5wdXQgZmllbGRzLlxuICAgICAgICAjIyNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIHRleGFyZWEncy5cbiAgICAgICAgIyMjXG4gICAgICAgIG1vZGFsLmZpbmQoJ3RleHRhcmVhJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICBuZXdSZWNvcmRbZmllbGROYW1lXSA9IGVsZW1lbnQudmFsdWVcblxuICAgICAgICBhc3NvY2lhdGlvbnMgPSB7fVxuICAgICAgICBpZiBtb2RhbFR5cGUgIT0gJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW1wiZWxlY3RlZE9mZmljaWFsXCJdID0gcGVyc29uLmlkXG4gICAgICAgICNcbiAgICAgICAgIyBBcnJheSBvZiBzdWIgZW50aXRpZXMuXG4gICAgICAgICNcbiAgICAgICAgY2hpbGRzID0gW11cblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgQWRkIGluZm9ybWF0aW9uIGFib3V0IHZvdGVzLlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBtb2RhbC5maW5kKCcjZWxlY3RlZFZvdGVzJykuZmluZCgndHJbZGF0YS1lbGVjdGVkXScpLiBlYWNoIChpZHgsIGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoZWxlbWVudClcblxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAjIEdldCBhbGwgc3ViIGVudGl0eSBmaWVsZHMuXG4gICAgICAgICAgICAgICAgI1xuICAgICAgICAgICAgICAgIGRhdGEgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG5cbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3NlbGVjdCcpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlbGVtZW50LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZE5hbWUgPSBPYmplY3Qua2V5cyhlbGVtZW50LmRhdGFzZXQpWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgIEFkZCBvbmx5IGlmIGFsbCBmaWVsZHMgaXMgc2V0LlxuICAgICAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIGlmIE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA9PSAyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkcyA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydmaWVsZHMnXSA9IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgICAgICAgICAgZmllbGRzWydhc3NvY2lhdGlvbnMnXVtlbGVtZW50LmF0dHIoJ2RhdGEtZW50aXR5LXR5cGUnKV0gPSBlbGVtZW50LmF0dHIoJ2RhdGEtZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRW50aXR5TmFtZSA9IGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkuYXR0ciAnZGF0YS1lbnRpdHktdHlwZSdcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCB0eXBlLlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5TmFtZTogY2hpbGRFbnRpdHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENoaWxkIGZpZWxkcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkczogZmllbGRzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VsZWN0ID0gbW9kYWwuZmluZCgnc2VsZWN0JylbMF1cbiAgICAgICAgICAgIHNlbGVjdE5hbWUgPSBzZWxlY3QubmFtZVxuICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XS52YWx1ZVxuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRWYWx1ZSBpcyAnJylcbiAgICAgICAgICAgICAgIyBVc2VyIGRvbid0IHNlbGVjdCBhbnkgdmFsdWUuXG4gICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGxlYXNlIHNlbGVjdCBjYXRlZ29yeS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcblxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkVmFsdWUgaXMgJycpXG4gICAgICAgICAgICAgICMgVXNlciBkb24ndCBzZWxlY3QgYW55IHZhbHVlLlxuICAgICAgICAgICAgICB3aW5kb3cuYWxlcnQoJ1BsZWFzZSBzZWxlY3QgdHlwZS4nKVxuICAgICAgICAgICAgICBzZWxlY3QuZm9jdXMoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpXG4gICAgICAgICAgICBuZXdSZWNvcmRbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFZhbHVlIGlzICcnKVxuICAgICAgICAgICAgICAjIFVzZXIgZG9uJ3Qgc2VsZWN0IGFueSB2YWx1ZS5cbiAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KCdQbGVhc2Ugc2VsZWN0IGNhdGVnb3J5LicpXG4gICAgICAgICAgICAgIHNlbGVjdC5mb2N1cygpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGZpZWxkczogeyBmaWVsZHM6IG5ld1JlY29yZCwgYXNzb2NpYXRpb25zOiBhc3NvY2lhdGlvbnMsIGNoaWxkczogY2hpbGRzfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEFwcGVuZCBuZXcgZW50aXR5IHRvIHRhYmxlLlxuICAgICAgICAjIyNcbiAgICAgICAgcm93VGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJChcIiNyb3ctI3ttb2RhbFR5cGV9XCIpLmh0bWwoKSk7XG5cbiAgICAgICAgI1xuICAgICAgICAjIENvbGxlY3QgZGF0YS5cbiAgICAgICAgI1xuICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgIGRhdGFbJ3VzZXInXSA9IHVzZXIudXNlcm5hbWVcblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIENoZWNrIGlmIHVzZXIgc3BlY2lmaWVkIGhvdyBjdXJyZW50IGVsZWN0ZWQgb2ZmaWNpYWwgdm90ZWQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIG9iaiBpbiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmNoaWxkc1xuICAgICAgICAgICAgICBpZiBOdW1iZXIob2JqLmZpZWxkcy5hc3NvY2lhdGlvbnMuZWxlY3RlZE9mZmljaWFsKSA9PSBOdW1iZXIocGVyc29uLmlkKVxuICAgICAgICAgICAgICAgIGFkZCA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBvYmouZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAjXG4gICAgICAgICAgICAjIElmIHdlIGZvdW5kLCBzaG93LlxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgaWYgKGFkZClcbiAgICAgICAgICAgICAgZGF0YVsnY2F0ZWdvcnknXSA9IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgICAkKCcjVm90ZXMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKVxuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgZGF0YS5jb250cmlidXRvclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgIGRhdGEuY29udHJpYnV0aW9uQW1vdW50ID0gbnVtZXJhbChkYXRhLmNvbnRyaWJ1dGlvbkFtb3VudCkuZm9ybWF0KCcwLDAwMCcpXG4gICAgICAgICAgICAkKCcjQ29udHJpYnV0aW9ucyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgZGF0YS5lbmRvcnNlclR5cGUgPSBzZWxlY3RlZFRleHRcbiAgICAgICAgICAgICQoJyNFbmRvcnNlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSByb3dUZW1wbGF0ZShkYXRhKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gc2VsZWN0ZWRUZXh0XG4gICAgICAgICAgICAkKCcjU3RhdGVtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlIHJvd1RlbXBsYXRlKGRhdGEpO1xuXG4gICAgICAgICMjI1xuICAgICAgICAgIFNlbmQgY3JlYXRlIHJlcXVlc3QgdG8gYXBpLlxuICAgICAgICAjIyNcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L2NyZWF0ZScsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICAjIENsb3NlIG1vZGFsIHdpbmRvd1xuICAgICAgICBtb2RhbC5tb2RhbCAnaGlkZSdcblxuICAgICMjI1xuICAgICAgICBJZiB1c2VyIHRyeSB0byBhZGQgb3IgdXBkYXRlIHNvbWUgZGF0YSB3aXRob3V0IGxvZ2dlZCBpbiwgd2VcbiAgICAgICAgc2hvdyBoaW0gbG9naW4vc2lnbiB1cCB3aW5kb3cuIEFmdGVyIGF1dGhvcml6aW5nIHVzZXIgcmVkaXJlY3QgYmFja1xuICAgICAgICB0byBwYWdlLCB3aGVyZSBoZSBwcmVzIGFkZC9lZGl0IGJ1dHRvbi4gSW4gdGhhdCBjYXNlIHdlIHNob3cgaGltIGFwcHJvcHJpYXRlXG4gICAgICAgIG1vZGFsIHdpbmRvdy5cblxuICAgICAgICBUaW1lb3V0IG5lZWQgYmVjYXVzZSB3ZSBkb24ndCBrbm93IHdoZW4gd2UgZ2V0IHVzZXIgaW5mb3JtYXRpb24gYW5kIGVsZWN0ZWQgb2ZmaWNpYWwgaW5mb3JtYXRpb24uXG4gICAgIyMjXG4gICAgd2luZG93LnNldFRpbWVvdXQoICgpIC0+XG4gICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgIHJldHVyblxuXG4gICAgICB0eXBlID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3RhYmxlVHlwZScpXG4gICAgICBkYXRhSWQgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnZGF0YUlkJylcbiAgICAgIGZpZWxkID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2ZpZWxkJylcblxuICAgICAgaWYgKGRhdGFJZCAmJiBmaWVsZClcbiAgICAgICAgJCgnYVthcmlhLWNvbnRyb2xzPVwiJyArIHR5cGUgKyAnXCJdJykuY2xpY2soKVxuICAgICAgICAkKCd0cltkYXRhLWlkPScrZGF0YUlkKyddJykuZmluZCgndGQ6bnRoLWNoaWxkKCcrZmllbGQrJyknKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAnJylcbiAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2RhdGFJZCcsICcnKVxuICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnZmllbGQnLCAnJylcblxuICAgICAgZWxzZSBpZiAodHlwZSlcbiAgICAgICAgJCgnZGl2IycgKyB0eXBlKS5maW5kKCcuYWRkJykuY2xpY2soKVxuICAgICAgICAkKCdhW2FyaWEtY29udHJvbHM9XCInICsgdHlwZSArICdcIl0nKS5jbGljaygpXG4gICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0YWJsZVR5cGUnLCAnJylcbiAgICAsXG4gICAgMjAwMFxuICAgIClcblxuXG4jIyNcbiAgQXBwZW5kIGNyZWF0ZSByZXF1ZXN0cyB0byBhbGwgY3VycmVudCBlbGVjdGVkT2ZmaWNpYWwgcGFnZS5cbiMjI1xuc2hvd0NyZWF0ZVJlcXVlc3RzID0gKHBlcnNvbiwgY3JlYXRlUmVxdWVzdHMpIC0+XG4gICAgIyBEb24ndCBzaG93IG5vdCBhcHByb3ZlZCBjcmVhdGUgcmVxdWVzdCB0byBhbm9uLlxuICAgIGlmICghYXV0aG9yaXplZCkgdGhlbiByZXR1cm5cblxuICAgIGxlZ2lzbGF0aW9uUm93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkVm90ZXMnKS5odG1sKCkpXG4gICAgY29udHJpYnV0aW9uUm93ID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyNyb3ctYWRkQ29udHJpYnV0aW9ucycpLmh0bWwoKSlcbiAgICBlbmRvcnNlbWVudFJvdyA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjcm93LWFkZEVuZG9yc2VtZW50cycpLmh0bWwoKSlcbiAgICBzdGF0ZW1lbnRSb3cgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI3Jvdy1hZGRTdGF0ZW1lbnRzJykuaHRtbCgpKVxuXG4gICAgZm9yIHJlcXVlc3QgaW4gY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgI1xuICAgICAgICAjIFByZXBhcmUgY3JlYXRlIHJlcXVlc3QgZGF0YSBmb3IgdGVtcGxhdGUuXG4gICAgICAgICNcbiAgICAgICAgZGF0YSA9IHJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICBkYXRhWyd1c2VyJ10gPSByZXF1ZXN0LnVzZXIudXNlcm5hbWVcblxuICAgICAgICAjXG4gICAgICAgICMgRmluZCBvdXQgdGVtcGxhdGUgZm9yIGN1cnJlbnQgcmVxdWVzdCBhbmQgYWRkaXRpb25hbCB2YWx1ZXMuXG4gICAgICAgICNcbiAgICAgICAgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIkxlZ2lzbGF0aW9uXCJcbiAgICAgICAgICAgIG5hbWUgPSAnVm90ZXMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGxlZ2lzbGF0aW9uUm93XG4gICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiByZXF1ZXN0LmZpZWxkcy5jaGlsZHNbMF0uZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gY2F0ZWdvcmllc1tyZXF1ZXN0LmZpZWxkcy5hc3NvY2lhdGlvbnMuaXNzdWVDYXRlZ29yeSAtIDFdLm5hbWVcblxuICAgICAgICBlbHNlIGlmIHJlcXVlc3QuZW50aXR5X25hbWUgaXMgXCJDb250cmlidXRpb25cIlxuICAgICAgICAgICAgbmFtZSA9ICdDb250cmlidXRpb25zJ1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBjb250cmlidXRpb25Sb3dcblxuICAgICAgICAgICAgZGF0YVsnY29udHJpYnV0aW9uQW1vdW50J10gPSBudW1lcmFsKGRhdGFbJ2NvbnRyaWJ1dGlvbkFtb3VudCddKS5mb3JtYXQoJzAsMDAwJylcbiAgICAgICAgZWxzZSBpZiByZXF1ZXN0LmVudGl0eV9uYW1lIGlzIFwiRW5kb3JzZW1lbnRcIlxuICAgICAgICAgICAgbmFtZSA9ICdFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IGVuZG9yc2VtZW50Um93XG4gICAgICAgIGVsc2UgaWYgcmVxdWVzdC5lbnRpdHlfbmFtZSBpcyBcIlB1YmxpY1N0YXRlbWVudFwiXG4gICAgICAgICAgICBuYW1lID0gJ1N0YXRlbWVudHMnXG4gICAgICAgICAgICB0ZW1wbGF0ZSA9IHN0YXRlbWVudFJvd1xuXG4gICAgICAgICAgICBkYXRhWydjYXRlZ29yeSddID0gY2F0ZWdvcmllc1tyZXF1ZXN0LmZpZWxkcy5hc3NvY2lhdGlvbnMuaXNzdWVDYXRlZ29yeSAtIDFdLm5hbWVcblxuICAgICAgICAkKFwiXFwjI3tuYW1lfSB0cjpsYXN0LWNoaWxkXCIpLmJlZm9yZSh0ZW1wbGF0ZShkYXRhKSlcblxuJCgnI2RhdGFDb250YWluZXInKS5vbiAnY2xpY2snLCAnLmVsZWN0ZWRfbGluaycsIChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB1cmwgPSBlLmN1cnJlbnRUYXJnZXQucGF0aG5hbWVcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICBqUXVlcnkuZ2V0IHVybCwge30sIChkYXRhKSAtPlxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgICAgICAgICAgcGVyc29uID0gZGF0YS5wZXJzb25cbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUmVxdWVzdHMgPSBkYXRhLmNyZWF0ZVJlcXVlc3RzXG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcblxuICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgICAgICBGb3JtYXQgY29udHJpYnV0aW9uIGFtb3VudC5cbiAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICAgIGZvciBjb250cmlidXRpb24gaW4gcGVyc29uLmNvbnRyaWJ1dGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50ID0gbnVtZXJhbChjb250cmlidXRpb24uY29udHJpYnV0aW9uX2Ftb3VudCkuZm9ybWF0KCcwLDAwMCcpXG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICQuaXNFbXB0eU9iamVjdChwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuY3NzKHtcInRleHRBbGlnblwiOlwiY2VudGVyXCJ9KVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0ID0ge3llYXI6ICdudW1lcmljJywgbW9udGg6ICdudW1lcmljJywgZGF5OiAnbnVtZXJpYyd9O1xuICAgICAgICAgICAgICAgICAgICBwZXJzb24udm90ZXMuZm9yRWFjaCAoaXRlbSwgaXRlbUxpc3QpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcgJ2VuLVVTJywgZm9ybWF0XG5cbiAgICAgICAgICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUodHBsKVxuICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBjb21waWxlZFRlbXBsYXRlKHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogaHRtbH0sICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcycsIHVybFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICAgICAgICAgIGluaXRUYWJsZUhhbmRsZXJzKHBlcnNvbik7XG4gICAgICAgICAgICAgICAgICAgIHNob3dDcmVhdGVSZXF1ZXN0cyhwZXJzb24sIGNyZWF0ZVJlcXVlc3RzKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbiMgUm91dGUgL1xuaWYgcm91dGVUeXBlIGlzIDBcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICBnb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnL2xlZ2FjeS9kYXRhL2hfdHlwZXNfY2FfMi5qc29uJywgN1xuICAgIGdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICB1cmwgPSAnLycgKyBkYXRhLmFsdFR5cGVTbHVnICsgJy8nICsgZGF0YS5zbHVnXG4gICAgICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAgICAgJC5hamF4XG4jICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmwsXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgICBpZiAhdW5kZWZcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwgJCgnI3NlYXJjaC1jb250YWluZXItdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgIyBMb2FkIGludHJvZHVjdG9yeSB0ZXh0IGZyb20gdGV4dHMvaW50cm8tdGV4dC5odG1sIHRvICNpbnRyby10ZXh0IGNvbnRhaW5lci5cbiAgICAgICAgJC5nZXQgXCIvbGVnYWN5L3RleHRzL2ludHJvLXRleHQuaHRtbFwiLCAoZGF0YSkgLT4gJChcIiNpbnRyby10ZXh0XCIpLmh0bWwgZGF0YVxuICAgICAgICBnb3ZtYXAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4gICAgICAgIGdldF9jb3VudGllcyBHT1ZXSUtJLmRyYXdfcG9seWdvbnNcbiAgICAgICAgdW5kZWYgPSB0cnVlXG4gICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcbiAgICBzdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJCgnI2dvdm1hcCcpLm9uICdjbGljaycsICcuaW5mby13aW5kb3ctdXJpJywgKGUpIC0+XG4gICAgICAgIHVyaSA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC51cmlcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQuYWpheFxuIyAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICBzdWNjZXNzOiAoZ292cykgLT5cbiAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJpXG5cbiMgUm91dGUgLzphbHRfbmFtZS86Y2l0eV9uYW1lXG5pZiByb3V0ZVR5cGUgaXMgMlxuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBDaXZpYyBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICB0ZW1wbGF0ZXMubG9hZF9mdXNpb25fdGVtcGxhdGUgXCJ0YWJzXCIsIFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZnVzaW9udGFibGVzL3YyL3F1ZXJ5P3NxbD1TRUxFQ1QlMjAqJTIwRlJPTSUyMDF6Mm9YUUVZUTNwMk9vTUk4VjVnS2dIV0I1VHo5OTBCclExeGMxdFZvJmtleT1BSXphU3lDWERReU1EcEdBMmczUWp1djRDRHY3elJqLWl4NElRSkFcIlxuICAgICQuYWpheFxuIyAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIHVybDogXCIvYXBpL2dvdmVybm1lbnRcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDNcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcIi9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGEucGVyc29uXG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0cyA9IGRhdGEuY3JlYXRlUmVxdWVzdHNcbiAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBkYXRhLmNhdGVnb3JpZXNcblxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIEZvcm1hdCBjb250cmlidXRpb24gYW1vdW50LlxuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICBmb3IgY29udHJpYnV0aW9uIGluIHBlcnNvbi5jb250cmlidXRpb25zXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9hbW91bnQgPSBudW1lcmFsKGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25fYW1vdW50KS5mb3JtYXQoJzAsMDAwJylcblxuICAgICAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuXG4gICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBmb3JtYXQgPSB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJ307XG4gICAgICAgICAgICBpZiBwZXJzb24udm90ZXMgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQ7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS50b0xvY2FsZVN0cmluZyAnZW4tVVMnLCBmb3JtYXRcblxuICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG5cbiAgICAgICAgICAgIGh0bWwgPSBjb21waWxlZFRlbXBsYXRlKHBlcnNvbilcblxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGh0bWxcblxuICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uKTtcbiAgICAgICAgICAgIHNob3dDcmVhdGVSZXF1ZXN0cyhwZXJzb24sIGNyZWF0ZVJlcXVlc3RzKTtcblxuICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xuICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcblxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiQgLT5cbiAgIyMjXG4gICAgR2V0IGN1cnJlbnQgdXNlci5cbiAgIyMjXG4gICR1c2VyQnRuID0gJCgnI3VzZXInKVxuICAkdXNlckJ0bkxpbmsgPSAkdXNlckJ0bi5maW5kKCdhJyk7XG4gICQuYWpheCAnL2FwaS91c2VyJywge1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgYXN5bmM6IGZhbHNlLFxuICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgIHVzZXIudXNlcm5hbWUgPSByZXNwb25zZS51c2VybmFtZTtcbiAgICAgIGF1dGhvcml6ZWQgPSB0cnVlO1xuXG4gICAgICAkdXNlclRleHQgPSAkKCcjdXNlci10ZXh0JykuZmluZCgnYScpO1xuICAgICAgJHVzZXJUZXh0Lmh0bWwoXCJMb2dnZWQgaW4gYXMgI3t1c2VyLnVzZXJuYW1lfVwiICsgJHVzZXJUZXh0Lmh0bWwoKSlcbiAgICAgICR1c2VyQnRuTGluay5odG1sKFwiU2lnbiBPdXRcIiArICR1c2VyQnRuTGluay5odG1sKCkpLmNsaWNrICgpIC0+XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9ICcvbG9nb3V0J1xuXG4gICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDEgdGhlbiBhdXRob3JpemVkID0gZmFsc2VcbiAgICAgICR1c2VyQnRuTGluay5odG1sKFwiTG9naW4gLyBTaWduIFVwXCIgKyAkdXNlckJ0bkxpbmsuaHRtbCgpKS5jbGljayAoKSAtPlxuICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gIH1cbiIsIlxuXG5cbiMgVGFrZXMgYW4gYXJyYXkgb2YgZG9jcyB0byBzZWFyY2ggaW4uXG4jIFJldHVybnMgYSBmdW5jdGlvbnMgdGhhdCB0YWtlcyAyIHBhcmFtcyBcbiMgcSAtIHF1ZXJ5IHN0cmluZyBhbmQgXG4jIGNiIC0gY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiMgY2IgcmV0dXJucyBhbiBhcnJheSBvZiBtYXRjaGluZyBkb2N1bWVudHMuXG4jIG11bV9pdGVtcyAtIG1heCBudW1iZXIgb2YgZm91bmQgaXRlbXMgdG8gc2hvd1xuUXVlcnlNYXRoZXIgPSAoZG9jcywgbnVtX2l0ZW1zPTUpIC0+XG4gIChxLCBjYikgLT5cbiAgICB0ZXN0X3N0cmluZyA9KHMsIHJlZ3MpIC0+XG4gICAgICAoaWYgbm90IHIudGVzdChzKSB0aGVuIHJldHVybiBmYWxzZSkgIGZvciByIGluIHJlZ3NcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBbd29yZHMscmVnc10gPSBnZXRfd29yZHNfcmVncyBxXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgIyBpdGVyYXRlIHRocm91Z2ggdGhlIHBvb2wgb2YgZG9jcyBhbmQgZm9yIGFueSBzdHJpbmcgdGhhdFxuICAgICMgY29udGFpbnMgdGhlIHN1YnN0cmluZyBgcWAsIGFkZCBpdCB0byB0aGUgYG1hdGNoZXNgIGFycmF5XG5cbiAgICBmb3IgZCBpbiBkb2NzXG4gICAgICBpZiBtYXRjaGVzLmxlbmd0aCA+PSBudW1faXRlbXMgdGhlbiBicmVha1xuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcblxuICAgICAgaWYgdGVzdF9zdHJpbmcoZC5nb3ZfbmFtZSwgcmVncykgXG4gICAgICAgIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICAgICNpZiB0ZXN0X3N0cmluZyhcIiN7ZC5nb3ZfbmFtZX0gI3tkLnN0YXRlfSAje2QuZ292X3R5cGV9ICN7ZC5pbmNfaWR9XCIsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaScpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FU1xuZmllbGROYW1lcyA9IHt9XG5maWVsZE5hbWVzSGVscCA9IHt9XG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0gKG4sbWFzayxkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbm90IGRhdGFbbl1cbiAgICByZXR1cm4gJydcblxuICBpZiBuID09IFwid2ViX3NpdGVcIlxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXG4gIGVsc2VcbiAgICBpZiAnJyAhPSBtYXNrXG4gICAgICBpZiBkYXRhW24rJ19yYW5rJ10gYW5kIGRhdGEubWF4X3JhbmtzIGFuZCBkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXVxuICAgICAgICB2ID0gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICAgICAgcmV0dXJuIFwiI3t2fSA8c3BhbiBjbGFzcz0ncmFuayc+KCN7ZGF0YVtuKydfcmFuayddfSBvZiAje2RhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddfSk8L3NwYW4+XCJcbiAgICAgIGlmIG4gPT0gXCJudW1iZXJfb2ZfZnVsbF90aW1lX2VtcGxveWVlc1wiXG4gICAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdCgnMCwwJylcbiAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgIGVsc2VcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwib3Blbl9lbnJvbGxtZW50X3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwicGFyZW50X3RyaWdnZXJfZWxpZ2libGVfc2Nob29sc1wiXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxuICAgICAgZWxzZVxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDIxXG4gICAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDIxKVxuICAgICAgICBlbHNlXG4gICAgICAgIHJldHVybiB2XG5cblxucmVuZGVyX2ZpZWxkX25hbWVfaGVscCA9IChmTmFtZSkgLT5cbiAgI2lmIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuICAgIHJldHVybiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICBpZiBcIl9cIiA9PSBzdWJzdHIgZk5hbWUsIDAsIDFcbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4mbmJzcDs8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICByZXR1cm4gJycgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyAgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PGRpdj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG5yZW5kZXJfc3ViaGVhZGluZyA9IChmTmFtZSwgbWFzaywgbm90Rmlyc3QpLT5cbiAgcyA9ICcnXG4gIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZk5hbWVcbiAgaWYgbWFzayA9PSBcImhlYWRpbmdcIlxuICAgIGlmIG5vdEZpcnN0ICE9IDBcbiAgICAgIHMgKz0gXCI8YnIvPlwiXG4gICAgcyArPSBcIjxkaXY+PHNwYW4gY2xhc3M9J2YtbmFtJz4je2ZOYW1lfTwvc3Bhbj48c3BhbiBjbGFzcz0nZi12YWwnPiA8L3NwYW4+PC9kaXY+XCJcbiAgcmV0dXJuIHNcblxucmVuZGVyX2ZpZWxkcyA9IChmaWVsZHMsZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgZm9yIGZpZWxkLGkgaW4gZmllbGRzXG4gICAgaWYgKHR5cGVvZiBmaWVsZCBpcyBcIm9iamVjdFwiKVxuICAgICAgaWYgZmllbGQubWFzayA9PSBcImhlYWRpbmdcIlxuICAgICAgICBoICs9IHJlbmRlcl9zdWJoZWFkaW5nKGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGkpXG4gICAgICAgIGZWYWx1ZSA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBkYXRhXG4gICAgICAgIGlmICgnJyAhPSBmVmFsdWUgYW5kIGZWYWx1ZSAhPSAnMCcpXG4gICAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZC5uYW1lXG4gICAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmaWVsZC5uYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmVmFsdWUgPSAnJ1xuXG4gICAgZWxzZVxuICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLCAnJywgZGF0YVxuICAgICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZFxuICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZOYW1lXG4gICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZk5hbWUsIHZhbHVlOiBmVmFsdWUsIGhlbHA6IGZOYW1lSGVscClcbiAgcmV0dXJuIGhcblxucmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgPSAoZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgbWFzayA9ICcwLDAnXG4gIGNhdGVnb3J5ID0gJydcbiAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgZm9yIGZpZWxkIGluIGRhdGFcbiAgICBpZiBjYXRlZ29yeSAhPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBjYXRlZ29yeSA9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGlmIGNhdGVnb3J5ID09ICdPdmVydmlldydcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgIGVsc2UgaWYgY2F0ZWdvcnkgPT0gJ1JldmVudWVzJ1xuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSBcIjxiPlwiICsgdGVtcGxhdGUobmFtZTogY2F0ZWdvcnksIGdlbmZ1bmQ6IFwiR2VuZXJhbCBGdW5kXCIsIG90aGVyZnVuZHM6IFwiT3RoZXIgRnVuZHNcIiwgdG90YWxmdW5kczogXCJUb3RhbCBHb3YuIEZ1bmRzXCIpICsgXCI8L2I+XCJcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuXG4gICAgaWYgZmllbGQuY2FwdGlvbiA9PSAnR2VuZXJhbCBGdW5kIEJhbGFuY2UnIG9yIGZpZWxkLmNhcHRpb24gPT0gJ0xvbmcgVGVybSBEZWJ0J1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICBlbHNlIGlmIGZpZWxkLmNhcHRpb24gaW4gWydUb3RhbCBSZXZlbnVlcycsICdUb3RhbCBFeHBlbmRpdHVyZXMnLCAnU3VycGx1cyAvIChEZWZpY2l0KSddIG9yIGlzX2ZpcnN0X3Jvd1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgICAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2spLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaykpXG4gIHJldHVybiBoXG5cbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvW1xcc1xcK1xcLV0vZywgJ18nKVxuXG50b1RpdGxlQ2FzZSA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlIC9cXHdcXFMqL2csICh0eHQpIC0+XG4gICAgdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG5cbmN1cnJlbmN5ID0gKG4sIG1hc2ssIHNpZ24gPSAnJykgLT5cbiAgICBuID0gbnVtZXJhbChuKVxuICAgIGlmIG4gPCAwXG4gICAgICAgIHMgPSBuLmZvcm1hdChtYXNrKS50b1N0cmluZygpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoLy0vZywgJycpXG4gICAgICAgIHJldHVybiBcIigje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytzKyc8L3NwYW4+J30pXCJcblxuICAgIG4gPSBuLmZvcm1hdChtYXNrKVxuICAgIHJldHVybiBcIiN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK24rJzwvc3Bhbj4nfVwiXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhLCB0YWJzZXQsIHBhcmVudCkgLT5cbiAgI2xheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gIGxheW91dCA9IGluaXRpYWxfbGF5b3V0XG4gIHRlbXBsYXRlcyA9IHBhcmVudC50ZW1wbGF0ZXNcbiAgcGxvdF9oYW5kbGVzID0ge31cblxuICBsYXlvdXRfZGF0YSA9XG4gICAgdGl0bGU6IGRhdGEubmFtZVxuICAgIHdpa2lwZWRpYV9wYWdlX2V4aXN0czogZGF0YS53aWtpcGVkaWFfcGFnZV9leGlzdHNcbiAgICB3aWtpcGVkaWFfcGFnZV9uYW1lOiAgZGF0YS53aWtpcGVkaWFfcGFnZV9uYW1lXG4gICAgdHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWU6IGRhdGEudHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWVcbiAgICBsYXRlc3RfYXVkaXRfdXJsOiBkYXRhLmxhdGVzdF9hdWRpdF91cmxcbiAgICB0YWJzOiBbXVxuICAgIHRhYmNvbnRlbnQ6ICcnXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGxheW91dF9kYXRhLnRhYnMucHVzaFxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgZGV0YWlsX2RhdGEgPVxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcbiAgICAgIHRhYmNvbnRlbnQ6ICcnXG4gICAgc3dpdGNoIHRhYi5uYW1lXG4gICAgICB3aGVuICdPdmVydmlldyArIEVsZWN0ZWQgT2ZmaWNpYWxzJ1xuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgICBmb3Igb2ZmaWNpYWwsaSBpbiBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzXG4gICAgICAgICAgb2ZmaWNpYWxfZGF0YSA9XG4gICAgICAgICAgICB0aXRsZTogaWYgJycgIT0gb2ZmaWNpYWwudGl0bGUgdGhlbiBcIlRpdGxlOiBcIiArIG9mZmljaWFsLnRpdGxlXG4gICAgICAgICAgICBuYW1lOiBpZiAnJyAhPSBvZmZpY2lhbC5mdWxsX25hbWUgdGhlbiBcIk5hbWU6IFwiICsgb2ZmaWNpYWwuZnVsbF9uYW1lXG4gICAgICAgICAgICBlbWFpbDogaWYgb2ZmaWNpYWwuZW1haWxfYWRkcmVzcyB0aGVuIFwiRW1haWw6IFwiICsgb2ZmaWNpYWwuZW1haWxfYWRkcmVzc1xuICAgICAgICAgICAgdGVsZXBob25lbnVtYmVyOiBpZiBudWxsICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgYW5kIHVuZGVmaW5lZCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIHRoZW4gXCJUZWxlcGhvbmUgTnVtYmVyOiBcIiArIG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXJcbiAgICAgICAgICAgIHRlcm1leHBpcmVzOiBpZiBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgdGhlbiBcIlRlcm0gRXhwaXJlczogXCIgKyBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgZWxzZSBcIlRlcm0gRXhwaXJlczogXCJcbiAgICAgICAgICAgIGFsdFR5cGVTbHVnOiBkYXRhLmFsdF90eXBlX3NsdWdcbiAgICAgICAgICAgIG5hbWVTbHVnOiBkYXRhLnNsdWdcbiAgICAgICAgICAgIHNsdWc6IG9mZmljaWFsLnNsdWdcblxuICAgICAgICAgIGlmICcnICE9IG9mZmljaWFsLnBob3RvX3VybCBhbmQgb2ZmaWNpYWwucGhvdG9fdXJsICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnPGltZyBzcmM9XCInK29mZmljaWFsLnBob3RvX3VybCsnXCIgY2xhc3M9XCJwb3J0cmFpdFwiIGFsdD1cIlwiIC8+J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJydcblxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnXShvZmZpY2lhbF9kYXRhKVxuICAgICAgd2hlbiAnRW1wbG95ZWUgQ29tcGVuc2F0aW9uJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzQwXG4gICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDQ3MFxuXG4gICAgICAgICAgaWYgJCh3aW5kb3cpLndpZHRoKCkgPCA0OTBcbiAgICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIENvbXBlbnNhdGlvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0JlbnMuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnXFxuIEVtcGxveWVlcydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnQWxsIFxcbicgKyB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnIFxcbiBSZXNpZGVudHMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDIpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgQ29tcGVuc2F0aW9uIC0gRnVsbCBUaW1lIFdvcmtlcnM6IFxcbiBHb3Zlcm5tZW50IHZzLiBQcml2YXRlIFNlY3RvcidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLWNvbXAtZ3JhcGgnXSA9J21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3BlbnNpb25fMzBfeWVhcl9yZXRpcmVlJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIFBlbnNpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnUGVuc2lvbiBmb3IgXFxuIFJldGlyZWUgdy8gMzAgWWVhcnMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fcGVuc2lvbjMwX3llYXJfcmV0aXJlZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgUGVuc2lvbidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnYmFyJzoge1xuICAgICAgICAgICAgICAgICAnZ3JvdXBXaWR0aCc6ICczMCUnXG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLXBlbnNpb24tZ3JhcGgnXSA9J21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIEhlYWx0aCdcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAjcHVibGljIHNhZmV0eSBwaWVcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQdWJsaWMgU2FmZXR5IEV4cGVuc2UnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnUHVibGljIFNhZmV0eSBFeHAnXG4gICAgICAgICAgICAgICAgICAxIC0gZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdPdGhlcidcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidQdWJsaWMgc2FmZXR5IGV4cGVuc2UnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnc2xpY2VzJzogeyAxOiB7b2Zmc2V0OiAwLjJ9fVxuICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNDVcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSA9J3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAjZmluLWhlYWx0aC1yZXZlbnVlIGdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgI2NvbnNvbGUubG9nICcjIyNhbCcrSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1Jldi4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBSZXZlbnVlIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gUmV2ZW51ZSBQZXIgXFxuIENhcGl0YSBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICAgIFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gPSdmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXG4gICAgICAgICNmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaFxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdFeHAuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVG90YWwgRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEgXFxuIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnY2hhcnRBcmVhLndpZHRoJzogJzEwMCUnXG4gICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gPSdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgaCA9ICcnXG4gICAgICAgICAgI2ggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICAgIGggKz0gcmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cywgdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJ11cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgICAjdGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiUmV2ZW51ZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIFJldmVudWVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3RvdGFsLXJldmVudWUtcGllJ10gPSd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ11cbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2F0ZWdvcnlfbmFtZSBpcyBcIkV4cGVuZGl0dXJlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgRXhwZW5kaXR1cmVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxNlxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6IDM1MFxuICAgICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA2MFxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxuICAgICAgICAgICAgICAgICAgJ2ZvcmNlSUZyYW1lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYSc6e1xuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodDonNzUlJ1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXSA9J3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXG4gICAgICBlbHNlXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuXG4gICAgbGF5b3V0X2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC10ZW1wbGF0ZSddKGRldGFpbF9kYXRhKVxuICByZXR1cm4gdGVtcGxhdGVzWyd0YWJwYW5lbC10ZW1wbGF0ZSddKGxheW91dF9kYXRhKVxuXG5cbmdldF9sYXlvdXRfZmllbGRzID0gKGxhKSAtPlxuICBmID0ge31cbiAgZm9yIHQgaW4gbGFcbiAgICBmb3IgZmllbGQgaW4gdC5maWVsZHNcbiAgICAgIGZbZmllbGRdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfcmVjb3JkX2ZpZWxkcyA9IChyKSAtPlxuICBmID0ge31cbiAgZm9yIGZpZWxkX25hbWUgb2YgclxuICAgIGZbZmllbGRfbmFtZV0gPSAxXG4gIHJldHVybiBmXG5cbmdldF91bm1lbnRpb25lZF9maWVsZHMgPSAobGEsIHIpIC0+XG4gIGxheW91dF9maWVsZHMgPSBnZXRfbGF5b3V0X2ZpZWxkcyBsYVxuICByZWNvcmRfZmllbGRzID0gZ2V0X3JlY29yZF9maWVsZHMgclxuICB1bm1lbnRpb25lZF9maWVsZHMgPSBbXVxuICB1bm1lbnRpb25lZF9maWVsZHMucHVzaChmKSBmb3IgZiBvZiByZWNvcmRfZmllbGRzIHdoZW4gbm90IGxheW91dF9maWVsZHNbZl1cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cbiMgY29udmVydHMgdGFiIHRlbXBsYXRlIGRlc2NyaWJlZCBpbiBnb29nbGUgZnVzaW9uIHRhYmxlIHRvXG4jIHRhYiB0ZW1wbGF0ZVxuY29udmVydF9mdXNpb25fdGVtcGxhdGU9KHRlbXBsKSAtPlxuICB0YWJfaGFzaD17fVxuICB0YWJzPVtdXG4gICMgcmV0dXJucyBoYXNoIG9mIGZpZWxkIG5hbWVzIGFuZCB0aGVpciBwb3NpdGlvbnMgaW4gYXJyYXkgb2YgZmllbGQgbmFtZXNcbiAgZ2V0X2NvbF9oYXNoID0gKGNvbHVtbnMpIC0+XG4gICAgY29sX2hhc2ggPXt9XG4gICAgY29sX2hhc2hbY29sX25hbWVdPWkgZm9yIGNvbF9uYW1lLGkgaW4gdGVtcGwuY29sdW1uc1xuICAgIHJldHVybiBjb2xfaGFzaFxuXG4gICMgcmV0dXJucyBmaWVsZCB2YWx1ZSBieSBpdHMgbmFtZSwgYXJyYXkgb2YgZmllbGRzLCBhbmQgaGFzaCBvZiBmaWVsZHNcbiAgdmFsID0gKGZpZWxkX25hbWUsIGZpZWxkcywgY29sX2hhc2gpIC0+XG4gICAgZmllbGRzW2NvbF9oYXNoW2ZpZWxkX25hbWVdXVxuXG4gICMgY29udmVydHMgaGFzaCB0byBhbiBhcnJheSB0ZW1wbGF0ZVxuICBoYXNoX3RvX2FycmF5ID0oaGFzaCkgLT5cbiAgICBhID0gW11cbiAgICBmb3IgayBvZiBoYXNoXG4gICAgICB0YWIgPSB7fVxuICAgICAgdGFiLm5hbWU9a1xuICAgICAgdGFiLmZpZWxkcz1oYXNoW2tdXG4gICAgICBhLnB1c2ggdGFiXG4gICAgcmV0dXJuIGFcblxuXG4gIGNvbF9oYXNoID0gZ2V0X2NvbF9oYXNoKHRlbXBsLmNvbF9oYXNoKVxuICBwbGFjZWhvbGRlcl9jb3VudCA9IDBcblxuICBmb3Igcm93LGkgaW4gdGVtcGwucm93c1xuICAgIGNhdGVnb3J5ID0gdmFsICdnZW5lcmFsX2NhdGVnb3J5Jywgcm93LCBjb2xfaGFzaFxuICAgICN0YWJfaGFzaFtjYXRlZ29yeV09W10gdW5sZXNzIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgIGZpZWxkbmFtZSA9IHZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hcbiAgICBpZiBub3QgZmllbGRuYW1lIHRoZW4gZmllbGRuYW1lID0gXCJfXCIgKyBTdHJpbmcgKytwbGFjZWhvbGRlcl9jb3VudFxuICAgIGZpZWxkTmFtZXNbdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaF09dmFsICdkZXNjcmlwdGlvbicsIHJvdywgY29sX2hhc2hcbiAgICBmaWVsZE5hbWVzSGVscFtmaWVsZG5hbWVdID0gdmFsICdoZWxwX3RleHQnLCByb3csIGNvbF9oYXNoXG4gICAgaWYgY2F0ZWdvcnlcbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XT89W11cbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XS5wdXNoIG46IHZhbCgnbicsIHJvdywgY29sX2hhc2gpLCBuYW1lOiBmaWVsZG5hbWUsIG1hc2s6IHZhbCgnbWFzaycsIHJvdywgY29sX2hhc2gpXG5cbiAgY2F0ZWdvcmllcyA9IE9iamVjdC5rZXlzKHRhYl9oYXNoKVxuICBjYXRlZ29yaWVzX3NvcnQgPSB7fVxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc1xuICAgIGlmIG5vdCBjYXRlZ29yaWVzX3NvcnRbY2F0ZWdvcnldXG4gICAgICBjYXRlZ29yaWVzX3NvcnRbY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnldWzBdLm5cbiAgICBmaWVsZHMgPSBbXVxuICAgIGZvciBvYmogaW4gdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgICBmaWVsZHMucHVzaCBvYmpcbiAgICBmaWVsZHMuc29ydCAoYSxiKSAtPlxuICAgICAgcmV0dXJuIGEubiAtIGIublxuICAgIHRhYl9oYXNoW2NhdGVnb3J5XSA9IGZpZWxkc1xuXG4gIGNhdGVnb3JpZXNfYXJyYXkgPSBbXVxuICBmb3IgY2F0ZWdvcnksIG4gb2YgY2F0ZWdvcmllc19zb3J0XG4gICAgY2F0ZWdvcmllc19hcnJheS5wdXNoIGNhdGVnb3J5OiBjYXRlZ29yeSwgbjogblxuICBjYXRlZ29yaWVzX2FycmF5LnNvcnQgKGEsYikgLT5cbiAgICByZXR1cm4gYS5uIC0gYi5uXG5cbiAgdGFiX25ld2hhc2ggPSB7fVxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc19hcnJheVxuICAgIHRhYl9uZXdoYXNoW2NhdGVnb3J5LmNhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5LmNhdGVnb3J5XVxuXG4gIHRhYnMgPSBoYXNoX3RvX2FycmF5KHRhYl9uZXdoYXNoKVxuICByZXR1cm4gdGFic1xuXG5cbmNsYXNzIFRlbXBsYXRlczJcblxuICBAbGlzdCA9IHVuZGVmaW5lZFxuICBAdGVtcGxhdGVzID0gdW5kZWZpbmVkXG4gIEBkYXRhID0gdW5kZWZpbmVkXG4gIEBldmVudHMgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cbiAgICBAZXZlbnRzID0ge31cbiAgICB0ZW1wbGF0ZUxpc3QgPSBbJ3RhYnBhbmVsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnLCAndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1lbXBsb3llZS1jb21wLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZScsICdwZXJzb24taW5mby10ZW1wbGF0ZSddXG4gICAgdGVtcGxhdGVQYXJ0aWFscyA9IFsndGFiLXRlbXBsYXRlJ11cbiAgICBAdGVtcGxhdGVzID0ge31cbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZUxpc3RcbiAgICAgIEB0ZW1wbGF0ZXNbdGVtcGxhdGVdID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyMnICsgdGVtcGxhdGUpLmh0bWwoKSlcbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZVBhcnRpYWxzXG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCh0ZW1wbGF0ZSwgJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuXG4gIGFkZF90ZW1wbGF0ZTogKGxheW91dF9uYW1lLCBsYXlvdXRfanNvbikgLT5cbiAgICBAbGlzdC5wdXNoXG4gICAgICBwYXJlbnQ6dGhpc1xuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIEBwYXJlbnQuZGF0YSA9IGRhdFxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0LCB0aGlzLCBAcGFyZW50KVxuICAgICAgYmluZDogKHRwbF9uYW1lLCBjYWxsYmFjaykgLT5cbiAgICAgICAgaWYgbm90IEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXSA9IFtjYWxsYmFja11cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXS5wdXNoIGNhbGxiYWNrXG4gICAgICBhY3RpdmF0ZTogKHRwbF9uYW1lKSAtPlxuICAgICAgICBpZiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICBmb3IgZSxpIGluIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgICAgZSB0cGxfbmFtZSwgQHBhcmVudC5kYXRhXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG5cbiAgbG9hZF9mdXNpb25fdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgdCA9IGNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlIHRlbXBsYXRlX2pzb25cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lIHRoZW4gaVxuICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcIlxuXG4gIGFjdGl2YXRlOiAoaW5kLCB0cGxfbmFtZSkgLT5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICBAbGlzdFtpbmRdLmFjdGl2YXRlIHRwbF9uYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIiwiJCAtPlxuICAjJCgnI2dldFdpa2lwZWRpYUFydGljbGVCdXR0b24nKS5vbiAnY2xpY2snLCAtPlxuICAjICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAjYWxlcnRhbGVydCBcImhpXCJcbiAgI2FsZXJ0ICQoXCIjd2lraXBlZGlhUGFnZU5hbWVcIikudGV4dCgpXG4gICNnZXRfd2lraXBlZGlhX2FydGljbGUoKVxuICB3aW5kb3cuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlID0gZ2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4gIHdpbmRvdy5jcmVhdGVfd2lraXBlZGlhX2FydGljbGUgPSBjcmVhdGVfd2lraXBlZGlhX2FydGljbGVcblxuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlPShzKS0+XG4gIGFydGljbGVfbmFtZSA9IHMucmVwbGFjZSAvLipcXC8oW14vXSopJC8sIFwiJDFcIlxuICAkLmdldEpTT04gXCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXBhcnNlJnBhZ2U9I3thcnRpY2xlX25hbWV9JnByb3A9dGV4dCZmb3JtYXQ9anNvbiZjYWxsYmFjaz0/XCIsIChqc29uKSAtPiBcbiAgICAkKCcjd2lraXBlZGlhVGl0bGUnKS5odG1sIGpzb24ucGFyc2UudGl0bGVcbiAgICAkKCcjd2lraXBlZGlhQXJ0aWNsZScpLmh0bWwganNvbi5wYXJzZS50ZXh0W1wiKlwiXVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYTpub3QoLnJlZmVyZW5jZXMgYSlcIikuYXR0ciBcImhyZWZcIiwgLT4gIFwiaHR0cDovL3d3dy53aWtpcGVkaWEub3JnXCIgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhXCIpLmF0dHIgXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIlxuICBcbmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZT0gLT5cbiAgYWxlcnQgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldF93aWtpcGVkaWFfYXJ0aWNsZTpnZXRfd2lraXBlZGlhX2FydGljbGVcbiJdfQ==

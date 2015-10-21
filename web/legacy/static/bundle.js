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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, authorized, build_select_element, build_selector, draw_polygons, focus_search_field, get_counties, get_elected_officials, get_financial_statements, get_max_ranks, get_record2, gov_selector, govmap, initTableHandlers, refresh_disqus, route, routeType, sortTable, start_adjusting_typeahead_width, templates, undef, wikipedia;

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
    rows = column.data('origin');
    makeSort = false;
  } else if (column.hasClass('asc')) {
    column.removeClass('asc').addClass('desc');
    sortFunction = function(a, b) {
      var A, B;
      A = $(a).children('td').eq(colNum).text().toUpperCase();
      B = $(b).children('td').eq(colNum).text().toUpperCase();
      if (A < B) {
        return 1;
      }
      if (A > B) {
        return -1;
      }
      return 0;
    };
  } else if (column.hasClass('origin')) {
    column.addClass('asc');
    sortFunction = function(a, b) {
      var A, B;
      A = $(a).children('td').eq(colNum).text().toUpperCase();
      B = $(b).children('td').eq(colNum).text().toUpperCase();
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
    sortFunction = function(a, b) {
      var A, B;
      A = $(a).children('td').eq(colNum).text().toUpperCase();
      B = $(b).children('td').eq(colNum).text().toUpperCase();
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
  $('.sort').on('click', function(e) {
    var type;
    e.preventDefault();
    e.stopPropagation();
    type = $(this).attr('data-sort-type');
    if (type === 'year') {
      return alert('year');
    } else if (type === 'name') {
      return alert('name');
    } else if (type === 'amount') {
      return alert('amount');
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
      $.ajax('/editrequest/new', {
        method: 'POST',
        complete: function(response) {
          if (response.status === 401) {
            return showModal('/login');
          } else if (response.status === 200) {
            return authorized = true;
          }
        },
        error: function(error) {
          if (error.status === 401) {
            return showModal('/login');
          }
        }
      });
    }
    if (!authorized) {
      return false;
    }
    if (!authorized) {
      $.ajax('/editrequest/new', {
        method: 'POST',
        complete: function(response) {
          if (response.status === 401) {
            return showModal('/login');
          } else if (response.status === 200) {
            return authorized = true;
          }
        },
        error: function(error) {
          if (error.status === 401) {
            return showModal('/login');
          }
        }
      });
    }
    if (!authorized) {
      return false;
    }
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
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
      associations[selectName] = selectedValue;
    } else if (modalType === 'addContributions') {

    } else if (modalType === 'addEndorsements') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL2dvdm1hcC5jb2ZmZWUiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL2dvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy9yZC9XZWJzdG9ybVByb2plY3RzL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUiLCIvVXNlcnMvcmQvV2Vic3Rvcm1Qcm9qZWN0cy9nb3Z3aWtpL3dlYi9sZWdhY3kvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIiwiL1VzZXJzL3JkL1dlYnN0b3JtUHJvamVjdHMvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFHZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLGNBQUEsRUFBZ0IsS0FOaEI7RUFPQSxVQUFBLEVBQVksS0FQWjtFQVFBLGNBQUEsRUFBZ0IsS0FSaEI7RUFTQSxXQUFBLEVBQWEsSUFUYjtFQVVBLGtCQUFBLEVBQ0U7SUFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFwQztHQVhGO0NB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O0lBQWpDLENBQWpFO1dBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxRQUF0QyxFQUFnRCxRQUFoRDtFQUpnSCxDQUFsSDtBQUZvQjs7QUFRdEIsd0JBQUEsR0FBMEIsU0FBQTtTQUN4QixLQUFBLENBQU0saUJBQU47QUFEd0I7O0FBRzFCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxxQkFBQSxFQUFzQixxQkFBdEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYm91bmRzX3RpbWVvdXQ9dW5kZWZpbmVkXG5cblxubWFwID0gbmV3IEdNYXBzXG4gIGVsOiAnI2dvdm1hcCdcbiAgbGF0OiAzNy4zXG4gIGxuZzogLTExOS4zXG4gIHpvb206IDZcbiAgbWluWm9vbTogNlxuICBzY3JvbGx3aGVlbDogdHJ1ZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgcGFuQ29udHJvbDogZmFsc2VcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHpvb21Db250cm9sOiB0cnVlXG4gIHpvb21Db250cm9sT3B0aW9uczpcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxuXG5tYXAubWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5SSUdIVF9UT1BdLnB1c2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2VuZCcpKVxuXG5yZXJlbmRlcl9tYXJrZXJzID0gLT5cbiAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gR09WV0lLSS5tYXJrZXJzXG5cbnJlYnVpbGRfZmlsdGVyID0gLT5cbiAgaGFyZF9wYXJhbXMgPSBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yID0gW11cbiAgJCgnLnR5cGVfZmlsdGVyJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgaWYgJChlbGVtZW50KS5hdHRyKCduYW1lJykgaW4gaGFyZF9wYXJhbXMgYW5kICQoZWxlbWVudCkudmFsKCkgPT0gJzEnXG4gICAgICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLnB1c2ggJChlbGVtZW50KS5hdHRyKCduYW1lJylcblxuIyBsZWdlbmRUeXBlID0gY2l0eSwgc2Nob29sIGRpc3RyaWN0LCBzcGVjaWFsIGRpc3RyaWN0LCBjb3VudGllc1xuZ2V0X3JlY29yZHMyID0gKGxlZ2VuZFR5cGUsIG9uc3VjY2VzcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUgfVxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG5cbiAgcmVidWlsZF9maWx0ZXIoKVxuICBnZXRfcmVjb3JkczIgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiwgKGRhdGEpIC0+XG4gICAgR09WV0lLSS5tYXJrZXJzID0gZGF0YTtcbiAgICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpOm5vdCguY291bnRpZXMtdHJpZ2dlciknKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaGlkZGVuX2ZpZWxkID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpXG4gICAgdmFsdWUgPSBoaWRkZW5fZmllbGQudmFsKClcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcbiAgICByZWJ1aWxkX2ZpbHRlcigpXG4gICAgbWFwLnJlbW92ZU1hcmtlcnMoKVxuICAgIHJlcmVuZGVyX21hcmtlcnMoKVxuXG4gICQoJyNsZWdlbmQgbGkuY291bnRpZXMtdHJpZ2dlcicpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdhY3RpdmUnKSB0aGVuIEdPVldJS0kuZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29ucyBlbHNlIG1hcC5yZW1vdmVQb2x5Z29ucygpXG5cblxuXG5cbmdldF9pY29uID0oYWx0X3R5cGUpIC0+XG5cbiAgX2NpcmNsZSA9KGNvbG9yKS0+XG4gICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEVcbiAgICBmaWxsT3BhY2l0eTogMVxuICAgIGZpbGxDb2xvcjpjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOid3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTo2XG5cbiAgc3dpdGNoIGFsdF90eXBlXG4gICAgd2hlbiAnQ2l0eScgdGhlbiByZXR1cm4gX2NpcmNsZSAncmVkJ1xuICAgIHdoZW4gJ1NjaG9vbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAnbGlnaHRibHVlJ1xuICAgIHdoZW4gJ1NwZWNpYWwgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3B1cnBsZSdcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcblxuaW5fYXJyYXkgPSAobXlfaXRlbSwgbXlfYXJyYXkpIC0+XG4gIGZvciBpdGVtIGluIG15X2FycmF5XG4gICAgcmV0dXJuIHRydWUgaWYgaXRlbSA9PSBteV9pdGVtXG4gIGZhbHNlXG5cblxuYWRkX21hcmtlciA9IChyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIGV4aXN0ID0gaW5fYXJyYXkgcmVjLmFsdFR5cGUsIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzJcbiAgaWYgZXhpc3QgaXMgZmFsc2UgdGhlbiByZXR1cm4gZmFsc2VcbiAgbWFwLmFkZE1hcmtlclxuICAgIGxhdDogcmVjLmxhdGl0dWRlXG4gICAgbG5nOiByZWMubG9uZ2l0dWRlXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4gICAgdGl0bGU6ICBcIiN7cmVjLm5hbWV9LCAje3JlYy50eXBlfVwiXG4gICAgaW5mb1dpbmRvdzpcbiAgICAgIGNvbnRlbnQ6IFwiXG4gICAgICAgIDxkaXY+PGEgaHJlZj0namF2YXNjcmlwdDp2b2lkKDApOycgY2xhc3M9J2luZm8td2luZG93LXVyaScgZGF0YS11cmk9Jy8je3JlYy5hbHRUeXBlU2x1Z30vI3tyZWMuc2x1Z30nPjxzdHJvbmc+I3tyZWMubmFtZX08L3N0cm9uZz48L2E+PC9kaXY+XG4gICAgICAgIDxkaXY+ICN7cmVjLnR5cGV9ICAje3JlYy5jaXR5fSAje3JlYy56aXB9ICN7cmVjLnN0YXRlfTwvZGl2PlwiXG5cblxuIyBHRU9DT0RJTkcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5waW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cbiAgR01hcHMuZ2VvY29kZVxuICAgIGFkZHJlc3M6IGFkZHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cbiAgICAgIGlmIHN0YXR1cyA9PSAnT0snXG4gICAgICAgIGxhdGxuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxuICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgbGF0OiBsYXRsbmcubGF0KClcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxuICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICB0aXRsZTogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICBjb250ZW50OiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG5cbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgbWFwOiBtYXBcbiIsIlxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXR5cGVcIj57e3tnb3ZfdHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBnb3ZzX2FycmF5ID0gW11cblxuICBjb3VudF9nb3ZzIDogKCkgLT5cbiAgICBjb3VudCA9MFxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgY291bnQrK1xuICAgIHJldHVybiBjb3VudFxuXG5cbiAgc3RhcnRTdWdnZXN0aW9uIDogKGdvdnMpID0+XG4gICAgI0Bnb3ZzX2FycmF5ID0gZ292c1xuICAgIEBnb3ZzX2FycmF5ID0gZ292cy5yZWNvcmRcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAsIDEwMDBcblxuICAgICQoQGh0bWxfc2VsZWN0b3IpLnR5cGVhaGVhZChcbiAgICAgICAgaGludDogZmFsc2VcbiAgICAgICAgaGlnaGxpZ2h0OiBmYWxzZVxuICAgICAgICBtaW5MZW5ndGg6IDFcbiAgICAgICAgY2xhc3NOYW1lczpcbiAgICAgICAgXHRtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2dvdl9uYW1lJ1xuICAgICAgICBkaXNwbGF5S2V5OiAnZ292X25hbWUnXG4gICAgICAgIHNvdXJjZTogcXVlcnlfbWF0Y2hlcihAZ292c19hcnJheSwgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICMgJCgnLmdvdi1jb3VudGVyJykudGV4dCBAY291bnRfZ292cygpXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIiMjI1xuZmlsZTogbWFpbi5jb2ZmZSAtLSBUaGUgZW50cnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgOlxuZ292X2ZpbmRlciA9IG5ldyBHb3ZGaW5kZXJcbmdvdl9kZXRhaWxzID0gbmV3IEdvdkRldGFpbHNcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5Hb3ZTZWxlY3RvciA9IHJlcXVpcmUgJy4vZ292c2VsZWN0b3IuY29mZmVlJ1xuI19qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG53aWtpcGVkaWEgPSByZXF1aXJlICcuL3dpa2lwZWRpYS5jb2ZmZWUnXG5cbmdvdm1hcCA9IG51bGxcbmdvdl9zZWxlY3RvciA9IG51bGxcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5hY3RpdmVfdGFiID0gXCJcIlxudW5kZWYgPSBudWxsXG5hdXRob3JpemVkID0gZmFsc2VcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZiBgYSA9PSBiYFxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxud2luZG93LkdPVldJS0kgPVxuICAgIHN0YXRlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyXzI6IFsnQ2l0eScsICdTY2hvb2wgRGlzdHJpY3QnLCAnU3BlY2lhbCBEaXN0cmljdCddXG5cbiAgICBzaG93X3NlYXJjaF9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgZm9jdXNfc2VhcmNoX2ZpZWxkIDUwMFxuXG4gICAgc2hvd19kYXRhX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuXG5HT1ZXSUtJLmdldF9jb3VudGllcyA9IGdldF9jb3VudGllcyA9IChjYWxsYmFjaykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnL2xlZ2FjeS9kYXRhL2NvdW50eV9nZW9ncmFwaHlfY2FfMi5qc29uJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChjb3VudGllc0pTT04pIC0+XG4gICAgICAgICAgICBjYWxsYmFjayBjb3VudGllc0pTT05cblxuR09WV0lLSS5kcmF3X3BvbHlnb25zID0gZHJhd19wb2x5Z29ucyA9IChjb3VudGllc0pTT04pIC0+XG4gICAgZm9yIGNvdW50eSBpbiBjb3VudGllc0pTT04uZmVhdHVyZXNcbiAgICAgICAgZG8gKGNvdW50eSkgPT5cbiAgICAgICAgICAgIGdvdm1hcC5tYXAuZHJhd1BvbHlnb24oe1xuICAgICAgICAgICAgICAgIHBhdGhzOiBjb3VudHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAgICB1c2VHZW9KU09OOiB0cnVlXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICcjODA4MDgwJ1xuICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAuNlxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMS41XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnI0ZGMDAwMCdcbiAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4xNVxuICAgICAgICAgICAgICAgIGNvdW50eUlkOiBjb3VudHkucHJvcGVydGllcy5faWRcbiAgICAgICAgICAgICAgICBhbHROYW1lOiBjb3VudHkucHJvcGVydGllcy5hbHRfbmFtZVxuICAgICAgICAgICAgICAgIG1hcmtlcjogbmV3IE1hcmtlcldpdGhMYWJlbCh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICByYWlzZU9uRHJhZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1hcDogZ292bWFwLm1hcC5tYXAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQ29udGVudDogY291bnR5LnByb3BlcnRpZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxBbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCgtMTUsIDI1KSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDbGFzczogXCJsYWJlbC10b29sdGlwXCIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsU3R5bGU6IHtvcGFjaXR5OiAxLjB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMXgxXCIsXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiMwMEZGMDBcIn0pXG4gICAgICAgICAgICAgICAgbW91c2Vtb3ZlOiAoZXZlbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFBvc2l0aW9uKGV2ZW50LmxhdExuZylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZSh0cnVlKVxuICAgICAgICAgICAgICAgIG1vdXNlb3V0OiAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE9wdGlvbnMoe2ZpbGxDb2xvcjogXCIjRkYwMDAwXCJ9KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKVxuICAgICAgICAgICAgICAgIGNsaWNrOiAtPlxuICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgdXJpID0gXCIvI3tjb3VudHkuYWx0X3R5cGVfc2x1Z30vI3tjb3VudHkucHJvcGVydGllcy5zbHVnfVwiXG4gICAgICAgICAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcbiAgICAgICAgICAgIH0pXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPSAobmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XG4gICAgYWN0aXZlX3RhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd0YWJuYW1lJylcbiAgICBjb25zb2xlLmxvZyBhY3RpdmVfdGFiXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAkKCQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgdGVtcGxhdGVzLmFjdGl2YXRlIDAsIGFjdGl2ZV90YWJcblxuICAgIGlmIGFjdGl2ZV90YWIgPT0gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gMFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgyICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgzICsgMjcpXG5cblxuJChkb2N1bWVudCkudG9vbHRpcCh7c2VsZWN0b3I6IFwiW2NsYXNzPSdtZWRpYS10b29sdGlwJ11cIiwgdHJpZ2dlcjogJ2NsaWNrJ30pXG5cbmFjdGl2YXRlX3RhYiA9ICgpIC0+XG4gICAgJChcIiNmaWVsZFRhYnMgYVtocmVmPScjdGFiI3thY3RpdmVfdGFifSddXCIpLnRhYignc2hvdycpXG5cblxuZ2V0X3JlY29yZDIgPSAocmVjaWQpIC0+XG4jIGNsZWFyIHdpa2lwZWRpYSBwbGFjZVxuICAgICQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoXCJcIilcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OTo4MC9yZXN0L2RiL2dvdnMvI3tyZWNpZH1cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGhlYWRlcnM6IHtcIlgtRHJlYW1GYWN0b3J5LUFwcGxpY2F0aW9uLU5hbWVcIjogXCJnb3Z3aWtpXCJ9XG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgICAgIGdldF9maW5hbmNpYWxfc3RhdGVtZW50cyBkYXRhLl9pZCwgKGRhdGEyLCB0ZXh0U3RhdHVzLCBqcVhIUikgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cyA9IGRhdGEyXG4gICAgICAgICAgICAgICAgICAgIGdldF9lbGVjdGVkX29mZmljaWFscyBkYXRhLl9pZCwgMjUsIChkYXRhMywgdGV4dFN0YXR1czIsIGpxWEhSMikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhM1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0X21heF9yYW5rcyAobWF4X3JhbmtzX3Jlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEubWF4X3JhbmtzID0gbWF4X3JhbmtzX3Jlc3BvbnNlLnJlY29yZFswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICNUT0RPOiBFbmFibGUgYWZ0ZXIgcmVhbGl6ZSBtYXhfcmFua3MgYXBpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjY29uc29sZS5sb2cgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aXZhdGVfdGFiKClcblxuICAgICAgICAgICAgIyBmaWxsIHdpa2lwZWRpYSBwbGFjZVxuICAgICAgICAgICAgI3dwbiA9IGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgICAgICAgICAgIyQoXCIjd2lraXBlZGlhQ29udGFpbmVyXCIpLmh0bWwoaWYgd3BuIHRoZW4gd3BuIGVsc2UgXCJObyBXaWtpcGVkaWEgYXJ0aWNsZVwiKVxuXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9lbGVjdGVkX29mZmljaWFscyA9IChhbHRfdHlwZSwgZ292X25hbWUsIG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80Ni4xMDEuMy43OS9hcGkvZ292ZXJubWVudC9cIiArIGFsdF90eXBlICsgJy8nICsgZ292X25hbWVcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5nZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgPSAoZ292X2lkLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9fcHJvYy9nZXRfZmluYW5jaWFsX3N0YXRlbWVudHNcIlxuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6IFwiZ292d2lraVwiXG4gICAgICAgICAgICBvcmRlcjogXCJjYXB0aW9uX2NhdGVnb3J5LGRpc3BsYXlfb3JkZXJcIlxuICAgICAgICAgICAgcGFyYW1zOiBbXG4gICAgICAgICAgICAgICAgbmFtZTogXCJnb3ZzX2lkXCJcbiAgICAgICAgICAgICAgICBwYXJhbV90eXBlOiBcIklOXCJcbiAgICAgICAgICAgICAgICB2YWx1ZTogZ292X2lkXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9tYXhfcmFua3MgPSAob25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6ICdodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9tYXhfcmFua3MnXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgICBhcHBfbmFtZTogJ2dvdndpa2knXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0gKHJlYyk9PlxuICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgIGFjdGl2YXRlX3RhYigpXG4gICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgcm91dGVyLm5hdmlnYXRlKHJlYy5faWQpXG5cblxud2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQyID0gKHJlYyk9PlxuICAgIGdldF9lbGVjdGVkX29mZmljaWFscyByZWMuYWx0VHlwZVNsdWcsIHJlYy5zbHVnLCAoZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgIHJlYy5lbGVjdGVkX29mZmljaWFscyA9IGRhdGFcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCByZWMpXG4gICAgICAgICNnZXRfcmVjb3JkMiByZWMuaWRcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIHVybCA9IHJlYy5hbHRUeXBlU2x1ZyArICcvJyArIHJlYy5zbHVnXG4gICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gdXJsXG5cblxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCBjb21tYW5kLCB3aGVyZV90b19zdG9yZV92YWx1ZSkgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cHM6Ly9hcGkubW9uZ29sYWIuY29tL2FwaS8xL2RhdGFiYXNlcy9nb3Z3aWtpL3J1bkNvbW1hbmQ/YXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5J1xuICAgICAgICB0eXBlOiAnUE9TVCdcbiAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgZGF0YTogY29tbWFuZCAjSlNPTi5zdHJpbmdpZnkoY29tbWFuZClcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlc1xuICAgICAgICAgICAgYnVpbGRfc2VsZWN0X2VsZW1lbnQgY29udGFpbmVyLCB0ZXh0LCB2YWx1ZXMuc29ydCgpLCB3aGVyZV90b19zdG9yZV92YWx1ZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgcyA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICAgIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyIHdoZW4gdlxuICAgIHMgKz0gXCI8L3NlbGVjdD5cIlxuICAgIHNlbGVjdCA9ICQocylcbiAgICAkKGNvbnRhaW5lcikuYXBwZW5kKHNlbGVjdClcblxuICAgICMgc2V0IGRlZmF1bHQgJ0NBJ1xuICAgIGlmIHRleHQgaXMgJ1N0YXRlLi4nXG4gICAgICAgIHNlbGVjdC52YWwgJ0NBJ1xuICAgICAgICB3aW5kb3cuR09WV0lLSS5zdGF0ZV9maWx0ZXIgPSAnQ0EnXG5cbiAgICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgICAgICBlbCA9ICQoZS50YXJnZXQpXG4gICAgICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXG4gICAgICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgZ292X3NlbGVjdG9yLmNvdW50X2dvdnMoKVxuXG5hZGp1c3RfdHlwZWFoZWFkX3dpZHRoID0gKCkgLT5cbiAgICBpbnAgPSAkKCcjbXlpbnB1dCcpXG4gICAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gICAgaW5wLndpZHRoIHBhci53aWR0aCgpXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgICAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcblxuZm9jdXNfc2VhcmNoX2ZpZWxkID0gKG1zZWMpIC0+XG4gICAgc2V0VGltZW91dCAoLT4gJCgnI215aW5wdXQnKS5mb2N1cygpKSwgbXNlY1xuXG5cbiMgcXVpY2sgYW5kIGRpcnR5IGZpeCBmb3IgYmFjayBidXR0b24gaW4gYnJvd3Nlclxud2luZG93Lm9uaGFzaGNoYW5nZSA9IChlKSAtPlxuICAgIGggPSB3aW5kb3cubG9jYXRpb24uaGFzaFxuICAgIGlmIG5vdCBoXG4gICAgICAgIEdPVldJS0kuc2hvd19zZWFyY2hfcGFnZSgpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnJvdXRlID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoKGl0bSktPiBpZiBpdG0gaXNudCBcIlwiIHRoZW4gaXRtIGVsc2UgZmFsc2UpO1xucm91dGVUeXBlID0gcm91dGUubGVuZ3RoO1xuXG5HT1ZXSUtJLmhpc3RvcnkgPSAoaW5kZXgpIC0+XG4gICAgaWYgaW5kZXggPT0gMFxuICAgICAgICBzZWFyY2hDb250YWluZXIgPSAkKCcjc2VhcmNoQ29udGFpbmVyJykudGV4dCgpO1xuICAgICAgICBpZihzZWFyY2hDb250YWluZXIgIT0gJycpXG4gICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge30sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCAnLydcbiAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLydcbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLnNob3coKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiAoaGlzdG9yeS5zdGF0ZSAhPSBudWxsICYmIGhpc3Rvcnkuc3RhdGUudGVtcGxhdGUgIT0gdW5kZWZpbmVkKVxuICAgICAgICB3aW5kb3cuaGlzdG9yeS5nbyhpbmRleCk7XG4gICAgZWxzZVxuICAgICAgICByb3V0ZS5wb3AoKVxuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9ICcvJyArIHJvdXRlLmpvaW4oJy8nKVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9wc3RhdGUnLCAoZXZlbnQpIC0+XG4gICAgaWYgd2luZG93Lmhpc3Rvcnkuc3RhdGUgaXNudCBudWxsXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBldmVudC5zdGF0ZS50ZW1wbGF0ZVxuICAgICAgICByb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykubGVuZ3RoLTE7XG4gICAgICAgIGlmIHJvdXRlIGlzIDIgdGhlbiAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICAgICAgaWYgcm91dGUgaXMgMSB0aGVuICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcbiMgICAgZWxzZVxuIyAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcbnJlZnJlc2hfZGlzcXVzID0gKG5ld0lkZW50aWZpZXIsIG5ld1VybCwgbmV3VGl0bGUpIC0+XG4gICAgRElTUVVTLnJlc2V0XG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiAoKSAtPlxuICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXG4gICAgICAgICAgICB0aGlzLnBhZ2UudGl0bGUgPSBuZXdUaXRsZVxuXG5cbmluaXRUYWJsZUhhbmRsZXJzID0gKHBlcnNvbikgLT5cbiAgICAkKCdbZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJdJykudG9vbHRpcCgpXG5cbiAgICAkKCcuZWRpdGFibGUnKS5lZGl0YWJsZSh7c3R5bGVzaGVldHM6IGZhbHNlLHR5cGU6ICd0ZXh0YXJlYScsIHNob3didXR0b25zOiAnYm90dG9tJywgZGlzcGxheTogdHJ1ZSwgZW1wdHl0ZXh0OiAnICd9KVxuICAgICQoJy5lZGl0YWJsZScpLm9mZignY2xpY2snKTtcblxuICAgICQoJ3RhYmxlJykub24gJ2NsaWNrJywgJy5nbHlwaGljb24tcGVuY2lsJywgKGUpIC0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubm9FZGl0YWJsZSBpc250IHVuZGVmaW5lZCB0aGVuIHJldHVyblxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpXG4gICAgICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9uZXcnLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDQwMVxuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHJlc3BvbnNlLnN0YXR1cyBpcyAyMDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG4gICAgICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZXJyb3Iuc3RhdHVzIGlzIDQwMSB0aGVuIHNob3dNb2RhbCgnL2xvZ2luJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJykuZmluZCgnLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZScpO1xuXG4gICAgI1xuICAgICMgQWRkIHNvcnQgaGFuZGxlcnMuXG4gICAgI1xuICAgICQoJy5zb3J0Jykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgdHlwZSA9ICQodGhpcykuYXR0cignZGF0YS1zb3J0LXR5cGUnKTtcblxuICAgICAgaWYgdHlwZSBpcyAneWVhcidcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgeWVhci5cbiAgICAgICAgI1xuICAgICAgICBhbGVydCgneWVhcicpO1xuICAgICAgZWxzZSBpZiB0eXBlIGlzICduYW1lJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBuYW1lLlxuICAgICAgICAjXG4gICAgICAgIGFsZXJ0KCduYW1lJyk7XG4gICAgICBlbHNlIGlmIHR5cGUgaXMgJ2Ftb3VudCdcbiAgICAgICAgI1xuICAgICAgICAjIFNvcnQgYnkgYW1vdW50LlxuICAgICAgICAjXG4gICAgICAgIGFsZXJ0KCdhbW91bnQnKTtcblxuICAgICQoJ2EnKS5vbiAnc2F2ZScsIChlLCBwYXJhbXMpIC0+XG4gICAgICAgIGVudGl0eVR5cGUgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGFibGUnKVswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgaWQgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKVswXS5kYXRhc2V0LmlkXG4gICAgICAgIGZpZWxkID0gT2JqZWN0LmtleXMoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJylbMF0uZGF0YXNldClbMF1cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGVkaXRSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogaWQsXG4gICAgICAgICAgICAgICAgY2hhbmdlczoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0LmNoYW5nZXNbZmllbGRdID0gcGFyYW1zLm5ld1ZhbHVlXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0KTtcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9jcmVhdGUnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQvanNvbicsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgdGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICB9XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuYWRkJywgKGUpIC0+XG4gICAgICAgIHRhYlBhbmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgICB0YWJsZVR5cGUgPSB0YWJQYW5lWzBdLmlkXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9uZXcnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGNvbXBsZXRlOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgIGlmIHJlc3BvbnNlLnN0YXR1cyBpcyA0MDFcbiAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgICAgIGVsc2UgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMFxuICAgICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIH1cblxuICAgICAgICBpZiAoIWF1dGhvcml6ZWQpIHRoZW4gcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICAgICQuYWpheCAnL2VkaXRyZXF1ZXN0L25ldycsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5zdGF0dXMgaXMgNDAxXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXplZCA9IHRydWVcbiAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIGlmICghYXV0aG9yaXplZCkgdGhlbiByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY3VycmVudEVudGl0eSA9IG51bGxcbiAgICAgICAgaWYgdGFibGVUeXBlIGlzICdWb3RlcydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnRWxlY3RlZE9mZmljaWFsVm90ZSdcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLm1vZGFsKCd0b2dnbGUnKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnQ29udHJpYnV0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZENvbnRyaWJ1dGlvbnMnKS5tb2RhbCgndG9nZ2xlJylcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnRW5kb3JzZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkRW5kb3JzZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpXG5cbiAgICAgICAgaWYgdGFiUGFuZS5oYXNDbGFzcygnbG9hZGVkJykgdGhlbiByZXR1cm4gZmFsc2VcbiAgICAgICAgdGFiUGFuZVswXS5jbGFzc0xpc3QuYWRkKCdsb2FkZWQnKVxuXG4gICAgICAgIHBlcnNvbk1ldGEgPSB7XCJjcmVhdGVSZXF1ZXN0XCI6e1wiZW50aXR5TmFtZVwiOmN1cnJlbnRFbnRpdHksXCJrbm93bkZpZWxkc1wiOntcImVsZWN0ZWRPZmZpY2lhbFwiOnBlcnNvbi5pZH19fVxuICAgICAgICAkLmFqYXgoXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9hcGkvY3JlYXRlcmVxdWVzdC9uZXcnLFxuICAgICAgICAgICAgZGF0YTogcGVyc29uTWV0YSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuXG4gICAgICAgICAgICAgICAgZW5kT2JqID0ge31cbiAgICAgICAgICAgICAgICBkYXRhLmNob2ljZXNbMF0uY2hvaWNlcy5mb3JFYWNoIChpdGVtLCBpbmRleCkgLT5cbiAgICAgICAgICAgICAgICAgIGlkcyA9IE9iamVjdC5rZXlzIGl0ZW1cbiAgICAgICAgICAgICAgICAgIGlkcy5mb3JFYWNoIChpZCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICBlbmRPYmpbaWRdID0gaXRlbVtpZF1cblxuICAgICAgICAgICAgICAgIGluc2VydENhdGVnb3JpZXMgPSAoKSAtPlxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Quc2V0QXR0cmlidXRlKCduYW1lJywgZGF0YS5jaG9pY2VzWzBdLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGZvciBrZXkgb2YgZW5kT2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNldEF0dHJpYnV0ZSgndmFsdWUnLCBrZXkpXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBlbmRPYmpba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCArPSBvcHRpb24ub3V0ZXJIVE1MO1xuXG4gICAgICAgICAgICAgICAgc2VsZWN0ID0gbnVsbFxuXG4gICAgICAgICAgICAgICAgaWYgY3VycmVudEVudGl0eSBpcyAnRW5kb3JzZW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdCA9ICQoJyNhZGRFbmRvcnNlbWVudHMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgY3VycmVudEVudGl0eSBpcyAnQ29udHJpYnV0aW9uJ1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdFbGVjdGVkT2ZmaWNpYWxWb3RlJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkVm90ZXMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG5cblxuXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGlmKGVycm9yLnN0YXR1cyA9PSA0MDEpIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICApO1xuXG5cbiAgICB3aW5kb3cuYWRkSXRlbSA9IChlKSAtPlxuICAgICAgICBuZXdSZWNvcmQgPSB7fVxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXG4gICAgICAgIG1vZGFsVHlwZSA9IG1vZGFsWzBdLmlkXG4gICAgICAgIGVudGl0eVR5cGUgPSBtb2RhbFswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XG5cbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgIGFzc29jaWF0aW9ucyA9IHt9XG4gICAgICAgIGFzc29jaWF0aW9uc1tcImVsZWN0ZWRPZmZpY2lhbFwiXSA9IHBlcnNvbi5pZFxuXG4gICAgICAgIGlmIG1vZGFsVHlwZSBpcyAnYWRkVm90ZXMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xuXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG5cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGNyZWF0ZVJlcXVlc3Q6IHtcbiAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBlbnRpdHlUeXBlLFxuICAgICAgICAgICAgICAgIGZpZWxkczogeyBmaWVsZHM6IG5ld1JlY29yZCwgYXNzb2NpYXRpb25zOiBhc3NvY2lhdGlvbnN9LFxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3RyJ1xuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgdHIuaW5uZXJIVE1MICs9IFwiPHRkPjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnXG4gICAgICAgICAgICBjbGFzcz0nZWRpdGFibGUgZWRpdGFibGUtcHJlLXdyYXBwZWQgZWRpdGFibGUtY2xpY2snPiN7dmFsdWV9PC9hPjwvdGQ+XCJcblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgJCgnI1ZvdGVzIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUodHIpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgICQoJyNDb250cmlidXRpb25zIHRyOmxhc3QtY2hpbGQnKS5iZWZvcmUodHIpO1xuICAgICAgICBlbHNlIGlmIG1vZGFsVHlwZSBpcyAnYWRkRW5kb3JzZW1lbnRzJ1xuICAgICAgICAgICAgJCgnI0VuZG9yc2VtZW50cyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlKHRyKTtcblxuICAgICAgICBjb25zb2xlLmxvZyBzZW5kT2JqZWN0XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6ICcvYXBpL2NyZWF0ZXJlcXVlc3QvY3JlYXRlJyxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqZWN0LFxuICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIH0pO1xuXG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgJy5lbGVjdGVkX2xpbmsnLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXJsID0gZS5jdXJyZW50VGFyZ2V0LnBhdGhuYW1lXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgdXJsLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbiA9IGRhdGFbMF1cblxuICAgICAgICAgICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9IHt5ZWFyOiAnbnVtZXJpYycsIG1vbnRoOiAnbnVtZXJpYycsIGRheTogJ251bWVyaWMnfTtcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLnRvTG9jYWxlU3RyaW5nICdlbi1VUycsIGZvcm1hdFxuXG4gICAgICAgICAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGh0bWx9LCAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGh0bWxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuXG4gICAgICAgICAgICAgICAgICAgICQoJy52b3RlJykub24gJ2NsaWNrJywgKGUpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0LmxlZ2lzbGF0aW9uTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNjb252ZXJzYXRpb24nKS5tb2RhbCAnc2hvdydcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuIyBSb3V0ZSAvXG5pZiByb3V0ZVR5cGUgaXMgMFxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIGdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICcvbGVnYWN5L2RhdGEvaF90eXBlc19jYV8yLmpzb24nLCA3XG4gICAgZ292X3NlbGVjdG9yLm9uX3NlbGVjdGVkID0gKGV2dCwgZGF0YSwgbmFtZSkgLT5cbiAgICAgICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIHVybCA9ICcvJyArIGRhdGEuYWx0VHlwZVNsdWcgKyAnLycgKyBkYXRhLnNsdWdcbiAgICAgICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICAgICAgICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuICAgIGlmICF1bmRlZlxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaHRtbCAkKCcjc2VhcmNoLWNvbnRhaW5lci10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAjIExvYWQgaW50cm9kdWN0b3J5IHRleHQgZnJvbSB0ZXh0cy9pbnRyby10ZXh0Lmh0bWwgdG8gI2ludHJvLXRleHQgY29udGFpbmVyLlxuICAgICAgICAkLmdldCBcIi9sZWdhY3kvdGV4dHMvaW50cm8tdGV4dC5odG1sXCIsIChkYXRhKSAtPiAkKFwiI2ludHJvLXRleHRcIikuaHRtbCBkYXRhXG4gICAgICAgIGdvdm1hcCA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcbiAgICAgICAgZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29uc1xuICAgICAgICB1bmRlZiA9IHRydWVcbiAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuICAgIHN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGgoKVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkKCcjZ292bWFwJykub24gJ2NsaWNrJywgJy5pbmZvLXdpbmRvdy11cmknLCAoZSkgLT5cbiAgICAgICAgdXJpID0gZS50YXJnZXQucGFyZW50Tm9kZS5kYXRhc2V0LnVyaVxuICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50XCIgKyB1cmksXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgc3VjY2VzczogKGdvdnMpIC0+XG4gICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt0ZW1wbGF0ZTogY29tcGlsZWRfZ292X3RlbXBsYXRlfSwgJ0NQQyBDaXZpYyBQcm9maWxlcycsIHVyaVxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDJcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgQ2l2aWMgUHJvZmlsZXMnXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgdGVtcGxhdGVzLmxvYWRfZnVzaW9uX3RlbXBsYXRlIFwidGFic1wiLCBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Z1c2lvbnRhYmxlcy92Mi9xdWVyeT9zcWw9U0VMRUNUJTIwKiUyMEZST00lMjAxejJvWFFFWVEzcDJPb01JOFY1Z0tnSFdCNVR6OTkwQnJRMXhjMXRWbyZrZXk9QUl6YVN5Q1hEUXlNRHBHQTJnM1FqdXY0Q0R2N3pSai1peDRJUUpBXCJcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2VzczogKGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGEpIC0+XG4gICAgICAgICAgICBnb3ZzID0gZWxlY3RlZF9vZmZpY2lhbHNfZGF0YVxuICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICAgICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG4gICAgJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jIFJvdXRlIC86YWx0X25hbWUvOmNpdHlfbmFtZS86ZWxlY3RlZF9uYW1lXG5pZiByb3V0ZVR5cGUgaXMgM1xuICAgIGRvY3VtZW50LnRpdGxlID0gJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9lbGVjdGVkLW9mZmljaWFsXCIgKyB3aW5kb3cucGF0aCxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cblxuICAgICAgICAgICAgcGVyc29uID0gZGF0YVswXVxuXG4gICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgJzxoMj5Tb3JyeS4gUGFnZSBub3QgZm91bmQ8L2gyPidcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBmb3JtYXQgPSB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJ307XG4gICAgICAgICAgICBpZiBwZXJzb24udm90ZXMgIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQ7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS50b0xvY2FsZVN0cmluZyAnZW4tVVMnLCBmb3JtYXRcblxuICAgICAgICAgICAgdHBsID0gJCgnI3BlcnNvbi1pbmZvLXRlbXBsYXRlJykuaHRtbCgpXG4gICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG5cbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG4gICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmNzcygnZGlzcGxheSc6ICdibG9jaycpO1xuXG4gICAgICAgICAgICBpbml0VGFibGVIYW5kbGVycyhwZXJzb24pO1xuXG4gICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgIGlkID0gZS5jdXJyZW50VGFyZ2V0LmlkXG4gICAgICAgICAgICAgICAgIyBJZiBsZWdpc2xhdGlvbk5hbWUgaXMgdW5kZWZpbmVkIHVzZSBwZXJzb24gbmFtZVxuICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICBpZiBuYW1lIGlzIHVuZGVmaW5lZCB0aGVuIG5hbWUgPSBwZXJzb24uZnVsbF9uYW1lXG4gICAgICAgICAgICAgICAgJCgnI215TW9kYWxMYWJlbCcpLnRleHQobmFtZSArICcgKCcgKyBwZXJzb24uZ292X2FsdF9uYW1lICsgJyknKTtcbiAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgcmVmcmVzaF9kaXNxdXMgaWQsICdodHRwOi8vZ292d2lraS51cycgKyAnLycgKyBpZCwgbmFtZVxuXG4gICAgICAgICAgICAkKCcjc3RhbnRvbkljb24gYScpLnRleHQgJ1JldHVybiB0byAnICsgcGVyc29uLmdvdl9hbHRfbmFtZVxuICAgICAgICAgICAgd2luZG93LkRJU1FVU1dJREdFVFMuZ2V0Q291bnQoKVxuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGUiLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIFxuICAgICAgICBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgICAjaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQuZ292X25hbWUsIHdvcmRzLCByZWdzKVxuICAgICNkLnN0YXRlPXN0cm9uZ2lmeShkLnN0YXRlLCB3b3JkcywgcmVncylcbiAgICAjZC5nb3ZfdHlwZT1zdHJvbmdpZnkoZC5nb3ZfdHlwZSwgd29yZHMsIHJlZ3MpXG4gIFxuICByZXR1cm4gY2xvbmVzXG5cblxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXG5zdHJvbmdpZnkgPSAocywgd29yZHMsIHJlZ3MpIC0+XG4gIHJlZ3MuZm9yRWFjaCAocixpKSAtPlxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxuICByZXR1cm4gc1xuXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXG5zdHJpcCA9IChzKSAtPlxuICBzLnJlcGxhY2UoLzxbXjw+XSo+L2csJycpXG5cblxuIyBhbGwgdGlybXMgc3BhY2VzIGZyb20gYm90aCBzaWRlcyBhbmQgbWFrZSBjb250cmFjdHMgc2VxdWVuY2VzIG9mIHNwYWNlcyB0byAxXG5mdWxsX3RyaW0gPSAocykgLT5cbiAgc3M9cy50cmltKCcnK3MpXG4gIHNzPXNzLnJlcGxhY2UoLyArL2csJyAnKVxuXG4jIHJldHVybnMgYW4gYXJyYXkgb2Ygd29yZHMgaW4gYSBzdHJpbmdcbmdldF93b3JkcyA9IChzdHIpIC0+XG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcblxuXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XG4gIHdvcmRzID0gZ2V0X3dvcmRzIHN0clxuICByZWdzID0gd29yZHMubWFwICh3KS0+IG5ldyBSZWdFeHAoXCIje3d9XCIsJ2knKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVNcbmZpZWxkTmFtZXMgPSB7fVxuZmllbGROYW1lc0hlbHAgPSB7fVxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9IChuLG1hc2ssZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG5vdCBkYXRhW25dXG4gICAgcmV0dXJuICcnXG5cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgaWYgJycgIT0gbWFza1xuICAgICAgaWYgZGF0YVtuKydfcmFuayddIGFuZCBkYXRhLm1heF9yYW5rcyBhbmQgZGF0YS5tYXhfcmFua3NbbisnX21heF9yYW5rJ11cbiAgICAgICAgdiA9IG51bWVyYWwodikuZm9ybWF0KG1hc2spXG4gICAgICAgIHJldHVybiBcIiN7dn0gPHNwYW4gY2xhc3M9J3JhbmsnPigje2RhdGFbbisnX3JhbmsnXX0gb2YgI3tkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXX0pPC9zcGFuPlwiXG4gICAgICBpZiBuID09IFwibnVtYmVyX29mX2Z1bGxfdGltZV9lbXBsb3llZXNcIlxuICAgICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQoJzAsMCcpXG4gICAgICByZXR1cm4gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICBlbHNlXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZFxuICAgICAgbiA9PSBcIm9wZW5fZW5yb2xsbWVudF9zY2hvb2xzXCJcbiAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDE5KSArIFwiPGRpdiBzdHlsZT0nZGlzcGxheTppbmxpbmU7Y29sb3I6IzA3NGQ3MScgIHRpdGxlPScje3Z9Jz4maGVsbGlwOzwvZGl2PlwiXG4gICAgICBpZiB2Lmxlbmd0aCA+IDIwIGFuZFxuICAgICAgbiA9PSBcInBhcmVudF90cmlnZ2VyX2VsaWdpYmxlX3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgdi5sZW5ndGggPiAyMVxuICAgICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAyMSlcbiAgICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gdlxuXG5cbnJlbmRlcl9maWVsZF9uYW1lX2hlbHAgPSAoZk5hbWUpIC0+XG4gICNpZiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cbiAgICByZXR1cm4gZmllbGROYW1lc0hlbHBbZk5hbWVdXG5cbnJlbmRlcl9maWVsZF9uYW1lID0gKGZOYW1lKSAtPlxuICBpZiBmaWVsZE5hbWVzW2ZOYW1lXT9cbiAgICByZXR1cm4gZmllbGROYW1lc1tmTmFtZV1cblxuICBzID0gZk5hbWUucmVwbGFjZSgvXy9nLFwiIFwiKVxuICBzID0gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpXG4gIHJldHVybiBzXG5cblxucmVuZGVyX2ZpZWxkID0gKGZOYW1lLGRhdGEpLT5cbiAgaWYgXCJfXCIgPT0gc3Vic3RyIGZOYW1lLCAwLCAxXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyA+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+Jm5ic3A7PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBlbHNlXG4gICAgcmV0dXJuICcnIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICAgIFwiXCJcIlxuICAgIDxkaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbScgID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTxkaXY+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcblxucmVuZGVyX3N1YmhlYWRpbmcgPSAoZk5hbWUsIG1hc2ssIG5vdEZpcnN0KS0+XG4gIHMgPSAnJ1xuICBmTmFtZSA9IHJlbmRlcl9maWVsZF9uYW1lIGZOYW1lXG4gIGlmIG1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICBpZiBub3RGaXJzdCAhPSAwXG4gICAgICBzICs9IFwiPGJyLz5cIlxuICAgIHMgKz0gXCI8ZGl2PjxzcGFuIGNsYXNzPSdmLW5hbSc+I3tmTmFtZX08L3NwYW4+PHNwYW4gY2xhc3M9J2YtdmFsJz4gPC9zcGFuPjwvZGl2PlwiXG4gIHJldHVybiBzXG5cbnJlbmRlcl9maWVsZHMgPSAoZmllbGRzLGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIGZvciBmaWVsZCxpIGluIGZpZWxkc1xuICAgIGlmICh0eXBlb2YgZmllbGQgaXMgXCJvYmplY3RcIilcbiAgICAgIGlmIGZpZWxkLm1hc2sgPT0gXCJoZWFkaW5nXCJcbiAgICAgICAgaCArPSByZW5kZXJfc3ViaGVhZGluZyhmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBpKVxuICAgICAgICBmVmFsdWUgPSAnJ1xuICAgICAgZWxzZVxuICAgICAgICBmVmFsdWUgPSByZW5kZXJfZmllbGRfdmFsdWUgZmllbGQubmFtZSwgZmllbGQubWFzaywgZGF0YVxuICAgICAgICBpZiAoJycgIT0gZlZhbHVlIGFuZCBmVmFsdWUgIT0gJzAnKVxuICAgICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGQubmFtZVxuICAgICAgICAgIGZOYW1lSGVscCA9IHJlbmRlcl9maWVsZF9uYW1lX2hlbHAgZmllbGQubmFtZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZlZhbHVlID0gJydcblxuICAgIGVsc2VcbiAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZCwgJycsIGRhdGFcbiAgICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICAgIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZmllbGRcbiAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmTmFtZVxuICAgIGlmICgnJyAhPSBmVmFsdWUpXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZOYW1lLCB2YWx1ZTogZlZhbHVlLCBoZWxwOiBmTmFtZUhlbHApXG4gIHJldHVybiBoXG5cbnJlbmRlcl9maW5hbmNpYWxfZmllbGRzID0gKGRhdGEsdGVtcGxhdGUpLT5cbiAgaCA9ICcnXG4gIG1hc2sgPSAnMCwwJ1xuICBjYXRlZ29yeSA9ICcnXG4gIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gIGZvciBmaWVsZCBpbiBkYXRhXG4gICAgaWYgY2F0ZWdvcnkgIT0gZmllbGQuY2F0ZWdvcnlfbmFtZVxuICAgICAgY2F0ZWdvcnkgPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBpZiBjYXRlZ29yeSA9PSAnT3ZlcnZpZXcnXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICBlbHNlIGlmIGNhdGVnb3J5ID09ICdSZXZlbnVlcydcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gXCI8Yj5cIiArIHRlbXBsYXRlKG5hbWU6IGNhdGVnb3J5LCBnZW5mdW5kOiBcIkdlbmVyYWwgRnVuZFwiLCBvdGhlcmZ1bmRzOiBcIk90aGVyIEZ1bmRzXCIsIHRvdGFsZnVuZHM6IFwiVG90YWwgR292LiBGdW5kc1wiKSArIFwiPC9iPlwiXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgaCArPSAnPC9icj4nXG4gICAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogXCI8Yj5cIiArIGNhdGVnb3J5ICsgXCI8L2I+XCIsIGdlbmZ1bmQ6ICcnLCBvdGhlcmZ1bmRzOiAnJywgdG90YWxmdW5kczogJycpXG4gICAgICAgIGlzX2ZpcnN0X3JvdyA9IHRydWVcblxuICAgIGlmIGZpZWxkLmNhcHRpb24gPT0gJ0dlbmVyYWwgRnVuZCBCYWxhbmNlJyBvciBmaWVsZC5jYXB0aW9uID09ICdMb25nIFRlcm0gRGVidCdcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JykpXG4gICAgZWxzZSBpZiBmaWVsZC5jYXB0aW9uIGluIFsnVG90YWwgUmV2ZW51ZXMnLCAnVG90YWwgRXhwZW5kaXR1cmVzJywgJ1N1cnBsdXMgLyAoRGVmaWNpdCknXSBvciBpc19maXJzdF9yb3dcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZmllbGQuY2FwdGlvbiwgZ2VuZnVuZDogY3VycmVuY3koZmllbGQuZ2VuZnVuZCwgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIG90aGVyZnVuZHM6IGN1cnJlbmN5KGZpZWxkLm90aGVyZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpLCB0b3RhbGZ1bmRzOiBjdXJyZW5jeShmaWVsZC50b3RhbGZ1bmRzLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICAgIGlzX2ZpcnN0X3JvdyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzayksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2spKVxuICByZXR1cm4gaFxuXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoL1tcXHNcXCtcXC1dL2csICdfJylcblxudG9UaXRsZUNhc2UgPSAoc3RyKSAtPlxuICBzdHIucmVwbGFjZSAvXFx3XFxTKi9nLCAodHh0KSAtPlxuICAgIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKVxuXG5jdXJyZW5jeSA9IChuLCBtYXNrLCBzaWduID0gJycpIC0+XG4gICAgbiA9IG51bWVyYWwobilcbiAgICBpZiBuIDwgMFxuICAgICAgICBzID0gbi5mb3JtYXQobWFzaykudG9TdHJpbmcoKVxuICAgICAgICBzID0gcy5yZXBsYWNlKC8tL2csICcnKVxuICAgICAgICByZXR1cm4gXCIoI3tzaWdufSN7JzxzcGFuIGNsYXNzPVwiZmluLXZhbFwiPicrcysnPC9zcGFuPid9KVwiXG5cbiAgICBuID0gbi5mb3JtYXQobWFzaylcbiAgICByZXR1cm4gXCIje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytuKyc8L3NwYW4+J31cIlxuXG5yZW5kZXJfdGFicyA9IChpbml0aWFsX2xheW91dCwgZGF0YSwgdGFic2V0LCBwYXJlbnQpIC0+XG4gICNsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICBsYXlvdXQgPSBpbml0aWFsX2xheW91dFxuICB0ZW1wbGF0ZXMgPSBwYXJlbnQudGVtcGxhdGVzXG4gIHBsb3RfaGFuZGxlcyA9IHt9XG5cbiAgbGF5b3V0X2RhdGEgPVxuICAgIHRpdGxlOiBkYXRhLm5hbWVcbiAgICB3aWtpcGVkaWFfcGFnZV9leGlzdHM6IGRhdGEud2lraXBlZGlhX3BhZ2VfZXhpc3RzXG4gICAgd2lraXBlZGlhX3BhZ2VfbmFtZTogIGRhdGEud2lraXBlZGlhX3BhZ2VfbmFtZVxuICAgIHRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lOiBkYXRhLnRyYW5zcGFyZW50X2NhbGlmb3JuaWFfcGFnZV9uYW1lXG4gICAgbGF0ZXN0X2F1ZGl0X3VybDogZGF0YS5sYXRlc3RfYXVkaXRfdXJsXG4gICAgdGFiczogW11cbiAgICB0YWJjb250ZW50OiAnJ1xuXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBsYXlvdXRfZGF0YS50YWJzLnB1c2hcbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGRldGFpbF9kYXRhID1cbiAgICAgIHRhYmlkOiB1bmRlcih0YWIubmFtZSksXG4gICAgICB0YWJuYW1lOiB0YWIubmFtZSxcbiAgICAgIGFjdGl2ZTogKGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZScpXG4gICAgICB0YWJjb250ZW50OiAnJ1xuICAgIHN3aXRjaCB0YWIubmFtZVxuICAgICAgd2hlbiAnT3ZlcnZpZXcgKyBFbGVjdGVkIE9mZmljaWFscydcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGNvbnNvbGUubG9nIGRhdGFcbiAgICAgICAgZm9yIG9mZmljaWFsLGkgaW4gZGF0YS5lbGVjdGVkX29mZmljaWFsc1xuICAgICAgICAgIG9mZmljaWFsX2RhdGEgPVxuICAgICAgICAgICAgdGl0bGU6IGlmICcnICE9IG9mZmljaWFsLnRpdGxlIHRoZW4gXCJUaXRsZTogXCIgKyBvZmZpY2lhbC50aXRsZVxuICAgICAgICAgICAgbmFtZTogaWYgJycgIT0gb2ZmaWNpYWwuZnVsbF9uYW1lIHRoZW4gXCJOYW1lOiBcIiArIG9mZmljaWFsLmZ1bGxfbmFtZVxuICAgICAgICAgICAgZW1haWw6IGlmIG9mZmljaWFsLmVtYWlsX2FkZHJlc3MgdGhlbiBcIkVtYWlsOiBcIiArIG9mZmljaWFsLmVtYWlsX2FkZHJlc3NcbiAgICAgICAgICAgIHRlbGVwaG9uZW51bWJlcjogaWYgbnVsbCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIGFuZCB1bmRlZmluZWQgIT0gb2ZmaWNpYWwudGVsZXBob25lX251bWJlciB0aGVuIFwiVGVsZXBob25lIE51bWJlcjogXCIgKyBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyXG4gICAgICAgICAgICB0ZXJtZXhwaXJlczogaWYgb2ZmaWNpYWwudGVybV9leHBpcmVzIHRoZW4gXCJUZXJtIEV4cGlyZXM6IFwiICsgb2ZmaWNpYWwudGVybV9leHBpcmVzIGVsc2UgXCJUZXJtIEV4cGlyZXM6IFwiXG4gICAgICAgICAgICBhbHRUeXBlU2x1ZzogZGF0YS5hbHRfdHlwZV9zbHVnXG4gICAgICAgICAgICBuYW1lU2x1ZzogZGF0YS5zbHVnXG4gICAgICAgICAgICBzbHVnOiBvZmZpY2lhbC5zbHVnXG5cbiAgICAgICAgICBpZiAnJyAhPSBvZmZpY2lhbC5waG90b191cmwgYW5kIG9mZmljaWFsLnBob3RvX3VybCAhPSB1bmRlZmluZWRcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJzxpbWcgc3JjPVwiJytvZmZpY2lhbC5waG90b191cmwrJ1wiIGNsYXNzPVwicG9ydHJhaXRcIiBhbHQ9XCJcIiAvPidcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvZmZpY2lhbF9kYXRhLmltYWdlID0gICcnXG5cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJ10ob2ZmaWNpYWxfZGF0YSlcbiAgICAgIHdoZW4gJ0VtcGxveWVlIENvbXBlbnNhdGlvbidcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tY29tcC1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3NhbGFyeV9wZXJfZnVsbF90aW1lX2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfcGVyX2Z0X2VtcCddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDM0MFxuICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSA0NzBcblxuICAgICAgICAgIGlmICQod2luZG93KS53aWR0aCgpIDwgNDkwXG4gICAgICAgICAgICBzbWFsbENoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICAgIGJpZ0NoYXJ0V2lkdGggPSAzMDBcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBDb21wZW5zYXRpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdCZW5zLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJ1xcbiBFbXBsb3llZXMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ0FsbCBcXG4nICsgdG9UaXRsZUNhc2UgZGF0YS5uYW1lICsgJyBcXG4gUmVzaWRlbnRzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3dhZ2VzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9iZW5lZml0c19nZW5lcmFsX3B1YmxpYyddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAyKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIENvbXBlbnNhdGlvbiAtIEZ1bGwgVGltZSBXb3JrZXJzOiBcXG4gR292ZXJubWVudCB2cy4gUHJpdmF0ZSBTZWN0b3InXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdtZWRpYW4tY29tcC1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ10gPSdtZWRpYW4tY29tcC1ncmFwaCdcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snbWVkaWFuLXBlbnNpb24tZ3JhcGgnXVxuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBQZW5zaW9uJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1BlbnNpb24gZm9yIFxcbiBSZXRpcmVlIHcvIDMwIFllYXJzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3BlbnNpb24zMF95ZWFyX3JldGlyZWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGdyb3VwaW5nU3ltYm9sOiAnLCcgLCBmcmFjdGlvbkRpZ2l0czogJzAnKVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIFBlbnNpb24nXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2Jhcic6IHtcbiAgICAgICAgICAgICAgICAgJ2dyb3VwV2lkdGgnOiAnMzAlJ1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xuICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ10gPSdtZWRpYW4tcGVuc2lvbi1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBIZWFsdGgnXG4gICAgICAgIGggPSAnJ1xuICAgICAgICBoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgI3B1YmxpYyBzYWZldHkgcGllXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3B1YmxpYy1zYWZldHktcGllJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUHVibGljIFNhZmV0eSBFeHBlbnNlJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1B1YmxpYyBTYWZldHkgRXhwJ1xuICAgICAgICAgICAgICAgICAgMSAtIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnT3RoZXInXG4gICAgICAgICAgICAgICAgICBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonUHVibGljIHNhZmV0eSBleHBlbnNlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ3NsaWNlcyc6IHsgMToge29mZnNldDogMC4yfX1cbiAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDQ1XG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdwdWJsaWMtc2FmZXR5LXBpZSdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3B1YmxpYy1zYWZldHktcGllJ10gPSdwdWJsaWMtc2FmZXR5LXBpZSdcbiAgICAgICAgI2Zpbi1oZWFsdGgtcmV2ZW51ZSBncmFwaFxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICNjb25zb2xlLmxvZyAnIyMjYWwnK0pTT04uc3RyaW5naWZ5IGRhdGFcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9yZXZlbnVlX3Blcl9jYXBpdGEnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdSZXYuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVG90YWwgUmV2ZW51ZSBcXG4gUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIFJldmVudWUgUGVyIFxcbiBDYXBpdGEgRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnY2hhcnRBcmVhLndpZHRoJzogJzEwMCUnXG4gICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgICBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddID0nZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ1xuICAgICAgICAjZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGhcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX2V4cGVuZGl0dXJlc19wZXJfY2FwaXRhJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnRXhwLidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1RvdGFsIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSdcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3RvdGFsX2V4cGVuZGl0dXJlc19wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhIFxcbiBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYS53aWR0aCc6ICcxMDAlJ1xuICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkNvbHVtbkNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddID0nZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgU3RhdGVtZW50cydcbiAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgIGggPSAnJ1xuICAgICAgICAgICNoICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgICBoICs9IHJlbmRlcl9maW5hbmNpYWxfZmllbGRzIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMsIHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZSddXG4gICAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICAgI3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZVxuICAgICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ3RvdGFsLXJldmVudWUtcGllJ11cbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2F0ZWdvcnlfbmFtZSBpcyBcIlJldmVudWVzXCIpIGFuZCAoaXRlbS5jYXB0aW9uIGlzbnQgXCJUb3RhbCBSZXZlbnVlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIFJldmVudWVzJ1xuICAgICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxNlxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6IDM1MFxuICAgICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA2MFxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxuICAgICAgICAgICAgICAgICAgJ2ZvcmNlSUZyYW1lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYSc6e1xuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodDonNzUlJ1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3RvdGFsLXJldmVudWUtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddID0ndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJFeHBlbmRpdHVyZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIEV4cGVuZGl0dXJlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCcsICdjYWxsYmFjayc6IGRyYXdDaGFydCgpfSlgXG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ10gPSd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgZWxzZVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cblxuICAgIGxheW91dF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtdGVtcGxhdGUnXShkZXRhaWxfZGF0YSlcbiAgcmV0dXJuIHRlbXBsYXRlc1sndGFicGFuZWwtdGVtcGxhdGUnXShsYXlvdXRfZGF0YSlcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG4jIGNvbnZlcnRzIHRhYiB0ZW1wbGF0ZSBkZXNjcmliZWQgaW4gZ29vZ2xlIGZ1c2lvbiB0YWJsZSB0b1xuIyB0YWIgdGVtcGxhdGVcbmNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlPSh0ZW1wbCkgLT5cbiAgdGFiX2hhc2g9e31cbiAgdGFicz1bXVxuICAjIHJldHVybnMgaGFzaCBvZiBmaWVsZCBuYW1lcyBhbmQgdGhlaXIgcG9zaXRpb25zIGluIGFycmF5IG9mIGZpZWxkIG5hbWVzXG4gIGdldF9jb2xfaGFzaCA9IChjb2x1bW5zKSAtPlxuICAgIGNvbF9oYXNoID17fVxuICAgIGNvbF9oYXNoW2NvbF9uYW1lXT1pIGZvciBjb2xfbmFtZSxpIGluIHRlbXBsLmNvbHVtbnNcbiAgICByZXR1cm4gY29sX2hhc2hcblxuICAjIHJldHVybnMgZmllbGQgdmFsdWUgYnkgaXRzIG5hbWUsIGFycmF5IG9mIGZpZWxkcywgYW5kIGhhc2ggb2YgZmllbGRzXG4gIHZhbCA9IChmaWVsZF9uYW1lLCBmaWVsZHMsIGNvbF9oYXNoKSAtPlxuICAgIGZpZWxkc1tjb2xfaGFzaFtmaWVsZF9uYW1lXV1cblxuICAjIGNvbnZlcnRzIGhhc2ggdG8gYW4gYXJyYXkgdGVtcGxhdGVcbiAgaGFzaF90b19hcnJheSA9KGhhc2gpIC0+XG4gICAgYSA9IFtdXG4gICAgZm9yIGsgb2YgaGFzaFxuICAgICAgdGFiID0ge31cbiAgICAgIHRhYi5uYW1lPWtcbiAgICAgIHRhYi5maWVsZHM9aGFzaFtrXVxuICAgICAgYS5wdXNoIHRhYlxuICAgIHJldHVybiBhXG5cblxuICBjb2xfaGFzaCA9IGdldF9jb2xfaGFzaCh0ZW1wbC5jb2xfaGFzaClcbiAgcGxhY2Vob2xkZXJfY291bnQgPSAwXG5cbiAgZm9yIHJvdyxpIGluIHRlbXBsLnJvd3NcbiAgICBjYXRlZ29yeSA9IHZhbCAnZ2VuZXJhbF9jYXRlZ29yeScsIHJvdywgY29sX2hhc2hcbiAgICAjdGFiX2hhc2hbY2F0ZWdvcnldPVtdIHVubGVzcyB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICBmaWVsZG5hbWUgPSB2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXG4gICAgaWYgbm90IGZpZWxkbmFtZSB0aGVuIGZpZWxkbmFtZSA9IFwiX1wiICsgU3RyaW5nICsrcGxhY2Vob2xkZXJfY291bnRcbiAgICBmaWVsZE5hbWVzW3ZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hdPXZhbCAnZGVzY3JpcHRpb24nLCByb3csIGNvbF9oYXNoXG4gICAgZmllbGROYW1lc0hlbHBbZmllbGRuYW1lXSA9IHZhbCAnaGVscF90ZXh0Jywgcm93LCBjb2xfaGFzaFxuICAgIGlmIGNhdGVnb3J5XG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0/PVtdXG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0ucHVzaCBuOiB2YWwoJ24nLCByb3csIGNvbF9oYXNoKSwgbmFtZTogZmllbGRuYW1lLCBtYXNrOiB2YWwoJ21hc2snLCByb3csIGNvbF9oYXNoKVxuXG4gIGNhdGVnb3JpZXMgPSBPYmplY3Qua2V5cyh0YWJfaGFzaClcbiAgY2F0ZWdvcmllc19zb3J0ID0ge31cbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNcbiAgICBpZiBub3QgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XVxuICAgICAgY2F0ZWdvcmllc19zb3J0W2NhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5XVswXS5uXG4gICAgZmllbGRzID0gW11cbiAgICBmb3Igb2JqIGluIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgICAgZmllbGRzLnB1c2ggb2JqXG4gICAgZmllbGRzLnNvcnQgKGEsYikgLT5cbiAgICAgIHJldHVybiBhLm4gLSBiLm5cbiAgICB0YWJfaGFzaFtjYXRlZ29yeV0gPSBmaWVsZHNcblxuICBjYXRlZ29yaWVzX2FycmF5ID0gW11cbiAgZm9yIGNhdGVnb3J5LCBuIG9mIGNhdGVnb3JpZXNfc29ydFxuICAgIGNhdGVnb3JpZXNfYXJyYXkucHVzaCBjYXRlZ29yeTogY2F0ZWdvcnksIG46IG5cbiAgY2F0ZWdvcmllc19hcnJheS5zb3J0IChhLGIpIC0+XG4gICAgcmV0dXJuIGEubiAtIGIublxuXG4gIHRhYl9uZXdoYXNoID0ge31cbiAgZm9yIGNhdGVnb3J5IGluIGNhdGVnb3JpZXNfYXJyYXlcbiAgICB0YWJfbmV3aGFzaFtjYXRlZ29yeS5jYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeS5jYXRlZ29yeV1cblxuICB0YWJzID0gaGFzaF90b19hcnJheSh0YWJfbmV3aGFzaClcbiAgcmV0dXJuIHRhYnNcblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcbiAgQHRlbXBsYXRlcyA9IHVuZGVmaW5lZFxuICBAZGF0YSA9IHVuZGVmaW5lZFxuICBAZXZlbnRzID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG4gICAgQGV2ZW50cyA9IHt9XG4gICAgdGVtcGxhdGVMaXN0ID0gWyd0YWJwYW5lbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJywgJ3RhYmRldGFpbC1vZmZpY2lhbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtZmluYW5jaWFsLXN0YXRlbWVudHMtdGVtcGxhdGUnLCAncGVyc29uLWluZm8tdGVtcGxhdGUnXVxuICAgIHRlbXBsYXRlUGFydGlhbHMgPSBbJ3RhYi10ZW1wbGF0ZSddXG4gICAgQHRlbXBsYXRlcyA9IHt9XG4gICAgZm9yIHRlbXBsYXRlLGkgaW4gdGVtcGxhdGVMaXN0XG4gICAgICBAdGVtcGxhdGVzW3RlbXBsYXRlXSA9IEhhbmRsZWJhcnMuY29tcGlsZSgkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG4gICAgZm9yIHRlbXBsYXRlLGkgaW4gdGVtcGxhdGVQYXJ0aWFsc1xuICAgICAgSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwodGVtcGxhdGUsICQoJyMnICsgdGVtcGxhdGUpLmh0bWwoKSlcblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgcGFyZW50OnRoaXNcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICBAcGFyZW50LmRhdGEgPSBkYXRcbiAgICAgICAgcmVuZGVyX3RhYnMobGF5b3V0X2pzb24sIGRhdCwgdGhpcywgQHBhcmVudClcbiAgICAgIGJpbmQ6ICh0cGxfbmFtZSwgY2FsbGJhY2spIC0+XG4gICAgICAgIGlmIG5vdCBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0gPSBbY2FsbGJhY2tdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV0ucHVzaCBjYWxsYmFja1xuICAgICAgYWN0aXZhdGU6ICh0cGxfbmFtZSkgLT5cbiAgICAgICAgaWYgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgZm9yIGUsaSBpbiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICAgIGUgdHBsX25hbWUsIEBwYXJlbnQuZGF0YVxuXG4gIGxvYWRfdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcblxuICBsb2FkX2Z1c2lvbl90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgdCA9IGNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlIHRlbXBsYXRlX2pzb25cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lIHRoZW4gaVxuICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcIlxuXG4gIGFjdGl2YXRlOiAoaW5kLCB0cGxfbmFtZSkgLT5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICBAbGlzdFtpbmRdLmFjdGl2YXRlIHRwbF9uYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIiwiJCAtPlxuICAjJCgnI2dldFdpa2lwZWRpYUFydGljbGVCdXR0b24nKS5vbiAnY2xpY2snLCAtPlxuICAjICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAjYWxlcnRhbGVydCBcImhpXCJcbiAgI2FsZXJ0ICQoXCIjd2lraXBlZGlhUGFnZU5hbWVcIikudGV4dCgpXG4gICNnZXRfd2lraXBlZGlhX2FydGljbGUoKVxuICB3aW5kb3cuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlID0gZ2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4gIHdpbmRvdy5jcmVhdGVfd2lraXBlZGlhX2FydGljbGUgPSBjcmVhdGVfd2lraXBlZGlhX2FydGljbGVcblxuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlPShzKS0+XG4gIGFydGljbGVfbmFtZSA9IHMucmVwbGFjZSAvLipcXC8oW14vXSopJC8sIFwiJDFcIlxuICAkLmdldEpTT04gXCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXBhcnNlJnBhZ2U9I3thcnRpY2xlX25hbWV9JnByb3A9dGV4dCZmb3JtYXQ9anNvbiZjYWxsYmFjaz0/XCIsIChqc29uKSAtPiBcbiAgICAkKCcjd2lraXBlZGlhVGl0bGUnKS5odG1sIGpzb24ucGFyc2UudGl0bGVcbiAgICAkKCcjd2lraXBlZGlhQXJ0aWNsZScpLmh0bWwganNvbi5wYXJzZS50ZXh0W1wiKlwiXVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYTpub3QoLnJlZmVyZW5jZXMgYSlcIikuYXR0ciBcImhyZWZcIiwgLT4gIFwiaHR0cDovL3d3dy53aWtpcGVkaWEub3JnXCIgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhXCIpLmF0dHIgXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIlxuICBcbmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZT0gLT5cbiAgYWxlcnQgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldF93aWtpcGVkaWFfYXJ0aWNsZTpnZXRfd2lraXBlZGlhX2FydGljbGVcbiJdfQ==

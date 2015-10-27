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
    url: "http://45.55.0.145/api/government/get-markers-data?limit=600",
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
      return sortTable('[data-entity-type="Contribution"]', 0);
    } else if (type === 'name') {
      return sortTable('[data-entity-type="Contribution"]', 1);
    } else if (type === 'amount') {
      return sortTable('[data-entity-type="Contribution"]', 3);
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
          compiledTemplate = Handlebars.compile($('#legislation-vote').html());
          return $('#electedVotes').html(compiledTemplate(data));
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
    var add, associations, childs, data, entityType, i, key, len, modal, modalType, newRecord, obj, ref, ref1, ref2, select, selectName, selectedText, selectedValue, sendObject, tr, value;
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
      Get value from texarea.
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
      selectedText = $(select).find(':selected').text();
      associations[selectName] = selectedValue;
    } else if (modalType === 'addContributions') {

    } else if (modalType === 'addEndorsements') {

    } else if (modalType === 'addStatements') {
      select = modal.find('select')[0];
      selectName = select.name;
      selectedValue = select.options[select.selectedIndex].value;
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
    tr = document.createElement('tr');
    ref = sendObject.createRequest.fields.fields;
    for (key in ref) {
      value = ref[key];
      tr.innerHTML += "<td><a href='javascript:void(0);' class='editable editable-pre-wrapped editable-click'>" + value + "</a></td>";
    }
    if (modalType === 'addVotes') {

      /*
        Check if user specified how current elected official voted.
       */
      add = false;
      data = Object.create(null, {});
      console.log(sendObject.createRequest.fields.childs);
      ref1 = sendObject.createRequest.fields.childs;
      for (i = 0, len = ref1.length; i < len; i++) {
        obj = ref1[i];
        if (Number(obj.fields.associations.electedOfficial) === Number(person.id)) {
          add = true;
          data = obj.fields;
          break;
        }
      }
      if (add) {
        ref2 = data.fields;
        for (key in ref2) {
          value = ref2[key];
          tr.innerHTML += "<td><a href='javascript:void(0);' class='editable editable-pre-wrapped editable-click'>" + value + "</a></td>";
        }
        tr.innerHTML += "<td><a href='javascript:void(0);' class='editable editable-pre-wrapped editable-click'>" + selectedText + "</a></td>";
        $('#Votes tr:last-child').before(tr);
      }
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

$(function() {
  return $.ajax('/editrequest/new', {
    method: 'POST',
    complete: function(response) {
      if (response.status === 401) {
        return authorized = false;
      } else if (response.status === 200) {
        return authorized = true;
      }
    },
    error: function(error) {
      if (error.status === 401) {
        return authorized = false;
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9zaGVtaW4vV29ya3NwYWNlL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL3NoZW1pbi9Xb3Jrc3BhY2UvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFHZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLGNBQUEsRUFBZ0IsS0FOaEI7RUFPQSxVQUFBLEVBQVksS0FQWjtFQVFBLGNBQUEsRUFBZ0IsS0FSaEI7RUFTQSxXQUFBLEVBQWEsSUFUYjtFQVVBLGtCQUFBLEVBQ0U7SUFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFwQztHQVhGO0NBRFE7O0FBY1YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFTLENBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBNUIsQ0FBc0MsQ0FBQyxJQUF4RCxDQUE2RCxRQUFRLENBQUMsY0FBVCxDQUF3QixRQUF4QixDQUE3RDs7QUFFQSxnQkFBQSxHQUFtQixTQUFBO0FBQ2pCLE1BQUE7QUFBQTtBQUFBO09BQUEscUNBQUE7O2tCQUFBLFVBQUEsQ0FBVyxHQUFYO0FBQUE7O0FBRGlCOztBQUduQixjQUFBLEdBQWlCLFNBQUE7QUFDZixNQUFBO0VBQUEsV0FBQSxHQUFjLENBQUMsTUFBRCxFQUFTLGlCQUFULEVBQTRCLGtCQUE1QjtFQUNkLE9BQU8sQ0FBQyxpQkFBUixHQUE0QjtTQUM1QixDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDckIsUUFBQTtJQUFBLElBQUcsT0FBQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsSUFBWCxDQUFnQixNQUFoQixDQUFBLEVBQUEsYUFBMkIsV0FBM0IsRUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUEyQyxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsR0FBWCxDQUFBLENBQUEsS0FBb0IsR0FBbEU7YUFDRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEIsQ0FBL0IsRUFERjs7RUFEcUIsQ0FBdkI7QUFIZTs7QUFRakIsWUFBQSxHQUFlLFNBQUMsVUFBRCxFQUFhLFNBQWI7U0FDYixDQUFDLENBQUMsSUFBRixDQUNFO0lBQUEsR0FBQSxFQUFJLDhEQUFKO0lBRUEsSUFBQSxFQUFNO01BQUUsUUFBQSxFQUFVLFVBQVo7S0FGTjtJQUdBLFFBQUEsRUFBVSxNQUhWO0lBSUEsS0FBQSxFQUFPLElBSlA7SUFLQSxPQUFBLEVBQVMsU0FMVDtJQU1BLEtBQUEsRUFBTSxTQUFDLENBQUQ7YUFDSixPQUFPLENBQUMsR0FBUixDQUFZLENBQVo7SUFESSxDQU5OO0dBREY7QUFEYTs7QUFXZixDQUFBLENBQUUsU0FBQTtFQUVBLGNBQUEsQ0FBQTtFQUNBLFlBQUEsQ0FBYSxPQUFPLENBQUMsaUJBQXJCLEVBQXdDLFNBQUMsSUFBRDtJQUN0QyxPQUFPLENBQUMsT0FBUixHQUFrQjtXQUNsQixnQkFBQSxDQUFBO0VBRnNDLENBQXhDO0VBSUEsQ0FBQSxDQUFFLG1DQUFGLENBQXNDLENBQUMsRUFBdkMsQ0FBMEMsT0FBMUMsRUFBbUQsU0FBQTtBQUNqRCxRQUFBO0lBQUEsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLFdBQVIsQ0FBb0IsUUFBcEI7SUFDQSxZQUFBLEdBQWUsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFiO0lBQ2YsS0FBQSxHQUFRLFlBQVksQ0FBQyxHQUFiLENBQUE7SUFDUixZQUFZLENBQUMsR0FBYixDQUFvQixLQUFBLEtBQVMsR0FBWixHQUFxQixHQUFyQixHQUE4QixHQUEvQztJQUNBLGNBQUEsQ0FBQTtJQUNBLEdBQUcsQ0FBQyxhQUFKLENBQUE7V0FDQSxnQkFBQSxDQUFBO0VBUGlELENBQW5EO1NBU0EsQ0FBQSxDQUFFLDZCQUFGLENBQWdDLENBQUMsRUFBakMsQ0FBb0MsT0FBcEMsRUFBNkMsU0FBQTtJQUMzQyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsV0FBUixDQUFvQixRQUFwQjtJQUNBLElBQUcsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLFFBQVIsQ0FBaUIsUUFBakIsQ0FBSDthQUFtQyxPQUFPLENBQUMsWUFBUixDQUFxQixPQUFPLENBQUMsYUFBN0IsRUFBbkM7S0FBQSxNQUFBO2FBQW1GLEdBQUcsQ0FBQyxjQUFKLENBQUEsRUFBbkY7O0VBRjJDLENBQTdDO0FBaEJBLENBQUY7O0FBdUJBLFFBQUEsR0FBVSxTQUFDLFFBQUQ7QUFFUixNQUFBO0VBQUEsT0FBQSxHQUFTLFNBQUMsS0FBRDtXQUNQO01BQUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQTdCO01BQ0EsV0FBQSxFQUFhLENBRGI7TUFFQSxTQUFBLEVBQVUsS0FGVjtNQUdBLFlBQUEsRUFBYyxDQUhkO01BSUEsV0FBQSxFQUFZLE9BSlo7TUFNQSxLQUFBLEVBQU0sQ0FOTjs7RUFETztBQVNULFVBQU8sUUFBUDtBQUFBLFNBQ08sTUFEUDtBQUNtQixhQUFPLE9BQUEsQ0FBUSxLQUFSO0FBRDFCLFNBRU8saUJBRlA7QUFFOEIsYUFBTyxPQUFBLENBQVEsV0FBUjtBQUZyQyxTQUdPLGtCQUhQO0FBRytCLGFBQU8sT0FBQSxDQUFRLFFBQVI7QUFIdEM7QUFJTyxhQUFPLE9BQUEsQ0FBUSxPQUFSO0FBSmQ7QUFYUTs7QUFpQlYsUUFBQSxHQUFXLFNBQUMsT0FBRCxFQUFVLFFBQVY7QUFDVCxNQUFBO0FBQUEsT0FBQSwwQ0FBQTs7SUFDRSxJQUFlLElBQUEsS0FBUSxPQUF2QjtBQUFBLGFBQU8sS0FBUDs7QUFERjtTQUVBO0FBSFM7O0FBTVgsVUFBQSxHQUFhLFNBQUMsR0FBRDtBQUVYLE1BQUE7RUFBQSxLQUFBLEdBQVEsUUFBQSxDQUFTLEdBQUcsQ0FBQyxPQUFiLEVBQXNCLE9BQU8sQ0FBQyxpQkFBOUI7RUFDUixJQUFHLEtBQUEsS0FBUyxLQUFaO0FBQXVCLFdBQU8sTUFBOUI7O1NBQ0EsR0FBRyxDQUFDLFNBQUosQ0FDRTtJQUFBLEdBQUEsRUFBSyxHQUFHLENBQUMsUUFBVDtJQUNBLEdBQUEsRUFBSyxHQUFHLENBQUMsU0FEVDtJQUVBLElBQUEsRUFBTSxRQUFBLENBQVMsR0FBRyxDQUFDLE9BQWIsQ0FGTjtJQUdBLEtBQUEsRUFBVyxHQUFHLENBQUMsSUFBTCxHQUFVLElBQVYsR0FBYyxHQUFHLENBQUMsSUFINUI7SUFJQSxVQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQVMsd0VBQUEsR0FDaUUsR0FBRyxDQUFDLFdBRHJFLEdBQ2lGLEdBRGpGLEdBQ29GLEdBQUcsQ0FBQyxJQUR4RixHQUM2RixZQUQ3RixHQUN5RyxHQUFHLENBQUMsSUFEN0csR0FDa0gsNEJBRGxILEdBRUMsR0FBRyxDQUFDLElBRkwsR0FFVSxJQUZWLEdBRWMsR0FBRyxDQUFDLElBRmxCLEdBRXVCLEdBRnZCLEdBRTBCLEdBQUcsQ0FBQyxHQUY5QixHQUVrQyxHQUZsQyxHQUVxQyxHQUFHLENBQUMsS0FGekMsR0FFK0MsUUFGeEQ7S0FMRjtHQURGO0FBSlc7O0FBaUJiLFFBQUEsR0FBZSxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBYixDQUNiLCtFQURhLEVBRVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQWIsQ0FBbUIsRUFBbkIsRUFBdUIsRUFBdkIsQ0FGUyxFQUdULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLENBQW9CLENBQXBCLEVBQXVCLENBQXZCLENBSFMsRUFJVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixFQUFwQixFQUF3QixFQUF4QixDQUpTOztBQVFmLFlBQUEsR0FBZSxTQUFDLElBQUQsRUFBTSxJQUFOO1NBQ2IsS0FBSyxDQUFDLE9BQU4sQ0FDRTtJQUFBLE9BQUEsRUFBUyxJQUFUO0lBQ0EsUUFBQSxFQUFVLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDUixVQUFBO01BQUEsSUFBRyxNQUFBLEtBQVUsSUFBYjtRQUNFLE1BQUEsR0FBUyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUSxDQUFDO1FBQzdCLEdBQUcsQ0FBQyxTQUFKLENBQWMsTUFBTSxDQUFDLEdBQVAsQ0FBQSxDQUFkLEVBQTRCLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FBNUI7UUFDQSxHQUFHLENBQUMsU0FBSixDQUNFO1VBQUEsR0FBQSxFQUFLLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FBTDtVQUNBLEdBQUEsRUFBSyxNQUFNLENBQUMsR0FBUCxDQUFBLENBREw7VUFFQSxJQUFBLEVBQU0sT0FGTjtVQUdBLEtBQUEsRUFBTyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBSGxCO1VBSUEsVUFBQSxFQUNFO1lBQUEsT0FBQSxFQUFTLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxpQkFBcEI7V0FMRjtTQURGO1FBUUEsSUFBRyxJQUFIO1VBQ0UsR0FBRyxDQUFDLFNBQUosQ0FDRTtZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsUUFBVjtZQUNBLEdBQUEsRUFBSyxJQUFJLENBQUMsU0FEVjtZQUVBLElBQUEsRUFBTSxPQUZOO1lBR0EsS0FBQSxFQUFPLE1BSFA7WUFJQSxJQUFBLEVBQU0sUUFKTjtZQUtBLEtBQUEsRUFBVyxJQUFJLENBQUMsUUFBTixHQUFlLEdBQWYsR0FBa0IsSUFBSSxDQUFDLFNBTGpDO1lBTUEsVUFBQSxFQUNFO2NBQUEsT0FBQSxFQUFZLElBQUksQ0FBQyxRQUFOLEdBQWUsR0FBZixHQUFrQixJQUFJLENBQUMsU0FBbEM7YUFQRjtXQURGLEVBREY7O1FBV0EsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QiwwQkFBQSxHQUEyQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBQTlELEVBdEJGOztJQURRLENBRFY7R0FERjtBQURhOztBQThCZixNQUFNLENBQUMsT0FBUCxHQUNFO0VBQUEsR0FBQSxFQUFLLEdBQUw7Ozs7OztBQzlJRixJQUFBLDBCQUFBO0VBQUE7O0FBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVI7O0FBRVY7QUFHSixNQUFBOzt3QkFBQSxXQUFBLEdBQWEsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVosR0FBQTs7RUFHQSxxQkFBQyxhQUFELEVBQWlCLFFBQWpCLEVBQTJCLFNBQTNCO0lBQUMsSUFBQyxDQUFBLGdCQUFEO0lBQTBCLElBQUMsQ0FBQSxZQUFEOztJQUN0QyxDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLFFBQUw7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLEtBQUEsRUFBTyxJQUZQO01BR0EsT0FBQSxFQUFTLElBQUMsQ0FBQSxlQUhWO0tBREY7RUFEVzs7d0JBVWIsa0JBQUEsR0FBcUIsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsbUxBQW5COztFQVNyQixhQUFBLEdBQWdCOztFQUVoQixVQUFBLEdBQWE7O3dCQUViLFVBQUEsR0FBYSxTQUFBO0FBQ1gsUUFBQTtJQUFBLEtBQUEsR0FBTztBQUNQO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFHLE9BQU8sQ0FBQyxZQUFSLElBQXlCLENBQUMsQ0FBQyxLQUFGLEtBQWEsT0FBTyxDQUFDLFlBQWpEO0FBQW1FLGlCQUFuRTs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxlQUFSLElBQTRCLENBQUMsQ0FBQyxRQUFGLEtBQWdCLE9BQU8sQ0FBQyxlQUF2RDtBQUE0RSxpQkFBNUU7O01BQ0EsS0FBQTtBQUhGO0FBSUEsV0FBTztFQU5JOzt3QkFTYixlQUFBLEdBQWtCLFNBQUMsSUFBRDtJQUVoQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQztJQUNuQixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsS0FBaEIsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEtBQUQ7ZUFDcEIsS0FBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxHQUFoQixDQUFBO01BREc7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO0lBR0EsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUNULENBQUEsQ0FBRSxLQUFDLENBQUEsYUFBSCxDQUFpQixDQUFDLElBQWxCLENBQXVCLGFBQXZCLEVBQXNDLGlCQUF0QztNQURTO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRUUsSUFGRjtJQUlBLENBQUEsQ0FBRSxJQUFDLENBQUEsYUFBSCxDQUFpQixDQUFDLFNBQWxCLENBQ0k7TUFBQSxJQUFBLEVBQU0sS0FBTjtNQUNBLFNBQUEsRUFBVyxLQURYO01BRUEsU0FBQSxFQUFXLENBRlg7TUFHQSxVQUFBLEVBQ0M7UUFBQSxJQUFBLEVBQU0sa0JBQU47T0FKRDtLQURKLEVBT0k7TUFBQSxJQUFBLEVBQU0sVUFBTjtNQUNBLFVBQUEsRUFBWSxVQURaO01BRUEsTUFBQSxFQUFRLGFBQUEsQ0FBYyxJQUFDLENBQUEsVUFBZixFQUEyQixJQUFDLENBQUEsU0FBNUIsQ0FGUjtNQUlBLFNBQUEsRUFBVztRQUFBLFVBQUEsRUFBWSxJQUFDLENBQUEsa0JBQWI7T0FKWDtLQVBKLENBYUEsQ0FBQyxFQWJELENBYUksb0JBYkosRUFhMkIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksSUFBWjtRQUN2QixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsU0FBaEIsQ0FBMEIsS0FBMUIsRUFBaUMsS0FBQyxDQUFBLGFBQWxDO2VBQ0EsS0FBQyxDQUFBLFdBQUQsQ0FBYSxHQUFiLEVBQWtCLElBQWxCLEVBQXdCLElBQXhCO01BRnVCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWIzQixDQWlCQSxDQUFDLEVBakJELENBaUJJLHlCQWpCSixFQWlCK0IsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksSUFBWjtlQUMzQixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsR0FBaEIsQ0FBb0IsS0FBQyxDQUFBLGFBQXJCO01BRDJCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWpCL0I7RUFWZ0I7Ozs7OztBQXNDcEIsTUFBTSxDQUFDLE9BQVAsR0FBZTs7Ozs7O0FDL0VmOzs7Ozs7OztBQUFBLElBQUE7O0FBU0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxzQkFBUjs7QUFFZCxVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSOztBQUNiLFNBQUEsR0FBWSxPQUFBLENBQVEsb0JBQVI7O0FBRVosTUFBQSxHQUFTOztBQUNULFlBQUEsR0FBZTs7QUFDZixTQUFBLEdBQVksSUFBSTs7QUFDaEIsVUFBQSxHQUFhOztBQUNiLEtBQUEsR0FBUTs7QUFDUixVQUFBLEdBQWE7O0FBRWIsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsT0FBMUIsRUFBbUMsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLElBQVA7RUFDL0IsSUFBRyxNQUFIO0FBQ0ksV0FBTyxJQUFJLENBQUMsRUFBTCxDQUFRLElBQVIsRUFEWDtHQUFBLE1BQUE7QUFHSSxXQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUhYOztBQUQrQixDQUFuQzs7QUFNQSxNQUFNLENBQUMsT0FBUCxHQUNJO0VBQUEsWUFBQSxFQUFjLEVBQWQ7RUFDQSxlQUFBLEVBQWlCLEVBRGpCO0VBRUEsaUJBQUEsRUFBbUIsQ0FBQyxNQUFELEVBQVMsaUJBQVQsRUFBNEIsa0JBQTVCLENBRm5CO0VBSUEsZ0JBQUEsRUFBa0IsU0FBQTtJQUNkLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7SUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxNQUF0QixDQUE2QixHQUE3QjtXQUNBLGtCQUFBLENBQW1CLEdBQW5CO0VBSmMsQ0FKbEI7RUFVQSxjQUFBLEVBQWdCLFNBQUE7SUFDWixDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7SUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxNQUFwQixDQUEyQixHQUEzQjtXQUNBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLElBQXRCLENBQUE7RUFIWSxDQVZoQjs7O0FBZUosT0FBTyxDQUFDLFlBQVIsR0FBdUIsWUFBQSxHQUFlLFNBQUMsUUFBRDtTQUNsQyxDQUFDLENBQUMsSUFBRixDQUNJO0lBQUEsR0FBQSxFQUFLLHlDQUFMO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxLQUFBLEVBQU8sSUFGUDtJQUdBLE9BQUEsRUFBUyxTQUFDLFlBQUQ7YUFDTCxRQUFBLENBQVMsWUFBVDtJQURLLENBSFQ7R0FESjtBQURrQzs7QUFRdEMsT0FBTyxDQUFDLGFBQVIsR0FBd0IsYUFBQSxHQUFnQixTQUFDLFlBQUQ7QUFDcEMsTUFBQTtBQUFBO0FBQUE7T0FBQSxxQ0FBQTs7aUJBQ08sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE1BQUQ7ZUFDQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVgsQ0FBdUI7VUFDbkIsS0FBQSxFQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FESjtVQUVuQixVQUFBLEVBQVksSUFGTztVQUduQixXQUFBLEVBQWEsU0FITTtVQUluQixhQUFBLEVBQWUsR0FKSTtVQUtuQixZQUFBLEVBQWMsR0FMSztVQU1uQixTQUFBLEVBQVcsU0FOUTtVQU9uQixXQUFBLEVBQWEsSUFQTTtVQVFuQixRQUFBLEVBQVUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQVJUO1VBU25CLE9BQUEsRUFBUyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBVFI7VUFVbkIsTUFBQSxFQUFZLElBQUEsZUFBQSxDQUFnQjtZQUN4QixRQUFBLEVBQWMsSUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQVosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FEVTtZQUV4QixTQUFBLEVBQVcsS0FGYTtZQUd4QixXQUFBLEVBQWEsS0FIVztZQUl4QixHQUFBLEVBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUpRO1lBS3hCLFlBQUEsRUFBYyxNQUFNLENBQUMsVUFBVSxDQUFDLElBTFI7WUFNeEIsV0FBQSxFQUFpQixJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBWixDQUFrQixDQUFDLEVBQW5CLEVBQXVCLEVBQXZCLENBTk87WUFPeEIsVUFBQSxFQUFZLGVBUFk7WUFReEIsVUFBQSxFQUFZO2NBQUMsT0FBQSxFQUFTLEdBQVY7YUFSWTtZQVN4QixJQUFBLEVBQU0seUJBVGtCO1lBVXhCLE9BQUEsRUFBUyxLQVZlO1dBQWhCLENBVk87VUFzQm5CLFNBQUEsRUFBVyxTQUFBO21CQUNQLElBQUksQ0FBQyxVQUFMLENBQWdCO2NBQUMsU0FBQSxFQUFXLFNBQVo7YUFBaEI7VUFETyxDQXRCUTtVQXdCbkIsU0FBQSxFQUFXLFNBQUMsS0FBRDtZQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixLQUFLLENBQUMsTUFBOUI7bUJBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFaLENBQXVCLElBQXZCO1VBRk8sQ0F4QlE7VUEyQm5CLFFBQUEsRUFBVSxTQUFBO1lBQ04sSUFBSSxDQUFDLFVBQUwsQ0FBZ0I7Y0FBQyxTQUFBLEVBQVcsU0FBWjthQUFoQjttQkFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVosQ0FBdUIsS0FBdkI7VUFGTSxDQTNCUztVQThCbkIsS0FBQSxFQUFPLFNBQUE7QUFDSCxnQkFBQTtZQUFBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7WUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO1lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtZQUNBLEdBQUEsR0FBTSxHQUFBLEdBQUksTUFBTSxDQUFDLGFBQVgsR0FBeUIsR0FBekIsR0FBNEIsTUFBTSxDQUFDLFVBQVUsQ0FBQzttQkFDcEQsQ0FBQyxDQUFDLElBQUYsQ0FDSTtjQUFBLEdBQUEsRUFBSyxtQ0FBQSxHQUFzQyxHQUEzQztjQUNBLFFBQUEsRUFBVSxNQURWO2NBRUEsS0FBQSxFQUFPLElBRlA7Y0FHQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBQ0wsb0JBQUE7Z0JBQUEscUJBQUEsR0FBd0IsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEI7Z0JBQ3hCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLHFCQUFuQjtnQkFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO2dCQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7Z0JBQ0EsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBO3VCQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtrQkFBQyxRQUFBLEVBQVUscUJBQVg7aUJBQXpCLEVBQTRELG9CQUE1RCxFQUFrRixHQUFsRjtjQU5LLENBSFQ7YUFESjtVQUxHLENBOUJZO1NBQXZCO01BREQ7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUgsQ0FBSSxNQUFKO0FBREo7O0FBRG9DOztBQW1EeEMsTUFBTSxDQUFDLFlBQVAsR0FBc0IsU0FBQyxJQUFEO1NBQVMsVUFBQSxHQUFhO0FBQXRCOztBQUV0QixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLE9BQWYsRUFBd0IsY0FBeEIsRUFBd0MsU0FBQyxDQUFEO0FBQ3BDLE1BQUE7RUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxhQUFKLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBeEI7RUFDYixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7RUFDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxRQUF4QztFQUNBLENBQUEsQ0FBRSxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixNQUF4QixDQUFGLENBQWtDLENBQUMsUUFBbkMsQ0FBNEMsUUFBNUM7RUFDQSxTQUFTLENBQUMsUUFBVixDQUFtQixDQUFuQixFQUFzQixVQUF0QjtFQUVBLElBQUcsVUFBQSxLQUFjLHNCQUFqQjtJQUNJLGVBQUEsR0FBa0I7SUFDbEIsZUFBQSxHQUFrQjtJQUNsQixlQUFBLEdBQWtCO0lBRWxCLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxpREFBRixDQUFvRCxDQUFDLEdBQXJELENBQXlELE9BQXpELEVBQWtFLGVBQUEsR0FBa0IsRUFBcEY7SUFDQSxDQUFBLENBQUUsaURBQUYsQ0FBb0QsQ0FBQyxHQUFyRCxDQUF5RCxPQUF6RCxFQUFrRSxlQUFBLEdBQWtCLEVBQXBGO1dBQ0EsQ0FBQSxDQUFFLGlEQUFGLENBQW9ELENBQUMsR0FBckQsQ0FBeUQsT0FBekQsRUFBa0UsZUFBQSxHQUFrQixFQUFwRixFQXpCSjs7QUFQb0MsQ0FBeEM7O0FBa0NBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxPQUFaLENBQW9CO0VBQUMsUUFBQSxFQUFVLHlCQUFYO0VBQXNDLE9BQUEsRUFBUyxPQUEvQztDQUFwQjs7QUFFQSxZQUFBLEdBQWUsU0FBQTtTQUNYLENBQUEsQ0FBRSx5QkFBQSxHQUEwQixVQUExQixHQUFxQyxJQUF2QyxDQUEyQyxDQUFDLEdBQTVDLENBQWdELE1BQWhEO0FBRFc7O0FBSWYsV0FBQSxHQUFjLFNBQUMsS0FBRDtFQUVWLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQThCLEVBQTlCO1NBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyxxQ0FBQSxHQUFzQyxLQUEzQztJQUNBLFFBQUEsRUFBVSxNQURWO0lBRUEsT0FBQSxFQUFTO01BQUMsaUNBQUEsRUFBbUMsU0FBcEM7S0FGVDtJQUdBLEtBQUEsRUFBTyxJQUhQO0lBSUEsT0FBQSxFQUFTLFNBQUMsSUFBRDtNQUNMLElBQUcsSUFBSDtRQUNJLHdCQUFBLENBQXlCLElBQUksQ0FBQyxHQUE5QixFQUFtQyxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLEtBQXBCO1VBQy9CLElBQUksQ0FBQyxvQkFBTCxHQUE0QjtpQkFDNUIscUJBQUEsQ0FBc0IsSUFBSSxDQUFDLEdBQTNCLEVBQWdDLEVBQWhDLEVBQW9DLFNBQUMsS0FBRCxFQUFRLFdBQVIsRUFBcUIsTUFBckI7WUFDaEMsSUFBSSxDQUFDLGlCQUFMLEdBQXlCO21CQUN6QixhQUFBLENBQWMsU0FBQyxrQkFBRDtjQUNWLElBQUksQ0FBQyxTQUFMLEdBQWlCLGtCQUFrQixDQUFDLE1BQU8sQ0FBQSxDQUFBO3FCQUkzQyxZQUFBLENBQUE7WUFMVSxDQUFkO1VBRmdDLENBQXBDO1FBRitCLENBQW5DLEVBREo7O0lBREssQ0FKVDtJQXNCQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0F0QlA7R0FESjtBQUhVOztBQThCZCxxQkFBQSxHQUF3QixTQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFNBQXJCO1NBQ3BCLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssb0NBQUEsR0FBdUMsUUFBdkMsR0FBa0QsR0FBbEQsR0FBd0QsUUFBN0Q7SUFDQSxRQUFBLEVBQVUsTUFEVjtJQUVBLEtBQUEsRUFBTyxJQUZQO0lBR0EsT0FBQSxFQUFTLFNBSFQ7SUFJQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0FKUDtHQURKO0FBRG9COztBQVN4Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxTQUFUO1NBQ3ZCLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssOERBQUw7SUFDQSxJQUFBLEVBQ0k7TUFBQSxRQUFBLEVBQVUsU0FBVjtNQUNBLEtBQUEsRUFBTyxnQ0FEUDtNQUVBLE1BQUEsRUFBUTtRQUNKO1VBQUEsSUFBQSxFQUFNLFNBQU47VUFDQSxVQUFBLEVBQVksSUFEWjtVQUVBLEtBQUEsRUFBTyxNQUZQO1NBREk7T0FGUjtLQUZKO0lBVUEsUUFBQSxFQUFVLE1BVlY7SUFXQSxLQUFBLEVBQU8sSUFYUDtJQVlBLE9BQUEsRUFBUyxTQVpUO0lBYUEsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBYlA7R0FESjtBQUR1Qjs7QUFtQjNCLGFBQUEsR0FBZ0IsU0FBQyxTQUFEO1NBQ1osQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyx5Q0FBTDtJQUNBLElBQUEsRUFDSTtNQUFBLFFBQUEsRUFBVSxTQUFWO0tBRko7SUFHQSxRQUFBLEVBQVUsTUFIVjtJQUlBLEtBQUEsRUFBTyxJQUpQO0lBS0EsT0FBQSxFQUFTLFNBTFQ7R0FESjtBQURZOztBQVNoQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWYsR0FBNkIsQ0FBQSxTQUFBLEtBQUE7U0FBQSxTQUFDLEdBQUQ7SUFDekIsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsR0FBdEIsQ0FBbkI7SUFDQSxZQUFBLENBQUE7SUFDQSxPQUFPLENBQUMsY0FBUixDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsR0FBRyxDQUFDLEdBQXBCO0VBSnlCO0FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTs7QUFPN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFmLEdBQThCLENBQUEsU0FBQSxLQUFBO1NBQUEsU0FBQyxHQUFEO1dBQzFCLHFCQUFBLENBQXNCLEdBQUcsQ0FBQyxXQUExQixFQUF1QyxHQUFHLENBQUMsSUFBM0MsRUFBaUQsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixLQUFuQjtBQUM3QyxVQUFBO01BQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCO01BQ3hCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQW5CLEVBQXNCLEdBQXRCLENBQW5CO01BRUEsWUFBQSxDQUFBO01BQ0EsT0FBTyxDQUFDLGNBQVIsQ0FBQTtNQUNBLEdBQUEsR0FBTSxHQUFHLENBQUMsV0FBSixHQUFrQixHQUFsQixHQUF3QixHQUFHLENBQUM7YUFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFsQixHQUE2QjtJQVBnQixDQUFqRDtFQUQwQjtBQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7O0FBVzlCLGNBQUEsR0FBaUIsU0FBQyxTQUFELEVBQVksSUFBWixFQUFrQixPQUFsQixFQUEyQixvQkFBM0I7U0FDYixDQUFDLENBQUMsSUFBRixDQUNJO0lBQUEsR0FBQSxFQUFLLHFHQUFMO0lBQ0EsSUFBQSxFQUFNLE1BRE47SUFFQSxXQUFBLEVBQWEsa0JBRmI7SUFHQSxRQUFBLEVBQVUsTUFIVjtJQUlBLElBQUEsRUFBTSxPQUpOO0lBS0EsS0FBQSxFQUFPLElBTFA7SUFNQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQ7QUFDTCxZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQztRQUNkLG9CQUFBLENBQXFCLFNBQXJCLEVBQWdDLElBQWhDLEVBQXNDLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBdEMsRUFBcUQsb0JBQXJEO01BRks7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlQ7SUFVQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0FWUDtHQURKO0FBRGE7O0FBZ0JqQixvQkFBQSxHQUF1QixTQUFDLFNBQUQsRUFBWSxJQUFaLEVBQWtCLEdBQWxCLEVBQXVCLG9CQUF2QjtBQUNuQixNQUFBO0VBQUEsQ0FBQSxHQUFJLHdFQUFBLEdBQXlFLElBQXpFLEdBQThFO0FBQ2xGLE9BQUEscUNBQUE7O1FBQTREO01BQTVELENBQUEsSUFBSyxpQkFBQSxHQUFrQixDQUFsQixHQUFvQixJQUFwQixHQUF3QixDQUF4QixHQUEwQjs7QUFBL0I7RUFDQSxDQUFBLElBQUs7RUFDTCxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUY7RUFDVCxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsTUFBYixDQUFvQixNQUFwQjtFQUdBLElBQUcsSUFBQSxLQUFRLFNBQVg7SUFDSSxNQUFNLENBQUMsR0FBUCxDQUFXLElBQVg7SUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQWYsR0FBOEIsS0FGbEM7O1NBSUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQ7QUFDVixRQUFBO0lBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSjtJQUNMLE1BQU0sQ0FBQyxPQUFRLENBQUEsb0JBQUEsQ0FBZixHQUF1QyxFQUFFLENBQUMsR0FBSCxDQUFBO1dBQ3ZDLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsWUFBWSxDQUFDLFVBQWIsQ0FBQSxDQUF2QjtFQUhVLENBQWQ7QUFabUI7O0FBaUJ2QixzQkFBQSxHQUF5QixTQUFBO0FBQ3JCLE1BQUE7RUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLFVBQUY7RUFDTixHQUFBLEdBQU0sQ0FBQSxDQUFFLHFCQUFGO1NBQ04sR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFHLENBQUMsS0FBSixDQUFBLENBQVY7QUFIcUI7O0FBTXpCLCtCQUFBLEdBQWtDLFNBQUE7U0FDOUIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQTtXQUNiLHNCQUFBLENBQUE7RUFEYSxDQUFqQjtBQUQ4Qjs7QUFJbEMsa0JBQUEsR0FBcUIsU0FBQyxJQUFEO1NBQ2pCLFVBQUEsQ0FBVyxDQUFDLFNBQUE7V0FBRyxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsS0FBZCxDQUFBO0VBQUgsQ0FBRCxDQUFYLEVBQXVDLElBQXZDO0FBRGlCOztBQUtyQixNQUFNLENBQUMsWUFBUCxHQUFzQixTQUFDLENBQUQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSSxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3BCLElBQUcsQ0FBSSxDQUFQO1dBQ0ksT0FBTyxDQUFDLGdCQUFSLENBQUEsRUFESjs7QUFGa0I7O0FBT3RCLEtBQUEsR0FBUSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUEzQixDQUFpQyxHQUFqQyxDQUFxQyxDQUFDLE1BQXRDLENBQTZDLFNBQUMsR0FBRDtFQUFRLElBQUcsR0FBQSxLQUFTLEVBQVo7V0FBb0IsSUFBcEI7R0FBQSxNQUFBO1dBQTZCLE1BQTdCOztBQUFSLENBQTdDOztBQUNSLFNBQUEsR0FBWSxLQUFLLENBQUM7O0FBRWxCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUMsS0FBRDtBQUNkLE1BQUE7RUFBQSxJQUFHLEtBQUEsS0FBUyxDQUFaO0lBQ0ksZUFBQSxHQUFrQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0lBQ2xCLElBQUcsZUFBQSxLQUFtQixFQUF0QjtNQUNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QixFQUF6QixFQUE2QixvQkFBN0IsRUFBbUQsR0FBbkQ7TUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7TUFDQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUEsRUFISjtLQUFBLE1BQUE7TUFLSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQWxCLEdBQTZCLElBTGpDOztJQU1BLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0FBQ0EsV0FBTyxNQVZYOztFQVdBLElBQUksT0FBTyxDQUFDLEtBQVIsS0FBaUIsSUFBakIsSUFBeUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFkLEtBQTBCLE1BQXZEO1dBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFmLENBQWtCLEtBQWxCLEVBREo7R0FBQSxNQUFBO0lBR0ksS0FBSyxDQUFDLEdBQU4sQ0FBQTtXQUNBLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBbEIsR0FBNkIsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUp2Qzs7QUFaYzs7QUFrQmxCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxTQUFDLEtBQUQ7RUFDaEMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQTNCO0VBQ0EsSUFBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWYsS0FBMEIsSUFBN0I7SUFDSSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQS9CO0lBQ0EsS0FBQSxHQUFRLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQTNCLENBQWlDLEdBQWpDLENBQXFDLENBQUMsTUFBdEMsR0FBNkM7SUFDckQsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUFtQixDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUEsRUFBbkI7O0lBQ0EsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUFtQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLEVBQW5COztXQUNBLE9BQU8sQ0FBQyxjQUFSLENBQUEsRUFMSjtHQUFBLE1BQUE7V0FPSSxPQUFPLENBQUMsZ0JBQVIsQ0FBQSxFQVBKOztBQUZnQyxDQUFwQzs7QUFjQSxjQUFBLEdBQWlCLFNBQUMsYUFBRCxFQUFnQixNQUFoQixFQUF3QixRQUF4QjtTQUNiLE1BQU0sQ0FBQyxLQUFQLENBQ0k7SUFBQSxNQUFBLEVBQVEsSUFBUjtJQUNBLE1BQUEsRUFBUSxTQUFBO01BQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFWLEdBQXVCO01BQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBVixHQUFnQjthQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsR0FBa0I7SUFIZCxDQURSO0dBREo7QUFEYTs7QUFhakIsU0FBQSxHQUFZLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFJUixNQUFBO0VBQUEsSUFBQSxHQUFPLENBQUEsQ0FBRSxLQUFBLEdBQVEsbUJBQVYsQ0FBOEIsQ0FBQyxHQUEvQixDQUFBO0VBSVAsT0FBQSxHQUFVLENBQUEsQ0FBRSxLQUFBLEdBQVEsaUJBQVYsQ0FBNEIsQ0FBQyxHQUE3QixDQUFBO0VBSVYsTUFBQSxHQUFTLENBQUEsQ0FBRSxLQUFBLEdBQVEsaUJBQVYsQ0FBNEIsQ0FBQyxRQUE3QixDQUFzQyxJQUF0QyxDQUEyQyxDQUFDLEVBQTVDLENBQStDLE1BQS9DO0VBQ1QsUUFBQSxHQUFXO0VBRVgsSUFBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQixDQUFIO0lBS0UsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsTUFBbkIsQ0FBMEIsQ0FBQyxRQUEzQixDQUFvQyxRQUFwQztJQUNBLElBQUEsR0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVo7SUFDUCxRQUFBLEdBQVcsTUFQYjtHQUFBLE1BUUssSUFBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFoQixDQUFIO0lBS0gsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsS0FBbkIsQ0FBeUIsQ0FBQyxRQUExQixDQUFtQyxNQUFuQztJQUNBLFlBQUEsR0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ2IsVUFBQTtNQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixNQUF2QixDQUE4QixDQUFDLElBQS9CLENBQUEsQ0FBcUMsQ0FBQyxXQUF0QyxDQUFBO01BQ0osQ0FBQSxHQUFJLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFtQixDQUFDLEVBQXBCLENBQXVCLE1BQXZCLENBQThCLENBQUMsSUFBL0IsQ0FBQSxDQUFxQyxDQUFDLFdBQXRDLENBQUE7TUFDSixJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsZUFBTyxFQUFyQjs7TUFDQSxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsZUFBTyxDQUFDLEVBQXRCOztBQUNBLGFBQU87SUFMTSxFQU5aO0dBQUEsTUFhQSxJQUFHLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFFBQWhCLENBQUg7SUFLSCxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFoQjtJQUNBLFlBQUEsR0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKO0FBQ2IsVUFBQTtNQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixNQUF2QixDQUE4QixDQUFDLElBQS9CLENBQUEsQ0FBcUMsQ0FBQyxXQUF0QyxDQUFBO01BQ0osQ0FBQSxHQUFJLENBQUEsQ0FBRSxDQUFGLENBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFtQixDQUFDLEVBQXBCLENBQXVCLE1BQXZCLENBQThCLENBQUMsSUFBL0IsQ0FBQSxDQUFxQyxDQUFDLFdBQXRDLENBQUE7TUFDSixJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsZUFBTyxDQUFDLEVBQXRCOztNQUNBLElBQUcsQ0FBQSxHQUFJLENBQVA7QUFBYyxlQUFPLEVBQXJCOztBQUNBLGFBQU87SUFMTSxFQU5aO0dBQUEsTUFBQTtJQWtCSCxNQUFNLENBQUMsUUFBUCxDQUFnQixLQUFoQjtJQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixFQUFzQixJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBdEI7SUFFQSxZQUFBLEdBQWUsU0FBQyxDQUFELEVBQUksQ0FBSjtBQUNiLFVBQUE7TUFBQSxDQUFBLEdBQUksQ0FBQSxDQUFFLENBQUYsQ0FBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQW1CLENBQUMsRUFBcEIsQ0FBdUIsTUFBdkIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBLENBQXFDLENBQUMsV0FBdEMsQ0FBQTtNQUNKLENBQUEsR0FBSSxDQUFBLENBQUUsQ0FBRixDQUFJLENBQUMsUUFBTCxDQUFjLElBQWQsQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixNQUF2QixDQUE4QixDQUFDLElBQS9CLENBQUEsQ0FBcUMsQ0FBQyxXQUF0QyxDQUFBO01BQ0osSUFBRyxDQUFBLEdBQUksQ0FBUDtBQUFjLGVBQU8sQ0FBQyxFQUF0Qjs7TUFDQSxJQUFHLENBQUEsR0FBSSxDQUFQO0FBQWMsZUFBTyxFQUFyQjs7QUFDQSxhQUFPO0lBTE0sRUFyQlo7O0VBNEJMLElBQUksUUFBSjtJQUFtQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBbkI7O0VBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFQLEVBQWEsU0FBQyxLQUFELEVBQVEsR0FBUjtXQUNULENBQUEsQ0FBRSxLQUFGLENBQVEsQ0FBQyxRQUFULENBQWtCLE9BQWxCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsR0FBbEM7RUFEUyxDQUFiO1NBRUEsQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLFFBQVQsQ0FBa0IsT0FBbEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxPQUFsQztBQW5FUTs7QUFxRVosaUJBQUEsR0FBb0IsU0FBQyxNQUFEO0VBQ2hCLENBQUEsQ0FBRSx5QkFBRixDQUE0QixDQUFDLE9BQTdCLENBQUE7RUFFQSxDQUFBLENBQUUsV0FBRixDQUFjLENBQUMsUUFBZixDQUF3QjtJQUFDLFdBQUEsRUFBYSxLQUFkO0lBQW9CLElBQUEsRUFBTSxVQUExQjtJQUFzQyxXQUFBLEVBQWEsUUFBbkQ7SUFBNkQsT0FBQSxFQUFTLElBQXRFO0lBQTRFLFNBQUEsRUFBVyxHQUF2RjtHQUF4QjtFQUNBLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxHQUFmLENBQW1CLE9BQW5CO0VBRUEsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLG1CQUF2QixFQUE0QyxTQUFDLENBQUQ7SUFDeEMsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtJQUNBLENBQUMsQ0FBQyxlQUFGLENBQUE7SUFDQSxJQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQXhCLEtBQXdDLE1BQTNDO0FBQTBELGFBQTFEOztJQUNBLElBQUksQ0FBQyxVQUFMO2FBQ0ksQ0FBQyxDQUFDLElBQUYsQ0FBTyxrQkFBUCxFQUEyQjtRQUN2QixNQUFBLEVBQVEsTUFEZTtRQUV2QixRQUFBLEVBQVUsU0FBQyxRQUFEO1VBQ04sSUFBRyxRQUFRLENBQUMsTUFBVCxLQUFtQixHQUF0QjttQkFDSSxTQUFBLENBQVUsUUFBVixFQURKO1dBQUEsTUFFSyxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLEdBQXRCO1lBQ0QsVUFBQSxHQUFhO21CQUNiLENBQUEsQ0FBRSxDQUFDLENBQUMsYUFBSixDQUFrQixDQUFDLE9BQW5CLENBQTJCLElBQTNCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsV0FBdEMsQ0FBa0QsQ0FBQyxRQUFuRCxDQUE0RCxRQUE1RCxFQUZDOztRQUhDLENBRmE7UUFRdkIsS0FBQSxFQUFPLFNBQUMsS0FBRDtVQUNILElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7bUJBQTRCLFNBQUEsQ0FBVSxRQUFWLEVBQTVCOztRQURHLENBUmdCO09BQTNCLEVBREo7S0FBQSxNQUFBO2FBYUksQ0FBQSxDQUFFLENBQUMsQ0FBQyxhQUFKLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsSUFBM0IsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxXQUF0QyxDQUFrRCxDQUFDLFFBQW5ELENBQTRELFFBQTVELEVBYko7O0VBSndDLENBQTVDO0VBc0JBLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxFQUFYLENBQWMsT0FBZCxFQUF1QixTQUFDLENBQUQ7QUFDckIsUUFBQTtJQUFBLENBQUMsQ0FBQyxjQUFGLENBQUE7SUFDQSxDQUFDLENBQUMsZUFBRixDQUFBO0lBQ0EsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsZ0JBQWI7SUFFUCxJQUFHLElBQUEsS0FBUSxNQUFYO2FBSUUsU0FBQSxDQUFVLG1DQUFWLEVBQStDLENBQS9DLEVBSkY7S0FBQSxNQUtLLElBQUcsSUFBQSxLQUFRLE1BQVg7YUFJSCxTQUFBLENBQVUsbUNBQVYsRUFBK0MsQ0FBL0MsRUFKRztLQUFBLE1BS0EsSUFBRyxJQUFBLEtBQVEsUUFBWDthQUlILFNBQUEsQ0FBVSxtQ0FBVixFQUErQyxDQUEvQyxFQUpHOztFQWZnQixDQUF2QjtFQXFCQSxDQUFBLENBQUUsR0FBRixDQUFNLENBQUMsRUFBUCxDQUFVLE1BQVYsRUFBa0IsU0FBQyxDQUFELEVBQUksTUFBSjtBQUNkLFFBQUE7SUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxhQUFKLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsT0FBM0IsQ0FBb0MsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFPLENBQUM7SUFDNUQsRUFBQSxHQUFLLENBQUEsQ0FBRSxDQUFDLENBQUMsYUFBSixDQUFrQixDQUFDLE9BQW5CLENBQTJCLElBQTNCLENBQWlDLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDO0lBQ2pELEtBQUEsR0FBUSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQUEsQ0FBRSxDQUFDLENBQUMsYUFBSixDQUFrQixDQUFDLE9BQW5CLENBQTJCLElBQTNCLENBQWlDLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBaEQsQ0FBeUQsQ0FBQSxDQUFBO0lBQ2pFLFVBQUEsR0FBYTtNQUNULFdBQUEsRUFBYTtRQUNULFVBQUEsRUFBWSxVQURIO1FBRVQsUUFBQSxFQUFVLEVBRkQ7UUFHVCxPQUFBLEVBQVMsRUFIQTtPQURKOztJQU9iLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBUSxDQUFBLEtBQUEsQ0FBL0IsR0FBd0MsTUFBTSxDQUFDO0lBQy9DLFVBQVUsQ0FBQyxXQUFYLEdBQXlCLElBQUksQ0FBQyxTQUFMLENBQWUsVUFBVSxDQUFDLFdBQTFCO0lBQ3pCLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWjtXQUNBLENBQUMsQ0FBQyxJQUFGLENBQU8scUJBQVAsRUFBOEI7TUFDMUIsTUFBQSxFQUFRLE1BRGtCO01BRTFCLElBQUEsRUFBTSxVQUZvQjtNQUcxQixRQUFBLEVBQVUsV0FIZ0I7TUFJMUIsT0FBQSxFQUFTLFNBQUMsUUFBRDtBQUNMLFlBQUE7ZUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFRLENBQUMsWUFBcEI7TUFERixDQUppQjtNQU0xQixLQUFBLEVBQU8sU0FBQyxLQUFEO1FBQ0gsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFuQjtpQkFBNEIsU0FBQSxDQUFVLFFBQVYsRUFBNUI7O01BREcsQ0FObUI7S0FBOUI7RUFkYyxDQUFsQjtFQXdCQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsTUFBdkIsRUFBK0IsU0FBQyxDQUFEO0FBQzNCLFFBQUE7SUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLENBQUMsQ0FBQyxNQUFKLENBQVcsQ0FBQyxPQUFaLENBQW9CLFdBQXBCO0lBQ1YsU0FBQSxHQUFZLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQztJQUN2QixJQUFJLENBQUMsVUFBTDtNQUNFLENBQUMsQ0FBQyxJQUFGLENBQU8sa0JBQVAsRUFBMkI7UUFDekIsTUFBQSxFQUFRLE1BRGlCO1FBRXpCLFFBQUEsRUFBVSxTQUFDLFFBQUQ7VUFDUixJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLEdBQXRCO21CQUNFLFNBQUEsQ0FBVSxRQUFWLEVBREY7V0FBQSxNQUVLLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsR0FBdEI7bUJBQ0gsVUFBQSxHQUFhLEtBRFY7O1FBSEcsQ0FGZTtRQU96QixLQUFBLEVBQU8sU0FBQyxLQUFEO1VBQ0wsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFuQjttQkFBNEIsU0FBQSxDQUFVLFFBQVYsRUFBNUI7O1FBREssQ0FQa0I7T0FBM0I7QUFVQSxhQUFPLE1BWFQ7O0lBNkJBLGFBQUEsR0FBZ0I7SUFDaEIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaO0lBQ0EsSUFBRyxTQUFBLEtBQWEsT0FBaEI7TUFDSSxhQUFBLEdBQWdCO01BQ2hCLENBQUEsQ0FBRSxXQUFGLENBQWMsQ0FBQyxLQUFmLENBQXFCLFFBQXJCLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsTUFBcEMsQ0FBNEMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUEvQyxDQUFBLEVBRko7S0FBQSxNQUdLLElBQUcsU0FBQSxLQUFhLGVBQWhCO01BQ0QsYUFBQSxHQUFnQjtNQUNoQixDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxLQUF2QixDQUE2QixRQUE3QixDQUFzQyxDQUFDLElBQXZDLENBQTRDLE1BQTVDLENBQW9ELENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBdkQsQ0FBQSxFQUZDO0tBQUEsTUFHQSxJQUFHLFNBQUEsS0FBYSxjQUFoQjtNQUNELGFBQUEsR0FBZ0I7TUFDaEIsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsS0FBdEIsQ0FBNEIsUUFBNUIsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxNQUEzQyxDQUFtRCxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQXRELENBQUEsRUFGQztLQUFBLE1BR0EsSUFBRyxTQUFBLEtBQWEsWUFBaEI7TUFDRCxhQUFBLEdBQWdCO01BQ2hCLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLEtBQXBCLENBQTBCLFFBQTFCLENBQW1DLENBQUMsSUFBcEMsQ0FBeUMsTUFBekMsQ0FBaUQsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFwRCxDQUFBLEVBRkM7O0lBSUwsSUFBRyxPQUFPLENBQUMsUUFBUixDQUFpQixRQUFqQixDQUFIO0FBQW1DLGFBQU8sTUFBMUM7O0lBQ0EsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFNBQVMsQ0FBQyxHQUFyQixDQUF5QixRQUF6QjtJQUVBLFVBQUEsR0FBYTtNQUFDLGVBQUEsRUFBZ0I7UUFBQyxZQUFBLEVBQWEsYUFBZDtRQUE0QixhQUFBLEVBQWM7VUFBQyxpQkFBQSxFQUFrQixNQUFNLENBQUMsRUFBMUI7U0FBMUM7T0FBakI7O1dBQ2IsQ0FBQyxDQUFDLElBQUYsQ0FDSTtNQUFBLE1BQUEsRUFBUSxNQUFSO01BQ0EsR0FBQSxFQUFLLHdCQURMO01BRUEsSUFBQSxFQUFNLFVBRk47TUFHQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBQ0wsWUFBQTtRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtRQUVBLE1BQUEsR0FBUztRQUNULElBQUksQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDLE9BQXhCLENBQWdDLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDOUIsY0FBQTtVQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVo7aUJBQ04sR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFDLEVBQUQ7bUJBQ1IsTUFBTyxDQUFBLEVBQUEsQ0FBUCxHQUFhLElBQUssQ0FBQSxFQUFBO1VBRFYsQ0FBWjtRQUY4QixDQUFoQztRQUtBLGdCQUFBLEdBQW1CLFNBQUE7QUFDZixjQUFBO1VBQUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsTUFBcEIsRUFBNEIsSUFBSSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUE1QztBQUNBO2VBQUEsYUFBQTtZQUNJLE1BQUEsR0FBUyxRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QjtZQUNULE1BQU0sQ0FBQyxZQUFQLENBQW9CLE9BQXBCLEVBQTZCLEdBQTdCO1lBQ0EsTUFBTSxDQUFDLFdBQVAsR0FBcUIsTUFBTyxDQUFBLEdBQUE7eUJBQzVCLE1BQU0sQ0FBQyxTQUFQLElBQW9CLE1BQU0sQ0FBQztBQUovQjs7UUFGZTtRQVFuQixNQUFBLEdBQVM7UUFFVCxJQUFHLGFBQUEsS0FBaUIsYUFBcEI7QUFBQTtTQUFBLE1BRUssSUFBRyxhQUFBLEtBQWlCLGNBQXBCO0FBQUE7U0FBQSxNQUVBLElBQUcsYUFBQSxLQUFpQixhQUFwQjtVQUNELE1BQUEsR0FBUyxDQUFBLENBQUUsa0JBQUYsQ0FBc0IsQ0FBQSxDQUFBO1VBQy9CLGdCQUFBLENBQUE7VUFJQSxnQkFBQSxHQUFtQixVQUFVLENBQUMsT0FBWCxDQUFtQixDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLENBQW5CO2lCQUNuQixDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQXdCLGdCQUFBLENBQWlCLElBQWpCLENBQXhCLEVBUEM7U0FBQSxNQVNBLElBQUcsYUFBQSxLQUFpQixpQkFBcEI7VUFDRCxNQUFBLEdBQVMsQ0FBQSxDQUFFLHVCQUFGLENBQTJCLENBQUEsQ0FBQTtpQkFDcEMsZ0JBQUEsQ0FBQSxFQUZDOztNQWhDQSxDQUhUO01BeUNBLEtBQUEsRUFBTyxTQUFDLEtBQUQ7UUFDSCxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLEdBQW5CO2lCQUE2QixTQUFBLENBQVUsUUFBVixFQUE3Qjs7TUFERyxDQXpDUDtLQURKO0VBbkQyQixDQUEvQjtTQWtHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLENBQUQ7QUFDYixRQUFBO0lBQUEsU0FBQSxHQUFZO0lBQ1osS0FBQSxHQUFRLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSixDQUFXLENBQUMsT0FBWixDQUFvQixRQUFwQjtJQUNSLFNBQUEsR0FBWSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUM7SUFDckIsVUFBQSxHQUFhLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFPLENBQUM7SUFDOUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaOztBQUVBOzs7SUFHQSxLQUFLLENBQUMsSUFBTixDQUFXLG9CQUFYLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsU0FBQyxLQUFELEVBQVEsT0FBUjtBQUNsQyxVQUFBO01BQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLE9BQXBCLENBQTZCLENBQUEsQ0FBQTthQUN6QyxTQUFVLENBQUEsU0FBQSxDQUFWLEdBQXVCLE9BQU8sQ0FBQztJQUZHLENBQXRDOztBQUlBOzs7SUFHQSxLQUFLLENBQUMsSUFBTixDQUFXLFVBQVgsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixTQUFDLEtBQUQsRUFBUSxPQUFSO0FBQ3hCLFVBQUE7TUFBQSxTQUFBLEdBQVksTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsT0FBcEIsQ0FBNkIsQ0FBQSxDQUFBO2FBQ3pDLFNBQVUsQ0FBQSxTQUFBLENBQVYsR0FBdUIsT0FBTyxDQUFDO0lBRlAsQ0FBNUI7SUFJQSxZQUFBLEdBQWU7SUFDZixJQUFHLFNBQUEsS0FBYSxVQUFoQjtNQUNJLFlBQWEsQ0FBQSxpQkFBQSxDQUFiLEdBQWtDLE1BQU0sQ0FBQyxHQUQ3Qzs7SUFLQSxNQUFBLEdBQVM7SUFFVCxJQUFHLFNBQUEsS0FBYSxVQUFoQjs7QUFDSTs7O01BR0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxlQUFYLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsa0JBQWpDLENBQW9ELENBQUUsSUFBdEQsQ0FBMkQsU0FBQyxHQUFELEVBQU0sT0FBTjtBQUN2RCxZQUFBO1FBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxPQUFGO1FBS1YsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixFQUFwQjtRQUVQLE9BQU8sQ0FBQyxJQUFSLENBQWEsUUFBYixDQUFzQixDQUFDLElBQXZCLENBQTRCLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDeEIsY0FBQTtVQUFBLElBQUcsT0FBTyxDQUFDLEtBQVg7WUFDSSxTQUFBLEdBQVksTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsT0FBcEIsQ0FBNkIsQ0FBQSxDQUFBO21CQUN6QyxJQUFLLENBQUEsU0FBQSxDQUFMLEdBQWtCLE9BQU8sQ0FBQyxNQUY5Qjs7UUFEd0IsQ0FBNUI7O0FBS0E7OztRQUdBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQWlCLENBQUMsTUFBbEIsS0FBNEIsQ0FBL0I7VUFDSSxNQUFBLEdBQVMsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkLEVBQW9CLEVBQXBCO1VBQ1QsTUFBTyxDQUFBLFFBQUEsQ0FBUCxHQUFtQjtVQUNuQixNQUFPLENBQUEsY0FBQSxDQUFQLEdBQXlCLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixFQUFwQjtVQUN6QixNQUFPLENBQUEsY0FBQSxDQUFnQixDQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsa0JBQWIsQ0FBQSxDQUF2QixHQUEyRCxPQUFPLENBQUMsSUFBUixDQUFhLGNBQWI7VUFDM0QsZUFBQSxHQUFrQixPQUFPLENBQUMsTUFBUixDQUFBLENBQWdCLENBQUMsTUFBakIsQ0FBQSxDQUF5QixDQUFDLElBQTFCLENBQStCLGtCQUEvQjtpQkFDbEIsTUFBTSxDQUFDLElBQVAsQ0FBWTtZQUVSLFVBQUEsRUFBWSxlQUZKO1lBSVIsTUFBQSxFQUFRLE1BSkE7V0FBWixFQU5KOztNQWhCdUQsQ0FBM0Q7TUE0QkEsTUFBQSxHQUFTLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxDQUFxQixDQUFBLENBQUE7TUFDOUIsVUFBQSxHQUFhLE1BQU0sQ0FBQztNQUNwQixhQUFBLEdBQWdCLE1BQU0sQ0FBQyxPQUFRLENBQUEsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsQ0FBQztNQUNyRCxZQUFBLEdBQWUsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLElBQVYsQ0FBZSxXQUFmLENBQTJCLENBQUMsSUFBNUIsQ0FBQTtNQUNmLFlBQWEsQ0FBQSxVQUFBLENBQWIsR0FBMkIsY0FwQy9CO0tBQUEsTUFxQ0ssSUFBRyxTQUFBLEtBQWEsa0JBQWhCO0FBQUE7S0FBQSxNQUVBLElBQUcsU0FBQSxLQUFhLGlCQUFoQjtBQUFBO0tBQUEsTUFFQSxJQUFHLFNBQUEsS0FBYSxlQUFoQjtNQUNELE1BQUEsR0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsQ0FBcUIsQ0FBQSxDQUFBO01BQzlCLFVBQUEsR0FBYSxNQUFNLENBQUM7TUFDcEIsYUFBQSxHQUFnQixNQUFNLENBQUMsT0FBUSxDQUFBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLENBQUM7TUFDckQsWUFBQSxHQUFlLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxJQUFWLENBQWUsV0FBZixDQUEyQixDQUFDLElBQTVCLENBQUE7TUFDZixZQUFhLENBQUEsVUFBQSxDQUFiLEdBQTJCLGNBTDFCOztJQU9MLFVBQUEsR0FBYTtNQUNULGFBQUEsRUFBZTtRQUNYLFVBQUEsRUFBWSxVQUREO1FBRVgsTUFBQSxFQUFRO1VBQUUsTUFBQSxFQUFRLFNBQVY7VUFBcUIsWUFBQSxFQUFjLFlBQW5DO1VBQWlELE1BQUEsRUFBUSxNQUF6RDtTQUZHO09BRE47O0lBT2IsRUFBQSxHQUFLLFFBQVEsQ0FBQyxhQUFULENBQXVCLElBQXZCO0FBQ0w7QUFBQSxTQUFBLFVBQUE7O01BQ0ksRUFBRSxDQUFDLFNBQUgsSUFBZ0IseUZBQUEsR0FDdUMsS0FEdkMsR0FDNkM7QUFGakU7SUFJQSxJQUFHLFNBQUEsS0FBYSxVQUFoQjs7QUFDSTs7O01BR0EsR0FBQSxHQUFNO01BQ04sSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixFQUFwQjtNQUNQLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBVSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsTUFBNUM7QUFDQTtBQUFBLFdBQUEsc0NBQUE7O1FBQ0UsSUFBRyxNQUFBLENBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBL0IsQ0FBQSxLQUFtRCxNQUFBLENBQU8sTUFBTSxDQUFDLEVBQWQsQ0FBdEQ7VUFDRSxHQUFBLEdBQU07VUFDTixJQUFBLEdBQU8sR0FBRyxDQUFDO0FBQ1gsZ0JBSEY7O0FBREY7TUFTQSxJQUFJLEdBQUo7QUFDRTtBQUFBLGFBQUEsV0FBQTs7VUFDRSxFQUFFLENBQUMsU0FBSCxJQUFnQix5RkFBQSxHQUNtQyxLQURuQyxHQUN5QztBQUYzRDtRQUdBLEVBQUUsQ0FBQyxTQUFILElBQWdCLHlGQUFBLEdBQ3FDLFlBRHJDLEdBQ2tEO1FBQ2xFLENBQUEsQ0FBRSxzQkFBRixDQUF5QixDQUFDLE1BQTFCLENBQWlDLEVBQWpDLEVBTkY7T0FoQko7S0FBQSxNQXVCSyxJQUFHLFNBQUEsS0FBYSxrQkFBaEI7TUFDRCxDQUFBLENBQUUsOEJBQUYsQ0FBaUMsQ0FBQyxNQUFsQyxDQUF5QyxFQUF6QyxFQURDO0tBQUEsTUFFQSxJQUFHLFNBQUEsS0FBYSxpQkFBaEI7TUFDRCxDQUFBLENBQUUsNkJBQUYsQ0FBZ0MsQ0FBQyxNQUFqQyxDQUF3QyxFQUF4QyxFQURDOztJQUdMLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWjtXQUNBLENBQUMsQ0FBQyxJQUFGLENBQU87TUFDSCxHQUFBLEVBQUssMkJBREY7TUFFSCxNQUFBLEVBQVEsTUFGTDtNQUdILE9BQUEsRUFBUztRQUNMLGNBQUEsRUFBZ0IsbUNBRFg7T0FITjtNQU1ILElBQUEsRUFBTSxVQU5IO01BT0gsT0FBQSxFQUFTLFNBQUMsSUFBRDtlQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWjtNQURLLENBUE47S0FBUDtFQXRIYTtBQTNLRDs7QUE2U3BCLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLEVBQXBCLENBQXVCLE9BQXZCLEVBQWdDLGVBQWhDLEVBQWlELFNBQUMsQ0FBRDtBQUM3QyxNQUFBO0VBQUEsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtFQUNBLEdBQUEsR0FBTSxDQUFDLENBQUMsYUFBYSxDQUFDO0VBQ3RCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7RUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQUE7RUFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBO1NBQ0EsTUFBTSxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEVBQWhCLEVBQW9CLFNBQUMsSUFBRDtJQUNoQixJQUFHLElBQUg7YUFDSSxDQUFDLENBQUMsSUFBRixDQUNJO1FBQUEsR0FBQSxFQUFLLHlDQUFBLEdBQTRDLEdBQWpEO1FBQ0EsUUFBQSxFQUFVLE1BRFY7UUFFQSxLQUFBLEVBQU8sSUFGUDtRQUdBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFFTCxjQUFBO1VBQUEsTUFBQSxHQUFTLElBQUssQ0FBQSxDQUFBO1VBRWQsSUFBRyxDQUFDLENBQUMsYUFBRixDQUFnQixNQUFoQixDQUFIO1lBQ0ksQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtZQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLGdDQUFuQjtZQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxHQUFkLENBQWtCO2NBQUMsV0FBQSxFQUFZLFFBQWI7YUFBbEI7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO1lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtBQUNBLG1CQUFPLE1BTlg7O1VBUUEsTUFBQSxHQUFTO1lBQUMsSUFBQSxFQUFNLFNBQVA7WUFBa0IsS0FBQSxFQUFPLFNBQXpCO1lBQW9DLEdBQUEsRUFBSyxTQUF6Qzs7VUFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWIsQ0FBcUIsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNqQixnQkFBQTtZQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQXRCO21CQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBakIsR0FBbUMsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsT0FBcEIsRUFBNkIsTUFBN0I7VUFGbEIsQ0FBckI7VUFJQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLHVCQUFGLENBQTBCLENBQUMsSUFBM0IsQ0FBQTtVQUNOLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEdBQW5CO1VBQ25CLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7VUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO1VBQ0EsSUFBQSxHQUFPLGdCQUFBLENBQWlCLE1BQWpCO1VBQ1AsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFmLENBQXlCO1lBQUMsUUFBQSxFQUFVLElBQVg7V0FBekIsRUFBMkMseUJBQTNDLEVBQXNFLEdBQXRFO1VBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkI7VUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxHQUFwQixDQUF3QjtZQUFBLFNBQUEsRUFBVyxPQUFYO1dBQXhCO1VBRUEsaUJBQUEsQ0FBa0IsTUFBbEI7VUFFQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsU0FBQyxDQUFEO0FBQ25CLGdCQUFBO1lBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQyxhQUFhLENBQUM7WUFFckIsSUFBQSxHQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQy9CLElBQUcsSUFBQSxLQUFRLE1BQVg7Y0FBMEIsSUFBQSxHQUFPLE1BQU0sQ0FBQyxVQUF4Qzs7WUFDQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQUEsR0FBTyxJQUFQLEdBQWMsTUFBTSxDQUFDLFlBQXJCLEdBQW9DLEdBQTVEO1lBQ0EsQ0FBQSxDQUFFLGVBQUYsQ0FBa0IsQ0FBQyxLQUFuQixDQUF5QixNQUF6QjttQkFDQSxjQUFBLENBQWUsRUFBZixFQUFtQixtQkFBQSxHQUFzQixHQUF0QixHQUE0QixFQUEvQyxFQUFtRCxJQUFuRDtVQVBtQixDQUF2QjtVQVFBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQXlCLFlBQUEsR0FBZSxNQUFNLENBQUMsWUFBL0M7aUJBQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUFBO1FBckNLLENBSFQ7UUEwQ0EsS0FBQSxFQUFPLFNBQUMsQ0FBRDtpQkFDSCxPQUFPLENBQUMsR0FBUixDQUFZLENBQVo7UUFERyxDQTFDUDtPQURKLEVBREo7O0VBRGdCLENBQXBCO0FBVjZDLENBQWpEOztBQTREQSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtFQUNJLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBQTtFQUNBLFlBQUEsR0FBbUIsSUFBQSxXQUFBLENBQVksWUFBWixFQUEwQixnQ0FBMUIsRUFBNEQsQ0FBNUQ7RUFDbkIsWUFBWSxDQUFDLFdBQWIsR0FBMkIsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVo7QUFDdkIsUUFBQTtJQUFBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtJQUNBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0lBQ0EsR0FBQSxHQUFNLEdBQUEsR0FBTSxJQUFJLENBQUMsV0FBWCxHQUF5QixHQUF6QixHQUErQixJQUFJLENBQUM7V0FDMUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxHQUFYLEVBQWdCLEVBQWhCLEVBQW9CLFNBQUMsSUFBRDtNQUNoQixJQUFHLElBQUg7ZUFDSSxDQUFDLENBQUMsSUFBRixDQUNJO1VBQUEsR0FBQSxFQUFLLG1DQUFBLEdBQXNDLEdBQTNDO1VBQ0EsUUFBQSxFQUFVLE1BRFY7VUFFQSxLQUFBLEVBQU8sSUFGUDtVQUdBLE9BQUEsRUFBUyxTQUFDLHNCQUFEO0FBQ0wsZ0JBQUE7WUFBQSxJQUFBLEdBQU87WUFDUCxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO1lBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtZQUNBLHFCQUFBLEdBQXdCLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQW5CLEVBQXNCLElBQXRCO1lBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtjQUFDLFFBQUEsRUFBVSxxQkFBWDthQUF6QixFQUE0RCxvQkFBNUQsRUFBa0YsR0FBbEY7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixxQkFBbkI7WUFDQSxZQUFBLENBQUE7bUJBQ0EsT0FBTyxDQUFDLGNBQVIsQ0FBQTtVQVJLLENBSFQ7VUFZQSxLQUFBLEVBQU8sU0FBQyxDQUFEO21CQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtVQURHLENBWlA7U0FESixFQURKOztJQURnQixDQUFwQjtFQVJ1QjtFQXlCM0IsSUFBRyxDQUFDLEtBQUo7SUFDSSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixDQUFBLENBQUUsNEJBQUYsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFBLENBQTNCO0lBRUEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSwrQkFBTixFQUF1QyxTQUFDLElBQUQ7YUFBVSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQXNCLElBQXRCO0lBQVYsQ0FBdkM7SUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGlCQUFSO0lBQ1QsWUFBQSxDQUFhLE9BQU8sQ0FBQyxhQUFyQjtJQUNBLEtBQUEsR0FBUTtJQUNSLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUEsRUFQSjs7RUFRQSxzQkFBQSxDQUFBO0VBQ0EsK0JBQUEsQ0FBQTtFQUVBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLEtBQXRCLENBQTRCLFNBQUMsQ0FBRDtJQUN4QixDQUFDLENBQUMsY0FBRixDQUFBO1dBQ0EsT0FBTyxDQUFDLGdCQUFSLENBQUE7RUFGd0IsQ0FBNUI7RUFJQSxTQUFTLENBQUMsb0JBQVYsQ0FBK0IsTUFBL0IsRUFBdUMsZ0tBQXZDO0VBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLEVBQWIsQ0FBZ0IsT0FBaEIsRUFBeUIsa0JBQXpCLEVBQTZDLFNBQUMsQ0FBRDtBQUN6QyxRQUFBO0lBQUEsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUNsQyxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsSUFBdEIsQ0FBQTtJQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7V0FDQSxDQUFDLENBQUMsSUFBRixDQUNJO01BQUEsR0FBQSxFQUFLLG1DQUFBLEdBQXNDLEdBQTNDO01BQ0EsUUFBQSxFQUFVLE1BRFY7TUFFQSxLQUFBLEVBQU8sSUFGUDtNQUdBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFDTCxZQUFBO1FBQUEscUJBQUEsR0FBd0IsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEI7UUFDeEIsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIscUJBQW5CO1FBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtRQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7UUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7ZUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQWYsQ0FBeUI7VUFBQyxRQUFBLEVBQVUscUJBQVg7U0FBekIsRUFBNEQsb0JBQTVELEVBQWtGLEdBQWxGO01BTkssQ0FIVDtLQURKO0VBTHlDLENBQTdDLEVBNUNKOzs7QUE4REEsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7RUFDSSxRQUFRLENBQUMsS0FBVCxHQUFpQjtFQUNqQixDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO0VBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7RUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0VBQ0EsU0FBUyxDQUFDLG9CQUFWLENBQStCLE1BQS9CLEVBQXVDLGdLQUF2QztFQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssbUNBQUEsR0FBc0MsTUFBTSxDQUFDLElBQWxEO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxLQUFBLEVBQU8sSUFGUDtJQUdBLE9BQUEsRUFBUyxTQUFDLHNCQUFEO0FBQ0wsVUFBQTtNQUFBLElBQUEsR0FBTztNQUNQLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7TUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO01BQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEIsQ0FBbkI7TUFDQSxZQUFBLENBQUE7YUFDQSxPQUFPLENBQUMsY0FBUixDQUFBO0lBTkssQ0FIVDtJQVVBLEtBQUEsRUFBTyxTQUFDLENBQUQ7YUFDSCxPQUFPLENBQUMsR0FBUixDQUFZLENBQVo7SUFERyxDQVZQO0dBREo7RUFjQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxLQUF0QixDQUE0QixTQUFDLENBQUQ7SUFDeEIsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtXQUNBLE9BQU8sQ0FBQyxnQkFBUixDQUFBO0VBRndCLENBQTVCLEVBdEJKOzs7QUEyQkEsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7RUFDSSxRQUFRLENBQUMsS0FBVCxHQUFpQjtFQUNqQixDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO0VBQ0EsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsSUFBdEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7RUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBQTtFQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUsseUNBQUEsR0FBNEMsTUFBTSxDQUFDLElBQXhEO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBRUwsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFLLENBQUEsQ0FBQTtNQUVkLElBQUcsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsTUFBaEIsQ0FBSDtRQUNJLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7UUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixnQ0FBbkI7UUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsR0FBZCxDQUFrQjtVQUFDLFdBQUEsRUFBWSxRQUFiO1NBQWxCO1FBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtRQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7QUFDQSxlQUFPLE1BTlg7O01BUUEsTUFBQSxHQUFTO1FBQUMsSUFBQSxFQUFNLFNBQVA7UUFBa0IsS0FBQSxFQUFPLFNBQXpCO1FBQW9DLEdBQUEsRUFBSyxTQUF6Qzs7TUFDVCxJQUFHLE1BQU0sQ0FBQyxLQUFQLEtBQWdCLE1BQW5CO1FBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFiLENBQXFCLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDakIsY0FBQTtVQUFBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQXRCO2lCQUNYLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBakIsR0FBbUMsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsT0FBcEIsRUFBNkIsTUFBN0I7UUFGbEIsQ0FBckIsRUFESjs7TUFLQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLHVCQUFGLENBQTBCLENBQUMsSUFBM0IsQ0FBQTtNQUNOLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEdBQW5CO01BQ25CLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7TUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO01BQ0EsSUFBQSxHQUFPLGdCQUFBLENBQWlCLE1BQWpCO01BRVAsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkI7TUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxHQUFwQixDQUF3QjtRQUFBLFNBQUEsRUFBVyxPQUFYO09BQXhCO01BRUEsaUJBQUEsQ0FBa0IsTUFBbEI7TUFFQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsU0FBQyxDQUFEO0FBQ25CLFlBQUE7UUFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUVyQixJQUFBLEdBQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBRyxJQUFBLEtBQVEsTUFBWDtVQUEwQixJQUFBLEdBQU8sTUFBTSxDQUFDLFVBQXhDOztRQUNBLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBQSxHQUFPLElBQVAsR0FBYyxNQUFNLENBQUMsWUFBckIsR0FBb0MsR0FBNUQ7UUFDQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLEtBQW5CLENBQXlCLE1BQXpCO2VBQ0EsY0FBQSxDQUFlLEVBQWYsRUFBbUIsbUJBQUEsR0FBc0IsR0FBdEIsR0FBNEIsRUFBL0MsRUFBbUQsSUFBbkQ7TUFQbUIsQ0FBdkI7TUFTQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixZQUFBLEdBQWUsTUFBTSxDQUFDLFlBQS9DO2FBQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUFBO0lBdkNLLENBRlQ7SUEyQ0EsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBM0NQO0dBREosRUFUSjs7O0FBd0RBLENBQUEsQ0FBRSxTQUFBO1NBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FBTyxrQkFBUCxFQUEyQjtJQUN6QixNQUFBLEVBQVEsTUFEaUI7SUFFekIsUUFBQSxFQUFVLFNBQUMsUUFBRDtNQUNSLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsR0FBdEI7ZUFDRSxVQUFBLEdBQWEsTUFEZjtPQUFBLE1BRUssSUFBRyxRQUFRLENBQUMsTUFBVCxLQUFtQixHQUF0QjtlQUNILFVBQUEsR0FBYSxLQURWOztJQUhHLENBRmU7SUFPekIsS0FBQSxFQUFPLFNBQUMsS0FBRDtNQUNMLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7ZUFBNEIsVUFBQSxHQUFhLE1BQXpDOztJQURLLENBUGtCO0dBQTNCO0FBREEsQ0FBRjs7Ozs7QUNsNEJBLElBQUE7O0FBQUEsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLFNBQVA7O0lBQU8sWUFBVTs7U0FDN0IsU0FBQyxDQUFELEVBQUksRUFBSjtBQUNFLFFBQUE7SUFBQSxXQUFBLEdBQWEsU0FBQyxDQUFELEVBQUksSUFBSjtBQUNYLFVBQUE7QUFBQSxXQUFBLHNDQUFBOztRQUFDLElBQUcsQ0FBSSxDQUFDLENBQUMsSUFBRixDQUFPLENBQVAsQ0FBUDtBQUFzQixpQkFBTyxNQUE3Qjs7QUFBRDtBQUNBLGFBQU87SUFGSTtJQUliLE1BQWUsY0FBQSxDQUFlLENBQWYsQ0FBZixFQUFDLGNBQUQsRUFBTztJQUNQLE9BQUEsR0FBVTtBQUlWLFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxPQUFPLENBQUMsTUFBUixJQUFrQixTQUFyQjtBQUFvQyxjQUFwQzs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxZQUFSLElBQXlCLENBQUMsQ0FBQyxLQUFGLEtBQWEsT0FBTyxDQUFDLFlBQWpEO0FBQW1FLGlCQUFuRTs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxlQUFSLElBQTRCLENBQUMsQ0FBQyxRQUFGLEtBQWdCLE9BQU8sQ0FBQyxlQUF2RDtBQUE0RSxpQkFBNUU7O01BRUEsSUFBRyxXQUFBLENBQVksQ0FBQyxDQUFDLFFBQWQsRUFBd0IsSUFBeEIsQ0FBSDtRQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxFQUFULEVBQWEsQ0FBYixDQUFiLEVBREY7O0FBTEY7SUFTQSxXQUFBLENBQVksT0FBWixFQUFxQixLQUFyQixFQUE0QixJQUE1QjtJQUNBLEVBQUEsQ0FBRyxPQUFIO0VBcEJGO0FBRFk7O0FBMEJkLFdBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUSxLQUFSLEVBQWMsSUFBZDtBQUNaLE1BQUE7QUFBQSxPQUFBLHdDQUFBOztJQUNFLENBQUMsQ0FBQyxRQUFGLEdBQVcsU0FBQSxDQUFVLENBQUMsQ0FBQyxRQUFaLEVBQXNCLEtBQXRCLEVBQTZCLElBQTdCO0FBRGI7QUFLQSxTQUFPO0FBTks7O0FBV2QsU0FBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLEtBQUosRUFBVyxJQUFYO0VBQ1YsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFDLENBQUQsRUFBRyxDQUFIO1dBQ1gsQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVixFQUFhLEtBQUEsR0FBTSxLQUFNLENBQUEsQ0FBQSxDQUFaLEdBQWUsTUFBNUI7RUFETyxDQUFiO0FBRUEsU0FBTztBQUhHOztBQU1aLEtBQUEsR0FBUSxTQUFDLENBQUQ7U0FDTixDQUFDLENBQUMsT0FBRixDQUFVLFdBQVYsRUFBc0IsRUFBdEI7QUFETTs7QUFLUixTQUFBLEdBQVksU0FBQyxDQUFEO0FBQ1YsTUFBQTtFQUFBLEVBQUEsR0FBRyxDQUFDLENBQUMsSUFBRixDQUFPLEVBQUEsR0FBRyxDQUFWO1NBQ0gsRUFBQSxHQUFHLEVBQUUsQ0FBQyxPQUFILENBQVcsS0FBWCxFQUFpQixHQUFqQjtBQUZPOztBQUtaLFNBQUEsR0FBWSxTQUFDLEdBQUQ7U0FDVixTQUFBLENBQVUsR0FBVixDQUFjLENBQUMsS0FBZixDQUFxQixHQUFyQjtBQURVOztBQUlaLGNBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsTUFBQTtFQUFBLEtBQUEsR0FBUSxTQUFBLENBQVUsR0FBVjtFQUNSLElBQUEsR0FBTyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsQ0FBRDtXQUFVLElBQUEsTUFBQSxDQUFPLEVBQUEsR0FBRyxDQUFWLEVBQWMsR0FBZDtFQUFWLENBQVY7U0FDUCxDQUFDLEtBQUQsRUFBTyxJQUFQO0FBSGU7O0FBTWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7QUN2RWpCOzs7Ozs7OztBQUFBLElBQUE7O0FBWUEsVUFBQSxHQUFhOztBQUNiLGNBQUEsR0FBaUI7O0FBR2pCLGtCQUFBLEdBQXFCLFNBQUMsQ0FBRCxFQUFHLElBQUgsRUFBUSxJQUFSO0FBQ25CLE1BQUE7RUFBQSxDQUFBLEdBQUUsSUFBSyxDQUFBLENBQUE7RUFDUCxJQUFHLENBQUksSUFBSyxDQUFBLENBQUEsQ0FBWjtBQUNFLFdBQU8sR0FEVDs7RUFHQSxJQUFHLENBQUEsS0FBSyxVQUFSO0FBQ0UsV0FBTywyQkFBQSxHQUE0QixDQUE1QixHQUE4QixJQUE5QixHQUFrQyxDQUFsQyxHQUFvQyxPQUQ3QztHQUFBLE1BQUE7SUFHRSxJQUFHLEVBQUEsS0FBTSxJQUFUO01BQ0UsSUFBRyxJQUFLLENBQUEsQ0FBQSxHQUFFLE9BQUYsQ0FBTCxJQUFvQixJQUFJLENBQUMsU0FBekIsSUFBdUMsSUFBSSxDQUFDLFNBQVUsQ0FBQSxDQUFBLEdBQUUsV0FBRixDQUF6RDtRQUNFLENBQUEsR0FBSSxPQUFBLENBQVEsQ0FBUixDQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQjtBQUNKLGVBQVUsQ0FBRCxHQUFHLHVCQUFILEdBQTBCLElBQUssQ0FBQSxDQUFBLEdBQUUsT0FBRixDQUEvQixHQUEwQyxNQUExQyxHQUFnRCxJQUFJLENBQUMsU0FBVSxDQUFBLENBQUEsR0FBRSxXQUFGLENBQS9ELEdBQThFLFdBRnpGOztNQUdBLElBQUcsQ0FBQSxLQUFLLCtCQUFSO0FBQ0UsZUFBTyxPQUFBLENBQVEsQ0FBUixDQUFVLENBQUMsTUFBWCxDQUFrQixLQUFsQixFQURUOztBQUVBLGFBQU8sT0FBQSxDQUFRLENBQVIsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFOVDtLQUFBLE1BQUE7TUFRRSxJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBWCxJQUNILENBQUEsS0FBSyx5QkFETDtRQUVLLENBQUEsR0FBSSxDQUFDLENBQUMsU0FBRixDQUFZLENBQVosRUFBZSxFQUFmLENBQUEsR0FBcUIsQ0FBQSxvREFBQSxHQUFxRCxDQUFyRCxHQUF1RCxrQkFBdkQsRUFGOUI7O01BR0EsSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLEVBQVgsSUFDSCxDQUFBLEtBQUssaUNBREw7ZUFFSyxDQUFBLEdBQUksQ0FBQyxDQUFDLFNBQUYsQ0FBWSxDQUFaLEVBQWUsRUFBZixDQUFBLEdBQXFCLENBQUEsb0RBQUEsR0FBcUQsQ0FBckQsR0FBdUQsa0JBQXZELEVBRjlCO09BQUEsTUFBQTtRQUlFLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxFQUFkO1VBQ0ssQ0FBQSxHQUFJLENBQUMsQ0FBQyxTQUFGLENBQVksQ0FBWixFQUFlLEVBQWYsRUFEVDtTQUFBLE1BQUE7QUFBQTs7QUFHQSxlQUFPLEVBUFQ7T0FYRjtLQUhGOztBQUxtQjs7QUE2QnJCLHNCQUFBLEdBQXlCLFNBQUMsS0FBRDtBQUVyQixTQUFPLGNBQWUsQ0FBQSxLQUFBO0FBRkQ7O0FBSXpCLGlCQUFBLEdBQW9CLFNBQUMsS0FBRDtBQUNsQixNQUFBO0VBQUEsSUFBRyx5QkFBSDtBQUNFLFdBQU8sVUFBVyxDQUFBLEtBQUEsRUFEcEI7O0VBR0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFtQixHQUFuQjtFQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsQ0FBVyxDQUFDLFdBQVosQ0FBQSxDQUFBLEdBQTRCLENBQUMsQ0FBQyxTQUFGLENBQVksQ0FBWjtBQUNoQyxTQUFPO0FBTlc7O0FBU3BCLFlBQUEsR0FBZSxTQUFDLEtBQUQsRUFBTyxJQUFQO0FBQ2IsTUFBQTtFQUFBLElBQUcsR0FBQSxLQUFPLE1BQUEsQ0FBTyxLQUFQLEVBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUFWO1dBQ0Usa0NBQUEsR0FFMEIsQ0FBQyxpQkFBQSxDQUFrQixLQUFsQixDQUFELENBRjFCLEdBRW1ELHlEQUhyRDtHQUFBLE1BQUE7SUFRRSxJQUFBLENBQWlCLENBQUEsTUFBQSxHQUFTLElBQUssQ0FBQSxLQUFBLENBQWQsQ0FBakI7QUFBQSxhQUFPLEdBQVA7O1dBQ0EsbUNBQUEsR0FFMkIsQ0FBQyxpQkFBQSxDQUFrQixLQUFsQixDQUFELENBRjNCLEdBRW9ELHdDQUZwRCxHQUd5QixDQUFDLGtCQUFBLENBQW1CLEtBQW5CLEVBQXlCLElBQXpCLENBQUQsQ0FIekIsR0FHeUQsa0JBWjNEOztBQURhOztBQWlCZixpQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsUUFBZDtBQUNsQixNQUFBO0VBQUEsQ0FBQSxHQUFJO0VBQ0osS0FBQSxHQUFRLGlCQUFBLENBQWtCLEtBQWxCO0VBQ1IsSUFBRyxJQUFBLEtBQVEsU0FBWDtJQUNFLElBQUcsUUFBQSxLQUFZLENBQWY7TUFDRSxDQUFBLElBQUssUUFEUDs7SUFFQSxDQUFBLElBQUssMkJBQUEsR0FBNEIsS0FBNUIsR0FBa0MsNENBSHpDOztBQUlBLFNBQU87QUFQVzs7QUFTcEIsYUFBQSxHQUFnQixTQUFDLE1BQUQsRUFBUSxJQUFSLEVBQWEsUUFBYjtBQUNkLE1BQUE7RUFBQSxDQUFBLEdBQUk7QUFDSixPQUFBLGdEQUFBOztJQUNFLElBQUksT0FBTyxLQUFQLEtBQWdCLFFBQXBCO01BQ0UsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFNBQWpCO1FBQ0UsQ0FBQSxJQUFLLGlCQUFBLENBQWtCLEtBQUssQ0FBQyxJQUF4QixFQUE4QixLQUFLLENBQUMsSUFBcEMsRUFBMEMsQ0FBMUM7UUFDTCxNQUFBLEdBQVMsR0FGWDtPQUFBLE1BQUE7UUFJRSxNQUFBLEdBQVMsa0JBQUEsQ0FBbUIsS0FBSyxDQUFDLElBQXpCLEVBQStCLEtBQUssQ0FBQyxJQUFyQyxFQUEyQyxJQUEzQztRQUNULElBQUksRUFBQSxLQUFNLE1BQU4sSUFBaUIsTUFBQSxLQUFVLEdBQS9CO1VBQ0UsS0FBQSxHQUFRLGlCQUFBLENBQWtCLEtBQUssQ0FBQyxJQUF4QjtVQUNSLFNBQUEsR0FBWSxzQkFBQSxDQUF1QixLQUFLLENBQUMsSUFBN0IsRUFGZDtTQUFBLE1BQUE7VUFJRSxNQUFBLEdBQVMsR0FKWDtTQUxGO09BREY7S0FBQSxNQUFBO01BYUUsTUFBQSxHQUFTLGtCQUFBLENBQW1CLEtBQW5CLEVBQTBCLEVBQTFCLEVBQThCLElBQTlCO01BQ1QsSUFBSSxFQUFBLEtBQU0sTUFBVjtRQUNFLEtBQUEsR0FBUSxpQkFBQSxDQUFrQixLQUFsQjtRQUNSLFNBQUEsR0FBWSxzQkFBQSxDQUF1QixLQUF2QixFQUZkO09BZEY7O0lBaUJBLElBQUksRUFBQSxLQUFNLE1BQVY7TUFDRSxDQUFBLElBQUssUUFBQSxDQUFTO1FBQUEsSUFBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU8sTUFBcEI7UUFBNEIsSUFBQSxFQUFNLFNBQWxDO09BQVQsRUFEUDs7QUFsQkY7QUFvQkEsU0FBTztBQXRCTzs7QUF3QmhCLHVCQUFBLEdBQTBCLFNBQUMsSUFBRCxFQUFNLFFBQU47QUFDeEIsTUFBQTtFQUFBLENBQUEsR0FBSTtFQUNKLElBQUEsR0FBTztFQUNQLFFBQUEsR0FBVztFQUNYLFlBQUEsR0FBZTtBQUNmLE9BQUEsc0NBQUE7O0lBQ0UsSUFBRyxRQUFBLEtBQVksS0FBSyxDQUFDLGFBQXJCO01BQ0UsUUFBQSxHQUFXLEtBQUssQ0FBQztNQUNqQixJQUFHLFFBQUEsS0FBWSxVQUFmO1FBQ0UsQ0FBQSxJQUFLLFFBQUEsQ0FBUztVQUFBLElBQUEsRUFBTSxLQUFBLEdBQVEsUUFBUixHQUFtQixNQUF6QjtVQUFpQyxPQUFBLEVBQVMsRUFBMUM7VUFBOEMsVUFBQSxFQUFZLEVBQTFEO1VBQThELFVBQUEsRUFBWSxFQUExRTtTQUFULEVBRFA7T0FBQSxNQUVLLElBQUcsUUFBQSxLQUFZLFVBQWY7UUFDSCxDQUFBLElBQUs7UUFDTCxDQUFBLElBQUssS0FBQSxHQUFRLFFBQUEsQ0FBUztVQUFBLElBQUEsRUFBTSxRQUFOO1VBQWdCLE9BQUEsRUFBUyxjQUF6QjtVQUF5QyxVQUFBLEVBQVksYUFBckQ7VUFBb0UsVUFBQSxFQUFZLGtCQUFoRjtTQUFULENBQVIsR0FBdUg7UUFDNUgsWUFBQSxHQUFlLEtBSFo7T0FBQSxNQUFBO1FBS0gsQ0FBQSxJQUFLO1FBQ0wsQ0FBQSxJQUFLLFFBQUEsQ0FBUztVQUFBLElBQUEsRUFBTSxLQUFBLEdBQVEsUUFBUixHQUFtQixNQUF6QjtVQUFpQyxPQUFBLEVBQVMsRUFBMUM7VUFBOEMsVUFBQSxFQUFZLEVBQTFEO1VBQThELFVBQUEsRUFBWSxFQUExRTtTQUFUO1FBQ0wsWUFBQSxHQUFlLEtBUFo7T0FKUDs7SUFhQSxJQUFHLEtBQUssQ0FBQyxPQUFOLEtBQWlCLHNCQUFqQixJQUEyQyxLQUFLLENBQUMsT0FBTixLQUFpQixnQkFBL0Q7TUFDRSxDQUFBLElBQUssUUFBQSxDQUFTO1FBQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxPQUFaO1FBQXFCLE9BQUEsRUFBUyxRQUFBLENBQVMsS0FBSyxDQUFDLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsc0NBQTlCLENBQTlCO09BQVQsRUFEUDtLQUFBLE1BRUssSUFBRyxRQUFBLEtBQUssQ0FBQyxRQUFOLEtBQWtCLGdCQUFsQixJQUFBLEdBQUEsS0FBb0Msb0JBQXBDLElBQUEsR0FBQSxLQUEwRCxxQkFBMUQsQ0FBQSxJQUFvRixZQUF2RjtNQUNILENBQUEsSUFBSyxRQUFBLENBQVM7UUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE9BQVo7UUFBcUIsT0FBQSxFQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixFQUF3QixJQUF4QixFQUE4QixzQ0FBOUIsQ0FBOUI7UUFBcUcsVUFBQSxFQUFZLFFBQUEsQ0FBUyxLQUFLLENBQUMsVUFBZixFQUEyQixJQUEzQixFQUFpQyxzQ0FBakMsQ0FBakg7UUFBMkwsVUFBQSxFQUFZLFFBQUEsQ0FBUyxLQUFLLENBQUMsVUFBZixFQUEyQixJQUEzQixFQUFpQyxzQ0FBakMsQ0FBdk07T0FBVDtNQUNMLFlBQUEsR0FBZSxNQUZaO0tBQUEsTUFBQTtNQUlILENBQUEsSUFBSyxRQUFBLENBQVM7UUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE9BQVo7UUFBcUIsT0FBQSxFQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixFQUF3QixJQUF4QixDQUE5QjtRQUE2RCxVQUFBLEVBQVksUUFBQSxDQUFTLEtBQUssQ0FBQyxVQUFmLEVBQTJCLElBQTNCLENBQXpFO1FBQTJHLFVBQUEsRUFBWSxRQUFBLENBQVMsS0FBSyxDQUFDLFVBQWYsRUFBMkIsSUFBM0IsQ0FBdkg7T0FBVCxFQUpGOztBQWhCUDtBQXFCQSxTQUFPO0FBMUJpQjs7QUE0QjFCLEtBQUEsR0FBUSxTQUFDLENBQUQ7U0FBTyxDQUFDLENBQUMsT0FBRixDQUFVLFdBQVYsRUFBdUIsR0FBdkI7QUFBUDs7QUFFUixXQUFBLEdBQWMsU0FBQyxHQUFEO1NBQ1osR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEVBQXNCLFNBQUMsR0FBRDtXQUNwQixHQUFHLENBQUMsTUFBSixDQUFXLENBQVgsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEdBQThCLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxDQUFhLENBQUMsV0FBZCxDQUFBO0VBRFYsQ0FBdEI7QUFEWTs7QUFJZCxRQUFBLEdBQVcsU0FBQyxDQUFELEVBQUksSUFBSixFQUFVLElBQVY7QUFDUCxNQUFBOztJQURpQixPQUFPOztFQUN4QixDQUFBLEdBQUksT0FBQSxDQUFRLENBQVI7RUFDSixJQUFHLENBQUEsR0FBSSxDQUFQO0lBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUFjLENBQUMsUUFBZixDQUFBO0lBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixFQUFoQjtBQUNKLFdBQU8sR0FBQSxHQUFJLElBQUosR0FBVSxDQUFDLHdCQUFBLEdBQXlCLENBQXpCLEdBQTJCLFNBQTVCLENBQVYsR0FBZ0QsSUFIM0Q7O0VBS0EsQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVDtBQUNKLFNBQU8sRUFBQSxHQUFHLElBQUgsR0FBUyxDQUFDLHdCQUFBLEdBQXlCLENBQXpCLEdBQTJCLFNBQTVCO0FBUlQ7O0FBVVgsV0FBQSxHQUFjLFNBQUMsY0FBRCxFQUFpQixJQUFqQixFQUF1QixNQUF2QixFQUErQixNQUEvQjtBQUVaLE1BQUE7RUFBQSxNQUFBLEdBQVM7RUFDVCxTQUFBLEdBQVksTUFBTSxDQUFDO0VBQ25CLFlBQUEsR0FBZTtFQUVmLFdBQUEsR0FDRTtJQUFBLEtBQUEsRUFBTyxJQUFJLENBQUMsSUFBWjtJQUNBLHFCQUFBLEVBQXVCLElBQUksQ0FBQyxxQkFENUI7SUFFQSxtQkFBQSxFQUFzQixJQUFJLENBQUMsbUJBRjNCO0lBR0EsZ0NBQUEsRUFBa0MsSUFBSSxDQUFDLGdDQUh2QztJQUlBLGdCQUFBLEVBQWtCLElBQUksQ0FBQyxnQkFKdkI7SUFLQSxJQUFBLEVBQU0sRUFMTjtJQU1BLFVBQUEsRUFBWSxFQU5aOztBQVFGLE9BQUEsZ0RBQUE7O0lBQ0UsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFqQixDQUNFO01BQUEsS0FBQSxFQUFPLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFQO01BQ0EsT0FBQSxFQUFTLEdBQUcsQ0FBQyxJQURiO01BRUEsTUFBQSxFQUFRLENBQUksQ0FBQSxHQUFFLENBQUwsR0FBWSxFQUFaLEdBQW9CLFFBQXJCLENBRlI7S0FERjtBQURGO0FBTUEsT0FBQSxrREFBQTs7SUFDRSxXQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sS0FBQSxDQUFNLEdBQUcsQ0FBQyxJQUFWLENBQVA7TUFDQSxPQUFBLEVBQVMsR0FBRyxDQUFDLElBRGI7TUFFQSxNQUFBLEVBQVEsQ0FBSSxDQUFBLEdBQUUsQ0FBTCxHQUFZLEVBQVosR0FBb0IsUUFBckIsQ0FGUjtNQUdBLFVBQUEsRUFBWSxFQUhaOztBQUlGLFlBQU8sR0FBRyxDQUFDLElBQVg7QUFBQSxXQUNPLDhCQURQO1FBRUksV0FBVyxDQUFDLFVBQVosSUFBMEIsYUFBQSxDQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUEwQixJQUExQixFQUFnQyxTQUFVLENBQUEsOEJBQUEsQ0FBMUM7UUFDMUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaO0FBQ0E7QUFBQSxhQUFBLCtDQUFBOztVQUNFLGFBQUEsR0FDRTtZQUFBLEtBQUEsRUFBVSxFQUFBLEtBQU0sUUFBUSxDQUFDLEtBQWxCLEdBQTZCLFNBQUEsR0FBWSxRQUFRLENBQUMsS0FBbEQsR0FBQSxNQUFQO1lBQ0EsSUFBQSxFQUFTLEVBQUEsS0FBTSxRQUFRLENBQUMsU0FBbEIsR0FBaUMsUUFBQSxHQUFXLFFBQVEsQ0FBQyxTQUFyRCxHQUFBLE1BRE47WUFFQSxLQUFBLEVBQVUsUUFBUSxDQUFDLGFBQVosR0FBK0IsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFwRCxHQUFBLE1BRlA7WUFHQSxlQUFBLEVBQW9CLElBQUEsS0FBUSxRQUFRLENBQUMsZ0JBQWpCLElBQXNDLE1BQUEsS0FBYSxRQUFRLENBQUMsZ0JBQS9ELEdBQXFGLG9CQUFBLEdBQXVCLFFBQVEsQ0FBQyxnQkFBckgsR0FBQSxNQUhqQjtZQUlBLFdBQUEsRUFBZ0IsUUFBUSxDQUFDLFlBQVosR0FBOEIsZ0JBQUEsR0FBbUIsUUFBUSxDQUFDLFlBQTFELEdBQTRFLGdCQUp6RjtZQUtBLFdBQUEsRUFBYSxJQUFJLENBQUMsYUFMbEI7WUFNQSxRQUFBLEVBQVUsSUFBSSxDQUFDLElBTmY7WUFPQSxJQUFBLEVBQU0sUUFBUSxDQUFDLElBUGY7O1VBU0YsSUFBRyxFQUFBLEtBQU0sUUFBUSxDQUFDLFNBQWYsSUFBNkIsUUFBUSxDQUFDLFNBQVQsS0FBc0IsTUFBdEQ7WUFDRSxhQUFhLENBQUMsS0FBZCxHQUF1QixZQUFBLEdBQWEsUUFBUSxDQUFDLFNBQXRCLEdBQWdDLCtCQUR6RDtXQUFBLE1BQUE7WUFHRSxhQUFhLENBQUMsS0FBZCxHQUF1QixHQUh6Qjs7VUFLQSxXQUFXLENBQUMsVUFBWixJQUEwQixTQUFVLENBQUEsNkJBQUEsQ0FBVixDQUF5QyxhQUF6QztBQWhCNUI7QUFIRztBQURQLFdBcUJPLHVCQXJCUDtRQXNCSSxDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssYUFBQSxDQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUEwQixJQUExQixFQUFnQyxTQUFVLENBQUEsOEJBQUEsQ0FBMUM7UUFDTCxXQUFXLENBQUMsVUFBWixJQUEwQixTQUFVLENBQUEsa0NBQUEsQ0FBVixDQUE4QztVQUFBLE9BQUEsRUFBUyxDQUFUO1NBQTlDO1FBQzFCLElBQUcsQ0FBSSxZQUFhLENBQUEsbUJBQUEsQ0FBcEI7VUFDRSxLQUFBLEdBQVE7VUFDUixJQUFHLElBQUssQ0FBQSxpQ0FBQSxDQUFMLEtBQTJDLENBQTlDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsSUFBRyxJQUFLLENBQUEsNEJBQUEsQ0FBTCxLQUFzQyxDQUF6QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLElBQUcsSUFBSyxDQUFBLDZCQUFBLENBQUwsS0FBdUMsQ0FBMUM7WUFDRSxLQUFBLEdBQVEsTUFEVjs7VUFFQSxJQUFHLElBQUssQ0FBQSxnQ0FBQSxDQUFMLEtBQTBDLENBQTdDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsZUFBQSxHQUFrQjtVQUNsQixhQUFBLEdBQWdCO1VBRWhCLElBQUcsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBQSxDQUFBLEdBQW9CLEdBQXZCO1lBQ0UsZUFBQSxHQUFrQjtZQUNsQixhQUFBLEdBQWdCLElBRmxCOztVQUdBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHFCQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsT0FBN0I7Y0FDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixDQUNmLENBQ0UsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLEdBQVksY0FBeEIsQ0FERixFQUVFLElBQUssQ0FBQSxpQ0FBQSxDQUZQLEVBR0UsSUFBSyxDQUFBLDRCQUFBLENBSFAsQ0FEZSxFQU1mLENBQ0UsUUFBQSxHQUFXLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxHQUFZLGVBQXhCLENBRGIsRUFFRSxJQUFLLENBQUEsNkJBQUEsQ0FGUCxFQUdFLElBQUssQ0FBQSxnQ0FBQSxDQUhQLENBTmUsQ0FBakI7Y0FZQSxTQUFBLEdBQWdCLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFyQixDQUFrQztnQkFBQSxjQUFBLEVBQWdCLEdBQWhCO2dCQUFzQixjQUFBLEVBQWdCLEdBQXRDO2VBQWxDO2NBQ2hCLFNBQVMsQ0FBQyxNQUFWLENBQWlCLFFBQWpCLEVBQTJCLENBQTNCO2NBQ0EsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsQ0FBM0I7Y0FDQSxPQUFBLEdBQ0U7Z0JBQUEsT0FBQSxFQUFRLGlGQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxXQUFBLEVBQWEsTUFSYjtnQkFTQSxRQUFBLEVBQVUsQ0FBQyxTQUFELEVBQVksU0FBWixDQVRWOztjQVVGLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsbUJBQXhCLENBQWpDO2NBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCO1lBaENXLENBQUYsQ0FBWCxFQWtDRyxJQWxDSDtVQURVO1VBb0NaLElBQUcsS0FBSDtZQUNFLHdGQURGOztVQUVBLFlBQWEsQ0FBQSxtQkFBQSxDQUFiLEdBQW1DLG9CQXREckM7O1FBdURBLElBQUcsQ0FBSSxZQUFhLENBQUEsc0JBQUEsQ0FBcEI7VUFDRSxLQUFBLEdBQVE7VUFDUixJQUFHLElBQUssQ0FBQSxnQ0FBQSxDQUFMLEtBQTBDLENBQTdDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsU0FBQSxHQUFZLFNBQUE7bUJBQ1YsVUFBQSxDQUFXLENBQUUsU0FBQTtBQUNYLGtCQUFBO2NBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2NBQ2YsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsZ0JBQTdCO2NBQ0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsT0FBN0I7Y0FDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixDQUNmLENBQ0Usb0NBREYsRUFFRSxJQUFLLENBQUEsK0JBQUEsQ0FGUCxDQURlLENBQWpCO2NBTUEsU0FBQSxHQUFnQixJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsWUFBckIsQ0FBa0M7Z0JBQUEsY0FBQSxFQUFnQixHQUFoQjtnQkFBc0IsY0FBQSxFQUFnQixHQUF0QztlQUFsQztjQUNoQixTQUFTLENBQUMsTUFBVixDQUFpQixRQUFqQixFQUEyQixDQUEzQjtjQUNBLE9BQUEsR0FDRTtnQkFBQSxPQUFBLEVBQVEsc0JBQVI7Z0JBQ0EsZ0JBQUEsRUFDQztrQkFBQSxVQUFBLEVBQVksRUFBWjtpQkFGRDtnQkFHQSxTQUFBLEVBQ0M7a0JBQUEsV0FBQSxFQUNDO29CQUFBLFVBQUEsRUFBWSxFQUFaO21CQUREO2lCQUpEO2dCQU1BLE9BQUEsRUFBUyxlQU5UO2dCQU9BLFFBQUEsRUFBVSxHQVBWO2dCQVFBLEtBQUEsRUFBTztrQkFDTixZQUFBLEVBQWMsS0FEUjtpQkFSUDtnQkFXQSxXQUFBLEVBQWEsTUFYYjtnQkFZQSxRQUFBLEVBQVUsQ0FBQyxTQUFELEVBQVksU0FBWixDQVpWOztjQWFGLElBQUcsS0FBSDtnQkFDRSxLQUFBLEdBQVksSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQXJCLENBQWlDLFFBQVEsQ0FBQyxjQUFULENBQXdCLHNCQUF4QixDQUFqQztnQkFDWixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsT0FBckIsRUFGRjs7WUExQlcsQ0FBRixDQUFYLEVBOEJHLElBOUJIO1VBRFU7VUFnQ1o7VUFDQSxZQUFhLENBQUEsc0JBQUEsQ0FBYixHQUFzQyx1QkFyQ3hDOztBQTNERztBQXJCUCxXQXNITyxrQkF0SFA7UUF1SEksQ0FBQSxHQUFJO1FBQ0osQ0FBQSxJQUFLLGFBQUEsQ0FBYyxHQUFHLENBQUMsTUFBbEIsRUFBMEIsSUFBMUIsRUFBZ0MsU0FBVSxDQUFBLDhCQUFBLENBQTFDO1FBQ0wsV0FBVyxDQUFDLFVBQVosSUFBMEIsU0FBVSxDQUFBLHFDQUFBLENBQVYsQ0FBaUQ7VUFBQSxPQUFBLEVBQVMsQ0FBVDtTQUFqRDtRQUUxQixJQUFHLENBQUksWUFBYSxDQUFBLG1CQUFBLENBQWpCLElBQTBDLElBQUssQ0FBQSxVQUFBLENBQUwsS0FBb0IsaUJBQWpFO1VBQ0UsS0FBQSxHQUFRO1VBQ1IsSUFBRyxJQUFLLENBQUEsNkNBQUEsQ0FBTCxLQUF1RCxDQUExRDtZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHVCQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLG1CQURGLEVBRUUsQ0FBQSxHQUFJLElBQUssQ0FBQSw2Q0FBQSxDQUZYLENBRGUsRUFLZixDQUNFLE9BREYsRUFFRSxJQUFLLENBQUEsNkNBQUEsQ0FGUCxDQUxlLENBQWpCO2NBVUEsT0FBQSxHQUNFO2dCQUFBLE9BQUEsRUFBUSx1QkFBUjtnQkFDQSxnQkFBQSxFQUNDO2tCQUFBLFVBQUEsRUFBWSxFQUFaO2lCQUZEO2dCQUdBLFNBQUEsRUFDQztrQkFBQSxXQUFBLEVBQ0M7b0JBQUEsVUFBQSxFQUFZLEVBQVo7bUJBREQ7aUJBSkQ7Z0JBTUEsT0FBQSxFQUFTLGVBTlQ7Z0JBT0EsUUFBQSxFQUFVLEdBUFY7Z0JBUUEsTUFBQSxFQUFTLE1BUlQ7Z0JBU0EsUUFBQSxFQUFVLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FUVjtnQkFVQSxRQUFBLEVBQVU7a0JBQUUsQ0FBQSxFQUFHO29CQUFDLE1BQUEsRUFBUSxHQUFUO21CQUFMO2lCQVZWO2dCQVdBLGVBQUEsRUFBaUIsRUFYakI7O2NBWUYsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUE4QixRQUFRLENBQUMsY0FBVCxDQUF3QixtQkFBeEIsQ0FBOUI7Y0FDWixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsT0FBckI7WUE1QlcsQ0FBRixDQUFYLEVBOEJHLElBOUJIO1VBRFU7VUFnQ1osSUFBRyxLQUFIO1lBQ0Usd0ZBREY7O1VBRUEsWUFBYSxDQUFBLG1CQUFBLENBQWIsR0FBbUMsb0JBdENyQzs7UUF3Q0EsSUFBRyxDQUFJLFlBQWEsQ0FBQSwwQkFBQSxDQUFqQixJQUFpRCxJQUFLLENBQUEsVUFBQSxDQUFMLEtBQW9CLGlCQUF4RTtVQUNFLEtBQUEsR0FBUTtVQUVSLElBQUcsSUFBSyxDQUFBLDBCQUFBLENBQUwsS0FBb0MsQ0FBdkM7WUFDRSxLQUFBLEdBQVEsTUFEVjs7VUFFQSxTQUFBLEdBQVksU0FBQTttQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsa0JBQUE7Y0FBQSxRQUFBLEdBQWUsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXJCLENBQUE7Y0FDZixRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixZQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE1BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLDZCQURGLEVBRUUsSUFBSyxDQUFBLDBCQUFBLENBRlAsQ0FEZSxFQUtmLENBQ0Usc0RBREYsRUFFRSxHQUZGLENBTGUsQ0FBakI7Y0FVQSxPQUFBLEdBQ0U7Z0JBQUEsT0FBQSxFQUFRLGVBQVI7Z0JBQ0EsZ0JBQUEsRUFDQztrQkFBQSxVQUFBLEVBQVksRUFBWjtpQkFGRDtnQkFHQSxTQUFBLEVBQ0M7a0JBQUEsV0FBQSxFQUNDO29CQUFBLFVBQUEsRUFBWSxFQUFaO21CQUREO2lCQUpEO2dCQU1BLE9BQUEsRUFBUyxlQU5UO2dCQU9BLFFBQUEsRUFBVSxHQVBWO2dCQVFBLFdBQUEsRUFBYSxNQVJiO2dCQVNBLFFBQUEsRUFBVSxDQUFDLFNBQUQsRUFBWSxTQUFaLENBVFY7Z0JBVUEsaUJBQUEsRUFBbUIsTUFWbkI7O2NBV0YsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxRQUFRLENBQUMsY0FBVCxDQUF3QiwwQkFBeEIsQ0FBakM7Y0FDWixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsT0FBckI7WUEzQlcsQ0FBRixDQUFYLEVBNkJHLElBN0JIO1VBRFU7VUErQlosSUFBRyxLQUFIO1lBQ0Usd0ZBREY7O1VBR0EsWUFBYSxDQUFBLDBCQUFBLENBQWIsR0FBMEMsMkJBdkM1Qzs7UUF5Q0EsSUFBRyxDQUFJLFlBQWEsQ0FBQSwrQkFBQSxDQUFqQixJQUFzRCxJQUFLLENBQUEsVUFBQSxDQUFMLEtBQW9CLGlCQUE3RTtVQUNFLEtBQUEsR0FBUTtVQUNSLElBQUcsSUFBSyxDQUFBLCtCQUFBLENBQUwsS0FBeUMsQ0FBNUM7WUFDRSxLQUFBLEdBQVEsTUFEVjs7VUFFQSxTQUFBLEdBQVksU0FBQTttQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsa0JBQUE7Y0FBQSxRQUFBLEdBQWUsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXJCLENBQUE7Y0FDZixRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixZQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE1BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLGtDQURGLEVBRUUsSUFBSyxDQUFBLCtCQUFBLENBRlAsQ0FEZSxFQUtmLENBQ0UsOERBREYsRUFFRSxHQUZGLENBTGUsQ0FBakI7Y0FVQSxPQUFBLEdBQ0U7Z0JBQUEsT0FBQSxFQUFRLG9CQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxXQUFBLEVBQWEsTUFSYjtnQkFTQSxRQUFBLEVBQVUsQ0FBQyxTQUFELEVBQVksU0FBWixDQVRWO2dCQVVBLGlCQUFBLEVBQW1CLE1BVm5COztjQVdGLElBQUcsS0FBSDtnQkFDRSxLQUFBLEdBQVksSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQXJCLENBQWlDLFFBQVEsQ0FBQyxjQUFULENBQXdCLCtCQUF4QixDQUFqQztnQkFDWixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsT0FBckIsRUFGRjs7WUExQlcsQ0FBRixDQUFYLEVBOEJHLElBOUJIO1VBRFU7VUFnQ1o7VUFDQSxZQUFhLENBQUEsK0JBQUEsQ0FBYixHQUErQyxnQ0FyQ2pEOztBQXRGRztBQXRIUCxXQWtQTyxzQkFsUFA7UUFtUEksSUFBRyxJQUFJLENBQUMsb0JBQVI7VUFDRSxDQUFBLEdBQUk7VUFFSixDQUFBLElBQUssdUJBQUEsQ0FBd0IsSUFBSSxDQUFDLG9CQUE3QixFQUFtRCxTQUFVLENBQUEsaUNBQUEsQ0FBN0Q7VUFDTCxXQUFXLENBQUMsVUFBWixJQUEwQixTQUFVLENBQUEseUNBQUEsQ0FBVixDQUFxRDtZQUFBLE9BQUEsRUFBUyxDQUFUO1dBQXJEO1VBRTFCLElBQUcsQ0FBSSxZQUFhLENBQUEsbUJBQUEsQ0FBcEI7WUFDRSxLQUFBLEdBQVE7WUFDUixJQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUExQixLQUFvQyxDQUF2QztjQUNFLEtBQUEsR0FBUSxNQURWOztZQUVBLFNBQUEsR0FBWSxTQUFBO3FCQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxvQkFBQTtnQkFBQSxRQUFBLEdBQWUsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXJCLENBQUE7Z0JBQ2YsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIseUJBQTdCO2dCQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2dCQUVBLElBQUEsR0FBTztBQUNQO0FBQUEscUJBQUEsd0NBQUE7O2tCQUNFLElBQUcsQ0FBQyxJQUFJLENBQUMsYUFBTCxLQUFzQixVQUF2QixDQUFBLElBQXVDLENBQUMsSUFBSSxDQUFDLE9BQUwsS0FBa0IsZ0JBQW5CLENBQTFDO29CQUVFLENBQUEsR0FBSSxDQUNGLElBQUksQ0FBQyxPQURILEVBRUYsUUFBQSxDQUFTLElBQUksQ0FBQyxVQUFkLENBRkU7b0JBSUosSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFWLEVBTkY7O0FBREY7Z0JBU0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsSUFBakI7Z0JBQ0EsT0FBQSxHQUNFO2tCQUFBLE9BQUEsRUFBUSxnQkFBUjtrQkFDQSxnQkFBQSxFQUNDO29CQUFBLFVBQUEsRUFBWSxFQUFaO21CQUZEO2tCQUdBLFNBQUEsRUFDQztvQkFBQSxXQUFBLEVBQ0M7c0JBQUEsVUFBQSxFQUFZLEVBQVo7cUJBREQ7bUJBSkQ7a0JBTUEsT0FBQSxFQUFTLGFBTlQ7a0JBT0EsUUFBQSxFQUFVLEdBUFY7a0JBUUEsZUFBQSxFQUFpQixFQVJqQjtrQkFTQSwwQkFBQSxFQUE0QixHQVQ1QjtrQkFVQSxhQUFBLEVBQWUsSUFWZjtrQkFXQSxXQUFBLEVBQVk7b0JBQ1QsS0FBQSxFQUFNLEtBREc7b0JBRVQsTUFBQSxFQUFPLEtBRkU7bUJBWFo7O2dCQWdCRixJQUFHLEtBQUg7a0JBQ0UsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUE4QixRQUFRLENBQUMsY0FBVCxDQUF3QixtQkFBeEIsQ0FBOUI7a0JBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCLEVBRkY7O2NBakNXLENBQUYsQ0FBWCxFQXFDRyxJQXJDSDtZQURVLEVBSmQ7O1VBMkNBLElBQUcsS0FBSDtZQUNFLHdGQURGOztVQUVBLFlBQWEsQ0FBQSxtQkFBQSxDQUFiLEdBQW1DO1VBQ25DLElBQUcsQ0FBSSxZQUFhLENBQUEsd0JBQUEsQ0FBcEI7WUFDRSxLQUFBLEdBQVE7WUFDUixJQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUExQixLQUFvQyxDQUF2QztjQUNFLEtBQUEsR0FBUSxNQURWOztZQUVBLFNBQUEsR0FBWSxTQUFBO3FCQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxvQkFBQTtnQkFBQSxRQUFBLEdBQWUsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFNBQXJCLENBQUE7Z0JBQ2YsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIseUJBQTdCO2dCQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2dCQUVBLElBQUEsR0FBTztBQUNQO0FBQUEscUJBQUEsd0NBQUE7O2tCQUNFLElBQUcsQ0FBQyxJQUFJLENBQUMsYUFBTCxLQUFzQixjQUF2QixDQUFBLElBQTJDLENBQUMsSUFBSSxDQUFDLE9BQUwsS0FBa0Isb0JBQW5CLENBQTlDO29CQUVFLENBQUEsR0FBSSxDQUNGLElBQUksQ0FBQyxPQURILEVBRUYsUUFBQSxDQUFTLElBQUksQ0FBQyxVQUFkLENBRkU7b0JBSUosSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFWLEVBTkY7O0FBREY7Z0JBU0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsSUFBakI7Z0JBQ0EsT0FBQSxHQUNFO2tCQUFBLE9BQUEsRUFBUSxvQkFBUjtrQkFDQSxnQkFBQSxFQUNDO29CQUFBLFVBQUEsRUFBWSxFQUFaO21CQUZEO2tCQUdBLFNBQUEsRUFDQztvQkFBQSxXQUFBLEVBQ0M7c0JBQUEsVUFBQSxFQUFZLEVBQVo7cUJBREQ7bUJBSkQ7a0JBTUEsT0FBQSxFQUFTLGFBTlQ7a0JBT0EsUUFBQSxFQUFVLEdBUFY7a0JBUUEsZUFBQSxFQUFpQixFQVJqQjtrQkFTQSwwQkFBQSxFQUE0QixHQVQ1QjtrQkFVQSxhQUFBLEVBQWUsSUFWZjtrQkFXQSxXQUFBLEVBQVk7b0JBQ1QsS0FBQSxFQUFNLEtBREc7b0JBRVQsTUFBQSxFQUFPLEtBRkU7bUJBWFo7O2dCQWdCRixJQUFHLEtBQUg7a0JBQ0UsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUE4QixRQUFRLENBQUMsY0FBVCxDQUF3Qix3QkFBeEIsQ0FBOUI7a0JBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCLEVBRkY7O2NBakNXLENBQUYsQ0FBWCxFQXFDRyxJQXJDSDtZQURVLEVBSmQ7O1VBMkNBLElBQUcsS0FBSDtZQUNFLHdGQURGOztVQUVBLFlBQWEsQ0FBQSx3QkFBQSxDQUFiLEdBQXdDLHlCQWpHMUM7O0FBREc7QUFsUFA7UUFzVkksV0FBVyxDQUFDLFVBQVosSUFBMEIsYUFBQSxDQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUEwQixJQUExQixFQUFnQyxTQUFVLENBQUEsOEJBQUEsQ0FBMUM7QUF0VjlCO0lBd1ZBLFdBQVcsQ0FBQyxVQUFaLElBQTBCLFNBQVUsQ0FBQSxvQkFBQSxDQUFWLENBQWdDLFdBQWhDO0FBOVY1QjtBQStWQSxTQUFPLFNBQVUsQ0FBQSxtQkFBQSxDQUFWLENBQStCLFdBQS9CO0FBcFhLOztBQXVYZCxpQkFBQSxHQUFvQixTQUFDLEVBQUQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSTtBQUNKLE9BQUEsb0NBQUE7O0FBQ0U7QUFBQSxTQUFBLHVDQUFBOztNQUNFLENBQUUsQ0FBQSxLQUFBLENBQUYsR0FBVztBQURiO0FBREY7QUFHQSxTQUFPO0FBTFc7O0FBT3BCLGlCQUFBLEdBQW9CLFNBQUMsQ0FBRDtBQUNsQixNQUFBO0VBQUEsQ0FBQSxHQUFJO0FBQ0osT0FBQSxlQUFBO0lBQ0UsQ0FBRSxDQUFBLFVBQUEsQ0FBRixHQUFnQjtBQURsQjtBQUVBLFNBQU87QUFKVzs7QUFNcEIsc0JBQUEsR0FBeUIsU0FBQyxFQUFELEVBQUssQ0FBTDtBQUN2QixNQUFBO0VBQUEsYUFBQSxHQUFnQixpQkFBQSxDQUFrQixFQUFsQjtFQUNoQixhQUFBLEdBQWdCLGlCQUFBLENBQWtCLENBQWxCO0VBQ2hCLGtCQUFBLEdBQXFCO0FBQ3JCLE9BQUEsa0JBQUE7UUFBdUQsQ0FBSSxhQUFjLENBQUEsQ0FBQTtNQUF6RSxrQkFBa0IsQ0FBQyxJQUFuQixDQUF3QixDQUF4Qjs7QUFBQTtBQUNBLFNBQU87QUFMZ0I7O0FBUXpCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRCxFQUFZLElBQVo7QUFFeEIsTUFBQTs7SUFGeUIsU0FBTzs7RUFFaEMsQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLEVBQWYsRUFBbUIsTUFBbkI7RUFDSixDQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQU0sT0FBTjtJQUNBLE1BQUEsRUFBUSxzQkFBQSxDQUF1QixDQUF2QixFQUEwQixJQUExQixDQURSOztFQUdGLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUDtBQUNBLFNBQU87QUFSaUI7O0FBYTFCLHVCQUFBLEdBQXdCLFNBQUMsS0FBRDtBQUN0QixNQUFBO0VBQUEsUUFBQSxHQUFTO0VBQ1QsSUFBQSxHQUFLO0VBRUwsWUFBQSxHQUFlLFNBQUMsT0FBRDtBQUNiLFFBQUE7SUFBQSxRQUFBLEdBQVU7QUFDVjtBQUFBLFNBQUEsNkNBQUE7O01BQUEsUUFBUyxDQUFBLFFBQUEsQ0FBVCxHQUFtQjtBQUFuQjtBQUNBLFdBQU87RUFITTtFQU1mLEdBQUEsR0FBTSxTQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLFFBQXJCO1dBQ0osTUFBTyxDQUFBLFFBQVMsQ0FBQSxVQUFBLENBQVQ7RUFESDtFQUlOLGFBQUEsR0FBZSxTQUFDLElBQUQ7QUFDYixRQUFBO0lBQUEsQ0FBQSxHQUFJO0FBQ0osU0FBQSxTQUFBO01BQ0UsR0FBQSxHQUFNO01BQ04sR0FBRyxDQUFDLElBQUosR0FBUztNQUNULEdBQUcsQ0FBQyxNQUFKLEdBQVcsSUFBSyxDQUFBLENBQUE7TUFDaEIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxHQUFQO0FBSkY7QUFLQSxXQUFPO0VBUE07RUFVZixRQUFBLEdBQVcsWUFBQSxDQUFhLEtBQUssQ0FBQyxRQUFuQjtFQUNYLGlCQUFBLEdBQW9CO0FBRXBCO0FBQUEsT0FBQSw2Q0FBQTs7SUFDRSxRQUFBLEdBQVcsR0FBQSxDQUFJLGtCQUFKLEVBQXdCLEdBQXhCLEVBQTZCLFFBQTdCO0lBRVgsU0FBQSxHQUFZLEdBQUEsQ0FBSSxZQUFKLEVBQWtCLEdBQWxCLEVBQXVCLFFBQXZCO0lBQ1osSUFBRyxDQUFJLFNBQVA7TUFBc0IsU0FBQSxHQUFZLEdBQUEsR0FBTSxNQUFBLENBQU8sRUFBRSxpQkFBVCxFQUF4Qzs7SUFDQSxVQUFXLENBQUEsR0FBQSxDQUFJLFlBQUosRUFBa0IsR0FBbEIsRUFBdUIsUUFBdkIsQ0FBQSxDQUFYLEdBQTRDLEdBQUEsQ0FBSSxhQUFKLEVBQW1CLEdBQW5CLEVBQXdCLFFBQXhCO0lBQzVDLGNBQWUsQ0FBQSxTQUFBLENBQWYsR0FBNEIsR0FBQSxDQUFJLFdBQUosRUFBaUIsR0FBakIsRUFBc0IsUUFBdEI7SUFDNUIsSUFBRyxRQUFIOztRQUNFLFFBQVMsQ0FBQSxRQUFBLElBQVc7O01BQ3BCLFFBQVMsQ0FBQSxRQUFBLENBQVMsQ0FBQyxJQUFuQixDQUF3QjtRQUFBLENBQUEsRUFBRyxHQUFBLENBQUksR0FBSixFQUFTLEdBQVQsRUFBYyxRQUFkLENBQUg7UUFBNEIsSUFBQSxFQUFNLFNBQWxDO1FBQTZDLElBQUEsRUFBTSxHQUFBLENBQUksTUFBSixFQUFZLEdBQVosRUFBaUIsUUFBakIsQ0FBbkQ7T0FBeEIsRUFGRjs7QUFQRjtFQVdBLFVBQUEsR0FBYSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVo7RUFDYixlQUFBLEdBQWtCO0FBQ2xCLE9BQUEsOENBQUE7O0lBQ0UsSUFBRyxDQUFJLGVBQWdCLENBQUEsUUFBQSxDQUF2QjtNQUNFLGVBQWdCLENBQUEsUUFBQSxDQUFoQixHQUE0QixRQUFTLENBQUEsUUFBQSxDQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFEcEQ7O0lBRUEsTUFBQSxHQUFTO0FBQ1Q7QUFBQSxTQUFBLHdDQUFBOztNQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWjtBQURGO0lBRUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxTQUFDLENBQUQsRUFBRyxDQUFIO0FBQ1YsYUFBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztJQURMLENBQVo7SUFFQSxRQUFTLENBQUEsUUFBQSxDQUFULEdBQXFCO0FBUnZCO0VBVUEsZ0JBQUEsR0FBbUI7QUFDbkIsT0FBQSwyQkFBQTs7SUFDRSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQjtNQUFBLFFBQUEsRUFBVSxRQUFWO01BQW9CLENBQUEsRUFBRyxDQUF2QjtLQUF0QjtBQURGO0VBRUEsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNwQixXQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0VBREssQ0FBdEI7RUFHQSxXQUFBLEdBQWM7QUFDZCxPQUFBLG9EQUFBOztJQUNFLFdBQVksQ0FBQSxRQUFRLENBQUMsUUFBVCxDQUFaLEdBQWlDLFFBQVMsQ0FBQSxRQUFRLENBQUMsUUFBVDtBQUQ1QztFQUdBLElBQUEsR0FBTyxhQUFBLENBQWMsV0FBZDtBQUNQLFNBQU87QUE3RGU7O0FBZ0VsQjtFQUVKLFVBQUMsQ0FBQSxJQUFELEdBQVE7O0VBQ1IsVUFBQyxDQUFBLFNBQUQsR0FBYTs7RUFDYixVQUFDLENBQUEsSUFBRCxHQUFROztFQUNSLFVBQUMsQ0FBQSxNQUFELEdBQVU7O0VBRUUsb0JBQUE7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUNSLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixZQUFBLEdBQWUsQ0FBQyxtQkFBRCxFQUFzQixvQkFBdEIsRUFBNEMsOEJBQTVDLEVBQTRFLGlDQUE1RSxFQUErRyw2QkFBL0csRUFBOEksa0NBQTlJLEVBQWtMLHFDQUFsTCxFQUF5Tix5Q0FBek4sRUFBb1Esc0JBQXBRO0lBQ2YsZ0JBQUEsR0FBbUIsQ0FBQyxjQUFEO0lBQ25CLElBQUMsQ0FBQSxTQUFELEdBQWE7QUFDYixTQUFBLHNEQUFBOztNQUNFLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFYLEdBQXVCLFVBQVUsQ0FBQyxPQUFYLENBQW1CLENBQUEsQ0FBRSxHQUFBLEdBQU0sUUFBUixDQUFpQixDQUFDLElBQWxCLENBQUEsQ0FBbkI7QUFEekI7QUFFQSxTQUFBLDREQUFBOztNQUNFLFVBQVUsQ0FBQyxlQUFYLENBQTJCLFFBQTNCLEVBQXFDLENBQUEsQ0FBRSxHQUFBLEdBQU0sUUFBUixDQUFpQixDQUFDLElBQWxCLENBQUEsQ0FBckM7QUFERjtFQVJVOzt1QkFXWixZQUFBLEdBQWMsU0FBQyxXQUFELEVBQWMsV0FBZDtXQUNaLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUNFO01BQUEsTUFBQSxFQUFPLElBQVA7TUFDQSxJQUFBLEVBQUssV0FETDtNQUVBLE1BQUEsRUFBTyxTQUFDLEdBQUQ7UUFDTCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsR0FBZTtlQUNmLFdBQUEsQ0FBWSxXQUFaLEVBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DLElBQUMsQ0FBQSxNQUFyQztNQUZLLENBRlA7TUFLQSxJQUFBLEVBQU0sU0FBQyxRQUFELEVBQVcsUUFBWDtRQUNKLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxRQUFBLENBQXRCO2lCQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLFFBQUEsQ0FBZixHQUEyQixDQUFDLFFBQUQsRUFEN0I7U0FBQSxNQUFBO2lCQUdFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLFFBQUEsQ0FBUyxDQUFDLElBQXpCLENBQThCLFFBQTlCLEVBSEY7O01BREksQ0FMTjtNQVVBLFFBQUEsRUFBVSxTQUFDLFFBQUQ7QUFDUixZQUFBO1FBQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxRQUFBLENBQWxCO0FBQ0U7QUFBQTtlQUFBLDZDQUFBOzt5QkFDRSxDQUFBLENBQUUsUUFBRixFQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBcEI7QUFERjt5QkFERjs7TUFEUSxDQVZWO0tBREY7RUFEWTs7dUJBaUJkLGFBQUEsR0FBYyxTQUFDLGFBQUQsRUFBZ0IsR0FBaEI7V0FDWixDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLEdBQUw7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLEtBQUEsRUFBTyxJQUZQO01BR0EsS0FBQSxFQUFPLEtBSFA7TUFJQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGFBQUQ7aUJBQ1AsS0FBQyxDQUFBLFlBQUQsQ0FBYyxhQUFkLEVBQTZCLGFBQTdCO1FBRE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSlQ7S0FERjtFQURZOzt1QkFTZCxvQkFBQSxHQUFxQixTQUFDLGFBQUQsRUFBZ0IsR0FBaEI7V0FDbkIsQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxHQUFMO01BQ0EsUUFBQSxFQUFVLE1BRFY7TUFFQSxLQUFBLEVBQU8sSUFGUDtNQUdBLEtBQUEsRUFBTyxLQUhQO01BSUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxhQUFEO0FBQ1AsY0FBQTtVQUFBLENBQUEsR0FBSSx1QkFBQSxDQUF3QixhQUF4QjtpQkFDSixLQUFDLENBQUEsWUFBRCxDQUFjLGFBQWQsRUFBNkIsQ0FBN0I7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKVDtLQURGO0VBRG1COzt1QkFXckIsU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0FBQUM7QUFBQTtTQUFBLHFDQUFBOzttQkFBQSxDQUFDLENBQUM7QUFBRjs7RUFEUTs7dUJBR1gsaUJBQUEsR0FBbUIsU0FBQyxJQUFEO0FBQ2pCLFFBQUE7QUFBQTtBQUFBLFNBQUEsNkNBQUE7O01BQ0UsSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLElBQWI7UUFBdUIsRUFBdkI7O0FBREY7QUFFQSxXQUFPLENBQUM7RUFIUzs7dUJBS25CLFFBQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxJQUFOO0lBQ1IsSUFBSSxHQUFBLEtBQU8sQ0FBQyxDQUFaO0FBQW9CLGFBQVEsR0FBNUI7O0lBRUEsSUFBRyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBVDtBQUNFLGFBQU8sSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUFYLENBQWtCLElBQWxCLEVBRFQ7S0FBQSxNQUFBO0FBR0UsYUFBTyxHQUhUOztFQUhROzt1QkFRVixRQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sUUFBTjtJQUNSLElBQUcsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQVQ7YUFDRSxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLFFBQVgsQ0FBb0IsUUFBcEIsRUFERjs7RUFEUTs7Ozs7O0FBSVosTUFBTSxDQUFDLE9BQVAsR0FBaUI7Ozs7O0FDN3JCakIsSUFBQTs7QUFBQSxDQUFBLENBQUUsU0FBQTtFQU1BLE1BQU0sQ0FBQyxxQkFBUCxHQUErQjtTQUMvQixNQUFNLENBQUMsd0JBQVAsR0FBa0M7QUFQbEMsQ0FBRjs7QUFTQSxxQkFBQSxHQUFzQixTQUFDLENBQUQ7QUFDcEIsTUFBQTtFQUFBLFlBQUEsR0FBZSxDQUFDLENBQUMsT0FBRixDQUFVLGVBQVYsRUFBMEIsSUFBMUI7U0FDZixDQUFDLENBQUMsT0FBRixDQUFVLHNEQUFBLEdBQXVELFlBQXZELEdBQW9FLG1DQUE5RSxFQUFrSCxTQUFDLElBQUQ7SUFDaEgsQ0FBQSxDQUFFLGlCQUFGLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFyQztJQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBNUM7SUFDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixzQkFBNUIsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxNQUF6RCxFQUFpRSxTQUFBO2FBQUksMEJBQUEsR0FBNkIsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFiO0lBQWpDLENBQWpFO1dBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxRQUF0QyxFQUFnRCxRQUFoRDtFQUpnSCxDQUFsSDtBQUZvQjs7QUFRdEIsd0JBQUEsR0FBMEIsU0FBQTtTQUN4QixLQUFBLENBQU0saUJBQU47QUFEd0I7O0FBRzFCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7RUFBQSxxQkFBQSxFQUFzQixxQkFBdEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYm91bmRzX3RpbWVvdXQ9dW5kZWZpbmVkXG5cblxubWFwID0gbmV3IEdNYXBzXG4gIGVsOiAnI2dvdm1hcCdcbiAgbGF0OiAzNy4zXG4gIGxuZzogLTExOS4zXG4gIHpvb206IDZcbiAgbWluWm9vbTogNlxuICBzY3JvbGx3aGVlbDogdHJ1ZVxuICBtYXBUeXBlQ29udHJvbDogZmFsc2VcbiAgcGFuQ29udHJvbDogZmFsc2VcbiAgbWFwVHlwZUNvbnRyb2w6IGZhbHNlXG4gIHpvb21Db250cm9sOiB0cnVlXG4gIHpvb21Db250cm9sT3B0aW9uczpcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxuXG5tYXAubWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5SSUdIVF9UT1BdLnB1c2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2VuZCcpKVxuXG5yZXJlbmRlcl9tYXJrZXJzID0gLT5cbiAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gR09WV0lLSS5tYXJrZXJzXG5cbnJlYnVpbGRfZmlsdGVyID0gLT5cbiAgaGFyZF9wYXJhbXMgPSBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yID0gW11cbiAgJCgnLnR5cGVfZmlsdGVyJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgaWYgJChlbGVtZW50KS5hdHRyKCduYW1lJykgaW4gaGFyZF9wYXJhbXMgYW5kICQoZWxlbWVudCkudmFsKCkgPT0gJzEnXG4gICAgICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLnB1c2ggJChlbGVtZW50KS5hdHRyKCduYW1lJylcblxuIyBsZWdlbmRUeXBlID0gY2l0eSwgc2Nob29sIGRpc3RyaWN0LCBzcGVjaWFsIGRpc3RyaWN0LCBjb3VudGllc1xuZ2V0X3JlY29yZHMyID0gKGxlZ2VuZFR5cGUsIG9uc3VjY2VzcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGE/bGltaXQ9NjAwXCJcbiMgICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUgfVxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG5cbiAgcmVidWlsZF9maWx0ZXIoKVxuICBnZXRfcmVjb3JkczIgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiwgKGRhdGEpIC0+XG4gICAgR09WV0lLSS5tYXJrZXJzID0gZGF0YTtcbiAgICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpOm5vdCguY291bnRpZXMtdHJpZ2dlciknKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaGlkZGVuX2ZpZWxkID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpXG4gICAgdmFsdWUgPSBoaWRkZW5fZmllbGQudmFsKClcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcbiAgICByZWJ1aWxkX2ZpbHRlcigpXG4gICAgbWFwLnJlbW92ZU1hcmtlcnMoKVxuICAgIHJlcmVuZGVyX21hcmtlcnMoKVxuXG4gICQoJyNsZWdlbmQgbGkuY291bnRpZXMtdHJpZ2dlcicpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdhY3RpdmUnKSB0aGVuIEdPVldJS0kuZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29ucyBlbHNlIG1hcC5yZW1vdmVQb2x5Z29ucygpXG5cblxuXG5cbmdldF9pY29uID0oYWx0X3R5cGUpIC0+XG5cbiAgX2NpcmNsZSA9KGNvbG9yKS0+XG4gICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEVcbiAgICBmaWxsT3BhY2l0eTogMVxuICAgIGZpbGxDb2xvcjpjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOid3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTo2XG5cbiAgc3dpdGNoIGFsdF90eXBlXG4gICAgd2hlbiAnQ2l0eScgdGhlbiByZXR1cm4gX2NpcmNsZSAncmVkJ1xuICAgIHdoZW4gJ1NjaG9vbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAnbGlnaHRibHVlJ1xuICAgIHdoZW4gJ1NwZWNpYWwgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3B1cnBsZSdcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcblxuaW5fYXJyYXkgPSAobXlfaXRlbSwgbXlfYXJyYXkpIC0+XG4gIGZvciBpdGVtIGluIG15X2FycmF5XG4gICAgcmV0dXJuIHRydWUgaWYgaXRlbSA9PSBteV9pdGVtXG4gIGZhbHNlXG5cblxuYWRkX21hcmtlciA9IChyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIGV4aXN0ID0gaW5fYXJyYXkgcmVjLmFsdFR5cGUsIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzJcbiAgaWYgZXhpc3QgaXMgZmFsc2UgdGhlbiByZXR1cm4gZmFsc2VcbiAgbWFwLmFkZE1hcmtlclxuICAgIGxhdDogcmVjLmxhdGl0dWRlXG4gICAgbG5nOiByZWMubG9uZ2l0dWRlXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4gICAgdGl0bGU6ICBcIiN7cmVjLm5hbWV9LCAje3JlYy50eXBlfVwiXG4gICAgaW5mb1dpbmRvdzpcbiAgICAgIGNvbnRlbnQ6IFwiXG4gICAgICAgIDxkaXY+PGEgaHJlZj0namF2YXNjcmlwdDp2b2lkKDApOycgY2xhc3M9J2luZm8td2luZG93LXVyaScgZGF0YS11cmk9Jy8je3JlYy5hbHRUeXBlU2x1Z30vI3tyZWMuc2x1Z30nPjxzdHJvbmc+I3tyZWMubmFtZX08L3N0cm9uZz48L2E+PC9kaXY+XG4gICAgICAgIDxkaXY+ICN7cmVjLnR5cGV9ICAje3JlYy5jaXR5fSAje3JlYy56aXB9ICN7cmVjLnN0YXRlfTwvZGl2PlwiXG5cblxuIyBHRU9DT0RJTkcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5waW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cbiAgR01hcHMuZ2VvY29kZVxuICAgIGFkZHJlc3M6IGFkZHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cbiAgICAgIGlmIHN0YXR1cyA9PSAnT0snXG4gICAgICAgIGxhdGxuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxuICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgbGF0OiBsYXRsbmcubGF0KClcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxuICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICB0aXRsZTogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICBjb250ZW50OiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG5cbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgbWFwOiBtYXBcbiIsIlxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXR5cGVcIj57e3tnb3ZfdHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBnb3ZzX2FycmF5ID0gW11cblxuICBjb3VudF9nb3ZzIDogKCkgLT5cbiAgICBjb3VudCA9MFxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgY291bnQrK1xuICAgIHJldHVybiBjb3VudFxuXG5cbiAgc3RhcnRTdWdnZXN0aW9uIDogKGdvdnMpID0+XG4gICAgI0Bnb3ZzX2FycmF5ID0gZ292c1xuICAgIEBnb3ZzX2FycmF5ID0gZ292cy5yZWNvcmRcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAsIDEwMDBcblxuICAgICQoQGh0bWxfc2VsZWN0b3IpLnR5cGVhaGVhZChcbiAgICAgICAgaGludDogZmFsc2VcbiAgICAgICAgaGlnaGxpZ2h0OiBmYWxzZVxuICAgICAgICBtaW5MZW5ndGg6IDFcbiAgICAgICAgY2xhc3NOYW1lczpcbiAgICAgICAgXHRtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2dvdl9uYW1lJ1xuICAgICAgICBkaXNwbGF5S2V5OiAnZ292X25hbWUnXG4gICAgICAgIHNvdXJjZTogcXVlcnlfbWF0Y2hlcihAZ292c19hcnJheSwgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICMgJCgnLmdvdi1jb3VudGVyJykudGV4dCBAY291bnRfZ292cygpXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIiMjI1xuZmlsZTogbWFpbi5jb2ZmZSAtLSBUaGUgZW50cnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgOlxuZ292X2ZpbmRlciA9IG5ldyBHb3ZGaW5kZXJcbmdvdl9kZXRhaWxzID0gbmV3IEdvdkRldGFpbHNcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5Hb3ZTZWxlY3RvciA9IHJlcXVpcmUgJy4vZ292c2VsZWN0b3IuY29mZmVlJ1xuI19qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG53aWtpcGVkaWEgPSByZXF1aXJlICcuL3dpa2lwZWRpYS5jb2ZmZWUnXG5cbmdvdm1hcCA9IG51bGxcbmdvdl9zZWxlY3RvciA9IG51bGxcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5hY3RpdmVfdGFiID0gXCJcIlxudW5kZWYgPSBudWxsXG5hdXRob3JpemVkID0gZmFsc2VcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlciAnaWZfZXEnLCAoYSwgYiwgb3B0cykgLT5cbiAgICBpZiBgYSA9PSBiYFxuICAgICAgICByZXR1cm4gb3B0cy5mbiB0aGlzXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3B0cy5pbnZlcnNlIHRoaXNcblxud2luZG93LkdPVldJS0kgPVxuICAgIHN0YXRlX2ZpbHRlcjogJydcbiAgICBnb3ZfdHlwZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyXzI6IFsnQ2l0eScsICdTY2hvb2wgRGlzdHJpY3QnLCAnU3BlY2lhbCBEaXN0cmljdCddXG5cbiAgICBzaG93X3NlYXJjaF9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgZm9jdXNfc2VhcmNoX2ZpZWxkIDUwMFxuXG4gICAgc2hvd19kYXRhX3BhZ2U6ICgpIC0+XG4gICAgICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuZmFkZUluKDMwMClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuXG5HT1ZXSUtJLmdldF9jb3VudGllcyA9IGdldF9jb3VudGllcyA9IChjYWxsYmFjaykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnL2xlZ2FjeS9kYXRhL2NvdW50eV9nZW9ncmFwaHlfY2FfMi5qc29uJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChjb3VudGllc0pTT04pIC0+XG4gICAgICAgICAgICBjYWxsYmFjayBjb3VudGllc0pTT05cblxuR09WV0lLSS5kcmF3X3BvbHlnb25zID0gZHJhd19wb2x5Z29ucyA9IChjb3VudGllc0pTT04pIC0+XG4gICAgZm9yIGNvdW50eSBpbiBjb3VudGllc0pTT04uZmVhdHVyZXNcbiAgICAgICAgZG8gKGNvdW50eSkgPT5cbiAgICAgICAgICAgIGdvdm1hcC5tYXAuZHJhd1BvbHlnb24oe1xuICAgICAgICAgICAgICAgIHBhdGhzOiBjb3VudHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNcbiAgICAgICAgICAgICAgICB1c2VHZW9KU09OOiB0cnVlXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICcjODA4MDgwJ1xuICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAuNlxuICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMS41XG4gICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnI0ZGMDAwMCdcbiAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4xNVxuICAgICAgICAgICAgICAgIGNvdW50eUlkOiBjb3VudHkucHJvcGVydGllcy5faWRcbiAgICAgICAgICAgICAgICBhbHROYW1lOiBjb3VudHkucHJvcGVydGllcy5hbHRfbmFtZVxuICAgICAgICAgICAgICAgIG1hcmtlcjogbmV3IE1hcmtlcldpdGhMYWJlbCh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDAsIDApLFxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICByYWlzZU9uRHJhZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1hcDogZ292bWFwLm1hcC5tYXAsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQ29udGVudDogY291bnR5LnByb3BlcnRpZXMubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxBbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCgtMTUsIDI1KSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWxDbGFzczogXCJsYWJlbC10b29sdGlwXCIsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsU3R5bGU6IHtvcGFjaXR5OiAxLjB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBcImh0dHA6Ly9wbGFjZWhvbGQuaXQvMXgxXCIsXG4gICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0T3B0aW9ucyh7ZmlsbENvbG9yOiBcIiMwMEZGMDBcIn0pXG4gICAgICAgICAgICAgICAgbW91c2Vtb3ZlOiAoZXZlbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFBvc2l0aW9uKGV2ZW50LmxhdExuZylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZSh0cnVlKVxuICAgICAgICAgICAgICAgIG1vdXNlb3V0OiAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE9wdGlvbnMoe2ZpbGxDb2xvcjogXCIjRkYwMDAwXCJ9KVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKVxuICAgICAgICAgICAgICAgIGNsaWNrOiAtPlxuICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgdXJpID0gXCIvI3tjb3VudHkuYWx0X3R5cGVfc2x1Z30vI3tjb3VudHkucHJvcGVydGllcy5zbHVnfVwiXG4gICAgICAgICAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcbiAgICAgICAgICAgIH0pXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPSAobmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG4kKGRvY3VtZW50KS5vbiAnY2xpY2snLCAnI2ZpZWxkVGFicyBhJywgKGUpIC0+XG4gICAgYWN0aXZlX3RhYiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd0YWJuYW1lJylcbiAgICBjb25zb2xlLmxvZyBhY3RpdmVfdGFiXG4gICAgJChcIiN0YWJzQ29udGVudCAudGFiLXBhbmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIilcbiAgICAkKCQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKCdocmVmJykpLmFkZENsYXNzKFwiYWN0aXZlXCIpXG4gICAgdGVtcGxhdGVzLmFjdGl2YXRlIDAsIGFjdGl2ZV90YWJcblxuICAgIGlmIGFjdGl2ZV90YWIgPT0gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IDBcbiAgICAgICAgZmluVmFsV2lkdGhNYXgzID0gMFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDFcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDEgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgyXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgyID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiM1wiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4M1xuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjFcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgxICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjJcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgyICsgMjcpXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0gLmN1cnJlbmN5LXNpZ24nKS5jc3MoJ3JpZ2h0JywgZmluVmFsV2lkdGhNYXgzICsgMjcpXG5cbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxuXG5hY3RpdmF0ZV90YWIgPSAoKSAtPlxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxuIyBjbGVhciB3aWtpcGVkaWEgcGxhY2VcbiAgICAkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKFwiXCIpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICBnZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgZGF0YS5faWQsIChkYXRhMiwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMgPSBkYXRhMlxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YTNcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldF9tYXhfcmFua3MgKG1heF9yYW5rc19yZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjVE9ETzogRW5hYmxlIGFmdGVyIHJlYWxpemUgbWF4X3JhbmtzIGFwaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG5cbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcbiAgICAgICAgICAgICN3cG4gPSBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICAgICAgICAgICMkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKGlmIHdwbiB0aGVuIHdwbiBlbHNlIFwiTm8gV2lraXBlZGlhIGFydGljbGVcIilcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzkvYXBpL2dvdmVybm1lbnQvXCIgKyBhbHRfdHlwZSArICcvJyArIGdvdl9uYW1lXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvX3Byb2MvZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzXCJcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiBcImdvdndpa2lcIlxuICAgICAgICAgICAgb3JkZXI6IFwiY2FwdGlvbl9jYXRlZ29yeSxkaXNwbGF5X29yZGVyXCJcbiAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ292c19pZFwiXG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZTogXCJJTlwiXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxuICAgICAgICAgICAgXVxuXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfbWF4X3JhbmtzID0gKG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6ICdnb3Z3aWtpJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCA9IChyZWMpPT5cbiAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICBhY3RpdmF0ZV90YWIoKVxuICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIHJvdXRlci5uYXZpZ2F0ZShyZWMuX2lkKVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkMiA9IChyZWMpPT5cbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICByZWMuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9IHVybFxuXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcbiAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXNcbiAgICAgICAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgdmFsdWVzLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgICBzICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBzZWxlY3QgPSAkKHMpXG4gICAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG5cbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgICBpZiB0ZXh0IGlzICdTdGF0ZS4uJ1xuICAgICAgICBzZWxlY3QudmFsICdDQSdcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xuXG4gICAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgaW5wID0gJCgnI215aW5wdXQnKVxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxuICAgIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cbnN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgICQod2luZG93KS5yZXNpemUgLT5cbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcblxuXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoZSkgLT5cbiAgICBoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBpZiBub3QgaFxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5yb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcblxuR09WV0lLSS5oaXN0b3J5ID0gKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID09IDBcbiAgICAgICAgc2VhcmNoQ29udGFpbmVyID0gJCgnI3NlYXJjaENvbnRhaW5lcicpLnRleHQoKTtcbiAgICAgICAgaWYoc2VhcmNoQ29udGFpbmVyICE9ICcnKVxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4gICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nXG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGhpc3Rvcnkuc3RhdGUgIT0gbnVsbCAmJiBoaXN0b3J5LnN0YXRlLnRlbXBsYXRlICE9IHVuZGVmaW5lZClcbiAgICAgICAgd2luZG93Lmhpc3RvcnkuZ28oaW5kZXgpO1xuICAgIGVsc2VcbiAgICAgICAgcm91dGUucG9wKClcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLycgKyByb3V0ZS5qb2luKCcvJylcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3BvcHN0YXRlJywgKGV2ZW50KSAtPlxuICAgIGNvbnNvbGUubG9nKHdpbmRvdy5oaXN0b3J5LnN0YXRlKVxuICAgIGlmIHdpbmRvdy5oaXN0b3J5LnN0YXRlIGlzbnQgbnVsbFxuICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgZXZlbnQuc3RhdGUudGVtcGxhdGVcbiAgICAgICAgcm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmxlbmd0aC0xO1xuICAgICAgICBpZiByb3V0ZSBpcyAyIHRoZW4gJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGlmIHJvdXRlIGlzIDEgdGhlbiAkKCcjc2VhcmNoQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIGVsc2VcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcbiMgICAgZWxzZVxuIyAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucmVsb2FkKClcblxuIyBSZWZyZXNoIERpc3F1cyB0aHJlYWRcbnJlZnJlc2hfZGlzcXVzID0gKG5ld0lkZW50aWZpZXIsIG5ld1VybCwgbmV3VGl0bGUpIC0+XG4gICAgRElTUVVTLnJlc2V0XG4gICAgICAgIHJlbG9hZDogdHJ1ZSxcbiAgICAgICAgY29uZmlnOiAoKSAtPlxuICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBuZXdJZGVudGlmaWVyXG4gICAgICAgICAgICB0aGlzLnBhZ2UudXJsID0gbmV3VXJsXG4gICAgICAgICAgICB0aGlzLnBhZ2UudGl0bGUgPSBuZXdUaXRsZVxuXG4jXG4jIFNvcnQgdGFibGUgYnkgY29sdW1uLlxuIyBAcGFyYW0gc3RyaW5nIHRhYmxlICBKUXVlcnkgc2VsZWN0b3IuXG4jIEBwYXJhbSBudW1iZXIgY29sTnVtIENvbHVtbiBudW1iZXIuXG4jXG5zb3J0VGFibGUgPSAodGFibGUsIGNvbE51bSkgLT5cbiAgICAjXG4gICAgIyBEYXRhIHJvd3MgdG8gc29ydFxuICAgICNcbiAgICByb3dzID0gJCh0YWJsZSArICcgdGJvZHkgIFtkYXRhLWlkXScpLmdldCgpXG4gICAgI1xuICAgICMgTGFzdCByb3cgd2hpY2ggY29udGFpbnMgXCJBZGQgbmV3IC4uLlwiXG4gICAgI1xuICAgIGxhc3RSb3cgPSAkKHRhYmxlICsgJyB0Ym9keSAgdHI6bGFzdCcpLmdldCgpO1xuICAgICNcbiAgICAjIENsaWNrZWQgY29sdW1uLlxuICAgICNcbiAgICBjb2x1bW4gPSAkKHRhYmxlICsgJyB0Ym9keSB0cjpmaXJzdCcpLmNoaWxkcmVuKCd0aCcpLmVxKGNvbE51bSlcbiAgICBtYWtlU29ydCA9IHRydWVcblxuICAgIGlmIGNvbHVtbi5oYXNDbGFzcygnZGVzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgICAgICMgUmVzdG9yZSByb3cgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2Rlc2MnKS5hZGRDbGFzcygnb3JpZ2luJylcbiAgICAgIHJvd3MgPSBjb2x1bW4uZGF0YSgnb3JpZ2luJylcbiAgICAgIG1ha2VTb3J0ID0gZmFsc2U7XG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ2FzYycpXG4gICAgICAjXG4gICAgICAjIFRhYmxlIGN1cnJlbnRseSBzb3J0ZWQgaW4gYXNjZW5kaW5nIG9yZGVyLlxuICAgICAgIyBTb3J0IGluIGRlc2Mgb3JkZXIuXG4gICAgICAjXG4gICAgICBjb2x1bW4ucmVtb3ZlQ2xhc3MoJ2FzYycpLmFkZENsYXNzKCdkZXNjJylcbiAgICAgIHNvcnRGdW5jdGlvbiA9IChhLCBiKSAtPlxuICAgICAgICBBID0gJChhKS5jaGlsZHJlbigndGQnKS5lcShjb2xOdW0pLnRleHQoKS50b1VwcGVyQ2FzZSgpXG4gICAgICAgIEIgPSAkKGIpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKClcbiAgICAgICAgaWYgQSA8IEIgdGhlbiByZXR1cm4gMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAtMVxuICAgICAgICByZXR1cm4gMFxuXG4gICAgZWxzZSBpZiBjb2x1bW4uaGFzQ2xhc3MoJ29yaWdpbicpXG4gICAgICAjXG4gICAgICAjIE9yaWdpbmFsIHRhYmxlIGRhdGEgb3JkZXIuXG4gICAgICAjIFNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuICAgICAgY29sdW1uLmFkZENsYXNzKCdhc2MnKVxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAtMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG4gICAgZWxzZVxuICAgICAgI1xuICAgICAgIyBUYWJsZSBub3Qgb3JkZXJlZCB5ZXQuXG4gICAgICAjIFN0b3JlIG9yaWdpbmFsIGRhdGEgcG9zaXRpb24gYW5kIHNvcnQgaW4gYXNjIG9yZGVyLlxuICAgICAgI1xuXG4gICAgICBjb2x1bW4uYWRkQ2xhc3MoJ2FzYycpXG4gICAgICBjb2x1bW4uZGF0YSgnb3JpZ2luJywgcm93cy5zbGljZSgwKSlcblxuICAgICAgc29ydEZ1bmN0aW9uID0gKGEsIGIpIC0+XG4gICAgICAgIEEgPSAkKGEpLmNoaWxkcmVuKCd0ZCcpLmVxKGNvbE51bSkudGV4dCgpLnRvVXBwZXJDYXNlKClcbiAgICAgICAgQiA9ICQoYikuY2hpbGRyZW4oJ3RkJykuZXEoY29sTnVtKS50ZXh0KCkudG9VcHBlckNhc2UoKVxuICAgICAgICBpZiBBIDwgQiB0aGVuIHJldHVybiAtMVxuICAgICAgICBpZiBBID4gQiB0aGVuIHJldHVybiAxXG4gICAgICAgIHJldHVybiAwXG5cbiAgICBpZiAobWFrZVNvcnQpIHRoZW4gcm93cy5zb3J0IHNvcnRGdW5jdGlvblxuICAgICQuZWFjaCByb3dzLCAoaW5kZXgsIHJvdykgLT5cbiAgICAgICAgJCh0YWJsZSkuY2hpbGRyZW4oJ3Rib2R5JykuYXBwZW5kKHJvdylcbiAgICAkKHRhYmxlKS5jaGlsZHJlbigndGJvZHknKS5hcHBlbmQobGFzdFJvdylcblxuaW5pdFRhYmxlSGFuZGxlcnMgPSAocGVyc29uKSAtPlxuICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKClcblxuICAgICQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKHtzdHlsZXNoZWV0czogZmFsc2UsdHlwZTogJ3RleHRhcmVhJywgc2hvd2J1dHRvbnM6ICdib3R0b20nLCBkaXNwbGF5OiB0cnVlLCBlbXB0eXRleHQ6ICcgJ30pXG4gICAgJCgnLmVkaXRhYmxlJykub2ZmKCdjbGljaycpO1xuXG4gICAgJCgndGFibGUnKS5vbiAnY2xpY2snLCAnLmdseXBoaWNvbi1wZW5jaWwnLCAoZSkgLT5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBpZiBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5ub0VkaXRhYmxlIGlzbnQgdW5kZWZpbmVkIHRoZW4gcmV0dXJuXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICAgICQuYWpheCAnL2VkaXRyZXF1ZXN0L25ldycsIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5zdGF0dXMgaXMgNDAxXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMFxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0aG9yaXplZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0ZCcpLmZpbmQoJy5lZGl0YWJsZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcbiAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGQnKS5maW5kKCcuZWRpdGFibGUnKS5lZGl0YWJsZSgndG9nZ2xlJyk7XG5cbiAgICAjXG4gICAgIyBBZGQgc29ydCBoYW5kbGVycy5cbiAgICAjXG4gICAgJCgnLnNvcnQnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgdHlwZSA9ICQodGhpcykuYXR0cignZGF0YS1zb3J0LXR5cGUnKVxuXG4gICAgICBpZiB0eXBlIGlzICd5ZWFyJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSB5ZWFyLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAwKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICduYW1lJ1xuICAgICAgICAjXG4gICAgICAgICMgU29ydCBieSBuYW1lLlxuICAgICAgICAjXG4gICAgICAgIHNvcnRUYWJsZSgnW2RhdGEtZW50aXR5LXR5cGU9XCJDb250cmlidXRpb25cIl0nLCAxKVxuICAgICAgZWxzZSBpZiB0eXBlIGlzICdhbW91bnQnXG4gICAgICAgICNcbiAgICAgICAgIyBTb3J0IGJ5IGFtb3VudC5cbiAgICAgICAgI1xuICAgICAgICBzb3J0VGFibGUoJ1tkYXRhLWVudGl0eS10eXBlPVwiQ29udHJpYnV0aW9uXCJdJywgMylcblxuICAgICQoJ2EnKS5vbiAnc2F2ZScsIChlLCBwYXJhbXMpIC0+XG4gICAgICAgIGVudGl0eVR5cGUgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndGFibGUnKVswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgaWQgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKVswXS5kYXRhc2V0LmlkXG4gICAgICAgIGZpZWxkID0gT2JqZWN0LmtleXMoJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RkJylbMF0uZGF0YXNldClbMF1cbiAgICAgICAgc2VuZE9iamVjdCA9IHtcbiAgICAgICAgICAgIGVkaXRSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBlbnRpdHlJZDogaWQsXG4gICAgICAgICAgICAgICAgY2hhbmdlczoge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0LmNoYW5nZXNbZmllbGRdID0gcGFyYW1zLm5ld1ZhbHVlXG4gICAgICAgIHNlbmRPYmplY3QuZWRpdFJlcXVlc3QgPSBKU09OLnN0cmluZ2lmeShzZW5kT2JqZWN0LmVkaXRSZXF1ZXN0KTtcbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9jcmVhdGUnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGE6IHNlbmRPYmplY3QsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQvanNvbicsXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgdGV4dCA9IEpTT04ucGFyc2UocmVzcG9uc2UucmVzcG9uc2VUZXh0KVxuICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICB9XG5cbiAgICAkKCd0YWJsZScpLm9uICdjbGljaycsICcuYWRkJywgKGUpIC0+XG4gICAgICAgIHRhYlBhbmUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcudGFiLXBhbmUnKVxuICAgICAgICB0YWJsZVR5cGUgPSB0YWJQYW5lWzBdLmlkXG4gICAgICAgIGlmICghYXV0aG9yaXplZClcbiAgICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9uZXcnLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGNvbXBsZXRlOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgIGlmIHJlc3BvbnNlLnN0YXR1cyBpcyA0MDFcbiAgICAgICAgICAgICAgICBzaG93TW9kYWwoJy9sb2dpbicpXG4gICAgICAgICAgICAgIGVsc2UgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMFxuICAgICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiMgICAgICAgIGlmICghYXV0aG9yaXplZCkgdGhlbiByZXR1cm4gZmFsc2U7XG5cbiMgICAgICAgIGlmICghYXV0aG9yaXplZClcbiMgICAgICAgICAgICAkLmFqYXggJy9lZGl0cmVxdWVzdC9uZXcnLCB7XG4jICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuIyAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlc3BvbnNlKSAtPlxuIyAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDQwMVxuIyAgICAgICAgICAgICAgICAgICAgICAgIHNob3dNb2RhbCgnL2xvZ2luJylcbiMgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgcmVzcG9uc2Uuc3RhdHVzIGlzIDIwMFxuIyAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlXG4jICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4jICAgICAgICAgICAgICAgICAgICBpZiBlcnJvci5zdGF0dXMgaXMgNDAxIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuIyAgICAgICAgICAgIH1cbiNcbiMgICAgICAgIGlmICghYXV0aG9yaXplZCkgdGhlbiByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgY3VycmVudEVudGl0eSA9IG51bGxcbiAgICAgICAgY29uc29sZS5sb2codGFibGVUeXBlKVxuICAgICAgICBpZiB0YWJsZVR5cGUgaXMgJ1ZvdGVzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdMZWdpc2xhdGlvbidcbiAgICAgICAgICAgICQoJyNhZGRWb3RlcycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuICAgICAgICBlbHNlIGlmIHRhYmxlVHlwZSBpcyAnQ29udHJpYnV0aW9ucydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnQ29udHJpYnV0aW9uJ1xuICAgICAgICAgICAgJCgnI2FkZENvbnRyaWJ1dGlvbnMnKS5tb2RhbCgndG9nZ2xlJykuZmluZCgnZm9ybScpWzBdLnJlc2V0KClcbiAgICAgICAgZWxzZSBpZiB0YWJsZVR5cGUgaXMgJ0VuZG9yc2VtZW50cydcbiAgICAgICAgICAgIGN1cnJlbnRFbnRpdHkgPSAnRW5kb3JzZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkRW5kb3JzZW1lbnRzJykubW9kYWwoJ3RvZ2dsZScpLmZpbmQoJ2Zvcm0nKVswXS5yZXNldCgpXG4gICAgICAgIGVsc2UgaWYgdGFibGVUeXBlIGlzICdTdGF0ZW1lbnRzJ1xuICAgICAgICAgICAgY3VycmVudEVudGl0eSA9ICdQdWJsaWNTdGF0ZW1lbnQnXG4gICAgICAgICAgICAkKCcjYWRkU3RhdGVtZW50cycpLm1vZGFsKCd0b2dnbGUnKS5maW5kKCdmb3JtJylbMF0ucmVzZXQoKVxuXG4gICAgICAgIGlmIHRhYlBhbmUuaGFzQ2xhc3MoJ2xvYWRlZCcpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgIHRhYlBhbmVbMF0uY2xhc3NMaXN0LmFkZCgnbG9hZGVkJylcblxuICAgICAgICBwZXJzb25NZXRhID0ge1wiY3JlYXRlUmVxdWVzdFwiOntcImVudGl0eU5hbWVcIjpjdXJyZW50RW50aXR5LFwia25vd25GaWVsZHNcIjp7XCJlbGVjdGVkT2ZmaWNpYWxcIjpwZXJzb24uaWR9fX1cbiAgICAgICAgJC5hamF4KFxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvYXBpL2NyZWF0ZXJlcXVlc3QvbmV3JyxcbiAgICAgICAgICAgIGRhdGE6IHBlcnNvbk1ldGEsXG4gICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICAgICAgICAgICAgICAgIGVuZE9iaiA9IHt9XG4gICAgICAgICAgICAgICAgZGF0YS5jaG9pY2VzWzBdLmNob2ljZXMuZm9yRWFjaCAoaXRlbSwgaW5kZXgpIC0+XG4gICAgICAgICAgICAgICAgICBpZHMgPSBPYmplY3Qua2V5cyBpdGVtXG4gICAgICAgICAgICAgICAgICBpZHMuZm9yRWFjaCAoaWQpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgZW5kT2JqW2lkXSA9IGl0ZW1baWRdXG5cbiAgICAgICAgICAgICAgICBpbnNlcnRDYXRlZ29yaWVzID0gKCkgLT5cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0LnNldEF0dHJpYnV0ZSgnbmFtZScsIGRhdGEuY2hvaWNlc1swXS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIGVuZE9ialxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywga2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gZW5kT2JqW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgKz0gb3B0aW9uLm91dGVySFRNTDtcblxuICAgICAgICAgICAgICAgIHNlbGVjdCA9IG51bGxcblxuICAgICAgICAgICAgICAgIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0VuZG9yc2VtZW50J1xuXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjdXJyZW50RW50aXR5IGlzICdDb250cmlidXRpb24nXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ0xlZ2lzbGF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3QgPSAkKCcjYWRkVm90ZXMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG4gICAgICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICAgICAgIyBGaWxsIGVsZWN0ZWQgb2ZmaWNpYWxzIHZvdGVzIHRhYmxlLlxuICAgICAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVkVGVtcGxhdGUgPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnI2xlZ2lzbGF0aW9uLXZvdGUnKS5odG1sKCkpXG4gICAgICAgICAgICAgICAgICAgICQoJyNlbGVjdGVkVm90ZXMnKS5odG1sIGNvbXBpbGVkVGVtcGxhdGUoZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIGN1cnJlbnRFbnRpdHkgaXMgJ1B1YmxpY1N0YXRlbWVudCdcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ID0gJCgnI2FkZFN0YXRlbWVudHMgc2VsZWN0JylbMF1cbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0Q2F0ZWdvcmllcygpXG5cblxuXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgICAgIGlmKGVycm9yLnN0YXR1cyA9PSA0MDEpIHRoZW4gc2hvd01vZGFsKCcvbG9naW4nKVxuICAgICAgICApO1xuXG5cbiAgICB3aW5kb3cuYWRkSXRlbSA9IChlKSAtPlxuICAgICAgICBuZXdSZWNvcmQgPSB7fVxuICAgICAgICBtb2RhbCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5tb2RhbCcpXG4gICAgICAgIG1vZGFsVHlwZSA9IG1vZGFsWzBdLmlkXG4gICAgICAgIGVudGl0eVR5cGUgPSBtb2RhbFswXS5kYXRhc2V0LmVudGl0eVR5cGVcbiAgICAgICAgY29uc29sZS5sb2coZW50aXR5VHlwZSk7XG5cbiAgICAgICAgIyMjXG4gICAgICAgICAgR2V0IHZhbHVlIGZyb20gaW5wdXQgZmllbGRzLlxuICAgICAgICAjIyNcbiAgICAgICAgbW9kYWwuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IE9iamVjdC5rZXlzKGVsZW1lbnQuZGF0YXNldClbMF1cbiAgICAgICAgICAgIG5ld1JlY29yZFtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICMjI1xuICAgICAgICAgIEdldCB2YWx1ZSBmcm9tIHRleGFyZWEuXG4gICAgICAgICMjI1xuICAgICAgICBtb2RhbC5maW5kKCd0ZXh0YXJlYScpLmVhY2ggKGluZGV4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgbmV3UmVjb3JkW2ZpZWxkTmFtZV0gPSBlbGVtZW50LnZhbHVlXG5cbiAgICAgICAgYXNzb2NpYXRpb25zID0ge31cbiAgICAgICAgaWYgbW9kYWxUeXBlICE9ICdhZGRWb3RlcydcbiAgICAgICAgICAgIGFzc29jaWF0aW9uc1tcImVsZWN0ZWRPZmZpY2lhbFwiXSA9IHBlcnNvbi5pZFxuICAgICAgICAjXG4gICAgICAgICMgQXJyYXkgb2Ygc3ViIGVudGl0aWVzLlxuICAgICAgICAjXG4gICAgICAgIGNoaWxkcyA9IFtdXG5cbiAgICAgICAgaWYgbW9kYWxUeXBlIGlzICdhZGRWb3RlcydcbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgICAgIEFkZCBpbmZvcm1hdGlvbiBhYm91dCB2b3Rlcy5cbiAgICAgICAgICAgICMjI1xuICAgICAgICAgICAgbW9kYWwuZmluZCgnI2VsZWN0ZWRWb3RlcycpLmZpbmQoJ3RyW2RhdGEtZWxlY3RlZF0nKS4gZWFjaCAoaWR4LCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKGVsZW1lbnQpXG5cbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgIyBHZXQgYWxsIHN1YiBlbnRpdHkgZmllbGRzLlxuICAgICAgICAgICAgICAgICNcbiAgICAgICAgICAgICAgICBkYXRhID0gT2JqZWN0LmNyZWF0ZSBudWxsLCB7fVxuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCdzZWxlY3QnKS5lYWNoIChpbmRleCwgZWxlbWVudCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZWxlbWVudC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGROYW1lID0gT2JqZWN0LmtleXMoZWxlbWVudC5kYXRhc2V0KVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gZWxlbWVudC52YWx1ZVxuXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICBBZGQgb25seSBpZiBhbGwgZmllbGRzIGlzIHNldC5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICBpZiBPYmplY3Qua2V5cyhkYXRhKS5sZW5ndGggPT0gMlxuICAgICAgICAgICAgICAgICAgICBmaWVsZHMgPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snZmllbGRzJ10gPSBkYXRhXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snYXNzb2NpYXRpb25zJ10gPSBPYmplY3QuY3JlYXRlIG51bGwsIHt9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkc1snYXNzb2NpYXRpb25zJ11bZWxlbWVudC5hdHRyKCdkYXRhLWVudGl0eS10eXBlJyldID0gZWxlbWVudC5hdHRyKCdkYXRhLWVsZWN0ZWQnKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZEVudGl0eU5hbWUgPSBlbGVtZW50LnBhcmVudCgpLnBhcmVudCgpLmF0dHIgJ2RhdGEtZW50aXR5LXR5cGUnXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICMgQ2hpbGQgdHlwZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eU5hbWU6IGNoaWxkRW50aXR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBDaGlsZCBmaWVsZHMuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IGZpZWxkc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlbGVjdCA9IG1vZGFsLmZpbmQoJ3NlbGVjdCcpWzBdXG4gICAgICAgICAgICBzZWxlY3ROYW1lID0gc2VsZWN0Lm5hbWVcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3Qub3B0aW9uc1tzZWxlY3Quc2VsZWN0ZWRJbmRleF0udmFsdWVcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9ICQoc2VsZWN0KS5maW5kKCc6c2VsZWN0ZWQnKS50ZXh0KCk7XG4gICAgICAgICAgICBhc3NvY2lhdGlvbnNbc2VsZWN0TmFtZV0gPSBzZWxlY3RlZFZhbHVlXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRDb250cmlidXRpb25zJ1xuXG4gICAgICAgIGVsc2UgaWYgbW9kYWxUeXBlIGlzICdhZGRFbmRvcnNlbWVudHMnXG5cbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZFN0YXRlbWVudHMnXG4gICAgICAgICAgICBzZWxlY3QgPSBtb2RhbC5maW5kKCdzZWxlY3QnKVswXVxuICAgICAgICAgICAgc2VsZWN0TmFtZSA9IHNlbGVjdC5uYW1lXG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0Lm9wdGlvbnNbc2VsZWN0LnNlbGVjdGVkSW5kZXhdLnZhbHVlXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSAkKHNlbGVjdCkuZmluZCgnOnNlbGVjdGVkJykudGV4dCgpO1xuICAgICAgICAgICAgYXNzb2NpYXRpb25zW3NlbGVjdE5hbWVdID0gc2VsZWN0ZWRWYWx1ZVxuXG4gICAgICAgIHNlbmRPYmplY3QgPSB7XG4gICAgICAgICAgICBjcmVhdGVSZXF1ZXN0OiB7XG4gICAgICAgICAgICAgICAgZW50aXR5TmFtZTogZW50aXR5VHlwZSxcbiAgICAgICAgICAgICAgICBmaWVsZHM6IHsgZmllbGRzOiBuZXdSZWNvcmQsIGFzc29jaWF0aW9uczogYXNzb2NpYXRpb25zLCBjaGlsZHM6IGNoaWxkc30sXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0ciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ3RyJ1xuICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZW5kT2JqZWN0LmNyZWF0ZVJlcXVlc3QuZmllbGRzLmZpZWxkc1xuICAgICAgICAgICAgdHIuaW5uZXJIVE1MICs9IFwiPHRkPjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnXG4gICAgICAgICAgICBjbGFzcz0nZWRpdGFibGUgZWRpdGFibGUtcHJlLXdyYXBwZWQgZWRpdGFibGUtY2xpY2snPiN7dmFsdWV9PC9hPjwvdGQ+XCJcblxuICAgICAgICBpZiBtb2RhbFR5cGUgaXMgJ2FkZFZvdGVzJ1xuICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgIENoZWNrIGlmIHVzZXIgc3BlY2lmaWVkIGhvdyBjdXJyZW50IGVsZWN0ZWQgb2ZmaWNpYWwgdm90ZWQuXG4gICAgICAgICAgICAjIyNcbiAgICAgICAgICAgIGFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgZGF0YSA9IE9iamVjdC5jcmVhdGUgbnVsbCwge31cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIHNlbmRPYmplY3QuY3JlYXRlUmVxdWVzdC5maWVsZHMuY2hpbGRzXG4gICAgICAgICAgICBmb3Igb2JqIGluIHNlbmRPYmplY3QuY3JlYXRlUmVxdWVzdC5maWVsZHMuY2hpbGRzXG4gICAgICAgICAgICAgIGlmIE51bWJlcihvYmouZmllbGRzLmFzc29jaWF0aW9ucy5lbGVjdGVkT2ZmaWNpYWwpID09IE51bWJlcihwZXJzb24uaWQpXG4gICAgICAgICAgICAgICAgYWRkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGRhdGEgPSBvYmouZmllbGRzXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgI1xuICAgICAgICAgICAgIyBJZiB3ZSBmb3VuZCwgc2hvdy5cbiAgICAgICAgICAgICNcbiAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIGRhdGEuZmllbGRzXG4gICAgICAgICAgICAgICAgdHIuaW5uZXJIVE1MICs9IFwiPHRkPjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnXG4gICAgICAgICAgICBjbGFzcz0nZWRpdGFibGUgZWRpdGFibGUtcHJlLXdyYXBwZWQgZWRpdGFibGUtY2xpY2snPiN7dmFsdWV9PC9hPjwvdGQ+XCJcbiAgICAgICAgICAgICAgdHIuaW5uZXJIVE1MICs9IFwiPHRkPjxhIGhyZWY9J2phdmFzY3JpcHQ6dm9pZCgwKTsnXG4gICAgICAgICAgICBjbGFzcz0nZWRpdGFibGUgZWRpdGFibGUtcHJlLXdyYXBwZWQgZWRpdGFibGUtY2xpY2snPiN7c2VsZWN0ZWRUZXh0fTwvYT48L3RkPlwiXG4gICAgICAgICAgICAgICQoJyNWb3RlcyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlKHRyKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZENvbnRyaWJ1dGlvbnMnXG4gICAgICAgICAgICAkKCcjQ29udHJpYnV0aW9ucyB0cjpsYXN0LWNoaWxkJykuYmVmb3JlKHRyKTtcbiAgICAgICAgZWxzZSBpZiBtb2RhbFR5cGUgaXMgJ2FkZEVuZG9yc2VtZW50cydcbiAgICAgICAgICAgICQoJyNFbmRvcnNlbWVudHMgdHI6bGFzdC1jaGlsZCcpLmJlZm9yZSh0cik7XG5cbiAgICAgICAgY29uc29sZS5sb2cgc2VuZE9iamVjdFxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiAnL2FwaS9jcmVhdGVyZXF1ZXN0L2NyZWF0ZScsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogc2VuZE9iamVjdCxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9KTtcblxuXG4kKCcjZGF0YUNvbnRhaW5lcicpLm9uICdjbGljaycsICcuZWxlY3RlZF9saW5rJywgKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHVybCA9IGUuY3VycmVudFRhcmdldC5wYXRobmFtZVxuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJy5sb2FkZXInKS5zaG93KClcbiAgICAkKCcjc3RhbnRvbkljb24nKS5zaG93KClcbiAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICQuYWpheFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2VsZWN0ZWQtb2ZmaWNpYWxcIiArIHVybCxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cblxuICAgICAgICAgICAgICAgICAgICBwZXJzb24gPSBkYXRhWzBdXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCAnPGgyPlNvcnJ5LiBQYWdlIG5vdCBmb3VuZDwvaDI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSB7eWVhcjogJ251bWVyaWMnLCBtb250aDogJ251bWVyaWMnLCBkYXk6ICdudW1lcmljJ307XG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZSBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkID0gZGF0ZS50b0xvY2FsZVN0cmluZyAnZW4tVVMnLCBmb3JtYXRcblxuICAgICAgICAgICAgICAgICAgICB0cGwgPSAkKCcjcGVyc29uLWluZm8tdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBodG1sfSwgJ0NQQyBQb2xpdGljaWFuIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBodG1sXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuY3NzKCdkaXNwbGF5JzogJ2Jsb2NrJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbiMgUm91dGUgL1xuaWYgcm91dGVUeXBlIGlzIDBcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICBnb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnL2xlZ2FjeS9kYXRhL2hfdHlwZXNfY2FfMi5qc29uJywgN1xuICAgIGdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICB1cmwgPSAnLycgKyBkYXRhLmFsdFR5cGVTbHVnICsgJy8nICsgZGF0YS5zbHVnXG4gICAgICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgICBpZiAhdW5kZWZcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwgJCgnI3NlYXJjaC1jb250YWluZXItdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgIyBMb2FkIGludHJvZHVjdG9yeSB0ZXh0IGZyb20gdGV4dHMvaW50cm8tdGV4dC5odG1sIHRvICNpbnRyby10ZXh0IGNvbnRhaW5lci5cbiAgICAgICAgJC5nZXQgXCIvbGVnYWN5L3RleHRzL2ludHJvLXRleHQuaHRtbFwiLCAoZGF0YSkgLT4gJChcIiNpbnRyby10ZXh0XCIpLmh0bWwgZGF0YVxuICAgICAgICBnb3ZtYXAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4gICAgICAgIGdldF9jb3VudGllcyBHT1ZXSUtJLmRyYXdfcG9seWdvbnNcbiAgICAgICAgdW5kZWYgPSB0cnVlXG4gICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcbiAgICBzdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJCgnI2dvdm1hcCcpLm9uICdjbGljaycsICcuaW5mby13aW5kb3ctdXJpJywgKGUpIC0+XG4gICAgICAgIHVyaSA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC51cmlcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWVcbmlmIHJvdXRlVHlwZSBpcyAyXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIENpdmljIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDNcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGFbMF1cblxuICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgZm9ybWF0ID0ge3llYXI6ICdudW1lcmljJywgbW9udGg6ICdudW1lcmljJywgZGF5OiAnbnVtZXJpYyd9O1xuICAgICAgICAgICAgaWYgcGVyc29uLnZvdGVzICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcgJ2VuLVVTJywgZm9ybWF0XG5cbiAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgaW5pdFRhYmxlSGFuZGxlcnMocGVyc29uKTtcblxuICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xuICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcblxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uIGEnKS50ZXh0ICdSZXR1cm4gdG8gJyArIHBlcnNvbi5nb3ZfYWx0X25hbWVcbiAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cbiQgLT5cbiAgJC5hamF4ICcvZWRpdHJlcXVlc3QvbmV3Jywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGNvbXBsZXRlOiAocmVzcG9uc2UpIC0+XG4gICAgICBpZiByZXNwb25zZS5zdGF0dXMgaXMgNDAxXG4gICAgICAgIGF1dGhvcml6ZWQgPSBmYWxzZVxuICAgICAgZWxzZSBpZiByZXNwb25zZS5zdGF0dXMgaXMgMjAwXG4gICAgICAgIGF1dGhvcml6ZWQgPSB0cnVlXG4gICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgIGlmIGVycm9yLnN0YXR1cyBpcyA0MDEgdGhlbiBhdXRob3JpemVkID0gZmFsc2VcbiAgfSIsIlxuXG5cbiMgVGFrZXMgYW4gYXJyYXkgb2YgZG9jcyB0byBzZWFyY2ggaW4uXG4jIFJldHVybnMgYSBmdW5jdGlvbnMgdGhhdCB0YWtlcyAyIHBhcmFtcyBcbiMgcSAtIHF1ZXJ5IHN0cmluZyBhbmQgXG4jIGNiIC0gY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiMgY2IgcmV0dXJucyBhbiBhcnJheSBvZiBtYXRjaGluZyBkb2N1bWVudHMuXG4jIG11bV9pdGVtcyAtIG1heCBudW1iZXIgb2YgZm91bmQgaXRlbXMgdG8gc2hvd1xuUXVlcnlNYXRoZXIgPSAoZG9jcywgbnVtX2l0ZW1zPTUpIC0+XG4gIChxLCBjYikgLT5cbiAgICB0ZXN0X3N0cmluZyA9KHMsIHJlZ3MpIC0+XG4gICAgICAoaWYgbm90IHIudGVzdChzKSB0aGVuIHJldHVybiBmYWxzZSkgIGZvciByIGluIHJlZ3NcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBbd29yZHMscmVnc10gPSBnZXRfd29yZHNfcmVncyBxXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgIyBpdGVyYXRlIHRocm91Z2ggdGhlIHBvb2wgb2YgZG9jcyBhbmQgZm9yIGFueSBzdHJpbmcgdGhhdFxuICAgICMgY29udGFpbnMgdGhlIHN1YnN0cmluZyBgcWAsIGFkZCBpdCB0byB0aGUgYG1hdGNoZXNgIGFycmF5XG5cbiAgICBmb3IgZCBpbiBkb2NzXG4gICAgICBpZiBtYXRjaGVzLmxlbmd0aCA+PSBudW1faXRlbXMgdGhlbiBicmVha1xuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcblxuICAgICAgaWYgdGVzdF9zdHJpbmcoZC5nb3ZfbmFtZSwgcmVncykgXG4gICAgICAgIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICAgICNpZiB0ZXN0X3N0cmluZyhcIiN7ZC5nb3ZfbmFtZX0gI3tkLnN0YXRlfSAje2QuZ292X3R5cGV9ICN7ZC5pbmNfaWR9XCIsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaScpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FU1xuZmllbGROYW1lcyA9IHt9XG5maWVsZE5hbWVzSGVscCA9IHt9XG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0gKG4sbWFzayxkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbm90IGRhdGFbbl1cbiAgICByZXR1cm4gJydcblxuICBpZiBuID09IFwid2ViX3NpdGVcIlxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXG4gIGVsc2VcbiAgICBpZiAnJyAhPSBtYXNrXG4gICAgICBpZiBkYXRhW24rJ19yYW5rJ10gYW5kIGRhdGEubWF4X3JhbmtzIGFuZCBkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXVxuICAgICAgICB2ID0gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICAgICAgcmV0dXJuIFwiI3t2fSA8c3BhbiBjbGFzcz0ncmFuayc+KCN7ZGF0YVtuKydfcmFuayddfSBvZiAje2RhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddfSk8L3NwYW4+XCJcbiAgICAgIGlmIG4gPT0gXCJudW1iZXJfb2ZfZnVsbF90aW1lX2VtcGxveWVlc1wiXG4gICAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdCgnMCwwJylcbiAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgIGVsc2VcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwib3Blbl9lbnJvbGxtZW50X3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwicGFyZW50X3RyaWdnZXJfZWxpZ2libGVfc2Nob29sc1wiXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxuICAgICAgZWxzZVxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDIxXG4gICAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDIxKVxuICAgICAgICBlbHNlXG4gICAgICAgIHJldHVybiB2XG5cblxucmVuZGVyX2ZpZWxkX25hbWVfaGVscCA9IChmTmFtZSkgLT5cbiAgI2lmIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuICAgIHJldHVybiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICBpZiBcIl9cIiA9PSBzdWJzdHIgZk5hbWUsIDAsIDFcbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4mbmJzcDs8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICByZXR1cm4gJycgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyAgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PGRpdj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG5yZW5kZXJfc3ViaGVhZGluZyA9IChmTmFtZSwgbWFzaywgbm90Rmlyc3QpLT5cbiAgcyA9ICcnXG4gIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZk5hbWVcbiAgaWYgbWFzayA9PSBcImhlYWRpbmdcIlxuICAgIGlmIG5vdEZpcnN0ICE9IDBcbiAgICAgIHMgKz0gXCI8YnIvPlwiXG4gICAgcyArPSBcIjxkaXY+PHNwYW4gY2xhc3M9J2YtbmFtJz4je2ZOYW1lfTwvc3Bhbj48c3BhbiBjbGFzcz0nZi12YWwnPiA8L3NwYW4+PC9kaXY+XCJcbiAgcmV0dXJuIHNcblxucmVuZGVyX2ZpZWxkcyA9IChmaWVsZHMsZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgZm9yIGZpZWxkLGkgaW4gZmllbGRzXG4gICAgaWYgKHR5cGVvZiBmaWVsZCBpcyBcIm9iamVjdFwiKVxuICAgICAgaWYgZmllbGQubWFzayA9PSBcImhlYWRpbmdcIlxuICAgICAgICBoICs9IHJlbmRlcl9zdWJoZWFkaW5nKGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGkpXG4gICAgICAgIGZWYWx1ZSA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBkYXRhXG4gICAgICAgIGlmICgnJyAhPSBmVmFsdWUgYW5kIGZWYWx1ZSAhPSAnMCcpXG4gICAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZC5uYW1lXG4gICAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmaWVsZC5uYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmVmFsdWUgPSAnJ1xuXG4gICAgZWxzZVxuICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLCAnJywgZGF0YVxuICAgICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZFxuICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZOYW1lXG4gICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZk5hbWUsIHZhbHVlOiBmVmFsdWUsIGhlbHA6IGZOYW1lSGVscClcbiAgcmV0dXJuIGhcblxucmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgPSAoZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgbWFzayA9ICcwLDAnXG4gIGNhdGVnb3J5ID0gJydcbiAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgZm9yIGZpZWxkIGluIGRhdGFcbiAgICBpZiBjYXRlZ29yeSAhPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBjYXRlZ29yeSA9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGlmIGNhdGVnb3J5ID09ICdPdmVydmlldydcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgIGVsc2UgaWYgY2F0ZWdvcnkgPT0gJ1JldmVudWVzJ1xuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSBcIjxiPlwiICsgdGVtcGxhdGUobmFtZTogY2F0ZWdvcnksIGdlbmZ1bmQ6IFwiR2VuZXJhbCBGdW5kXCIsIG90aGVyZnVuZHM6IFwiT3RoZXIgRnVuZHNcIiwgdG90YWxmdW5kczogXCJUb3RhbCBHb3YuIEZ1bmRzXCIpICsgXCI8L2I+XCJcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuXG4gICAgaWYgZmllbGQuY2FwdGlvbiA9PSAnR2VuZXJhbCBGdW5kIEJhbGFuY2UnIG9yIGZpZWxkLmNhcHRpb24gPT0gJ0xvbmcgVGVybSBEZWJ0J1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICBlbHNlIGlmIGZpZWxkLmNhcHRpb24gaW4gWydUb3RhbCBSZXZlbnVlcycsICdUb3RhbCBFeHBlbmRpdHVyZXMnLCAnU3VycGx1cyAvIChEZWZpY2l0KSddIG9yIGlzX2ZpcnN0X3Jvd1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgICAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2spLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaykpXG4gIHJldHVybiBoXG5cbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvW1xcc1xcK1xcLV0vZywgJ18nKVxuXG50b1RpdGxlQ2FzZSA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlIC9cXHdcXFMqL2csICh0eHQpIC0+XG4gICAgdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG5cbmN1cnJlbmN5ID0gKG4sIG1hc2ssIHNpZ24gPSAnJykgLT5cbiAgICBuID0gbnVtZXJhbChuKVxuICAgIGlmIG4gPCAwXG4gICAgICAgIHMgPSBuLmZvcm1hdChtYXNrKS50b1N0cmluZygpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoLy0vZywgJycpXG4gICAgICAgIHJldHVybiBcIigje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytzKyc8L3NwYW4+J30pXCJcblxuICAgIG4gPSBuLmZvcm1hdChtYXNrKVxuICAgIHJldHVybiBcIiN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK24rJzwvc3Bhbj4nfVwiXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhLCB0YWJzZXQsIHBhcmVudCkgLT5cbiAgI2xheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gIGxheW91dCA9IGluaXRpYWxfbGF5b3V0XG4gIHRlbXBsYXRlcyA9IHBhcmVudC50ZW1wbGF0ZXNcbiAgcGxvdF9oYW5kbGVzID0ge31cblxuICBsYXlvdXRfZGF0YSA9XG4gICAgdGl0bGU6IGRhdGEubmFtZVxuICAgIHdpa2lwZWRpYV9wYWdlX2V4aXN0czogZGF0YS53aWtpcGVkaWFfcGFnZV9leGlzdHNcbiAgICB3aWtpcGVkaWFfcGFnZV9uYW1lOiAgZGF0YS53aWtpcGVkaWFfcGFnZV9uYW1lXG4gICAgdHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWU6IGRhdGEudHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWVcbiAgICBsYXRlc3RfYXVkaXRfdXJsOiBkYXRhLmxhdGVzdF9hdWRpdF91cmxcbiAgICB0YWJzOiBbXVxuICAgIHRhYmNvbnRlbnQ6ICcnXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGxheW91dF9kYXRhLnRhYnMucHVzaFxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgZGV0YWlsX2RhdGEgPVxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcbiAgICAgIHRhYmNvbnRlbnQ6ICcnXG4gICAgc3dpdGNoIHRhYi5uYW1lXG4gICAgICB3aGVuICdPdmVydmlldyArIEVsZWN0ZWQgT2ZmaWNpYWxzJ1xuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgICBmb3Igb2ZmaWNpYWwsaSBpbiBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzXG4gICAgICAgICAgb2ZmaWNpYWxfZGF0YSA9XG4gICAgICAgICAgICB0aXRsZTogaWYgJycgIT0gb2ZmaWNpYWwudGl0bGUgdGhlbiBcIlRpdGxlOiBcIiArIG9mZmljaWFsLnRpdGxlXG4gICAgICAgICAgICBuYW1lOiBpZiAnJyAhPSBvZmZpY2lhbC5mdWxsX25hbWUgdGhlbiBcIk5hbWU6IFwiICsgb2ZmaWNpYWwuZnVsbF9uYW1lXG4gICAgICAgICAgICBlbWFpbDogaWYgb2ZmaWNpYWwuZW1haWxfYWRkcmVzcyB0aGVuIFwiRW1haWw6IFwiICsgb2ZmaWNpYWwuZW1haWxfYWRkcmVzc1xuICAgICAgICAgICAgdGVsZXBob25lbnVtYmVyOiBpZiBudWxsICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgYW5kIHVuZGVmaW5lZCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIHRoZW4gXCJUZWxlcGhvbmUgTnVtYmVyOiBcIiArIG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXJcbiAgICAgICAgICAgIHRlcm1leHBpcmVzOiBpZiBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgdGhlbiBcIlRlcm0gRXhwaXJlczogXCIgKyBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgZWxzZSBcIlRlcm0gRXhwaXJlczogXCJcbiAgICAgICAgICAgIGFsdFR5cGVTbHVnOiBkYXRhLmFsdF90eXBlX3NsdWdcbiAgICAgICAgICAgIG5hbWVTbHVnOiBkYXRhLnNsdWdcbiAgICAgICAgICAgIHNsdWc6IG9mZmljaWFsLnNsdWdcblxuICAgICAgICAgIGlmICcnICE9IG9mZmljaWFsLnBob3RvX3VybCBhbmQgb2ZmaWNpYWwucGhvdG9fdXJsICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnPGltZyBzcmM9XCInK29mZmljaWFsLnBob3RvX3VybCsnXCIgY2xhc3M9XCJwb3J0cmFpdFwiIGFsdD1cIlwiIC8+J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJydcblxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnXShvZmZpY2lhbF9kYXRhKVxuICAgICAgd2hlbiAnRW1wbG95ZWUgQ29tcGVuc2F0aW9uJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzQwXG4gICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDQ3MFxuXG4gICAgICAgICAgaWYgJCh3aW5kb3cpLndpZHRoKCkgPCA0OTBcbiAgICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIENvbXBlbnNhdGlvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0JlbnMuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnXFxuIEVtcGxveWVlcydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnQWxsIFxcbicgKyB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnIFxcbiBSZXNpZGVudHMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDIpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgQ29tcGVuc2F0aW9uIC0gRnVsbCBUaW1lIFdvcmtlcnM6IFxcbiBHb3Zlcm5tZW50IHZzLiBQcml2YXRlIFNlY3RvcidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLWNvbXAtZ3JhcGgnXSA9J21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsnbWVkaWFuX3BlbnNpb25fMzBfeWVhcl9yZXRpcmVlJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIFBlbnNpb24nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1dhZ2VzJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnUGVuc2lvbiBmb3IgXFxuIFJldGlyZWUgdy8gMzAgWWVhcnMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fcGVuc2lvbjMwX3llYXJfcmV0aXJlZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIGZvcm1hdHRlciA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5OdW1iZXJGb3JtYXQoZ3JvdXBpbmdTeW1ib2w6ICcsJyAsIGZyYWN0aW9uRGlnaXRzOiAnMCcpXG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDEpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgUGVuc2lvbidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnYmFyJzoge1xuICAgICAgICAgICAgICAgICAnZ3JvdXBXaWR0aCc6ICczMCUnXG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snbWVkaWFuLXBlbnNpb24tZ3JhcGgnXSA9J21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xuICAgICAgd2hlbiAnRmluYW5jaWFsIEhlYWx0aCdcbiAgICAgICAgaCA9ICcnXG4gICAgICAgIGggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnXShjb250ZW50OiBoKVxuICAgICAgICAjcHVibGljIHNhZmV0eSBwaWVcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSBhbmQgZGF0YVsnYWx0X3R5cGUnXSAhPSAnU2Nob29sIERpc3RyaWN0J1xuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQdWJsaWMgU2FmZXR5IEV4cGVuc2UnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnUHVibGljIFNhZmV0eSBFeHAnXG4gICAgICAgICAgICAgICAgICAxIC0gZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdPdGhlcidcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ3B1YmxpY19zYWZldHlfZXhwX292ZXJfdG90X2dvdl9mdW5kX3JldmVudWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidQdWJsaWMgc2FmZXR5IGV4cGVuc2UnXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnc2xpY2VzJzogeyAxOiB7b2Zmc2V0OiAwLjJ9fVxuICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNDVcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnLCAnY2FsbGJhY2snOiBkcmF3Q2hhcnQoKX0pYFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSA9J3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAjZmluLWhlYWx0aC1yZXZlbnVlIGdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgI2NvbnNvbGUubG9nICcjIyNhbCcrSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1Jldi4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBSZXZlbnVlIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gUmV2ZW51ZSBQZXIgXFxuIENhcGl0YSBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICAgIFxuICAgICAgICAgIHBsb3RfaGFuZGxlc1snZmluLWhlYWx0aC1yZXZlbnVlLWdyYXBoJ10gPSdmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXG4gICAgICAgICNmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaFxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdFeHAuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnVG90YWwgRXhwZW5kaXR1cmVzIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfZXhwZW5kaXR1cmVzX3Blcl9jYXBpdGEnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnTWVkaWFuIFRvdGFsIFxcbiBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEgXFxuIEZvciBBbGwgQ2l0aWVzJ1xuICAgICAgICAgICAgICAgICAgNDIwXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgICAnY2hhcnRBcmVhLndpZHRoJzogJzEwMCUnXG4gICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ1xuICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gPSdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgaCA9ICcnXG4gICAgICAgICAgI2ggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICAgIGggKz0gcmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cywgdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJ11cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgICAjdGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiUmV2ZW51ZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIFJldmVudWVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3RvdGFsLXJldmVudWUtcGllJ10gPSd0b3RhbC1yZXZlbnVlLXBpZSdcbiAgICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWyd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ11cbiAgICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgICAgaWYgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cy5sZW5ndGggPT0gMFxuICAgICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YSA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5EYXRhVGFibGUoKVxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1RvdGFsIEdvdi4gRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1RvdGFsJ1xuXG4gICAgICAgICAgICAgICAgcm93cyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50c1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uY2F0ZWdvcnlfbmFtZSBpcyBcIkV4cGVuZGl0dXJlc1wiKSBhbmQgKGl0ZW0uY2FwdGlvbiBpc250IFwiVG90YWwgRXhwZW5kaXR1cmVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxNlxuICAgICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICAgJ3dpZHRoJzogYmlnQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICAgJ2hlaWdodCc6IDM1MFxuICAgICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA2MFxuICAgICAgICAgICAgICAgICAgJ3NsaWNlVmlzaWJpbGl0eVRocmVzaG9sZCc6IC4wNVxuICAgICAgICAgICAgICAgICAgJ2ZvcmNlSUZyYW1lJzogdHJ1ZVxuICAgICAgICAgICAgICAgICAgJ2NoYXJ0QXJlYSc6e1xuICAgICAgICAgICAgICAgICAgICAgd2lkdGg6JzkwJSdcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodDonNzUlJ1xuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICMnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uUGllQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0JywgJ2NhbGxiYWNrJzogZHJhd0NoYXJ0KCl9KWBcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXSA9J3RvdGFsLWV4cGVuZGl0dXJlcy1waWUnXG4gICAgICBlbHNlXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuXG4gICAgbGF5b3V0X2RhdGEudGFiY29udGVudCArPSB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC10ZW1wbGF0ZSddKGRldGFpbF9kYXRhKVxuICByZXR1cm4gdGVtcGxhdGVzWyd0YWJwYW5lbC10ZW1wbGF0ZSddKGxheW91dF9kYXRhKVxuXG5cbmdldF9sYXlvdXRfZmllbGRzID0gKGxhKSAtPlxuICBmID0ge31cbiAgZm9yIHQgaW4gbGFcbiAgICBmb3IgZmllbGQgaW4gdC5maWVsZHNcbiAgICAgIGZbZmllbGRdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfcmVjb3JkX2ZpZWxkcyA9IChyKSAtPlxuICBmID0ge31cbiAgZm9yIGZpZWxkX25hbWUgb2YgclxuICAgIGZbZmllbGRfbmFtZV0gPSAxXG4gIHJldHVybiBmXG5cbmdldF91bm1lbnRpb25lZF9maWVsZHMgPSAobGEsIHIpIC0+XG4gIGxheW91dF9maWVsZHMgPSBnZXRfbGF5b3V0X2ZpZWxkcyBsYVxuICByZWNvcmRfZmllbGRzID0gZ2V0X3JlY29yZF9maWVsZHMgclxuICB1bm1lbnRpb25lZF9maWVsZHMgPSBbXVxuICB1bm1lbnRpb25lZF9maWVsZHMucHVzaChmKSBmb3IgZiBvZiByZWNvcmRfZmllbGRzIHdoZW4gbm90IGxheW91dF9maWVsZHNbZl1cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cbiMgY29udmVydHMgdGFiIHRlbXBsYXRlIGRlc2NyaWJlZCBpbiBnb29nbGUgZnVzaW9uIHRhYmxlIHRvXG4jIHRhYiB0ZW1wbGF0ZVxuY29udmVydF9mdXNpb25fdGVtcGxhdGU9KHRlbXBsKSAtPlxuICB0YWJfaGFzaD17fVxuICB0YWJzPVtdXG4gICMgcmV0dXJucyBoYXNoIG9mIGZpZWxkIG5hbWVzIGFuZCB0aGVpciBwb3NpdGlvbnMgaW4gYXJyYXkgb2YgZmllbGQgbmFtZXNcbiAgZ2V0X2NvbF9oYXNoID0gKGNvbHVtbnMpIC0+XG4gICAgY29sX2hhc2ggPXt9XG4gICAgY29sX2hhc2hbY29sX25hbWVdPWkgZm9yIGNvbF9uYW1lLGkgaW4gdGVtcGwuY29sdW1uc1xuICAgIHJldHVybiBjb2xfaGFzaFxuXG4gICMgcmV0dXJucyBmaWVsZCB2YWx1ZSBieSBpdHMgbmFtZSwgYXJyYXkgb2YgZmllbGRzLCBhbmQgaGFzaCBvZiBmaWVsZHNcbiAgdmFsID0gKGZpZWxkX25hbWUsIGZpZWxkcywgY29sX2hhc2gpIC0+XG4gICAgZmllbGRzW2NvbF9oYXNoW2ZpZWxkX25hbWVdXVxuXG4gICMgY29udmVydHMgaGFzaCB0byBhbiBhcnJheSB0ZW1wbGF0ZVxuICBoYXNoX3RvX2FycmF5ID0oaGFzaCkgLT5cbiAgICBhID0gW11cbiAgICBmb3IgayBvZiBoYXNoXG4gICAgICB0YWIgPSB7fVxuICAgICAgdGFiLm5hbWU9a1xuICAgICAgdGFiLmZpZWxkcz1oYXNoW2tdXG4gICAgICBhLnB1c2ggdGFiXG4gICAgcmV0dXJuIGFcblxuXG4gIGNvbF9oYXNoID0gZ2V0X2NvbF9oYXNoKHRlbXBsLmNvbF9oYXNoKVxuICBwbGFjZWhvbGRlcl9jb3VudCA9IDBcblxuICBmb3Igcm93LGkgaW4gdGVtcGwucm93c1xuICAgIGNhdGVnb3J5ID0gdmFsICdnZW5lcmFsX2NhdGVnb3J5Jywgcm93LCBjb2xfaGFzaFxuICAgICN0YWJfaGFzaFtjYXRlZ29yeV09W10gdW5sZXNzIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgIGZpZWxkbmFtZSA9IHZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hcbiAgICBpZiBub3QgZmllbGRuYW1lIHRoZW4gZmllbGRuYW1lID0gXCJfXCIgKyBTdHJpbmcgKytwbGFjZWhvbGRlcl9jb3VudFxuICAgIGZpZWxkTmFtZXNbdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaF09dmFsICdkZXNjcmlwdGlvbicsIHJvdywgY29sX2hhc2hcbiAgICBmaWVsZE5hbWVzSGVscFtmaWVsZG5hbWVdID0gdmFsICdoZWxwX3RleHQnLCByb3csIGNvbF9oYXNoXG4gICAgaWYgY2F0ZWdvcnlcbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XT89W11cbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XS5wdXNoIG46IHZhbCgnbicsIHJvdywgY29sX2hhc2gpLCBuYW1lOiBmaWVsZG5hbWUsIG1hc2s6IHZhbCgnbWFzaycsIHJvdywgY29sX2hhc2gpXG5cbiAgY2F0ZWdvcmllcyA9IE9iamVjdC5rZXlzKHRhYl9oYXNoKVxuICBjYXRlZ29yaWVzX3NvcnQgPSB7fVxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc1xuICAgIGlmIG5vdCBjYXRlZ29yaWVzX3NvcnRbY2F0ZWdvcnldXG4gICAgICBjYXRlZ29yaWVzX3NvcnRbY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnldWzBdLm5cbiAgICBmaWVsZHMgPSBbXVxuICAgIGZvciBvYmogaW4gdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgICBmaWVsZHMucHVzaCBvYmpcbiAgICBmaWVsZHMuc29ydCAoYSxiKSAtPlxuICAgICAgcmV0dXJuIGEubiAtIGIublxuICAgIHRhYl9oYXNoW2NhdGVnb3J5XSA9IGZpZWxkc1xuXG4gIGNhdGVnb3JpZXNfYXJyYXkgPSBbXVxuICBmb3IgY2F0ZWdvcnksIG4gb2YgY2F0ZWdvcmllc19zb3J0XG4gICAgY2F0ZWdvcmllc19hcnJheS5wdXNoIGNhdGVnb3J5OiBjYXRlZ29yeSwgbjogblxuICBjYXRlZ29yaWVzX2FycmF5LnNvcnQgKGEsYikgLT5cbiAgICByZXR1cm4gYS5uIC0gYi5uXG5cbiAgdGFiX25ld2hhc2ggPSB7fVxuICBmb3IgY2F0ZWdvcnkgaW4gY2F0ZWdvcmllc19hcnJheVxuICAgIHRhYl9uZXdoYXNoW2NhdGVnb3J5LmNhdGVnb3J5XSA9IHRhYl9oYXNoW2NhdGVnb3J5LmNhdGVnb3J5XVxuXG4gIHRhYnMgPSBoYXNoX3RvX2FycmF5KHRhYl9uZXdoYXNoKVxuICByZXR1cm4gdGFic1xuXG5cbmNsYXNzIFRlbXBsYXRlczJcblxuICBAbGlzdCA9IHVuZGVmaW5lZFxuICBAdGVtcGxhdGVzID0gdW5kZWZpbmVkXG4gIEBkYXRhID0gdW5kZWZpbmVkXG4gIEBldmVudHMgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cbiAgICBAZXZlbnRzID0ge31cbiAgICB0ZW1wbGF0ZUxpc3QgPSBbJ3RhYnBhbmVsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5zdGF0ZW1lbnQtdGVtcGxhdGUnLCAndGFiZGV0YWlsLW9mZmljaWFsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1lbXBsb3llZS1jb21wLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5hbmNpYWwtaGVhbHRoLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1maW5hbmNpYWwtc3RhdGVtZW50cy10ZW1wbGF0ZScsICdwZXJzb24taW5mby10ZW1wbGF0ZSddXG4gICAgdGVtcGxhdGVQYXJ0aWFscyA9IFsndGFiLXRlbXBsYXRlJ11cbiAgICBAdGVtcGxhdGVzID0ge31cbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZUxpc3RcbiAgICAgIEB0ZW1wbGF0ZXNbdGVtcGxhdGVdID0gSGFuZGxlYmFycy5jb21waWxlKCQoJyMnICsgdGVtcGxhdGUpLmh0bWwoKSlcbiAgICBmb3IgdGVtcGxhdGUsaSBpbiB0ZW1wbGF0ZVBhcnRpYWxzXG4gICAgICBIYW5kbGViYXJzLnJlZ2lzdGVyUGFydGlhbCh0ZW1wbGF0ZSwgJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuXG4gIGFkZF90ZW1wbGF0ZTogKGxheW91dF9uYW1lLCBsYXlvdXRfanNvbikgLT5cbiAgICBAbGlzdC5wdXNoXG4gICAgICBwYXJlbnQ6dGhpc1xuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIEBwYXJlbnQuZGF0YSA9IGRhdFxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0LCB0aGlzLCBAcGFyZW50KVxuICAgICAgYmluZDogKHRwbF9uYW1lLCBjYWxsYmFjaykgLT5cbiAgICAgICAgaWYgbm90IEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXSA9IFtjYWxsYmFja11cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXS5wdXNoIGNhbGxiYWNrXG4gICAgICBhY3RpdmF0ZTogKHRwbF9uYW1lKSAtPlxuICAgICAgICBpZiBAcGFyZW50LmV2ZW50c1t0cGxfbmFtZV1cbiAgICAgICAgICBmb3IgZSxpIGluIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgICAgZSB0cGxfbmFtZSwgQHBhcmVudC5kYXRhXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBhc3luYzogZmFsc2VcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG5cbiAgbG9hZF9mdXNpb25fdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgYXN5bmM6IGZhbHNlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgdCA9IGNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlIHRlbXBsYXRlX2pzb25cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lIHRoZW4gaVxuICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcIlxuXG4gIGFjdGl2YXRlOiAoaW5kLCB0cGxfbmFtZSkgLT5cbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICBAbGlzdFtpbmRdLmFjdGl2YXRlIHRwbF9uYW1lXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIiwiJCAtPlxuICAjJCgnI2dldFdpa2lwZWRpYUFydGljbGVCdXR0b24nKS5vbiAnY2xpY2snLCAtPlxuICAjICAkKHRoaXMpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxuICAjYWxlcnRhbGVydCBcImhpXCJcbiAgI2FsZXJ0ICQoXCIjd2lraXBlZGlhUGFnZU5hbWVcIikudGV4dCgpXG4gICNnZXRfd2lraXBlZGlhX2FydGljbGUoKVxuICB3aW5kb3cuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlID0gZ2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4gIHdpbmRvdy5jcmVhdGVfd2lraXBlZGlhX2FydGljbGUgPSBjcmVhdGVfd2lraXBlZGlhX2FydGljbGVcblxuZ2V0X3dpa2lwZWRpYV9hcnRpY2xlPShzKS0+XG4gIGFydGljbGVfbmFtZSA9IHMucmVwbGFjZSAvLipcXC8oW14vXSopJC8sIFwiJDFcIlxuICAkLmdldEpTT04gXCJodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93L2FwaS5waHA/YWN0aW9uPXBhcnNlJnBhZ2U9I3thcnRpY2xlX25hbWV9JnByb3A9dGV4dCZmb3JtYXQ9anNvbiZjYWxsYmFjaz0/XCIsIChqc29uKSAtPiBcbiAgICAkKCcjd2lraXBlZGlhVGl0bGUnKS5odG1sIGpzb24ucGFyc2UudGl0bGVcbiAgICAkKCcjd2lraXBlZGlhQXJ0aWNsZScpLmh0bWwganNvbi5wYXJzZS50ZXh0W1wiKlwiXVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYTpub3QoLnJlZmVyZW5jZXMgYSlcIikuYXR0ciBcImhyZWZcIiwgLT4gIFwiaHR0cDovL3d3dy53aWtpcGVkaWEub3JnXCIgKyAkKHRoaXMpLmF0dHIoXCJocmVmXCIpXG4gICAgJChcIiN3aWtpcGVkaWFBcnRpY2xlXCIpLmZpbmQoXCJhXCIpLmF0dHIgXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIlxuICBcbmNyZWF0ZV93aWtpcGVkaWFfYXJ0aWNsZT0gLT5cbiAgYWxlcnQgXCJOb3QgaW1wbGVtZW50ZWRcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldF93aWtpcGVkaWFfYXJ0aWNsZTpnZXRfd2lraXBlZGlhX2FydGljbGVcbiJdfQ==

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
  panControl: false,
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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, build_select_element, build_selector, draw_polygons, focus_search_field, get_counties, get_elected_officials, get_financial_statements, get_max_ranks, get_record2, gov_selector, govmap, refresh_disqus, route, routeType, start_adjusting_typeahead_width, templates, undef, wikipedia;

GovSelector = require('./govselector.coffee');

Templates2 = require('./templates2.coffee');

wikipedia = require('./wikipedia.coffee');

govmap = null;

gov_selector = null;

templates = new Templates2;

active_tab = "";

undef = null;

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
  } else {
    return document.location.reload();
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
            setTimeout(function () {
                google.load('visualization', '1.0', {'packages': 'corechart'})
            }, 2000);
            google.setOnLoadCallback(drawChart);
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
          setTimeout(function () {
              google.load('visualization', '1.0', {'packages': 'corechart'})
          }, 2000);
          google.setOnLoadCallback(drawChart);
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
            setTimeout(function () {
                google.load('visualization', '1.0', {'packages': 'corechart'})
            }, 2000);
            google.setOnLoadCallback(drawChart);
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
            setTimeout(function () {
                google.load('visualization', '1.0', {'packages': 'corechart'})
            }, 2000);
            google.setOnLoadCallback(drawChart);
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
          setTimeout(function () {
              google.load('visualization', '1.0', {'packages': 'corechart'})
          }, 2000);
          google.setOnLoadCallback(drawChart);
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
            setTimeout(function () {
                google.load('visualization', '1.0', {'packages': 'corechart'})
            }, 2000);
            google.setOnLoadCallback(drawChart);
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
            setTimeout(function () {
                google.load('visualization', '1.0', {'packages': 'corechart'})
            }, 2000);
            google.setOnLoadCallback(drawChart);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW1waWxvbi9XZWJzdG9ybVByb2plY3RzL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9ob21lL2RhbXBpbG9uL1dlYnN0b3JtUHJvamVjdHMvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvaG9tZS9kYW1waWxvbi9XZWJzdG9ybVByb2plY3RzL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvaG9tZS9kYW1waWxvbi9XZWJzdG9ybVByb2plY3RzL2dvdndpa2kvd2ViL2xlZ2FjeS9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9ob21lL2RhbXBpbG9uL1dlYnN0b3JtUHJvamVjdHMvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSIsIi9ob21lL2RhbXBpbG9uL1dlYnN0b3JtUHJvamVjdHMvZ292d2lraS93ZWIvbGVnYWN5L2NvZmZlZS93aWtpcGVkaWEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwySEFBQTtFQUFBOztBQUFBLGNBQUEsR0FBZTs7QUFHZixHQUFBLEdBQVUsSUFBQSxLQUFBLENBQ1I7RUFBQSxFQUFBLEVBQUksU0FBSjtFQUNBLEdBQUEsRUFBSyxJQURMO0VBRUEsR0FBQSxFQUFLLENBQUMsS0FGTjtFQUdBLElBQUEsRUFBTSxDQUhOO0VBSUEsT0FBQSxFQUFTLENBSlQ7RUFLQSxXQUFBLEVBQWEsSUFMYjtFQU1BLFVBQUEsRUFBWSxLQU5aO0VBT0EsV0FBQSxFQUFhLElBUGI7RUFRQSxrQkFBQSxFQUNFO0lBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBcEM7R0FURjtDQURROztBQVlWLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUyxDQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQTVCLENBQXNDLENBQUMsSUFBeEQsQ0FBNkQsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBN0Q7O0FBRUEsZ0JBQUEsR0FBbUIsU0FBQTtBQUNqQixNQUFBO0FBQUE7QUFBQTtPQUFBLHFDQUFBOztrQkFBQSxVQUFBLENBQVcsR0FBWDtBQUFBOztBQURpQjs7QUFHbkIsY0FBQSxHQUFpQixTQUFBO0FBQ2YsTUFBQTtFQUFBLFdBQUEsR0FBYyxDQUFDLE1BQUQsRUFBUyxpQkFBVCxFQUE0QixrQkFBNUI7RUFDZCxPQUFPLENBQUMsaUJBQVIsR0FBNEI7U0FDNUIsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixTQUFDLEtBQUQsRUFBUSxPQUFSO0FBQ3JCLFFBQUE7SUFBQSxJQUFHLE9BQUEsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLElBQVgsQ0FBZ0IsTUFBaEIsQ0FBQSxFQUFBLGFBQTJCLFdBQTNCLEVBQUEsR0FBQSxNQUFBLENBQUEsSUFBMkMsQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLEdBQVgsQ0FBQSxDQUFBLEtBQW9CLEdBQWxFO2FBQ0UsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQTFCLENBQStCLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxJQUFYLENBQWdCLE1BQWhCLENBQS9CLEVBREY7O0VBRHFCLENBQXZCO0FBSGU7O0FBUWpCLFlBQUEsR0FBZSxTQUFDLFVBQUQsRUFBYSxTQUFiO1NBQ2IsQ0FBQyxDQUFDLElBQUYsQ0FDRTtJQUFBLEdBQUEsRUFBSSxvREFBSjtJQUNBLElBQUEsRUFBTTtNQUFFLFFBQUEsRUFBVSxVQUFaO0tBRE47SUFFQSxRQUFBLEVBQVUsTUFGVjtJQUdBLEtBQUEsRUFBTyxJQUhQO0lBSUEsT0FBQSxFQUFTLFNBSlQ7SUFLQSxLQUFBLEVBQU0sU0FBQyxDQUFEO2FBQ0osT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREksQ0FMTjtHQURGO0FBRGE7O0FBVWYsQ0FBQSxDQUFFLFNBQUE7RUFFQSxjQUFBLENBQUE7RUFDQSxZQUFBLENBQWEsT0FBTyxDQUFDLGlCQUFyQixFQUF3QyxTQUFDLElBQUQ7SUFDdEMsT0FBTyxDQUFDLE9BQVIsR0FBa0I7V0FDbEIsZ0JBQUEsQ0FBQTtFQUZzQyxDQUF4QztFQUlBLENBQUEsQ0FBRSxtQ0FBRixDQUFzQyxDQUFDLEVBQXZDLENBQTBDLE9BQTFDLEVBQW1ELFNBQUE7QUFDakQsUUFBQTtJQUFBLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxXQUFSLENBQW9CLFFBQXBCO0lBQ0EsWUFBQSxHQUFlLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsT0FBYjtJQUNmLEtBQUEsR0FBUSxZQUFZLENBQUMsR0FBYixDQUFBO0lBQ1IsWUFBWSxDQUFDLEdBQWIsQ0FBb0IsS0FBQSxLQUFTLEdBQVosR0FBcUIsR0FBckIsR0FBOEIsR0FBL0M7SUFDQSxjQUFBLENBQUE7SUFDQSxHQUFHLENBQUMsYUFBSixDQUFBO1dBQ0EsZ0JBQUEsQ0FBQTtFQVBpRCxDQUFuRDtTQVNBLENBQUEsQ0FBRSw2QkFBRixDQUFnQyxDQUFDLEVBQWpDLENBQW9DLE9BQXBDLEVBQTZDLFNBQUE7SUFDM0MsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLFdBQVIsQ0FBb0IsUUFBcEI7SUFDQSxJQUFHLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxRQUFSLENBQWlCLFFBQWpCLENBQUg7YUFBbUMsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsT0FBTyxDQUFDLGFBQTdCLEVBQW5DO0tBQUEsTUFBQTthQUFtRixHQUFHLENBQUMsY0FBSixDQUFBLEVBQW5GOztFQUYyQyxDQUE3QztBQWhCQSxDQUFGOztBQXVCQSxRQUFBLEdBQVUsU0FBQyxRQUFEO0FBRVIsTUFBQTtFQUFBLE9BQUEsR0FBUyxTQUFDLEtBQUQ7V0FDUDtNQUFBLElBQUEsRUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUE3QjtNQUNBLFdBQUEsRUFBYSxDQURiO01BRUEsU0FBQSxFQUFVLEtBRlY7TUFHQSxZQUFBLEVBQWMsQ0FIZDtNQUlBLFdBQUEsRUFBWSxPQUpaO01BTUEsS0FBQSxFQUFNLENBTk47O0VBRE87QUFTVCxVQUFPLFFBQVA7QUFBQSxTQUNPLE1BRFA7QUFDbUIsYUFBTyxPQUFBLENBQVEsS0FBUjtBQUQxQixTQUVPLGlCQUZQO0FBRThCLGFBQU8sT0FBQSxDQUFRLFdBQVI7QUFGckMsU0FHTyxrQkFIUDtBQUcrQixhQUFPLE9BQUEsQ0FBUSxRQUFSO0FBSHRDO0FBSU8sYUFBTyxPQUFBLENBQVEsT0FBUjtBQUpkO0FBWFE7O0FBaUJWLFFBQUEsR0FBVyxTQUFDLE9BQUQsRUFBVSxRQUFWO0FBQ1QsTUFBQTtBQUFBLE9BQUEsMENBQUE7O0lBQ0UsSUFBZSxJQUFBLEtBQVEsT0FBdkI7QUFBQSxhQUFPLEtBQVA7O0FBREY7U0FFQTtBQUhTOztBQU1YLFVBQUEsR0FBYSxTQUFDLEdBQUQ7QUFFWCxNQUFBO0VBQUEsS0FBQSxHQUFRLFFBQUEsQ0FBUyxHQUFHLENBQUMsT0FBYixFQUFzQixPQUFPLENBQUMsaUJBQTlCO0VBQ1IsSUFBRyxLQUFBLEtBQVMsS0FBWjtBQUF1QixXQUFPLE1BQTlCOztTQUNBLEdBQUcsQ0FBQyxTQUFKLENBQ0U7SUFBQSxHQUFBLEVBQUssR0FBRyxDQUFDLFFBQVQ7SUFDQSxHQUFBLEVBQUssR0FBRyxDQUFDLFNBRFQ7SUFFQSxJQUFBLEVBQU0sUUFBQSxDQUFTLEdBQUcsQ0FBQyxPQUFiLENBRk47SUFHQSxLQUFBLEVBQVcsR0FBRyxDQUFDLElBQUwsR0FBVSxJQUFWLEdBQWMsR0FBRyxDQUFDLElBSDVCO0lBSUEsVUFBQSxFQUNFO01BQUEsT0FBQSxFQUFTLHdFQUFBLEdBQ2lFLEdBQUcsQ0FBQyxXQURyRSxHQUNpRixHQURqRixHQUNvRixHQUFHLENBQUMsSUFEeEYsR0FDNkYsWUFEN0YsR0FDeUcsR0FBRyxDQUFDLElBRDdHLEdBQ2tILDRCQURsSCxHQUVDLEdBQUcsQ0FBQyxJQUZMLEdBRVUsSUFGVixHQUVjLEdBQUcsQ0FBQyxJQUZsQixHQUV1QixHQUZ2QixHQUUwQixHQUFHLENBQUMsR0FGOUIsR0FFa0MsR0FGbEMsR0FFcUMsR0FBRyxDQUFDLEtBRnpDLEdBRStDLFFBRnhEO0tBTEY7R0FERjtBQUpXOztBQWlCYixRQUFBLEdBQWUsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQWIsQ0FDYiwrRUFEYSxFQUVULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLENBRlMsRUFHVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUhTLEVBSVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsRUFBcEIsRUFBd0IsRUFBeEIsQ0FKUzs7QUFRZixZQUFBLEdBQWUsU0FBQyxJQUFELEVBQU0sSUFBTjtTQUNiLEtBQUssQ0FBQyxPQUFOLENBQ0U7SUFBQSxPQUFBLEVBQVMsSUFBVDtJQUNBLFFBQUEsRUFBVSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ1IsVUFBQTtNQUFBLElBQUcsTUFBQSxLQUFVLElBQWI7UUFDRSxNQUFBLEdBQVMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVEsQ0FBQztRQUM3QixHQUFHLENBQUMsU0FBSixDQUFjLE1BQU0sQ0FBQyxHQUFQLENBQUEsQ0FBZCxFQUE0QixNQUFNLENBQUMsR0FBUCxDQUFBLENBQTVCO1FBQ0EsR0FBRyxDQUFDLFNBQUosQ0FDRTtVQUFBLEdBQUEsRUFBSyxNQUFNLENBQUMsR0FBUCxDQUFBLENBQUw7VUFDQSxHQUFBLEVBQUssTUFBTSxDQUFDLEdBQVAsQ0FBQSxDQURMO1VBRUEsSUFBQSxFQUFNLE9BRk47VUFHQSxLQUFBLEVBQU8sT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLGlCQUhsQjtVQUlBLFVBQUEsRUFDRTtZQUFBLE9BQUEsRUFBUyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsaUJBQXBCO1dBTEY7U0FERjtRQVFBLElBQUcsSUFBSDtVQUNFLEdBQUcsQ0FBQyxTQUFKLENBQ0U7WUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLFFBQVY7WUFDQSxHQUFBLEVBQUssSUFBSSxDQUFDLFNBRFY7WUFFQSxJQUFBLEVBQU0sT0FGTjtZQUdBLEtBQUEsRUFBTyxNQUhQO1lBSUEsSUFBQSxFQUFNLFFBSk47WUFLQSxLQUFBLEVBQVcsSUFBSSxDQUFDLFFBQU4sR0FBZSxHQUFmLEdBQWtCLElBQUksQ0FBQyxTQUxqQztZQU1BLFVBQUEsRUFDRTtjQUFBLE9BQUEsRUFBWSxJQUFJLENBQUMsUUFBTixHQUFlLEdBQWYsR0FBa0IsSUFBSSxDQUFDLFNBQWxDO2FBUEY7V0FERixFQURGOztRQVdBLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsMEJBQUEsR0FBMkIsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLGlCQUE5RCxFQXRCRjs7SUFEUSxDQURWO0dBREY7QUFEYTs7QUE4QmYsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLEdBQUEsRUFBSyxHQUFMOzs7Ozs7QUMzSUYsSUFBQSwwQkFBQTtFQUFBOztBQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSOztBQUVWO0FBR0osTUFBQTs7d0JBQUEsV0FBQSxHQUFhLFNBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxJQUFaLEdBQUE7O0VBR0EscUJBQUMsYUFBRCxFQUFpQixRQUFqQixFQUEyQixTQUEzQjtJQUFDLElBQUMsQ0FBQSxnQkFBRDtJQUEwQixJQUFDLENBQUEsWUFBRDs7SUFDdEMsQ0FBQyxDQUFDLElBQUYsQ0FDRTtNQUFBLEdBQUEsRUFBSyxRQUFMO01BQ0EsUUFBQSxFQUFVLE1BRFY7TUFFQSxLQUFBLEVBQU8sSUFGUDtNQUdBLE9BQUEsRUFBUyxJQUFDLENBQUEsZUFIVjtLQURGO0VBRFc7O3dCQVViLGtCQUFBLEdBQXFCLFVBQVUsQ0FBQyxPQUFYLENBQW1CLG1MQUFuQjs7RUFTckIsYUFBQSxHQUFnQjs7RUFFaEIsVUFBQSxHQUFhOzt3QkFFYixVQUFBLEdBQWEsU0FBQTtBQUNYLFFBQUE7SUFBQSxLQUFBLEdBQU87QUFDUDtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBRyxPQUFPLENBQUMsWUFBUixJQUF5QixDQUFDLENBQUMsS0FBRixLQUFhLE9BQU8sQ0FBQyxZQUFqRDtBQUFtRSxpQkFBbkU7O01BQ0EsSUFBRyxPQUFPLENBQUMsZUFBUixJQUE0QixDQUFDLENBQUMsUUFBRixLQUFnQixPQUFPLENBQUMsZUFBdkQ7QUFBNEUsaUJBQTVFOztNQUNBLEtBQUE7QUFIRjtBQUlBLFdBQU87RUFOSTs7d0JBU2IsZUFBQSxHQUFrQixTQUFDLElBQUQ7SUFFaEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLENBQUM7SUFDbkIsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLEtBQWhCLENBQXNCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO2VBQ3BCLEtBQUMsQ0FBQSxhQUFELEdBQWlCLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsR0FBaEIsQ0FBQTtNQURHO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUdBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFDVCxDQUFBLENBQUUsS0FBQyxDQUFBLGFBQUgsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixhQUF2QixFQUFzQyxpQkFBdEM7TUFEUztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWCxFQUVFLElBRkY7SUFJQSxDQUFBLENBQUUsSUFBQyxDQUFBLGFBQUgsQ0FBaUIsQ0FBQyxTQUFsQixDQUNJO01BQUEsSUFBQSxFQUFNLEtBQU47TUFDQSxTQUFBLEVBQVcsS0FEWDtNQUVBLFNBQUEsRUFBVyxDQUZYO01BR0EsVUFBQSxFQUNDO1FBQUEsSUFBQSxFQUFNLGtCQUFOO09BSkQ7S0FESixFQU9JO01BQUEsSUFBQSxFQUFNLFVBQU47TUFDQSxVQUFBLEVBQVksVUFEWjtNQUVBLE1BQUEsRUFBUSxhQUFBLENBQWMsSUFBQyxDQUFBLFVBQWYsRUFBMkIsSUFBQyxDQUFBLFNBQTVCLENBRlI7TUFJQSxTQUFBLEVBQVc7UUFBQSxVQUFBLEVBQVksSUFBQyxDQUFBLGtCQUFiO09BSlg7S0FQSixDQWFBLENBQUMsRUFiRCxDQWFJLG9CQWJKLEVBYTJCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVo7UUFDdkIsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLFNBQWhCLENBQTBCLEtBQTFCLEVBQWlDLEtBQUMsQ0FBQSxhQUFsQztlQUNBLEtBQUMsQ0FBQSxXQUFELENBQWEsR0FBYixFQUFrQixJQUFsQixFQUF3QixJQUF4QjtNQUZ1QjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FiM0IsQ0FpQkEsQ0FBQyxFQWpCRCxDQWlCSSx5QkFqQkosRUFpQitCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxHQUFELEVBQU0sSUFBTixFQUFZLElBQVo7ZUFDM0IsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLEdBQWhCLENBQW9CLEtBQUMsQ0FBQSxhQUFyQjtNQUQyQjtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FqQi9CO0VBVmdCOzs7Ozs7QUFzQ3BCLE1BQU0sQ0FBQyxPQUFQLEdBQWU7Ozs7OztBQy9FZjs7Ozs7Ozs7QUFBQSxJQUFBOztBQVNBLFdBQUEsR0FBYyxPQUFBLENBQVEsc0JBQVI7O0FBRWQsVUFBQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUjs7QUFDYixTQUFBLEdBQVksT0FBQSxDQUFRLG9CQUFSOztBQUVaLE1BQUEsR0FBUzs7QUFDVCxZQUFBLEdBQWU7O0FBQ2YsU0FBQSxHQUFZLElBQUk7O0FBQ2hCLFVBQUEsR0FBYTs7QUFDYixLQUFBLEdBQVE7O0FBRVIsVUFBVSxDQUFDLGNBQVgsQ0FBMEIsT0FBMUIsRUFBbUMsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLElBQVA7RUFDL0IsSUFBRyxNQUFIO0FBQ0ksV0FBTyxJQUFJLENBQUMsRUFBTCxDQUFRLElBQVIsRUFEWDtHQUFBLE1BQUE7QUFHSSxXQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUhYOztBQUQrQixDQUFuQzs7QUFNQSxNQUFNLENBQUMsT0FBUCxHQUNJO0VBQUEsWUFBQSxFQUFjLEVBQWQ7RUFDQSxlQUFBLEVBQWlCLEVBRGpCO0VBRUEsaUJBQUEsRUFBbUIsQ0FBQyxNQUFELEVBQVMsaUJBQVQsRUFBNEIsa0JBQTVCLENBRm5CO0VBSUEsZ0JBQUEsRUFBa0IsU0FBQTtJQUNkLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7SUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxNQUF0QixDQUE2QixHQUE3QjtXQUNBLGtCQUFBLENBQW1CLEdBQW5CO0VBSmMsQ0FKbEI7RUFVQSxjQUFBLEVBQWdCLFNBQUE7SUFDWixDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7SUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxNQUFwQixDQUEyQixHQUEzQjtXQUNBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLElBQXRCLENBQUE7RUFIWSxDQVZoQjs7O0FBZUosT0FBTyxDQUFDLFlBQVIsR0FBdUIsWUFBQSxHQUFlLFNBQUMsUUFBRDtTQUNsQyxDQUFDLENBQUMsSUFBRixDQUNJO0lBQUEsR0FBQSxFQUFLLHlDQUFMO0lBQ0EsUUFBQSxFQUFVLE1BRFY7SUFFQSxLQUFBLEVBQU8sSUFGUDtJQUdBLE9BQUEsRUFBUyxTQUFDLFlBQUQ7YUFDTCxRQUFBLENBQVMsWUFBVDtJQURLLENBSFQ7R0FESjtBQURrQzs7QUFRdEMsT0FBTyxDQUFDLGFBQVIsR0FBd0IsYUFBQSxHQUFnQixTQUFDLFlBQUQ7QUFDcEMsTUFBQTtBQUFBO0FBQUE7T0FBQSxxQ0FBQTs7aUJBQ08sQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLE1BQUQ7ZUFDQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVgsQ0FBdUI7VUFDbkIsS0FBQSxFQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FESjtVQUVuQixVQUFBLEVBQVksSUFGTztVQUduQixXQUFBLEVBQWEsU0FITTtVQUluQixhQUFBLEVBQWUsR0FKSTtVQUtuQixZQUFBLEVBQWMsR0FMSztVQU1uQixTQUFBLEVBQVcsU0FOUTtVQU9uQixXQUFBLEVBQWEsSUFQTTtVQVFuQixRQUFBLEVBQVUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQVJUO1VBU25CLE9BQUEsRUFBUyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBVFI7VUFVbkIsTUFBQSxFQUFZLElBQUEsZUFBQSxDQUFnQjtZQUN4QixRQUFBLEVBQWMsSUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQVosQ0FBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FEVTtZQUV4QixTQUFBLEVBQVcsS0FGYTtZQUd4QixXQUFBLEVBQWEsS0FIVztZQUl4QixHQUFBLEVBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUpRO1lBS3hCLFlBQUEsRUFBYyxNQUFNLENBQUMsVUFBVSxDQUFDLElBTFI7WUFNeEIsV0FBQSxFQUFpQixJQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBWixDQUFrQixDQUFDLEVBQW5CLEVBQXVCLEVBQXZCLENBTk87WUFPeEIsVUFBQSxFQUFZLGVBUFk7WUFReEIsVUFBQSxFQUFZO2NBQUMsT0FBQSxFQUFTLEdBQVY7YUFSWTtZQVN4QixJQUFBLEVBQU0seUJBVGtCO1lBVXhCLE9BQUEsRUFBUyxLQVZlO1dBQWhCLENBVk87VUFzQm5CLFNBQUEsRUFBVyxTQUFBO21CQUNQLElBQUksQ0FBQyxVQUFMLENBQWdCO2NBQUMsU0FBQSxFQUFXLFNBQVo7YUFBaEI7VUFETyxDQXRCUTtVQXdCbkIsU0FBQSxFQUFXLFNBQUMsS0FBRDtZQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixLQUFLLENBQUMsTUFBOUI7bUJBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFaLENBQXVCLElBQXZCO1VBRk8sQ0F4QlE7VUEyQm5CLFFBQUEsRUFBVSxTQUFBO1lBQ04sSUFBSSxDQUFDLFVBQUwsQ0FBZ0I7Y0FBQyxTQUFBLEVBQVcsU0FBWjthQUFoQjttQkFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVosQ0FBdUIsS0FBdkI7VUFGTSxDQTNCUztVQThCbkIsS0FBQSxFQUFPLFNBQUE7QUFDSCxnQkFBQTtZQUFBLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7WUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO1lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtZQUNBLEdBQUEsR0FBTSxHQUFBLEdBQUksTUFBTSxDQUFDLGFBQVgsR0FBeUIsR0FBekIsR0FBNEIsTUFBTSxDQUFDLFVBQVUsQ0FBQzttQkFDcEQsQ0FBQyxDQUFDLElBQUYsQ0FDSTtjQUFBLEdBQUEsRUFBSyxtQ0FBQSxHQUFzQyxHQUEzQztjQUNBLFFBQUEsRUFBVSxNQURWO2NBRUEsS0FBQSxFQUFPLElBRlA7Y0FHQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBQ0wsb0JBQUE7Z0JBQUEscUJBQUEsR0FBd0IsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEI7Z0JBQ3hCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLHFCQUFuQjtnQkFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO2dCQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7Z0JBQ0EsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBO3VCQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtrQkFBQyxRQUFBLEVBQVUscUJBQVg7aUJBQXpCLEVBQTRELG9CQUE1RCxFQUFrRixHQUFsRjtjQU5LLENBSFQ7YUFESjtVQUxHLENBOUJZO1NBQXZCO01BREQ7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUgsQ0FBSSxNQUFKO0FBREo7O0FBRG9DOztBQW1EeEMsTUFBTSxDQUFDLFlBQVAsR0FBc0IsU0FBQyxJQUFEO1NBQVMsVUFBQSxHQUFhO0FBQXRCOztBQUV0QixDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsRUFBWixDQUFlLE9BQWYsRUFBd0IsY0FBeEIsRUFBd0MsU0FBQyxDQUFEO0FBQ3BDLE1BQUE7RUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxhQUFKLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsU0FBeEI7RUFDYixPQUFPLENBQUMsR0FBUixDQUFZLFVBQVo7RUFDQSxDQUFBLENBQUUsd0JBQUYsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxRQUF4QztFQUNBLENBQUEsQ0FBRSxDQUFBLENBQUUsQ0FBQyxDQUFDLGFBQUosQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixNQUF4QixDQUFGLENBQWtDLENBQUMsUUFBbkMsQ0FBNEMsUUFBNUM7RUFDQSxTQUFTLENBQUMsUUFBVixDQUFtQixDQUFuQixFQUFzQixVQUF0QjtFQUVBLElBQUcsVUFBQSxLQUFjLHNCQUFqQjtJQUNJLGVBQUEsR0FBa0I7SUFDbEIsZUFBQSxHQUFrQjtJQUNsQixlQUFBLEdBQWtCO0lBRWxCLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxrQ0FBRixDQUFxQyxDQUFDLElBQXRDLENBQTJDLFVBQTNDLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQTtBQUN4RCxVQUFBO01BQUEsZUFBQSxHQUFrQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsS0FBUixDQUFBO01BRWxCLElBQUcsZUFBQSxHQUFrQixlQUFyQjtlQUNJLGVBQUEsR0FBa0IsZ0JBRHRCOztJQUh3RCxDQUE1RDtJQU1BLENBQUEsQ0FBRSxpREFBRixDQUFvRCxDQUFDLEdBQXJELENBQXlELE9BQXpELEVBQWtFLGVBQUEsR0FBa0IsRUFBcEY7SUFDQSxDQUFBLENBQUUsaURBQUYsQ0FBb0QsQ0FBQyxHQUFyRCxDQUF5RCxPQUF6RCxFQUFrRSxlQUFBLEdBQWtCLEVBQXBGO1dBQ0EsQ0FBQSxDQUFFLGlEQUFGLENBQW9ELENBQUMsR0FBckQsQ0FBeUQsT0FBekQsRUFBa0UsZUFBQSxHQUFrQixFQUFwRixFQXpCSjs7QUFQb0MsQ0FBeEM7O0FBbUNBLENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxPQUFaLENBQW9CO0VBQUMsUUFBQSxFQUFVLHlCQUFYO0VBQXNDLE9BQUEsRUFBUyxPQUEvQztDQUFwQjs7QUFFQSxZQUFBLEdBQWUsU0FBQTtTQUNYLENBQUEsQ0FBRSx5QkFBQSxHQUEwQixVQUExQixHQUFxQyxJQUF2QyxDQUEyQyxDQUFDLEdBQTVDLENBQWdELE1BQWhEO0FBRFc7O0FBSWYsV0FBQSxHQUFjLFNBQUMsS0FBRDtFQUVWLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQThCLEVBQTlCO1NBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyxxQ0FBQSxHQUFzQyxLQUEzQztJQUNBLFFBQUEsRUFBVSxNQURWO0lBRUEsT0FBQSxFQUFTO01BQUMsaUNBQUEsRUFBbUMsU0FBcEM7S0FGVDtJQUdBLEtBQUEsRUFBTyxJQUhQO0lBSUEsT0FBQSxFQUFTLFNBQUMsSUFBRDtNQUNMLElBQUcsSUFBSDtRQUNJLHdCQUFBLENBQXlCLElBQUksQ0FBQyxHQUE5QixFQUFtQyxTQUFDLEtBQUQsRUFBUSxVQUFSLEVBQW9CLEtBQXBCO1VBQy9CLElBQUksQ0FBQyxvQkFBTCxHQUE0QjtpQkFDNUIscUJBQUEsQ0FBc0IsSUFBSSxDQUFDLEdBQTNCLEVBQWdDLEVBQWhDLEVBQW9DLFNBQUMsS0FBRCxFQUFRLFdBQVIsRUFBcUIsTUFBckI7WUFDaEMsSUFBSSxDQUFDLGlCQUFMLEdBQXlCO21CQUN6QixhQUFBLENBQWMsU0FBQyxrQkFBRDtjQUNWLElBQUksQ0FBQyxTQUFMLEdBQWlCLGtCQUFrQixDQUFDLE1BQU8sQ0FBQSxDQUFBO3FCQUkzQyxZQUFBLENBQUE7WUFMVSxDQUFkO1VBRmdDLENBQXBDO1FBRitCLENBQW5DLEVBREo7O0lBREssQ0FKVDtJQXNCQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0F0QlA7R0FESjtBQUhVOztBQThCZCxxQkFBQSxHQUF3QixTQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFNBQXJCO1NBQ3BCLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssb0NBQUEsR0FBdUMsUUFBdkMsR0FBa0QsR0FBbEQsR0FBd0QsUUFBN0Q7SUFDQSxRQUFBLEVBQVUsTUFEVjtJQUVBLEtBQUEsRUFBTyxJQUZQO0lBR0EsT0FBQSxFQUFTLFNBSFQ7SUFJQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0FKUDtHQURKO0FBRG9COztBQVN4Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxTQUFUO1NBQ3ZCLENBQUMsQ0FBQyxJQUFGLENBQ0k7SUFBQSxHQUFBLEVBQUssOERBQUw7SUFDQSxJQUFBLEVBQ0k7TUFBQSxRQUFBLEVBQVUsU0FBVjtNQUNBLEtBQUEsRUFBTyxnQ0FEUDtNQUVBLE1BQUEsRUFBUTtRQUNKO1VBQUEsSUFBQSxFQUFNLFNBQU47VUFDQSxVQUFBLEVBQVksSUFEWjtVQUVBLEtBQUEsRUFBTyxNQUZQO1NBREk7T0FGUjtLQUZKO0lBVUEsUUFBQSxFQUFVLE1BVlY7SUFXQSxLQUFBLEVBQU8sSUFYUDtJQVlBLE9BQUEsRUFBUyxTQVpUO0lBYUEsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBYlA7R0FESjtBQUR1Qjs7QUFtQjNCLGFBQUEsR0FBZ0IsU0FBQyxTQUFEO1NBQ1osQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyx5Q0FBTDtJQUNBLElBQUEsRUFDSTtNQUFBLFFBQUEsRUFBVSxTQUFWO0tBRko7SUFHQSxRQUFBLEVBQVUsTUFIVjtJQUlBLEtBQUEsRUFBTyxJQUpQO0lBS0EsT0FBQSxFQUFTLFNBTFQ7R0FESjtBQURZOztBQVNoQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQWYsR0FBNkIsQ0FBQSxTQUFBLEtBQUE7U0FBQSxTQUFDLEdBQUQ7SUFDekIsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsR0FBdEIsQ0FBbkI7SUFDQSxZQUFBLENBQUE7SUFDQSxPQUFPLENBQUMsY0FBUixDQUFBO1dBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsR0FBRyxDQUFDLEdBQXBCO0VBSnlCO0FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTs7QUFPN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFmLEdBQThCLENBQUEsU0FBQSxLQUFBO1NBQUEsU0FBQyxHQUFEO1dBQzFCLHFCQUFBLENBQXNCLEdBQUcsQ0FBQyxXQUExQixFQUF1QyxHQUFHLENBQUMsSUFBM0MsRUFBaUQsU0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixLQUFuQjtBQUM3QyxVQUFBO01BQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCO01BQ3hCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQW5CLEVBQXNCLEdBQXRCLENBQW5CO01BRUEsWUFBQSxDQUFBO01BQ0EsT0FBTyxDQUFDLGNBQVIsQ0FBQTtNQUNBLEdBQUEsR0FBTSxHQUFHLENBQUMsV0FBSixHQUFrQixHQUFsQixHQUF3QixHQUFHLENBQUM7YUFDbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFsQixHQUE2QjtJQVBnQixDQUFqRDtFQUQwQjtBQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7O0FBVzlCLGNBQUEsR0FBaUIsU0FBQyxTQUFELEVBQVksSUFBWixFQUFrQixPQUFsQixFQUEyQixvQkFBM0I7U0FDYixDQUFDLENBQUMsSUFBRixDQUNJO0lBQUEsR0FBQSxFQUFLLHFHQUFMO0lBQ0EsSUFBQSxFQUFNLE1BRE47SUFFQSxXQUFBLEVBQWEsa0JBRmI7SUFHQSxRQUFBLEVBQVUsTUFIVjtJQUlBLElBQUEsRUFBTSxPQUpOO0lBS0EsS0FBQSxFQUFPLElBTFA7SUFNQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLElBQUQ7QUFDTCxZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQztRQUNkLG9CQUFBLENBQXFCLFNBQXJCLEVBQWdDLElBQWhDLEVBQXNDLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBdEMsRUFBcUQsb0JBQXJEO01BRks7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlQ7SUFVQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2FBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO0lBREcsQ0FWUDtHQURKO0FBRGE7O0FBZ0JqQixvQkFBQSxHQUF1QixTQUFDLFNBQUQsRUFBWSxJQUFaLEVBQWtCLEdBQWxCLEVBQXVCLG9CQUF2QjtBQUNuQixNQUFBO0VBQUEsQ0FBQSxHQUFJLHdFQUFBLEdBQXlFLElBQXpFLEdBQThFO0FBQ2xGLE9BQUEscUNBQUE7O1FBQTREO01BQTVELENBQUEsSUFBSyxpQkFBQSxHQUFrQixDQUFsQixHQUFvQixJQUFwQixHQUF3QixDQUF4QixHQUEwQjs7QUFBL0I7RUFDQSxDQUFBLElBQUs7RUFDTCxNQUFBLEdBQVMsQ0FBQSxDQUFFLENBQUY7RUFDVCxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsTUFBYixDQUFvQixNQUFwQjtFQUdBLElBQUcsSUFBQSxLQUFRLFNBQVg7SUFDSSxNQUFNLENBQUMsR0FBUCxDQUFXLElBQVg7SUFDQSxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQWYsR0FBOEIsS0FGbEM7O1NBSUEsTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFDLENBQUQ7QUFDVixRQUFBO0lBQUEsRUFBQSxHQUFLLENBQUEsQ0FBRSxDQUFDLENBQUMsTUFBSjtJQUNMLE1BQU0sQ0FBQyxPQUFRLENBQUEsb0JBQUEsQ0FBZixHQUF1QyxFQUFFLENBQUMsR0FBSCxDQUFBO1dBQ3ZDLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBdUIsWUFBWSxDQUFDLFVBQWIsQ0FBQSxDQUF2QjtFQUhVLENBQWQ7QUFabUI7O0FBaUJ2QixzQkFBQSxHQUF5QixTQUFBO0FBQ3JCLE1BQUE7RUFBQSxHQUFBLEdBQU0sQ0FBQSxDQUFFLFVBQUY7RUFDTixHQUFBLEdBQU0sQ0FBQSxDQUFFLHFCQUFGO1NBQ04sR0FBRyxDQUFDLEtBQUosQ0FBVSxHQUFHLENBQUMsS0FBSixDQUFBLENBQVY7QUFIcUI7O0FBTXpCLCtCQUFBLEdBQWtDLFNBQUE7U0FDOUIsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQTtXQUNiLHNCQUFBLENBQUE7RUFEYSxDQUFqQjtBQUQ4Qjs7QUFJbEMsa0JBQUEsR0FBcUIsU0FBQyxJQUFEO1NBQ2pCLFVBQUEsQ0FBVyxDQUFDLFNBQUE7V0FBRyxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsS0FBZCxDQUFBO0VBQUgsQ0FBRCxDQUFYLEVBQXVDLElBQXZDO0FBRGlCOztBQUtyQixNQUFNLENBQUMsWUFBUCxHQUFzQixTQUFDLENBQUQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSSxNQUFNLENBQUMsUUFBUSxDQUFDO0VBQ3BCLElBQUcsQ0FBSSxDQUFQO1dBQ0ksT0FBTyxDQUFDLGdCQUFSLENBQUEsRUFESjs7QUFGa0I7O0FBT3RCLEtBQUEsR0FBUSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUEzQixDQUFpQyxHQUFqQyxDQUFxQyxDQUFDLE1BQXRDLENBQTZDLFNBQUMsR0FBRDtFQUFRLElBQUcsR0FBQSxLQUFTLEVBQVo7V0FBb0IsSUFBcEI7R0FBQSxNQUFBO1dBQTZCLE1BQTdCOztBQUFSLENBQTdDOztBQUNSLFNBQUEsR0FBWSxLQUFLLENBQUM7O0FBRWxCLE9BQU8sQ0FBQyxPQUFSLEdBQWtCLFNBQUMsS0FBRDtBQUNkLE1BQUE7RUFBQSxJQUFHLEtBQUEsS0FBUyxDQUFaO0lBQ0ksZUFBQSxHQUFrQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0lBQ2xCLElBQUcsZUFBQSxLQUFtQixFQUF0QjtNQUNJLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QixFQUF6QixFQUE2QixvQkFBN0IsRUFBbUQsR0FBbkQ7TUFDQSxDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7TUFDQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUEsRUFISjtLQUFBLE1BQUE7TUFLSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQWxCLEdBQTZCLElBTGpDOztJQU1BLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0FBQ0EsV0FBTyxNQVZYOztFQVdBLElBQUksT0FBTyxDQUFDLEtBQVIsS0FBaUIsSUFBakIsSUFBeUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFkLEtBQTBCLE1BQXZEO1dBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFmLENBQWtCLEtBQWxCLEVBREo7R0FBQSxNQUFBO0lBR0ksS0FBSyxDQUFDLEdBQU4sQ0FBQTtXQUNBLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBbEIsR0FBNkIsR0FBQSxHQUFNLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxFQUp2Qzs7QUFaYzs7QUFrQmxCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixVQUF4QixFQUFvQyxTQUFDLEtBQUQ7RUFDaEMsSUFBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWYsS0FBMEIsSUFBN0I7SUFDSSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQS9CO0lBQ0EsS0FBQSxHQUFRLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQTNCLENBQWlDLEdBQWpDLENBQXFDLENBQUMsTUFBdEMsR0FBNkM7SUFDckQsSUFBRyxLQUFBLEtBQVMsQ0FBWjtNQUFtQixDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUEsRUFBbkI7O0lBQ0EsSUFBRyxLQUFBLEtBQVMsQ0FBWjthQUFtQixDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLEVBQW5CO0tBSko7R0FBQSxNQUFBO1dBTUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixDQUFBLEVBTko7O0FBRGdDLENBQXBDOztBQVVBLGNBQUEsR0FBaUIsU0FBQyxhQUFELEVBQWdCLE1BQWhCLEVBQXdCLFFBQXhCO1NBQ2IsTUFBTSxDQUFDLEtBQVAsQ0FDSTtJQUFBLE1BQUEsRUFBUSxJQUFSO0lBQ0EsTUFBQSxFQUFRLFNBQUE7TUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVYsR0FBdUI7TUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFWLEdBQWdCO2FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBVixHQUFrQjtJQUhkLENBRFI7R0FESjtBQURhOztBQVFqQixDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxFQUFwQixDQUF1QixPQUF2QixFQUFnQyxlQUFoQyxFQUFpRCxTQUFDLENBQUQ7QUFDN0MsTUFBQTtFQUFBLENBQUMsQ0FBQyxjQUFGLENBQUE7RUFDQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQztFQUN0QixDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO0VBQ0EsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsSUFBdEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7RUFDQSxDQUFBLENBQUUscUJBQUYsQ0FBd0IsQ0FBQyxJQUF6QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxjQUFGLENBQWlCLENBQUMsSUFBbEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBQTtTQUNBLE1BQU0sQ0FBQyxHQUFQLENBQVcsR0FBWCxFQUFnQixFQUFoQixFQUFvQixTQUFDLElBQUQ7SUFDaEIsSUFBRyxJQUFIO2FBQ0ksQ0FBQyxDQUFDLElBQUYsQ0FDSTtRQUFBLEdBQUEsRUFBSyx5Q0FBQSxHQUE0QyxHQUFqRDtRQUNBLFFBQUEsRUFBVSxNQURWO1FBRUEsS0FBQSxFQUFPLElBRlA7UUFHQSxPQUFBLEVBQVMsU0FBQyxJQUFEO0FBRUwsY0FBQTtVQUFBLE1BQUEsR0FBUyxJQUFLLENBQUEsQ0FBQTtVQUVkLElBQUcsQ0FBQyxDQUFDLGFBQUYsQ0FBZ0IsTUFBaEIsQ0FBSDtZQUNJLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixnQ0FBbkI7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsR0FBZCxDQUFrQjtjQUFDLFdBQUEsRUFBWSxRQUFiO2FBQWxCO1lBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtZQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7QUFDQSxtQkFBTyxNQU5YOztVQVFBLE1BQUEsR0FBUztZQUFDLElBQUEsRUFBTSxTQUFQO1lBQWtCLEtBQUEsRUFBTyxTQUF6QjtZQUFvQyxHQUFBLEVBQUssU0FBekM7O1VBQ1QsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFiLENBQXFCLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDakIsZ0JBQUE7WUFBQSxJQUFBLEdBQVcsSUFBQSxJQUFBLENBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUF0QjttQkFDWCxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWpCLEdBQW1DLElBQUksQ0FBQyxjQUFMLENBQW9CLE9BQXBCLEVBQTZCLE1BQTdCO1VBRmxCLENBQXJCO1VBSUEsR0FBQSxHQUFNLENBQUEsQ0FBRSx1QkFBRixDQUEwQixDQUFDLElBQTNCLENBQUE7VUFDTixnQkFBQSxHQUFtQixVQUFVLENBQUMsT0FBWCxDQUFtQixHQUFuQjtVQUNuQixDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO1VBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtVQUNBLElBQUEsR0FBTyxnQkFBQSxDQUFpQixNQUFqQjtVQUNQLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtZQUFDLFFBQUEsRUFBVSxJQUFYO1dBQXpCLEVBQTJDLHlCQUEzQyxFQUFzRSxHQUF0RTtVQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CO1VBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsR0FBcEIsQ0FBd0I7WUFBQSxTQUFBLEVBQVcsT0FBWDtXQUF4QjtVQUVBLENBQUEsQ0FBRSxPQUFGLENBQVUsQ0FBQyxFQUFYLENBQWMsT0FBZCxFQUF1QixTQUFDLENBQUQ7QUFDbkIsZ0JBQUE7WUFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUVyQixJQUFBLEdBQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDL0IsSUFBRyxJQUFBLEtBQVEsTUFBWDtjQUEwQixJQUFBLEdBQU8sTUFBTSxDQUFDLFVBQXhDOztZQUNBLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBQSxHQUFPLElBQVAsR0FBYyxNQUFNLENBQUMsWUFBckIsR0FBb0MsR0FBNUQ7WUFDQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLEtBQW5CLENBQXlCLE1BQXpCO21CQUNBLGNBQUEsQ0FBZSxFQUFmLEVBQW1CLG1CQUFBLEdBQXNCLEdBQXRCLEdBQTRCLEVBQS9DLEVBQW1ELElBQW5EO1VBUG1CLENBQXZCO1VBUUEsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsWUFBQSxHQUFlLE1BQU0sQ0FBQyxZQUEvQztpQkFDQSxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQXJCLENBQUE7UUFuQ0ssQ0FIVDtRQXdDQSxLQUFBLEVBQU8sU0FBQyxDQUFEO2lCQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtRQURHLENBeENQO09BREosRUFESjs7RUFEZ0IsQ0FBcEI7QUFWNkMsQ0FBakQ7O0FBMERBLElBQUcsU0FBQSxLQUFhLENBQWhCO0VBQ0ksQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0VBQ0EsWUFBQSxHQUFtQixJQUFBLFdBQUEsQ0FBWSxZQUFaLEVBQTBCLGdDQUExQixFQUE0RCxDQUE1RDtFQUNuQixZQUFZLENBQUMsV0FBYixHQUEyQixTQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksSUFBWjtBQUN2QixRQUFBO0lBQUEsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtJQUNBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLElBQXRCLENBQUE7SUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUFBO0lBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtJQUNBLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQUE7SUFDQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUE7SUFDQSxHQUFBLEdBQU0sR0FBQSxHQUFNLElBQUksQ0FBQyxXQUFYLEdBQXlCLEdBQXpCLEdBQStCLElBQUksQ0FBQztXQUMxQyxNQUFNLENBQUMsR0FBUCxDQUFXLEdBQVgsRUFBZ0IsRUFBaEIsRUFBb0IsU0FBQyxJQUFEO01BQ2hCLElBQUcsSUFBSDtlQUNJLENBQUMsQ0FBQyxJQUFGLENBQ0k7VUFBQSxHQUFBLEVBQUssbUNBQUEsR0FBc0MsR0FBM0M7VUFDQSxRQUFBLEVBQVUsTUFEVjtVQUVBLEtBQUEsRUFBTyxJQUZQO1VBR0EsT0FBQSxFQUFTLFNBQUMsc0JBQUQ7QUFDTCxnQkFBQTtZQUFBLElBQUEsR0FBTztZQUNQLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7WUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO1lBQ0EscUJBQUEsR0FBd0IsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsQ0FBbkIsRUFBc0IsSUFBdEI7WUFDeEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFmLENBQXlCO2NBQUMsUUFBQSxFQUFVLHFCQUFYO2FBQXpCLEVBQTRELG9CQUE1RCxFQUFrRixHQUFsRjtZQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLHFCQUFuQjtZQUNBLFlBQUEsQ0FBQTttQkFDQSxPQUFPLENBQUMsY0FBUixDQUFBO1VBUkssQ0FIVDtVQVlBLEtBQUEsRUFBTyxTQUFDLENBQUQ7bUJBQ0gsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFaO1VBREcsQ0FaUDtTQURKLEVBREo7O0lBRGdCLENBQXBCO0VBUnVCO0VBeUIzQixJQUFHLENBQUMsS0FBSjtJQUNJLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLElBQXRCLENBQTJCLENBQUEsQ0FBRSw0QkFBRixDQUErQixDQUFDLElBQWhDLENBQUEsQ0FBM0I7SUFFQSxDQUFDLENBQUMsR0FBRixDQUFNLCtCQUFOLEVBQXVDLFNBQUMsSUFBRDthQUFVLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsSUFBdEI7SUFBVixDQUF2QztJQUNBLE1BQUEsR0FBUyxPQUFBLENBQVEsaUJBQVI7SUFDVCxZQUFBLENBQWEsT0FBTyxDQUFDLGFBQXJCO0lBQ0EsS0FBQSxHQUFRO0lBQ1IsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQSxFQVBKOztFQVFBLHNCQUFBLENBQUE7RUFDQSwrQkFBQSxDQUFBO0VBRUEsQ0FBQSxDQUFFLGtCQUFGLENBQXFCLENBQUMsS0FBdEIsQ0FBNEIsU0FBQyxDQUFEO0lBQ3hCLENBQUMsQ0FBQyxjQUFGLENBQUE7V0FDQSxPQUFPLENBQUMsZ0JBQVIsQ0FBQTtFQUZ3QixDQUE1QjtFQUlBLFNBQVMsQ0FBQyxvQkFBVixDQUErQixNQUEvQixFQUF1QyxnS0FBdkM7RUFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsRUFBYixDQUFnQixPQUFoQixFQUF5QixrQkFBekIsRUFBNkMsU0FBQyxDQUFEO0FBQ3pDLFFBQUE7SUFBQSxHQUFBLEdBQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO0lBQ2xDLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0lBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtXQUNBLENBQUMsQ0FBQyxJQUFGLENBQ0k7TUFBQSxHQUFBLEVBQUssbUNBQUEsR0FBc0MsR0FBM0M7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLEtBQUEsRUFBTyxJQUZQO01BR0EsT0FBQSxFQUFTLFNBQUMsSUFBRDtBQUNMLFlBQUE7UUFBQSxxQkFBQSxHQUF3QixTQUFTLENBQUMsUUFBVixDQUFtQixDQUFuQixFQUFzQixJQUF0QjtRQUN4QixDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixxQkFBbkI7UUFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO1FBQ0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLElBQWQsQ0FBQTtRQUNBLENBQUEsQ0FBRSxhQUFGLENBQWdCLENBQUMsSUFBakIsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZixDQUF5QjtVQUFDLFFBQUEsRUFBVSxxQkFBWDtTQUF6QixFQUE0RCxvQkFBNUQsRUFBa0YsR0FBbEY7TUFOSyxDQUhUO0tBREo7RUFMeUMsQ0FBN0MsRUE1Q0o7OztBQThEQSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtFQUNJLFFBQVEsQ0FBQyxLQUFULEdBQWlCO0VBQ2pCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7RUFDQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUFBO0VBQ0EsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQUE7RUFDQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQUE7RUFDQSxTQUFTLENBQUMsb0JBQVYsQ0FBK0IsTUFBL0IsRUFBdUMsZ0tBQXZDO0VBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyxtQ0FBQSxHQUFzQyxNQUFNLENBQUMsSUFBbEQ7SUFDQSxRQUFBLEVBQVUsTUFEVjtJQUVBLEtBQUEsRUFBTyxJQUZQO0lBR0EsT0FBQSxFQUFTLFNBQUMsc0JBQUQ7QUFDTCxVQUFBO01BQUEsSUFBQSxHQUFPO01BQ1AsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtNQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7TUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixTQUFTLENBQUMsUUFBVixDQUFtQixDQUFuQixFQUFzQixJQUF0QixDQUFuQjtNQUNBLFlBQUEsQ0FBQTthQUNBLE9BQU8sQ0FBQyxjQUFSLENBQUE7SUFOSyxDQUhUO0lBVUEsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBVlA7R0FESjtFQWNBLENBQUEsQ0FBRSxrQkFBRixDQUFxQixDQUFDLEtBQXRCLENBQTRCLFNBQUMsQ0FBRDtJQUN4QixDQUFDLENBQUMsY0FBRixDQUFBO1dBQ0EsT0FBTyxDQUFDLGdCQUFSLENBQUE7RUFGd0IsQ0FBNUIsRUF0Qko7OztBQTJCQSxJQUFHLFNBQUEsS0FBYSxDQUFoQjtFQUNJLFFBQVEsQ0FBQyxLQUFULEdBQWlCO0VBQ2pCLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7RUFDQSxDQUFBLENBQUUsa0JBQUYsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtFQUNBLENBQUEsQ0FBRSxxQkFBRixDQUF3QixDQUFDLElBQXpCLENBQUE7RUFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGNBQUYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBO0VBQ0EsQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFBO0VBQ0EsQ0FBQyxDQUFDLElBQUYsQ0FDSTtJQUFBLEdBQUEsRUFBSyx5Q0FBQSxHQUE0QyxNQUFNLENBQUMsSUFBeEQ7SUFDQSxRQUFBLEVBQVUsTUFEVjtJQUVBLE9BQUEsRUFBUyxTQUFDLElBQUQ7QUFFTCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUssQ0FBQSxDQUFBO01BRWQsSUFBRyxDQUFDLENBQUMsYUFBRixDQUFnQixNQUFoQixDQUFIO1FBQ0ksQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtRQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQW1CLGdDQUFuQjtRQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxHQUFkLENBQWtCO1VBQUMsV0FBQSxFQUFZLFFBQWI7U0FBbEI7UUFDQSxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFBO1FBQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTtBQUNBLGVBQU8sTUFOWDs7TUFRQSxNQUFBLEdBQVM7UUFBQyxJQUFBLEVBQU0sU0FBUDtRQUFrQixLQUFBLEVBQU8sU0FBekI7UUFBb0MsR0FBQSxFQUFLLFNBQXpDOztNQUNULElBQUcsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsTUFBbkI7UUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWIsQ0FBcUIsU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNqQixjQUFBO1VBQUEsSUFBQSxHQUFXLElBQUEsSUFBQSxDQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBdEI7aUJBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFqQixHQUFtQyxJQUFJLENBQUMsY0FBTCxDQUFvQixPQUFwQixFQUE2QixNQUE3QjtRQUZsQixDQUFyQixFQURKOztNQUtBLEdBQUEsR0FBTSxDQUFBLENBQUUsdUJBQUYsQ0FBMEIsQ0FBQyxJQUEzQixDQUFBO01BQ04sZ0JBQUEsR0FBbUIsVUFBVSxDQUFDLE9BQVgsQ0FBbUIsR0FBbkI7TUFDbkIsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtNQUNBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxJQUFkLENBQUE7TUFDQSxJQUFBLEdBQU8sZ0JBQUEsQ0FBaUIsTUFBakI7TUFFUCxDQUFBLENBQUUsVUFBRixDQUFhLENBQUMsSUFBZCxDQUFtQixJQUFuQjtNQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLEdBQXBCLENBQXdCO1FBQUEsU0FBQSxFQUFXLE9BQVg7T0FBeEI7TUFFQSxDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsRUFBWCxDQUFjLE9BQWQsRUFBdUIsU0FBQyxDQUFEO0FBQ25CLFlBQUE7UUFBQSxFQUFBLEdBQUssQ0FBQyxDQUFDLGFBQWEsQ0FBQztRQUVyQixJQUFBLEdBQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFDL0IsSUFBRyxJQUFBLEtBQVEsTUFBWDtVQUEwQixJQUFBLEdBQU8sTUFBTSxDQUFDLFVBQXhDOztRQUNBLENBQUEsQ0FBRSxlQUFGLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsSUFBQSxHQUFPLElBQVAsR0FBYyxNQUFNLENBQUMsWUFBckIsR0FBb0MsR0FBNUQ7UUFDQSxDQUFBLENBQUUsZUFBRixDQUFrQixDQUFDLEtBQW5CLENBQXlCLE1BQXpCO2VBQ0EsY0FBQSxDQUFlLEVBQWYsRUFBbUIsbUJBQUEsR0FBc0IsR0FBdEIsR0FBNEIsRUFBL0MsRUFBbUQsSUFBbkQ7TUFQbUIsQ0FBdkI7TUFRQSxDQUFBLENBQUUsZ0JBQUYsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixZQUFBLEdBQWUsTUFBTSxDQUFDLFlBQS9DO2FBQ0EsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUFBO0lBcENLLENBRlQ7SUF3Q0EsS0FBQSxFQUFPLFNBQUMsQ0FBRDthQUNILE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBWjtJQURHLENBeENQO0dBREosRUFUSjs7Ozs7O0FDN2NBLElBQUE7O0FBQUEsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLFNBQVA7O0lBQU8sWUFBVTs7U0FDN0IsU0FBQyxDQUFELEVBQUksRUFBSjtBQUNFLFFBQUE7SUFBQSxXQUFBLEdBQWEsU0FBQyxDQUFELEVBQUksSUFBSjtBQUNYLFVBQUE7QUFBQSxXQUFBLHNDQUFBOztRQUFDLElBQUcsQ0FBSSxDQUFDLENBQUMsSUFBRixDQUFPLENBQVAsQ0FBUDtBQUFzQixpQkFBTyxNQUE3Qjs7QUFBRDtBQUNBLGFBQU87SUFGSTtJQUliLE1BQWUsY0FBQSxDQUFlLENBQWYsQ0FBZixFQUFDLGNBQUQsRUFBTztJQUNQLE9BQUEsR0FBVTtBQUlWLFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxPQUFPLENBQUMsTUFBUixJQUFrQixTQUFyQjtBQUFvQyxjQUFwQzs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxZQUFSLElBQXlCLENBQUMsQ0FBQyxLQUFGLEtBQWEsT0FBTyxDQUFDLFlBQWpEO0FBQW1FLGlCQUFuRTs7TUFDQSxJQUFHLE9BQU8sQ0FBQyxlQUFSLElBQTRCLENBQUMsQ0FBQyxRQUFGLEtBQWdCLE9BQU8sQ0FBQyxlQUF2RDtBQUE0RSxpQkFBNUU7O01BRUEsSUFBRyxXQUFBLENBQVksQ0FBQyxDQUFDLFFBQWQsRUFBd0IsSUFBeEIsQ0FBSDtRQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxFQUFULEVBQWEsQ0FBYixDQUFiLEVBREY7O0FBTEY7SUFTQSxXQUFBLENBQVksT0FBWixFQUFxQixLQUFyQixFQUE0QixJQUE1QjtJQUNBLEVBQUEsQ0FBRyxPQUFIO0VBcEJGO0FBRFk7O0FBMEJkLFdBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUSxLQUFSLEVBQWMsSUFBZDtBQUNaLE1BQUE7QUFBQSxPQUFBLHdDQUFBOztJQUNFLENBQUMsQ0FBQyxRQUFGLEdBQVcsU0FBQSxDQUFVLENBQUMsQ0FBQyxRQUFaLEVBQXNCLEtBQXRCLEVBQTZCLElBQTdCO0FBRGI7QUFLQSxTQUFPO0FBTks7O0FBV2QsU0FBQSxHQUFZLFNBQUMsQ0FBRCxFQUFJLEtBQUosRUFBVyxJQUFYO0VBQ1YsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFDLENBQUQsRUFBRyxDQUFIO1dBQ1gsQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVixFQUFhLEtBQUEsR0FBTSxLQUFNLENBQUEsQ0FBQSxDQUFaLEdBQWUsTUFBNUI7RUFETyxDQUFiO0FBRUEsU0FBTztBQUhHOztBQU1aLEtBQUEsR0FBUSxTQUFDLENBQUQ7U0FDTixDQUFDLENBQUMsT0FBRixDQUFVLFdBQVYsRUFBc0IsRUFBdEI7QUFETTs7QUFLUixTQUFBLEdBQVksU0FBQyxDQUFEO0FBQ1YsTUFBQTtFQUFBLEVBQUEsR0FBRyxDQUFDLENBQUMsSUFBRixDQUFPLEVBQUEsR0FBRyxDQUFWO1NBQ0gsRUFBQSxHQUFHLEVBQUUsQ0FBQyxPQUFILENBQVcsS0FBWCxFQUFpQixHQUFqQjtBQUZPOztBQUtaLFNBQUEsR0FBWSxTQUFDLEdBQUQ7U0FDVixTQUFBLENBQVUsR0FBVixDQUFjLENBQUMsS0FBZixDQUFxQixHQUFyQjtBQURVOztBQUlaLGNBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsTUFBQTtFQUFBLEtBQUEsR0FBUSxTQUFBLENBQVUsR0FBVjtFQUNSLElBQUEsR0FBTyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsQ0FBRDtXQUFVLElBQUEsTUFBQSxDQUFPLEVBQUEsR0FBRyxDQUFWLEVBQWMsR0FBZDtFQUFWLENBQVY7U0FDUCxDQUFDLEtBQUQsRUFBTyxJQUFQO0FBSGU7O0FBTWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCOzs7Ozs7QUN2RWpCOzs7Ozs7OztBQUFBLElBQUE7O0FBWUEsVUFBQSxHQUFhOztBQUNiLGNBQUEsR0FBaUI7O0FBR2pCLGtCQUFBLEdBQXFCLFNBQUMsQ0FBRCxFQUFHLElBQUgsRUFBUSxJQUFSO0FBQ25CLE1BQUE7RUFBQSxDQUFBLEdBQUUsSUFBSyxDQUFBLENBQUE7RUFDUCxJQUFHLENBQUksSUFBSyxDQUFBLENBQUEsQ0FBWjtBQUNFLFdBQU8sR0FEVDs7RUFHQSxJQUFHLENBQUEsS0FBSyxVQUFSO0FBQ0UsV0FBTywyQkFBQSxHQUE0QixDQUE1QixHQUE4QixJQUE5QixHQUFrQyxDQUFsQyxHQUFvQyxPQUQ3QztHQUFBLE1BQUE7SUFHRSxJQUFHLEVBQUEsS0FBTSxJQUFUO01BQ0UsSUFBRyxJQUFLLENBQUEsQ0FBQSxHQUFFLE9BQUYsQ0FBTCxJQUFvQixJQUFJLENBQUMsU0FBekIsSUFBdUMsSUFBSSxDQUFDLFNBQVUsQ0FBQSxDQUFBLEdBQUUsV0FBRixDQUF6RDtRQUNFLENBQUEsR0FBSSxPQUFBLENBQVEsQ0FBUixDQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQjtBQUNKLGVBQVUsQ0FBRCxHQUFHLHVCQUFILEdBQTBCLElBQUssQ0FBQSxDQUFBLEdBQUUsT0FBRixDQUEvQixHQUEwQyxNQUExQyxHQUFnRCxJQUFJLENBQUMsU0FBVSxDQUFBLENBQUEsR0FBRSxXQUFGLENBQS9ELEdBQThFLFdBRnpGOztNQUdBLElBQUcsQ0FBQSxLQUFLLCtCQUFSO0FBQ0UsZUFBTyxPQUFBLENBQVEsQ0FBUixDQUFVLENBQUMsTUFBWCxDQUFrQixLQUFsQixFQURUOztBQUVBLGFBQU8sT0FBQSxDQUFRLENBQVIsQ0FBVSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFOVDtLQUFBLE1BQUE7TUFRRSxJQUFHLENBQUMsQ0FBQyxNQUFGLEdBQVcsRUFBWCxJQUNILENBQUEsS0FBSyx5QkFETDtRQUVLLENBQUEsR0FBSSxDQUFDLENBQUMsU0FBRixDQUFZLENBQVosRUFBZSxFQUFmLENBQUEsR0FBcUIsQ0FBQSxvREFBQSxHQUFxRCxDQUFyRCxHQUF1RCxrQkFBdkQsRUFGOUI7O01BR0EsSUFBRyxDQUFDLENBQUMsTUFBRixHQUFXLEVBQVgsSUFDSCxDQUFBLEtBQUssaUNBREw7ZUFFSyxDQUFBLEdBQUksQ0FBQyxDQUFDLFNBQUYsQ0FBWSxDQUFaLEVBQWUsRUFBZixDQUFBLEdBQXFCLENBQUEsb0RBQUEsR0FBcUQsQ0FBckQsR0FBdUQsa0JBQXZELEVBRjlCO09BQUEsTUFBQTtRQUlFLElBQUcsQ0FBQyxDQUFDLE1BQUYsR0FBVyxFQUFkO1VBQ0ssQ0FBQSxHQUFJLENBQUMsQ0FBQyxTQUFGLENBQVksQ0FBWixFQUFlLEVBQWYsRUFEVDtTQUFBLE1BQUE7QUFBQTs7QUFHQSxlQUFPLEVBUFQ7T0FYRjtLQUhGOztBQUxtQjs7QUE2QnJCLHNCQUFBLEdBQXlCLFNBQUMsS0FBRDtBQUVyQixTQUFPLGNBQWUsQ0FBQSxLQUFBO0FBRkQ7O0FBSXpCLGlCQUFBLEdBQW9CLFNBQUMsS0FBRDtBQUNsQixNQUFBO0VBQUEsSUFBRyx5QkFBSDtBQUNFLFdBQU8sVUFBVyxDQUFBLEtBQUEsRUFEcEI7O0VBR0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxFQUFtQixHQUFuQjtFQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsQ0FBVyxDQUFDLFdBQVosQ0FBQSxDQUFBLEdBQTRCLENBQUMsQ0FBQyxTQUFGLENBQVksQ0FBWjtBQUNoQyxTQUFPO0FBTlc7O0FBU3BCLFlBQUEsR0FBZSxTQUFDLEtBQUQsRUFBTyxJQUFQO0FBQ2IsTUFBQTtFQUFBLElBQUcsR0FBQSxLQUFPLE1BQUEsQ0FBTyxLQUFQLEVBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUFWO1dBQ0Usa0NBQUEsR0FFMEIsQ0FBQyxpQkFBQSxDQUFrQixLQUFsQixDQUFELENBRjFCLEdBRW1ELHlEQUhyRDtHQUFBLE1BQUE7SUFRRSxJQUFBLENBQWlCLENBQUEsTUFBQSxHQUFTLElBQUssQ0FBQSxLQUFBLENBQWQsQ0FBakI7QUFBQSxhQUFPLEdBQVA7O1dBQ0EsbUNBQUEsR0FFMkIsQ0FBQyxpQkFBQSxDQUFrQixLQUFsQixDQUFELENBRjNCLEdBRW9ELHdDQUZwRCxHQUd5QixDQUFDLGtCQUFBLENBQW1CLEtBQW5CLEVBQXlCLElBQXpCLENBQUQsQ0FIekIsR0FHeUQsa0JBWjNEOztBQURhOztBQWlCZixpQkFBQSxHQUFvQixTQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsUUFBZDtBQUNsQixNQUFBO0VBQUEsQ0FBQSxHQUFJO0VBQ0osS0FBQSxHQUFRLGlCQUFBLENBQWtCLEtBQWxCO0VBQ1IsSUFBRyxJQUFBLEtBQVEsU0FBWDtJQUNFLElBQUcsUUFBQSxLQUFZLENBQWY7TUFDRSxDQUFBLElBQUssUUFEUDs7SUFFQSxDQUFBLElBQUssMkJBQUEsR0FBNEIsS0FBNUIsR0FBa0MsNENBSHpDOztBQUlBLFNBQU87QUFQVzs7QUFTcEIsYUFBQSxHQUFnQixTQUFDLE1BQUQsRUFBUSxJQUFSLEVBQWEsUUFBYjtBQUNkLE1BQUE7RUFBQSxDQUFBLEdBQUk7QUFDSixPQUFBLGdEQUFBOztJQUNFLElBQUksT0FBTyxLQUFQLEtBQWdCLFFBQXBCO01BQ0UsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFNBQWpCO1FBQ0UsQ0FBQSxJQUFLLGlCQUFBLENBQWtCLEtBQUssQ0FBQyxJQUF4QixFQUE4QixLQUFLLENBQUMsSUFBcEMsRUFBMEMsQ0FBMUM7UUFDTCxNQUFBLEdBQVMsR0FGWDtPQUFBLE1BQUE7UUFJRSxNQUFBLEdBQVMsa0JBQUEsQ0FBbUIsS0FBSyxDQUFDLElBQXpCLEVBQStCLEtBQUssQ0FBQyxJQUFyQyxFQUEyQyxJQUEzQztRQUNULElBQUksRUFBQSxLQUFNLE1BQU4sSUFBaUIsTUFBQSxLQUFVLEdBQS9CO1VBQ0UsS0FBQSxHQUFRLGlCQUFBLENBQWtCLEtBQUssQ0FBQyxJQUF4QjtVQUNSLFNBQUEsR0FBWSxzQkFBQSxDQUF1QixLQUFLLENBQUMsSUFBN0IsRUFGZDtTQUFBLE1BQUE7VUFJRSxNQUFBLEdBQVMsR0FKWDtTQUxGO09BREY7S0FBQSxNQUFBO01BYUUsTUFBQSxHQUFTLGtCQUFBLENBQW1CLEtBQW5CLEVBQTBCLEVBQTFCLEVBQThCLElBQTlCO01BQ1QsSUFBSSxFQUFBLEtBQU0sTUFBVjtRQUNFLEtBQUEsR0FBUSxpQkFBQSxDQUFrQixLQUFsQjtRQUNSLFNBQUEsR0FBWSxzQkFBQSxDQUF1QixLQUF2QixFQUZkO09BZEY7O0lBaUJBLElBQUksRUFBQSxLQUFNLE1BQVY7TUFDRSxDQUFBLElBQUssUUFBQSxDQUFTO1FBQUEsSUFBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU8sTUFBcEI7UUFBNEIsSUFBQSxFQUFNLFNBQWxDO09BQVQsRUFEUDs7QUFsQkY7QUFvQkEsU0FBTztBQXRCTzs7QUF3QmhCLHVCQUFBLEdBQTBCLFNBQUMsSUFBRCxFQUFNLFFBQU47QUFDeEIsTUFBQTtFQUFBLENBQUEsR0FBSTtFQUNKLElBQUEsR0FBTztFQUNQLFFBQUEsR0FBVztFQUNYLFlBQUEsR0FBZTtBQUNmLE9BQUEsc0NBQUE7O0lBQ0UsSUFBRyxRQUFBLEtBQVksS0FBSyxDQUFDLGFBQXJCO01BQ0UsUUFBQSxHQUFXLEtBQUssQ0FBQztNQUNqQixJQUFHLFFBQUEsS0FBWSxVQUFmO1FBQ0UsQ0FBQSxJQUFLLFFBQUEsQ0FBUztVQUFBLElBQUEsRUFBTSxLQUFBLEdBQVEsUUFBUixHQUFtQixNQUF6QjtVQUFpQyxPQUFBLEVBQVMsRUFBMUM7VUFBOEMsVUFBQSxFQUFZLEVBQTFEO1VBQThELFVBQUEsRUFBWSxFQUExRTtTQUFULEVBRFA7T0FBQSxNQUVLLElBQUcsUUFBQSxLQUFZLFVBQWY7UUFDSCxDQUFBLElBQUs7UUFDTCxDQUFBLElBQUssS0FBQSxHQUFRLFFBQUEsQ0FBUztVQUFBLElBQUEsRUFBTSxRQUFOO1VBQWdCLE9BQUEsRUFBUyxjQUF6QjtVQUF5QyxVQUFBLEVBQVksYUFBckQ7VUFBb0UsVUFBQSxFQUFZLGtCQUFoRjtTQUFULENBQVIsR0FBdUg7UUFDNUgsWUFBQSxHQUFlLEtBSFo7T0FBQSxNQUFBO1FBS0gsQ0FBQSxJQUFLO1FBQ0wsQ0FBQSxJQUFLLFFBQUEsQ0FBUztVQUFBLElBQUEsRUFBTSxLQUFBLEdBQVEsUUFBUixHQUFtQixNQUF6QjtVQUFpQyxPQUFBLEVBQVMsRUFBMUM7VUFBOEMsVUFBQSxFQUFZLEVBQTFEO1VBQThELFVBQUEsRUFBWSxFQUExRTtTQUFUO1FBQ0wsWUFBQSxHQUFlLEtBUFo7T0FKUDs7SUFhQSxJQUFHLEtBQUssQ0FBQyxPQUFOLEtBQWlCLHNCQUFqQixJQUEyQyxLQUFLLENBQUMsT0FBTixLQUFpQixnQkFBL0Q7TUFDRSxDQUFBLElBQUssUUFBQSxDQUFTO1FBQUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxPQUFaO1FBQXFCLE9BQUEsRUFBUyxRQUFBLENBQVMsS0FBSyxDQUFDLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsc0NBQTlCLENBQTlCO09BQVQsRUFEUDtLQUFBLE1BRUssSUFBRyxRQUFBLEtBQUssQ0FBQyxRQUFOLEtBQWtCLGdCQUFsQixJQUFBLEdBQUEsS0FBb0Msb0JBQXBDLElBQUEsR0FBQSxLQUEwRCxxQkFBMUQsQ0FBQSxJQUFvRixZQUF2RjtNQUNILENBQUEsSUFBSyxRQUFBLENBQVM7UUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE9BQVo7UUFBcUIsT0FBQSxFQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixFQUF3QixJQUF4QixFQUE4QixzQ0FBOUIsQ0FBOUI7UUFBcUcsVUFBQSxFQUFZLFFBQUEsQ0FBUyxLQUFLLENBQUMsVUFBZixFQUEyQixJQUEzQixFQUFpQyxzQ0FBakMsQ0FBakg7UUFBMkwsVUFBQSxFQUFZLFFBQUEsQ0FBUyxLQUFLLENBQUMsVUFBZixFQUEyQixJQUEzQixFQUFpQyxzQ0FBakMsQ0FBdk07T0FBVDtNQUNMLFlBQUEsR0FBZSxNQUZaO0tBQUEsTUFBQTtNQUlILENBQUEsSUFBSyxRQUFBLENBQVM7UUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE9BQVo7UUFBcUIsT0FBQSxFQUFTLFFBQUEsQ0FBUyxLQUFLLENBQUMsT0FBZixFQUF3QixJQUF4QixDQUE5QjtRQUE2RCxVQUFBLEVBQVksUUFBQSxDQUFTLEtBQUssQ0FBQyxVQUFmLEVBQTJCLElBQTNCLENBQXpFO1FBQTJHLFVBQUEsRUFBWSxRQUFBLENBQVMsS0FBSyxDQUFDLFVBQWYsRUFBMkIsSUFBM0IsQ0FBdkg7T0FBVCxFQUpGOztBQWhCUDtBQXFCQSxTQUFPO0FBMUJpQjs7QUE0QjFCLEtBQUEsR0FBUSxTQUFDLENBQUQ7U0FBTyxDQUFDLENBQUMsT0FBRixDQUFVLFdBQVYsRUFBdUIsR0FBdkI7QUFBUDs7QUFFUixXQUFBLEdBQWMsU0FBQyxHQUFEO1NBQ1osR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEVBQXNCLFNBQUMsR0FBRDtXQUNwQixHQUFHLENBQUMsTUFBSixDQUFXLENBQVgsQ0FBYSxDQUFDLFdBQWQsQ0FBQSxDQUFBLEdBQThCLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxDQUFhLENBQUMsV0FBZCxDQUFBO0VBRFYsQ0FBdEI7QUFEWTs7QUFJZCxRQUFBLEdBQVcsU0FBQyxDQUFELEVBQUksSUFBSixFQUFVLElBQVY7QUFDUCxNQUFBOztJQURpQixPQUFPOztFQUN4QixDQUFBLEdBQUksT0FBQSxDQUFRLENBQVI7RUFDSixJQUFHLENBQUEsR0FBSSxDQUFQO0lBQ0ksQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxDQUFjLENBQUMsUUFBZixDQUFBO0lBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBVixFQUFnQixFQUFoQjtBQUNKLFdBQU8sR0FBQSxHQUFJLElBQUosR0FBVSxDQUFDLHdCQUFBLEdBQXlCLENBQXpCLEdBQTJCLFNBQTVCLENBQVYsR0FBZ0QsSUFIM0Q7O0VBS0EsQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVDtBQUNKLFNBQU8sRUFBQSxHQUFHLElBQUgsR0FBUyxDQUFDLHdCQUFBLEdBQXlCLENBQXpCLEdBQTJCLFNBQTVCO0FBUlQ7O0FBVVgsV0FBQSxHQUFjLFNBQUMsY0FBRCxFQUFpQixJQUFqQixFQUF1QixNQUF2QixFQUErQixNQUEvQjtBQUVaLE1BQUE7RUFBQSxNQUFBLEdBQVM7RUFDVCxTQUFBLEdBQVksTUFBTSxDQUFDO0VBQ25CLFlBQUEsR0FBZTtFQUVmLFdBQUEsR0FDRTtJQUFBLEtBQUEsRUFBTyxJQUFJLENBQUMsSUFBWjtJQUNBLHFCQUFBLEVBQXVCLElBQUksQ0FBQyxxQkFENUI7SUFFQSxtQkFBQSxFQUFzQixJQUFJLENBQUMsbUJBRjNCO0lBR0EsZ0NBQUEsRUFBa0MsSUFBSSxDQUFDLGdDQUh2QztJQUlBLGdCQUFBLEVBQWtCLElBQUksQ0FBQyxnQkFKdkI7SUFLQSxJQUFBLEVBQU0sRUFMTjtJQU1BLFVBQUEsRUFBWSxFQU5aOztBQVFGLE9BQUEsZ0RBQUE7O0lBQ0UsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFqQixDQUNFO01BQUEsS0FBQSxFQUFPLEtBQUEsQ0FBTSxHQUFHLENBQUMsSUFBVixDQUFQO01BQ0EsT0FBQSxFQUFTLEdBQUcsQ0FBQyxJQURiO01BRUEsTUFBQSxFQUFRLENBQUksQ0FBQSxHQUFFLENBQUwsR0FBWSxFQUFaLEdBQW9CLFFBQXJCLENBRlI7S0FERjtBQURGO0FBTUEsT0FBQSxrREFBQTs7SUFDRSxXQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sS0FBQSxDQUFNLEdBQUcsQ0FBQyxJQUFWLENBQVA7TUFDQSxPQUFBLEVBQVMsR0FBRyxDQUFDLElBRGI7TUFFQSxNQUFBLEVBQVEsQ0FBSSxDQUFBLEdBQUUsQ0FBTCxHQUFZLEVBQVosR0FBb0IsUUFBckIsQ0FGUjtNQUdBLFVBQUEsRUFBWSxFQUhaOztBQUlGLFlBQU8sR0FBRyxDQUFDLElBQVg7QUFBQSxXQUNPLDhCQURQO1FBRUksV0FBVyxDQUFDLFVBQVosSUFBMEIsYUFBQSxDQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUEwQixJQUExQixFQUFnQyxTQUFVLENBQUEsOEJBQUEsQ0FBMUM7UUFDMUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxJQUFaO0FBQ0E7QUFBQSxhQUFBLCtDQUFBOztVQUNFLGFBQUEsR0FDRTtZQUFBLEtBQUEsRUFBVSxFQUFBLEtBQU0sUUFBUSxDQUFDLEtBQWxCLEdBQTZCLFNBQUEsR0FBWSxRQUFRLENBQUMsS0FBbEQsR0FBQSxNQUFQO1lBQ0EsSUFBQSxFQUFTLEVBQUEsS0FBTSxRQUFRLENBQUMsU0FBbEIsR0FBaUMsUUFBQSxHQUFXLFFBQVEsQ0FBQyxTQUFyRCxHQUFBLE1BRE47WUFFQSxLQUFBLEVBQVUsUUFBUSxDQUFDLGFBQVosR0FBK0IsU0FBQSxHQUFZLFFBQVEsQ0FBQyxhQUFwRCxHQUFBLE1BRlA7WUFHQSxlQUFBLEVBQW9CLElBQUEsS0FBUSxRQUFRLENBQUMsZ0JBQWpCLElBQXNDLE1BQUEsS0FBYSxRQUFRLENBQUMsZ0JBQS9ELEdBQXFGLG9CQUFBLEdBQXVCLFFBQVEsQ0FBQyxnQkFBckgsR0FBQSxNQUhqQjtZQUlBLFdBQUEsRUFBZ0IsUUFBUSxDQUFDLFlBQVosR0FBOEIsZ0JBQUEsR0FBbUIsUUFBUSxDQUFDLFlBQTFELEdBQTRFLGdCQUp6RjtZQUtBLFdBQUEsRUFBYSxJQUFJLENBQUMsYUFMbEI7WUFNQSxRQUFBLEVBQVUsSUFBSSxDQUFDLElBTmY7WUFPQSxJQUFBLEVBQU0sUUFBUSxDQUFDLElBUGY7O1VBU0YsSUFBRyxFQUFBLEtBQU0sUUFBUSxDQUFDLFNBQWYsSUFBNkIsUUFBUSxDQUFDLFNBQVQsS0FBc0IsTUFBdEQ7WUFDRSxhQUFhLENBQUMsS0FBZCxHQUF1QixZQUFBLEdBQWEsUUFBUSxDQUFDLFNBQXRCLEdBQWdDLCtCQUR6RDtXQUFBLE1BQUE7WUFHRSxhQUFhLENBQUMsS0FBZCxHQUF1QixHQUh6Qjs7VUFLQSxXQUFXLENBQUMsVUFBWixJQUEwQixTQUFVLENBQUEsNkJBQUEsQ0FBVixDQUF5QyxhQUF6QztBQWhCNUI7QUFIRztBQURQLFdBcUJPLHVCQXJCUDtRQXNCSSxDQUFBLEdBQUk7UUFDSixDQUFBLElBQUssYUFBQSxDQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUEwQixJQUExQixFQUFnQyxTQUFVLENBQUEsOEJBQUEsQ0FBMUM7UUFDTCxXQUFXLENBQUMsVUFBWixJQUEwQixTQUFVLENBQUEsa0NBQUEsQ0FBVixDQUE4QztVQUFBLE9BQUEsRUFBUyxDQUFUO1NBQTlDO1FBQzFCLElBQUcsQ0FBSSxZQUFhLENBQUEsbUJBQUEsQ0FBcEI7VUFDRSxLQUFBLEdBQVE7VUFDUixJQUFHLElBQUssQ0FBQSxpQ0FBQSxDQUFMLEtBQTJDLENBQTlDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsSUFBRyxJQUFLLENBQUEsNEJBQUEsQ0FBTCxLQUFzQyxDQUF6QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLElBQUcsSUFBSyxDQUFBLDZCQUFBLENBQUwsS0FBdUMsQ0FBMUM7WUFDRSxLQUFBLEdBQVEsTUFEVjs7VUFFQSxJQUFHLElBQUssQ0FBQSxnQ0FBQSxDQUFMLEtBQTBDLENBQTdDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsZUFBQSxHQUFrQjtVQUNsQixhQUFBLEdBQWdCO1VBRWhCLElBQUcsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLEtBQVYsQ0FBQSxDQUFBLEdBQW9CLEdBQXZCO1lBQ0UsZUFBQSxHQUFrQjtZQUNsQixhQUFBLEdBQWdCLElBRmxCOztVQUdBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHFCQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsT0FBN0I7Y0FDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixDQUNmLENBQ0UsV0FBQSxDQUFZLElBQUksQ0FBQyxJQUFMLEdBQVksY0FBeEIsQ0FERixFQUVFLElBQUssQ0FBQSxpQ0FBQSxDQUZQLEVBR0UsSUFBSyxDQUFBLDRCQUFBLENBSFAsQ0FEZSxFQU1mLENBQ0UsUUFBQSxHQUFXLFdBQUEsQ0FBWSxJQUFJLENBQUMsSUFBTCxHQUFZLGVBQXhCLENBRGIsRUFFRSxJQUFLLENBQUEsNkJBQUEsQ0FGUCxFQUdFLElBQUssQ0FBQSxnQ0FBQSxDQUhQLENBTmUsQ0FBakI7Y0FZQSxTQUFBLEdBQWdCLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFyQixDQUFrQztnQkFBQSxjQUFBLEVBQWdCLEdBQWhCO2dCQUFzQixjQUFBLEVBQWdCLEdBQXRDO2VBQWxDO2NBQ2hCLFNBQVMsQ0FBQyxNQUFWLENBQWlCLFFBQWpCLEVBQTJCLENBQTNCO2NBQ0EsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsQ0FBM0I7Y0FDQSxPQUFBLEdBQ0U7Z0JBQUEsT0FBQSxFQUFRLGlGQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxXQUFBLEVBQWEsTUFSYjtnQkFTQSxRQUFBLEVBQVUsQ0FBQyxTQUFELEVBQVksU0FBWixDQVRWOztjQVVGLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsbUJBQXhCLENBQWpDO2NBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCO1lBaENXLENBQUYsQ0FBWCxFQWtDRyxJQWxDSDtVQURVO1VBb0NaLElBQUcsS0FBSDtZQUNFOzs7WUFHQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsU0FBekIsRUFKRjs7VUFLQSxZQUFhLENBQUEsbUJBQUEsQ0FBYixHQUFtQyxvQkF6RHJDOztRQTBEQSxJQUFHLENBQUksWUFBYSxDQUFBLHNCQUFBLENBQXBCO1VBQ0UsS0FBQSxHQUFRO1VBQ1IsSUFBRyxJQUFLLENBQUEsZ0NBQUEsQ0FBTCxLQUEwQyxDQUE3QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLGdCQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLG9DQURGLEVBRUUsSUFBSyxDQUFBLCtCQUFBLENBRlAsQ0FEZSxDQUFqQjtjQU1BLFNBQUEsR0FBZ0IsSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQXJCLENBQWtDO2dCQUFBLGNBQUEsRUFBZ0IsR0FBaEI7Z0JBQXNCLGNBQUEsRUFBZ0IsR0FBdEM7ZUFBbEM7Y0FDaEIsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsQ0FBM0I7Y0FDQSxPQUFBLEdBQ0U7Z0JBQUEsT0FBQSxFQUFRLHNCQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxLQUFBLEVBQU87a0JBQ04sWUFBQSxFQUFjLEtBRFI7aUJBUlA7Z0JBV0EsV0FBQSxFQUFhLE1BWGI7Z0JBWUEsUUFBQSxFQUFVLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FaVjs7Y0FhRixJQUFHLEtBQUg7Z0JBQ0UsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFyQixDQUFpQyxRQUFRLENBQUMsY0FBVCxDQUF3QixzQkFBeEIsQ0FBakM7Z0JBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCLEVBRkY7O1lBMUJXLENBQUYsQ0FBWCxFQThCRyxJQTlCSDtVQURVO1VBZ0NaOzs7VUFHQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsU0FBekI7VUFDQSxZQUFhLENBQUEsc0JBQUEsQ0FBYixHQUFzQyx1QkF4Q3hDOztBQTlERztBQXJCUCxXQTRITyxrQkE1SFA7UUE2SEksQ0FBQSxHQUFJO1FBQ0osQ0FBQSxJQUFLLGFBQUEsQ0FBYyxHQUFHLENBQUMsTUFBbEIsRUFBMEIsSUFBMUIsRUFBZ0MsU0FBVSxDQUFBLDhCQUFBLENBQTFDO1FBQ0wsV0FBVyxDQUFDLFVBQVosSUFBMEIsU0FBVSxDQUFBLHFDQUFBLENBQVYsQ0FBaUQ7VUFBQSxPQUFBLEVBQVMsQ0FBVDtTQUFqRDtRQUUxQixJQUFHLENBQUksWUFBYSxDQUFBLG1CQUFBLENBQWpCLElBQTBDLElBQUssQ0FBQSxVQUFBLENBQUwsS0FBb0IsaUJBQWpFO1VBQ0UsS0FBQSxHQUFRO1VBQ1IsSUFBRyxJQUFLLENBQUEsNkNBQUEsQ0FBTCxLQUF1RCxDQUExRDtZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHVCQUE3QjtjQUNBLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLE9BQTdCO2NBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsQ0FDZixDQUNFLG1CQURGLEVBRUUsQ0FBQSxHQUFJLElBQUssQ0FBQSw2Q0FBQSxDQUZYLENBRGUsRUFLZixDQUNFLE9BREYsRUFFRSxJQUFLLENBQUEsNkNBQUEsQ0FGUCxDQUxlLENBQWpCO2NBVUEsT0FBQSxHQUNFO2dCQUFBLE9BQUEsRUFBUSx1QkFBUjtnQkFDQSxnQkFBQSxFQUNDO2tCQUFBLFVBQUEsRUFBWSxFQUFaO2lCQUZEO2dCQUdBLFNBQUEsRUFDQztrQkFBQSxXQUFBLEVBQ0M7b0JBQUEsVUFBQSxFQUFZLEVBQVo7bUJBREQ7aUJBSkQ7Z0JBTUEsT0FBQSxFQUFTLGVBTlQ7Z0JBT0EsUUFBQSxFQUFVLEdBUFY7Z0JBUUEsTUFBQSxFQUFTLE1BUlQ7Z0JBU0EsUUFBQSxFQUFVLENBQUMsU0FBRCxFQUFZLFNBQVosQ0FUVjtnQkFVQSxRQUFBLEVBQVU7a0JBQUUsQ0FBQSxFQUFHO29CQUFDLE1BQUEsRUFBUSxHQUFUO21CQUFMO2lCQVZWO2dCQVdBLGVBQUEsRUFBaUIsRUFYakI7O2NBWUYsS0FBQSxHQUFZLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFyQixDQUE4QixRQUFRLENBQUMsY0FBVCxDQUF3QixtQkFBeEIsQ0FBOUI7Y0FDWixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsT0FBckI7WUE1QlcsQ0FBRixDQUFYLEVBOEJHLElBOUJIO1VBRFU7VUFnQ1osSUFBRyxLQUFIO1lBQ0U7OztZQUdBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixTQUF6QixFQUpGOztVQUtBLFlBQWEsQ0FBQSxtQkFBQSxDQUFiLEdBQW1DLG9CQXpDckM7O1FBMkNBLElBQUcsQ0FBSSxZQUFhLENBQUEsMEJBQUEsQ0FBakIsSUFBaUQsSUFBSyxDQUFBLFVBQUEsQ0FBTCxLQUFvQixpQkFBeEU7VUFDRSxLQUFBLEdBQVE7VUFFUixJQUFHLElBQUssQ0FBQSwwQkFBQSxDQUFMLEtBQW9DLENBQXZDO1lBQ0UsS0FBQSxHQUFRLE1BRFY7O1VBRUEsU0FBQSxHQUFZLFNBQUE7bUJBQ1YsVUFBQSxDQUFXLENBQUUsU0FBQTtBQUNYLGtCQUFBO2NBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2NBQ2YsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsWUFBN0I7Y0FDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixNQUE3QjtjQUNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLENBQ2YsQ0FDRSw2QkFERixFQUVFLElBQUssQ0FBQSwwQkFBQSxDQUZQLENBRGUsRUFLZixDQUNFLHNEQURGLEVBRUUsR0FGRixDQUxlLENBQWpCO2NBVUEsT0FBQSxHQUNFO2dCQUFBLE9BQUEsRUFBUSxlQUFSO2dCQUNBLGdCQUFBLEVBQ0M7a0JBQUEsVUFBQSxFQUFZLEVBQVo7aUJBRkQ7Z0JBR0EsU0FBQSxFQUNDO2tCQUFBLFdBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFERDtpQkFKRDtnQkFNQSxPQUFBLEVBQVMsZUFOVDtnQkFPQSxRQUFBLEVBQVUsR0FQVjtnQkFRQSxXQUFBLEVBQWEsTUFSYjtnQkFTQSxRQUFBLEVBQVUsQ0FBQyxTQUFELEVBQVksU0FBWixDQVRWO2dCQVVBLGlCQUFBLEVBQW1CLE1BVm5COztjQVdGLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsMEJBQXhCLENBQWpDO2NBQ1osS0FBSyxDQUFDLElBQU4sQ0FBVyxRQUFYLEVBQXFCLE9BQXJCO1lBM0JXLENBQUYsQ0FBWCxFQTZCRyxJQTdCSDtVQURVO1VBK0JaLElBQUcsS0FBSDtZQUNFOzs7WUFHQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsU0FBekIsRUFKRjs7VUFLQSxZQUFhLENBQUEsMEJBQUEsQ0FBYixHQUEwQywyQkF6QzVDOztRQTJDQSxJQUFHLENBQUksWUFBYSxDQUFBLCtCQUFBLENBQWpCLElBQXNELElBQUssQ0FBQSxVQUFBLENBQUwsS0FBb0IsaUJBQTdFO1VBQ0UsS0FBQSxHQUFRO1VBQ1IsSUFBRyxJQUFLLENBQUEsK0JBQUEsQ0FBTCxLQUF5QyxDQUE1QztZQUNFLEtBQUEsR0FBUSxNQURWOztVQUVBLFNBQUEsR0FBWSxTQUFBO21CQUNWLFVBQUEsQ0FBVyxDQUFFLFNBQUE7QUFDWCxrQkFBQTtjQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtjQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLFlBQTdCO2NBQ0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsTUFBN0I7Y0FDQSxRQUFRLENBQUMsT0FBVCxDQUFpQixDQUNmLENBQ0Usa0NBREYsRUFFRSxJQUFLLENBQUEsK0JBQUEsQ0FGUCxDQURlLEVBS2YsQ0FDRSw4REFERixFQUVFLEdBRkYsQ0FMZSxDQUFqQjtjQVVBLE9BQUEsR0FDRTtnQkFBQSxPQUFBLEVBQVEsb0JBQVI7Z0JBQ0EsZ0JBQUEsRUFDQztrQkFBQSxVQUFBLEVBQVksRUFBWjtpQkFGRDtnQkFHQSxTQUFBLEVBQ0M7a0JBQUEsV0FBQSxFQUNDO29CQUFBLFVBQUEsRUFBWSxFQUFaO21CQUREO2lCQUpEO2dCQU1BLE9BQUEsRUFBUyxlQU5UO2dCQU9BLFFBQUEsRUFBVSxHQVBWO2dCQVFBLFdBQUEsRUFBYSxNQVJiO2dCQVNBLFFBQUEsRUFBVSxDQUFDLFNBQUQsRUFBWSxTQUFaLENBVFY7Z0JBVUEsaUJBQUEsRUFBbUIsTUFWbkI7O2NBV0YsSUFBRyxLQUFIO2dCQUNFLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsK0JBQXhCLENBQWpDO2dCQUNaLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixPQUFyQixFQUZGOztZQTFCVyxDQUFGLENBQVgsRUE4QkcsSUE5Qkg7VUFEVTtVQWdDWjs7O1VBR0EsTUFBTSxDQUFDLGlCQUFQLENBQXlCLFNBQXpCO1VBQ0EsWUFBYSxDQUFBLCtCQUFBLENBQWIsR0FBK0MsZ0NBeENqRDs7QUEzRkc7QUE1SFAsV0FnUU8sc0JBaFFQO1FBaVFJLElBQUcsSUFBSSxDQUFDLG9CQUFSO1VBQ0UsQ0FBQSxHQUFJO1VBRUosQ0FBQSxJQUFLLHVCQUFBLENBQXdCLElBQUksQ0FBQyxvQkFBN0IsRUFBbUQsU0FBVSxDQUFBLGlDQUFBLENBQTdEO1VBQ0wsV0FBVyxDQUFDLFVBQVosSUFBMEIsU0FBVSxDQUFBLHlDQUFBLENBQVYsQ0FBcUQ7WUFBQSxPQUFBLEVBQVMsQ0FBVDtXQUFyRDtVQUUxQixJQUFHLENBQUksWUFBYSxDQUFBLG1CQUFBLENBQXBCO1lBQ0UsS0FBQSxHQUFRO1lBQ1IsSUFBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBMUIsS0FBb0MsQ0FBdkM7Y0FDRSxLQUFBLEdBQVEsTUFEVjs7WUFFQSxTQUFBLEdBQVksU0FBQTtxQkFDVixVQUFBLENBQVcsQ0FBRSxTQUFBO0FBQ1gsb0JBQUE7Z0JBQUEsUUFBQSxHQUFlLElBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFyQixDQUFBO2dCQUNmLFFBQVEsQ0FBQyxTQUFULENBQW1CLFFBQW5CLEVBQTZCLHlCQUE3QjtnQkFDQSxRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2QixPQUE3QjtnQkFFQSxJQUFBLEdBQU87QUFDUDtBQUFBLHFCQUFBLHdDQUFBOztrQkFDRSxJQUFHLENBQUMsSUFBSSxDQUFDLGFBQUwsS0FBc0IsVUFBdkIsQ0FBQSxJQUF1QyxDQUFDLElBQUksQ0FBQyxPQUFMLEtBQWtCLGdCQUFuQixDQUExQztvQkFFRSxDQUFBLEdBQUksQ0FDRixJQUFJLENBQUMsT0FESCxFQUVGLFFBQUEsQ0FBUyxJQUFJLENBQUMsVUFBZCxDQUZFO29CQUlKLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVixFQU5GOztBQURGO2dCQVNBLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO2dCQUNBLE9BQUEsR0FDRTtrQkFBQSxPQUFBLEVBQVEsZ0JBQVI7a0JBQ0EsZ0JBQUEsRUFDQztvQkFBQSxVQUFBLEVBQVksRUFBWjttQkFGRDtrQkFHQSxTQUFBLEVBQ0M7b0JBQUEsV0FBQSxFQUNDO3NCQUFBLFVBQUEsRUFBWSxFQUFaO3FCQUREO21CQUpEO2tCQU1BLE9BQUEsRUFBUyxhQU5UO2tCQU9BLFFBQUEsRUFBVSxHQVBWO2tCQVFBLGVBQUEsRUFBaUIsRUFSakI7a0JBU0EsMEJBQUEsRUFBNEIsR0FUNUI7a0JBVUEsYUFBQSxFQUFlLElBVmY7a0JBV0EsV0FBQSxFQUFZO29CQUNULEtBQUEsRUFBTSxLQURHO29CQUVULE1BQUEsRUFBTyxLQUZFO21CQVhaOztnQkFnQkYsSUFBRyxLQUFIO2tCQUNFLEtBQUEsR0FBWSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBckIsQ0FBOEIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsbUJBQXhCLENBQTlCO2tCQUNaLEtBQUssQ0FBQyxJQUFOLENBQVcsUUFBWCxFQUFxQixPQUFyQixFQUZGOztjQWpDVyxDQUFGLENBQVgsRUFxQ0csSUFyQ0g7WUFEVSxFQUpkOztVQTJDQSxJQUFHLEtBQUg7WUFDRTs7O1lBR0EsTUFBTSxDQUFDLGlCQUFQLENBQXlCLFNBQXpCLEVBSkY7O1VBS0EsWUFBYSxDQUFBLG1CQUFBLENBQWIsR0FBbUM7VUFDbkMsSUFBRyxDQUFJLFlBQWEsQ0FBQSx3QkFBQSxDQUFwQjtZQUNFLEtBQUEsR0FBUTtZQUNSLElBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQTFCLEtBQW9DLENBQXZDO2NBQ0UsS0FBQSxHQUFRLE1BRFY7O1lBRUEsU0FBQSxHQUFZLFNBQUE7cUJBQ1YsVUFBQSxDQUFXLENBQUUsU0FBQTtBQUNYLG9CQUFBO2dCQUFBLFFBQUEsR0FBZSxJQUFBLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBckIsQ0FBQTtnQkFDZixRQUFRLENBQUMsU0FBVCxDQUFtQixRQUFuQixFQUE2Qix5QkFBN0I7Z0JBQ0EsUUFBUSxDQUFDLFNBQVQsQ0FBbUIsUUFBbkIsRUFBNkIsT0FBN0I7Z0JBRUEsSUFBQSxHQUFPO0FBQ1A7QUFBQSxxQkFBQSx3Q0FBQTs7a0JBQ0UsSUFBRyxDQUFDLElBQUksQ0FBQyxhQUFMLEtBQXNCLGNBQXZCLENBQUEsSUFBMkMsQ0FBQyxJQUFJLENBQUMsT0FBTCxLQUFrQixvQkFBbkIsQ0FBOUM7b0JBRUUsQ0FBQSxHQUFJLENBQ0YsSUFBSSxDQUFDLE9BREgsRUFFRixRQUFBLENBQVMsSUFBSSxDQUFDLFVBQWQsQ0FGRTtvQkFJSixJQUFJLENBQUMsSUFBTCxDQUFVLENBQVYsRUFORjs7QUFERjtnQkFTQSxRQUFRLENBQUMsT0FBVCxDQUFpQixJQUFqQjtnQkFDQSxPQUFBLEdBQ0U7a0JBQUEsT0FBQSxFQUFRLG9CQUFSO2tCQUNBLGdCQUFBLEVBQ0M7b0JBQUEsVUFBQSxFQUFZLEVBQVo7bUJBRkQ7a0JBR0EsU0FBQSxFQUNDO29CQUFBLFdBQUEsRUFDQztzQkFBQSxVQUFBLEVBQVksRUFBWjtxQkFERDttQkFKRDtrQkFNQSxPQUFBLEVBQVMsYUFOVDtrQkFPQSxRQUFBLEVBQVUsR0FQVjtrQkFRQSxlQUFBLEVBQWlCLEVBUmpCO2tCQVNBLDBCQUFBLEVBQTRCLEdBVDVCO2tCQVVBLGFBQUEsRUFBZSxJQVZmO2tCQVdBLFdBQUEsRUFBWTtvQkFDVCxLQUFBLEVBQU0sS0FERztvQkFFVCxNQUFBLEVBQU8sS0FGRTttQkFYWjs7Z0JBZ0JGLElBQUcsS0FBSDtrQkFDRSxLQUFBLEdBQVksSUFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLFFBQXJCLENBQThCLFFBQVEsQ0FBQyxjQUFULENBQXdCLHdCQUF4QixDQUE5QjtrQkFDWixLQUFLLENBQUMsSUFBTixDQUFXLFFBQVgsRUFBcUIsT0FBckIsRUFGRjs7Y0FqQ1csQ0FBRixDQUFYLEVBcUNHLElBckNIO1lBRFUsRUFKZDs7VUEyQ0EsSUFBRyxLQUFIO1lBQ0U7OztZQUdBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixTQUF6QixFQUpGOztVQUtBLFlBQWEsQ0FBQSx3QkFBQSxDQUFiLEdBQXdDLHlCQXZHMUM7O0FBREc7QUFoUVA7UUEwV0ksV0FBVyxDQUFDLFVBQVosSUFBMEIsYUFBQSxDQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUEwQixJQUExQixFQUFnQyxTQUFVLENBQUEsOEJBQUEsQ0FBMUM7QUExVzlCO0lBNFdBLFdBQVcsQ0FBQyxVQUFaLElBQTBCLFNBQVUsQ0FBQSxvQkFBQSxDQUFWLENBQWdDLFdBQWhDO0FBbFg1QjtBQW1YQSxTQUFPLFNBQVUsQ0FBQSxtQkFBQSxDQUFWLENBQStCLFdBQS9CO0FBeFlLOztBQTJZZCxpQkFBQSxHQUFvQixTQUFDLEVBQUQ7QUFDbEIsTUFBQTtFQUFBLENBQUEsR0FBSTtBQUNKLE9BQUEsb0NBQUE7O0FBQ0U7QUFBQSxTQUFBLHVDQUFBOztNQUNFLENBQUUsQ0FBQSxLQUFBLENBQUYsR0FBVztBQURiO0FBREY7QUFHQSxTQUFPO0FBTFc7O0FBT3BCLGlCQUFBLEdBQW9CLFNBQUMsQ0FBRDtBQUNsQixNQUFBO0VBQUEsQ0FBQSxHQUFJO0FBQ0osT0FBQSxlQUFBO0lBQ0UsQ0FBRSxDQUFBLFVBQUEsQ0FBRixHQUFnQjtBQURsQjtBQUVBLFNBQU87QUFKVzs7QUFNcEIsc0JBQUEsR0FBeUIsU0FBQyxFQUFELEVBQUssQ0FBTDtBQUN2QixNQUFBO0VBQUEsYUFBQSxHQUFnQixpQkFBQSxDQUFrQixFQUFsQjtFQUNoQixhQUFBLEdBQWdCLGlCQUFBLENBQWtCLENBQWxCO0VBQ2hCLGtCQUFBLEdBQXFCO0FBQ3JCLE9BQUEsa0JBQUE7UUFBdUQsQ0FBSSxhQUFjLENBQUEsQ0FBQTtNQUF6RSxrQkFBa0IsQ0FBQyxJQUFuQixDQUF3QixDQUF4Qjs7QUFBQTtBQUNBLFNBQU87QUFMZ0I7O0FBUXpCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRCxFQUFZLElBQVo7QUFFeEIsTUFBQTs7SUFGeUIsU0FBTzs7RUFFaEMsQ0FBQSxHQUFJLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLEVBQWYsRUFBbUIsTUFBbkI7RUFDSixDQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQU0sT0FBTjtJQUNBLE1BQUEsRUFBUSxzQkFBQSxDQUF1QixDQUF2QixFQUEwQixJQUExQixDQURSOztFQUdGLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUDtBQUNBLFNBQU87QUFSaUI7O0FBYTFCLHVCQUFBLEdBQXdCLFNBQUMsS0FBRDtBQUN0QixNQUFBO0VBQUEsUUFBQSxHQUFTO0VBQ1QsSUFBQSxHQUFLO0VBRUwsWUFBQSxHQUFlLFNBQUMsT0FBRDtBQUNiLFFBQUE7SUFBQSxRQUFBLEdBQVU7QUFDVjtBQUFBLFNBQUEsNkNBQUE7O01BQUEsUUFBUyxDQUFBLFFBQUEsQ0FBVCxHQUFtQjtBQUFuQjtBQUNBLFdBQU87RUFITTtFQU1mLEdBQUEsR0FBTSxTQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLFFBQXJCO1dBQ0osTUFBTyxDQUFBLFFBQVMsQ0FBQSxVQUFBLENBQVQ7RUFESDtFQUlOLGFBQUEsR0FBZSxTQUFDLElBQUQ7QUFDYixRQUFBO0lBQUEsQ0FBQSxHQUFJO0FBQ0osU0FBQSxTQUFBO01BQ0UsR0FBQSxHQUFNO01BQ04sR0FBRyxDQUFDLElBQUosR0FBUztNQUNULEdBQUcsQ0FBQyxNQUFKLEdBQVcsSUFBSyxDQUFBLENBQUE7TUFDaEIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxHQUFQO0FBSkY7QUFLQSxXQUFPO0VBUE07RUFVZixRQUFBLEdBQVcsWUFBQSxDQUFhLEtBQUssQ0FBQyxRQUFuQjtFQUNYLGlCQUFBLEdBQW9CO0FBRXBCO0FBQUEsT0FBQSw2Q0FBQTs7SUFDRSxRQUFBLEdBQVcsR0FBQSxDQUFJLGtCQUFKLEVBQXdCLEdBQXhCLEVBQTZCLFFBQTdCO0lBRVgsU0FBQSxHQUFZLEdBQUEsQ0FBSSxZQUFKLEVBQWtCLEdBQWxCLEVBQXVCLFFBQXZCO0lBQ1osSUFBRyxDQUFJLFNBQVA7TUFBc0IsU0FBQSxHQUFZLEdBQUEsR0FBTSxNQUFBLENBQU8sRUFBRSxpQkFBVCxFQUF4Qzs7SUFDQSxVQUFXLENBQUEsR0FBQSxDQUFJLFlBQUosRUFBa0IsR0FBbEIsRUFBdUIsUUFBdkIsQ0FBQSxDQUFYLEdBQTRDLEdBQUEsQ0FBSSxhQUFKLEVBQW1CLEdBQW5CLEVBQXdCLFFBQXhCO0lBQzVDLGNBQWUsQ0FBQSxTQUFBLENBQWYsR0FBNEIsR0FBQSxDQUFJLFdBQUosRUFBaUIsR0FBakIsRUFBc0IsUUFBdEI7SUFDNUIsSUFBRyxRQUFIOztRQUNFLFFBQVMsQ0FBQSxRQUFBLElBQVc7O01BQ3BCLFFBQVMsQ0FBQSxRQUFBLENBQVMsQ0FBQyxJQUFuQixDQUF3QjtRQUFBLENBQUEsRUFBRyxHQUFBLENBQUksR0FBSixFQUFTLEdBQVQsRUFBYyxRQUFkLENBQUg7UUFBNEIsSUFBQSxFQUFNLFNBQWxDO1FBQTZDLElBQUEsRUFBTSxHQUFBLENBQUksTUFBSixFQUFZLEdBQVosRUFBaUIsUUFBakIsQ0FBbkQ7T0FBeEIsRUFGRjs7QUFQRjtFQVdBLFVBQUEsR0FBYSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVo7RUFDYixlQUFBLEdBQWtCO0FBQ2xCLE9BQUEsOENBQUE7O0lBQ0UsSUFBRyxDQUFJLGVBQWdCLENBQUEsUUFBQSxDQUF2QjtNQUNFLGVBQWdCLENBQUEsUUFBQSxDQUFoQixHQUE0QixRQUFTLENBQUEsUUFBQSxDQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFEcEQ7O0lBRUEsTUFBQSxHQUFTO0FBQ1Q7QUFBQSxTQUFBLHdDQUFBOztNQUNFLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWjtBQURGO0lBRUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxTQUFDLENBQUQsRUFBRyxDQUFIO0FBQ1YsYUFBTyxDQUFDLENBQUMsQ0FBRixHQUFNLENBQUMsQ0FBQztJQURMLENBQVo7SUFFQSxRQUFTLENBQUEsUUFBQSxDQUFULEdBQXFCO0FBUnZCO0VBVUEsZ0JBQUEsR0FBbUI7QUFDbkIsT0FBQSwyQkFBQTs7SUFDRSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQjtNQUFBLFFBQUEsRUFBVSxRQUFWO01BQW9CLENBQUEsRUFBRyxDQUF2QjtLQUF0QjtBQURGO0VBRUEsZ0JBQWdCLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNwQixXQUFPLENBQUMsQ0FBQyxDQUFGLEdBQU0sQ0FBQyxDQUFDO0VBREssQ0FBdEI7RUFHQSxXQUFBLEdBQWM7QUFDZCxPQUFBLG9EQUFBOztJQUNFLFdBQVksQ0FBQSxRQUFRLENBQUMsUUFBVCxDQUFaLEdBQWlDLFFBQVMsQ0FBQSxRQUFRLENBQUMsUUFBVDtBQUQ1QztFQUdBLElBQUEsR0FBTyxhQUFBLENBQWMsV0FBZDtBQUNQLFNBQU87QUE3RGU7O0FBZ0VsQjtFQUVKLFVBQUMsQ0FBQSxJQUFELEdBQVE7O0VBQ1IsVUFBQyxDQUFBLFNBQUQsR0FBYTs7RUFDYixVQUFDLENBQUEsSUFBRCxHQUFROztFQUNSLFVBQUMsQ0FBQSxNQUFELEdBQVU7O0VBRUUsb0JBQUE7QUFDVixRQUFBO0lBQUEsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUNSLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixZQUFBLEdBQWUsQ0FBQyxtQkFBRCxFQUFzQixvQkFBdEIsRUFBNEMsOEJBQTVDLEVBQTRFLGlDQUE1RSxFQUErRyw2QkFBL0csRUFBOEksa0NBQTlJLEVBQWtMLHFDQUFsTCxFQUF5Tix5Q0FBek4sRUFBb1Esc0JBQXBRO0lBQ2YsZ0JBQUEsR0FBbUIsQ0FBQyxjQUFEO0lBQ25CLElBQUMsQ0FBQSxTQUFELEdBQWE7QUFDYixTQUFBLHNEQUFBOztNQUNFLElBQUMsQ0FBQSxTQUFVLENBQUEsUUFBQSxDQUFYLEdBQXVCLFVBQVUsQ0FBQyxPQUFYLENBQW1CLENBQUEsQ0FBRSxHQUFBLEdBQU0sUUFBUixDQUFpQixDQUFDLElBQWxCLENBQUEsQ0FBbkI7QUFEekI7QUFFQSxTQUFBLDREQUFBOztNQUNFLFVBQVUsQ0FBQyxlQUFYLENBQTJCLFFBQTNCLEVBQXFDLENBQUEsQ0FBRSxHQUFBLEdBQU0sUUFBUixDQUFpQixDQUFDLElBQWxCLENBQUEsQ0FBckM7QUFERjtFQVJVOzt1QkFXWixZQUFBLEdBQWMsU0FBQyxXQUFELEVBQWMsV0FBZDtXQUNaLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUNFO01BQUEsTUFBQSxFQUFPLElBQVA7TUFDQSxJQUFBLEVBQUssV0FETDtNQUVBLE1BQUEsRUFBTyxTQUFDLEdBQUQ7UUFDTCxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsR0FBZTtlQUNmLFdBQUEsQ0FBWSxXQUFaLEVBQXlCLEdBQXpCLEVBQThCLElBQTlCLEVBQW9DLElBQUMsQ0FBQSxNQUFyQztNQUZLLENBRlA7TUFLQSxJQUFBLEVBQU0sU0FBQyxRQUFELEVBQVcsUUFBWDtRQUNKLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxRQUFBLENBQXRCO2lCQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLFFBQUEsQ0FBZixHQUEyQixDQUFDLFFBQUQsRUFEN0I7U0FBQSxNQUFBO2lCQUdFLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTyxDQUFBLFFBQUEsQ0FBUyxDQUFDLElBQXpCLENBQThCLFFBQTlCLEVBSEY7O01BREksQ0FMTjtNQVVBLFFBQUEsRUFBVSxTQUFDLFFBQUQ7QUFDUixZQUFBO1FBQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU8sQ0FBQSxRQUFBLENBQWxCO0FBQ0U7QUFBQTtlQUFBLDZDQUFBOzt5QkFDRSxDQUFBLENBQUUsUUFBRixFQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBcEI7QUFERjt5QkFERjs7TUFEUSxDQVZWO0tBREY7RUFEWTs7dUJBaUJkLGFBQUEsR0FBYyxTQUFDLGFBQUQsRUFBZ0IsR0FBaEI7V0FDWixDQUFDLENBQUMsSUFBRixDQUNFO01BQUEsR0FBQSxFQUFLLEdBQUw7TUFDQSxRQUFBLEVBQVUsTUFEVjtNQUVBLEtBQUEsRUFBTyxJQUZQO01BR0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxhQUFEO2lCQUNQLEtBQUMsQ0FBQSxZQUFELENBQWMsYUFBZCxFQUE2QixhQUE3QjtRQURPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhUO0tBREY7RUFEWTs7dUJBUWQsb0JBQUEsR0FBcUIsU0FBQyxhQUFELEVBQWdCLEdBQWhCO1dBQ25CLENBQUMsQ0FBQyxJQUFGLENBQ0U7TUFBQSxHQUFBLEVBQUssR0FBTDtNQUNBLFFBQUEsRUFBVSxNQURWO01BRUEsS0FBQSxFQUFPLElBRlA7TUFHQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGFBQUQ7QUFDUCxjQUFBO1VBQUEsQ0FBQSxHQUFJLHVCQUFBLENBQXdCLGFBQXhCO2lCQUNKLEtBQUMsQ0FBQSxZQUFELENBQWMsYUFBZCxFQUE2QixDQUE3QjtRQUZPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhUO0tBREY7RUFEbUI7O3VCQVVyQixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7QUFBQztBQUFBO1NBQUEscUNBQUE7O21CQUFBLENBQUMsQ0FBQztBQUFGOztFQURROzt1QkFHWCxpQkFBQSxHQUFtQixTQUFDLElBQUQ7QUFDakIsUUFBQTtBQUFBO0FBQUEsU0FBQSw2Q0FBQTs7TUFDRSxJQUFHLENBQUMsQ0FBQyxJQUFGLEtBQVUsSUFBYjtRQUF1QixFQUF2Qjs7QUFERjtBQUVBLFdBQU8sQ0FBQztFQUhTOzt1QkFLbkIsUUFBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLElBQU47SUFDUixJQUFJLEdBQUEsS0FBTyxDQUFDLENBQVo7QUFBb0IsYUFBUSxHQUE1Qjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFUO0FBQ0UsYUFBTyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsRUFEVDtLQUFBLE1BQUE7QUFHRSxhQUFPLEdBSFQ7O0VBSFE7O3VCQVFWLFFBQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxRQUFOO0lBQ1IsSUFBRyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBVDthQUNFLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsUUFBWCxDQUFvQixRQUFwQixFQURGOztFQURROzs7Ozs7QUFJWixNQUFNLENBQUMsT0FBUCxHQUFpQjs7Ozs7QUMvc0JqQixJQUFBOztBQUFBLENBQUEsQ0FBRSxTQUFBO0VBTUEsTUFBTSxDQUFDLHFCQUFQLEdBQStCO1NBQy9CLE1BQU0sQ0FBQyx3QkFBUCxHQUFrQztBQVBsQyxDQUFGOztBQVNBLHFCQUFBLEdBQXNCLFNBQUMsQ0FBRDtBQUNwQixNQUFBO0VBQUEsWUFBQSxHQUFlLENBQUMsQ0FBQyxPQUFGLENBQVUsZUFBVixFQUEwQixJQUExQjtTQUNmLENBQUMsQ0FBQyxPQUFGLENBQVUsc0RBQUEsR0FBdUQsWUFBdkQsR0FBb0UsbUNBQTlFLEVBQWtILFNBQUMsSUFBRDtJQUNoSCxDQUFBLENBQUUsaUJBQUYsQ0FBb0IsQ0FBQyxJQUFyQixDQUEwQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQXJDO0lBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUE1QztJQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFzQixDQUFDLElBQXZCLENBQTRCLHNCQUE1QixDQUFtRCxDQUFDLElBQXBELENBQXlELE1BQXpELEVBQWlFLFNBQUE7YUFBSSwwQkFBQSxHQUE2QixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLE1BQWI7SUFBakMsQ0FBakU7V0FDQSxDQUFBLENBQUUsbUJBQUYsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixHQUE1QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLFFBQXRDLEVBQWdELFFBQWhEO0VBSmdILENBQWxIO0FBRm9COztBQVF0Qix3QkFBQSxHQUEwQixTQUFBO1NBQ3hCLEtBQUEsQ0FBTSxpQkFBTjtBQUR3Qjs7QUFHMUIsTUFBTSxDQUFDLE9BQVAsR0FDRTtFQUFBLHFCQUFBLEVBQXNCLHFCQUF0QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJib3VuZHNfdGltZW91dD11bmRlZmluZWRcblxuXG5tYXAgPSBuZXcgR01hcHNcbiAgZWw6ICcjZ292bWFwJ1xuICBsYXQ6IDM3LjNcbiAgbG5nOiAtMTE5LjNcbiAgem9vbTogNlxuICBtaW5ab29tOiA2XG4gIHNjcm9sbHdoZWVsOiB0cnVlXG4gIHBhbkNvbnRyb2w6IGZhbHNlXG4gIHpvb21Db250cm9sOiB0cnVlXG4gIHpvb21Db250cm9sT3B0aW9uczpcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxuXG5tYXAubWFwLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5SSUdIVF9UT1BdLnB1c2goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xlZ2VuZCcpKVxuXG5yZXJlbmRlcl9tYXJrZXJzID0gLT5cbiAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gR09WV0lLSS5tYXJrZXJzXG5cbnJlYnVpbGRfZmlsdGVyID0gLT5cbiAgaGFyZF9wYXJhbXMgPSBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yID0gW11cbiAgJCgnLnR5cGVfZmlsdGVyJykuZWFjaCAoaW5kZXgsIGVsZW1lbnQpIC0+XG4gICAgaWYgJChlbGVtZW50KS5hdHRyKCduYW1lJykgaW4gaGFyZF9wYXJhbXMgYW5kICQoZWxlbWVudCkudmFsKCkgPT0gJzEnXG4gICAgICBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlcl8yLnB1c2ggJChlbGVtZW50KS5hdHRyKCduYW1lJylcblxuIyBsZWdlbmRUeXBlID0gY2l0eSwgc2Nob29sIGRpc3RyaWN0LCBzcGVjaWFsIGRpc3RyaWN0LCBjb3VudGllc1xuZ2V0X3JlY29yZHMyID0gKGxlZ2VuZFR5cGUsIG9uc3VjY2VzcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOlwiaHR0cDovLzQ1LjU1LjAuMTQ1L2FwaS9nb3Zlcm5tZW50L2dldC1tYXJrZXJzLWRhdGFcIlxuICAgIGRhdGE6IHsgYWx0VHlwZXM6IGxlZ2VuZFR5cGUgfVxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG4kIC0+XG5cbiAgcmVidWlsZF9maWx0ZXIoKVxuICBnZXRfcmVjb3JkczIgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXJfMiwgKGRhdGEpIC0+XG4gICAgR09WV0lLSS5tYXJrZXJzID0gZGF0YTtcbiAgICByZXJlbmRlcl9tYXJrZXJzKClcblxuICAkKCcjbGVnZW5kIGxpOm5vdCguY291bnRpZXMtdHJpZ2dlciknKS5vbiAnY2xpY2snLCAtPlxuICAgICQodGhpcykudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgaGlkZGVuX2ZpZWxkID0gJCh0aGlzKS5maW5kKCdpbnB1dCcpXG4gICAgdmFsdWUgPSBoaWRkZW5fZmllbGQudmFsKClcbiAgICBoaWRkZW5fZmllbGQudmFsKGlmIHZhbHVlID09ICcxJyB0aGVuICcwJyBlbHNlICcxJylcbiAgICByZWJ1aWxkX2ZpbHRlcigpXG4gICAgbWFwLnJlbW92ZU1hcmtlcnMoKVxuICAgIHJlcmVuZGVyX21hcmtlcnMoKVxuXG4gICQoJyNsZWdlbmQgbGkuY291bnRpZXMtdHJpZ2dlcicpLm9uICdjbGljaycsIC0+XG4gICAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgICBpZiAkKHRoaXMpLmhhc0NsYXNzKCdhY3RpdmUnKSB0aGVuIEdPVldJS0kuZ2V0X2NvdW50aWVzIEdPVldJS0kuZHJhd19wb2x5Z29ucyBlbHNlIG1hcC5yZW1vdmVQb2x5Z29ucygpXG5cblxuXG5cbmdldF9pY29uID0oYWx0X3R5cGUpIC0+XG5cbiAgX2NpcmNsZSA9KGNvbG9yKS0+XG4gICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEVcbiAgICBmaWxsT3BhY2l0eTogMVxuICAgIGZpbGxDb2xvcjpjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOid3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTo2XG5cbiAgc3dpdGNoIGFsdF90eXBlXG4gICAgd2hlbiAnQ2l0eScgdGhlbiByZXR1cm4gX2NpcmNsZSAncmVkJ1xuICAgIHdoZW4gJ1NjaG9vbCBEaXN0cmljdCcgdGhlbiByZXR1cm4gX2NpcmNsZSAnbGlnaHRibHVlJ1xuICAgIHdoZW4gJ1NwZWNpYWwgRGlzdHJpY3QnIHRoZW4gcmV0dXJuIF9jaXJjbGUgJ3B1cnBsZSdcbiAgICBlbHNlIHJldHVybiBfY2lyY2xlICd3aGl0ZSdcblxuaW5fYXJyYXkgPSAobXlfaXRlbSwgbXlfYXJyYXkpIC0+XG4gIGZvciBpdGVtIGluIG15X2FycmF5XG4gICAgcmV0dXJuIHRydWUgaWYgaXRlbSA9PSBteV9pdGVtXG4gIGZhbHNlXG5cblxuYWRkX21hcmtlciA9IChyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIGV4aXN0ID0gaW5fYXJyYXkgcmVjLmFsdFR5cGUsIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXzJcbiAgaWYgZXhpc3QgaXMgZmFsc2UgdGhlbiByZXR1cm4gZmFsc2VcbiAgbWFwLmFkZE1hcmtlclxuICAgIGxhdDogcmVjLmxhdGl0dWRlXG4gICAgbG5nOiByZWMubG9uZ2l0dWRlXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmFsdFR5cGUpXG4gICAgdGl0bGU6ICBcIiN7cmVjLm5hbWV9LCAje3JlYy50eXBlfVwiXG4gICAgaW5mb1dpbmRvdzpcbiAgICAgIGNvbnRlbnQ6IFwiXG4gICAgICAgIDxkaXY+PGEgaHJlZj0namF2YXNjcmlwdDp2b2lkKDApOycgY2xhc3M9J2luZm8td2luZG93LXVyaScgZGF0YS11cmk9Jy8je3JlYy5hbHRUeXBlU2x1Z30vI3tyZWMuc2x1Z30nPjxzdHJvbmc+I3tyZWMubmFtZX08L3N0cm9uZz48L2E+PC9kaXY+XG4gICAgICAgIDxkaXY+ICN7cmVjLnR5cGV9ICAje3JlYy5jaXR5fSAje3JlYy56aXB9ICN7cmVjLnN0YXRlfTwvZGl2PlwiXG5cblxuIyBHRU9DT0RJTkcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5waW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cbiAgR01hcHMuZ2VvY29kZVxuICAgIGFkZHJlc3M6IGFkZHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cbiAgICAgIGlmIHN0YXR1cyA9PSAnT0snXG4gICAgICAgIGxhdGxuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxuICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgbGF0OiBsYXRsbmcubGF0KClcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxuICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICB0aXRsZTogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICBjb250ZW50OiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG5cbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgbWFwOiBtYXBcbiIsIlxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXR5cGVcIj57e3tnb3ZfdHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBnb3ZzX2FycmF5ID0gW11cblxuICBjb3VudF9nb3ZzIDogKCkgLT5cbiAgICBjb3VudCA9MFxuICAgIGZvciBkIGluIEBnb3ZzX2FycmF5XG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgY291bnQrK1xuICAgIHJldHVybiBjb3VudFxuXG5cbiAgc3RhcnRTdWdnZXN0aW9uIDogKGdvdnMpID0+XG4gICAgI0Bnb3ZzX2FycmF5ID0gZ292c1xuICAgIEBnb3ZzX2FycmF5ID0gZ292cy5yZWNvcmRcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcblxuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAsIDEwMDBcblxuICAgICQoQGh0bWxfc2VsZWN0b3IpLnR5cGVhaGVhZChcbiAgICAgICAgaGludDogZmFsc2VcbiAgICAgICAgaGlnaGxpZ2h0OiBmYWxzZVxuICAgICAgICBtaW5MZW5ndGg6IDFcbiAgICAgICAgY2xhc3NOYW1lczpcbiAgICAgICAgXHRtZW51OiAndHQtZHJvcGRvd24tbWVudSdcbiAgICAgICxcbiAgICAgICAgbmFtZTogJ2dvdl9uYW1lJ1xuICAgICAgICBkaXNwbGF5S2V5OiAnZ292X25hbWUnXG4gICAgICAgIHNvdXJjZTogcXVlcnlfbWF0Y2hlcihAZ292c19hcnJheSwgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICMgJCgnLmdvdi1jb3VudGVyJykudGV4dCBAY291bnRfZ292cygpXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIiMjI1xuZmlsZTogbWFpbi5jb2ZmZSAtLSBUaGUgZW50cnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgOlxuZ292X2ZpbmRlciA9IG5ldyBHb3ZGaW5kZXJcbmdvdl9kZXRhaWxzID0gbmV3IEdvdkRldGFpbHNcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5Hb3ZTZWxlY3RvciA9IHJlcXVpcmUgJy4vZ292c2VsZWN0b3IuY29mZmVlJ1xuI19qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG53aWtpcGVkaWEgPSByZXF1aXJlICcuL3dpa2lwZWRpYS5jb2ZmZWUnXG5cbmdvdm1hcCA9IG51bGxcbmdvdl9zZWxlY3RvciA9IG51bGxcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5hY3RpdmVfdGFiID0gXCJcIlxudW5kZWYgPSBudWxsXG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgJ2lmX2VxJywgKGEsIGIsIG9wdHMpIC0+XG4gICAgaWYgYGEgPT0gYmBcbiAgICAgICAgcmV0dXJuIG9wdHMuZm4gdGhpc1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIG9wdHMuaW52ZXJzZSB0aGlzXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgICBzdGF0ZV9maWx0ZXI6ICcnXG4gICAgZ292X3R5cGVfZmlsdGVyOiAnJ1xuICAgIGdvdl90eXBlX2ZpbHRlcl8yOiBbJ0NpdHknLCAnU2Nob29sIERpc3RyaWN0JywgJ1NwZWNpYWwgRGlzdHJpY3QnXVxuXG4gICAgc2hvd19zZWFyY2hfcGFnZTogKCkgLT5cbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaEljb24nKS5oaWRlKClcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgIGZvY3VzX3NlYXJjaF9maWVsZCA1MDBcblxuICAgIHNob3dfZGF0YV9wYWdlOiAoKSAtPlxuICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLmZhZGVJbigzMDApXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcblxuR09WV0lLSS5nZXRfY291bnRpZXMgPSBnZXRfY291bnRpZXMgPSAoY2FsbGJhY2spIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJy9sZWdhY3kvZGF0YS9jb3VudHlfZ2VvZ3JhcGh5X2NhXzIuanNvbidcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoY291bnRpZXNKU09OKSAtPlxuICAgICAgICAgICAgY2FsbGJhY2sgY291bnRpZXNKU09OXG5cbkdPVldJS0kuZHJhd19wb2x5Z29ucyA9IGRyYXdfcG9seWdvbnMgPSAoY291bnRpZXNKU09OKSAtPlxuICAgIGZvciBjb3VudHkgaW4gY291bnRpZXNKU09OLmZlYXR1cmVzXG4gICAgICAgIGRvIChjb3VudHkpID0+XG4gICAgICAgICAgICBnb3ZtYXAubWFwLmRyYXdQb2x5Z29uKHtcbiAgICAgICAgICAgICAgICBwYXRoczogY291bnR5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzXG4gICAgICAgICAgICAgICAgdXNlR2VvSlNPTjogdHJ1ZVxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnIzgwODA4MCdcbiAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAwLjZcbiAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDEuNVxuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyNGRjAwMDAnXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDAuMTVcbiAgICAgICAgICAgICAgICBjb3VudHlJZDogY291bnR5LnByb3BlcnRpZXMuX2lkXG4gICAgICAgICAgICAgICAgYWx0TmFtZTogY291bnR5LnByb3BlcnRpZXMuYWx0X25hbWVcbiAgICAgICAgICAgICAgICBtYXJrZXI6IG5ldyBNYXJrZXJXaXRoTGFiZWwoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZygwLCAwKSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcmFpc2VPbkRyYWc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IGdvdm1hcC5tYXAubWFwLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbENvbnRlbnQ6IGNvdW50eS5wcm9wZXJ0aWVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoLTE1LCAyNSksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsQ2xhc3M6IFwibGFiZWwtdG9vbHRpcFwiLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbFN0eWxlOiB7b3BhY2l0eTogMS4wfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogXCJodHRwOi8vcGxhY2Vob2xkLml0LzF4MVwiLFxuICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgbW91c2VvdmVyOiAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldE9wdGlvbnMoe2ZpbGxDb2xvcjogXCIjMDBGRjAwXCJ9KVxuICAgICAgICAgICAgICAgIG1vdXNlbW92ZTogKGV2ZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcmtlci5zZXRQb3NpdGlvbihldmVudC5sYXRMbmcpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyLnNldFZpc2libGUodHJ1ZSlcbiAgICAgICAgICAgICAgICBtb3VzZW91dDogLT5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRPcHRpb25zKHtmaWxsQ29sb3I6IFwiI0ZGMDAwMFwifSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXJrZXIuc2V0VmlzaWJsZShmYWxzZSlcbiAgICAgICAgICAgICAgICBjbGljazogLT5cbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgIHVyaSA9IFwiLyN7Y291bnR5LmFsdF90eXBlX3NsdWd9LyN7Y291bnR5LnByb3BlcnRpZXMuc2x1Z31cIlxuICAgICAgICAgICAgICAgICAgICAkLmFqYXhcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZ292cykgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlZF9nb3ZfdGVtcGxhdGUgPSB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZ292cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJpXG4gICAgICAgICAgICB9KVxuXG53aW5kb3cucmVtZW1iZXJfdGFiID0gKG5hbWUpLT4gYWN0aXZlX3RhYiA9IG5hbWVcblxuJChkb2N1bWVudCkub24gJ2NsaWNrJywgJyNmaWVsZFRhYnMgYScsIChlKSAtPlxuICAgIGFjdGl2ZV90YWIgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgndGFibmFtZScpXG4gICAgY29uc29sZS5sb2cgYWN0aXZlX3RhYlxuICAgICQoXCIjdGFic0NvbnRlbnQgLnRhYi1wYW5lXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpXG4gICAgJCgkKGUuY3VycmVudFRhcmdldCkuYXR0cignaHJlZicpKS5hZGRDbGFzcyhcImFjdGl2ZVwiKVxuICAgIHRlbXBsYXRlcy5hY3RpdmF0ZSAwLCBhY3RpdmVfdGFiXG5cbiAgICBpZiBhY3RpdmVfdGFiID09ICdGaW5hbmNpYWwgU3RhdGVtZW50cydcbiAgICAgICAgZmluVmFsV2lkdGhNYXgxID0gMFxuICAgICAgICBmaW5WYWxXaWR0aE1heDIgPSAwXG4gICAgICAgIGZpblZhbFdpZHRoTWF4MyA9IDBcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIxXCJdJykuZmluZCgnLmZpbi12YWwnKS5lYWNoICgpIC0+XG4gICAgICAgICAgICB0aGlzRmluVmFsV2lkdGggPSAkKHRoaXMpLndpZHRoKClcblxuICAgICAgICAgICAgaWYgdGhpc0ZpblZhbFdpZHRoID4gZmluVmFsV2lkdGhNYXgxXG4gICAgICAgICAgICAgICAgZmluVmFsV2lkdGhNYXgxID0gdGhpc0ZpblZhbFdpZHRoXG5cbiAgICAgICAgJCgnLmZpbi12YWx1ZXMtYmxvY2sgW2RhdGEtY29sPVwiMlwiXScpLmZpbmQoJy5maW4tdmFsJykuZWFjaCAoKSAtPlxuICAgICAgICAgICAgdGhpc0ZpblZhbFdpZHRoID0gJCh0aGlzKS53aWR0aCgpXG5cbiAgICAgICAgICAgIGlmIHRoaXNGaW5WYWxXaWR0aCA+IGZpblZhbFdpZHRoTWF4MlxuICAgICAgICAgICAgICAgIGZpblZhbFdpZHRoTWF4MiA9IHRoaXNGaW5WYWxXaWR0aFxuXG4gICAgICAgICQoJy5maW4tdmFsdWVzLWJsb2NrIFtkYXRhLWNvbD1cIjNcIl0nKS5maW5kKCcuZmluLXZhbCcpLmVhY2ggKCkgLT5cbiAgICAgICAgICAgIHRoaXNGaW5WYWxXaWR0aCA9ICQodGhpcykud2lkdGgoKVxuXG4gICAgICAgICAgICBpZiB0aGlzRmluVmFsV2lkdGggPiBmaW5WYWxXaWR0aE1heDNcbiAgICAgICAgICAgICAgICBmaW5WYWxXaWR0aE1heDMgPSB0aGlzRmluVmFsV2lkdGhcblxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIxXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MSArIDI3KVxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIyXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MiArIDI3KVxuICAgICAgICAkKCcuZmluLXZhbHVlcy1ibG9jayBbZGF0YS1jb2w9XCIzXCJdIC5jdXJyZW5jeS1zaWduJykuY3NzKCdyaWdodCcsIGZpblZhbFdpZHRoTWF4MyArIDI3KVxuXG5cbiQoZG9jdW1lbnQpLnRvb2x0aXAoe3NlbGVjdG9yOiBcIltjbGFzcz0nbWVkaWEtdG9vbHRpcCddXCIsIHRyaWdnZXI6ICdjbGljayd9KVxuXG5hY3RpdmF0ZV90YWIgPSAoKSAtPlxuICAgICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdldF9yZWNvcmQyID0gKHJlY2lkKSAtPlxuIyBjbGVhciB3aWtpcGVkaWEgcGxhY2VcbiAgICAkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKFwiXCIpXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICBoZWFkZXJzOiB7XCJYLURyZWFtRmFjdG9yeS1BcHBsaWNhdGlvbi1OYW1lXCI6IFwiZ292d2lraVwifVxuICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgIGlmIGRhdGFcbiAgICAgICAgICAgICAgICBnZXRfZmluYW5jaWFsX3N0YXRlbWVudHMgZGF0YS5faWQsIChkYXRhMiwgdGV4dFN0YXR1cywganFYSFIpIC0+XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMgPSBkYXRhMlxuICAgICAgICAgICAgICAgICAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgZGF0YS5faWQsIDI1LCAoZGF0YTMsIHRleHRTdGF0dXMyLCBqcVhIUjIpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzID0gZGF0YTNcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldF9tYXhfcmFua3MgKG1heF9yYW5rc19yZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm1heF9yYW5rcyA9IG1heF9yYW5rc19yZXNwb25zZS5yZWNvcmRbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjVE9ETzogRW5hYmxlIGFmdGVyIHJlYWxpemUgbWF4X3JhbmtzIGFwaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgI2NvbnNvbGUubG9nIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlX3RhYigpXG5cbiAgICAgICAgICAgICMgZmlsbCB3aWtpcGVkaWEgcGxhY2VcbiAgICAgICAgICAgICN3cG4gPSBkYXRhLndpa2lwZWRpYV9wYWdlX25hbWVcbiAgICAgICAgICAgICMkKFwiI3dpa2lwZWRpYUNvbnRhaW5lclwiKS5odG1sKGlmIHdwbiB0aGVuIHdwbiBlbHNlIFwiTm8gV2lraXBlZGlhIGFydGljbGVcIilcblxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfZWxlY3RlZF9vZmZpY2lhbHMgPSAoYWx0X3R5cGUsIGdvdl9uYW1lLCBvbnN1Y2Nlc3MpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzkvYXBpL2dvdmVybm1lbnQvXCIgKyBhbHRfdHlwZSArICcvJyArIGdvdl9uYW1lXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzID0gKGdvdl9pZCwgb25zdWNjZXNzKSAtPlxuICAgICQuYWpheFxuICAgICAgICB1cmw6IFwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvX3Byb2MvZ2V0X2ZpbmFuY2lhbF9zdGF0ZW1lbnRzXCJcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGFwcF9uYW1lOiBcImdvdndpa2lcIlxuICAgICAgICAgICAgb3JkZXI6IFwiY2FwdGlvbl9jYXRlZ29yeSxkaXNwbGF5X29yZGVyXCJcbiAgICAgICAgICAgIHBhcmFtczogW1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiZ292c19pZFwiXG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZTogXCJJTlwiXG4gICAgICAgICAgICAgICAgdmFsdWU6IGdvdl9pZFxuICAgICAgICAgICAgXVxuXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5nZXRfbWF4X3JhbmtzID0gKG9uc3VjY2VzcykgLT5cbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiAnaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvbWF4X3JhbmtzJ1xuICAgICAgICBkYXRhOlxuICAgICAgICAgICAgYXBwX25hbWU6ICdnb3Z3aWtpJ1xuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuXG53aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCA9IChyZWMpPT5cbiAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIHJlYylcbiAgICBhY3RpdmF0ZV90YWIoKVxuICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgIHJvdXRlci5uYXZpZ2F0ZShyZWMuX2lkKVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkMiA9IChyZWMpPT5cbiAgICBnZXRfZWxlY3RlZF9vZmZpY2lhbHMgcmVjLmFsdFR5cGVTbHVnLCByZWMuc2x1ZywgKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSAtPlxuICAgICAgICByZWMuZWxlY3RlZF9vZmZpY2lhbHMgPSBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICAgICAgICAjZ2V0X3JlY29yZDIgcmVjLmlkXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuICAgICAgICB1cmwgPSByZWMuYWx0VHlwZVNsdWcgKyAnLycgKyByZWMuc2x1Z1xuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9IHVybFxuXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUpIC0+XG4gICAgJC5hamF4XG4gICAgICAgIHVybDogJ2h0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9ydW5Db21tYW5kP2FwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeSdcbiAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgdmFsdWVzID0gZGF0YS52YWx1ZXNcbiAgICAgICAgICAgIGJ1aWxkX3NlbGVjdF9lbGVtZW50IGNvbnRhaW5lciwgdGV4dCwgdmFsdWVzLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBlcnJvcjogKGUpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlKSAtPlxuICAgIHMgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heHdpZHRoOjE2MHB4Oyc+PG9wdGlvbiB2YWx1ZT0nJz4je3RleHR9PC9vcHRpb24+XCJcbiAgICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgICBzICs9IFwiPC9zZWxlY3Q+XCJcbiAgICBzZWxlY3QgPSAkKHMpXG4gICAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG5cbiAgICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgICBpZiB0ZXh0IGlzICdTdGF0ZS4uJ1xuICAgICAgICBzZWxlY3QudmFsICdDQSdcbiAgICAgICAgd2luZG93LkdPVldJS0kuc3RhdGVfZmlsdGVyID0gJ0NBJ1xuXG4gICAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICAgICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgICAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9ICgpIC0+XG4gICAgaW5wID0gJCgnI215aW5wdXQnKVxuICAgIHBhciA9ICQoJyN0eXBlYWhlZC1jb250YWluZXInKVxuICAgIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cbnN0YXJ0X2FkanVzdGluZ190eXBlYWhlYWRfd2lkdGggPSAoKSAtPlxuICAgICQod2luZG93KS5yZXNpemUgLT5cbiAgICAgICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICAgIHNldFRpbWVvdXQgKC0+ICQoJyNteWlucHV0JykuZm9jdXMoKSksIG1zZWNcblxuXG4jIHF1aWNrIGFuZCBkaXJ0eSBmaXggZm9yIGJhY2sgYnV0dG9uIGluIGJyb3dzZXJcbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoZSkgLT5cbiAgICBoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBpZiBub3QgaFxuICAgICAgICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5yb3V0ZSA9IGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKChpdG0pLT4gaWYgaXRtIGlzbnQgXCJcIiB0aGVuIGl0bSBlbHNlIGZhbHNlKTtcbnJvdXRlVHlwZSA9IHJvdXRlLmxlbmd0aDtcblxuR09WV0lLSS5oaXN0b3J5ID0gKGluZGV4KSAtPlxuICAgIGlmIGluZGV4ID09IDBcbiAgICAgICAgc2VhcmNoQ29udGFpbmVyID0gJCgnI3NlYXJjaENvbnRhaW5lcicpLnRleHQoKTtcbiAgICAgICAgaWYoc2VhcmNoQ29udGFpbmVyICE9ICcnKVxuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlIHt9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgJy8nXG4gICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICAgICAgICAgJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lID0gJy8nXG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5zaG93KClcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgKGhpc3Rvcnkuc3RhdGUgIT0gbnVsbCAmJiBoaXN0b3J5LnN0YXRlLnRlbXBsYXRlICE9IHVuZGVmaW5lZClcbiAgICAgICAgd2luZG93Lmhpc3RvcnkuZ28oaW5kZXgpO1xuICAgIGVsc2VcbiAgICAgICAgcm91dGUucG9wKClcbiAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUgPSAnLycgKyByb3V0ZS5qb2luKCcvJylcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3BvcHN0YXRlJywgKGV2ZW50KSAtPlxuICAgIGlmIHdpbmRvdy5oaXN0b3J5LnN0YXRlIGlzbnQgbnVsbFxuICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgZXZlbnQuc3RhdGUudGVtcGxhdGVcbiAgICAgICAgcm91dGUgPSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmxlbmd0aC0xO1xuICAgICAgICBpZiByb3V0ZSBpcyAyIHRoZW4gJCgnI3N0YW50b25JY29uJykuaGlkZSgpXG4gICAgICAgIGlmIHJvdXRlIGlzIDEgdGhlbiAkKCcjc2VhcmNoQ29udGFpbmVyJykuc2hvdygpXG4gICAgZWxzZVxuICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuXG4jIFJlZnJlc2ggRGlzcXVzIHRocmVhZFxucmVmcmVzaF9kaXNxdXMgPSAobmV3SWRlbnRpZmllciwgbmV3VXJsLCBuZXdUaXRsZSkgLT5cbiAgICBESVNRVVMucmVzZXRcbiAgICAgICAgcmVsb2FkOiB0cnVlLFxuICAgICAgICBjb25maWc6ICgpIC0+XG4gICAgICAgICAgICB0aGlzLnBhZ2UuaWRlbnRpZmllciA9IG5ld0lkZW50aWZpZXJcbiAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBuZXdVcmxcbiAgICAgICAgICAgIHRoaXMucGFnZS50aXRsZSA9IG5ld1RpdGxlXG5cbiQoJyNkYXRhQ29udGFpbmVyJykub24gJ2NsaWNrJywgJy5lbGVjdGVkX2xpbmsnLCAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdXJsID0gZS5jdXJyZW50VGFyZ2V0LnBhdGhuYW1lXG4gICAgJCgnI2RldGFpbHMnKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICQoJyNzdGFudG9uSWNvbicpLnNob3coKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgalF1ZXJ5LmdldCB1cmwsIHt9LCAoZGF0YSkgLT5cbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgdXJsLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbiA9IGRhdGFbMF1cblxuICAgICAgICAgICAgICAgICAgICBpZiAkLmlzRW1wdHlPYmplY3QocGVyc29uKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmNzcyh7XCJ0ZXh0QWxpZ25cIjpcImNlbnRlclwifSlcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdCA9IHt5ZWFyOiAnbnVtZXJpYycsIG1vbnRoOiAnbnVtZXJpYycsIGRheTogJ251bWVyaWMnfTtcbiAgICAgICAgICAgICAgICAgICAgcGVyc29uLnZvdGVzLmZvckVhY2ggKGl0ZW0sIGl0ZW1MaXN0KSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5sZWdpc2xhdGlvbi5kYXRlX2NvbnNpZGVyZWQgPSBkYXRlLnRvTG9jYWxlU3RyaW5nICdlbi1VUycsIGZvcm1hdFxuXG4gICAgICAgICAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxlZFRlbXBsYXRlID0gSGFuZGxlYmFycy5jb21waWxlKHRwbClcbiAgICAgICAgICAgICAgICAgICAgJCgnLmxvYWRlcicpLmhpZGUoKVxuICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICBodG1sID0gY29tcGlsZWRUZW1wbGF0ZShwZXJzb24pXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGh0bWx9LCAnQ1BDIFBvbGl0aWNpYW4gUHJvZmlsZXMnLCB1cmxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIGh0bWxcbiAgICAgICAgICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgICAgICAgICAkKCcudm90ZScpLm9uICdjbGljaycsIChlKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPSBlLmN1cnJlbnRUYXJnZXQuZGF0YXNldC5sZWdpc2xhdGlvbk5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5hbWUgaXMgdW5kZWZpbmVkIHRoZW4gbmFtZSA9IHBlcnNvbi5mdWxsX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjY29udmVyc2F0aW9uJykubW9kYWwgJ3Nob3cnXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZyZXNoX2Rpc3F1cyBpZCwgJ2h0dHA6Ly9nb3Z3aWtpLnVzJyArICcvJyArIGlkLCBuYW1lXG4gICAgICAgICAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5ESVNRVVNXSURHRVRTLmdldENvdW50KClcblxuICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgZVxuXG5cbiMgUm91dGUgL1xuaWYgcm91dGVUeXBlIGlzIDBcbiAgICAkKCcjc3RhbnRvbkljb24nKS5oaWRlKClcbiAgICBnb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnL2xlZ2FjeS9kYXRhL2hfdHlwZXNfY2FfMi5qc29uJywgN1xuICAgIGdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICAgICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjd2lraXBlZGlhQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgICAgICB1cmwgPSAnLycgKyBkYXRhLmFsdFR5cGVTbHVnICsgJy8nICsgZGF0YS5zbHVnXG4gICAgICAgIGpRdWVyeS5nZXQgdXJsLCB7fSwgKGRhdGEpIC0+XG4gICAgICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgICAgICAgICBjYWNoZTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZWxlY3RlZF9vZmZpY2lhbHNfZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdvdnMgPSBlbGVjdGVkX29mZmljaWFsc19kYXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZWRfZ292X3RlbXBsYXRlID0gdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUge3RlbXBsYXRlOiBjb21waWxlZF9nb3ZfdGVtcGxhdGV9LCAnQ1BDIENpdmljIFByb2ZpbGVzJywgdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgY29tcGlsZWRfZ292X3RlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcbiAgICBpZiAhdW5kZWZcbiAgICAgICAgJCgnI3NlYXJjaENvbnRhaW5lcicpLmh0bWwgJCgnI3NlYXJjaC1jb250YWluZXItdGVtcGxhdGUnKS5odG1sKClcbiAgICAgICAgIyBMb2FkIGludHJvZHVjdG9yeSB0ZXh0IGZyb20gdGV4dHMvaW50cm8tdGV4dC5odG1sIHRvICNpbnRyby10ZXh0IGNvbnRhaW5lci5cbiAgICAgICAgJC5nZXQgXCIvbGVnYWN5L3RleHRzL2ludHJvLXRleHQuaHRtbFwiLCAoZGF0YSkgLT4gJChcIiNpbnRyby10ZXh0XCIpLmh0bWwgZGF0YVxuICAgICAgICBnb3ZtYXAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4gICAgICAgIGdldF9jb3VudGllcyBHT1ZXSUtJLmRyYXdfcG9seWdvbnNcbiAgICAgICAgdW5kZWYgPSB0cnVlXG4gICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICBhZGp1c3RfdHlwZWFoZWFkX3dpZHRoKClcbiAgICBzdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJCgnI2dvdm1hcCcpLm9uICdjbGljaycsICcuaW5mby13aW5kb3ctdXJpJywgKGUpIC0+XG4gICAgICAgIHVyaSA9IGUudGFyZ2V0LnBhcmVudE5vZGUuZGF0YXNldC51cmlcbiAgICAgICAgJCgnLmxvYWRlcicpLnNob3coKVxuICAgICAgICAkKCcjc2VhcmNoQ29udGFpbmVyJykuaGlkZSgpXG4gICAgICAgICQoJyNkYXRhQ29udGFpbmVyJykuc2hvdygpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZ292ZXJubWVudFwiICsgdXJpLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChnb3ZzKSAtPlxuICAgICAgICAgICAgICAgIGNvbXBpbGVkX2dvdl90ZW1wbGF0ZSA9IHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBnb3ZzKVxuICAgICAgICAgICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCBjb21waWxlZF9nb3ZfdGVtcGxhdGVcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjc2VhcmNoSWNvbicpLnNob3coKVxuICAgICAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSB7dGVtcGxhdGU6IGNvbXBpbGVkX2dvdl90ZW1wbGF0ZX0sICdDUEMgQ2l2aWMgUHJvZmlsZXMnLCB1cmlcblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWVcbmlmIHJvdXRlVHlwZSBpcyAyXG4gICAgZG9jdW1lbnQudGl0bGUgPSAnQ1BDIENpdmljIFByb2ZpbGVzJ1xuICAgICQoJyNkZXRhaWxzJykuaGlkZSgpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5zaG93KClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3dpa2lwZWRpYUNvbnRhaW5lcicpLmhpZGUoKVxuICAgICQoJyNzdGFudG9uSWNvbicpLmhpZGUoKVxuICAgIHRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG4gICAgJC5hamF4XG4gICAgICAgIHVybDogXCJodHRwOi8vNDUuNTUuMC4xNDUvYXBpL2dvdmVybm1lbnRcIiArIHdpbmRvdy5wYXRoLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgIHN1Y2Nlc3M6IChlbGVjdGVkX29mZmljaWFsc19kYXRhKSAtPlxuICAgICAgICAgICAgZ292cyA9IGVsZWN0ZWRfb2ZmaWNpYWxzX2RhdGFcbiAgICAgICAgICAgICQoJy5sb2FkZXInKS5oaWRlKClcbiAgICAgICAgICAgICQoJyNkZXRhaWxzJykuc2hvdygpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGdvdnMpXG4gICAgICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAgICAgR09WV0lLSS5zaG93X2RhdGFfcGFnZSgpXG4gICAgICAgIGVycm9yOiAoZSkgLT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nIGVcblxuICAgICQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgR09WV0lLSS5zaG93X3NlYXJjaF9wYWdlKClcblxuIyBSb3V0ZSAvOmFsdF9uYW1lLzpjaXR5X25hbWUvOmVsZWN0ZWRfbmFtZVxuaWYgcm91dGVUeXBlIGlzIDNcbiAgICBkb2N1bWVudC50aXRsZSA9ICdDUEMgUG9saXRpY2lhbiBQcm9maWxlcydcbiAgICAkKCcjZGV0YWlscycpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICQoJyN3aWtpcGVkaWFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcubG9hZGVyJykuc2hvdygpXG4gICAgJCgnI3N0YW50b25JY29uJykuc2hvdygpXG4gICAgJCgnI3NlYXJjaEljb24nKS5zaG93KClcbiAgICAkLmFqYXhcbiAgICAgICAgdXJsOiBcImh0dHA6Ly80NS41NS4wLjE0NS9hcGkvZWxlY3RlZC1vZmZpY2lhbFwiICsgd2luZG93LnBhdGgsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG5cbiAgICAgICAgICAgIHBlcnNvbiA9IGRhdGFbMF1cblxuICAgICAgICAgICAgaWYgJC5pc0VtcHR5T2JqZWN0KHBlcnNvbilcbiAgICAgICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sICc8aDI+U29ycnkuIFBhZ2Ugbm90IGZvdW5kPC9oMj4nXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5jc3Moe1widGV4dEFsaWduXCI6XCJjZW50ZXJcIn0pXG4gICAgICAgICAgICAgICAgJCgnI2RldGFpbHMnKS5zaG93KClcbiAgICAgICAgICAgICAgICAkKCcjZGF0YUNvbnRhaW5lcicpLnNob3coKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgZm9ybWF0ID0ge3llYXI6ICdudW1lcmljJywgbW9udGg6ICdudW1lcmljJywgZGF5OiAnbnVtZXJpYyd9O1xuICAgICAgICAgICAgaWYgcGVyc29uLnZvdGVzICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHBlcnNvbi52b3Rlcy5mb3JFYWNoIChpdGVtLCBpdGVtTGlzdCkgLT5cbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIGl0ZW0ubGVnaXNsYXRpb24uZGF0ZV9jb25zaWRlcmVkO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmxlZ2lzbGF0aW9uLmRhdGVfY29uc2lkZXJlZCA9IGRhdGUudG9Mb2NhbGVTdHJpbmcgJ2VuLVVTJywgZm9ybWF0XG5cbiAgICAgICAgICAgIHRwbCA9ICQoJyNwZXJzb24taW5mby10ZW1wbGF0ZScpLmh0bWwoKVxuICAgICAgICAgICAgY29tcGlsZWRUZW1wbGF0ZSA9IEhhbmRsZWJhcnMuY29tcGlsZSh0cGwpXG4gICAgICAgICAgICAkKCcubG9hZGVyJykuaGlkZSgpXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLnNob3coKVxuICAgICAgICAgICAgaHRtbCA9IGNvbXBpbGVkVGVtcGxhdGUocGVyc29uKVxuXG4gICAgICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgaHRtbFxuICAgICAgICAgICAgJCgnI2RhdGFDb250YWluZXInKS5jc3MoJ2Rpc3BsYXknOiAnYmxvY2snKTtcblxuICAgICAgICAgICAgJCgnLnZvdGUnKS5vbiAnY2xpY2snLCAoZSkgLT5cbiAgICAgICAgICAgICAgICBpZCA9IGUuY3VycmVudFRhcmdldC5pZFxuICAgICAgICAgICAgICAgICMgSWYgbGVnaXNsYXRpb25OYW1lIGlzIHVuZGVmaW5lZCB1c2UgcGVyc29uIG5hbWVcbiAgICAgICAgICAgICAgICBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXQubGVnaXNsYXRpb25OYW1lXG4gICAgICAgICAgICAgICAgaWYgbmFtZSBpcyB1bmRlZmluZWQgdGhlbiBuYW1lID0gcGVyc29uLmZ1bGxfbmFtZVxuICAgICAgICAgICAgICAgICQoJyNteU1vZGFsTGFiZWwnKS50ZXh0KG5hbWUgKyAnICgnICsgcGVyc29uLmdvdl9hbHRfbmFtZSArICcpJyk7XG4gICAgICAgICAgICAgICAgJCgnI2NvbnZlcnNhdGlvbicpLm1vZGFsICdzaG93J1xuICAgICAgICAgICAgICAgIHJlZnJlc2hfZGlzcXVzIGlkLCAnaHR0cDovL2dvdndpa2kudXMnICsgJy8nICsgaWQsIG5hbWVcbiAgICAgICAgICAgICQoJyNzdGFudG9uSWNvbiBhJykudGV4dCAnUmV0dXJuIHRvICcgKyBwZXJzb24uZ292X2FsdF9uYW1lXG4gICAgICAgICAgICB3aW5kb3cuRElTUVVTV0lER0VUUy5nZXRDb3VudCgpXG5cbiAgICAgICAgZXJyb3I6IChlKSAtPlxuICAgICAgICAgICAgY29uc29sZS5sb2cgZSIsIlxuXG5cbiMgVGFrZXMgYW4gYXJyYXkgb2YgZG9jcyB0byBzZWFyY2ggaW4uXG4jIFJldHVybnMgYSBmdW5jdGlvbnMgdGhhdCB0YWtlcyAyIHBhcmFtcyBcbiMgcSAtIHF1ZXJ5IHN0cmluZyBhbmQgXG4jIGNiIC0gY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiMgY2IgcmV0dXJucyBhbiBhcnJheSBvZiBtYXRjaGluZyBkb2N1bWVudHMuXG4jIG11bV9pdGVtcyAtIG1heCBudW1iZXIgb2YgZm91bmQgaXRlbXMgdG8gc2hvd1xuUXVlcnlNYXRoZXIgPSAoZG9jcywgbnVtX2l0ZW1zPTUpIC0+XG4gIChxLCBjYikgLT5cbiAgICB0ZXN0X3N0cmluZyA9KHMsIHJlZ3MpIC0+XG4gICAgICAoaWYgbm90IHIudGVzdChzKSB0aGVuIHJldHVybiBmYWxzZSkgIGZvciByIGluIHJlZ3NcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBbd29yZHMscmVnc10gPSBnZXRfd29yZHNfcmVncyBxXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgIyBpdGVyYXRlIHRocm91Z2ggdGhlIHBvb2wgb2YgZG9jcyBhbmQgZm9yIGFueSBzdHJpbmcgdGhhdFxuICAgICMgY29udGFpbnMgdGhlIHN1YnN0cmluZyBgcWAsIGFkZCBpdCB0byB0aGUgYG1hdGNoZXNgIGFycmF5XG5cbiAgICBmb3IgZCBpbiBkb2NzXG4gICAgICBpZiBtYXRjaGVzLmxlbmd0aCA+PSBudW1faXRlbXMgdGhlbiBicmVha1xuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcblxuICAgICAgaWYgdGVzdF9zdHJpbmcoZC5nb3ZfbmFtZSwgcmVncykgXG4gICAgICAgIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICAgICNpZiB0ZXN0X3N0cmluZyhcIiN7ZC5nb3ZfbmFtZX0gI3tkLnN0YXRlfSAje2QuZ292X3R5cGV9ICN7ZC5pbmNfaWR9XCIsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaScpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FU1xuZmllbGROYW1lcyA9IHt9XG5maWVsZE5hbWVzSGVscCA9IHt9XG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0gKG4sbWFzayxkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbm90IGRhdGFbbl1cbiAgICByZXR1cm4gJydcblxuICBpZiBuID09IFwid2ViX3NpdGVcIlxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXG4gIGVsc2VcbiAgICBpZiAnJyAhPSBtYXNrXG4gICAgICBpZiBkYXRhW24rJ19yYW5rJ10gYW5kIGRhdGEubWF4X3JhbmtzIGFuZCBkYXRhLm1heF9yYW5rc1tuKydfbWF4X3JhbmsnXVxuICAgICAgICB2ID0gbnVtZXJhbCh2KS5mb3JtYXQobWFzaylcbiAgICAgICAgcmV0dXJuIFwiI3t2fSA8c3BhbiBjbGFzcz0ncmFuayc+KCN7ZGF0YVtuKydfcmFuayddfSBvZiAje2RhdGEubWF4X3JhbmtzW24rJ19tYXhfcmFuayddfSk8L3NwYW4+XCJcbiAgICAgIGlmIG4gPT0gXCJudW1iZXJfb2ZfZnVsbF90aW1lX2VtcGxveWVlc1wiXG4gICAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdCgnMCwwJylcbiAgICAgIHJldHVybiBudW1lcmFsKHYpLmZvcm1hdChtYXNrKVxuICAgIGVsc2VcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwib3Blbl9lbnJvbGxtZW50X3NjaG9vbHNcIlxuICAgICAgdGhlbiB2ID0gdi5zdWJzdHJpbmcoMCwgMTkpICsgXCI8ZGl2IHN0eWxlPSdkaXNwbGF5OmlubGluZTtjb2xvcjojMDc0ZDcxJyAgdGl0bGU9JyN7dn0nPiZoZWxsaXA7PC9kaXY+XCJcbiAgICAgIGlmIHYubGVuZ3RoID4gMjAgYW5kXG4gICAgICBuID09IFwicGFyZW50X3RyaWdnZXJfZWxpZ2libGVfc2Nob29sc1wiXG4gICAgICB0aGVuIHYgPSB2LnN1YnN0cmluZygwLCAxOSkgKyBcIjxkaXYgc3R5bGU9J2Rpc3BsYXk6aW5saW5lO2NvbG9yOiMwNzRkNzEnICB0aXRsZT0nI3t2fSc+JmhlbGxpcDs8L2Rpdj5cIlxuICAgICAgZWxzZVxuICAgICAgICBpZiB2Lmxlbmd0aCA+IDIxXG4gICAgICAgIHRoZW4gdiA9IHYuc3Vic3RyaW5nKDAsIDIxKVxuICAgICAgICBlbHNlXG4gICAgICAgIHJldHVybiB2XG5cblxucmVuZGVyX2ZpZWxkX25hbWVfaGVscCA9IChmTmFtZSkgLT5cbiAgI2lmIGZpZWxkTmFtZXNIZWxwW2ZOYW1lXVxuICAgIHJldHVybiBmaWVsZE5hbWVzSGVscFtmTmFtZV1cblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICBpZiBcIl9cIiA9PSBzdWJzdHIgZk5hbWUsIDAsIDFcbiAgICBcIlwiXCJcbiAgICA8ZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nID4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4mbmJzcDs8L3NwYW4+XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIGVsc2VcbiAgICByZXR1cm4gJycgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gICAgXCJcIlwiXG4gICAgPGRpdj5cbiAgICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJyAgPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PGRpdj48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuXG5yZW5kZXJfc3ViaGVhZGluZyA9IChmTmFtZSwgbWFzaywgbm90Rmlyc3QpLT5cbiAgcyA9ICcnXG4gIGZOYW1lID0gcmVuZGVyX2ZpZWxkX25hbWUgZk5hbWVcbiAgaWYgbWFzayA9PSBcImhlYWRpbmdcIlxuICAgIGlmIG5vdEZpcnN0ICE9IDBcbiAgICAgIHMgKz0gXCI8YnIvPlwiXG4gICAgcyArPSBcIjxkaXY+PHNwYW4gY2xhc3M9J2YtbmFtJz4je2ZOYW1lfTwvc3Bhbj48c3BhbiBjbGFzcz0nZi12YWwnPiA8L3NwYW4+PC9kaXY+XCJcbiAgcmV0dXJuIHNcblxucmVuZGVyX2ZpZWxkcyA9IChmaWVsZHMsZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgZm9yIGZpZWxkLGkgaW4gZmllbGRzXG4gICAgaWYgKHR5cGVvZiBmaWVsZCBpcyBcIm9iamVjdFwiKVxuICAgICAgaWYgZmllbGQubWFzayA9PSBcImhlYWRpbmdcIlxuICAgICAgICBoICs9IHJlbmRlcl9zdWJoZWFkaW5nKGZpZWxkLm5hbWUsIGZpZWxkLm1hc2ssIGkpXG4gICAgICAgIGZWYWx1ZSA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGZWYWx1ZSA9IHJlbmRlcl9maWVsZF92YWx1ZSBmaWVsZC5uYW1lLCBmaWVsZC5tYXNrLCBkYXRhXG4gICAgICAgIGlmICgnJyAhPSBmVmFsdWUgYW5kIGZWYWx1ZSAhPSAnMCcpXG4gICAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZC5uYW1lXG4gICAgICAgICAgZk5hbWVIZWxwID0gcmVuZGVyX2ZpZWxkX25hbWVfaGVscCBmaWVsZC5uYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBmVmFsdWUgPSAnJ1xuXG4gICAgZWxzZVxuICAgICAgZlZhbHVlID0gcmVuZGVyX2ZpZWxkX3ZhbHVlIGZpZWxkLCAnJywgZGF0YVxuICAgICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgICAgZk5hbWUgPSByZW5kZXJfZmllbGRfbmFtZSBmaWVsZFxuICAgICAgICBmTmFtZUhlbHAgPSByZW5kZXJfZmllbGRfbmFtZV9oZWxwIGZOYW1lXG4gICAgaWYgKCcnICE9IGZWYWx1ZSlcbiAgICAgIGggKz0gdGVtcGxhdGUobmFtZTogZk5hbWUsIHZhbHVlOiBmVmFsdWUsIGhlbHA6IGZOYW1lSGVscClcbiAgcmV0dXJuIGhcblxucmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgPSAoZGF0YSx0ZW1wbGF0ZSktPlxuICBoID0gJydcbiAgbWFzayA9ICcwLDAnXG4gIGNhdGVnb3J5ID0gJydcbiAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgZm9yIGZpZWxkIGluIGRhdGFcbiAgICBpZiBjYXRlZ29yeSAhPSBmaWVsZC5jYXRlZ29yeV9uYW1lXG4gICAgICBjYXRlZ29yeSA9IGZpZWxkLmNhdGVnb3J5X25hbWVcbiAgICAgIGlmIGNhdGVnb3J5ID09ICdPdmVydmlldydcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgIGVsc2UgaWYgY2F0ZWdvcnkgPT0gJ1JldmVudWVzJ1xuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSBcIjxiPlwiICsgdGVtcGxhdGUobmFtZTogY2F0ZWdvcnksIGdlbmZ1bmQ6IFwiR2VuZXJhbCBGdW5kXCIsIG90aGVyZnVuZHM6IFwiT3RoZXIgRnVuZHNcIiwgdG90YWxmdW5kczogXCJUb3RhbCBHb3YuIEZ1bmRzXCIpICsgXCI8L2I+XCJcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBoICs9ICc8L2JyPidcbiAgICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBcIjxiPlwiICsgY2F0ZWdvcnkgKyBcIjwvYj5cIiwgZ2VuZnVuZDogJycsIG90aGVyZnVuZHM6ICcnLCB0b3RhbGZ1bmRzOiAnJylcbiAgICAgICAgaXNfZmlyc3Rfcm93ID0gdHJ1ZVxuXG4gICAgaWYgZmllbGQuY2FwdGlvbiA9PSAnR2VuZXJhbCBGdW5kIEJhbGFuY2UnIG9yIGZpZWxkLmNhcHRpb24gPT0gJ0xvbmcgVGVybSBEZWJ0J1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSlcbiAgICBlbHNlIGlmIGZpZWxkLmNhcHRpb24gaW4gWydUb3RhbCBSZXZlbnVlcycsICdUb3RhbCBFeHBlbmRpdHVyZXMnLCAnU3VycGx1cyAvIChEZWZpY2l0KSddIG9yIGlzX2ZpcnN0X3Jvd1xuICAgICAgaCArPSB0ZW1wbGF0ZShuYW1lOiBmaWVsZC5jYXB0aW9uLCBnZW5mdW5kOiBjdXJyZW5jeShmaWVsZC5nZW5mdW5kLCBtYXNrLCAnPHNwYW4gY2xhc3M9XCJjdXJyZW5jeS1zaWduXCI+JDwvc3Bhbj4nKSwgb3RoZXJmdW5kczogY3VycmVuY3koZmllbGQub3RoZXJmdW5kcywgbWFzaywgJzxzcGFuIGNsYXNzPVwiY3VycmVuY3ktc2lnblwiPiQ8L3NwYW4+JyksIHRvdGFsZnVuZHM6IGN1cnJlbmN5KGZpZWxkLnRvdGFsZnVuZHMsIG1hc2ssICc8c3BhbiBjbGFzcz1cImN1cnJlbmN5LXNpZ25cIj4kPC9zcGFuPicpKVxuICAgICAgaXNfZmlyc3Rfcm93ID0gZmFsc2VcbiAgICBlbHNlXG4gICAgICBoICs9IHRlbXBsYXRlKG5hbWU6IGZpZWxkLmNhcHRpb24sIGdlbmZ1bmQ6IGN1cnJlbmN5KGZpZWxkLmdlbmZ1bmQsIG1hc2spLCBvdGhlcmZ1bmRzOiBjdXJyZW5jeShmaWVsZC5vdGhlcmZ1bmRzLCBtYXNrKSwgdG90YWxmdW5kczogY3VycmVuY3koZmllbGQudG90YWxmdW5kcywgbWFzaykpXG4gIHJldHVybiBoXG5cbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvW1xcc1xcK1xcLV0vZywgJ18nKVxuXG50b1RpdGxlQ2FzZSA9IChzdHIpIC0+XG4gIHN0ci5yZXBsYWNlIC9cXHdcXFMqL2csICh0eHQpIC0+XG4gICAgdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG5cbmN1cnJlbmN5ID0gKG4sIG1hc2ssIHNpZ24gPSAnJykgLT5cbiAgICBuID0gbnVtZXJhbChuKVxuICAgIGlmIG4gPCAwXG4gICAgICAgIHMgPSBuLmZvcm1hdChtYXNrKS50b1N0cmluZygpXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoLy0vZywgJycpXG4gICAgICAgIHJldHVybiBcIigje3NpZ259I3snPHNwYW4gY2xhc3M9XCJmaW4tdmFsXCI+JytzKyc8L3NwYW4+J30pXCJcblxuICAgIG4gPSBuLmZvcm1hdChtYXNrKVxuICAgIHJldHVybiBcIiN7c2lnbn0jeyc8c3BhbiBjbGFzcz1cImZpbi12YWxcIj4nK24rJzwvc3Bhbj4nfVwiXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhLCB0YWJzZXQsIHBhcmVudCkgLT5cbiAgI2xheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gIGxheW91dCA9IGluaXRpYWxfbGF5b3V0XG4gIHRlbXBsYXRlcyA9IHBhcmVudC50ZW1wbGF0ZXNcbiAgcGxvdF9oYW5kbGVzID0ge31cblxuICBsYXlvdXRfZGF0YSA9XG4gICAgdGl0bGU6IGRhdGEubmFtZVxuICAgIHdpa2lwZWRpYV9wYWdlX2V4aXN0czogZGF0YS53aWtpcGVkaWFfcGFnZV9leGlzdHNcbiAgICB3aWtpcGVkaWFfcGFnZV9uYW1lOiAgZGF0YS53aWtpcGVkaWFfcGFnZV9uYW1lXG4gICAgdHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWU6IGRhdGEudHJhbnNwYXJlbnRfY2FsaWZvcm5pYV9wYWdlX25hbWVcbiAgICBsYXRlc3RfYXVkaXRfdXJsOiBkYXRhLmxhdGVzdF9hdWRpdF91cmxcbiAgICB0YWJzOiBbXVxuICAgIHRhYmNvbnRlbnQ6ICcnXG5cbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGxheW91dF9kYXRhLnRhYnMucHVzaFxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcblxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgZGV0YWlsX2RhdGEgPVxuICAgICAgdGFiaWQ6IHVuZGVyKHRhYi5uYW1lKSxcbiAgICAgIHRhYm5hbWU6IHRhYi5uYW1lLFxuICAgICAgYWN0aXZlOiAoaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJylcbiAgICAgIHRhYmNvbnRlbnQ6ICcnXG4gICAgc3dpdGNoIHRhYi5uYW1lXG4gICAgICB3aGVuICdPdmVydmlldyArIEVsZWN0ZWQgT2ZmaWNpYWxzJ1xuICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHJlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YSwgdGVtcGxhdGVzWyd0YWJkZXRhaWwtbmFtZXZhbHVlLXRlbXBsYXRlJ11cbiAgICAgICAgY29uc29sZS5sb2cgZGF0YVxuICAgICAgICBmb3Igb2ZmaWNpYWwsaSBpbiBkYXRhLmVsZWN0ZWRfb2ZmaWNpYWxzXG4gICAgICAgICAgb2ZmaWNpYWxfZGF0YSA9XG4gICAgICAgICAgICB0aXRsZTogaWYgJycgIT0gb2ZmaWNpYWwudGl0bGUgdGhlbiBcIlRpdGxlOiBcIiArIG9mZmljaWFsLnRpdGxlXG4gICAgICAgICAgICBuYW1lOiBpZiAnJyAhPSBvZmZpY2lhbC5mdWxsX25hbWUgdGhlbiBcIk5hbWU6IFwiICsgb2ZmaWNpYWwuZnVsbF9uYW1lXG4gICAgICAgICAgICBlbWFpbDogaWYgb2ZmaWNpYWwuZW1haWxfYWRkcmVzcyB0aGVuIFwiRW1haWw6IFwiICsgb2ZmaWNpYWwuZW1haWxfYWRkcmVzc1xuICAgICAgICAgICAgdGVsZXBob25lbnVtYmVyOiBpZiBudWxsICE9IG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXIgYW5kIHVuZGVmaW5lZCAhPSBvZmZpY2lhbC50ZWxlcGhvbmVfbnVtYmVyIHRoZW4gXCJUZWxlcGhvbmUgTnVtYmVyOiBcIiArIG9mZmljaWFsLnRlbGVwaG9uZV9udW1iZXJcbiAgICAgICAgICAgIHRlcm1leHBpcmVzOiBpZiBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgdGhlbiBcIlRlcm0gRXhwaXJlczogXCIgKyBvZmZpY2lhbC50ZXJtX2V4cGlyZXMgZWxzZSBcIlRlcm0gRXhwaXJlczogXCJcbiAgICAgICAgICAgIGFsdFR5cGVTbHVnOiBkYXRhLmFsdF90eXBlX3NsdWdcbiAgICAgICAgICAgIG5hbWVTbHVnOiBkYXRhLnNsdWdcbiAgICAgICAgICAgIHNsdWc6IG9mZmljaWFsLnNsdWdcblxuICAgICAgICAgIGlmICcnICE9IG9mZmljaWFsLnBob3RvX3VybCBhbmQgb2ZmaWNpYWwucGhvdG9fdXJsICE9IHVuZGVmaW5lZFxuICAgICAgICAgICAgb2ZmaWNpYWxfZGF0YS5pbWFnZSA9ICAnPGltZyBzcmM9XCInK29mZmljaWFsLnBob3RvX3VybCsnXCIgY2xhc3M9XCJwb3J0cmFpdFwiIGFsdD1cIlwiIC8+J1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9mZmljaWFsX2RhdGEuaW1hZ2UgPSAgJydcblxuICAgICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnXShvZmZpY2lhbF9kYXRhKVxuICAgICAgd2hlbiAnRW1wbG95ZWUgQ29tcGVuc2F0aW9uJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZW1wbG95ZWUtY29tcC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ11cbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fc2FsYXJ5X3Blcl9mdWxsX3RpbWVfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9iZW5lZml0c19wZXJfZnRfZW1wJ10gPT0gMFxuICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl93YWdlc19nZW5lcmFsX3B1YmxpYyddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBpZiBkYXRhWydtZWRpYW5fYmVuZWZpdHNfZ2VuZXJhbF9wdWJsaWMnXSA9PSAwXG4gICAgICAgICAgICBncmFwaCA9IGZhbHNlXG4gICAgICAgICAgc21hbGxDaGFydFdpZHRoID0gMzQwXG4gICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDQ3MFxuXG4gICAgICAgICAgaWYgJCh3aW5kb3cpLndpZHRoKCkgPCA0OTBcbiAgICAgICAgICAgIHNtYWxsQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgICAgYmlnQ2hhcnRXaWR0aCA9IDMwMFxuICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICBzZXRUaW1lb3V0ICggLT5cbiAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnTWVkaWFuIENvbXBlbnNhdGlvbidcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnV2FnZXMnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0JlbnMuJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIFtcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnXFxuIEVtcGxveWVlcydcbiAgICAgICAgICAgICAgICAgIGRhdGFbJ21lZGlhbl9zYWxhcnlfcGVyX2Z1bGxfdGltZV9lbXAnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX3Blcl9mdF9lbXAnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAnQWxsIFxcbicgKyB0b1RpdGxlQ2FzZSBkYXRhLm5hbWUgKyAnIFxcbiBSZXNpZGVudHMnXG4gICAgICAgICAgICAgICAgICBkYXRhWydtZWRpYW5fd2FnZXNfZ2VuZXJhbF9wdWJsaWMnXVxuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX2JlbmVmaXRzX2dlbmVyYWxfcHVibGljJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgZm9ybWF0dGVyID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLk51bWJlckZvcm1hdChncm91cGluZ1N5bWJvbDogJywnICwgZnJhY3Rpb25EaWdpdHM6ICcwJylcbiAgICAgICAgICAgICAgZm9ybWF0dGVyLmZvcm1hdCh2aXNfZGF0YSwgMSk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlci5mb3JtYXQodmlzX2RhdGEsIDIpO1xuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidNZWRpYW4gVG90YWwgQ29tcGVuc2F0aW9uIC0gRnVsbCBUaW1lIFdvcmtlcnM6IFxcbiBHb3Zlcm5tZW50IHZzLiBQcml2YXRlIFNlY3RvcidcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXNTdGFja2VkJzogJ3RydWUnXG4gICAgICAgICAgICAgICAgJ2NvbG9ycyc6IFsnIzAwNWNlNicsICcjMDA5OTMzJ11cbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1jb21wLWdyYXBoJ1xuICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgKSwgMTAwMFxuICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICBgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlLmxvYWQoJ3Zpc3VhbGl6YXRpb24nLCAnMS4wJywgeydwYWNrYWdlcyc6ICdjb3JlY2hhcnQnfSlcbiAgICAgICAgICAgIH0sIDIwMDApYFxuICAgICAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrIGRyYXdDaGFydDtcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ21lZGlhbi1jb21wLWdyYXBoJ10gPSdtZWRpYW4tY29tcC1ncmFwaCdcbiAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1snbWVkaWFuLXBlbnNpb24tZ3JhcGgnXVxuICAgICAgICAgIGdyYXBoID0gdHJ1ZVxuICAgICAgICAgIGlmIGRhdGFbJ21lZGlhbl9wZW5zaW9uXzMwX3llYXJfcmV0aXJlZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ01lZGlhbiBQZW5zaW9uJ1xuICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdXYWdlcydcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkUm93cyBbXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ1BlbnNpb24gZm9yIFxcbiBSZXRpcmVlIHcvIDMwIFllYXJzJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsnbWVkaWFuX3BlbnNpb24zMF95ZWFyX3JldGlyZWUnXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uTnVtYmVyRm9ybWF0KGdyb3VwaW5nU3ltYm9sOiAnLCcgLCBmcmFjdGlvbkRpZ2l0czogJzAnKVxuICAgICAgICAgICAgICBmb3JtYXR0ZXIuZm9ybWF0KHZpc19kYXRhLCAxKTtcbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonTWVkaWFuIFRvdGFsIFBlbnNpb24nXG4gICAgICAgICAgICAgICAgJ3RpdGxlVGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICd0ZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBzbWFsbENoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzAwXG4gICAgICAgICAgICAgICAgJ2Jhcic6IHtcbiAgICAgICAgICAgICAgICAgJ2dyb3VwV2lkdGgnOiAnMzAlJ1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJ2lzU3RhY2tlZCc6ICd0cnVlJ1xuICAgICAgICAgICAgICAgICdjb2xvcnMnOiBbJyMwMDVjZTYnLCAnIzAwOTkzMyddXG4gICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ21lZGlhbi1wZW5zaW9uLWdyYXBoJ1xuICAgICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgYHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCd9KVxuICAgICAgICAgIH0sIDIwMDApYFxuICAgICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayBkcmF3Q2hhcnQ7XG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydtZWRpYW4tcGVuc2lvbi1ncmFwaCddID0nbWVkaWFuLXBlbnNpb24tZ3JhcGgnXG4gICAgICB3aGVuICdGaW5hbmNpYWwgSGVhbHRoJ1xuICAgICAgICBoID0gJydcbiAgICAgICAgaCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG4gICAgICAgIGRldGFpbF9kYXRhLnRhYmNvbnRlbnQgKz0gdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluYW5jaWFsLWhlYWx0aC10ZW1wbGF0ZSddKGNvbnRlbnQ6IGgpXG4gICAgICAgICNwdWJsaWMgc2FmZXR5IHBpZVxuICAgICAgICBpZiBub3QgcGxvdF9oYW5kbGVzWydwdWJsaWMtc2FmZXR5LXBpZSddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgaWYgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1B1YmxpYyBTYWZldHkgRXhwZW5zZSdcbiAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdQdWJsaWMgU2FmZXR5IEV4cCdcbiAgICAgICAgICAgICAgICAgIDEgLSBkYXRhWydwdWJsaWNfc2FmZXR5X2V4cF9vdmVyX3RvdF9nb3ZfZnVuZF9yZXZlbnVlJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ090aGVyJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsncHVibGljX3NhZmV0eV9leHBfb3Zlcl90b3RfZ292X2Z1bmRfcmV2ZW51ZSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICd0aXRsZSc6J1B1YmxpYyBzYWZldHkgZXhwZW5zZSdcbiAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAnZm9udFNpemUnOiAxMlxuICAgICAgICAgICAgICAgICd3aWR0aCc6IHNtYWxsQ2hhcnRXaWR0aFxuICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzMDBcbiAgICAgICAgICAgICAgICAnaXMzRCcgOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdzbGljZXMnOiB7IDE6IHtvZmZzZXQ6IDAuMn19XG4gICAgICAgICAgICAgICAgJ3BpZVN0YXJ0QW5nbGUnOiA0NVxuICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAncHVibGljLXNhZmV0eS1waWUnXG4gICAgICAgICAgICAgIGNoYXJ0LmRyYXcgdmlzX2RhdGEsIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCd9KVxuICAgICAgICAgICAgfSwgMjAwMClgXG4gICAgICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2sgZHJhd0NoYXJ0O1xuICAgICAgICAgIHBsb3RfaGFuZGxlc1sncHVibGljLXNhZmV0eS1waWUnXSA9J3B1YmxpYy1zYWZldHktcGllJ1xuICAgICAgICAjZmluLWhlYWx0aC1yZXZlbnVlIGdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCddIGFuZCBkYXRhWydhbHRfdHlwZSddICE9ICdTY2hvb2wgRGlzdHJpY3QnXG4gICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgI2NvbnNvbGUubG9nICcjIyNhbCcrSlNPTi5zdHJpbmdpZnkgZGF0YVxuICAgICAgICAgIGlmIGRhdGFbJ3RvdGFsX3JldmVudWVfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ1Jldi4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBSZXZlbnVlIFxcbiBQZXIgQ2FwaXRhJ1xuICAgICAgICAgICAgICAgICAgZGF0YVsndG90YWxfcmV2ZW51ZV9wZXJfY2FwaXRhJ11cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgJ01lZGlhbiBUb3RhbCBcXG4gUmV2ZW51ZSBQZXIgXFxuIENhcGl0YSBGb3IgQWxsIENpdGllcydcbiAgICAgICAgICAgICAgICAgIDQyMFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAndGl0bGUnOidUb3RhbCBSZXZlbnVlJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgY2hhcnQgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uQ29sdW1uQ2hhcnQgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQgJ2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0J30pXG4gICAgICAgICAgICB9LCAyMDAwKWBcbiAgICAgICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayBkcmF3Q2hhcnQ7XG4gICAgICAgICAgcGxvdF9oYW5kbGVzWydmaW4taGVhbHRoLXJldmVudWUtZ3JhcGgnXSA9J2Zpbi1oZWFsdGgtcmV2ZW51ZS1ncmFwaCdcbiAgICAgICAgI2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoXG4gICAgICAgIGlmIG5vdCBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gYW5kIGRhdGFbJ2FsdF90eXBlJ10gIT0gJ1NjaG9vbCBEaXN0cmljdCdcbiAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICBpZiBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddID09IDBcbiAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICBkcmF3Q2hhcnQgPSAoKSAtPlxuICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnc3RyaW5nJywgJ1BlciBDYXBpdGEnXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZENvbHVtbiAnbnVtYmVyJywgJ0V4cC4nXG4gICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3MgW1xuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdUb3RhbCBFeHBlbmRpdHVyZXMgXFxuIFBlciBDYXBpdGEnXG4gICAgICAgICAgICAgICAgICBkYXRhWyd0b3RhbF9leHBlbmRpdHVyZXNfcGVyX2NhcGl0YSddXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICdNZWRpYW4gVG90YWwgXFxuIEV4cGVuZGl0dXJlcyBcXG4gUGVyIENhcGl0YSBcXG4gRm9yIEFsbCBDaXRpZXMnXG4gICAgICAgICAgICAgICAgICA0MjBcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgb3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgRXhwZW5kaXR1cmVzJ1xuICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3Rvb2x0aXAnOlxuICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgJ3dpZHRoJzogc21hbGxDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgJ2hlaWdodCc6IDMwMFxuICAgICAgICAgICAgICAgICdpc1N0YWNrZWQnOiAndHJ1ZSdcbiAgICAgICAgICAgICAgICAnY29sb3JzJzogWycjMDA1Y2U2JywgJyMwMDk5MzMnXVxuICAgICAgICAgICAgICAgICdjaGFydEFyZWEud2lkdGgnOiAnMTAwJSdcbiAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5Db2x1bW5DaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZmluLWhlYWx0aC1leHBlbmRpdHVyZXMtZ3JhcGgnXG4gICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0J30pXG4gICAgICAgICAgfSwgMjAwMClgXG4gICAgICAgICAgZ29vZ2xlLnNldE9uTG9hZENhbGxiYWNrIGRyYXdDaGFydDtcbiAgICAgICAgICBwbG90X2hhbmRsZXNbJ2Zpbi1oZWFsdGgtZXhwZW5kaXR1cmVzLWdyYXBoJ10gPSdmaW4taGVhbHRoLWV4cGVuZGl0dXJlcy1ncmFwaCdcbiAgICAgIHdoZW4gJ0ZpbmFuY2lhbCBTdGF0ZW1lbnRzJ1xuICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgaCA9ICcnXG4gICAgICAgICAgI2ggKz0gcmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhLCB0ZW1wbGF0ZXNbJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnXVxuICAgICAgICAgIGggKz0gcmVuZGVyX2ZpbmFuY2lhbF9maWVsZHMgZGF0YS5maW5hbmNpYWxfc3RhdGVtZW50cywgdGVtcGxhdGVzWyd0YWJkZXRhaWwtZmluc3RhdGVtZW50LXRlbXBsYXRlJ11cbiAgICAgICAgICBkZXRhaWxfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJ10oY29udGVudDogaClcbiAgICAgICAgICAjdGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtcmV2ZW51ZS1waWUnXVxuICAgICAgICAgICAgZ3JhcGggPSB0cnVlXG4gICAgICAgICAgICBpZiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgICAgICAgIGdyYXBoID0gZmFsc2VcbiAgICAgICAgICAgIGRyYXdDaGFydCA9ICgpIC0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQgKCAtPlxuICAgICAgICAgICAgICAgIHZpc19kYXRhID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLkRhdGFUYWJsZSgpXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdzdHJpbmcnLCAnVG90YWwgR292LiBFeHBlbmRpdHVyZXMnXG4gICAgICAgICAgICAgICAgdmlzX2RhdGEuYWRkQ29sdW1uICdudW1iZXInLCAnVG90YWwnXG5cbiAgICAgICAgICAgICAgICByb3dzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaXRlbSBpbiBkYXRhLmZpbmFuY2lhbF9zdGF0ZW1lbnRzXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS5jYXRlZ29yeV9uYW1lIGlzIFwiUmV2ZW51ZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIFJldmVudWVzXCIpXG5cbiAgICAgICAgICAgICAgICAgICAgciA9IFtcbiAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludCBpdGVtLnRvdGFsZnVuZHNcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICByb3dzLnB1c2gocilcblxuICAgICAgICAgICAgICAgIHZpc19kYXRhLmFkZFJvd3Mgcm93c1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgJ3RpdGxlJzonVG90YWwgUmV2ZW51ZXMnXG4gICAgICAgICAgICAgICAgICAndGl0bGVUZXh0U3R5bGUnOlxuICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDE2XG4gICAgICAgICAgICAgICAgICAndG9vbHRpcCc6XG4gICAgICAgICAgICAgICAgICAgJ3RleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgICdmb250U2l6ZSc6IDEyXG4gICAgICAgICAgICAgICAgICAnd2lkdGgnOiBiaWdDaGFydFdpZHRoXG4gICAgICAgICAgICAgICAgICAnaGVpZ2h0JzogMzUwXG4gICAgICAgICAgICAgICAgICAncGllU3RhcnRBbmdsZSc6IDYwXG4gICAgICAgICAgICAgICAgICAnc2xpY2VWaXNpYmlsaXR5VGhyZXNob2xkJzogLjA1XG4gICAgICAgICAgICAgICAgICAnZm9yY2VJRnJhbWUnOiB0cnVlXG4gICAgICAgICAgICAgICAgICAnY2hhcnRBcmVhJzp7XG4gICAgICAgICAgICAgICAgICAgICB3aWR0aDonOTAlJ1xuICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0Oic3NSUnXG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIydpczNEJyA6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIGlmIGdyYXBoXG4gICAgICAgICAgICAgICAgICBjaGFydCA9IG5ldyBnb29nbGUudmlzdWFsaXphdGlvbi5QaWVDaGFydCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgICAgICAgICBjaGFydC5kcmF3IHZpc19kYXRhLCBvcHRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICksIDEwMDBcbiAgICAgICAgICBpZiBncmFwaFxuICAgICAgICAgICAgYHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGdvb2dsZS5sb2FkKCd2aXN1YWxpemF0aW9uJywgJzEuMCcsIHsncGFja2FnZXMnOiAnY29yZWNoYXJ0J30pXG4gICAgICAgICAgICB9LCAyMDAwKWBcbiAgICAgICAgICAgIGdvb2dsZS5zZXRPbkxvYWRDYWxsYmFjayBkcmF3Q2hhcnQ7XG4gICAgICAgICAgcGxvdF9oYW5kbGVzWyd0b3RhbC1yZXZlbnVlLXBpZSddID0ndG90YWwtcmV2ZW51ZS1waWUnXG4gICAgICAgICAgaWYgbm90IHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddXG4gICAgICAgICAgICBncmFwaCA9IHRydWVcbiAgICAgICAgICAgIGlmIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHMubGVuZ3RoID09IDBcbiAgICAgICAgICAgICAgZ3JhcGggPSBmYWxzZVxuICAgICAgICAgICAgZHJhd0NoYXJ0ID0gKCkgLT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCAoIC0+XG4gICAgICAgICAgICAgICAgdmlzX2RhdGEgPSBuZXcgZ29vZ2xlLnZpc3VhbGl6YXRpb24uRGF0YVRhYmxlKClcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ3N0cmluZycsICdUb3RhbCBHb3YuIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRDb2x1bW4gJ251bWJlcicsICdUb3RhbCdcblxuICAgICAgICAgICAgICAgIHJvd3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBpdGVtIGluIGRhdGEuZmluYW5jaWFsX3N0YXRlbWVudHNcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmNhdGVnb3J5X25hbWUgaXMgXCJFeHBlbmRpdHVyZXNcIikgYW5kIChpdGVtLmNhcHRpb24gaXNudCBcIlRvdGFsIEV4cGVuZGl0dXJlc1wiKVxuXG4gICAgICAgICAgICAgICAgICAgIHIgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQgaXRlbS50b3RhbGZ1bmRzXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgcm93cy5wdXNoKHIpXG5cbiAgICAgICAgICAgICAgICB2aXNfZGF0YS5hZGRSb3dzIHJvd3NcbiAgICAgICAgICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICd0aXRsZSc6J1RvdGFsIEV4cGVuZGl0dXJlcydcbiAgICAgICAgICAgICAgICAgICd0aXRsZVRleHRTdHlsZSc6XG4gICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTZcbiAgICAgICAgICAgICAgICAgICd0b29sdGlwJzpcbiAgICAgICAgICAgICAgICAgICAndGV4dFN0eWxlJzpcbiAgICAgICAgICAgICAgICAgICAgJ2ZvbnRTaXplJzogMTJcbiAgICAgICAgICAgICAgICAgICd3aWR0aCc6IGJpZ0NoYXJ0V2lkdGhcbiAgICAgICAgICAgICAgICAgICdoZWlnaHQnOiAzNTBcbiAgICAgICAgICAgICAgICAgICdwaWVTdGFydEFuZ2xlJzogNjBcbiAgICAgICAgICAgICAgICAgICdzbGljZVZpc2liaWxpdHlUaHJlc2hvbGQnOiAuMDVcbiAgICAgICAgICAgICAgICAgICdmb3JjZUlGcmFtZSc6IHRydWVcbiAgICAgICAgICAgICAgICAgICdjaGFydEFyZWEnOntcbiAgICAgICAgICAgICAgICAgICAgIHdpZHRoOic5MCUnXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6Jzc1JSdcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAjJ2lzM0QnIDogJ3RydWUnXG4gICAgICAgICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgICAgICAgIGNoYXJ0ID0gbmV3IGdvb2dsZS52aXN1YWxpemF0aW9uLlBpZUNoYXJ0IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkICd0b3RhbC1leHBlbmRpdHVyZXMtcGllJ1xuICAgICAgICAgICAgICAgICAgY2hhcnQuZHJhdyB2aXNfZGF0YSwgb3B0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICApLCAxMDAwXG4gICAgICAgICAgaWYgZ3JhcGhcbiAgICAgICAgICAgIGBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBnb29nbGUubG9hZCgndmlzdWFsaXphdGlvbicsICcxLjAnLCB7J3BhY2thZ2VzJzogJ2NvcmVjaGFydCd9KVxuICAgICAgICAgICAgfSwgMjAwMClgXG4gICAgICAgICAgICBnb29nbGUuc2V0T25Mb2FkQ2FsbGJhY2sgZHJhd0NoYXJ0O1xuICAgICAgICAgIHBsb3RfaGFuZGxlc1sndG90YWwtZXhwZW5kaXR1cmVzLXBpZSddID0ndG90YWwtZXhwZW5kaXR1cmVzLXBpZSdcbiAgICAgIGVsc2VcbiAgICAgICAgZGV0YWlsX2RhdGEudGFiY29udGVudCArPSByZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGEsIHRlbXBsYXRlc1sndGFiZGV0YWlsLW5hbWV2YWx1ZS10ZW1wbGF0ZSddXG5cbiAgICBsYXlvdXRfZGF0YS50YWJjb250ZW50ICs9IHRlbXBsYXRlc1sndGFiZGV0YWlsLXRlbXBsYXRlJ10oZGV0YWlsX2RhdGEpXG4gIHJldHVybiB0ZW1wbGF0ZXNbJ3RhYnBhbmVsLXRlbXBsYXRlJ10obGF5b3V0X2RhdGEpXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXG5cblxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxuICAjY2xvbmUgdGhlIGxheW91dFxuICBsID0gJC5leHRlbmQgdHJ1ZSwgW10sIGxheW91dFxuICB0ID1cbiAgICBuYW1lOiBcIk90aGVyXCJcbiAgICBmaWVsZHM6IGdldF91bm1lbnRpb25lZF9maWVsZHMgbCwgZGF0YVxuXG4gIGwucHVzaCB0XG4gIHJldHVybiBsXG5cblxuIyBjb252ZXJ0cyB0YWIgdGVtcGxhdGUgZGVzY3JpYmVkIGluIGdvb2dsZSBmdXNpb24gdGFibGUgdG9cbiMgdGFiIHRlbXBsYXRlXG5jb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZT0odGVtcGwpIC0+XG4gIHRhYl9oYXNoPXt9XG4gIHRhYnM9W11cbiAgIyByZXR1cm5zIGhhc2ggb2YgZmllbGQgbmFtZXMgYW5kIHRoZWlyIHBvc2l0aW9ucyBpbiBhcnJheSBvZiBmaWVsZCBuYW1lc1xuICBnZXRfY29sX2hhc2ggPSAoY29sdW1ucykgLT5cbiAgICBjb2xfaGFzaCA9e31cbiAgICBjb2xfaGFzaFtjb2xfbmFtZV09aSBmb3IgY29sX25hbWUsaSBpbiB0ZW1wbC5jb2x1bW5zXG4gICAgcmV0dXJuIGNvbF9oYXNoXG5cbiAgIyByZXR1cm5zIGZpZWxkIHZhbHVlIGJ5IGl0cyBuYW1lLCBhcnJheSBvZiBmaWVsZHMsIGFuZCBoYXNoIG9mIGZpZWxkc1xuICB2YWwgPSAoZmllbGRfbmFtZSwgZmllbGRzLCBjb2xfaGFzaCkgLT5cbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXG5cbiAgIyBjb252ZXJ0cyBoYXNoIHRvIGFuIGFycmF5IHRlbXBsYXRlXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxuICAgIGEgPSBbXVxuICAgIGZvciBrIG9mIGhhc2hcbiAgICAgIHRhYiA9IHt9XG4gICAgICB0YWIubmFtZT1rXG4gICAgICB0YWIuZmllbGRzPWhhc2hba11cbiAgICAgIGEucHVzaCB0YWJcbiAgICByZXR1cm4gYVxuXG5cbiAgY29sX2hhc2ggPSBnZXRfY29sX2hhc2godGVtcGwuY29sX2hhc2gpXG4gIHBsYWNlaG9sZGVyX2NvdW50ID0gMFxuXG4gIGZvciByb3csaSBpbiB0ZW1wbC5yb3dzXG4gICAgY2F0ZWdvcnkgPSB2YWwgJ2dlbmVyYWxfY2F0ZWdvcnknLCByb3csIGNvbF9oYXNoXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgZmllbGRuYW1lID0gdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaFxuICAgIGlmIG5vdCBmaWVsZG5hbWUgdGhlbiBmaWVsZG5hbWUgPSBcIl9cIiArIFN0cmluZyArK3BsYWNlaG9sZGVyX2NvdW50XG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxuICAgIGZpZWxkTmFtZXNIZWxwW2ZpZWxkbmFtZV0gPSB2YWwgJ2hlbHBfdGV4dCcsIHJvdywgY29sX2hhc2hcbiAgICBpZiBjYXRlZ29yeVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldLnB1c2ggbjogdmFsKCduJywgcm93LCBjb2xfaGFzaCksIG5hbWU6IGZpZWxkbmFtZSwgbWFzazogdmFsKCdtYXNrJywgcm93LCBjb2xfaGFzaClcblxuICBjYXRlZ29yaWVzID0gT2JqZWN0LmtleXModGFiX2hhc2gpXG4gIGNhdGVnb3JpZXNfc29ydCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzXG4gICAgaWYgbm90IGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV1cbiAgICAgIGNhdGVnb3JpZXNfc29ydFtjYXRlZ29yeV0gPSB0YWJfaGFzaFtjYXRlZ29yeV1bMF0ublxuICAgIGZpZWxkcyA9IFtdXG4gICAgZm9yIG9iaiBpbiB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICAgIGZpZWxkcy5wdXNoIG9ialxuICAgIGZpZWxkcy5zb3J0IChhLGIpIC0+XG4gICAgICByZXR1cm4gYS5uIC0gYi5uXG4gICAgdGFiX2hhc2hbY2F0ZWdvcnldID0gZmllbGRzXG5cbiAgY2F0ZWdvcmllc19hcnJheSA9IFtdXG4gIGZvciBjYXRlZ29yeSwgbiBvZiBjYXRlZ29yaWVzX3NvcnRcbiAgICBjYXRlZ29yaWVzX2FycmF5LnB1c2ggY2F0ZWdvcnk6IGNhdGVnb3J5LCBuOiBuXG4gIGNhdGVnb3JpZXNfYXJyYXkuc29ydCAoYSxiKSAtPlxuICAgIHJldHVybiBhLm4gLSBiLm5cblxuICB0YWJfbmV3aGFzaCA9IHt9XG4gIGZvciBjYXRlZ29yeSBpbiBjYXRlZ29yaWVzX2FycmF5XG4gICAgdGFiX25ld2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldID0gdGFiX2hhc2hbY2F0ZWdvcnkuY2F0ZWdvcnldXG5cbiAgdGFicyA9IGhhc2hfdG9fYXJyYXkodGFiX25ld2hhc2gpXG4gIHJldHVybiB0YWJzXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG4gIEB0ZW1wbGF0ZXMgPSB1bmRlZmluZWRcbiAgQGRhdGEgPSB1bmRlZmluZWRcbiAgQGV2ZW50cyA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOigpIC0+XG4gICAgQGxpc3QgPSBbXVxuICAgIEBldmVudHMgPSB7fVxuICAgIHRlbXBsYXRlTGlzdCA9IFsndGFicGFuZWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLXRlbXBsYXRlJywgJ3RhYmRldGFpbC1uYW1ldmFsdWUtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbnN0YXRlbWVudC10ZW1wbGF0ZScsICd0YWJkZXRhaWwtb2ZmaWNpYWwtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWVtcGxveWVlLWNvbXAtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1oZWFsdGgtdGVtcGxhdGUnLCAndGFiZGV0YWlsLWZpbmFuY2lhbC1zdGF0ZW1lbnRzLXRlbXBsYXRlJywgJ3BlcnNvbi1pbmZvLXRlbXBsYXRlJ11cbiAgICB0ZW1wbGF0ZVBhcnRpYWxzID0gWyd0YWItdGVtcGxhdGUnXVxuICAgIEB0ZW1wbGF0ZXMgPSB7fVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlTGlzdFxuICAgICAgQHRlbXBsYXRlc1t0ZW1wbGF0ZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUoJCgnIycgKyB0ZW1wbGF0ZSkuaHRtbCgpKVxuICAgIGZvciB0ZW1wbGF0ZSxpIGluIHRlbXBsYXRlUGFydGlhbHNcbiAgICAgIEhhbmRsZWJhcnMucmVnaXN0ZXJQYXJ0aWFsKHRlbXBsYXRlLCAkKCcjJyArIHRlbXBsYXRlKS5odG1sKCkpXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIHBhcmVudDp0aGlzXG4gICAgICBuYW1lOmxheW91dF9uYW1lXG4gICAgICByZW5kZXI6KGRhdCkgLT5cbiAgICAgICAgQHBhcmVudC5kYXRhID0gZGF0XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQsIHRoaXMsIEBwYXJlbnQpXG4gICAgICBiaW5kOiAodHBsX25hbWUsIGNhbGxiYWNrKSAtPlxuICAgICAgICBpZiBub3QgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdID0gW2NhbGxiYWNrXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHBhcmVudC5ldmVudHNbdHBsX25hbWVdLnB1c2ggY2FsbGJhY2tcbiAgICAgIGFjdGl2YXRlOiAodHBsX25hbWUpIC0+XG4gICAgICAgIGlmIEBwYXJlbnQuZXZlbnRzW3RwbF9uYW1lXVxuICAgICAgICAgIGZvciBlLGkgaW4gQHBhcmVudC5ldmVudHNbdHBsX25hbWVdXG4gICAgICAgICAgICBlIHRwbF9uYW1lLCBAcGFyZW50LmRhdGFcblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG5cbiAgbG9hZF9mdXNpb25fdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIHQgPSBjb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZSB0ZW1wbGF0ZV9qc29uXG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdClcblxuXG4gIGdldF9uYW1lczogLT5cbiAgICAodC5uYW1lIGZvciB0IGluIEBsaXN0KVxuXG4gIGdldF9pbmRleF9ieV9uYW1lOiAobmFtZSkgLT5cbiAgICBmb3IgdCxpIGluIEBsaXN0XG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZSB0aGVuIGlcbiAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICBpZiAoaW5kIGlzIC0xKSB0aGVuIHJldHVybiAgXCJcIlxuXG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgcmV0dXJuIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiXCJcblxuICBhY3RpdmF0ZTogKGluZCwgdHBsX25hbWUpIC0+XG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgQGxpc3RbaW5kXS5hY3RpdmF0ZSB0cGxfbmFtZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiIsIiQgLT5cbiAgIyQoJyNnZXRXaWtpcGVkaWFBcnRpY2xlQnV0dG9uJykub24gJ2NsaWNrJywgLT5cbiAgIyAgJCh0aGlzKS50b2dnbGVDbGFzcygnYWN0aXZlJylcbiAgI2FsZXJ0YWxlcnQgXCJoaVwiXG4gICNhbGVydCAkKFwiI3dpa2lwZWRpYVBhZ2VOYW1lXCIpLnRleHQoKVxuICAjZ2V0X3dpa2lwZWRpYV9hcnRpY2xlKClcbiAgd2luZG93LmdldF93aWtpcGVkaWFfYXJ0aWNsZSA9IGdldF93aWtpcGVkaWFfYXJ0aWNsZVxuICB3aW5kb3cuY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlID0gY3JlYXRlX3dpa2lwZWRpYV9hcnRpY2xlXG5cbmdldF93aWtpcGVkaWFfYXJ0aWNsZT0ocyktPlxuICBhcnRpY2xlX25hbWUgPSBzLnJlcGxhY2UgLy4qXFwvKFteL10qKSQvLCBcIiQxXCJcbiAgJC5nZXRKU09OIFwiaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvdy9hcGkucGhwP2FjdGlvbj1wYXJzZSZwYWdlPSN7YXJ0aWNsZV9uYW1lfSZwcm9wPXRleHQmZm9ybWF0PWpzb24mY2FsbGJhY2s9P1wiLCAoanNvbikgLT4gXG4gICAgJCgnI3dpa2lwZWRpYVRpdGxlJykuaHRtbCBqc29uLnBhcnNlLnRpdGxlXG4gICAgJCgnI3dpa2lwZWRpYUFydGljbGUnKS5odG1sIGpzb24ucGFyc2UudGV4dFtcIipcIl1cbiAgICAkKFwiI3dpa2lwZWRpYUFydGljbGVcIikuZmluZChcImE6bm90KC5yZWZlcmVuY2VzIGEpXCIpLmF0dHIgXCJocmVmXCIsIC0+ICBcImh0dHA6Ly93d3cud2lraXBlZGlhLm9yZ1wiICsgJCh0aGlzKS5hdHRyKFwiaHJlZlwiKVxuICAgICQoXCIjd2lraXBlZGlhQXJ0aWNsZVwiKS5maW5kKFwiYVwiKS5hdHRyIFwidGFyZ2V0XCIsIFwiX2JsYW5rXCJcbiAgXG5jcmVhdGVfd2lraXBlZGlhX2FydGljbGU9IC0+XG4gIGFsZXJ0IFwiTm90IGltcGxlbWVudGVkXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXRfd2lraXBlZGlhX2FydGljbGU6Z2V0X3dpa2lwZWRpYV9hcnRpY2xlXG4iXX0=

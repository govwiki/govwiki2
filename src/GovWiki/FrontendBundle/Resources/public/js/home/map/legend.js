var config = require('./config');
/**
 * TODO: Replace when legend will be ready
 * Init legend (NEW)
 */
function init() {
  // TODO generate legend on fly from given altTypes
  var $legendContainer = $('#menu');
  // Add new elements.
  var compiledLegendItems = '';
  config.legend.forEach(function loop(menuItem) {
    var _altTypeSlug;
    var iconCounty = '';
    var iconMarker = '';
    var fillColor = '';
    var strokeColor = '';
    _altTypeSlug = menuItem.altType.toLowerCase();
    // Colorize markers & counties by range number
    if (window.gw.map.county.colorized) {
      // If url to shape exist - show marker
      if (menuItem.shape) {
        fillColor = 'fillColor="white" ';
        strokeColor = 'strokeColor="' + menuItem.color + '" ';
        iconMarker = '<img src="' + menuItem.shape + '" class="svg" ' + strokeColor + fillColor + '/>';
        // Else - show county line
      } else {
        iconCounty = '<i class="grey-line"></i>';
      }
      // Use default styles (hardcoded in this file)
    } else {
      // If url to shape exist - show marker
      if (menuItem.shape) {
        fillColor = 'fillColor="' + menuItem.color + '" ';
        strokeColor = 'strokeColor="' + menuItem.color + '" ';
        iconMarker = '<img src="' + menuItem.shape + '" class="svg" ' + strokeColor + fillColor + '/>';
        // Else - show county line
      } else {
        iconCounty = '<i class="grey-line"></i>';
      }
    }
    compiledLegendItems += '<li id=' + _altTypeSlug + ' class="' + _altTypeSlug + ' legend-item selected">' +
      '<span class="glyphicon glyphicon-ok"></span>' +
      iconCounty + iconMarker +
      '<a href="javascript:void(0)">' + menuItem.title + '</a>' +
      '</li>';
  });
  $legendContainer.append(compiledLegendItems).css({ opacity: 1 });
  replaceImgToSvg();
  $legendContainer.on('click', '.legend-item', function legendItemClick() {
    var countyName;
    $(this).toggleClass('selected');
    countyName = $(this).attr('id');
    config.subLayers[countyName].toggle();
  });
}
/**
 * Replace all SVG images with inline SVG
 */
function replaceImgToSvg() {
  $('img.svg').each(function loop() {
    var $img = $(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');
    var fillColor = $img.attr('fillColor');
    var strokeColor = $img.attr('strokeColor');
    $.get(imgURL, function load(data) {
      // Get the SVG tag, ignore the rest
      var $svg = $(data).find('svg');
      var $rect = $svg.find('rect');
      var $path = $svg.find('path');
      if ($rect[0] !== undefined) {
        $rect.css({ fill: fillColor, stroke: strokeColor });
      }
      if ($path[0] !== undefined) {
        $path.css({ fill: fillColor, stroke: strokeColor });
      }
      // Add replaced image's ID to the new SVG
      if (typeof imgID !== undefined) {
        $svg = $svg.attr('id', imgID);
      }
      // Add replaced image's classes to the new SVG
      if (typeof imgClass !== undefined) {
        $svg = $svg.attr('class', imgClass + ' replaced-svg');
      }
      // Remove any invalid XML tags as per http://validator.w3.org
      $svg = $svg.removeAttr('xmlns:a');
      // Replace image with new SVG
      $img.replaceWith($svg);
    }, 'xml');
  });
}
module.exports = {
  init: init
};

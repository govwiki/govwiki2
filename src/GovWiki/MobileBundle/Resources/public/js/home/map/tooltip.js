var config = require('./config.js');

/**
 * Init tooltip
 * @param altType
 */
function init(altType) {
  var tooltipTpl = '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"></p>';

  if (config.debug) {
    tooltipTpl += '<p>{{name}} ({{data}})</p>';
  } else {
    tooltipTpl += '<p>{{name}} {{#dataFormatted}} ({{dataFormatted}}) {{/dataFormatted}} </p>';
  }

  tooltipTpl += '</div></div>';
  config.tooltips[altType] = new cdb.geo.ui.Tooltip({
    layer: config.subLayers[altType],
    template: tooltipTpl,
    width: 200,
    position: 'bottom|right'
  });
  config.tooltips[altType].setMask(window.gw.map.coloringConditions.field_mask.mask);
}


/**
 * Add tooltips on page
 * @type {*[]}
 */
function initTooltips() {
  var $mapWrap = $('#map_wrap');
  var $cartodbTooltips = $mapWrap.find('cartodb-tooltip');

  if ($cartodbTooltips.length !== 0) {
    $cartodbTooltips.remove();
  }

  _.forOwn(config.tooltips, function loop(tooltip) {
    $('#map_wrap').append(tooltip.render().el);
  });
}


module.exports = {
  init: init,
  initTooltips: initTooltips
};

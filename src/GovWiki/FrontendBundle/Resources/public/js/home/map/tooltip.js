var config = require('./config.js');
/**
 * Init tooltip
 * @param altType
 */
function init(altType) {
  var tooltipTpl = '<div class="cartodb-tooltip-content-wrapper"> <div class="cartodb-tooltip-content"></p>';
  tooltipTpl += '<p>{{name}} {{#data}} ({{data}}) {{/data}} </p>';
  tooltipTpl += '</div></div>';
  config.tooltips[altType] = new cdb.geo.ui.Tooltip({
    layer: config.subLayers[altType],
    template: tooltipTpl,
    width: 200,
    position: 'bottom|right'
  });
  config.tooltips[altType].setMask(window.gw.map.county.field_mask);
}
module.exports = {
  init: init
};

var origRender;
/**
 * Extend CartoDB Tooltip
 * Get Layer position
 *
 * @returns {number} Layer Position
 */
cdb.geo.ui.Tooltip.prototype.getLayerIndex = function getLayerIndex() {
  return this.options.layer._position;
};
/**
 * Extend CartoDB Tooltip
 * Set data mask for formating 'data' field before displaying.
 *
 * @param {string} mask
 *
 * @returns {cdb.geo.ui.Tooltip}
 */
cdb.geo.ui.Tooltip.prototype.setMask = function setMask(mask) {
  this.options.gw = {
    mask: mask
  };
  return this;
};
/**
 * Override carto db tooltip render method in order to format data before
 * displaying.
 * @author Shemin Dmitry
 */
origRender = cdb.geo.ui.Tooltip.prototype.render;
cdb.geo.ui.Tooltip.prototype.render = function render(data) {
  var tmp = $.extend({}, data);
  if (tmp.data !== null && tmp.data !== 'undefined' && this.options.gw.mask) {
    tmp.dataFormatted = numeral(tmp.data).format(this.options.gw.mask);
  }
  return origRender.call(this, tmp);
};

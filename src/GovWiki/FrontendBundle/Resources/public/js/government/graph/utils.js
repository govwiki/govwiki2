/**
 * Callback to sort viz data for pie charts.
 *
 * @param {Array} a
 * @param {Array} b
 * @return {number}
 */
function rowSortFunction(a, b) {
  if (a[1] > b[1]) {
    return -1;
  } else if (a[1] < b[1]) {
    return 1;
  }

  return 0;
}

module.exports = {
  rowSortFunction: rowSortFunction
};

var map;
var legend;
var baseLayer;
var countySubLayer;
var subLayers = {};
var layersData;
var tooltips = {};
var defaultConditions;
var debug;

var glob = require('../../global.js');

if (!glob.isTest) {
  /**
   * Map object
   *
   * window.gw.map = {
 *     debug: true,
 *     zoom: 6,
 *     centerLatitude: 37.9,
 *     centerLongitude: -119.7,
 *     position: 'left',
 *     username: 'shemindmitry',
 *     year: '2014',
 *     county: {},
 *     legendTypes: ['altTypes', 'range'],
 *     colorizedCountyConditions: {},
 *     legend: [],
 * }
   *
   */
  window.gw.map = JSON.parse(window.gw.map);

  /**
   * window.gw.map.coloringConditions = {
    "colorized": true,
    "fieldName": "total_debt_total_revenue",
    "conditions": [
        {
            "type": "simple",
            "color": "#ff0000",
            "value": "4",
            "operation": "<="
        },
        {
            "type": "simple",
            "color": "#ffff00",
            "value": "2",
            "operation": "<="
        },
        {
            "type": "simple",
            "color": "#80ff00",
            "value": "1",
            "operation": "<="
        },
        {
            "type": "null",
            "color": "#000000"
        }
    ],
    "field_mask": "0.0%",
    "localized_name": "Total Debt / Total Revenue"
    }
   */
  defaultConditions = JSON.parse(JSON.stringify(window.gw.map.coloringConditions));

  /**
   * window.gw.map.legend = [
   {
       "shape": "/img/upload/shape/circle.svg",
       "title": "City",
       "color": "#f702d0",
       "order": 1,
       "altType": "City"
   },
   {
       "title": "County",
       "color": "#828282",
       "order": 2,
       "altType": "County"
   },
   {
       "shape": "/img/upload/shape/triangle.svg",
       "title": "School district",
       "color": "#5ff5f5",
       "order": 3,
       "altType": "School_District"
   },
   {
       "shape": "/img/upload/shape/square.svg",
       "title": "Special district",
       "color": "#57ff7c",
       "order": 4,
       "altType": "Special_District"
   }
   ]
   * @type {Array.<T>}
   */
  legend = window.gw.map.legend.sort(function loop(a, b) {
    return a.order > b.order;
  });

  debug = window.localStorage.getItem('debug');
}

module.exports = {
  map: map,
  legend: legend,
  baseLayer: baseLayer,
  countySubLayer: countySubLayer,
  subLayers: subLayers,
  layersData: layersData,
  tooltips: tooltips,
  defaultConditions: defaultConditions,
  debug: debug
};

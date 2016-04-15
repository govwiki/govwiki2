var legend;
var subLayers = {};
var tooltips = {};
var debug;

/**
 * Map object
 *
 * window.gw.map = {
 *     "debug": true,
 *     "zoom": 6,
 *     "centerLatitude": 37.9,
 *     "centerLongitude": -119.7,
 *     "position": "left",
 *     "username": "shemindmitry",
 *     "year": "2014",
 *     "county": {},
 *     "legendTypes": [ "altTypes", "range" ],
 *     "colorizedCountyConditions": {},
 *     "legend": [],
 * }
 *
 */
window.gw.map = JSON.parse(window.gw.map);

/**
 * TODO: Hardcoded
 * window.gw.map.county = {
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
window.gw.map.county = window.gw.map.colorizedCountyConditions;

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

module.exports = {
  debug: debug,
  legend: legend,
  subLayers: subLayers,
  tooltips: tooltips
};

webpackJsonp([3],[
/* 0 */
/***/ function(module, exports) {

	eval("\n$('#year-selector').change(function () {\n    $loader.show();\n    $map.hide();\n    window.gw.map.year = $(this).find(':selected').val();\n\n    removeAllSubLayers();\n    reInit();\n});\n\n/*****************\n ** WEBPACK FOOTER\n ** ./src/GovWiki/FrontendBundle/Resources/public/js/home/index.js\n ** module id = 0\n ** module chunks = 3\n **/\n//# sourceURL=webpack:///./src/GovWiki/FrontendBundle/Resources/public/js/home/index.js?");

/***/ }
]);
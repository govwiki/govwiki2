/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp"];
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, callbacks = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId])
/******/ 				callbacks.push.apply(callbacks, installedChunks[chunkId]);
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules);
/******/ 		while(callbacks.length)
/******/ 			callbacks.shift().call(null, __webpack_require__);
/******/ 		if(moreModules[0]) {
/******/ 			installedModules[0] = 0;
/******/ 			return __webpack_require__(0);
/******/ 		}
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// "0" means "already loaded"
/******/ 	// Array means "loading", array contains callbacks
/******/ 	var installedChunks = {
/******/ 		0:0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId, callback) {
/******/ 		// "0" is the signal for "already loaded"
/******/ 		if(installedChunks[chunkId] === 0)
/******/ 			return callback.call(null, __webpack_require__);
/******/
/******/ 		// an array means "currently loading".
/******/ 		if(installedChunks[chunkId] !== undefined) {
/******/ 			installedChunks[chunkId].push(callback);
/******/ 		} else {
/******/ 			// start chunk loading
/******/ 			installedChunks[chunkId] = [callback];
/******/ 			var head = document.getElementsByTagName('head')[0];
/******/ 			var script = document.createElement('script');
/******/ 			script.type = 'text/javascript';
/******/ 			script.charset = 'utf-8';
/******/ 			script.async = true;
/******/
/******/ 			script.src = __webpack_require__.p + "" + chunkId + ".js";
/******/ 			head.appendChild(script);
/******/ 		}
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	var styles = JSON.parse(window.gw.styles);
	
	
	if (styles) {
	    styles.forEach(function (style) {
	        parseStyles(style);
	    });
	}
	
	$loaderWrap = $('.loader_wrap');
	$loaderWrap.css({"opacity":0});
	window.setTimeout(function() {
	    $loaderWrap.css({"visibility":"hidden"});
	}, 1000);
	
	
	/**
	 * Parse and applying styles
	 * Based on BemJSON object
	 *
	 * @param {BemJSON} element
	 */
	function parseStyles(element) {
	
	    var block = element.block || element.elem;
	    var $element = $('.' + block);
	    var content = element.content;
	    var mods = element.mods;
	    var attrs = element.attrs;
	
	    /**
	     * Apply styles or hover on current $element
	     */
	    if (mods != null) {
	
	        mods.forEach(function(css) {
	
	            /**
	             * Apply Hover
	             */
	            if (css.pseudo && css.pseudo == 'hover') {
	
	                delete css.pseudo;
	
	                for (var cssKey in css) {
	                    if (css.hasOwnProperty(cssKey)) {
	
	                        (function (cssKey) {
	                            $element.mouseover(function () {
	                                $(this).css(cssKey, css[cssKey]);
	                            });
	                        })(cssKey);
	
	                    }
	                }
	
	                /**
	                 * Apply styles
	                 */
	            } else {
	                $element.css(css);
	                $element.mouseout(function () {
	                    $(this).css(css);
	                });
	            }
	
	        });
	
	    }
	
	    /**
	     * Set/Modify attrs on current $element
	     */
	    if (attrs != null) {
	
	        attrs.forEach(function (attrCollection) {
	
	            for (var attrName in attrCollection) {
	                if (attrCollection.hasOwnProperty(attrName)) {
	
	                    $element.attr(attrName, attrCollection[attrName]);
	
	                }
	            }
	
	        });
	
	    }
	
	    /**
	     * Recursion
	     */
	    if (content instanceof Array) {
	
	        for (var i = 0; i < content.length; i++) {
	            parseStyles(content[i]);
	        }
	
	    } else if (typeof content == 'string') {
	        $element.html(content);
	    }
	
	}
	module.exports = parseStyles;

/***/ }
/******/ ]);
//# sourceMappingURL=common.js.map
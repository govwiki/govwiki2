var $loaderWrap = $('.loader_wrap');
require('bootstrap');
window.changeLocale = require('./localization/localization.js');

$loaderWrap.css({ opacity: 0 });

window.setTimeout(function tick() {
    $loaderWrap.css({ visibility: 'hidden' });
}, 1000);
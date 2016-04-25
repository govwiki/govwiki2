var $loaderWrap = $('.loader_wrap');
require('bootstrap');

$loaderWrap.css({ opacity: 0 });

window.setTimeout(function tick() {
  $loaderWrap.css({ visibility: 'hidden' });
}, 1000);

$loaderWrap = $('.loader_wrap');
$loaderWrap.css({'opacity':0});
window.setTimeout(function() {
  $loaderWrap.css({'visibility':'hidden'});
}, 1000);

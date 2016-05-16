var $loaderWrap = $('.loader_wrap');
require('bootstrap');

$loaderWrap.css({ opacity: 0 });

window.setTimeout(function tick() {
  $loaderWrap.css({ visibility: 'hidden' });
}, 1000);

$('#login-link').click(function login(event) {
  event.preventDefault();

  $('#modal-window').modal('show');
});
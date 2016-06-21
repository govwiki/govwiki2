var $loaderWrap = $('.loader_wrap');
var $changePasswordWindow = $('#change-password-modal-window');

require('bootstrap');

$loaderWrap.css({ opacity: 0 });

window.setTimeout(function tick() {
  $loaderWrap.css({ visibility: 'hidden' });
}, 1000);

$('#login-link').click(function login(event) {
  event.preventDefault();

  $('#modal-window').modal('show');
});

$('#change-password-link').click(function changePassword(event) {
  event.preventDefault();

  $changePasswordWindow.modal('show');
});

if (window.gw.formValid === 0) {
  $changePasswordWindow.modal('show');
}

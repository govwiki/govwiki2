var $changePasswordWindow = $('#change-password-modal-window');

require('bootstrap');

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


require('bootstrap');

$('#login-link').click(function login(event) {
  event.preventDefault();

  $('#modal-window').modal('show');
});
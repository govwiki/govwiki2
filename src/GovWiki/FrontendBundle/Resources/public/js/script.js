// Modal

function showModal(target) {
    $("#modal-window .modal-content").load(target, function() {
        $("#modal-window").modal("show");
    });
}

$('#modal-window').on('hidden.bs.modal', function() {
    $(this).find('.modal-content').html('<div class="modal-body">Loading...</div>');
});

$(function (){
    /*
     Datepicker.
     Add hide on select.
     */
    $('[data-provide="datepicker"]').on('changeDate', function() {
        $(this).datepicker('hide');
    });
});

// Login

$('body').on('submit', '#ajax-login-form', function(event) {
    event.preventDefault();
    $form = $(this);
    $form.parent().find('.alert').remove();
    $.post($form.attr('action'), $form.serialize(), function(data) {
        if (data.error) {
            $form.parent().prepend('<div class="alert alert-warning">' + data.error + '</div>');
        } else {
            location.reload();
        };
    });
});

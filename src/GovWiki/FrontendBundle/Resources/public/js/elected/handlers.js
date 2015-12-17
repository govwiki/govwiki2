$(function() {


    var Handlers = {};

    var authorized = window.gw.authorized;

    $('[data-toggle="tooltip"]').tooltip();

    var $editable = $('.editable');
    $editable.editable({stylesheets: false,type: 'textarea', showbuttons: 'bottom', display: true, emptytext: ' '});
    $editable.off('click');

    $('table').on('click', '.glyphicon-pencil', function (e) {
        console.log('yes');
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.dataset.noEditable !== undefined) return;
        if (!authorized){
            $('#modal-window').modal('show'); // Open login modal window
            window.sessionStorage.setItem('tableType', $(e.target).closest('.tab-pane')[0].id);
            window.sessionStorage.setItem('dataId', $(e.currentTarget).closest('tr').attr('data-id'));
            window.sessionStorage.setItem('field', Number(($(e.currentTarget).closest('td'))[0].cellIndex) + 1);
        } else {
            $(e.currentTarget).closest('td').find('.editable').editable('toggle');
        }

    });

});
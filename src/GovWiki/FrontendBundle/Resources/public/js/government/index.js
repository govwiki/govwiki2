$(function() {

    require('./graphs.js');

    var rankPopover = new RankPopover();

    /**
     * Change fin statement year.
     */
    $('#fin-stmt-year').change(function() {
        var $this = $(this);
        $this.closest('form').submit();
        window.localStorage.setItem('tab', 'Financial_Statements');
    });

    var tab = window.localStorage.getItem('tab');
    if (tab) {
        window.localStorage.removeItem('tab');
        $('.nav-pills a[href="#' + tab + '"]').tab('show');
    }

});

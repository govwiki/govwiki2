$(function(){
    $('[data-loader]').click(function() {
        var loader = new gw.admin.Loader();
        var message = this.attr('data-loader-message') || undefined;

        loader.show(message);
    })
});

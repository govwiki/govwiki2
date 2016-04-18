$(function() {
    $loaderWrap = $('.loader_wrap');
    $loaderWrap.css({"opacity":0});
    window.setTimeout(function() {
        $loaderWrap.css({"visibility":"hidden"});
    }, 1000);

    $('.locale-change').click(function (event) {
        var loader_wrap = $('.loader_wrap');
        loader_wrap.css({'opacity': 1, 'visibility': 'visible'});

    })
});
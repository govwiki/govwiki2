function changeLocale(localeShortName, changeLocaleUrl, current_page_route) {
    if ('government' == current_page_route) {
        var openedTab = $('.tab-titles').find('li.active').find('a').attr('href');
        window.localStorage.setItem('tab', openedTab);
    }

    $.ajax({
        url: changeLocaleUrl,
        data: {'current_url': window.location.pathname, 'locale_short_name': localeShortName}
    });
}

module.exports = changeLocale;
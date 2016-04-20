function changeLocale(localeShortName, changeLocaleUrl, currentPageRoute) {
  var openedTab;
  var loaderWrap = $('.loaderWrap');
  loaderWrap.css({ opacity: 1, visibility: 'visible' });

  if (currentPageRoute === 'government') {
    openedTab = $('.tab-titles').find('li.active').find('a').attr('href');
    window.localStorage.setItem('tab', openedTab);
  }

  $.ajax({
    url: changeLocaleUrl,
    data: { current_url: window.location.pathname, locale_short_name: localeShortName }
  });

  return false;
}

module.exports = changeLocale;

module.exports = function api(cfg) {
  var _cfg = $.extend({
    type: 'POST'
  }, cfg);

  return $.ajax(_cfg)
    .fail(function apiFailHandler(xhr) { alert(JSON.parse(xhr.responseText).error.description); });
};

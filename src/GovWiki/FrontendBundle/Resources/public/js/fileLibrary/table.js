var debounce = require('./debounce');

require('datatables.net');

module.exports = function initializeTable($el, options) {
  var dtTable;
  var opt = $.extend({
    defaultOrder: 'asc',
    columns: [],
    source: null
  }, options);
  var length = [10, 25, 50, 100, -1];
  var labels = ['10', '25', '50', '100', 'All'];
  var lengthMenu;
  var lenIdx;

  for (lenIdx in length) {
    if (length.hasOwnProperty(lenIdx)) {
      lengthMenu += '<option value="' + length[lenIdx] + '">' + labels[lenIdx] + '</option>';
    }
  }

  if (! opt.source) {
    throw new Error('options.source should be specified');
  }

  dtTable = $el.DataTable({ // eslint-disable-line new-cap
    order: [[0, opt.defaultOrder]],
    pageLength: 100,
    lengthMenu: length,
    initComplete: function dtInitialized() {
      var $search = $('input[type="search"]');
      var debouncedSearch = debounce(function dtSearchRequest() {
        dtTable.search($search.val()).draw();
      }, 250);
      var $btn = $('<button style="display: none" class="btn btn-small">Reset</button>');

      $btn.click(function dtReset() {
        dtTable.search('').draw();
        $btn.hide();
      });

      $search
        .off()
        .on('keyup cut paste', function dtSearch() {
          if ($search.val() !== '') {
            $btn.show();
          } else {
            $btn.hide();
          }
        })
        .on('keyup cut paste', debouncedSearch);

      $search.parent().append($btn);
    },
    language: {
      info: 'Show _START_ to _END_ of _TOTAL_ files',
      lengthMenu: 'Show <select class="form-control" style="display: inline-block; width: auto">'
        + lengthMenu + '</select> files'
    },
    autoWidth: false,
    searching: true,
    info: true,
    processing: true,
    serverSide: true,
    ajax: {
      url: opt.source,
      type: 'GET',
      data: function ajaxPayloadTransform(data) {
        var order = {};

        $.each(data.order, function transformColumns(idx, orderCfg) {
          order[data.columns[orderCfg.column].data] = orderCfg.dir;
        });

        return {
          draw: data.draw,
          order: order,
          offset: data.start || 0,
          limit: data.length,
          search: data.search.value
        };
      }
    },
    columns: opt.columns,
    createdRow: function dtCreateRowHandler(row, data) {
      row.dataset.slug = data.slug; // eslint-disable-line no-param-reassign
    }
  });

  return dtTable;
};

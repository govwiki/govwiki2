var initializeTable = require('./table');
var api = require('./api');

var SIZE_POSTFIX = [
  'Bytes',
  'KB',
  'MB',
  'GB',
  'TB'
];

$(function initializeFileLibrary() {
  var $table = $('#documents-table');
  var dtTable = initializeTable($table, {
    defaultOrder: window.gw.defaultOrder,
    columns: columnDefinitionFactory(),
    source: window.gw.urls.files
  });
  var $addModal = setupAddModal(dtTable);
  var $moveModal = setupMoveModal(dtTable);
  var $renameModal = setupRenameModal(dtTable);

  $('#document-add').click(function addModalShow(event) {
    event.stopPropagation();
    event.preventDefault();

    $addModal.modal('show');
  });

  setupHandlers($table, {
    'tbody tr': function rowClick(data) {
      window.location = window.gw.urls.base + '/' + data.slug;
    },
    '.document--action__download': function downloadClick(data) {
      window.location = data.urls.download;
    },
    '.document--action__move': function moveClick(data) {
      $moveModal.find('#move-form').attr('action', data.urls.move);
      $moveModal.find('.modal-title').text('Move "' + data.name + '"');
      $moveModal.modal('show');
    },
    '.document--action__rename': function renameClick(data) {
      $renameModal.find('#document-name').val(data.name + '.' + data.ext);
      $renameModal.find('#rename-form').attr('action', data.urls.rename);
      $renameModal.find('.modal-title').text('Rename "' + data.name + '"');
      $renameModal.modal('show');
    },
    '.document--action__remove': function removeCLick(data) {
      if (confirm('Remove document "' + data.name + '"')) {
        api({
          url: data.urls.remove,
          method: 'DELETE'
        })
          .done(function resolveHandler() { dtTable.draw(); })
          .fail(function rejectHandler(xhr) { alert(JSON.parse(xhr.responseText).error.description); });
      }
    }
  });
});

/**
 * @param dtTable
 *
 * @return {*|jQuery|HTMLElement}
 */
function setupAddModal(dtTable) {
  var $modal = $('#document-add-modal');
  var $form = $modal.find('form');

  $form.submit(function documentAddSubmitHandler(event) {
    var fd = new FormData();

    event.stopPropagation();
    event.preventDefault();

    fd.append('file', $form.find('input').prop('files')[0]);

    apiCallInModal({
      url: event.target.getAttribute('action'),
      method: 'POST',
      data: fd,
      processData: false,
      contentType: false
    }, $modal, dtTable);
  });

  return $modal;
}

/**
 * @param dtTable
 *
 * @return {*|jQuery|HTMLElement}
 */
function setupMoveModal(dtTable) {
  var $modal = $('#document-move-modal');
  var $form = $modal.find('form');
  var $selector = $form.find('#directory');

  $form.submit(function documentMoveSubmitHandler(event) {
    event.stopPropagation();
    event.preventDefault();

    apiCallInModal({
      url: event.target.getAttribute('action'),
      method: 'PUT',
      data: { topLevelDir: $selector.val() }
    }, $modal, dtTable);
  });

  return $modal;
}

/**
 * @param dtTable
 *
 * @return {*|jQuery|HTMLElement}
 */
function setupRenameModal(dtTable) {
  var $modal = $('#document-rename-modal');
  var $form = $modal.find('form');
  var $input = $form.find('#document-name');

  $form.submit(function documentRenameSubmitHandler(event) {
    var newName = $input.val();

    event.stopPropagation();
    event.preventDefault();

    $form.find('.error').hide().text('');
    if (! newName.match(/^[A-Z]{2}\s+.+\s+\d{4}\.\w+$/i)) {
      $form
        .find('.error')
        .show()
        .text('Invalid document name should be matched to next format:' +
          ' two latter state code, name of document, 4 digit year and then file extension');

      return;
    }

    apiCallInModal({
      url: event.target.getAttribute('action'),
      method: 'PUT',
      data: { name: $input.val() }
    }, $modal, dtTable);
  });

  return $modal;
}

/**
 * Setup click handles in specified table.
 *
 * @param $table
 * @param cfg
 */
function setupHandlers($table, cfg) {
  var selector;

  for (selector in cfg) {
    if (cfg.hasOwnProperty(selector)) {
      (function wrapper(_selector) { // eslint-disable-line wrap-iife
        $table.on('click', _selector, function _handler(event) {
          var data = $table.DataTable().row($(this).closest('tr')).data(); // eslint-disable-line new-cap
          event.stopPropagation();
          event.preventDefault();

          cfg[_selector](data);
        });
      })(selector);
    }
  }
}

/**
 * Create column definitions.
 *
 * @return {Array}
 */
function columnDefinitionFactory() {
  var columns = [
    {
      title: 'File',
      data: 'name',
      className: 'document--field__name'
    },
    {
      title: 'File size',
      data: 'fileSize',
      className: 'document--field__file-size',
      render: function renderer(fileSize) {
        var nextPrettyFileSize = fileSize;
        var postfixIdx = 0;
        var prettyFileSize = 0;

        if (fileSize === null) {
          return '';
        }

        do {
          prettyFileSize = nextPrettyFileSize;
          nextPrettyFileSize /= 1024;
          postfixIdx++;
        } while (nextPrettyFileSize > 1);

        return prettyFileSize.toFixed(1) + ' ' + SIZE_POSTFIX[postfixIdx - 1];
      }
    }
  ];

  var ACTIONS = [
    {
      class: 'document-action document--action__download',
      icon: 'fa-download',
      title: 'Download',
      href: function donlowdLink(data) { return data.urls.download; }
    }
  ];

  if (window.gw.showActions) {
    ACTIONS.push({
      class: 'document-action document--action__move',
      icon: 'fa-folder-open',
      title: 'Move'
    });
    ACTIONS.push({
      class: 'document-action document--action__rename',
      icon: 'fa-edit',
      title: 'Rename'
    });
    ACTIONS.push({
      class: 'document-action document--action__remove',
      icon: 'fa-trash',
      title: 'Remove'
    });
  }

  columns.push({
    title: 'Action',
    data: function dataHandler(data) {
      if (data.type === 'directory') {
        return '';
      }

      return $.map(ACTIONS, function actionMapper(action) {
        var href = '#';
        if (action.hasOwnProperty('href') && action.href) {
          href = action.href(data);
        }

        return '<a class="' + action.class + '" href="' + href + '"><i class="fa '
          + action.icon + '"></i> ' + action.title + '</a>';
      }).join('');
    },
    className: 'document--field__actions',
    orderable: false
  });

  return columns;
}

/**
 * @param cfg
 * @param $modal
 * @param dtTable
 */
function apiCallInModal(cfg, $modal, dtTable) {
  var $loader = $modal.find('.loader-wrapper');

  $loader.show();
  api(cfg)
    .done(function successHandler() {
      dtTable.draw();
      $modal.modal('hide');
    })
    .always(function alwaysHandler() {
      $loader.hide();
    });
}

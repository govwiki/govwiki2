var authorized = window.gw.authorized;
var $commentWindow = $('#conversation');
var $editable = $('.editable');
var $pane = $('.tab-pane');
var tableType = window.sessionStorage.getItem('tableType');
var Handlebars = require('../vendor/handlebars.js');

require(__dirname + '/../../../../../../../'
    + 'bower_components/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js');

/*
 Pagination and sorting.
 */

handlerSortAndPagination('.pagination a');
handlerSortAndPagination('.sortable a');

function handlerSortAndPagination(selector) {
  $pane.on('click', selector, function click(e) {
    var $this = $(this);
    var $closestPane = $this.closest('.tab-pane');
    var $closestTabContent = $closestPane.closest('.tab-content');

    var $mainContent = $closestPane.find('.tab-pane-main');
    var $loader = $closestTabContent.find('.loader');

    var entity = $closestPane.attr('id');
    var url = $this.attr('href');

    var firstElement;
    var path;

    e.preventDefault();
    e.stopPropagation();

    if (url.indexOf('api') === -1) {
      url = url.substr(1, url.length);
      firstElement = url.substr(0, url.indexOf('/'));

      if (firstElement === 'app_dev.php') {
        path = url.substr(url.indexOf('/') + 1, url.length);
        url = '/' + firstElement + '/api/v1/elected-official/' + path +
                '&entity=' + entity;
      } else {
        url = '/api/v1/elected-official/' + url + '&entity=' + entity;
      }
    }

    $mainContent.html('');

    $loader.show();
    $.ajax({
      url: url,
      success: function success(data) {
        $loader.hide();
        $mainContent.html(data);
      }
    });
  });
}


$('[data-toggle="tooltip"]').tooltip();

$editable.editable({ stylesheets: false, type: 'textarea', showbuttons: 'bottom', display: true, emptytext: ' ' });
$editable.off('click');

$pane.on('click', 'table .glyphicon-pencil', function click(e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.currentTarget.dataset.noEditable !== undefined) return;
  if (!authorized) {
    $('#modal-window').modal('show'); // Open login modal window
    window.sessionStorage.setItem('tableType', $(e.target).closest('.tab-pane')[0].id);
    window.sessionStorage.setItem('dataId', $(e.currentTarget).closest('tr').attr('data-id'));
    window.sessionStorage.setItem('field', Number(($(e.currentTarget).closest('td'))[0].cellIndex) + 1);
  } else {
    $(e.currentTarget).closest('td').find('.editable').editable('toggle');
  }
});

function clearUrl(url) {
  var result = url;
  var indexOfHashTag;
  var indexOfQuestionMark;

  indexOfHashTag = result.indexOf('#');
  if (indexOfHashTag !== -1) {
    result = result.substring(0, indexOfHashTag);
  }

  indexOfQuestionMark = result.indexOf('?');
  if (indexOfQuestionMark !== -1) {
    result = result.substring(0, indexOfQuestionMark);
  }

  return result;
}

/**
 * Click on comment icon.
 */
$pane.on('click', '.vote', function click() {
  var fbCommentPrevElem;
  var fbCommentElem;
  var fbCommentUrl;
  var fbCommentElemExist;
  var $element = $(this);

  var id = $element.attr('id');

  var electedName = $('.electedController').attr('data-elected-name');
  var name = $element.attr('data-legislation-name');

    // Remove existing Facebook Comment form
  var fbCommentElemExistList = $('.fb-comments', $commentWindow);

  var i = 0;
  for (i; i < fbCommentElemExistList.length; i++) {
    fbCommentElemExist = fbCommentElemExistList[i];
    fbCommentElemExist.parentNode.removeChild(fbCommentElemExist);
  }

  // Create new Facebook Comment form
  fbCommentPrevElem = $('.modal-body', $commentWindow);
  fbCommentElem = document.createElement('DIV');
  fbCommentUrl = clearUrl(window.location.href);
  console.log(fbCommentUrl);

  $(fbCommentElem).addClass('fb-comments');
  fbCommentElem.setAttribute('id', 'comment-form');
  fbCommentElem.setAttribute('data-href', fbCommentUrl + '#vote_' + id);
  fbCommentElem.setAttribute('data-numposts', 5);
  fbCommentPrevElem.append(fbCommentElem);

  FB.XFBML.parse(null, function load() {
    $('.loader', $commentWindow).hide();
  });

  $('#myModalLabel').text(electedName + ' - ' + name);
  $commentWindow.modal('show');
  $('.loader', $commentWindow).show();
});

/**
 * Save event from xEditable, after click on check icon
 */
$pane.on('save', 'a', function save(e, params) {
  var sendObject;
  var entityType = $(this).closest('table').attr('data-entity-type');
  var id = $(this).closest('tr').attr('data-id');
  var field = Object.keys($(this).closest('td')[0].dataset)[0];

  if (field === 'vote' || field === 'didElectedOfficialProposeThis') {
        // Current field owned by ElectedOfficialVote
    entityType = 'ElectedOfficialVote';
    id = $(e.currentTarget).parent().find('span')[0].dataset.id;
  }

  sendObject = {
    editRequest: {
      entityName: entityType,
      entityId: id,
      changes: {}
    }
  };

  sendObject.editRequest.changes[field] = params.newValue;
  sendObject.editRequest = JSON.stringify(sendObject.editRequest);

  $.ajax(window.gw.urls.edit_request, {
    method: 'POST',
    data: sendObject,
    dataType: 'text/json',
    success: function success(response) {
      console.log(response.responseText);
    },
    error: function error(err) {
      if (err.status === 401) {
        $('#modal-window').modal('show'); // Open login modal window
      }
    }
  });
});

$pane.on('click', 'table .add', function click(e) {
  var tabPane;
  var currentEntity;

  tabPane = $(e.target).closest('.tab-pane');
  tableType = tabPane[0].id;
  if (!authorized) {
    $('#modal-window').modal('show'); // Open login modal window
    window.sessionStorage.setItem('tableType', tableType);
    return false;
  }
  currentEntity = null;

  if (tableType === 'Votes') {
    currentEntity = 'Legislation';
    $('#addVotes').modal('toggle').find('form')[0].reset();
  } else if (tableType === 'Contributions') {
    currentEntity = 'Contribution';
    $('#addContributions').modal('toggle').find('form')[0].reset();
  } else if (tableType === 'Endorsements') {
    currentEntity = 'Endorsement';
    $('#addEndorsements').modal('toggle').find('form')[0].reset();
  } else if (tableType === 'Statements') {
    currentEntity = 'PublicStatement';
    $('#addStatements').modal('toggle').find('form')[0].reset();

    /*
     Set get url callback.
     */
    $('.url-input').on('keyup', function keyup() {
      var matchUrl;
      matchUrl = /\b(https?):\/\/([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/i;
      if (matchUrl.test($(this).val())) {
        return $.ajax(window.gw.urls.check_url, {
          method: 'GET',
          data: {
            url: $(this).val().match(matchUrl)[0]
          },
          success: function success(response) {
            var urlContent;
            console.log(response);
            urlContent = $('#url-statement');
            urlContent.find('.url-content-title').text('');
            urlContent.find('.url-content-body').text('');
            urlContent.find('.url-content-img').attr('src', '');
            urlContent.find('.url-content-title').text(response.data.title);
            if (response.type === 'html') {
              urlContent.find('.url-content-img').hide();
              urlContent.find('.url-content-body').text(response.data.body);
            }
            if (response.type === 'youtube') {
              urlContent.find('.url-content-img').attr('src', response.data.preview);
            }
            if (response.type === 'image') {
              urlContent.find('.url-content-img').attr('src', response.data.preview);
            }
            return urlContent.slideDown();
          },
          error: function error(err) {
            var urlContent;
            urlContent = $('#url-statement');
            urlContent.find('.url-content-title').text('');
            urlContent.find('.url-content-body').text('');
            urlContent.find('.url-content-img').attr('src', '');
            urlContent.find('.url-content-body').text(err.responseText);
            return urlContent.slideDown();
          }
        });
      }
      return true;
    });
  }

  if (tabPane.hasClass('loaded')) {
    return false;
  }

  tabPane[0].classList.add('loaded');

  if (currentEntity === 'Legislation') {
    $('#addVotes').find('[data-provide="datepicker"]').on('changeDate', function changeDate() {
      return $(this).datepicker('hide');
    });
        // compiledTemplate = Handlebars.compile($('#legislation-vote').html());
        // return $('#electedVotes').html(compiledTemplate(JSON.parse(window.gw.electedOfficial)));
  } else if (currentEntity === 'PublicStatement') {
    return $('#addStatements').find('[data-provide="datepicker"]').on('changeDate', function changeDate() {
      return $(this).datepicker('hide');
    });
  }
  return true;
});

window.addItem = function addItem(e) {
  var add;
  var associations;
  var childs;
  var data;
  var entityType;
  var i;
  var key;
  var len;
  var modal;
  var modalType;
  var newRecord;
  var obj;
  var ref;
  var ref1;
  var ref2;
  var rowTemplate;
  var select;
  var selectName;
  var selectedText;
  var selectedValue;
  var sendObject;
  var value;
  var person = JSON.parse(window.gw.electedOfficial);
  var allRequiredFieldsFilled;
  var oneChildFieldFilled = false;

  newRecord = {};
  modal = $(e.target).closest('.modal');
  modalType = modal[0].id;
  entityType = modal[0].dataset.entityType;

  /*
    Get value from input fields.
   */
  modal.find('input[type="text"]').each(function loop(index, element) {
    var fieldName;
    fieldName = Object.keys(element.dataset)[0];
    newRecord[fieldName] = element.value;
    return element.value;
  });

    /*
     Get value from texarea's.
     */
  modal.find('textarea').each(function loop(index, element) {
    var fieldName;
    fieldName = Object.keys(element.dataset)[0];
    newRecord[fieldName] = element.value;
    return element.value;
  });

    /*
     Get value from hidden input fields.
     */
  modal.find('input[type="hidden"]').each(function loop(index, element) {
    var fieldName;
    fieldName = Object.keys(element.dataset)[0];
    newRecord[fieldName] = element.value;
    return element.value;
  });

  associations = {};
  if (modalType !== 'addVotes') {
    associations.electedOfficial = person.id;
  } else {
    associations.government = person.government.id;
  }
  childs = [];

  if (modalType === 'addVotes') {
    allRequiredFieldsFilled = true;
    checkFields('addVotesForm');
    if (!allRequiredFieldsFilled) {
      return false;
    }

        /*
         Add information about votes.
         */
    modal.find('#electedVotes').find('tr[data-elected]').each(function loop(idx, element) {
      var childEntityName;
      var fields;
      data = {};

      $(element).find('select').each(function loop2(index, el) {
        var fieldName;
        if (el.value) {
          fieldName = Object.keys(el.dataset)[0];
          data[fieldName] = el.value;
        }
        return el.value;
      });

      /*
       Add only if all fields is set.
       */
      if (Object.keys(data).length === 2) {
        oneChildFieldFilled = true;
        fields = Object.create(null, {});
        fields.fields = data;
        fields.associations = Object.create(null, {});
        fields.associations[element.dataset.entityType] = element.dataset.elected;
        childEntityName = $(element).parent().parent().attr('data-entity-type');
        return childs.push({
          entityName: childEntityName,
          fields: fields
        });
      }
      return true;
    });

    if (!oneChildFieldFilled) {
      window.alert('Please fill at least one of the Vote fields.');
      return false;
    }

    associations[selectName] = selectedValue;
  } else if (modalType === 'addContributions') {
    allRequiredFieldsFilled = true;
    checkFields('addContributionsForm');
    if (!allRequiredFieldsFilled) {
      return false;
    }
    newRecord[selectName] = selectedValue;
  } else if (modalType === 'addEndorsements') {
    allRequiredFieldsFilled = true;
    checkFields('addEndorsementsForm');
    if (!allRequiredFieldsFilled) {
      return false;
    }
    newRecord[selectName] = selectedValue;
  } else if (modalType === 'addStatements') {
    allRequiredFieldsFilled = true;
    checkFields('addStatementsForm');
    if (!allRequiredFieldsFilled) {
      return false;
    }
    associations[selectName] = selectedValue;
  }

  function checkFields(formId) {
    allRequiredFieldsFilled = true;
    $('#' + formId).find('.form-control').each(function loop(idx, element) {
      if (element.required && element.value === '') {
        if (element.tagName === 'SELECT') {
          window.alert('Please select type.');
        } else {
          window.alert('Please fill required field.');
        }
        element.focus();
        allRequiredFieldsFilled = false;
      }
      return false;
    });

    select = modal.find('select')[0];
    selectName = select.name;
    selectedValue = select.options[select.selectedIndex].value;
    selectedText = $(select).find(':selected').text();
  }

  sendObject = {
    createRequest: {
      entityName: entityType,
      user: window.gw.user_id,
      fields: {
        fields: newRecord,
        associations: associations,
        childs: childs
      }
    }
  };

    /*
     Append new entity to table.
     */
  rowTemplate = Handlebars.compile($('#row-' + modalType).html());
  data = Object.create(null, {});
  ref = sendObject.createRequest.fields.fields;
  for (key in ref) {
    if (ref.hasOwnProperty(key)) {
      value = ref[key];
      data[key] = value;
    }
  }
  data.username = window.gw.username;
  console.log(person);
  if (modalType === 'addVotes') {
        /*
         Check if user specified how current elected official voted.
         */
    add = false;
    ref1 = sendObject.createRequest.fields.childs;
    for (i = 0, len = ref1.length; i < len; i++) {
      obj = ref1[i];
      if (Number(obj.fields.associations.electedOfficial) === Number(person.id) && obj.fields.fields.vote) {
        add = true;
        ref2 = obj.fields.fields;
        for (key in ref2) {
          if (ref2.hasOwnProperty(key)) {
            value = ref2[key];
            data[key] = value;
          }
        }
        break;
      }
    }
    if (add) {
      data.category = selectedText;
      $('#Votes tr:last-child').before(rowTemplate(data));
    }
  } else if (modalType === 'addContributions') {
        /*
         Format contribution amount.
         */
    data.contributorType = selectedText;
    data.contributionAmount = numeral(data.contributionAmount).format('0,000');
    $('#Contributions tr:last-child').before(rowTemplate(data));
  } else if (modalType === 'addEndorsements') {
    data.endorserType = selectedText;
    $('#Endorsements tr:last-child').before(rowTemplate(data));
  } else if (modalType === 'addStatements') {
    data.category = selectedText;
    $('#Statements tr:last-child').before(rowTemplate(data));
  }

    /*
     Send create request to api.
     */
  console.log(sendObject);
  $.ajax({
    url: window.gw.urls.create_request,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: sendObject,
    success: function success(res) {
      if (modalType === 'addVotes') {
        alert('Thanks for your submission. Your entry will appear' +
                ' on the elected official profiles within 3-5 business days');
      }
      console.log(res);
    }
  });
  return modal.modal('hide');
};

/*
 Show modal for previously selected modal window.
 */
if (tableType) {
  $('.add', '#' + tableType).click();
  window.sessionStorage.removeItem('tableType');
}

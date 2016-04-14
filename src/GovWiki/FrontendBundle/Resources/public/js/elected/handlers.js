$(function () {
  var Handlers = {};

  var authorized = window.gw.authorized;

    /*
        Pagination and sorting.
     */
  var $pane = $('.tab-pane');

  $pane.on('click', '.pagination a', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this);
    var $pane = $this.closest('.tab-pane');
    var entity = $pane.attr('id');
    var url = $this.attr('href');

    if (url.indexOf('api') == -1) {
      url = url.substr(1, url.length);
      var firstElement = url.substr(0, url.indexOf('/'));


      if ('app_dev.php' == firstElement) {
        var path = url.substr(url.indexOf('/') + 1, url.length);
        url = '/' + firstElement + '/api/v1/elected-official/' + path +
                      '&entity=' + entity;
      } else {
        url = '/api/v1/elected-official/' + url + '&entity=' + entity;
      }
    }

    var $mainContent = $pane.find('.tab-pane-main');
    $mainContent.html('');

    var $loader = $('.tab-content').find('.loader');
    $loader.show();
    $.ajax(url).success(function (data) {
      $loader.hide();
      $mainContent.html(data);
    });
  });

  $pane.on('click', '.sortable a', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this);
    var $pane = $this.closest('.tab-pane');
    var entity = $pane.attr('id');
    var url = $this.attr('href');

    if (url.indexOf('api') == -1) {
      url = url.substr(1, url.length);
      var firstElement = url.substr(0, url.indexOf('/'));


      if ('app_dev.php' == firstElement) {
        var path = url.substr(url.indexOf('/') + 1, url.length);
        url = '/' + firstElement + '/api/v1/elected-official/' + path +
                '&entity=' + entity;
      } else {
        url = '/api/v1/elected-official/' + url + '&entity=' + entity;
      }
    }

    var $mainContent = $pane.find('.tab-pane-main');
    $mainContent.html('');

    var $loader = $('.tab-content').find('.loader');
    $loader.show();
    $.ajax(url).success(function (data) {
      $loader.hide();
      $mainContent.html(data);
    });
  });

  $('[data-toggle="tooltip"]').tooltip();

  var $editable = $('.editable');
  $editable.editable({ stylesheets: false, type: 'textarea', showbuttons: 'bottom', display: true, emptytext: ' ' });
  $editable.off('click');

  $pane.on('click', 'table .glyphicon-pencil', function (e) {
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

    // Refresh Disqus thread
  function refresh_disqus(newIdentifier, newUrl, newTitle) {

    DISQUS.reset({
      reload: true,
      config: function () {
        this.page.identifier = newIdentifier;
        this.page.url = newUrl;
        this.page.title = newTitle;
      }
    });

  }

  function clearUrl(url) {
    var result = url;

    var indexOfHashTag = result.indexOf('#');
    if (-1 != indexOfHashTag) {
      result = result.substring(0, indexOfHashTag);
    }

    var indexOfQuestionMark = result.indexOf('?');
    if (-1 != indexOfQuestionMark) {
      result = result.substring(0, indexOfQuestionMark);
    }

    return result;
  }

  var $commentWindow = $('#conversation');


    // Click on comment icon.
  $pane.on('click', '.vote', function () {
    var $element = $(this);

    var id = $element.attr('id');

    var electedName = $('.electedController').attr('data-elected-name');
    var name = $element.attr('data-legislation-name');

        // Remove existing Facebook Comment form
    var fbCommentElemExistList = $('.fb-comments', $commentWindow);
    for (var i = 0; i < fbCommentElemExistList.length; i++) {
      var fbCommentElemExist = fbCommentElemExistList[i];
      fbCommentElemExist.parentNode.removeChild(fbCommentElemExist);
    }

        // Create new Facebook Comment form
    var fbCommentPrevElem = $('.modal-body', $commentWindow);
    var fbCommentElem = document.createElement('DIV');
    fbCommentUrl = clearUrl(window.location.href);
    $(fbCommentElem).addClass('fb-comments');
    fbCommentElem.setAttribute('id', 'comment-form');
    fbCommentElem.setAttribute('data-href', fbCommentUrl + '#vote_' + id);
    fbCommentElem.setAttribute('data-numposts', 5);
    fbCommentPrevElem.append(fbCommentElem);

    FB.XFBML.parse(null, function () {
      $('.loader', $commentWindow).hide();
    });

    $('#myModalLabel').text(electedName + ' - ' + name);
    $commentWindow.modal('show');
    $('.loader', $commentWindow).show();

        // refresh_disqus(id, 'http://govwiki.us' + '/' + id, name);
  });

    // Save event from xEditable, after click on check icon
  $pane.on('save', 'a', function (e, params) {

    var entityType = $(this).closest('table').attr('data-entity-type');
    var id = $(this).closest('tr').attr('data-id');
    var field = Object.keys($(this).closest('td')[0].dataset)[0];

    if (field === 'vote' || field === 'didElectedOfficialProposeThis') {

            /*
             Current field owned by ElectedOfficialVote
             */
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

    console.log(sendObject);

    $.ajax(window.gw.urls.edit_request, {
      method: 'POST',
      data: sendObject,
      dataType: 'text/json',
      success: function (response) {
        console.log(response.responseText);
      },
      error: function (error) {
        if (error.status === 401) {
          $('#modal-window').modal('show'); // Open login modal window
        }
      }
    });
  });

  $pane.on('click', 'table .add', function (e) {
    var compiledTemplate, currentEntity, insertCategories, tabPane, tableType;
    tabPane = $(e.target).closest('.tab-pane');
    tableType = tabPane[0].id;
    if (!authorized) {
      $('#modal-window').modal('show'); // Open login modal window
      window.sessionStorage.setItem('tableType', tableType);
      return false;
    }
    currentEntity = null;
    console.log(tableType);
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
      $('.url-input').on('keyup', function () {
        var match_url;
        match_url = /\b(https?):\/\/([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/i;
        if (match_url.test($(this).val())) {
          return $.ajax(window.gw.urls.check_url, {
            method: 'GET',
            data: {
                url: $(this).val().match(match_url)[0]
              },
            success: function (response) {
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
            error: function (error) {
                var urlContent;
                console.log(error);
                urlContent = $('#url-statement');
                urlContent.find('.url-content-title').text('');
                urlContent.find('.url-content-body').text('');
                urlContent.find('.url-content-img').attr('src', '');
                urlContent.find('.url-content-body').text(error.responseText);
                return urlContent.slideDown();
              }
          });
        }
      });
    }
    if (tabPane.hasClass('loaded')) {
      return false;
    }
    tabPane[0].classList.add('loaded');
    if (currentEntity === 'Endorsement') {

    } else if (currentEntity === 'Contribution') {

    } else if (currentEntity === 'Legislation') {
      $('#addVotes').find('[data-provide="datepicker"]').on('changeDate', function () {
        return $(this).datepicker('hide');
      });
            // compiledTemplate = Handlebars.compile($('#legislation-vote').html());
            // return $('#electedVotes').html(compiledTemplate(JSON.parse(window.gw.electedOfficial)));
    } else if (currentEntity === 'PublicStatement') {
      return $('#addStatements').find('[data-provide="datepicker"]').on('changeDate', function () {
        return $(this).datepicker('hide');
      });
    }
  });

  window.addItem = function (e) {
    var add, associations, childs, data, entityType, i, key, len, modal, modalType, newRecord, obj, ref, ref1, ref2, rowTemplate, select, selectName, selectedText, selectedValue, sendObject, value;
    newRecord = {};
    modal = $(e.target).closest('.modal');
    modalType = modal[0].id;
    entityType = modal[0].dataset.entityType;
    console.log(entityType);

    var person = JSON.parse(window.gw.electedOfficial);

        /*
         Get value from input fields.
         */
    modal.find('input[type="text"]').each(function (index, element) {
      var fieldName;
      fieldName = Object.keys(element.dataset)[0];
      return newRecord[fieldName] = element.value;
    });

        /*
         Get value from texarea's.
         */
    modal.find('textarea').each(function (index, element) {
      var fieldName;
      fieldName = Object.keys(element.dataset)[0];
      return newRecord[fieldName] = element.value;
    });

        /*
         Get value from hidden input fields.
         */
    modal.find('input[type="hidden"]').each(function (index, element) {
      var fieldName;
      fieldName = Object.keys(element.dataset)[0];
      return newRecord[fieldName] = element.value;
    });

    associations = {};
    if (modalType !== 'addVotes') {
      associations['electedOfficial'] = person.id;
    } else {
      associations['government'] = person.government.id;
    }
    childs = [];
    var allRequiredFieldsFilled;
    if (modalType === 'addVotes') {

      allRequiredFieldsFilled = true;
      checkFields('addVotesForm');
      if (!allRequiredFieldsFilled) {
        return false;
      }

            /*
             Add information about votes.
             */
      var oneChildFieldFilled = false;
      modal.find('#electedVotes').find('tr[data-elected]').each(function (idx, element) {
        var childEntityName, data, fields;
        element = $(element);
        data = Object.create(null, {});
        element.find('select').each(function (index, element) {
          var fieldName;
          if (element.value) {
            fieldName = Object.keys(element.dataset)[0];
            return data[fieldName] = element.value;
          }
        });

                /*
                 Add only if all fields is set.
                 */
        if (Object.keys(data).length === 2) {
          oneChildFieldFilled = true;
          fields = Object.create(null, {});
          fields['fields'] = data;
          fields['associations'] = Object.create(null, {});
          fields['associations'][element.attr('data-entity-type')] = element.attr('data-elected');
          childEntityName = element.parent().parent().attr('data-entity-type');
          return childs.push({
            entityName: childEntityName,
            fields: fields
          });
        }
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
      $('#' + formId).find('.form-control').each(function checkFields(idx, element) {
        if (element.required && element.value == '') {
          if (element.tagName == 'SELECT') {
            window.alert('Please select type.');
          } else {
            window.alert('Please fill required field.');
          }
          element.focus();
          allRequiredFieldsFilled = false;
          return false;
        }
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
      value = ref[key];
      data[key] = value;
    }
    data['username'] = window.gw.username;
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
            value = ref2[key];
            data[key] = value;
          }
          break;
        }
      }
      if (add) {
        data['category'] = selectedText;
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
      data['category'] = selectedText;
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
      success: function (data) {
        return console.log(data);
      }
    });
    return modal.modal('hide');
  };

    /*
     Show modal for previously selected modal window.
     */
  var tableType = window.sessionStorage.getItem('tableType');
  if (tableType) {
    $('.add', '#' + tableType).click();
    window.sessionStorage.removeItem('tableType');
  }
});

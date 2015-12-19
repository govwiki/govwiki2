$(function() {


    var Handlers = {};

    var authorized = window.gw.authorized;

    $('[data-toggle="tooltip"]').tooltip();

    var $editable = $('.editable');
    $editable.editable({stylesheets: false,type: 'textarea', showbuttons: 'bottom', display: true, emptytext: ' '});
    $editable.off('click');

    $('table').on('click', '.glyphicon-pencil', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.dataset.noEditable !== undefined) return;
        if (!authorized){
            $('#modal-window').modal('show'); // Open login modal window
            window.sessionStorage.setItem('tableType', $(e.target).closest('.tab-pane')[0].id);
            window.sessionStorage.setItem('dataId', $(e.currentTarget).closest('tr').attr('data-id'));
            window.sessionStorage.setItem('field', Number(($(e.currentTarget).closest('td'))[0].cellIndex) + 1);
        } else {
            $(e.currentTarget).closest('td').find('.editable').editable('toggle');
        }

    });

    // Refresh Disqus thread
    function refresh_disqus (newIdentifier, newUrl, newTitle) {

        DISQUS.reset({
            reload: true,
            config: function(){
                this.page.identifier = newIdentifier;
                this.page.url = newUrl;
                this.page.title = newTitle;
            }
        });

    }

    // Click on disqus icon
    $('.vote').on('click', function() {

        var $element = $(this);

        var id = $element.attr('id');

        var name = $element.attr('data-legislation-name');

        $('#myModalLabel').text(name + ' (In development)');
        $('#conversation').modal('show');

        refresh_disqus(id, 'http://govwiki.us' + '/' + id, name);
    });

    // Save event from xEditable, after click on check icon
    $('a').on('save', function(e, params) {

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

        $.ajax('/api/v1/edit-request/create', {
            method: 'POST',
            data: sendObject,
            dataType: 'text/json',
            success: function(response) {
                console.log(response.responseText);
            },
            error: function(error) {
                if (error.status === 401) {
                    $('#modal-window').modal('show'); // Open login modal window
                }
            }
        });
    });

    $('table').on('click', '.add', function(e) {
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
            $('#addVotes').modal('toggle').find('form')[0].reset();;
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
            $('.url-input').on('keyup', function() {
                var match_url;
                match_url = /\b(https?):\/\/([\-A-Z0-9.]+)(\/[\-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?/i;
                if (match_url.test($(this).val())) {
                    return $.ajax('/api/v1/url/extract', {
                        method: 'GET',
                        data: {
                            url: $(this).val().match(match_url)[0]
                        },
                        success: function(response) {
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
                        error: function(error) {
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
            $('#addVotes').find('[data-provide="datepicker"]').on('changeDate', function() {
                return $(this).datepicker('hide');
            });
            //compiledTemplate = Handlebars.compile($('#legislation-vote').html());
            //return $('#electedVotes').html(compiledTemplate(JSON.parse(window.gw.electedOfficial)));
        } else if (currentEntity === 'PublicStatement') {
            return $('#addStatements').find('[data-provide="datepicker"]').on('changeDate', function() {
                return $(this).datepicker('hide');
            });
        }
    });

    window.addItem = function(e) {
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
        modal.find('input[type="text"]').each(function(index, element) {
            var fieldName;
            fieldName = Object.keys(element.dataset)[0];
            return newRecord[fieldName] = element.value;
        });

        /*
         Get value from texarea's.
         */
        modal.find('textarea').each(function(index, element) {
            var fieldName;
            fieldName = Object.keys(element.dataset)[0];
            return newRecord[fieldName] = element.value;
        });
        associations = {};
        if (modalType !== 'addVotes') {
            associations["electedOfficial"] = person.id;
        } else {
            associations["government"] = person.government.id;
        }
        childs = [];
        if (modalType === 'addVotes') {

            /*
             Add information about votes.
             */
            modal.find('#electedVotes').find('tr[data-elected]').each(function(idx, element) {
                var childEntityName, data, fields;
                element = $(element);
                data = Object.create(null, {});
                element.find('select').each(function(index, element) {
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
            select = modal.find('select')[0];
            selectName = select.name;
            selectedValue = select.options[select.selectedIndex].value;
            if (selectedValue === '') {
                window.alert('Please select category.');
                select.focus();
                return false;
            }
            selectedText = $(select).find(':selected').text();
            associations[selectName] = selectedValue;
        } else if (modalType === 'addContributions') {
            select = modal.find('select')[0];
            selectName = select.name;
            selectedValue = select.options[select.selectedIndex].value;
            if (selectedValue === '') {
                window.alert('Please select type.');
                select.focus();
                return false;
            }
            selectedText = $(select).find(':selected').text();
            newRecord[selectName] = selectedValue;
        } else if (modalType === 'addEndorsements') {
            select = modal.find('select')[0];
            selectName = select.name;
            selectedValue = select.options[select.selectedIndex].value;
            if (selectedValue === '') {
                window.alert('Please select type.');
                select.focus();
                return false;
            }
            selectedText = $(select).find(':selected').text();
            newRecord[selectName] = selectedValue;
        } else if (modalType === 'addStatements') {
            select = modal.find('select')[0];
            selectName = select.name;
            selectedValue = select.options[select.selectedIndex].value;
            if (selectedValue === '') {
                window.alert('Please select category.');
                select.focus();
                return false;
            }
            selectedText = $(select).find(':selected').text();
            associations[selectName] = selectedValue;
        }
        sendObject = {
            createRequest: {
                entityName: entityType,
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
        rowTemplate = Handlebars.compile($("#row-" + modalType).html());
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
                if (Number(obj.fields.associations.electedOfficial) === Number(person.id)) {
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
            url: '/api/v1/create-request/create',
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: sendObject,
            success: function(data) {
                return console.log(data);
            }
        });
        return modal.modal('hide');
    };

});
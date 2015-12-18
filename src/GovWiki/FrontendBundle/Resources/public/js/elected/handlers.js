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

        $.ajax('/editrequest/create', {
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
                    return $.ajax('/api/url/extract', {
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
        insertCategories = function(select) {
            var endObj, key, option, results;
            endObj = {};
            categories.forEach(function(item) {
                return endObj[item.id] = item.name;
            });
            select.setAttribute('name', 'issueCategory');
            option = document.createElement('option');
            option.setAttribute('value', '');
            option.textContent = '';
            select.innerHTML += option.outerHTML;
            results = [];
            for (key in endObj) {
                option = document.createElement('option');
                option.setAttribute('value', key);
                option.textContent = endObj[key];
                results.push(select.innerHTML += option.outerHTML);
            }
            return results;
        };
        if (tabPane.hasClass('loaded')) {
            return false;
        }
        tabPane[0].classList.add('loaded');
        if (currentEntity === 'Endorsement') {

        } else if (currentEntity === 'Contribution') {

        } else if (currentEntity === 'Legislation') {
            insertCategories($('#addVotes select')[0]);
            $('#addVotes').find('[data-provide="datepicker"]').on('changeDate', function() {
                return $(this).datepicker('hide');
            });
            compiledTemplate = Handlebars.compile($('#legislation-vote').html());
            return $('#electedVotes').html(compiledTemplate(electedOfficials));
        } else if (currentEntity === 'PublicStatement') {
            insertCategories($('#addStatements select')[0]);
            return $('#addStatements').find('[data-provide="datepicker"]').on('changeDate', function() {
                return $(this).datepicker('hide');
            });
        }
    });

});
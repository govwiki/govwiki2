
$(function() {
    var government = JSON.parse(window.gw.government);

    var graphs = require('./graphs.js');
    new (require('./rank-popover.js'))({
        year: JSON.parse(window.gw.government).currentYear
    });
    var Step1 = require('./form/compare/step-1.js');
    var Step2 = require('./form/compare/step-2.js');
    var Step3 = require('./form/compare/step-3.js');
    var Step31 = require('./form/compare/step-3-1.js');

    graphs.init(function (data) {
        console.log(data);
        graphs.forceInit();
    });

    /**
     * Status of form steps
     * If step isn't completed - dependency fields will be .disabled
     *
     * @typedef FormState
     * @type {{firstStep: boolean, secondStep: boolean, thirdStep: boolean}}
     */
    var FormState = {
        firstStep: {
            completed: true,
            data: {},
            complete: function() {
                this.completed = true;

                step2.unlock();

                // If first step
                if (FormState.firstStep.completed && FormState.secondStep.completed) {
                    // Default action if thirdSteps not initialized
                    if (!FormState.thirdStep.completed || !FormState.thirdOneStep.completed) {
                        step31.loadComparedData('Financial Statement', 'Revenues', true);
                    }
                    step31.unlock();
                    step3.unlock();
                }
            },
            incomplete: function() {
                this.completed = false;

                step2.lock();
                step3.lock();
                step31.lock();
            }
        },
        secondStep: {
            completed: false,
            data: {},
            complete: function() {
                this.completed = true;

                if (FormState.firstStep.completed && FormState.secondStep.completed) {
                    // Default action if thirdSteps not initialized
                    if (!FormState.thirdStep.completed || !FormState.thirdOneStep.completed) {
                        step31.loadComparedData('Financial Statement', 'Revenues', true);
                    }
                    step31.unlock();
                    step3.unlock();
                }
            },
            incomplete: function() {
                this.completed = false;

                step31.lock();
                step3.lock();
            }
        },
        thirdStep: {
            completed: false,
            data: {},
            complete: function() {
                this.completed = false;
            },
            incomplete: function() {
                this.completed = true;
            }
        },
        thirdOneStep: {
            completed: false,
            data: {},
            complete: function() {
                this.completed = false;
            },
            incomplete: function() {
                this.completed = true;
            }
        }
    };

    var step1, step2, step3, step31;
    step1 = new Step1(FormState, '.first-condition');
    step1.unlock();

    step2 = new Step2(FormState, '.second-condition');
    step2.lock();

    step3 = new Step3(FormState, '.government-categories .caption');
    step3.lock();

    step31 = new Step31(FormState, '.government-categories .category');
    step31.lock();


    /**
     * Change fin statement year.
     */
    $('#fin-stmt-year').change(function() {
        var $this = $(this);
        $this.closest('form').submit();
        window.localStorage.setItem('tab', 'Financial_Statements');
    });

    var tab = window.localStorage.getItem('tab');
    if (tab) {
        window.localStorage.removeItem('tab');
        $('.nav-pills a[href="' + tab + '"]').tab('show');
    }

    /*
        Subscribe to government
     */
    var $subscribeBtn = $('#subscribe');

    if ($subscribeBtn.hasClass('subscribe')) {
        $('#chat_message_container').hide();
    } else {
        $('#chat_message_container').show();
    }

    $subscribeBtn.click(function(event) {
        event.preventDefault();
        event.stopPropagation();

        $.ajax({
            url: $subscribeBtn.attr('href')
        }).done(function() {

            if ($subscribeBtn.hasClass('subscribe')) {
                $('#chat_message_container').show();
                $subscribeBtn
                    .text('Unsubscribe')
                    .removeClass('subscribe')
                    .removeClass('btn-success')
                    .addClass('unsubscribe')
                    .addClass('btn-danger')
            } else {
                $('#chat_message_container').hide();
                $subscribeBtn
                    .text('Subscribe')
                    .removeClass('unsubscribe')
                    .removeClass('btn-danger')
                    .addClass('subscribe')
                    .addClass('btn-success')
            }
        });
    });

    /*
        Reload data for government by given year.
     */
    $('#year-selector').change(function() {
        var selectedYear = $(this).find(':selected').val();
        var openedTab = $('.tab-titles').find('li.active').find('a').attr('href');

        window.location.search = '?year=' + selectedYear;
        window.localStorage.setItem('tab', openedTab);
    });

    // Table pagination handler.
    var $pane = $('.paginate');

    $pane.on('click', '.pagination a', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        var $pane = $this.closest('.tab-pane');
        var url = $this.attr('href');

        if (url.indexOf('api') == -1) {
            url = url.substr(1, url.length);
            var firstElement = url.substr(0, url.indexOf('/'));
            var query = url.substr(url.indexOf('?') + 1, url.length);

            if ('app_dev.php' == firstElement) {
                url = '/' + firstElement + '/api/v1/government/'+ government.id
                    +'/salaries?'+ query;
            } else {
                url = '/api/v1/government/'+ government.id +'/salaries?'+ query;
            }
        }

        var $mainContent = $pane.find('.tab-pane-main');
        $mainContent.html('');

        var $loader = $('.tab-content').find('.loader');
        $loader.show();
        $.ajax(url).success(function(data) {
            $loader.hide();
            $mainContent.html(data);
        });
    });

    $pane.on('click', '.sortable a', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        var $pane = $this.closest('.tab-pane');
        var url = $this.attr('href');

        if (url.indexOf('api') == -1) {
            url = url.substr(1, url.length);
            var firstElement = url.substr(0, url.indexOf('/'));
            var query = url.substr(url.indexOf('?') + 1, url.length);

            if ('app_dev.php' == firstElement) {
                url = '/' + firstElement + '/api/v1/government/'+ government.id
                +'/salaries?'+ query;
            } else {
                url = '/api/v1/government/'+ government.id +'/salaries?'+ query;
            }
        }

        var $mainContent = $pane.find('.tab-pane-main');
        $mainContent.html('');

        var $loader = $('.tab-content').find('.loader');
        $loader.show();
        $.ajax(url).success(function(data) {
            $loader.hide();
            $mainContent.html(data);
        });
    });
});

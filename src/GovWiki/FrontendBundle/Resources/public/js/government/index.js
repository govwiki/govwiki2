
$(function() {

    require('./graphs.js');
    new (require('./rank-popover.js'))();
    var Step1 = require('./form/compare/step-1.js');
    var Step2 = require('./form/compare/step-2.js');
    var Step3 = require('./form/compare/step-3.js');
    var Step31 = require('./form/compare/step-3-1.js');

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
                if (FormState.firstStep.completed && FormState.secondStep.completed) {
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
        $('.nav-pills a[href="#' + tab + '"]').tab('show');
    }

});

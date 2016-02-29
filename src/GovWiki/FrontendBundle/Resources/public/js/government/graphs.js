var employeeCompensationGraphs = require('./graph/employee-compensation');
var financialHealthGraphs = require('./graph/financial-health');
var financialStatementGraphs = require('./graph/financial-statement');

/**
 * Initialization
 */
function init() {
    handler_onTabSwitch();
}

/**
 * (Handler)
 * On tab switch
 */
function handler_onTabSwitch() {

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

        var tabname = $(e.target).attr('data-tabname');

        /**
         * Init graphs
         */
        switch (tabname) {
            case 'Quality of Services':
                break;
            case 'Employee Compensation':
                employeeCompensationGraphs.initAll();
                break;
            case 'Financial Health':
                financialHealthGraphs.initAll();
                break;
            case 'Financial Financial_Statements':
                financialStatementGraphs.initAll();
                break;
        }

    });

}

google.load('visualization', '1.0', {'packages': ['treemap', 'corechart'], 'callback': init});

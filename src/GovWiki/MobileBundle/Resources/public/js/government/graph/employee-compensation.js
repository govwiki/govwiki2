var data = require('./glob.js').data;
var chart = require('./config.js').chart;

/**
 * Initialization
 */
function init() {
    employeeCompensation_one();
    employeeCompensation_two();
}

/**
 * median-comp-graph
 */
function employeeCompensation_one() {
    /*
     Ahtung! Hardcode detected!
     todo replace such bad code
     */
    if (! data['median_salary_per_full_time_emp']) {
        data['median_salary_per_full_time_emp'] = data['median_salary_for_full_time_employees'];
    }
    if (! data['median_benefits_per_ft_emp']) {
        data['median_benefits_per_ft_emp'] = data['median_benefits_for_full_time_employees'];
    }

    if (data['median_wages_general_public'] == 0) {
        data['median_wages_general_public'] = undefined;
    }

    if (data['median_benefits_general_public'] == 0) {
        data['median_benefits_general_public'] = undefined;
    }

    if (!data['median_salary_per_full_time_emp'] || !data['median_benefits_per_ft_emp'] ||
        !data['median_wages_general_public'] || !data['median_benefits_general_public']) {
        return;
    }

    var chart, formatter, options, container, vis_data;
    vis_data = new google.visualization.DataTable();
    vis_data.addColumn('string', 'Median Compensation');
    vis_data.addColumn('number', 'Wages');
    vis_data.addColumn('number', 'Bens.');
    vis_data.addRows([
        [
            toTitleCase(data.name + '\n Employees'),
            +data['median_salary_per_full_time_emp'],
            +data['median_benefits_per_ft_emp']
        ],
        [
            'All \n' + toTitleCase(data.name + ' \n Residents'),
            +data['median_wages_general_public'],
            +data['median_benefits_general_public']
        ]
    ]);
    formatter = new google.visualization.NumberFormat({
        groupingSymbol: ',',
        fractionDigits: '0'
    });
    formatter.format(vis_data, 1);
    formatter.format(vis_data, 2);


    container = 'mobile-median-comp-graph';
    options = {
        'title': 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
        'titleTextStyle': {
            'fontSize': 12
        },
        'tooltip': {
            'textStyle': {
                'fontSize': 12
            }
        },
        'width': '100%',
        'height': '100%',
        'isStacked': 'true',
        'colors': ['#005ce6', '#009933']
    };


    chart = new google.visualization.ColumnChart(document.getElementById(container));
    chart.draw(vis_data, options);


    function toTitleCase (str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

}

/**
 * median-pension-graph
 */
function employeeCompensation_two() {
    /*
     Ahtung! Hardcode detected!
     todo replace such bad code
     */
    if (! data['median_pension30_year_retiree']) {
        data['median_pension30_year_retiree'] = data['median_pension_for_retiree_with_30_years_service'];
    }

    if (! data['median_pension30_year_retiree']) {
        return;
    }

    var chart, formatter, options, container, vis_data;
    vis_data = new google.visualization.DataTable();
    vis_data.addColumn('string', 'Median Pension');
    vis_data.addColumn('number', 'Wages');
    vis_data.addRows([['Pension for \n Retiree w/ 30 Years', +data['median_pension30_year_retiree']]]);
    formatter = new google.visualization.NumberFormat({
        groupingSymbol: ',',
        fractionDigits: '0'
    });
    formatter.format(vis_data, 1);

    container = 'mobile-median-pension-graph';
    options = {
        'title': 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
        'titleTextStyle': {
            'fontSize': 12
        },
        'tooltip': {
            'textStyle': {
                'fontSize': 12
            }
        },
        'width': '100%',
        'height': '100%',
        'isStacked': 'true',
        'colors': ['#005ce6', '#009933']
    };

    chart = new google.visualization.ColumnChart(document.getElementById(container));
    chart.draw(vis_data, options);
}


module.exports = {
    init: init,
    initAll: init
};

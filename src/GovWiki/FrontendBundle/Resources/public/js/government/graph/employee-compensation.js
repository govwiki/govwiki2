var data = require('./glob.js').data;

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
  var chart;
  var formatter;
  var options;
  var container;
  var visData;
  /*
   Ahtung! Hardcode detected!
   todo replace such bad code
   */
  if (!data.median_salary_per_full_time_emp) {
    data.median_salary_per_full_time_emp = data.median_salary_for_full_time_employees;
  }
  if (!data.median_benefits_per_ft_emp) {
    data.median_benefits_per_ft_emp = data.median_benefits_for_full_time_employees;
  }

  if (data.median_wages_general_public === 0) {
    data.median_wages_general_public = undefined;
  }

  if (data.median_benefits_general_public === 0) {
    data.median_benefits_general_public = undefined;
  }

  if (!data.median_salary_per_full_time_emp ||
    !data.median_benefits_per_ft_emp ||
    !data.median_wages_general_public ||
    !data.median_benefits_general_public) {
    return;
  }

  visData = new google.visualization.DataTable();
  visData.addColumn('string', 'Median Compensation');
  visData.addColumn('number', 'Wages');
  visData.addColumn('number', 'Bens.');
  visData.addRows([
    [
      toTitleCase(data.name + '\n Employees'),
      +data.median_salary_per_full_time_emp,
      +data.median_benefits_per_ft_emp
    ],
    [
      'All \n' + toTitleCase(data.name + ' \n Residents'),
      +data.median_wages_general_public,
      +data.median_benefits_general_public
    ]
  ]);
  formatter = new google.visualization.NumberFormat({
    groupingSymbol: ',',
    fractionDigits: '0'
  });
  formatter.format(visData, 1);
  formatter.format(visData, 2);


  if (isMobileBrowser()) {
    container = 'mobile-median-comp-graph';
    options = {
      title: 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
      titleTextStyle: {
        fontSize: 12
      },
      tooltip: {
        textStyle: {
          fontSize: 12
        }
      },
      width: '100%',
      height: '100%',
      isStacked: true,
      colors: ['#005ce6', '#009933']
    };
  } else {
    container = 'median-comp-graph';
    options = {
      title: 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
      titleTextStyle: {
        fontSize: 12
      },
      tooltip: {
        textStyle: {
          fontSize: 12
        }
      },
      width: 340,
      height: 300,
      isStacked: true,
      colors: ['#005ce6', '#009933']
    };
  }


  chart = new google.visualization.ColumnChart(document.getElementById(container));
  chart.draw(visData, options);


  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}

/**
 * median-pension-graph
 */
function employeeCompensation_two() {
  var chart;
  var formatter;
  var options;
  var container;
  var visData;
  /*
   Ahtung! Hardcode detected!
   todo replace such bad code
   */
  if (!data.median_pension30_year_retiree) {
    data.median_pension30_year_retiree = data.median_pension_for_retiree_with_30_years_service;
  }

  if (!data.median_pension30_year_retiree) {
    return;
  }

  visData = new google.visualization.DataTable();
  visData.addColumn('string', 'Median Pension');
  visData.addColumn('number', 'Wages');
  visData.addRows([['Pension for \n Retiree w/ 30 Years', +data.median_pension30_year_retiree]]);
  formatter = new google.visualization.NumberFormat({
    groupingSymbol: ',',
    fractionDigits: '0'
  });
  formatter.format(visData, 1);

  if (isMobileBrowser()) {
    container = 'mobile-median-pension-graph';
    options = {
      title: 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
      titleTextStyle: {
        fontSize: 12
      },
      tooltip: {
        textStyle: {
          fontSize: 12
        }
      },
      width: '100%',
      height: '100%',
      isStacked: 'true',
      colors: ['#005ce6', '#009933']
    };
  } else {
    container = 'median-pension-graph';
    options = {
      title: 'Median Total Compensation - Full Time Workers: \n Government vs. Private Sector',
      titleTextStyle: {
        fontSize: 12
      },
      tooltip: {
        textStyle: {
          fontSize: 12
        }
      },
      width: 340,
      height: 300,
      isStacked: 'true',
      colors: ['#005ce6', '#009933']
    };
  }

  chart = new google.visualization.ColumnChart(document.getElementById(container));
  chart.draw(visData, options);
}


module.exports = {
  init: init,
  initAll: init
};

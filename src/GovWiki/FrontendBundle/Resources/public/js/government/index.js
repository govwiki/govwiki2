$(function() {

    var rankPopover = new RankPopover();

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var tabname = $(e.target).attr('data-tabname');
    });

    toTitleCase = function(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };


    function initCharts() {

        data = JSON.parse(window.gw.government);
        smallChartWidth = 340;
        bigChartWidth = 470;
        employeeCompensation_one();
        employeeCompensation_two();
        financialHealth_one();
        financialHealth_two();
        financialHealth_three();
        financialStatements_one();
        financialStatements_two();

    }

    google.load('visualization', '1.0', {'packages': 'corechart', 'callback': initCharts});

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

        console.log('median_salary_per_full_time_emp: ' + data['median_salary_per_full_time_emp']);
        console.log('median_benefits_per_ft_emp: ' + data['median_benefits_per_ft_emp']);

        console.log('median_wages_general_public: ' + data['median_wages_general_public']);
        console.log('median_benefits_general_public: ' + data['median_benefits_general_public']);

        if (!data['median_salary_per_full_time_emp'] && !data['median_benefits_per_ft_emp'] &&
            !data['median_wages_general_public'] && !data['median_benefits_general_public']) {
            return;
        }

        var chart, formatter, options, vis_data;
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
            'width': smallChartWidth,
            'height': 300,
            'isStacked': 'true',
            'colors': ['#005ce6', '#009933']
        };
        chart = new google.visualization.ColumnChart(document.getElementById('median-comp-graph'));
        chart.draw(vis_data, options);
    }

    function employeeCompensation_two() {
        /*
             Ahtung! Hardcode detected!
             todo replace such bad code
         */
        if (! data['median_pension30_year_retiree']) {
            data['median_pension30_year_retiree'] = data['median_pension_for_retiree_with_30_years_service'];
        }

        console.log('median_pension30_year_retiree: ' + data['median_pension30_year_retiree']);

        if (! data['median_pension30_year_retiree']) {
            return;
        }

        var chart, formatter, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Median Pension');
        vis_data.addColumn('number', 'Wages');
        vis_data.addRows([['Pension for \n Retiree w/ 30 Years', +data['median_pension30_year_retiree']]]);
        formatter = new google.visualization.NumberFormat({
            groupingSymbol: ',',
            fractionDigits: '0'
        });
        formatter.format(vis_data, 1);
        options = {
            'title': 'Median Total Pension',
            'titleTextStyle': {
                'fontSize': 12
            },
            'tooltip': {
                'textStyle': {
                    'fontSize': 12
                }
            },
            'width': smallChartWidth,
            'height': 300,
            'bar': {
                'groupWidth': '30%'
            },
            'isStacked': 'true',
            'colors': ['#005ce6', '#009933']
        };
        chart = new google.visualization.ColumnChart(document.getElementById('median-pension-graph'));
        chart.draw(vis_data, options);
    }

    function financialHealth_one() {
        /*
         Ahtung! Hardcode detected!
         todo replace such bad code
         */
        if (! data['public_safety_exp_over_tot_gov_fund_revenue']) {
            data['public_safety_exp_over_tot_gov_fund_revenue'] = data['public_safety_expense_total_governmental_fund_revenue'];
        }

        console.log('public_safety_exp_over_tot_gov_fund_revenue: '+ data['public_safety_exp_over_tot_gov_fund_revenue']);


        if (! data['public_safety_exp_over_tot_gov_fund_revenue']) {
            return;
        }

        var chart, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Public Safety Expense');
        vis_data.addColumn('number', 'Total');
        vis_data.addRows([['Public Safety Exp', 1 - data['public_safety_exp_over_tot_gov_fund_revenue']], ['Other', +data['public_safety_exp_over_tot_gov_fund_revenue']]]);
        options = {
            'title': 'Public safety expense',
            'titleTextStyle': {
                'fontSize': 12
            },
            'tooltip': {
                'textStyle': {
                    'fontSize': 12
                }
            },
            'width': smallChartWidth,
            'height': 300,
            'is3D': 'true',
            'colors': ['#005ce6', '#009933'],
            'slices': {
                1: {
                    offset: 0.2
                }
            },
            'pieStartAngle': 45
        };

        var element = document.getElementById('public-safety-pie');
        if (element) {
            chart = new google.visualization.PieChart(element);
            chart.draw(vis_data, options);
        }
    }

    function financialHealth_two() {
        console.log('total_revenue_per_capita: ' + data['total_revenue_per_capita']);

        if (! data['total_revenue_per_capita']) {
            return;
        }

        var chart, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Per Capita');
        vis_data.addColumn('number', 'Rev.');
        vis_data.addRows([['Total Revenue \n Per Capita', +data['total_revenue_per_capita']], ['Median Total \n Revenue Per \n Capita For All Cities', 420]]);
        options = {
            'title': 'Total Revenue',
            'titleTextStyle': {
                'fontSize': 12
            },
            'tooltip': {
                'textStyle': {
                    'fontSize': 12
                }
            },
            'width': smallChartWidth,
            'height': 300,
            'isStacked': 'true',
            'colors': ['#005ce6', '#009933'],
            'chartArea.width': '100%'
        };
        chart = new google.visualization.ColumnChart(document.getElementById('fin-health-revenue-graph'));
        chart.draw(vis_data, options);
    }

    function financialHealth_three() {
        console.log('total_expenditures_per_capita: ' + data['total_expenditures_per_capita']);

        if (! data['total_expenditures_per_capita']) {
            return;
        }

        var chart, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Per Capita');
        vis_data.addColumn('number', 'Exp.');
        vis_data.addRows([['Total Expenditures \n Per Capita', +data['total_expenditures_per_capita']], ['Median Total \n Expenditures \n Per Capita \n For All Cities', 420]]);
        options = {
            'title': 'Total Expenditures',
            'titleTextStyle': {
                'fontSize': 12
            },
            'tooltip': {
                'textStyle': {
                    'fontSize': 12
                }
            },
            'width': smallChartWidth,
            'height': 300,
            'isStacked': 'true',
            'colors': ['#005ce6', '#009933'],
            'chartArea.width': '100%'
        };
        chart = new google.visualization.ColumnChart(document.getElementById('fin-health-expenditures-graph'));
        chart.draw(vis_data, options);
    }

    function financialStatements_one() {
        console.log('financial_statements Revenues: ' + JSON.stringify(data['financialStatements']));

        var chart, item, len3, options, p, r, ref1, rows, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Total Gov. Expenditures');
        vis_data.addColumn('number', 'Total');
        rows = [];

        var revenues = data.financialStatements.Revenues;
        for(var key in revenues){
            if(revenues.hasOwnProperty(key) && (revenues[key].caption != 'Total Revenues')) {
                r = [revenues[key].caption, parseInt(revenues[key].totalfunds)];
                rows.push(r);
            }
        }

        vis_data.addRows(rows);
        options = {
            'title': 'Total Revenues',
            'titleTextStyle': {
                'fontSize': 16
            },
            'tooltip': {
                'textStyle': {
                    'fontSize': 12
                }
            },
            'width': bigChartWidth,
            'height': 350,
            'pieStartAngle': 60,
            'sliceVisibilityThreshold': .05,
            'forceIFrame': true,
            'chartArea': {
                width: '90%',
                height: '75%'
            }
        };
        chart = new google.visualization.PieChart(document.getElementById('total-revenue-pie'));
        chart.draw(vis_data, options);
    }

    function financialStatements_two() {
        console.log('financial_statements Expenditures: ' + JSON.stringify(data['financialStatements']));

        var chart, item, len3, options, p, r, ref1, rows, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Total Gov. Expenditures');
        vis_data.addColumn('number', 'Total');
        rows = [];

        var expenditures = data.financialStatements.Expenditures;
        for(var key in expenditures){
            if(expenditures.hasOwnProperty(key) && (expenditures[key].caption != 'Total Expenditures')) {
                r = [expenditures[key].caption, parseInt(expenditures[key].totalfunds)];
                rows.push(r);
            }
        }

        vis_data.addRows(rows);
        options = {
            'title': 'Total Expenditures',
            'titleTextStyle': {
                'fontSize': 16
            },
            'tooltip': {
                'textStyle': {
                    'fontSize': 12
                }
            },
            'width': bigChartWidth,
            'height': 350,
            'pieStartAngle': 60,
            'sliceVisibilityThreshold': .05,
            'forceIFrame': true,
            'chartArea': {
                width: '90%',
                height: '75%'
            }
        };
        chart = new google.visualization.PieChart(document.getElementById('total-expenditures-pie'));
        chart.draw(vis_data, options);
    }


});
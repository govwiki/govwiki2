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
        employeeCompensation_one();
        //employeeCompensation_two();
        //employeeCompensation_three();
        //financialHealth_one();
        //financialHealth_two();
        //financialHealth_three();
        //financialStatements_one();
        //financialStatements_two();

    }

    google.load('visualization', '1.0', {'packages': 'corechart', 'callback': initCharts});

    function employeeCompensation_one() {
        var chart, formatter, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Median Compensation');
        vis_data.addColumn('number', 'Wages');
        vis_data.addColumn('number', 'Bens.');
        vis_data.addRows([[toTitleCase(data.name + '\n Employees'), data['median_salary_per_full_time_emp'], data['median_benefits_per_ft_emp']], ['All \n' + toTitleCase(data.name + ' \n Residents'), data['median_wages_general_public'], data['median_benefits_general_public']]]);
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
        var chart, formatter, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Median Pension');
        vis_data.addColumn('number', 'Wages');
        vis_data.addRows([['Pension for \n Retiree w/ 30 Years', data['median_pension30_year_retiree']]]);
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

    function employeeCompensation_three() {
        var chart, formatter, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Median Pension');
        vis_data.addColumn('number', 'Wages');
        vis_data.addRows([['Pension for \n Retiree w/ 30 Years', data['median_pension30_year_retiree']]]);
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
        var chart, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Public Safety Expense');
        vis_data.addColumn('number', 'Total');
        vis_data.addRows([['Public Safety Exp', 1 - data['public_safety_exp_over_tot_gov_fund_revenue']], ['Other', data['public_safety_exp_over_tot_gov_fund_revenue']]]);
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
        chart = new google.visualization.PieChart(document.getElementById('public-safety-pie'));
        chart.draw(vis_data, options);
    }

    function financialHealth_two() {
        var chart, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Per Capita');
        vis_data.addColumn('number', 'Rev.');
        vis_data.addRows([['Total Revenue \n Per Capita', data['total_revenue_per_capita']], ['Median Total \n Revenue Per \n Capita For All Cities', 420]]);
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
        var chart, options, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Per Capita');
        vis_data.addColumn('number', 'Exp.');
        vis_data.addRows([['Total Expenditures \n Per Capita', data['total_expenditures_per_capita']], ['Median Total \n Expenditures \n Per Capita \n For All Cities', 420]]);
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
        if (graph) {
            chart = new google.visualization.ColumnChart(document.getElementById('fin-health-expenditures-graph'));
            chart.draw(vis_data, options);
        }
    }

    function financialStatements_one() {
        var chart, item, len3, options, p, r, ref1, rows, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Total Gov. Expenditures');
        vis_data.addColumn('number', 'Total');
        rows = [];
        ref1 = data.financial_statements;
        for (p = 0, len3 = ref1.length; p < len3; p++) {
            item = ref1[p];
            if ((item.category_name === "Revenues") && (item.caption !== "Total Revenues")) {
                r = [item.caption, parseInt(item.totalfunds)];
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
        if (graph) {
            chart = new google.visualization.PieChart(document.getElementById('total-revenue-pie'));
            chart.draw(vis_data, options);
        }
    }

    function financialStatements_two() {
        var chart, item, len3, options, p, r, ref1, rows, vis_data;
        vis_data = new google.visualization.DataTable();
        vis_data.addColumn('string', 'Total Gov. Expenditures');
        vis_data.addColumn('number', 'Total');
        rows = [];
        ref1 = data.financial_statements;
        for (p = 0, len3 = ref1.length; p < len3; p++) {
            item = ref1[p];
            if ((item.category_name === "Expenditures") && (item.caption !== "Total Expenditures")) {
                r = [item.caption, parseInt(item.totalfunds)];
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
        if (graph) {
            chart = new google.visualization.PieChart(document.getElementById('total-expenditures-pie'));
            chart.draw(vis_data, options);
        }
        google.load('visualization', '1.0', {'packages': 'corechart', 'callback': drawChart()});
    }


});
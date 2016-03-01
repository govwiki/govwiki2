webpackJsonp([0,2],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	$(function() {

	    __webpack_require__(1);

	    var rankPopover = new RankPopover();

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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var employeeCompensationGraphs = __webpack_require__(2);
	var financialHealthGraphs = __webpack_require__(5);
	var financialStatementGraphs = __webpack_require__(6);

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var data = __webpack_require__(3).data;
	var chart = __webpack_require__(4).chart;

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
	        'width': 340,
	        'height': 300,
	        'isStacked': 'true',
	        'colors': ['#005ce6', '#009933']
	    };
	    chart = new google.visualization.ColumnChart(document.getElementById('median-comp-graph'));
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
	        'width': 340,
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


	module.exports = {
	    init: init,
	    initAll: init
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	var data = JSON.parse(window.gw.government);

	module.exports = {
	    data: data
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	var chart = {
	    employeeCompensation_one: {
	        init: false
	    },
	    employeeCompensation_two: {
	        init: false
	    },
	    financialHealth_one: {
	        init: false
	    },
	    financialHealth_two: {
	        init: false
	    },
	    financialHealth_three: {
	        init: false
	    },
	    financialStatements_one: {
	        init: false
	    },
	    financialStatements_two: {
	        init: false
	    },
	    financialStatementsTree: {
	        init: false
	    },
	    financialStatementsTree_expenditures: {
	        init: false
	    },
	    financialStatementsTree_revenues: {
	        init: false
	    }
	};

	module.exports = {
	    chart: chart
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var data = __webpack_require__(3).data;
	var chart = __webpack_require__(4).chart;

	/**
	 * Initialization
	 */
	function init() {
	    financialHealth_one();
	    financialHealth_two();
	    financialHealth_three();
	}

	/**
	 * public-safety-pie
	 */
	function financialHealth_one() {
	    /**
	     * Ahtung! Hardcode detected!
	     * todo replace such bad code
	     */
	    if (! data['public_safety_exp_over_tot_gov_fund_revenue']) {
	        data['public_safety_exp_over_tot_gov_fund_revenue'] = data['public_safety_expense_total_governmental_fund_revenue'];
	    }

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
	        'width': 340,
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

	/**
	 * fin-health-revenue-graph
	 */
	function financialHealth_two() {

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
	        'width': 340,
	        'height': 300,
	        'isStacked': 'true',
	        'colors': ['#005ce6', '#009933'],
	        'chartArea.width': '100%'
	    };
	    chart = new google.visualization.ColumnChart(document.getElementById('fin-health-revenue-graph'));
	    chart.draw(vis_data, options);
	}

	/**
	 * fin-health-expenditures-graph
	 */
	function financialHealth_three() {

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
	        'width': 340,
	        'height': 300,
	        'isStacked': 'true',
	        'colors': ['#005ce6', '#009933'],
	        'chartArea.width': '100%'
	    };
	    chart = new google.visualization.ColumnChart(document.getElementById('fin-health-expenditures-graph'));
	    chart.draw(vis_data, options);
	}


	module.exports = {
	    init: init,
	    initAll: init
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var data = __webpack_require__(3).data;
	var chart = __webpack_require__(4).chart;

	/**
	 * Initialization
	 */
	function init() {
	    handler_switchChart();
	    financialStatements_revenue();
	    financialStatements_expenditures();
	    financialStatementsTree_expenditures();
	    financialStatementsTree_revenues();
	}

	/**
	 * #total-revenue-pie
	 */
	function financialStatements_revenue() {

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
	        'width': 470,
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

	/**
	 * #total-expenditures-pie
	 */
	function financialStatements_expenditures() {

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
	        'width': 470,
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


	/**
	 * TODO: Refactor
	 * #total-revenue-tree
	 */
	function financialStatementsTree_revenues() {

	    var chart, item, len3, options, p, r, ref1, RevenuesDataTable, vis_data;

	    RevenuesDataTable = [
	        ['Location', 'Parent', 'FinData', 'Heat'],
	        ['Total Revenues', null, 0, 0]
	    ];

	    var RevenuesData = data.financialStatements.Revenues;

	    // Prepare Revenues data to Google Tree Chart
	    for(var rKey in RevenuesData) {
	        if (RevenuesData.hasOwnProperty(rKey)){

	            var subCategory = RevenuesData[rKey];
	            var subCatValue = getSubCatValue(subCategory);
	            if (!subCatValue) {
	                continue;
	            }

	            RevenuesDataTable.push(
	                [subCategory.caption, 'Total Revenues', parseInt(subCatValue), parseInt(subCatValue)]
	            );

	        }
	    }


	    /**
	     * TODO: Hardcoded!! Please ask the question to client, which field must be there?
	     */
	    function getSubCatValue(subCategory) {

	        if (subCategory.totalfunds) {

	            if (subCategory.totalfunds < 0) {
	                subCategory.totalfunds = -(subCategory.totalfunds);
	            }

	        }

	        return subCategory.totalfunds || false;
	    }

	    var options = {
	        highlightOnMouseOver: true,
	        maxDepth: 1,
	        maxPostDepth: 2,
	        minHighlightColor: '#8c6bb1',
	        midHighlightColor: '#9ebcda',
	        maxHighlightColor: '#edf8fb',
	        minColor: '#009688',
	        midColor: '#f7f7f7',
	        maxColor: '#ee8100',
	        headerHeight: 15,
	        showScale: true,
	        height: 500,
	        useWeightedAverageForAggregation: true,
	        generateTooltip: revenuesTooltip
	    };

	    function revenuesTooltip(row, size, value) {
	        var val = vis_data.getValue(row, 2);
	        return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">Total Funds: ' +
	            numeral(val).format('$0,0'); + '</div>';
	    }


	    vis_data = new google.visualization.arrayToDataTable(RevenuesDataTable);
	    chart = new google.visualization.TreeMap(document.getElementById('total-revenue-tree'));
	    chart.draw(vis_data, options);
	}

	/**
	 * TODO: Refactor
	 * #total-expenditures-tree
	 */
	function financialStatementsTree_expenditures() {

	    var chart, item, len3, options, p, r, ref1, ExpendituresDataTable, RevenuesDataTable, vis_data;

	    ExpendituresDataTable = [
	        ['Location', 'Parent', 'FinData', 'Heat'],
	        ['Total Expenditures', null, 0, 0]
	    ];

	    var ExpendituresData = data.financialStatements.Expenditures;

	    // Prepare ExpendituresData data to Google Tree Chart
	    for(var eKey in ExpendituresData) {
	        if (ExpendituresData.hasOwnProperty(eKey)){

	            var subCategory = ExpendituresData[eKey];
	            var subCatValue = getSubCatValue(subCategory);
	            if (!subCatValue) {
	                continue;
	            }

	            ExpendituresDataTable.push(
	                [subCategory.caption, 'Total Expenditures', parseInt(subCatValue), parseInt(subCatValue)]
	            );

	        }
	    }

	    function getSubCatValue(subCategory) {

	        if (subCategory.totalfunds) {

	            if (subCategory.totalfunds < 0) {
	                subCategory.totalfunds = -(subCategory.totalfunds);
	            }

	        }

	        return subCategory.totalfunds || false;
	    }

	    var options = {
	        highlightOnMouseOver: true,
	        maxDepth: 1,
	        maxPostDepth: 2,
	        minHighlightColor: '#8c6bb1',
	        midHighlightColor: '#9ebcda',
	        maxHighlightColor: '#edf8fb',
	        minColor: '#009688',
	        midColor: '#f7f7f7',
	        maxColor: '#ee8100',
	        headerHeight: 15,
	        showScale: true,
	        height: 500,
	        useWeightedAverageForAggregation: true,
	        generateTooltip: expendituresTooltip
	    };

	    function expendituresTooltip(row, size, value) {
	        var val = vis_data.getValue(row, 2);
	        return '<div style="background:#7bbaff; color: #fff; padding:10px; border-style:solid">Total Funds: ' +
	            numeral(val).format('$0,0'); + '</div>';
	    }

	    vis_data = new google.visualization.arrayToDataTable(ExpendituresDataTable);
	    chart = new google.visualization.TreeMap(document.getElementById('total-expenditures-tree'));
	    chart.draw(vis_data, options);

	}

	/**
	 * #Financial_Statements (.chart-controls .btn)
	 */
	function handler_switchChart() {
	    $('#Financial_Statements').on('click', '.chart-controls .btn', function() {

	        var chartType = this.getElementsByTagName('input')[0].id;

	        if (chartType == 'chart'){
	            hideChartGroup('pie-charts', false);
	            hideChartGroup('tree-chart', true);
	            hideChartGroup('tree-charts', true);
	            if (!chart.financialStatements_one.init || !chart.financialStatements_two.init) {
	                financialStatements_one();
	                financialStatements_two();
	            }

	        } else if (chartType == 'tree') {

	            hideChartGroup('pie-charts', true);
	            hideChartGroup('tree-charts', true);
	            hideChartGroup('tree-chart', false);
	            if (!chart.financialStatementsTree.init) {
	                financialStatementsTree();
	            }
	        } else if (chartType == 'tree-charts') {
	            hideChartGroup('pie-charts', true);
	            hideChartGroup('tree-chart', true);
	            hideChartGroup('tree-charts', false);
	            if (!chart.financialStatementsTree_expenditures.init || !chart.financialStatementsTree_revenues.init) {
	                financialStatementsTree_expenditures();
	                financialStatementsTree_revenues();
	            }
	        }

	        /**
	         * Hide chart group. Group may contain few charts
	         */
	        function hideChartGroup(chartGroup, hide) {

	            var display = hide ? {display: 'none'} : {display: 'block'};

	            if (chartGroup == 'pie-charts') {
	                $('#total-expenditures-pie').css(display);
	                $('#total-revenue-pie').css(display);

	            } else if (chartGroup == 'tree-chart') {
	                $('#total-tree').css(display);

	            } else if (chartGroup == 'tree-charts') {
	                $('#total-expenditures-tree').css(display);
	                $('#total-revenue-tree').css(display);
	            }

	        }

	    });
	}

	module.exports = {
	    init: init,
	    initAll: init
	};

/***/ }
]);
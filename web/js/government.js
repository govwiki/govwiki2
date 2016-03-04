webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	$(function() {
	
	    __webpack_require__(1);
	    new (__webpack_require__(7))();
	    var Step1 = __webpack_require__(9);
	    var Step2 = __webpack_require__(23);
	    var Step3 = __webpack_require__(24);
	    var Step31 = __webpack_require__(25);
	
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
	    financialStatements_expenditures: {
	        init: false
	    },
	    financialStatements_revenues: {
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
	    //financialStatements_compare();
	    financialStatements_revenue();
	    financialStatements_expenditures();
	
	}
	
	function financialStatements_compare() {
	
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
	
	    hideChartGroup('pie-charts', false);
	    hideChartGroup('compare-charts', true);
	    hideChartGroup('tree-charts', true);
	
	    $('#Financial_Statements').on('click', '.chart-controls .btn', function() {
	
	        var chartType = this.getElementsByTagName('input')[0].id;
	
	        if (chartType == 'chart'){
	            hideChartGroup('pie-charts', false);
	            hideChartGroup('compare-charts', true);
	            hideChartGroup('tree-charts', true);
	            if (!chart.financialStatements_revenues.init || !chart.financialStatements_expenditures.init) {
	                financialStatements_revenue();
	                financialStatements_expenditures();
	            }
	
	        } else if (chartType == 'tree-charts') {
	            hideChartGroup('pie-charts', true);
	            hideChartGroup('compare-charts', true);
	            hideChartGroup('tree-charts', false);
	            if (!chart.financialStatementsTree_expenditures.init || !chart.financialStatementsTree_revenues.init) {
	                financialStatementsTree_expenditures();
	                financialStatementsTree_revenues();
	            }
	        } else if (chartType == 'compare-charts') {
	            hideChartGroup('pie-charts', true);
	            hideChartGroup('compare-charts', false);
	            hideChartGroup('tree-charts', true);
	            if (!chart.financialStatementsTree_expenditures.init || !chart.financialStatementsTree_revenues.init) {
	                financialStatementsTree_expenditures();
	                financialStatementsTree_revenues();
	            }
	        }
	
	    });
	
	    /**
	     * Hide chart group. Group may contain few charts
	     */
	    function hideChartGroup(chartGroup, hide) {
	
	        var display = hide ? {display: 'none'} : {display: 'block'};
	
	        if (chartGroup == 'pie-charts') {
	            $('#total-expenditures-pie').css(display);
	            $('#total-revenue-pie').css(display);
	
	        } else if (chartGroup == 'compare-charts') {
	            $('#total-compare-pie').css(display);
	
	        } else if (chartGroup == 'tree-charts') {
	            $('#total-expenditures-tree').css(display);
	            $('#total-revenue-tree').css(display);
	        }
	
	    }
	
	}
	
	module.exports = {
	    init: init,
	    initAll: init
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(8);
	
	/**
	 * @param {Object} options
	 * @param {String} [options.selector]
	 * @constructor
	 */
	var RankPopover = function(options) {
	    options = options | {};
	
	    this.$popover = null;
	    this.$rankTable = null;
	    this.$preloader = null;
	    this.$rankTable = null;
	
	    this.selector = options.selector || '.rank';
	    this.loading = false;
	    this.rankFieldName = null;
	    this.order = { altType: '', rank: ''};
	
	    this.init();
	};
	
	
	/**
	 * Initialize popover
	 */
	RankPopover.prototype.init = function init() {
	
	    var self = this;
	    self.noMoreData = false;
	
	    var $statistics = $('.statistics');
	    var $governmentController = $('.governmentController');
	
	    // Popover window (Rank over all altTypes)
	    $statistics.popover({
	        placement: 'bottom',
	        selector: this.selector,
	        animation: true,
	        template: '<div class="popover rankPopover" role="tooltip"><div class="arrow"></div><div class="popover-title-custom"><h3 class="popover-title"></h3></div><div class="popover-content"></div></div>'
	    });
	
	    $governmentController.on('click', function(e) {
	        // Close other popovers
	        if (!$(e.target).closest('.popover')[0]) {
	            $('.rank').not(e.target).popover('destroy');
	        }
	    });
	
	    $statistics.on('click', function(e) {
	        e.preventDefault();
	        e.stopPropagation();
	
	        $element = $(e.target);
	
	        // Close other popovers
	        if (!$(e.target).closest('.popover')[0]) {
	            $('.rank').not(e.target).popover('destroy');
	        }
	
	        $popover = $element.hasClass('rank') ? $element : $element.closest('.rank');
	
	        if ($popover.length == 0) {
	            return false;
	        }
	
	        self.$popover = $element;
	
	        self.$popoverContent = $popover.next().find('.popover-content');
	
	        self.rankFieldName = $popover.attr('data-field');
	
	        self.$popover.on('hide.bs.popover', function () {
	            self.noMoreData = false;
	        });
	
	        var $popoverContent = self.$popoverContent;
	        var $preloader = self.$preloader;
	        var rankFieldName = self.rankFieldName;
	
	        if (rankFieldName) {
	            self.loading = true;
	
	            $.ajax({
	                url: window.gw.urls.popover,
	                dataType: 'json',
	                data: {
	                    field_name: rankFieldName
	                },
	                success: function(data) {
	                    if (data.data.length != 0) {
	                        self.formatData.call(self, data);
	                        // Render rankTable template
	                        $popoverContent.html(Handlebars.templates.rankTable(data));
	                        self.$rankTable = $popoverContent.find('table tbody');
	                        self.$preloader = $popoverContent.find('.loader');
	                        // Initialize scroll and sort handlers
	                        self.scrollHandler.call(self);
	                        self.sortHandler.call(self);
	                        self.loading = false;
	                    } else {
	                        if (!self.noMoreData) {
	                            self.$popoverContent[0].innerHTML = '<h3 style="text-align: center">No data</h3>';
	                            self.noMoreData = true;
	                            self.loading = false;
	                        }
	                    }
	                }
	            });
	        }
	
	
	    });
	
	};
	
	/**
	 * Add scroll handler on popoverContent
	 */
	RankPopover.prototype.scrollHandler = function scrollHandler () {
	
	    var self = this;
	
	    var $rankTable = self.$rankTable;
	    var $popoverContent = self.$popoverContent;
	    var $preloader = self.$preloader;
	
	    var rankFieldName = self.rankFieldName;
	    var order = self.order;
	
	    self.previousScrollTop = 0;
	    self.currentPage = 0;
	
	    $popoverContent.scroll(function() {
	
	        var currentScrollTop = $popoverContent.scrollTop();
	
	        if (self.previousScrollTop < currentScrollTop && currentScrollTop > 0.5 * $popoverContent[0].scrollHeight && !self.noMoreData) {
	            self.previousScrollTop = currentScrollTop;
	            if (self.loading === false) {
	                self.loading = true;
	                self.$preloader.show();
	                $.ajax({
	                    url: window.gw.urls.popover,
	                    dataType: 'json',
	                    data: {
	                        page: ++self.currentPage,
	                        order: order.rank,
	                        name_order: order.altType,
	                        field_name: rankFieldName
	                    },
	                    success: function(data) {
	                        if (data.data.length != 0) {
	                            self.formatData(data);
	                            self.loading = false;
	                            self.$preloader.hide();
	                            $rankTable[0].innerHTML += Handlebars.templates.rankTableAdditionalRows(data);
	                        } else {
	                            if (!self.noMoreData) {
	                                self.noMoreData = true;
	                                var h3 = $('<h3 style="text-align: center">No more data</h3>');
	                                self.$popoverContent.append(h3);
	                                self.loading = false;
	                                self.$preloader.hide();
	                            }
	                        }
	                    }
	                });
	            }
	        }
	    });
	
	};
	
	/**
	 * Add sort handler for rankTable header (th)
	 */
	RankPopover.prototype.sortHandler = function sortHandler() {
	
	    var self = this;
	    var $popoverContent = self.$popoverContent;
	    var order = self.order;
	
	    $popoverContent.on('click', 'th', function(e) {
	        e.stopPropagation();
	
	        self.$popoverContent.find('h3').remove();
	
	        self.noMoreData = false;
	        self.previousScrollTop = 0;
	        self.currentPage = 0;
	
	        var $column = $(this).hasClass('sortable') ? $(this) : $(this).closest('th');
	        var $sortIcon = $column.find('i');
	
	        if ($column.hasClass('desc')) {
	            $column.attr('data-sort-type') === 'name_order' ? order.altType = '' : order.rank = '';
	            $column.removeClass('desc').removeClass('asc');
	            $sortIcon.removeClass('icon__bottom').removeClass('icon__top');
	
	        } else if ($column.hasClass('asc')) {
	            $column.attr('data-sort-type') === 'name_order' ? order.altType = 'desc' : order.rank = 'desc';
	            $column.removeClass('asc').addClass('desc');
	            $sortIcon.removeClass('icon__top').addClass('icon__bottom');
	
	        } else {
	            $column.attr('data-sort-type') === 'name_order' ? order.altType = 'asc' : order.rank = 'asc';
	            $column.addClass('asc');
	            $sortIcon.addClass('icon__top');
	        }
	
	        self.loadNewRows.call(self, order);
	
	    });
	
	};
	
	/**
	 * Lazy load additional rows
	 * @param {Object} [order] Sort
	 * @param {String} [order.altType] Available values: '', 'asc', 'desc'
	 * @param {String} [order.rank] Available values: '', 'asc', 'desc'
	 */
	RankPopover.prototype.loadNewRows = function loadNewRows (order) {
	    order = order || this.order;
	
	    var self = this;
	
	    var $preloader = self.$preloader;
	    var $rankTable = self.$rankTable || self.$popoverContent.find('table tbody');
	
	    $rankTable.html('');
	
	    self.$preloader.show();
	    self.loading = true;
	
	    console.log(self.rankFieldName);
	    $.ajax({
	        url: window.gw.urls.popover,
	        dataType: 'json',
	        data: {
	            page: self.currentPage,
	            order: order.rank,
	            name_order: order.altType,
	            field_name: self.rankFieldName
	        },
	        success: function(data) {
	            if (data.data.length != 0) {
	                self.formatData.call(self, data);
	                $rankTable.html(Handlebars.templates.rankTableAdditionalRows(data));
	                self.loading = false;
	                self.$preloader.hide();
	            } else {
	                self.$popoverContent[0].innerHTML = '<h3 style="text-align: center">No data</h3>';
	                self.loading = false;
	                self.$preloader.hide();
	            }
	        }
	    });
	
	};
	
	/**
	 * Apply mask with numeric.js library
	 *
	 * @param data
	 * @returns {void|*}
	 */
	RankPopover.prototype.formatData = function formatData (data) {
	
	    var self = this;
	
	    var $popover = self.$popover;
	    var mask = $popover.attr('data-mask');
	
	    if (mask) {
	        return data.data.forEach(function(rank) {
	            return rank.amount = numeral(rank.amount).format(mask);
	        });
	    }
	};
	
	// rankTable template
	(function() {
	    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
	    templates['rankTable'] = template({"1":function(container,depth0,helpers,partials,data) {
	        var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;
	
	        return " <tr> <td>"
	            + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
	            + "</td> <td> "
	            + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
	            + "</td> <td> "
	            + alias4(((helper = (helper = helpers.amount || (depth0 != null ? depth0.amount : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"amount","hash":{},"data":data}) : helper)))
	            + "</td> </tr> ";
	    },"2":function(container,depth0,helpers,partials,data) {
	        var helper;
	
	        return " "
	            + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
	            + " ";
	    },"4":function(container,depth0,helpers,partials,data) {
	        return " No data ";
	    },"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
	        var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer =
	            "<table class=\"table table-condensed table-hover\"> <thead> <tr> <th data-sort-type=\"name_order\" class=\"sortable\"><nobr>"
	            + container.escapeExpression(((helper = (helper = helpers.alt_type || (depth0 != null ? depth0.alt_type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"alt_type","hash":{},"data":data}) : helper)))
	            + "<i class=\"icon\"></i></nobr></th> <th data-sort-type=\"order\" class=\"sortable\"><nobr>Rank<i class=\"icon\"></i></nobr></th> <th>Amount</th> </tr> </thead> <tbody> ";
	        stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : alias2),(options={"name":"data","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
	        if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
	        if (stack1 != null) { buffer += stack1; }
	        return buffer + "\n    </tbody>\n</table>\n<div class=\"loader\"></div>\n";
	    },"useData":true});
	})();
	
	// rankTableAdditionalRows template
	(function() {
	    var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
	    templates['rankTableAdditionalRows'] = template({"1":function(container,depth0,helpers,partials,data) {
	        var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;
	
	        return " <tr> <td>"
	            + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
	            + "</td> <td> "
	            + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
	            + "\n        </td>\n        <td>\n            "
	            + alias4(((helper = (helper = helpers.amount || (depth0 != null ? depth0.amount : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"amount","hash":{},"data":data}) : helper)))
	            + "\n        </td>\n    </tr>\n";
	    },"2":function(container,depth0,helpers,partials,data) {
	        var helper;
	
	        return " "
	            + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
	            + " ";
	    },"4":function(container,depth0,helpers,partials,data) {
	        return " No data ";
	    },"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
	        var stack1, helper, options, buffer = "";
	
	        stack1 = ((helper = (helper = helpers.data || (depth0 != null ? depth0.data : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"data","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
	        if (!helpers.data) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
	        if (stack1 != null) { buffer += stack1; }
	        return buffer;
	    },"useData":true});
	})();
	
	module.exports = RankPopover;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	
	 handlebars v4.0.5
	
	Copyright (C) 2011-2015 by Yehuda Katz
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
	
	@license
	*/
	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["Handlebars"] = factory();
		else
			root["Handlebars"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};
	
	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {
	
	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;
	
	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};
	
	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	
	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;
	
	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}
	
	
	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;
	
	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;
	
	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";
	
	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireWildcard = __webpack_require__(1)['default'];
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
	
		var _handlebarsBase = __webpack_require__(3);
	
		var base = _interopRequireWildcard(_handlebarsBase);
	
		// Each of these augment the Handlebars object. No need to setup here.
		// (This is done to easily share code between commonjs and browse envs)
	
		var _handlebarsSafeString = __webpack_require__(17);
	
		var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);
	
		var _handlebarsException = __webpack_require__(5);
	
		var _handlebarsException2 = _interopRequireDefault(_handlebarsException);
	
		var _handlebarsUtils = __webpack_require__(4);
	
		var Utils = _interopRequireWildcard(_handlebarsUtils);
	
		var _handlebarsRuntime = __webpack_require__(18);
	
		var runtime = _interopRequireWildcard(_handlebarsRuntime);
	
		var _handlebarsNoConflict = __webpack_require__(19);
	
		var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);
	
		// For compatibility and usage outside of module systems, make the Handlebars object a namespace
		function create() {
		  var hb = new base.HandlebarsEnvironment();
	
		  Utils.extend(hb, base);
		  hb.SafeString = _handlebarsSafeString2['default'];
		  hb.Exception = _handlebarsException2['default'];
		  hb.Utils = Utils;
		  hb.escapeExpression = Utils.escapeExpression;
	
		  hb.VM = runtime;
		  hb.template = function (spec) {
		    return runtime.template(spec, hb);
		  };
	
		  return hb;
		}
	
		var inst = create();
		inst.create = create;
	
		_handlebarsNoConflict2['default'](inst);
	
		inst['default'] = inst;
	
		exports['default'] = inst;
		module.exports = exports['default'];
	
	/***/ },
	/* 1 */
	/***/ function(module, exports) {
	
		"use strict";
	
		exports["default"] = function (obj) {
		  if (obj && obj.__esModule) {
		    return obj;
		  } else {
		    var newObj = {};
	
		    if (obj != null) {
		      for (var key in obj) {
		        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
		      }
		    }
	
		    newObj["default"] = obj;
		    return newObj;
		  }
		};
	
		exports.__esModule = true;
	
	/***/ },
	/* 2 */
	/***/ function(module, exports) {
	
		"use strict";
	
		exports["default"] = function (obj) {
		  return obj && obj.__esModule ? obj : {
		    "default": obj
		  };
		};
	
		exports.__esModule = true;
	
	/***/ },
	/* 3 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
		exports.HandlebarsEnvironment = HandlebarsEnvironment;
	
		var _utils = __webpack_require__(4);
	
		var _exception = __webpack_require__(5);
	
		var _exception2 = _interopRequireDefault(_exception);
	
		var _helpers = __webpack_require__(6);
	
		var _decorators = __webpack_require__(14);
	
		var _logger = __webpack_require__(16);
	
		var _logger2 = _interopRequireDefault(_logger);
	
		var VERSION = '4.0.5';
		exports.VERSION = VERSION;
		var COMPILER_REVISION = 7;
	
		exports.COMPILER_REVISION = COMPILER_REVISION;
		var REVISION_CHANGES = {
		  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
		  2: '== 1.0.0-rc.3',
		  3: '== 1.0.0-rc.4',
		  4: '== 1.x.x',
		  5: '== 2.0.0-alpha.x',
		  6: '>= 2.0.0-beta.1',
		  7: '>= 4.0.0'
		};
	
		exports.REVISION_CHANGES = REVISION_CHANGES;
		var objectType = '[object Object]';
	
		function HandlebarsEnvironment(helpers, partials, decorators) {
		  this.helpers = helpers || {};
		  this.partials = partials || {};
		  this.decorators = decorators || {};
	
		  _helpers.registerDefaultHelpers(this);
		  _decorators.registerDefaultDecorators(this);
		}
	
		HandlebarsEnvironment.prototype = {
		  constructor: HandlebarsEnvironment,
	
		  logger: _logger2['default'],
		  log: _logger2['default'].log,
	
		  registerHelper: function registerHelper(name, fn) {
		    if (_utils.toString.call(name) === objectType) {
		      if (fn) {
		        throw new _exception2['default']('Arg not supported with multiple helpers');
		      }
		      _utils.extend(this.helpers, name);
		    } else {
		      this.helpers[name] = fn;
		    }
		  },
		  unregisterHelper: function unregisterHelper(name) {
		    delete this.helpers[name];
		  },
	
		  registerPartial: function registerPartial(name, partial) {
		    if (_utils.toString.call(name) === objectType) {
		      _utils.extend(this.partials, name);
		    } else {
		      if (typeof partial === 'undefined') {
		        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
		      }
		      this.partials[name] = partial;
		    }
		  },
		  unregisterPartial: function unregisterPartial(name) {
		    delete this.partials[name];
		  },
	
		  registerDecorator: function registerDecorator(name, fn) {
		    if (_utils.toString.call(name) === objectType) {
		      if (fn) {
		        throw new _exception2['default']('Arg not supported with multiple decorators');
		      }
		      _utils.extend(this.decorators, name);
		    } else {
		      this.decorators[name] = fn;
		    }
		  },
		  unregisterDecorator: function unregisterDecorator(name) {
		    delete this.decorators[name];
		  }
		};
	
		var log = _logger2['default'].log;
	
		exports.log = log;
		exports.createFrame = _utils.createFrame;
		exports.logger = _logger2['default'];
	
	/***/ },
	/* 4 */
	/***/ function(module, exports) {
	
		'use strict';
	
		exports.__esModule = true;
		exports.extend = extend;
		exports.indexOf = indexOf;
		exports.escapeExpression = escapeExpression;
		exports.isEmpty = isEmpty;
		exports.createFrame = createFrame;
		exports.blockParams = blockParams;
		exports.appendContextPath = appendContextPath;
		var escape = {
		  '&': '&amp;',
		  '<': '&lt;',
		  '>': '&gt;',
		  '"': '&quot;',
		  "'": '&#x27;',
		  '`': '&#x60;',
		  '=': '&#x3D;'
		};
	
		var badChars = /[&<>"'`=]/g,
		    possible = /[&<>"'`=]/;
	
		function escapeChar(chr) {
		  return escape[chr];
		}
	
		function extend(obj /* , ...source */) {
		  for (var i = 1; i < arguments.length; i++) {
		    for (var key in arguments[i]) {
		      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
		        obj[key] = arguments[i][key];
		      }
		    }
		  }
	
		  return obj;
		}
	
		var toString = Object.prototype.toString;
	
		exports.toString = toString;
		// Sourced from lodash
		// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
		/* eslint-disable func-style */
		var isFunction = function isFunction(value) {
		  return typeof value === 'function';
		};
		// fallback for older versions of Chrome and Safari
		/* istanbul ignore next */
		if (isFunction(/x/)) {
		  exports.isFunction = isFunction = function (value) {
		    return typeof value === 'function' && toString.call(value) === '[object Function]';
		  };
		}
		exports.isFunction = isFunction;
	
		/* eslint-enable func-style */
	
		/* istanbul ignore next */
		var isArray = Array.isArray || function (value) {
		  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
		};
	
		exports.isArray = isArray;
		// Older IE versions do not directly support indexOf so we must implement our own, sadly.
	
		function indexOf(array, value) {
		  for (var i = 0, len = array.length; i < len; i++) {
		    if (array[i] === value) {
		      return i;
		    }
		  }
		  return -1;
		}
	
		function escapeExpression(string) {
		  if (typeof string !== 'string') {
		    // don't escape SafeStrings, since they're already safe
		    if (string && string.toHTML) {
		      return string.toHTML();
		    } else if (string == null) {
		      return '';
		    } else if (!string) {
		      return string + '';
		    }
	
		    // Force a string conversion as this will be done by the append regardless and
		    // the regex test will do this transparently behind the scenes, causing issues if
		    // an object's to string has escaped characters in it.
		    string = '' + string;
		  }
	
		  if (!possible.test(string)) {
		    return string;
		  }
		  return string.replace(badChars, escapeChar);
		}
	
		function isEmpty(value) {
		  if (!value && value !== 0) {
		    return true;
		  } else if (isArray(value) && value.length === 0) {
		    return true;
		  } else {
		    return false;
		  }
		}
	
		function createFrame(object) {
		  var frame = extend({}, object);
		  frame._parent = object;
		  return frame;
		}
	
		function blockParams(params, ids) {
		  params.path = ids;
		  return params;
		}
	
		function appendContextPath(contextPath, id) {
		  return (contextPath ? contextPath + '.' : '') + id;
		}
	
	/***/ },
	/* 5 */
	/***/ function(module, exports) {
	
		'use strict';
	
		exports.__esModule = true;
	
		var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];
	
		function Exception(message, node) {
		  var loc = node && node.loc,
		      line = undefined,
		      column = undefined;
		  if (loc) {
		    line = loc.start.line;
		    column = loc.start.column;
	
		    message += ' - ' + line + ':' + column;
		  }
	
		  var tmp = Error.prototype.constructor.call(this, message);
	
		  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
		  for (var idx = 0; idx < errorProps.length; idx++) {
		    this[errorProps[idx]] = tmp[errorProps[idx]];
		  }
	
		  /* istanbul ignore else */
		  if (Error.captureStackTrace) {
		    Error.captureStackTrace(this, Exception);
		  }
	
		  if (loc) {
		    this.lineNumber = line;
		    this.column = column;
		  }
		}
	
		Exception.prototype = new Error();
	
		exports['default'] = Exception;
		module.exports = exports['default'];
	
	/***/ },
	/* 6 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
		exports.registerDefaultHelpers = registerDefaultHelpers;
	
		var _helpersBlockHelperMissing = __webpack_require__(7);
	
		var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);
	
		var _helpersEach = __webpack_require__(8);
	
		var _helpersEach2 = _interopRequireDefault(_helpersEach);
	
		var _helpersHelperMissing = __webpack_require__(9);
	
		var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);
	
		var _helpersIf = __webpack_require__(10);
	
		var _helpersIf2 = _interopRequireDefault(_helpersIf);
	
		var _helpersLog = __webpack_require__(11);
	
		var _helpersLog2 = _interopRequireDefault(_helpersLog);
	
		var _helpersLookup = __webpack_require__(12);
	
		var _helpersLookup2 = _interopRequireDefault(_helpersLookup);
	
		var _helpersWith = __webpack_require__(13);
	
		var _helpersWith2 = _interopRequireDefault(_helpersWith);
	
		function registerDefaultHelpers(instance) {
		  _helpersBlockHelperMissing2['default'](instance);
		  _helpersEach2['default'](instance);
		  _helpersHelperMissing2['default'](instance);
		  _helpersIf2['default'](instance);
		  _helpersLog2['default'](instance);
		  _helpersLookup2['default'](instance);
		  _helpersWith2['default'](instance);
		}
	
	/***/ },
	/* 7 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		exports.__esModule = true;
	
		var _utils = __webpack_require__(4);
	
		exports['default'] = function (instance) {
		  instance.registerHelper('blockHelperMissing', function (context, options) {
		    var inverse = options.inverse,
		        fn = options.fn;
	
		    if (context === true) {
		      return fn(this);
		    } else if (context === false || context == null) {
		      return inverse(this);
		    } else if (_utils.isArray(context)) {
		      if (context.length > 0) {
		        if (options.ids) {
		          options.ids = [options.name];
		        }
	
		        return instance.helpers.each(context, options);
		      } else {
		        return inverse(this);
		      }
		    } else {
		      if (options.data && options.ids) {
		        var data = _utils.createFrame(options.data);
		        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
		        options = { data: data };
		      }
	
		      return fn(context, options);
		    }
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
	
		var _utils = __webpack_require__(4);
	
		var _exception = __webpack_require__(5);
	
		var _exception2 = _interopRequireDefault(_exception);
	
		exports['default'] = function (instance) {
		  instance.registerHelper('each', function (context, options) {
		    if (!options) {
		      throw new _exception2['default']('Must pass iterator to #each');
		    }
	
		    var fn = options.fn,
		        inverse = options.inverse,
		        i = 0,
		        ret = '',
		        data = undefined,
		        contextPath = undefined;
	
		    if (options.data && options.ids) {
		      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
		    }
	
		    if (_utils.isFunction(context)) {
		      context = context.call(this);
		    }
	
		    if (options.data) {
		      data = _utils.createFrame(options.data);
		    }
	
		    function execIteration(field, index, last) {
		      if (data) {
		        data.key = field;
		        data.index = index;
		        data.first = index === 0;
		        data.last = !!last;
	
		        if (contextPath) {
		          data.contextPath = contextPath + field;
		        }
		      }
	
		      ret = ret + fn(context[field], {
		        data: data,
		        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
		      });
		    }
	
		    if (context && typeof context === 'object') {
		      if (_utils.isArray(context)) {
		        for (var j = context.length; i < j; i++) {
		          if (i in context) {
		            execIteration(i, i, i === context.length - 1);
		          }
		        }
		      } else {
		        var priorKey = undefined;
	
		        for (var key in context) {
		          if (context.hasOwnProperty(key)) {
		            // We're running the iterations one step out of sync so we can detect
		            // the last iteration without have to scan the object twice and create
		            // an itermediate keys array.
		            if (priorKey !== undefined) {
		              execIteration(priorKey, i - 1);
		            }
		            priorKey = key;
		            i++;
		          }
		        }
		        if (priorKey !== undefined) {
		          execIteration(priorKey, i - 1, true);
		        }
		      }
		    }
	
		    if (i === 0) {
		      ret = inverse(this);
		    }
	
		    return ret;
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 9 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
	
		var _exception = __webpack_require__(5);
	
		var _exception2 = _interopRequireDefault(_exception);
	
		exports['default'] = function (instance) {
		  instance.registerHelper('helperMissing', function () /* [args, ]options */{
		    if (arguments.length === 1) {
		      // A missing field in a {{foo}} construct.
		      return undefined;
		    } else {
		      // Someone is actually trying to call something, blow up.
		      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
		    }
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		exports.__esModule = true;
	
		var _utils = __webpack_require__(4);
	
		exports['default'] = function (instance) {
		  instance.registerHelper('if', function (conditional, options) {
		    if (_utils.isFunction(conditional)) {
		      conditional = conditional.call(this);
		    }
	
		    // Default behavior is to render the positive path if the value is truthy and not empty.
		    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
		    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
		    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
		      return options.inverse(this);
		    } else {
		      return options.fn(this);
		    }
		  });
	
		  instance.registerHelper('unless', function (conditional, options) {
		    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 11 */
	/***/ function(module, exports) {
	
		'use strict';
	
		exports.__esModule = true;
	
		exports['default'] = function (instance) {
		  instance.registerHelper('log', function () /* message, options */{
		    var args = [undefined],
		        options = arguments[arguments.length - 1];
		    for (var i = 0; i < arguments.length - 1; i++) {
		      args.push(arguments[i]);
		    }
	
		    var level = 1;
		    if (options.hash.level != null) {
		      level = options.hash.level;
		    } else if (options.data && options.data.level != null) {
		      level = options.data.level;
		    }
		    args[0] = level;
	
		    instance.log.apply(instance, args);
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 12 */
	/***/ function(module, exports) {
	
		'use strict';
	
		exports.__esModule = true;
	
		exports['default'] = function (instance) {
		  instance.registerHelper('lookup', function (obj, field) {
		    return obj && obj[field];
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 13 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		exports.__esModule = true;
	
		var _utils = __webpack_require__(4);
	
		exports['default'] = function (instance) {
		  instance.registerHelper('with', function (context, options) {
		    if (_utils.isFunction(context)) {
		      context = context.call(this);
		    }
	
		    var fn = options.fn;
	
		    if (!_utils.isEmpty(context)) {
		      var data = options.data;
		      if (options.data && options.ids) {
		        data = _utils.createFrame(options.data);
		        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
		      }
	
		      return fn(context, {
		        data: data,
		        blockParams: _utils.blockParams([context], [data && data.contextPath])
		      });
		    } else {
		      return options.inverse(this);
		    }
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 14 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
		exports.registerDefaultDecorators = registerDefaultDecorators;
	
		var _decoratorsInline = __webpack_require__(15);
	
		var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);
	
		function registerDefaultDecorators(instance) {
		  _decoratorsInline2['default'](instance);
		}
	
	/***/ },
	/* 15 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		exports.__esModule = true;
	
		var _utils = __webpack_require__(4);
	
		exports['default'] = function (instance) {
		  instance.registerDecorator('inline', function (fn, props, container, options) {
		    var ret = fn;
		    if (!props.partials) {
		      props.partials = {};
		      ret = function (context, options) {
		        // Create a new partials stack frame prior to exec.
		        var original = container.partials;
		        container.partials = _utils.extend({}, original, props.partials);
		        var ret = fn(context, options);
		        container.partials = original;
		        return ret;
		      };
		    }
	
		    props.partials[options.args[0]] = options.fn;
	
		    return ret;
		  });
		};
	
		module.exports = exports['default'];
	
	/***/ },
	/* 16 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		exports.__esModule = true;
	
		var _utils = __webpack_require__(4);
	
		var logger = {
		  methodMap: ['debug', 'info', 'warn', 'error'],
		  level: 'info',
	
		  // Maps a given level value to the `methodMap` indexes above.
		  lookupLevel: function lookupLevel(level) {
		    if (typeof level === 'string') {
		      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
		      if (levelMap >= 0) {
		        level = levelMap;
		      } else {
		        level = parseInt(level, 10);
		      }
		    }
	
		    return level;
		  },
	
		  // Can be overridden in the host environment
		  log: function log(level) {
		    level = logger.lookupLevel(level);
	
		    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
		      var method = logger.methodMap[level];
		      if (!console[method]) {
		        // eslint-disable-line no-console
		        method = 'log';
		      }
	
		      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		        message[_key - 1] = arguments[_key];
		      }
	
		      console[method].apply(console, message); // eslint-disable-line no-console
		    }
		  }
		};
	
		exports['default'] = logger;
		module.exports = exports['default'];
	
	/***/ },
	/* 17 */
	/***/ function(module, exports) {
	
		// Build out our basic SafeString type
		'use strict';
	
		exports.__esModule = true;
		function SafeString(string) {
		  this.string = string;
		}
	
		SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
		  return '' + this.string;
		};
	
		exports['default'] = SafeString;
		module.exports = exports['default'];
	
	/***/ },
	/* 18 */
	/***/ function(module, exports, __webpack_require__) {
	
		'use strict';
	
		var _interopRequireWildcard = __webpack_require__(1)['default'];
	
		var _interopRequireDefault = __webpack_require__(2)['default'];
	
		exports.__esModule = true;
		exports.checkRevision = checkRevision;
		exports.template = template;
		exports.wrapProgram = wrapProgram;
		exports.resolvePartial = resolvePartial;
		exports.invokePartial = invokePartial;
		exports.noop = noop;
	
		var _utils = __webpack_require__(4);
	
		var Utils = _interopRequireWildcard(_utils);
	
		var _exception = __webpack_require__(5);
	
		var _exception2 = _interopRequireDefault(_exception);
	
		var _base = __webpack_require__(3);
	
		function checkRevision(compilerInfo) {
		  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
		      currentRevision = _base.COMPILER_REVISION;
	
		  if (compilerRevision !== currentRevision) {
		    if (compilerRevision < currentRevision) {
		      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
		          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
		      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
		    } else {
		      // Use the embedded version info since the runtime doesn't know about this revision yet
		      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
		    }
		  }
		}
	
		function template(templateSpec, env) {
		  /* istanbul ignore next */
		  if (!env) {
		    throw new _exception2['default']('No environment passed to template');
		  }
		  if (!templateSpec || !templateSpec.main) {
		    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
		  }
	
		  templateSpec.main.decorator = templateSpec.main_d;
	
		  // Note: Using env.VM references rather than local var references throughout this section to allow
		  // for external users to override these as psuedo-supported APIs.
		  env.VM.checkRevision(templateSpec.compiler);
	
		  function invokePartialWrapper(partial, context, options) {
		    if (options.hash) {
		      context = Utils.extend({}, context, options.hash);
		      if (options.ids) {
		        options.ids[0] = true;
		      }
		    }
	
		    partial = env.VM.resolvePartial.call(this, partial, context, options);
		    var result = env.VM.invokePartial.call(this, partial, context, options);
	
		    if (result == null && env.compile) {
		      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
		      result = options.partials[options.name](context, options);
		    }
		    if (result != null) {
		      if (options.indent) {
		        var lines = result.split('\n');
		        for (var i = 0, l = lines.length; i < l; i++) {
		          if (!lines[i] && i + 1 === l) {
		            break;
		          }
	
		          lines[i] = options.indent + lines[i];
		        }
		        result = lines.join('\n');
		      }
		      return result;
		    } else {
		      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
		    }
		  }
	
		  // Just add water
		  var container = {
		    strict: function strict(obj, name) {
		      if (!(name in obj)) {
		        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
		      }
		      return obj[name];
		    },
		    lookup: function lookup(depths, name) {
		      var len = depths.length;
		      for (var i = 0; i < len; i++) {
		        if (depths[i] && depths[i][name] != null) {
		          return depths[i][name];
		        }
		      }
		    },
		    lambda: function lambda(current, context) {
		      return typeof current === 'function' ? current.call(context) : current;
		    },
	
		    escapeExpression: Utils.escapeExpression,
		    invokePartial: invokePartialWrapper,
	
		    fn: function fn(i) {
		      var ret = templateSpec[i];
		      ret.decorator = templateSpec[i + '_d'];
		      return ret;
		    },
	
		    programs: [],
		    program: function program(i, data, declaredBlockParams, blockParams, depths) {
		      var programWrapper = this.programs[i],
		          fn = this.fn(i);
		      if (data || depths || blockParams || declaredBlockParams) {
		        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
		      } else if (!programWrapper) {
		        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
		      }
		      return programWrapper;
		    },
	
		    data: function data(value, depth) {
		      while (value && depth--) {
		        value = value._parent;
		      }
		      return value;
		    },
		    merge: function merge(param, common) {
		      var obj = param || common;
	
		      if (param && common && param !== common) {
		        obj = Utils.extend({}, common, param);
		      }
	
		      return obj;
		    },
	
		    noop: env.VM.noop,
		    compilerInfo: templateSpec.compiler
		  };
	
		  function ret(context) {
		    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
		    var data = options.data;
	
		    ret._setup(options);
		    if (!options.partial && templateSpec.useData) {
		      data = initData(context, data);
		    }
		    var depths = undefined,
		        blockParams = templateSpec.useBlockParams ? [] : undefined;
		    if (templateSpec.useDepths) {
		      if (options.depths) {
		        depths = context !== options.depths[0] ? [context].concat(options.depths) : options.depths;
		      } else {
		        depths = [context];
		      }
		    }
	
		    function main(context /*, options*/) {
		      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
		    }
		    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
		    return main(context, options);
		  }
		  ret.isTop = true;
	
		  ret._setup = function (options) {
		    if (!options.partial) {
		      container.helpers = container.merge(options.helpers, env.helpers);
	
		      if (templateSpec.usePartial) {
		        container.partials = container.merge(options.partials, env.partials);
		      }
		      if (templateSpec.usePartial || templateSpec.useDecorators) {
		        container.decorators = container.merge(options.decorators, env.decorators);
		      }
		    } else {
		      container.helpers = options.helpers;
		      container.partials = options.partials;
		      container.decorators = options.decorators;
		    }
		  };
	
		  ret._child = function (i, data, blockParams, depths) {
		    if (templateSpec.useBlockParams && !blockParams) {
		      throw new _exception2['default']('must pass block params');
		    }
		    if (templateSpec.useDepths && !depths) {
		      throw new _exception2['default']('must pass parent depths');
		    }
	
		    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
		  };
		  return ret;
		}
	
		function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
		  function prog(context) {
		    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
		    var currentDepths = depths;
		    if (depths && context !== depths[0]) {
		      currentDepths = [context].concat(depths);
		    }
	
		    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
		  }
	
		  prog = executeDecorators(fn, prog, container, depths, data, blockParams);
	
		  prog.program = i;
		  prog.depth = depths ? depths.length : 0;
		  prog.blockParams = declaredBlockParams || 0;
		  return prog;
		}
	
		function resolvePartial(partial, context, options) {
		  if (!partial) {
		    if (options.name === '@partial-block') {
		      partial = options.data['partial-block'];
		    } else {
		      partial = options.partials[options.name];
		    }
		  } else if (!partial.call && !options.name) {
		    // This is a dynamic partial that returned a string
		    options.name = partial;
		    partial = options.partials[partial];
		  }
		  return partial;
		}
	
		function invokePartial(partial, context, options) {
		  options.partial = true;
		  if (options.ids) {
		    options.data.contextPath = options.ids[0] || options.data.contextPath;
		  }
	
		  var partialBlock = undefined;
		  if (options.fn && options.fn !== noop) {
		    options.data = _base.createFrame(options.data);
		    partialBlock = options.data['partial-block'] = options.fn;
	
		    if (partialBlock.partials) {
		      options.partials = Utils.extend({}, options.partials, partialBlock.partials);
		    }
		  }
	
		  if (partial === undefined && partialBlock) {
		    partial = partialBlock;
		  }
	
		  if (partial === undefined) {
		    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
		  } else if (partial instanceof Function) {
		    return partial(context, options);
		  }
		}
	
		function noop() {
		  return '';
		}
	
		function initData(context, data) {
		  if (!data || !('root' in data)) {
		    data = data ? _base.createFrame(data) : {};
		    data.root = context;
		  }
		  return data;
		}
	
		function executeDecorators(fn, prog, container, depths, data, blockParams) {
		  if (fn.decorator) {
		    var props = {};
		    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
		    Utils.extend(prog, props);
		  }
		  return prog;
		}
	
	/***/ },
	/* 19 */
	/***/ function(module, exports) {
	
		/* WEBPACK VAR INJECTION */(function(global) {/* global window */
		'use strict';
	
		exports.__esModule = true;
	
		exports['default'] = function (Handlebars) {
		  /* istanbul ignore next */
		  var root = typeof global !== 'undefined' ? global : window,
		      $Handlebars = root.Handlebars;
		  /* istanbul ignore next */
		  Handlebars.noConflict = function () {
		    if (root.Handlebars === Handlebars) {
		      root.Handlebars = $Handlebars;
		    }
		    return Handlebars;
		  };
		};
	
		module.exports = exports['default'];
		/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))
	
	/***/ }
	/******/ ])
	});
	;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Search = __webpack_require__(10);
	
	/**
	 * Constructor
	 *
	 * @param FormState
	 * @param container
	 * @constructor
	 */
	function Step (FormState, container) {
	
	    this.container = container;
	    this.$container = $(container);
	    this.CurrentFormState = container == '.first-condition' ? FormState.firstStep : FormState.secondStep;
	    this.$select = $(container + ' select');
	    this.$loader = $('<div class="loader"></div>');
	    this.init();
	
	}
	
	/**
	 * Init step
	 */
	Step.prototype.init = function () {
	
	    var self = this;
	
	    self.handler_onMouseDownSelect();
	    self.handler_onChangeSelect();
	
	    //Typeahead initialization
	    self.search = new Search(self.container, self.searchResponseCallback);
	
	    // Pressed mouse or enter button
	    self.search.$typeahead.bind("typeahead:selected", function (e, selectedGovernment) {
	        self.CurrentFormState.data = selectedGovernment;
	        self.createYearOptions(selectedGovernment);
	    });
	
	    // Start typing, triggered after select item
	    self.search.$typeahead.bind('typeahead:asyncrequest', function(e) {
	        self.loading(true);
	    });
	
	
	    self.search.$typeahead.bind('typeahead:asyncreceive', function(e) {
	        self.loading(false);
	    });
	
	    self.search.$typeahead.bind('typeahead:asynccancel', function(e) {
	        self.loading(false);
	        self.lockSelect();
	    });
	
	    self.search.$typeahead.bind('typeahead:open', function(e) {
	        self.lockSelect();
	        self.CurrentFormState.incomplete();
	    });
	
	};
	
	
	/**
	 * (DOM)
	 *
	 * Unlock step
	 */
	Step.prototype.unlock = function() {
	    this.search.$typeahead.toggleClass('disabled', false);
	};
	
	
	/**
	 * (DOM)
	 *
	 * Lock step
	 */
	Step.prototype.lock = function() {
	    this.search.$typeahead.toggleClass('disabled', true);
	    this.$select.toggleClass('disabled', true);
	};
	
	
	/**
	 * (DOM)
	 *
	 * Lock step
	 */
	Step.prototype.lockSelect = function() {
	    this.$select.toggleClass('disabled', true);
	};
	
	/**
	 * (DOM)
	 *
	 * Loading state
	 * @param isLoading
	 */
	Step.prototype.loading = function(isLoading) {
	
	    var display = isLoading ? 'none' : 'block';
	    this.$select.css({display: display});
	
	    if (isLoading) {
	        this.$container.append(this.$loader);
	    } else {
	        this.$loader.remove();
	    }
	
	};
	
	/**
	 * (DOM)
	 *
	 * @param data
	 * @returns {boolean}
	 */
	Step.prototype.createYearOptions = function(government) {
	
	    var self = this;
	
	    if (!government) {
	        console.error('First argument not passed in createYearOptions() ');
	        return true;
	    }
	
	    var sortedYears = government.years.sort(function(a, b) {
	        return a < b;
	    });
	
	    self.CurrentFormState.data.year = government.years[0];
	
	    disableSelect(false);
	
	    sortedYears.forEach(function (year, index) {
	        var selected = index == 0 ? 'selected' : '';
	        self.$select.append('<option value="' + government.id + '" ' + selected + '>' + year + '</option>');
	    });
	
	    correctForm(true);
	
	    /**
	     * Disable select
	     * @param {Boolean} disabled
	     */
	    function disableSelect(disabled) {
	
	        self.$select.toggleClass('disabled', !!disabled);
	
	    }
	
	    /**
	     *
	     * @param isCorrect
	     */
	    function correctForm(isCorrect) {
	        isCorrect ? self.CurrentFormState.complete() : self.CurrentFormState.incomplete();
	    }
	
	};
	
	
	/**
	 * (Handler)
	 *
	 * On change select
	 */
	Step.prototype.handler_onChangeSelect = function () {
	
	    var self = this;
	
	    self.$select.on('change', function (e) {
	
	        var $el = $(e.target);
	
	        var $selected = $el.find('option:selected');
	        var value = $selected.attr('value');
	        var text = $selected.text();
	
	        if (value) {
	            self.CurrentFormState.data.year = value;
	            self.CurrentFormState.complete();
	        } else {
	            alert('Please choose correct year');
	            self.CurrentFormState.incomplete();
	        }
	
	    });
	
	};
	
	
	/**
	 * Show error message if government not selected
	 */
	Step.prototype.handler_onMouseDownSelect = function () {
	
	    var self = this;
	
	    self.$select.on('mousedown', function (e) {
	
	        var $el = $(e.target);
	
	        if ($el.hasClass('disabled')) {
	            alert('Please, first select government');
	            return false;
	        }
	
	    });
	
	};
	
	module.exports = Step;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var Handlebars = __webpack_require__(11);
	
	/**
	 * Typeahead search
	 *
	 * @param {Selector} container - May be .first-condition or .second-condition
	 */
	function typeahead(container) {
	
	    if (!container) {
	        alert('Please pass container selector');
	        return true;
	    }
	
	    var self = this;
	    self.governmentData = {};
	    self.$typeahead = $(container + ' .typeahead_government');
	    self.searchValue = '';
	
	    // Init typeahead
	    self.$typeahead.typeahead({
	        hint: true,
	        highlight: true,
	        minLength: 3
	    }, {
	        name: 'countries',
	        source: findMatches,
	        templates: {
	            empty: '<div class="tt-suggestion">Not found. Please retype your query </div>',
	            suggestion: Handlebars.compile('<div class="sugg-box">'+
	                '<div class="sugg-name">{{name}}</div>' +
	                '</div>')
	        },
	        updater: function (item) {
	            alert(item);
	        }
	    });
	
	    // Pressed mouse or enter button
	    self.$typeahead.bind("typeahead:selected", function(obj, selectedGovernment) {
	        self.$typeahead.typeahead('val', selectedGovernment.name);
	    });
	
	    // Move cursor via arrows keys
	    self.$typeahead.bind("typeahead:cursorchange", function(obj) {
	        self.$typeahead.typeahead('val', self.searchValue);
	    });
	
	    // Store search value on typing
	    self.$typeahead.keyup(function(event) {
	        self.searchValue = $(event.target).val();
	    });
	
	    /**
	     * (Ajax)
	     *
	     * Matcher for typeahead
	     * @param query
	     * @param syncCallback
	     * @param asyncCallback
	     **/
	    function findMatches(query, syncCallback, asyncCallback) {
	        $.ajax({
	            method: 'GET',
	            url: window.gw.urls.search +'?search='+ query
	        }).success(function(data) {
	            asyncCallback(data);
	        });
	    }
	
	    return self;
	
	}
	
	module.exports = typeahead;


/***/ },
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *
	 * @param FormState
	 * @param container
	 * @returns {*}
	 */
	function init (FormState, container) {
	    var Step1 = __webpack_require__(9);
	    return new Step1(FormState, container);
	}
	
	module.exports = init;

/***/ },
/* 24 */
/***/ function(module, exports) {

	/**
	 * Constructor
	 * @param FormState
	 * @param container
	 * @constructor
	 */
	function Step (FormState, container) {
	
	    this.container = container;
	    this.$governmentCategories = $(container);
	    this.firstStep = FormState.firstStep;
	    this.secondStep = FormState.secondStep;
	    this.$loader = $('<div class="loader"></div>');
	    this.init();
	
	}
	
	/**
	 * Init step
	 */
	Step.prototype.init = function () {
	
	    this.handler_onChangeSelect();
	    this.handler_onClickSelect();
	
	};
	
	/**
	 * (Ajax, DOM)
	 *
	 * Unlock step
	 */
	Step.prototype.unlock = function() {
	    this.loading(true);
	    this.loadMatchedCategories();
	    this.$governmentCategories.toggleClass('disabled', false);
	};
	
	/**
	 * Lock step
	 */
	Step.prototype.lock = function() {
	    this.$governmentCategories.toggleClass('disabled', true);
	};
	
	
	/**
	 * (DOM)
	 *
	 * Loading state
	 * @param isLoading
	 */
	Step.prototype.loading = function(isLoading) {
	
	    var display = isLoading ? 'none' : 'block';
	    this.$governmentCategories.css({display: display});
	
	    if (isLoading) {
	        this.$governmentCategories.parent().append(this.$loader);
	    } else {
	        this.$loader.remove();
	    }
	
	};
	
	/**
	 * (DOM)
	 * 
	 * Manipulate tab state
	 */
	Step.prototype.switchGraphs = function() {
	    
	    var $preloader = $('<div class="loader"></div>');
	    var $firstPie = $('#total-compare-first-pie');
	    var $secondPie = $('#total-compare-second-pie');
	    var $compareColumn = $('#total-compare-column');
	
	    // Add background on selected items
	    $('.government-categories .category').removeClass('selected');
	    $('.government-categories .caption').addClass('selected');
	
	    // View state
	    $compareColumn.show();
	    $firstPie.hide();
	    $secondPie.hide();
	
	    // Show preloaders
	    $compareColumn.find('p').append($preloader);
	    
	};
	
	
	/**
	 * (Ajax, DOM)
	 */
	Step.prototype.loadMatchedCategories = function() {
	
	    var self = this;
	    var captions = {
	        captions : [
	            {
	                id: self.firstStep.data.id,
	                year: self.firstStep.data.year,
	                altType: self.firstStep.data.altType
	            },
	            {
	                id: self.secondStep.data.id,
	                year: self.secondStep.data.year,
	                altType: self.secondStep.data.altType
	            }
	        ]
	    };
	
	    var captionsJson = JSON.stringify(captions);
	
	    $.ajax({
	        url: window.gw.urls.captions,
	        type: 'POST',
	        contentType: 'application/json',
	        data: captionsJson,
	        success: function (data) {
	
	            self.loading(false);
	
	            if (!data || data.length == 0) {
	                alert('Not can find categories for current comparison');
	                self.$governmentCategories.html('<option>ALL CATEGORIES</option>');
	                self.$governmentCategories.toggleClass('disabled', true);
	                return true;
	            }
	
	            self.$governmentCategories.toggleClass('disabled', false);
	
	            /**
	             * Create expenditures group
	             */
	            var expenditures = data.filter(function(item) {
	                return item.category == 'Expenditures';
	            });
	
	            var availableTabs = [];
	            data.forEach(function(item) {
	                availableTabs.indexOf(item.tab) != -1 ? false : availableTabs.push(item.tab);
	            });
	
	            availableTabs.forEach(function(tab){
	                self.$governmentCategories.append('<optgroup label="' + tab + '"></optgroup>');
	            });
	
	            data.forEach(function (caption) {
	                var value = caption.fieldName || caption.name;
	                var $expenditureGroup = self.$governmentCategories.find('[label="' + caption.tab + '"]');
	                $expenditureGroup.append('<option value="' + value + '">' + caption.name + '</option>');
	            });
	
	        },
	        error: function () {
	            self.loading(false);
	            alert('Something wrong, please try another government');
	            self.$governmentCategories.toggleClass('disabled', true);
	        }
	    });
	
	};
	
	/**
	 * @param data
	 * @param blockId
	 */
	Step.prototype.drawDiagramm = function(government, blockId, captionCategory) {
	
	    var chart, options, r, rows, vis_data;
	
	    vis_data = new google.visualization.DataTable();
	
	    vis_data.addColumn('string', 'Caption');
	    vis_data.addColumn('number', 'Total Funds');
	    rows = [];
	
	    rows.push(['Total ' + captionCategory, parseInt(government.total)]);
	
	    var captions = government.data;
	    captions.forEach(function(item) {
	        rows.push([item.caption, parseInt(item.amount)]);
	    });
	
	    vis_data.addRows(rows);
	    options = {
	        'title': 'Compare',
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
	        'sliceVisibilityThreshold': 0,
	        'forceIFrame': true,
	        'chartArea': {
	            width: '90%',
	            height: '75%'
	        }
	    };
	    chart = new google.visualization.PieChart(document.getElementById(blockId));
	    chart.draw(vis_data, options);
	
	};
	
	/**
	 * (Ajax, DOM)
	 * TODO: Draft
	 * If option selected, draw chart
	 */
	Step.prototype.handler_onChangeSelect = function() {
	
	    var self = this;
	
	    $(self.container).on('change', function (e) {
	
	        var $el = $(e.target);
	        var $selected = $el.find('option:selected');
	
	        var caption = $selected.text();
	
	        var tab = $selected.parent('optgroup').attr('label');
	
	        if (!caption) {
	            alert('Please select one of captions');
	            return true;
	        }
	
	        self.switchGraphs();
	
	        var data = {
	            firstGovernment: {
	                id: self.firstStep.data.id,
	                name: self.firstStep.data.name,
	                year: self.firstStep.data.year
	            },
	            secondGovernment: {
	                id: self.secondStep.data.id,
	                name: self.secondStep.data.name,
	                year: self.firstStep.data.year
	            },
	            caption: caption,
	            tab: tab
	        };
	
	        if (tab != 'Financial Statement') {
	            data.fieldName = $selected.val();
	        }
	
	
	        data = JSON.stringify(data);
	
	        $.ajax({
	            url: window.gw.urls.compare,
	            type: 'POST',
	            data: data,
	            contentType: 'application/json',
	            success: function (comparedData) {
	                self.drawColumnChart(comparedData, 'total-compare-column');
	            }
	        });
	
	    });
	
	};
	
	
	/**
	 * (Ajax, DOM)
	 *
	 * Check third input, if previous form items filled correct - load governments categories
	 */
	Step.prototype.handler_onClickSelect = function() {
	
	    var self = this;
	
	    $('.government-categories').on('mousedown', function (e) {
	
	        var $el = $(e.target);
	
	        if ($el.hasClass('disabled')) {
	            alert('Please, first select governments');
	            return false;
	        } else if (!self.firstStep.completed || !self.secondStep.completed) {
	            alert('Please, first enter all fields');
	            return false;
	        }
	
	    });
	
	};
	
	Step.prototype.drawColumnChart = function(comparedData, blockId) {
	
	    var chart, options, rows, vis_data;
	
	    var firstGovernment = comparedData.firstGovernment;
	    var secondGovernment = comparedData.secondGovernment;
	
	    rows = [
	        ['City', 'Amount']
	    ];
	
	    rows.push([firstGovernment.name, parseInt(firstGovernment.data[0].amount)]);
	    rows.push([secondGovernment.name, parseInt(secondGovernment.data[0].amount)]);
	
	    options = {
	        'title': comparedData.caption,
	        'titleTextStyle': {
	            'fontSize': 16
	        },
	        'tooltip': {
	            'textStyle': {
	                'fontSize': 12
	            }
	        },
	        'width': 500,
	        'height': 350,
	        'pieStartAngle': 60,
	        'sliceVisibilityThreshold': .05,
	        'forceIFrame': true,
	        'chartArea': {
	            width: '90%',
	            height: '75%'
	        }
	    };
	
	    vis_data = new google.visualization.arrayToDataTable(rows);
	    chart = new google.visualization.ColumnChart(document.getElementById(blockId));
	    chart.draw(vis_data, options);
	
	};
	
	module.exports = Step;


/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * Constructor
	 * @param FormState
	 * @param container
	 * @constructor
	 */
	function Step (FormState, container) {
	
	    this.container = container;
	    this.$governmentCategories = $(container);
	    this.firstStep = FormState.firstStep;
	    this.secondStep = FormState.secondStep;
	    this.init();
	}
	
	/**
	 * Init step
	 */
	Step.prototype.init = function () {
	
	    this.handler_onChangeSelect();
	    this.handler_onClickSelect();
	
	};
	
	/**
	 * (Ajax, DOM)
	 *
	 * Unlock step
	 */
	Step.prototype.unlock = function() {
	    this.$governmentCategories.toggleClass('disabled', false);
	};
	
	/**
	 * Lock step
	 */
	Step.prototype.lock = function() {
	    this.$governmentCategories.toggleClass('disabled', true);
	};
	
	/**
	 * @param data
	 * @param blockId
	 */
	Step.prototype.drawDiagramm = function(government, blockId, comparedData) {
	
	    var chart, options, rows, vis_data;
	
	    vis_data = new google.visualization.DataTable();
	
	    vis_data.addColumn('string', 'Caption');
	    vis_data.addColumn('number', 'Total Funds');
	    rows = [];
	
	    var captions = government.data;
	    captions.forEach(function(item) {
	        if (item.amount < 0) {
	            item.amount = -parseInt(item.amount)
	        }
	        rows.push([item.caption, parseInt(item.amount)]);
	    });
	
	    vis_data.addRows(rows);
	    options = {
	        'title': 'Total ' + comparedData.category + ': ' + government.name,
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
	        'sliceVisibilityThreshold': 0,
	        'forceIFrame': true,
	        'chartArea': {
	            width: '90%',
	            height: '75%'
	        }
	    };
	    chart = new google.visualization.PieChart(document.getElementById(blockId));
	    chart.draw(vis_data, options);
	
	};
	
	
	/**
	 * (DOM)
	 *
	 * Manipulate tab state
	 */
	Step.prototype.switchGraphs = function() {
	
	    var $firstPie = $('#total-compare-first-pie');
	    var $secondPie = $('#total-compare-second-pie');
	    var $compareColumn = $('#total-compare-column');
	    var $firstPreloader = $('<div class="loader"></div>');
	    var $secondPreloader = $('<div class="loader"></div>');
	
	    // Add background on selected items
	    $('.government-categories .category').addClass('selected');
	    $('.government-categories .caption').removeClass('selected');
	
	    // View state
	    $compareColumn.hide();
	    $firstPie.show();
	    $secondPie.show();
	
	    // Show preloaders
	    $firstPie.find('p').append($firstPreloader);
	    $secondPie.find('p').append($secondPreloader);
	
	};
	
	/**
	 *
	 * @param container
	 * @param comparedData
	 */
	Step.prototype.drawTable = function(container, comparedData) {
	
	    var $container = $(container);
	    var governmentNumber = (container == '.compare-first-table') ? 'firstGovernment' : 'secondGovernment';
	
	    var category = comparedData.category;
	    var governmentName = comparedData[governmentNumber].name;
	
	    var thead = '<thead><tr><th colspan="2" style="text-align: center">' + governmentName + '</th></tr><tr><th>' + category + '</th><th> Total Gov. Funds </th></tr>></thead>';
	    var tbody = '<tbody>';
	
	    comparedData[governmentNumber].data.forEach(function(row){
	        tbody += '<tr><td>' + row.caption + '</td><td>' + row.amount + '</td></tr>';
	    });
	
	    tbody += '</tbody>';
	
	    $container.append(thead);
	    $container.append(tbody);
	
	};
	
	
	/**
	 * (Ajax, DOM)
	 * TODO: Draft
	 * If option selected, draw chart
	 */
	Step.prototype.handler_onChangeSelect = function() {
	
	    var self = this;
	
	
	    $(self.container).on('change', function (e) {
	
	        var $el = $(e.target);
	        var $selected = $el.find('option:selected');
	        var tab = $selected.parent('optgroup').attr('label');
	
	        var category = $selected.val();
	
	        if (!category) {
	            alert('Please select one of category');
	            return true;
	        }
	
	        self.switchGraphs();
	
	        var data = {
	            firstGovernment: {
	                id: self.firstStep.data.id,
	                name: self.firstStep.data.name,
	                year: self.firstStep.data.year
	            },
	            secondGovernment: {
	                id: self.secondStep.data.id,
	                name: self.secondStep.data.name,
	                year: self.firstStep.data.year
	            },
	            category: category,
	            tab: tab
	        };
	
	        data = JSON.stringify(data);
	
	        $.ajax({
	            url: window.gw.urls.compare,
	            type: 'POST',
	            data: data,
	            contentType: 'application/json',
	            success: function (comparedData) {
	                self.drawTable('.compare-first-table', comparedData);
	                self.drawTable('.compare-second-table', comparedData);
	                self.drawDiagramm(comparedData.firstGovernment, 'total-compare-first-pie', comparedData);
	                self.drawDiagramm(comparedData.secondGovernment, 'total-compare-second-pie', comparedData);
	                $('.financial-table').hide();
	            }
	        });
	
	    });
	
	};
	
	
	/**
	 * (Ajax, DOM)
	 *
	 * Check third input, if previous form items filled correct - load governments categories
	 */
	Step.prototype.handler_onClickSelect = function() {
	
	    var self = this;
	
	    $('.government-categories').on('mousedown', function (e) {
	
	        var $el = $(e.target);
	
	        if ($el.hasClass('disabled')) {
	            alert('Please, first select governments');
	            return false;
	        } else if (!self.firstStep.completed || !self.secondStep.completed) {
	            alert('Please, first enter all fields');
	            return false;
	        }
	
	    });
	
	};
	
	module.exports = Step;


/***/ }
]);
//# sourceMappingURL=government.js.map
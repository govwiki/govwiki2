var $subscribeBtn;
var $mobileNav = $('.nav');
var tab;

var step1;
var step2;
var step3;
var step31;

var FormState;
var Step31;
var Step3;
var Step2;
var Step1;
var government = JSON.parse(window.gw.government);
var modal = $('#addIssue');
var authorized = window.gw.authorized;
var Handlebars = require('../vendor/handlebars.js');

var graphs = require('./graphs.js');
var popover = new (require('./rank-popover.js'))({  // eslint-disable-line
  year: JSON.parse(window.gw.government).currentYear
});

require(__dirname + '/../../../../../../../'
+ 'bower_components/x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js');

Step1 = require('./form/compare/step-1.js');
Step2 = require('./form/compare/step-2.js');
Step3 = require('./form/compare/step-3.js');
Step31 = require('./form/compare/step-3-1.js');

graphs.init(function init() {
  graphs.forceInit();
});

/**
 * Status of form steps
 * If step isn't completed - dependency fields will be .disabled
 *
 * @typedef FormState
 * @type {{firstStep: boolean, secondStep: boolean, thirdStep: boolean}}
 */
FormState = {
  firstStep: {
    completed: true,
    data: {},
    complete: function complete() {
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
    incomplete: function incomplete() {
      this.completed = false;

      step2.lock();
      step3.lock();
      step31.lock();
    }
  },
  secondStep: {
    completed: false,
    data: {},
    complete: function complete() {
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
    incomplete: function incomplete() {
      this.completed = false;

      step31.lock();
      step3.lock();
    }
  },
  thirdStep: {
    completed: false,
    data: {},
    complete: function complete() {
      this.completed = false;
    },
    incomplete: function incomplete() {
      this.completed = true;
    }
  },
  thirdOneStep: {
    completed: false,
    data: {},
    complete: function complete() {
      this.completed = false;
    },
    incomplete: function incomplete() {
      this.completed = true;
    }
  }
};

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
$('#fin-stmt-year').change(function change() {
  var $this = $(this);
  $this.closest('form').submit();
  window.localStorage.setItem('tab', 'Financial_Statements');
});

tab = window.localStorage.getItem('tab');
if (tab) {
  window.localStorage.removeItem('tab');
  $('.nav-pills a[href="' + tab + '"]').tab('show');
}

/*
 Subscribe to government
 */
$subscribeBtn = $('#subscribe');

if ($subscribeBtn.hasClass('subscribe')) {
  $('#chat_message_container').hide();
} else {
  $('#chat_message_container').show();
}

$subscribeBtn.click(function click(event) {
  event.preventDefault();
  event.stopPropagation();

  $.ajax({
    url: $subscribeBtn.attr('href')
  }).done(function load() {
    if ($subscribeBtn.hasClass('subscribe')) {
      $('#chat_message_container').show();
      $subscribeBtn
                .text('Unsubscribe')
                .removeClass('subscribe')
                .removeClass('btn-success')
                .addClass('unsubscribe')
                .addClass('btn-danger');
    } else {
      $('#chat_message_container').hide();
      $subscribeBtn
                .text('Subscribe')
                .removeClass('unsubscribe')
                .removeClass('btn-danger')
                .addClass('subscribe')
                .addClass('btn-success');
    }
  });
});

/*
 Reload data for government by given year.
 */
$('#year-selector').change(function change() {
  var selectedYear = $(this).find(':selected').val();
  var openedTab = $('.tab-titles').find('li.active').find('a').attr('href');

  window.location.search = '?year=' + selectedYear;
  window.localStorage.setItem('tab', openedTab);
});

// Table pagination handler.

$(document).on('click', '.paginate .pagination a', function click(e) {
  var $loader;
  var $mainContent;
  var url;
  var $closestPane;
  var $this;

  e.preventDefault();
  e.stopPropagation();

  $this = $(this);
  $closestPane = $this.closest('.tab-pane');
  url = $this.attr('href');

  $mainContent = $closestPane.find('.tab-pane-main');
  $mainContent.html('');

  $loader = $closestPane.find('.loader');
  $loader.show();
  $.ajax(url).success(function load(data) {
    $loader.hide();
    $closestPane.find('.row').html(data);
  });
});

$(document).on('click', '.paginate .sortable a', function click(e) {
  var $loader;
  var $mainContent;
  var url;
  var $closestPane;
  var $this;

  e.preventDefault();
  e.stopPropagation();

  $this = $(this);
  $closestPane = $this.closest('.tab-pane');
  url = $this.attr('href');

  $mainContent = $closestPane.find('.tab-pane-main');
  $mainContent.html('').height();

  $loader = $closestPane.find('.loader');
  $loader.show();
  $.ajax(url).success(function load(data) {
    $loader.hide();
    $mainContent.html(data);
  });
});

$('.prev_tab').on('click', function previousTabClick() {
  var $mobileTab = $(this).closest('.tab');
  var $prevMobileTab;

  if ($mobileTab) {
    $mobileTab.toggleClass('active');
    $prevMobileTab = prevTab();
    gotoTab($prevMobileTab);
  }

  function prevTab() {
    $prevMobileTab = $mobileTab.prev();

    if ($prevMobileTab.length === 0) {
        $prevMobileTab = $mobileTab.parent().children();
        $prevMobileTab = $prevMobileTab.eq($prevMobileTab.length-1);
    }
    $prevMobileTab.toggleClass('active');
    return $prevMobileTab;
  }
});

$('.next_tab').on('click', function nextTabClick() {
  var $mobileTab = $(this).closest('.tab');
  var $nextMobileTab;

  if ($mobileTab) {
    $mobileTab.toggleClass('active');
    $nextMobileTab = nextTab();
    gotoTab($nextMobileTab);
  }

  function nextTab() {
    $nextMobileTab = $mobileTab.next();

    if ($nextMobileTab.length === 0) {
        $nextMobileTab = $mobileTab.parent().children().eq(0);
    }
    $nextMobileTab.toggleClass('active');
    return $nextMobileTab;
  }
});

function gotoTab($mobileTab) {
  $mobileTab.find('a')[0].click();
  window.scrollBy(0, -45);
}

// Sticky header.
$(window).scroll(function windowScroll() {
  if (window.pageYOffset > 147) {
    $mobileNav.addClass("nav_fixed");
  } else {
    $mobileNav.removeClass("nav_fixed");
  }
});

// Init tooltip.
$('[data-toggle=tooltip]').tooltip({
  trigger: 'click'
});

// Change table value row.
$('.fin-stmt-select').change(function finStmtCaptionChange() {
  var $this = $(this);
  var $table = $this.closest('table');
  var value = $this.find(':selected').val();

  $table.find('td:nth-child(2)').hide();
  $table.find('td:nth-child(3)').hide();
  $table.find('td:nth-child(4)').hide();
  $table.find('td:nth-child('+ value +')').show();
});

// Add new document.
$(document).on('click', '#new-issue', function newDocument() {
  if (! authorized) {
    $('#modal-window').modal('show'); // Open login modal window
    window.sessionStorage.setItem('open', 'issue');
  } else {
    modal.modal('show');
  }
});

modal.find('[data-provide="datepicker"]').on('changeDate', function changeDate() {
  return $(this).datepicker('hide');
});

// Clear document from when modal hide.
modal.on('hidden.bs.modal', function clean() {
  (modal.find('form')[0]).reset();
});

// Document form submit.
modal.find('form').submit(function  newIssue(event) {
  var data = new FormData(this);

  event.preventDefault();

  $.ajax({
    url: this.getAttribute('action'),
    processData: false,
    contentType: false,
    method: 'post',
    data: data
  })
    .done(function success(response) {
      var template;

      if (government.currentYear === Number(response.date.replace(/^(\d+)-.*/, '$1'))) {
        template = Handlebars.compile($('#issue-row').html());
        $('#issues tbody tr:last-child').after(template(response));
      }

      modal.modal('hide');
    })
    .fail(function fail(jqXHR) {
      alert(JSON.parse(jqXHR.responseText));
    })
});

/**
 * Open proper tab and modal window.
 *
 * @return void
 */
function openProperTab() {
  var open = window.sessionStorage.getItem('open');

  if (open) {
    $('.tab_issues').click();
    modal.modal('show');
    window.sessionStorage.removeItem('open');
  }
}

openProperTab();

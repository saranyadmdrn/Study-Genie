$(window).scroll(function() {
    if ($(this).scrollTop() == 0) {
        $('.header').removeClass('header-scrolled');
    } else {
        $('.header').addClass('header-scrolled');
    }
});

$(document).ready(function() {
    $('#menu-toggle').click(function(e) {
        e.preventDefault();
        $('.notes-container').toggleClass('notes-toggled');
        $('.sidebar-container').toggleClass('sidebar-toggled');
        $('.swipe-listener').toggleClass('swipe-toggled');
    });
});

function setRippleEffects() {

    var parent, elem, d, x, y;

    $('.ripple').click(function(e) {

        parent = $(this).parent();

        if (parent.find('.ripple-effect').length == 0)
            parent.prepend('<span class="ripple-effect"></span>');

        elem = parent.find('.ripple-effect');
        elem.removeClass('animate');

        if (!elem.height() && !elem.width()) {
            d = Math.max(parent.outerWidth(), parent.outerHeight());
            elem.css({ height: d, width: d });
        }

        x = e.pageX - parent.offset().left - elem.width() / 2;
        y = e.pageY - parent.offset().top - elem.height() / 2;

        elem.css({ top: y + 'px', left: x + 'px' }).addClass('animate');
    });

    $('.ripple-light').click(function(e) {

        parent = $(this).parent();

        if (parent.find('.ripple-effect-light').length == 0)
            parent.prepend('<span class="ripple-effect-light"></span>');

        elem = parent.find('.ripple-effect-light');
        elem.removeClass('animate');

        if (!elem.height() && !elem.width()) {
            d = Math.max(parent.outerWidth(), parent.outerHeight());
            elem.css({ height: d, width: d });
        }

        x = e.pageX - parent.offset().left - elem.width() / 2;
        y = e.pageY - parent.offset().top - elem.height() / 2;

        elem.css({ top: y + 'px', left: x + 'px' }).addClass('animate');
    });
}

$(document).ready(function() {
    setRippleEffects();
});

function getCurrentDate() {

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = new Date();

    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function textareaAutoResizer() {

    var ta = document.querySelectorAll('textarea.input-title');
    autosize(ta);
}

function setBackButtonToModalClose() {
    $('.modal').on('shown.bs.modal', function() {
        history.pushState(null, null, window.location.hash); // push state the current hash
    });

    $(window).on('popstate', function() {
        $('.modal').modal('hide');
    });
}

var pckry = [];
var pckryIdx = -1;
var pckryMaxInstances = 50;

function setLayout(iterations) {

    iterations = (typeof iterations !== 'undefined') ? iterations : 1;

    $(document).ready(function() {
        setPackeryLayout();

        var ms = 500;

        for (var i = 1; i < iterations; i++) {
            setTimeout(setPackeryLayout, ms);
            ms = ms + 500;
        }
    });
}

function setPackeryLayout() {

    if (pckryIdx + 1 >= pckryMaxInstances) {
        for (var i = 0; i <= pckryIdx; i++) {
            if (pckry[i] !== null && typeof pckry[i] === 'object') {
                pckry[i].destroy(); // destroy the Packery instance
                pckry[i] = null; // reset the array element
            }
        }
        pckryIdx = -1;
    }

    pckryIdx++;
    pckry[pckryIdx] = new Packery('.notes-container', {
        itemSelector: '.note',
        gutter: 12
    });
}

function reverseCompareTimestamps(note1, note2) {
    if (note1.timestamp > note2.timestamp)
        return -1;
    if (note1.timestamp < note2.timestamp)
        return 1;
    return 0;
}

function initLayout() {
    document.onreadystatechange = function() {
        if (document.readyState === 'complete') {
            setLayout(1);
        }
    }
}

var optTooltipOptions = {
    theme: ['tooltipster-borderless', 'tooltipster-borderless-customized'],
    animation: 'grow',
    animationDuration: [400, 0],
    delay: 0,
    side: 'bottom',
    distance: 12,
    arrow: false
};

$(document).ready(function() {

    $('.opt-tooltip').tooltipster(optTooltipOptions);

    $('body').on('mouseenter', '.opt-tooltip:not(.tooltipstered)', function() {
        $(this)
            .tooltipster(optTooltipOptions)
            .tooltipster('open');
    });
});


function setEndOfContenteditable(editbox) {
    $(editbox).attr('id', 'edit-box');
    contentEditableElement = document.getElementById('edit-box');

    var range, selection;
    if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(contentEditableElement);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (document.selection) {
        range = document.body.createTextRange();
        range.moveToElementText(contentEditableElement);
        range.collapse(false);
        range.select();
    }
}

// JavaScript source code

/// <reference path="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js" />

/**********************************
/Only allow Mondays to be selected
***********************************/

$(".week").datepicker("option", {
    beforeShowDay: function (date) {
        console.debug(data);
        return [date.getDay() == 1, ''];
    }
});

// prevent changing weeks and months
var weekOptions = {
    "changeMonth": false, "changeYear": false, "stepMonths": 0,
    beforeShowDay: function (date) { return [date.getDay() == 1, ""] }
};
$(function () {
    $(".week").datepicker("option", weekOptions);
});


$(function()
{
    //<scripts src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js" />
    var startDate;
    var endDate;

    var selectCurrentWeek = function() {
        window.setTimeout(function () {
            $('.week-picker').find('.ui-datepicker-current-day a').addClass('ui-state-active');
        }, 1);
    }

    $('.week-picker').datepicker( {
        showOtherMonths: true,
        selectOtherMonths: true,
        onSelect: function(dateText, inst) { 
            var date = $(this).datepicker('getDate');
            startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
            endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6);
            var dateFormat = inst.settings.dateFormat || $.datepicker._defaults.dateFormat;
            $('#startDate').text($.datepicker.formatDate( dateFormat, startDate, inst.settings ));
            $('#endDate').text($.datepicker.formatDate( dateFormat, endDate, inst.settings ));

            selectCurrentWeek();
        },
        beforeShowDay: function(date) {
            var cssClass = '';
            if(date >= startDate && date <= endDate)
                cssClass = 'ui-datepicker-current-day';
            return [true, cssClass];
        },
        onChangeMonthYear: function(year, month, inst) {
            selectCurrentWeek();
        }
    });

    $('.week-picker .ui-datepicker-calendar tr').live('mousemove', function() { $(this).find('td a').addClass('ui-state-hover'); });
    $('.week-picker .ui-datepicker-calendar tr').live('mouseleave', function() { $(this).find('td a').removeClass('ui-state-hover'); });
});

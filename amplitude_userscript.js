// ==UserScript==
// @name         Amplitude enhanced funnels
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      https://amplitude.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("Loaded Amplitude enhancing scripts");

    // FUNNEL view: Adds indicators of % completion for each step, and ± error
    var showFunnelIndicators = setInterval(function () {
        if ($(".highcharts-container:not(.js-tagged)").length === 0) { return; }

        console.log("Amplitude enhancer: Processing funnel chart...");

        // Get the original group size (eg: 10,000 users on the first step of the funnel
        var cohort_size = $("g.highcharts-data-labels").map(function () { return +$(this).find('text:first').text().replace(',', ''); });
        var initial_bar_height = +$(".highcharts-series-1 rect:first").attr('height');

        $(".js-extra").remove();

        // For each series, parse data points from data labels and add additional data
        $(".highcharts-container:not(.js-tagged) g.highcharts-data-labels").each(function (series) {
            $(this).addClass('js-tagged').find('text').each(function (i) {
                if (i === 0) { return; }

                var $text = $(this);
                var $rect = $('.highcharts-series-' + (series*2+1) + ' rect:not(.js-extra)').eq(i);

                var success = +$text.text().replace(',', '');
                var ratio = success / cohort_size[series];
                var error = Math.pow(ratio * (1 - ratio) / cohort_size[series], 0.5);

                // Add legends for % conversion and significance
                $text.after($text.clone().addClass('js-extra').attr({y:  36}).text(Math.round(ratio*1000)/10 + "%"));
                $text.after($text.clone().addClass('js-extra').attr({y: -12}).text('±' + Math.round(error*1000)/10 + '%'));

                // Add error bad
                var error_height = error * initial_bar_height;
                $rect.after($rect.clone().addClass('js-extra').attr({ 'stroke-width': 0, fill: '#333333',
                  x: +$rect.attr('x') - 3,
                  y: +$rect.attr('y') - error_height,
                  height: error_height*2,
                  width: 6
                }));
            });
        });

    }, 1000);

})();

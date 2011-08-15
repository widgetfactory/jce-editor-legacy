/**
 * @version		$Id: html5.js 203 2011-06-01 19:02:19Z happy_noodle_boy $
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function($) {
    $input = document.createElement('input');

    /**
     * Test for placeholder, min, max, pattern attribute support
     * From Modernizer 1.7
     * http://www.modernizr.com
     * Copyright (c) 2009-2011
     * http://www.modernizr.com/license/
     */
    $.support.input = (function(at) {
        var o = {}, i;
        for (i = 0, n = at.length; i<n; i++) {
            o[at[i]] = !!(at[i] in $input);
        }
        return o;
    })('placeholder max min pattern'.split(' '));

    $.fn.placeholder = function() {
        // check for placeholder and create
        if (!$.support.input.placeholder) {
            // create javascript placeholder
            return this.each( function() {
                var v = $(this).attr('placeholder'), iv = $(this).val();

                if (iv === '' || iv == v) {
                    $(this).addClass('placeholder').val(v).click( function() {
                        if ($(this).hasClass('placeholder')) {
                            $(this).val('').removeClass('placeholder');
                        }
                    }).blur( function() {
                        iv = $(this).val();
                        if (iv === '' || iv == v) {
                            $(this).addClass('placeholder').val(v);
                        }
                    });
                }
                $(this).change( function() {
                    iv = $(this).val();
                    if (iv === '') {
                        $(this).addClass('placeholder').val(v);
                    } else {
                        $(this).removeClass('placeholder');
                    }
                });

            });

        }

        return this;
    };

    $.fn.min = function() {
        if (!$.support.input.min) {
            return this.change( function() {
                var m = parseFloat($(this).attr('min')), v = parseFloat($(this).val()), pv = $(this).attr('placeholder');

                if (pv != 'undefined' && pv == v) {
                    return this;
                }

                if (v < m) {
                    $(this).val(m);
                }
            });

        }

        return this;
    };

    $.fn.max = function() {
        if (!$.support.input.max) {
            return this.change( function() {
                var m = parseFloat($(this).attr('max')), v = parseFloat($(this).val()), pv = $(this).attr('placeholder');

                if (pv != 'undefined' && pv == v) {
                    return this;
                }

                if (v > m) {
                    $(this).val(m);
                }
            });

        }

        return this;
    };

    $.fn.pattern = function() {
        if (!$.support.input.pattern) {
            this.change( function() {
                var pattern = $(this).attr('pattern'), v = $(this).val(), pv = $(this).attr('placeholder');

                if (pv != 'undefined' && pv == v) {
                    return this;
                }

                if (!new RegExp('^(?:' + pattern + ')$').test(v)) {
                    var n = new RegExp('(' + pattern + ')').exec(v);
                    $(this).val(n[0]);
                }
            });

        }

        return this;
    };

})(jQuery);
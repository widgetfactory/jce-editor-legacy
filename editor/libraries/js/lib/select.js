/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function($) {

    $.widget("ui.combobox", {
        options : {
            label : 'Add Value',
            change: $.noop
        },

        _init : function(options) {
            var self = this;

            $(this.element).removeClass('mceEditableSelect').addClass('editable');
            
            $('<span role="button" class="editable-edit" title="'+ this.options.label +'"></span>').insertAfter(this.element).click(function(e) {
            	if ($(this).hasClass('disabled'))
            		return;

            	self._onChangeEditableSelect(e);
            });
            
            if ($(this.element).is(':disabled')) {
            	$(this.element).next('span.editable-edit').addClass('disabled');
            }
        },

        _onChangeEditableSelect : function(e) {
            var self = this;
            
            this.input = document.createElement('input');

            $(this.input).attr('type', 'text').addClass('editable-input').val($(this.element).val()).insertBefore($(this.element)).width($(this.element).width());
            
            $(this.input).blur( function() {
                self._onBlurEditableSelectInput();
            }).keydown( function(e) {
                self._onKeyDown(e);
            });

            $(this.element).hide();
            
            this.input.focus();
        },

        _onBlurEditableSelectInput : function() {
            var self = this, o, found, v = $(this.input).val();

            if (v != '') {
            	$('option:selected', this.element).prop('selected', false);
                
                // select if value exists
            	if ($('option[value="'+ v +'"]', this.element).is('option')) {
            		$(this.element).val(v).change();
            	} else {
            		// new value
                    if (!found) {
                    	// check pattern
                    	var pattern = $(this.element).data('pattern');
                    	
                    	if (pattern && !new RegExp('^(?:' + pattern + ')$').test(v)) {
                            var n = new RegExp('(' + pattern + ')').exec(v);
                            v = n ? n[0] : '';
                        }
                    	
                    	// add new value if result
                    	if (v != '') {
                            // value exists, select
                            if ($('option[value="'+ v +'"]', this.element).length == 0) {
                                    $(this.element).append(new Option(v, v));
                            }
                            $(this.element).val(v).change();
                    	}
                    }
            	}

                self.options.change.call(self, v);
            } else {
                $(this.element).val('') || $('option:first', this.element).attr('selected', 'selected');
            }

            $(this.element).show();
            $(this.input).remove();
        },

        _onKeyDown : function(e) {
            if (e.which == 13 || e.which == 27) {
                this._onBlurEditableSelectInput();
            }
        },

        destroy : function() {
            $.Widget.prototype.destroy.apply(this, arguments);
        }

    });

    $.extend($.ui.combobox, {
        version : "@@version@@"
    });
})(jQuery);
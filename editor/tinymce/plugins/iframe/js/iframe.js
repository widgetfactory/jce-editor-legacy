/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
var IframeDialog = {

    settings : {},

    init : function() {
        var self = this, ed = tinyMCEPopup.editor, s = ed.selection, n = s.getNode(), v, u, data = {}, mt;

        tinyMCEPopup.resizeToInnerSize();
        tinyMCEPopup.restoreSelection();

        TinyMCE_Utils.fillClassList('classlist');
        
        if (!this.settings.file_browser) {
            $('#src').removeClass('browser');
        }

        $.Plugin.init();

        $('#insert').click( function() {
            self.insert();
        });
		
        if (/mceItemIframe/.test(n.className)) {
            data = $.parseJSON(ed.dom.getAttrib(n, 'data-mce-json'));

            if (data && data.iframe) {
                $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
                
                data = data.iframe;
                
                // test for Aggregator file
                if (mt = WFAggregator.isSupported(data)) {
                    data = WFAggregator.setValues(mt, data);
                }

                // Special attributes
                $.each(data, function(k, v) {
                    if ($('#' + k).is(':checkbox')) {
                        $('#' + k).prop('checked', !!v);
                    } else {
                        if (k == 'src') {
                            v = ed.convertURL(v);
                        }

                        $('#' + k).val(v);
                    }
                });
                // Standard attributes
                $.each(['class', 'width', 'height', 'style', 'id', 'longdesc', 'align'], function(i, k) {
                    v = ed.dom.getAttrib(n, k);

                    switch(k) {
                        case 'class':
                            v = tinymce.trim(v.replace(/\s?mceItemIframe/g, ''));
                            $('#classes, #classlist').val(v);
                            break;
                        case 'width':
                        case 'height':
                            v = self.getAttrib(n, k);							
                            u = /%/.test(v) ? '%' : 'px';
                            v = v.replace(/[^0-9]/g, '');
							
                            $('#' + k).val(v).data('tmp', v);
                            $('#' + k + '_unit').val(u);
                            break;
                        case 'align':
                            $('#' + k).val(self.getAttrib(n, k));
                            break;
                        default:
                            $('#' + k).val(v);
                            break;
                    }
					
                    if ($('#width_unit').val() !== $('#height_unit').val()) {
                        $('#constrain').prop('checked', false);
                    }
                });
                // Margin
                $.each(['top', 'right', 'bottom', 'left'], function(i, k) {
                    v = self.getAttrib(n, 'margin-' + k);
                    $('#margin_' + k).val(v);
                });
            }

        } else {
            $.Plugin.setDefaults(this.settings.defaults);
        }
        
        // setup Aggregators
        WFAggregator.setup({
            embed : false
        });
        
        $('#src').change(function() {
            var data = {}, v = this.value;
            // check Aggregators
            if (s = WFAggregator.isSupported(v)) {
                data = WFAggregator.getAttributes(s, v);
                
                $('#options_tab fieldset').hide().filter('.' + s).show();
            }

            // set attributes
            for (n in data) {
                if (n == 'width' || n == 'height') {
                    $('#' + n).val(data[n]).data('tmp', data[n]).change();
                } else {
                    var $el = $('#' + n), v = data[n];

                    if ($el.is(':checkbox')) {
                        $el.attr('checked', !!parseFloat(v));
                    } else {
                        $el.val(v);
                    }
                }
            } 
        }).change();

        // Setup margins
        this.setMargins(true);
        // Setup Styles
        this.updateStyles();
    },
    /**
	 * Retrieve a media object attribute with additional processing / cleanup
	 */
    getAttrib : function(e, at) {
        var ed = tinyMCEPopup.editor, v, v2;

        switch (at) {
            case 'width':
            case 'height':
                return ed.dom.getAttrib(e, at) || ed.dom.getStyle(n, at) || '';
                break;
            case 'align':
                if(v = ed.dom.getAttrib(e, 'align')) {
                    return v;
                }
                if(v = ed.dom.getStyle(e, 'float')) {
                    return v;
                }
                if(v = ed.dom.getStyle(e, 'vertical-align')) {
                    return v;
                }
                break;
            case 'margin-top':
            case 'margin-bottom':
                if(v = ed.dom.getStyle(e, at)) {
                    if (v == 'auto') {
                        return v;
                    }
                    return parseInt(v.replace(/[^0-9-]/g, ''));
                }
                if(v = ed.dom.getAttrib(e, 'vspace')) {
                    return parseInt(v.replace(/[^0-9]/g, ''));
                }
                break;
            case 'margin-left':
            case 'margin-right':
                if(v = ed.dom.getStyle(e, at)) {
                    if (v == 'auto') {
                        return v;
                    }
                    return parseInt(v.replace(/[^0-9-]/g, ''));
                }
                if(v = ed.dom.getAttrib(e, 'hspace')) {
                    return parseInt(v.replace(/[^0-9]/g, ''));
                }
                break;
        }
    },
    checkPrefix : function(n) {
        var self = this, v = $(n).val();

        if(/^\s*www./i.test(v)) {
            $.Dialog.confirm(tinyMCEPopup.getLang('iframe_dlg.is_external', 'The URL you entered seems to be an external link, do you want to add the required http:// prefix?'), function(state) {
                if (state) {
                    $(n).val('http://' + v);
                }
                self.insert();
            });
        } else {
            this.insertAndClose();
        }
    },
    insert : function() {
        var ed = tinyMCEPopup.editor;

        AutoValidator.validate(document);

        if ($('#src').val() === '') {
            $.Dialog.alert(tinyMCEPopup.getLang('iframe_dlg.no_src', 'Please enter a url for the iframe'));
            return false;
        }

        if ($('#width').val() === '' || $('#height').val() === '') {
            $.Dialog.alert(tinyMCEPopup.getLang('iframe_dlg.no_dimensions', 'Please enter a width and height for the iframe'));
            return false;
        }

        return this.checkPrefix($('#src'));
    },
    insertAndClose : function() {
        tinyMCEPopup.restoreSelection();
		
        var ed = tinyMCEPopup.editor, args = {}, n = ed.selection.getNode();

        tinymce.each(['classes', 'style', 'id', 'longdesc', 'title'], function(k) {
            var v = $('#' + k).val();

            if (v !== '') {
                if (k == 'classes') {
                    k = 'class';
                }

                args[k] = v;
            }
        });
        tinymce.extend(args, {
            src             : tinyMCEPopup.getWindowArg('plugin_url') + '/img/trans.gif',
            'data-mce-json' : this.serializeParameters(),
            width           : $('#width').val() + $('#width_unit').val(),
            height          : $('#height').val() + $('#height_unit').val()
        });

        if (n && ed.dom.is(n, 'img.mceItemIframe')) {
            ed.dom.setAttribs(n, args);			
            ed.dom.addClass(n, 'mceItemIframe');
        } else {
            ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" src="javascript:;" />', {
                skip_undo : 1
            });

            n = ed.dom.get('__mce_tmp');

            ed.dom.setAttrib('__mce_tmp', 'id', '');

            ed.dom.setAttribs(n, args);
            ed.dom.addClass(n, 'mceItemIframe');

            ed.undoManager.add();
        }

        tinyMCEPopup.close();
    },
    serializeParameters : function() {
        var ed = tinyMCEPopup.editor, s, data = {};

        tinymce.each(['src', 'name', 'scrolling', 'marginwidth', 'marginheight', 'frameborder', 'allowtransparency'], function(k) {
            var v = $('#' + k).val();

            if (v !== '') {
                if (k == 'src') {
                    v = v.replace(/&amp;/gi, '&');
                    v = ed.convertURL(v);
                }

                data[k] = v;
            }
        });
        
        if (s = WFAggregator.isSupported(data.src)) {
            $.extend(true, data, WFAggregator.getValues(s, data.src));
        }

        var o = {
            'iframe' : data
        };

        return $.JSON.serialize(o);
    },
    setMargins : function(init) {
        var x = 0, s = false;

        var v 		= $('#margin_top').val();
        var $elms 	= $('#margin_right, #margin_bottom, #margin_left');

        if (init) {
            $elms.each( function() {
                if ($(this).val() === v) {
                    x++;
                }
            });
			
            s = (x == $elms.length);
			
            $elms.prop('disabled', s).prev('label').toggleClass('disabled', s);

            $('#margin_check').prop('checked', s);
        } else {
            s = $('#margin_check').is(':checked');

            $elms.each( function() {
                if (s) {
                    if (v === '') {
                        $('#margin_right, #margin_bottom, #margin_left').each( function() {
                            if (v === '' && $(this).val() !== '') {
                                v = $(this).val();
                            }
                        });
                    }

                    $(this).val(v);
                }
                $(this).prop('disabled', s).prev('label').toggleClass('disabled', s);
            });
            // set margin top
            $('#margin_top').val(v);

            this.updateStyles();
        }
    },
    setClasses : function(v) {
        return $.Plugin.setClasses(v);
    },
    setDimensions : function(a, b) {
        var tmp, $a = $('#' + a), av = $a.val(), $b = $('#' + b), bv = $b.val(), au = $('#' + a + '_unit').val(), bu = $('#' + b + '_unit').val();

        if ($('#constrain').is(':checked')) {
            // only calculate if we have all required values
            if (av && bv && $a.data('tmp') && $b.data('tmp')) {
                // If type values are % and are equal, value is original.
                if (au == '%' && bu == '%') {
                    tmp = av;
                } else if (au == '%') {
                    tmp = Math.round(bv * av / 100);
                } else {
                    tmp = (bv / $a.data('tmp') * av).toFixed(0);
                }

                $b.val(tmp).data('tmp', tmp);
            }
        }

        // store new tmp value
        $a.data('tmp', av);
    },
    setDimensionUnit : function(a, b) {
        var $a = $('#' + a), av = $a.val(), $b = $('#' + b), bv = $b.val(), au = $('#' + a + '_unit').val(), bu = $('#' + b + '_unit').val();

        if ($('#constrain').is(':checked')) {
            // only calculate if we have all required values
            if (av && bv && $a.data('tmp') && $b.data('tmp')) {
                $('#' + b + '_unit').val(au);

                if (au == 'px') {
                    $a.val(Math.round(av * $a.data('tmp') / 100));
                    $b.val(Math.round(bv * $b.data('tmp') / 100));
                } else {
                    $a.val(Math.round(av / $a.data('tmp') * 100));
                    $b.val(Math.round(bv / $b.data('tmp') * 100));
                }
            }
        }
    },
    setStyles : function() {
        var self = this, ed = tinyMCEPopup, img = $('#sample');

        $(img).attr('style', $('#style').val());

        // Margin
        tinymce.each(['top', 'right', 'bottom', 'left'], function(o) {
            var v = parseFloat($(img).css('margin-' + o));
            $('#margin_' + o).val(v);
        });
        // Align
        $('#align', $(img).attr('align') || $(img).css('float') || $(img).css('vertical-align'));
    },
    updateStyles : function() {
        var ed = tinyMCEPopup, st, v, br, img = $('#sample');

        $(img).attr('style', $('#style').val());
        $(img).attr('dir', $('#dir').val());

        // Handle align
        $(img).css('float', '');
        $(img).css('vertical-align', '');

        v = $('#align').val();

        if (v == 'left' || v == 'right') {
            $(img).css('float', v);
        } else {
            $(img).css('vertical-align', v);
        }

        // Handle border
        $.each(['width', 'color', 'style'], function() {
            if ($('#border').is(':checked')) {
                v = $('#border_' + this).val();
            } else {
                v = '';
            }
            // add pixel to width
            if (this == 'width' && /[^a-z]/i.test(v)) {
                v += 'px';
            }

            $(img).css('border-' + this, v);
        });
        // Margin
        $.each(['top', 'right', 'bottom', 'left'], function() {
            v = $('#margin_' + this).val();
            $(img).css('margin-' + this,  /[^a-z]/i.test(v) ? v + 'px' : v);
        });
        // Merge
        $('#style').val(ed.dom.serializeStyle(ed.dom.parseStyle($(img).attr('style'))));
    }
};
tinyMCEPopup.requireLangPack();

tinyMCEPopup.onInit.add(IframeDialog.init, IframeDialog);
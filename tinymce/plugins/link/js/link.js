/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
var LinkDialog = {
    settings : {},

    init : function() {
        tinyMCEPopup.restoreSelection();
    	
        var self = this, ed = tinyMCEPopup.editor, se = ed.selection, n, el;

        $('button#insert').click(function(e) {
            self.insert();
            e.preventDefault();
        });
    	
        $('button#help').click(function(e) {
            self.openHelp();
            e.preventDefault();
        });

        tinyMCEPopup.resizeToInnerSize();       

        if (!this.settings.file_browser) {
            $('#href').removeClass('browser');
        }

        self.createEmail($('button.email'));

        $('.btn.anchor').click(function(e) {
            e.preventDefault();
            
            $(this).next('div.dropdown').toggle();
            
        }).next('div.dropdown').html(this.getAnchorListHTML('anchor','href'));

        // Create Browser Tree
        WFLinkBrowser.init({
            onClick : function(v) {
                self.insertLink(v);
            }
        });
        
        WFLinkSearch.init({
            onClick : function(v) {
                self.insertLink(v);
            }
        });
        
        // setup popups
        WFPopups.setup();
        
        var bh = $('#link-browser').innerHeight(), wh = $(window).height(), ww = $(window).width(), iw = $('#search-input').width(); 
        
        // resize browser on window resize
        $(window).bind('resize', function() {
            $('#link-browser').height(bh + $(this).height() - wh);
            
            $('#search-input').width(iw + $(this).width() - ww);
        });

        // if there is a selection
        if (!se.isCollapsed()) {
            n = se.getNode();

            var state = false, v;

            function setText(state, v) {
                if (state && v) {
                    $('#text').val(v);
                    $('#text').attr('disabled', false);
                } else {
                    $('#text').val(tinyMCEPopup.getLang('dlg.selection', 'Element Selection'));
                    $('#text').attr('disabled', true);
                    $('#text').addClass('disabled');
                }
            }

            if (n) {
                n = ed.dom.getParent(n, 'A') || n;
                
                if (n.nodeName == 'A') {
                    var c = n.childNodes;
                    if (c.length == 1 && c[0].nodeType == 3) {
                        state = true;
                        v = se.getContent({
                            format: 'text'
                        });
                    }
                } else {
                    if (ed.dom.isBlock(n) || n.nodeName === 'BODY') {                                                                       
                        v = se.getContent();
                        
                        state = /<([^>]+)>/.test(v) === false;
                    }
                }
            } else {
                state = true;
                v = se.getContent({
                    format: 'text'
                });
            }

            // set text value and state
            setText(state, v);
        }
        
        $.Plugin.init();

        TinyMCE_Utils.fillClassList('classlist');
        
        // Enable / disable attributes
        $.each(this.settings.attributes, function(k, v) {
            if (parseInt(v) === 0) {
                $('#attributes-' + k).hide();
            }
        });

        if (n && n.nodeName == 'A') {
            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
            
            var href = decodeURIComponent(ed.convertURL(ed.dom.getAttrib(n, 'href')));

            // Setup form data
            $('#href').val(href);
            // attributes
            $.each(['title', 'id', 'style', 'dir', 'lang', 'tabindex', 'accesskey', 'class', 'charset', 'hreflang', 'target'], function(i, k) {
                $('#' + k).val(ed.dom.getAttrib(n, k));
            });

            $('#dir').val(ed.dom.getAttrib(n, 'dir'));
            $('#rev').val(ed.dom.getAttrib(n, 'rev'), true);

            if (href.charAt(0) == '#') {
                $('#anchor').val(href);
            }

            $('#classes').val(ed.dom.getAttrib(n, 'class'));
            $('#target').val(ed.dom.getAttrib(n, 'target'));

            // check for popups
            var data = WFPopups.getPopup(n) || {};
            
            // process rel after popups as it is used by MediaBox
            $('#rel').val( function() {
                var v = data.rel;
                
                if ($.type(v) !== "string") {
                    v = ed.dom.getAttrib(n, 'rel');
                }    

                v = ed.dom.encode(v);

                if ($('option[value="'+ v +'"]', this).length == 0) {
                    $(this).append(new Option(v, v));
                    $(this).val(v);
                }
                
                return v;
            });
            
        } else {
            $.Plugin.setDefaults(this.settings.defaults);
        }
        
        // hide HTML4 only attributes
        if (ed.settings.schema == 'html5' && ed.settings.validate) {
            $('#rev').parent().parent().hide();
        }

        window.focus();
    },

    getAnchorListHTML : function(id, target) {
        var ed = tinyMCEPopup.editor, name;
        var nodes = ed.dom.select('.mceItemAnchor');

        var html = "", classname = "";

        html += '<ul class="dropdown-menu" role="menu">';
        html += '<li data-value="">---</li>';

        tinymce.each(nodes, function(n) {
            if (n.nodeName == 'SPAN') {
                name = ed.dom.getAttrib(n, 'data-mce-name') || ed.dom.getAttrib(n, 'id');
            } else {                
                if (!n.href) {
                    name = ed.dom.getAttrib(n, 'name') || ed.dom.getAttrib(n, 'id');
                }
            }
                
            if (name) {
                html += '<li data-value="#' + name + '" class="' + classname + '">' + name + '</li>';
            }
        });
        
        html += '</ul>';

        return html;
    },

    checkPrefix : function(n) {
        var v = $(n).val();
        if (Validator.isEmail(v) && !/^\s*mailto:/i.test(v)) {
            $.Dialog.confirm(tinyMCEPopup.getLang('link_dlg.is_email', 'The URL you entered seems to be an email address, do you want to add the required mailto: prefix?'), function(state) {
                if (state) {
                    $(n).val('mailto:' + v);
                }
                LinkDialog.insert();
            });

        } else if(/^\s*www./i.test(v)) {
            $.Dialog.confirm(tinyMCEPopup.getLang('link_dlg.is_external', 'The URL you entered seems to be an external link, do you want to add the required http:// prefix?'), function(state) {
                if (state) {
                    $(n).val('http://' + v);
                }
                LinkDialog.insert();
            });

        } else {
            this.insertAndClose();
        }
    },

    insert : function() {
        var ed = tinyMCEPopup.editor, se = ed.selection;
        AutoValidator.validate(document);

        if ($('#href').val() == '') {
            $.Dialog.alert(ed.getLang('link_dlg.no_href', 'A URL is required. Please select a link or enter a URL'));

            $('#href').focus();

            return false;
        }

        if (se.isCollapsed() && $('#text').val() == '') {
            $.Dialog.alert(ed.getLang('link_dlg.no_text', 'Please enter some text for the link'));

            $('#text').focus();

            return false;
        }

        return this.checkPrefix($('#href'));
    },

    insertAndClose : function() {
        tinyMCEPopup.restoreSelection();
    	
        var ed = tinyMCEPopup.editor, se = ed.selection, n = se.getNode(), args = {}, el;
    	
        var attribs = ['href', 'title', 'target', 'id', 'style', 'class', 'rel', 'rev', 'charset', 'hreflang', 'dir', 'lang', 'tabindex', 'accesskey', 'type'];
    	
        tinymce.each(attribs, function(k) {
            var v = $('#' + k).val();
    		
            if (k == 'href') {
                // prepare URL
                v = $.String.buildURI(v);
            }
    		
            if (k == 'class') {
                v = $('#classlist').val() || $('#classes').val() || '';
            }
    		
            args[k] = v;
        });

        // no selection
        if (se.isCollapsed()) {
            ed.execCommand('mceInsertContent', false, '<a href="#" id="mce_link_tmp">' + $('#text').val() + '</a>', {
                skip_undo : 1
            });
            
            ed.dom.setAttribs(ed.dom.get('mce_link_tmp'), args);
            
        // create link on selection or update existing link
        } else {                                    
            // insert link
            ed.execCommand('mceInsertLink', false, args);
        	
            // if text selection, update
            if (!$('#text').is(':disabled')) {
                // get the current node
                el = ed.selection.getNode();

                // get link from selection
                if (el && el.nodeName != 'A') {
                    el = ed.dom.getParent(n, 'a');
                }
                
                if (el) {
                    ed.dom.setHTML(el, $('#text').val());
                }
                
                // reset cursor
                ed.selection.select(el);
                ed.selection.collapse(0);
            }
            
            // restore styles
            ed.dom.setAttrib(n, 'style', ed.dom.getAttrib(n, 'data-mce-style'));
        }

        // Create or remove popup
        WFPopups.createPopup(el);

        tinyMCEPopup.close();
    },

    setClasses : function(v) {
        $.Plugin.setClasses(v);
    },

    setTargetList : function(v) {
        $('#target').val(v);
    },

    setClassList : function(v) {
        $('#classlist').val(v);
    },

    insertLink : function(v) {
        $('#href').val(tinyMCEPopup.editor.documentBaseURI.toRelative(v));
    },

    createEmail : function(n) {
        var ed = tinyMCEPopup.editor;
        
        $(n).click(function(e) {
            e.preventDefault();
            
            $(this).next('div.dropdown').toggle();
        });
        
        $(n).next('div.dropdown button.ok').click(function(e) {
            e.preventDefault();
            
            var args = [], errors = 0;
            $.each(['mailto', 'cc', 'bcc', 'subject'], function(i, s) {
                var v = $('#email_' + s).val();
                if (v) {
                    v = v.replace(/\n\r/g, '');

                    $.each(v.split(','), function(i, o) {
                        if (s !== 'subject') {
                            if (!Validator.isEmail(o)) {
                                $.Dialog.alert(s + ed.getLang('link_dlg.invalid_email', ' is not a valid e-mail address!'));
                                errors++;
                            }
                        }
                    });

                    args.push((s == 'mailto') ? v : s + '=' + v);
                }
            });

            if (errors == 0) {
                if (args.length) {
                    $('#href').val('mailto:' + args.join('&').replace(/&/, '?'));
                }
            }
            
            $(this).parent().hide();
        });
        
        $(n).next('div.dropdown button.cancel').click(function(e) {
             e.preventDefault();
            
            $(this).parent().hide();
        });
    },

    openHelp : function() {
        $.Plugin.help('link');
    }

};
tinyMCEPopup.onInit.add(LinkDialog.init, LinkDialog);
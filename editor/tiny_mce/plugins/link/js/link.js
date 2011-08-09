/**
 * @version		$Id: link.js 205 2011-06-02 14:30:24Z happy_noodle_boy $
 * @copyright   @@copyright@@
 * @author		Ryan Demmer
 * @license     @@licence@@
 * JCE Links is free software. This version may have been modified
 * pursuant to the GNU General Public License, and as distributed it
 * includes or is derivative of works licensed under the GNU General
 * Public License or other free or open source software licenses.
 */
var LinkDialog = {
    settings : {},

    preInit : function() {
        tinyMCEPopup.requireLangPack();
    },

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

        $('span.email').click( function() {
            LinkDialog.createEmail();
        });

        $('#anchor_container').html(this.getAnchorListHTML('anchor','href'));

        // Create Browser Tree
        WFLinkBrowser.init({
        	onClick : function(v) {
        		self.insertLink(v);
        	}
        });
        
        // setup popups
        WFPopups.setup();

        // if there is a selection
        if (!se.isCollapsed()) {
            n = se.getNode();

            if (n && n.nodeName != 'A') {
                n = ed.dom.getParent(n, 'A');
            }

            var state = true, v;

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

            v = se.getContent({format : 'text'});

            if (n) {
                var children = n.childNodes;
                state = children.length == 1 && children[0].nodeType == 3;
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
            
            var href = ed.convertURL(ed.dom.getAttrib(n, 'href'));

            // Setup form data
            $('#href').val(href);
            // attributes
			$.each(['title', 'id', 'style', 'dir', 'lang', 'tabindex', 'accesskey', 'class', 'charset', 'hreflang', 'target'], function(i, k) {
				$('#' + k).val(ed.dom.getAttrib(n, k));
			});

            $('#dir').val(ed.dom.getAttrib(n, 'dir'));
            $('#rev').val(ed.dom.getAttrib(n, 'rel'), true);

            $('#rel').val( function() {
                var v = ed.dom.getAttrib(n, 'rel');

                if ($('option[value="'+ v +'"]', this).length == 0) {
                    $(this).append(new Option(v, v));
                    $(this).val(v);
                }
            });

            if (href.charAt(0) == '#') {
                $('#anchor').val(href);
            }

            $('#classes').val(ed.dom.getAttrib(n, 'class'));
            $('#target').val(ed.dom.getAttrib(n, 'target'));

            // check for popups
            WFPopups.getPopup(n);
        } else {
            $.Plugin.setDefaults(this.settings.defaults);
        }

        window.focus();
    },

    getAnchorListHTML : function(id, target) {
        var ed = tinyMCEPopup.editor;
        var n = ed.getBody().getElementsByTagName("a");

        var html = "";

        html += '<select id="' + id + '" class="mceAnchorList" onchange="this.form.' + target + '.value=';
        html += 'this.options[this.selectedIndex].value;">';
        html += '<option value="">---</option>';

        for (var i=0; i<n.length; i++) {
            if ((name = ed.dom.getAttrib(n[i], "name")) != "")
                html += '<option value="#' + name + '">' + name + '</option>';
        }

        html += '</select>';

        return html;
    },

    checkPrefix : function(n) {
        var v = $(n).val();
        if (Validator.isEmail(v) && !/^\s*mailto:/i.test(v)) {
            $.Dialog.confirm(tinyMCEPopup.getLang('advlink_dlg.is_email', 'The URL you entered seems to be an email address, do you want to add the required mailto: prefix?'), function(state) {
                if (state) {
                    $(n).val('mailto:' + v);
                }
                LinkDialog.insert();
            });

        } else if(/^\s*www./i.test(v)) {
            $.Dialog.confirm(tinyMCEPopup.getLang('advlink_dlg.is_external', 'The URL you entered seems to be an external link, do you want to add the required http:// prefix?'), function(state) {
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
            $.Dialog.alert(tinyMCEPopup.getLang('advlink_dlg.no_href', 'A URL is required. Please select a link or enter a URL'));

            $('#href').focus();

            return false;
        }

        if (se.isCollapsed() && $('#text').val() == '') {
            $.Dialog.alert(tinyMCEPopup.getLang('advlink_dlg.no_text', 'Please enter some text for the link'));

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
    			v = $.String.encodeURI(v, true);
    		}
    		
    		if (k == 'class') {
    			v = $('#classlist').val() || $('#classes').val() || '';
    		}
    		
    		args[k] = v;
    	});
    	
        // no selection
        if (se.isCollapsed()) {
            ed.execCommand('mceInsertContent', false, '<a href="javascript:mctmp(0);">' + $('#text').val() + '</a>', {skip_undo : 1});

            tinymce.each(ed.dom.select('a[href=javascript:mctmp(0);]'), function(link) {
                ed.dom.setAttribs(link, args);

                el = link;
            });

            // create link on selection or update existing link
        } else {
            var flt;
            // store and remove float
            if (n.nodeName == 'IMG' && tinymce.isWebKit) {
            	flt = n.style.cssFloat;
            	n.style.cssFloat = null;
        	}
            
            if (el = ed.dom.getParent(se.getNode(), "A")) {
                if (args.href) {
                    ed.dom.setAttribs(el, args);
                } else {
                    ed.dom.remove(el, true);
                }

            } else {
                ed.execCommand('CreateLink', false, 'javascript:mctmp(0);');

                tinymce.each(ed.dom.select('a[href=javascript:mctmp(0);]'), function(link) {
                    ed.dom.setAttribs(link, args);

                    el = link;
                });

            }
            
            // restore float
        	if (n.nodeName == 'IMG' && tinymce.isWebKit) {
            	n.style.cssFloat = flt;
        	}
        	
        	// if text selection, update
        	if (!$('#text').is(':disabled')) {
        		ed.dom.setHTML(el, $('#text').val());
        	}
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

    createEmail : function() {
        var ed = tinyMCEPopup;

        var fields = '<div class="formElm"><label for="email_to">' + ed.getLang('advlink_dlg.to', 'To') + '</label>' +
        '<textarea id="email_mailto" class="email"></textarea>' +
        '</div>' +
        '<div class="formElm"><label for="email_cc">' + ed.getLang('advlink_dlg.cc', 'CC') + '</label>' +
        '<textarea id="email_cc" class="email"></textarea>' +
        '</div>' +
        '<div class="formElm"><label for="email_bcc">' + ed.getLang('advlink_dlg.bcc', 'BCC') + '</label>' +
        '<textarea id="email_bcc" class="email"></textarea>' +
        '</div>' +
        '<div class="formElm"><label for="email_subject">' + ed.getLang('advlink_dlg.subject', 'Subject') + '</label>' +
        '<textarea id="email_subject" class="email"></textarea>' +
        '</div>';

        $.Dialog.dialog(ed.getLang('advlink_dlg.email', 'Create E-Mail Address'), fields, {
            width	: 300,
            height	: 250,
            buttons : [
            {
                text : ed.getLang('dlg.ok', 'Ok'),
                click: function() {
                    var args = [], errors = 0;
                    $.each(['mailto', 'cc', 'bcc', 'subject'], function(i, s) {
                        var v = document.getElementById('email_' + s).value;
                        if (v) {
                            v = v.replace(/\n\r/g, '');

                            $.each(v.split(','), function(i, o) {
                                if (s !== 'subject') {
                                    if (!Validator.isEmail(o)) {
                                        $.Dialog.alert(s + tinyMCEPopup.getLang('advlink_dlg.invalid_email', ' is not a valid e-mail address!'));
                                        errors++;
                                    }
                                }
                            });

                            args.push((s == 'mailto') ? v : s + '=' + v);
                        }
                    });

                    if (errors == 0) {
                        if (args.length) {
                            document.getElementById('href').value = 'mailto:' + args.join('&').replace(/&/, '?');
                        }
                    }
                    $(this).dialog('close');
                }

            },
            {
                text : ed.getLang('dlg.cancel', 'Cancel'),
                click : function() {
                    $(this).dialog('close');
                }

            }
            ]
        });
    },

    openHelp : function() {
        $.Plugin.help('link');
    }

};
LinkDialog.preInit();
tinyMCEPopup.onInit.add(LinkDialog.init, LinkDialog);
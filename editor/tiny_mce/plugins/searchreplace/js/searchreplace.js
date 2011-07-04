/**
 * $Id: searchreplace.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package     JCE SearchReplace
 * @copyright   Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @copyright   Copyright (C) 2010 Moxiecode Systems AB. All rights reserved.
 * @author    Ryan Demmer
 * @author    Moxiecode
 * @license   http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU Lesser General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU Lesser General Public License or
 * other free or open source software licenses.
 */
tinyMCEPopup.requireLangPack();

var SearchReplaceDialog = {

    settings : {},

    init : function(ed) {
        var self = this, m = tinyMCEPopup.getWindowArg("mode");

        $.Plugin.init();

        $('button#next').button({
            icons : {
                primary : 'ui-icon-arrowthick-1-e'
            }
        }).click(function() {
        	self.searchNext('none');
        });

        $('button#replaceBtn').button({
            icons : {
                primary : 'ui-icon-transferthick-e-w'
            }
        }).click(function() {
        	self.searchNext('current');
        });

        $('button#replaceAllBtn').button({
            icons : {
                primary : 'ui-icon-transferthick-e-w'
            }
        }).click(function() {
        	self.searchNext('all');
        });

        this.switchMode(m);

        $('#' + m + '_panel_searchstring').val(tinyMCEPopup.getWindowArg("search_string"));

        // Focus input field
        $('#' + '_panel_searchstring').focus();
    },

    switchMode : function(m) {
        var lm = this.lastMode;

        if (lm != m) {
            if (lm) {
                $('#' + '_panel_searchstring').val($('#' + lm + '_panel_searchstring').val());
                $('#' + '_panel_backwardsu').attr('checked',  $('#' + lm + '_panel_backwardsu').is(':checked'));

                $('#' + '_panel_backwardsd').attr('checked',  $('#' + lm + '_panel_backwardsd').is(':checked'));
                $('#' + '_panel_casesensitivebox').attr('checked',  $('#' + lm + '_panel_casesensitivebox').is(':checked'));
            }

            $('#tabs').tabs('select', m + '_tab');

            $("#replaceBtn").css('display', (m == "replace") ? "inline" : "none");
            $("#replaceAllBtn").css('display', (m == "replace") ? "inline" : "none");
            this.lastMode = m;
        }
    },

    searchNext : function(a) {
        var ed = tinyMCEPopup.editor, se = ed.selection, r = se.getRng(), m = this.lastMode, s, b, fl = 0, w = ed.getWin(), wm = ed.windowManager, fo = 0;

        // Get input
        s   = f$('#' + '_panel_searchstring').val();
        b   = $('#' + '_panel_backwardsu').is(':checked');
        ca  = $('#' + '_panel_casesensitivebox').is(':checked');
        rs  = $('#replace_panel_replacestring').val();

        if (s == '')
            return;

        function fix() {
            // Correct Firefox graphics glitches
            r = se.getRng().cloneRange();
            ed.getDoc().execCommand('SelectAll', false, null);
            se.setRng(r);
        };

        function replace() {
            if (tinymce.isIE)
                ed.selection.getRng().duplicate().pasteHTML(rs); // Needs to be duplicated due to selection bug in IE
            else
                ed.getDoc().execCommand('InsertHTML', false, rs);
        };

        // IE flags
        if (ca)
            fl = fl | 4;

        switch (a) {
            case 'all':
                // Move caret to beginning of text
                ed.execCommand('SelectAll');
                ed.selection.collapse(true);

                if (tinymce.isIE) {
                    while (r.findText(s, b ? -1 : 1, fl)) {
                        r.scrollIntoView();
                        r.select();
                        replace();
                        fo = 1;

                        if (b) {
                            r.moveEnd("character", -(rs.length)); // Otherwise will loop forever
                        }
                    }

                    tinyMCEPopup.storeSelection();
                } else {
                    while (w.find(s, ca, b, false, false, false, false)) {
                        replace();
                        fo = 1;
                    }
                }

                if (fo)
                    tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.allreplaced'));
                else
                    tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.notfound'));

                return;

            case 'current':
                if (!ed.selection.isCollapsed())
                    replace();

                break;
        }

        se.collapse(b);
        r = se.getRng();

        // Whats the point
        if (!s)
            return;

        if (tinymce.isIE) {
            if (r.findText(s, b ? -1 : 1, fl)) {
                r.scrollIntoView();
                r.select();
            } else
                tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.notfound'));

            tinyMCEPopup.storeSelection();
        } else {
            if (!w.find(s, ca, b, false, false, false, false))
                tinyMCEPopup.alert(ed.getLang('searchreplace_dlg.notfound'));
            else
                fix();
        }
    }

};
tinyMCEPopup.onInit.add(SearchReplaceDialog.init, SearchReplaceDialog);
/**
* $Id: browser.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
var BrowserDialog = {
	
    settings : {},
	
    init : function(ed) {
        var action = "insert";
		
        $('button#insert').click(function(e) {
            BrowserDialog.insert();
            e.preventDefault();
        });
		
        tinyMCEPopup.resizeToInnerSize();

        var win = tinyMCEPopup.getWindowArg("window");        
        var src = tinyMCEPopup.getWindowArg("url");
		
        if (src) {
            src = tinyMCEPopup.editor.convertURL(src);
            action = "update";
        }
        
        $.Plugin.init();

        $('#insert').button('option', 'label', tinyMCEPopup.getLang('lang_' + action, 'Insert', true));
		
        if (/(:\/\/|www|index.php(.*)\?option)/gi.test(src)) {
            src = '';	
        }
		
        $('<input type="hidden" id="src" value="'+ src +'" />').appendTo(document.body);
	
        // Create File Browser
        WFFileBrowser.init('#src', {        	
            onFileClick : function(e, file) {
                BrowserDialog.selectFile(file);
            },

            onFileInsert : function(e, file) {
                BrowserDialog.selectFile(file);
            },
            
            expandable : false
        });
    },
	
    insert : function() {
        var win = tinyMCEPopup.getWindowArg("window");

        // insert information now
        win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = $('#src').val();

        // close popup window
        tinyMCEPopup.close();
    },
	
    selectFile : function(file) {
        var self 	= this;
        var name 	= file.title;
        var src		= $.String.path(WFFileBrowser.get('getBaseDir'), file.id);

        src	= src.charAt(0) == '/' ? src.substring(1) : src;			
        $('#src').val(src);
    }
};
tinyMCEPopup.onInit.add(BrowserDialog.init, BrowserDialog);
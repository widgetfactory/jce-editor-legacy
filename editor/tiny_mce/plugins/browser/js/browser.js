/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
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

        $.Plugin.init();
	
        if (/(:\/\/|www|index.php(.*)\?option)/gi.test(src)) {
            src = '';	
        }
        
        if (src) {
            src = tinyMCEPopup.editor.convertURL(src);
            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));
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
        
        var src = $('#src').val();
        
        if (src === "") {
            var selected = WFFileBrowser.getSelectedItems();
            
            if (selected.length) {
                this.selectFile(selected[0]);
                
                src = $('#src').val();
            }
        }

        // insert information now
        win.document.getElementById(tinyMCEPopup.getWindowArg("input")).value = src;

        // close popup window
        tinyMCEPopup.close();
    },
	
    selectFile : function(file) {
        var self 	= this;
        var name 	= file.title;

        var src = $(file).data('url');

        src = src.charAt(0) == '/' ? src.substring(1) : src;			
        $('#src').val(src);
    }
};
tinyMCEPopup.onInit.add(BrowserDialog.init, BrowserDialog);
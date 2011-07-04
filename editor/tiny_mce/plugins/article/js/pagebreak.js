/**
* @version		$Id: pagebreak.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
(function() {
	tinyMCEPopup.requireLangPack();
	var PageBreakDialog = {		
		init : function() {
			var self = this, ed = tinyMCEPopup.editor, s = ed.selection, n = s.getNode(), action = 'insert';
	
			tinyMCEPopup.resizeToInnerSize();
			
			// add insert button action
			$('button#insert').click(function(e) {
				self.insert();
				e.preventDefault();
			});
			
			$.Plugin.init();
			
			if(n.nodeName == 'IMG' && ed.dom.hasClass(n, 'mceItemPageBreak')){
				action = 'update';
				
				$('#title').val(ed.dom.getAttrib(n, 'title', ''));
				$('#alt').val(ed.dom.getAttrib(n, 'alt', ''));
			}
			
			$('#insert').button('option', 'label', tinyMCEPopup.getLang(action, 'Insert', true)); 
		},
		insert : function(){		
			var d = document, ed = tinyMCEPopup.editor, s = ed.selection, n = s.getNode();
			
			var v = {
				title 	: $('#title').val(), 
				alt 	: $('#alt').val()
			};
			
			if(n && n.nodeName == 'IMG' && ed.dom.hasClass(n, 'mceItemPageBreak')){
				ed.dom.setAttribs(n, v);	
			}else{
				tinyMCEPopup.execCommand('mcePageBreak', false, v);	
			}
			tinyMCEPopup.close();
		}
	};
	tinyMCEPopup.onInit.add(PageBreakDialog.init, PageBreakDialog);
})();

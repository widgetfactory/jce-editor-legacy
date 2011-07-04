/**
* $Id: editor_plugin.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
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
	tinymce.create('tinymce.plugins.ImageManager', {
		init : function(ed, url) {
			function isMceItem(n) {
				return /mceItem/.test(n.className);
			};
			
			// Register commands
			ed.addCommand('mceImageManager', function() {
				// Internal image object like a flash placeholder
				if (isMceItem(ed.selection.getNode())){
					return;
				}

				ed.windowManager.open({
					file : ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=imgmanager',
					width : 780 + ed.getLang('imgmanager.delta_width', 0),
					height : 640 + ed.getLang('imgmanager.delta_height', 0),
					inline : 1,
					popup_css : false
				}, {
					plugin_url 	: url
				});
			});
			// Register buttons
			ed.addButton('imgmanager', {
				title : 'imgmanager.desc',
				cmd : 'mceImageManager'
			});
			
			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setActive('imgmanager', n.nodeName == 'IMG' && !isMceItem(n));			
			});
			
			ed.onInit.add(function() {				
				if (ed && ed.plugins.contextmenu) {
					ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
						m.add({title : 'imgmanager.desc', icon : 'imgmanager', cmd : 'mceImageManager'});
					});
				}
			});
		},
		getInfo : function() {
			return {
				longname : 'Image Manager',
				author : 'Ryan Demmer',
				authorurl : 'http://www.joomlacontenteditor.net',
				infourl : 'http://www.joomlacontenteditor.net/index2.php?option=com_content&amp;task=findkey&amp;pop=1&amp;lang=en&amp;keyref=imgmanager.about',
				version : '@@version@@'
			};
		}
	});
	// Register plugin
	tinymce.PluginManager.add('imgmanager', tinymce.plugins.ImageManager);
})();
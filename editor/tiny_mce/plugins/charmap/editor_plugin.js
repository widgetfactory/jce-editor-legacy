/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
    tinymce.create('tinymce.plugins.CharacterMap', {
        init : function(ed, url) {
            this.editor = ed;
			
            // Register commands
            ed.addCommand('mceCharacterMap', function(v) {
                ed.windowManager.open({
                    url	: ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=charmap',
                    width   : 550 + parseInt(ed.getLang('advanced.charmap_delta_width', 0)),
                    height  : 250 + parseInt(ed.getLang('advanced.charmap_delta_height', 0)),
                    close_previous : false,
                    inline : true,
                    popup_css : false
                });
            });
            
            // Register buttons
            ed.addButton('charmap', {
                title : 'advanced.charmap_desc',
                cmd : 'mceCharacterMap'
            });
        }
    });
    // Register plugin
    tinymce.PluginManager.add('charmap', tinymce.plugins.CharacterMap);
})();
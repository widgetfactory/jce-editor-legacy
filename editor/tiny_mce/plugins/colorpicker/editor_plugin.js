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
    tinymce.create('tinymce.plugins.ColorPicker', {
        init : function(ed, url) {
            this.editor = ed;
			
            // Register commands
            ed.addCommand('mceColorPicker', function(v) {
                ed.windowManager.open({
                    url     : ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=colorpicker',
                    width   : 375 + parseInt(ed.getLang('advanced.colorpicker_delta_width', 0)),
                    height  : 310 + parseInt(ed.getLang('advanced.colorpicker_delta_height', 0)),
                    close_previous : false,
                    inline : true,
                    popup_css : false
                }, {
                    input_color : v.color,
                    func        : v.func
                });
            });
        }
    });
    // Register plugin
    tinymce.PluginManager.add('colorpicker', tinymce.plugins.ColorPicker);
})();
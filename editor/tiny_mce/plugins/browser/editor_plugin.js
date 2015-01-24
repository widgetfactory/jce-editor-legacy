/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function(){
    tinymce.create('tinymce.plugins.Browser', {
        init: function(ed, url){
            this.ed = ed;
        },
        browse: function(name, url, type, win){
            var ed = this.ed;
            ed.windowManager.open({
                file: ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=browser&type=' + type,
                width   : 780 + ed.getLang('browser.delta_width', 0),
                height  : 480 + ed.getLang('browser.delta_height', 0),
                resizable: "yes",
                inline: "yes",
                close_previous: "no",
                popup_css	: false
            }, {
                window: win,
                input: name,
                url: url,
                type: type
            });
            return false;
        },
        
        getInfo: function(){
            return {
                longname: 'Browser',
                author: 'Ryan Demmer',
                authorurl: 'http://www.joomlacontenteditor.net',
                infourl: 'http://www.joomlacontenteditor.net/index.php?option=com_content&amp;view=article&amp;task=findkey&amp;tmpl=component&amp;lang=en&amp;keyref=browser.about',
                version: '@@version@@'
            };
        }
    });
    
    // Register plugin
    tinymce.PluginManager.add('browser', tinymce.plugins.Browser);
})();
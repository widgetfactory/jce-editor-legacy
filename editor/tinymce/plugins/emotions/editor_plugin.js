/**
 * @package   	JCE Emotions
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function(){
    tinymce.create("tinymce.plugins.EmotionsPlugin",{
        init:function(ed, url){
            ed.addCommand("mceEmotion",function(){
                ed.windowManager.open({
                    file    : ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=emotions',
                    width   : 250 + parseInt(ed.getLang("emotions.delta_width", 0)),
                    height  : 160 + parseInt(ed.getLang("emotions.delta_height", 0)),
                    inline  : 1
                },{
                    plugin_url:url
                })
            });
            
            ed.addButton("emotions",{
                title   :"emotions.emotions_desc",
                cmd     :"mceEmotion"
            })
        }
    });
    tinymce.PluginManager.add("emotions", tinymce.plugins.EmotionsPlugin);
})();
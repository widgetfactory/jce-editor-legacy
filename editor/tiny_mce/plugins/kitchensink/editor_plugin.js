/**
 * editor_plugin_src.js
 *
 * Copyright 2012, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
    var each = tinymce.each, cookie = tinymce.util.Cookie, DOM = tinymce.DOM;
    
    tinymce.create('tinymce.plugins.KitchenSink', {
        init : function(ed, url) {
            
            var state = false;
            
            function toggle(row) {
                var n = DOM.getNext(row, 'table.mceToolbar');
                
                while(n) {
                    if (DOM.isHidden(n)) {
                        DOM.show(n);
                        state = true;
                        
                    } else {
                        DOM.hide(n);
                        state = false;
                    }
                    
                    n = DOM.getNext(n, 'table.mceToolbar');
                }
                
                ed.controlManager.setActive('kitchensink', state);
            }
            
            ed.addCommand('mceKitchenSink', function() {
                var row = DOM.getParents(ed.id + '_kitchensink', 'table.mceToolbar');
                
                if (row) {                    
                    toggle(row[0]);
                }
            });

            ed.addButton('kitchensink', {
                title   : 'kitchensink.desc', 
                cmd     : 'mceKitchenSink'
            });

            ed.onPostRender.add(function(ed, cm) {  
                if (DOM.get('mce_fullscreen')) {
                    state = true;
                    return;
                }

                ed.execCommand('mceKitchenSink', false, {skip_undo : 1});
                // clear undo
                ed.undoManager.clear();
                
                // adjust iframe 
                DOM.setStyle(ed.id + '_ifr', 'height', ed.getContentAreaContainer().offsetHeight);
            });
            
            ed.onInit.add(function(ed) {
                ed.controlManager.setActive('kitchensink', state);
            });
        },

        getInfo : function() {
            return {
                longname : 'Kitchen Sink',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net/',
                infourl : 'http://www.joomlacontenteditor.net/',
                version : '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('kitchensink', tinymce.plugins.KitchenSink);
})();
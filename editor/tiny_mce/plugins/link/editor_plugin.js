(function() {
	var each = tinymce.each, extend = tinymce.extend, JSON = tinymce.util.JSON;
	var Node = tinymce.html.Node;
	
	tinymce.create('tinymce.plugins.LinkPlugin', {
        init : function(ed, url) {
            this.editor = ed;
            this.url = url;
            var self = this;

            function isLink(n) {            	
            	if (n && n.nodeName != 'A') {
                    n = ed.dom.getParent(n, 'A');
                }

                return n && n.nodeName == 'A' && !n.name;
            }
            
            function isAnchor(n) {
            	return n && ((n.nodeName == 'IMG' && /mceItemAnchor/.test(n.className)) || (n.nodeName == 'A' && !n.href && (n.name || n.id)));
            }

            // Register commands
            ed.addCommand('mceLink', function() {
                var se = ed.selection, n = se.getNode();

                if (n.nodeName == 'A' && !n.name) {
                    se.select(n);
                }

                ed.windowManager.open({
                    file 	: ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=link',
                    width 	: 500 + ed.getLang('link.delta_width', 0),
                    height 	: 485 + ed.getLang('link.delta_height', 0),
                    inline 	: 1,
                    popup_css : false
                }, {
                    plugin_url : url
                });
            });
            // Register buttons
            ed.addButton('link', {
                title : 'link.desc',
                cmd : 'mceLink'
            });

            ed.addShortcut('ctrl+k', 'link.desc', 'mceLink');

            ed.onInit.add( function() {
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add( function(th, m, e) {
                        m.addSeparator();
                        m.add({title : 'link.desc', icon : 'link', cmd : 'mceLink', ui : true});
                        if ((e.nodeName == 'A' && !ed.dom.getAttrib(e, 'name'))) {
                            m.add({title : 'advanced.unlink_desc', icon : 'unlink', cmd : 'UnLink'});
                        }
                    });
                }
            });
            
            ed.onNodeChange.add( function(ed, cm, n, co) {            	
                cm.setActive('link', isLink(n));
                
                cm.setDisabled('link', isAnchor(n));
            });
        },

        getInfo : function() {
            return {
                longname : 'Link',
                author : 'Moxiecode Systems AB / Ryan Demmer',
                authorurl : 'http://tinymce.moxiecode.com / http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('link', tinymce.plugins.LinkPlugin);
})();
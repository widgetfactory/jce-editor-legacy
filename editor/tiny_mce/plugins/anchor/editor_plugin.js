(function() {
    var each = tinymce.each, extend = tinymce.extend, JSON = tinymce.util.JSON;
    var Node = tinymce.html.Node;
	
    tinymce.create('tinymce.plugins.AnchorPlugin', {
        init : function(ed, url) {
            this.editor = ed;
            this.url = url;
            var self = this;
            
            function isAnchor(n) {
                return n && ((n.nodeName == 'IMG' && /mceItemAnchor/.test(n.className)) || (n.nodeName == 'A' && !n.href && (n.name || n.id)));
            }

            // Register commands
            ed.addCommand('mceInsertAnchor', function() {
                var se = ed.selection, n = se.getNode();

                ed.windowManager.open({
                    url	: ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=anchor',
                    width : 320 + parseInt(ed.getLang('advanced.anchor_delta_width', 0)),
                    height : 100 + parseInt(ed.getLang('advanced.anchor_delta_height', 0)),
                    inline : true,
                    popup_css : false
                }, {
                    plugin_url : this.url
                });
            });
            // Register buttons
            ed.addButton('anchor', {
                title : 'advanced.anchor_desc',
                cmd : 'mceInsertAnchor'
            });
            
            ed.onNodeChange.add( function(ed, cm, n, co) {            	
                cm.setActive('anchor', isAnchor(n));
            });

            ed.onInit.add(function() {                
                // Display "media" instead of "img" in element path
                if (ed.theme && ed.theme.onResolveName) {
                    ed.theme.onResolveName.add( function(theme, o) {
                        var n = o.node, v;

                        /*if (o.name === 'img' && /mceItemAnchor/.test(n.className)) {
                            var data = JSON.parse(ed.dom.getAttrib(n, 'data-mce-json'));
                            v = data.name || data.id;
                        }*/

                        if (o.name === 'a' && !n.href && (n.name || n.id)) {
                            v = n.name || n.id;
                        }
                        
                        if (v) {
                            o.name = 'a#' + v;
                        }
                    });
                }
                
                if (!ed.settings.compress.css)
                    ed.dom.loadCSS(url + "/css/content.css");
            });
            
            
            // Pre-init			
            /*ed.onPreInit.add(function() {                
                // fix for WebKit anchor selection
                if (tinymce.isWebKit) {	
                    // Convert anchor elements to image placeholder
                    ed.parser.addNodeFilter('a', function(nodes) {
                        for (var i = 0, len = nodes.length; i < len; i++) {
                            var node = nodes[i];
    						
                            if (!node.attr('href') && (node.attr('name') || node.attr('id'))) {
                                self._createAnchorImage(node);
                            }
                        }
                    });

                    // Convert image placeholders to anchor elements
                    ed.serializer.addNodeFilter('img', function(nodes, name, args) {
                        for (var i = 0, len = nodes.length; i < len; i++) {
                            var node = nodes[i];
                            if (/mceItemAnchor/.test(node.attr('class') || '')) {
                                self._restoreAnchor(node, args);
                            }
                        }
                    });
                }
            });*/
        },
        
        /*_restoreAnchor : function(n) {
            var self = this, ed = this.editor, p, v, node, text;

            if (!n.parent)
                return;

            // get data
            p = JSON.parse(n.attr('data-mce-json')) || {};
			
            node = new Node('a', 1);
			
            if (p.html) {
                var value = new Node('#text', 3);
                value.raw = true;
                value.value = p.html;
                node.append(value);
				
                delete p.html;
            }

            each(p, function(v, k) {
                node.attr(k, v);
            });

            n.replace(node);
        },
        
        _getInnerHTML : function(node) {
            return new tinymce.html.Serializer({
                inner	: true,
                validate: false
            }).serialize(node);
        },
        
        _createAnchorImage: function(n) {
            var self = this, ed = this.editor, dom = ed.dom, v, k, p = {};

            if (!n.parent)
                return;
			
            each(n.attributes, function(at) {
                if (at.name == 'class') {
                    return;
                }
                p[at.name] = at.value;
            });
			
            if (n.firstChild) {
                p.html = this._getInnerHTML(n);
            }
			
            // get classes as array
            var classes = [];

            if (n.attr('class')) {
                classes = n.attr('class').split(' ');
            }
        
            if (classes.indexOf('mceItemAnchor') == -1) {
                // add identifier
                classes.push('mceItemAnchor');
            }

            var img = new Node('img', 1);
			
            img.attr({
                src             : this.url + '/img/anchor.gif',
                'class'         : classes.join(' '),
                'data-mce-json' : JSON.serialize(p)
            });

            n.replace(img);
        },*/

        getInfo : function() {
            return {
                longname : 'Anchor',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('anchor', tinymce.plugins.AnchorPlugin);
})();
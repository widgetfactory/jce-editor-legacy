(function() {
    var DOM = tinymce.DOM, Event = tinymce.dom.Event, is = tinymce.is, each = tinymce.each;
    var Node = tinymce.html.Node;
    var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;

    tinymce.create('tinymce.plugins.AnchorPlugin', {
        init : function(ed, url) {
            this.editor = ed;
            this.url = url;
            var self = this;
            
            function isAnchor(n) {
                return ed.dom.is(n, 'a.mceItemAnchor, span.mceItemAnchor') || (n = ed.dom.getParent(n, 'A') && ed.dom.is(n, 'a.mceItemAnchor'));
            }
            
            ed.settings.allow_html_in_named_anchor = true;

            // Register commands
            ed.addCommand('mceInsertAnchor', function(ui, value) {            
                return self._insertAnchor(value);
            });
            
            ed.onNodeChange.add( function(ed, cm, n, co) {                
                cm.setActive('anchor', isAnchor(n));
                
                ed.dom.removeClass(ed.dom.select('span.mceItemAnchor.mceItemSelected'), 'mceItemSelected');
                
                if (isAnchor(n) && n.nodeName == 'SPAN') {                 
                    ed.dom.addClass(n, 'mceItemSelected');
                }
            });
            
            ed.onKeyDown.add(function(ed, e) {				
                if (e.keyCode == BACKSPACE || e.keyCode == DELETE) {                                        
                    self._removeAnchor(e);
                }
            });

            ed.onInit.add(function() {                
                // Display "a#name" instead of "img" in element path
                if (ed.theme && ed.theme.onResolveName) {
                    ed.theme.onResolveName.add( function(theme, o) {
                        var n = o.node, v;

                        if (o.name === 'span' && /mceItemAnchor/.test(n.className)) {
                            v = ed.dom.getAttrib(n, 'data-mce-name') || n.id;
                        }

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
            ed.onPreInit.add(function() {                	
                // Convert anchor elements to image placeholder
                ed.parser.addNodeFilter('a', function(nodes) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        var node = nodes[i], fc = node.firstChild;
                        
                        if (!fc || (fc && fc.type == 3 && fc.value === '\uFEFF')) {
                            node.empty();

                            if (!node.attr('href') && (node.attr('name') || node.attr('id'))) {
                                self._createAnchorSpan(node);
                            }
                        }
                    }
                });

                // Convert image placeholders to anchor elements
                ed.serializer.addNodeFilter('span', function(nodes, name, args) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        var node = nodes[i];
                        if (/mceItemAnchor/.test(node.attr('class'))) {
                            self._restoreAnchor(node, args);
                        }
                    }
                });
            });
            
            function _cancelResize() {
                each(ed.dom.select('span.mceItemAnchor'), function(n) {
                    n.onresizestart = function() {
                        return false;
                    };
                
                    n.onbeforeeditfocus = function() {
                        return false;
                    };
                });
            };
            
            ed.onBeforeSetContent.add(function(ed, o) {
                o.content = o.content.replace(/<a id="([^"]+)"><\/a>/gi, '<a id="$1">\uFEFF</a>');
            });

            ed.onSetContent.add(function() {                              
                if (tinymce.isIE) {
                    _cancelResize();
                }
            });
            
            ed.onGetContent.add(function() {                              
                if (tinymce.isIE) {
                    _cancelResize();
                }
            });
        },
        
        _removeAnchor : function(e) {
            var ed = this.editor, s = ed.selection, n = s.getNode();
                    
            if (ed.dom.is(n, 'span.mceItemAnchor')) {
                ed.undoManager.add();
                
                ed.dom.remove(n);

                if (e) {
                    e.preventDefault();
                }
            }
                    
            if (!s.isCollapsed() && ed.dom.is(n, 'a.mceItemAnchor')) {
                ed.undoManager.add();
                
                ed.formatter.remove('link');
                if (e) {
                    e.preventDefault();
                }
            }
        },
        
        _getAnchor : function() {
            var ed = this.editor, n = ed.selection.getNode(), v;
        
            // Webkit img
            if (n.nodeName == 'SPAN' && /mceItemAnchor/.test(n.className)) {
                v = ed.dom.getAttrib(n, 'data-mce-name') || ed.dom.getAttrib(n, 'id');
            } else {                
                n = ed.dom.getParent(n, 'A');
                v = ed.dom.getAttrib(n, 'name') || ed.dom.getAttrib(n, 'id');
            }

            return v;
        },
        
        _insertAnchor : function(v) {
            var ed = this.editor, attrib;
        
            if (!v) {
                ed.windowManager.alert('anchor.invalid');
                return false;
            }
		
            if (!/^[a-z][a-z0-9\-\_:\.]*$/i.test(v)) {
                ed.windowManager.alert('anchor.invalid');
                return false;
            }
        
            var aRule = ed.schema.getElementRule('a');
        
            if (!aRule || aRule.attributes.name) {
                attrib = 'name';
            } else {
                attrib = 'id';
            }

            var n = ed.selection.getNode();
            
            //ed.undoManager.add();
        
            var at = {
                'class' :  'mceItemAnchor' 
            };

            if (n.nodeName == 'SPAN' && /mceItemAnchor/.test(n.className)) {
                if (attrib == 'name') {
                    attrib = 'data-mce-name';
                }
            
                at[attrib] = v;
            
                ed.dom.setAttribs(n, at);
            } else {
                if (n = ed.dom.getParent(n, 'A')) {
                    at[attrib] = v;
                
                    ed.dom.setAttribs(n, at);
                } else {                
                    if (ed.dom.select('a[' + attrib + '="' + v + '"], img[data-mce-name="' + v + '"], img[id="' + v + '"]', ed.getBody()).length) {
                        ed.windowManager.alert('anchor.exists');
                        return false;
                    }
                    
                    if (ed.selection.isCollapsed()) {                        
                        if (attrib == 'name') {
                            attrib = 'data-mce-name';
                        }
            
                        at[attrib] = v;

                        ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('span', {id : '__mce_tmp'}, '\uFEFF'));
                        
                        n = ed.dom.get('__mce_tmp');
                        
                        at.id = at.id || null;
                        
                        ed.dom.setAttribs(n, at);
                        ed.selection.select(n);
                        
                    } else {
                        //ed.undoManager.add();
                        
                        at[attrib] = v;
                    
                        ed.execCommand('mceInsertLink', false, '#mce_temp_url#', {
                            skip_undo : 1
                        });
                    
                        at.href = at['data-mce-href'] = null;
            
                        each(ed.dom.select('a[href="#mce_temp_url#"]'), function(link) {
                            ed.dom.setAttribs(link, at);
                        });
                    }
                }
            }
            
            ed.execCommand("mceEndUndoLevel");  
            ed.nodeChanged();
        
            return true;
        },

        _restoreAnchor : function(n) {
            var self = this, ed = this.editor, at, v, node, text;

            if (!n.parent)
                return;

            // get data
            at = {
                name    : n.attr('data-mce-name'),
                id      : n.attr('id')
            };
			
            node = new Node('a', 1);

            node.attr(at);
            
            n.replace(node);
        },
        
        _createAnchorSpan: function(n) {
            var self = this, ed = this.editor, dom = ed.dom, at = {};

            if (!n.parent)
                return;
			
            at = {
                'data-mce-name'   : n.attr('name'),
                id                : n.attr('id')
            };
			
            // get classes as array
            var classes = [];

            if (n.attr('class')) {
                classes = n.attr('class').split(' ');
            }
        
            if (classes.indexOf('mceItemAnchor') == -1) {
                // add identifier
                classes.push('mceItemAnchor');
            }

            var span = new Node('span', 1);
			
            span.attr(tinymce.extend(at, {
                'class'  : classes.join(' ')
            }));
            
            var text    = new Node('#text', 3);
            text.value  = '\uFEFF';
            
            span.append(text);

            n.replace(span);
        },
        
        createControl: function(n, cm) {
            var self = this, ed = this.editor;

            switch (n) {
                case 'anchor':
                    var content = DOM.create('div');
                    
                    var fieldset = DOM.add(content, 'fieldset', {}, '<legend>' + ed.getLang('anchor.desc', 'Insert / Edit Anchor') + '</legend>');
                    
                    DOM.add(fieldset, 'label', {'for' : ed.id + '_anchor'}, ed.getLang('anchor.name', 'Name'));
                    
                    var input   = DOM.add(fieldset, 'input', {
                        type    : 'text',
                        id      : ed.id + '_anchor'
                    });

                    var c = new tinymce.ui.ButtonDialog(cm.prefix + 'anchor', {
                        title           : ed.getLang('anchor.desc', 'Inserts an Anchor'),
                        'class'         : 'mce_anchor',
                        'content'       : content,
                        'width'         : 210,
                        'buttons'       : [{
                            title : ed.getLang('common.insert', 'Insert'),
                            id    : 'insert',
                            click : function(e) {
                                c.restoreSelection();
                                
                                return self._insertAnchor(input.value);
                            },
                            scope : self
                        }, {
                            title : ed.getLang('anchor.remove', 'Remove'),
                            id    : 'remove',
                            click : function(e) {
                                c.restoreSelection();
                                
                                if (!DOM.hasClass(e.target, 'disabled')) {
                                    self._removeAnchor();
                                }
                                
                                return true;
                            },
                            scope : self
                        }] 
                    }, ed);

                    c.onShowDialog.add(function() {
                        input.value = '';

                        var label = ed.getLang('common.insert', 'Insert');
                       
                        var v = self._getAnchor();
                        
                        if (v) {
                            input.value = v;  
                            label = ed.getLang('common.update', 'Update');
                        }
                        
                        c.setActive(!!v);
                        
                        c.setButtonDisabled('remove', !v); 
                        c.setButtonLabel('insert', label);
                        
                        input.focus();
                    });
                    
                    c.onHideDialog.add(function() {
                        input.value = '';
                    });
					
                    // Remove the menu element when the editor is removed
                    ed.onRemove.add(function() {
                        c.destroy();
                    });

                    return cm.add(c);
                    break;
            }

            return null;
        },

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
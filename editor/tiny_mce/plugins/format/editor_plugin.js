/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
    tinymce.create('tinymce.plugins.FormatPlugin', {
        init : function(ed, url) {
            var t = this;
            this.editor = ed;

            var blocks = 'p,div,address,pre,h1,h2,h3,h4,h5,h6,dl,dt,dd,code,samp';
			
            function isBlock(n) {
                return new RegExp('^(' + blocks.replace(',', '|', 'g') + ')$', 'i').test(n.nodeName);
            }
            
            // Format Block fix
            ed.onBeforeExecCommand.add(function(ed, cmd, ui, v, o) {
                var se = ed.selection, n = se.getNode(), p;
                switch (cmd) {
                    case 'FormatBlock':                        
                        // remove format
                        if (!v) {                            
                            o.terminate = true;
                            
                            if (n == ed.getBody()) {
                                return;
                            }
                            
                            ed.undoManager.add();
                            p = ed.dom.getParent(n, blocks) || '';                            
                            if (p) {
                                ed.formatter.toggle(p.nodeName.toLowerCase());
                            }
                            
                            var cm = ed.controlManager.get('formatselect');
                            if (cm) {
                                cm.select(p);
                            } 
                        }

                        break;
                    case 'RemoveFormat':
                        if (!v && isBlock(n)) {
                            ed.undoManager.add();
                            p = ed.dom.getParent(n, blocks) || '';                            
                            if (p) {
                                ed.formatter.toggle(p.nodeName.toLowerCase());
                            }
                            
                            var cm = ed.controlManager.get('formatselect');
                            
                            if (cm) {
                                cm.select(p);
                            }
                            
                            o.terminate = true;
                        }
                        break;
                }
            });
            
            ed.onExecCommand.add(function(ed, cmd, ui, v, o) {
                var se = ed.selection, n = se.getNode();
                // add Definition List
                switch (cmd) {
                    case 'FormatBlock':
                        if (v == 'dt' || v == 'dd') {
                            if (n && n.nodeName !== 'DL') {
                                ed.formatter.apply('dl');
                            }
                        }
                        break;
                }
            });

            ed.onPreInit.add(function() {
                
                function wrapList(node) {
                    var sibling = node.prev;
                    
                    if (node.parent && node.parent.name == 'dl') {
                        return;
                    }
                        
                    if (sibling && (sibling.name === 'dl' || sibling.name === 'dl')) {
                        sibling.append(node);
                        return;
                    }

                    sibling = node.next;
                    if (sibling && (sibling.name === 'dl' || sibling.name === 'dl')) {
                        sibling.insert(node, sibling.firstChild, true);
                        return;
                    }

                    node.wrap(ed.parser.filterNode(new tinymce.html.Node('dl', 1)));
                }
                
                ed.parser.addNodeFilter('dt,dd', function(nodes) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        wrapList(nodes[i]);
                    }
                });
                
                ed.serializer.addNodeFilter('dt,dd', function(nodes) {
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        wrapList(nodes[i]);
                    }
                });
            });
        },
		
        getInfo : function() {
            return {
                longname : 'Format',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('format', tinymce.plugins.FormatPlugin);
})();
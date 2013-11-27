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
    var VK = tinymce.VK;
    var blocks = 'section,nav,article,aside,h1,h2,h3,h4,h5,h6,header,footer,address,main,p,pre,blockquote,figure,figcaption,div';

    tinymce.create('tinymce.plugins.FormatPlugin', {
        init: function(ed, url) {
            var self = this;
            this.editor = ed;

            function isBlock(n, s) {
                s = s || blocks;
                return new RegExp('^(' + s.replace(',', '|', 'g') + ')$', 'i').test(n.nodeName);
            }

            ed.onKeyDown.add(function(ed, e) {
                if ((e.keyCode === VK.ENTER || e.keyCode === VK.UP) && e.altKey) {
                    // clear blocks
                    self._clearBlocks(ed, e);
                }
            });

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
                        var s = 'p,div,address,pre,h1,h2,h3,h4,h5,h6,code,samp,span,section,article,aside,figure,dt,dd';
                        
                        if (!v && isBlock(n, s)) {
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
        _clearBlocks: function(ed, e) {
            var p, n = ed.selection.getNode();

            // Find parent element just before the document body
            p = ed.dom.getParents(n, blocks);

            if (p && p.length > 1) {
                // set defualt content and get the element to use
                var h = '&nbsp;', tag = ed.getParam('forced_root_block');
                
                if (!tag && ed.getParam('force_p_newlines')) {
                    tag = 'p';
                } else {
                    tag = 'br';
                }
                
                // prevent default action
                e.preventDefault();

                // get the first block in the collection
                var block = p[p.length - 1];

                // skip if it is the body
                if (block === ed.getBody()) {
                    return;
                }

                // create element
                var el = ed.dom.create(tag);

                // create bogus br element
                if (tag === 'br') {
                    h = '<br data-mce-bogus="1" />';
                }

                // set HTML
                ed.dom.setHTML(el, h);

                if (e.keyCode === VK.ENTER) {
                    // insert after parent element
                    ed.dom.insertAfter(el, block);
                } else {
                    // insert after parent element
                    block.parentNode.insertBefore(el, block);
                }

                // select and collapse
                ed.selection.select(el);
                ed.selection.collapse(1);
            }

            // execute normal enter/up behaviour
        },
        getInfo: function() {
            return {
                longname: 'Format',
                author: 'Ryan Demmer',
                authorurl: 'http://www.joomlacontenteditor.net',
                infourl: 'http://www.joomlacontenteditor.net',
                version: '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('format', tinymce.plugins.FormatPlugin);
})();
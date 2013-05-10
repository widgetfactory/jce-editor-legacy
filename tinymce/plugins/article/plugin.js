/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

/*global tinymce:true */

tinymce.PluginManager.add('article', function(editor) {
    var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Node = tinymce.html.Node;
    var VK = tinymce.util.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;

    function isReadMore(n) {
        return editor.dom.is(n, 'hr.mceItemReadMore');
    }

    function isPageBreak(n) {
        return editor.dom.is(n, 'hr.mceItemPageBreak');
    }

    function cancelResize() {
        each(editor.dom.select('hr.mceItemPageBreak, hr.mceItemReadMore'), function(n) {
            n.onresizestart = function() {
                return false;
            };

            n.onbeforeeditfocus = function() {
                return false;
            };
        });
    }

    function getPageBreak() {
        var t = this, ed = this.editor, dom = ed.dom, n = ed.selection.getNode(), o;

        if (ed.dom.is(n, 'hr.mceItemPageBreak')) {
            o = {
                title: ed.dom.getAttrib(n, 'title', ''),
                alt: ed.dom.getAttrib(n, 'data-mce-alt', '')
            }
        }

        return o;
    }
    function updatePageBreak(n, v) {
        var t = this, ed = this.editor;

        tinymce.extend(v, {
            'data-mce-alt': v.alt || ''
        });

        v.alt = null;

        ed.dom.setAttribs(n, v);
    }

    function insertBreak(s, args) {
        var dom = editor.dom, n = editor.selection.getNode(), ns, h, c, re, isBlock = false, hr, p, desc = '', bElm = [];

        var blocks = 'H1,H2,H3,H4,H5,H6,P,DIV,ADDRESS,PRE,FORM,TABLE,OL,UL,CAPTION,BLOCKQUOTE,CENTER,DL,DIR,FIELDSET,NOSCRIPT,NOFRAMES,MENU,ISINDEX,SAMP,SECTION,ARTICLE,HGROUP,ASIDE,FIGURE';

        n = dom.getParent(n, blocks, 'BODY') || n;

        tinymce.extend(args, {
            'class': s == 'pagebreak' ? 'mceItemPageBreak' : 'mceItemReadMore',
            'data-mce-alt': args.alt || null
        });

        // remove alt
        args.alt = null;

        // set id for readmore
        if (s == 'readmore') {
            args.id = 'system-readmore';
        }

        editor.execCommand('mceInsertContent', false, '<span id="mce_hr_marker" data-mce-type="bookmark">\uFEFF</span>', {
            skip_undo: 1
        });

        var marker = dom.get('mce_hr_marker');
        var hr = dom.create('hr', args);

        if (dom.isBlock(n)) {
            // get the img parent
            p = dom.getParent(marker, blocks, 'BODY');
            // split paragraphs / divs
            if (p.nodeName == 'P' || p.nodeName == 'DIV') {

                // split
                dom.split(p, marker);

                ns = marker.nextSibling;

                if (ns && ns.nodeName == p.nodeName) {
                    if (/^(\s|&nbsp;|\u00a00)*?$/.test(h) || h == '<br>') {
                        dom.remove(ns);
                    }
                }
            } else {
                // If in block
                if (p) {
                    if (p.parentNode.nodeName == 'BODY') {
                        dom.insertAfter(marker, p);
                    } else {
                        p.parentNode.insertBefore(marker, p);
                    }
                } else {
                    if (n.parentNode.nodeName == 'BODY') {
                        dom.insertAfter(marker, n);
                    } else {
                        n.parentNode.insertBefore(marker, n);
                    }
                }
                p = marker.parentNode;

                while (/^(H[1-6]|ADDRESS|PRE|FORM|TABLE|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DIR|FIELDSET|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP)$/.test(p.nodeName)) {
                    p.parentNode.insertBefore(marker, p);
                    p = marker.parentNode;
                }
            }
            ns = marker.nextSibling;

            if (!ns) {
                var el = editor.getParam('forced_root_block') || 'br';
                ns = editor.dom.create(el);

                if (el != 'br') {
                    ns.innerHTML = '\u00a0';
                }
                editor.dom.insertAfter(ns, marker);
                s = editor.selection.select(ns);
                editor.selection.collapse(1);
            }
        }

        editor.dom.replace(hr, marker);
        editor.undoManager.add();
    }

    // readmore
    if (editor.getParam('article_show_readmore', true)) {
        // Register buttons
        editor.addButton('readmore', {
            title: 'Read More',
            cmd: 'mceReadMore'
        });

        editor.addMenuItem('readmore', {
            text: 'Read More',
            icon: 'readmore',
            cmd: 'mceReadMore',
            context: 'insert'
        });
    }

    if (editor.getParam('article_show_pagebreak', true)) {
        // Register buttons
        editor.addButton('pagebreak', {
            title: 'Page Break',
            cmd: 'mcePageBreak'
        });

        editor.addMenuItem('pagebreak', {
            text: 'Page Break',
            icon: 'pagebreak',
            cmd: 'mcePageBreak',
            context: 'insert'
        });
    }

    editor.on('ResolveName', function(e) {
        var v, n = e.target;

        if (e.name === 'hr' && /mceItemPageBreak/.test(n.className)) {
            v = 'pagebreak';
        }

        if (e.name === 'hr' && /mceItemReadMore/.test(n.className)) {
            v = 'readmore';
        }

        if (v) {
            e.name = v;
        }
    });

    // Register commands
    editor.addCommand('mceReadMore', function() {
        if (editor.dom.get('system-readmore')) {
            alert(editor.getLang('article.readmore_alert', 'There is already a Read More break inserted in this article. Only one such break is permitted. Use a Pagebreak to split the page up further.'));
            return false;
        }
        insertBreak('readmore', {
            id: 'system-readmore'
        });
    });
    editor.addCommand('mcePageBreak', function(ui, v) {
        var n = editor.selection.getNode();

        if (isPageBreak(n)) {
            updatePageBreak(n, v);
        } else {
            insertBreak('pagebreak', v);
        }
    });

    editor.on('BeforeSetContent', function(o) {
        o.content = o.content.replace(/<hr([^>]*)alt="([^"]+)"([^>]+)>/gi, '<hr$1data-mce-alt="$2"$3>');
    });

    editor.on('SetContent', function() {
        if (tinymce.isIE) {
            cancelResize();
        }
    });

    editor.on('GetContent', function() {
        if (tinymce.isIE) {
            cancelResize();
        }
    });

    editor.on('KeyDown', function(e) {
        if (e.keyCode == BACKSPACE || e.keyCode == DELETE) {
            var s = editor.selection, n = s.getNode();

            if (editor.dom.is(n, 'hr.mceItemPageBreak, hr.mceItemReadMore')) {
                editor.dom.remove(n);

                e.preventDefault();
            }
        }
    });

    editor.on('PreInit', function() {
        // Convert video elements to image placeholder
        editor.parser.addNodeFilter('hr', function(nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i], id = node.attr('id') || '', cls = node.attr('class') || '';

                if (id == 'system-readmore' || /system-pagebreak/.test(cls)) {
                    var cls = /system-pagebreak/.test(cls) ? 'mceItemPageBreak' : 'mceItemReadMore';

                    node.attr('class', cls);
                    if (node.attr('alt')) {
                        node.attr('data-mce-alt', node.attr('alt'));
                        node.attr('alt', null);
                    }
                }
            }
        });

        // Convert image placeholders to video elements
        editor.serializer.addNodeFilter('hr', function(nodes, name, args) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (/mceItem(PageBreak|ReadMore)/.test(node.attr('class') || '')) {
                    if (/mceItemPageBreak/.test(node.attr('class'))) {
                        node.attr('class', 'system-pagebreak');
                    } else {
                        node.attr('class', '');
                        node.attr('id', 'system-readmore');
                    }

                    if (node.attr('data-mce-alt')) {
                        node.attr('alt', node.attr('data-mce-alt'));

                        node.attr('data-mce-alt', null);
                    }
                }
            }
        });

    });

    editor.on('NodeChange', function(ed, cm, n) {
        cm.setActive('readmore', isReadMore(n));
        cm.setActive('pagebreak', isPageBreak(n));

        ed.dom.removeClass(ed.dom.select('hr.mceItemPageBreak.mceItemSelected, hr.mceItemReadMore.mceItemSelected'), 'mceItemSelected');

        if (isPageBreak(n) || isReadMore(n)) {
            ed.dom.addClass(n, 'mceItemSelected');
        }
    });
});
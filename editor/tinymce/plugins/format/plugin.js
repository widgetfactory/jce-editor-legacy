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

tinymce.PluginManager.add('format', function(ed) {

    var blocks = 'p,div,address,pre,h1,h2,h3,h4,h5,h6,dl,dt,dd,code,samp';

    function isBlock(n) {
        return new RegExp('^(' + blocks.replace(',', '|', 'g') + ')$', 'i').test(n.nodeName);
    }

    ed.on('ExecCommand', function(e) {
        var se = ed.selection, n = se.getNode();
        // add Definition List
        switch (e.command) {
            case 'FormatBlock':
                if (e.value == 'dt' || e.value == 'dd') {
                    if (n && n.nodeName !== 'DL') {
                        ed.formatter.apply('dl');
                    }
                }
                break;
        }
    });

    ed.on('PreInit', function() {

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
});
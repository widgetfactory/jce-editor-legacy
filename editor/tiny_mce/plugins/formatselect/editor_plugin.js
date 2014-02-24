/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2014 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
    var each = tinymce.each, PreviewCss = tinymce.util.PreviewCss;
    
    tinymce.create('tinymce.plugins.FormatSelectPlugin', {
        init: function(ed, url) {
            var self = this;
            this.editor = ed;

            ed.onNodeChange.add(function(ed, cm, n) {
                var c = cm.get('formatselect'), p;

                // select font
                if (c) {                    
                    p = ed.dom.getParent(n, ed.dom.isBlock);

                    if (p) {
                        c.select(p.nodeName.toLowerCase());
                    }
                }
            });
        },
        createControl: function(n, cf) {
            switch (n) {
                case "formatselect":
                    return this._createBlockFormats();
                    break;
            }
        },
        _createBlockFormats: function() {
            var self = this, ed = this.editor;
            
            var c, fmts = {
                p: 'advanced.paragraph',
                address: 'advanced.address',
                pre: 'advanced.pre',
                h1: 'advanced.h1',
                h2: 'advanced.h2',
                h3: 'advanced.h3',
                h4: 'advanced.h4',
                h5: 'advanced.h5',
                h6: 'advanced.h6',
                div: 'advanced.div',
                blockquote: 'advanced.blockquote',
                code: 'advanced.code',
                dt: 'advanced.dt',
                dd: 'advanced.dd',
                samp: 'advanced.samp',
                span: 'advanced.span'
            };

            c = ed.controlManager.createListBox('formatselect', {
                title: 'advanced.block',
                onselect: function(v) {
                    ed.execCommand('FormatBlock', false, v);
                    return false;
                }
            });

            if (c) {
                each(ed.getParam('theme_advanced_blockformats', ed.settings.theme_advanced_blockformats, 'hash'), function(v, k) {
                    c.add(ed.translate(k != v ? k : fmts[v]), v, {
                        'class': 'mce_formatPreview mce_' + v,
                        style: function() {
                            return new PreviewCss(ed, {'block' : v});
                        }
                    });
                });
            }

            return c;
        }
    });

    // Register plugin
    tinymce.PluginManager.add('formatselect', tinymce.plugins.FormatSelectPlugin);
})();
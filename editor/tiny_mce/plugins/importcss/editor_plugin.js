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
    var each = tinymce.each, PreviewCss = tinymce.util.PreviewCss, Event = tinymce.dom.Event, DOM = tinymce.DOM;

    /* Make a css url absolute
     * @param u URL string
     * @param p URL of the css file
     */
    function toAbsolute(u, p) {
        return u.replace(/url\(["']?(.+?)["']?\)/gi, function(a, b) {

            if (b.indexOf('://') < 0) {
                return 'url("' + p + b + '")';
            }

            return a;
        });
    }

    tinymce.create('tinymce.plugins.ImportCSS', {
        populateStyleSelect: function() {
            var ed = this.editor;

            var self = this, styleselect = ed.controlManager.get('styleselect');
            
            // if control does not exist or has been populated, return.
            if (!styleselect || styleselect.hasClasses) {
                return;
            }

            var counter = Math.max(styleselect.getLength() - 1, 0), classes = this.import();

            // no classes found, return.
            if (classes.length === 0) {
                return;
            }

            each(classes, function(o, idx) {
                var name = 'style_' + (counter + idx), fmt;

                fmt = {
                    inline: 'span',
                    attributes: {
                        'class': o['class']
                    },
                    selector: '*'
                };

                ed.formatter.register(name, fmt);

                styleselect.add(o['class'], name, {
                    style: function() {
                        return PreviewCss(ed, fmt);
                    }
                });
            });

            styleselect.hasClasses = true;
        },
        init: function(ed, url) {
            this.editor = ed;

            var self = this;

            ed.onPreInit.add(function(editor) {
                var styleselect = ed.controlManager.get('styleselect');

                if (styleselect && !styleselect.hasClasses && ed.getParam('styleselect_stylesheet_styles', true)) {
                    styleselect.onPostRender.add(function(ed, n) {                        
                        if (!styleselect.NativeListBox) {
                            Event.bind(DOM.get(n.id + '_text'), 'focus mousedown', self.populateStyleSelect, self);
                            Event.bind(DOM.get(n.id + '_open'), 'focus mousedown', self.populateStyleSelect, self);
                        } else {
                            Event.bind(DOM.get(n.id, 'focus'), self.populateStyleSelect, self);
                        }
                    });
                }

                var fontselect = ed.controlManager.get('fontselect');

                if (fontselect) {
                    fontselect.onPostRender.add(function() {
                        // font face items not yet created, run import
                        if (!self.fontface) {
                            self.import();
                        }
                    });
                }
            });

            ed.onNodeChange.add(function() {
                var styleselect = ed.controlManager.get('styleselect');

                if (styleselect && !styleselect.hasClasses && ed.getParam('styleselect_stylesheet_styles', true)) {
                    return self.populateStyleSelect();
                }
            });
        },
        import: function() {
            var self = this, ed = this.editor, doc = ed.getDoc(), cl = [], ff = [], i, lo = {}, f = ed.settings.class_filter, ov, href = '', rules = [], fontface = false;

            function parseCSS(stylesheet) {

                // IE style imports
                each(stylesheet.imports, function(r) {
                    if (r.href.indexOf('://fonts.googleapis.com') > 0) {
                        var v = '@import url(' + r.href + ');';

                        if (tinymce.inArray(ff, v) === -1) {
                            ff.unshift(v);
                        }

                        return;
                    }

                    parseCSS(r);
                });

                try {
                    rules = stylesheet.cssRules || stylesheet.rules;

                    // get stylesheet href
                    if (stylesheet.href) {
                        href = stylesheet.href.substr(0, stylesheet.href.lastIndexOf('/') + 1);
                    }

                } catch (e) {
                    // Firefox fails on rules to remote domain for example: 
                    // @import url(//fonts.googleapis.com/css?family=Pathway+Gothic+One);
                }

                each(rules, function(r) {
                    // Real type or fake it on IE
                    switch (r.type || 1) {
                        // Rule
                        case 1:
                            // IE8
                            if (!r.type) {
                            }

                            if (r.selectorText) {
                                each(r.selectorText.split(','), function(v) {
                                    v = v.replace(/^\s*|\s*$|^\s\./g, "");

                                    // Is internal or it doesn't contain a class
                                    if (/\.mce/.test(v) || !/\.[\w\-]+$/.test(v))
                                        return;

                                    // Remove everything but class name
                                    ov = v;
                                    v = tinymce._replace(/.*\.([a-z0-9_\-]+).*/i, '$1', v);

                                    // Filter classes
                                    if (f && !(v = f(v, ov)))
                                        return;

                                    if (!lo[v]) {
                                        cl.push({
                                            'class': v
                                        });
                                        lo[v] = 1;
                                    }
                                });
                            }

                            break;

                            // Import
                        case 3:                            
                            if (r.href.indexOf('://fonts.googleapis.com') > 0) {
                                var v = '@import url(' + r.href + ');';

                                if (tinymce.inArray(ff, v) === -1) {
                                    ff.unshift(v);
                                }
                            }

                            // only local imports
                            if (tinymce.isGecko && r.href.indexOf('://') != -1) {
                                return;
                            }

                            parseCSS(r.styleSheet);
                            break;
                            // font-face
                        case 5:
                            // check for text and skip popular font icons
                            if (r.cssText && /(fontawesome|glyphicons|icomoon)/i.test(r.cssText) === false) {
                                var v = toAbsolute(r.cssText, href);

                                if (tinymce.inArray(ff, v) === -1) {
                                    ff.push(v);
                                }
                            }
                            break;
                    }
                });
            }

            try {
                each(doc.styleSheets, function(styleSheet) {
                    parseCSS(styleSheet);
                });
            } catch (ex) {
            }

            // add font-face rules
            if (ff.length && self.fontface === false) {
                try {
                    // get document head
                    var head = DOM.doc.getElementsByTagName('head')[0];
                    // create style element
                    var style = DOM.create('style', {
                        type: 'text/css'
                    });

                    var css = ff.join("\n");

                    if (style.styleSheet) {
                        var setCss = function() {
                            try {
                                style.styleSheet.cssText = css;
                            } catch (e) {
                            }
                        };
                        if (style.styleSheet.disabled) {
                            setTimeout(setCss, 10);
                        } else {
                            setCss();
                        }
                    } else {
                        style.appendChild(DOM.doc.createTextNode(css));
                    }

                    // add to head
                    head.appendChild(style);

                    // set fontface flag so we only do this once
                    self.fontface = true;

                } catch (e) {
                }
            }

            return cl;
        }
    });
    // Register plugin
    tinymce.PluginManager.add('importcss', tinymce.plugins.ImportCSS);
})();
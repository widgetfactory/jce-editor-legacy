/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

/**
 * Joomla! IeCursor Fix function override
 */
function IeCursorFix() {
    return true;
}

function jInsertEditorText(text, editor) {
    WFEditor.insert(editor, text);
}

/**
 * Widget Factory Editor
 */
(function () {
    var winLoaded = false, each = tinymce.each, explode = tinymce.explode;

    // version flag
    var VERSION = "@@version@@";

    var WFEditor = {
        _bookmark: {},
        getSite: function (base) {
            var site, host;
            // get url from browser
            var u = document.location.href;
            // if bas is a full url
            if (base.indexOf('http') !== -1) {
                // get the host part of the url eg: www.mysite.com
                host = base.substr(base.indexOf('://') + 3);
                // get the
                site = host.substr(host.indexOf('/'));
            } else {
                site = u.substr(0, u.indexOf(base) + base.length);
            }

            if (u.indexOf('/administrator/') !== -1) {
                site = site + 'administrator/';
            }

            return site;
        },
        /**
         * Initialise JContentEditor
         * @param {Object} settings TinyMCE Settings
         */
        init: function (settings) {
            var self = this;

            var base = settings.base_url;
            var site = this.getSite(base);

            // fix https in base url
            if (/https:\/\//.test(document.location.href)) {
                base = base.replace(/http:/, 'https:');
            }

            // set default values
            settings.token = settings.token || 0;
            settings.component_id = settings.component_id || 0;

            // set preinit object to prevent tinymce from generating baseURL
            window.tinyMCEPreInit = {};
            // set baseURL, suffix and query string
            tinymce.extend(tinymce, {
                baseURL: base + 'components/com_jce/editor/tiny_mce',
                suffix: '',
                query: settings.token + '=1&component_id=' + settings.component_id
            });

            var indent = 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,object,video,audio';

            // remove submit triggers
            this.settings = tinymce.extend({
                document_base_url: base,
                site_url: site,
                mode: 'textareas',
                schema: "mixed",
                //entity_encoding: 'raw',
                editor_selector: 'wfEditor',
                editor_deselector: 'wfNoEditor',
                urlconverter_callback: 'WFEditor.convertURL',
                //popup_css: base + 'components/com_jce/editor/libraries/css/popup.css',
                add_form_submit_trigger: false,
                submit_patch: false,
                theme: 'none',
                invalid_elements: 'applet,iframe,object,embed,script,style,body,bgsound,base,basefont,frame,frameset,head,html,id,ilayer,layer,link,meta,name,title,xml',
                plugins: '',
                whitespace_elements: 'pre,script,style,textarea,code',
                fix_list_elements: true,
                keep_styles: false,
                indent_before: indent,
                indent_after: indent,
                popup_css: false,
                compress: {
                    'css': true,
                    'javascript': true
                }
            }, settings);

            if (this.settings) {
                try {
                    var s = this.settings;

                    if (s.compress.css) {
                        tinymce.extend(this.settings, {
                            content_css: false,
                            editor_css: false
                        });
                    }

                    // mark javascript files loaded
                    this._markLoaded();

                    // skip loading plugin languages that don't exist
                    if (s.skip_plugin_languages) {
                        var sl = tinymce.ScriptLoader, URI = tinyMCE.baseURI;
                        each(s.skip_plugin_languages.split(','), function (n) {
                            if (n) {
                                sl.markDone(URI.toAbsolute('plugins/' + n + '/langs/' + s.language + '.js'));
                                sl.add(URI.toAbsolute('plugins/' + n + '/langs/en.js'));
                            }
                        });
                    }
                    WFEditor.load();
                } catch (e) {
                    //console.log(e);
                }
            }
        },
        _markLoaded: function () {
            var self = this, s = this.settings, each = tinymce.each, ln = s.language.split(',');

            var suffix = s.suffix || '';

            function load(u) {
                tinymce.ScriptLoader.markDone(tinyMCE.baseURL + '/' + u);
            }

            if (s.compress.javascript == 0) {
                // development mode
                if (VERSION.indexOf('@@') != -1) {
                    return;
                }

                each(['autolink', 'cleanup', 'core', 'code', 'colorpicker', 'upload', 'format'], function (n) {
                    load('plugins/' + n + '/editor_plugin' + suffix + '.js');
                });
            }
            
            // Mark themes loaded
            load('themes/advanced/editor_template' + suffix + '.js');
            load('themes/none/editor_template' + suffix + '.js');
            
            if (s.compress.javascript == 1) {
                // Add plugins with languages
                each(s.plugins.split(','), function (n) {
                    if (n) {
                        load('plugins/' + n + '/editor_plugin' + suffix + '.js');

                        each(ln, function (c) {
                            if (c) {
                                load('plugins/' + n + '/langs/' + c + '.js');
                            }
                        });
                    }
                });
            }
        },
        setBookmark: function (ed) {
            var self = this, DOM = tinymce.DOM, Event = tinymce.dom.Event;

            function isHidden(ed) {
                return ed.isHidden() || DOM.getStyle(ed.id + '_ifr', 'visibility') == 'hidden';
            }

            function isEditor(el) {
                return DOM.getParent(el, 'div.mceEditor, div.mceSplitButtonMenu, div.mceListBoxMenu, div.mceDropDown');
            }

            Event.add(document.body, 'mousedown', function (e) {
                var el = e.target;

                if (isEditor(el)) {
                    return;
                }

                if (!isHidden(ed) && ed.selection) {
                    var n = ed.selection.getNode();

                    if (DOM.getParent(n, 'body#tinymce')) {
                        ed.lastSelectionBookmark = ed.selection.getBookmark(1);
                    }
                }
            });
        },
        load: function () {
            var self = this, Event = tinymce.dom.Event, each = tinymce.each, explode = tinymce.explode, loaded;

            var s = this.settings;

            // pass settings object to tinymce
            tinymce.settings = s;

            // setup editor before init
            tinyMCE.onAddEditor.add(function (mgr, ed) {
                // load packer css
                if (s.compress.css) {
                    ed.onPreInit.add(function () {
                        ed.dom.loadCSS(s.site_url + 'index.php?option=com_jce&view=editor&layout=editor&task=pack&type=css&context=content&component_id=' + s.component_id + '&' + s.token + '=1');
                    });
                }
                // hide loader
                WFEditor.hideLoader(ed.getElement());

                // create bookmark
                self.setBookmark(ed);

                // remove loaded plugins not in the plugins list
                var plugins = s.plugins.split(','), lookup = tinymce.PluginManager.lookup;

                each(lookup, function (o, k) {
                    if (tinymce.inArray(plugins, k) === -1) {
                        delete lookup[k];
                    }
                });

                // form submit trigger
                ed.onInit.add(function () {
                    ed.onSubmit.addToTop(function () {
                        if (ed.initialized && !ed.isHidden()) {
                            ed.save();
                            ed.isNotDirty = 1;
                        }
                    });
                });

                // Form submit patch
                ed.onBeforeRenderUI.add(function () {
                    var n = ed.getElement().form;

                    if (!n || n._mceOldSubmit) {
                        return;
                    }

                    // Check page uses id="submit" or name="submit" for it's submit button
                    if (!n.submit.nodeType && !n.submit.length) {
                        ed.formElement = n;
                        n._mceOldSubmit = n.submit;
                        n.submit = function () {

                            // Save all instances
                            tinymce.each(tinymce.editors, function (e) {
                                if (e.initialized && !e.isHidden()) {
                                    e.save();
                                }
                            });

                            ed.isNotDirty = 1;

                            return ed.formElement._mceOldSubmit(ed.formElement);
                        };
                    }
                    n = null;
                });

                // fix link quirk in WebKit
                ed.onBeforeExecCommand.add(function (ed, cmd, ui, v, o) {
                    var se = ed.selection, n = se.getNode();

                    // remove img styles
                    if (cmd == 'mceInsertLink') {
                        // store class and style
                        if (tinymce.isWebKit && n && n.nodeName == 'IMG') {
                            ed.dom.setAttrib(n, 'data-mce-style', n.style.cssText);
                            n.style.cssText = null;
                        }
                    }
                });

                ed.onExecCommand.add(function (ed, cmd, ui, v, o) {
                    var se = ed.selection, n = se.getNode();

                    // restore img styles
                    if (cmd == 'mceInsertLink') {
                        tinymce.each(ed.dom.select('img[data-mce-style]', n), function (el) {
                            if (el.parentNode.nodeName == 'A' && !el.style.cssText) {
                                el.style.cssText = ed.dom.getAttrib(el, 'data-mce-style');
                            }
                        });
                    }
                });
            });

            function _load() {
                if (!loaded) {
                    // set loaded flag
                    loaded = true;
                    // create editor
                    return self.create();
                }
            }

            // load editor when page fully loaded
            Event.add(window, 'load', function () {
                _load();
            });
            // wait until dom is ready with delay
            Event.add(document, 'init', function () {
                window.setTimeout(function () {
                    _load();
                }, 1000);
            });
        },
        /**
         * Create Editors
         */
        create: function (elements) {
            var self = this, Event = tinymce.dom.Event, s = this.settings;

            WFEditor.showLoader();

            if (elements) {
                s.mode = 'exact';
                s.elements = elements;
            }

            try {
                // only create toggle for advanced theme
                if (s.theme == 'advanced' && (typeof s.toggle == 'undefined' ? 1 : s.toggle)) {
                    this._createToggle(elements);
                }

                tinyMCE.init(s);

            } catch (e) {
                alert(e);
            }
        },
        _createToggle: function (elements) {
            var self = this, DOM = tinymce.DOM, Event = tinymce.dom.Event, s = this.settings;

            function getVar(s, dv) {
                return (typeof s == 'undefined' || s === null) ? dv : s;
            }

            var use_cookies = getVar(s.use_cookies, true);
            elements = elements || DOM.select('.wfEditor');

            tinymce.each(elements, function (el) {
                var state = getVar(s.toggle_state, 1);
                // get cookie
                var cookie = getVar(tinymce.util.Cookie.get('wf_editor_' + el.id + '_state'), 1);
                var label = getVar(s.toggle_label, '[Toggle Editor]');

                var div = DOM.create('span', {
                    'role': 'button',
                    'class': 'wf_editor_toggle',
                    'aria-labelledby': 'wf_editor_' + el.id + '_toggle'
                }, '<span id="wf_editor_' + el.id + '_toggle">' + label + '</span>');

                DOM.setStyle(div, 'cursor', 'pointer');
                el.parentNode.insertBefore(div, el);

                Event.add(div, 'click', function (e) {
                    self.toggle(el, use_cookies);
                });
                if (!state) {
                    DOM.removeClass(el, 'wfEditor');
                    DOM.addClass(el, 'wfNoEditor');
                    self._wrapText(el, true);
                } else {
                    if (parseInt(cookie) == 0) {
                        DOM.removeClass(el, 'wfEditor');
                        DOM.addClass(el, 'wfNoEditor');
                        self._wrapText(el, true);
                    } else {
                        DOM.removeClass(el, 'wfNoEditor');
                        DOM.addClass(el, 'wfEditor');
                    }
                }
            });
        },
        toggle: function (el, use_cookies) {
            var self = this, ed = tinyMCE.get(el.id), DOM = tinymce.DOM;
            
            var state = !ed || ed.isHidden() ? 1 : 0
            // set cookie
            if (use_cookies) {
                tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', state);
            }

            // turn it on
            if (!ed) {
                DOM.removeClass(el, 'wfNoEditor');
                DOM.addClass(el, 'wfEditor');
            } else {
                self._wrapText(ed.getElement(), true);

                if (ed.isHidden()) {
                    DOM.removeClass(el, 'wfNoEditor');
                    DOM.addClass(el, 'wfEditor');
                } else {
                    DOM.removeClass(el, 'wfEditor');
                    DOM.addClass(el, 'wfNoEditor');
                }
            }
            
            tinymce.execCommand('mceToggleEditor', false, el.id);
        },
        _wrapText: function (el, s) {
            
            if (s) {
                el.setAttribute("wrap", "soft");
            } else {
                el.removeAttribute("wrap");
            }
        },
        showLoader: function (el) {
            tinymce.DOM.addClass('.wfEditor', 'loading');
        },
        hideLoader: function (el) {
            tinymce.DOM.removeClass(el, 'loading');
        },
        /**
         * Set the editor content
         * @param {String} id The editor id
         * @param {String} html The html content to set
         */
        setContent: function (id, html) {
            var ed = tinyMCE.get(id);

            if (ed) {
                ed.setContent(html);
            } else {
                document.getElementById(id).value = html;
            }
        },
        /**
         * Get the editor content
         * @param {String} id The editor id
         */
        getContent: function (id) {
            var ed = tinyMCE.get(id);

            // pass content to textarea and return
            if (ed && !ed.isHidden()) {
                return ed.save();
            }

            // return textarea content
            return document.getElementById(id).value;
        },
        /**
         * Insert content into the editor. This function is provided for editor-xtd buttons and includes methods for inserting into textareas
         * @param {String} el The editor id
         * @param {String} v The text to insert
         */
        insert: function (el, v) {
            var ed, win = window;

            // tinymce is in the parent window
            if (window.parent.tinymce) {
                win = window.parent;
            }

            if (el) {
                if (typeof el === 'string') {
                    el = document.getElementById(el);
                }

                // use element passed in
                if (el && el.id) {
                    ed = win.tinyMCE.get(el.id);
                }
            }

            // get active editor
            if (!ed) {
                ed = win.tinyMCE.activeEditor;
            }

            // insert into textarea if editor not loaded or is hidden
            if (!ed || ed.isHidden()) {
                this.insertIntoTextarea(el, v);
                return true;
            }

            // editor found, insert
            if (ed) {
                if (ed.lastSelectionBookmark) {
                    ed.selection.moveToBookmark(ed.lastSelectionBookmark);
                }

                ed.execCommand('mceInsertContent', false, v);
            }
        },
        insertIntoTextarea: function (el, v) {
            // IE
            if (document.selection) {
                el.focus();
                var s = document.selection.createRange();
                s.text = v;
                // Mozilla / Netscape
            } else {
                if (el.selectionStart || el.selectionStart == '0') {
                    var startPos = el.selectionStart;
                    var endPos = el.selectionEnd;
                    el.value = el.value.substring(0, startPos) + v + el.value.substring(endPos, el.value.length);
                    // Other
                } else {
                    el.value += v;
                }
            }
        },
        convertURL: function (url, elm, save, name) {
            var ed = tinymce.EditorManager.activeEditor, s = tinymce.settings, base = s.document_base_url;

            if (!url) {
                return url;
            }

            // Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
            if (!s.convert_urls || (elm && elm.nodeName === 'LINK') || url.indexOf('file:') === 0) {
                return url;
            }

            if (url === base || url === base.substring(0, base.length - 1) || url.charAt(0) === '/') {
                return url;
            }

            // Convert to relative
            if (s.relative_urls) {
                return ed.documentBaseURI.toRelative(url);
            }

            // Convert to absolute
            return ed.documentBaseURI.toAbsolute(url, s.remove_script_host);
        },
        indent: function (h) {
            // simple indentation
            h = h.replace(/\n+/g, '\n');

            return tinymce.trim(h);
        }
    };
    window.WFEditor = WFEditor;
}());
/**
 * @version		$Id: editor.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
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
( function() {
    var winLoaded = false, each = tinymce.each;

    var WFEditor = {

        _bookmark : {},

        getSite : function(base) {
            var site, host;
            // get url from browser
            var u = document.location.href;
            // if bas is a full url
            if(base.indexOf('http') !== -1) {
                // get the host part of the url eg: www.mysite.com
                host = base.substr(base.indexOf('://') + 3);
                // get the
                site = host.substr(host.indexOf('/'));
            } else {
                site = u.substr(0, u.indexOf(base) + base.length);
            }

            if(u.indexOf('/administrator/') !== -1) {
                site = site + 'administrator/';
            }

            return site;
        },
        /**
		 * Initialise JContentEditor
		 * @param {Object} settings TinyMCE Settings
		 */
        init : function(settings) {
            var self = this;

            var base = settings.base_url;
            var site = this.getSite(base);

            // fix https in base url
            if(/https:\/\//.test(document.location.href)) {
                base = base.replace(/http:/, 'https:');
            }

            // set default values
            settings.token = settings.token || 0;
            settings.component_id = settings.component_id || 0;

            // set preinit object to prevent tinymce from generating baseURL
            window.tinyMCEPreInit = {};
            // set baseURL, suffix and query string
            tinymce.extend(tinymce, {
                baseURL : base + 'components/com_jce/editor/tiny_mce',
                suffix : '',
                query : settings.token + '=1&component_id=' + settings.component_id
            });
            
            var indent = 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,object,video,audio';

            // remove submit triggers
            this.settings = tinymce.extend({
                document_base_url : base,
                site_url : site,
                mode : 'textareas',
                editor_selector : 'wfEditor',
                editor_deselector : 'wfNoEditor',
                urlconverter_callback : 'WFEditor.convertURL',
                popup_css : base + 'components/com_jce/editor/libraries/css/popup.css',
                add_form_submit_trigger : false,
                submit_patch : false,
                theme : 'none',
                invalid_elements : 'applet,iframe,object,embed,script,style,body,bgsound,base,basefont,frame,frameset,head,html,id,ilayer,layer,link,meta,name,title,xml',
                plugins : '',
                whitespace_elements : 'pre,script,style,textarea,code',
                fix_list_elements : true,
                formats: {
                    'span' : {
                        inline : 'span'
                    }, 
                    'section' : {
                        block : 'section', 
                        wrapper: true, 
                        merge_siblings: false
                    },
                    'article' : {
                        block : 'article', 
                        wrapper: true, 
                        merge_siblings: false
                    },
                    'hroup' : {
                        block : 'hgroup', 
                        wrapper: true
                    },
                    'aside' : {
                        block : 'aside', 
                        wrapper: true
                    },
                    'figure' : {
                        block : 'figure', 
                        wrapper: true
                    },
                    'dl' : {
                        block : 'dl', 
                        wrapper: true
                    }
                },
                indent_before   : indent,
                indent_after    : indent
            }, settings);

            if(this.settings) {
                try {
                    if(this.settings.compress.css) {
                        tinymce.extend(this.settings, {
                            content_css : false,
                            editor_css : false
                        });
                    }

                    // mark javascript files loaded
                    if(this.settings.compress.javascript) {
                        this._markLoaded();
                    }
                    // load editor
                    WFEditor.load();
                } catch (e) {
                //alert('Unable to initialize TinyMCE : ' + e);
                }
            }
        },
        _markLoaded : function() {
            var self = this, s = this.settings, each = tinymce.each, ln = s.language.split(',');

            var suffix = s.suffix || '';

            function load(u) {
                tinymce.ScriptLoader.markDone(tinyMCE.baseURI.toAbsolute(u));
            }

            // Add core languages
            each(ln, function(c) {
                if(c) {
                    load('langs/' + c + '.js');
                }
            });
            // Add themes with languages
            each(s.theme.split(','), function(n) {
                if(n) {
                    load('themes/' + n + '/editor_template' + suffix + '.js');

                    each(ln, function(c) {
                        if(c) {
                            load('themes/' + n + '/langs/' + c + '.js');
                        }
                    });
                }
            });
            // Add plugins with languages
            each(s.plugins.split(','), function(n) {
                if(n) {
                    load('plugins/' + n + '/editor_plugin' + suffix + '.js');

                    each(ln, function(c) {
                        if(c) {
                            load('plugins/' + n + '/langs/' + c + '.js');
                        }
                    });
                }
            });
        },
        setBookmark : function(ed) {
            var self = this, DOM = tinymce.DOM, Event = tinymce.dom.Event;

            function isHidden(ed) {
                return ed.isHidden() || DOM.getStyle(ed.id + '_ifr', 'visibility') == 'hidden';
            }

            function isEditor(el) {
                return DOM.getParent(el, 'div.mceEditor, div.mceSplitButtonMenu, div.mceListBoxMenu, div.mceDropDown');
            }


            Event.add(document.body, 'mousedown', function(e) {
                var el = e.target;

                if(isEditor(el)) {
                    return;
                }

                if(!isHidden(ed) && ed.selection) {
                    var n = ed.selection.getNode();

                    if(DOM.getParent(n, 'body#tinymce')) {
                        ed.lastSelectionBookmark = ed.selection.getBookmark(1);
                    }
                }
            });
        },
        load : function() {
            var self = this, Event = tinymce.dom.Event, loaded;

            var s = this.settings;

            // setup editor before init
            tinyMCE.onAddEditor.add(function(mgr, ed) {               
                
                // load packer css
                if(s.compress.css) {
                    ed.onPreInit.add(function() {                    
                        ed.dom.loadCSS(s.site_url + 'index.php?option=com_jce&view=editor&layout=editor&task=pack&type=css&context=content&component_id=' + s.component_id + '&' + s.token + '=1');
                    }); 
                }

                WFEditor.hideLoader(ed.getElement());

                self.setBookmark(ed);

                // form submit trigger
                ed.onInit.add(function() {
                    ed.onSubmit.addToTop(function() {                        
                        if(ed.initialized && !ed.isHidden()) {
                            ed.save();
                            ed.isNotDirty = 1;
                        }
                    });
                });

                // Form submit patch
                ed.onBeforeRenderUI.add(function() {     
                    var n = ed.getElement().form;

                    if(!n || n._mceOldSubmit) {
                        return;
                    }

                    // Check page uses id="submit" or name="submit" for it's submit button
                    if(!n.submit.nodeType && !n.submit.length) {
                        ed.formElement = n;
                        n._mceOldSubmit = n.submit;
                        n.submit = function() {
                               
                            // Save all instances
                            tinymce.each(tinymce.editors, function(e) {                                
                                if(e.initialized && !e.isHidden()) {
                                    e.save();
                                }
                            });

                            ed.isNotDirty = 1;

                            return ed.formElement._mceOldSubmit(ed.formElement);
                        };
                    }
                    n = null;
                });
                
                // indent
                ed.onSaveContent.add(function(ed, o) {
                    o.content = self.indent(o.content);
                });
            });
                       
            function _load() {
                if(!loaded) {
                    // set loaded flag
                    loaded = true;
                    // create editor
                    return self.create();
                }
            }

            // load editor when page fully loaded
            Event.add(window, 'load', function() {
                _load();
            });
            // wait until dom is ready with delay
            Event.add(document, 'init', function() {
                window.setTimeout(function() {
                    _load();
                }, 1000);
            });
        },
        /**
		 * Create Editors
		 */
        create : function(elements) {
            var self = this, Event = tinymce.dom.Event, s = this.settings;

            WFEditor.showLoader();

            if(elements) {
                s.mode = 'exact';
                s.elements = elements;
            }

            try {
                // only create toggle for advanced theme
                if(s.theme == 'advanced' && ( typeof s.toggle == 'undefined' ? 1 : s.toggle)) {
                    this._createToggle(elements);
                }

                tinyMCE.init(s);

            } catch (e) {
                alert(e);
            }
        },
        _createToggle : function(elements) {
            var self = this, DOM = tinymce.DOM, Event = tinymce.dom.Event, s = this.settings;

            function getVar(s, dv) {
                return ( typeof s == 'undefined' || s === null) ? dv : s;
            }

            var use_cookies = getVar(s.use_cookies, true);
            elements = elements || DOM.select('.wfEditor');

            tinymce.each(elements, function(el) {
                var state = getVar(s.toggle_state, 1);
                // get cookie
                var cookie = getVar(tinymce.util.Cookie.get('wf_editor_' + el.id + '_state'), 1);
                var label = getVar(s.toggle_label, '[Toggle Editor]');

                var div = DOM.create('span', {
                    'role' : 'button',
                    'class' : 'wf_editor_toggle',
                    'aria-labelledby' : 'wf_editor_' + el.id + '_toggle'
                }, '<span id="wf_editor_' + el.id + '_toggle">' + label + '</span>');

                DOM.setStyle(div, 'cursor', 'pointer');
                el.parentNode.insertBefore(div, el);

                Event.add(div, 'click', function(e) {
                    self.toggle(el, use_cookies);
                });
                if(!state) {
                    DOM.removeClass(el, 'wfEditor');
                    DOM.addClass(el, 'wfNoEditor');
                    self._wrapText(el, true);
                } else {
                    if(parseInt(cookie) == 0) {
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
        toggle : function(el, use_cookies) {
            var self = this, ed = tinyMCE.get(el.id), DOM = tinymce.DOM;

            // turn it on
            if(!ed) {
                if(use_cookies) {
                    tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', 1);
                }
                
                DOM.removeClass(el, 'wfNoEditor');
                DOM.addClass(el, 'wfEditor');

                //el.className = 'wfEditor';

                tinyMCE.execCommand('mceAddEditor', 0, el.id);
            } else {
                self._wrapText(ed.getElement(), true);

                if(ed.isHidden()) {
                    if(use_cookies) {
                        tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', 1);
                    }
                    
                    DOM.removeClass(el, 'wfNoEditor');
                    DOM.addClass(el, 'wfEditor');

                    ed.load();
                    ed.show();
                } else {
                    if(use_cookies) {
                        tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', 0);
                    }
                    DOM.removeClass(el, 'wfEditor');
                    DOM.addClass(el, 'wfNoEditor');

                    ed.save({
                        no_events : false
                    });
                    ed.hide();
                }
            }
        },
        _wrapText : function(el, s) {
            var v, n;

            el.setAttribute("wrap", s);

            if(!tinymce.isIE) {
                v = el.value;
                n = el.cloneNode(false);
                n.setAttribute("wrap", s);
                el.parentNode.replaceChild(n, el);
                n.value = v;
            }
        },
        showLoader : function(el) {
            tinymce.DOM.addClass('.wfEditor', 'loading');
        },
        hideLoader : function(el) {
            tinymce.DOM.removeClass(el, 'loading');
        },
        /**
		 * Set the editor content
		 * @param {String} id The editor id
		 * @param {String} html The html content to set
		 */
        setContent : function(id, html) {
            var ed = tinyMCE.get(id);

            if(ed) {
                ed.setContent(html);
            } else {
                document.getElementById(id).value = html;
            }
        },
        /**
		 * Get the editor content
		 * @param {String} id The editor id
		 */
        getContent : function(id) {
            var ed = tinyMCE.get(id);

            // pass content to textarea and return
            if(ed && !ed.isHidden()) {
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
        insert : function(el, v) {
            var ed;
            if( typeof el == 'string') {
                el = document.getElementById(el);
            }
            if(/wfEditor/.test(el.className)) {
                ed = tinyMCE.get(el.id);
                if(window.parent.tinymce) {
                    var ed = window.parent.tinyMCE.get(el.id);

                    if(ed && ed.lastSelectionBookmark) {
                        ed.selection.moveToBookmark(ed.lastSelectionBookmark);
                    }
                }
                ed.execCommand('mceInsertContent', false, v);
            } else {
                this.insertIntoTextarea(el, v);
            }
        },
        insertIntoTextarea : function(el, v) {
            // IE
            if(document.selection) {
                el.focus();
                var s = document.selection.createRange();
                s.text = v;
            // Mozilla / Netscape
            } else {
                if(el.selectionStart || el.selectionStart == '0') {
                    var startPos = el.selectionStart;
                    var endPos = el.selectionEnd;
                    el.value = el.value.substring(0, startPos) + v + el.value.substring(endPos, el.value.length);
                // Other
                } else {
                    el.value += v;
                }
            }
        },
        convertURL : function(url, elm, save, name) {
            var ed = tinymce.EditorManager.activeEditor, s = tinymce.settings, base = s.document_base_url;

            if(!url)
                return url;

            // Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
            if(!s.convert_urls || (elm && elm.nodeName == 'LINK') || url.indexOf('file:') === 0)
                return url;

            if(url == base || url == base.substring(0, base.length - 1) || url.charAt(0) == '/') {
                return url;
            }

            // Convert to relative
            if(s.relative_urls)
                return ed.documentBaseURI.toRelative(url);

            // Convert to absolute
            url = ed.documentBaseURI.toAbsolute(url, s.remove_script_host);

            return url;
        },
        
        indent : function(h) {
            // simple indentation
            h = h.replace(/\n+/g, '\n');

            return tinymce.trim(h);
        }
    };
    window.WFEditor = WFEditor;
}());

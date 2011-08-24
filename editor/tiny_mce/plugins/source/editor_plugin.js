/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
    var each = tinymce.each;

    tinymce.create('tinymce.plugins.Source', {
        init : function(ed, url) {
            var self = this, DOM = tinymce.DOM;

            this.editor = ed; 
            this.url = url;
            this.settings = tinymce.settings;

            this.active = [];

            // add command
            ed.addCommand('mceSource', function() {
                self.toggleSource();
            });

            // set default state
            this.state = false;

            // set button states
            this.highlight 	= ed.getParam('source_higlight', 1);
            this.numbers 	= ed.getParam('source_numbers', 1);
            this.wrap 		= ed.getParam('source_wrap', 1);
            
            this.invisibles = false;

            // add context menu blocker
            if (ed.onContextMenu) {
                cMenu = ed.onContextMenu.addToTop( function(ed, e) {
                    if (ed.plugins.source.state) {
                        return false;
                    }
                });

            }

            // Patch in Commands
            ed.onBeforeExecCommand.add( function(ed, cmd, ui, val, o) {
                var cm = ed.controlManager, se = self.getEditor();

                if (self.state && se) {
                    switch(cmd) {
                    	case 'Undo':
	                    	o.terminate = true;
	                        se.undo();
	                        cm.setDisabled('redo', false);
	                        return true;
                    		break;
                    	case 'Redo':
                    	 	o.terminate = true;
                        	se.redo();
                        	cm.setDisabled('redo', true);
                        	return true;
                    		break;
                    	case 'mcePrint':
                    		o.terminate = true;
                        	return self.printSource();
                    		break;
                    }
                }
            });

            ed.onLoadContent.add( function(ed, o) {
                if (self.getState()) {
                	self._disable();
                    self.setContent();                   
                }
            });
            
            ed.onSetContent.add(function(ed, o) {
            	if (self.getState()) {
                    self.setContent(); 
                    self._disable();                 
               }
            });

            ed.onSaveContent.add( function(ed, o) {
                if (self.getState()) {
                    o.content = self.getContent();
                }
            });

            ed.onExecCommand.add( function(ed, cmd, ui, v, o) {

                switch (cmd) {
                    case 'mceCodeEditor':
                    case 'mceSource' :
                        self._disable();

                        break;
                    case 'mceFullScreen' :
                        if (self.getState()) {
                            self._disable();

                            var fs = ed.plugins.fullscreen;
                            var w = fs.getWidth(), h = fs.getHeight();
                            self.resize(w, h);
                        }
                        break;
                    case 'mceInsertContent' :
                        if (self.getState()) {
                            o.terminate = true;

                            self._disable();

                            self.insertContent(v);
                        }
                        break;
                }
            });

            ed.addButton('source', {
                title : 'source.source_desc',
                cmd : 'mceSource'
            });

            ed.addButton('wrap', {
                title : 'source.wrap_desc',
                onclick : function() {
                    self.setWrap(!self.wrap);
                    return true;
                }

            });

            ed.addButton('highlight', {
                title : 'source.highlight_desc',
                onclick : function() {
                    self.setHighlight(!self.highlight);
                    return true;
                }

            });

            ed.addButton('numbers', {
                title : 'source.numbers_desc',
                onclick : function() {
                    self.setNumbers(!self.numbers);
                    return true;
                }

            });

            ed.onNodeChange.add( function(ed, cm, n) {
                var s = self.getState();
                
                if (s) {
                	self._disable();
                }
                
                each(['wrap', 'highlight', 'numbers'], function(e) {
                	cm.setDisabled(e, !s);
            	});
            });

            // add theme resize
            ed.theme.onResize.add( function() {
                self.resize();
            });

        },
        
        _disable : function() {
        	var self = this;
        	window.setTimeout( function() {
				self.toggleDisabled();
            }, 0);
        },
        
        getWin : function() {
        	var ed = this.editor, f = tinymce.DOM.get('wf_'+ ed.id +'_source_iframe');
        	
        	if (f) {
        		return f.contentWindow;
        	}
        	
        	return false;	
        },
        
        getDoc : function() {
        	var w = this.getWin();
        	
        	if (w) {
        		return w.document;
        	}
        	
        	return false;
        },
        
        getContainer : function() {
        	var se = this.getEditor();
        	
        	if (se) {
        		return se.getContainer();
        	}
        	
        	return null;
        },
        
        getEditor : function() {
        	var win = this.getWin();
        	
        	if (win) {
        		return win.SourceEditor || null;
        	}
        	
        	return null;
        },

        getState : function() {
            return this.state;
        },

        setState : function(s) {
            this.state = s;
        },

        getTop : function() {
            var ed = this.editor, container = ed.getContentAreaContainer();
            return container.offsetTop + Math.round((container.offsetHeight - container.clientHeight) / 2);
        },

        printSource : function() {
            var self = this, ed = this.editor, DOM = tinymce.DOM, content = '';
            var iframe = DOM.get(ed.id + '_ifr'), print = DOM.get(ed.id + '_source_print');

            if (se) {
                if (!print) {
                    var print = DOM.create('iframe', {
                        src : 'javascript:""',
                        id	: ed.id + '_source_print',
                        style : {
                            position : 'absolute',
                            top		 : this.getTop()
                        }
                    });

                    print.style.visibility = 'hidden';

                    var parent = iframe.parentNode;
                    parent.insertBefore(print, iframe);
                }
                var doc 	 = print.contentWindow.document;
                content  	+= ed.settings.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';
                content 	+= '<meta http-equiv="X-UA-Compatible" content="IE=edge" />';
                content 	+= '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

                var theme 	= this.highlight ? 'textmate' : '';

                each(['editor', theme], function(s) {
                    if (s) {
                        content += '<link type="text/css" rel="stylesheet" href="' + self.url + '/css/ace/' + s + '.css" />';
                    }
                });

                content += '</head><body><div style="position:relative;"><div class="' + ACE.renderer.getContainerElement().className + '">' + DOM.getOuterHTML(DOM.select('div.ace_layer.ace_text-layer', ACE.renderer.getContainerElement())[0]) + '</div></div></body></html>';

                doc.open();
                doc.write(content);
                doc.close();
            }

            print.contentWindow.print();
        },
        
        reInit : function() {
        	this.toggleDisabled(), se = this.getEditor();
        	
        	if (this.getState() && se) {
        		se.focus();
        	}
        },

        setContent : function(v) {
            var ed = this.editor, DOM = tinymce.DOM, se = this.getEditor();

            if (typeof v == 'undefined') {
                v = ed.getContent();
            }

            if (se) {                
                // decode and indent
                v = this.indent(v);
                
                se.setContent(v);
            }
        },
        
        insertContent : function(v) {
        	var ed = this.editor, DOM = tinymce.DOM, se = this.getEditor();
        	
        	if (se) {                
                // decode and indent
                v = this.indent(DOM.decode(v));
                
                se.insertContent(v);
            }
        },

        getContent : function() {
            var ed = this.editor, DOM = tinymce.DOM, se = this.getEditor();

            if (se) {
                return se.getContent();
            }
        },

        resize : function(w, h) {
            if (!this.state)
                return;

            var self = this, ed = this.editor, DOM = tinymce.DOM, ifr = DOM.get(ed.id + '_ifr'), se = this.getEditor();

            w = parseFloat(w) || ifr.clientWidth;
            h = parseFloat(h) || ifr.clientHeight;

            if (se) {
                DOM.setStyles('wf_' + ed.id + '_source_iframe', {
                    'width' 	: w,
                    'height' 	: h
                });
                
                DOM.setStyles(this.getContainer(), {
                    'width' 	: w,
                    'height' 	: h
                });

                se.resize(w, h);
            }
        },

        /**
         * Disables all buttons except Source
         */
        toggleDisabled : function() {
            var self = this, ed = this.editor, DOM = tinymce.DOM, cm = ed.controlManager;

            var state 	= this.getState();
            // store active buttons
            var active 	= DOM.select('.mceButtonActive', DOM.get(ed.id + '_toolbargroup'));

            if (!state) {
                // remove print iframe
                var print = DOM.get(ed.id + '_source_print');
                
                if (print) {
                	DOM.remove(print);
                }

                // set all source buttons inactive
                each(['wrap', 'highlight', 'numbers'], function(e) {
                    cm.setActive(e, false);
                });

            }

            each (active, function(n) {
                cm.setActive(n.id, !state);
            });

            each(DOM.select('.mceButton, .mceListBox, .mceSplitButton', DOM.get(ed.id + '_toolbargroup')), function(n) {
                cm.setDisabled(n.id, state);
            });

            cm.setActive('source', state);
            cm.setActive('fullscreen', DOM.hasClass(ed.getContainer(), 'fullscreen'));

            cm.setDisabled('source', false);
            cm.setDisabled('fullscreen', false);
            //cm.setDisabled('undo', false);
            //cm.setDisabled('redo', false);
            
            //cm.setDisabled('print', false);

            each(['wrap', 'highlight', 'numbers'], function(e) {
                cm.setDisabled(e, !state);
            });

        },

        toggleSource : function() {
            var self = this, ed = this.editor, DOM = tinymce.DOM, cm = ed.controlManager, textarea, cMenu;
            var se = this.getEditor();

            var state = this.getState();

            // editor iframe
            var iframe 		= DOM.get(ed.id + '_ifr');
            // main textarea
            var element		= ed.getElement();

            // set the state
            this.setState(!state);
            
            if (tinymce.isIE) {
            	DOM.setStyle(iframe.parentNode, 'position', 'relative');
            }
            
            // Path
            var editorpath 	= DOM.get(ed.id + '_path_row');
            // Word Count
            var wordcount 	= DOM.get(ed.id + '-word-count');

            if (!state) {
                var w = parseFloat(iframe.clientWidth);
                var h = parseFloat(iframe.clientHeight);

                // hide Path
                if (editorpath) {
                	DOM.hide(editorpath);
                } 
                // hide word count
                if (wordcount) {
                	DOM.hide(wordcount.parentNode);
                }
 
                // hide iframe
                DOM.setStyle(iframe, 'visiblity', 'hidden');
                DOM.setAttrib(iframe, 'aria-hidden', true);
                
                window.setTimeout(function() {
                	self.setHighlight(self.highlight);
                }, 5);
            } else {
                if (se) {
                    // pass content
                    ed.setContent(self.getContent());
                    
                    DOM.hide('wf_' + ed.id + '_source_container');
                    DOM.setAttrib('wf_' + ed.id + '_source_container', 'aria-hidden', true);
                }

                // show iframe
                DOM.setStyle(iframe, 'visiblity', 'visible');
                iframe.removeAttribute('aria-hidden');
                
                // show Path                
                if (editorpath) {
                	DOM.show(editorpath);
                } 
                // show word count                
                if (wordcount) {
                	DOM.show(wordcount.parentNode);
                }
                
                cm.setActive('highlight', false);
            	cm.setActive('numbers', false);
            	cm.setActive('wrap', false);

                // focus editor
                ed.focus();

                ed.setProgressState(false);
            }
        },

        loadEditor : function() {
            var self = this, ed = this.editor, cm = ed.controlManager, url = this.url, DOM = tinymce.DOM, iframe = DOM.get(ed.id + '_ifr');
			var w = iframe.clientWidth, h = iframe.clientHeight;

            // create the container
            var container = DOM.create('div', {
                role	: 'textbox',
                style 	: {
                    position : 'absolute',
                    top		 : tinymce.isIE ? 0 : this.getTop()
                },
                id		: 'wf_' + ed.id + '_source_container',
                'class' : 'WFSourceEditor'
            });

            var parent = iframe.parentNode;
            DOM.insertAfter(container, iframe);

            var query 	= ed.getParam('site_url') + 'index.php?option=com_jce';
            
            var args 	= {
                'view' 		: 'editor',
                'layout'	: 'plugin',
                'plugin'	: 'source'
            };

            // set token
			args[ed.settings.token] = 1;

            // create query
            for (k in args) {
                query += '&' + k + '=' + encodeURIComponent(args[k]);
            }
            
            var iframe = DOM.create('iframe', {
            	'frameborder' 	: 0,
            	'scrolling'		: 'no',
            	'id'			: 'wf_'+ ed.id +'_source_iframe',
            	'src'			: query,
            	'style'			: {
            		'width' : w,
            		'height': h 
            	}
            });
            
            tinymce.dom.Event.add(iframe, 'load', function() {
            	var editor = self.getEditor();
            	
            	var v = ed.getContent();

            	editor.init({
            		'url'		: ed.getParam('site_url'),
            		'token'		: ed.settings.token,
            		'wrap' 		: self.wrap,
            		'numbers'	: self.numbers,
            		'highlight'	: self.highlight,
            		'width'		: w,
            		'height'	: h,
            		'theme' 	: ed.getParam('source_theme', 'textmate'),
            		'load'		: function() {
            			ed.setProgressState(false);
            			
            			if (tinymce.isIE && !document.querySelector) {
            				ed.hide();
            				ed.show();
            			}
            			
            			cm.setActive('highlight', self.highlight);
            			cm.setActive('numbers', self.numbers);
            			cm.setActive('wrap', self.wrap);          			
            		},
            		change : function() {
            			ed.controlManager.setDisabled('undo', false);
            		}
            	}, self.indent(v));
            });
            
            DOM.add(container, iframe);
        },

        /**
         * Simple HTML Indentation
         * @param {String} h HTML string to indent
         */
        indent : function(h) {
            // simple indentation
            h = h.replace(/<(\/?)(ul|hr|table|meta|link|tbody|tr|object|audio|video|body|head|html|map)(|[^>]+)>\s*/g, '\n<$1$2$3>\n');
            h = h.replace(/\s*<(p|h[1-6]|blockquote|div|title|style|pre|script|td|li|area|param|source)(|[^>]+)>/g, '\n<$1$2>');
            h = h.replace(/<\/(p|h[1-6]|blockquote|div|title|style|pre|script|td|li)>\s*/g, '</$1>\n');
            h = h.replace(/\n\n/g, '\n');

            // indent conditional comments
            h = h.replace(/<!--\[if([^\]]*)\]>(<!)?-->/gi, '\n<!--[if$1]>$2-->');
            h = h.replace(/<!(--<!)?\[endif\](--)?>/gi, '<!$1[endif]$2>\n');

            return tinymce.trim(h);
        },

        /**
         * Toggle Syntax Highlighting editor
         * Will create / show / hide the textarea source editor or ACE editor
         */
        setHighlight : function(s) {
            var ed = this.editor, DOM = tinymce.DOM, v, n, cm = ed.controlManager, se = this.getEditor();

            cm.setActive('highlight', !!s);

            if (se) {            	
                se.setHighlight(s);

                this.setContent();
                
                se.indent();
                
                DOM.show('wf_' + ed.id + '_source_container');
                DOM.setAttrib('wf_' + ed.id + '_source_container', 'aria-hidden', false);
                
                this.resize();

            	this.setNumbers(this.numbers);
            	this.setWrap(this.wrap);

            	ed.focus();

                ed.setProgressState(false);
            } else {
                ed.setProgressState(true);
                this.loadEditor();
            }

            this.highlight = !!s;
        },

        /**
         * Set CodeMirror / Textarea word wrapping
         * @param {Object} el Textarea element
         * @param {Boolean} s State
         */
        setWrap: function(s) {
            var ed = this.editor, DOM = tinymce.DOM, v, n, se = this.getEditor();

            var cm = ed.controlManager;

            this.wrap = !!s;

            cm.setActive('wrap', this.wrap);

            if (se) {
                se.setWrap(s);
            }

        },

        setNumbers : function(s) {
            var cm = this.editor.controlManager, se = this.getEditor();

            this.numbers = !!s;

            cm.setActive('numbers', this.numbers);

            if (se) {
                return se.setNumbers(this.numbers);
            }

        },

        getInfo : function() {
            return {
                longname : 'Source',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }

    });

    // Register plugin
    tinymce.PluginManager.add('source', tinymce.plugins.Source);
})();
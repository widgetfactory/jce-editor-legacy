(function() {
    var DOM = tinymce.DOM, Event = tinymce.dom.Event, ed = tinyMCEPopup.editor;   
    var writer = new tinymce.html.Writer(ed.settings), parser = new tinymce.html.SaxParser(writer, ed.schema);
    
    /* Source Editor Class
     * Depends on codemirror.js with modes (css, javascript, htmlmixed, xml, php, clike) and utilities (search, searchcursor, matchbrackets, closebrackets, match-highlighter, closetag, mark-selection, active-line) 
     */
    
    var SourceEditor = {
        
        options : {
            format  : true,
            width   : '100%',
            height  : '100%',
            theme   : 'textmate',
            load    : function(){},
            change  : function(){}
        },

        init : function(options, content, selection) {
            var self = this;

            if(Event.domLoaded) {                
                tinymce.extend(this.options, options);
                
                this.container = DOM.add(document.body, 'div', {
                    'style' : {
                        width   : this.options.width,
                        height  : this.options.height
                    },
                    'id' : 'source-container'
                });
                
                this._createToolbar();
                
                // format content
                if (this.options.format) {
                    content = this._format(content);
                }

                // load editor
                this._load(content, selection);                
            // keep trying...
            } else {
                Event.add(document, 'init', function() {
                    self.init(options, content, selection);
                });
            }
        },
        
        _createToolbar : function() {            
            var self = this, o = this.options, doc = document;
            
            this.toolbar = DOM.add(this.container, 'div', {
                id : 'source-toolbar'
            });
            
            tinymce.each(['highlight', 'linenumbers', 'wrap'], function(s) {
                var n = DOM.add(self.toolbar, 'span', {
                    'class' : 'button source_' + s,
                    'title' : ed.getLang('source.' + s, s)
                });
                
                // create function
                var func = self[s];
                
                if (o[s]) {
                    DOM.addClass(n, 'active');
                }
                
                Event.add(n, 'click', function() {
                    func.call(self, !DOM.hasClass(n, 'active'));
                    
                    if (DOM.hasClass(n, 'active')) {
                        DOM.removeClass(n, 'active');
                    } else {
                        DOM.addClass(n, 'active');
                    }
                });
            });
            
            var format = DOM.add(self.toolbar, 'span', {
                'class' : 'button source_format',
                'title' : ed.getLang('source.format', 'Format')
            });
                
            Event.add(format, 'click', function() {
                self.format();
            });
            
            var search = DOM.add(this.toolbar, 'span', {
                'class' : 'source_search_container'
            });
            
            // search / replace
            tinymce.each(['search', 'replace'], function(s) {
                var input   = DOM.add(search, 'input', {
                    id      : 'source_' + s + '_value',
                    type    : 'text',
                    'placeholder' : ed.getLang('source.' + s, s)
                });
                var btn     = DOM.add(search, 'span', {
                    'class' : 'button source_' + s, 
                    'title' : ed.getLang('source.' + s, s)
                });
                
                var func = self[s];
                
                Event.add(input, 'change', function() {
                    if (input.value === '') {
                        self.clearSearch();
                    }
                });

                Event.add(btn, 'click', function() {                                        
                    var f = doc.getElementById('source_search_value').value, r;
                
                    // replace
                    if (s == 'replace') {
                        r = doc.getElementById('source_replace_value').value;
                        return func.call(self, f, r, true, doc.getElementById('source_search_regex').checked);
                    }
                    // search
                    func.call(self, f, false, doc.getElementById('source_search_regex').checked);
                });
                
                var k = (s == 'search') ? 'prev' : 'all';
                
                var btn2 = DOM.add(search, 'span', {
                    'class' : 'button source_' + s + '_' + k, 
                    'title' : ed.getLang('source.' + s + '_' + k, s + ' ' + k)
                });
                
                Event.add(btn2, 'click', function() {
                    var f = doc.getElementById('source_search_value').value, r;
                
                    // replace
                    if (s == 'replace') {
                        r = doc.getElementById('source_replace_value').value;
                        
                        return func.call(self, f, r, true, doc.getElementById('source_search_regex').checked);
                    }
                    // search
                    return func.call(self, f, true, doc.getElementById('source_search_regex').checked);
                });
            });
            
            // regex checkbox
            DOM.add(search, 'input', {
                'id'    : 'source_search_regex',
                'type'  : 'checkbox'
            });
            
            // regex label
            DOM.add(search, 'label', {
                'for' : 'source_search_regex'
            }, ed.getLang('source.regex', 'Regular Expression'));
        },
        
        _format : function(html, validate) {
            if (validate) {
                // parse content
                parser.parse(html);
            }
            
            // format
            return this.formatHTML(html);
        },
        
        _load : function(content, selection) {
            var self = this, cm, o = this.options;

            if(window.CodeMirror) {
                
                if (o.theme == 'codemirror') {
                    o.theme = 'default';
                }
                
                var settings = {
                    mode    : "text/html",
                    theme   : o.theme,
                    indentWithTabs : true,
                    smartIndent : true,
                    tabMode: "indent",
                    styleActiveLine: !!o.selection_match,
                    highlightSelectionMatches: !!o.selection_match,
                    autoCloseTags: !!o.tag_closing
                };

                /*if (o.tag_closing) {
                    tinymce.extend(settings, {
                        autoCloseTags: true
                    });
                }*/
                                
                cm = CodeMirror(this.container, settings);
                
                // onchange
                cm.on('change', function() {
                    o.change.call();
                });

                // line highlight and selection matching
                /*if (o.selection_match) {
                    // line highlight
                    var marked = cm.addLineClass(0, "background", "activeline");
                    
                    cm.on('cursorActivity', function() {
                        cm.matchHighlight("CodeMirror-matchhighlight");
                            
                        var cur = cm.getLineHandle(cm.getCursor().line);
                        if (cur != marked) {
                            cm.removeLineClass(marked, "background", "activeline");
                            marked = cm.addLineClass(cur, "background", "activeline");
                        }
                            
                    });
                }*/
                
                // line wrapping
                cm.setWrap = function(s) {
                    cm.setOption('lineWrapping', s);
                    
                    cm.focus();
                };

                // gutter
                cm.showGutter = function(s) {
                    cm.setOption('lineNumbers', s);
                    
                    cm.focus();
                };
                
                // syntax highlighting
                cm.highlight = function(s) {
                    var c = cm.getCursor();

                    if(s) {
                        cm.setOption('mode', 'text/html');
                    } else {
                        cm.setOption('mode', 'text/plain');
                    }

                    cm.setCursor(c);
                    
                    cm.focus();
                };
                
                // resize editor
                cm.resize = function(w, h, init) {
                    var scroller = cm.getScrollerElement();
                    
                    // only if drag resize
                    if (!init) {
                        h = h - self.toolbar.offsetHeight;
                    }

                    DOM.setStyles(scroller, {
                        height  : h
                    });
                };

                cm.showInvisibles = function(s) {
                };

                cm.setContent = function(v) {
                    if(v === '') {
                        v = '\u00a0';
                    }
                    cm.setValue(v);
                    cm.focus();
                };

                cm.insertContent = function(v) {
                    return cm.replaceSelection(v);
                };

                cm.getContent = function() {
                    return cm.getValue();
                };
                
                cm.getSearchState = function() {
                    function SearchState() {
                        this.posFrom = this.posTo = this.query = null;
                        this.marked = [];
                    }
                    
                    return cm._searchState || (cm._searchState = new SearchState());
                };
                
                cm.clearSearch = function() {                    
                    cm.operation(function() {
                        var state = cm.getSearchState(cm);
                        if (!state.query) return;
                        state.query = null;
                        for (var i = 0; i < state.marked.length; ++i) state.marked[i].clear();
                        state.marked.length = 0;
                    })
                };
                
                cm.search = function(query, rev, re) {
                    // create regex
                    if (re) {
                        query = new RegExp(query);
                    }

                    function doSearch(cm, rev, query) {
                        var state = cm.getSearchState(cm);
                        if (state.query) return findNext(cm, rev);

                        cm.operation(function() {
                            if (!query || state.query) return;
                            state.query = query;
                            
                            if (cm.lineCount() < 2000) { // This is too expensive on big documents.
                                for (var cursor = cm.getSearchCursor(query); cursor.findNext();) {
                                    state.marked.push(cm.markText(cursor.from(), cursor.to(), "CodeMirror-searching"));
                                }     
                            }

                            state.posFrom = state.posTo = cm.getCursor();
                            findNext(cm, rev);
                        });

                    }
                    function findNext(cm, rev) {
                        cm.operation(function() {
                            var state = cm.getSearchState(cm);
                            var cursor = cm.getSearchCursor(state.query, rev ? state.posFrom : state.posTo);
                            if (!cursor.find(rev)) {
                                cursor = cm.getSearchCursor(state.query, rev ? {
                                    line: cm.lineCount() - 1
                                } : {
                                    line: 0, 
                                    ch: 0
                                });
                                if (!cursor.find(rev)) return;
                            }
                            cm.setSelection(cursor.from(), cursor.to());
                            state.posFrom = cursor.from();
                            state.posTo = cursor.to();
                            
                            var pos = cm.charCoords(state.posFrom, 'local');
                            
                            cm.scrollTo(pos.x, pos.y);
                        })
                    }

                    doSearch(cm, rev, query);
                };
                
                cm.replace = function(query, text, all, re) {
                    var self = this;
                    
                    // create regex
                    if (re) {
                        query = new RegExp(query);
                    }
                    
                    if (all) {
                        cm.operation(function() {
                            for (var cursor = cm.getSearchCursor(query); cursor.findNext();) {
                                if (typeof query != "string") {
                                    var match = cm.getRange(cursor.from(), cursor.to()).match(query);
                                    cursor.replace(text.replace(/\$(\d)/, function(w, i) {
                                        return match[i];
                                    }));
                                } else cursor.replace(text);
                            }
                        });
                    } else {
                        cm.clearSearch();
                        
                        var cursor = cm.getSearchCursor(query, cm.getCursor());
                        
                        function advance() {
                            var start = cursor.from(), match;                            
                            if (!(match = cursor.findNext())) {
                                cursor = cm.getSearchCursor(query);
                                if (!start || !(match = cursor.findNext()) || (cursor.from().line == start.line && cursor.from().ch == start.ch)) {
                                    cm.focus();
                                    return false;
                                }
                            }
                            cm.setSelection(cursor.from(), cursor.to());

                            doReplace(match);
                            cm.setCursor(cursor.to());
                            
                            var pos = cm.charCoords(cursor.to(), 'local');
                            
                            cm.scrollTo(pos.x, pos.y);
                            
                            cm.focus();
                        }
                        
                        function doReplace(match) {                            
                            cursor.replace(typeof query == "string" ? text : text.replace(/\$(\d)/, function(w, i) {
                                return match[i];
                            }));
                        }
                        
                        advance();
                    }
                };
                
                cm.format = function() {
                    CodeMirror.commands["selectAll"](cm);
      
                    function getSelectedRange() {
                        return {
                            from: cm.getCursor(true), 
                            to  : cm.getCursor(false)
                        };
                    }

                    var range = getSelectedRange();
                    cm.autoFormatRange(range.from, range.to);
                };

                this.editor = cm;
                this._loaded(content);
                
                if (selection) {
                    cm.search(selection);
                }
                
                cm.refresh();
                
                /*window.setTimeout(function() {
                    var scroller = cm.getScrollerElement(), h = cm.getScrollerElement().offsetHeight - self.toolbar.offsetHeight;
                    DOM.setStyle(scroller, 'height', h);
                    DOM.setStyle(scroller.previoussibling, 'height', h);
                }, 10);*/
            }
        },
        _loaded : function(content) {
            var o = this.options;
            
            this.setContent(content);

            // set word wrap
            this.wrap(!!o.wrap);
            // set line numbers / gutter
            this.linenumbers(!!o.linenumbers);

            // callback
            o.load.call();
            
            // focus
            this.focus();
        },
        
        search : function(find, rev, re) {
            return this.editor.search(find, rev, re);
        },
        
        replace : function(find, replace, all, re) {
            return this.editor.replace(find, replace, all, re);
        },
        
        clearSearch : function() {
            return this.editor.clearSearch();
        },
        
        getSelection : function() {
            return this.editor.getSelection();
        },
        
        wrap : function(s) {
            return this.editor.setWrap(s);
        },
        linenumbers : function(s) {
            return this.editor.showGutter(s);
        },
        highlight : function(s) {
            return this.editor.highlight(s);
        },
        setContent : function(v, format) {
            if (format) {
                v = this._format(v);
            }
            
            return this.editor.setContent(v);
        },
        insertContent : function(v) {
            return this.editor.insertContent(v);
        },
        getContent : function() {
            return this.editor.getContent();
        },
        showInvisibles : function(s) {
            return this.editor.showInvisibles(s);
        },
        resize : function(w, h, init) {
            return this.editor.resize(w, h, init);
        },
        focus : function() {
            return this.editor.focus();
        },
        undo : function() {
            this.editor.undo();
            
            this.focus();
        },
        redo : function() {
            this.editor.redo();
            
            this.focus();
        },
        indent : function() {},
        getContainer : function() {
            return this.container || null;
        },
        format : function() {
            // get content
            var html = this.getContent();
            // format with cleanup
            html = this._format(html);
            // set content
            this.setContent(html);
        }
    };

    window.SourceEditor = SourceEditor;
}());
(function() {
    var tinymce = window.parent.tinymce, DOM = tinymce.DOM, Event = tinymce.dom.Event;
    
    var SourceEditor = {
        
        options : {
            format  : true,
            width   : '100%',
            height  : '100%',
            theme   : 'textmate',
            load    : function(){},
            change  : function(){}
        },

        init : function(options, content) {
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
                
                // format content
                if (this.options.format) {
                    content = this._format(content);
                }
                // load editor
                this._load(content);
            // keep trying...
            } else {
                Event.add(document, 'init', function() {
                    self.init(options, content);
                });
            }
        },
        
        _format : function(v) {
            var inline = ['a','abbr','acronym','b','bdo','big','br','cite','code','dfn','em','i','img','input','kbd','label','q','samp','select','small','span','strong','sub','sup','textarea','tt','var','li','dt','dd'];
            
            v = style_html(v, {
                'indent_size'   : 1, 
                'indent_char'   : '\t', 
                'unformatted'   : inline, 
                'max_char'      : 0
            });
            
            return v.replace(new RegExp('\n\t<(' + inline.join('|') + ')', 'gi' ), '<$1');
        },
        
        _load : function(content) {
            var self = this, ed, o = this.options;

            if(window.CodeMirror) {
                                
                ed = CodeMirror(this.container, {
                    mode    : "text/html",
                    theme   : o.theme,
                    onChange : function() {
                        // callback
                        o.change.call();
                    },
                    indentWithTabs : true,
                    smartIndent : true,
                    tabMode: "indent"
                });

                ed.setWrap = function(s) {
                    ed.setOption('lineWrapping', s);
                };

                ed.showGutter = function(s) {
                    ed.setOption('lineNumbers', s);
                };

                ed.highlight = function(s) {
                    var c = ed.getCursor();

                    if(s) {
                        ed.setOption('mode', 'text/html');
                    } else {
                        ed.setOption('mode', 'text/plain');
                    }

                    ed.setCursor(c);
                };

                ed.resize = function(w, h) {
                    DOM.setStyles(ed.getScrollerElement(), {
                        width : w,
                        height : h
                    });

                    DOM.setStyles(ed.getGutterElement(), {
                        height : h
                    });
                };

                ed.showInvisibles = function(s) {
                };

                ed.setContent = function(v) {
                    if(v === '') {
                        v = '\u00a0';
                    }
                    return ed.setValue(v);
                };

                ed.insertContent = function(v) {
                    return ed.replaceSelection(v);
                };

                ed.getContent = function() {
                    return ed.getValue();
                };

                this.editor = ed;
                this._loaded(content);
            }
            
        /*if (window.ace) {
                var editor = ace.edit(this.container);
                
                editor.getSession().on('change', o.change);
                
                // set mode
                editor.getSession().setMode("ace/mode/html");
                
                editor.indent();
                
                // hide print margin
                editor.setShowPrintMargin(false);
                
                editor.setWrap = function(s) {
                    editor.getSession().setUseWrapMode(s);
                };
                
                editor.showGutter = function(s) {
                    editor.renderer.setShowGutter(s);
                };
                
                editor.highlight = function(s) {
                    if (s) {
                        editor.getSession().setMode("ace/mode/html");
                    } else {
                        editor.getSession().setMode("ace/mode/text");
                    }
                };
                
                editor.insertContent = function(v) {
                    editor.insert(v);
                };
                
                editor.getContent = function() {
                    return editor.getSession().getValue();
                };
                
                editor.setContent = function(v) {
                    return editor.getSession().setValue(v);
                };
                
                editor.showInvisibles = function(v) {};
                
                this.editor = editor;
                this._loaded(o, content);
            }*/
        },
        _loaded : function(content) {
            var o = this.options;
            
            this.setContent(content);

            // set word wrap
            this.setWrap(!!o.wrap);
            // set line numbers / gutter
            this.setNumbers(!!o.numbers);

            this.focus();

            // callback
            o.load.call();
        },
        setWrap : function(s) {
            return this.editor.setWrap(s);
        },
        setNumbers : function(s) {
            return this.editor.showGutter(s);
        },
        setHighlight : function(s) {
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
        resize : function(w, h) {
            return this.editor.resize(w, h);
        },
        focus : function() {
            return this.editor.focus();
        },
        undo : function() {
            return this.editor.undo();
        },
        redo : function() {
            return this.editor.redo();
        },
        indent : function() {
        //return this.editor.reindent();
        },
        getContainer : function() {
            return this.container || null;
        },
        format : function() {
            var v = this.getContent();
            return this.setContent(v, true);
        }
    };

    window.SourceEditor = SourceEditor;
}());

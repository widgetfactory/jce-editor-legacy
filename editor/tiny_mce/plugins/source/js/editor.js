( function($) {
	var tinymce = window.parent.tinymce, DOM = tinymce.DOM, Event = tinymce.dom.Event;
	var SourceEditor = {

		init : function(options, content) {
			var self = this;
			if (Event.domLoaded) {
				self.container = DOM.add(document.body, 'div', {
					style : {
						width : options.width 	|| '100%',
						height: options.height 	|| '100%'
					},
					'class' : 'container'
				});
					
				self._load(options, content);	
			} else {
				Event.add(document, 'init', function() {
					self.init(options, content);
				});
			}

		},

		_load : function(o, content) {
			var self = this, ed;

			if (!tinymce.is(o.change, 'function')) {
				o.change = function(){};
			}
			
			if (!tinymce.is(o.load, 'function')) {
				o.load = function(){};
			}

			if(window.CodeMirror) {

				var query = o.url;
				
				var args = {
					'task' 		: 'compile',
					'editor' 	: 'codemirror',
					'theme' 	: o.theme || 'textmate'
				};

				// set token
				args[o.token] = 1;

				// create query
				for(k in args) {
					query += '&' + k + '=' + encodeURIComponent(args[k]);
				}
				ed = new CodeMirror(this.container, {
					width : 'auto',
					height : '100%',
					base : '',
					basefiles : [query + '&type=base'],
					parserfile : [query + '&type=parser'],
					stylesheet : [query + '&type=css'],
					indentUnit : 4,
					reindentOnLoad : true,
					onLoad : function() {
						ed.setWrap = function(s) {
							ed.setTextWrapping(s);
						};

						ed.showGutter = function(s) {
							ed.setLineNumbers(s);
						};

						ed.highlight = function(s) {
							if(s) {
								ed.setParser('HTMLMixedParser');
							} else {
								ed.setParser('TextParser');
							}
						};

						ed.resize = function(w, h) {
							DOM.setStyles(self.container, {
								width : w,
								height : h
							});
						};

						ed.showInvisibles = function(s) {
						};

						ed.setContent = function(v) {
							if(v === '') {
								v = '\u00a0';
							}
							return ed.setCode(v);
						};

						ed.insertContent = function(v) {
							return ed.replaceSelection(v);
						};

						ed.getContent = function() {
							return ed.getCode();
						};

						self.editor = ed;
						self._loaded(o, content);
					},

					onChange : function() {
						// callback
						o.change.call();
					}

				});
			}
		},

		_loaded : function(o, content) {
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

		setContent : function(v) {
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
			return this.editor.reindent();
		},

		getContainer : function() {
			return this.container || null;
		}

	};

	window.SourceEditor = SourceEditor;
}());

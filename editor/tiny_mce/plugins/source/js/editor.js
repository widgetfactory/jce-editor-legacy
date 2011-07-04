(function($) {
	var SourceEditor = {

		init : function(options, content) {
			var self = this;

			$(window).ready( function() {
				self.container = $('<div/>').addClass('container').appendTo('body').css({
					'width'		: options.width 	|| '100%',
					'height'	: options.height 	|| '100%'
				}).get(0);

				self._load(options, content);
			});
		},
		_load : function(o, content) {
			var self = this, ed;

			o.load 		= $.isFunction(o.load) 		? o.load	: function() {};
			o.change 	= $.isFunction(o.change) 	? o.change	: function() {};
			
			if (window.CodeMirror) {

				var query 	= o.url + 'index.php?option=com_jce';
				var args 	= {
					'view' 	: 'editor',
					'layout': 'plugin',
					'plugin': 'source',
					'task'	: 'compile',
					'editor': 'codemirror',
					'theme' : o.theme || 'textmate'
				};

				var token 	= document.getElementById('wf_source_token');

				if (!token) {
					alert('INVALID TOKEN');
					return false;
				}
				args[token.name] = token.value;

				// create query
				for (k in args) {
					query += '&' + k + '=' + encodeURIComponent(args[k]);
				}

				ed = new CodeMirror(this.container, {
					width		: 'auto',
					height		: '100%',
					base		: '',
					basefiles	: [query + '&type=base'],
					parserfile	: [query + '&type=parser'],
					stylesheet	: [query + '&type=css'],
					indentUnit 	: 4,
					reindentOnLoad : true,
					onLoad 		: function() {
						ed.setWrap = function(s) {
							ed.setTextWrapping(s);
						};
						ed.showGutter = function(s) {
							ed.setLineNumbers(s);
						};
						ed.highlight = function(s) {
							if (s) {
								ed.setParser('HTMLMixedParser');
							} else {
								ed.setParser('TextParser');
							}
						};
						ed.resize = function(w, h) {
							$(self.container).css({
								width : w,
								height: h
							});
						};
						ed.showInvisibles = function(s) {
						};
						ed.setContent = function(v) {
							if (v === '') {
								v = '\u00a0';
							}
							return ed.setCode(v);
						};
						ed.insertContent = function(v) {
							return ed.replaceSelection(v)
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
		getContainer : function() {
			return this.container || null;
		}
	};

	window.SourceEditor = SourceEditor;
}(jQuery));
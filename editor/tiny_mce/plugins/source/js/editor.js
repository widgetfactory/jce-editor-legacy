( function($) {
	var SourceEditor = {

		init : function(options, content) {
			var self = this;

			$(window).ready(function() {
				self.container = $('<div/>').addClass('container').appendTo('body').css({
				'width'		: options.width 	|| '100%',
				'height'	: options.height 	|| '100%'
				}).get(0);

				self._load(options, content);
			});

		},

		_load : function(o, content) {
			var self = this, ed;

			o.load 		= $.isFunction(o.load) ? o.load : function() {};
			o.change 	= $.isFunction(o.change) ? o.change : function() {};

			if(window.CodeMirror) {

				ed = CodeMirror(this.container, {
					mode		: "application/x-httpd-php",
					theme		: o.theme || 'textmate',
					onChange 	: function() {
						// callback
						o.change.call();
					},
					onCursorActivity: function() {
						ed.setLineClass(hlLine, null);
					    hlLine = ed.setLineClass(ed.getCursor().line, "activeline");
					}
				});
				// highlight line
				var hlLine = ed.setLineClass(0, "activeline");
				
				ed.setWrap = function(s) {
					ed.setOption('lineWrapping', s);
				};

				ed.showGutter = function(s) {
					ed.setOption('lineNumbers', s);
				};

				ed.highlight = function(s) {
					var c = ed.getCursor();
					
					if(s) {
						ed.setOption('mode', 'application/x-httpd-php');
					} else {
						ed.setOption('mode', 'text/plain');
					}
					
					ed.setCursor(c);
				};

				ed.resize = function(w, h) {
					$(ed.getScrollerElement()).css({
						width : w,
						height : h
					});
					
					$(ed.getGutterElement()).css({
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

				self.editor = ed;
				self._loaded(o, content);
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
}(jQuery));

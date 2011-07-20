/**
 * @version		$Id: editor_plugin.js 250 2011-06-29 13:26:28Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
	var each = tinymce.each, JSON = tinymce.util.JSON, Node = tinymce.html.Node, Entities = tinymce.html.Entities;

	tinymce.create('tinymce.plugins.CodePlugin', {
		init: function(ed, url) {
			var self = this;

			this.editor = ed;
			this.url 	= url;

			ed.onPreInit.add( function() {
				if (ed.getParam('code_style')) {
					ed.schema.addValidElements('style[scoped|*]');
					ed.schema.addValidChildren('+body[style]');
				}

				// Convert script elements to span placeholder
				ed.parser.addNodeFilter('script,style', function(nodes) {
					for (var i = 0, len = nodes.length; i < len; i++) {
						self._serializeSpan(nodes[i]);
					}
				});

				// Convert span placeholders to script elements
				ed.serializer.addNodeFilter('span,script', function(nodes, name, args) {
					for (var i = 0, len = nodes.length; i < len; i++) {
						var node = nodes[i];

						if (node.name == 'span' && /mceItemScript/.test(node.attr('class'))) {
							self._buildScript(node);
						}

						if (node.name == 'span' && /mceItemStyle/.test(node.attr('class'))) {
							self._buildStyle(node);
						}
					}
				});
			});

			ed.onInit.add( function() {
				// Display "script" instead of "span" in element path
				if (ed.theme && ed.theme.onResolveName) {
					ed.theme.onResolveName.add( function(theme, o) {
						if (o.name === 'span' && /mceItemScript/.test(o.node.className)) {
							o.name = 'script';
						}

						if (o.name === 'span' && /mceItemStyle/.test(o.node.className)) {
							o.name = 'style';
						}

						if (o.name === 'span' && /mcePhp/.test(o.node.className)) {
							o.name = 'php';
						}
					});

				}

				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(url + "/css/content.css");
			});

			ed.onBeforeSetContent.add( function(ed, o) {
				// test for PHP, Script or Style
				if (/<(\?|script|style)/.test(o.content)) {
					// Remove javascript if not enabled
					if (!ed.getParam('code_script')) {
						o.content = o.content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
					}
					
					if (!ed.getParam('code_style')) {
						o.content = o.content.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
					}

					// Remove PHP if not enabled
					if (!ed.getParam('code_php')) {
						o.content = o.content.replace(/<\?(php)?([\s\S]*?)\?>/gi, '');
					}
					// PHP code within an attribute
					o.content = o.content.replace(/\="([^"]+?)"/g, function(a, b) {
						if (/<\?(php)?/.test(b)) {
							b = ed.dom.encode(b);
						}
						return '="' + b + '"';
					});

					// PHP code within a textarea
					if (/<textarea/.test(o.content)) {
						o.content = o.content.replace(/<textarea([^>]*)>([\s\S]*?)<\/textarea>/gi, function(a, b, c) {
							if (/<\?(php)?/.test(c)) {
								c = ed.dom.encode(c);
							}
							return '<textarea' + b + '>' + c + '</textarea>';
						});

					}

					// PHP code within an element
					o.content = o.content.replace(/<([^>]+)<\?(php)?(.+?)\?>([^>]*?)>/gi, function(a, b, c, d, e) {
						if (b.charAt(b.length) !== ' ') {
							b += ' ';
						}
						return '<' + b + 'data-mce-php="' + d + '" ' + e + '>';
					});

					// PHP code other
					o.content = o.content.replace(/<\?(php)?([\s\S]+?)\?>/gi, '<span class="mcePhp" data-mce-type="php"><!--$2-->\u00a0</span>');

					// padd empty script tags
					o.content = o.content.replace(/<script([^>]+)><\/script>/g, '<script$1>\u00a0</script>');
				}
			});

			ed.onPostProcess.add( function(ed, o) {
				if (o.get) {
					// Process converted php
					if (/(mcePhp|data-mce-php|&lt;\?(php)?)/.test(o.content)) {
						// attribute value
						o.content = o.content.replace(/"(.*?)&lt;\?(php)?([^"]+)\?&gt;(.*?)"/g, function(a, b, c, d, e) {
							return '"' + b + '<?php' + ed.dom.decode(d) + '?>' + e + '"';
						});

						// textarea
						o.content = o.content.replace(/<textarea([^>]*)>([\s\S]*?)<\/textarea>/gi, function(a, b, c) {
							if (/&lt;\?php/.test(c)) {
								c = ed.dom.decode(c);
							}
							return '<textarea' + b + '>' + c + '</textarea>';
						});

						// as attribute
						o.content = o.content.replace(/data-mce-php="([^"]+?)"/g, function(a, b) {
							return '<?php' + ed.dom.decode(b) + '?>';
						});

						// other
						o.content = o.content.replace(/<span([^>]+)class="mcePhp"([^>]+)><!--([\s\S]*?)-->(&nbsp;|\u00a0)<\/span>/g, function(a, b, c, d) {
							return '<?php' + ed.dom.decode(d) + '?>';
						});
					}
				}
			});

		},

		_buildScript: function(n) {
			var self = this, ed = this.editor, v, node, text;

			if (!n.parent)
				return;

			// element text
			if (n.firstChild) {
				v = n.firstChild.value;
			}

			p = JSON.parse(n.attr('data-mce-json')) || {};

			p.type = 'text/javascript';

			node = new Node('script', 1);

			if (v) {
				
				v = tinymce.trim(v);
				
				if (v) {
					text = new Node('#text', 3);
					text.raw = true;
					// add cdata
					if (ed.getParam('code_cdata', true)) {
						v = '// <![CDATA[\n' + self._clean(tinymce.trim(v)) + '\n// ]]>';
					}
					text.value = v;
					node.append(text);
				}
			}

			each(p, function(v, k) {
				node.attr(k, v);
			});

			n.replace(node);
			
			return true;
		},

		_buildStyle: function(n) {
			var self = this, ed = this.editor, v, node, text;

			if (!n.parent)
				return;

			// element text
			if (n.firstChild) {
				v = n.firstChild.value;
			}

			p = JSON.parse(n.attr('data-mce-json')) || {};

			p.type = 'text/css';

			node = new Node('style', 1);

			if (v) {
				
				v = tinymce.trim(v);
				
				if (v) {
					text = new Node('#text', 3);
					text.raw = true;
					// add cdata
					if (ed.getParam('code_cdata', true)) {
						v = '<!--\n' + self._clean(tinymce.trim(v)) + '\n-->';
					}
					text.value = v;
					node.append(text);
				}
			}
			
			// add scoped attribute
			if (n.parent.name == 'head') {
				p.scoped = null;
			} else {
				p.scoped = "scoped";
			}

			each(p, function(v, k) {
				node.attr(k, v);
			});

			n.replace(node);

			return true;
		},

		_serializeSpan: function(n) {
			var self = this, ed = this.editor, dom = ed.dom, v, k, p = {};

			if (!n.parent)
				return;

			each(n.attributes, function(at) {
				if (at.name == 'type')
					return;

				p[at.name] = at.value;
			});

			var span = new Node('span', 1);

			span.attr('class', 'mceItem' + this._ucfirst(n.name));
			span.attr('data-mce-json', JSON.serialize(p));
			span.attr('data-mce-type', n.name);

			v = n.firstChild ? n.firstChild.value : '';

			if (v.length) {
				var text = new Node('#comment', 8);
				text.value = this._clean(v);
				span.append(text);
			}
			// padd empty span to prevent it being removed
			span.append(new tinymce.html.Node('#text', 3)).value = '\u00a0';

			n.replace(span);
		},

		_ucfirst : function(s) {
			return s.charAt(0).toUpperCase() + s.substring(1);
		},

		// Private internal function
		_clean: function(s) {
			// Remove prefix and suffix code for element
			s = s.replace(/(\/\/\s+<!\[CDATA\[)/gi, '\n');
			s = s.replace(/(<!--\[CDATA\[|\]\]-->)/gi, '\n');
			s = s.replace(/^[\r\n]*|[\r\n]*$/g, '');
			s = s.replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/gi, '');
			s = s.replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g, '');

			return s;
		},

		getInfo: function() {
			return {
				longname: 'Code',
				author: 'Ryan Demmer',
				authorurl: 'http://www.joomlacontenteditor.net',
				infourl: 'http://www.joomlacontenteditor.net',
				version: '@@version@@'
			};
		}

	});
	// Register plugin
	tinymce.PluginManager.add('code', tinymce.plugins.CodePlugin);
})();
/**
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2011 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL 2 or later
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
	var each = tinymce.each, extend = tinymce.extend;

	tinymce.create('tinymce.plugins.CleanupPlugin', {
		init : function(ed, url) {
			var self = this;
			this.editor = ed;

			// set validate value to verify_html value
			if(ed.settings.verify_html === false) {
				ed.settings.validate = false;
			}

			ed.onPreInit.add(function() {
				// Invalid Attribute Values cleanup
				var av = ed.getParam('invalid_attribute_values', '');
				if(av) {
					each(tinymce.explode(av), function(item) {
						var matches = /([a-z]+)([\^\$]?=)["']([^"']+)["']/i.exec(item);

						if(matches && matches.length == 4) {
							var attrib = matches[1], expr = matches[2], value = matches[3];

							ed.parser.addAttributeFilter(attrib, function(nodes, name) {
								var i = nodes.length, node;

								while(i--) {
									node = nodes[i];

									switch(expr) {
										default:
										case '=':
											re = '(' + value + ')';
											break;
										case '^=':
											re = '^(' + value + ')';
											break;
										case '$=':
											re = '(' + value + ')$';
											break;
									}
									// remove attribute if it matches expression
									if(new RegExp(re).test(node.attr(name))) {
										node.attr(name, "");
										// remove temp attribute
										if(name == 'src' || name == 'href') {
											node.attr('data-mce-' + name, "");
										}
									}
								}
							});
						}
					});
				}

				// add id support for anchors
				if(!ed.settings.allow_html_in_named_anchor) {
					ed.parser.addAttributeFilter('id', function(nodes, name) {
						var i = nodes.length, sibling, prevSibling, parent, node;

						while(i--) {
							node = nodes[i];
							if(node.name === 'a' && !node.attr('href') && node.firstChild) {
								parent = node.parent;

								// Move children after current node
								sibling = node.lastChild;
								do {
									prevSibling = sibling.prev;
									parent.insert(sibling, node);
									sibling = prevSibling;
								} while (sibling);
							}
						}
					});
				}
				// add anchor class
				ed.onVisualAid.add(function(ed, n, s) {
					each(ed.dom.select('a[id]', n), function(e) {
						if(!e.href) {
							if(s) {
								ed.dom.addClass(e, 'mceItemAnchor');
							} else {
								ed.dom.removeClass(e, 'mceItemAnchor');
							}
						}

						return;
					});
				});
			});
			// run cleanup with default settings
			if(ed.settings.validate === false && ed.settings.verify_html === false) {
				ed.addCommand('mceCleanup', function() {
					var s = ed.settings, se = ed.selection, bm;
					bm = se.getBookmark();

					var content = ed.getContent({
						cleanup : true
					});

					var schema = new tinymce.html.Schema({
						validate : true,
						verify_html : true,
						valid_styles : s.valid_styles,
						valid_children : s.valid_children,
						custom_elements : s.custom_elements,
						extended_valid_elements : s.extended_valid_elements
					});
					content = new tinymce.html.Serializer({
						validate : true
					}, schema).serialize(new tinymce.html.DomParser({
						validate : true
					}, schema).parse(content));

					ed.setContent(content, {
						cleanup : true
					});

					se.moveToBookmark(bm);
				});
			}

			// Cleanup callback
			ed.onBeforeSetContent.add(function(ed, o) {
				// Geshi
				o.content = o.content.replace(/<pre xml:\s*(.*?)>(.*?)<\/pre>/g, '<pre class="geshi-$1">$2</pre>');

				if(ed.getParam('verify_html', true)) {
					// remove attributes
					if(ed.getParam('invalid_attributes')) {
						var s = ed.getParam('invalid_attributes', '');

						o.content = o.content.replace(new RegExp('<([^>]+)(' + s.replace(',', '|', 'g') + ')="([^"]+)"([^>]*)>', 'gi'), '<$1$4>');
					}
				}

				o.content = o.content.replace(/<(p|h1|h2|h3|h4|h5|h6|th|td|pre|div|address|caption)([^>]*)><\/\1>/g, '<$1$2>\u00a0</$1>');

			});
			// disable onclick, ondblclick
			ed.onSetContent.add(function(ed, o) {
				each(ed.dom.select('*[onclick], *[ondblclick]'), function(n) {
					n.onclick = n.ondblclick = function(e) {
						tinymce.dom.Event.cancel(e);
					};
				});
			});
			// Cleanup callback
			ed.onPostProcess.add(function(ed, o) {
				if(o.set) {
					// Geshi
					o.content = o.content.replace(/<pre xml:\s*(.*?)>(.*?)<\/pre>/g, '<pre class="geshi-$1">$2</pre>');
				}
				if(o.get) {
					// Geshi
					o.content = o.content.replace(/<pre class="geshi-(.*?)">(.*?)<\/pre>/g, '<pre xml:$1>$2</pre>');
					// Remove empty jcemediabox / jceutilities anchors
					o.content = o.content.replace(/<a([^>]*)class="jce(box|popup|lightbox|tooltip|_tooltip)"([^>]*)><\/a>/gi, '');
					// Remove span elements with jcemediabox / jceutilities classes
					o.content = o.content.replace(/<span class="jce(box|popup|lightbox|tooltip|_tooltip)">(.*?)<\/span>/gi, '$2');
					// mce stuff
					o.content = o.content.replace(/_mce_(src|href|style|coords|shape)="([^"]+)"\s*?/gi, '');

					if(ed.getParam('keep_nbsp', true)) {
						o.content = o.content.replace(/\u00a0/g, '&nbsp;');
					}

					// pad empty paragraphs
					if(ed.getParam('verify_html') == false) {
						o.content = o.content.replace(/<body([^>]*)>([\s\S]*)<\/body>/, '$2');

						o.content = o.content.replace(/<p([^>]*)><\/p>/g, '<p$1>&nbsp;</p>');
					}

					o.content = o.content.replace(/<(p|h1|h2|h3|h4|h5|h6|th|td|pre|div|address|caption)([^>]*)>\u00a0<\/\1>/g, '<$1$2></$1>');
				}
			});
			// Save callback
			ed.onGetContent.add(function(ed, o) {
				if(o.save) {
					// Convert entities to characters
					if(ed.getParam('cleanup_pluginmode')) {
						o.content = o.content.replace(/&#39;/gi, "'");
						o.content = o.content.replace(/&apos;/gi, "'");
						o.content = o.content.replace(/&amp;/gi, "&");
						o.content = o.content.replace(/&quot;/gi, '"');
					}
				}
			});
			// Register buttons
			ed.addButton('cleanup', {
				title : 'advanced.cleanup_desc',
				cmd : 'mceCleanup'
			});
		},
		getInfo : function() {
			return {
				longname : 'Cleanup',
				author : 'Ryan Demmer',
				authorurl : 'http://www.joomlacontenteditor.net',
				infourl : 'http://www.joomlacontenteditor.net',
				version : '@@version@@'
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('cleanup', tinymce.plugins.CleanupPlugin);
})();

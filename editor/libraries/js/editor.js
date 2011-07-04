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

/**
 * Widget Factory Editor
 */
( function() {
	var WFEditor = {

		_bookmark : {},

		getBase : function(compress) {
			// find tinymce
			var marker = compress ? 'index.php?option=com_jce&view=editor&layout=editor&task=pack' : 'components/com_jce/editor/tiny_mce';
			// get url from browser
			var u = document.location.href;
			// get script
			var script = tinymce.DOM.select('script[src*="' + marker + '"]')[0];

			if (script) {
				// get script src
				var src = script.src;

				if (src) {
					// extract base url
					var base = src.substr(0, src.indexOf(marker));

					// remove administrator
					if (base.indexOf('/administrator/') != -1) {
						base = base.substr(0, base.indexOf('administrator/'));
					}
					// return absolute base
					return base.indexOf('://') == -1 ? u.substr(0, u.indexOf(base) + base.length) : base;
				}
			}
			return null;
		},
		getSite : function(base) {
			// get url from browser
			var u 		= document.location.href;
			// get the host part of the url eg: www.mysite.com
			var host 	= base.substr(base.indexOf('://') + 3);
			// get the
			var site 	= host.substr(host.indexOf('/'));

			if (u.indexOf('/administrator/') != -1) {
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

			var base = this.getBase(settings.compress.javascript) || '';
			var site = this.getSite(base);

			// set preinit object to prevent tinymce from generating baseURL
			window.tinyMCEPreInit = {};
			// set baseURL, suffix and query string
			tinymce.extend(tinymce, {
				baseURL : base + 'components/com_jce/editor/tiny_mce',
				suffix	: '',
				query	: 'component_id=' + settings.component_id || 0
			});

			// remove submit triggers
			this.settings = tinymce.extend({
				document_base_url		: base,
				site_url				: site,
				mode 					: 'textareas',
				editor_selector			: 'wfEditor',
				editor_deselector		: 'wfNoEditor',
				urlconverter_callback	: 'WFEditor.convertURL',
				popup_css				: base + 'components/com_jce/editor/libraries/css/popup.css',
				add_form_submit_trigger : false,
				submit_patch			: false,
				theme 					: 'none',
				invalid_elements 		: 'applet,iframe,object,embed,script,style',
				plugins			 		: ''
			}, settings);

			if (this.settings) {
				try {
					if (this.settings.compress.css) {
						tinymce.extend(this.settings, {
							content_css : false,
							editor_css	: false
						});
					}

					// mark javascript files loaded
					if (this.settings.compress.javascript) {
						this._markLoaded();
					}

					WFEditor.create();

				} catch (e) {
					alert('Unable to initialize TinyMCE : ' + e);
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
				if (c) {
					load('langs/' + c + '.js');
				}
			});
			// Add themes with languages
			each(s.theme.split(','), function(n) {
				if (n) {
					load('themes/' + n + '/editor_template' + suffix + '.js');

					each (ln, function(c) {
						if (c) {
							load('themes/' + n + '/langs/' + c + '.js');
						}
					});
				}
			});
			// Add plugins with languages
			each(s.plugins.split(','), function(n) {
				if (n) {
					load('plugins/' + n + '/editor_plugin' + suffix + '.js');

					each(ln, function(c) {
						if (c) {
							load('plugins/' + n + '/langs/' + c + '.js');
						}
					});
				}
			});
		},
		setBookmark : function(ed) {
			var self = this, DOM = tinymce.DOM, Event = tinymce.dom.Event;

			Event.add(document.body, 'mousedown', function(e) {
				var el = e.target, ta = ed.getElement();

				if (DOM.getParent(el, ta.id + '_parent')) {
					return;
				}

				function isHidden(ed) {
					return ed.isHidden || DOM.getStyle(ed.id + '_ifr', 'visibility') == 'hidden';
				}

				if (!isHidden(ed) && ed.selection) {
					self._bookmark[ed.id] = ed.selection.getBookmark();
				}
			});
		},
		/**
		 * Create Editors on domloaded
		 */
		create : function(elements) {
			var self = this, Event = tinymce.dom.Event, s = this.settings;

			if (!Event.domLoaded) {
				Event.add(document, 'init', function() {
					self.create();
				});
				return;
			} else {
				WFEditor.showLoader();

				tinyMCE.onAddEditor.add( function(mgr, ed) {
					if (s.compress.css) {
						// get token
						var token = tinymce.DOM.getAttrib('wf_' + ed.id + '_token', 'name');
						// load packer css
						ed.onPreInit.add( function() {
							ed.dom.loadCSS(s.site_url + 'index.php?option=com_jce&view=editor&layout=editor&task=pack&type=css&context=content&component_id=' + s.component_id + '&' + token + '=1');
						});
					}

					WFEditor.hideLoader(ed.getElement());

					if (tinymce.isIE) {
						self.setBookmark(ed);
					}

					// form submit trigger
					ed.onInit.add( function() {
						ed.onSubmit.addToTop( function() {
							if (ed.initialized && !ed.isHidden()) {
								ed.save();
								ed.isNotDirty = 1;
							}
						});
					});
					// Form submit patch
					ed.onBeforeRenderUI.add( function() {
						var n = ed.getElement().form;

						if (!n)
							return;

						// Already patched
						if (n._mceOldSubmit)
							return;

						// Check page uses id="submit" or name="submit" for it's submit button
						if (!n.submit.nodeType && !n.submit.length) {
							ed.formElement = n;
							n._mceOldSubmit = n.submit;
							n.submit = function() {
								// Save all instances
								tinymce.each(tinymce.editors, function(e) {
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
				});
				if (elements) {
					s.mode 		= 'exact';
					s.elements 	= elements;
				}

				try {
					// only create toggle for advanced theme
					if (s.theme == 'advanced' && (typeof s.toggle == 'undefined' ? 1 : s.toggle)) {
						this.toggle(elements);
					}

					tinyMCE.init(s);
				} catch (e) {
					alert(e);
				}
			}
		},
		toggle : function(elements) {
			var self = this, DOM = tinymce.DOM, Event = tinymce.dom.Event, s = this.settings;

			function getVar(s, dv) {
				return (typeof s == 'undefined' || s === null) ? dv : s;
			}

			tinymce.each(DOM.select('.wfEditor'), function(el) {
				var state 	= getVar(s.editor_state, 1);
				// get cookie
				var cookie 	= getVar(tinymce.util.Cookie.get('wf_editor_' + el.id + '_state'), 1);

				var use_cookies = getVar(s.use_cookies, true);

				if (!state) {
					el.className = 'wfNoEditor';
				} else {
					if (parseInt(cookie) == 0) {
						el.className = 'wfNoEditor';
					} else {
						el.className = 'wfEditor';
					}
				}

				var label = getVar(s.toggle_label, '[show/hide]');

				var div = DOM.create('span', {
					'role' 				: 'button',
					'class'				: 'wf_editor_toggle',
					'aria-labelledby' 	: 'wf_editor_' + el.id + '_toggle'
				}, '<span id="wf_editor_' + el.id + '_toggle">' + label + '</span>');

				DOM.setStyle(div, 'cursor', 'pointer');
				el.parentNode.insertBefore(div, el);
				
				// wrap text
				self._wrapText(el, true);

				Event.add(div, 'click', function(e) {
					var ed = tinyMCE.get(el.id);
					// turn it on
					if (!ed) {
						if (use_cookies) {
							tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', 1);
						}

						el.className = 'wfEditor';

						tinyMCE.execCommand('mceAddEditor', 0, el.id);
					} else {
						if (ed.isHidden()) {
							if (use_cookies) {
								tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', 1);
							}
							el.className = 'wfEditor';

							ed.load();
							ed.show();							
						} else {
							if (use_cookies) {
								tinymce.util.Cookie.set('wf_editor_' + el.id + '_state', 0);
							}
							el.className = 'wfNoEditor';

							ed.save();
							ed.hide();
						}
					}
				});
			});
		},
		
		_wrapText : function(el, s) {
			var v, n;
			
			el.setAttribute("wrap", s);
			
			if (!tinymce.isIE) {
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
		setContent: function(id, html) {
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
		getContent: function(id) {
			var ed = tinyMCE.get(id);

			if (ed && !ed.isHidden()) {
				return ed.getContent();
			}

			return document.getElementById(id).value;
		},
		/**
		 * Save the editor content
		 * @param {String} id The editor id
		 */
		save: function(id) {
			var el = document.getElementById(id);

			if (/wfEditor/.test(el.className)) {
				return tinyMCE.triggerSave();
			}
		},
		/**
		 * Insert content into the editor. This function is provided for editor-xtd buttons and includes methods for inserting into textareas
		 * @param {String} el The editor id
		 * @param {String} v The text to insert
		 */
		insert: function(el, v) {
			var bm, ed;
			if (typeof el == 'string') {
				el = document.getElementById(el);
			}
			if (/wfEditor/.test(el.className)) {
				ed = tinyMCE.get(el.id);
				if (tinymce.isIE) {
					if (window.parent.tinymce) {
						var ed = window.parent.tinyMCE.get(el.id);

						if (ed) {
							if (this._bookmark[ed.id]) {
								ed.selection.moveToBookmark(this._bookmark[ed.id]);
							}
						}
					}
				}
				ed.execCommand('mceInsertContent', false, v, true);
			} else {
				this.insertIntoTextarea(el, v);
			}
		},
		insertIntoTextarea : function(el, v) {
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
		convertURL : function(u, e, save) {
			var ed = tinymce.EditorManager.activeEditor, s = tinymce.settings, base = s.document_base_url;

			if (!u)
				return u;

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!s.convert_urls || (e && e.nodeName == 'LINK') || u.indexOf('file:') === 0)
				return u;

			if (u == base || u == base.substring(0, base.length - 1) || u.charAt(0) == '/') {
				return u;
			}

			// Convert to relative
			if (s.relative_urls)
				return ed.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = ed.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		}
	};
	window.WFEditor = WFEditor;
}());
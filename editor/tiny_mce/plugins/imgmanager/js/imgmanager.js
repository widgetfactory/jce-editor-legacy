/**
 * @version		$Id: imgmanager.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @copyright   @@copyright@@
 * @author		Ryan Demmer
 * @license     @@licence@@
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
	tinyMCEPopup.requireLangPack();

	var ImageManagerDialog = {

		settings : {},

		init : function() {
			var ed = tinyMCEPopup.editor, n = ed.selection.getNode(), self = this, br, el;
		
			// add insert button action
			$('#insert').click( function(e) {
				self.insert();
				e.preventDefault();
			});

			tinyMCEPopup.resizeToInnerSize();
			tinyMCEPopup.restoreSelection();

			// Get src an convert to relative
			var src = ed.convertURL(ed.dom.getAttrib(n, 'src'));
			// decode
			src = decodeURIComponent(src);

			TinyMCE_Utils.fillClassList('classlist');

			// Enable / disable attributes
			$.each(this.settings.attributes, function(k, v) {
				if (!parseFloat(v)) {
					$('#attributes-' + k).hide();
				}
			});

			// add focus behaviour to onmoueover / onmouseout
			$('#onmouseover').click( function() {
				$('#onmouseout').removeClass('focus');
				$(this).addClass('focus');
			});

			$('#onmouseout').click( function() {
				$('#onmouseover').removeClass('focus');
				$(this).addClass('focus');
			});

			// setup plugin
			$.Plugin.init({
				selectChange : function() {
					ImageManagerDialog.updateStyles();
				}

			});

			if (n.nodeName == 'IMG') {
				// set button
				$('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update', true));

				$('#src').val(src);

				// set preview
				$('#sample').attr({
					'src' : n.src
				}).attr($.Plugin.sizeToFit(n, {
					width : 80,
					height : 60
				}));

				// Width & Height
				var w = this.getAttrib(n, 'width'), h = this.getAttrib(n, 'height');
				$('#width, #tmp_width').val(w);
				$('#height, #tmp_height').val(h);

				$('#alt').val(ed.dom.getAttrib(n, 'alt'));
				$('#title').val(ed.dom.getAttrib(n, 'title'));
				// Margin
				$.each(['top', 'right', 'bottom', 'left'], function() {
					$('#margin_' + this).val(ImageManagerDialog.getAttrib(n, 'margin-' + this));
				});

				// Border
				$('#border_width').val( function() {
					var v = self.getAttrib(n, 'border-width');

					if ($('option[value="'+ v +'"]', this).length == 0) {
						$(this).append(new Option(v, v));
					}

					return v;
				});

				$('#border_style').val(this.getAttrib(n, 'border-style'));
				$('#border_color').val(this.getAttrib(n, 'border-color')).change();
				$('#align').val(this.getAttrib(n, 'align'));

				// Class
				$('#classes').val(ed.dom.getAttrib(n, 'class'));
				$('#classlist').val(ed.dom.getAttrib(n, 'class'));

				$('#style').val(ed.dom.getAttrib(n, 'style'));
				$('#id').val(ed.dom.getAttrib(n, 'id'));
				$('#dir').val(ed.dom.getAttrib(n, 'dir'));
				$('#lang').val(ed.dom.getAttrib(n, 'lang'));
				$('#usemap').val(ed.dom.getAttrib(n, 'usemap'));

				$('#insert').button('option', 'label', ed.getLang('update', 'Update'));

				// Longdesc may contain absolute url too
				$('#longdesc').val(ed.convertURL(ed.dom.getAttrib(n, 'longdesc')));

				// onmouseover / onmouseout
				$('#onmouseout').val(src);

				$.each(['onmouseover', 'onmouseout'], function() {
					v = ed.dom.getAttrib(n, this);
					v = $.trim(v);
					v = v.replace(/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/, '$1');
					v = ed.convertURL(v);
					$('#' + this).val(v);
				});

				br = n.nextSibling;

				if (br && br.nodeName == 'BR' && ed.dom.getStyle(br, 'clear')) {
					$('clear').val(ed.dom.getStyle(br, 'clear'));
				}
			} else {
				$.Plugin.setDefaults(this.settings.defaults);
			}

			// Create File Browser
			WFFileBrowser.init($('#src'), {
				onFileClick : function(e, file) {
					ImageManagerDialog.selectFile(file);
				},

				onFileInsert : function(e, file) {
					ImageManagerDialog.selectFile(file);
				}

			});

			// Setup border
			this.setBorder();
			// Setup margins
			this.setMargins(true);
			// Setup Styles
			this.updateStyles();

		},

		insert : function() {
			var ed = tinyMCEPopup.editor, t = this;

			AutoValidator.validate(document);

			if ($('#src').val() === '') {
				$.Dialog.alert(tinyMCEPopup.getLang('imgmanager_dlg.no_src', 'Please enter a url for the image'));
				return false;
			}
			if ($('#alt').val() === '') {
				$.Dialog.confirm(tinyMCEPopup.getLang('imgmanager_dlg.missing_alt'), function(state) {
					if (state) {
						t.insertAndClose();
					}
				}, {
					width	: 300,
					height	: 200
				}
				);
			} else {
				this.insertAndClose();
			}
		},

		insertAndClose : function() {
			var ed = tinyMCEPopup.editor, t = this, v, args = {}, el, br = '';

			this.updateStyles();

			tinyMCEPopup.restoreSelection();

			// Fixes crash in Safari
			if (tinymce.isWebKit)
				ed.getWin().focus();

			if (!ed.settings.inline_styles) {
				args = {
					vspace 	: $('#margin_top').val() 	|| $('#margin_bottom').val(),
					hspace 	: $('#margin_left').val() 	|| $('#margin_right').val(),
					border 	: $('#border_width').val(),
					align 	: $('#align').val()
				};

				var img 	= $('#sample');
				var style 	= ed.dom.parseStyle($(img).attr('style'));

				// remove styles
				tinymce.each(['margin', 'float', 'border', 'vertical-align'], function(s) {
					delete style[s];
				});

				// reset style
				$('#style').val(ed.dom.serializeStyle(style));

			} else {
				// Remove deprecated values
				args = {
					vspace : '',
					hspace : '',
					border : '',
					align : ''
				};
			}

			// set attributes
			tinymce.each(['src', 'width', 'height', 'alt', 'title', 'classes', 'style', 'id', 'dir', 'lang', 'usemap', 'longdesc'], function(k) {
				v = $('#' + k).val();

				if (k == 'src') {
					// prepare URL
					v = $.String.buildURI(v);
				}

				if (k == 'classes')
					k = 'class';

				args[k] = v;
			});

			args.onmouseover = args.onmouseout = '';

			// mouseover / mouseout on single files only
			var over = $('#onmouseover').val(), out = $('#onmouseout').val();

			if (over && out) {
				args.onmouseover = "this.src='" + ed.convertURL(over) + "';";
				args.onmouseout  = "this.src='" + ed.convertURL(out) + "';";
			}

			el = ed.selection.getNode();
			br = el.nextSibling;

			if (el && el.nodeName == 'IMG') {
				ed.dom.setAttribs(el, args);
				// BR clear
				if (br && br.nodeName == 'BR') {
					if ($('#clear').is(':disabled') || $('#clear').val() === '') {
						ed.dom.remove(br);
					}
					if (!$('#clear').is(':disabled') && $('#clear').val() !== '') {
						ed.dom.setStyle(br, 'clear', $('#clear').val());
					}
				} else {
					if (!$('#clear').is(':disabled') && $('#clear').val() !== '') {
						br = ed.dom.create('br');
						ed.dom.setStyle(br, 'clear', $('#clear').val());
						ed.dom.insertAfter(br, el);
					}
				}
			} else {
				ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" src="" />', {
					skip_undo : 1
				});
				el = ed.dom.get('__mce_tmp');

				if(!$('#clear').is(':disabled') && $('#clear').val() !== '') {
					br = ed.dom.create('br');
					ed.dom.setStyle(br, 'clear', $('#clear').val());
					ed.dom.insertAfter(br, el);
				}

				ed.dom.setAttribs('__mce_tmp', args);
				ed.dom.setAttrib('__mce_tmp', 'id', '');
				ed.undoManager.add();
			}

			tinyMCEPopup.close();
		},

		getAttrib : function(e, at) {
			var ed = tinyMCEPopup.editor, v, v2;

			switch (at) {
				case 'width':
				case 'height':
					return ed.dom.getAttrib(e, at) || ed.dom.getStyle(e, at) || '';
					break;
				case 'align':
					if(v = ed.dom.getAttrib(e, 'align')) {
						return v;
					}
					if(v = ed.dom.getStyle(e, 'float')) {
						return v;
					}
					if(v = ed.dom.getStyle(e, 'vertical-align')) {
						return v;
					}
					break;
				case 'margin-top':
				case 'margin-bottom':
					if(v = ed.dom.getStyle(e, at)) {
						if (/auto|inherit/.test(v)) {
							return v;
						}
						return parseInt(v.replace(/[^-0-9]/g, ''));
					}
					if(v = ed.dom.getAttrib(e, 'vspace')) {
						return parseInt(v.replace(/[^-0-9]/g, ''));
					}
					break;
				case 'margin-left':
				case 'margin-right':
					if(v = ed.dom.getStyle(e, at)) {
						if (/auto|inherit/.test(v)) {
							return v;
						}
						return parseInt(v.replace(/[^-0-9]/g, ''));
					}
					if(v = ed.dom.getAttrib(e, 'hspace')) {
						return parseInt(v.replace(/[^-0-9]/g, ''));
					}
					break;
				case 'border-width':
				case 'border-style':
				case 'border-color':
					v = '';
					tinymce.each(['top', 'right', 'bottom', 'left'], function(n) {
						s = at.replace(/-/, '-' + n + '-');
						sv = ed.dom.getStyle(e, s);
						// False or not the same as prev
						if(sv !== '' || (sv != v && v !== '')) {
							v = '';
						}
						if (sv) {
							v = sv;
						}
					});

					if (at == 'border-color') {
						v = $.String.toHex(v);
					}
					if (at == 'border-width' && v !== '') {
						$('#border').attr('checked', true);
						if (/[0-9][a-z]/.test(v)) {
							v = parseFloat(v);
						}
					}

					return v;
					break;
			}
		},

		setMargins : function(init) {
			var x = 0, s = false;

			var v 		= $('#margin_top').val();
			var $elms 	= $('#margin_right, #margin_bottom, #margin_left');

			if (init) {
				$elms.each( function() {
					if ($(this).val() === v) {
						x++;
					}
				});

				s = (x == $elms.length);

				$elms.prop('disabled', s).prev('label').toggleClass('disabled', s);

				$('#margin_check').prop('checked', s);
			} else {
				s = $('#margin_check').is(':checked');

				$elms.each( function() {
					if (s) {
						if (v === '') {
							$('#margin_right, #margin_bottom, #margin_left').each( function() {
								if (v === '' && $(this).val() !== '') {
									v = $(this).val();
								}
							});

						}

						$(this).val(v);
					}
					$(this).prop('disabled', s).prev('label').toggleClass('disabled', s);
				});

				// set margin top
				$('#margin_top').val(v);

				this.updateStyles();
			}
		},

		setBorder : function() {
			var s = $('#border').is(':checked');

			$('#border~:input, #border~span, #border~label').attr('disabled', !s).toggleClass('disabled', !s);

			this.updateStyles();
		},

		setClasses : function(v) {
			return $.Plugin.setClasses(v);
		},

		setDimensions : function(a, b) {
			return $.Plugin.setDimensions(a, b);
		},

		setStyles : function() {
			var self = this, ed = tinyMCEPopup, img = $('#sample');

			$(img).attr('style', $('#style').val());

			// Margin
			tinymce.each(['top', 'right', 'bottom', 'left'], function(o) {
				$('#margin_' + o).val(self.getAttrib(img, 'margin-' + o));
			});

			// Border
			if (this.getAttrib(img, 'border-width') !== '') {
				dom.check('border', true);
				this.setBorder();
				$('#border_width').val(this.getAttrib(img, 'border-width'));
				$('#border_style').val(this.getAttrib(img, 'border-style'));
				$('#border_color').val(this.getAttrib(img, 'border-color'));
			}
			// Align
			$('#align', this.getAttrib(img, 'align'));
		},

		updateStyles : function() {
			var ed = tinyMCEPopup, st, v, br, img = $('#sample');

			$(img).attr('style', $('#style').val());
			$(img).attr('dir', $('#dir').val());

			// Handle align
			$(img).css('float', '');
			$(img).css('vertical-align', '');

			v = $('#align').val();

			if (v == 'left' || v == 'right') {
				if (ed.editor.settings.inline_styles) {
					$('#clear').attr('disabled', false);
				}
				$(img).css('float', v);
			} else {
				$(img).css('vertical-align', v);
				$('#clear').attr('disabled', true);
			}

			// Handle clear
			v = $('#clear').val();

			if (v && !$('#clear').is(':disabled')) {
				br = $('#sample-br');

				if (!$('#sample-br').is('br')) {
					$(img).append('<br id="sample-br" />');
				}
				$(br).css('clear', v);
			} else {
				$('#sample-br').remove();
			}

			// Handle border
			$.each(['width', 'color', 'style'], function() {
				if ($('#border').is(':checked')) {
					v = $('#border_' + this).val();
				} else {
					v = '';
				}
				// add pixel to width
				if (this == 'width' && /[^a-z]/i.test(v)) {
					v += 'px';
				}

				$(img).css('border-' + this, v);
			});

			// Margin
			$.each(['top', 'right', 'bottom', 'left'], function(i, k) {
				v = $('#margin_' + k).val();
				$(img).css('margin-' + k,  /[^a-z]/i.test(v) ? v + 'px' : v);
			});

			// Merge
			$('#style').val(ed.dom.serializeStyle(ed.dom.parseStyle($(img).attr('style'))));
		},

		_setRollover : function(src) {
			if ($('#onmouseout').hasClass('focus')) {
				$('#onmouseout').val(src);
			}

			if ($('#onmouseover').hasClass('focus')) {
				$('#onmouseover').val(src);
			}

			if (!$('#onmouseover, #onmouseout').hasClass('focus')) {
				if ($('#onmouseout').val() == '') {
					$('#onmouseout').val(src).addClass('focus').focus();
					// set the src value too
					$('#src').val(src);
				} else {
					$('#onmouseover').val(src).addClass('focus').focus();
				}
			}
		},

		selectFile : function(file) {
			var self 	= this;
			var name 	= $(file).attr('title');
			var src		= $(file).data('url');

			if (!$('#rollover_tab').is('.ui-tabs-hide')) {
				this._setRollover(src);
			} else {
				name = $.String.stripExt(name);
				name = name.replace('_', ' ', 'g');

				$('#alt').val(name);
				$('#onmouseout').val(src);
				$('#src').val(src);

				if (!$(file).data('width') || !$(file).data('height')) {
					var img = new Image();

					img.onload = function() {
						$.each(['width', 'height'], function(i, k) {
							$('#' + k + ', #tmp_' + k).val(img[k]);
						});

					};

					img.src = src;
				} else {
					$.each(['width', 'height'], function(i, k) {
						$('#' + k + ', #tmp_' + k).val($(file).data(k));
					});

				}

				// set preview
				$('#sample').attr({
					'src' : $(file).data('preview')
				}).attr($.Plugin.sizeToFit({
					width 	: $(file).data('width'),
					height 	: $(file).data('height')
				}, {
					width 	: 80,
					height 	: 60
				}));
			}
		}

	};
	window.ImageManagerDialog = ImageManagerDialog;
	tinyMCEPopup.onInit.add(ImageManagerDialog.init, ImageManagerDialog);
})();
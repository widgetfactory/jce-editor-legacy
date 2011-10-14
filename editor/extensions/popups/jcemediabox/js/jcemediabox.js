/**
 * @package      JCE Advlink
 * @copyright    Copyright (C) 2008 - 2010 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

/**
 * JCEMediaBox Popup functions
 */
(function(window, undefined) {
	window.JCEMediaBox = {
		Popup : {

			/**
			 * Addons object
			 */
			addons : {},

			/**
			 * Set Addons
			 * 
			 * @param {String}
			 *            n Addon name
			 * @param {Object}
			 *            o Addon Object
			 */
			setAddons : function(n, o) {
				if (typeof this.addons[n] == 'undefined') {
					this.addons[n] = {};
				}
				$.extend(this.addons[n], o);
			},

			/**
			 * Get all addons
			 * 
			 * @param {String}
			 *            n Optional addon name
			 */
			getAddons : function(n) {
				if (n) {
					return this.addons[n];
				}

				return this.addons;
			},

			/**
			 * Get / Test an addon object
			 * 
			 * @param {Object}
			 *            v
			 * @param {Object}
			 *            n
			 */
			getAddon : function(v, n) {
				var cp = false, r, each = tinymce.each;

				var addons = this.getAddons(n);

				$.each(addons, function(addon, o) {
					var fn = o[addon] || function() {};

					r = fn.call(this, v);
					if (typeof r != 'undefined') {
						cp = r;
					}

				});

				return cp;
			}

		},

		/**
		 * Utility function to trim whitespace from a string
		 * 
		 * @param {String}
		 *            s
		 */
		trim : function(s) {
			return $.trim(s);
		},

		/**
		 * Set proportianl dimension calculations
		 * 
		 * @param {String}
		 *            w Width
		 * @param {String}
		 *            h Height
		 */
		setDimensions : function(w, h) {
			$.Plugin.setDimensions(w, h, 'jcemediabox_popup_');
		}

	};

	WFPopups
			.addPopup(
					'jcemediabox',
					{

						setup : function() {
							var self = this;
							$('#jcemediabox_popup_icon').change(function() {
								self.setIcon();
							});
						},

						/**
						 * Check if node is a JCE MediaBox popup
						 * 
						 * @param {Object}
						 *            n Element
						 */
						check : function(n) {
							return /jce(popup|_popup|lightbox)/
									.test(n.className);
						},

						/**
						 * Get the MIME Type from a media type value
						 * 
						 * @param {Object}
						 *            mt Media type value
						 */
						getMediaType : function(n) {
							var mt = '';

							switch (n.type) {
								case 'image/gif':
								case 'image/jpeg':
								case 'image/png':
								case 'image/*':
								case 'image':
									mt = 'image';
									break;
								case 'iframe':
									mt = 'iframe';
									break;
								case 'director':
								case 'application/x-director':
									mt = 'application/x-director';
									break;
								case 'windowsmedia':
								case 'mplayer':
								case 'application/x-mplayer2':
									mt = 'application/x-mplayer2';
									break;
								case 'quicktime':
								case 'video/quicktime':
									mt = 'video/quicktime';
									break;
								case 'real':
								case 'realaudio':
								case 'audio/x-pn-realaudio-plugin':
									mt = 'audio/x-pn-realaudio-plugin';
									break;
								case 'divx':
								case 'video/divx':
									mt = 'video/divx';
									break;
								case 'flash':
								case 'application/x-shockwave-flash':
									mt = 'application/x-shockwave-flash';
									break;
								case 'ajax':
								case 'text/xml':
								case 'text/html':
									mt = 'text/html';
									break;
							}

							if (!mt && n.href) {
								var o = JCEMediaBox.Popup.getAddon(n.href);

								if (o && o.type) {
									mt = o.type;
								}
							}

							return mt;
						},

						/**
						 * Clean a link of popup attributes (does not clean rel
						 * attribute)
						 * 
						 * @param {Object}
						 *            n
						 */
						remove : function(n) {
							var ed = tinyMCEPopup.editor;

							// Cleanup
							$.each([ 'jcepopup', 'jcelightbox', 'jcebox',
									'icon-left', 'icon-right', 'icon-top-left',
									'icon-top-right', 'icon-bottom-left',
									'icon-bottom-right', 'noicon', 'noshow',
									'autopopup-single', 'autopopup-multiple' ],
									function(i, v) {
										ed.dom.removeClass(n, v);
									});

						},

						/**
						 * Convert parameter string to JSON object
						 */
						convertData : function(s) {
							var a = [];

							// if json string return object
							if (/^{[\w\W]+}$/.test(s)) {
								return $.parseJSON(s);
							}

							// split parameters
							$
									.each(
											s.split(';'),
											function(i, n) {
												if (n) {
													// get the parameter parts,
													// eg: key[value]
													var parts = /\s?([^\[]+)(\[|=|:)([^\]]*)(\]?)\s?/
															.exec(n);
													// map to array as json
													// pairs eg: "key":"value"
													if (parts
															&& parts.length > 3) {
														var k = parts[1];
														var v = parts[3];

														if (!/[^0-9]/.test(v)) {
															a
																	.push('"'
																			+ k
																			+ '":'
																			+ parseInt(v));
														} else {
															a.push('"' + k
																	+ '":"' + v
																	+ '"');
														}
													}
												}
											});

							// return object from json string
							return $.parseJSON('{' + a.join(',') + '}');
						},

						/**
						 * Get popup parameters
						 * 
						 * @param {Object}
						 *            n Popup node
						 */
						getAttributes : function(n) {
							var ed = tinyMCEPopup.editor, data = {}, rv, v;

							var rel = ed.dom.getAttrib(n, 'rel');

							// No icon
							var icon = /noicon/g.test(n.className);
							var hide = /noshow/g.test(n.className);

							// Auto popup
							if (/(autopopup(.?|-single|-multiple))/
									.test(n.className)) {
								v = /autopopup-multiple/.test(n.className) ? 'autopopup-multiple'
										: 'autopopup-single';

								$('#jcemediabox_popup_autopopup').val(v);
							}

							$('#jcemediabox_popup_icon').val(icon ? 0 : 1);
							$('#jcemediabox_popup_icon_position').prop(
									'disabled', icon);

							$('#jcemediabox_popup_hide').val(hide ? 1 : 0);

							// Get position
							if (s = /icon-(top-right|top-left|bottom-right|bottom-left|left|right)/
									.exec(n.className)) {
								$('#jcemediabox_popup_icon_position').val(s[0]);
							}

							var relRX = '(alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend)';
							var json = ed.dom.getAttrib(n, 'data-json')
									|| ed.dom.getAttrib(n, 'data-mediabox');

							if (json) {
								data = this.convertData(json);
							}

							if (rel && /\w+\[.*\]/.test(rel)) {
								if (rv = new RegExp(relRX, 'g').exec(rel)) {
									// set rel value
									$('#rel').val(rv[1]);

									rel = rel.replace(new RegExp(relRX, 'g'),
											'');
								}
								// convert to object
								data = this.convertData($.trim(rel));
							} else {
								// remove standard rel values
								group = $.trim(rel.replace(new RegExp(relRX,
										'g'), ''));

								$('#jcemediabox_popup_group').val(group);
							}

							var params = [];

							if (/::/.test(data.title)) {
								var parts = data.title.split('::');
								if (parts.length > 1) {
									data.caption = parts[1];
								}
								data.title = parts[0];
							}

							$.each(data, function(k, v) {
								if ($('#jcemediabox_popup_' + k).get(0)) {
									$('#jcemediabox_popup_' + k).val(
											decodeURIComponent(v));
									// remove from object
									delete data[k];
								} else {
									params
											.push(k + ':'
													+ decodeURIComponent(v));
								}
							});

							$('#jcemediabox_popup_params')
									.val(params.join(','));

							// Set type
							$('#jcemediabox_popup_mediatype').val(
									this.getMediaType(n));

							$.extend(data, {
								src : ed.dom.getAttrib(n, 'href'),
								type : ed.dom.getAttrib(n, 'type') || ''
							});

							return data;
						},

						/**
						 * Set Popup Attributes
						 * 
						 * @param {Object}
						 *            n Link Element
						 */
						setAttributes : function(n, args) {
							var self = this, ed = tinyMCEPopup.editor;

							this.remove(n);

							// Add jcepopup class
							ed.dom.addClass(n, 'jcepopup');

							// Autopopup
							var auto = $('#jcemediabox_popup_autopopup').val();

							if (auto) {
								ed.dom.addClass(n, auto);
							}

							var data = {};

							tinymce.each([ 'title', 'caption', 'group',
									'width', 'height', 'params' ], function(k) {
								var v = $('#jcemediabox_popup_' + k).val();

								if (k == 'params') {
									var params = v.replace(/\n\r/g, '');

									v = params ? self.convertData(params) : '';
								}

								if (v == '' || v == null) {
									if (args[k]) {
										v = args[k];
									} else {
										return;
									}
								}

								if (k == 'params') {
									v = encodeURIComponent(v);
								}

								data[k] = v;
							});

							// combine args
							$.extend(data, args.data || {});

							// combine title and caption values
							if (data.title && data.caption) {
								data.title = data.title + '::' + data.caption;
								delete data.caption;
							}

							// map object properties to options array
							var props = $.map(data, function(v, k) {
								return k + '[' + v + ']';
							});

							var rel = ed.dom.getAttrib(n, 'rel', '');
							// remove any existing properties
							if (rel) {
								rel = rel.replace(
										/([a-z0-9]+)(\[[^\]]+\])(;?)/, '');
							}

							// set data to rel attribute
							ed.dom.setAttrib(n, 'rel', $.trim(rel + ' '
									+ props.join(';')));
							// remove HTML5 data attributes if any
							ed.dom.setAttrib(n, 'data-json', '');
							ed.dom.setAttrib(n, 'data-mediabox', '');

							// Add noicon class
							if ($('#jcemediabox_popup_icon').val() == 0) {
								ed.dom.addClass(n, 'noicon');
							} else {
								ed.dom.addClass(n, $(
										'#jcemediabox_popup_icon_position')
										.val());
							}

							if ($('#jcemediabox_popup_hide').val() == 1) {
								ed.dom.addClass(n, 'noshow');
							}

							// Set target
							ed.dom.setAttrib(n, 'target', '_blank');

							var mt = $('#jcemediabox_popup_mediatype').val()
									|| n.type || args.type || '';

							// Set media type
							ed.dom.setAttrib(n, 'type', mt);
						},

						/**
						 * Set the poup icon option
						 */
						setIcon : function() {
							var v = $('#jcemediabox_popup_icon').val();

							if (parseInt(v)) {
								$('#jcemediabox_popup_icon_position')
										.removeAttr('disabled');
							} else {
								$('#jcemediabox_popup_icon_position').attr(
										'disabled', 'disabled');
							}
						},

						/**
						 * Function to call when popup extension selected
						 */
						onSelect : function() {},

						/**
						 * Call function when a file is selected / clicked
						 * 
						 * @param {Object}
						 *            args Function arguments
						 */
						onSelectFile : function(args) {
							// Set popup attributes
							$.each(args, function(k, v) {
								$('#jcemediabox_popup_' + k).val(v);
							});

						}
					});
})(window);
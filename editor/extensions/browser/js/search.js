/**
 * @package   	JCE
 * @copyright 	Copyright � 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

(function($) {

	$.widget("ui.searchables", {

		options : {
			list : null,
			items : null,
			clear : null,
			sort : null
		},

		_init : function() {
			var self = this, el = this.element;

			var clear = this.options.clear;

			if(clear) {
				$(clear).click(function(e) {
					if($(clear).hasClass('clear')) {
						$(clear).removeClass('clear');

						if($(el).val()) {
							self._reset();

							$(el).val('');
							self._trigger('onFind', e, []);
						}
					}
				});
			}

			$(el).keyup(function(e) {
				// wait...
				window.setTimeout(function() {
					self._find($(el).val(), e);
				}, 500);
			});
		},
		_find : function(s, e) {
			var self = this, x = [];

			$(this.options.clear).toggleClass('clear', !!s);

			if(/[a-z0-9_\.-]/i.test(s)) {
				$(this.options.items).each(function() {
					var f = $.String.basename($(this).attr('title')).substring(0, s.length);

					if(f.toLowerCase() == s.toLowerCase()) {
						if($.inArray(this, x) == -1) {
							x.push(this);
						}
					} else {
						var i = $.inArray(this, x);
						if(i != -1) {
							x.splice(i, 1);
						}
					}
				});
			} else {
				x = [];
			}

			if(x.length) {
				x = self._sort(x);
				self._scroll(x[0]);
			} else {
				self._reset();
			}

			self._trigger('onFind', e, x);
		},
		_scroll : function(el) {
			var pos = $(el).position();
			var top = $(this.options.list).scrollTop();

			$(this.options.list).animate({
				scrollTop : pos.top + top
			}, 1200);
		},
		_sort : function(x) {
			var a = [];

			$(this.options.items).each(function() {
				if($.inArray(this, x) != -1) {
					a.push(this);
				}
			});
			return a;
		},
		_reset : function() {
			this._scroll($('li:first', this.options.list));
		},
		destroy : function() {
			$.Widget.prototype.destroy.apply(this, arguments);
		}
	});

	$.extend($.ui.searchables, {
		version : "@@version@@"
	});

})(jQuery);

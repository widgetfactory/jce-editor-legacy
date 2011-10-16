/**
 * @version		$Id: tips.js 201 2011-05-08 16:27:15Z happy_noodle_boy $
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

/**
 * Based on the Mootools Tips class with additional options
 * Tooltip div is created when the first tooltip is initialized, not on page load
 * Changes to locate function allow tooltip to be positioned relative to the mouse pointer
 * @param {Object} tip
 */
(function($){
	
	$.support.canvas = !!document.createElement('canvas').getContext;
	
	$.widget("ui.tips", {
		
		options: {
			speed: 150,
			position: 'top center',
			opacity: 0.9,
			className: 'tooltip',
			offsets: {
				'x': 16,
				'y': 18
			},
			width: 200,
			fixed: true,
			sticky: false
		},
		
		/**
		 * Initialise the tooltip
		 * @param {Object} elements
		 * @param {Object} options
		 */
		_init: function(options) {
			var self = this;
			
			$.extend(this.options, options);
			
			if (this.options.sticky) {
				self._pin();
			} else {				
				$(this.element).click(function(e) {					
					// don't pin tip if a link or parent of a link
					if (this.nodeName == 'A' || $('a', this).length) {
						return;
					}
					
					if ($('#jce-tooltip').hasClass('sticky')) {
						return self._unpin();
					} else {
						return self._pin();
					}
				});
			}

			$(this.element).hover(
				function (e) {
					if ($('#jce-tooltip').hasClass('sticky')) {
						return;
					} 
					return self._start(e);
				},
				function () {
					if ($('#jce-tooltip').hasClass('sticky')) {
						return;
					}
					return self._end();
				}
			);
		},
		
		/**
	 	* Create the tooltip div
	 	*/
		_createTips: function() {
			var self = this, $tips = $('#jce-tooltip');
			
			if (!$tips.get(0)) {				
				$tips = $('<div id="jce-tooltip" class="jce-tooltip ui-widget ui-widget-content ui-corner-all" role="tooltip" aria-hidden="true">' +
				'<span class="ui-icon ui-icon-close" title="Close"></span>' +	
				'<div class="jce-tooltip-content"></div>' +
				'</div>').appendTo('body');
				
				if ($.support.canvas) {
					var canvas = document.createElement('canvas');
					$(canvas).attr({'width' : 14, 'height' : 14}).addClass('jce-tooltip-pointer');
					$('#jce-tooltip').append(canvas);					
				} else {
					$('#jce-tooltip').append('<div class="jce-tooltip-pointer ui-widget-content"><div class="jce-tooltip-pointer-inner"></div></div>');
				}
								
				$('span.ui-icon-close', $tips).click(function() {
					self._end();
				}).hide();

				if ($.support.cssFloat) {
					$tips.css('opacity', 0);
				}
			}
		},
		
		/**
		 * Show the tooltip and build the tooltip text
		 * @param {Object} e  Event
		 * @param {Object} el Target Element
		 */
		_start: function(e) {
			var self = this;
			// Create tooltip if it doesn't exist
			this._createTips();
			
			var $tips = $('#jce-tooltip');
			// store element
			$tips.data('source', this.element);

			// Get tooltip text from title
			var text = $(this.element).attr('title') || '', title = '';
			
			// Split tooltip text ie: title::text
			if (/::/.test(text)) {
				var parts = text.split('::');
				title 	= $.trim(parts[0]);
				text 	= $.trim(parts[1]);
			}
			// Store original title and remove
			$(this.element).data('title',  $(this.element).attr('title')).attr('title', '');
			// add aria description
			$(this.element).attr('aria-describedby', 'jce-tooltip');
			
			var h = '';
			// Set tooltip title html
			if (title) {
				h += '<h4>' + title + '</h4>';
			}
			// Set tooltip text html
			if (text) {
				h += '<p>' + text + '</p>';
			}
			
			// Set tooltip html
			$('div.jce-tooltip-content', $tips).html(h);

			if (this.options.fixed) {
				this._position();
			} else {
				this._locate(e);
			}
			
			$('div.jce-tooltip-pointer-down-inner', $tips).css({
				'border-top-color' : $tips.css('background-color')
			});

			// Set visible
			$tips.css('visibility', 'visible').attr('aria-hidden', 'false');
			
			if ($.support.cssFloat) {
				$tips.animate({
					'opacity': this.options.opacity
				}, this.options.speed);
			} else {
				if (!window.XMLHttpRequest) {
					$tips.css('width', 200);
				}
			}
		},
		
		/**
		 * Fade Out and hide the tooltip
		 * Restore the original element title
		 * @param {Object} el Element
		 */
		_end: function() {
			var $tips = $('#jce-tooltip'), element = $tips.data('source') || this.element;
			// Restore title
			$(element).attr('title', $(element).data('title'));
			// remove aria
			$(element).removeAttr('aria-describedby');			
			// Fade out tooltip and hide			
			$tips.css('visibility', 'hidden').attr('aria-hidden', 'true');
			
			if ($.support.cssFloat) {
				$tips.css('opacity', 0);
			}
			
			this._unpin();
		},
		
		_pin : function() {
			$('#jce-tooltip').addClass('sticky');
			$('span.ui-icon-close', '#jce-tooltip').show();
		},
		
		_unpin : function() {
			$('#jce-tooltip').removeClass('sticky');
			$('span.ui-icon-close', '#jce-tooltip').hide();
		},
		
		_position: function() {
			var $tips 	= $('#jce-tooltip');
			var p 		= $(this.element).offset();
			var o 		= this.options.offsets;	
			
			var tip = {
				'x': $tips.outerWidth(),
				'y': $tips.outerHeight()
			};
			
			var pos = {
				x: p.left 	- tip.x / 2 + $(this.element).outerWidth() / 2,
				y: p.top 	- (tip.y + o.y)
			};
			
			var position 	  = this.options.position;
			var scrollTop 	  = $(document).scrollTop();
			
			if (pos.y < 0 || pos.y < scrollTop) {				
				$tips.removeClass('jce-' + this.options.className + '-top');
				position = position.replace('top', 'bottom');
				$tips.addClass('jce-' + this.options.className + '-bottom');
				
				pos.y = p.top + o.y + 10;				
			} else {
				$tips.removeClass('jce-' + this.options.className + '-bottom');
				position = position.replace('bottom', 'top');
				$tips.addClass('jce-' + this.options.className + '-top');
			}
			
			var tmp = pos.x;
			
			while (pos.x < 5) {
				pos.x += 5;
			}
			
			// get default left position (eg: 50%)
			if (tmp < 0) {
				$('.jce-tooltip-pointer', $tips).css('left', p.left - pos.x + $(this.element).outerWidth() / 2);
			} else {
				$('.jce-tooltip-pointer', $tips).css('left', '50%');
			}
			
			if ($.support.canvas) {
				this._createPointer();
			}
			
			$tips.css({
				top	: pos.y,
				left: pos.x
			});
		},
		
		_createPointer : function() {
			var $tips = $('#jce-tooltip'), canvas = $('canvas', $tips).get(0), context = canvas.getContext('2d');
			
			var w = canvas.width, h = canvas.height;
			
			// clear context
			context.clearRect(0, 0, canvas.width, canvas.height);

			// Set the style properties.
			context.fillStyle   = $tips.css('background-color');
			context.strokeStyle = $tips.css('border-top-color');
			context.lineWidth   = 1.8;

			context.beginPath();
			
			if ($tips.hasClass('jce-' + this.options.className + '-top')) {
				context.moveTo(0, 0);
				context.lineTo(w/2, h);
				context.lineTo(w, 0);
			} else {
				context.moveTo(0, h);
				context.lineTo(w/2, 0);
				context.lineTo(w, h);
			}

			context.fill();
			context.stroke();
			context.closePath();
		},
		
		/**
		 * Position the tooltip
		 * @param {Object} e Event trigger
		 */
		_locate: function(e) {
			this._createTips();

			var $tips 	= $('#jce-tooltip');
			var o 		= this.options.offsets;
			
			var page = {
				'x': e.pageX,
				'y': e.pageY
			};
			
			var tip = {
				'x': $tips.outerWidth(),
				'y': $tips.outerHeight()
			};
			
			var offset = $(e.target).offset();
			
			var pos = {
				'x': page.x + o.x,
				'y': page.y + o.y
			};
			
			var position 	= this.options.position;
			var scrollTop 	= $(document).scrollTop();
			
			// Switch from bottom to top
			if ((pos.y - tip.y) < 0 || offset.top < (scrollTop + tip.y)) {
				$tips.removeClass('jce-' + this.options.className + '-top');
				position = position.replace('top', 'bottom');
				$tips.addClass('jce-' + this.options.className + '-bottom');
			} else {
				$tips.removeClass('jce-' + this.options.className + '-bottom');
				position = position.replace('bottom', 'top');
				$tips.addClass('jce-' + this.options.className + '-top');
			}

			switch (position) {
				case 'top center':
					pos.x = (page.x - Math.round((tip.x / 2))) + o.x;
					pos.y = (page.y - tip.y) - o.y;
					break;
				case 'bottom center':
					pos.x = (page.x - (tip.x/2)) + o.x;
					pos.y = page.y + o.y;
					break;
			}
			
			// nudge right or left
			if (pos.x < 0) { 
				pos.x = 5;
			}
			
			if (pos.x > parseFloat($(window).width())) {
				pos.x = parseFloat($(window).width()) - (tip.x / 2 + 5);
			}

			$tips.css({
				top	: pos.y,
				left: pos.x
			});
		},
		
		destroy: function() {
			$.Widget.prototype.destroy.apply( this, arguments );
		}
	});
	
	$.extend($.ui.tips, {
		version: "@@version@@"
	});
})(jQuery);

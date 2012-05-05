/**
 * @package                 JCE
 * @url                     http://www.joomlacontenteditor.net
 * @copyright               © 2012 Ryan Demmer. All rights reserved.
 * @license                 GNU/GPL Version 2 or later - http://www.gnu.org/licenses/gpl-2.0.html
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
(function($) {

    // Resizable aspectRatio patch
    var oldSetOption = $.ui.resizable.prototype._setOption;
    
    $.ui.resizable.prototype._setOption = function(key, value) {
        oldSetOption.apply(this, arguments);
        if (key === "aspectRatio") {
            this._aspectRatio = !!value;
        }
    };

    function getRatio(o) {
        /*// Calculate Greatest Common Diviser
		function gcd (a, b) {
			return (b == 0) ? a : gcd (b, a%b);
		}

		// get gcd for the image
		var r = gcd(o.width, o.height);
		// return ratio
		return (o.width/r) / (o.height/r);*/
		
        return o.width / o.height;
    };

    /** Depends:
	 *	jquery.ui.resizable.js
	 */
    $.widget("ui.resize", {
        options : {
            ratio : 4/3,
            width : 800,
            height: 600
        },

        _init : function() {
            var self = this;

            // store width and height
            this.width  = $(this.element).width() 	|| $(this.element).attr('width');
            this.height = $(this.element).height() 	|| $(this.element).attr('height');
			
            var pos = $(this.element).position();

            $('<div id="resize-container" class="transform-widget"/>').appendTo($(this.element).parent()).append(this.element).css(pos).resizable({
                'handles' 		: 'all',
                'aspectRatio' 	: this.options.ratio,
                containment		: 'parent',
                'start' : function() {
                    self._trigger('start', null);
                },
                'resize' : function(event, ui) {
                    var n = ui.element[0], w = Math.round(n.clientWidth), h = Math.round(n.clientHeight);

                    $(self.element).css({
                        width : w,
                        height: h
                    });
					
                    self._trigger('resize', null, {
                        width : w,
                        height: h
                    });
                },
                stop : function(event, ui) {
                    self._trigger('stop', null, ui.size);
                }
            }).draggable({
                containment	: 'parent'
            });
			
            // remove position
            $(this.element).css({
                top : '',
                left: ''
            });

            if (!$.support.cssFloat) {
                $('#resize-container').attr('unselectable', 'on');
            }

            // remove handle
            $('div.ui-resizable-handle.ui-resizable-se', '#resize-container').removeClass('ui-icon ui-icon-gripsmall-diagonal-se');
        },
		
        _getPosition : function(width, height) {
            var $parent = $('#resize-container').parent();
			
            var width 	= width 	|| this.width;
            var height 	= height 	|| this.height;
			
            return {
                left 	: ($parent.outerWidth() - width) / 2,
                top 	: ($parent.outerHeight() - height) / 2
            };
        },
		
        setSize : function(w, h) {
            var self = this, $parent = $('#resize-container').parent(), pos = this._getPosition(w, h);
            var pw = $parent.outerWidth(), ph = $parent.outerHeight();
			
            $(this.element).animate({
                width	: w,
                height	: h
            }, {
                step : function(now, fx) {
                    if (fx.prop == 'width') {
                        $('#resize-container').css('left', (pw - now) / 2);
                    }
                    if (fx.prop == 'height') {
                        $('#resize-container').css('top', (ph - now) / 2);
                    }
                }, 
				
                complete : function() {
                    self._trigger('stop', null);
                }
            });
        },
		
        setConstrain : function(s) {
            var ratio = s;

            if (s) {
                ratio = getRatio(s);
            }

            this.setRatio(ratio);
        },
		
        getRatio : function() {
            var o = $(this.element).get(0);

            return {
                x : this.options.width / $(o).width(),
                y : this.options.height / $(o).height()
            };
        },
		
        setRatio : function(ratio) {
            if ($.type(ratio) == 'undefined') {
                var r = this.getRatio();

                ratio = r.x / r.y;
            }

            $(this.element).resizable("option", "aspectRatio", ratio);
        },
		
        reset : function() {						
            var pos = this._getPosition();
			
            $('#resize-container').css({
                top 	: pos.top,
                left 	: pos.left,
                width 	: '',
                height	: ''
            });
			
            $(this.element).css({
                top   : ''
            });
        },
        remove : function() {
            $('#resize-container').parent().append(this.element);
			
            $('#resize-container').remove();
            this.destroy();
        },
        destroy: function() {
            $.Widget.prototype.destroy.apply( this, arguments );
        }
    });

    /** Depends:
	 *	jquery.ui.resizable.js
	 */
    $.widget("ui.rotate", {
        options : {},

        _init : function() {
            var self = this;

            var $parent = $(this.element).parent();

            $(this.element).wrap('<div id="rotate-container"/>');

            $('#rotate-container').css({
                'top' : ($parent.height() - $(this.element).height()) / 2,
                'left': ($parent.width() - $(this.element).width()) / 2
            });
			
            if (!$.support.cssFloat) {
                $('#rotate-container').attr('unselectable', 'on');
            }
        },
		
        rotate : function(angle) {
            var s;
			
            switch(angle) {
                default:
                    s = 'scaleY(1) scaleX(1)';
                    break;
                case '0' :
                case '90':
                case '-90':
                case '180':
                    s = 'rotate(' + angle + 'deg)';
                    break;
                case 'vertical':
                    s = 'scaleY(-1)';
                    break;
                case 'horizontal':
                    s = 'scaleX(-1)';
                    break;
                case 'vertical|horizontal':
                    s = 'scaleX(-1) scaleY(-1)';
                    break;

            }

            $(this.element).animate({
                'transform' : s
            });
        },
		
        remove : function() {
            $(this.element).unwrap();
            this.destroy();
        },
		
        destroy: function() {
            $.Widget.prototype.destroy.apply( this, arguments );
        }
    });

    /** Depends:
	 *	jquery.ui.draggable.js
	 *	jquery.ui.resizable.js
	 */
    $.widget("ui.crop", {
        options : {
            ratio : 4/3,
            width : 800,
            height: 600,
            selection : '',
            clone : null
        },

        _init : function() {
            var self = this;
			
            // store width and height
            this.width  = $(this.element).width() 	|| $(this.element).attr('width');
            this.height = $(this.element).height() 	|| $(this.element).attr('height');

            var $parent = $(this.element).parent();
            var top 	= $(this.element).css('top') || ($parent.outerHeight() - this.height) / 2;
			
            // remove position
            $(this.element).css({
                top : '',
                left: ''
            });
			
            // create clone
            var $clone 	= this.options.clone ? $(this.options.clone) : $(this.element).clone();
            // remove styles
            $clone.css('top', '');

            $('<div id="crop-container"></div>').appendTo($parent).append(this.element).append('<div id="crop-mask"/>').append(
                '<div id="crop-window"/><div id="crop-widget" class="transform-widget"/>'
                );

            var $crop  	= $('#crop-window');
            var $widget = $('#crop-widget');

            $crop.append($clone).css({
                'width' : this.width,
                'height': this.height
            });
			
            var grid;

            if ($.support.canvas) {
                grid = document.createElement('canvas');
				
                $(grid).attr({
                    width : $crop.width(),
                    height: $crop.height()
                });
				
                var ctx = grid.getContext('2d');
				
                for (var x = 0; x < grid.width; x += grid.width / 3) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, grid.height);
                }
				
                for (var y = 0; y < grid.height; y += grid.height / 3) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(grid.width, y);
                }
				
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            }

            $widget.css({
                'width' : this.width,
                'height': this.height
            }).resizable({
                'handles' 		: 'all',
                'aspectRatio' 	: this.options.ratio,
                'containment' 	: '#crop-container',
                'start'			: function(event, ui) {
                    $(grid).css({
                        width : $crop.width(),
                        height: $crop.height()
                    }).show().appendTo($crop);
					
                    self._trigger('start', null);
                },
                'resize' : function(event, ui) {
                    var n = ui.element[0], w = Math.round(n.clientWidth), h = Math.round(n.clientHeight);
					
                    $clone.css({
                        top  	: - n.offsetTop,
                        left 	: - n.offsetLeft
                    });

                    $crop.css({
                        width : w,
                        height: h,
                        top	  : n.offsetTop,
                        left  : n.offsetLeft
                    });

                    $(grid).css({
                        width : w,
                        height: h
                    });

                    self._trigger('change', null, self.getArea(true));
                },
                stop : function() {
                    self._trigger('stop', null, self.getArea(true));
                    $(grid).hide('slow').remove();
                }
            }).append(
                '<div class="ui-resizable-handle ui-border-top"></div>' +
                '<div class="ui-resizable-handle ui-border-right"></div>' +
                '<div class="ui-resizable-handle ui-border-bottom"></div>' +
                '<div class="ui-resizable-handle ui-border-left"></div>'
                );

            $('#crop-window, #crop-widget').draggable({
                'containment' : '#crop-container',
                'start' : function(event, ui) {
                    $(grid).css({
                        width : $crop.width(),
                        height: $crop.height()
                    }).show().appendTo($crop);
                },
                'drag' : function(event, ui) {
                    var top = ui.position.top, left = ui.position.left;

                    $widget.css({
                        top  : top,
                        left : left
                    });
	
                    $crop.css({
                        top  : top,
                        left : left
                    });
	
                    $clone.css({
                        top  : -top,
                        left : -left
                    });
	
                    self._trigger('change', null, self.getArea(true));
                },
                stop : function() {
                    self._trigger('stop', null, self.getArea(true));
                    $(grid).hide('slow').remove();
                }
            });

            if (!$.support.cssFloat) {
                $widget.attr('unselectable', 'on');
            }

            // remove handle
            $('div.ui-resizable-handle.ui-resizable-se', $widget).removeClass('ui-icon ui-icon-gripsmall-diagonal-se');

            $('<div id="crop-box"/>').css({
                width 	: this.width,
                height	: this.height,
                top		: top
            }).appendTo($parent).append($('#crop-container'));
			
			
            if (this.options.selection) {
                this.setArea(this.options.selection);
            }
        },
        setConstrain : function(s) {
            var ratio = s;

            if (s) {
                ratio = getRatio(s);
                this.setArea(s);
            }

            this.setRatio(ratio);
        },
        /**
		 * Get the ratio of the crop container to the crop window
		 */
        getRatio : function() {
            return {
                x : this.width / this.options.width,
                y : this.height / this.options.height
            };
        },
		
        setRatio : function(ratio) {
            $('#crop-widget').resizable("option", "aspectRatio", ratio);
        },
		
        setArea : function(o) {
            var self = this;
			
            var s = this._calculateSelection(o, {
                width : this.width,
                height: this.height
            });

            $('#crop-widget, #crop-window').animate({
                width 	: s.width,
                height	: s.height,
                left	: s.x,
                top		: s.y
            }, {
                step : function(now, fx) {
                    if (fx.elem.id == 'crop-window') {
                        $(fx.elem).children(':first').css(fx.prop, 0 - now);
                    }
					
                    self._trigger('change', null, self.getArea(true));
                },
                complete : function() {
                    self._trigger('stop', null, self.getArea(true));
                }
            });
        },
        getDimensions : function() {
            return {
                width : $('#crop-container').width(),
                height: $('#crop-container').height()
            };
        },
        _calculateSelection : function(dim, img) {
            var x = 0, y = 0;

            if (dim.width > img.width || dim.height > img.height) {
                dim = $.Plugin.sizeToFit(dim, img);
            }

            if (dim.width < img.width) {
                x = Math.floor((img.width - dim.width) / 2);
            }

            if (dim.height < img.height) {
                y = Math.floor((img.height - dim.height) / 2);
            }

            return {
                x 		: x,
                y 		: y,
                width 	: dim.width,
                height 	: dim.height
            };
        },
        getArea : function() {
            var n = $('#crop-window').get(0), c = $('#crop-container').get(0), o = this.options, rx = 1, ry = 1;

            rx = o.width / c.clientWidth;
            ry = o.height / c.clientHeight;

            return {
                x 		: Math.round(n.offsetLeft * rx, 1),
                y 		: Math.round(n.offsetTop * ry, 1),
                width 	: Math.round(n.clientWidth * rx, 1),
                height	: Math.round(n.clientHeight * ry, 1),
                cw		: n.clientWidth,
                ch 		: n.clientHeight
            };
        },
        reset : function() {
            $('#crop-widget, #crop-window').css({
                width 	: this.width,
                height	: this.height,
                left	: 0,
                top		: 0
            });
			
            $('#crop-window').children().css({
                left	: 0,
                top		: 0
            });
        },
        remove : function() {
            var $parent = $('#crop-container').parent();

            $(this.element).css('top', $parent.css('top')).appendTo($parent.parent());
            $parent.remove();

            this.destroy();
        },
        destroy: function() {
            $.Widget.prototype.destroy.apply( this, arguments );
        }
    });
})(jQuery);
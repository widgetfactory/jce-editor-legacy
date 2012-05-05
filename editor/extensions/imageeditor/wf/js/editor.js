/*
 * @package          JCE
 * @url              http://www.joomlacontenteditor.net
 * @copyright        © 2012 Ryan Demmer. All rights reserved.
 * @license          GNU/GPL Version 2 or later - http://www.gnu.org/licenses/gpl-2.0.html
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
    
    function getRatio(o) {
        // Calculate Greatest Common Diviser
        function gcd(a, b) {
            return (b == 0) ? a : gcd(b, a % b);
        }

        // get gcd for the image
        var r = gcd(o.width, o.height);
        // return ratio
        return (o.width / r) / (o.height / r);
    };

    var EditorDialog = {
        // Undo stack
        stack : [],
        
        working : false,

        settings : {
            resize_quality : 80,
            save 	: $.noop
        },

        _setLoader : function() {                        
            var $loader = $('<div class="loading" />').append('<img src="' + tinyMCEPopup.getWindowArg('plugin_url') + '/img/loader.gif" />').appendTo('#editor-image');
            
            var $canvas = $('canvas', '#editor-image');
            
            if ($canvas.get(0)) {
                $loader.css($canvas.position()).css({
                    width : $canvas.width(), 
                    height : $canvas.height()
                });
            }
            
            $('div.slider', '#editor_effects').slider('disable');
            
            this.working = true;
        },
        
        _removeLoader : function() {
            // remove loader
            $('div.loading', '#editor-image').remove();
            
            $('div.slider', '#editor_effects').slider('enable');
            
            // set global working state
            this.working = false;
        },

        init : function() {
            var self = this;
			
            // run init
            $.Plugin.init();
			
            $('#editor').removeClass('offleft');

            // window resize
            $(window).bind('resize', function() {
                self._resizeWin();
            });

            this.src = tinyMCEPopup.getWindowArg('src');

            $.extend(this.settings, {
                width 	: tinyMCEPopup.getWindowArg('width'),
                height 	: tinyMCEPopup.getWindowArg('height'),
                save	: tinyMCEPopup.getWindowArg('save')
            });

            // set container dimensions
            $('#editor-image').css({
                height 	:  $('body').height() -  $('#transform-tools').outerHeight(true) - 40,
                width 	: Math.min(Math.max(640, Math.min(this.settings.width, 1024)), $('body').width() - 390)
            });

            // set toolbox panel dimensions
            $('div.ui-tabs-panel', '#tabs').height($('#editor-image').outerHeight() -  $('ul.ui-tabs-nav', '#tabs').outerHeight() - 50);

            // set laoder
            this._setLoader();
			
            // build and store the image object			
            $('<img />').attr('src', this._loadImage($.Plugin.getURI() + this.src)).one('load', function() {
                self.image = this;
                
                // store original width and height
                $(this).data('width', this.width).data('height', this.height);	
				
                $(this).appendTo('#editor-image').addClass('offset');					
	
                // create canvas object
                $(this).canvas().after($(this).canvas('getCanvas'));
	
                self.position();

                self._createToolBox();
				
                self._createFX();
				
                // remove loader
                self._removeLoader();
            });

            $('#transform_tab').accordion({
                collapsible : true,
                active : false,
                autoHeight : false,
                changestart : function(e, ui) {
                    var action = $(ui.newHeader).data('action');

                    self.reset(true);

                    if(action) {
                        self._initTransform(action);
                    }
                }

            });

            $('#tabs').tabs('option', 'select', function() {
                self.reset(true);

                $('#transform_tab').accordion('activate', false);
				
                // reset fx units
                self._resetFX();
            });

            $('button.save', '#editor').button({
                disabled : true,
                icons: {
                    primary: "ui-icon-circle-check"
                }
            }).click(function(e) {
                self.save();
                e.preventDefault();
            });

            $('button.revert', '#editor').button({
                disabled : true,
                icons: {
                    primary: "ui-icon-circle-arrow-w"
                }
            }).click(function(e) {
                self.revert(e);
                e.preventDefault();
            });

            $('button.undo', '#editor').button({
                disabled : true,
                icons: {
                    primary: "ui-icon-arrowreturnthick-1-w"
                }
            }).click(function(e) {
                self.undo(e);
                e.preventDefault();
            });

            $('button.apply', '#editor').button({
                icons: {
                    primary: "ui-icon-check"
                }
            }).click(function(e) {
                self.apply($(this).data('function'));
                e.preventDefault();
            });
			
            $('button.reset', '#editor').button({
                disabled : true,
                icons: {
                    primary: "ui-icon-closethick"
                }
            }).click(function(e) {
                self._resetTransform($(this).data('function'));
                e.preventDefault();
            });
        },

        _createToolBox : function() {
            var self = this, $img = $(this.image), canvas = $img.canvas('getCanvas');

            var iw = canvas.width;
            var ih = canvas.height;
            // scaled width & height
            var sw = $(canvas).width();
            var sh = $(canvas).height();

            // setup presets
            $('#crop_presets option, #resize_presets option').each(function() {
                var v = $(this).val();

                if(v && /[0-9]+x[0-9]+/.test(v)) {
                    v = v.split('x');

                    var w = parseFloat(v[0]), h = parseFloat(v[1]);

                    if(w >= $img.data('width') && h >= $img.data('height')) {
                        $(this).remove();
                    }
                }
            });

            // resize presets
            $('#resize_presets').change(function() {
                var v = $(this).val();

                if(v) {
                    v = v.split('x');
                    var w = parseFloat($.trim(v[0])), h = parseFloat($.trim(v[1]));

                    $('#resize_width').val(w).data('tmp', w);
                    $('#resize_height').val(h).data('tmp', h);
					
                    var ratio = $('span.checkbox', '#resize_constrain').is('.checked') ? w / h : false;
					
                    $(canvas).resize('setRatio', ratio);
                    $(canvas).resize('setSize', w, h);
                }
            });
			
            // Add Original
            $('#resize_presets').prepend('<option value="' + iw + 'x' + ih + '" selected="selected">' + iw + ' x ' + ih + ' (' + tinyMCEPopup.getLang('imgmanager_ext_dlg.original', 'Original') + ')</option>');
	
            // Add Display 
            if (iw > sw && ih > sh) {
                $('#resize_presets').prepend('<option value="' + sw + 'x' + sh + '" selected="selected">' + sw + ' x ' + sh + ' (' + tinyMCEPopup.getLang('imgmanager_ext_dlg.display', 'Display') + ')</option>');
            }
			
            // resize values
            $('#resize_width').val(sw).data('tmp', sw).change(function() {
                var w = $(this).val(), $height = $('#resize_height');

                // if constrain is on
                if($('span.checkbox', '#resize_constrain').hasClass('checked')) {
                    var tw = $(this).data('tmp'), h = $height.val();

                    var temp = ((h / tw) * w).toFixed(0);
                    $height.val(temp).data('tmp', temp);
                }
                // store new tmp value
                $(this).data('tmp', w);

                var ratio = $('span.checkbox', '#resize_constrain').is('.checked') ? w / $height.val() : false;

                $(canvas).resize('setRatio', ratio);
                $(canvas).resize('setSize', w, $height.val());
            });

            $('#resize_height').val(sh).data('tmp', sh).change(function() {
                var h = $(this).val(), $width = $('#resize_width');

                // if constrain is on
                if($('span.checkbox', '#resize_constrain').hasClass('checked')) {
                    var th = $(this).data('tmp'), w = $width.val();

                    var temp = ((w / th) * h).toFixed(0);
                    $width.val(temp).data('tmp', temp);
                }
                // store new tmp value
                $(this).data('tmp', h);

                var ratio = $('span.checkbox', '#resize_constrain').is('.checked') ? $width.val() / h : false;

                $(canvas).resize('setRatio', ratio);
                $(canvas).resize('setSize', $width.val(), h);
            });

            // resize constrain
            $('span.checkbox', '#resize_constrain').click(function() {
                $(this).toggleClass('checked');
				
                var ratio = $(this).hasClass('checked') ? ({
                    width : $('#resize_width').val(), 
                    height : $('#resize_height').val()
                }) : false;
				
                $(canvas).resize('setConstrain', ratio);
            });

            // crop constrain
            $('#crop_constrain').click(function() {
                $(this).toggleClass('checked');

                //$(canvas).crop('setConstrain', $(this).is(':checked') ? {width : });
                if ($(this).is(':checked')) {
                    $('#crop_presets').change();
                } else {
                    $(canvas).crop('setConstrain', false);
                }			
            });

            $('#crop_presets').change(function() {
                var img = $img.get(0);

                var v = $(this).val();

                var s = {
                    width 	: img.width,
                    height 	: img.height
                };
				
                $.extend(s, $(canvas).crop('getArea'));

                if(v.indexOf(':') != -1) {
                    var r = v.split(':'), r1 = parseInt($.trim(r[0])), r2 = parseInt($.trim(r[1]));
                    var ratio = r1 / r2;

                    if(r2 > r1) {
                        ratio = r2 / r1;
                    }

                    // landscape
                    if(s.width > s.height) {
                        if(r2 > r1) {
                            ratio = r2 / r1;
                        }

                        s.height = Math.round(s.width / ratio);
                    // portrait
                    } else {
                        s.width = Math.round(s.height / ratio);
                    }
                } else {
                    v = v.split('x');
                    s.width = parseInt($.trim(v[0])), s.height = parseInt($.trim(v[1]));
                    var ratio = s.width / s.height;
                }
				
                if ($('#crop_constrain').is(':checked')) {
                    $(canvas).crop('setRatio', ratio);
                }
                $(canvas).crop('setArea', s);
            });
            // Add Display 
            if (iw > sw && ih > sh) {
                $('#crop_presets').prepend('<option value="' + sw + 'x' + sh + '" selected="selected">' + sw + ' x ' + sh + ' (' + tinyMCEPopup.getLang('imgmanager_ext_dlg.display', 'Display') + ')</option>');
            }
            // Add Original
            $('#crop_presets').prepend('<option value="' + iw + 'x' + ih + '" selected="selected">' + iw + ' x ' + ih + ' (' + tinyMCEPopup.getLang('imgmanager_ext_dlg.original', 'Original') + ')</option>');

            $('#transform-crop-cancel').click(function() {
                self.reset();
            });

            var dim = $.Plugin.sizeToFit($img.get(0), {
                width 	: 85,
                height 	: 85
            });

            $.each([90, -90], function(i, v) {
                var rotate = $img.clone().attr(dim).appendTo('#rotate_flip').hide().wrap('<div/>').after('<span class="label">' + tinyMCEPopup.getLang('imgmanager_ext_dlg.' + v, v) + '</span>');
                var canvas = $(rotate).canvas().canvas('getCanvas');
				
                $(canvas).insertAfter(rotate).click(function() {
                    self.apply('rotate', v);
                    $(rotate).canvas('rotate', v);
                });

                $(rotate).canvas('resize', dim.width, dim.height);
                $(rotate).canvas('rotate', v);
            });

            $.each(['vertical', 'horizontal'], function(i, v) {
                var flip 	= $img.clone().attr(dim).appendTo('#rotate_flip').hide().wrap('<div/>').after('<span class="label">' + tinyMCEPopup.getLang('imgmanager_ext_dlg.' + v, v) + '</span>');
                var canvas 	= $(flip).canvas().canvas('getCanvas');
				
                $(canvas).insertAfter(flip).click(function() {
                    self.apply('flip', v);
                    $(flip).canvas('flip', v);
                });

                $(flip).canvas('resize', dim.width, dim.height);
                $(flip).canvas('flip', v);
            });
        },
        
        _createFxSlider : function(fn, min, max, step) {
            var self = this;
            
            if (typeof min == 'undefined') {
                min = -100;
            }
            
            if (typeof max == 'undefined') {
                max = 100;
            }
            
            step = step || 1;
            
            // use jQuery UI slider
            if ($.support.input.type && !$.support.input.type.range) {
                return $('<div class="slider" id="fx_' + fn + '_slider" />').slider({
                    min : min,
                    max : max,
                    step: step || 1,
                    stop: function(event, ui) {
                        self.apply(fn, ui.value);
                    },
                    slide : function(event, ui) {
                        $('#slider_' + fn + '_value').val(ui.value);
                    }
                });
            }
            
            return $('<input type="range" class="slider" id="fx_' + fn + '_slider" min="' + min +  '" max="' + max +  '" step="' + step + '" />').change(function() {
                $('#slider_' + fn + '_value').val(this.value);
            }).mouseup(function() {
                self.apply(fn, this.value);
            }).range();
        },

        _createFX : function() {
            var self = this, $img = $(this.image);

            $('#editor_effects').empty();

            // Effects
            if($.support.canvas) {
                var dim = $.Plugin.sizeToFit($img.get(0), {
                    width   : 70,
                    height  : 70
                });

                $.each({
                    'brightness'    : {
                        min : -100,
                        max : 100,
                        preview : [-50, 50]
                    },
                    'contrast'    : {
                        min : -100,
                        max : 100,
                        preview : [-50, 50]
                    },
                    'saturate'   : {
                        min : -100,
                        max : 100,
                        preview : [-80, 80]
                    },
                    'sharpen'    : {
                        min : -100,
                        max : 100,
                        preview : [-50, [0.5, 3, 50]],
                        step : 10
                    }
                }, function(k, v) {
                    var fx  = $('<div class="editor_effect"/>').appendTo('#editor_effects');                   

                    var canvas1 = $img.clone().attr(dim).appendTo(fx).canvas().canvas(k, v.preview[0]).hide().canvas('getCanvas');
                    var canvas2 = $img.clone().attr(dim).appendTo(fx).canvas().canvas(k, v.preview[1]).hide().canvas('getCanvas');
                    
                    $([canvas1, canvas2]).appendTo(fx).each(function(i) {
                        $(this).click(function() {
                            $('div.slider', fx).slider('value', v.preview[i]);
                            self.apply(k, v.preview[i]);
                        });
                    });
                    
                    $(fx).append(self._createFxSlider(k, v.min, v.max, v.step)).append('<span class="label">' + tinyMCEPopup.getLang('imgmanager_ext_dlg.' + k, k) + '</span>');
                    
                    $('<input type="text" id="slider_' + k + '_value" size="4" max="100" min="-100" />').css({
                        top : dim.height
                        }).min().max().change(function() {                       
                        $('div.slider', fx).slider('value', this.value);
                        self.apply(k, this.value);
                    }).appendTo(fx);
                });

                $('<hr/>').appendTo('#editor_effects');
                
                $.each({
                    'sepia' : {
                        min : 0,
                        max : 100,
                        preview : 80
                    },
                    'colorize' : {
                        min : 0,
                        max : 100,
                        preview : [30, '#FF0000']
                    },
                    'posterize' : {
                        min : 0,
                        max : 100,
                        preview : 50
                    }
                }, function(k, v) {
                    var fx  = $('<div class="editor_effect"/>').appendTo('#editor_effects');                   
                    var img = $img.clone().attr(dim).appendTo(fx).hide();

                    var canvas = $(img).canvas().canvas(k, v.preview).canvas('getCanvas');                    
                    
                    $(canvas).appendTo(fx).click(function() {
                        $('div.slider', fx).slider('value', v.preview);
                        self.apply(k, v.preview);
                    });
                    
                    $(fx).append(self._createFxSlider(k, v.min, v.max)).append('<span class="label">' + tinyMCEPopup.getLang('imgmanager_ext_dlg.' + k, k) + '</span>');
                    
                    if (k == 'colorize') {
                        $('span.label', fx).append('<input type="text" id="colorize_color" class="color" size="5" />').get(0).onchange = function() {
                            self.apply(k, $('fx_colorize_slider').slider('value'));
                        };
                    
                        $.Plugin.createColourPickers();
                        $('input.color', fx).hide();
                    }
                });
                
                $('<hr/>').appendTo('#editor_effects');

                $.each(['greyscale', 'threshold', 'invert'], function(i, v) {
                    var fx  = $('<div class="editor_effect"/>').appendTo('#editor_effects');
                    var img = $img.clone().attr(dim).appendTo(fx).hide();
                    
                    var canvas = $(img).canvas().canvas('resize', dim.width, dim.height).canvas(v).canvas('getCanvas');
					
                    fx.data('state', 0);
					
                    $(canvas).appendTo(fx).click(function() {
                        // reset units and hide controls
                        $('div.editor_effect_unit', '#editor_effects').data('unit', 0).hide();
                        $('div.editor_effect', '#editor_effects').not(fx).data('state', 0);
						
                        var s = fx.data('state');
						
                        if (s == 0) {
                            self.apply(v);
                            s = 1;
                        } else {
                            self.undo();
                            s = 0;
                        }
						
                        fx.data('state', s);
                    });
                    
                    $(fx).append('<span class="label">' + tinyMCEPopup.getLang('imgmanager_ext_dlg.' + v, v) + '</span>');
                });

            }
        },
		
        _resetFX : function() {
            $('div.slider', '#editor_effects').slider('value', 0);
            $('input[type="text"]', '#editor_effects').val('');
        },

        _resizeWin : function() {

        },

        _initTransform : function(fn) {
            var self = this;
			
            var img = this.image;
            var canvas = $(img).canvas('getCanvas');
			
            this.position();

            switch (fn) {
                case 'resize' :
				
                    $(canvas).resize({
                        width 	: canvas.width,
                        height 	: canvas.height,
                        ratio 	: $('span.checkbox', '#resize_constrain').is('.checked') ? getRatio(canvas) : false,
                        resize 	: function(e, size) {
                            $('#resize_width').val(size.width);
                            $('#resize_height').val(size.height);
                        },
                        stop 	: function() {
                            $('#resize_reset').button('enable');
                        }
                    });

                    break;
                case 'crop'	:

                    $(canvas).crop({
                        width 	: canvas.width,
                        height 	: canvas.height,
                        ratio 	: $('#crop_constrain').is(':checked') ? getRatio(canvas) : false,
                        clone 	: $(img).canvas('clone'),
                        stop 	: function() {
                            $('#crop_reset').button('enable');
                        }
                    });

                    break;
                case 'rotate' :

                    break;
            }
        },
		
        _resetTransform : function(fn) {
            var img = this.image, canvas = $(img).canvas('getCanvas');

            switch (fn) {
                case 'resize' :
				
                    this.position();
				
                    $(canvas).resize('reset');
                    $('#resize_reset').button('disable');
					
                    var w = $(canvas).width() 	|| canvas.width;
                    var h = $(canvas).height() 	|| canvas.height;
					
                    $('#resize_width').val(w).data('tmp', w);
                    $('#resize_height').val(h).data('tmp', h);
					
                    $('#resize_presets').val($('#resize_presets option:first').val());

                    break;
                case 'crop'	:

                    $(canvas).crop('reset');
                    $('#crop_reset').button('disable');
					
                    $('#crop_presets').val($('#crop_presets option:first').val());

                    break;
                case 'rotate' :

                    break;
            }
        },
        
        _undo : function() {
            // revert to saved
            if(!this.stack.length) {
                return this.revert();
            }

            $(this.image).canvas('undo'); 
        },

        undo : function(e) {
            this.stack.pop();

            this._undo();
            
            this.position();
	
            if (e) {
                this._resetFX();
            }
        },

        revert : function(e) {           
            $(this.image).canvas('clear').canvas('draw');

            this.stack = [];

            $('button.undo').button('disable');
            $('button.revert').button('disable');
            $('button.save').button('disable');
			
            this.position();
			
            if (e) {
                this._resetFX();
            }
        },

        reset : function(rw) {
            var self = this, $img = $(this.image), canvas = $img.canvas('getCanvas');
			
            $.each(['resize', 'crop', 'rotate'], function(i, fn) {
                self._resetTransform(fn);
            });	
			
            if (rw) {
                $(canvas).resize("remove").crop("remove").rotate("remove");
            }
					
            this.position();
        },

        position : function() {
            var self = this, $img = $(this.image), canvas = $img.canvas('getCanvas');
            var pw = $('#editor-image').width(), ph = $('#editor-image').height();

            var pct = 10;
			
            $(canvas).css({
                width : '',
                height: ''
            });
			
            if (canvas.width > canvas.height) {
                while($(canvas).width() > pw) {
                    $(canvas).width(pw - (pw / 100 * pct));
                    pct += 10;
                }
				
                $(canvas).height('');
            } else {
                while($(canvas).height() > ph) {
                    $(canvas).height(ph - (ph / 100 * pct));
                    pct += 10;
                }
				
                $(canvas).width('');
            }
			
            var ch = $(canvas).height() || canvas.height;
			
            $(canvas).css({
                'top' : (ph - ch) / 2
            });
        },
        
        filter : function(k, v, server) {
            var self = this, $img = $(this.image), canvas = $img.canvas('getCanvas');
            
            if ($.type(v) == 'number' && v == 0) {
                return this.undo();
            }

            if (this.stack.length && this.stack[this.stack.length - 1].task == k) {                
                this._undo();
            }

            // show loading icon
            this._setLoader();

            if (server) {
                var name = $.String.basename(self.src);       
                var data = $img.canvas('output', self.getMime(name));
            
                $.JSON.request('applyFilter', {
                    'json' : [k, v],
                    'data' : data
                }, function(o) {

                    if(o.error && o.error.length) {
                        self._removeLoader();
                    
                        $.Dialog.alert(o.error);
                    }
                
                    var img = new Image();
                
                    img.onload = function() {
                        $img.canvas('draw', this);                    
                        self._removeLoader();
                    };
                
                    img.src = o.data;  
                }); 
            } else {                
                window.setTimeout(function() {
                    $img.canvas(k, v, true);
                }, 10);
   
                window.setTimeout(function() {
                    self._removeLoader();
                }, 200);    
            }

        },

        apply : function() {
            var self = this, $img = $(this.image), canvas = $img.canvas('getCanvas');

            var args = $.makeArray(arguments);

            var fn   = args.shift();           
            var v    = args.shift();
 
            switch (fn) {
                case 'resize' :
                    var w = $('#resize_width').val();
                    var h = $('#resize_height').val();

                    $img.canvas('resize', w, h, true);
                    args = [w, h];
					
                    self.position();

                    break;
                case 'crop' :
                    var s = $(canvas).crop('getArea');

                    $img.canvas('crop', s.width, s.height, s.x, s.y, true);
                    $img.canvas('resize', s.cw, s.ch);
					
                    args = [s.width, s.height, s.x, s.y];

                    $('#transform_tab').accordion('activate', false);
					
                    self.position();

                    break;
                case 'rotate' :
                    $img.canvas('rotate', v, true);

                    self.position();

                    break;
                case 'flip' :
                    $img.canvas('flip', v, true);
					
                    self.position();

                    break;
                case 'blur':
                case 'sharpen':
                    
                    /*if (v < 0) {
                        self.filter(fn, v);
                    } else {
                        self.filter(fn, [0.5, 3, v]);
                    }*/
                                    
                    self.filter(fn, v, true);                

                    break;
                case 'brightness':
                case 'contrast':
                    self.filter(fn, v);
                    break;
                case 'saturate' :

                    self.filter(fn, v);

                    break;
                case 'threshold':
                case 'posterize':
                    self.filter(fn, v);

                    break;
                case 'sepia' :
                    self.filter(fn, v);
                    break;
                case 'colorize' :
                    self.filter(fn, [v, $('#colorize_color').val()]);
                    break;
                case 'greyscale' :               
                case 'invert' :
                case 'halftone':
                    
                    self.filter(fn);
                    
                    break;
            }
            
            this.stack.push({
                task : fn, 
                args : args
            });

            $('button.undo').button('enable');
            $('button.revert').button('enable');
            $('button.save').button('enable');

            this.reset(true);
        },

        getMime : function(s) {
            var mime 	= 'image/jpeg';
            var ext 	= $.String.getExt(s);
			
            switch (ext) {
                case 'jpg':
                case 'jpeg':
                    mime = 'image/jpeg';
                    break;
                case 'png':
                    mime = 'image/png';
                    break;
                case 'bmp':
                    mime = 'image/bmp';
                    break;
            }

            return mime;
        },

        /**
     * Create save stack
     */
        save : function(name) {
            var self = this, $img = $(this.image), canvas = $img.canvas('getCanvas');

            // nothing to save...
            if(!this.stack.length) {
                return;
            }

            var extras  = '<div class="row">' 
            + '<label for="image_quality">' 
            + tinyMCEPopup.getLang('imgmanager_ext_dlg.quality', 'Quality') 
            + '</label>' 
            + '<div id="image_quality_slider" class="slider"></div>' 
            + '<input type="text" id="image_quality" value="100" class="quality" /> %' 
            + '</div>';

            var name = $.String.basename(this.src);
            name = $.String.stripExt(name);
            var ext = $.String.getExt(this.src);

            $.Dialog.prompt(tinyMCEPopup.getLang('imgmanager_ext_dlg.save_image', 'Save Image'), {
                text : tinyMCEPopup.getLang('dlg.name', 'Name'),
                elements : extras,
                height : 180,
                value : name,
                onOpen : function() {
                    $('#image_quality_slider').slider({
                        min : 10,
                        step : 10,
                        slide : function(event, ui) {
                            $('#image_quality').val(ui.value);
                        },

                        value : 100
                    });
                },

                confirm : function(name) {
                    var quality = $('#image_quality').val() || 100;

                    self._setLoader();
                    
                    name = (name + '.' + ext) || $.String.basename(self.src);

                    var data = $img.canvas('output', self.getMime(name), quality);

                    $.JSON.request('saveImage', {
                        'json' : [self.src, name, self.stack],
                        'data' : data
                    }, function(o) {
                        self._removeLoader();

                        if(o.error && o.error.length) {
                            $.Dialog.alert(o.error);
                        }

                        if(o.files) {
                            self.src = o.files[0];
                        }

                        // refresh image and reset
                        $img.attr('src', self._loadImage($.Plugin.getURI() + self.src)).load(function() {
                            self._createFX();

                            $(this).canvas('remove').canvas();
                            
                            self.image = this;
                        });
						
                        var s = self.settings;
						
                        // fire save callback
                        s.save.apply(s.scope || self, [self.src]);

                        // clear stack
                        self.stack = [];
                        // disable undo / revert
                        $('button.undo').button('disable');
                        $('button.revert').button('disable');
                        $('button.save').button('disable');
                    });

                    $(this).dialog('close');
                }
            });
        },

        _loadImage : function(src) {
            return src + '?' + new Date().getTime();
        }

    };

    window.EditorDialog = EditorDialog;
})(jQuery);

(function($) {

    var matrix = {
        "blur"      : [0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111, 0.111],
        "sharpen"   : [0, -1, 0, -1, 5, -1, 0, -1, 0]
    };
    
    $.support.canvas = !!document.createElement('canvas').getContext;

    $.widget("ui.canvas", {

        stack : [],
		
        options : {},

        _create : function() {
            if ($.support.canvas) {
                // create canvas
                this.canvas = document.createElement('canvas');
                // store context
                this.context = this.canvas.getContext('2d');
				
                this.draw();
            } else {
                return false;
            }
        },

        getContext : function() {
            return this.context;
        },

        getCanvas : function() {
            return this.canvas;
        },
		
        setSize : function(w, h) {
            $.extend(this.options, {
                width : w,
                height: h
            });
			
            this.draw();
        },
		
        draw : function(el) {
            el = el || $(this.element).get(0);
            
            // save state
            this.save();
         
            var w = this.options.width || el.width, h = this.options.height || el.height;
			
            $(this.canvas).attr({
                width : w,
                height: h
            });
			
            this.context.drawImage(el, 0, 0, w, h);
        },

        copy : function() {
            return $(this.canvas).clone().get(0);
        },

        clone : function() {
            var copy = this.copy();
			
            copy.getContext('2d').drawImage(this.canvas, 0, 0);
			
            return copy;
        },

        clear : function() {
            var ctx = this.context;

            var w = $(this.element).width(), h = $(this.element).height();

            if (ctx) {
                ctx.clearRect(0, 0, w, h);
            } 
        },

        resize : function(w, h, save) {
            var ctx = this.context;
			
            w = parseInt(w), h = parseInt(h);

            if (ctx) {
				
                if (save) {
                    this.save();
                }

                var copy = this.copy();
				
                $(copy).attr({
                    width : w,
                    height: h
                });

                copy.getContext('2d').drawImage(this.canvas, 0, 0, w, h);
				
                $(this.canvas, copy).attr({
                    width : w,
                    height: h
                });
			
                ctx.drawImage(copy, 0, 0);
            }
        },
        
        /**
         * Crop an image
         * @param w {integer} Crop width
         * @param h {integer} Crop height
         * @param x {integer} Crop position
         * @param y {integer} Crop position
         * @param save {boolean} Save before performing action 
         */ 
        crop : function(w, h, x, y, save) {
            var ctx = this.context;

            w = parseInt(w), h = parseInt(h), x = parseInt(x), y = parseInt(y);

            if (ctx) {
                if (save) {
                    this.save();
                }

                if (x < 0)
                    x = 0;
                if (x > this.canvas.width - 1) {
                    x = this.canvas.width - 1;
                }

                if (y < 0)
                    y = 0;
                if (y > this.canvas.height -1 ) {
                    y = this.canvas.height - 1;
                }

                if (w < 1)
                    w = 1;
                if (x + w > this.canvas.width) {
                    w = this.canvas.width - x;
                }

                if (h < 1)
                    h = 1;
                if (y + h > this.canvas.height) {
                    h = this.canvas.height - y;
                }

                var copy = this.copy();

                copy.getContext('2d').drawImage(this.canvas, 0, 0);

                $(this.canvas).attr({
                    width : w,
                    height: h
                });

                ctx.drawImage(copy, x, y, w, h, 0, 0, w, h);
            }
        },
        /**
         *Simple rotate on 90 degree increments
         */
        rotate : function(angle, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height, cw, ch;
            
            if (angle < 0) {
                angle = angle + 360;
            }
            
            switch(angle){
                case 90:
                case 270:
                    cw = h;
                    ch = w;
                    break;
                case 180:
                    cw = w;
                    ch = h;
                    break;
            }

            if (ctx) {
                if (save) {
                    this.save();
                }

                var copy = this.clone();
				
                $(this.canvas).attr({
                    width : cw,
                    height: ch
                });

                ctx.translate(cw / 2, ch / 2);
                ctx.rotate(angle * Math.PI / 180);
                ctx.drawImage(copy, -w / 2, -h / 2);

            }			
        },
        /**
         * Flip an image veritcally or horizontally
         * @param axis {string} Axis to flip on
         * @param save {boolean} Save before performing action 
         */ 
        flip : function(axis, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (ctx) {
                if (save) {
                    this.save();
                }

                var copy = this.copy();
                copy.getContext('2d').drawImage(this.canvas, 0, 0, w, h, 0, 0, w, h);
				
                ctx.clearRect(0, 0, w, h);
				
                $(this.canvas).attr({
                    width : w,
                    height: h
                });
				
                if (axis == "horizontal") {
                    ctx.scale(-1,1);
                    ctx.drawImage(copy, -w, 0, w, h);
                } else {
                    ctx.scale(1,-1);
                    ctx.drawImage(copy, 0, -h, w, h);
                }

            }
        },
	
        /* Greyscale filter
         * http://www.html5canvastutorials.com/advanced/html5-canvas-grayscale-image-colors-tutorial/
         */
        greyscale : function(save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {
                this.save();
            }

            var imgData = ctx.getImageData(0, 0, w, h);
            var data = imgData.data;

            for (var i=0, len = data.length; i<len; i+=4) {
                var v = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
 
                data[i] = v; // red
                data[i + 1] = v; // green
                data[i + 2] = v; // blue
            }

            ctx.putImageData(imgData, 0, 0);
        },
        
        colorize : function(values, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {
                this.save();
            }
            
            var imgData = ctx.getImageData(0, 0, w, h);
            var data    = imgData.data;
            
            function diff(dif, dest, src) {              
                return (dif * dest + (1 - dif) * src);
            }
            
            var amount  = values.shift();
            var color   = values.shift();
            
            amount = Math.max(0, Math.min(1, amount / 100));
            
            if (!color) {
                color = '#FFFFFF';
            }
                        
            if ($.type(color, 'string')) {
                color = this.toRGBArray(color);
            }

            for (var i=0, len = data.length; i<len; i+=4) {
                
                var r = data[i];
                var g = data[i+1];
                var b = data[i+2];

                // change image colors
                data[i]   = diff(amount, color[0], r);
                data[i+1] = diff(amount, color[1], g);
                data[i+2] = diff(amount, color[2], b);

            }

            ctx.putImageData(imgData, 0, 0);
        },

        sepia : function(amount, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {
                this.save();
            }
            
            var imgData = ctx.getImageData(0, 0, w, h);
            var data    = imgData.data;
            
            function diff(dif, dest, src) {              
                return (dif * dest + (1 - dif) * src);
            }
            
            amount = Math.max(0, Math.min(1, amount / 100));
               
            for (var i=0, len = data.length; i<len; i+=4) {
                
                var r = data[i];
                var g = data[i+1];
                var b = data[i+2];

                // change image colors
                data[i]   = diff(amount, (r * 0.393 + g * 0.769 + b * 0.189), r);
                data[i+1] = diff(amount, (r * 0.349 + g * 0.686 + b * 0.168), g);
                data[i+2] = diff(amount, (r * 0.272 + g * 0.534 + b * 0.131), b);

            }

            ctx.putImageData(imgData, 0, 0);
        },

        /*
         * Invert Colours
         * http://www.html5canvastutorials.com/advanced/html5-canvas-invert-image-colors-tutorial/
         */ 
        invert : function(save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {
                this.save();
            }

            var imgData = ctx.getImageData(0, 0, w, h);
            var data    = imgData.data;

            for (var i=0, len = data.length; i<len; i+=4) {
                data[i]     = 255 - data[i]; // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
            }

            ctx.putImageData(imgData, 0, 0);
        },
		
        threshold : function(threshold, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {
                this.save();
            }

            var imgData = ctx.getImageData(0, 0, w, h);
            var data = imgData.data;
			
            threshold = (parseInt(threshold) || 128) * 3;
			
            // Loop through data.
            for (var i=0, len = data.length; i<len; i+=4) {
                
                var v = data[i] + data[i + 1] + data[i + 2] >= threshold ? 255 : 0;
	
                // Assign average to red, green, and blue.
                data[i]     = v;
                data[i + 1] = v;
                data[i + 2] = v;
            }
	        
            ctx.putImageData(imgData, 0, 0);
        },


        brightness : function(amount, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;
            
            amount = 1 + Math.min(100,Math.max(-100,amount)) / 100;

            if (save) {
                this.save();
            }

            var imgData = ctx.getImageData(0, 0, w, h);
            var data 	= imgData.data;
            
            for (var i=0, len = data.length; i<len; i+=4) {
                
                var r = data[i];
                var g = data[i+1];
                var b = data[i+2];

                // change image colors
                data[i]   = Math.max(0, Math.min(255, r  * amount));
                data[i+1] = Math.max(0, Math.min(255, g  * amount));
                data[i+2] = Math.max(0, Math.min(255, b  * amount));
            }
			
            ctx.putImageData(imgData, 0, 0);
        },
        
        contrast : function(amount, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            amount = Math.max(-100, Math.min(100, amount));

            var factor = 1;
            
            if (amount > 0) {
                factor = 1 + (amount / 100);
            } else {
                factor = (100 - Math.abs(amount)) / 100;
            }
            
            if (save) {
                this.save();
            }

            var imgData 	= ctx.getImageData(0, 0, w, h);
            var data 		= imgData.data;
            
            function n(x) {                
                return Math.max(0, Math.min(255, x));
            }
            
            for (var i=0, len = data.length; i<len; i+=4) {
                
                var r = data[i];
                var g = data[i+1];
                var b = data[i+2];

                // change image contrast
                data[i]   = n(factor * (r - 128) + 128);                   
                data[i+1] = n(factor * (g - 128) + 128);
                data[i+2] = n(factor * (b - 128) + 128);
            }
			
            ctx.putImageData(imgData, 0, 0);
          
        },

        saturate : function(v, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;
            
            v = parseFloat(v) / 100;
            v = Math.max(-1, Math.min(1, v));

            if (save) {
                this.save();
            }

            var imgData 	= ctx.getImageData(0, 0, w, h);
            var data 		= imgData.data;
            
            for (var i=0, len = data.length; i<len; i+=4) {
                var r = data[i];
                var g = data[i+1];
                var b = data[i+2];
                
                var average = (r + g + b) / 3;
                
                data[i  ] += Math.round( ( r - average ) * v );
                data[i+1] += Math.round( ( g - average ) * v );
                data[i+2] += Math.round( ( b - average ) * v );
            }
	
            ctx.putImageData(imgData, 0, 0);
        },
        
        convolution : function(input, output, matrix, amount) {
            //var width = input.width, height = input.height;
            
            var width = this.canvas.width, height = this.canvas.height;

            // speed up access
            var data = input.data, buffer = output.data;

            // calculate the size of the matrix
            var matrixSize = Math.sqrt(matrix.length);
            // also store the size of the kernel radius (half the size of the matrix)
            var kernelRadius = Math.floor(matrixSize / 2);
            
            function convert(x, y, w) {
                return x + (y * w);
            }
            
            function diff(dif, dest, src) {              
                return (dif * dest + (1 - dif) * src);
            }

            // loop through every pixel
            for (var i = 1; i < width - 1; i++) {
                for (var j = 1; j < height - 1; j++) {
                    // temporary holders for matrix results
                    var sumR = sumG = sumB = 0;

                    // loop through the matrix itself
                    for (var h = 0; h < matrixSize; h++) {
                        for (var w = 0; w < matrixSize; w++) {

                            // get a refence to a pixel position in the matrix
                            var ref = convert(i + w - kernelRadius, j + h - kernelRadius, width) << 2;

                            // find RGB values for that pixel
                            var r = buffer[ref];
                            var g = buffer[ref + 1];
                            var b = buffer[ref + 2];
 
                            // apply the value from the current matrix position
                            sumR += r * matrix[w + h * matrixSize];
                            sumG += g * matrix[w + h * matrixSize];
                            sumB += b * matrix[w + h * matrixSize];
                        }
                    }
                    
                    // get a reference for the final pixel
                    var ref = convert(i, j, width) << 2;

                    buffer[ref]       = diff(amount, sumR, data[ref]);
                    buffer[ref + 1]   = diff(amount, sumG, data[ref + 1]);
                    buffer[ref + 2]   = diff(amount, sumB, data[ref + 2]);
                }
            }
            
            return output;
        },
        
        sharpen : function(values, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;
            
            var radius = 0, threshold = 1, amount = 0;
            
            if ($.type(values) == 'array') {
                radius      = values.shift();
                threshold   = values.shift();
                amount      = values.shift();
            } else {
                amount = values;
            }
            
            //amount = amount / 100;
            
            if (amount < 0) {
                return this.blur(Math.abs(amount) / 10, save);
            }
            
            if (save) {
                this.save();
            }
            
            var imgData     = ctx.getImageData(0, 0, w, h);
            var data        = imgData.data;
            
            threshold--;
            var thresholdNeg = -threshold;

            amount *= 0.016;
            amount++;
            
            //amount *= 10;

            var scale   = 3;
            
            var blur    = this.clone();
            blur.width  = w;
            blur.height = h;
            var blurCtx = blur.getContext("2d");

            var copy    = this.clone();
            copy.width  = Math.round(w / scale);
            copy.height = Math.round(h / scale);

            var copyCtx = copy.getContext("2d");
            
            for (var i=0; i < amount; i++) {
                var sw = Math.max(1, Math.round(copy.width - i));
                var sh = Math.max(1, Math.round(copy.height - i));
	
                copyCtx.clearRect(0,0, copy.width, copy.height);
	
                copyCtx.drawImage(blur, 0, 0, w, h, 0, 0, sw, sh);
	
                blurCtx.drawImage(copy, 0, 0, sw, sh, 0, 0, w, h);
            }
            
            var blurData = blurCtx.getImageData(0, 0, w, h).data;

            var w4  = w*4;
            var y   = h;
            do {
                var offsetY = (y-1)*w4;
                var x = w;
                do {
                    var offset = offsetY + (x*4-4);

                    var difR = data[offset] - blurData[offset];
                    if (difR > threshold || difR < thresholdNeg) {
                        var blurR = blurData[offset];
                        blurR = amount * difR + blurR;
                        data[offset] = blurR > 255 ? 255 : (blurR < 0 ? 0 : blurR);
                    }

                    var difG = data[offset+1] - blurData[offset+1];
                    if (difG > threshold || difG < thresholdNeg) {
                        var blurG = blurData[offset+1];
                        blurG = amount * difG + blurG;
                        data[offset+1] = blurG > 255 ? 255 : (blurG < 0 ? 0 : blurG);
                    }

                    var difB = data[offset+2] - blurData[offset+2];
                    if (difB > threshold || difB < thresholdNeg) {
                        var blurB = blurData[offset+2];
                        blurB = amount * difB + blurB;
                        data[offset+2] = blurB > 255 ? 255 : (blurB < 0 ? 0 : blurB);
                    }

                } while (--x);
            } while (--y);
            
            ctx.putImageData(imgData, 0, 0);
        },
        /**
         * Quick Blur adapated from https://github.com/ceramedia/examples/blob/gh-pages/canvas-blur/v5/canvas-image.js
         */
        blur : function(amount, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {                
                this.save();
            }
            
            amount /= 2;
            
            ctx.globalAlpha = 0.5;
            
            var scale   = 2;
            
            var copy    = this.clone();
            copy.width  = Math.round(w / scale);
            copy.height = Math.round(w / scale);

            var copyCtx = copy.getContext("2d");
            
            for (var i=0; i < amount; i++) {
                var sw = Math.max(1, Math.round(copy.width - i));
                var sh = Math.max(1, Math.round(copy.height - i));
	
                copyCtx.clearRect(0,0, copy.width, copy.height);
	
                copyCtx.drawImage(this.canvas, 0, 0, w, h, 0, 0, sw, sh);
	
                ctx.drawImage(copy, 0, 0, sw, sh, 0, 0, w, h);
            }
            
            ctx.globalAlpha = 1.0;
        },
        
        posterize : function(amount, save) {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            if (save) {
                this.save();
            }

            var imgData 	= ctx.getImageData(0, 0, w, h);
            var data 		= imgData.data;
	
            var areas   = 100 / amount;
            var values  = 100 / (amount - 1);
            
            for (var i=0, len = data.length; i<len; i+=4) {
                var r = data[i];
                var g = data[i+1];
                var b = data[i+2];
                
                data[i  ] = values * (r / areas);//diff(opacity, values * ((r / areas)>>0), r);
                data[i+1] = values * (g / areas);//diff(opacity, values * ((g / areas)>>0), g);
                data[i+2] = values * (b / areas);//diff(opacity, values * ((b / areas)>>0), b);
            }
	
            ctx.putImageData(imgData, 0, 0);
        },
                
        watermark : function(mark, options, save) {
            var self = this, ctx = this.context, w = this.canvas.width, h = this.canvas.height, type = 'text';
            
            var settings = {
                color         : '#FFFFFF',
                opacity       : 50,
                font_size     : '36px',
                font_style    : 'sans-serif',
                position      : 'center',
                padding       : 10,
                angle         : 0
            };
            
            $.extend(settings, options);
            
            if ($.type(mark) === 'object' && mark.src && /\.(jpg|jpeg|png|gif)$/i.test(mark.src)) {
                type = 'image';
            } 
 
            var pos = {
                x : w / 2,
                y : h / 2
            }
            
            var align = 'center';
            
            switch(settings.position) {
                default:
                case 'center':
                    if (type == 'image') {
                        pos.x = pos.x - mark.width  / 2;
                        pos.y = pos.y - mark.height / 2;
                    }
                    break;
                case 'top-left':
                    pos.x = 0;
                    pos.y = parseInt(settings.font_size) + settings.padding;
                    
                    if (type == 'image') {
                        pos.x = settings.padding;
                        pos.y = settings.padding;
                    }

                    align = 'left';

                    break;
                case 'top-right':
                    pos.x = w - settings.padding;
                    pos.y = parseInt(settings.font_size) + settings.padding;
                    
                    if (type == 'image') {
                        pos.x = pos.x - mark.width;
                        pos.y = settings.padding;
                    }

                    align = 'right';

                    break;
                case 'center-left':
                    pos.x = 0 + settings.padding;
                    pos.y = h / 2;
                    
                    if (type == 'image') {
                        pos.y = pos.y - mark.height / 2;
                    }

                    align = 'left';

                    break;
                case 'center-right':
                    pos.x = w - settings.padding;
                    pos.y = h / 2;
                    
                    if (type == 'image') {
                        pos.x = pos.x - mark.width;
                        pos.y = pos.y - mark.height / 2;
                    }

                    align = 'right';

                    break;
                case 'top-center':
                    pos.x = w / 2;
                    pos.y = 0 + parseInt(settings.font_size) + settings.padding;
                    
                    if (type == 'image') {
                        pos.x = pos.x - mark.width / 2;
                    }

                    align = 'center';

                    break;
                case 'bottom-center':
                    pos.x = w / 2;
                    pos.y = h - settings.padding;
                    
                    if (type == 'image') {
                        pos.x = pos.x - mark.width / 2;
                        pos.y = pos.y - mark.height;
                    }

                    align = 'center';

                    break;
                case 'bottom-left':
                    pos.x = 0 + settings.padding;
                    pos.y = h - settings.padding;
                    
                    if (type == 'image') {
                        pos.y = pos.y - mark.height;
                    }

                    align = 'left';

                    break;
                case 'bottom-right':
                    pos.x = w - settings.padding;
                    pos.y = h - settings.padding;
                    
                    if (type == 'image') {
                        pos.x = pos.x - mark.width;
                        pos.y = pos.y - mark.height;
                    }

                    align = 'right';

                    break;
            }
            
            if (settings.angle) {
                settings.angle = parseFloat(settings.angle);
                
                if (settings.angle < 0) {
                    settings.angle = 360 + settings.angle;
                }
                
                var radian = settings.angle * Math.PI / 180;
                
                var o = {
                    x: Math.round(w / 2),
                    y: Math.round(h / 2)
                };
                
                ctx.translate(o.x, o.y);
                ctx.rotate(radian);
                ctx.translate(-o.x, -o.y);
            }
            
            
            // convert to RGB array
            settings.color = this.toRGBArray(settings.color);
            
            // convert opacity
            settings.opacity = Math.max(Math.min(parseInt(settings.opacity), 100), 10);
            // divide by 100 to give value between 0.1 and 1
            settings.opacity = settings.opacity / 100;

            if (save) {
                this.save('watermark');
            }  

            // text
            if (type == 'text') {
                // add opacity to color array
                settings.color.push(settings.opacity);
                
                // make sure font size is valid (px by default)
                if (/(px|pt|em)/i.test(settings.font_size) === false) {
                    settings.font_size += 'px';
                }

                ctx.font            = settings.font_size + ' ' + settings.font_style;
                ctx.textAlign       = align;
                ctx.fillStyle       = 'rgba(' + settings.color.join(',') + ')';
                ctx.fillText(mark, pos.x, pos.y);
            }
            
            // image
            if (type == 'image') {                                                                         
                ctx.globalAlpha = settings.opacity;
                ctx.drawImage(mark, pos.x, pos.y, mark.width, mark.height);
            }
        },
        
        toRGBArray : function(s) {
            if (s.indexOf('#') != -1) {
                s = s.replace(new RegExp('[^0-9A-F]', 'gi'), '');

                var r = parseInt(s.substring(0, 2), 16);
                var g = parseInt(s.substring(2, 4), 16);
                var b = parseInt(s.substring(4, 6), 16);

                return [r, g, b];
            }
            
            return s.replace(/[^0-9,]+/g, '').split(',');
        },
		
        save : function() {
            var ctx = this.context, w = this.canvas.width, h = this.canvas.height;

            this.stack.push({
                width 	: w,
                height	: h,
                data	: ctx.getImageData(0, 0, w, h)
            });
        },
        
        /**
         * Restore canvas to its original state
         */
        restore : function() {
            var ctx = this.context, img = $(this.element).get(0);
            
            ctx.restore();
            ctx.drawImage(img, 0, 0);
        },

        /**
         * Undo the last action
         */
        undo : function() {
            var ctx = this.context, img = $(this.element).get(0);

            var props = this.stack.pop();
			
            $(this.canvas).attr({
                width : props.width,
                height: props.height
            });

            if (props.data) {
                ctx.putImageData(props.data, 0, 0);
            } else {
                this.restore();
            }
        },

        load : function() {
            var ctx = this.context;
			
            var w = this.canvas.width, h = this.canvas.height;
			
            var data = ctx.getImageData(0, 0, w, h);
            ctx.clearRect(0, 0, w, h);
            ctx.putImageData(data, 0, 0);
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
		
        output : function(mime, quality) {			
            mime    = mime || this.getMime(this.element.src);
            quality = parseInt(quality) || 100;
            
            quality = Math.max(Math.min(quality, 100), 10);
            // divide by 100 to give value between 0.1 and 1
            quality = quality / 100;

            // reload the data
            this.load();
			
            if (quality < 1) {
                try {
                    return this.canvas.toDataURL(mime, quality);	
                } catch(e) {
                    return this.canvas.toDataURL(mime);
                }
            } else {
                return this.canvas.toDataURL(mime);
            }	
            
            return null;
        },

        remove : function() {
            $(this.canvas).remove();
            this.destroy();
        }
    });

})(jQuery);
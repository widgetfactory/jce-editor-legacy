/**
 * @version		$Id: editor_plugin.js 771 2010-08-08 14:32:49Z happynoodleboy $
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
    var each = tinymce.each, extend = tinymce.extend;
    var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;
    
    
    tinymce.create('tinymce.plugins.ControlsPlugin', {
        init: function(ed, url) {
            var self = this;
            
            if (ed.settings.disable_image_resizing || tinymce.isIE) {
                return;
            }
            
            // disable object resizing in Firefox
            ed.settings.object_resizing = false;
            
            var resize = new tinymce.util.Resize(ed);
    		
            ed.onInit.add(function() {	
                ed.dom.loadCSS(url + "/css/content.css");
            });
	    	
            // remove handles / cleanup
            ed.onPreProcess.add(function(ed, o) {	    		
                if (o.get) {
                    ed.dom.remove(ed.dom.select('div.mceResizeHandles'));
                    ed.dom.remove(ed.dom.select('div.mceItemGhost'));
                }
            });
	    	
            ed.onSetContent.add(function(ed, o) {
                new tinymce.util.Resize(ed, {}, ed.dom.select('table, img:not(.mceItemAnchor)', ed.getBody()));
            });
            
            ed.onGetContent.add(function(ed, o) {
                new tinymce.util.Resize(ed, {}, ed.dom.select('table, img:not(.mceItemAnchor)', ed.getBody()));
            });
    		
            ed.onBeforeExecCommand.add(function() {
                resize.removeHandles(true);
            });
    		
            ed.onKeyDown.add(function(ed, e) {                                
                if (!e.shiftKey) {
                    resize.removeHandles(true);
                }
            });
        }
    });
    // Register plugin
    tinymce.PluginManager.add('controls', tinymce.plugins.ControlsPlugin);
})();    

(function() {
    var each = tinymce.each, extend = tinymce.extend, Event = tinymce.dom.Event;

    /**
	 * Drag and resize class for TinyMCE
	 *
	 * @class tinymce.util.Drag
	 */
    tinymce.create('tinymce.util.Resize', {
        /**
		 * Constructs a new Drag instance.
		 *
		 * @constructor
		 * @method Drag
		 * @param {Object} ed Current editor object
		 * @param {Object} s Optional settings object.
		 */
        Resize : function(ed, s, n) {
            var self = this;
			
            if (!ed)
                return false;
			
            this.settings   = extend({drag : true}, s);
            this.editor     = ed;
			
            each (n, function(el) {
                Event.add(el, 'mousedown', function(e) {
                    if (e.target.nodeName == el.nodeName) {
                        self.addHandles(el);
                    }
                });
            });

            ed.onClick.add(function(ed, e) {
                if (e.target) {
                    self.removeHandles();
                }
            });
        },
		
        _resize : function(e, n) {
            var self = this, ed = this.editor, dom = ed.dom, doc = ed.getDoc();
            var mm, mu, sw, sh, sz, sx, sy, r, width, height;

            e.preventDefault();
            
            var handle = e.target;

            // Get the current rect size
            sx = e.screenX;
            sy = e.screenY;
            sw = width  = n.clientWidth;
            sh = height = n.clientHeight;
	        
            var dimensions = {
                width : width,
                height: height
            };
	        
            r = sw / sh;
	        
            function proportionalResize(w, h, x, y) {
                h = h * (x / w);
                w = x;
                if (h > y) {
                    w = w * (y / h);
                    h = y;
                }

                return {
                    width : Math.round(w),
                    height: Math.round(h)
                };
            }
	        
            dom.addClass(dom.select('div.mceResizeHandles'), 'mceItemDrag');

            function resizeOnMove(e) {            	
                x = e.screenX - sx;
                y = e.screenY - sy;
                
                var mod = e.shiftKey;

                switch (handle.className) {
                    case 'mceResizeHandleLeft':
                        dimensions.width = sw - x;
                        break;
                    case 'mceResizeHandleRight':
                        dimensions.width = sw + x;
                        break;
                    case 'mceResizeHandleTop':
                        dimensions.height = sh - y;
                        break;
                    case 'mceResizeHandleBottom':
                        dimensions.height = sh + y;
                        break;
                    case 'mceResizeHandleTopRight':
                        dimensions = mod ? proportionalResize(sw, sh, sw + x, sh - y) : {
                            width : sw + x, 
                            height : sh - y
                        };
                        break;
                    case 'mceResizeHandleBottomRight':
                        dimensions = mod ? proportionalResize(sw, sh, sw + x, sh + y) : {
                            width : sw + x, 
                            height : sh + y
                        };
                        break;
                    case 'mceResizeHandleTopLeft':
                        dimensions = mod ? proportionalResize(sw, sh, sw - x, sh - y) : {
                            width : sw - x, 
                            height : sh - y
                        };
                        break;
                    case 'mceResizeHandleBottomLeft':
                        dimensions = mod ? proportionalResize(sw, sh, sw - x, sh + y) : {
                            width : sw - x, 
                            height : sh + y
                        };
                        break;
                }
                dom.setHTML(dom.select('span.mceResizeLabel'), dimensions.width +  ' x ' + dimensions.height);            	
                dom.setStyles(dom.select('div.mceResizeHandles'), dimensions);
            }
            
            function endResize(e) {
                // Stop listening
                Event.remove(doc, 'mousemove', mm);
                Event.remove(doc, 'mouseup', mu);
                
                // set width / height attribute on img and table elements
                if (n.nodeName == 'IMG') {
                    dom.setAttribs(n, dimensions);
                } else {
                    dom.setStyles(n, dimensions);
                }

                dom.removeClass(dom.select('div.mceResizeHandles'), 'mceItemDrag');
                self.removeHandles();
                
                ed.undoManager.add();
                
                ed.selection.select(n);
                
                ed.nodeChanged();
            }
            
            // Register event handlers
            mm 	= Event.add(doc, 'mousemove', resizeOnMove);
            mu 	= Event.add(doc, 'mouseup', endResize);
            
            return Event.cancel(e);
        },
        
        _drag : function(e, n) {
            var self = this, ed = this.editor, dom = ed.dom, doc = ed.getDoc(), body = ed.getBody();
            var mm, mu, mo, pos, sx, sy, s, target;

            //e.preventDefault();
            
            self.removeHandles();
            
            n.focus();
            
            ed.selection.select(n);

            /*sx = e.screenX;
            sy = e.screenY;

            pos = dom.getRect(n);
			
            var marker = n.cloneNode();
            
            dom.addClass(marker, 'mceItemGhost');         
            dom.insertAfter(marker, n);

            function dragMove(e) {
                x = e.screenX - sx;
                y = e.screenY - sy;
                
                dom.setStyles(marker, {
                    left    : Math.max(x + pos.x, 0),
                    top     : Math.max(y + pos.y, 0)
                });
                
                var targets = tinymce.grep(dom.select('*', body), function(el) {
                    if (el == n || el.className.indexOf('mceItem') != -1) {                                                
                        return false;
                    }
                    
                    var o = dom.getRect(el);
                    return (e.pageX > o.x && e.pageY > o.y);
                });
                
                target = targets[targets.length - 1];
                
                if (target) {                    
                   ed.selection.setCursorLocation(target);
                }
            }

            function endDrag(e) {
                // Stop listening
                Event.remove(doc, 'mousemove', mm);
                Event.remove(doc, 'mouseup', mu);
                
                dom.remove(marker);
                
                ed.selection.setContent('<span id="_mce_marker"></span>');
                
                dom.replace(n, dom.get('_mce_marker'));
                
                ed.selection.select(n);
                
                ed.undoManager.add();                
                ed.nodeChanged();
            }*/
            
            // Register event handlers
            mm 	= Event.add(doc, 'mousemove', dragMove);
            //mu 	= Event.add(doc, 'mouseup', endDrag);

            //return Event.cancel(e);
        },
	
        addHandles : function(n) {
            var self = this, ed = self.editor, dom = ed.dom;
			
            if (dom.select('div.mceResizeHandles', ed.getDoc()).length) {
                return;
            }

            var rect = dom.getRect(n);
			
            var p = dom.add(ed.getBody(), 'div', {
                'class' : 'mceItemHidden mceResizeHandles',
                style 	: {
                    width 	: rect.w,
                    height	: rect.h,
                    top		: rect.y,
                    left	: rect.x
                },
                'data-mce-type' : 'helper' 
            });
            
            if (this.settings.drag) {
                Event.add(p, 'mousedown', function(e) {
                    self._drag(e, n);
                });
                
                Event.add(n, 'dragstart', function(e) {
                    self._drag(e, n);
                });
            }

            each(['Top', 'Bottom', 'Left', 'Right', 'TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'], function(s) {
                var h = dom.add(p, 'span', {
                    'class' : 'mceResizeHandle' + s
                });
				
                Event.add(h, 'mousedown', function(e) {
                    self._resize(e, n);
                });
            });

            var s = '';
            var w = parseFloat(dom.getStyle(n, 'width', true));
            var h = parseFloat(dom.getStyle(n, 'height', true));
			
            if (w && h) {
                s = w + ' x ' + h;
            }
			
            var label = dom.add(p, 'span', {
                'class' : 'mceResizeLabel'
            }, s);
			
            Event.add(label, 'click', self._block);
            Event.add(label, 'mousedown', self._block);
			
            ed.selection.select(n);
			
            p.element = n;
        },
		
        removeHandles : function(s) {
            var self = this, ed = this.editor, dom = ed.dom;
			
            each(dom.select('div.mceResizeHandles', ed.getDoc()), function(n) {
                var el = n.element;
				
                if (el && s) {
                    ed.selection.select(el);
                }
				
                dom.remove(n)
            });
        },
		
        _block : function(e) {
            Event.cancel(e);
        }
    });
})();

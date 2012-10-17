/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
    var DOM = tinymce.DOM, Element = tinymce.dom.Element, Event = tinymce.dom.Event, each = tinymce.each, is = tinymce.is;

    tinymce.create('tinymce.plugins.InlinePopups', {
        init : function(ed, url) {
            // Replace window manager
            ed.onBeforeRenderUI.add( function() {
                ed.windowManager = new tinymce.InlineWindowManager(ed);

                if (!ed.settings.compress.css) {
                //DOM.loadCSS(ed.settings.bootstrap);
                //DOM.loadCSS(url + '/css/dialog.css');
                }
            });

        },

        getInfo : function() {
            return {
                longname : 'InlinePopups',
                author : 'Moxiecode Systems AB',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/inlinepopups',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }

    });

    tinymce.create('tinymce.InlineWindowManager:tinymce.WindowManager', {
        InlineWindowManager : function(ed) {
            var t = this;
	
            t.parent(ed);
            t.zIndex = 300000;
            t.count = 0;
            t.windows = {};
        },
	
        open : function(f, p) {
            var t = this, id, opt = '', ed = t.editor, dw = 0, dh = 0, vp, po, mdf, clf, we, w, u, parentWindow;

            f = f || {};
            p = p || {};

            // Run native windows
            if (!f.inline)
                return t.parent(f, p);

            parentWindow = t._frontWindow();
            if (parentWindow && DOM.get(parentWindow.id + '_ifr')) {
                parentWindow.focussedElement = DOM.get(parentWindow.id + '_ifr').contentWindow.document.activeElement;
            }
			
            // Only store selection if the type is a normal window
            if (!f.type)
                t.bookmark = ed.selection.getBookmark(1);

            id = DOM.uniqueId();
            vp = DOM.getViewPort();
            f.width         = parseInt(f.width || 320);
            f.height        = parseInt(f.height || 240) + (tinymce.isIE ? 8 : 0);
            f.min_width     = parseInt(f.min_width || 150);
            f.min_height    = parseInt(f.min_height || 100);
            f.max_width     = parseInt(f.max_width || 2000);
            f.max_height    = parseInt(f.max_height || 2000);
            f.left          = f.left || Math.round(Math.max(vp.x, vp.x + (vp.w / 2.0) - (f.width / 2.0)));
            f.top           = f.top || Math.round(Math.max(vp.y, vp.y + (vp.h / 2.0) - (f.height / 2.0)));
            f.movable       = f.resizable = true;
            p.mce_width     = f.width;
            p.mce_height    = f.height;
            p.mce_inline    = true;
            p.mce_window_id = id;
            p.mce_auto_focus = f.auto_focus;

            t.features = f;
            t.params = p;
            t.onOpen.dispatch(t, f, p);

            if (f.type) {
                if (f.type)
                    opt += ' modal-' + f.type.substring(0, 1) + f.type.substring(1);

                f.resizable = false;
            }
            
            var title = f.title || '';

            // get ui container
            var wrapper = DOM.get('ui-jce-wrapper');
            
            if (!wrapper) {
                this.count = 0;
                // create ui container
                wrapper = DOM.add(DOM.doc.body, 'div', {
                    'id'    : 'ui-jce-wrapper',
                    'class' : 'ui-jce'
                });
            }
            
            var html = '<div class="modal" id="' + id + '" tabindex="-1" role="dialog" aria-labelledby="' + id + '_title" aria-hidden="true">'
            + ' <div class="modal-header" id="' + id + '_header">'
            + '     <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
            + '     <h3 id="' + id + '_title">' + (f.title || '') + '</h3>'
            + ' </div>'
            + ' <div class="modal-body" id="' + id + '_content"></div>'
            + '</div>';
            
            wrapper.innerHTML = html;

            // Hide while loading
            DOM.setStyles(id, {
                left  : -10000
            });
            
            DOM.addClass(id, 'loading');
            
            // add size class
            DOM.addClass(id, f.size || 'medium-landscape');

            // Measure borders
            if (!f.type) {
                var w = DOM.get(id).clientWidth;
                var h = DOM.get(id).clientHeight;
            }

            // position window
            DOM.setStyles(id, { 
                //top         : Math.round((vp.h - h) / 2),
                marginLeft  : -(w / 2) + 'px',
                left        : '50%'
            });

            // create URL
            u = f.url || f.file;
            
            if (u) {
                if (tinymce.relaxedDomain)
                    u += (u.indexOf('?') == -1 ? '?' : '&') + 'mce_rdomain=' + tinymce.relaxedDomain;

                u = tinymce._addVer(u);
            }

            // create iframe
            if (!f.type) {
                var iframe = DOM.add(id + '_content', 'iframe', {
                    id : id + '_ifr', 
                    src : 'javascript:""', 
                    frameBorder : 0, 
                    style : 'border:0;width:10px;height:10px'
                });
                
                DOM.setStyles(iframe, {
                    width   : '100%', 
                    height  : h - (DOM.get(id + '_header').clientHeight + DOM.get(id + '_content').clientHeight + 30)
                });
                DOM.setAttrib(iframe, 'src', u);
				
                Event.add(iframe, 'load', function() {
                    DOM.removeClass(id, 'loading');
                });
				
            // create type dialog ie: confirm, alert etc.
            } else {
                var pane = DOM.add(id, 'div', {
                    'class' : 'ui-dialog-buttonpane ui-widget-content ui-helper-clearfix'
                });

                var set = DOM.add(pane, 'div', {
                    'class' : 'ui-dialog-buttonset'
                });

                DOM.add(set, 'button', {
                    type 		: 'button', 
                    id 			: id + '_ok', 
                    'class' 		: 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-ok',
                    'role'		: 'button',
                    'aria-disabled' : false,
                    'aria-labelledby' : id + '_ok_text'
                }, '<span class="ui-button-text" id="' + id + '_ok_text">' + ed.getLang('ok', 'OK') + '</span>');

                if (f.type == 'confirm') {
                    DOM.add(set, 'button', {
                        type 			: 'button', 
                        id 				: id + '_cancel', 
                        'class' 		: 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-cancel',
                        'role'			: 'button',
                        'aria-disabled' : false,
                        'aria-labelledby' : id + '_ok_text'
                    }, '<span class="ui-button-text" id="' + id + '_cancel_text">' + ed.getLang('cancel', 'Cancel') + '</span>');
                }
                DOM.setHTML(id + '_content', '<span class="ui-icon ui-icon-'+ f.type +'"></span>' + f.content.replace('\n', '<br />'));
                
                Event.add(id, 'keyup', function(evt) {
                    var VK_ESCAPE = 27;
                    if (evt.keyCode === VK_ESCAPE) {
                        f.button_func(false);
                        return Event.cancel(evt);
                    }
                });

                Event.add(id, 'keydown', function(evt) {
                    var cancelButton, VK_TAB = 9;
                    if (evt.keyCode === VK_TAB) {
                        cancelButton = DOM.get(id + '_cancel');
                        if (cancelButton && cancelButton !== evt.target) {
                            cancelButton.focus();
                        } else {
                            DOM.get(id + '_ok').focus();
                        }
                        return Event.cancel(evt);
                    }
                });
            }
            /*
            // Register events
            mdf = Event.add(id, 'mousedown', function(e) {
                var n = e.target, ac;

                t.focus(id);

                if (DOM.hasClass(n, 'ui-dialog-title')) {
                    n = n.parentNode;
                }

                if (DOM.hasClass(n, 'ui-dialog-titlebar')) {
                    ac = 'move';

                    return t._startDrag(id, e, ac);
                }

                if (DOM.hasClass(n, 'ui-resizable-handle')) {
                    ac = /ui-resizable-(ne|nw|se|sw|n|s|e|w)/.exec(n.className);

                    if (ac)
                        return t._startDrag(id, e, ac[1]);
                }
            });
            
            // Make sure the tab order loops within the dialog.
            //Event.add(id, function(evt) {
            Event.add([id + '_left', id + '_right'], 'focus', function(evt) {
                var iframe = DOM.get(id + '_ifr');
                if (iframe) {
                    var body = iframe.contentWindow.document.body;
                    var focusable = DOM.select(':input:enabled,*[tabindex=0]', body);
                    focusable[0].focus();
                } else {
                    DOM.get(id + '_ok').focus();
                }
            });
			
            clf = Event.add(id, 'click', function(e) {	
                var n = e.target;

                t.focus(id);
                
                if (DOM.is(n, '.ui-button-cancel, .ui-button-cancel span, .ui-button-ok, .ui-button-ok span')) {
                    f.button_func(DOM.is(n, '.ui-button-ok, .ui-button-ok span'));
                } else if (DOM.is(n, 'button.close')) {
                    t.close(null, id);
                }

                return Event.cancel(e);
            });

            /*Event.add(DOM.select('button.close', id), 'mouseover', function(e) {
                var n = e.target;

                if (n.nodeName != 'A') {
                    n = n.parentNode;
                }

                DOM.addClass(n, 'ui-state-hover');
            });

            Event.add(DOM.select('.ui-dialog-titlebar-close', id), 'mouseout', function(e) {
                var n = e.target;

                if (n.nodeName != 'A') {
                    n = n.parentNode;
                }

                DOM.removeClass(n, 'ui-state-hover');
            });

            Event.add(DOM.select('.ui-dialog-titlebar-close', id), 'focus', function(e) {
                var n = e.target;

                if (n.nodeName != 'A') {
                    n = n.parentNode;
                }

                DOM.addClass(n, 'ui-state-focus');
            });

            Event.add(DOM.select('.ui-dialog-titlebar-close', id), 'blur', function(e) {
                var n = e.target;

                if (n.nodeName != 'A') {
                    n = n.parentNode;
                }

                DOM.removeClass(n, 'ui-state-focus');
            });*/
            
            clf = Event.add(id, 'click', function(e) {	
                var n = e.target;

                t.focus(id);
                
                if (DOM.is(n, '.ui-button-cancel, .ui-button-cancel span, .ui-button-ok, .ui-button-ok span')) {
                    f.button_func(DOM.is(n, '.ui-button-ok, .ui-button-ok span'));
                } else if (DOM.is(n, 'button.close')) {
                    t.close(null, id);
                }

                return Event.cancel(e);
            });

            // Add window
            w = t.windows[id] = {
                id 		: id,
                mousedown_func 	: mdf,
                click_func 	: clf,
                element 	: new Element(id, {
                    blocker     : 1, 
                    container   : ed.getContainer()
                }),
                iframeElement 	: new Element(id + '_ifr'),
                features 	: f,
                deltaWidth 	: dw,
                deltaHeight 	: dh
            };

            /*w.iframeElement.on('focus', function() {
                t.focus(id);
            });
            
            var overlay = DOM.get('modal-backdrop');
            
            if (!overlay) {
                overlay = DOM.add(wrapper, 'div', {
                    id : 'modal-backdrop',
                    'class' : 'modal-backdrop',
                    style : {
                        position 	: 'fixed',
                        left		:0,
                        top		:0,
                        width		:'100%',
                        height		:'100%',
                        zIndex 		: t.zIndex - 1
                    }
                });
            	
                DOM.show(overlay); // Reduces flicker in IE
                DOM.setAttrib(DOM.doc.body, 'aria-hidden', 'true');
            }
            
            DOM.setAttrib(id, 'aria-hidden', 'false');
            
            /*if (tinymce.isIE6 || (tinymce.isIE && !DOM.boxModel)) {
                DOM.setStyles(overlay, {
                    position : 'absolute', 
                    left : vp.x, 
                    top : vp.y, 
                    width : vp.w - 2, 
                    height : vp.h - 2
                });
            }*/
            
            //t.focus(id);
            
            //this.count++;

            return w;
        },
        
        focus : function(id) {
            var t = this, w;

            if (w = t.windows[id]) {
                w.zIndex = this.zIndex++;
                w.element.setStyle('zIndex', w.zIndex);
                w.element.update();

                DOM.removeClass(t.lastId, 'ui-dialog-focus');
                DOM.addClass(id, 'ui-dialog-focus');
                t.lastId = id;
				
                if (w.focussedElement) {
                    w.focussedElement.focus();
                } else if (DOM.get(id + '_ok')) {
                    DOM.get(w.id + '_ok').focus();
                } else if (DOM.get(w.id + '_ifr')) {
                    DOM.get(w.id + '_ifr').focus();
                }
            }
        },

        _startDrag : function(id, se, ac) {
            var t = this, mu, mm, d = DOM.doc, eb, w = t.windows[id], we = w.element, sp = we.getXY(), p, sz, ph, cp, vp, sx, sy, sex, sey, dx, dy, dw, dh;

            // Get positons and sizes
            cp = {
                x : 0, 
                y : 0
            };
            vp = DOM.getViewPort();

            // Reduce viewport size to avoid scrollbars while dragging
            vp.w -= 2;
            vp.h -= 2;

            sex = se.screenX;
            sey = se.screenY;
            dx = dy = dw = dh = 0;

            // Handle mouse up
            mu = Event.add(d, 'mouseup', function(e) {
                Event.remove(d, 'mouseup', mu);
                Event.remove(d, 'mousemove', mm);

                DOM.removeClass(id, 'ui-dialog-dragging');

                if (eb)
                    eb.remove();

                we.moveBy(dx, dy);
                we.resizeBy(dw, dh);

                sz = we.getSize();
                DOM.setStyles(id + '_ifr', {
                    width : sz.w - w.deltaWidth, 
                    height : sz.h - w.deltaHeight
                });

                return Event.cancel(e);
            });

            if (ac != 'move')
                startMove();

            function startMove() {
                if (eb)
                    return;

                DOM.addClass(id, 'ui-dialog-dragging');

                // Setup event blocker
                var blocker = DOM.add(DOM.get('ui-jce-wrapper'), 'div', {
                    id		: 'ui-dialog-blocker',
                    'class' : 'ui-widget ui-dialog-blocker',
                    style 	: {
                        zIndex : t.zIndex + 1
                    }
                });

                if (tinymce.isIE6 || (tinymce.isIE && !DOM.boxModel))
                    DOM.setStyles(blocker, {
                        position : 'absolute', 
                        left : vp.x, 
                        top : vp.y, 
                        width : vp.w - 2, 
                        height : vp.h - 2
                    });

                eb = new Element(blocker);
                eb.update();

                // Setup placeholder
                sz = {
                    w : DOM.get(id).clientWidth,
                    h : DOM.get(id).clientHeight
                };

                sx = cp.x + sp.x - vp.x;
                sy = cp.y + sp.y - vp.y;

                DOM.add(eb.get(), 'div', {
                    id : 'ui-dialog-placeholder', 
                    'class' : 'ui-widget-content ui-widget-overlay', 
                    style : {
                        left : sx, 
                        top : sy, 
                        width : sz.w, 
                        height : sz.h
                    }
                });
                ph = new Element('ui-dialog-placeholder');
            };

            // Handle mouse move/drag
            mm = Event.add(d, 'mousemove', function(e) {
                var x, y, v;

                startMove();

                x = e.screenX - sex;
                y = e.screenY - sey;

                switch (ac) {
                    case 'w':
                        dx = x;
                        dw = 0 - x;
                        break;

                    case 'e':
                        dw = x;
                        break;

                    case 'n':
                    case 'nw':
                    case 'ne':
                        if (ac == "nw") {
                            dx = x;
                            dw = 0 - x;
                        } else if (ac == "ne")
                            dw = x;

                        dy = y;
                        dh = 0 - y;
                        break;

                    case 's':
                    case 'sw':
                    case 'se':
                        if (ac == "sw") {
                            dx = x;
                            dw = 0 - x;
                        } else if (ac == "se")
                            dw = x;

                        dh = y;
                        break;

                    case 'move':
                        dx = x;
                        dy = y;
                        break;
                }

                // Boundary check
                if (dw < (v = w.features.min_width - sz.w)) {
                    if (dx !== 0)
                        dx += dw - v;

                    dw = v;
                }

                if (dh < (v = w.features.min_height - sz.h)) {
                    if (dy !== 0)
                        dy += dh - v;

                    dh = v;
                }

                dw = Math.min(dw, w.features.max_width - sz.w);
                dh = Math.min(dh, w.features.max_height - sz.h);
                dx = Math.max(dx, vp.x - (sx + vp.x));
                dy = Math.max(dy, vp.y - (sy + vp.y));
                dx = Math.min(dx, (vp.w + vp.x) - (sx + sz.w + vp.x));
                dy = Math.min(dy, (vp.h + vp.y) - (sy + sz.h + vp.y));

                // Move if needed
                if (dx + dy !== 0) {
                    if (sx + dx < 0)
                        dx = 0;

                    if (sy + dy < 0)
                        dy = 0;

                    ph.moveTo(sx + dx, sy + dy);
                }

                // Resize if needed
                if (dw + dh !== 0)
                    ph.resizeTo(sz.w + dw, sz.h + dh);

                return Event.cancel(e);
            });

            return Event.cancel(se);
        },

        resizeBy : function(dw, dh, id) {
            /*var w = this.windows[id];

            if (w) {
                w.element.resizeBy(dw, dh);
                w.iframeElement.resizeBy(dw, dh);
            }*/
            
            return true;
        },

        close : function(win, id) {
            var t = this, w, d = DOM.doc, ix = 0, fw, id;

            id = t._findId(id || win);

            // Probably not inline
            if (!t.windows[id]) {
                t.parent(win);
                return;
            }

            if (w = t.windows[id]) {            	
                t.onClose.dispatch(t);
                Event.remove(d, 'mousedown', w.mousedownFunc);
                Event.remove(d, 'click', w.clickFunc);
                Event.clear(id);
                Event.clear(id + '_ifr');
                
                DOM.setAttrib(id + '_ifr', 'src', 'javascript:""'); // Prevent leak
                w.element.remove();
                delete t.windows[id];

                fw = t._frontWindow();

                if (fw)
                    t.focus(fw.id);

                this.count--;

                if (fw)
                    t.focus(fw.id);
            }
            
            // no windows open, remove wrapper and overlay
            if (this.count == 0) {
                DOM.remove('ui-jce-wrapper');
                DOM.setAttrib(DOM.doc.body, 'aria-hidden', 'false');
            }
        },

        alert : function(txt, cb, s) {
            var t = this, w;

            w = t.open({
                title : t,
                type : 'alert',
                button_func : function(s) {
                    if (cb)
                        cb.call(t, s);

                    t.close(null, w.id);
                },
                content : DOM.encode(t.editor.getLang(txt, txt)),
                inline : 1,
                width : 400,
                height : 150
            });
        },

        confirm : function(txt, cb, s) {
            var t = this, w;

            w = t.open({
                title : t,
                type : 'confirm',
                button_func : function(s) {					
                    if (cb)
                        cb.call(t, s);

                    t.close(null, w.id);
                },
                content : DOM.encode(t.editor.getLang(txt, txt)),
                inline : 1,
                width : 400,
                height : 150
            });
        },

        setTitle : function(w, ti) {
            var e;

            w = this._findId(w);

            if (e = DOM.get(w + '_title'))
                e.innerHTML = DOM.encode(ti);
        },
		
        // Find front most window
        _frontWindow : function() {
            var fw, ix = 0;
            // Find front most window and focus that
            each (this.windows, function(w) {
                if (w.zIndex > ix) {
                    fw = w;
                    ix = w.zIndex;
                }
            });
            return fw;
        },

        // Internal functions

        _findId : function(w) {
            var t = this;

            if (typeof(w) == 'string')
                return w;

            each(t.windows, function(wo) {
                var ifr = DOM.get(wo.id + '_ifr');

                if (ifr && w == ifr.contentWindow) {
                    w = wo.id;
                    return false;
                }
            });

            return w;
        }
    });

    // Register plugin
    tinymce.PluginManager.add('inlinepopups', tinymce.plugins.InlinePopups);
})();
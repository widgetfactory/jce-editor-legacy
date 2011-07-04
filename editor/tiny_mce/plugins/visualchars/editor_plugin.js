/**
 * $Id: editor_plugin.js 226 2011-06-13 09:59:05Z happy_noodle_boy $
 *
 * Copyright 2009, Moxiecode Systems AB
 * Copyright 2009, Ryan Demmer
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 */
(function() {
    tinymce.create('tinymce.plugins.VisualChars', {
        init: function(ed, url) {
            var t = this;
            
            t.editor = ed;
            
            // get state from cookie
            var state = tinymce.util.Cookie.get('wf_visualchars_state');
            
            state = tinymce.is(state, 'string') ? parseFloat(state) : ed.getParam('visualchars', 0);

            ed.onInit.add(function() {
            	if (!ed.settings.compress.css) {
            		ed.dom.loadCSS(url + "/css/content.css");
            	}
                
                ed.controlManager.setActive('visualchars', state);
                
                t._toggleVisualChars(state);
                t._toggleVisualBlocks(state);
            });
            
            // Register buttons
            ed.addButton('visualchars', {
                title: 'visualchars.desc',
                cmd: 'mceVisualChars'
            });
            
            // Register commands
            ed.addCommand('mceVisualChars', function() {
            	state = !state;

            	ed.controlManager.setActive('visualchars', state);
                t._toggleVisualChars(state);
                t._toggleVisualBlocks(state);
                
                if (ed.getParam('use_cookies', 1)) {
                	tinymce.util.Cookie.set('wf_visualchars_state', state ? 1 : 0);
                }
            }, t);
            
            ed.onKeyUp.add(function(ed, e) {
                if (state) {
                    if (e.keyCode == 13) {
                        t._toggleVisualChars(state);
                        t._toggleVisualBlocks(state);
                    }
                }
            });
            
            ed.onPreProcess.add(function(ed, o) {
                if (o.get) {
					t._toggleVisualChars(false, o.node);
					t._toggleVisualBlocks(false, o.node);
                }
            });
            
            ed.onSetContent.add(function(ed, o) {
				t._toggleVisualChars(state);
				t._toggleVisualBlocks(state);
            }); 
        },
        
        getInfo: function() {
            return {
                longname: 'Visual characters',
                author: 'Moxiecode Systems AB / Ryan Demmer',
                authorurl: 'http://tinymce.moxiecode.com',
                infourl: 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/visualchars',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        },
        
        // Private methods
        
        _toggleVisualBlocks: function(state, o) {
            var t = this, ed = t.editor, dom = ed.dom, b = o || ed.getBody();
            
           var blocks = dom.select('p,div,h1,h2,h3,h4,h5,h6,blockquote,pre,address,ul,ol', b);

           if (state) {
        	   blocks = tinymce.grep(blocks, function(n) {
            	   return !/mceItem/.test(n.className);
               });
        	   
        	   dom.addClass(blocks, 'mceItemVisualAid');
        	   dom.addClass(blocks, 'mceItemVisualGuides');
           } else {
        	   dom.removeClass(blocks, 'mceItemVisualAid');
        	   dom.removeClass(blocks, 'mceItemVisualGuides');
           }
        },

		_toggleVisualChars: function(state, o) {
			var t = this, ed = t.editor, nl, i, h, d = ed.getDoc(), b = o || ed.getBody(), nv, s = ed.selection, bo, div;

			if (state) {
				nl = [];
				tinymce.walk(b, function(n) {
					if (n.nodeType == 3 && n.nodeValue && /(\u00a0|&nbsp;)/.test(n.nodeValue)) 
						nl.push(n);
				}, 'childNodes');
				
				for (i = 0; i < nl.length; i++) {
					nv = nl[i].nodeValue;
					nv = nv.replace(/(\u00a0|&nbsp;)/g, '<span class="mceItemHidden mceItemNbsp">$1</span>');
					
					div = ed.dom.create('div', null, nv);
					while (node = div.lastChild)
						ed.dom.insertAfter(node, nl[i]);

					ed.dom.remove(nl[i]);
				}
			} else {
				nl = ed.dom.select('span.mceItemNbsp', b);

				for (i = nl.length - 1; i >= 0; i--) {
					ed.dom.remove(nl[i], 1);
				}
			}
		}
    });
    
    // Register plugin
    tinymce.PluginManager.add('visualchars', tinymce.plugins.VisualChars);
})();

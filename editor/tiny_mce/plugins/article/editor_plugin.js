/**
 * @version		$Id: editor_plugin.js 257 2011-06-30 11:37:36Z happy_noodle_boy $
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
    var each = tinymce.each, Node = tinymce.html.Node;
    
    tinymce.create('tinymce.plugins.ArticlePlugin', {
        init: function(ed, url) {
            var t = this;
            
            t.editor = ed;
            t.url = url;
            
            function isReadMore(n) {
                return n.nodeName == 'IMG' && ed.dom.hasClass(n, 'mceItemReadMore');
            };
            
            function isPageBreak(n) {
                return n.nodeName == 'IMG' && ed.dom.hasClass(n, 'mceItemPageBreak');
            };

            // Register commands
            ed.addCommand('mceReadMore', function() {
                if (ed.dom.get('system-readmore')) {
                    alert(ed.getLang('article.readmore_alert', 'There is already a Read More break inserted in this article. Only one such break is permitted. Use a Pagebreak to split the page up further.'));
                    return false;
                }
                t._insertBreak('readmore', {
                    id: 'system-readmore'
                });
            });
            ed.addCommand('mcePageBreak', function(ui, v) {
                if (ui) {
                    ed.windowManager.open({
                        file: ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=article',
                        width: 400,
                        height: 140,
                        inline: 1
                    }, {
                        plugin_url: url
                    });
                } else {
                    tinymce.extend(v, {
                        'id': 'system-pagebreak'
                    });
                    t._insertBreak('pagebreak', v);
                }
            });

            // Register buttons
            if (ed.getParam('article_show_readmore', true)) {
                ed.addButton('readmore', {
                    title: 'article.readmore',
                    cmd: 'mceReadMore'
                });
            }
            if (ed.getParam('article_show_pagebreak', true)) {
                ed.addButton('pagebreak', {
                    title: 'article.pagebreak',
                    cmd: 'mcePageBreak',
                    ui: true
                });
            }
            
            ed.onInit.add(function() {
            	if (!ed.settings.compress.css)
            	   ed.dom.loadCSS(url + "/css/content.css");
                
                if (ed.getParam('article_hide_xtd_btns')) {
                    // Remove Joomla! Readmore / PageBreak buttons
                    tinymce.DOM.hide(ed.dom.select('div.readmore, div.pagebreak', tinymce.DOM.get('editor-xtd-buttons')));
                }
            });
            
            ed.onNodeChange.add(function(ed, cm, n) {
				cm.setActive('readmore', isReadMore(n));
                cm.setActive('pagebreak', isPageBreak(n));
            });  
            
            // replace hr alt attribute with data-mce-alt
            ed.onBeforeSetContent.add( function(ed, o) {
            	o.content = o.content.replace(/<hr([^>]+)alt="([^"]+)"([^>]+)>/gi, '<hr$1data-mce-alt="$2"$3>');
            });
            
            ed.onPostProcess.add(function(ed, o) {   
				if (o.get) {
					if (ed.getParam('forced_root_block')) {
						o.content = o.content.replace(/<(p|div)>[\s\n]*?<hr([\s\S]+)(id|class)="system-(readmore|pagebreak)"([^>]+?)>[\s\n]*?<\/(p|div)>/gi, '<hr$2$3="system-$4"$5>');
                	}
				}				
            });
            
            ed.onPreInit.add( function() {            	
            	// Convert video elements to image placeholder
                ed.parser.addNodeFilter('hr', function(nodes) {
                    for (var i = 0; i < nodes.length; i++) {
                    	var id = nodes[i].attr('id') || '', cls = nodes[i].attr('class') || '';
                    	
                    	if (id == 'system-readmore' || /system-pagebreak/.test(cls)) {
                    		t._createImg(nodes[i]);
                    	}
                    }
                });

                // Convert image placeholders to video elements
                ed.serializer.addNodeFilter('img', function(nodes, name, args) {
                    for (var i = 0; i < nodes.length; i++) {
                        var node = nodes[i];
                    	if (/mceItem(PageBreak|ReadMore)/.test(node.attr('class') || '')) {
                            t._buildHR(node, args);
                        }
                    }
                });

            });
        },
		
        _insertBreak: function(s, args) {
            var t = this, ed = this.editor, dom = ed.dom, n = ed.selection.getNode(), ns, h, c, re, isBlock = false, desc = '';
            
            var bElm = 'P,DIV,ADDRESS,PRE,FORM,TABLE,OL,UL,CAPTION,BLOCKQUOTE,CENTER,DL,DIR,FIELDSET,NOSCRIPT,NOFRAMES,MENU,ISINDEX,SAMP';
            
            n = dom.getParent(n, bElm, 'BODY') || n;
            
            tinymce.extend(args, {
                'class'			: s == 'pagebreak' ? 'mceItemPageBreak mceItemNoResize' : 'mceItemReadMore mceItemNoResize',
                'data-mce-type' : 'system-' + s,
                id				: 'system-' + s
            });
            
            // Insert initial node			
			ed.execCommand('mceInsertContent', false, '<img id="__mce_tmp" src="' + t.url + '/img/trans.gif" />', {skip_undo : 1});

			img = dom.get('__mce_tmp');		
			dom.setAttribs(img, args);
            
            if (dom.isBlock(n)) {
            	// get the img parent
            	p = dom.getParent(img, bElm, 'BODY');
            	// split paragraphs / divs
            	if (p.nodeName == 'P' || p.nodeName == 'DIV') {
                	dom.split(p, img);
					ns = img.nextSibling;
					
					if (ns && ns.nodeName == p.nodeName) {						
						if (/^(\s|&nbsp;|\u00a00)*?$/.test(h) || h == '<br>') {
							dom.remove(ns);
						}
					}
                } else {
                	// If in block
                    if (p) {
                        if (p.parentNode.nodeName == 'BODY') {
							dom.insertAfter(img, p);
						} else {
							p.insertBefore(img, p);
						}
                    } else {
                        if (n.parentNode.nodeName == 'BODY') {
							dom.insertAfter(img, n);
						} else {
							n.parentNode.insertBefore(img, n);
						}
                    }
                    p = img.parentNode;
                    
                    while (/^(ADDRESS|PRE|FORM|TABLE|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DIR|FIELDSET|NOSCRIPT|NOFRAMES|MENU|ISINDEX|SAMP)$/.test(p.nodeName)) {
                        p.parentNode.insertBefore(img, p);
                        p = img.parentNode;
                    }
                }
				ns = img.nextSibling;
					
				if (!ns) {
                    var el = ed.getParam('forced_root_block') || (ed.getParam('force_p_newlines') ? 'p' : 'br'); 
					ns = ed.dom.create(el);
					if (el != 'br') {
						ns.innerHTML = '\u00a0';
					}
                    ed.dom.insertAfter(ns, img);
					s = ed.selection.select(ns);
					ed.selection.collapse(1);
                }
            }
            dom.setAttrib(dom.get('system-pagebreak'), 'id', '');            
            ed.undoManager.add();
        },
        // Private methods
        
        _buildHR: function(n) {
            var ed = this.editor, dom = ed.dom, args = {};
            
            if (/mceItemPageBreak/.test(n.attr('class'))) {
                args = {
                    title			: n.attr('title'),
                    'alt'			: n.attr('alt'),
                    'class'			: 'system-pagebreak'
                };
            } else {
                args = {
                    id: 'system-readmore'
                };
            }
            
            var hr = new Node('hr', 1).attr(args);
            hr.shortEnded = true;
            
            return n.replace(hr);
        },
        
        _createImg: function(n) {
            var ed = this.editor, t = this, args;
            
            args = {
                src			: t.url + '/img/trans.gif',
                'class'		: 'mceItemReadMore'
            };
            
            if (n.attr('id') == 'system-readmore') {
            	tinymce.extend(args, {
                    id				: 'system-readmore',
                    alt				: ed.getLang('article.readmore_title', ed.getLang('article.readmore_title', 'Read More')),
                    title			: ed.getLang('article.readmore_title', ed.getLang('article.readmore_title', 'Read More')),
					'data-mce-type'	: 'system-readmore'
                });
            } else {
            	tinymce.extend(args, {
                    'class'			: 'mceItemPageBreak',
                    title			: n.attr('title'),
                    'alt'			: n.attr('data-mce-alt'),
					'data-mce-type'	: 'system-pagebreak'
                });
            }
            
            var img = new Node('img', 1).attr(args);
            img.shortEnded = true;
            
            return n.replace(img);
        },
        
        getInfo: function() {
            return {
                longname: 'Article',
                author: 'Ryan Demmer',
                authorurl: 'http://www.joomlacontenteditor.net',
                infourl: 'http://www.joomlacontenteditor.net',
                version: '@@version@@'
            };
        }
    });
    // Register plugin
    tinymce.PluginManager.add('article', tinymce.plugins.ArticlePlugin);
})();
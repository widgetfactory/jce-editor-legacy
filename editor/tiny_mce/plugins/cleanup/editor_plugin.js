/**
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2011 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL 2 or later
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function() {
    var each = tinymce.each, extend = tinymce.extend;

    tinymce.create('tinymce.plugins.CleanupPlugin', {
        init : function(ed, url) {
            var self = this;
            this.editor = ed;

            // set validate value to verify_html value
            if(ed.settings.verify_html === false) {
                ed.settings.validate = false;
            }

            ed.onPreInit.add(function() {				
                /*if (ed.settings.schema === "html5") {
                    ed.schema.addValidChildren('a[#|abbr|area|address|article|aside|audio|b|bdo|blockquote|br|button|canvas|cite|code|command|datalist|del|details|dfn|dialog|div|dl|em|embed|fieldset|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|i|iframe|img|input|ins|kbd|keygen|label|link|map|mark|menu|meta|meter|nav|noscript|ol|object|output|p|pre|progress|q|ruby|samp|script|section|select|small|span|strong|style|sub|sup|svg|table|textarea|time|ul|var|video]');
                }*/
                
                // only if "Cleanup HTML" enabled
                if (ed.settings.validate) {
                    // Invalid Attribute Values cleanup
                    var invalidAttribValue = ed.getParam('invalid_attribute_values', '');
	
                    if(invalidAttribValue) {
                        function replaceAttributeValue(nodes, name, re) {
                            var i = nodes.length, node;
	
                            while(i--) {
                                node = nodes[i];
	
                                // remove attribute if it matches expression
                                if(new RegExp(re).test(node.attr(name))) {
                                    node.attr(name, "");
                                    // remove temp attribute
                                    if(name == 'src' || name == 'href') {
                                        node.attr('data-mce-' + name, "");
                                    }
                                }
                            }
                        }
	
                        each(tinymce.explode(invalidAttribValue), function(item) {
                            var re, matches = /([a-z\*]+)\[([a-z]+)([\^\$]?=)["']([^"']+)["']\]/i.exec(item);
	
                            if(matches && matches.length == 5) {
                                var tag = matches[1], attrib = matches[2], expr = matches[3], value = matches[4];
	
                                switch(expr) {
                                    default:
                                    case '=':
                                        re = '(' + value + ')';
                                        break;
                                    case '!=':
                                        re = '(^' + value + ')';
                                        break;
                                    case '^=':
                                        re = '^(' + value + ')';
                                        break;
                                    case '$=':
                                        re = '(' + value + ')$';
                                        break;
                                }
                                // all tags
                                if(tag == '*') {
                                    ed.parser.addAttributeFilter(attrib, function(nodes, name) {
                                        replaceAttributeValue(nodes, name, re);
                                    });
                                // specific tag
                                } else {
                                    ed.parser.addNodeFilter(tag, function(nodes, name) {
                                        replaceAttributeValue(nodes, attrib, re);
                                    });
                                }
                            }
                        });
                    }
                } else {
                    ed.serializer.addNodeFilter(ed.settings.invalid_elements, function(nodes, name) {
                        var i = nodes.length, node;
                        
                        if (ed.schema.isValidChild('body', name)) {
                            while(i--) {
                                node = nodes[i];
                                node.remove();
                            }
                        } 
                    });
                    
                    ed.parser.addNodeFilter(ed.settings.invalid_elements, function(nodes, name) {
                        var i = nodes.length, node;
                        
                        if (ed.schema.isValidChild('body', name)) {
                            while(i--) {
                                node = nodes[i];
                                node.remove();
                            }
                        }
                    });
                }
                
                // disable onclick etc.
                ed.parser.addAttributeFilter('onclick,ondblclick', function(nodes, name) {
                    var i = nodes.length, node;
	
                    while(i--) {
                        node = nodes[i];
	
                        node.attr('data-mce-' + name, node.attr(name));
                        node.attr(name, null);
                    }
                });
                
                ed.serializer.addAttributeFilter('data-mce-onclick,data-mce-ondblclick', function(nodes, name) {
                    var i = nodes.length, node, k;
	
                    while(i--) {
                        node = nodes[i], k = name.replace('data-mce-', '');
	
                        node.attr(k, node.attr(name));
                        node.attr(name, null);
                    }
                });
		
            });
            // run cleanup with default settings
            if(ed.settings.validate === false && ed.settings.verify_html === false) {
                ed.addCommand('mceCleanup', function() {
                    var s = ed.settings, se = ed.selection, bm;
                    bm = se.getBookmark();

                    var content = ed.getContent({
                        cleanup : true
                    });

                    var schema = new tinymce.html.Schema({
                        validate : true,
                        verify_html : true,
                        valid_styles : s.valid_styles,
                        valid_children : s.valid_children,
                        custom_elements : s.custom_elements,
                        extended_valid_elements : s.extended_valid_elements
                    });
                    content = new tinymce.html.Serializer({
                        validate : true
                    }, schema).serialize(new tinymce.html.DomParser({
                        validate : true
                    }, schema).parse(content));

                    ed.setContent(content, {
                        cleanup : true
                    });

                    se.moveToBookmark(bm);
                });
            }

            // Cleanup callback
            ed.onBeforeSetContent.add(function(ed, o) {				
                // Geshi
                o.content = o.content.replace(/<pre xml:\s*(.*?)>(.*?)<\/pre>/g, '<pre class="geshi-$1">$2</pre>');
				
                // only if "Cleanup HTML" enabled
                if(ed.settings.validate) {
                    // remove attributes
                    if(ed.getParam('invalid_attributes')) {
                        var s = ed.getParam('invalid_attributes', '');

                        o.content = o.content.replace(new RegExp('<([^>]+)(' + s.replace(/,/g, '|') + ')="([^"]+)"([^>]*)>', 'gi'), '<$1$4>');
                    }
                }
            });
            
            // Cleanup callback
            ed.onPostProcess.add(function(ed, o) {
                if(o.set) {
                    // Geshi
                    o.content = o.content.replace(/<pre xml:\s*(.*?)>(.*?)<\/pre>/g, '<pre class="geshi-$1">$2</pre>');
                }
                if(o.get) {
                    // Geshi
                    o.content = o.content.replace(/<pre class="geshi-(.*?)">(.*?)<\/pre>/g, '<pre xml:$1>$2</pre>');
                    // Remove empty jcemediabox / jceutilities anchors
                    o.content = o.content.replace(/<a([^>]*)class="jce(box|popup|lightbox|tooltip|_tooltip)"([^>]*)><\/a>/gi, '');
                    // Remove span elements with jcemediabox / jceutilities classes
                    o.content = o.content.replace(/<span class="jce(box|popup|lightbox|tooltip|_tooltip)">(.*?)<\/span>/gi, '$2');
                    // legacy mce stuff
                    o.content = o.content.replace(/_mce_(src|href|style|coords|shape)="([^"]+)"\s*?/gi, '');

                    if(ed.getParam('keep_nbsp', true)) {
                        o.content = o.content.replace(/\u00a0/g, '&nbsp;');
                    }

                    if(ed.settings.validate === false) {
                        // fix body content
                        o.content = o.content.replace(/<body([^>]*)>([\s\S]*)<\/body>/, '$2');
                        // padd empty elements
                        o.content = o.content.replace(/<(p|h1|h2|h3|h4|h5|h6|th|td|pre|div|address|caption)([^>]*)><\/\1>/gi, '<$1$2>&nbsp;</$1>');
                    }
                }
            });
            // Save callback
            ed.onGetContent.add(function(ed, o) {
                if(o.save) {
                    // Convert entities to characters
                    if(ed.getParam('cleanup_pluginmode')) {
                        o.content = o.content.replace(/&#39;/gi, "'");
                        o.content = o.content.replace(/&apos;/gi, "'");
                        o.content = o.content.replace(/&amp;/gi, "&");
                        o.content = o.content.replace(/&quot;/gi, '"');
                    }
                }
            });

            // Register buttons
            ed.addButton('cleanup', {
                title : 'advanced.cleanup_desc',
                cmd : 'mceCleanup'
            });
        },
        getInfo : function() {
            return {
                longname : 'Cleanup',
                author : 'Ryan Demmer',
                authorurl : 'http://www.joomlacontenteditor.net',
                infourl : 'http://www.joomlacontenteditor.net',
                version : '@@version@@'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('cleanup', tinymce.plugins.CleanupPlugin);
})();

/**
* @version		$Id: editor_plugin.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
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

	tinymce.create('tinymce.plugins.CleanupPlugin', {
		init : function(ed, url) {
			var self = this;
			this.editor = ed;

			// set validate value to verify_html value
			if (ed.settings.verify_html === false) {
				ed.settings.validate = false;
			}
			
			/** TODO - Re-visit in 2.1
			
			if (ed.settings.schema == 'html5') {
				if (ed.settings.invalid_elements) {					
					ed.settings.invalid_elements += 'acronym,applet,basefont,big,center,dir,font,frame,frameset,noframes,strike,tt,u,xmp';
				}	
			} **/
			
			ed.onPreInit.add( function() {
				
				/** TODO - Re-visit in 2.1
				if (ed.settings.schema == 'html5') {
					var schema = ed.schema;
					
					// standard events
					var se = 'onafterprint|onbeforeprint|onbeforeonload|onerror|onhaschange|onmessage|onoffline|ononline|onpagehide|onpageshow|onpopstate|onredo|onresize|onstorage|onundo|onunload'
					+ 'ondrag|ondragend|ondragenter|ondragleave|ondragover|ondragstart|ondrop|onmousewheel|onscroll'
					+ 'oncanplay|oncanplaythrough|ondurationchange|onemptied|onended|onerror|onloadeddata|onloadedmetadata|onloadstart|onpause|onplay|onplaying|onprogress|onratechange|onreadystatechange|onseeked|onseeking|onstalled|onsuspend|ontimeupdate|onvolumechange|onwaiting';
					
					// form events
					var fe = 'oncontextmenu|onformchange|onforminput|oninput|oninvalid|onfocus|onblur';
					
					// standard attributes
					var sa = 'contenteditable|contextmenu|draggable|dropzone|hidden|spellcheck';
					
					// form attributes
					var fa = 'autocomplete|autofocus|form|formaction|formenctype|formmethod|formnovalidate|formtarget|height|list|max|min|pattern|placeholder|required|step|width|accesskey|tabindex';
					
					// add elements
					var elms = 'article[*],aside[*],canvas[width|height|*],command[icon|label|radiogroup|type|*],'
					+ 'details[open|*],figcaption[*],figure[*],footer[*],header[*],hgroup[*],keygen[autofocus=disabled|challenge|form|keytype|name]'
					+ 'mark[*],meter[form|high|low|max|min|optimum|*],nav[*],output[for|form|name|*],progress[max|value],rp[*],rt[*],ruby[*],section[*],summary[*],time[datetime|pubdate|*],wbr[*]';

					schema.addValidElements(elms.replace('*', sa + '|' + se + '|*'));
					
					var ielms = 'input[*],select[*],button[*],textarea[*],datalist[*],keygen[*],output[*]';
					
					schema.addValidElements(ielms.replace('*', fa + '|' + fe + '|*'));
					
					var html5_flow 		= 'article|aside|canvas|details|figure|footer|header|hgroup|menu|nav|section';
					var html5_phrase 	= 'audio|canvas|math|video|command|datalist|keygen|mark|meter|output|progress|ruby|time|wbr';
					
					var flow 			= 'address|blockquote|del|div|dl|fieldset|form|hr|ins|map|noscript|ol|p|pre|table|ul';
					var phrase 			= 'a|embed|iframe|img|object|a|abbr|b|bdi|bdo|br|button|cite|code|del|dfn|em|i|input|ins|kbd|label|map|noscript|p|s|samp|script|select|small|span|strong|sub|sup|textarea|u|var|#text';
					
					// set valid children for flow elements
					each(html5_flow.split('|'), function(e) {
						schema.addValidChildren(e + '[' + html5_phrase + '|' + flow + '|' + phrase + ']');
					});
					
					// add valid children for html4 flow / inline elements
					each(flow.split('|'), function(e) {
						schema.addValidChildren('+' + e + '[' + html5_phrase + ']');
					});
					
					// add for a element
					schema.addValidChildren('+a[' + html5_flow + '|' + html5_phrase + '|' + flow + ']');
					
					// fix boolean attributes
					ed.serializer.addAttributeFilter('hidden,formnovalidate,autofocus,required,open,challenge,pubdate', function(nodes, name, args) {
						for (var i = 0, len = nodes.length; i < len; i++) {
							nodes[i].attr(name, name);
						}
					});
					
					// fix shortended elements
					ed.parser.addNodeFilter('command,keygen,wbr', function(nodes, name, args) {
						for (var i = 0, len = nodes.length; i < len; i++) {
							nodes[i].shortEnded = true;
						}
					});

					ed.serializer.addNodeFilter('command,keygen,wbr', function(nodes, name, args) {
						for (var i = 0, len = nodes.length; i < len; i++) {
							nodes[i].shortEnded = true;
						}
					});
				} **/
				
				// disable onclick, ondblclick
				ed.parser.addAttributeFilter('onclick, ondblclick', function(nodes, name) {
					for (var i = 0, len = nodes.length; i < len; i++) {
						var node = nodes[i];
						var ev = node.attr(name);
						
						if (ev) {
							node.attr('data-mce-' + name, ev);
							node.attr(name, '');
						}
					}
				});

				// enable onclick, ondblclick
				ed.serializer.addAttributeFilter('onclick, ondblclick', function(nodes, name, args) {
					for (var i = 0, len = nodes.length; i < len; i++) {
						var node = nodes[i];
						var ev = node.attr('data-mce-' + name);
						
						if (ev) {
							node.attr(name, ev);
							node.attr('data-mce-' + name, '');
						}
					}
				});

			});

			// run cleanup with default settings
			if (ed.settings.validate === false && ed.settings.verify_html === false) {
				ed.addCommand('mceCleanup', function() {
					var s = ed.settings, se = ed.selection, bm;
					
					bm = se.getBookmark();

					var content = ed.getContent({cleanup : true});
					
					var schema  = new tinymce.html.Schema({
						validate				: true,
						verify_html 			: true, 
						valid_styles			: s.valid_styles, 
						valid_children			: s.valid_children,
						custom_elements			: s.custom_elements,
						extended_valid_elements : s.extended_valid_elements	
					});	
					
					content = new tinymce.html.Serializer({validate : true}, schema).serialize(
						new tinymce.html.DomParser({validate : true}, schema).parse(content)
					);
					
					ed.setContent(content, {cleanup : true});
					
					se.moveToBookmark(bm);	
				});
			}
			
			// Cleanup callback
			ed.onBeforeSetContent.add(function(ed, o) {
				// Geshi
				o.content = o.content.replace(/<pre xml:\s*(.*?)>(.*?)<\/pre>/g, '<pre class="geshi-$1">$2</pre>');
			});
			// Cleanup callback
			ed.onPostProcess.add(function(ed, o) {
				if (o.set) {
					// Geshi
					o.content = o.content.replace(/<pre xml:\s*(.*?)>(.*?)<\/pre>/g, '<pre class="geshi-$1">$2</pre>');			
				}
				if (o.get) {					
					// Geshi
					o.content = o.content.replace(/<pre class="geshi-(.*?)">(.*?)<\/pre>/g, '<pre xml:$1>$2</pre>');						
					// Remove empty jcemediabox / jceutilities anchors
					o.content = o.content.replace(/<a([^>]*)class="jce(box|popup|lightbox|tooltip|_tooltip)"([^>]*)><\/a>/gi, '');
					// Remove span elements with jcemediabox / jceutilities classes
					o.content = o.content.replace(/<span class="jce(box|popup|lightbox|tooltip|_tooltip)">(.*?)<\/span>/gi, '$2');
					// mce stuff
					o.content = o.content.replace(/_mce_(src|href|style|coords|shape)="([^"]+)"\s*?/gi, '');
					
					if (ed.getParam('keep_nbsp', true)) {
						o.content = o.content.replace(/\u00a0/g, '&nbsp;');
					}	
					
					// pad empty paragraphs
					if (ed.getParam('verify_html') === false) {
						o.content = o.content.replace(/<body([^>]*)>([\s\S]*)<\/body>/, '$2');
						o.content = o.content.replace(/<p([^>]*)><\/p>/g, '<p$1>&nbsp;</p>');
					}		
				}
			});
			
			// Save callback
			ed.onGetContent.add(function(ed, o){
				if(o.save){
					// Convert entities to characters
					if(ed.getParam('cleanup_pluginmode')){
						o.content = o.content.replace(/&#39;/gi, "'");
						o.content = o.content.replace(/&apos;/gi, "'");
						o.content = o.content.replace(/&amp;/gi, "&");
						o.content = o.content.replace(/&quot;/gi, '"');
					}
				}
			});
			
			// Register buttons
            ed.addButton('cleanup', {
                title 	: 'advanced.cleanup_desc',
                cmd 	: 'mceCleanup'
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
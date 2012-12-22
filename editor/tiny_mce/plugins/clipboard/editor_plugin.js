/**
 * @author Moxiecode
 * @author Ryan Demmer
 * @copyright Copyright (c) 2004-2008, Moxiecode Systems AB, All rights reserved.
 * @copyright Copyright (c) 2009-2012, Ryan Demmer, All rights reserved.
 */

(function() {
    var each = tinymce.each;
    var VK = tinymce.VK;

    var styleProps = new Array(
        'background', 'background-attachment', 'background-color', 'background-image', 'background-position', 'background-repeat',
        'border', 'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-color', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-style', 'border-top', 'border-top-color', 'border-top-style', 'border-top-width', 'border-width', 'outline', 'outline-color', 'outline-style', 'outline-width',
        'height', 'max-height', 'max-width', 'min-height', 'min-width', 'width',
        'font', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight',
        'content', 'counter-increment', 'counter-reset', 'quotes',
        'list-style', 'list-style-image', 'list-style-position', 'list-style-type',
        'margin', 'margin-bottom', 'margin-left', 'margin-right', 'margin-top',
        'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top',
        'bottom', 'clear', 'clip', 'cursor', 'display', 'float', 'left', 'overflow', 'position', 'right', 'top', 'visibility', 'z-index',
        'orphans', 'page-break-after', 'page-break-before', 'page-break-inside', 'widows',
        'border-collapse', 'border-spacing', 'caption-side', 'empty-cells', 'table-layout',
        'color', 'direction', 'letter-spacing', 'line-height', 'text-align', 'text-decoration', 'text-indent', 'text-shadow', 'text-transform', 'unicode-bidi', 'vertical-align', 'white-space', 'word-spacing'
        );

    tinymce.create('tinymce.plugins.ClipboardPlugin', {
        init : function(ed, url) {
            var self = this, cb;

            self.editor = ed;
            self.url = url;
			
            // set default paste state for dialog trigger
            this.canPaste = false;

            // Setup plugin events
            self.onPreProcess 		= new tinymce.util.Dispatcher(this);
            self.onPostProcess 		= new tinymce.util.Dispatcher(this);
            self.onBeforeInsert 	= new tinymce.util.Dispatcher(this);
            self.onAfterPaste 		= new tinymce.util.Dispatcher(this);

            // Register default handlers
            self.onPreProcess.add(self._preProcess);
            self.onPostProcess.add(self._postProcess);
            self.onBeforeInsert.add(self._onBeforeInsert);

            // Register optional preprocess handler
            self.onPreProcess.add( function(pl, o) {
                ed.execCallback('paste_preprocess', pl, o);
            });

            // Register optional postprocess
            self.onPostProcess.add( function(pl, o) {
                ed.execCallback('paste_postprocess', pl, o);
            });

            ed.onKeyDown.addToTop( function(ed, e) {
                // Block ctrl+v from adding an undo level since the default logic in tinymce.Editor will add that
                if ((VK.metaKeyPressed && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45)) {
                    return false; // Stop other listeners
                }
                                
                // block events
                if (!ed.getParam('clipboard_allow_cut', 1) && (VK.metaKeyPressed && e.keyCode == 88)) {
                    e.preventDefault();
                    return false;
                }
                
                if (!ed.getParam('clipboard_allow_copy', 1) && (VK.metaKeyPressed && e.keyCode == 67)) {
                    e.preventDefault();
                    return false;
                }
            });

            self.pasteText 	= ed.getParam('clipboard_paste_text', 1);
            self.pasteHtml	= ed.getParam('clipboard_paste_html', 1);

            // This function executes the process handlers and inserts the contents
            function process(o) {
                var dom = ed.dom, rng;

                ed.setProgressState(1);

                // override states
                switch(self.command) {
                    case 'mcePaste':
                        if (!self.pasteHtml) {
                            self.command = 'mcePasteText';
                        }
                        break;
                    case 'mcePasteText':
                        if (!self.pasteText) {
                            self.command = 'mcePaste';
                        }
                        break;
                    case 'mcePasteWord':
                        if (!self.pasteWord || !self.pasteHtml) {
                            self.command = 'mcePasteText';
                        }
                        break;
                    default:
                        self.command = 'mcePaste';
                        if (!self.pasteHtml && self.pasteText) {
                            self.command = 'mcePasteText';
                        }

                        break;
                }

                // set plainText flag
                self.plainText = self.command == 'mcePasteText';

                // set word content flag
                if (ed.getParam('clipboard_paste_force_cleanup')) {
                    o.wordContent = true;
                }

                // Execute pre process handlers
                self.onPreProcess.dispatch(self, o);

                // Create DOM structure
                o.node = dom.create('div', 0, o.content);

                // If pasting inside the same element and the contents is only one block
                // remove the block and keep the text since Firefox will copy parts of pre and h1-h6 as a pre element
                if (tinymce.isGecko) {
                    rng = ed.selection.getRng(true);
                    if (rng.startContainer == rng.endContainer && rng.startContainer.nodeType == 3) {
                        // Is only one block node and it doesn't contain word stuff
                        if (o.node.childNodes.length === 1 && /^(p|h[1-6]|pre)$/i.test(o.node.firstChild.nodeName) && o.content.indexOf('__MCE_ITEM__') === -1)
                            dom.remove(o.node.firstChild, true);
                    }
                }

                // Execute post process handlers
                self.onPostProcess.dispatch(self, o);

                // Serialize content
                o.content = ed.serializer.serialize(o.node, {
                    getInner : 1,
                    forced_root_block : ''
                });

                self.onBeforeInsert.dispatch(self, o);

                if (self.plainText) {
                    self._insertPlainText(o.content);
                } else {
                    self._insert(o.content);
                }

                // Trigger onAfterPaste event
                self.onAfterPaste.dispatch(self);

                ed.setProgressState(0);

                // reset to default
                self.command = 'mcePaste';
            };

            // Add command for external usage
            ed.addCommand('mceInsertClipboardContent', function(u, o) {
                process(o);
            });

            ed.onInit.add( function() {
                if (ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add( function(th, m, e) {
                        var c = ed.selection.isCollapsed();
                        
                        if (ed.getParam('clipboard_cut', 1)) {
                            m.add({
                                title   : 'advanced.cut_desc', /* TODO - Change to clipboard.cut_desc */
                                icon    : 'cut',
                                cmd     : 'Cut'
                            }).setDisabled(c);
                        }
                        
                        if (ed.getParam('clipboard_copy', 1)) {
                            m.add({
                                title   : 'advanced.copy_desc', /* TODO - Change to clipboard.copy_desc */
                                icon    : 'copy',
                                cmd     : 'Copy'
                            }).setDisabled(c);
                        }
                        
                        if (self.pasteHtml) {
                            m.add({
                                title   : 'paste.paste_desc', /* TODO - Change to clipboard.paste_desc */
                                icon    : 'paste',
                                cmd     : 'mcePaste'
                            });
                        }
                        if (self.pasteText) {
                            m.add({
                                title   : 'paste.paste_text_desc', /* TODO - Change to clipboard.paste_text_desc */
                                icon    : 'pastetext',
                                cmd     : 'mcePasteText'
                            });
                        }
                    });

                }
            });

            // This function grabs the contents from the clipboard by adding a
            // hidden div and placing the caret inside it and after the browser paste
            // is done it grabs that contents and processes that
            function grabContent(e) {
                var n, or, rng, oldRng, sel = ed.selection, dom = ed.dom, doc = ed.getDoc(), body = ed.getBody(), posY, textContent;

                // Check if browser supports direct plaintext access
                if (e.clipboardData || doc.dataTransfer) {
                    textContent = (e.clipboardData || doc.dataTransfer).getData('Text');

                    if (ed.pasteAsPlainText) {
                        e.preventDefault();
                        process({
                            content : textContent.replace(/\r?\n/g, '<br />')
                        });
                        return;
                    }
                }
                // don't repeat paste
                if (dom.get('_mcePaste')) {
                    return;
                }

                // Create container to paste into
                n = dom.add(body, 'div', {
                    id : '_mcePaste',
                    'class' : 'mcePaste',
                    'data-mce-bogus' : '1'
                }, '\uFEFF\uFEFF');

                // If contentEditable mode we need to find out the position of the closest element
                if (body != ed.getDoc().body)
                    posY = dom.getPos(ed.selection.getStart(), body).y;
                else
                    posY = body.scrollTop + dom.getViewPort(ed.getWin()).y;

                // Styles needs to be applied after the element is added to the document since WebKit will otherwise remove all styles
                // If also needs to be in view on IE or the paste would fail
                dom.setStyles(n, {
                    position : 'absolute',
                    left : tinymce.isGecko ? -40 : 0, // Need to move it out of site on Gecko since it will othewise display a ghost resize rect for the div
                    top : posY - 25,
                    width : 1,
                    height : 1,
                    overflow : 'hidden'
                });

                if (tinymce.isIE) {
                    // Store away the old range
                    oldRng = sel.getRng();

                    // Select the container
                    rng = dom.doc.body.createTextRange();
                    rng.moveToElementText(n);
                    rng.execCommand('Paste');

                    // Remove container
                    dom.remove(n);

                    // Check if the contents was changed, if it wasn't then clipboard extraction failed probably due
                    // to IE security settings so we pass the junk though better than nothing right
                    if (n.innerHTML === '\uFEFF\uFEFF') {
                        e.preventDefault();
                        return;
                    }

                    // Restore the old range and clear the contents before pasting
                    sel.setRng(oldRng);
                    sel.setContent('');
					
                    // set paste state as true...we got this far right?
                    self.canPaste = true;

                    // For some odd reason we need to detach the the mceInsertContent call from the paste event
                    // It's like IE has a reference to the parent element that you paste in and the selection gets messed up
                    // when it tries to restore the selection
                    setTimeout( function() {					
                        // Process contents
                        process({
                            content : n.innerHTML
                        });
                    }, 0);

                    // Block the real paste event
                    tinymce.dom.Event.cancel(e);					
                } else {
                    function block(e) {
                        e.preventDefault();
                    };
					
                    // set paste state as true...we got this far right?
                    self.canPaste = true;

                    //n.innerHTML = '\uFEFF<br data-mce-bogus="1" />';

                    // Block mousedown and click to prevent selection change
                    dom.bind(doc, 'mousedown', block);
                    dom.bind(doc, 'keydown', block);

                    or = ed.selection.getRng();

                    // Move caret into hidden div
                    n = n.firstChild;
                    rng = doc.createRange();
                    rng.setStart(n, 0);
                    rng.setEnd(n, 2);
                    sel.setRng(rng);

                    // Wait a while and grab the pasted contents
                    window.setTimeout( function() {
                        var h = '', nl;

                        // Paste divs duplicated in paste divs seems to happen when you paste plain text so lets first look for that broken behavior in WebKit
                        if (!dom.select('div.mcePaste > div.mcePaste').length) {
                            nl = dom.select('div.mcePaste');

                            // WebKit will split the div into multiple ones so this will loop through then all and join them to get the whole HTML string
                            each(nl, function(n) {
                                var child = n.firstChild;

                                // WebKit inserts a DIV container with lots of odd styles
                                if (child && child.nodeName == 'DIV' && child.style.marginTop && child.style.backgroundColor) {
                                    dom.remove(child, 1);
                                }

                                // Remove apply style spans
                                each(dom.select('span.Apple-style-span', n), function(n) {
                                    dom.remove(n, 1);
                                });

                                // Remove bogus br elements
                                each(dom.select('br[data-mce-bogus]', n), function(n) {
                                    dom.remove(n);
                                });

                                // WebKit will make a copy of the DIV for each line of plain text pasted and insert them into the DIV
                                if (n.parentNode.className != 'mcePaste')
                                    h += n.innerHTML;
                            });

                        } else {
                            // Found WebKit weirdness so force the content into paragraphs this seems to happen when you paste plain text from Nodepad etc
                            // So this logic will replace double enter with paragraphs and single enter with br so it kind of looks the same
                            h = '<p>' + dom.encode(textContent).replace(/\r?\n\r?\n/g, '</p><p>').replace(/\r?\n/g, '<br />') + '</p>';
                        }

                        // Remove the nodes
                        each(dom.select('div.mcePaste'), function(n) {
                            dom.remove(n);
                        });

                        // Restore the old selection
                        if (or)
                            sel.setRng(or);

                        process({
                            content : h
                        });

                        // Unblock events ones we got the contents
                        dom.unbind(ed.getDoc(), 'mousedown', block);
                        dom.unbind(ed.getDoc(), 'keydown', block);
                    }, 0);

                }
            };

            // Is it's Opera or older FF use key handler
            if (tinymce.isOpera || /Firefox\/2/.test(navigator.userAgent)) {
                ed.onKeyDown.addToTop( function(ed, e) {
                    if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45))
                        grabContent(e);
                });

            } else {
                // Grab contents on paste event on Gecko and WebKit
                ed.onPaste.addToTop( function(ed, e) {
                    return grabContent(e);
                });

            }

            // Block all drag/drop events
            if (ed.getParam('clipboard_paste_block_drop')) {
                ed.onInit.add( function() {
                    ed.dom.bind(ed.getBody(), ['dragend', 'dragover', 'draggesture', 'dragdrop', 'drop', 'drag'], function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        return false;
                    });

                });

            }
			
            /*each(['Cut', 'Copy'], function(command) {
                ed.addCommand(command, function() {
                    var doc = ed.getDoc(), failed;

                    // Try executing the native command
                    try {
                        doc.execCommand(command, false, null);
                    } catch (ex) {
                        // Command failed
                        failed = true;
                    }
	
                    // Present alert message about clipboard access not being available
                    if (failed || (tinymce.isIE && !doc.queryCommandSupported('Paste'))) {
                        if (tinymce.isGecko) {
                            ed.windowManager.confirm(ed.getLang('clipboard_msg'), function(state) {
                                if (state) {
                                    open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', '_blank');
                                }
                            });
                        } else {
                            ed.windowManager.alert(ed.getLang('clipboard_no_support'));
                        }
                    }
                });
            });*/

            // Add commands
            each(['mcePasteText', 'mcePaste'], function(cmd) {
                ed.addCommand(cmd, function() {
                    var doc = ed.getDoc();
                    // set command
                    self.command = cmd;
					
                    // just open the window
                    if (ed.getParam('clipboard_paste_use_dialog') || (tinymce.isIE && !doc.queryCommandSupported('Paste'))) {
                        return self._openWin(cmd);
                    } else {
                        try {
                            doc.execCommand('Paste', false, null);
                        } catch (e) {
                            self.canPaste = false;
                        }
						
                        // if paste command not supported open window
                        if (self.canPaste === false) {
                            return self._openWin(cmd);
                        }
                    }
                });

            });
            
            // Add buttons
            if (self.pasteHtml && !self.pasteText) {
                ed.addButton('paste', {
                    title : 'paste.paste_desc',
                    cmd : 'mcePaste',
                    ui : true
                });
            }
            if (!self.pasteHtml && self.pasteText) {
                ed.addButton('paste', {
                    title : 'paste.paste_text_desc',
                    cmd : 'mcePasteText',
                    ui : true
                });
            }
            
            if (ed.getParam('clipboard_cut', 1)) {
                ed.addButton('cut', {
                    title   : 'advanced.cut_desc',
                    cmd     : 'Cut',
                    icon    : 'cut'
                });
            }
                        
            if (ed.getParam('clipboard_copy', 1)) {
                ed.addButton('copy', {
                    title   : 'advanced.copy_desc',
                    cmd     : 'Copy',
                    icon    : 'copy'
                });
            }
        },

        createControl: function(n, cm) {
            var self = this, ed = self.editor;

            switch (n) {
                case 'paste':
                    if(self.pasteHtml && self.pasteText) {
                        var c = cm.createSplitButton('paste', {
                            title : 'paste.paste_desc',
                            onclick : function(e) {
                                ed.execCommand('mcePaste');
                            }

                        });

                        c.onRenderMenu.add( function(c, m) {
                            m.add({
                                title : 'paste.paste_desc',
                                icon : 'paste',
                                onclick : function(e) {
                                    ed.execCommand('mcePaste');
                                }

                            });

                            m.add({
                                title : 'paste.paste_text_desc',
                                icon : 'pastetext',
                                onclick : function(e) {
                                    ed.execCommand('mcePasteText');
                                }

                            });
                        });

                        // Return the new splitbutton instance
                        return c;
                    }
                    break;
            }

            return null;
        },

        getInfo : function() {
            return {
                longname : 'Paste text/word',
                author : 'Moxiecode Systems AB / Ryan demmer',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/paste',
                version : '@@version@@'
            };
        },

        _openWin : function(cmd) {
            var ed = this.editor;

            ed.windowManager.open({
                file 	: ed.getParam('site_url') + 'index.php?option=com_jce&view=editor&layout=plugin&plugin=clipboard',
                width 	: parseInt(ed.getParam("clipboard_paste_dialog_width", "450")),
                height 	: parseInt(ed.getParam("clipboard_paste_dialog_height", "400")),
                inline 	: 1,
                popup_css : false
            }, {
                cmd : cmd
            });
        },

        _preProcess : function(pl, o) {
            var ed = pl.editor, h = o.content, rb;

            if (ed.settings.paste_enable_default_filters == false) {
                return;
            }

            // IE9 adds BRs before/after block elements when contents is pasted from word or for example another browser
            if (tinymce.isIE && document.documentMode >= 9 && /<(h[1-6r]|p|div|address|pre|form|table|tbody|thead|tfoot|th|tr|td|li|ol|ul|caption|blockquote|center|dl|dt|dd|dir|fieldset)/.test(o.content)) {
                // IE9 adds BRs before/after block elements when contents is pasted from word or for example another browser
                h = h.replace(/(?:<br>&nbsp;[\s\r\n]+|<br>)*(<\/?(h[1-6r]|p|div|address|pre|form|table|tbody|thead|tfoot|th|tr|td|li|ol|ul|caption|blockquote|center|dl|dt|dd|dir|fieldset)[^>]*>)(?:<br>&nbsp;[\s\r\n]+|<br>)*/g, '$1');

                // IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
                h = h.replace(/<br><br>/g, '<BR><BR>'); // Replace multiple BR elements with uppercase BR to keep them intact
                h = h.replace(/<br>/g, ' '); // Replace single br elements with space since they are word wrap BR:s
                h = h.replace(/<BR><BR>/g, '<br>'); // Replace back the double brs but into a single BR
            }

            // Process away some basic content
            h = h.replace(/^\s*(&nbsp;)+/g, ''); // nbsp entities at the start of contents
            h = h.replace(/(&nbsp;|<br[^>]*>)+\s*$/g, ''); // nbsp entities at the end of contents

            // skip plain text
            if (this.plainText) {
                return h;
            }

            var ooRe = /(Version:[\d\.]+)\s*?((Start|End)(HTML|Fragment):[\d]+\s*?){4}/;

            // Open Office
            if (/(content=\"OpenOffice.org[^\"]+\")/i.test(h) || ooRe.test(h)) {
                o.wordContent = true; // Mark the pasted contents as word specific content

                h = h.replace(ooRe, '', 'g');

                h = h.replace(/[\s\S]+?<meta[^>]*>/, ''); // Remove everything before meta element
                h = h.replace(/<!--[\s\S]+?-->/gi, ''); // Comments
                h = h.replace(/<style[^>]*>[\s\S]+?<\/style>/gi, ''); // Remove styles
            }

            // Word
            if (/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test(h)) {
                o.wordContent = true; // Mark the pasted contents as word specific content
            }

            // Remove all styles
            if (ed.getParam('clipboard_paste_remove_styles')) {
                h = h.replace(/\sstyle="([^"]+?)"/gi, '');
            }
			
            // remove attributes
            if (ed.getParam('clipboard_paste_remove_attributes')) {
                var attribs = ed.getParam('clipboard_paste_remove_attributes').split(',');
				
                h = h.replace(new RegExp('\s(' + attribs.join('|') + ')="([^"]+)"', 'gi'), '');
            }

            // replace double linebreaks with paragraphs
            if (rb = ed.getParam('forced_root_block')) {
                var blocks = '';
                // only split if a double break exists
                if (h.indexOf('<br><br>') != -1) {
                    // convert marker to paragraphs
                    tinymce.each(h.split('<br><br>'), function(block) {
                        blocks += '<' + rb + '>' + block + '</' + rb + '>';
                    });

                    h = blocks;
                }
            }

            // replace paragraphs with linebreaks
            if (!ed.getParam('forced_root_block')) {
                h = h.replace(/<\/(p|div)>/gi, '<br /><br />').replace(/<(p|div)([^>]*)>/g, '').replace(/(<br \/>){2}$/g, '');
            }

            if (o.wordContent) {
                h = this._processWordContent(h);
            }

            // Remove classes based on paste_strip_class_attributes setting. All Mso classes will be removed
            var stripClass  = ed.getParam('clipboard_paste_strip_class_attributes', 'all');

            if (stripClass != 'none') {
                function removeClasses(match, g1) {
                    // remove all classes
                    if (stripClass == 'all') {
                        return '';
                    }
                    
                    // remove Mso classes
                    var cls = tinymce.grep(tinymce.explode(g1.replace(/^(["'])(.*)\1$/, "$2"), " "), function(v) {
                        return (/^(?!mso)/i.test(v));
                    });

                    return cls.length ? ' class="' + cls.join(" ") + '"' : '';
                };

                h = h.replace(/ class="([^"]+)"/gi, removeClasses);
                h = h.replace(/ class=([\-\w]+)/gi, removeClasses);
            }

            // Remove all spans (and font, u, strike if inline_styles = true as these would get converted to spans later)
            if (ed.getParam('clipboard_paste_remove_spans')) {
                if (ed.settings.inline_styles) {
                    h = h.replace(/<\/?(u|strike)[^>]*>/gi, '');
                    if (ed.settings.convert_fonts_to_spans) {
                        h = h.replace(/<\/?(font)[^>]*>/gi, '');
                    }
                }
                h = h.replace(/<\/?(span)[^>]*>/gi, '');
            }

            h = h.replace(/&nbsp;/g, '\u00a0'); // Replace nsbp entites to char since it's easier to handle

            // Chrome...
            h = h.replace(/<meta([^>]+)>/, '');

            // Copy paste from Java like Open Office will produce this junk on FF
            h = h.replace(/Version:[\d.]+\nStartHTML:\d+\nEndHTML:\d+\nStartFragment:\d+\nEndFragment:\d+/gi, '');
			
            // convert urls in content
            if (ed.getParam('clipboard_paste_convert_urls', true)) {
                h = this._convertURLs(h);
            }
            
            // convert some tags if cleanup is off
            if(ed.settings.verify_html === false) {
                h = h.replace(/<i\b([^>]*)>/gi, '<em$1>');
                h = h.replace(/<\/i>/gi, '</em>');
                
                h = h.replace(/<b\b([^>]*)>/gi, '<strong$1>');
                h = h.replace(/<\/b>/gi, '</strong>');
            }

            o.content = h;
        },

        _processWordContent : function(h) {
            var ed = this.editor, stripClass, len;

            if (ed.getParam('clipboard_paste_convert_lists', true)) {
                h = h.replace(/<!--\[if !supportLists\]-->/gi, '$&__MCE_ITEM__'); // Convert supportLists to a list item marker
                h = h.replace(/(<span[^>]+:\s*symbol[^>]+>)/gi, '$1__MCE_ITEM__'); // Convert symbol spans to list items
                h = h.replace(/(<span[^>]+mso-list:[^>]+>)/gi, '$1__MCE_ITEM__'); // Convert mso-list to item marker
                h = h.replace(/(<p[^>]+(?:MsoListParagraph)[^>]+>)/gi, '$1__MCE_ITEM__');
            }

            // Word comments like conditional comments etc
            h = h.replace(/<!--[\s\S]+?-->/gi, '');

            // remove styles
            h = h.replace(/<style([^>]*)>([\w\W]*?)<\/style>/gi, '');

            // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content, MS Office namespaced tags, and a few other tags
            h = h.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|meta|link|\w:\w+)(?=[\s\/>]))[^>]*>/gi, '');

            // Convert <s> into <strike> for line-though
            h = h.replace(/<(\/?)s>/gi, "<$1strike>");

            // Replace nsbp entites to char since it's easier to handle
            h = h.replace(/&nbsp;/gi, "\u00a0");

            // Remove bad attributes, with or without quotes, ensuring that attribute text is really inside a tag.
            // If JavaScript had a RegExp look-behind, we could have integrated this with the last process() array and got rid of the loop. But alas, it does not, so we cannot.
            do {
                len = h.length;
                h = h.replace(/(<[a-z][^>]*\s)(?:id|language|type|on\w+|\w+:\w+)=(?:"[^"]*"|\w+)\s?/gi, "$1");
            } while (len != h.length);

            // Process styles
            if (!ed.getParam('clipboard_paste_remove_styles')) {
                // CSS Reference: http://msdn.microsoft.com/en-us/library/aa155477.aspx

                // Convert <span style="mso-spacerun:yes">___</span> to string of alternating breaking/non-breaking spaces of same length
                h = h.replace(/<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi, function (str, spaces) {
                    return (spaces.length > 0)? spaces.replace(/./, " ").slice(Math.floor(spaces.length/2)).split("").join("\u00a0") : "";
                });

                // Examine all styles: delete junk, transform some, and keep the rest
                h = h.replace(/(<[a-z][^>]*)\sstyle="([^"]*)"/gi, function (str, tag, style) {
                    var n = [],
                    i = 0,
                    s = tinymce.explode(tinymce.trim(style).replace(/&quot;/gi, "'"), ";");

                    // Examine each style definition within the tag's style attribute
                    each(s, function (v) {
                        var name, value,
                        parts = tinymce.explode(v, ":");

                        function ensureUnits(v) {
                            return v + ((v !== "0") && (/\d$/.test(v)))? "px" : "";
                        }

                        if (parts.length == 2) {
                            name = parts[0].toLowerCase();
                            value = parts[1].toLowerCase();

                            // Translate certain MS Office styles into their CSS equivalents
                            switch (name) {
                                case "mso-padding-alt":
                                case "mso-padding-top-alt":
                                case "mso-padding-right-alt":
                                case "mso-padding-bottom-alt":
                                case "mso-padding-left-alt":
                                case "mso-margin-alt":
                                case "mso-margin-top-alt":
                                case "mso-margin-right-alt":
                                case "mso-margin-bottom-alt":
                                case "mso-margin-left-alt":
                                case "mso-table-layout-alt":
                                case "mso-height":
                                case "mso-width":
                                case "mso-vertical-align-alt":
                                    n[i++] = name.replace(/^mso-|-alt$/g, "") + ":" + ensureUnits(value);
                                    return;

                                case "horiz-align":
                                    n[i++] = "text-align:" + value;
                                    return;

                                case "vert-align":
                                    n[i++] = "vertical-align:" + value;
                                    return;

                                case "font-color":
                                case "mso-foreground":
                                    n[i++] = "color:" + value;
                                    return;

                                case "mso-background":
                                case "mso-highlight":
                                    n[i++] = "background:" + value;
                                    return;

                                case "mso-default-height":
                                    n[i++] = "min-height:" + ensureUnits(value);
                                    return;

                                case "mso-default-width":
                                    n[i++] = "min-width:" + ensureUnits(value);
                                    return;

                                case "mso-padding-between-alt":
                                    n[i++] = "border-collapse:separate;border-spacing:" + ensureUnits(value);
                                    return;

                                case "text-line-through":
                                    if ((value == "single") || (value == "double")) {
                                        n[i++] = "text-decoration:line-through";
                                    }
                                    return;

                                case "mso-zero-height":
                                    if (value == "yes") {
                                        n[i++] = "display:none";
                                    }
                                    return;
                            }

                            // Eliminate all MS Office style definitions that have no CSS equivalent by examining the first characters in the name
                            if (/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?!align|decor|indent|trans)|top-bar|version|vnd|word-break)/.test(name)) {
                                return;
                            }

                            // If it reached this point, it must be a valid CSS style
                            n[i++] = name + ":" + parts[1];		// Lower-case name, but keep value case
                        }
                    });

                    // If style attribute contained any valid styles the re-write it; otherwise delete style attribute.
                    if (i > 0) {
                        return tag + ' style="' + n.join(';') + '"';
                    } else {
                        return tag;
                    }
                });

            }

            // remove double linebreaks (IE issue?)
            if (ed.getParam('forced_root_block')) {
                h = h.replace(/<br><br>/gi, '');
            }

            return h;
        },

        /**
         * Paste as Plain Text
         * Remove all html form pasted contents. Newlines will be converted to paragraphs or linebreaks
         */
        _insertPlainText : function(h) {
            var ed = this.editor, dom = ed.dom, rb, entities = null;

            if ((typeof(h) === "string") && (h.length > 0)) {

                // If HTML content with line-breaking tags, then remove all cr/lf chars because only tags will break a line
                if (/<(?:p|br|h[1-6]|ul|ol|dl|table|t[rdh]|div|blockquote|fieldset|pre|address|center)[^>]*>/i.test(h)) {
                    h = h.replace(/[\n\r]+/g, '');
                } else {
                    // Otherwise just get rid of carriage returns (only need linefeeds)
                    h = h.replace(/\r+/g, '');
                }

                h = h.replace(/<\/(?:p|h[1-6]|ul|ol|dl|table|div|blockquote|fieldset|pre|address|center)>/gi, "\n\n");		// Block tags get a blank line after them

                h = h.replace(/<br[^>]*>|<\/tr>/gi, "\n");				// Single linebreak for <br /> tags and table rows
                h = h.replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, "\t");		// Table cells get tabs betweem them
                h = h.replace(/<[a-z!\/?][^>]*>/gi,	'');				// Delete all remaining tags
                h = h.replace(/&nbsp;/gi, " ");							// Convert non-break spaces to regular spaces (remember, *plain text*)

                // replace HTML entity with actual character
                h = dom.decode(tinymce.html.Entities.encodeRaw(h));

                h = h.replace(/(?:(?!\n)\s)*(\n+)(?:(?!\n)\s)*/gi, "$1");	// Cool little RegExp deletes whitespace around linebreak chars.
                h = h.replace(/\n{3,}/g, "\n\n");							// Max. 2 consecutive linebreaks
                h = h.replace(/^\s+|\s+$/g, '');							// Trim the front & back

                // Perform replacements
                h = h.replace(/\u2026/g, "...");
                h = h.replace(/[\x93\x94\u201c\u201d]/g, '"');
                h = h.replace(/[\x60\x91\x92\u2018\u2019]/g, "'");

                if (rb = ed.getParam("forced_root_block")) {
                    // strip whitespace
                    h = h.replace(/^\s+|\s+$/g, '');
                    // replace double linebreaks with paragraphs
                    h = h.replace(/\n\n/g, '</' + rb + '><' + rb + '>');
                }
                // replace single linebreak with br element
                h = h.replace(/\n+?/g, '<br />');

                // remove empty paragraphs
                h = h.replace(/<p><\/p>/gi, '');
            }

            this._insert(h);
        },

        /**
         * Convert some deprecated elements to inline-styles
         */
        _convertToInline : function(node) {
            var ed = this.editor, dom = ed.dom;

            var fontSizes = tinymce.explode(ed.settings.font_size_style_values);

            function replaceWithSpan(n, styles) {
                tinymce.each(styles, function(value, name) {
                    if (value)
                        dom.setStyle(n, name, value);
                });

                dom.rename(n, 'span');
            };

            filters = {
                font : function(n) {
                    replaceWithSpan(n, {
                        backgroundColor : n.style.backgroundColor,
                        color : n.color,
                        fontFamily : n.face,
                        fontSize : fontSizes[parseInt(n.size) - 1]
                    });
                },

                u : function(n) {
                    replaceWithSpan(n, {
                        textDecoration : 'underline'
                    });
                },

                strike : function(n) {
                    replaceWithSpan(n, {
                        textDecoration : 'line-through'
                    });
                }

            };

            if (ed.settings.convert_fonts_to_spans) {
                tinymce.each(dom.select('font,u,strike', node), function(n) {
                    filters[n.nodeName.toLowerCase()](n);
                });

            }
        },

        /**
         * Process style attributes
         * @param node Node to process
         */
        _processStyles : function(node) {
            var ed = this.editor, dom = ed.dom;

            // Process style information
            var s = ed.getParam('clipboard_paste_retain_style_properties');

            // split to array if string
            if (s && tinymce.is(s, 'string')) {
                styleProps = tinymce.explode(s);
            }

            // Retains some style properties
            each(dom.select('*[style]', node), function(n) {
                var ns = {}, x = 0;

                // get styles on element
                var styles = dom.parseStyle(n.style.cssText);

                // check style against styleProps array
                each(styles, function(v, k) {
                    if (tinymce.inArray(styleProps, k) != -1) {
                        ns[k] = v;
                        x++;
                    }
                });

                // Remove all of the existing styles
                dom.setAttrib(n, 'style', '');

                if (x > 0) {
                    dom.setStyles(n, ns); // Add back the stored subset of styles
                } else {
                    // Remove empty span tags that do not have class attributes
                    if (n.nodeName == 'SPAN' && !n.className) {
                        dom.remove(n, true);
                    }
                }
                // We need to compress the styles on WebKit since if you paste <img border="0" /> it will become <img border="0" style="... lots of junk ..." />
                // Removing the mce_style that contains the real value will force the Serializer engine to compress the styles
                if (tinymce.isWebKit) {
                    n.removeAttribute('data-mce-style');
                }
            });

        },

        /**
         * Convert URL strings to elements
         * @param h HTML to process
         */
        _convertURLs : function(h) {			
            var ex = '([-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~]+@[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~]+\.[-!#$%&\'*+\\./0-9=?A-Z^_`a-z{|}~]+)';
            var ux = '((news|telnet|nttp|file|http|ftp|https)://[-!#$%&\'\*\+\\/0-9=?A-Z^_`a-z{|}~;]+\.[-!#$%&\'\*\+\\./0-9=?A-Z^_`a-z{|}~;]+)';
            
            h = h.replace(new RegExp('(=["\'])?' + ux, 'g'), function(a, b, c) {
                // only if not already a link
                if (!b) {                    
                    return '<a href="' + c + '">' + c +'</a>';	
                }
                    
                return a;	
            });
                    
            h = h.replace(new RegExp('(=["\']mailto:)?' + ex, 'g'), function(a, b, c) {
                // only if not already a mailto: link
                if (!b) {
                    return '<a href="mailto:' + c + '">' + c +'</a>';	
                }	
				
                return a;	
            });
			
            return h;
        },

        /**
         * Various post process items.
         */
        _postProcess : function(pl, o) {
            var self = this, ed = this.editor, dom = ed.dom, h;

            if (ed.settings.paste_enable_default_filters == false) {
                return;
            }
            // skip if plain text
            if (!this.plainText) {

                // Remove Apple style spans
                each(dom.select('span.Apple-style-span', o.node), function(n) {
                    dom.remove(n, 1);
                });

                // convert deprecated elements
                if (!ed.getParam('clipboard_paste_remove_spans')) {
                    // convert to inline_styles
                    if (ed.settings.inline_styles) {
                        this._convertToInline(o.node);
                    }
                }

                // post process Word content
                if (o.wordContent) {
                    // Remove named anchors or TOC links
                    each(dom.select('a', o.node), function(a) {
                        if (!a.href || a.href.indexOf('#_Toc') != -1)
                            dom.remove(a, 1);
                    });

                    // Remove lang attribute
                    each(dom.select('*[lang]', o.node), function(el) {
                        el.removeAttribute('lang');
                    });

                    // cleanup anchor links
                    each(dom.select('a[href*=#]', o.node), function(el) {
                        var href = el.href;
                        dom.setAttrib(el, 'href', href.substring(href.lastIndexOf('#')));
                        if (el.name)
                            dom.addClass(el, 'mceItemAnchor');
                    });

                } // end word content
				
                if (!ed.getParam('clipboard_paste_remove_styles')) {
                    // process style attributes
                    this._processStyles(o.node);
                }
	
                // convert lists
                if (ed.getParam('clipboard_paste_convert_lists', true)) {
                    this._convertLists(o.node);
                }
	
                // Process images - remove local
                each(dom.select('img', o.node), function(el) {					
                    var s = dom.getAttrib(el, 'src');
					
                    // remove img element if blank, local file url or base64 encoded
                    if (!s || /file:\/\//.test(s) || /data:image\/(gif|png|jpeg|jpg|bmp|tiff);base64/i.test(s)) {
                        dom.remove(el);
                    }		
					
                    dom.getAttrib(el, 'src', ed.convertURL(s));			
                });
				
                // Process links
                each(dom.select('a', o.node), function(el) {
                    var s = dom.getAttrib(el, 'href');
                    // convert url
                    if (s) {
                        dom.getAttrib(el, 'href', ed.convertURL(s));	
                    }					
                });
                }

                if (ed.getParam('clipboard_paste_remove_empty_paragraphs', true)) {
                    ed.dom.remove(dom.select('p:empty', o.node));

                    each(dom.select('p', o.node), function(n) {
                        var h = n.innerHTML;

                        if (/^(\s|&nbsp;|\u00a0)*?$/.test(h)) {
                            dom.remove(n);
                        }
                    });

                }
            },

            /*
     * Process content after it has been serialized.
     */
            _onBeforeInsert : function(pl, o) {
                var ed = pl.editor, dom = ed.dom, h = o.content;

                // remove spans
                if (ed.getParam('clipboard_paste_remove_spans')) {
                    h = h.replace(/<\/?(span)([^>]*)>/gi, '');
                }

                o.content = h;
            },

            /**
     * Converts the most common bullet and number formats in Office into a real semantic UL/LI list.
     */
            _convertLists : function(node) {
                var ed = this.editor, dom = ed.dom, listElm, li, lastMargin = -1, margin, levels = [], lastType;

                var ULRX = /^(__MCE_ITEM__)+[\u2022\u00b7\u00a7\u00d8o\u25CF]\s*\u00a0*/;
                var OLRX = /^__MCE_ITEM__\s*\(?(\w+)(\.|\))?\s*\u00a0+/;

                // Convert middot lists into real semantic lists
                each(dom.select('p', node), function(p) {
                    var sib, val = '', type, html, idx, parents, s, chars, st;

                    // Get text node value at beginning of paragraph
                    for (sib = p.firstChild; sib && sib.nodeType == 3; sib = sib.nextSibling) {
                        val += sib.nodeValue;
                    }

                    val = p.innerHTML.replace(/<\/?\w+[^>]*>/gi, '').replace(/&nbsp;/g, '\u00a0');

                    // Detect unordered lists look for bullets
                    if (ULRX.test(val)) {
                        type = 'ul';
                    }

                    if (s = val.match(OLRX)) {
                        type = 'ol';

                        chars = s[1];

                        // Detect ordered lists 1., a. or ixv. if style allowed
                        if (!ed.getParam('clipboard_paste_remove_styles')) {
                            if (chars && chars != '__MCE_ITEM__') {
                                if (/0[1-9]/.test(chars)) {
                                    st = 'decimal-leading-zero';
                                }
                                if (/[a-z+?]/.test(chars)) {
                                    st = 'lower-alpha';
                                }
                                if (/[A-Z+?]/.test(chars)) {
                                    st = 'upper-alpha';
                                }
                                if (/[ivx+]/.test(chars)) {
                                    st = 'lower-roman';
                                }
                                if (/[IVX+]/.test(chars)) {
                                    st = 'upper-roman';
                                }
                            }
                        }
                    }

                    // Check if node value matches the list pattern: o&nbsp;&nbsp;
                    if (type) {
                        margin = parseFloat(p.style.marginLeft || 0);

                        if (margin > lastMargin)
                            levels.push(margin);

                        if (!listElm || type != lastType) {
                            listElm = dom.create(type);
                            dom.insertAfter(listElm, p);
                        } else {
                            // Nested list element
                            if (margin > lastMargin) {
                                listElm = li.appendChild(dom.create(type));
                            } else if (margin < lastMargin) {
                                // Find parent level based on margin value
                                idx = tinymce.inArray(levels, margin);
                                parents = dom.getParents(listElm.parentNode, type);
                                listElm = parents[parents.length - 1 - idx] || listElm;
                            }
                        }

                        // Remove middot or number spans if they exists
                        each(dom.select('span', p), function(span) {
                            var html = span.innerHTML.replace(/<\/?\w+[^>]*>/gi, '');

                            // Remove span with the middot or the number
                            if (type == 'ul' && ULRX.test(html)) {
                                dom.remove(span);
                            } else if (/^(&nbsp;|\u00a0)+\s*/.test(html)) {
                                dom.remove(span);
                            } else if (OLRX.test(html)) {
                                dom.remove(span);
                            }
                        });

                        html = p.innerHTML;

                        // Remove middot/list items
                        if (type == 'ul') {
                            html = html.replace(/__MCE_ITEM__/g, '').replace(/^[\u2022\u00b7\u00a7\u00d8o\u25CF]\s*(&nbsp;|\u00a0)+\s*/, '');
                        } else {
                            html = html.replace(/__MCE_ITEM__/g, '').replace(/\s*\(?(\w+)(\.|\))?\s*(&nbsp;|\u00a0)+\s*/, '');
                        }

                        // Create li and add paragraph data into the new li
                        li = listElm.appendChild(dom.create('li', 0, html));
                        dom.remove(p);

                        // Set list styling if any
                        if (st && typeof st != 'undefined') {
                            dom.setStyle(listElm, 'list-style-type', st);
                        }

                        lastMargin = margin;
                        lastType = type;
                    } else {
                        listElm = lastMargin = 0; // End list element
                    }
                });

                // Remove any left over makers
                html = node.innerHTML;

                if (html.indexOf('__MCE_ITEM__') != -1) {
                    node.innerHTML = html.replace(/__MCE_ITEM__/g, '');
                }
            },

            /**
     * Inserts the specified contents at the caret position.
     */
            _insert : function(h, skip_undo) {
                var ed = this.editor;
			
                // reset validate to fix issues in IE7-
                if (ed.settings.validate === false) {
                    ed.settings.validate = true;
                }

                ed.execCommand('mceInsertContent', false, h, {
                    skip_undo : skip_undo
                });
			
                // reset validate
                if (ed.settings.verify_html === false) {
                    ed.settings.validate = false;
                }
            }

        });
    // Register plugin
    tinymce.PluginManager.add('clipboard', tinymce.plugins.ClipboardPlugin);
    })();
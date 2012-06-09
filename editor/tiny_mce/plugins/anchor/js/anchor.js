var AnchorDialog = {
    init : function(ed) {
        var n, v;
        
        tinyMCEPopup.restoreSelection();
		
        $('button#insert').button({
            icons : {
                primary : 'ui-icon-check'
            }
        });
		
        $('button#cancel').button({
            icons : {
                primary : 'ui-icon-close'
            }
        });

        n = ed.selection.getNode();
        
        // Webkit img
        if (n.nodeName == 'SPAN' && /mceItemAnchor/.test(n.className)) {
            v = ed.dom.getAttrib(n, 'data-mce-name') || ed.dom.getAttrib(n, 'id');
        } else {
            n = ed.dom.getParent(n, 'A');
            v = ed.dom.getAttrib(n, 'name') || ed.dom.getAttrib(n, 'id');
        }

        if (v) {
            this.action = 'update';
			
            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update'));
            $('#anchor').val(v);
        }

        $('#jce').css('display', 'block');
    },

    update : function() {
        var ed = tinyMCEPopup.editor, n, v = $('#anchor').val(), attrib = 'name';
		
        if (!v) {
            tinyMCEPopup.alert('advanced_dlg.anchor_invalid');
            return;
        }
		
        if (!/^[a-z][a-z0-9\-\_:\.]*$/i.test(v)) {
            tinyMCEPopup.alert('advanced_dlg.anchor_invalid');
            return;
        }

        tinyMCEPopup.restoreSelection();
        
        var aRule = ed.schema.getElementRule('a');
        
        if (!aRule || aRule.attributes.name) {
            attrib = 'name';
        } else {
            attrib = 'id';
        }
        
        var n = ed.selection.getNode();
        
        var at = {
            'class' :  'mceItemAnchor' 
        };

        if (n.nodeName == 'SPAN' && /mceItemAnchor/.test(n.className)) {
            if (attrib == 'name') {
                attrib = 'data-mce-name';
            }
            
            at[attrib] = v;
            
            ed.dom.setAttribs(n, at); 
            ed.undoManager.add();
        } else {
            if (n = ed.dom.getParent(n, 'A')) {
                at[attrib] = v;
                
                ed.dom.setAttribs(n, at); 
                ed.undoManager.add();
            } else {                
                //if (tinymce.isWebKit) {
                //ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('img', at));
                //} else {
                if (ed.selection.isCollapsed()) {                        
                    if (attrib == 'name') {
                        attrib = 'data-mce-name';
                    }
            
                    at[attrib] = v;
                    
                    //at.src = tinyMCEPopup.getWindowArg('plugin_url') + '/img/trans.gif';
                        
                    //ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('a', at, '\uFEFF'));
                    ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('span', at));
                } else {
                    at[attrib] = v;
                    
                    ed.execCommand('mceInsertLink', false, '#mce_temp_url#', {
                        skip_undo : 1
                    });
                    
                    at.href = at['data-mce-href'] = null;
            
                    tinymce.each(ed.dom.select('a[href="#mce_temp_url#"]'), function(link) {
                        ed.dom.setAttribs(link, at);
                    });
                }
                //}
                
                ed.nodeChanged();
            }
        }

        tinyMCEPopup.close();
    }
};

tinyMCEPopup.onInit.add(AnchorDialog.init, AnchorDialog);

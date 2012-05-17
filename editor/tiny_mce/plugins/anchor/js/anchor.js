tinyMCEPopup.requireLangPack();

var AnchorDialog = {
    init : function(ed) {
        var n, name, id;
        
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
		
        var n = ed.selection.getNode();
		
        if (n.nodeName == 'IMG' && /mceItemAnchor/.test(n.className)) {
            var data = tinymce.util.JSON.parse(ed.dom.getAttrib(n, 'data-mce-json'));
			
            name 	= data.name || '';
            id		= data.id || '';
        } else {
            n 		= ed.dom.getParent(n, 'A');
			
            name 	= ed.dom.getAttrib(n, 'name');
            id 		= ed.dom.getAttrib(n, 'id');
        }

        if (name || id) {
            this.action = 'update';
			
            $('#insert').button('option', 'label', tinyMCEPopup.getLang('update', 'Update'));
            $('#anchorName').val(name);
            $('#anchorID').val(id);
        }

        $('#jce').css('display', 'block');
    },

    update : function() {
        var ed = tinyMCEPopup.editor, n, name = $('#anchorName').val(), id = $('#anchorID').val();
		
        function check(s) {
            return /^[a-z][a-z0-9\-\_:\.]*$/i.test(s);
        }
		
        if (!name && !id) {
            tinyMCEPopup.alert('advanced_dlg.anchor_invalid');
            return;
        }
		
        if ((name && !check(name)) || (id && !check(id))) {
            tinyMCEPopup.alert('advanced_dlg.anchor_invalid');
            return;
        }

        tinyMCEPopup.restoreSelection();

        if (this.action != 'update') {
            ed.selection.collapse(1);
        }
		
        var n = ed.selection.getNode(), data;
	
        // existing img anchor link (webkit)
        if (ed.dom.is(n, 'img.mceItemAnchor')) {
            var o = {};
            
            if (name) {
                o.name = name;
            }
            
            if (id) {
                o.id = id;
            }
            // update
            ed.dom.setAttrib(n, 'data-mce-json',  tinymce.util.JSON.serialize(o));		
        // normal anchor link or new
        } else {
            n = ed.dom.getParent(n, 'A');
            
            var at = {
              'class' :  'mceItemAnchor' 
            };
            
            if (name) {
                at.name = name;
            }
            
            if (id) {
                at.id = id;
            }
            
            if (n) {
                ed.dom.setAttribs(n, at); 
            } else {
                ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('a', at, '\uFEFF'));
            }
        }
        tinyMCEPopup.close();
    }
};

tinyMCEPopup.onInit.add(AnchorDialog.init, AnchorDialog);

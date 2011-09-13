tinyMCEPopup.requireLangPack();

var AnchorDialog = {
	init : function(ed) {
		var n, name, id;
		
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
		
		n = ed.dom.getParent(ed.selection.getNode(), 'A');
		
		name 	= ed.dom.getAttrib(n, 'name');
		id 		= ed.dom.getAttrib(n, 'id');

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

		n = ed.dom.getParent(ed.selection.getNode(), 'A');
		
		if (n) {
			ed.dom.setAttrib(n, 'name', name);
			ed.dom.setAttrib(n, 'id', id);
		} else {
			ed.execCommand('mceInsertContent', 0, ed.dom.createHTML('a', {name : name, id : id, 'class' : 'mceItemAnchor'}, ''));
		}
		tinyMCEPopup.close();
	}
};

tinyMCEPopup.onInit.add(AnchorDialog.init, AnchorDialog);

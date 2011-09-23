/**
 * @author Moxiecode - based on work by Andrew Tetlaw
 * @author Ryan Demmer 
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 * @copyright Copyright © 2011, Ryan Demmer, All rights reserved.
 */
var XHTMLXtrasDialog = {
	settings : {},

	init : function() {
		tinyMCEPopup.resizeToInnerSize();

		var ed = tinyMCEPopup.editor, se = ed.selection, n = se.getNode(), el;
		var element = tinyMCEPopup.getWindowArg('element');
		el = !element ? n : ed.dom.getParent(n, element);

		TinyMCE_Utils.fillClassList('class');

		if(el) {
			$(':input').each(function() {
				var k = $(this).attr('id');

				$(this).val(ed.dom.getAttrib(el, k));
			});
			
			$('#insert').button('option', 'label', ed.getLang('update', 'Insert'));
		}

		$('#remove').button({
			icons : {
				primary : 'ui-icon-minus'
			}
		}).toggle(!!element);

		$.Plugin.init();
	},

	insert : function() {
		var ed = tinyMCEPopup.editor, se = ed.selection, n = se.getNode(), elm;

		tinyMCEPopup.restoreSelection();

		var element = tinyMCEPopup.getWindowArg('element');
		
		var args = {};

		$(':input').each(function() {
			var k = $(this).attr('id'), v = $(this).val();

			args[k] = v;
		});

		if(element) {			
			if(n.nodeName.toLowerCase() == element) {
				elm = n;
			} else {
				elm = ed.dom.getParent(n, element);
			}
			
			ed.formatter.apply(element.toLowerCase(), args, elm);
			
		} else {
			ed.dom.setAttribs(n, args);
		}

		ed.undoManager.add();

		tinyMCEPopup.close();
	},

	remove : function() {
		var ed = tinyMCEPopup.editor;

		var element = tinyMCEPopup.getWindowArg('element');

		if(element) {
			ed.formatter.remove(element);
			ed.undoManager.add();
		}

		tinyMCEPopup.close();
	},

	insertDateTime : function(id) {
		document.getElementById(id).value = this.getDateTime(new Date(), "%Y-%m-%dT%H:%M:%S");
	},

	getDateTime : function(d, fmt) {
		fmt = fmt.replace("%D", "%m/%d/%y");
		fmt = fmt.replace("%r", "%I:%M:%S %p");
		fmt = fmt.replace("%Y", "" + d.getFullYear());
		fmt = fmt.replace("%y", "" + d.getYear());
		fmt = fmt.replace("%m", this.addZeros(d.getMonth() + 1, 2));
		fmt = fmt.replace("%d", this.addZeros(d.getDate(), 2));
		fmt = fmt.replace("%H", "" + this.addZeros(d.getHours(), 2));
		fmt = fmt.replace("%M", "" + this.addZeros(d.getMinutes(), 2));
		fmt = fmt.replace("%S", "" + this.addZeros(d.getSeconds(), 2));
		fmt = fmt.replace("%I", "" + ((d.getHours() + 11) % 12 + 1));
		fmt = fmt.replace("%p", "" + (d.getHours() < 12 ? "AM" : "PM"));
		fmt = fmt.replace("%%", "%");

		return fmt;
	},

	addZeros : function(value, len) {
		var i;
		value = "" + value;

		if(value.length < len) {
			for( i = 0; i < (len - value.length); i++)
			value = "0" + value;
		}

		return value;
	}

};

tinyMCEPopup.requireLangPack();
tinyMCEPopup.onInit.add(XHTMLXtrasDialog.init, XHTMLXtrasDialog);

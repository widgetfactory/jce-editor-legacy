/**
 * $Id: xhtmlxtras.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 *
 * @author Moxiecode - based on work by Andrew Tetlaw
 * @copyright Copyright � 2004-2008, Moxiecode Systems AB, All rights reserved.
 */
var XHTMLXtrasDialog = {
    settings : {},

    init : function() {
        tinyMCEPopup.resizeToInnerSize();

        tinyMCEPopup.restoreSelection();

        var action = 'insert', ed = tinyMCEPopup.editor, se = ed.selection, n = se.getNode(), el;
        var element = tinyMCEPopup.getWindowArg('element');

        el = !element ? n : ed.dom.getParent(n, element);

        TinyMCE_Utils.fillClassList('class');

        if (el) {
            action = "update";

			$(':input').each( function() {
	            var k = $(this).attr('id');
	            
	            $(this).val(ed.dom.getAttrib(el, k));
	        });           
        }

        $('#remove').button({
        	 icons: {
             	primary: 'ui-icon-minus'
             }
        }).toggle(!!element);

        $('#insert').button('option', 'label', ed.getLang(action, 'Insert'));

        $.Plugin.init();
    },

    insert : function() {
        var ed = tinyMCEPopup.editor, se = ed.selection, n = se.getNode(), elm;

        var element = tinyMCEPopup.getWindowArg('element');
        
        if (element) {
        	if (n.nodeName.toLowerCase() == element) {
        		elm = n;
        	} else {
        		elm = ed.dom.getParent(n, element);
        	}
        } else {
			elm = n;
        }

        if (elm == null) {
            tag = !element ? 'span' : element;

            ed.execCommand('FontName', false, 'mceinline');
			
			tinymce.each(ed.dom.select('span,font'), function(n) {
				if (n.style.fontFamily == 'mceinline' || n.face == 'mceinline') {
					ed.dom.replace(ed.dom.create(tag, {'data-mce-new' : 1}), n, 1);
				}
			});
			
			elm = ed.dom.select(tag  + '[data-mce-new]')[0];
			elm.removeAttribute('data-mce-new');
        }

        $(':input').each( function() {
            var k = $(this).attr('id'), v = $(this).val();

            if (v !== '') {
                ed.dom.setAttrib(elm, k, v);
            }
        });

        tinyMCEPopup.close();
    },

    remove : function() {
        var ed = tinyMCEPopup.editor, se = ed.selection, n = se.getNode(), el;
        
        var element = tinyMCEPopup.getWindowArg('element');
        
        if (element) {
        	el = ed.dom.getParent(n, element);
        	
        	if(el && el.nodeName.toUpperCase() == element.toUpperCase()){
				ed.execCommand('mceRemoveNode', false, el);
				ed.nodeChanged();
				tinyMCEPopup.execCommand('mceEndUndoLevel');
			}
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
        fmt = fmt.replace("%m", this.addZeros(d.getMonth()+1, 2));
        fmt = fmt.replace("%d", this.addZeros(d.getDate(), 2));
        fmt = fmt.replace("%H", "" + this.addZeros(d.getHours(), 2));
        fmt = fmt.replace("%M", "" + this.addZeros(d.getMinutes(), 2));
        fmt = fmt.replace("%S", "" + this.addZeros(d.getSeconds(), 2));
        fmt = fmt.replace("%I", "" + ((d.getHours() + 11) % 12 + 1));
        fmt = fmt.replace("%p", "" + (d.getHours() < 12 ? "AM" : "PM"));
        fmt = fmt.replace("%%", "%");

        return fmt;
    },

    addZeros : function (value, len) {
        var i;

        value = "" + value;

        if (value.length < len) {
            for (i=0; i<(len-value.length); i++)
                value = "0" + value;
        }

        return value;
    }

};

tinyMCEPopup.requireLangPack();
tinyMCEPopup.onInit.add(XHTMLXtrasDialog.init, XHTMLXtrasDialog);
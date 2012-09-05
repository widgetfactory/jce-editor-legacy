//tinyMCEPopup.requireLangPack();

var ColorPicker = {
		
	settings : {},
	
	init : function() {
		var self = this, ed = tinyMCEPopup.editor, color = tinyMCEPopup.getWindowArg('input_color') || '#FFFFFF';
		
		$('#tmp_color').val(color).colorpicker($.extend(this.settings, {
			dialog			: false,
			insert 			: function() {
				return ColorPicker.insert();
			},
			close 			: function() {
				return tinyMCEPopup.close();
			}
		}));

		$('button#insert').button({
            icons: {
                primary: 'ui-icon-check'
            }
        });
		
		// show body
        $('#jce').css('display', 'block');
        
	},

	/**
	 * Insert selected colorpicker value
	 */
	insert : function() {
		var color = $("#colorpicker_color").val(), f = tinyMCEPopup.getWindowArg('func');
		tinyMCEPopup.restoreSelection();

		if (f)
			f(color);

		tinyMCEPopup.close();
	}
};
tinyMCEPopup.onInit.add(ColorPicker.init, ColorPicker);

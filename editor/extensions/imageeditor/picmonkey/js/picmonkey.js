(function($) {
    WFImageEditor.add('picmonkey', {
        
        params : {
            '_import' : $.URL.toAbsolute(tinyMCEPopup.getWindowArg('src')) 
        },
        
        init : function() {            
            var api = WFImageEditor.getParams('picmonkey');
            
            $('<div id="editor"/>').appendTo('body').append('<iframe width="100%" height="' + tinyMCEPopup.getWindowArg('height') + 'px" frameborder="0" src="http://www.picmonkey.com/service?' + $.param(api) + '" />');
        }
    });
})(jQuery);
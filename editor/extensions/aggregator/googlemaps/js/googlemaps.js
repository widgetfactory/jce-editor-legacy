/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
WFAggregator.add('googlemaps', {
    /**
	 * Parameter Object
	 */
    params : {
        width : 425,
        height: 350
    },

    props : {},

    setup : function() {},
    
    getTitle : function() {
        return this.title || this.name;
    },
    /**
	 * Get the Media type
	 */
    getType : function() {
        return 'iframe';
    },
    /**
	 * Check whether a media type is supported
	 */
    isSupported : function(v) {
        if (typeof v == 'object') {
            v = v.src || v.data || '';
        }

        if (/maps\.google\./i.test(v)) {
            return 'googlemaps';
        }

        return false;
    },
    getValues : function(src) {
        var self = this, data = {}, args = {}, type = this.getType();
        
        if (!/\&(amp;)?output=embed/.test(src)) {
            src += '&output=embed';
        }
        
        // protocol / scheme relative url
        src = src.replace(/^http(s)?:\/\//, '//');

        data.src = src;

        if (type == 'iframe') {
            $.extend(data, {
                frameborder : 0,
                marginwidth : 0,
                marginheight: 0
            });			
        }

        return data;
    },
    setValues : function(data) {
        var self = this, id = '', src = data.src || data.data || '';

        if (!src) {
            return data;
        }
        
        // protocol / scheme relative url
        src = src.replace(/^http(s)?:\/\//, '//');
        
        src = src.replace(/\&(amp;)?output=embed/, '');

        data.src = src;
        
        return data;
    },
    getAttributes : function(src) {
        var args = {}, data = this.setValues({
            src : src
        }) || {};

        $.extend(args, {
            'src'   : data.src || src,
            'width' : this.params.width,
            'height': this.params.height
        });

        return args;
    },
    setAttributes : function() {

    },
    onSelectFile 	: function() {
    },
    onInsert : function() {
    }
});
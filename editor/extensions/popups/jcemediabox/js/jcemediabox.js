/**
 * @package      JCE Advlink
 * @copyright    Copyright (C) 2008 - 2010 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

/**
 * JCEMediaBox Popup functions
 */
JCEMediaBox = {
    Popup: {

        /**
         * Addons object
         */
        addons: {},

        /**
         * Set Addons
         * @param {String} n Addon name
         * @param {Object} o Addon Object
         */
        setAddons: function(n, o) {
            if (typeof this.addons[n] == 'undefined') {
                this.addons[n] = {};
            }
            $.extend(this.addons[n], o);
        },

        /**
         * Get all addons
         * @param {String} n Optional addon name
         */
        getAddons: function(n) {
            if (n) {
                return this.addons[n];
            }

            return this.addons;
        },

        /**
         * Get / Test an addon object
         * @param {Object} v
         * @param {Object} n
         */
        getAddon: function(v, n) {
            var t = this, cp = false, r, each = tinymce.each;

            var addons = this.getAddons(n);

            $.each(addons, function(addon, o) {
                var fn = o[addon] ||
                function() {
                };

                r = fn.call(this, v);
                if (typeof r != 'undefined') {
                    cp = r;
                }

            });

            return cp;
        }

    },

    /**
     * Utility function to trim whitespace from a string
     * @param {String} s
     */
    trim: function(s) {
        return $.trim(s);
    },

    /**
     * Set proportianl dimension calculations
     * @param {String} w Width
     * @param {String} h Height
     */
    setDimensions : function(w, h) {
        $.Plugin.setDimensions(w, h, 'jcemediabox_popup_');
    }

};
WFPopups.addPopup('jcemediabox', {

    setup : function() {
    	var self = this;
    	$('#jcemediabox_popup_icon').change(function() {
    		self.setIcon();
    	});
    },

    /**
     * Check if node is a JCE MediaBox popup
     * @param {Object} n Element
     */
    check: function(n) {
        return /jce(popup|_popup|lightbox)/.test(n.className);
    },

    /**
     * Get the MIME Type from a media type value
     * @param {Object} mt Media type value
     */
    getMediaType: function(n) {
        var mt;

        switch (n.type) {
            case 'image/gif':
            case 'image/jpeg':
            case 'image/png':
            case 'image/*':
            case 'image':
                mt = 'image';
                break;
            case 'iframe':
                mt = 'iframe';
                break;
            case 'director':
            case 'application/x-director':
                mt = 'application/x-director';
                break;
            case 'windowsmedia':
            case 'mplayer':
            case 'application/x-mplayer2':
                mt = 'application/x-mplayer2';
                break;
            case 'quicktime':
            case 'video/quicktime':
                mt = 'video/quicktime';
                break;
            case 'real':
            case 'realaudio':
            case 'audio/x-pn-realaudio-plugin':
                mt = 'audio/x-pn-realaudio-plugin';
                break;
            case 'divx':
            case 'video/divx':
                mt = 'video/divx';
                break;
            case 'flash':
            case 'application/x-shockwave-flash':
                mt = 'application/x-shockwave-flash';
                break;
            case 'ajax':
            case 'text/xml':
            case 'text/html':
                mt = 'text/html';
                break;
        }

        if (!mt && n.href) {
            var o = JCEMediaBox.Popup.getAddon(n.href);

            if (o && o.type) {
                mt = o.type;
            }
        }

        return mt || '';
    },

    /**
     * Clean a link of popup attributes (does not clean rel attribute)
     * @param {Object} n
     */
    remove: function(n) {
        var ed = tinyMCEPopup.editor;

        // Cleanup
        $.each(['jcepopup', 'jcelightbox', 'jcebox', 'icon-left', 'icon-right', 'icon-top-left', 'icon-top-right', 'icon-bottom-left', 'icon-bottom-right', 'noicon', 'noshow', 'autopopup-single', 'autopopup-multiple'], function(i, v) {
            ed.dom.removeClass(n, v);
        });

    },

    /**
     * Convert parameter string to JSON object
     */
    convertData : function(s) {
        var a = [];
        
        if (/^{[\w\W]+}$/.test(s)) {
        	return $.parseJSON(s);
        }

        $.each(s.split(';'), function(i, n) {
            if (n) {
                n = n.replace(/^([^\[]+)(\[|=|:)([^\]]*)(\]?)$/, function(a, b, c, d) {
                    if (d) {
                        if (!/[^0-9]/.test(d)) {
                            return '"' + b + '":' + parseInt(d);
                        }
                        return '"' + b + '":"' + d + '"';
                    }
                    return '';
                });

                if (n) {
                    a.push(n);
                }
            }
        });

        return $.parseJSON('{' + a.join(',') + '}');
    },

    /**
     * Get popup parameters
     * @param {Object} n Popup node
     */
    getAttributes: function(n) {
        var ed = tinyMCEPopup.editor, data = {}, rv, v;

        var title 	= ed.dom.getAttrib(n, 'title');
        var rel 	= ed.dom.getAttrib(n, 'rel');

        // No icon
        var icon = /noicon/g.test(n.className);
        
        // Auto popup
        if (/(autopopup(.?|-single|-multiple))/.test(n.className)) {
        	v = /autopopup-multiple/.test(n.className) ? 'autopopup-multiple' : 'autopopup-single';
        	
        	$('#jcemediabox_popup_autopopup').val(v);
        }  

        $('#jcemediabox_popup_icon').attr('checked', !icon);
        $('#jcemediabox_popup_icon_position').attr('disabled', icon);

        // Get position
        if (s = /icon-(top-right|top-left|bottom-right|bottom-left|left|right)/.exec(n.className)) {
            $('#jcemediabox_popup_icon_position').val(s[0]);
        }

        var relRX 	= '(alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend)';
        var json 	= ed.dom.getAttrib(n, 'data-json') || ed.dom.getAttrib(n, 'data-mediabox');

        if (json) {
            data 	= this.convertData(json);
        }

        if (rel && /\w+\[.*\]/.test(rel)) {
            // convert to object
            data = this.convertData(rel);
        } else {
            // remove standard rel values
            group = $.trim(rel.replace(new RegExp(relRX, 'g'), ''));

            $('#jcemediabox_popup_group').val(group);
        }

        if (rv = new RegExp(relRX, 'g').exec(rel)) {
        	// set rel value
        	$('#rel').val(rv[1]);
        }

        var params = [];

        $.each(data, function(k, v) {
            if ($('#jcemediabox_popup_' + k).get(0)) {
                $('#jcemediabox_popup_' + k).val(decodeURIComponent(v));
                // remove from object
                delete data[k];
            } else {
                params.push(k + ':' + decodeURIComponent(v));
            }
        });

        $('#jcemediabox_popup_params').val(params.join(','));

        // Set type
        $('#jcemediabox_popup_mediatype').val(this.getMediaType(n));

        $.extend(data, {
            src	 : ed.dom.getAttrib(n, 'href'),
            type : ed.dom.getAttrib(n, 'type') || ''
        });

        return data;
    },

    /**
     * Set Popup Attributes
     * @param {Object} n Link Element
     */
    setAttributes: function(n, args) {
        var self = this, ed = tinyMCEPopup.editor;

        this.remove(n);

        // Add jcepopup class
        ed.dom.addClass(n, 'jcepopup');
        
        // Autopopup
        var auto = $('#jcemediabox_popup_autopopup').val();
        
        if (auto) {
        	ed.dom.addClass(n, auto);  
        }

        var data = [];

        tinymce.each(['title', 'caption', 'group', 'width', 'height', 'params'], function(k) {
            var v = $('#jcemediabox_popup_' + k).val();

            if (k == 'params') {
                var params = v.replace(/\n\r/g, '');

                v = params ? self.convertData(params) : '';
            }

            if (v == '' || v == null) {
                if (args[k]) {
                    v = args[k];
                } else {
                    return;
                }
            }
            
            if (k == 'params') {
            	v = encodeURIComponent(v);
            }

            data.push(k + '[' + v + ']');
        });
        
        if (args.data) {
        	$.each(args.data, function(k, v) {
        		data.push(k + '[' + v + ']');
        	});
        }

        // set json data
        ed.dom.setAttrib(n, 'data-mediabox', data.join(';'));

        // Add noicon class
        if ($('#jcemediabox_popup_icon').val() == 0) {
            ed.dom.addClass(n, 'noicon');
        } else {
            ed.dom.addClass(n, $('#jcemediabox_popup_icon_position').val());
        }

        // Set target
        ed.dom.setAttrib(n, 'target', '_blank');

        var mt = $('#jcemediabox_popup_mediatype').val() || n.type || args.type || '';

        // Set media type
        ed.dom.setAttrib(n, 'type', mt);
    },

    /**
     * Set the poup icon option
     */
    setIcon : function() {
        var v = $('#jcemediabox_popup_icon').val();
        
        if (parseInt(v)) {
        	$('#jcemediabox_popup_icon_position').removeAttr('disabled');
        } else {
        	$('#jcemediabox_popup_icon_position').attr('disabled', 'disabled');
        }
    },

    /**
     * Function to call when popup extension selected
     */
    onSelect: function() {
    },

    /**
     * Call function when a file is selected / clicked
     * @param {Object} args Function arguments
     */
    onSelectFile: function(args) {
        // Set popup attributes
        $.each(args, function(k, v) {
            $('#jcemediabox_popup_' + k).val(v);
        });

    }

});
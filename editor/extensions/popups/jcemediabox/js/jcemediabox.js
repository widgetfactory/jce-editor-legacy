/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
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
        setAddons: function (n, o) {
            if (typeof this.addons[n] == 'undefined') {
                this.addons[n] = {};
            }
            $.extend(this.addons[n], o);
        },
        /**
         * Get all addons
         * @param {String} n Optional addon name
         */
        getAddons: function (n) {
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
        getAddon: function (v, n) {
            var t = this, cp = false, r;

            var addons = this.getAddons(n);

            $.each(addons, function (addon, o) {
                var fn = o[addon] ||
                        function () {
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
    trim: function (s) {
        return $.trim(s);
    },
    /**
     * Set proportianl dimension calculations
     * @param {String} w Width
     * @param {String} h Height
     */
    setDimensions: function (w, h) {
        $.Plugin.setDimensions(w, h, 'jcemediabox_popup_');
    }

};
WFPopups.addPopup('jcemediabox', {
    params: {
        'attribute': 'data-mediabox',
        'popup_group': '',
        'popup_icon': 1,
        'popup_icon_position': '',
        'popup_autopopup': '',
        'popup_hide': 0,
        'popup_mediatype': ''
    },
    setup: function () {
        var self = this;
        $('#jcemediabox_popup_icon').change(function () {
            self.setIcon();
        });

        $('span.add', '#jcemediabox_popup_params').click(function () {
            // clone item
            var $item = $('li:first', '#jcemediabox_popup_params').clone().appendTo('#jcemediabox_popup_params');
            // empty input values
            $('input', $item).val('');
            // add remove button action
            $('span.add', $item).hide();

            $('span.remove', $item).css('display', 'inline-block').click(function () {
                $item.remove();
            });
        });

        $.each(this.params, function (k, v) {

            if (k === 'popup_icon_position') {
                v = v.replace('icon-', 'zoom-');
            }

            $('#jcemediabox_' + k).val(v);
        });
    },
    /**
     * Check if node is a JCE MediaBox popup
     * @param {Object} n Element
     */
    check: function (n) {
        return /jce(popup|_popup|lightbox)/.test(n.className);
    },
    /**
     * Get the MIME Type from a media type value
     * @param {Object} mt Media type value
     */
    getMediaType: function (n) {
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
            JCEMediaBox.options = {
                popup : {
                    google_viewer : 0,
                    pdfjs: 0
                }
            };
            
            var o = JCEMediaBox.Popup.getAddon(n.href);

            if (o && o.type) {
                mt = o.type;
            }
        }

        return mt || n.type || '';
    },
    getImageType: function (s) {
        // get extension
        var e = /\.(jp(eg|g)|png|bmp|gif|tiff)$/.exec(s);

        if (e) {
            if (e[1] === "jpg") {
                e[1] = "jpeg";
            }

            return "image/" + e[1];
        }

        // use jpeg as default
        return "image/jpeg";
    },
    /**
     * Clean a link of popup attributes (does not clean rel attribute)
     * @param {Object} n
     */
    remove: function (n) {
        var ed = tinyMCEPopup.editor;

        // Cleanup
        $.each(['jcepopup', 'jcelightbox', 'jcebox', 'icon-left', 'icon-right', 'icon-top-left', 'icon-top-right', 'icon-bottom-left', 'icon-bottom-right', 'zoom-left', 'zoom-right', 'zoom-top-left', 'zoom-top-right', 'zoom-bottom-left', 'zoom-bottom-right', 'noicon', 'noshow', 'autopopup-single', 'autopopup-multiple'], function (i, v) {
            ed.dom.removeClass(n, v);
        });

        // remove data attribute
        ed.dom.setAttrib(n, 'data-mediabox', '');
    },
    /**
     * Convert parameter string to JSON object
     */
    convertData: function (s) {
        var a = [];

        function trim(s) {
            // trim
            return s.replace(/:"([^"]+)"/, function (a, b) {
                return ':"' + b.replace(/^\s+|\s+$/, '').replace(/\s*::\s*/, '::') + '"';
            });
        }

        // if json string return object
        if (/^{[\w\W]+}$/.test(s)) {
            return $.parseJSON(trim(s));
        }

        // parameter format eg: title[title]
        if (/\w+\[[^\]]+\]/.test(s)) {            
            s = s.replace(/([\w-]+)\[([^\]]+)\](;)?/g, function (a, b, c, d) {
                return '"' + b + '":"' + tinymce.DOM.encode(c) + '"' + (d ? ',' : '');
            });

            return $.parseJSON('{' + trim(s) + '}');
        }
    },
    /**
     * Get popup parameters
     * @param {Object} n Popup node
     */
    getAttributes: function (n, index) {
        var ed = tinyMCEPopup.editor, data = {}, rv, v;

        // set default index
        index = index || 0;

        // set default index
        index = index || 0;

        var title = ed.dom.getAttrib(n, 'title');
        var rel = ed.dom.getAttrib(n, 'rel');

        // No icon
        var icon = /noicon/g.test(n.className);
        var hide = /noshow/g.test(n.className);

        // Auto popup        
        if (/(autopopup(.?|-single|-multiple))/.test(n.className)) {
            v = /autopopup-multiple/.test(n.className) ? 'autopopup-multiple' : 'autopopup-single';

            $('#jcemediabox_popup_autopopup').val(v);
        }

        $('#jcemediabox_popup_icon').val(icon ? 0 : 1);
        $('#jcemediabox_popup_icon_position').prop('disabled', icon);

        $('#jcemediabox_popup_hide').val(hide ? 1 : 0);

        // Get position
        if (s = /(zoom|icon)-(top-right|top-left|bottom-right|bottom-left|left|right)/.exec(n.className)) {
            var v = s[0];

            if (v) {
                v = v.replace('icon-', 'zoom-');
                $('#jcemediabox_popup_icon_position').val(v);
            }
        }

        var relRX = /(\w+|alternate|stylesheet|start|next|prev|contents|index|glossary|copyright|chapter|section|subsection|appendix|help|bookmark|nofollow|licence|tag|friend)\s+?/g;
        var json = ed.dom.getAttrib(n, 'data-json') || ed.dom.getAttrib(n, 'data-mediabox');

        if (json) {
            data = this.convertData(json);
        }

        if (rel && /\w+\[.*\]/.test(rel)) {
            var ra = '';
            if (rv = relRX.exec(rel)) {
                // pass on rel value
                ra = rv[1];
                // remove rel values	
                rel = rel.replace(relRX, '');
            }

            if (/^\w+\[/.test((rel))) {
                // convert to object
                data = this.convertData($.trim(rel)) || {};
                // add to object
                data.rel = ra;
            }
        } else {
            // remove standard rel values
            var group = $.trim(rel.replace(relRX, ''));

            $('#jcemediabox_popup_group').val(group);
        }

        var params = [];

        if (/::/.test(data.title)) {
            var parts = data.title.split('::');
            if (parts.length > 1) {
                data.caption = parts[1];
            }
            data.title = parts[0];
        }

        $.each(data, function (k, v) {
            if ($('#jcemediabox_popup_' + k).get(0) && v !== "") {
                
                if (k == 'title' || k == 'caption' || k == 'group') {
                    v = decodeURIComponent(v);
                }

                v = tinymce.DOM.decode(v);

                if (k == 'title' || k == 'caption') {
                    $('input[name^="jcemediabox_popup_' + k + '"]').eq(index).val(v);
                } else {
                    $('#jcemediabox_popup_' + k).val(v);
                }

                // remove from object
                delete data[k];
            }
        });
        var x = 0;
        // process remaining data values as params
        $.each(data, function (k, v) {
            if (v !== '') {
                
                try {
                    v = decodeURIComponent(v);
                } catch(e) {}
                
                if (x == 0) {
                    $('li:first input.name', '#jcemediabox_popup_params').val(k);
                    $('li:first input.value', '#jcemediabox_popup_params').val(v);
                } else {
                    // clone item
                    var $item = $('li:first', '#jcemediabox_popup_params').clone().appendTo('#jcemediabox_popup_params');
                    // set name value
                    $('input.name', $item).val(k);
                    // set value value
                    $('input.value', $item).val(v);
                    // add remove button action
                    $('span.add', $item).hide();
                    $('span.remove').css('display', 'inline-block');
                }
            }
            x++;
        });

        // Set type
        $('#jcemediabox_popup_mediatype').val(this.getMediaType(n));

        $.extend(data, {
            src: ed.dom.getAttrib(n, 'href'),
            type: ed.dom.getAttrib(n, 'type') || ''
        });

        return data;
    },
    /**
     * Set Popup Attributes
     * @param {Object} n Link Element
     */
    setAttributes: function (n, args, index) {
        var self = this, ed = tinyMCEPopup.editor;

        // set default index
        index = index || 0;

        this.remove(n);

        // set default index
        index = index || 0;

        // Add jcepopup class
        ed.dom.addClass(n, 'jcepopup');

        // Autopopup
        var auto = $('#jcemediabox_popup_autopopup').val();

        if (auto) {
            ed.dom.addClass(n, auto);
        }

        var data = {};

        // pass title to link
        if (args.title) {
            ed.dom.setAttrib(n, 'title', args.title);
            delete args.title;
        }

        tinymce.each(['group', 'width', 'height', 'title', 'caption'], function (k) {
            var v;

            if (k == 'title' || k == 'caption') {
                v = $('input[name^="jcemediabox_popup_' + k + '"]').eq(index).val();
            } else {
                v = $('#jcemediabox_popup_' + k).val();
            }

            if (v == '' || v == null || typeof v === 'undefined') {
                if (args[k]) {
                    v = args[k];
                } else {
                    return;
                }
            }
            
            if (k == 'title' || k == 'caption' || k == 'group') {
                v = encodeURIComponent(v);
            }

            data[k] = v;
        });

        $('li', '#jcemediabox_popup_params').each(function () {
            var k = $('input.name', this).val();
            var v = $('input.value', this).val();

            if (k !== '' && v !== '') {
                data[k] = encodeURIComponent(v);
            }
        });

        // combine args
        $.extend(data, args.data || {});

        // set type
        var mt = $('#jcemediabox_popup_mediatype').val() || n.type || data.type || '';

        // get image type
        if (mt == "image") {
            mt = this.getImageType(n.href);
        }

        // Set media type
        ed.dom.setAttrib(n, 'type', mt);

        // remove type so it is not added to rel attribute
        if (data.type) {
            delete data.type;
        }
        // get rel attribute value
        var rel = ed.dom.getAttrib(n, 'rel', '');

        // remove any existing properties
        if (rel) {
            rel = rel.replace(/([a-z0-9]+)(\[([^\]]+)\]);?/gi, '');
        }

        // map object properties to options array
        var props = $.map(data, function (v, k) {
            return k + '[' + v + ']';
        });

        if (this.params.attribute == 'data-mediabox') {
            ed.dom.setAttrib(n, 'data-mediabox', props.join(';'));
        } else {
            rel = ' ' + props.join(';');

            // remove HTML5 data attributes if any
            ed.dom.setAttrib(n, 'data-json', '');
            ed.dom.setAttrib(n, 'data-mediabox', '');
        }

        // set data to rel attribute
        ed.dom.setAttrib(n, 'rel', $.trim(rel));

        // Add noicon class
        if ($('#jcemediabox_popup_icon').val() == 0) {
            ed.dom.addClass(n, 'noicon');
        } else {
            ed.dom.addClass(n, $('#jcemediabox_popup_icon_position').val());
        }

        if ($('#jcemediabox_popup_hide').val() == 1) {
            ed.dom.addClass(n, 'noshow');
        }

        // Set target
        ed.dom.setAttrib(n, 'target', '_blank');
    },
    /**
     * Set the poup icon option
     */
    setIcon: function () {
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
    onSelect: function () {
    },
    /**
     * Call function when a file is selected / clicked
     * @param {Object} args Function arguments
     */
    onSelectFile: function (args) {
        // Set popup attributes
        $.each(args, function (k, v) {
            $('#jcemediabox_popup_' + k).val(v);
        });

    }

});
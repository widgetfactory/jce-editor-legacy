/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

WFMediaPlayer.init({
    params: {
        extensions: 'mp3,mp4,flv,f4v',
        dimensions: {
            'audio': {
                width: 300,
                height: 35
            }
        },
        path: 'media/jce/mediaplayer/mediaplayer.swf'
    },
    props: {
        autoPlay: false,
        controlBarAutoHide: true,
        controlBarMode: 'docked',
        controlBarAutoHideTimeout : '',
        loop: false,
        muted: false,
        playButtonOverlay: true,
        bufferingOverlay: true,
        volume: 1,
        audioPan: 0,
        poster: '',
        endOfVideoOverlay: '',
        backgroundColor: ''
    },
    type: 'flash',
    setup: function() {
        // activate slider
        $('#mediaplayer_volume, #mediaplayer_audioPan').each(function() {
            var n = this;

            $('<span id="' + $(n).attr('id') + '_slider" class="ui-slider-block"></span>').insertAfter(this).slider();
        });
        $('#mediaplayer_volume').change(function() {
            var v = parseFloat($(this).val());

            v = Math.ceil(v);

            $('#mediaplayer_volume_slider').slider('value', v);

            $(this).val(v);
        });

        $('#mediaplayer_audioPan').change(function() {
            $('#mediaplayer_audioPan_slider').slider('value', ($(this).val() * 10) + 20);
        });

        $('#mediaplayer_volume_slider').slider('option', {
            min: 0,
            max: 100,
            step: 10,
            value: $('#mediaplayer_volume').val(),
            slide: function(event, ui) {
                $('#mediaplayer_volume').val(ui.value);
            }
        });

        $('#mediaplayer_audioPan_slider').slider('option', {
            min: 10,
            max: 30,
            step: 1,
            value: ($('#mediaplayer_audioPan').val() * 10) + 20,
            slide: function(event, ui) {
                $('#mediaplayer_audioPan').val((ui.value - 20) / 10);
            }
        });
    },
    isSupported: function(data) {
        var r, file = '', ext = tinymce.explode(this.getParam('extensions')).join('|'), re = new RegExp('\.(' + ext + ')$', 'i');

        var src = data.src || data.data || '';

        if (data.param) {
            var fv = this.parseValues(data.param.flashvars || '');
            if (fv) {
                file = fv.src || '';
            }
        }

        // check src and flashvars file for format
        r = re.test(src) || re.test(file);

        if (!r) {
            // check src for player file
            return new RegExp(this.getPath()).test(src);
        }

        return r;
    },
    /**
     * Return player values
     * @param {String} s FLV file path
     */
    getValues: function(s, args) {
        var self = this, s, u, k, v, data = [];

        var url = tinyMCEPopup.getParam('document_base_url');

        if (!/http(s)?:\/\//.test(s)) {
            s = $.String.path(url, s);
        }

        // add src
        data.push('src=' + $.String.encodeURI(s, true));

        // set args default
        args = args || {};

        // get all form values
        $(':input', '#mediaplayer_options').each(function() {
            k = $(this).attr('id'), v = $(this).val();

            if (k) {
                // remove mediaplayer_ prefix
                k = k.substr(k.indexOf('_') + 1);

                // update value if checkbox
                if ($(this).is(':checkbox')) {
                    v = $(this).is(':checked');
                }

                if (typeof args[k] == 'undefined') {
                    args[k] = v;
                }
            }
        });

        var map = {
            'autoplay': 'autoPlay',
            'controls': 'controlBarAutoHide'
        };

        // iterate through args
        $.each(args, function(k, v) {
            // must be a string...
            if (typeof k != 'string') {
                return;
            }

            // map HTML5 items
            if (map[k]) {
                k = map[k];
            }

            // skip invalid keys
            if (typeof self.props[k] == 'undefined') {
                return;
            }

            switch (k) {
                case 'volume':
                    v = parseInt(v) / 100;
                    break;
                case 'audioPan':
                    v = parseInt(v);
                    break;
                case 'backgroundColor':
                    v = v.replace('#', '0x');
                    break;
                case 'poster':
                case 'endOfVideoOverlay':
                    if (v) {
                        u = /http(s)?:\/\/[^\/]+(.*)/.exec(url);
                        s = (u && u.length > 1) ? u[2] : '';
                        v = $.String.path(s, v);
                    }
                    break;
                default:
                    break;
            }

            // value is opposite of checked value
            if (k == 'controlBarAutoHide') {
                v = !v;
            }

            if (self.props[k] === v || v === '') {
                return;
            }
            
            if (v && typeof v === "string") {
                v = $.String.encodeURI(v, true);
            }

            data.push(k + '=' + v);
        });

        return {
            'src': this.getPath(),
            'type': 'application/x-shockwave-flash',
            'param': {
                'flashvars': data.join('&'),
                'allowfullscreen': true,
                'wmode': 'opaque'
            }
        };
    },
    parseValues: function(s) {
        var ed = tinyMCEPopup.editor, data = {}, o = $.String.query(s.replace(/\?/, '&'));

        $.each(o, function(k, v) {
            switch (k) {
                case 'src' :
                    data['src'] = ed.convertURL(v);
                    break;
                case 'volume':
                    data['volume'] = parseInt(v) * 100;
                    break;
                case 'backgroundColor':
                    data[k] = v.replace('0x', '#');
                    break;
                case 'loop':
                case 'autoPlay':
                case 'muted':
                case 'playButtonOverlay':
                case 'bufferingOverlay':
                    v = (v === 'false' || v === '0') ? false : !!v;
                    data[k] = v;
                    break;
                case 'controlBarAutoHide':
                    v = (v === 'false' || v === '0') ? false : !!v;
                    data[k] = !v;
                    break;
                case 'poster':
                case 'endOfVideoOverlay':
                    data[k] = ed.convertURL(ed.documentBaseURI.toAbsolute(v));
                    break;
                default:
                    data[k] = v;
                    break;
            }
        });

        return data;
    },
    /**
     * Set returned player values
     * @param {String} fv Flashvars value
     * @param {Object} p Parameter Object
     */
    setValues: function(data) {
        var fv = data.flashvars || data.param.flashvars || '';
        var at = this.parseValues(decodeURIComponent(fv));

        $.each(at, function(k, v) {
            if (k == 'src') {
                return;
            }

            data[k] = v;
        });
        
        // flip some values
        data.controlBarAutoHide = !!data.controlBarAutoHide;
        
        // set src
        data.src = at.src;

        return data;
    },
    /**
     * Action when file selected
     */
    onSelectFile: function(file) {
        if (file && /\.mp3$/.test(file)) {
            $('#mediaplayer_controlBarMode').val('floating').prop('disabled', true);
        } else {
            $('#mediaplayer_controlBarMode').val('docked').prop('disabled', false);
        }
    },
    /**
     * Action when file is inserted.
     * Use to set variables for MediaPlayer format
     */
    onInsert: function() {
        var src = $('#src').val(), mp3 = /\.mp3$/.test(src), dimensions = this.getParam('dimensions');

        if (mp3 && dimensions.audio) {
            $('#width').val(dimensions.audio.width);
            $('#height').val(dimensions.audio.height);
        }

        // set some flash variables
        $('#flash_wmode').val('opaque');
        $('#flash_allowfullscreen').attr('checked', !mp3);
        $('#flash_menu').attr('checked', true);
    }
});
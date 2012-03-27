/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
WFAggregator.add('youtube', {
	/**
	 * Parameter Object
	 */
	params 	: {
		width : 425,
		height: 350
	},

	props : {
		rel					: 1,
		autohide 			: 2,
		autoplay 			: 0,
		controls 			: 1,
		enablejsapi			: 0,
		loop				: 0,
		playlist			: '',
		start				: '',
		privacy				: 0
	},

	setup 	: function() {
		$('#youtube_privacy').click( function() {
			if ($(this).is(':checked')) {
				$('#youtube_embed').attr('checked', true).attr('disabled', true);
			} else {
				$('#youtube_embed').attr('disabled', false);
			}
		});
		$('#youtube_embed').click( function() {
			if (!$(this).is(':checked')) {
				$('#youtube_privacy').attr('checked', false);
			}
		});
	},
	getTitle : function() {
		return this.title || this.name;
	},
	/**
	 * Get the Media type
	 */
	getType : function() {
		return $('#youtube_embed').is(':checked') ? 'flash' : 'iframe';
	},
	/**
	 * Check whether a media type is supported
	 */
	isSupported : function(v) {
		if (typeof v == 'object') {
			v = v.src || v.data || '';
		}

		if (/youtu(\.)?be(.+)?\/(.+)/.test(v)) {
			return 'youtube';
		}

		return false;
	},
	getValues : function(src) {
		var self = this, data = {}, args = {}, type = this.getType();

		$.extend(args, $.String.query(src));

		// set https
		if ($('#youtube_https').is(':checked')) {
			src = src.replace(/^http:\/\//, 'https://');
		} else {
			src = src.replace(/^https:\/\//, 'http://');
		}

		$(':input', '#youtube_options').not('#youtube_embed, #youtube_https').each( function() {
			var k = $(this).attr('id'), v = $(this).val();

			// remove youtube_ prefix
			k = k.substr(k.indexOf('_') + 1);

			if ($(this).is(':checkbox')) {
				v = $(this).is(':checked') ? 1 : 0;
			}
			
			if (k == 'autohide') {
				v = parseInt(v);
			}

			if (self.props[k] === v || v === '') {
				return;
			}

			args[k] = v;
		});
		// process src
		src = src.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function(a, b, c, d) {
			d = d.replace(/(watch\?v=|v\/|embed\/)/, '');

			if (b && !c) {
				c = '.com';
			}

			return 'youtube' + c + '/' + (type == 'iframe' ? 'embed' : 'v') + '/' + d;
		});
		// privacy mode
		if ($('#youtube_privacy').is(':checked')) {
			src = src.replace('youtube', 'youtube-nocookie');
		} else {
			src = src.replace('youtube-nocookie', 'youtube');
		}

		// convert args to URL query string
		var query = $.param(args);

		// add to src if not empty
		if (query) {
			src = src + (/\?/.test(src) ? '&' : '?') + query;
		}

		data.src = src;

		if (type == 'iframe') {
			$.extend(data, {
				allowfullscreen : true,
				frameborder : 0
			});			
		} else {
			$.extend(true, data, {
				param : {
					allowfullscreen : true,
					wmode : 'opaque'
				}
			});
		}

		return data;
	},
	setValues : function(data) {
		var self = this, id = '', src = data.src || data.data || '';

		if (!src) {
			return data;
		}

		var query = $.String.query(src);

		$.extend(data, query);

		if (/https:\/\//.test(src)) {
			data['https'] = true;
		}

		if (/youtube-nocookie/.test(src)) {
			data['privacy'] = true;
		}

		// if there is a param object set old embed method
		if (data.param) {
			data['embed'] = true;
		}

		if (query.v) {
			id = query.v;

			delete query.v;
		} else {
			var s = /(\.be|\/(embed|v))\/([^\/\?&]+)/.exec(src);

			if (s.length > 2) {
				id = s[3];
			}
		}
		// decode playlist
		if (data.playlist) {
			data.playlist = decodeURIComponent(data.playlist);
		}

		// add additional parameter fields
		$.each(query, function(k, v) {
			if (typeof self.props[k] == 'undefined') {
				$('#youtube_options table').append('<tr><td><label for="youtube_' + k + '">' + k + '</label><input type="text" id="youtube_' + k + '" value="' + v + '" /></td></tr>');
			}
		});
		data.src = src.replace(/youtu(\.)?be([^\/]+)?\/(.+)/, function(a, b, c, d) {
			var args = 'youtube';

			if (b) {
				args += '.com';
			}

			if (c) {
				args += c;
			}

			if ($('#youtube_embed').is(':checked')) {
				args += '/v';
			} else {
				args += '/embed';
			}

			args += '/' + id;

			return args;
		});
		return data;
	},
	getAttributes : function(src) {
		var args = {}, data = this.setValues({
			src : src
		}) || {};

		$.each(data, function(k, v) {
			if (k == 'src') {
				return;
			}

			args['youtube_' + k] = v;
		});
		$.extend(args, {
			'src'	: data.src || src,
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
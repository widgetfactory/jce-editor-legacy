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
(function() {
	WFPopups.addPopup('rokbox', {

		setup : function() {			
			$('#rokbox_fullscreen').click(function() {
				$('#rokbox_width, #rokbox_height').prop('disabled', $(this).is(':checked'));
			});
		},

		/**
		 * Check if node is a Rokbox popup
		 * @param {Object} n Element
		 */
		check : function(n) {
			var r = n.getAttribute('rel');
			return r && /rokbox/.test(r);
		},

		/**
		 * Clean a link of popup attributes
		 * @param {Object} n
		 */
		remove : function(n) {
			var ed = tinyMCEPopup.editor;
			var r = ed.dom.getAttrib(n, 'rel');
			
			r = r.replace(/rokbox(.*)\b/, '');
			
			ed.dom.setAttrib(n, 'rel', r);
		},

		/**
		 * Convert parameter string to JSON object
		 */
		convertData : function(s) {
			var a = {};

			var album = /\(([^\)]+)\)/.exec(s);
			
			if (album) {
				a.album = album[1];
			}
			
			var dim = /\[([0-9]+%?) ([0-9]+%?)\]/.exec(s);

			if (dim && dim.length === 3) {
				a.width 	= dim[1];
				a.height 	= dim[2]; 
			}

			a.fullscreen = /\[fullscreen\]/.test(s);

			return a;
		},

		/**
		 * Get popup parameters
		 * @param {Object} n Popup node
		 */
		getAttributes : function(n) {
			var ed = tinyMCEPopup.editor, args = {}, v;

			var data 		= ed.dom.getAttrib(n, 'rel');
			var title 		= ed.dom.getAttrib(n, 'title');
			var description = '';
			
			if (/::/.test(title)) {
				var parts = title.split(' :: ');
				title 		= parts[0];
				description = parts[1];
			}
			
			$('#rokbox_title').val(title);
			$('#rokbox_description').val(description);

			if(data) {
				data = this.convertData(data);
			}

			$.each(data, function(k, v) {
				$k = $('#rokbox_' + k);
				
				if ($k.is(':checkbox')) {
					$k.prop('checked', !!v);
					
					if (k == 'fullscreen') {
						$('#rokbox_width, #rokbox_height').prop('disabled', !!v);
					}
					
				} else {
					if (k == 'width' || k == 'height') {
						if (/%/.test(v)) {
							v = parseInt(v);
							$('#rokbox_' + k + '_unit').val('%'); 
						}
					}
					
					$k.val(v);
				}
			});

			$.extend(args, {
				src : ed.dom.getAttrib(n, 'href')
			});

			return args;
		},

		/**
		 * Set Popup Attributes
		 * @param {Object} n Link Element
		 */
		setAttributes : function(n, args) {
			var ed = tinyMCEPopup.editor;

			this.remove(n);
			
			var data 	= [];

			var width 			= $('#rokbox_width').val();
			var height 			= $('#rokbox_height').val();
			var album 			= $('#rokbox_album').val(); 
			var fullscreen 		= $('#rokbox_fullscreen').is(':checked'); 
			
			var title 			= $('#rokbox_title').val();
			var description 	= $('#rokbox_description').val();

			if (width && height && !fullscreen) {
				data.push('[' + width + $('#rokbox_width_unit').val() + ' ' + height + $('#rokbox_height_unit').val() + ']');
			}
			
			if (fullscreen) {
				data.push('[fullscreen]');
			}
			
			if (album) {
				data.push('(' + album + ')');
			}
			
			// set title & description
			if (title && description) {
				title = title + ' :: ' + description;
			}
			
			// set title from description
			if (!title) {
				title = description;
			}

			// set json data
			ed.dom.setAttrib(n, 'rel', 'rokbox' + data.join(''));
			
			// set title
			ed.dom.setAttrib(n, 'title', title);

			// Set target
			ed.dom.setAttrib(n, 'target', '_blank');
		},

		/**
		 * Function to call when popup extension selected
		 */
		onSelect : function() {
		},

		/**
		 * Call function when a file is selected / clicked
		 * @param {Object} args Function arguments
		 */
		onSelectFile : function(args) {
		}

	});
})();

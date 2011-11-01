/**
 * @version $Id: popup.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package Joomla Content Editor (JCE)
 * @subpackage Components
 * @copyright Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @license GNU/GPL JCE is free software. This version may have been modified
 *          pursuant to the GNU General Public License, and as distributed it
 *          includes or is derivative of works licensed under the GNU General
 *          Public License or other free or open source software licenses.
 */
// JCE Popup Javascript
(function(win) {
	var doc = win.document, body = doc.body;
	
	win.WFWindowPopup = {
		init : function(width, height, click) {
			this.width 	= parseInt(width);
			this.height = parseInt(height);
			
			this.resize();			
			
			if (click) {
				this.noclick();
			}
		},
		
		// Based on a similar TinyMCE function : http://tinymce.moxiecode.com
		resize : function() {
			var x, oh = 0;

			var vw = win.innerWidth 	|| doc.documentElement.clientWidth 	|| body.clientWidth 	|| 0;
			var vh = win.innerHeight 	|| doc.documentElement.clientHeight || body.clientHeight 	|| 0;

			// Add a little if title
			var divs = doc.getElementsByTagName('div');
			
			for (x = 0; x < divs.length; x++) {
				if (divs[x].className == 'contentheading') {
					oh = divs[x].offsetHeight;
				}
			}

			win.resizeBy(vw - this.width, vh - (this.height + oh));
			
			this.center();
		},
		
		// Center Window
		center : function() {
			var vw = win.innerWidth 	|| doc.documentElement.clientWidth 	|| body.clientWidth 	|| 0;
			var vh = win.innerHeight 	|| doc.documentElement.clientHeight || body.clientHeight 	|| 0;
			
			var x = (screen.width 	- vw) / 2;
			var y = (screen.height 	- vh) / 2;

			win.moveTo(x, y);
		},
		
		// Disable right click
		noclick : function() {
			doc.onmousedown = function(e) {
				e = e || win.event;
				// Its IE!
				if (/msie/i.test(navigator.userAgent)) {
					if (e.button == 2)
						return false;
				} else {
					if (e.which == 2 || e.which == 3) {
						return false;
					}
				}
			};
			doc.oncontextmenu = function() {
				return false;
			};
		}
	};
})(window);
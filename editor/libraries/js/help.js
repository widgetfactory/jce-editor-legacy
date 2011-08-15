/**
 * @version		$Id: help.js 203 2011-06-01 19:02:19Z happy_noodle_boy $
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function($){
	$.jce = {
		Help : {
			options : {
				url : '',
				key : [],
				pattern : ''
			},
			init: function(options) {
				var key, id, n, self = this;
				$.extend(this.options, options);

				// add ui-jce class to body
            	$('body').addClass('ui-jce');
            	
            	// init layout
            	$('#jce').height($(window).height() - 20).layout({ applyDefaultStyles: true });
            	
            	// add resize
            	$(window).bind('resize', function() {
            		$('#jce').height($(window).height() - 20);
            	});

				if ($('#help-menu')) {
					
					$('dd.subtopics', '#help-menu').click(function() {
						// hide all
						$(this).parent('dl').children('dl').addClass('hidden');
						// toggle clicked
						$(this).next('dl').removeClass('hidden');
					});
					
					this.nodes = $('dd[id]', '#help-menu').click(function(e) {
						$('dd.loading', '#help-menu').removeClass('loading');
						
						self.loadItem(e.target);
					});
					
					$('iframe#help-iframe').load(function() {
						$('.loading', '#help-menu').removeClass('loading');
					});
	
					key = this.options.key;
					
					if (!key.length) {
						n = this.nodes[0];
					} else {
						id 	= key.join('.');	
						n 	= document.getElementById(id) || this.nodes[0];
					}
					if (n) {
						this.loadItem(n);
					}
				}
			},
			
			loadItem: function(el) {
				var s, n, keys, p, map;
				$(el).addClass('loading');
				var id = $(el).attr('id');
	
				if (this.options.pattern) {
					keys = id.split('.');
					map = {
						'section' 	: keys[0] || '',
						'category' 	: keys[1] || '',
						'article'	: keys[2] || ''
					};
					p = this.options.pattern;	
					s = p.replace(/\{\$([^\}]+)\}/g, function(a, b) {
						return map[b] || '';
					});
				} else {
					s = id;
				}
	
				$('iframe#help-iframe').attr('src', this.options.url + s);
			}
		}
	};
})(jQuery);
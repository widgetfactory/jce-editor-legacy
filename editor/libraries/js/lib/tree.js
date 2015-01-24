/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

/*
 * Depends: jquery.ui.core.js jquery.ui.widget.js
 */
(function($) {

	$.widget("ui.tree", {

		options : {
			rootName 		: 'Root',
			rootClass 		: 'root',
			loaderClass 	: 'load',
			collapseTree 	: false,
			charLength 		: false
		},

		_init : function() {
			var self = this;
			
			if (!this.element)
				return;

			this._trigger('onInit', null, function() {
				self._nodeEvents();
			});
		},

		_nodeEvents : function(parent) {
			var self = this;

			if (!parent) {
				parent = this.element;
			}
			
			// Add ARIA role and tabindex to root and ARIA level to children
			$('ul:first', parent).attr({'role' : 'tree'}).children('li').attr('aria-level', 1);
			// Add ARIA role and tabindex to tree items
			$('li', parent).attr({'role' : 'treeitem'}).attr('aria-expanded', function() {
				return $(this).hasClass('open') ? true : false;
			}).attr('aria-level', function(i, v) {
				if (!v) {
					return parseFloat($(this.parentNode.parentNode).attr('aria-level')) + 1;
				}
			});
			
			// Add ARIA role and tabindex to nested UL
			$('ul:gt(0)', parent).attr({'role' : 'group'});	


			$('div.tree-image', parent).attr('role', 'presentation').each(function() {
				var p = self._findParent(this);

				$(this).click(function(e) {
					self.toggleNode(e, p);
				});
			});

			$('span', parent).attr('role', 'presentation').each(function() {
				// IE
				if (!$.support.cssFloat) {
					this.onselectstart = function() {
						return false;
					};
				}

				// Gecko
				/*if ($.browser.gecko) {
					$(this).css('moz-user-select', 'none');
				}*/
			}).click(function(e) {
				var p = self._findParent(this);
				self._trigger('onNodeClick', e, p);
			});

		},

		/**
		 * Does a parent (ul) have childnodes
		 * 
		 * @param {String}
		 *            The parent
		 * @return {Boolean}.
		 */
		_hasNodes : function(parent) {
			if ($.type(parent) == 'string') {
				parent = this._findParent(parent);
			}
			var c = $('li', parent);
			return c.length > 1 || (c.length == 1 && !$(c).is('.spacer'));
		},

		/**
		 * Does the node exist?
		 * 
		 * @param {String}
		 *            The node title
		 * @param {String
		 *            or Element} The parent node
		 * @return {Boolean}.
		 */
		_isNode : function(id, parent) {
			var n = this._findNode(id, parent);

			return n.length ? true : false;
		},

		/**
		 * Does a parent have subnodes?
		 * 
		 * @param {String
		 *            or Element} The parent node
		 * @return {Boolean}.
		 */
		_getNode : function(parent) {
			if ($.type(parent) == 'string') {
				parent = this._findParent(parent);
			}

			return $(parent).find('ul.tree-node');
		},

		/**
		 * Reset all nodes. Set to closed
		 */
		_resetNodes : function() {
			$('span, div.tree-image', this.element).removeClass('open');
		},

		/**
		 * Rename a node
		 * 
		 * @param {String}
		 *            The node title
		 * @param {String}
		 *            The new title
		 */
		renameNode : function(id, name) {
			var parent = $.String.dirname(id);

			var node = this._findNode(id, parent);

			// Rename the node
			$(node).attr('id', name);

			// Rename the span
			$('a:first', node).html($.String.basename(name));

			// Rename each of the child nodes
			$('li[id^="' + this._escape(encodeURI(id)) + '"]', node).each(function(n) {
				var nt = $(n).attr('id');
				$(n).attr('id', nt.replace(id, name));
			});

		},

		/**
		 * Remove a node
		 * 
		 * @param {String}
		 *            The node title
		 */
		removeNode : function(id) {
			var parent = $.String.dirname(id);

			var node = this._findNode(id, parent);
			var ul = $(node).parent('ul');

			// Remove the node
			$(node).remove();

			// Remove it if it is now empty
			if (ul && !this._hasNodes(ul)) {
				$(ul).remove();
			}
		},

		/**
		 * Create a node
		 * 
		 * @param {Stringor Element} The parent node
		 * @return {Array} An array of nodes to create.
		 */
		createNode : function(nodes, parent) {
			var self = this;
			var e, p, h, l, np, i;
			
			// no nodes to create!
			if (!nodes.length) {
				return;
			}

			// If parent is not an element, find the parent element
			if (!parent) {
				parent = $.String.dirname($(nodes[0]).attr('id'));
			}

			if ($.type(parent) == 'string') {
				parent = this._findParent(parent);
			}

			/*
			 * Create the nodes from the array <li><div class="tree-row"><div
			 * class="tree-image"></div><span><a>node</a></span><div></li>
			 */
			if (nodes && nodes.length) {
				// Get parent ul
				var ul = $('ul.tree-node:first', parent) || null;

				// Create it if it doesn't exist
				if (!ul.length) {
					ul = document.createElement('ul');
					$(ul).attr({'role' : 'group'}).addClass('tree-node').append('<li class="spacer" role="treeitem" aria-expanded="false"></li>');

					$(parent).append(ul);
				}

				// Iterate through nodes array
				$.each(nodes, function(i, node) {

					if (!self._isNode(node.id, parent)) {
						// Set default
						if (!node['class']) {
							node['class'] = 'folder';
						}
						// title and link html
						var title = node.name || node.id;
						// decode
						title = $.String.decode(title);
						name = title;
						len = self.options.charLength;

						// shorten
						if (len && name.length > len) {
							name = name.substring(0, len) + '...';
						}

						var img = /folder/.test(node['class']) ? 'tree-image' : 'tree-noimage';
						var url = !node.url ? 'javascript:;' : node.url;
						
						var li = document.createElement('li');

						$(li).attr({'id' : self._escape(encodeURI(node.id))}).append('<div class="tree-row">'
						+ '<div role="presentation" class="' + img
						+ '"></div>' + '<span role="presentation" class="'
						+ node['class'] + '">'
						+ '<a href="' + url
						+ '" title="' + title + '">'
						+ name + '</a>' + '</span>'
						+ '</div>').attr('aria-level', parseFloat($(parent).attr('aria-level')) + 1);

						$(ul).append(li);

						// add hover events
						$('div.tree-row', li).hover(function() {
							$(this).addClass('hover');
						}, function() {
							$(this).removeClass('hover');
						}

						);

						// add node click
						$('div.tree-image', li).click(function(e) {
							self.toggleNode(e, li);
						});

						// add name / icon click
						$('span', li).click(function(e) {
							self._trigger('onNodeClick', e, li);
						});

						self.toggleNodeState(parent, 1);
						self._trigger('onNodeCreate');
					} else {
						// Node exists, set as open
						self.toggleNodeState(parent, 1);
					}
				});

			} else {
				// No new nodes, set as open
				this.toggleNodeState(parent, 1);
			}
		},

		/**
		 * Find the parent node
		 * 
		 * @param {String}
		 *            The child node id
		 * @return {Element} The parent node.
		 */
		_findParent : function(el) {
			if ($.type(el) == 'string') {
				return $('li[id="' + this._encode(el) + '"]:first',
						this.element);
			} else {
				return $(el).parents('li:first');
			}
		},

		/**
		 * Find a node by id
		 * 
		 * @param {String}
		 *            The child node title
		 * @param {String /
		 *            Element} The parent node
		 * @return {Element} The node.
		 */
		_findNode : function(id, parent) {
			if (!parent || parent == '/') {
				parent = this.element;
			}

			if ($.type(parent) == 'string') {
				parent = this._findParent(parent);
			}

			return $('li[id="' + this._escape(this._encode(id)) + '"]:first', parent);
		},

		/**
		 * Toggle the loader class on the node span element
		 * 
		 * @param {Element}
		 *            The target node
		 */
		toggleLoader : function(node) {
			$('span:first', node).toggleClass(this.options.loaderClass);
		},

		/**
		 * Collapse all tree nodes except one excluded
		 * 
		 * @param {Element}
		 *            The excluded node
		 */
		_collapseNodes : function(ex) {
			var self = this;

			if (!ex)
				this._resetNodes();

			var parent = $(ex).parent();

			$('li', parent).each(function(el) {
				if (el != ex) {
					if ($(el).parent() == parent) {
						self.toggleNodeState(el, 0);

						var child = self._getNode(el);

						if (child) {
							$(child).addClass('hide');
						}
					}
				}
			});

		},

		/**
		 * Toggle a node's state, open or closed
		 * 
		 * @param {Element}
		 *            The node
		 */
		toggleNodeState : function(node, state) {
			if (state == 1) {
				$(node).addClass('open').attr('aria-expanded', true);
			} else {
				$(node).removeClass('open').attr('aria-expanded', false);
			}

			if (state == 1) {
				if (node.id == '/') {
					return;
				}
				var c = $('ul.tree-node', node);

				if (c.length) {
					if ($(node).hasClass('open')) {
						$(c).removeClass('hide');
					} else {
						$(c).addClass('hide');
					}
				}
			}
		},

		/**
		 * Toggle a node
		 * 
		 * @param {Element}
		 *            The node
		 */
		toggleNode : function(e, node) {
			// Force reload
		if (e.shiftKey) {
			return this._trigger('onNodeLoad', e, node);
		}

		var child = this._getNode(node);

		// No children load or close
		if (!child.length) {
			if ($('div.tree-image', node).hasClass('open')) {
				this.toggleNodeState(node);
			} else {
				this._trigger('onNodeLoad', e, node);
			}
			// Hide children, toggle node
		} else {
			$(child).toggleClass('hide');
			this.toggleNodeState(node);
		}

		// Collpase the all other tree nodes
		if (this.options.collapseTree) {
			this._collapseNodes(node);
		}
	},

	_encode : function(s) {
		// decode first in case already encoded
		s = decodeURIComponent(s);
		// encode but decode backspace
		return encodeURIComponent(s).replace(/%2F/gi, '\/');
	},

	/**
	 * Private function Escape a string
	 * 
	 * @param {String}
	 *            The string
	 * @return {String} The escaped string
	 */
	_escape : function(s) {
		return s.replace(/'/, '%27');
	},

	destroy : function() {
		$.Widget.prototype.destroy.apply(this, arguments);
	}

	});

	$.extend($.ui.tree, {
		version : "@@version@@"
	});

})(jQuery);
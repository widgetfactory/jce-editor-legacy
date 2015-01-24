/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

var WFLinkBrowser = {
	
    options : {
        element	: '#link-browser',
        onClick 	: $.noop	
    },
	
    init : function(options) {
        $.extend(this.options, options);		
        this._createTree();
    },
	
    // create tree
    _createTree : function() {
        var self = this;

        $(this.options.element).tree({
            collapseTree: true,
            charLength	: 50,
            
            onInit : function(e, callback) {
                if ($.isFunction(callback)) {
                    callback.apply();
                }
            },
            
            // When a node is clicked
            onNodeClick : function(e, node) {
                var v;

                if (!$('span.nolink', node).length) {
                    v = $('a', node).attr('href');

                    if (v == 'javascript:;')
                        v = $(node).attr('id');
                    
                    if ($.isFunction(self.options.onClick)) {
                        self.options.onClick.call(this, $.String.decode(v));
                    }
                }

                if ($('span', node).is('.folder')) {
                    $(this).tree('toggleNode', e, node);
                }

                e.preventDefault();
            },

            // When a node is toggled and loaded
            onNodeLoad : function(e, node) {
                var self = this;

                $(this).tree('toggleLoader', node);
                
                var query = $.String.query($.String.unescape($(node).attr('id')));

                $.JSON.request('getLinks', {
                    'json' : query
                }, function(o) {
                    if (o) {
                        if (!o.error) {
                            var ul = $('ul:first', node);

                            if (ul) {
                                $(ul).remove();
                            }

                            $(self).tree('createNode', o.folders, node);
                            $(self).tree('toggleNodeState', node, true);
                        } else {
                            $.Dialog.alert(o.error);
                        }
                    }
                    $(self).tree('toggleLoader', node);
                }, self);
            }
        });
    }
};
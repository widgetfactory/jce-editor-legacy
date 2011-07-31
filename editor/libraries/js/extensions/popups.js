/**
 * @version		$Id: popups.js 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

var WFPopups = WFExtensions.add('Popups', {
    /**
     * Array of popup extension objects
     */
    popups : {},

    /**
     * Current Popup Extension object
     */
    popup : '',

    /**
     * Global Configuration object
     */
    config : {},

    /**
     * Add a popup extension
     * @param {String} n Extension name
     * @param {Object} o Extension object
     */
    addPopup : function(n, o) {
        this.popups[n] = o;

        WFExtensions.addExtension('popups', n, o);
    },

    /**
     * Get all popups
     */
    getPopups : function() {
        return this.popups;
    },

    setup : function() {
        var self = this, ed = tinyMCEPopup.editor, s = ed.selection;

        if (!s.isCollapsed()) {
            n = s.getNode();

            var state = true, v;

            function setText(state, v) {
                if (state && v) {
                    $('#popup_text').val(v);
                    $('#popup_text').attr('disabled', false);
                } else {
                    $('#popup_text').val(tinyMCEPopup.getLang('dlg.element_selection', 'Element Selection'));
                    $('#popup_text').attr('disabled', true);
                    $('#popup_text').addClass('disabled');
                }
            }

            v = s.getContent({
                format : 'text'
            });

            if (n) {
                var children = tinymce.grep(n.childNodes, function(node) {
                	return ed.dom.is(node, 'br[data-mce-bogus]') == false;
                });
                
                state = children.length == 1 && children[0].nodeType == 3;
            }

            // set text value and state
            setText(state, v);
        }

        $.each(this.popups, function(k, v) {
            self._call('setup', '', v);
        });

    },

    /**
     * Check if selected node is a Popup
     * @param {Object} n Node
     * @param {Object} v Popup type
     */
    isPopup : function(n, v) {
        return n && n.nodeName == 'A' && this._call('check', n, v);
    },

    /**
     * Get the assigned popup if any from the selected node
     * @param {Object} n Anchor Element / Node
     */
    getPopup : function(n) {
        var self = this, ed = tinyMCEPopup.editor, popup, popups = this.getPopups();
        
        if (n.nodeName != 'A') {
            n = ed.dom.getParent(n, 'a');
        }
        
        $.each(this.popups, function(k, v) {
            if (self.isPopup(n, k)) {
                self.popup = k;
            }
        });

        if (this.popup) {
            // Select popup in list
            this.selectPopup(this.popup);                  
            // Process attributes
            return this.getAttributes(n);
        }
        
        return '';
    },

    /**
     * Set the currently selected popup
     * @param {String} s popup name eg: jcemediabox
     */
    setPopup : function(s) {
        this.popup = s;
    },

    /**
     * Set Global Configuration
     * @param {Object} config Configuration object
     */
    setConfig : function(config) {
        $.extend(this.config, config);
    },

    /**
     * Set parameters for a popup type
     * @param {String} n Popup type
     * @param {Object} p Parameters object
     */
    setParams : function(n, p) {
        var popup = this.popups[n];

        if (popup) {
            if (typeof popup.params == 'undefined') {
                popup.params = {};
            }
            $.extend(popup.params, p);
        }
    },

    /**
     * Get parameters for a popup type
     * @param {String} n Popup Type
     */
    getParams : function(n) {
        return this.popups[n].params || {};
    },

    /**
     * Get a specific popup type parameter
     * @param {String} n Popup type
     * @param {String} p Paremeter
     */
    getParam : function(n, p) {
        var params = this.getParams(n);
        return params[p] || null;
    },

    /**
     * Selects a popup from the popup list
     * @param {Object} s Select element
     */
    selectPopup : function(v) {
        var self = this;

        $('option', '#popup_list').each( function() {
            if (this.value) {
                // hide all popups
                $('#popup_extension_' + this.value).hide();
                if (v == this.value || $(this).is(':selected')) {
                    this.selected = true;

                    $('#popup_extension_' + this.value).show();
                    // set as selected popup
                    self.popup = this.value;
                    // call onSelect function
                    self._call('onSelect', [], this.value);
                }
            }
        });

    },

    /**
     * Set popup extension parameter values to current node
     * @param {Object} n Popup / Link node
     */
    setAttributes : function(n, args) {
        var ed = tinyMCEPopup.editor;
        
        // map values
        if (this.config['map']) {
            $.each(this.config['map'], function (to, from) {
                var v = args[from] || $('#' + from).val();                
                ed.dom.setAttrib(n, to, v);
                
                // remove initial value
                delete args[from];
            });

        }

        return this._call('setAttributes', [n, args]);
    },

    /**
     * Apply currently selected popup attributes to link element
     * @param {Object} n Link element / node
     */
    getAttributes : function(n) {
        var ed = tinyMCEPopup.editor, k, v, at, data;

        if (n.nodeName != 'A') {
            n = ed.dom.getParent(n, 'a');
        }

        if (this.isPopup(n)) {
            data = this._call('getAttributes', n);
        }

        return data;
    },

    /**
     * Check if popups are enabled (checkbox checked and popup type selected)
     */
    isEnabled : function() {
        return this.popup;
    },

    /**
     * Create a popup on a link element
     * @param {Object} n
     * @param {Object} args
     */
    createPopup : function(n, args) {
        var self = this, ed = tinyMCEPopup.editor, o;

        args = args || {};

        // Popup option is enabled
        if (this.isEnabled()) {

            if (n && (n.nodeName == 'A' || (n = ed.dom.getParent(n, 'A')))) {
                // remove all popups
                this.removePopups(n);
                // set popup attributes
                this.setAttributes(n, args);
            } else {
                // no selection
                if (ed.selection.isCollapsed()) {
                    ed.execCommand('mceInsertContent', false, '<a href="javascript:mctmp(0);">' + $('#popup_text').val() + '</a>', {
                        skip_undo : 1
                    });
                    // create link on selection or update existing link
                } else {
                    ed.execCommand('mceInsertLink', false, 'javascript:mctmp(0);');
                }

                tinymce.each(ed.dom.select('a[href=javascript:mctmp(0);]'), function(link) {
                    self.setAttributes(link, args);
                });
            }
        } else {
            // is a popup and option not checked - remove
            if (this.isPopup(n)) {
                ed.dom.remove(n, true);
            }
        }
    },

    /**
     * Remove all popups from the current link node
     */
    removePopups : function(n) {
        var self = this;

        $.each(this.popups, function(k, v) {
            self._call('remove', n, v);
        });

    },

    /**
     * Function called when a file is selected
     * @param {Object} args Arguments object eg: {src : url, width : 640, height : 480}
     */
    onSelectFile : function(args) {
        this._call('onSelectFile', args);
    },
    
    /**
     * Call a popup function
     * @param {String} fn Function to call
     * @param {Array} args Array of arguments
     * @param {String} popup popup type to call function on
     */
    _call : function(fn, args, popup) {
        if (!popup) {
            popup = this.popup;
        }
        
        if (typeof popup == 'string') {
        	popup = this.popups[popup] || {};
        }
        
        fn = popup[fn];

        if (fn) {
            if (typeof args == 'object' && args instanceof Array) {
            	return fn.apply(popup, args);
            } else {
            	return fn.call(popup, args);
            }
        }

        return false;
    }

});
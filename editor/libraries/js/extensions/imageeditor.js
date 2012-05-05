/**
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

var WFImageEditor = WFExtensions.add('ImageEditor', {
    
    add : function(name, o) {
    	o = o || {};
        
        if (!o.params) {
            o.params = {};
        }
        
        this[name] = o;
    },
    
    get : function(name) {
    	return this[name] || null;
    },
    
    /**
     * Return an aggregator parameter value
     * @param {String} Parameter
     */
    getParams : function(name) {
        var f = this.get(name);
        
        if (f) {
            return f.params || {};
        }
        
        return {};
    },

    /**
     * Return an aggregator parameter value
     * @param {String} Parameter
     */
    getParam : function(name, param) {
        var f = this.get(name);
        
        if (f) {
            return f.params[param] || '';
        }
        
        return '';
    },

    /**
     * Set Aggregator Parameters
     * @param {Object} o Parameter Object
     */
    setParams : function(name, o) {
        var f = this.get(name);
        
        if (f) {
            tinymce.extend(this.getParams(name), o);
        }
    }
});

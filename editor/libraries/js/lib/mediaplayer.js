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
 * Global MediaPlayer Object.
 * Extended by MediaPlayer extensions
 */
var WFMediaPlayer = WFExtensions.add('MediaPlayer', {
    /**
     * Parameter Object
     */
    params 	: {
        extensions : 'flv,f4v',
        dimensions : {},
        path : ''
    },

    type 	: 'flash',

    init : function(o) {
        tinymce.extend(this, o);

        // return the MediaPlayer object
        return this;
    },

    setup : function() {
    },

    getTitle : function() {
        return this.title || this.name;
    },

    getType : function() {
        return this.type;
    },

    /**
     * Check whether a media type is supported
     */
    isSupported : function() {
        return false;
    },

    /**
     * Return a player parameter value
     * @param {String} Parameter
     */
    getParam : function(param) {
        return this.params[param] || '';
    },

    /**
     * Set Player Parameters
     * @param {Object} o Parameter Object
     */
    setParams : function(o) {
        tinymce.extend(this.params, o);
    },

    /**
     * Return the player path
     */
    getPath: function() {
        return this.getParam('path');
    },

    onSelectFile : function(file) {
    },
    
    onInsert : function() {    	
    },
    
    onChangeType : function() {   	
    }

});
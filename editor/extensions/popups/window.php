<?php
/**
* @version		$Id: window.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2011 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined( '_WF_EXT' ) or die( 'Restricted access' );
class WFPopupsExtension_Window extends JObject
{
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	function __construct($options = array()){
		// only if enabled
		if (self::isEnabled()) {	
			
			$document = WFDocument::getInstance();
			
			$document->addScript('window', 'extensions/popups/window/js');
			$document->addStyleSheet('window', 'extensions/popups/window/css');
		}
	}
	
	function getParams()
	{
		return array();
	}
	
	function isEnabled()
	{
		$plugin = WFEditorPlugin::getInstance();
		
		if ($plugin->getParam('popups.window.enable', 1) && ($plugin->getName() == 'link' || $plugin->getName() == 'imgmanager_ext')) {
	      return true;
		}
		
		return false;
	}
}
?>
<?php
/**
* @package      JCE Popups
* @copyright    @@copyright@@
* @author		Ryan Demmer
* @license      @@licence@@
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined( '_WF_EXT' ) or die('RESTRICTED');

class WFPopupsExtension_Rokbox extends JObject
{	
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	function __construct($options = array())
	{		
		if (self::isEnabled()) {
			$scripts = array();
			
			$document = WFDocument::getInstance();
			
			$document->addScript('rokbox', 'extensions/popups/rokbox/js');
			$document->addStyleSheet('rokbox', 'extensions/popups/rokbox/css');
		}
	}
	
	function getParams()
	{
		return array();
	}
	
	function isEnabled()
	{		
		$wf = WFEditorPlugin::getInstance();
		
		if (JPluginHelper::isEnabled('system', 'rokbox') && $wf->getParam('popups.rokbox.enable', 1) == 1) {
			return true;
		}
		
		return false;
	}
}
?>
<?php
/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined( '_WF_EXT' ) or die('RESTRICTED');

class WFPopupsExtension_Jcemediabox extends JObject
{
	var $_requires = '1.0.16';
	
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
			
			$document->addScript('jcemediabox', 'extensions/popups/jcemediabox/js');
			$document->addStyleSheet('jcemediabox', 'extensions/popups/jcemediabox/css');

			jimport('joomla.filesystem.folder');
			jimport('joomla.filesystem.file');
			
			$path = JPATH_PLUGINS.DS.'system'.DS.'jcemediabox'.DS.'addons';
	
			$files = JFolder::files($path, '.js');
				
			foreach ($files as $file) {
				if (strpos('-src.js', $file) === false) {
					$scripts[] = 'plugins/system/jcemediabox/addons/'.JFile::stripExt($file);
				}
			}
			$document->addScript($scripts, 'joomla');
		}
	}
	
	function getParams()
	{
		return array(
			'width' => 600
		);
	}
	
	function isEnabled()
	{		
		$jce = WFEditorPlugin::getInstance();
		
		if (JPluginHelper::isEnabled('system', 'jcemediabox') && $jce->getParam('popups.jcemediabox.enable', 1) == 1) {
			return true;
		}
		
		return false;
	}
	
	function checkVersion()
	{
		$file = JPATH_PLUGINS . DS . 'system' . DS . 'jcemediabox.xml';
		
		if (!is_file($file)) {
			$file = JPATH_PLUGINS . DS . 'system' . 'jcemediabox' . DS . 'jcemediabox.xml';
		}
		
		$required = $this->get('_requires');
		
		if ($xml = JApplicationHelper::parseXMLInstallFile($file)) {
			if (version_compare($xml['version'], (int)$required, '<')) {
				echo '<p class="required">' . WFText::sprintf('WF_POPUPS_JCEMEDIABOX_VERSION_ERROR', $required) . '</p>';
			}
		}
	}
}
?>
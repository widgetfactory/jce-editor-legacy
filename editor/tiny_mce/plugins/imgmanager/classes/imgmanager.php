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

defined('_JEXEC') or die('RESTRICTED'); 

// Load class dependencies
wfimport('editor.libraries.classes.manager');
 
final class WFImageManagerPlugin extends WFMediaManager
{
	var $_filetypes = 'images=jpg,jpeg,png,gif';
	
	/**
	* @access	protected
	*/
	public function __construct()
	{			
		parent::__construct();
	}
	/**
	 * Returns a reference to the Image Manager object
	 *
	 * This method must be invoked as:
	 * 		<pre>  $imgmanager = WFImageManagerPlugin::getInstance();</pre>
	 *
	 * @access	public
	 * @return	object WFImageManagerPlugin
	 */
	public function &getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFImageManagerPlugin();
		}
		return $instance;
	}
	
	/**
	 * Display the plugin
	 * @access public
	 */
	public function display()
	{
		parent::display();

		$document = WFDocument::getInstance();

		// create new tabs instance
		$tabs = WFTabs::getInstance(array(
			'base_path' => WF_EDITOR_PLUGIN
		));
		
		// Add tabs
		$tabs->addTab('image');

		$tabs->addTab('rollover', $this->getParam('tabs_rollover', 1));
		$tabs->addTab('advanced', $this->getParam('tabs_advanced', 1));
		
		$document->addScript(array('imgmanager'), 'plugins');
		$document->addStyleSheet(array('imgmanager'), 'plugins');
		
		$document->addScriptDeclaration('ImageManagerDialog.settings='.json_encode($this->getSettings()).';');
	}
	
	function getSettings()
	{
		$params = $this->getParams();
		
		$settings = array(
			'attributes' 	=> array(
				'dimensions'	=> $params->get( 'imgmanager.attributes_dimensions', 1),
				'align'			=> $params->get( 'imgmanager.attributes_align', 1),
				'margin'		=> $params->get( 'imgmanager.attributes_margin', 1),
				'border'		=> $params->get( 'imgmanager.attributes_border', 1)
			)
		);
		
		return parent::getSettings($settings);
	}
	
	/**
	 * Get default parameters
	 * @return string parameters
	 */
	function getDefaults()
	{
		return parent::getDefaults(array());
	}
}
?>
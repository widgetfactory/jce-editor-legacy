<?php
/**
* @version 		$Id: imgmanager.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
 
defined('_JEXEC') or die('ERROR_403'); 

// Load class dependencies
wfimport('editor.libraries.classes.manager');
 
class WFImageManagerPlugin extends WFMediaManager
{
	var $_filetypes = 'images=jpg,jpeg,png,gif';
	
	/**
	* @access	protected
	*/
	function __construct()
	{			
		parent::__construct();
	}
	/**
	 * Returns a reference to a editor object
	 *
	 * This method must be invoked as:
	 * 		<pre>  $browser =JCE::getInstance();</pre>
	 *
	 * @access	public
	 * @return	JCE  The editor object.
	 * @since	1.5
	 */
	function &getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFImageManagerPlugin();
		}
		return $instance;
	}
	
	/**
	 * Display the plugin
	 */
	function display()
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
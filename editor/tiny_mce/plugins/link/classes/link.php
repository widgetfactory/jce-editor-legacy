<?php
/**
 * @version		$Id: link.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('RESTRICTED');
// Set flag that this is an extension parent
DEFINE('_WF_EXT', 1);

// Load class dependencies
wfimport('editor.libraries.classes.plugin');
wfimport('editor.libraries.classes.extensions.browser');
wfimport('editor.libraries.classes.extensions.popups');

// Link Plugin Controller
class WFLinkPlugin extends WFEditorPlugin
{
	/*
	 *  @var varchar
	 */
	var $extensions = array();

	var $popups 	= array();

	var $tabs 		= array();
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access	protected
	 */
	function __construct()
	{
		parent::__construct();
		
		$browser = $this->getBrowser();
	}
	/**
	 * Returns a reference to a plugin object
	 *
	 * This method must be invoked as:
	 * 		<pre>  $advlink =AdvLink::getInstance();</pre>
	 *
	 * @access	public
	 * @return	JCE  The editor object.
	 * @since	1.5
	 */
	function &getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFLinkPlugin();
		}
		return $instance;
	}

	function display()
	{
		parent::display();

		$document = WFDocument::getInstance();
		$settings = $this->getSettings();

		$document->addScriptDeclaration('LinkDialog.settings='.json_encode($settings).';');

		$tabs = WFTabs::getInstance(array(
			'base_path' => WF_EDITOR_PLUGIN
		));
		
		// Add tabs
		$tabs->addTab('link', 1);
		$tabs->addTab('advanced', $this->getParam('tabs_advanced', 1));

		$browser = $this->getBrowser();	
		$browser->display();
		
		// Load Popups instance
		$popups = WFPopupsExtension::getInstance(array(
      		'text' => false
		));
		
		$popups->display();
		
		// add link stylesheet
		$document->addStyleSheet(array('link'), 'plugins');
		// add link scripts last
		$document->addScript(array('link'), 'plugins');
	}

	function getBrowser()
	{
		static $browser;

		if (!is_object($browser)) {
			$browser = WFBrowserExtension::getInstance('link');
		}

		return $browser;
	}

	function getLinkBrowser()
	{
		$browser = $this->getBrowser();
		return $browser->getLinkBrowser();
	}

	function getSettings()
	{
		$profile = $this->getProfile();	
			
		$settings = array(
			'file_browser'	=> $this->getParam('file_browser', 1) && in_array('browser', explode(',', $profile->plugins)),
			'attributes' 	=> array(
				'target'	=> $this->getParam( 'attributes_target', 1),
				'anchor'	=> $this->getParam( 'attributes_anchor', 1)
			)
		);

		return parent::getSettings($settings);
	}
}
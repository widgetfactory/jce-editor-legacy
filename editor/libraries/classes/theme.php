<?php
/**
 * @version		$Id: theme.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined( '_JEXEC') or die( 'Restricted access');

// Needed for cyrillic languages?
header("Content-type: text/html; charset=utf-8");

require_once( WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'editor.php');
require_once( WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'utility.php');
require_once( WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'document.php');
require_once( WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'view.php');
require_once( WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'tabs.php');

/**
 * JCE class
 *
 * @static
 * @package		JCE
 * @since	1.5
 */

class WFEditorTheme extends WFEditor
{
	/*
	 *  @var array
	 */
	var $scripts = array();
	/*
	 *  @var array
	 */
	var $styles = array();


	/**
	 * Constructor activating the default information of the class
	 *
	 * @access	protected
	 */
	function __construct()
	{
		// Call parent
		parent::__construct();
		
		$dialog = JRequest::getWord('dialog');
		$theme 	= JRequest::getWord('theme');
		
		$this->set('dialog', $dialog);
		$this->set('theme', $theme);
		
		$this->execute();
	}
	
	function & getView()
	{
		static $view;
		
		if (!is_object($view)) {
			// create plugin view
			$view = new WFView(array(
				'base_path'		=> WF_EDITOR_THEMES .DS. $this->get('theme'),
				'template_path'	=> WF_EDITOR_THEMES .DS. $this->get('theme') .DS. 'tmpl',
				'name' 			=> $this->get('dialog'),
				'layout'		=> $this->get('dialog')
			));
			
			$view->assign('theme', $this);
		}
		
		return $view;
	}
	
	function execute()
	{
		WFToken::checkToken() or die('RESTRICTED ACCESS');	
			
		$document = WFDocument::getInstance(array(
			'title'		=> WFText::_('WF_'.strtoupper($this->get('dialog')).'_TITLE'),
      		'version' 	=> $this->getVersion(),
      		'name'		=> $this->get('dialog')
		));

		$this->display();
		
		// pack assets if required
		$document->pack(true, $this->getParam('editor.compress_gzip', 0));
		
		// get view
		$view = $this->getView();
		
		// set body output
		$document->setBody($view->loadTemplate());			
		$document->render();
	}

	function display()
	{
		jimport('joomla.filesystem.folder');

		$document = WFDocument::getInstance();

		// get UI Theme
		$uitheme = $this->getParam('editor.dialog_theme', 'jce');

		$document->addScript(array('tiny_mce_popup'), 'tiny_mce');

		// jquery versions
        $jquery = array('jquery/jquery-' . WF_JQUERY . '.min.js', 'jquery/jquery-ui-' . WF_JQUERYUI . '.custom.min.js');

		$document->addScript($jquery, 'libraries');

		$ui = JFolder::files(WF_EDITOR_LIBRARIES.DS.'css'.DS.'jquery'.DS.$uitheme, '\.css$');

		$document->addStyleSheet(array(
			'jquery/' . $uitheme . '/' . basename($ui[0], '.css'),
			'plugin'
		), 'libraries');

      	$document->addStyleSheet(array(
      		'themes/'.$this->get('theme').'/css/'.$this->get('dialog')
      	), 'tiny_mce');

      	if ($this->get('dialog') == 'colorpicker') {
      		$document->addScript(array('colorpicker'), 'libraries');
      		
      		require_once(JPATH_COMPONENT_ADMINISTRATOR.DS.'helpers'.DS.'tools.php');
      		
      		$settings = array(
      			'template_colors' 	=> WFToolsHelper::getTemplateColors(),
				'custom_colors' 	=> $this->getParam('editor.custom_colors')
      		);
      		
      		$document->addScriptDeclaration('ColorPicker.settings=' . json_encode($settings));
      	}
      	$document->addScript(array(
      		'themes/'.$this->get('theme').'/js/'.$this->get('dialog')
      	), 'tiny_mce');
      	
      	$tabs = WFTabs::getInstance(array(
      		'base_path' => WF_EDITOR_THEMES.DS.$this->get('theme')
      	));

      	$tabs->addPanel($this->get('dialog'), 1);
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
	function &getInstance() {
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFEditorTheme();
		}
		return $instance;
	}
}
?>
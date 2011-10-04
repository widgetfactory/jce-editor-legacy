<?php
/**
 * @version		$Id: plugin.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined( '_JEXEC') or die( 'ERROR_403');

wfimport('editor.libraries.classes.editor');

/**
 * JCE class
 *
 * @static
 * @package		JCE
 * @since	1.5
 */

class WFEditorPlugin extends WFEditor
{
	
	var $_alerts = array();
	
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access	protected
	 */
	function __construct()
	{
		// Call parent
		parent::__construct();

		$db = JFactory::getDBO();

		// get plugin name
		$plugin = JRequest::getWord('plugin');

		// check plugin
		if ($this->checkPlugin($plugin)) {
				$this->set('_name', 		$plugin);
				$this->set('_type', 		JRequest::getWord('type', 'standard'));

				if (!defined('WF_EDITOR_PLUGIN')) {
					define('WF_EDITOR_PLUGIN', WF_EDITOR_PLUGINS . DS . $plugin);
				}
				
				// set variables for view
				$this->set('_layout', 		'default');
				$this->set('_base_path', 	WF_EDITOR_PLUGIN);
				$this->set('_template_path', WF_EDITOR_PLUGIN .DS. 'tmpl');
		} else {
			die(JError::raiseError(403, WFText::_('ERROR_403')));
		}
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
	function & getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFEditorPlugin();
		}

		return $instance;
	}
	
	function & getView()
	{
		static $view;
		
		if (!is_object($view)) {
			// create plugin view
			$view = new WFView(array(
				'base_path'		=> $this->get('_base_path'),
				'template_path'	=> $this->get('_template_path'),
				'name' 			=> $this->get('_name'),
				'layout'		=> $this->get('_layout')
			));
			
			$view->assign('plugin', $this);
		}
		
		return $view;
	}
	
	function isRequest()
	{
		$format = JRequest::getWord('format');		
		return ($format == 'json' || $format == 'raw') && (JRequest::getVar('json') || JRequest::getWord('action'));		
	}

	function execute()
	{				
		WFToken::checkToken() or die('RESTRICTED ACCESS');	
		
		// JSON request or upload action
		if ($this->isRequest()) {							
			$request = WFRequest::getInstance();
			$request->process();
		} else {
			$this->loadLanguage('com_jce', JPATH_ADMINISTRATOR);
			// Load Plugin language
			$this->loadPluginLanguage();	
				
			$version 	= $this->getVersion();	
			$name		= $this->getName();						
			$xml 		= JApplicationHelper::parseXMLInstallFile(WF_EDITOR_PLUGINS . DS . $name . DS . $name . '.xml');
			
			if (isset($xml['version'])) {
				$version = $xml['version'];
			}

			// create the document
			$document = WFDocument::getInstance(array(
				'version' 				=> $version,
				'title'	  				=> WFText::_('WF_' . strtoupper($this->getName() . '_TITLE')),
				'name' 					=> $name,
				'language'				=> $this->getLanguageTag(),
				'direction'				=> $this->getLanguageDir(),
				'compress_javascript' 	=> $this->getParam('editor.compress_javascript', 0),
				'compress_css'			=> $this->getParam('editor.compress_css', 0)
			));
			
			// set standalone mode
			$document->set('standalone', JRequest::getInt('standalone', 0));
			
			// create display
			$this->display();
			
			$document = WFDocument::getInstance();

			// set standalone mode (for File Browser etc)
			if ($document->get('standalone') == 1) {
				// remove some scripts
				$document->removeScript('tiny_mce_popup', 'tiny_mce');
				$document->removeScript('tiny_mce_utils', 'libraries');
			}
			
			// pack assets if required
			$document->pack(true, $this->getParam('editor.compress_gzip', 0));

			// get the view
			$view = $this->getView();

			// set body output
			$document->setBody($view->loadTemplate());	
			
			// render document		
			$document->render();
		}
	}

	function display()
	{
		jimport('joomla.filesystem.folder');		
		$document = WFDocument::getInstance();			

		$document->addScript(array('tiny_mce_popup'), 'tiny_mce');

		// jquery versions
        $jquery = array('jquery/jquery-' . WF_JQUERY . '.min.js', 'jquery/jquery-ui-' . WF_JQUERYUI . '.custom.min.js');

		$document->addScript($jquery, 'libraries');

		$document->addScript(array(
			'html5', 
			'select', 
			'tips',
			'tiny_mce_utils',
			'plugin'
		), 'libraries');
		
		// get UI Theme
		$theme = $this->getParam('editor.dialog_theme', 'jce');
		
		$ui = JFolder::files(WF_EDITOR_LIBRARIES.DS.'css'.DS.'jquery'.DS.$theme, '\.css$');

		$document->addStyleSheet(array(
			'jquery/' . $theme . '/' . basename($ui[0], '.css'),
			'plugin'
		), 'libraries');
	}

	/**
	 * Return the plugin name
	 */
	function getName()
	{
		return $this->get('_name');
	}
	
	/**
	 * Get default values for a plugin.
	 * Key / Value pairs will be retrieved from the profile or plugin manifest
	 */
	function getDefaults($defaults = array())
	{
		$name = $this->getName();
		
		$params = $this->getParams(array(
			'key'	=> $name,
			'path' 	=> WF_EDITOR_PLUGIN . DS . $name . '.xml'
		));	
		
		return array_merge($defaults, (array)$params->getAll('defaults'));
	}

	/**
	 * Check the user is in an authorized group
	 * Check the users group is authorized to use the plugin
	 *
	 * @access 			public
	 * @return 			boolean
	 */
	function checkPlugin($plugin = null)
	{
		if ($plugin) {	
			// check existence of plugin directory
			if (is_dir(WF_EDITOR_PLUGINS . DS . $plugin)) {
				// check profile	
				$profile = $this->getProfile();	
				return is_object($profile) && isset($profile->id) && $profile->published = 1 && in_array($plugin, explode(',', $profile->plugins));
			}
		}
		
		return false;
	}
	
	/**
	 * Load current plugin language file
	 */
	function loadPluginLanguage()
	{
		$this->loadLanguage('com_jce_'. trim($this->getName()));
	}

	/**
	 * Add an alert array to the stack
	 *
	 * @param object $class[optional] Alert classname
	 * @param object $title[optional] Alert title
	 * @param object $text[optional]  Alert text
	 */
	function addAlert($class = 'info', $title = '', $text = '')
	{
		$alerts = $this->getAlerts();	
		
		$alerts[] = array(
			'class' => $class,
			'title'	=> $title,
			'text'	=> $text
		);
			
		$this->set('_alerts', $alerts);
	}
	/**
	 * Get current alerts
	 * @return array Alerts
	 */
	function getAlerts()
	{
		return $this->get('_alerts');
	}

	/**
	 * Convert a url to path
	 *
	 * @access	public
	 * @param	string 	The url to convert
	 * @return	Full path to file
	 * @since	1.5
	 */
	function urlToPath($url)
	{
		$document = WFDocument::getInstance();
		return $document->urlToPath($url);
	}

	/**
	 * Returns an image url
	 *
	 * @access	public
	 * @param	string 	The file to load including path and extension eg: libaries.image.gif
	 * @return	Image url
	 * @since	1.5
	 */
	function image($image, $root = 'libraries') {
		$document = WFDocument::getInstance();

		return $document->image($image, $root);
	}
	/**
	 * Load a plugin extension
	 *
	 * @access	public
	 * @since	1.5
	 */
	function getExtensions($arguments) {
		return array();
	}
	/**
	 * Load & Call an extension
	 *
	 * @access	public
	 * @since	1.5
	 */
	function loadExtensions($config=array()) {
		return array();
	}

	function getSettings($settings = array())
	{
		$default = array(
			'alerts' 	=>  $this->getAlerts(),
			'defaults'	=> $this->getDefaults()
		);

		$settings = array_merge($default, $settings);
		
		return $settings;
	}
	
	/**
	 * Get a parameter by key
	 * @param $key Parameter key eg: editor.width
	 * @param $fallback Fallback value
	 * @param $default Default value
	 */
	public function getParam($key, $fallback = '', $default = '', $type = 'string', $allowempty = true)
	{
		// get plugin name
		$name	= $this->getName();
		// get all keys
		$keys = explode('.', $key);
		
		// root key set
		if ($keys[0] === 'editor' || $keys[0] === $name) {
			return parent::getParam($key, $fallback, $default, $type, $allowempty);
		// no root key set, treat as shared param
		} else {
			// get all params
			$params = parent::getParams();
			// check plugin param and fallback to editor param
			$param = $params->get($name . '.' . $key, $params->get('editor.' . $key, $fallback, $allowempty), $allowempty);	

			if (is_string($param) && $type === 'string') {
				$param = self::cleanParam($param);
			}
	
			if (is_numeric($default)) {
				$default = intval($default);
			}
	
			if (is_numeric($param)) {
				$param = intval($param);
			}
	
			if ($param === $default) {
				return '';
			}
	
			if ($type === 'boolean') {
				$param = (bool)$param;
			}

			return $param;
		}
	}
	
	/**
	 * Named wrapper to check access to a feature
	 *
	 * @access 			public
	 * @param string	The feature to check, eg: upload
	 * @param string	The defalt value
	 * @return 			Boolean
	 */
	function checkAccess($option, $default = 0)
	{
		return (bool)self::getParam($option, $default);
	}
}
?>
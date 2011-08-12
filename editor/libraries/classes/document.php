<?php
/**
 * @package     JCE
 * @copyright   Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @copyright	Copyright (C) 2005 - 2011 Open Source Matters. All rights reserved.
 * @author    	Ryan Demmer
 * @license     GNU/GPL version 2 or later
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('ERROR_403');

class WFDocument extends JObject
{
	/**
	 * Array of linked scripts
	 *
	 * @var		array
	 * @access   private
	 */	
	var $_scripts 	= array();
	
	/**
	 * Array of scripts placed in the header
	 *
	 * @var  array
	 * @access   private
	 */
	var $_script 	= array();

	/**
	 * Array of linked style sheets
	 *
	 * @var	 array
	 * @access  private
	 */
	var $_styles 	= array();

	/**
	 * Array of head items
	 *
	 * @var	 array
	 * @access  private
	 */
	var $_head 		= array();
	
	/**
	 * Body content
	 *
	 * @var	 array
	 * @access  private
	 */
	var $_body		= '';
	
	/**
	 * Document title
	 *
	 * @var	 string
	 * @access  public
	 */
	var $title = '';
	
	/**
	 * Document version
	 *
	 * @var	 string
	 * @access  public
	 */
	var $version = '000000';
	
	/**
	 * Contains the document language setting
	 *
	 * @var	 string
	 * @access  public
	 */
	var $language = 'en-gb';

	/**
	 * Contains the document direction setting
	 *
	 * @var	 string
	 * @access  public
	 */
	var $direction = 'ltr';

	/**
	 * Constructor activating the default information of the class
	 *
	 * @access  protected
	 */
	function __construct($config = array())
	{
		parent::__construct();
		
		// set document title
		if (isset($config['title'])) {
			$this->setTitle($config['title']);
		}

		$this->setProperties($config);
	}
	/**
	 * Returns a reference to a plugin object
	 *
	 * This method must be invoked as:
	 *    <pre>  $advlink =AdvLink::getInstance();</pre>
	 *
	 * @access  public
	 * @return  JCE  The editor object.
	 * @since 1.5
	 */
	function &getInstance($config = array())
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFDocument($config);
		}

		return $instance;
	}
	
	function setTitle($title)
	{
		$this->title = $title;
	}
	
	function getTitle()
	{
		return $this->title;
	}
	
	function setName($name)
	{
		$this->name = $name;
	}
	
	function getName()
	{
		return $this->name;
	}

	function getURL($relative = false)
	{
		if ($relative) {
			return JURI::root(true) . '/components/com_jce/editor';
		}

		return JURI::root() . 'components/com_jce/editor';
	}
	
	/**
	 * Sets the global document language declaration. Default is English (en-gb).
	 *
	 * @access public
	 * @param   string   $lang
	 */
	function setLanguage($lang = "en-gb") {
		$this->language = strtolower($lang);
	}

	/**
	 * Returns the document language.
	 *
	 * @return string
	 * @access public
	 */
	function getLanguage() {
		return $this->language;
	}

	/**
	 * Sets the global document direction declaration. Default is left-to-right (ltr).
	 *
	 * @access public
	 * @param   string   $lang
	 */
	function setDirection($dir = "ltr") {
		$this->direction = strtolower($dir);
	}

	/**
	 * Returns the document language.
	 *
	 * @return string
	 * @access public
	 */
	function getDirection() {
		return $this->direction;
	}

	/**
	 * Returns a JCE resource url
	 *
	 * @access  public
	 * @param string  The path to resolve eg: libaries
	 * @param boolean Create a relative url
	 * @return  full url
	 * @since 1.5
	 */
	function getBaseURL($path, $type = '')
	{
		static $url;

		if (!isset($url)) {
			$url = array();
		}
		
		$signature = serialize(array($type, $path));

		// Check if value is already stored
		if (!isset($url[$signature])) {
			// get the plugin name using this document instance
			$plugin = $this->get('name');

			$base = $this->getURL(true) . '/';
			
			$parts 	= explode('.', $path);
			$path 	= array_shift($parts);

			switch ($path) {
				// JCE root folder
				case 'jce':
					$pre = $base . '';
					break;
					// JCE libraries resource folder
				default:
				case 'libraries':
					$pre = $base . 'libraries/' . $type;
					break;
					// TinyMCE folder
				case 'tiny_mce':
					$pre = $base . 'tiny_mce';
					break;
					// JCE current plugin folder
				case 'plugins':
					$pre = $base . 'tiny_mce/plugins/' . $plugin . '/' . $type;
					break;
					// Extensions folder
				case 'extensions':
					$pre = $base . 'extensions';
					break;
				case 'joomla':
					return JURI::root(true);
					break;
				case 'media':
					return JURI::root(true) . '/media/system';
					break;
				case 'component':
					$pre = JURI::root(true) . '/administrator/components/com_jce/media/' . $type;
					break;
				default:
					$pre = $base . $path;
					break;
			}
			
			if (count($parts)) {
				$pre = rtrim($pre, '/') . '/' . implode('/', $parts);
			}

			// Store url
			$url[$signature] = $pre;
		}
		
		return $url[$signature];
	}

	/**
	 * Convert a url to path
	 *
	 * @access  public
	 * @param string  The url to convert
	 * @return  Full path to file
	 * @since 1.5
	 */
	function urlToPath($url)
	{
		jimport('joomla.filesystem.path');
		$bool = strpos($url, JURI::root()) === false;
		return WFUtility::makePath(JPATH_SITE, JPath::clean(str_replace(JURI::root($bool), '', $url)));
	}

	/**
	 * Returns an image url
	 *
	 * @access  public
	 * @param string  The file to load including path and extension eg: libaries.image.gif
	 * @return  Image url
	 * @since 1.5
	 */
	function image($image, $root = 'libraries')
	{
		$parts = explode('.', $image);
		$parts = preg_replace('#[^A-Z0-9-_]#i', '', $parts);

		$ext  = array_pop($parts);
		$name = trim(array_pop($parts), '/');

		$parts[] = 'img';
		$parts[] = $name . "." . $ext;

		return $this->getBaseURL($root) . implode('/', $parts);
	}

	function removeScript($file, $root = 'libraries')
	{
		$file = $this->buildScriptPath($file, $root);		
		unset($this->_scripts[$file]);
	}
	function removeCss($file, $root = 'libraries')
	{
		$file = $this->buildStylePath($file, $root);		
		unset($this->_styles[$file]);
	}
	
	function buildScriptPath($file, $root)
	{
		$file = preg_replace('#[^A-Z0-9-_\/\.]#i', '', $file);
		// get base dir
        $base = dirname($file);
        // remove extension if present
        $file = basename($file, '.js');
		// strip . and trailing /
		$file = trim(trim($base, '.'), '/') . '/' . $file . '.js';
		// remove leading and trailing slashes
		$file = trim($file, '/');
		// create path
		$file = $this->getBaseURL($root, 'js') . '/' . $file;
		
		return $file;
	}
	
	function buildStylePath($file, $root)
	{
		$file = preg_replace('#[^A-Z0-9-_\/\.]#i', '', $file);
		// get base dir
        $base = dirname($file);
        // remove extension if present
        $file = basename($file, '.css');
		// strip . and trailing /
		$file = trim(trim($base, '.'), '/') . '/' . $file . '.css';
		// remove leading and trailing slashes
		$file = trim($file, '/');
		// create path
		$file = $this->getBaseURL($root, 'css') . '/' . $file;
		
		return $file;
	}
	
	/**
	 * Loads a javascript file
	 *
	 * @access  public
	 * @param string  The file to load including path eg: libaries.manager
	 * @param boolean Debug mode load src file
	 * @return  echo script html
	 * @since 1.5
	 */
	function addScript($files, $root = 'libraries', $type = 'text/javascript')
	{
		$files = (array) $files;

		foreach ($files as $file) {
			// external link
			if (preg_match('#^(http:)?\/\/#i', $file)) {
				$this->_scripts[$file] = $type;
			} else {
				$file = $this->buildScriptPath($file, $root);
				// store path
				$this->_scripts[$file] = $type;
			}
		}
	}
	/**
	 * Loads a css file
	 *
	 * @access  public
	 * @param string The file to load including path eg: libaries.manager
	 * @param string Root folder
	 * @return  echo css html
	 * @since 1.5
	 */
	function addStyleSheet($files, $root = 'libraries', $type = 'text/css')
	{
		$files = (array) $files;

		jimport('joomla.environment.browser');
		$browser = JBrowser::getInstance();

		foreach ($files as $file) {
			$url = $this->buildStylePath($file, $root);
			// store path
            $this->_styles[$url] = $type;

            if ($browser->getBrowser() == 'msie') {
                // All versions
                $file = $file . '_ie.css';
                $path = $this->urlToPath($url);

                if (file_exists(dirname($path) . DS . $file)) {
                	$this->_styles[dirname($url) . '/' . $file] = $type;
                }
        	}
		}
	}

	function addScriptDeclaration($content, $type = 'text/javascript')
	{
		if (!isset($this->_script[strtolower($type)])) {
			$this->_script[strtolower($type)] = $content;
		} else {
			$this->_script[strtolower($type)] .= chr(13) . $content;
		}
	}

	function getScripts()
	{
		return $this->_scripts;
	}

	function getStyleSheets()
	{
		return $this->_styles;
	}

	/**
	 * Setup head data
	 *
	 * @access  public
	 * @since 1.5
	 */
	function setHead($data)
	{
		if (is_array($data)) {
			$this->_head = array_merge($this->_head, $data);
		} else {
			$this->_head[] = $data;
		}
	}

	/**
	 * Render document head data
	 */
	private function getHead()
	{
		$output = '';
		
		$version = $this->get('version', '000000');
		
		$output .= '<title>' . $this->getTitle() . ' : ' . $version . '</title>' . "\n";
		
		$layout 	= JRequest::getWord('layout');
		$item		= JRequest::getWord($layout);
		$standalone	= '';
		$dialog		= '';
		
		if (JRequest::getWord('dialog')) {
			$dialog = '&dialog=' . JRequest::getWord('dialog');
		}
		
		// set standalone mode (for File Browser etc)
		if ($this->get('standalone') == 1) {
			$standalone = '&standalone=1';
		}

		// Render scripts
		$stamp 	= preg_match('/\d+/', $version) ? '?version=' . $version : '';	
		// get token
		$token	= WFToken::getToken();

		if ($this->get('compress_javascript', 0)) {
			$script = JURI::base(true) . '/index.php?option=com_jce&view=editor&layout='.$layout.'&'.$layout.'=' . $item . $dialog . $standalone . '&task=pack&' . $token . '=1';
			$output .= "\t\t<script type=\"text/javascript\" src=\"" . $script . "\"></script>\n";
		} else {
			foreach ($this->_scripts as $src => $type) {
				$output .= "\t\t<script type=\"" . $type . "\" src=\"" . $src . $stamp . "\"></script>\n";
			}
		}

		if ($this->get('compress_css', 0)) {
			$file = JURI::base(true) . '/index.php?option=com_jce&view=editor&layout='.$layout.'&'.$layout.'=' . $item . $dialog . $standalone . '&task=pack&type=css&' . $token . '=1';

			$output .= "\t\t<link href=\"" . $file . "\" rel=\"stylesheet\" type=\"text/css\" />\n";
		} else {			
			foreach ($this->_styles as $k => $v) {
				$output .= "\t\t<link href=\"" . $k . $stamp . "\" rel=\"stylesheet\" type=\"" . $v . "\" />\n";
			}
		}
		
		// Script declarations
		foreach ($this->_script as $type => $content) {
			$output .= "\t\t<script type=\"" . $type . "\">" . $content . "</script>";
		}

		// Other head data
		foreach ($this->_head as $head) {
			$output .= "\t" . $head . "\n";
		}
		
		return $output;
	}
	
	public function setBody($data = '')
	{
		$this->_body = $data;
	}
	
	private function getBody()
	{
		return $this->_body;
	}
	
	private function loadData()
	{
		//get the file content
		ob_start();
		require_once(WF_EDITOR_LIBRARIES .DS. 'views' .DS. 'plugin' .DS. 'index.php');
		$data = ob_get_contents();
		ob_end_clean();
		
		return $data;
	}

	/**
	 * Render the document
	 */
	public function render()
	{		
		// assign language
		$this->language 	= $this->getLanguage();
		$this->direction 	= $this->getDirection();
		
		// load template data
		$output = $this->loadData();			
		$output = $this->parseData($output);
		
		exit($output);
	}
	
	private function parseData($data)
	{
		$data = preg_replace_callback('#<!-- \[head\] -->#', array($this, 'getHead'), $data);
		$data = preg_replace_callback('#<!-- \[body\] -->#', array($this, 'getBody'), $data);
		
		return $data;
	}

	/**
	 * pack function for plugins
	 */
	public function pack($minify = true, $gzip = false)
	{				
		if (JRequest::getCmd('task') == 'pack') {
			
			// check token
			WFToken::checkToken('GET') or die('RESTRICTED');

			wfimport('admin.classes.packer');
			
			$component 	= WFExtensionHelper::getComponent();			
			$params 	= new WFParameter($component->params);

			$type = JRequest::getWord('type', 'javascript');

			// javascript
			$packer = new WFPacker(array(
                'type' => $type
			));

			$files = array();

			switch ($type) {
				case 'javascript':
					foreach ($this->getScripts() as $script => $type) {
						$script .= preg_match('/\.js$/', $script) ? '' : '.js';

						$files[] = $this->urlToPath($script);
					}
					break;
				case 'css':
					foreach ($this->getStyleSheets() as $style => $type) {
						$style .= preg_match('/\.css$/', $style) ? '' : '.css';

						$files[] = $this->urlToPath($style);
					}
					
					break;
			}

			$packer->setFiles($files);
			$packer->pack($minify, $gzip);
		}
	}
}
?>
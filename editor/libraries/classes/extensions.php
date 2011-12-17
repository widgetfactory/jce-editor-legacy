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

class WFExtension extends JObject
{
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access public
	 */
	public function __construct($config = array())
	{
		parent::__construct();
		
		// set extension properties
		$this->setProperties($config);
	}
	 
	/**
	 * Returns a reference to a WFExtension object
	 *
	 * This method must be invoked as:
	 *    <pre>  $extension = WFExtension::getInstance();</pre>
	 *
	 * @access  public
	 * @return  object WFExtension
	 */
	public static function getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFExtension();
		}
		return $instance;
	}
	
	/**
	 * Display the extension
	 * @access $public
	 */
	public function display()
	{
		$document = WFDocument::getInstance();
		// Load Extensions Object
		$document->addScript(array(
            'extensions'
        ));
	}

	/**
	 * Load a plugin extension
	 *
	 * @access  public
	 * @return 	array
	 */
	public static function getExtensions($config)
	{
		jimport('joomla.filesystem.folder');
		jimport('joomla.filesystem.file');

		$extension = $config['extension'];
		$types     = $config['types'];

		if (!isset($config['base_path'])) {
			$config['base_path'] = WF_EDITOR;
		}

		$path = $config['base_path'] . DS . 'extensions';

		$extensions = array();

		if (JFolder::exists($path)) {
			if (empty($types)) {
				$types = JFolder::folders($path);
			}

			foreach ($types as $type) {
				if ($extension) {
					if (JFile::exists($path . DS . $type . DS . $extension . '.xml') && JFile::exists($path . DS . $type . DS . $extension . '.php')) {
						$object            = new stdClass();
						$object->folder    = $type;
						$object->extension = $extension;

						$extensions[] = $object;
					}
				} else {
					$files = JFolder::files($path . DS . $type, '\.xml$', false, true);

					foreach ($files as $file) {
						$object         = new stdClass();
						$object->folder = $type;

						$name = JFile::stripExt(basename($file));
						if (JFile::exists(dirname($file) . DS . $name . '.php')) {
							$object->extension = $name;
						}
						$extensions[] = $object;
					}
				}
			}
		}
		return $extensions;
	}
	
	/**
	 * Load & Call an extension
	 *
	 * @access  public
	 * @param	array $config
	 * @return 	mixed
	 */
	public static function loadExtensions($config = array())
	{
		jimport('joomla.filesystem.folder');
		jimport('joomla.filesystem.file');

		$language = JFactory::getLanguage();

		if (!isset($config['extension'])) {
			$config['extension'] = '';
		}
		if (!isset($config['types']) || empty($config['types'])) {
			$config['types'] = array();
		}
		if (!isset($config['base_path'])) {
			$config['base_path'] = WF_EDITOR;
		}

		// Create extensions path
		$base = $config['base_path'] . DS . 'extensions';

		// Get installed extensions
		$extensions = self::getExtensions($config);

		$result = array();

		if (!empty($extensions)) {
			foreach ($extensions as $extension) {
				$name   = $extension->extension;
				$folder = $extension->folder;

				$path = $base . DS . $folder;
				$root = $path . DS . $name . '.php';

				if (file_exists($root)) {
					// Load root extension file
					require_once($root);

					// Load Extension language file
					$language->load('com_jce_' . $folder . '_' . $name, JPATH_SITE);

					// Return array of extension names
					$result[$folder][] = $name;

					if ($config['extension']) {
						$k = array_search($config['extension'], $result[$folder]);
						if ($k !== false) {
							return $result[$folder][$k];
						}
					}
				}
			}
		}

		// Return array or extension name
		return $result;
	}

	/**
	 * Return a parameter for the current plugin / group
	 * @param 	object $param Parameter name
	 * @param 	object $default Default value
	 * @return 	string Parameter value
	 */
	public function getParam($param, $default = '')
	{
		$wf = WFEditorPlugin::getInstance();

		return $wf->getParam($param, $default);
	}
}
?>
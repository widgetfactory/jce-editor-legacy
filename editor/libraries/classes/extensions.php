<?php
/**
 * @version   $Id: extensions.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('ERROR_403');

class WFExtension extends JObject
{
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access protected
	 */
	function __construct($config = array())
	{
		parent::__construct();
		
		// set extension properties
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
	function &getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFExtension();
		}
		return $instance;
	}
	
	function display()
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
	 * @since 1.5
	 */
	function getExtensions($config)
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
	 * @since 1.5
	 */
	function loadExtensions($config = array())
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
	 * @param object $param Parameter name
	 * @param object $default Default value
	 * @return Parameter value
	 */
	function getParam($param, $default = '')
	{
		$wf = WFEditorPlugin::getInstance();

		return $wf->getParam($param, $default);
	}
}
?>
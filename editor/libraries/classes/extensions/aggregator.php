<?php
/**
 * @version		$Id: aggregator.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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
defined('_JEXEC') or die('ERROR_403');

class WFAggregatorExtension extends WFExtension {
	/*
	 *  @var varchar
	 */
	var $extensions = array();
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access	protected
	 */
	function __construct($config = array())
	{
		parent::__construct($config);
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
	function & getInstance($config = array())
	{
		static $instance;

		if(!is_object($instance)) {
			$instance = new WFAggregatorExtension($config);
		}

		return $instance;
	}

	function getName()
	{
		return $this->get('name');
	}

	function getTitle()
	{
		return $this->get('title');
	}

	function display()
	{
		parent::display();

		$document =WFDocument::getInstance();

		// Load javascript
		$document->addScript( array('extensions/aggregator'), 'libraries');

		$aggregators =$this->getAggregators();

		foreach($aggregators as $aggregator) {
			$aggregator->display();

			$params = $aggregator->getParams();

			if(!empty($params)) {
				$document->addScriptDeclaration('WFExtensions.Aggregator.setParams("' . $aggregator->getName() . '",' . json_encode($params) . ');');
			}
		}
	}

	function & getAggregators()
	{
		static $aggregators;

		if(!isset($aggregators)) {
			$aggregators = array();
		}

		// get the aggregator format for this instance
		$format = $this->get('format');

		if(empty($aggregators[$format])) {
			jimport('joomla.filesystem.folder');

			// get a plugin instance
			$plugin = WFEditorPlugin::getInstance();

			$aggregators[$format] = array();

			$path = WF_EDITOR_EXTENSIONS . DS . 'aggregator';
			$files = JFolder::files($path, '\.php$', false, true);

			foreach($files as $file) {
				require_once ($file);

				$name = basename($file, '.php');
				$classname = 'WFAggregatorExtension_' . ucfirst($name);

				// only load if enabled
				if(class_exists($classname)) {
					$aggregator = new $classname();
					
					// check if enabled
					if ($aggregator->isEnabled()) {
						if($aggregator->get('format') == $format) {
							$aggregator->set('name', $name);
							$aggregator->set('title', 'WF_AGGREGATOR_' . strtoupper($name) . '_TITLE');
							$aggregators[$format][] = $aggregator;
						}
					}
				}
			}
		}

		return $aggregators[$format];
	}

	/**
	 *
	 * @param object $player
	 * @return
	 */
	function loadTemplate($name, $tpl ='')
	{
		$path = WF_EDITOR_EXTENSIONS . DS . 'aggregator' . DS . $name;

		$output = '';

		$file = 'default.php';

		if($tpl) {
			$file = 'default_' . $tpl . '.php';
		}

		if(file_exists($path . DS . 'tmpl' . DS . $file)) {
			ob_start();

			include $path . DS . 'tmpl' . DS . $file;

			$output .= ob_get_contents();
			ob_end_clean();
		}

		return $output;
	}

}

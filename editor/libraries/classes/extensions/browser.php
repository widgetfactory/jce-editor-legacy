<?php
/**
* @version		$Id: browser.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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

wfimport('editor.libraries.classes.extensions');

class WFBrowserExtension extends WFExtension
{
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
	function &getInstance($type, $config = array())
	{
		static $instance;

		if (!is_object($instance)) {
			require_once(WF_EDITOR.DS.'extensions'.DS.'browser'.DS.$type.'.php');
			
			$classname 	= 'WF'.ucfirst($type).'Browser';
			
			if (class_exists($classname)) {
				$instance = new $classname($config);
			} else {
				$instance = new WFBrowserExtension();
			}
		}
		
		return $instance;
	}
	
	function display()
	{
		parent::display();
	}
	
	function getView($layout)
	{		
		$view = new WFView(array(
			'name'		=> 'browser',
			'layout' 	=>	$layout
		));
		
		return $view;
	}
}
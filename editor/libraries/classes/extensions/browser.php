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

wfimport('editor.libraries.classes.extensions');

class WFBrowserExtension extends WFExtension
{
	/*
	*  @var varchar
	*/
	private $extensions = array();
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	public function __construct($config = array())
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
	public static function getInstance($type, $config = array())
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
	
	public function display()
	{
		parent::display();
	}
	
	protected function getView($layout)
	{		
		$view = new WFView(array(
			'name'		=> 'browser',
			'layout' 	=>	$layout
		));
		
		return $view;
	}
}
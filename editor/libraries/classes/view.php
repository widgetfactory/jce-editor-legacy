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

final class WFView extends JObject
{
	private $path = array();
	
	public function __construct ($config = array())
	{
		
		if (!array_key_exists('base_path', $config)) {
			$config['base_path'] = WF_EDITOR_LIBRARIES;
		}

		if (!array_key_exists('layout', $config)) {
			$config['layout'] = 'default';
		}

		if (!array_key_exists('name', $config)) {
			$config['name'] = '';
		}
		
		$this->setProperties($config);
		
		if (array_key_exists('template_path', $config)) {
			$this->addTemplatePath($config['template_path']);
		} else {
			$this->addTemplatePath($this->get('base_path') . DS . 'views' .DS. $this->getName() .DS. 'tmpl');
		}
	}
	
	/**
	* Execute and display a template script.
	*
	* @param string $tpl The name of the template file to parse;
	* automatically searches through the template paths.
	*
	* @throws object An JError object.
	* JView::display()
	* @copyright Copyright Copyright (C) 2005 - 2010 Open Source Matters. All rights reserved.
 	* @license GNU/GPL, see LICENSE.php
	*/
	public function display($tpl = null)
	{
		$result = $this->loadTemplate($tpl);
		
		if (JError::isError($result)) {
			return $result;
		}

		echo $result;
	}
	
	/**
	* Assigns variables to the view script via differing strategies.
	*
	* This method is overloaded; you can assign all the properties of
	* an object, an associative array, or a single value by name.
	*
	* You are not allowed to set variables that begin with an underscore;
	* these are either private properties for JView or private variables
	* within the template script itself.
	*
	* <code>
	* $view = new JView();
	*
	* // assign directly
	* $view->var1 = 'something';
	* $view->var2 = 'else';
	*
	* // assign by name and value
	* $view->assign('var1', 'something');
	* $view->assign('var2', 'else');
	*
	* // assign by assoc-array
	* $ary = array('var1' => 'something', 'var2' => 'else');
	* $view->assign($obj);
	*
	* // assign by object
	* $obj = new stdClass;
	* $obj->var1 = 'something';
	* $obj->var2 = 'else';
	* $view->assign($obj);
	*
	* </code>
	*
	* @access public
	* @return bool True on success, false on failure.
	*
	* JView::assign()
	* @copyright Copyright Copyright (C) 2005 - 2010 Open Source Matters. All rights reserved.
 	* @license GNU/GPL, see LICENSE.php
	*/
	public function assign()
	{
		// get the arguments; there may be 1 or 2.
		$arg0 = @func_get_arg(0);
		$arg1 = @func_get_arg(1);

		// assign by object
		if (is_object($arg0))
		{
			// assign public properties
			foreach (get_object_vars($arg0) as $key => $val)
			{
				if (substr($key, 0, 1) != '_') {
					$this->$key = $val;
				}
			}
			return true;
		}

		// assign by associative array
		if (is_array($arg0))
		{
			foreach ($arg0 as $key => $val)
			{
				if (substr($key, 0, 1) != '_') {
					$this->$key = $val;
				}
			}
			return true;
		}

		// assign by string name and mixed value.

		// we use array_key_exists() instead of isset() becuase isset()
		// fails if the value is set to null.
		if (is_string($arg0) && substr($arg0, 0, 1) != '_' && func_num_args() > 1)
		{
			$this->$arg0 = $arg1;
			return true;
		}

		// $arg0 was not object, array, or string.
		return false;
	}


	/**
	* Assign variable for the view (by reference).
	*
	* You are not allowed to set variables that begin with an underscore;
	* these are either private properties for JView or private variables
	* within the template script itself.
	*
	* <code>
	* $view = new JView();
	*
	* // assign by name and value
	* $view->assignRef('var1', $ref);
	*
	* // assign directly
	* $view->ref = $var1;
	* </code>
	*
	* @access public
	*
	* @param string $key The name for the reference in the view.
	* @param mixed &$val The referenced variable.
	*
	* @return bool True on success, false on failure.
	*
	* JView::assignRef()
	* @copyright Copyright Copyright (C) 2005 - 2010 Open Source Matters. All rights reserved.
 	* @license GNU/GPL, see LICENSE.php
	*/

	public function assignRef($key, &$val)
	{
		if (is_string($key) && substr($key, 0, 1) != '_')
		{
			$this->$key = $val;
			return true;
		}

		return false;
	}
	
	public function getName()
	{
		return $this->get('name');
	}
	
	public function setLayout($layout)
	{
		$this->set('layout', $layout);
	}
	
	public function getLayout()
	{
		return $this->get('layout');
	}
	
	public function addTemplatePath($path)
	{
		$this->path[] = $path;
	}
	
	public function getTemplatePath()
	{
		return $this->path;
	}
	
	/**
	 * Load a template file
	 *
	 * @access	public
	 * @param string $tpl The name of the template source file ...
	 * automatically searches the template paths and compiles as needed.
	 * @return string The output of the the template script.
	 *
	 * JView::loadTemplate()
	 * @copyright Copyright Copyright (C) 2005 - 2010 Open Source Matters. All rights reserved.
 	 * @license GNU/GPL, see LICENSE.php
	 */
	public function loadTemplate($tpl = null)
	{
		// clear prior output
		$output 	= null;	
		$template 	= null;

		//create the template file name based on the layout
		$file = isset($tpl) ? $this->getLayout() .'_' . $tpl : $this->getLayout();
		
		// clean the file name
		$file = preg_replace('/[^A-Z0-9_\.-]/i', '', $file);
		$tpl  = preg_replace('/[^A-Z0-9_\.-]/i', '', $tpl);

		// load the template script
		jimport('joomla.filesystem.path');
		
		$template = JPath::find($this->getTemplatePath(), $file . '.php');
				
		if ($template != false)
		{
			// unset so as not to introduce into template scope
			unset($tpl);
			unset($file);

			// never allow a 'this' property
			if (isset($this->this)) {
				unset($this->this);
			}

			// start capturing output into a buffer
			ob_start();
			// include the requested template filename in the local scope
			// (this will execute the view logic).
			include $template;

			// done with the requested template; get the buffer and
			// clear it.
			$output = ob_get_contents();
			ob_end_clean();

			return $output;
		} else {	
			return JError::raiseError( 500, 'Layout "' . $file . '" not found' );
		}
	}
}
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

final class WFRequest extends JObject
{
	var $request = array();
	
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access  public
	 */
	public function __construct()
	{
		parent::__construct();
	}
	/**
	 * Returns a reference to a WFRequest object
	 *
	 * This method must be invoked as:
	 *    <pre>  $request = WFRequest::getInstance();</pre>
	 *
	 * @access  public
	 * @return  object WFRequest
	 */
	public static function getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFRequest();
		}

		return $instance;
	}

	/**
	 * Set Request function
	 *
	 * @access 	public
	 * @param 	array	$function An array containing the function and object
	 */
	public function setRequest($function)
	{
		$object = new StdClass();
		
		if (is_array($function)) {
			$name 	= $function[1];
			$ref 	= $function[0];

			$object->fn 	= $name;
			$object->ref 	= $ref;
			
			$this->request[$name] = $object;
		} else {
			$object->fn = $function;			
			$this->request[$function] = $object;
		}
	}
	
	/**
	 * Get a request function
	 * @access 	public
	 * @param 	string $function
	 */
	public function getRequest($function) {
		return $this->request[$function];
	}

	/**
	 * Check a request query for bad stuff
	 * @access 	private
	 * @param 	array $query
	 */
	private function checkQuery($query)
	{
		if (is_string($query)) {
			$query = array($query);
		}

		// check for null byte
		foreach ($query as $key => $value) {
			if (is_array($value) || is_object($value)) {
				return self::checkQuery($value);
			}
			
			if (is_array($key)) {
				return self::checkQuery($key);
			}
			
			if (strpos($key, '\u0000') !== false || strpos($value, '\u0000') !== false) {
				JError::raiseError(403, 'RESTRICTED');
			}
		}
	}

	/**
	 * Process an ajax call and return result
	 *
	 * @access public
	 * @return string
	 */
	public function process($array = false)
	{
		// Check for request forgeries
		WFToken::checkToken() or die('RESTRICTED ACCESS');	
			
		$json   = JRequest::getVar('json', '', 'POST', 'STRING', 2);
		$action = JRequest::getWord('action');

		if ($action || $json) {			
			$output = array(
                "result" 	=> null,
				"text"		=> null,
				"error"		=> null
			);
				
			JError::setErrorHandling(E_ALL, 'callback', array('WFError', 'raiseError'));

			if ($json) {
				$json 	= json_decode($json);
				$fn   	= isset($json->fn) ? $json->fn : JError::raiseError(500, 'NO FUNCTION CALL');
				$args 	= isset($json->args) ? $json->args : array();
			} else {
				$fn 	= $action;
				$args 	= array();
			}

			// check query
			$this->checkQuery($args);
				
			// call function
			if (array_key_exists($fn, $this->request)) {				
				$method = $this->request[$fn];
				
				// set default function call
				$call = null;

				if (!isset($method->ref)) {
					$call = $method->fn;
					if (!function_exists($call)) {
						JError::raiseError(500, 'FUNCTION "'. $call . '" DOES NOT EXIST');
					}
				} else {
					if (!method_exists($method->ref, $method->fn)) {
						JError::raiseError(500, 'METHOD "'. $method->ref . '::' . $method->fn . '" DOES NOT EXIST');
					}	
					$call = array($method->ref, $method->fn);
				}
				
				if (!$call) {
					JError::raiseError(500, 'NO FUNCTION CALL');
				}
				
				if (!is_array($args)) {
					$result = call_user_func($call, $args);
				} else {
					$result = call_user_func_array($call, $args);
				}
				
			} else {
				if ($fn) {
					JError::raiseError(500, 'FUNCTION "'. addslashes($fn) . '" NOT REGISTERED');
				} else {
					JError::raiseError(500, 'NO FUNCTION CALL');
				}
			}
				
			$output = array(
               "result" => $result
			);
				
			// set output headers
			header('Content-Type: text/json;charset=UTF-8');
			header('Content-Encoding: UTF-8');
			header("Expires: Mon, 4 April 1984 05:00:00 GMT");
			header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
			header("Cache-Control: no-store, no-cache, must-revalidate");
			header("Cache-Control: post-check=0, pre-check=0", false);
			header("Pragma: no-cache");

			exit(json_encode($output));
		}
	}
}
?>
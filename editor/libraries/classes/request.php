<?php
/**
 * @version   $Id: request.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE Advlink
 * @copyright    Copyright (C) 2008 - 2009 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('ERROR_403');

class WFRequest extends JObject
{
	var $request = array();
	
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access  protected
	 */
	function __construct()
	{
		parent::__construct();
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
			$instance = new WFRequest();
		}

		return $instance;
	}

	/**
	 * Setup an Request function
	 *
	 * @access public
	 * @param array   An array containing the function and object
	 */
	function setRequest($function)
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
	
	function getRequest($function) {
		return $this->request[$function];
	}

	function checkQuery($query)
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
	function process($array = false)
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
				
			JError::setErrorHandling(E_ALL, 'callback', array('WFUtility', 'raiseError'));

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
			header('Content-Type: text/json');
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
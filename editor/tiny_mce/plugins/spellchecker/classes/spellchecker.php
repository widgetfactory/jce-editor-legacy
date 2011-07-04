<?php
/**
* @version		$Id: spellchecker.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
require_once(WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'plugin.php');

class WFSpellCheckerPlugin extends WFEditorPlugin 
{
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	function __construct()
	{
		parent::__construct();
		
		$config = $this->getConfig();		
		$engine = $this->getEngine();
		
		if (isset($config['general.remote_rpc_url'])) {
			$this->remoteRPC();
		}
		
		$request = WFRequest::getInstance();
		
		// Setup plugin XHR callback functions 
		$request->setRequest(array($engine, 'checkWords'));
		$request->setRequest(array($engine, 'getSuggestions'));
		$request->setRequest(array($engine, 'ignoreWord'));
		$request->setRequest(array($engine, 'ignoreWords'));
		$request->setRequest(array($engine, 'learnWord'));
		
		$this->execute();
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
	function &getInstance()
	{
		static $instance;

		if (!is_object($instance)) {
			$instance = new WFSpellCheckerPlugin();
		}
		return $instance;
	}
	
	function getConfig()
	{
		static $config;
		
		if (!is_array($config)) {
			$params = $this->getParams();
		
			$config = array(
				'general.engine' 		=> $params->get( 'spellchecker.engine', 'googlespell' ),
				// PSpell settings
				'PSpell.mode'			=> $params->get( 'spellchecker.pspell_mode', 'PSPELL_FAST' ),
				'PSpell.spelling'		=> $params->get( 'spellchecker.pspell_spelling', '' ),
				'PSpell.jargon'			=> $params->get( 'spellchecker.pspell_jargon', '' ),
				'PSpell.encoding'		=> $params->get( 'spellchecker.pspell_encoding', '' ),
				'PSpell.dictionary'		=> JPATH_BASE .DS. $params->get( 'spellchecker.pspell_dictionary', '' ),	
				// PSpellShell settings
				'PSpellShell.mode' 		=> $params->get( 'spellchecker.pspellshell_mode', 'PSPELL_FAST' ),
				'PSpellShell.aspell' 	=> $params->get( 'spellchecker.pspellshell_aspell', '/usr/bin/aspell' ),
				'PSpellShell.tmp' 		=> $params->get( 'spellchecker.pspellshell_tmp', '/tmp' )
			);
		}

		return $config;
	}
	
	function &getEngine()
	{
		static $engine;
		
		$config = $this->getConfig();	

		if (!is_object($engine)) {
			$classname = $config['general.engine'];
			require_once( dirname(__FILE__) .DS. $classname . ".php");
			$engine = new $classname($config);
		}

		return $engine;
	}
	
	private function remoteRPC()
	{
		$config = $this->getConfig();
		
		$url = parse_url($config['general.remote_rpc_url']);

		// Setup request
		$req = "POST " . $url["path"] . " HTTP/1.0\r\n";
		$req .= "Connection: close\r\n";
		$req .= "Host: " . $url['host'] . "\r\n";
		$req .= "Content-Length: " . strlen($raw) . "\r\n";
		$req .= "\r\n" . $raw;
	
		if (!isset($url['port']) || !$url['port'])
			$url['port'] = 80;
	
		$errno = $errstr = "";
	
		$socket = fsockopen($url['host'], intval($url['port']), $errno, $errstr, 30);
		if ($socket) {
			// Send request headers
			fputs($socket, $req);
	
			// Read response headers and data
			$resp = "";
			while (!feof($socket))
					$resp .= fgets($socket, 4096);
	
			fclose($socket);
	
			// Split response header/data
			$resp = explode("\r\n\r\n", $resp);
			echo $resp[1]; // Output body
		}
	
		die();
	}
}
/**
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */
class SpellChecker {
	/**
	 * Constructor.
	 *
	 * @param $config Configuration name/value array.
	 */
	function SpellChecker(&$config) {
		$this->_config = $config;
	}

	/**
	 * Simple loopback function everything that gets in will be send back.
	 *
	 * @param $args.. Arguments.
	 * @return {Array} Array of all input arguments. 
	 */
	function &loopback(/* args.. */) {
		return func_get_args();
	}

	/**
	 * Spellchecks an array of words.
	 *
	 * @param {String} $lang Language code like sv or en.
	 * @param {Array} $words Array of words to spellcheck.
	 * @return {Array} Array of misspelled words.
	 */
	function &checkWords($lang, $words) {
		return $words;
	}

	/**
	 * Returns suggestions of for a specific word.
	 *
	 * @param {String} $lang Language code like sv or en.
	 * @param {String} $word Specific word to get suggestions for.
	 * @return {Array} Array of suggestions for the specified word.
	 */
	function &getSuggestions($lang, $word) {
		return array();
	}

	/**
	 * Throws an error message back to the user. This will stop all execution.
	 *
	 * @param {String} $str Message to send back to user.
	 */
	function throwError($str) {
		die('{"result":null,"id":null,"error":{"errstr":"' . addslashes($str) . '","errfile":"","errline":null,"errcontext":"","level":"FATAL"}}');
	}
}

?>

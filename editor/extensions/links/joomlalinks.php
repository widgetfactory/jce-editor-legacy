<?php
/**
* @version		$Id: joomlalinks.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE Advlink
* @copyright    Copyright (C) 2008 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined( '_WF_EXT' ) or die( 'ERROR_403' );

class WFLinkBrowser_Joomlalinks extends JObject {
	
	var $_option 	= array();
	
	var $_adapters 	= array();
	
	/**
	* Constructor activating the default information of the class
	*
	* @access	protected
	*/
	function __construct($options = array()){
		jimport('joomla.filesystem.folder');
		jimport('joomla.filesystem.file');
				
		$path = dirname( __FILE__ ) .DS. 'joomlalinks';
		
		// Get all files
		$files = JFolder::files( $path, '\.(php)$' );
		
		if ( !empty( $files ) ) {
			foreach( $files as $file ) {
				require_once( $path .DS. $file );
				$classname = 'Joomlalinks' . ucfirst(basename($file, '.php'));
				$this->_adapters[] = new $classname;
			}
		}
	}
	
	/**
	 * Returns a reference to a editor object
	 *
	 * This method must be invoked as:
	 * 		<pre>  $browser =JContentEditor::getInstance();</pre>
	 *
	 * @access	public
	 * @return	JCE  The editor object.
	 * @since	1.5
	 */
	function &getInstance(){
		static $instance;

		if ( !is_object( $instance ) ){
			$instance = new WFLinkBrowser_Joomlalinks();
		}
		return $instance;
	}
	
	function display()
	{
		// Load css
		$document = WFDocument::getInstance();
		$document->addStyleSheet(array('joomlalinks'), 'extensions/links/joomlalinks/css');
	}
	
	function isEnabled() 
	{
		$wf = WFEditorPlugin::getInstance();
		return $wf->checkAccess($wf->getName() . '.links.joomlalinks.enable', 1);
	}
	
	function getOption()
	{
		foreach( $this->_adapters as $adapter ){
			$this->_option[]= $adapter->getOption();
		}
		return $this->_option;
	}
	
	function getList()
	{
		$list = '';
		
		foreach( $this->_adapters as $adapter ){
			$list .= $adapter->getList();
		}
		return $list;	
	}
	
	function getLinks( $args )
	{
		foreach( $this->_adapters as $adapter ){
			if( $adapter->getOption() == $args->option ){
				return $adapter->getLinks( $args );
			}
		}
	}
}	
?>
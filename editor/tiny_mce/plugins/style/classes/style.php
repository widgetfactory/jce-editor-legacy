<?php
/**
* @package JCE Styles
* @copyright Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
* @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see licence.txt
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined( '_JEXEC' ) or die('ERROR_403');

require_once( WF_EDITOR_LIBRARIES .DS. 'classes' .DS. 'plugin.php' );


class WFStylePlugin extends WFEditorPlugin 
{
	
	function __construct() {	
		parent::__construct();
	}
	
	/**
	 * Returns a reference to a manager object
	 *
	 * This method must be invoked as:
	 * 		<pre>  $manager =FileManager::getInstance();</pre>
	 *
	 * @access	public
	 * @return	FileManager  The manager object.
	 * @since	1.5
	 */
	function &getInstance(){
		static $instance;

		if ( !is_object( $instance ) ){
			$instance = new WFStylePlugin();
		}
		return $instance;
	}
  
  /**
   * Display the plugin
   */
  function display()
  {
    parent::display();

    $document = WFDocument::getInstance();
    
    $document->addScript(array('style'), 'plugins');
    $document->addStyleSheet(array('style'), 'plugins');
    
    $settings = $this->getSettings();
    
    $document->addScriptDeclaration('StyleDialog.settings='.json_encode($settings).';');
    
    $tabs = WFTabs::getInstance(array(
    	'base_path' => WF_EDITOR_PLUGIN
    )); 
    
    // Add tabs
    $tabs->addTab('text');
    $tabs->addTab('background');
    $tabs->addTab('block');
    $tabs->addTab('box');
    $tabs->addTab('border');
    $tabs->addTab('list');
    $tabs->addTab('positioning');
  }
	
	function getSettings()
	{
		$profile = $this->getProfile();		
			
		$settings = array(
			'file_browser' 	=> $this->getParam('file_browser', 1) && in_array('browser', explode(',', $profile->plugins)),
		);
		
		return parent::getSettings($settings);
	}
}
?>

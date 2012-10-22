<?php
/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2012 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined('_JEXEC') or die('RESTRICTED');
require_once (WF_EDITOR_LIBRARIES . '/classes/plugin.php');

class WFXHTMLXtrasPlugin extends WFEditorPlugin {
	function __construct()
	{
		parent::__construct();
	}

	public function getElementName()
	{
		return JRequest::getWord('element', 'attributes');
	}
        
        public function isHTML5()
        {
            $wf = WFEditor::getInstance();
            
            return $wf->getParam('editor.schema', 'html4') == 'html5' && (bool)$wf->getParam('editor.verify_html', 0) === true;
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
	function & getInstance()
	{
		static $instance;
		if(!is_object($instance)) {
			$instance = new WFXHTMLXtrasPlugin();
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
		
		$document->setTitle(WFText::_('WF_' . strtoupper($this->getElementName()) . '_TITLE'));
		
		$document->addScript( array('xhtmlxtras'), 'plugins');
		$document->addStyleSheet( array('xhtmlxtras'), 'plugins');

		$document->addScriptDeclaration('XHTMLXtrasDialog.settings=' . json_encode($this->getSettings()) . ';');
		$tabs = WFTabs::getInstance( array('base_path' => WF_EDITOR_PLUGIN));
		
		$tabs->addTab('standard');
		
		if($this->getElementName() == 'attributes') {
			$tabs->addTab('events');
		}
	}

	function getSettings()
	{
		return parent::getSettings();
	}

}
?>

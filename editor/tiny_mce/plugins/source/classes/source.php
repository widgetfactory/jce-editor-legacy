<?php
/**
 * @package      	JCE
 * @copyright    	@@copyright@@
 * @author			Ryan Demmer
 * @license      	@@licence@@
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
require_once (WF_EDITOR_LIBRARIES . DS . 'classes' . DS . 'plugin.php');

class WFSourcePlugin extends WFEditorPlugin {
	/**
	 * Constructor activating the default information of the class
	 *
	 * @access	protected
	 */
	function __construct()
	{
		parent::__construct();
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
	function & getInstance()
	{
		static $instance;

		if(!is_object($instance)) {
			$instance = new WFSourcePlugin();
		}
		return $instance;
	}
	
	function display()
	{
		$document = WFDocument::getInstance();	
			
		$view = $this->getView();

		$view->addTemplatePath(WF_EDITOR_PLUGIN .DS. 'tmpl');
			
		$document->setTitle(WFText::_('WF_' . strtoupper($this->getName() . '_TITLE')));		
		
		$theme 	= JRequest::getWord('theme', 'textmate');

		$document->addScript(array('codemirror-compressed'), 'jce.tiny_mce.plugins.source.js.codemirror');
		$document->addScript(array('editor'), 'plugins');
		
		$document->addStyleSheet(array('codemirror', 'theme/' . $theme), 'jce.tiny_mce.plugins.source.css.codemirror');
		$document->addStyleSheet(array('editor'), 'plugins');				
	}
}

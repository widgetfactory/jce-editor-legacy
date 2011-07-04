<?php
/**
 * @version   $Id: popups.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2011 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('Restricted access');

class WFPopupsExtension extends WFExtension
{
    /*
     *  @var varchar
     */
    var $_popups 	= array();
    
    var $_templates = array();
    
    /**
     * Constructor activating the default information of the class
     *
     * @access  protected
     */
    function __construct($config = array())
    {
        parent::__construct($config);
        
        $this->setProperties($config);
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
    function &getInstance($config = array())
    {
        static $instance;
        
        if (!is_object($instance)) {
            $instance = new WFPopupsExtension($config);
        }
        
        return $instance;
    }
    
    function display()
    {    	
    	parent::display();
    	
    	$document = WFDocument::getInstance();
        
        // Load javascript        
        $document->addScript(array(
            'popups'
        ), 'libraries.extensions');
        
        $popups = parent::loadExtensions(array(
            'types' => array(
                'popups'
            )
        ));
        
		$config = $this->getProperties();
		
        if ($config) {
            // Create global config
            $document->addScriptDeclaration('WFExtensions.Popups.setConfig(' . json_encode($config) . ');');
        }
        
        // Create an instance of each popup and check if enabled
        foreach ($popups['popups'] as $name) {
            $popup = $this->getPopupExtension($name);
            
            if ($popup->isEnabled()) {
                $this->addPopup($name);
                
                $params = $popup->getParams();
                
                if (!empty($params)) {
                    $document->addScriptDeclaration('WFExtensions.Popups.setParams("' . $name . '",' . json_encode($params) . ');');
                }
            }
        }
        
        $tabs = WFTabs::getInstance();
        
        // Add popup tab and assign popups reference to document
        if (count($this->getPopups())) {
            $tabs->addTab('popups', 1);
        }
    }

	function getPopups()
	{
		return $this->_popups;
	}

	function addPopup($popup)
	{
		$this->_popups[] = $popup;
	}
	
	function getTemplates()
	{
		return $this->_templates;
	}
    
    function addTemplate($template)
    {
        $this->_templates[] = $template;
    }
    
    function &getPopupExtension($name)
    {
        static $popups;
        
        if (!isset($popups)) {
            $popups = array();
        }
        
        if (empty($popups[$name])) {
            $classname = 'WFPopupsExtension_' . ucfirst($name);
			
            $popups[$name] = new $classname();
        }
        
        return $popups[$name];
    }
    
    function getPopupList()
    {
        $options = array();
        
        $options[] = JHTML::_('select.option', '', '-- ' . WFText::_('WF_POPUP_TYPE_SELECT') . ' --');
        
        foreach ($this->getPopups() as $popup) {
            $options[] = JHTML::_('select.option', $popup, WFText::_('WF_POPUPS_' . strtoupper($popup) . '_TITLE'));
        }
        
        return JHTML::_('select.genericlist', $options, 'popup_list', 'class="inputbox levels" size="1" onchange="WFExtensions.Popups.selectPopup(this.value);"', 'value', 'text');
    }
    
    function getPopupTemplates()
    {
        $output = '';
        
        $path = WF_EDITOR_EXTENSIONS . DS . 'popups';
        
        $file = 'default.php';
        
        foreach ($this->getTemplates() as $template) {
        	$wf 	= WFEditorPlugin::getInstance();
			$view 	= $wf->getView();
			
			$output .= $view->loadTemplate($template);
        }
        
        foreach ($this->getPopups() as $popup) {
            $view = new WFView(array(
				'name' 			=> $popup,
				'base_path'		=> WF_EDITOR_EXTENSIONS . DS . 'popups' .DS. $popup,				
				'template_path' => WF_EDITOR_EXTENSIONS . DS . 'popups' .DS. $popup . DS . 'tmpl'
			));	
			
			$instance = $this->getPopupExtension($popup);
			$view->assign('popup', $instance);
					
            if (file_exists($path . DS . $popup . DS . 'tmpl' . DS . $file)) {
                ob_start();
                
                $output .= '<div id="popup_extension_' . $popup . '" style="display:none;">';

                $view->display();

                $output .= ob_get_contents();
                $output .= '</div>';
                ob_end_clean();
            }
        }
        
        return $output;
    }
}
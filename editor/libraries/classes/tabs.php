<?php
/**
 * @version   $Id: tabs.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
// no direct access
defined('_JEXEC') or die('ERROR_403');

class WFTabs extends JObject
{
	var $_tabs 		= array();
	var $_panels 	= array();
	var $_paths		= array();

	/**
	 * Constructor activating the default information of the class
	 *
	 * @access  protected
	 */
	function __construct($config = array())
	{	
		if (!array_key_exists('base_path', $config)) {
			$config['base_path'] = WF_EDITOR_LIBRARIES;
		}
		
		$this->setProperties($config);
		
		if (array_key_exists('template_path', $config)) {
			$this->addTemplatePath($config['template_path']);
		} else {
			$this->addTemplatePath($this->get('base_path') . DS . 'tmpl');
		}
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
			$instance = new WFTabs($config);
		}

		return $instance;
	}
	
	function addTemplatePath($path)
	{
		$this->_paths[] = $path;
	}

	/**
	 * Load a panel view
	 * @param object $layout Layout (panel) name
	 * @return panel JView object
	 */
	function loadPanel($panel, $state)
	{		
		$view = new WFView(array(
            'name' 		=> $panel,
			'layout'	=> $panel
		));
		
		// add tab paths
		foreach ($this->_paths as $path) {
			$view->addTemplatePath($path);
		}

		// assign panel state to view
		$view->assign('state', (int) $state);

		return $view;
	}

	/**
	 * Add a tab to the document. A panel is automatically created and assigned
	 * @param object $tab Tab name
	 */
	function addTab($tab, $state = 1)
	{
		if (!array_key_exists($tab, $this->_tabs)) {
			if ($state) {
				$this->_tabs[$tab] = $tab;
			}

			$this->addPanel($tab, $state);
		}
	}

	/**
	 * Add a panel to the document
	 * @param object $panel Panel name
	 */
	function addPanel($panel, $state = 1)
	{
		if (!array_key_exists($panel, $this->_panels)) {
			$this->_panels[$panel] = $this->loadPanel($panel, $state);
		}
	}

	/**
	 * Remove a tab from the document
	 * @param object $tab Tab name
	 */
	function removeTab($tab)
	{
		if (array_key_exists($tab, $this->_tabs)) {
			unset($this->_tabs[$tab]);
		}
	}
	
	/**
	 * Render the document tabs and panels
	 */
	function render()
	{		
		$output = '';
		
		// add tabs
		if (!empty($this->_tabs)) {
			$output .= '<div id="tabs" class="ui-tabs ui-widget ui-widget-content ui-corner-all">';
			$output .= '<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">' . "\n";

			$class = "ui-state-default ui-corner-top";
			
			$x = 0;
			
			foreach ($this->_tabs as $tab) {
				if (!$x) {
					$class .= " ui-tabs-selected ui-state-active";
				}
				
				$output .= "\t" . '<li class="' . $class . '"><a href="#' . $tab . '_tab">' . WFText::_('WF_TAB_' . strtoupper($tab)) . '</a></li>' . "\n";
				$x++;
			}

			$output .= "</ul>\n";
		}
		// add panels
		if (!empty($this->_panels)) {
			$x = 0;
			
			foreach ($this->_panels as $key => $panel) {
				$state = $panel->state ? '' : ' style="display:none;"';
				if (!empty($this->_tabs)) {
					$class = "ui-tabs-panel ui-widget-content ui-corner-bottom"; 
					
					if ($x) {
						$class .= " ui-tabs-hide";
					}
					
					$output .= '<div id="' . $key . '_tab"' . $state . ' class="' . $class . '">';
						$output .= $panel->loadTemplate();
					$output .= '</div>';
				} else {
					$output .= '<div id="' . $key . '"' . $state . '>';
						$output .= $panel->loadTemplate();
					$output .= '</div>';
				}
				$x++;
			}
		}
		// add closing div
		if (!empty($this->_tabs)) {
			$output .= "</div>\n";
		}
		
		echo $output;
	}
}
?>
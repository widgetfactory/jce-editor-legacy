<?php
/**
 * @package      JCE Media Player
 * @copyright   Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @author    Ryan Demmer
 * @license     http://www.gnu.org/copyleft/gpl.html GNU/GPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

// no direct access
defined('_JEXEC') or die('RESTRICTED');

wfimport('editor.libraries.classes.extensions');

class WFMediaPlayerExtension extends WFExtension
{
    /**
     * @access  protected
     */
    function __construct($config = array())
    {
        $default = array(
        	'name'		=> '',
			'title' 	=> '',
        	'params'	=> array()
        );
        
        $config = array_merge($default, $config);
        
        parent::__construct($config);
    }
    
    /**
     * Returns a reference to a manager object
     *
     * This method must be invoked as:
     *    <pre>  $manager =MediaManager::getInstance();</pre>
     *
     * @access  public
     * @return  MediaManager  The manager object.
     * @since 1.5
     */
	function &getInstance($name = 'jceplayer')
    {
        static $instance;
        
        if (!is_object($instance)) {
        	$classname = '';
				
        	if ($name && $name != 'none') {
        		$player = parent::loadExtensions(array(
		            'types' => array(
		                'mediaplayer'
		            ),
		            'extension' => $name
		        ));
		        
		        $classname = 'WFMediaPlayerExtension_' . ucfirst($player);
        	}

	        if ($classname && class_exists($classname)) {
            	$instance = new $classname();
	        } else {
	        	$instance = new WFMediaPlayerExtension();
	        }
        }
        
        return $instance;
    }
    
    function display()
    {
    	parent::display();
    	
    	$document = WFDocument::getInstance();
        
        // Load javascript    
        $document->addScript(array(
            'extensions/mediaplayer'
        ), 'libraries');
        
        if ($this->isEnabled() && $this->get('name')) {
        	$document->addScript(array(
            	'mediaplayer/' . $this->get('name') . '/js/' . $this->get('name')
        	), 'extensions');
        	
        	$document->addStyleSheet(array(
            	'mediaplayer/' . $this->get('name') . '/css/' . $this->get('name')
        	), 'extensions');
				
			$document->addScriptDeclaration('WFExtensions.MediaPlayer.init(' . json_encode($this->getProperties()) . ')');	
        }
    }
	
	function isEnabled()
	{
		return false;
	}
    
    function getName()
    {
    	return $this->get('name');
    }
    
	function getTitle()
    {
    	return $this->get('title');
    }
    
    function getParams()
    {
    	return $this->params;
    }
    
    function getParam($param, $default = '')
    {
    	$params = $this->getParams();
    	
    	return isset($params[$param]) ? $params[$param] : $default;
    }
    
    /**
     * 
     * @param object $player
     * @return 
     */
    function loadTemplate($tpl = '')
    {
        $output = '';
		
		if ($this->isEnabled()) {
			$path = WF_EDITOR_EXTENSIONS . DS . 'mediaplayer' . DS . $this->get('name');
        
	        $file = 'default.php';
	        
	        if ($tpl) {
	            $file = 'default_' . $tpl . '.php';
	        }
	        
	        if (file_exists($path . DS . 'tmpl' . DS . $file)) {
	            ob_start();
	            
	            include $path . DS . 'tmpl' . DS . $file;
	            
	            $output .= ob_get_contents();
	            ob_end_clean();
	        }
		}

        return $output;
    }
}
?>
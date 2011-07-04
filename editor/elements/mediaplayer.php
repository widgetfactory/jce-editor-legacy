<?php
/**
 * @version   $Id: mediaplayer.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package   JCE
 * @copyright Copyright (C) 2005 - 2008 Open Source Matters. All rights reserved.
 * * @copyright Copyright (C) 2009 Ryan Demmer. All rights reserved.
 * @license   GNU/GPL
 * This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

// Check to ensure this file is within the rest of the framework
defined('JPATH_BASE') or die();

/**
 * Renders a select element
 */

class JElementMediaplayer extends JElement
{
    /**
     * Element type
     *
     * @access  protected
     * @var   string
     */
    var $_name = 'Mediaplayer';
    
    function fetchElement($name, $value, &$node, $control_name)
    {
        jimport('joomla.filesystem.folder');
        
        // path to images directory
        $path  = WF_EDITOR . DS . 'extensions' . DS . 'mediaplayer';
        $files = JFolder::files($path, '\.xml', false, true);
        
        $language = JFactory::getLanguage();
        
        // create unique id
        $id = preg_replace('#([^a-z0-9_-]+)#i', '', $control_name . 'mediaplayer' . $name);
        
    	// add javascript if element has parameters
		if ($node->attributes('parameters')) {
			$document = JFactory::getDocument();
			$document->addScriptDeclaration('$jce.Parameter.add("#' . $id . '", "mediaplayer");');
		}
        
        $options 	= array();
		
		$options[] = JHTML::_('select.option', 'none', WFText::_('WF_OPTION_NONE'));
        
    	if ( is_array($files) )
		{
			foreach ($files as $file)
			{
				// load language file
				$language->load('com_jce_'. $name . '_' . basename($file, '.xml'), JPATH_SITE);
				$xml 		= JApplicationHelper::parseXMLInstallFile($file);
				$options[] 	= JHTML::_('select.option', basename($file, '.xml'), WFText::_($xml['name']));
			}
		}
        
        return JHTML::_('select.genericlist',  $options, ''.$control_name.'[mediaplayer][' . $name . ']', 'class="inputbox"', 'value', 'text', $value, $id);
    }
}
?>

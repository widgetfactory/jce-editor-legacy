<?php
/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined('JPATH_BASE') or die('RESTRICTED');

/**
 * Renders a select element
 */

class JElementFilesystem extends JElement
{
    /**
     * Element type
     *
     * @access	protected
     * @var		string
     */
    var $_name = 'Filesystem';
    
	public function fetchElement($name, $value, &$node, $control_name)
	{
		jimport( 'joomla.filesystem.folder' );
		jimport( 'joomla.filesystem.file' );
		
		$language = JFactory::getLanguage();
		
		// create a unique id
		$id = preg_replace('#([^a-z0-9_-]+)#i', '', $control_name . 'filesystem' . $name);
		
		// add javascript if element has parameters
		if ($node->attributes('parameters')) {		
			$document = JFactory::getDocument();
			$document->addScriptDeclaration('$jce.Parameter.add("#' . $id . '", "filesystem");');
		}

		// path to directory
		$path		= WF_EDITOR_EXTENSIONS.DS.'filesystem';
		
		$filter		= '\.xml$';
		$files		= JFolder::files($path, $filter, false, true);

		$options = array ();
		
		if (!$node->attributes('exclude_default')) {
			$options[] = JHTML::_('select.option', '', WFText::_('WF_OPTION_NOT_SET'));
		}
		
		if ( is_array($files) )
		{
			foreach ($files as $file)
			{
				// load language file
				$language->load('com_jce_filesystem_' . basename($file, '.xml'), JPATH_SITE);
				$xml 		= JApplicationHelper::parseXMLInstallFile($file);
				$options[] 	= JHTML::_('select.option', basename($file, '.xml'), WFText::_($xml['name']));
			}
		}

		return JHTML::_('select.genericlist',  $options, ''.$control_name.'[filesystem][' . $name . ']', 'class="inputbox"', 'value', 'text', $value, $id);
	}
}
?>

<?php

/**
 * @version		$Id: config.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
class WFInlinepopupsPluginConfig {
	public static function getStyles(){	
		$wf = WFEditor::getInstance(); 
		// only required if we're packing css
		if ($wf->getParam('editor.compress_css', 0)) {
			jimport('joomla.filesystem.folder');
			// get UI Theme
			$theme  = $wf->getParam('editor.dialog_theme', 'jce');
			$ui 	= JFolder::files(WF_EDITOR_LIBRARIES . '/css/jquery/' . $theme, '\.css$');

			$file 	= count($ui) ? basename($ui[0]) : '';
	                    
	 		// add ui theme css file
			return array(
				WF_EDITOR_LIBRARIES . '/jquery/css/jquery-ui.custom.css',
				dirname(dirname(__FILE__)) . '/css/dialog.css'
			);
		}
	}
}
?>
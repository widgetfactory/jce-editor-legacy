<?php
/**
* @version		$Id: config.php 192 2011-05-04 12:20:52Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
class WFPastePluginConfig 
{
	public static function getConfig(&$settings)
	{
		$wf = WFEditor::getInstance();
		
		$settings['paste_dialog_width']				= $wf->getParam('paste.dialog_width', 450, 450);
		$settings['paste_dialog_height']			= $wf->getParam('paste.dialog_height', 400, 400);
		$settings['paste_use_dialog']				= $wf->getParam('paste.use_dialog', 0, 0);
		$settings['paste_force_cleanup']			= $wf->getParam('paste.force_cleanup', 0, 0);
		$settings['paste_strip_class_attributes']	= $wf->getParam('paste.strip_class_attributes', 'all', 'all');
		$settings['paste_remove_styles']			= $wf->getParam('paste.remove_styles', 0, 0);
		$settings['paste_retain_style_properties']	= $wf->getParam('paste.retain_style_properties', '', '');
		$settings['paste_remove_spans']				= $wf->getParam('paste.remove_spans', 0, 0);
		$settings['paste_remove_attributes']		= $wf->getParam('paste.remove_attributes', '', '');
		$settings['paste_remove_styles_if_webkit']	= $wf->getParam('paste.remove_styles_if_webkit', 0, 0);
		$settings['paste_remove_empty_paragraphs']	= $wf->getParam('paste.remove_empty_paragraphs', 1, 1);
		$settings['paste_text']						= $wf->getParam('paste.text', 1, 1);
		$settings['paste_html']						= $wf->getParam('paste.html', 1, 1);
	}
}
?>
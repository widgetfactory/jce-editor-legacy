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
class WFCleanupPluginConfig
{
	public function getConfig(&$settings)
	{
		$wf 	= WFEditor::getInstance();
		$model 	= JModel::getInstance('editor', 'WFModel');

		if(!in_array('cleanup', $settings['plugins'])) {
			$settings['plugins'][] = 'cleanup';
		}

		$settings['cleanup_pluginmode'] = $wf->getParam('cleanup.pluginmode', 0, 0);

		$settings['verify_html'] 		= $wf->getParam('editor.verify_html', 0, 1);
		$settings['event_elements'] 	= $wf->getParam('editor.event_elements', 'a,img', 'a,img');

		// Tables & Lists
		$settings['table_inline_editing'] 				= 1;
		$settings['fix_list_elements'] 					= 1;
		$settings['fix_table_elements'] 				= 1;

		if ($wf->getParam('editor.allow_applet', 0, 0)) {
			$model->removeKeys($settings['invalid_elements'], 'applet');
		}
	}
}
?>
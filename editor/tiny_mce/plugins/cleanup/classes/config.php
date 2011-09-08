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

		$settings['cleanup_pluginmode'] 	= $wf->getParam('cleanup.pluginmode', 0, 0, 'boolean');
		
		/** TODO Re-visit in 2.1
		
		// get validate schema
		$schema = $wf->getParam('editor.verify_html', 'html4');
		
		// backwards compatability
		if ($schema == 1) {
			$schema = 'html4';
		}
		
		if ($schema == 'xml') {
			$settings['verify_html'] 	= false;
		} else {
			$settings['schema'] 		= $schema;
		} **/
		
		$settings['verify_html'] = $wf->getParam('editor.verify_html', 0, 1, 'boolean');

		// Tables & Lists
		$settings['table_inline_editing'] 				= true;
		$settings['fix_list_elements'] 					= true;

		if ($wf->getParam('editor.allow_applet', 0, 0)) {
			$model->removeKeys($settings['invalid_elements'], 'applet');
		}
	}
}
?>
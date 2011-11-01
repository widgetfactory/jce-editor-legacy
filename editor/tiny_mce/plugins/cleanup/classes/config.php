<?php
/**
 * @package     JCE
 * @copyright   Copyright (C) 2005 - 2011 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license     GNU/GPL 2 or later
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
class WFCleanupPluginConfig
{
	private static $invalid_elements = array('iframe','object','param','embed','audio','video','source','script','style','applet','body','bgsound','base','basefont','frame','frameset','head','html','id','ilayer','layer','link','meta','name','title','xml');

	public function getConfig(&$settings)
	{
		$wf 	= WFEditor::getInstance();
		$model 	= JModel::getInstance('editor', 'WFModel');

		$settings['cleanup_pluginmode'] = $wf->getParam('cleanup.pluginmode', 0, 0, 'boolean');
		
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
		$settings['table_inline_editing'] 	= true;
		$settings['fix_list_elements'] 		= true;
		
		// Get Extended elements
		$settings['extended_valid_elements'] = $wf->getParam('editor.extended_elements', '', '');
		// Configuration list of invalid elements as array
		$settings['invalid_elements']        = explode(',', $wf->getParam('editor.invalid_elements', '', ''));
			
		// Add elements to invalid list (removed by plugin)
		$model->addKeys($settings['invalid_elements'], self::$invalid_elements);
		
		// remove extended_valid_elements
		if ($settings['extended_valid_elements']) {
			preg_match_all('#(\w+)(\[([^\]]+)\])?#', $settings['extended_valid_elements'], $extended);
				
			if ($extended && count($extended) > 1) {
				$settings['invalid_elements'] = array_diff($settings['invalid_elements'], $extended[1]);
			}
		}
		
		// remove it if it is the same as the default
		if ($settings['invalid_elements'] === self::$invalid_elements) {
			$settings['invalid_elements'] = array();
		}
		
		$settings['invalid_attributes'] = $wf->getParam('editor.invalid_attributes', 'dynsrc,lowsrc', 'dynsrc,lowsrc', 'string', true);
	}
}
?>
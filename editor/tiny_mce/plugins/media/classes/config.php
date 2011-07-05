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
class WFMediaPluginConfig
{
	public function getConfig(&$settings)
	{
		$wf 	= WFEditor::getInstance();
		$model 	= JModel::getInstance('editor', 'WFModel');
		
		if ($wf->getParam('media.iframes', 0)) {
			$model->removeKeys($settings['invalid_elements'], array('iframe'));
		}
		
		if ($wf->getParam('media.audio', 1)) {
			$model->removeKeys($settings['invalid_elements'], array('audio', 'source'));
		}
		
		if ($wf->getParam('media.video', 1)) {
			$model->removeKeys($settings['invalid_elements'], array('video', 'source'));
		}
		
		if ($wf->getParam('media.embed', 1)) {
			$model->removeKeys($settings['invalid_elements'], array('embed'));
		}
		
		if ($wf->getParam('media.object', 1)) {
			$model->removeKeys($settings['invalid_elements'], array('object', 'param'));
		}

		$settings['media_strict'] = $wf->getParam('media.strict', 1, 1);
		
		$settings['media_version_flash'] 		= $wf->getParam('media.version_flash', '10.1.53.64', '10,1,53,64');
		$settings['media_version_windowsmedia'] = $wf->getParam('media.version_windowsmedia', '10,00,00,3646', '10,00,00,3646');
		$settings['media_version_shockwave'] 	= $wf->getParam('media.version_shockwave', '10,2,0,023', '10,2,0,023');
		$settings['media_version_quicktime'] 	= $wf->getParam('media.version_quicktime', '7,3,0,0', '7,3,0,0');
		$settings['media_version_java'] 		= $wf->getParam('media.version_java', '1,5,0,0', '1,5,0,0');
	}
}
?>
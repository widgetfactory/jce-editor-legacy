<?php
/**
 * @version		$Id: config.php 226 2011-06-13 09:59:05Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
class WFImgmanagerPluginConfig
{
	public static function getConfig(&$settings)
	{
		$wf = WFEditor::getInstance();

		$settings['imgmanager_dragdrop_upload'] = $wf->getParam('imgmanager.dragdrop_upload', 1, 0, 'boolean');
	}
}
?>
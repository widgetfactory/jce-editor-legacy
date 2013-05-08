<?php

/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
class WFEmotionsPluginConfig
{
	public static function getConfig(&$settings)
	{
		// Get JContentEditor instance
		$wf 	= WFEditor::getInstance();

		$smilies = 'smiley-confused.gif,smiley-cool.gif,smiley-cry.gif,smiley-eek.gif,smiley-embarassed.gif,smiley-evil.gif,smiley-laughing.gif,smiley-mad.gif,smiley-neutral.gif,smiley-roll.gif,smiley-sad.gif,smiley-surprised.gif,smiley-tongue_out.gif,smiley-wink.gif,smiley-yell.gif,smiley-smile.gif';

		$settings['emotions_smilies'] 	= $wf->getParam('emotions.smilies');
		$settings['emotions_url'] 		= $wf->getParam('emotions.url');
	}
}
?>
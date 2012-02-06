<?php
/**
* @version		$Id: config.php 257 2011-06-30 11:37:36Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
class WFArticlePluginConfig {
	public static function getConfig( &$settings ){
		$wf = WFEditor::getInstance();
		
		$settings['article_hide_xtd_btns'] 	= $wf->getParam('article.hide_xtd_btns', 0, 0);
		$settings['article_show_readmore'] 	= $wf->getParam('article.show_readmore', 1, 1);
		$settings['article_show_pagebreak'] = $wf->getParam('article.show_pagebreak', 1, 1);
	}
}
?>
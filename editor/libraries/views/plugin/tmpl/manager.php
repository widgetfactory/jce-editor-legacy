<?php
/**
* @version		$Id: manager.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined( 'WF_EDITOR' ) or die( 'Restricted access' );

$tabs = WFTabs::getInstance();

if ($this->browser->get('position') == 'top') {
	$this->browser->render();
}
// render tabs and panels
$tabs->render();

if ($this->browser->get('position') == 'bottom') {
	$this->browser->render();
}

?>	

<div class="actionPanel">
	<button class="button" id="refresh"><?php echo WFText::_('WF_LABEL_REFRESH')?></button>
	<button class="button confirm" id="insert"><?php echo WFText::_('WF_LABEL_INSERT')?></button>
	<button class="button cancel" id="cancel"><?php echo WFText::_('WF_LABEL_CANCEL')?></button>
</div>
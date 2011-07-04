<?php
/**
* @version		$Id: default.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
* @package      JCE
* @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
* @author		Ryan Demmer
* @license      GNU/GPL
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined('WF_EDITOR') or die( 'Restricted access' );

$tabs = WFTabs::getInstance();

?>
<form action="#">
	<!-- Render Tabs -->
	<?php $tabs->render();?>
	<!-- Token -->	
	<input type="hidden" id="token" name="<?php echo WFToken::getToken();?>" value="1" />
</form>
<div class="actionPanel">
	<button class="button" id="insert"><?php echo WFText::_('WF_LABEL_INSERT')?></button>
	<button class="button" id="help"><?php echo WFText::_('WF_LABEL_HELP')?></button>
	<button class="button" id="cancel"><?php echo WFText::_('WF_LABEL_CANCEL')?></button>
</div>
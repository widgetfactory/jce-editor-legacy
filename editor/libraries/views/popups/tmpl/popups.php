<?php
/**
 * @version		$Id: popups.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined( '_JEXEC' ) or die( 'Restricted access' );

$popups = WFPopupsExtension::getInstance();
?>
<h4><label for="popup_list" class="hastip" title="<?php echo WFText::_('WF_POPUP_TYPE_DESC');?>"><?php echo WFText::_('WF_POPUP_TYPE');?></label><?php echo $popups->getPopupList();?></h4>
<table style="display:<?php echo ($popups->get('text') === false) ? 'none' : ''?>;">
	<tr>
		<td><label for="popup_text" class="hastip"
			title="<?php echo WFText::_('WF_POPUP_TEXT_DESC');?>"><?php echo WFText::_('WF_POPUP_TEXT');?></label></td>
		<td><input id="popup_text" type="text" value="" /></td>
	</tr>
</table>
<?php echo $popups->getPopupTemplates();?>
<?php
/**
 * @package   	JCE
 * @copyright 	Copyright © 2009-2011 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

defined( '_JEXEC' ) or die('RESTRICTED');
?>
<form onsubmit="AnchorDialog.update();return false;" action="#">
	<table border="0" cellpadding="4" cellspacing="0">
		<tr>
			<td nowrap="nowrap"><?php echo WFText::_('WF_LABEL_NAME');?>:</td>
			<td><input type="text" class="mceFocus" id="anchorName" value="" style="width: 200px" /></td>
		</tr>
		<tr>
			<td nowrap="nowrap"><?php echo WFText::_('WF_LABEL_ID');?>:</td>
			<td><input type="text" class="mceFocus" id="anchorID" value="" style="width: 200px" /></td>
		</tr>
	</table>

	<div class="mceActionPanel">
		<div style="float: right">
			<button type="submit" id="insert">{#update}</button>
			<button type="button" id="cancel" onclick="tinyMCEPopup.close();">{#cancel}</button>
		</div>
	</div>
</form>

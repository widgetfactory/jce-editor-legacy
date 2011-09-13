<?php
/**
 * @version   $Id: anchor.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package     JCE
 * @copyright 	Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @copyright 	Copyright (C) 2010 Moxiecode Systems AB. All rights reserved.
 * @author		Ryan Demmer
 * @author		Moxiecode
 * @license 	http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU Lesser General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU Lesser General Public License or
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

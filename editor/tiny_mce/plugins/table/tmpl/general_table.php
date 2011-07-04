<?php
/**
 * @version    $Id: general_table.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package      JCE
 * @copyright    Copyright (C) 2005 - 2009 Ryan Demmer. All rights reserved.
 * @author   Ryan Demmer
 * @license      GNU/GPL
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
defined('_JEXEC') or die('ERROR_403');
?>
<h4>{#table_dlg.general_props}</h4>
<table border="0" cellpadding="4" cellspacing="0" width="100%">
	<tr>
		<td><label id="colslabel" for="cols">{#table_dlg.cols}</label></td>
		<td><input id="cols" name="cols" type="text" value="" size="3"
			maxlength="3" class="required number min1 mceFocus" /></td>
		<td><label id="rowslabel" for="rows">{#table_dlg.rows}</label></td>
		<td><input id="rows" name="rows" type="text" value="" size="3"
			maxlength="3" class="required number min1" /></td>
	</tr>
	<tr>
		<td><label id="cellpaddinglabel" for="cellpadding">{#table_dlg.cellpadding}</label></td>
		<td><input id="cellpadding" name="cellpadding" type="text" value=""
			size="3" maxlength="3" class="number" /></td>
		<td><label id="cellspacinglabel" for="cellspacing">{#table_dlg.cellspacing}</label></td>
		<td><input id="cellspacing" name="cellspacing" type="text" value=""
			size="3" maxlength="3" class="number" /></td>
	</tr>
	<tr>
		<td><label id="alignlabel" for="align">{#table_dlg.align}</label></td>
		<td><select id="align" name="align">
			<option value="">{#not_set}</option>
			<option value="center">{#table_dlg.align_middle}</option>
			<option value="left">{#table_dlg.align_left}</option>
			<option value="right">{#table_dlg.align_right}</option>
		</select></td>
		<td><label id="borderlabel" for="border">{#table_dlg.border}</label></td>
		<td><input id="border" name="border" type="text" value="" size="3"
			maxlength="3" onchange="TableDialog.changedBorder();" class="number" /></td>
	</tr>
	<tr id="width_row">
		<td><label id="widthlabel" for="width">{#table_dlg.width}</label></td>
		<td><input name="width" type="text" id="width" value="" size="4"
			maxlength="4" onchange="TableDialog.changedSize();" class="size" /></td>
		<td><label id="heightlabel" for="height">{#table_dlg.height}</label></td>
		<td><input name="height" type="text" id="height" value="" size="4"
			maxlength="4" onchange="TableDialog.changedSize();" class="size" /></td>
	</tr>
	<tr id="styleSelectRow">
		<td><label id="classlabel" for="class">{#class_name}</label></td>
		<td colspan="3"><select id="class" name="class"
			class="mceEditableSelect">
			<option value="" selected="selected">{#not_set}</option>
		</select></td>
	</tr>
	<tr>
		<td class="column1"><label for="caption">{#table_dlg.caption}</label></td>
		<td><input id="caption" name="caption" type="checkbox"
			class="checkbox" value="true" /></td>
	</tr>
</table>

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

defined('_JEXEC') or die('RESTRICTED');
?>
<h4>{#table_dlg.general_props}</h4>
<table border="0" cellpadding="4" cellspacing="0">
	<tr>
		<td><label for="align">
			{#table_dlg.align}</label></td>
		<td>
		<select id="align" class="mceFocus">
			<option value="">{#not_set}</option>
			<option value="center">{#table_dlg.align_middle}</option>
			<option value="left">{#table_dlg.align_left}</option>
			<option value="right">{#table_dlg.align_right}</option>
		</select></td>
		<td><label for="celltype">
			{#table_dlg.cell_type}</label></td>
		<td>
		<select id="celltype" >
			<option value="td">{#table_dlg.td}</option>
			<option value="th">{#table_dlg.th}</option>
		</select></td>
	</tr>
	<tr>
		<td><label for="valign">
			{#table_dlg.valign}</label></td>
		<td>
		<select id="valign" >
			<option value="">{#not_set}</option>
			<option value="top">{#table_dlg.align_top}</option>
			<option value="middle">{#table_dlg.align_middle}</option>
			<option value="bottom">{#table_dlg.align_bottom}</option>
		</select></td>
		<td><label for="scope">
			{#table_dlg.scope}</label></td>
		<td>
		<select id="scope" >
			<option value="">{#not_set}</option>
			<option value="col">{#table.col}</option>
			<option value="row">{#table.row}</option>
			<option value="rowgroup">{#table_dlg.rowgroup}</option>
			<option value="colgroup">{#table_dlg.colgroup}</option>
		</select></td>
	</tr>
	<tr>
		<td><label for="width">
			{#table_dlg.width}</label></td>
		<td>
		<input id="width" type="text" value="" size="4"
		maxlength="4" onchange="TableDialog.changedSize();" />
		</td>
		<td><label for="height">
			{#table_dlg.height}</label></td>
		<td>
		<input id="height" type="text" value="" size="4"
		maxlength="4" onchange="TableDialog.changedSize();" />
		</td>
	</tr>
	<tr id="styleSelectRow">
		<td><label for="class">
			{#class_name}</label></td>
		<td colspan="3">
		<select id="class"
		class="mceEditableSelect">
			<option value="" selected="selected">{#not_set}</option>
		</select></td>
	</tr>
</table>
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

$plugin = WFTablesPlugin::getInstance();
?>
<h4>{#table_dlg.advanced_props}</h4>
<table border="0" cellpadding="0" cellspacing="4">
	<tr>
		<td class="column1"><label for="id">
			{#table_dlg.id}</label></td>
		<td>
		<input id="id" type="text" value="" class="advfield" />
		</td>
	</tr>
	<tr>
		<td class="column1"><label for="summary">
			{#table_dlg.summary}</label></td>
		<td>
		<input id="summary" type="text" value=""
		class="advfield" />
		</td>
	</tr>
	<tr>
		<td><label for="style">
			{#table_dlg.style}</label></td>
		<td>
		<input type="text" id="style" value=""
		class="advfield" onchange="TableDialog.changedStyle();" />
		</td>
	</tr>
	<tr>
		<td class="column1"><label id="langlabel" for="lang">
			{#table_dlg.langcode}</label></td>
		<td>
		<input id="lang" type="text" value="" class="advfield" />
		</td>
	</tr>
	<tr>
		<td class="column1"><label for="backgroundimage">
			{#table_dlg.bgimage}</label></td>
		<td>
		<table border="0" cellpadding="0" cellspacing="0">
			<tr>
				<td>
				<input id="backgroundimage" type="text"
				value="" class="advfield browser"
				onchange="TableDialog.changedBackgroundImage();" />
				</td>
			</tr>
		</table></td>
	</tr>
	<?php if ($plugin->getContext() == 'table') :
	?>
	<tr>
		<td class="column1"><label for="tframe">
			{#table_dlg.frame}</label></td>
		<td>
		<select id="tframe" class="advfield">
			<option value="">{#not_set}</option>
			<option value="void">{#table_dlg.rules_void}</option>
			<option value="above">{#table_dlg.rules_above}</option>
			<option value="below">{#table_dlg.rules_below}</option>
			<option value="hsides">{#table_dlg.rules_hsides}</option>
			<option value="lhs">{#table_dlg.rules_lhs}</option>
			<option value="rhs">{#table_dlg.rules_rhs}</option>
			<option value="vsides">{#table_dlg.rules_vsides}</option>
			<option value="box">{#table_dlg.rules_box}</option>
			<option value="border">{#table_dlg.rules_border}</option>
		</select></td>
	</tr>
	<tr>
		<td class="column1"><label for="rules">
			{#table_dlg.rules}</label></td>
		<td>
		<select id="rules" class="advfield">
			<option value="">{#not_set}</option>
			<option value="none">{#table_dlg.frame_none}</option>
			<option value="groups">{#table_dlg.frame_groups}</option>
			<option value="rows">{#table_dlg.frame_rows}</option>
			<option value="cols">{#table_dlg.frame_cols}</option>
			<option value="all">{#table_dlg.frame_all}</option>
		</select></td>
	</tr>
	<?php endif;?>
	<tr>
		<td class="column1"><label for="dir">
			{#table_dlg.langdir}</label></td>
		<td>
		<select id="dir" class="advfield">
			<option value="">{#not_set}</option>
			<option value="ltr">{#table_dlg.ltr}</option>
			<option value="rtl">{#table_dlg.rtl}</option>
		</select></td>
	</tr>
	<tr>
		<td class="column1"><label for="bordercolor">
			{#table_dlg.bordercolor}</label></td>
		<td>
		<table border="0" cellpadding="0" cellspacing="0">
			<tr>
				<td>
				<input id="bordercolor" type="text" value=""
				size="9" class="color" onchange="TableDialog.changedColor();"/>
				</td>
			</tr>
		</table></td>
	</tr>
	<tr>
		<td class="column1"><label for="bgcolor">
			{#table_dlg.bgcolor}</label></td>
		<td>
		<table border="0" cellpadding="0" cellspacing="0">
			<tr>
				<td>
				<input id="bgcolor" type="text" value="" size="9"
				class="color" onchange="TableDialog.changedColor();" />
				</td>
			</tr>
		</table></td>
	</tr>
</table>

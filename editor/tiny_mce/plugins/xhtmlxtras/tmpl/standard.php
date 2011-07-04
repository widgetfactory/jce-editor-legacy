<?php
/**
 * @version    $Id: standard.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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

$plugin = WFXHTMLXtrasPlugin::getInstance();

$element = $plugin->getElementName();

if ($element == 'del' || $element == 'ins') :
	echo $this->loadTemplate('datetime');
endif; 
?>
<h4>{#xhtmlxtras_dlg.fieldset_attrib_tab}</h4>
<table>
	<tr>
		<td class="label"><label for="title">{#xhtmlxtras_dlg.attribute_label_title}</label></td>
		<td><input id="title" type="text" value=""
			class="field mceFocus" /></td>
	</tr>
	<tr>
		<td class="label"><label for="id">{#xhtmlxtras_dlg.attribute_label_id}</label></td>
		<td><input id="id" type="text" value="" class="field" /></td>
	</tr>
	<tr>
		<td class="label"><label for="class">{#xhtmlxtras_dlg.attribute_label_class}</label></td>
		<td><select id="class" class="field mceEditableSelect">
			<option value="">{#not_set}</option>
		</select></td>
	</tr>
	<tr>
		<td class="label"><label for="class">{#xhtmlxtras_dlg.attribute_label_style}</label></td>
		<td><input id="style" type="text" value="" class="field" /></td>
	</tr>
	<tr>
		<td class="label"><label for="dir">{#xhtmlxtras_dlg.attribute_label_langdir}</label></td>
		<td><select id="dir" class="field">
			<option value="">{#not_set}</option>
			<option value="ltr">{#xhtmlxtras_dlg.attribute_option_ltr}</option>
			<option value="rtl">{#xhtmlxtras_dlg.attribute_option_rtl}</option>
		</select></td>
	</tr>
	<tr>
		<td class="label"><label for="lang">{#xhtmlxtras_dlg.attribute_label_langcode}</label></td>
		<td><input id="lang" type="text" value="" class="field" />
		</td>
	</tr>
</table>
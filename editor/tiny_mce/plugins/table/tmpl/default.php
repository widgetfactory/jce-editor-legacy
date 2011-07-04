<?php
/**
 * @package     JCE Fullpage
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
$plugin = WFTablesPlugin::getInstance();
$tabs	= WFTabs::getInstance();
?>
<form onsubmit="return false;">
	<?php echo $tabs->render(); ?>
	<div class="mceActionPanel">
	<?php if ($plugin->getContext() == 'cell') : ?>
	<div>
		<select id="action" name="action">
			<option value="cell">{#table_dlg.cell_cell}</option>
			<option value="row">{#table_dlg.cell_row}</option>
			<option value="all">{#table_dlg.cell_all}</option>
		</select>
	</div>
	<?php endif;
	if ($plugin->getContext() == 'row') : ?>
	<div>
		<select id="action" name="action">
			<option value="row">{#table_dlg.row_row}</option>
			<option value="odd">{#table_dlg.row_odd}</option>
			<option value="even">{#table_dlg.row_even}</option>
			<option value="all">{#table_dlg.row_all}</option>
		</select>
	</div>
	<?php endif; ?>
	<button type="submit" id="insert" onclick="TableDialog.insert();">{#insert}</button>
	<button type="button" id="cancel">{#cancel}</button>
	</div>
</form>

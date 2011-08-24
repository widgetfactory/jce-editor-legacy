<?php
/**
 * @version    $Id: merge.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
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
<fieldset>
	<legend>
		{#table_dlg.merge_cells_title}
	</legend>
	<table border="0" cellpadding="0" cellspacing="3" width="100%">
		<tr>
			<td>{#table_dlg.cols}:</td>
			<td align="right">
			<input type="text" id="numcols" value="" class="number min1 mceFocus" style="width: 30px" />
			</td>
		</tr>
		<tr>
			<td>{#table_dlg.rows}:</td>
			<td align="right">
			<input type="text" id="numrows" value="" class="number min1" style="width: 30px" />
			</td>
		</tr>
	</table>
</fieldset>
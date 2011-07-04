<?php
/**
 * $Id: pagebreak.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package     JCE SearchReplace
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
defined( 'WF_EDITOR' ) or die('RESTRICTED');

?>
<table border="0" cellspacing="0" cellpadding="2">
	<tr>
		<td><label for="title">{#pagebreak_dlg.title}:</label></td>
		<td><input type="text" id="title" style="width: 200px" value="" /></td>
	</tr>
	<tr>	
		<td><label for="alt">{#pagebreak_dlg.alias}:</label></td>
		<td><input type="text" id="alt" style="width: 200px" value="" /></td>
	<tr>
	</tr>
</table>
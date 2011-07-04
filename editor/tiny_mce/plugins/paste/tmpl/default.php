<?php
/**
 * @package     $Id: default.php 192 2011-05-04 12:20:52Z happy_noodle_boy $
 * @copyright 	Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @author		Ryan Demmer
 * @license 	http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU Lesser General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU Lesser General Public License or
 * other free or open source software licenses.
 */
defined( 'WF_EDITOR' ) or die('ERROR_403');
?>
<form onsubmit="return PasteDialog.insert();" action="#">
	<div id="title" class="title">{#paste_dlg.title}</div>		
	<div id="container"></div>
	
	<div class="mceActionPanel">
	<button type="submit" id="insert" name="insert">{#insert}</button>
	<button type="button" id="cancel" name="cancel" onclick="tinyMCEPopup.close();">{#cancel}</button>
	</div>
</form>
<?php
/**
 * @version   $Id: charmap.php 221 2011-06-11 17:30:33Z happy_noodle_boy $
 * @package     JCE
 * @copyright   Copyright (C) 2005 - 2010 Ryan Demmer. All rights reserved.
 * @copyright   Copyright (C) 2010 Moxiecode Systems AB. All rights reserved.
 * @author    Ryan Demmer
 * @author    Moxiecode
 * @license   http://www.gnu.org/copyleft/lgpl.html GNU/LGPL, see licence.txt
 * JCE is free software. This version may have been modified pursuant
 * to the GNU Lesser General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU Lesser General Public License or
 * other free or open source software licenses.
 */
defined( '_JEXEC' ) or die('RESTICTED');
?>
<div id="charmap" role="presentation">
	<h3>{#advanced_dlg.charmap_title}</h3>
	<div id="charmapView"><!-- Chars will be rendered here --></div>
	<div id="charmapDescription">
		<div id="codeV"></div>
		<div id="codeN"></div>
		<div class="box">
			<div class="title">HTML-Code</div>
			<div id="codeA"></div>
		</div>
		<div class="box">
			<div class="title">NUM-Code</div>
			<div id="codeB"></div>
		</div>
	</div>
</div>
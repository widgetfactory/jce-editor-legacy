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

defined( 'WF_EDITOR' ) or die('RESTRICTED');

$tabs = WFTabs::getInstance();
?>
<?php echo $tabs->render(); ?>
<div class="mceActionPanel">
	<button type="submit" id="next" name="insert">{#searchreplace_dlg.findnext}</button>
	<button type="button" class="button" id="replaceBtn" name="replaceBtn">{#searchreplace_dlg.replace}</button>
	<button type="button" class="button" id="replaceAllBtn" name="replaceAllBtn">{#searchreplace_dlg.replaceall}</button>
	<button type="button" id="cancel" name="cancel" onclick="tinyMCEPopup.close();">{#cancel}</button>
</div>